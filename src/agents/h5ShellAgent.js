function isMobileViewport() {
  return window.matchMedia('(max-width: 720px)').matches;
}

export function bootstrapH5ShellAgent({ coordinator, shell }) {
  if (!shell) {
    return () => {};
  }

  function update() {
    const mobile = isMobileViewport();
    shell.classList.toggle('is-mobile', mobile);
    coordinator.emit('shell:resized', { isMobile: mobile });
  }

  window.addEventListener('resize', update);
  update();
  return () => window.removeEventListener('resize', update);
}
