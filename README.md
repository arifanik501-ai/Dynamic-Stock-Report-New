# MEP FAN LTD — SFG Stock Ledger (standalone)

Standalone copy of the ERP's SFG Stock module (`sfg_module/`), ready for GitHub Pages.
It needs no ERP server or login: open `index.html` and it works. Data (archives,
target, reports) comes from the same Firebase project as the ERP version.

## Upload to GitHub
1. Create a repository (or open an existing one) on github.com.
2. **Add file → Upload files**, drag in *everything inside this folder*
   (including the `assets` folder and the hidden `.nojekyll` file), then **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. After a minute the site is live at `https://<your-user>.github.io/<repo>/`.

## Files
| File | Purpose |
|---|---|
| `index.html` | The ledger app |
| `app.css` | Module styles |
| `erp-topbar.css` | Top bar + tweaks (hidden tabs/buttons, TARGET colour, standalone rules) |
| `premium_clock.css` / `premium_clock.js` | Live clock in the top bar |
| `themes.js` | Colour palettes |
| `manifest.json`, `sw.js`, `icon-*.png` | Installable app / offline cache |
| `assets/avatar-male.svg` | Fallback avatar |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Differences from the ERP version: no login redirect, and the ERP-only controls
(Modules/Select Module links, user badge, Sign Out) are hidden.
