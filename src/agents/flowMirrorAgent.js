const STORAGE_KEY = 'ffc:journey';

function safeSession() {
  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
}

export function bootstrapFlowMirrorAgent({ coordinator }) {
  const storage = safeSession();

  function write(payload) {
    if (!storage) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      // noop
    }
  }

  coordinator.subscribe('stage:change', ({ stage }) => {
    write({ stage, ts: Date.now() });
  });

  coordinator.subscribe('goal:set', (goal) => {
    write({ stage: 'projection', goal, ts: Date.now() });
  });
}
