function produceFormPayload(containerElement) {
    const payloadAccumulator = {};

    const relevantControls = containerElement.querySelectorAll(
        'input:not([type="button"]):not([type="image"]):not([type="submit"]):not([type="hidden"]), select, textarea'
    );

    Array.from(relevantControls).forEach(function (currentControl) {
        let designationKey = currentControl.id;
        if (!designationKey) {
            designationKey = currentControl.name;
        }

        if (!designationKey) {
            console.error('Data collection error: an input control lacks both id and name. Skipping.');
            return;
        }

        if (designationKey.startsWith('__')) {
            return;
        }

        const controlCategory = currentControl.type;
        let collectedContent = currentControl.value;

        if (!collectedContent && controlCategory !== 'checkbox' && controlCategory !== 'radio') {
            return;
        }

        if (controlCategory === 'checkbox') {
            payloadAccumulator[designationKey] = currentControl.checked ? "true" : "false";
        } else if (controlCategory === 'radio') {
            if (currentControl.checked) {
                payloadAccumulator[designationKey] = collectedContent;
            }
        } else {
            if (payloadAccumulator[designationKey] === undefined) {
                payloadAccumulator[designationKey] = collectedContent;
            } else {
                payloadAccumulator[designationKey] += "," + collectedContent;
            }
        }
    });

    return payloadAccumulator;
}

function applyPayloadToForm(targetContainer, dataObject) {
    if (!dataObject || typeof dataObject !== 'object') {
        console.warn('Invalid data object for form population.');
        return;
    }

    Object.entries(dataObject).forEach(([fieldKey, fieldContent]) => {
        const candidates = targetContainer.querySelectorAll(`[id="${fieldKey}"], [name="${fieldKey}"]`);

        Array.from(candidates).forEach(currentElement => {
            const elementKind = currentElement.type;

            if (elementKind === 'checkbox') {
                currentElement.checked = (String(fieldContent) === "true");
            } else if (elementKind === 'radio') {
                if (currentElement.value === String(fieldContent)) {
                    currentElement.checked = true;
                } else {
                    currentElement.checked = false;
                }
            } else if (currentElement.tagName === 'SELECT' && currentElement.multiple) {
                const valuesToSelect = String(fieldContent).split(',');
                Array.from(currentElement.options).forEach(opt => {
                    opt.selected = valuesToSelect.includes(opt.value);
                });
            } else {
                currentElement.value = String(fieldContent);
            }
            currentElement.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}

async function executeFormPopulation(configObject) {
    if (!configObject || typeof configObject !== 'object') {
        console.warn('Invalid configuration object for form population.');
        return;
    }
    console.debug('Commencing form population with configuration:', configObject);

    try {
        const parsedContent = JSON.parse(configObject.content);
        applyPayloadToForm(document.body, parsedContent);
        console.debug('Form fields populated.');
    } catch (parseError) {
        window.alert('Failed to parse form data for population: ' + parseError.message);
        console.error('Form data parsing error:', parseError);
        return;
    }

    if (configObject.autoSubmit) {
        try {
            const submissionInitiator = document.querySelector(configObject.submitQuery);
            if (submissionInitiator) {
                console.debug('Attempting auto-submission via element:', submissionInitiator);
                submissionInitiator.click();
            } else {
                window.alert('Submission element specified by query was not found.');
                console.warn('Submission element not found for query:', configObject.submitQuery);
            }
        } catch (submissionError) {
            window.alert('An error occurred during auto-submission: ' + submissionError.message);
            console.error('Auto-submission error:', submissionError);
        }
    }
}

async function establishKeyBindings() {
    console.debug('Initiating key binding setup.');

    try {
        const keySequences = await chrome.runtime.sendMessage({ "operation": "retrieveKeyMappings", pageAddress: window.location.href });
        console.debug('Acquired key sequences: ' + keySequences);

        (function(mt) { mt.reset(); })(Mousetrap);

        Mousetrap.bind(keySequences, async function (eventContext, sequenceCode) {
            console.debug('Hotkey triggered: ' + sequenceCode);
            try {
                const configurationPayload = await chrome.runtime.sendMessage({ "operation": "activatedKey", triggerCode: sequenceCode, pageAddress: window.location.href });

                if (!configurationPayload) {
                    window.alert('Associated hotkey configuration not located.');
                    return false;
                }

                await executeFormPopulation(configurationPayload);
            } catch (err) {
                console.error('Error during hotkey processing:', err);
                window.alert('An issue occurred during hotkey execution: ' + err.message);
            }
            return false;
        });
    } catch (error) {
        console.error('Failed to establish key bindings:', error);
        window.alert('Error during key binding setup: ' + error.message);
    }
}

chrome.runtime.onMessage.addListener(async function (commandEnvelope, originDetails, responseCallback) {
    if (typeof (window.localStorage) === 'undefined') {
        window.alert("Data persistence unavailable: Your browser does not support local storage. This extension's functionality is impaired.");
        responseCallback({ error: true, message: "Local storage not supported." });
        return false;
    }

    const operationType = commandEnvelope.operation;

    if (operationType === 'capture') {
        console.debug('Message received: capture form data.');
        try {
            const capturedInputs = produceFormPayload(document.body);
            responseCallback({ content: JSON.stringify(capturedInputs) });
        } catch (collectError) {
            console.error('Error during form data capture:', collectError);
            responseCallback({ issue: true, explanation: collectError.message });
        }
    } else if (operationType === 'inject') {
        console.debug('Message received: inject form data.');
        await executeFormPopulation(commandEnvelope.configuration);
        responseCallback({});
    } else if (operationType === 'reestablishBindings') {
        console.debug('Message received: re-establish hotkey bindings.');
        await establishKeyBindings();
        responseCallback({});
    } else {
        console.warn('Unknown message operation received:', operationType);
        responseCallback({ issue: true, explanation: 'Unrecognized command.' });
    }
    return true;
});

establishKeyBindings();