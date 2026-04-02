# AR shoe try-on (embed)

Single-page DeepAR shoe try-on meant for embedding (for example in an iframe).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:9000`. Use **HTTPS** in production so the camera works in the browser.

## Embed

```html
<iframe
  src="https://your-domain/path-to-build/"
  allow="camera"
  title="AR shoe try-on"
  style="width:100%;max-width:420px;height:720px;border:0;border-radius:16px;"
></iframe>
```

## Effects

Add DeepAR effect files under `public/effects/` so paths match the `PRODUCTS` list in `src/index.js` (see `public/effects/README.txt`).

```bash
npm run build
```

Serve the `dist/` folder (or your host’s equivalent). The build copies `public/` into `dist/` and bundles `main.js`.
