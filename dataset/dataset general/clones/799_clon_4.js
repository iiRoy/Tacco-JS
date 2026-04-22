if ("placeholder" in document.createElement("input")) {
    return;
}

const PlaceholderPolyfillAgent = {
    _elementRegistry: new WeakMap(),

    activate: function() {
        document.addEventListener('DOMContentLoaded', this._initiateProcess.bind(this));
    },

    _initiateProcess: function() {
        document.body.addEventListener('focusin', this._handleFocusEvent.bind(this));
        document.body.addEventListener('focusout', this._handleBlurEvent.bind(this));
        document.body.addEventListener('change', this._handleAlterationEvent.bind(this));
        document.body.addEventListener('submit', this._handleSubmissionEvent.bind(this));

        this._enumerateElements();
    },

    _enumerateElements: function() {
        const pertinentFields = document.querySelectorAll('input[placeholder], textarea[placeholder]');

        pertinentFields.forEach(element => {
            const originalHint = element.getAttribute('placeholder');
            if (!originalHint) return;

            if (element.type === 'password') {
                this._configurePasswordElement(element, originalHint);
            } else {
                this._configureStandardElement(element, originalHint);
            }
        });
    },

    _configureStandardElement: function(element, hintText) {
        this._elementRegistry.set(element, {
            initialHint: hintText,
            userModified: element.value !== ''
        });

        if (element.value === '') {
            element.value = hintText;
            element.classList.add('placeholder-display');
        }
    },

    _configurePasswordElement: function(passwordField, hintText) {
        const visualProxy = document.createElement('input');
        visualProxy.setAttribute('type', 'text');
        visualProxy.setAttribute('readonly', 'true');
        visualProxy.setAttribute('value', hintText);
        visualProxy.classList.add('placeholder-display');
        
        if (passwordField.id) {
            visualProxy.id = passwordField.id + '-visual'; // Ensure unique ID
        }
        visualProxy.className = passwordField.className;

        passwordField.parentNode.insertBefore(visualProxy, passwordField);

        this._elementRegistry.set(passwordField, {
            initialHint: hintText,
            userModified: passwordField.value !== '',
            proxyElement: visualProxy
        });
        this._elementRegistry.set(visualProxy, {
            targetField: passwordField
        });

        if (passwordField.value === '') {
            passwordField.style.display = 'none';
        } else {
            visualProxy.style.display = 'none';
        }
    },

    _handleFocusEvent: function(event) {
        const currentTarget = event.target;
        let elementData;

        if (currentTarget.matches('input[placeholder]:not([type="password"]), textarea[placeholder]')) {
            elementData = this._elementRegistry.get(currentTarget);
            if (elementData) {
                if (elementData.userModified === true) {
                    return;
                }
                if (currentTarget.value === elementData.initialHint) {
                    currentTarget.value = '';
                    currentTarget.classList.remove('placeholder-display');
                }
            }
        } else if (currentTarget.matches('input[type="text"][readonly].placeholder-display')) {
            elementData = this._elementRegistry.get(currentTarget);
            if (elementData && elementData.targetField) {
                const actualPasswordField = elementData.targetField;
                currentTarget.style.display = 'none';
                actualPasswordField.style.display = '';
                actualPasswordField.focus();
            }
        }
    },

    _handleBlurEvent: function(event) {
        const currentTarget = event.target;
        let elementData;

        if (currentTarget.matches('input[placeholder]:not([type="password"]), textarea[placeholder]')) {
            elementData = this._elementRegistry.get(currentTarget);
            if (elementData && currentTarget.value === '') {
                currentTarget.value = elementData.initialHint;
                currentTarget.classList.add('placeholder-display');
                elementData.userModified = false;
            } else if (elementData) {
                elementData.userModified = true;
            }
        } else if (currentTarget.matches('input[type="password"][placeholder]')) {
            elementData = this._elementRegistry.get(currentTarget);
            if (elementData && elementData.proxyElement && currentTarget.value === '') {
                currentTarget.style.display = 'none';
                elementData.proxyElement.style.display = '';
            } else if (elementData) {
                elementData.userModified = true;
            }
        }
    },

    _handleAlterationEvent: function(event) {
        const currentTarget = event.target;
        if (currentTarget.matches('input[placeholder]:not([type="password"]), textarea[placeholder], input[type="password"][placeholder]')) {
            const elementData = this._elementRegistry.get(currentTarget);
            if (elementData) {
                elementData.userModified = (currentTarget.value !== '');
                if (currentTarget.type !== 'password' && currentTarget.value === '') {
                    currentTarget.classList.add('placeholder-display');
                } else {
                    currentTarget.classList.remove('placeholder-display');
                }
            }
        }
    },

    _handleSubmissionEvent: function(event) {
        const submittingForm = event.target;
        if (submittingForm.tagName === 'FORM') {
            const formInputs = submittingForm.querySelectorAll('input[placeholder], textarea[placeholder]');
            formInputs.forEach(inputElement => {
                const elementData = this._elementRegistry.get(inputElement);
                if (elementData && !elementData.userModified) {
                    if (inputElement.type !== 'password' && inputElement.value === elementData.initialHint) {
                        inputElement.value = '';
                    } else if (inputElement.type === 'password' && inputElement.style.display === 'none') {
                        if (elementData.proxyElement) {
                            elementData.proxyElement.style.display = 'none';
                        }
                    }
                }
            });
        }
    }
};

PlaceholderPolyfillAgent.activate();