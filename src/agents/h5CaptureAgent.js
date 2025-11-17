function safeStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

export function bootstrapH5CaptureAgent() {
  const storage = safeStorage();
  const forms = document.querySelectorAll('form[data-capture]');
  forms.forEach((form) => {
    const key = `ffc:capture:${form.dataset.capture}`;
    if (storage) {
      const cached = storage.getItem(key);
      if (cached) {
        try {
          const values = JSON.parse(cached);
          Object.entries(values).forEach(([name, value]) => {
            const fields = form.querySelectorAll(`[name=\"${name}\"]`);
            fields.forEach((field) => {
              if (field.type === 'radio') {
                field.checked = field.value === value;
              } else if (field.type === 'checkbox') {
                field.checked = Boolean(value);
              } else if (typeof field.value !== 'undefined') {
                field.value = value;
              }
            });
          });
        } catch (error) {
          storage.removeItem(key);
        }
      }
    }
    form.addEventListener('input', () => {
      if (!storage) {
        return;
      }
      const payload = {};
      Array.from(form.elements).forEach((el) => {
        if (!el.name) {
          return;
        }
        if (el.type === 'radio') {
          if (el.checked) {
            payload[el.name] = el.value;
          }
        } else if (el.type === 'checkbox') {
          payload[el.name] = el.checked;
        } else {
          payload[el.name] = el.value;
        }
      });
      storage.setItem(key, JSON.stringify(payload));
    });
  });
}
