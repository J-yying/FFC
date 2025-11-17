const STORAGE_KEY = 'ffc:goal';

function safeStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

export function createWebDataSteward({ coordinator }) {
  const storage = safeStorage();

  function persistGoal(goal) {
    if (!storage) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(goal));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('无法写入本地存储', error);
    }
  }

  async function saveGoal(payload) {
    const uuidSupported = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
    const record = {
      ...payload,
      id: uuidSupported ? crypto.randomUUID() : String(Date.now()),
      savedAt: new Date().toISOString()
    };
    persistGoal(record);
    coordinator.emit('goal:saved:local', record);
    await new Promise((resolve) => setTimeout(resolve, 300));
    // 模拟成功回写
    return record;
  }

  return {
    saveGoal
  };
}
