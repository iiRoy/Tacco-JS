const mainConfig = {
    backendPath: 'backend_validation.php',
    issueTextColor: '#b94a48',
    issueBorderColor: '#b94a48',
    confirmTextColor: '#468847',
    confirmBorderColor: '#468847',
    cssClasses: {
        success: 'valid-state',
        warning: 'caution-state',
        incomplete: 'error-state'
    }
};

function isUnset(value) {
    if (typeof value === 'string') {
        value = value.trim();
    }
    return value === undefined || value === null || value === '' || value === false || value === 'false' || value === '0' || value === 0 || (typeof value === 'number' && isNaN(value));
}

function containsFragment(haystack, needle) {
    return haystack.includes(needle);
}

function performActionUponCompletion() {
    alert('All fields are correctly filled, and the submission process is initiated!');
    console.log('All fields are correctly filled, and the submission process is initiated!');
}

const tooltipManager = {
    activeTipElement: null,
    showTip: function(targetElement, messageContent) {
        this.destroyTip();

        if (!messageContent) return;

        const tip = document.createElement('div');
        tip.className = 'val-tip';
        tip.textContent = messageContent;
        document.body.appendChild(tip);
        this.activeTipElement = tip;

        const rect = targetElement.getBoundingClientRect();
        tip.style.position = 'absolute';
        tip.style.left = `${rect.left + window.scrollX}px`;
        tip.style.top = `${rect.top + window.scrollY - tip.offsetHeight - 5}px`;
        tip.style.zIndex = '10000000';
        tip.style.backgroundColor = '#333';
        tip.style.color = '#fff';
        tip.style.padding = '5px 10px';
        tip.style.borderRadius = '3px';
        tip.style.fontSize = '12px';
        tip.style.whiteSpace = 'nowrap';
    },
    destroyTip: function() {
        if (this.activeTipElement && this.activeTipElement.parentNode) {
            this.activeTipElement.parentNode.removeChild(this.activeTipElement);
        }
        this.activeTipElement = null;
    }
};

class InputComplianceEngine {
    constructor(configuration) {
        this.settings = configuration;
        this.initializeStyling();
        this.attachGlobalListeners();
        console.log('Form validation system initialized - custom implementation.');
    }

    initializeStyling() {
        const styleBlock = document.createElement('style');
        styleBlock.type = 'text/css';
        styleBlock.textContent = `
            .val-tip { position: absolute; z-index: 10000000; }
            input[type=text].caution-state, input[type=password].caution-state, textarea.caution-state, select.caution-state, .caution-state { border: 1px solid ${this.settings.issueBorderColor}; color: ${this.settings.issueTextColor}; }
            input[type=text].error-state, input[type=password].error-state, textarea.error-state, select.error-state, .error-state { border: 2px solid ${this.settings.issueBorderColor}; color: ${this.settings.issueTextColor}; }
            input[type=text].valid-state, input[type=password].valid-state, textarea.valid-state, select.valid-state, .valid-state { border: 1px solid ${this.settings.confirmBorderColor}; color: ${this.settings.confirmTextColor}; }
        `;
        document.head.appendChild(styleBlock);
    }

    attachGlobalListeners() {
        document.addEventListener('focusout', (event) => {
            const target = event.target;
            if (target.matches('[data-req], [data-kind]')) {
                this.evaluateElement(target);
            }
        });

        document.addEventListener('change', (event) => {
            const target = event.target;
            if (target.matches('select.chosen[data-req]')) {
                this.evaluateElement(target);
            }
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('[data-submitter]')) {
                event.preventDefault();
                const parentForm = target.closest('form');
                if (parentForm) {
                    this.processSubmission(parentForm, target);
                }
            }
        });
    }

    async processSubmission(formElement, submitButtonElement) {
        this.clearFormFeedback(formElement);

        const formElements = Array.from(formElement.querySelectorAll('input, textarea, select')).filter(el => el.id);
        const validationPromises = formElements.map(el => this.evaluateElement(el));

        const results = await Promise.all(validationPromises);
        const allValid = results.every(isValid => isValid === true);

        if (allValid) {
            const actionFunc = submitButtonElement.dataset.action;
            if (!isUnset(actionFunc) && typeof window[actionFunc] === 'function') {
                window[actionFunc](formElement);
            } else {
                formElement.submit();
            }
            if (submitButtonElement.dataset.clearForm) {
                this.resetFormValues(formElement);
            }
        } else {
            this.highlightIncomplete(formElement);
            alert('Form has unaddressed issues.');
            console.log('Form has unaddressed issues.');
        }
    }

    async evaluateElement(inputElement) {
        this.removeElementFeedback(inputElement);
        let isValid = true;

        if (!isUnset(inputElement.value)) {
            if (!isUnset(inputElement.dataset.kind)) {
                const remoteCheckResult = await this.checkRemoteInput(
                    inputElement.value,
                    inputElement.dataset.kind
                );
                if (remoteCheckResult.success) {
                    this.setElementFeedback(inputElement, 'success');
                } else {
                    this.setElementFeedback(inputElement, 'warning', remoteCheckResult.message);
                    isValid = false;
                }
            } else {
                this.setElementFeedback(inputElement, 'success');
            }
        } else {
            if (!isUnset(inputElement.dataset.req)) {
                this.setElementFeedback(inputElement, 'warning', 'This field is mandatory.');
                isValid = false;
            } else {
                this.setElementFeedback(inputElement, 'success');
            }
        }
        return isValid;
    }

    async checkRemoteInput(inputValue, inputType) {
        try {
            const response = await fetch(this.settings.backendPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `type=${encodeURIComponent(inputType)}&value=${encodeURIComponent(inputValue)}`
            });
            const responseText = await response.text();

            if (responseText !== '1') {
                return { success: false, message: responseText };
            } else {
                return { success: true, message: '' };
            }
        } catch (error) {
            console.error('Remote validation error:', error);
            return { success: false, message: 'Server communication error.' };
        }
    }

    setElementFeedback(inputElement, statusType, message = '') {
        if (inputElement.tagName === 'SELECT' && inputElement.classList.contains('chosen')) {
            this.adjustChosenElement(inputElement, (chosenWrapper) => {
                this.setElementFeedback(chosenWrapper, statusType, message);
            });
            return;
        }

        this.removeElementFeedback(inputElement);
        inputElement.classList.add(this.settings.cssClasses[statusType]);
        if (message) {
            tooltipManager.showTip(inputElement, message);
        }
    }

    highlightIncomplete(formElement) {
        formElement.querySelectorAll(`.${this.settings.cssClasses.warning}`).forEach(element => {
            element.classList.remove(this.settings.cssClasses.warning);
            element.classList.add(this.settings.cssClasses.incomplete);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                let currentPlaceholder = element.getAttribute('placeholder') || '';
                if (!containsFragment(currentPlaceholder, '(Required)')) {
                    element.setAttribute('placeholder', currentPlaceholder + ' (Required)');
                }
            }
            if (element.classList.contains('chosen-container')) {
                const defaultSpan = element.querySelector('a.chosen-default span');
                if (defaultSpan) {
                    let currentText = defaultSpan.textContent;
                    if (!containsFragment(currentText, '(Required)')) {
                        defaultSpan.textContent = currentText + ' (Required)';
                    }
                }
            }
        });
    }

    removeElementFeedback(inputElement) {
        inputElement.classList.remove(this.settings.cssClasses.success, this.settings.cssClasses.warning, this.settings.cssClasses.incomplete);
        tooltipManager.destroyTip();
    }

    clearFormFeedback(formElement) {
        formElement.querySelectorAll('input, textarea, select, .chosen-container').forEach(element => {
            this.removeElementFeedback(element);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                let ph = element.getAttribute('placeholder');
                if (ph && containsFragment(ph, ' (Required)')) {
                    element.setAttribute('placeholder', ph.replace(' (Required)', ''));
                }
            }
            if (element.classList.contains('chosen-container')) {
                const defaultSpan = element.querySelector('a.chosen-default span');
                if (defaultSpan) {
                    let text = defaultSpan.textContent;
                    if (containsFragment(text, ' (Required)')) {
                        defaultSpan.textContent = text.replace(' (Required)', '');
                    }
                }
            }
        });
    }

    resetFormValues(formElement) {
        formElement.querySelectorAll('input, textarea, select').forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = '';
            } else if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
                if (element.classList.contains('chosen')) {
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                }
            }
        });
        this.clearFormFeedback(formElement);
    }

    adjustChosenElement(originalSelect, callback) {
        const chosenWrapperId = originalSelect.id + "_chosen";
        const chosenWrapper = document.getElementById(chosenWrapperId);
        if (chosenWrapper) {
            callback(chosenWrapper);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InputComplianceEngine(mainConfig);
});