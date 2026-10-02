# Production deployment

GitHub Actions publishes a private commit-specific GHCR image and triggers the existing
Coolify Docker Image application. Runtime secrets remain in Coolify. Set repository
variable `PRODUCTION_DEPLOY_ENABLED=true` only after image-pull authentication and the
Docker Image migration are complete. The deployment helper refuses source-build apps.

Canonical architecture and release/rollback configuration:
https://github.com/robertopatovsky/MediDocs-api/blob/main/docs/architecture/ARCHITECTURE.md#production-image-delivery

Keep the deployment helper identical in the API, web and landing repositories.
