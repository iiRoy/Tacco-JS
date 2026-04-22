function processInputPayload(dataText) {
    const dataMap = new Map();
    const sections = dataText.split('&');

    for (const segment of sections) {
        if (!segment) continue;
        const dividerIndex = segment.indexOf('=');
        let dataKey, dataValue;

        if (dividerIndex === -1) {
            dataKey = segment;
            dataValue = '';
        } else {
            dataKey = segment.substring(0, dividerIndex);
            dataValue = segment.substring(dividerIndex + 1);
        }

        const decodedKey = decodeURIComponent(dataKey.replace(/\+/g, ' '));
        const decodedValue = decodeURIComponent(dataValue.replace(/\+/g, ' '));

        if (dataMap.has(decodedKey)) {
            let existingEntry = dataMap.get(decodedKey);
            if (Array.isArray(existingEntry)) {
                existingEntry.push(decodedValue);
            } else {
                dataMap.set(decodedKey, [existingEntry, decodedValue]);
            }
        } else {
            dataMap.set(decodedKey, decodedValue);
        }
    }
    return dataMap;
}

function populateFormFromQuery(targetElement, serializedInput, options = {}) {
    const effectiveOptions = {
        valueAssignmentHook: undefined,
        allowExistingValueReplacement: false
    };
    Object.assign(effectiveOptions, options);

    if (effectiveOptions.valueAssignmentHook && typeof effectiveOptions.valueAssignmentHook !== 'function') {
        effectiveOptions.valueAssignmentHook = undefined;
    }

    const valueDictionary = processInputPayload(serializedInput);

    const allFormControls = targetElement.querySelectorAll('input, select, textarea');
    allFormControls.forEach(controlItem => {
        if (controlItem.type === 'checkbox' || controlItem.type === 'radio') {
            controlItem.checked = false;
        }
    });

    valueDictionary.forEach((incomingValue, fieldName) => {
        const matchedControls = targetElement.querySelectorAll(`[name="${fieldName}"]`);

        let customHookHandled = false;
        if (effectiveOptions.valueAssignmentHook) {
            const hookTargetElements = matchedControls.length > 0 ? matchedControls : [];
            const hookResult = effectiveOptions.valueAssignmentHook.call(targetElement, fieldName, incomingValue, hookTargetElements);
            if (hookResult === true) {
                customHookHandled = true;
            }
        }

        if (!customHookHandled) {
            const controlsForAssignment = targetElement.querySelectorAll(`[name="${fieldName}"]`);

            if (controlsForAssignment.length > 1) {
                controlsForAssignment.forEach(currentControl => {
                    const shouldBeActivated = Array.isArray(incomingValue)
                        ? incomingValue.includes(currentControl.value)
                        : (currentControl.value === incomingValue);
                    currentControl.checked = shouldBeActivated;
                });
            } else if (controlsForAssignment.length === 1) {
                const singleControl = controlsForAssignment[0];
                const controlTag = singleControl.tagName.toLowerCase();
                const controlType = singleControl.type ? singleControl.type.toLowerCase() : '';

                if (controlTag === 'input' && controlType === 'checkbox') {
                    singleControl.checked = true;
                } else if (controlTag === 'select' && singleControl.multiple) {
                    const valuesToSelect = Array.isArray(incomingValue) ? incomingValue : [incomingValue];
                    Array.from(singleControl.options).forEach(opt => {
                        opt.selected = valuesToSelect.includes(opt.value);
                    });
                } else {
                    if (effectiveOptions.allowExistingValueReplacement || !singleControl.value) {
                        singleControl.value = incomingValue;
                    }
                }
            }
        }
    });
}

(function() {
    if (typeof Element !== 'undefined') {
        Element.prototype.restoreSerializedInputs = function(inputDataString, setupOptions) {
            populateFormFromQuery(this, inputDataString, setupOptions);
            return this;
        };
    }
})();