[![cron-job](https://github.com/karlerikjonatan/boka-forarprov/actions/workflows/cron-job.yaml/badge.svg)](https://github.com/karlerikjonatan/boka-forarprov/actions/workflows/cron-job.yaml) [![Netlify Status](https://api.netlify.com/api/v1/badges/6cd4c2a9-aefd-41d2-b98b-569c71c0ce70/deploy-status)](https://app.netlify.com/sites/admiring-hoover-2e4446/deploys)
# boka-forarprov
Receive a text message when a driving test occasion is available at Trafikverket.
```mermaid
graph LR
    A[GitHub Action] -->|cron-job| B[Netlify] -->|/search-occasions| C[Trafikverket]
    C --> D{Test occasion available?}
    D -->|YES| E[Twilio] --> F[Send text message]
    D -->|NO| G[exit 0]
```
