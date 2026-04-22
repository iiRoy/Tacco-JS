const validationLog = [];
let currentTestGroupLabel = '';

function verifyCondition(conditionOutcome, explanationText) {
    validationLog.push({
        group: currentTestGroupLabel,
        checkType: 'truth',
        result: !!conditionOutcome,
        message: explanationText
    });
}

function verifyMatch(actualValue, anticipatedValue, explanationText) {
    validationLog.push({
        group: currentTestGroupLabel,
        checkType: 'equality',
        actual: actualValue,
        expected: anticipatedValue,
        result: actualValue === anticipatedValue,
        message: explanationText
    });
}

function initiateTestBlock(blockIdentifier) {
    currentTestGroupLabel = blockIdentifier;
}

function executeTestProcedure(scenarioDescription, scenarioFunction) {
    try {
        scenarioFunction();
    } catch (e) {
        validationLog.push({
            group: currentTestGroupLabel,
            checkType: 'error',
            result: false,
            message: `Runtime error in "${scenarioDescription}": ${e.message}`
        });
    }
}

const legacyBrowserDetector = {
    isOldInternetExplorer: (typeof navigator !== 'undefined' && /MSIE|Trident/.test(navigator.userAgent))
};

const techCapabilitySensor = {
    queryAttributeSupport: (attributeName) => {
        // This assumes 'HTML5Support' is a globally available object
        // and 'supports_attribute' is a method on it, as per the original context.
        return HTML5Support.supports_attribute(attributeName);
    }
};

function retrieveElement(elementId) {
    return document.getElementById(elementId);
}

function countFormElements(formIdentifier) {
    const containingForm = retrieveElement(formIdentifier);
    return containingForm ? containingForm.querySelectorAll('input').length : 0;
}

function isElementDisplayed(elementReference) {
    return elementReference && elementReference.offsetParent !== null;
}

function activatePlaceholderPolyfill(targetInput) {
    if (techCapabilitySensor.queryAttributeSupport('placeholder')) {
        return;
    } else {
        if (targetInput.type === 'password') {
            let proxyVisual = targetInput.nextElementSibling;
            if (!proxyVisual || proxyVisual.dataset.sourceInputId !== targetInput.id) {
                proxyVisual = document.createElement('input');
                proxyVisual.type = 'text';
                proxyVisual.value = targetInput.getAttribute('placeholder');
                proxyVisual.className = targetInput.className;
                proxyVisual.dataset.sourceInputId = targetInput.id;
                proxyVisual.addEventListener('focus', () => {
                    targetInput.style.display = '';
                    proxyVisual.style.display = 'none';
                    targetInput.focus();
                });
                targetInput.parentNode.insertBefore(proxyVisual, targetInput.nextSibling);
            }

            if (targetInput.value === '') {
                targetInput.style.display = 'none';
                proxyVisual.style.display = '';
            } else {
                targetInput.style.display = '';
                proxyVisual.style.display = 'none';
            }

            targetInput.addEventListener('blur', () => {
                if (targetInput.value === '') {
                    targetInput.style.display = 'none';
                    proxyVisual.style.display = '';
                }
            });
        } else {
            if (targetInput.value === '' || targetInput.value === targetInput.getAttribute('placeholder')) {
                 targetInput.className = 'placeholder';
                 targetInput.value = targetInput.getAttribute('placeholder') + '\u00A0\u00A0\u00A0';
            }
        }
    }
}

function activateAutofocusPolyfill(targetInput) {
    if (techCapabilitySensor.queryAttributeSupport('autofocus')) {
        return;
    } else {
        targetInput.focus();
    }
}

document.addEventListener('DOMContentLoaded', function() {

    initiateTestBlock("Input field placeholder functionality");
    if (techCapabilitySensor.queryAttributeSupport('placeholder')) {
        executeTestProcedure("With native placeholder capability", function() {
            const currentInputField = retrieveElement('with_placeholder');
            verifyMatch(currentInputField.placeholder, "foobar", "Element's native placeholder property should be correct");

            activatePlaceholderPolyfill(currentInputField);
            verifyMatch(currentInputField.className, "", "Class attribute should remain empty due to native support");
            verifyMatch(currentInputField.value, "", "Input's content should remain empty with native handling");
        });
    } else {
        executeTestProcedure("Without native placeholder capability", function() {
            const currentInputField = retrieveElement('with_placeholder');
            const anticipatedPlaceholderValue = legacyBrowserDetector.isOldInternetExplorer ? "foobar" : undefined;
            verifyMatch(currentInputField.placeholder, anticipatedPlaceholderValue, "Element's placeholder property should be browser-dependent (undefined or value)");

            activatePlaceholderPolyfill(currentInputField);
            verifyMatch(currentInputField.className, "placeholder", "Class attribute should be updated by polyfill");
            verifyMatch(currentInputField.value, "foobar\u00A0\u00A0\u00A0", "Input's content should be filled by polyfill");
        });
    }

    initiateTestBlock("Password field placeholder functionality");
    if (techCapabilitySensor.queryAttributeSupport('placeholder')) {
        executeTestProcedure("With native placeholder capability for password inputs", function() {
            const passwordEntryField = retrieveElement('password_field');
            const initialFormInputCount = countFormElements('test_form');
            activatePlaceholderPolyfill(passwordEntryField);
            verifyMatch(countFormElements('test_form'), initialFormInputCount, "Form input count should not change with native support");
        });
    } else {
        executeTestProcedure("Without native placeholder capability for password inputs", function() {
            const passwordEntryField = retrieveElement('password_field');
            const initialFormInputCount = countFormElements('test_form');

            activatePlaceholderPolyfill(passwordEntryField);

            const nextElementProxy = passwordEntryField.nextElementSibling;
            verifyMatch(countFormElements('test_form'), initialFormInputCount + 1, "An additional input field (proxy) should be created");
            verifyMatch(nextElementProxy && nextElementProxy.tagName.toLowerCase(), 'input', 'A new input element should serve as the proxy');
            verifyCondition(!isElementDisplayed(passwordEntryField), 'The original password field should be hidden');
            verifyCondition(isElementDisplayed(nextElementProxy), "The proxy placeholder should be visible initially");

            nextElementProxy.focus();
            verifyCondition(isElementDisplayed(passwordEntryField), 'The original password field should become visible');
            verifyCondition(!isElementDisplayed(nextElementProxy), 'The proxy placeholder should become hidden');

            passwordEntryField.blur();
            verifyCondition(!isElementDisplayed(passwordEntryField), 'After blur, original password field should hide if empty');
            verifyCondition(isElementDisplayed(nextElementProxy), 'After blur, proxy placeholder should show if original was empty');
        });

        executeTestProcedure("Without native placeholder capability, password input with pre-existing content", function() {
            const passwordEntryWithContent = retrieveElement('password_with_value');
            const initialFormInputCount = countFormElements('test_form');

            activatePlaceholderPolyfill(passwordEntryWithContent);

            const nextElementProxy = passwordEntryWithContent.nextElementSibling;
            verifyMatch(countFormElements('test_form'), initialFormInputCount + 1, "An additional input field (proxy) should be created");
            verifyMatch(nextElementProxy && nextElementProxy.tagName.toLowerCase(), 'input', 'A new input element should serve as the proxy');
            verifyCondition(isElementDisplayed(passwordEntryWithContent), 'The original password field should be visible (due to existing value)');
            verifyCondition(!isElementDisplayed(nextElementProxy), "The proxy placeholder should be hidden (original has value)");

            passwordEntryWithContent.focus();
            verifyCondition(isElementDisplayed(passwordEntryWithContent), 'The original password field should remain visible');
            verifyCondition(!isElementDisplayed(nextElementProxy), 'The proxy placeholder should remain hidden');

            passwordEntryWithContent.value = ' ';
            passwordEntryWithContent.blur();

            verifyCondition(!isElementDisplayed(passwordEntryWithContent), 'The original password field should hide after clearing value and blur');
            verifyCondition(isElementDisplayed(nextElementProxy), "The proxy placeholder should show after clearing value and blur");

            nextElementProxy.focus();
            passwordEntryWithContent.value = 'confidential';
            passwordEntryWithContent.blur();

            verifyCondition(isElementDisplayed(passwordEntryWithContent), 'The original password field should show after typing new value');
            verifyCondition(!isElementDisplayed(nextElementProxy), 'The proxy placeholder should hide after typing new value');
        });
    }

    initiateTestBlock("Autofocus attribute functionality");
    if (techCapabilitySensor.queryAttributeSupport('autofocus')) {
        executeTestProcedure("With native autofocus capability", function() {
            const autoFocusTargetElement = retrieveElement('autofocus_test');
            let focusedStatus = false;

            autoFocusTargetElement.addEventListener('focus', () => {
                focusedStatus = true;
            });

            activateAutofocusPolyfill(autoFocusTargetElement);
            verifyCondition(!focusedStatus, 'Input should not be focused immediately by polyfill call (native browser handles it)');
        });
    } else {
        executeTestProcedure("Without native autofocus capability", function() {
            const autoFocusTargetElement = retrieveElement('autofocus_test');
            let focusedStatus = false;

            autoFocusTargetElement.addEventListener('focus', () => {
                focusedStatus = true;
            });

            activateAutofocusPolyfill(autoFocusTargetElement);
            verifyCondition(focusedStatus, 'Input should be focused immediately by polyfill call');
        });

        executeTestProcedure("Without native autofocus capability, using attribute declaration", function() {
            const autoFocusAttrElement = retrieveElement('autofocus_attr_test');
            let focusedStatus = false;

            autoFocusAttrElement.addEventListener('focus', () => {
                focusedStatus = true;
            });

            activateAutofocusPolyfill(autoFocusAttrElement);
            verifyCondition(focusedStatus, 'Input should be focused immediately by polyfill for attribute-specified element');
        });
    }
});