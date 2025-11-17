const DEFAULT_STAGE = 'welcome';

function createEmitter() {
  const subscribers = new Map();

  function on(event, handler) {
    const bucket = subscribers.get(event) || new Set();
    bucket.add(handler);
    subscribers.set(event, bucket);
    return () => bucket.delete(handler);
  }

  function emit(event, payload) {
    const bucket = subscribers.get(event);
    if (!bucket) {
      return;
    }
    bucket.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[Atlas] handler for ${event} failed`, error);
      }
    });
  }

  return { on, emit };
}

export function createAtlasCoordinator(initialStage = DEFAULT_STAGE) {
  const bus = createEmitter();
  const state = {
    stage: initialStage,
    goal: null,
    platform: 'pc',
    timeline: []
  };

  function snapshot() {
    return { ...state };
  }

  function record(event, payload) {
    state.timeline.push({ event, payload, at: new Date().toISOString() });
    bus.emit(event, payload);
  }

  function updateStage(nextStage, meta = {}) {
    if (state.stage === nextStage) {
      return;
    }
    state.stage = nextStage;
    record('stage:change', { stage: nextStage, meta });
  }

  function setGoal(goal) {
    state.goal = goal;
    record('goal:set', goal);
  }

  function emit(event, payload) {
    record(event, payload);
  }

  function subscribe(event, handler) {
    return bus.on(event, handler);
  }

  function reset() {
    state.stage = DEFAULT_STAGE;
    state.goal = null;
    record('journey:reset');
    record('stage:change', { stage: DEFAULT_STAGE });
  }

  return {
    getState: snapshot,
    updateStage,
    setGoal,
    emit,
    subscribe,
    reset
  };
}
