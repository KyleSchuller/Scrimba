const setTheme = (theme) => {
  // Set the theme as a data attribute on the root element
  document.documentElement.setAttribute("data-theme", theme);

  // Update the aria-pressed attribute on all buttons
  themeButtons.forEach((btn) => {
    btn.disabled = btn.getAttribute("data-set-theme") === theme;
  });

  // Remember the current theme
  currentTheme = theme;

  // Store the current theme in localStorage
  localStorage.setItem("theme", theme);
};

export default themeSwitcher = () => {
  const themeButtons = document.querySelectorAll("[data-set-theme]");

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const currentTheme = localStorage.getItem("theme") || systemTheme;

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(btn.getAttribute("data-set-theme"));
    });
  });

  // Set the initial theme
  setTheme(currentTheme);
};
