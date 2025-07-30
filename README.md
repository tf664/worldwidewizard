## Dependencies Overview

**Framework**
svelte, @sveltejs/kit, vite

**Styling:**
 tailwindcss, @tailwindcss/typography, @tailwindcss/vite

**Linter/Formatter:**
 eslint, prettier, eslint-plugin-svelte

**Testing:**
@playwright/test

**Image Processing:**
 sharp

---

## Building
Installed dependencies with `npm install`, start a development server:

To start up the dev server use:
```bash
npm run dev
# or start the server and open the app in a new browser tab
npm run dev -- --open
```

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
