const DEFAULT_PRESETS = {
  processDelay: 500,
  useHTML: false,
  disableSubmission: true,
  customRules: {},
  issueMessages: {
    mismatch: 'Values do not align',
    insufficientLength: 'Content is too short',
    remote: 'Remote validation failed'
  },
  statusIndicators: {
    positive: 'check-mark-indicator',
    negative: 'warning-indicator'
  }
};

const SHARED_RULE_CHECKERS = {
  'intrinsic': (controlElement) => {
    return controlElement.checkValidity ? controlElement.checkValidity() : true;
  },
  'mismatch': (controlElement) => {
    const targetSelector = controlElement.dataset.alignWith;
    if (!targetSelector) return true;
    const targetElement = controlElement.form.querySelector(targetSelector);
    return !controlElement.value || controlElement.value === (targetElement ? targetElement.value : '');
  },
  'insufficientLength': (controlElement) => {
    const minimum = parseInt(controlElement.dataset.minimumLength, 10);
    if (isNaN(minimum)) return true;
    return !controlElement.value || controlElement.value.length >= minimum;
  }
};

const CUSTOM_RULE_EXTENSIONS = {}; // Mimics Validator.VALIDATORS being extended globally

const FORM_GUARDIAN_REGISTRY = new Map();

function createFormGuardian(targetFormElement, initialConfig = {}) {
  const currentOperationalSettings = { ...DEFAULT_PRESETS, ...initialConfig };
  const inputTrackingStates = new Map();

  Object.assign(CUSTOM_RULE_EXTENSIONS, currentOperationalSettings.customRules);
  const effectiveRuleSet = { ...SHARED_RULE_CHECKERS, ...CUSTOM_RULE_EXTENSIONS };

  const retrieveValidationTargets = () => {
    return Array.from(targetFormElement.elements)
      .filter(el =>
        el.matches(':not([type="submit"], button):enabled:not([hidden])') &&
        el.name &&
        window.getComputedStyle(el).display !== 'none' &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
  };

  const broadcastFormEvent = (eventName, detailPayload = {}) => {
    const customEvt = new CustomEvent(eventName, { bubbles: true, cancelable: true, detail: detailPayload });
    targetFormElement.dispatchEvent(customEvt);
    return customEvt;
  };

  const acquireIssueMessage = (ruleKey, element) => {
    return element.dataset[`${ruleKey}Fault`] ||
           element.dataset.anyFault ||
           (ruleKey === 'intrinsic' && element.validationMessage) ||
           currentOperationalSettings.issueMessages[ruleKey];
  };

  const deferExecution = (element, actionCallback) => {
    const boundCallback = actionCallback.bind(null, element);
    if (!currentOperationalSettings.processDelay) {
      return boundCallback();
    }
    clearTimeout(element.dataset.validationDelayId);
    element.dataset.validationDelayId = setTimeout(boundCallback, currentOperationalSettings.processDelay);
  };

  const performElementChecks = async (element) => {
    if (!inputTrackingStates.has(element)) {
      inputTrackingStates.set(element, { failureReasons: [], deferredTimerId: null, originalErrorHTML: undefined, remoteValidationPromise: null });
    }
    const elementState = inputTrackingStates.get(element);
    const previousFailureList = [...elementState.failureReasons];
    let currentFailureList = [];

    const validationInitiatedEvent = broadcastFormEvent('validation-commenced', { involvedElement: element });
    if (validationInitiatedEvent.defaultPrevented) return;

    elementState.remoteValidationPromise = null; // Clear old promise reference

    for (const [ruleKey, ruleFunction] of Object.entries(effectiveRuleSet)) {
      if ((element.dataset[ruleKey] !== undefined || ruleKey === 'intrinsic') && !ruleFunction(element)) {
        const message = acquireIssueMessage(ruleKey, element);
        if (!currentFailureList.includes(message)) {
          currentFailureList.push(message);
        }
      }
    }

    if (!currentFailureList.length && element.value && element.dataset.remoteCheckURL) {
      const remoteCheckPromise = new Promise(async (resolve) => {
        const queryParams = new URLSearchParams();
        queryParams.append(element.name, element.value);
        const url = `${element.dataset.remoteCheckURL}?${queryParams.toString()}`;

        try {
          const response = await fetch(url, { method: 'GET' });
          if (!response.ok) throw new Error('Remote server issue');
          const responseData = await response.json();
          if (responseData.isValid === false) {
            currentFailureList.push(acquireIssueMessage('remote', element) || responseData.message || currentOperationalSettings.issueMessages.remote);
          }
        } catch (error) {
          currentFailureList.push(acquireIssueMessage('remote', element) || error.message || currentOperationalSettings.issueMessages.remote);
        } finally {
          resolve();
        }
      });
      elementState.remoteValidationPromise = remoteCheckPromise;
      await remoteCheckPromise;
    }

    elementState.failureReasons = currentFailureList;

    if (currentFailureList.length) {
      displayFailureFeedback(element);
    } else {
      removeFailureFeedback(element);
    }

    if (currentFailureList.toString() !== previousFailureList.toString()) {
      if (currentFailureList.length) {
        broadcastFormEvent('validation-failed', { involvedElement: element, issues: currentFailureList });
      } else {
        broadcastFormEvent('validation-passed', { involvedElement: element, priorIssues: previousFailureList });
      }
    }

    updateSubmissionControlState();
    broadcastFormEvent('validation-finished', { involvedElement: element });
  };

  const handleInteraction = (eventObject) => {
    let affectedElement = eventObject.target;
    if (!retrieveValidationTargets().includes(affectedElement)) return;
    deferExecution(affectedElement, performElementChecks);
  };

  const handleDependentInputInteraction = (eventObject) => {
    const sourceElement = eventObject.target;
    targetFormElement.querySelectorAll(`[data-align-with="#${sourceElement.id}"]`).forEach(dependentElement => {
      if (dependentElement.value) {
        deferExecution(dependentElement, performElementChecks);
      }
    });
  };

  const displayFailureFeedback = (element) => {
    deferExecution(element, (el) => {
      const parentGroupContainer = el.closest('[data-validation-group]');
      if (!parentGroupContainer) return;

      const errorDisplayBlock = parentGroupContainer.querySelector('[data-validation-feedback]');
      const statusIcon = parentGroupContainer.querySelector('[data-validation-status-icon]');
      const issueList = inputTrackingStates.get(el).failureReasons;

      if (!issueList.length) return;

      if (inputTrackingStates.get(el).originalErrorHTML === undefined && errorDisplayBlock) {
        inputTrackingStates.get(el).originalErrorHTML = errorDisplayBlock.innerHTML;
      }

      if (errorDisplayBlock) {
        const errorUnorderedList = document.createElement('ul');
        errorUnorderedList.classList.add('issue-display-list');
        issueList.forEach(issueText => {
          const listItem = document.createElement('li');
          if (currentOperationalSettings.useHTML) {
            listItem.innerHTML = issueText;
          } else {
            listItem.textContent = issueText;
          }
          errorUnorderedList.appendChild(listItem);
        });
        errorDisplayBlock.innerHTML = '';
        errorDisplayBlock.appendChild(errorUnorderedList);
      }
      parentGroupContainer.classList.add('validation-error-present');

      if (statusIcon) {
        statusIcon.classList.remove(currentOperationalSettings.statusIndicators.positive);
        statusIcon.classList.add(currentOperationalSettings.statusIndicators.negative);
        parentGroupContainer.classList.remove('validation-success-present');
      }
    });
  };

  const removeFailureFeedback = (element) => {
    const parentGroupContainer = element.closest('[data-validation-group]');
    if (!parentGroupContainer) return;

    const errorDisplayBlock = parentGroupContainer.querySelector('[data-validation-feedback]');
    const statusIcon = parentGroupContainer.querySelector('[data-validation-status-icon]');

    if (errorDisplayBlock && inputTrackingStates.get(element)?.originalErrorHTML !== undefined) {
      errorDisplayBlock.innerHTML = inputTrackingStates.get(element).originalErrorHTML;
    }
    parentGroupContainer.classList.remove('validation-error-present');

    if (statusIcon) {
      statusIcon.classList.remove(currentOperationalSettings.statusIndicators.negative);
      statusIcon.classList.add(currentOperationalSettings.statusIndicators.positive);
      parentGroupContainer.classList.add('validation-success-present');
    }
  };

  const checkForAnyActiveFaults = () => {
    return Array.from(inputTrackingStates.values()).some(state => state.failureReasons.length > 0);
  };

  const checkForAnyMissingRequiredData = () => {
    return retrieveValidationTargets().some(element => {
      if (!element.hasAttribute('required')) return false;

      if (element.type === 'checkbox') return !element.checked;
      if (element.type === 'radio') {
        return !Array.from(targetFormElement.elements)
          .filter(el => el.name === element.name && el.type === 'radio')
          .some(radio => radio.checked);
      }
      return element.value.trim() === '';
    });
  };

  const updateSubmissionControlState = () => {
    if (!currentOperationalSettings.disableSubmission) return;

    const relatedSubmissionButtons = Array.from(targetFormElement.querySelectorAll('button[type="submit"], input[type="submit"]'))
      .concat(Array.from(document.querySelectorAll(`button[type="submit"][form="${targetFormElement.id}"], input[type="submit"][form="${targetFormElement.id}"]`)));

    const shouldDeactivate = checkForAnyMissingRequiredData() || checkForAnyActiveFaults();

    relatedSubmissionButtons.forEach(btn => {
      btn.classList.toggle('disabled-for-validation', shouldDeactivate);
      btn.disabled = shouldDeactivate;
    });
  };

  const validateAllFormElements = () => {
    const originalDelaySetting = currentOperationalSettings.processDelay;
    currentOperationalSettings.processDelay = 0;

    retrieveValidationTargets().forEach(element => {
      const syntheticInputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(syntheticInputEvent);
    });

    currentOperationalSettings.processDelay = originalDelaySetting;
  };

  const interceptFormSubmission = (eventObject) => {
    validateAllFormElements();
    if (checkForAnyMissingRequiredData() || checkForAnyActiveFaults()) {
      eventObject.preventDefault();
    }
  };

  const activateGuardian = () => {
    targetFormElement.setAttribute('no-validate', 'true');

    retrieveValidationTargets().forEach(element => {
      inputTrackingStates.set(element, { failureReasons: [], deferredTimerId: null, originalErrorHTML: undefined, remoteValidationPromise: null });

      element.addEventListener('input', handleInteraction);
      element.addEventListener('change', handleInteraction);
      element.addEventListener('focusout', handleInteraction);

      if (element.dataset.alignWith) {
        const targetElement = targetFormElement.querySelector(element.dataset.alignWith);
        if (targetElement) {
          targetElement.addEventListener('input', handleDependentInputInteraction);
        }
      }
    });

    targetFormElement.addEventListener('submit', interceptFormSubmission);
    updateSubmissionControlState();
  };

  const deactivateGuardian = () => {
    targetFormElement.removeAttribute('no-validate');
    targetFormElement.removeEventListener('submit', interceptFormSubmission);

    retrieveValidationTargets().forEach(element => {
      element.removeEventListener('input', handleInteraction);
      element.removeEventListener('change', handleInteraction);
      element.removeEventListener('focusout', handleInteraction);

      if (element.dataset.alignWith) {
        const targetElement = targetFormElement.querySelector(element.dataset.alignWith);
        if (targetElement) {
          targetElement.removeEventListener('input', handleDependentInputInteraction);
        }
      }

      clearTimeout(element.dataset.validationDelayId);
      delete element.dataset.validationDelayId;
      delete inputTrackingStates.get(element).remoteValidationPromise;

      const parentGroupContainer = element.closest('[data-validation-group]');
      if (parentGroupContainer) {
        const errorDisplayBlock = parentGroupContainer.querySelector('[data-validation-feedback]');
        if (errorDisplayBlock && inputTrackingStates.get(element)?.originalErrorHTML !== undefined) {
          errorDisplayBlock.innerHTML = inputTrackingStates.get(element).originalErrorHTML;
        }
        parentGroupContainer.classList.remove('validation-error-present', 'validation-success-present');
      }
      inputTrackingStates.delete(element);
    });

    const relatedSubmissionButtons = Array.from(targetFormElement.querySelectorAll('button[type="submit"], input[type="submit"]'))
      .concat(Array.from(document.querySelectorAll(`button[type="submit"][form="${targetFormElement.id}"]`)));
    relatedSubmissionButtons.forEach(btn => {
      btn.classList.remove('disabled-for-validation');
      btn.disabled = false;
    });

    FORM_GUARDIAN_REGISTRY.delete(targetFormElement);
  };

  const guardianPublicAPI = {
    initialize: activateGuardian,
    validateNow: validateAllFormElements,
    releaseResources: deactivateGuardian,
    isFaulty: checkForAnyActiveFaults,
    isPartiallyComplete: checkForAnyMissingRequiredData
  };

  FORM_GUARDIAN_REGISTRY.set(targetFormElement, guardianPublicAPI);
  return guardianPublicAPI;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-form-guardian]').forEach(formElement => {
    const formConfiguration = {};
    if (formElement.dataset.delay) formConfiguration.processDelay = parseInt(formElement.dataset.delay, 10);
    if (formElement.dataset.html) formConfiguration.useHTML = formElement.dataset.html === 'true';
    if (formElement.dataset.disable) formConfiguration.disableSubmission = formElement.dataset.disable === 'true';

    const guardianInstance = createFormGuardian(formElement, formConfiguration);
    guardianInstance.initialize();
  });
});

window.FormGuardian = {
  get: (element) => FORM_GUARDIAN_REGISTRY.get(element),
  initiate: (element, config) => {
    let instance = FORM_GUARDIAN_REGISTRY.get(element);
    if (!instance) {
      instance = createFormGuardian(element, config);
      instance.initialize();
    }
    return instance;
  },
  release: (element) => {
    const instance = FORM_GUARDIAN_REGISTRY.get(element);
    if (instance) {
      instance.releaseResources();
    }
  },
  registerCustomRule: (ruleName, ruleFunction) => {
    if (typeof ruleName === 'string' && typeof ruleFunction === 'function') {
      CUSTOM_RULE_EXTENSIONS[ruleName] = ruleFunction;
    } else {
      console.error('Invalid arguments for registerCustomRule. Expected string and function.');
    }
  }
};