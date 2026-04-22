const globalValidationRegistry = {
    totalValidationSuites: 0,
    totalValidationCases: 0,
    passedValidationCases: 0,
    currentValidationSuite: null,
    currentValidationCase: null,
    validationAssertionsMade: 0,
    expectedValidationAssertions: 0,
    monitoredCallbacks: {},
    originalBrowserConfirmation: null,
    validationOutcomes: []
};

function recordOutcome(kind, messageTxt, auxDetails = {}) {
    globalValidationRegistry.validationOutcomes.push({ kind, messageTxt, ...auxDetails });
}

function verifyCondition(condVal, msgTxt) {
    globalValidationRegistry.validationAssertionsMade++;
    if (!condVal) {
        recordOutcome('fail', msgTxt, { expected: true, actual: false });
        return false;
    }
    recordOutcome('pass', msgTxt);
    return true;
}

function verifyEquality(valA, valB, msgTxt) {
    globalValidationRegistry.validationAssertionsMade++;
    if (valA !== valB) {
        recordOutcome('fail', msgTxt, { expected: valB, actual: valA });
        return false;
    }
    recordOutcome('pass', msgTxt);
    return true;
}

function defineValidationSuite(suiteIdentifier, suiteConfiguration) {
    globalValidationRegistry.totalValidationSuites++;
    globalValidationRegistry.currentValidationSuite = { 
        name: suiteIdentifier, 
        initialization: suiteConfiguration.initialization, 
        finalization: suiteConfiguration.finalization, 
        cases: [] 
    };
}

async function executeValidationCase(caseIdentifier, expectedAssertionsNumber, caseFunction) {
    globalValidationRegistry.totalValidationCases++;
    globalValidationRegistry.currentValidationCase = { name: caseIdentifier, status: 'running', assertions: 0 };
    globalValidationRegistry.validationAssertionsMade = 0;
    globalValidationRegistry.expectedValidationAssertions = expectedAssertionsNumber;
    globalValidationRegistry.monitoredCallbacks = {}; 
    
    if (globalValidationRegistry.currentValidationSuite.initialization) {
        globalValidationRegistry.currentValidationSuite.initialization();
    }

    let caseStatus = true;
    try {
        await caseFunction();
        if (globalValidationRegistry.validationAssertionsMade !== globalValidationRegistry.expectedValidationAssertions) {
            recordOutcome('fail', `Expected ${globalValidationRegistry.expectedValidationAssertions} assertions, but encountered ${globalValidationRegistry.validationAssertionsMade}.`, { case: caseIdentifier });
            caseStatus = false;
        }
    } catch (err) {
        recordOutcome('fail', `Validation case encountered an error: ${err.message}`, { case: caseIdentifier, error: err });
        caseStatus = false;
    } finally {
        if (globalValidationRegistry.currentValidationSuite.finalization) {
            globalValidationRegistry.currentValidationSuite.finalization();
        }
    }

    if (caseStatus && globalValidationRegistry.validationAssertionsMade === globalValidationRegistry.expectedValidationAssertions) {
        globalValidationRegistry.passedValidationCases++;
        globalValidationRegistry.currentValidationCase.status = 'pass';
    } else {
        globalValidationRegistry.currentValidationCase.status = 'fail';
    }
    globalValidationRegistry.currentValidationSuite.cases.push(globalValidationRegistry.currentValidationCase);
}

const domTestHarnessId = 'dom-test-container';
let domTestHarnessElement;

function establishDomTestHarness() {
    domTestHarnessElement = document.getElementById(domTestHarnessId);
    if (!domTestHarnessElement) {
        domTestHarnessElement = document.createElement('div');
        domTestHarnessElement.id = domTestHarnessId;
        document.body.appendChild(domTestHarnessElement);
    }
    domTestHarnessElement.innerHTML = ''; 
}

const customEventListenersMap = new Map(); 

function bindCustomListener(domNode, eventKind, listenerFunc) {
    if (!customEventListenersMap.has(domNode)) {
        customEventListenersMap.set(domNode, new Map());
    }
    const nodeListeners = customEventListenersMap.get(domNode);
    if (!nodeListeners.has(eventKind)) {
        nodeListeners.set(eventKind, []);
    }
    nodeListeners.get(eventKind).push(listenerFunc);
}

function broadcastCustomEvent(domNode, eventKind, eventPayload = {}, canBeCancelled = true) {
    const nodeListeners = customEventListenersMap.get(domNode);
    if (nodeListeners && nodeListeners.has(eventKind)) {
        const listeners = nodeListeners.get(eventKind);
        let defaultPreventedFlag = false;
        const mockEvent = { 
            type: eventKind, 
            target: domNode, 
            detail: eventPayload, 
            preventDefault: () => { defaultPreventedFlag = true; } 
        };
        for (const listener of listeners) {
            const listenerResult = listener(mockEvent, eventPayload);
            if (listenerResult === false && canBeCancelled) {
                return false; 
            }
        }
        if (defaultPreventedFlag && canBeCancelled) {
            return false;
        }
    }
    return true; 
}

const UtilityFunctions = {
    checkCallbackExecution: (callbackRef) => {
        globalValidationRegistry.monitoredCallbacks[callbackRef] = (globalValidationRegistry.monitoredCallbacks[callbackRef] || 0) + 1;
        verifyCondition(true, `Callback '${callbackRef}' was executed.`);
    },
    checkCallbackNonExecution: (callbackRef) => {
        verifyCondition(!globalValidationRegistry.monitoredCallbacks[callbackRef], `Callback '${callbackRef}' was NOT executed.`);
    },
    verifyPathAttribute: (dataObject, expectedPath) => {
        verifyEquality(dataObject.path, expectedPath, `Request path matches '${expectedPath}'.`);
    },
    verifyRequestVerb: (dataObject) => {
        verifyEquality(dataObject.method, 'GET', 'Request method is GET.');
    }
};

defineValidationSuite('user-confirmation-behavior', {
    initialization: function() {
        establishDomTestHarness();
        
        const anchorLink = document.createElement('a');
        anchorLink.setAttribute('href', '/echo');
        anchorLink.setAttribute('data-remote', 'true');
        anchorLink.setAttribute('data-confirm', 'Are you absolutely sure?');
        anchorLink.textContent = 'my sensitive data';
        domTestHarnessElement.appendChild(anchorLink);

        const actionButton = document.createElement('button');
        actionButton.setAttribute('data-url', '/echo');
        actionButton.setAttribute('data-remote', 'true');
        actionButton.setAttribute('data-confirm', 'Are you absolutely sure?');
        actionButton.textContent = 'Proceed with action';
        domTestHarnessElement.appendChild(actionButton);

        const submissionForm = document.createElement('form');
        submissionForm.id = 'submission-form-id';
        submissionForm.setAttribute('action', '/echo');
        submissionForm.setAttribute('data-remote', 'true');
        domTestHarnessElement.appendChild(submissionForm);

        const formInput = document.createElement('input');
        formInput.setAttribute('type', 'submit');
        formInput.setAttribute('form', 'submission-form-id');
        formInput.setAttribute('data-confirm', 'Are you absolutely sure?');
        domTestHarnessElement.appendChild(formInput);

        globalValidationRegistry.originalBrowserConfirmation = window.confirm;
    },
    finalization: function() {
        window.confirm = globalValidationRegistry.originalBrowserConfirmation;
        domTestHarnessElement.innerHTML = ''; 
    }
});

function mimicConfirmationFeature(interactiveElement) {
    const confirmationPromptText = interactiveElement.getAttribute('data-confirm');
    const isRemoteOperation = interactiveElement.hasAttribute('data-remote');
    
    const preConfirmEventResult = broadcastCustomEvent(interactiveElement, 'confirm', { message: confirmationPromptText }, true);
    if (preConfirmEventResult === false) {
        return;
    }

    let userDecision = true;
    let actualConfirmationMessage = '';
    if (confirmationPromptText) {
        actualConfirmationMessage = confirmationPromptText;
        userDecision = window.confirm(confirmationPromptText);
    }

    const postConfirmEventResult = broadcastCustomEvent(interactiveElement, 'confirm:complete', userDecision, true);
    if (postConfirmEventResult === false) {
        return;
    }

    if (userDecision && isRemoteOperation) {
        const remoteData = { path: interactiveElement.getAttribute('href') || interactiveElement.getAttribute('data-url') || interactiveElement.getAttribute('action'), method: 'GET' };
        const preSendResult = broadcastCustomEvent(interactiveElement, 'ajax:beforeSend', remoteData, true);
        if (preSendResult === false) {
            return;
        }
        broadcastCustomEvent(interactiveElement, 'ajax:success', remoteData, false);
    } 
}

function initializeInteractionListener() {
    domTestHarnessElement.addEventListener('click', (interactionEvent) => {
        let triggeringElement = interactionEvent.target;
        let elementForConfirmation = null;

        if (triggeringElement.hasAttribute('data-confirm')) {
            elementForConfirmation = triggeringElement;
        } else if (triggeringElement.type === 'submit' && triggeringElement.form) {
            if (triggeringElement.hasAttribute('data-confirm')) {
                elementForConfirmation = triggeringElement;
            } else if (triggeringElement.form.hasAttribute('data-confirm')) {
                elementForConfirmation = triggeringElement.form;
            }
        }

        if (elementForConfirmation) {
            interactionEvent.preventDefault(); 
            mimicConfirmationFeature(elementForConfirmation);
        }
    });
}

initializeInteractionListener();

(async () => {
    await executeValidationCase('link-positive-confirmation', 6, async () => {
        let capturedMessage;
        window.confirm = (msg) => { capturedMessage = msg; return true; };

        const targetLink = domTestHarnessElement.querySelector('a[data-confirm]');
        
        bindCustomListener(targetLink, 'confirm:complete', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            verifyCondition(data === true, 'confirm:complete provides positive answer.');
        });
        bindCustomListener(targetLink, 'ajax:success', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('ajax:success');
            UtilityFunctions.verifyPathAttribute(data, '/echo');
            UtilityFunctions.verifyRequestVerb(data);
            verifyEquality(capturedMessage, 'Are you absolutely sure?');
        });

        targetLink.click(); 
    });

    await executeValidationCase('button-positive-confirmation', 6, async () => {
        let capturedMessage;
        window.confirm = (msg) => { capturedMessage = msg; return true; };

        const targetButton = domTestHarnessElement.querySelector('button[data-confirm]');
        
        bindCustomListener(targetButton, 'confirm:complete', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            verifyCondition(data === true, 'confirm:complete provides positive answer.');
        });
        bindCustomListener(targetButton, 'ajax:success', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('ajax:success');
            UtilityFunctions.verifyPathAttribute(data, '/echo');
            UtilityFunctions.verifyRequestVerb(data);
            verifyEquality(capturedMessage, 'Are you absolutely sure?');
        });

        targetButton.click();
    });

    await executeValidationCase('link-negative-confirmation', 3, async () => {
        let capturedMessage;
        window.confirm = (msg) => { capturedMessage = msg; return false; };

        const targetLink = domTestHarnessElement.querySelector('a[data-confirm]');
        
        bindCustomListener(targetLink, 'confirm:complete', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            verifyCondition(data === false, 'confirm:complete provides negative answer.');
        });
        bindCustomListener(targetLink, 'ajax:beforeSend', () => {
            UtilityFunctions.checkCallbackNonExecution('ajax:beforeSend');
        });

        targetLink.click();

        await new Promise(res => setTimeout(res, 50));
        verifyEquality(capturedMessage, 'Are you absolutely sure?');
    });

    await executeValidationCase('button-negative-confirmation', 3, async () => {
        let capturedMessage;
        window.confirm = (msg) => { capturedMessage = msg; return false; };

        const targetButton = domTestHarnessElement.querySelector('button[data-confirm]');
        
        bindCustomListener(targetButton, 'confirm:complete', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            verifyCondition(data === false, 'confirm:complete provides negative answer.');
        });
        bindCustomListener(targetButton, 'ajax:beforeSend', () => {
            UtilityFunctions.checkCallbackNonExecution('ajax:beforeSend');
        });

        targetButton.click();

        await new Promise(res => setTimeout(res, 50));
        verifyEquality(capturedMessage, 'Are you absolutely sure?');
    });

    await executeValidationCase('submit-negative-confirmation', 3, async () => {
        let capturedMessage;
        window.confirm = (msg) => { capturedMessage = msg; return false; };

        const targetInput = domTestHarnessElement.querySelector('input[type=submit][form]');
        
        bindCustomListener(targetInput, 'confirm:complete', (evt, data) => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            verifyCondition(data === false, 'confirm:complete provides negative answer.');
        });
        bindCustomListener(targetInput, 'ajax:beforeSend', () => {
            UtilityFunctions.checkCallbackNonExecution('ajax:beforeSend');
        });

        targetInput.click();

        await new Promise(res => setTimeout(res, 50));
        verifyEquality(capturedMessage, 'Are you absolutely sure?');
    });

    await executeValidationCase('link-prevent-initial-confirm', 1, async () => {
        window.confirm = (msg) => {
            verifyCondition(false, 'browser confirmation dialog should not activate');
            return false;
        };

        const targetLink = domTestHarnessElement.querySelector('a[data-confirm]');
        
        bindCustomListener(targetLink, 'confirm', () => {
            UtilityFunctions.checkCallbackExecution('confirm');
            return false; 
        });
        bindCustomListener(targetLink, 'confirm:complete', () => {
            UtilityFunctions.checkCallbackNonExecution('confirm:complete');
        });

        targetLink.click();

        await new Promise(res => setTimeout(res, 50));
    });

    await executeValidationCase('button-prevent-initial-confirm', 1, async () => {
        window.confirm = (msg) => {
            verifyCondition(false, 'browser confirmation dialog should not activate');
            return false;
        };

        const targetButton = domTestHarnessElement.querySelector('button[data-confirm]');
        
        bindCustomListener(targetButton, 'confirm', () => {
            UtilityFunctions.checkCallbackExecution('confirm');
            return false;
        });
        bindCustomListener(targetButton, 'confirm:complete', () => {
            UtilityFunctions.checkCallbackNonExecution('confirm:complete');
        });

        targetButton.click();

        await new Promise(res => setTimeout(res, 50));
    });

    await executeValidationCase('link-prevent-post-confirm-ajax', 2, async () => {
        window.confirm = (msg) => {
            verifyCondition(true, 'browser confirmation dialog should activate');
            return true;
        };

        const targetLink = domTestHarnessElement.querySelector('a[data-confirm]');
        
        bindCustomListener(targetLink, 'confirm:complete', () => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            return false; 
        });
        bindCustomListener(targetLink, 'ajax:beforeSend', () => {
            UtilityFunctions.checkCallbackNonExecution('ajax:beforeSend');
        });

        targetLink.click();

        await new Promise(res => setTimeout(res, 50));
    });

    await executeValidationCase('button-prevent-post-confirm-ajax', 2, async () => {
        window.confirm = (msg) => {
            verifyCondition(true, 'browser confirmation dialog should activate');
            return true;
        };

        const targetButton = domTestHarnessElement.querySelector('button[data-confirm]');
        
        bindCustomListener(targetButton, 'confirm:complete', () => {
            UtilityFunctions.checkCallbackExecution('confirm:complete');
            return false;
        });
        bindCustomListener(targetButton, 'ajax:beforeSend', () => {
            UtilityFunctions.checkCallbackNonExecution('ajax:beforeSend');
        });

        targetButton.click();

        await new Promise(res => setTimeout(res, 50));
    });

    await executeValidationCase('form-button-single-prompt', 1, async () => {
        let promptCount = 0;
        window.confirm = (msg) => {
            promptCount++;
            return true;
        };

        const newFormContainer = document.createElement('form');
        const embeddedButton = document.createElement('button');
        embeddedButton.setAttribute('data-remote', 'true');
        embeddedButton.setAttribute('data-confirm', 'Are you absolutely sure?');
        embeddedButton.textContent = 'Submit form with prompt';
        newFormContainer.appendChild(embeddedButton);
        domTestHarnessElement.appendChild(newFormContainer);

        const formNestedButton = domTestHarnessElement.querySelector('form > button[data-confirm]');
        formNestedButton.click();

        verifyEquality(promptCount, 1, `prompt counter should be 1, but was ${promptCount}`);
    });
})();