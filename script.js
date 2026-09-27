const themeKey = "medidocs-theme";
const toggle = document.querySelector(".theme-toggle");
const system = window.matchMedia("(prefers-color-scheme: dark)");
let preference;
try { preference = localStorage.getItem(themeKey); } catch { /* Keep system preference. */ }
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  toggle.textContent = dark ? "Svetlý režim" : "Tmavý režim";
  toggle.setAttribute("aria-label", dark ? "Zapnúť svetlý režim" : "Zapnúť tmavý režim");
  toggle.setAttribute("aria-pressed", String(dark));
}
function currentTheme() { return preference === "light" || preference === "dark" ? preference : system.matches ? "dark" : "light"; }
applyTheme(currentTheme());
toggle.addEventListener("click", () => {
  preference = currentTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem(themeKey, preference); } catch { /* Keep this session's choice. */ }
  applyTheme(preference);
});
system.addEventListener("change", () => applyTheme(currentTheme()));
window.addEventListener("storage", (event) => {
  if (event.key === themeKey || event.key === null) { preference = event.newValue; applyTheme(currentTheme()); }
});
document.querySelector("#year").textContent = new Date().getFullYear();
