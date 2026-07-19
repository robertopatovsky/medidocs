# MediDocs landing page

Minimal public landing page for [medidocs.sk](https://medidocs.sk).

## Run locally

```bash
docker build -t medidocs-landing .
docker run --rm -p 8080:80 medidocs-landing
```

Open `http://localhost:8080`. The container health endpoint is `/health`.
