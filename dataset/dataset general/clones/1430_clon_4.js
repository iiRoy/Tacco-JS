class PaymentCardWidget {
    static creationMoment = new Date();

    constructor(mainContainerSelector, settings = {}) {
        const defaultSettings = {
            debugMode: false,
            preventAutoFocus: false,
            allowedCardTypes: null,
            cardNumberPlaceholderChar: 'X',
            genericCardPlaceholder: "XXXX XXXX XXXX XXXX",
            typeFieldSelector: '[name="cc_type"]',
            numberFieldSelector: '[name="cc_number"]',
            expMonthFieldSelector: '[name="cc_exp_month"]',
            expYearFieldSelector: '[name="cc_exp_year"]',
            nameFieldSelector: '[name="cc_name"]',
            securityCodeFieldSelector: '[name="cc_cvc"]',
            initialFormValues: {},
            validityStatus: {},
            displayMessages: {
                hiddenFacePrompt: "<strong>Click here</strong> to <br>fill in the other side.",
                hiddenFaceProblem: "There's a problem on the other side.",
                hiddenFaceReminder: "Forget something?<br> Flip the card over."
            }
        };

        this.options = Object.assign({}, defaultSettings, settings);
        this.domElements = {};
        this.fieldControllers = {};
        this.faceNavigators = {};
        this.widgetState = {};
        this.cardProductInfo = null;
        this.currentViewSide = 'front';

        this.domElements.mainWrapper = typeof mainContainerSelector === 'string' ?
            document.querySelector(mainContainerSelector) : mainContainerSelector;

        if (!this.domElements.mainWrapper) {
            this._writeLog("PaymentCardWidget: Main container not found.");
            return;
        }

        this.establishStructure();
        this.setupInteractionHandlers();
        this.loadInitialSettings();
        this.displayWidget();
    }

    _writeLog(...messages) {
        if (this.options.debugMode && console && console.log) {
            console.log('[PaymentCardWidget]', ...messages);
        }
    }

    emitCustomEvent(eventName, detail) {
        this.domElements.mainWrapper.dispatchEvent(new CustomEvent(eventName, { detail: [this, ...detail], bubbles: true }));
    }

    onCustomEvent(eventName, handler) {
        this.domElements.mainWrapper.addEventListener(eventName, (e) => handler(...e.detail));
    }

    establishStructure() {
        this.domElements.mainWrapper.classList.remove('no-js');
        this.domElements.mainWrapper.classList.add('payment-card-widget', 'js');

        Array.from(this.domElements.mainWrapper.children).forEach(child => {
            if (child.tagName !== 'INPUT' && child.tagName !== 'SELECT' && child.tagName !== 'TEXTAREA') {
                this.domElements.mainWrapper.removeChild(child);
            } else {
                child.style.display = 'none';
            }
        });

        this.domElements.hiddenFields = {
            type: this.domElements.mainWrapper.querySelector(this.options.typeFieldSelector),
            number: this.domElements.mainWrapper.querySelector(this.options.numberFieldSelector),
            expMonth: this.domElements.mainWrapper.querySelector(this.options.expMonthFieldSelector),
            expYear: this.domElements.mainWrapper.querySelector(this.options.expYearFieldSelector),
            name: this.domElements.mainWrapper.querySelector(this.options.nameFieldSelector),
            cvc: this.domElements.mainWrapper.querySelector(this.options.securityCodeFieldSelector)
        };

        this.domElements.frontFace = document.createElement('div');
        this.domElements.frontFace.className = 'card-face front-side';
        this.domElements.backFace = document.createElement('div');
        this.domElements.backFace.className = 'card-face back-side';
        this.domElements.cardBodyContainer = document.createElement('div');
        this.domElements.cardBodyContainer.className = 'card-body-wrapper';

        this.domElements.frontFace.appendChild(this.domElements.backFace);
        this.domElements.cardBodyContainer.appendChild(this.domElements.frontFace);
        this.domElements.mainWrapper.appendChild(this.domElements.cardBodyContainer);

        this.faceNavigators.front = new FlipFacetController(this, 'front', { messages: this.options.displayMessages });
        this.faceNavigators.back = new FlipFacetController(this, 'back', { messages: this.options.displayMessages });

        this.domElements.frontFace.prepend(this.faceNavigators.front.element);
        this.domElements.backFace.prepend(this.faceNavigators.back.element);

        this.faceNavigators.front.hideVisual();
        this.faceNavigators.back.hideVisual();

        this.fieldControllers = {
            number: new NumberInputController(this),
            exp: new ExpirationInputController(this, { currentEpoch: PaymentCardWidget.creationMoment }),
            name: new StandardTextInputController(this, { className: 'card-name-input', placeholderText: 'YOUR NAME' }),
            cvc: new StandardTextInputController(this, { className: 'card-cvc-input', placeholderText: 'XXX', enforceMaxLength: true })
        };

        this.fieldControllers.number.element.classList.add('card-number-display');
        this.domElements.frontFace.appendChild(this.fieldControllers.number.element);
        this.domElements.frontFace.appendChild(this.fieldControllers.name.element);
        this.fieldControllers.exp.element.classList.add('card-expiration-display');
        this.domElements.frontFace.appendChild(this.fieldControllers.exp.element);
        this.domElements.backFace.appendChild(this.fieldControllers.cvc.element);

        this.fieldControllersBySide = {
            front: [this.fieldControllers.number, this.fieldControllers.name, this.fieldControllers.exp],
            back: [this.fieldControllers.cvc]
        };
    }

    loadInitialSettings() {
        for (const fieldName in this.domElements.hiddenFields) {
            const hiddenField = this.domElements.hiddenFields[fieldName];
            if (hiddenField) {
                if (this.options.initialFormValues[fieldName] == null) {
                    this.options.initialFormValues[fieldName] = hiddenField.value;
                } else {
                    this.options.initialFormValues[fieldName] = String(this.options.initialFormValues[fieldName]);
                    this.updateHiddenField(fieldName, this.options.initialFormValues[fieldName]);
                }
                if (this.options.initialFormValues[fieldName].length > 0) {
                    this.widgetState.initiallyPopulated = true;
                }
                if (this.options.validityStatus[fieldName] == null) {
                    this.options.validityStatus[fieldName] = !hiddenField.classList.contains('invalid');
                }
            }
        }

        if (this.options.allowedCardTypes == null) {
            this.options.allowedCardTypes = [];
            const typeSelect = this.domElements.hiddenFields.type;
            if (typeSelect) {
                Array.from(typeSelect.options).forEach(option => {
                    const typeAlias = option.dataset.scType || option.value;
                    if (typeAlias) this.options.allowedCardTypes.push(typeAlias);
                });
            }
        }

        if (this.options.initialFormValues.number.length > 0) {
            this.setFieldValue('number', this.options.initialFormValues.number);
        }
        if (this.options.initialFormValues.name.length > 0) {
            this.setFieldValue('name', this.options.initialFormValues.name);
        }
        if (this.options.initialFormValues.cvc.length > 0) {
            this.setFieldValue('cvc', this.options.initialFormValues.cvc);
        }
        if (this.options.initialFormValues.expYear.length > 0 && this.options.initialFormValues.expMonth.length > 0) {
            const initialExpDate = new Date(
                parseInt(this.options.initialFormValues.expYear, 10),
                parseInt(this.options.initialFormValues.expMonth, 10) - 1, 1
            );
            this.setFieldValue('exp', initialExpDate);
        }

        this.assessFaceValidity('front');
        this.assessFaceValidity('back');
    }

    setFieldValue(field, newValue) {
        const controller = this.fieldControllers[field];
        if (controller) {
            controller.setValue(newValue);
            controller.emitCustomEvent('valueUpdated', controller);
        }
    }

    setupInteractionHandlers() {
        const hiddenFields = this.domElements.hiddenFields;
        if (hiddenFields.number) {
            hiddenFields.number.addEventListener('change', () => {
                this.fieldControllers.number.setValue(this.getHiddenFieldValue('number'));
                this.displayWidget();
            });
        }

        const handleExpiryChange = () => {
            const month = parseInt(this.getHiddenFieldValue('expMonth'), 10);
            const year = parseInt(this.getHiddenFieldValue('expYear'), 10);
            if (!isNaN(month) && !isNaN(year)) {
                this.fieldControllers.exp.setValue(new Date(year, month - 1));
            } else {
                this.fieldControllers.exp.setValue(null);
            }
            this.displayWidget();
        };
        if (hiddenFields.expMonth) hiddenFields.expMonth.addEventListener('change', handleExpiryChange);
        if (hiddenFields.expYear) hiddenFields.expYear.addEventListener('change', handleExpiryChange);
        if (hiddenFields.name) {
            hiddenFields.name.addEventListener('change', () => {
                this.fieldControllers.name.setValue(this.getHiddenFieldValue('name'));
                this.displayWidget();
            });
        }
        if (hiddenFields.cvc) {
            hiddenFields.cvc.addEventListener('change', () => {
                this.fieldControllers.cvc.setValue(this.getHiddenFieldValue('cvc'));
                this.displayWidget();
            });
        }

        this.fieldControllers.number.onCustomEvent('valueUpdated', (controller) => {
            const cardNumber = controller.getValue();
            this.updateHiddenField('number', cardNumber);
            this.assessFieldValidity('number', cardNumber);

            const matchedProduct = productIdentifier.determineProduct(cardNumber);
            const currentProductAlias = this.cardProductInfo ? this.cardProductInfo.details.companyAlias : null;
            const newProductAlias = matchedProduct ? matchedProduct.details.companyAlias : null;

            if (currentProductAlias !== newProductAlias) {
                this._writeLog("Product will change:", currentProductAlias, "=>", newProductAlias);
                const isAccepted = newProductAlias === null || this.options.allowedCardTypes.includes(newProductAlias);

                if (isAccepted) {
                    this.emitCustomEvent('productChanging', [this.cardProductInfo, matchedProduct]);
                    this.domElements.mainWrapper.classList.remove('unaccepted-card');
                    this.displayProductFeatures(matchedProduct);
                    this.cardProductInfo = matchedProduct;
                } else if (matchedProduct) {
                    this.emitCustomEvent('productChanging', [this.cardProductInfo, null]);
                    this.domElements.mainWrapper.classList.add('unaccepted-card');
                    this.displayProductFeatures(null);
                    this.cardProductInfo = null;
                } else {
                    this.emitCustomEvent('productChanging', [this.cardProductInfo, null]);
                    this.domElements.mainWrapper.classList.remove('unaccepted-card');
                    this.displayProductFeatures(null);
                    this.cardProductInfo = null;
                }
                this.emitCustomEvent('productChanged', [this.cardProductInfo ? this.cardProductInfo.details.companyAlias : null]);
            }
        });

        this.fieldControllers.exp.onCustomEvent('valueUpdated', (controller) => {
            const newDate = controller.getValue();
            this.assessFieldValidity('exp', newDate);
            if (newDate instanceof Date) {
                this.updateHiddenField('expMonth', newDate.getMonth() + 1);
                this.updateHiddenField('expYear', newDate.getFullYear());
            } else {
                this.updateHiddenField('expMonth', '');
                this.updateHiddenField('expYear', '');
            }
        });

        this.fieldControllers.name.onCustomEvent('valueUpdated', (controller) => {
            const value = controller.getValue();
            this.updateHiddenField('name', value);
            this.assessFieldValidity('name', value);
        });

        this.fieldControllers.cvc.onCustomEvent('valueUpdated', (controller) => {
            const value = controller.getValue();
            this.updateHiddenField('cvc', value);
            this.assessFieldValidity('cvc', value);
        });

        this.domElements.mainWrapper.addEventListener('keydown', this.handleTabNavigation.bind(this));
    }

    handleTabNavigation(e) {
        if (e.key === 'Tab') {
            const currentFocused = document.activeElement;
            if (!this.domElements.mainWrapper.contains(currentFocused)) {
                return true;
            }

            const currentSideFields = this.fieldControllersBySide[this.currentViewSide].map(ctrl => Array.from(ctrl.element.querySelectorAll('input, select, textarea'))).flat();
            const focusedIndex = currentSideFields.indexOf(currentFocused);

            const oppositeSide = this.currentViewSide === 'front' ? 'back' : 'front';
            const oppositeSideFields = this.fieldControllersBySide[oppositeSide].map(ctrl => Array.from(ctrl.element.querySelectorAll('input, select, textarea'))).flat();

            if (this.currentViewSide === 'front' && this.domElements.frontFace.classList.contains('populated') && oppositeSideFields.length > 0 && focusedIndex === currentSideFields.length - 1 && !e.shiftKey) {
                this.flipView();
                setTimeout(() => oppositeSideFields[0].focus(), 0);
                e.preventDefault();
            } else if (this.currentViewSide === 'back' && e.shiftKey && focusedIndex === 0) {
                this.flipView();
                setTimeout(() => currentSideFields[currentSideFields.length - 1].focus(), 0);
                e.preventDefault();
            }
        }
        return true;
    }

    assessFieldValidity(fieldName, currentValue) {
        if (!this.cardProductInfo) {
            return false;
        }

        const fieldRules = this.cardProductInfo.fieldRules[fieldName];
        if (!fieldRules) {
            return false;
        }

        const isFieldPopulated = fieldRules.isFilled(currentValue);
        const isFieldValid = fieldRules.isValid(currentValue);

        const fillStateChanged = this.widgetState[`${fieldName}Populated`] !== isFieldPopulated;
        const validityStateChanged = this.widgetState[`${fieldName}Valid`] !== isFieldValid;

        const controllerElement = this.fieldControllers[fieldName].element;

        if (fillStateChanged) {
            this.emitCustomEvent("fieldPopulatedStateChanging", [fieldName, isFieldPopulated]);
            controllerElement.classList.toggle('populated', isFieldPopulated);
            this.widgetState[`${fieldName}Populated`] = isFieldPopulated;
            this.emitCustomEvent("fieldPopulatedStateChanged", [fieldName, isFieldPopulated]);
        }
        if (validityStateChanged) {
            this.emitCustomEvent("fieldValidityStateChanging", [fieldName, isFieldValid]);
            controllerElement.classList.toggle('valid-field', isFieldValid);
            controllerElement.classList.toggle('invalid-field', !isFieldValid);
            this.widgetState[`${fieldName}Valid`] = isFieldValid;
            this.emitCustomEvent("fieldValidityStateChanged", [fieldName, isFieldValid]);
        }

        this.assessFaceValidity(this.currentViewSide);
    }

    assessFaceValidity(sideName) {
        const controllersOnSide = this.fieldControllersBySide[sideName];

        const allFieldsPopulated = controllersOnSide.every(ctrl => ctrl.element.classList.contains('populated'));
        const allFieldsValid = controllersOnSide.every(ctrl => ctrl.element.classList.contains('valid-field'));

        const isSidePopulated = (allFieldsPopulated && (this.cardProductInfo != null)) || (this.widgetState.initiallyPopulated || false);
        const isSideValid = allFieldsValid && (this.cardProductInfo != null);

        const faceElement = this.domElements[`${sideName}Face`];

        const fillStateChanged = this.widgetState[`${sideName}Populated`] !== isSidePopulated;
        const validityStateChanged = this.widgetState[`${sideName}Valid`] !== isSideValid;

        if (fillStateChanged) {
            this.emitCustomEvent("facePopulatedStateChanging", [sideName, isSidePopulated]);
            faceElement.classList.toggle('populated', isSidePopulated);
            this.widgetState[`${sideName}Populated`] = isSidePopulated;
            this.emitCustomEvent("facePopulatedStateChanged", [sideName, isSidePopulated]);
        }
        if (validityStateChanged) {
            this.emitCustomEvent("faceValidityStateChanging", [sideName, isSideValid]);
            faceElement.classList.toggle('valid-face', isSideValid);
            faceElement.classList.toggle('invalid-face', !isSideValid);
            this.widgetState[`${sideName}Valid`] = isSideValid;
            this.emitCustomEvent("faceValidityStateChanged", [sideName, isSideValid]);
        }

        const nav = this.faceNavigators[sideName];
        if (nav) {
            if (this.currentViewSide !== sideName) {
                if (!isSidePopulated) {
                    nav.updateMessage('hiddenFacePrompt');
                    nav.showVisual();
                } else if (!isSideValid) {
                    nav.updateMessage('hiddenFaceProblem');
                    nav.showVisual();
                } else {
                    nav.hideVisual();
                }
            } else {
                nav.hideVisual();
            }
        }
    }

    displayProductFeatures(productInfo) {
        this._writeLog("[displayProductFeatures]", "Displaying product:", productInfo);

        this.domElements.mainWrapper.className = this.domElements.mainWrapper.className.split(' ').filter(cls =>
            !cls.startsWith('product-') && !cls.startsWith('issuer-')
        ).join(' ');

        if (productInfo && productInfo.details.companyAlias) {
            this.domElements.mainWrapper.classList.add(`product-${productInfo.details.companyAlias}`);
        }
        if (productInfo && productInfo.details.issuerAlias) {
            this.domElements.mainWrapper.classList.add(`issuer-${productInfo.details.issuerAlias}`);
        }

        this.updateHiddenField('type', (productInfo && productInfo.details.companyAlias) || null);

        this.fieldControllers.number.updateGroupings(
            (productInfo && productInfo.details.numberGroupings) || [this.options.genericCardPlaceholder.length],
            this.options.preventAutoFocus
        );
        delete this.options.preventAutoFocus;

        if (productInfo) {
            this.fieldControllers.exp.reconfigure({
                formatPattern: (productInfo.details.expiryFormat) || "MM/YY"
            });
            this.fieldControllers.cvc.setAttributes({
                maxLength: productInfo.details.securityCodeLength,
                placeholderText: this.options.cardNumberPlaceholderChar.repeat(productInfo.details.securityCodeLength)
            });

            const newFieldControllersBySide = { front: [], back: [] };
            const focusedBeforeLayoutChange = document.activeElement;

            for (const fieldName in this.fieldControllers) {
                const controller = this.fieldControllers[fieldName];
                let destinationFace = 'front';
                if (fieldName === 'cvc') { // Example layout rule
                    destinationFace = 'back';
                }

                if (destinationFace === 'front') {
                    this.domElements.frontFace.appendChild(controller.element);
                    newFieldControllersBySide.front.push(controller);
                } else {
                    this.domElements.backFace.appendChild(controller.element);
                    newFieldControllersBySide.back.push(controller);
                }
                controller.showVisual();
            }
            this.fieldControllersBySide = newFieldControllersBySide;

            setTimeout(() => {
                if (focusedBeforeLayoutChange && this.domElements.mainWrapper.contains(focusedBeforeLayoutChange)) {
                    focusedBeforeLayoutChange.focus();
                    if (focusedBeforeLayoutChange.setSelectionRange) {
                        focusedBeforeLayoutChange.setSelectionRange(focusedBeforeLayoutChange.value.length, focusedBeforeLayoutChange.value.length);
                    }
                }
            }, 10);

        } else {
            for (const fieldName in this.fieldControllers) {
                const controller = this.fieldControllers[fieldName];
                if (fieldName !== 'number') {
                    controller.hideVisual();
                }
            }
            this.fieldControllers.cvc.setAttributes({
                maxLength: 3,
                placeholderText: this.options.cardNumberPlaceholderChar.repeat(3)
            });
        }
        return productInfo;
    }

    displayValidityStatus() {
        for (const fieldName in this.fieldControllers) {
            const controller = this.fieldControllers[fieldName];
            this.assessFieldValidity(fieldName, controller.getValue());
        }
    }

    displayWidget() {
        this.displayProductFeatures(this.cardProductInfo);
        this.displayValidityStatus();
    }

    flipView() {
        const nextSide = this.currentViewSide === 'front' ? 'back' : 'front';
        this.emitCustomEvent('viewSideChanging', [nextSide]);
        this.currentViewSide = nextSide;
        this.domElements.cardBodyContainer.classList.toggle('flipped');

        const visibleSideFields = this.fieldControllersBySide[this.currentViewSide].map(ctrl => Array.from(ctrl.element.querySelectorAll('input, select, textarea'))).flat();
        if (visibleSideFields.length > 0) {
            visibleSideFields[0].focus();
        }

        this.faceNavigators.front.hideVisual();
        this.faceNavigators.back.hideVisual();
        this.assessFaceValidity('front');
        this.assessFaceValidity('back');

        this.emitCustomEvent('viewSideChanged', [nextSide]);
    }

    updateHiddenField(fieldIdentifier, newValue) {
        const hiddenField = this.domElements.hiddenFields[fieldIdentifier];
        if (!hiddenField) {
            this._writeLog(`Attempted to update unknown hidden field: ${fieldIdentifier}.`);
            return;
        }

        const valueToSet = String(newValue || "");
        this.emitCustomEvent('widgetValueChanging', [this]);

        if (hiddenField.tagName !== 'SELECT') {
            hiddenField.value = valueToSet;
        } else {
            const remapDataAttribute = `data-sc-${fieldIdentifier.toLowerCase()}`;
            let foundOption = false;
            Array.from(hiddenField.options).forEach(option => {
                if (valueToSet === (option.dataset.scType || option.value)) {
                    hiddenField.value = option.value;
                    foundOption = true;
                }
            });
            if (!foundOption) {
                hiddenField.value = valueToSet;
            }
        }
        hiddenField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    getHiddenFieldValue(fieldIdentifier) {
        const hiddenField = this.domElements.hiddenFields[fieldIdentifier];
        return hiddenField ? hiddenField.value : '';
    }
}

// --- Helper Classes for Input Controllers and Product Identification ---

class BaseFieldController {
    constructor(hostWidget, settings = {}) {
        this.host = hostWidget;
        this.element = document.createElement('div');
        this.element.className = 'card-field-wrapper';
        this.valueStore = '';
        this.fieldSettings = settings;

        this.element.addEventListener('input', this.handleInputEvent.bind(this));
        this.element.addEventListener('change', this.handleInputEvent.bind(this));
    }

    getValue() {
        return this.valueStore;
    }

    setValue(newValue) {
        this.valueStore = newValue;
        this.updateVisualDisplay();
    }

    updateVisualDisplay() { }

    handleInputEvent(evt) {
        this.emitCustomEvent('valueUpdated', this);
    }

    showVisual() {
        this.element.style.display = '';
    }

    hideVisual() {
        this.element.style.display = 'none';
    }

    emitCustomEvent(eventName, detail) {
        this.element.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
    }

    onCustomEvent(eventName, handler) {
        this.element.addEventListener(eventName, handler);
    }

    setAttributes(attrs) {
        for (const key in attrs) {
            if (key === 'className') {
                this.element.classList.add(...attrs[key].split(' '));
            } else if (key === 'placeholderText') {
                // Handled by specific input elements in subclasses
            } else {
                this.element.setAttribute(key, attrs[key]);
            }
        }
    }
}

class NumberInputController extends BaseFieldController {
    constructor(hostWidget, settings = {}) {
        super(hostWidget, settings);
        this.groupingLengths = settings.groupings || [16];
        this.inputSegments = [];
        this.element.className = 'card-field-wrapper number-field';

        this.updateGroupings(this.groupingLengths);
    }

    updateGroupings(newGroupings, suppressFocus = false) {
        this.groupingLengths = newGroupings;
        this.inputSegments.forEach(input => this.element.removeChild(input));
        this.inputSegments = [];

        this.groupingLengths.forEach((len, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = len;
            input.size = len;
            input.placeholder = this.host.options.cardNumberPlaceholderChar.repeat(len);
            input.className = 'card-number-segment';
            input.dataset.segmentIndex = index;

            input.addEventListener('input', this.handleSegmentInput.bind(this));
            input.addEventListener('keydown', this.handleSegmentKeydown.bind(this));
            this.element.appendChild(input);
            this.inputSegments.push(input);
        });

        this.updateValueFromSegments();
        this.updateVisualDisplay();

        if (!suppressFocus) {
            setTimeout(() => {
                const focusedElement = document.activeElement;
                if (focusedElement && this.element.contains(focusedElement)) {
                    const lastFocusedSegmentIndex = parseInt(focusedElement.dataset.segmentIndex || '0');
                    const lastFocusedSegment = this.inputSegments[lastFocusedSegmentIndex];
                    if (lastFocusedSegment) {
                        lastFocusedSegment.focus();
                        lastFocusedSegment.setSelectionRange(lastFocusedSegment.value.length, lastFocusedSegment.value.length);
                    }
                }
            }, 0);
        }
    }

    handleSegmentInput() {
        this.updateValueFromSegments();
        this.emitCustomEvent('valueUpdated', this);

        const currentActive = document.activeElement;
        if (this.element.contains(currentActive) && currentActive.value.length >= parseInt(currentActive.maxLength)) {
            const currentIndex = parseInt(currentActive.dataset.segmentIndex);
            if (currentIndex < this.inputSegments.length - 1) {
                this.inputSegments[currentIndex + 1].focus();
            }
        }
    }

    handleSegmentKeydown(evt) {
        const currentActive = document.activeElement;
        if (evt.key === 'Backspace' && currentActive.value.length === 0) {
            const currentIndex = parseInt(currentActive.dataset.segmentIndex);
            if (currentIndex > 0) {
                this.inputSegments[currentIndex - 1].focus();
                evt.preventDefault();
            }
        }
    }

    updateValueFromSegments() {
        this.valueStore = this.inputSegments.map(input => input.value).join('');
    }

    setValue(fullNumber) {
        super.setValue(fullNumber);
        let currentPos = 0;
        this.inputSegments.forEach((input, index) => {
            const segmentLength = parseInt(input.maxLength);
            const segmentValue = fullNumber.substring(currentPos, currentPos + segmentLength);
            input.value = segmentValue;
            currentPos += segmentLength;
        });
    }

    updateVisualDisplay() {
        this.inputSegments.forEach((input, index) => {
            if (!input.value) {
                input.placeholder = this.host.options.cardNumberPlaceholderChar.repeat(parseInt(input.maxLength));
            }
        });
    }
}

class ExpirationInputController extends BaseFieldController {
    constructor(hostWidget, settings = {}) {
        super(hostWidget, settings);
        this.element.className = 'card-field-wrapper expiry-field';
        this.monthInput = document.createElement('input');
        this.monthInput.type = 'text';
        this.monthInput.maxLength = 2;
        this.monthInput.placeholder = 'MM';
        this.monthInput.className = 'expiry-month';
        this.yearInput = document.createElement('input');
        this.yearInput.type = 'text';
        this.yearInput.maxLength = 2;
        this.yearInput.placeholder = 'YY';
        this.yearInput.className = 'expiry-year';
        this.separator = document.createElement('span');
        this.separator.textContent = '/';

        this.monthInput.addEventListener('input', this.handleExpirationInput.bind(this));
        this.yearInput.addEventListener('input', this.handleExpirationInput.bind(this));
        this.monthInput.addEventListener('keydown', this.handleMonthKeydown.bind(this));
        this.yearInput.addEventListener('keydown', this.handleYearKeydown.bind(this));

        this.element.appendChild(this.monthInput);
        this.element.appendChild(this.separator);
        this.element.appendChild(this.yearInput);

        this.formatPattern = settings.formatPattern || 'MM/YY';
    }

    handleExpirationInput() {
        const monthVal = parseInt(this.monthInput.value, 10);
        const yearVal = parseInt(this.yearInput.value, 10);
        let newDate = null;

        if (monthVal >= 1 && monthVal <= 12 && !isNaN(yearVal)) {
            const currentYear = PaymentCardWidget.creationMoment.getFullYear();
            const fullYear = yearVal < 100 ? (Math.floor(currentYear / 100) * 100 + yearVal) : yearVal;
            newDate = new Date(fullYear, monthVal - 1, 1);
        }
        this.valueStore = newDate;
        this.emitCustomEvent('valueUpdated', this);

        if (document.activeElement === this.monthInput && this.monthInput.value.length === 2 && parseInt(this.monthInput.value) >= 1 && parseInt(this.monthInput.value) <= 12) {
            this.yearInput.focus();
        }
    }

    handleMonthKeydown(evt) {
        if (evt.key === 'ArrowRight' && this.monthInput.selectionStart === this.monthInput.value.length) {
            this.yearInput.focus();
            evt.preventDefault();
        }
    }

    handleYearKeydown(evt) {
        if (evt.key === 'Backspace' && this.yearInput.value.length === 0) {
            this.monthInput.focus();
            evt.preventDefault();
        } else if (evt.key === 'ArrowLeft' && this.yearInput.selectionStart === 0) {
            this.monthInput.focus();
            evt.preventDefault();
        }
    }

    setValue(dateObject) {
        super.setValue(dateObject);
        if (dateObject instanceof Date) {
            this.monthInput.value = String(dateObject.getMonth() + 1).padStart(2, '0');
            this.yearInput.value = String(dateObject.getFullYear()).slice(-2);
        } else {
            this.monthInput.value = '';
            this.yearInput.value = '';
        }
    }

    reconfigure(newSettings) {
        if (newSettings.formatPattern) {
            this.formatPattern = newSettings.formatPattern;
        }
    }
}

class StandardTextInputController extends BaseFieldController {
    constructor(hostWidget, settings = {}) {
        super(hostWidget, settings);
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.className = settings.className || '';
        this.inputElement.placeholder = settings.placeholderText || '';
        if (settings.enforceMaxLength) {
            this.inputElement.maxLength = settings.placeholderText.length;
        }
        this.element.appendChild(this.inputElement);
        this.inputElement.addEventListener('input', this.handleInputEvent.bind(this));
    }

    getValue() {
        return this.inputElement.value;
    }

    setValue(newValue) {
        super.setValue(newValue);
        this.inputElement.value = newValue;
    }

    handleInputEvent() {
        this.valueStore = this.inputElement.value;
        this.emitCustomEvent('valueUpdated', this);
    }

    setAttributes(attrs) {
        super.setAttributes(attrs);
        for (const key in attrs) {
            if (key === 'className') {
                this.inputElement.classList.add(...attrs[key].split(' '));
            } else if (key === 'placeholderText') {
                this.inputElement.placeholder = attrs[key];
            } else if (key === 'maxLength') {
                this.inputElement.maxLength = attrs[key];
            } else {
                this.inputElement.setAttribute(key, attrs[key]);
            }
        }
    }
}

class FlipFacetController {
    constructor(hostWidget, facetId, settings = {}) {
        this.host = hostWidget;
        this.facetName = facetId;
        this.element = document.createElement('div');
        this.element.className = `facet-tab-control ${facetId}-tab`;
        this.messageDisplay = document.createElement('span');
        this.messageDisplay.className = 'tab-message';
        this.element.appendChild(this.messageDisplay);
        this.messages = settings.messages || {};

        this.element.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick() {
        this.host.flipView();
    }

    updateMessage(messageKey) {
        this.messageDisplay.innerHTML = this.messages[messageKey] || '';
    }

    showVisual() {
        this.element.style.display = '';
    }

    hideVisual() {
        this.element.style.display = 'none';
    }
}

// --- Product Identification and Validation (Mock) ---
const productIdentifier = {
    determineProduct: function(cardNumber) {
        const sanitizedNumber = cardNumber.replace(/\s/g, '');
        if (sanitizedNumber.startsWith('4')) {
            return {
                details: {
                    companyAlias: 'visa',
                    issuerAlias: 'visa',
                    numberGroupings: [4, 4, 4, 4],
                    expiryFormat: 'MM/YY',
                    securityCodeLength: 3,
                },
                fieldRules: {
                    number: {
                        isFilled: (val) => val.replace(/\s/g, '').length === 16,
                        isValid: (val) => val.replace(/\s/g, '').length === 16 && /^\d+$/.test(val.replace(/\s/g, '')),
                    },
                    exp: {
                        isFilled: (date) => date instanceof Date,
                        isValid: (date) => date instanceof Date && date > PaymentCardWidget.creationMoment,
                    },
                    name: {
                        isFilled: (val) => val.trim().length > 0,
                        isValid: (val) => val.trim().length > 0,
                    },
                    cvc: {
                        isFilled: (val) => val.length === 3,
                        isValid: (val) => val.length === 3 && /^\d+$/.test(val),
                    },
                }
            };
        } else if (sanitizedNumber.startsWith('5')) {
            return {
                details: {
                    companyAlias: 'mastercard',
                    issuerAlias: 'mastercard',
                    numberGroupings: [4, 4, 4, 4],
                    expiryFormat: 'MM/YY',
                    securityCodeLength: 3,
                },
                fieldRules: {
                    number: {
                        isFilled: (val) => val.replace(/\s/g, '').length === 16,
                        isValid: (val) => val.replace(/\s/g, '').length === 16 && /^\d+$/.test(val.replace(/\s/g, '')),
                    },
                    exp: {
                        isFilled: (date) => date instanceof Date,
                        isValid: (date) => date instanceof Date && date > PaymentCardWidget.creationMoment,
                    },
                    name: {
                        isFilled: (val) => val.trim().length > 0,
                        isValid: (val) => val.trim().length > 0,
                    },
                    cvc: {
                        isFilled: (val) => val.length === 3,
                        isValid: (val) => val.length === 3 && /^\d+$/.test(val),
                    },
                }
            };
        }
        return {
            details: {
                companyAlias: null,
                issuerAlias: null,
                numberGroupings: [16],
                expiryFormat: 'MM/YY',
                securityCodeLength: 3,
            },
            fieldRules: {
                number: {
                    isFilled: (val) => val.replace(/\s/g, '').length > 0,
                    isValid: (val) => val.replace(/\s/g, '').length >= 13 && val.replace(/\s/g, '').length <= 19 && /^\d+$/.test(val.replace(/\s/g, '')),
                },
                exp: {
                    isFilled: (date) => date instanceof Date,
                    isValid: (date) => date instanceof Date && date > PaymentCardWidget.creationMoment,
                },
                name: {
                    isFilled: (val) => val.trim().length > 0,
                    isValid: (val) => val.trim().length > 0,
                },
                cvc: {
                    isFilled: (val) => val.length >= 3 && val.length <= 4,
                    isValid: (val) => val.length >= 3 && val.length <= 4 && /^\d+$/.test(val),
                },
            }
        };
    }
};