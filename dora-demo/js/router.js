export function setRoute(route) {
  window.location.hash = route;
}

export function getRoute() {
  return window.location.hash.replace("#", "") || "executive";
}

export function activateRoute(route) {
  document.querySelectorAll("[data-view]").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.view === route);
  });

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === route);
  });
}
