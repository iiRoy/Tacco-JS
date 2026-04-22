const InputRouter = {};

InputRouter.actionRegistry = new Map();

InputRouter.registerKey = (sym, response) => {
  const codeIdentifier = String(sym).toUpperCase().charCodeAt(0);
  if (!isNaN(codeIdentifier)) {
    InputRouter.actionRegistry.set(codeIdentifier, response);
  }
};

InputRouter.registerKeys = (mappings) => {
  Object.entries(mappings).forEach(([char, action]) => {
    InputRouter.registerKey(char, action);
  });
};

const initializeHtmlShortcuts = () => {
  document.querySelectorAll('[data-shortcut]').forEach(element => {
    const shortcutChar = element.getAttribute('data-shortcut');
    const targetLink = element.getAttribute('href');
    if (shortcutChar && targetLink) {
      InputRouter.registerKey(shortcutChar, targetLink);
    }
  });
};

const processKeyPress = (eventSignal) => {
  const currentFocus = eventSignal.target;

  if (currentFocus.matches('input, textarea, select')) {
    return;
  }

  if (eventSignal.shiftKey || eventSignal.ctrlKey || eventSignal.altKey || eventSignal.metaKey) {
    return;
  }

  const triggeredCode = eventSignal.keyCode;
  const assignedAction = InputRouter.actionRegistry.get(triggeredCode);

  if (assignedAction) {
    eventSignal.preventDefault();

    if (typeof assignedAction === 'function') {
      assignedAction.call(document);
    } else {
      window.location.href = assignedAction;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initializeHtmlShortcuts();
  document.addEventListener('keydown', processKeyPress);
});

window.KeyCommander = {
    configure: InputRouter.registerKey,
    configureMultiple: InputRouter.registerKeys
};