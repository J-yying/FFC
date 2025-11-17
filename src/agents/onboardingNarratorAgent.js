function initHeroShortcuts(coordinator) {
  document.querySelector('[data-action="jump-to-goal"]')?.addEventListener('click', () => {
    coordinator.updateStage('goal');
  });

  document.querySelector('[data-action="jump-to-tour"]')?.addEventListener('click', () => {
    coordinator.updateStage('tour');
  });
}

export function bootstrapOnboardingNarrator({ coordinator }) {
  initHeroShortcuts(coordinator);

  const navButtons = document.querySelectorAll('[data-nav-target]');
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.navTarget;
      if (target) {
        coordinator.updateStage(target);
      }
    });
  });

  const welcomeButtons = document.querySelectorAll('[data-onboarding]');
  welcomeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.onboarding;
      if (value === 'newbie') {
        coordinator.updateStage('concepts');
        coordinator.emit('onboarding:path', { level: 'newbie' });
      } else {
        coordinator.updateStage('tour');
        coordinator.emit('onboarding:path', { level: 'expert' });
      }
    });
  });

  document.querySelector('[data-action="concepts-prev"]')?.addEventListener('click', () => {
    coordinator.updateStage('welcome');
  });

  document.querySelector('[data-action="concepts-next"]')?.addEventListener('click', () => {
    coordinator.updateStage('tour');
  });

  document.querySelector('[data-action="tour-skip"]')?.addEventListener('click', () => {
    coordinator.updateStage('goal');
  });

  document.querySelector('[data-action="tour-complete"]')?.addEventListener('click', () => {
    coordinator.updateStage('goal');
    coordinator.emit('tour:complete', { explored: 5 });
  });
}
