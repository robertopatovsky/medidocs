const themeKey = "medidocs-theme";
const toggle = document.querySelector(".theme-toggle");
const system = window.matchMedia("(prefers-color-scheme: dark)");
let preference;
try { preference = localStorage.getItem(themeKey); } catch { /* Follow the system theme. */ }
function currentTheme() { return preference === "light" || preference === "dark" ? preference : system.matches ? "dark" : "light"; }
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  toggle.querySelector(".theme-label").textContent = dark ? "Svetlý režim" : "Tmavý režim";
  toggle.setAttribute("aria-label", dark ? "Zapnúť svetlý režim" : "Zapnúť tmavý režim");
  toggle.setAttribute("aria-pressed", String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? "#111416" : "#f3f4f0";
  document.querySelectorAll(".app-link").forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set("theme", theme);
    link.href = url.toString();
  });
}
applyTheme(currentTheme());
toggle.addEventListener("click", () => {
  preference = currentTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem(themeKey, preference); } catch { /* Keep this session's choice. */ }
  applyTheme(preference);
});
system.addEventListener("change", () => applyTheme(currentTheme()));
window.addEventListener("storage", event => { if (event.key === themeKey || event.key === null) { preference = event.newValue; applyTheme(currentTheme()); } });
document.querySelector("#year").textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
  document.documentElement.classList.add("js-motion");
}
