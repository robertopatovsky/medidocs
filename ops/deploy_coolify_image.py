"""Deploy a commit-specific GHCR image; Coolify must already use Docker Image."""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def request(path, method="GET", payload=None):
    """Call Coolify without logging secrets or response error bodies."""
    base = os.environ["COOLIFY_BASE_URL"].rstrip("/")
    if not base.startswith("https://"):
        raise RuntimeError("Coolify must use HTTPS")
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        base + "/api/v1" + path,
        data=data,
        method=method,
        headers={
            "Authorization": "Bearer " + os.environ["COOLIFY_API_TOKEN"],
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "MediDocs-Deploy/1.0",
        },
    )
    # Do not echo server error bodies: they may contain deployment configuration.
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Coolify request failed: HTTP {exc.code}") from None


def deploy(uuid, image, tag):
    """Deploy an immutable release and wait for its required running health."""
    if not re.fullmatch(r"[a-z0-9]+", uuid):
        raise ValueError("Invalid application UUID")
    if image not in {
        "ghcr.io/robertopatovsky/medidocs-" + name
        for name in ("web", "api", "worker", "landing")
    }:
        raise ValueError("Unexpected production image")
    if not re.fullmatch(r"sha-[0-9a-f]{40}", tag):
        raise ValueError("A full commit-specific tag is required")
    path = "/applications/" + uuid
    app = request(path)
    if app["build_pack"] != "dockerimage":
        raise RuntimeError(
            "Refusing deployment: application still builds from source"
        )
    previous = f"{app.get('docker_registry_image_name')}:{app.get('docker_registry_image_tag')}"
    request(
        path,
        "PATCH",
        {
            "docker_registry_image_name": image,
            "docker_registry_image_tag": tag,
            "is_auto_deploy_enabled": False,
        },
    )
    app = request(path)
    if (
        app["docker_registry_image_name"],
        app["docker_registry_image_tag"],
    ) != (image, tag):
        raise RuntimeError("Coolify did not save the selected image")
    queued = request(
        "/deploy?" + urllib.parse.urlencode({"uuid": uuid, "force": "false"})
    )
    deployment = next(
        item["deployment_uuid"]
        for item in queued["deployments"]
        if item.get("resource_uuid") == uuid
    )
    print(f"Deploying {image}:{tag}; deployment {deployment}", flush=True)
    print(f"Previous release: {previous}", flush=True)
    deadline = time.monotonic() + 600
    last = None
    health_deadline = None
    while time.monotonic() < deadline:
        state = request("/deployments/" + deployment)["status"]
        if state != last:
            print(f"Deployment status: {state}", flush=True)
            last = state
        if state == "finished":
            app = request(path)
            expected_status = (
                "running:healthy"
                if app["health_check_enabled"]
                else "running:unknown"
            )
            if app["status"] != expected_status:
                if app["health_check_enabled"] and app["status"].startswith(
                    "running:"
                ):
                    if health_deadline is None:
                        health_deadline = min(deadline, time.monotonic() + 120)
                        print(
                            "Waiting for Coolify to report the application's health",
                            flush=True,
                        )
                    if time.monotonic() < health_deadline:
                        time.sleep(10)
                        continue
                raise RuntimeError(
                    f"Deployment finished but application status is {app['status']}"
                )
            if app["docker_registry_image_tag"] != tag:
                raise RuntimeError(
                    "Another release replaced the selected image"
                )
            summary = os.environ.get("GITHUB_STEP_SUMMARY")
            if summary:
                with open(summary, "a") as handle:
                    handle.write(
                        f"\nDeployed `{image}:{tag}` using Coolify `{deployment}`.\n"
                        f"\nPrevious image: `{previous}`.\n"
                    )
            return
        if state in {"failed", "cancelled", "canceled"}:
            raise RuntimeError(
                f"Deployment {state}; previous image: {previous}"
            )
        time.sleep(10)
    raise RuntimeError(f"Deployment did not finish in 10 minutes: {deployment}")


if __name__ == "__main__":
    try:
        if len(sys.argv) != 4:
            raise ValueError(
                "Usage: deploy_coolify_image.py UUID IMAGE sha-COMMIT"
            )
        deploy(*sys.argv[1:])
    except (RuntimeError, ValueError, KeyError, urllib.error.URLError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
