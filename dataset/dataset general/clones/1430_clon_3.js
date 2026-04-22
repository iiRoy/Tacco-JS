(function() {
  // Polyfills and utility references, ensuring compatibility and modern syntax.
  const _arraySlice = Array.prototype.slice;
  const _arrayIncludes = Array.prototype.includes || function(searchElement, fromIndex) {
    let k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    const o = Object(this);
    const len = o.length >>> 0;
    if (len === 0) {
      return false;
    }
    let n = fromIndex | 0;
    if (n >= len) {
      return false;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (o[k] === searchElement) {
        return true;
      }
      k++;
    }
    return false;
  };

  // Global jQuery reference, aliased for internal use.
  let domProcessor = window.jQuery;

  // Internal constants for class names and events to improve maintainability.
  const _componentConsts = {
    CSS_NO_JS: 'no-js',
    CSS_BASE_CLASS: 'card-input-wrapper',
    CSS_INIT_CLASS: 'is-ready',
    CSS_FACE_FRONT: 'card-face-front',
    CSS_FACE_BACK: 'card-face-back',
    CSS_CARD_BODY: 'card-display-area',
    CSS_FIELD_FILLED: 'has-value',
    CSS_FIELD_VALID: 'is-valid',
    CSS_FIELD_INVALID: 'is-invalid',
    CSS_PRODUCT_PREFIX: 'card-brand-',
    CSS_ISSUER_PREFIX: 'card-issuer-',
    CSS_UNACCEPTED: 'unsupported-type',
    EVENT_CHANGE: 'fieldChanged.cardInput',
    EVENT_VALUE_CHANGE: 'valueModified.cardInput',
    EVENT_PRODUCT_WILL_CHANGE: 'typeUpdateStart.cardInput',
    EVENT_PRODUCT_DID_CHANGE: 'typeUpdateComplete.cardInput',
    EVENT_FIELD_FILL_WILL_CHANGE: 'fieldFillStateStart.cardInput',
    EVENT_FIELD_FILL_DID_CHANGE: 'fieldFillStateEnd.cardInput',
    EVENT_FIELD_VALID_WILL_CHANGE: 'fieldValidationStateStart.cardInput',
    EVENT_FIELD_VALID_DID_CHANGE: 'fieldValidationStateEnd.cardInput',
    EVENT_FACE_FILL_WILL_CHANGE: 'faceFillStateStart.cardInput',
    EVENT_FACE_FILL_DID_CHANGE: 'faceFillStateEnd.cardInput',
    EVENT_FACE_VALID_WILL_CHANGE: 'faceValidationStateStart.cardInput',
    EVENT_FACE_VALID_DID_CHANGE: 'faceValidationStateEnd.cardInput',
    EVENT_FACE_WILL_BECOME_VISIBLE: 'faceVisibilityStart.cardInput',
    EVENT_FACE_DID_BECOME_VISIBLE: 'faceVisibilityEnd.cardInput'
  };

  /**
   * Represents a sophisticated payment card input component.
   * This class orchestrates various sub-components to provide a dynamic,
   * visually appealing, and user-friendly credit/debit card entry experience.
   * @class
   * @param {HTMLElement|jQuery} containerElement - The DOM element to transform into the card input.
   * @param {Object} [initialSettings={}] - Configuration options for the component.
   */
  const PaymentInputWidget = (function() {
    // Static property tracking the component's internal clock.
    PaymentInputWidget.componentCreationTime = new Date();

    // Placeholder for external view constructors. These would typically be defined elsewhere.
    // Assuming they are available via `this` context or a global `_componentFactories`.
    let _componentFactories = {
      CardSideFlipperControl: function() { /* Dummy for compilation */ },
      SegmentedNumberDisplay: function() { /* Dummy for compilation */ },
      ExpiryDateInput: function() { /* Dummy for compilation */ },
      GenericTextEntry: function() { /* Dummy for compilation */ }
    };
    // Placeholder for external CardProduct logic.
    let CardTypeIdentifier = {
      firstMatchingNumber: function() { /* Dummy for compilation */ }
    };

    // The core constructor for the PaymentInputWidget.
    function PaymentInputWidget(containerElement, initialSettings) {
      // Default empty object for settings if not provided.
      if (initialSettings == null) {
        initialSettings = {};
      }

      // References to key DOM elements.
      this.domReferences = {
        mainWrapper: domProcessor(containerElement),
        hiddenFormFields: {}
      };

      // Collection of input components, keyed by field name (e.g., 'number', 'name').
      this.fieldComponents = {};
      // Structure mapping input components to their respective card faces (front/back).
      this.componentLayoutBySide = {
        front: [],
        back: []
      };
      // Controls for flipping the card display.
      this.sideFlipperControls = {};
      // Internal state variables for tracking component status.
      this.internalStatus = {};
      // The currently recognized card product.
      this.currentCardType = null;
      // The side of the card currently visible to the user.
      this.activeSide = 'front';

      // Define default configuration options.
      const defaultConfiguration = {
        enableDebugLogging: false,
        suppressInitialFocus: false,
        permittedCardBrands: null,
        cardNumberSegmentChar: 'X',
        defaultNumberPlaceholder: "XXXX XXXX XXXX XXXX",
        typeFieldSelector: '[name="cc_type"]',
        numberFieldSelector: '[name="cc_number"]',
        expMonthFieldSelector: '[name="cc_exp_month"]',
        expYearFieldSelector: '[name="cc_exp_year"]',
        nameFieldSelector: '[name="cc_name"]',
        cvcFieldSelector: '[name="cc_cvc"]',
        initialInputValues: {},
        fieldValidationStatus: {},
        stringResources: {
          flipPromptHiddenSide: "<strong>Tap here</strong> to <br>complete the other side.",
          errorWarningHiddenSide: "Issue detected on the reverse side.",
          reminderFlipCard: "Missed a field?<br> Turn the card over."
        }
      };
      // Merge defaults with provided settings.
      this.configuration = Object.assign({}, defaultConfiguration, initialSettings);

      // Initialize the component's structure and behavior.
      this._prepareUIStructure();
      this._attachInteractionHandlers();
      this._loadInitialConfiguration();
      this.displayComponent();
    }

    /**
     * Logs messages to the console if debugging is enabled.
     * @param {...any} messageParts - Parts of the message to log.
     * @private
     */
    PaymentInputWidget.prototype._debugOutput = function(...messageParts) {
      if (this.configuration.enableDebugLogging && typeof console !== 'undefined' && console.log) {
        console.log(`[PaymentWidget @ ${new Date().toLocaleTimeString()}]`, ...messageParts);
      }
    };

    /**
     * Emits a custom event on the main container element.
     * @param {string} eventName - The name of the event to trigger.
     * @param {Array<any>} eventArgs - Arguments to pass with the event.
     * @returns {jQuery} The main wrapper element.
     */
    PaymentInputWidget.prototype.emitEvent = function(eventName, eventArgs) {
      return this.domReferences.mainWrapper.trigger(eventName, eventArgs);
    };

    /**
     * Binds an event handler to the main container element.
     * @param {string} eventName - The name of the event(s) to bind.
     * @param {Function} handler - The function to execute when the event is triggered.
     * @returns {jQuery} The main wrapper element.
     */
    PaymentInputWidget.prototype.onEvent = function(eventName, handler) {
      return this.domReferences.mainWrapper.on(eventName, handler);
    };

    /**
     * Transforms the raw DOM structure into the styled card component.
     * This involves hiding original inputs and building the visual card faces.
     * @private
     * @returns {jQuery} The main wrapper element after transformation.
     */
    PaymentInputWidget.prototype._prepareUIStructure = function() {
      const { mainWrapper } = this.domReferences;

      mainWrapper.removeClass(_componentConsts.CSS_NO_JS);
      mainWrapper.addClass(`${_componentConsts.CSS_BASE_CLASS} ${_componentConsts.CSS_INIT_CLASS}`);

      // Hide original inputs and store references.
      mainWrapper.children(':not(input,select,textarea)').remove(); // Clean up extraneous elements
      mainWrapper.children('input,select,textarea').each((idx, el) => {
        const jqEl = domProcessor(el);
        jqEl.hide();
        // Map field selectors to their jQuery elements
        if (jqEl.is(this.configuration.typeFieldSelector)) this.domReferences.hiddenFormFields.type = jqEl;
        else if (jqEl.is(this.configuration.numberFieldSelector)) this.domReferences.hiddenFormFields.number = jqEl;
        else if (jqEl.is(this.configuration.expMonthFieldSelector)) this.domReferences.hiddenFormFields.expMonth = jqEl;
        else if (jqEl.is(this.configuration.expYearFieldSelector)) this.domReferences.hiddenFormFields.expYear = jqEl;
        else if (jqEl.is(this.configuration.nameFieldSelector)) this.domReferences.hiddenFormFields.name = jqEl;
        else if (jqEl.is(this.configuration.cvcFieldSelector)) this.domReferences.hiddenFormFields.cvc = jqEl;
      });

      // Create visual card faces and body.
      this.domReferences.frontPanel = domProcessor('<div>').attr({ "class": _componentConsts.CSS_FACE_FRONT });
      this.domReferences.rearPanel = domProcessor('<div>').attr({ "class": _componentConsts.CSS_FACE_BACK });
      this.domReferences.cardDisplayArea = domProcessor('<div>').attr({ "class": _componentConsts.CSS_CARD_BODY });

      this.domReferences.frontPanel.appendTo(this.domReferences.cardDisplayArea);
      this.domReferences.rearPanel.appendTo(this.domReferences.cardDisplayArea);
      this.domReferences.cardDisplayArea.appendTo(mainWrapper);

      // Initialize flip controls for each side.
      this.sideFlipperControls.front = new _componentFactories.CardSideFlipperControl(this, 'front', {
        strings: this.configuration.stringResources
      });
      this.sideFlipperControls.back = new _componentFactories.CardSideFlipperControl(this, 'back', {
        strings: this.configuration.stringResources
      });

      // Add flip controls to their respective card faces.
      this.domReferences.frontPanel.prepend(this.sideFlipperControls.front.el);
      this.domReferences.rearPanel.prepend(this.sideFlipperControls.back.el);

      // Initially hide the flip controls.
      this.sideFlipperControls.front.hide();
      this.sideFlipperControls.back.hide();

      // Initialize visual input components.
      this.fieldComponents = {
        number: new _componentFactories.SegmentedNumberDisplay({
          // Placeholder for any specific options for the number field
        }),
        expiry: new _componentFactories.ExpiryDateInput({
          currentDate: PaymentInputWidget.componentCreationTime // Use static property
        }),
        cardholderName: new _componentFactories.GenericTextEntry({
          "class": "cardholder-name-field",
          placeholder: "CARDHOLDER NAME"
        }),
        securityCode: new _componentFactories.GenericTextEntry({
          "class": "security-code-field",
          placeholder: "CVV",
          requireMaxLength: true
        })
      };

      // Append visual input components to their default faces.
      this.fieldComponents.number.el.addClass('card-number-display');
      this.fieldComponents.number.el.appendTo(this.domReferences.frontPanel);
      this.fieldComponents.cardholderName.el.appendTo(this.domReferences.frontPanel);
      this.fieldComponents.expiry.el.addClass('card-expiry-display');
      this.fieldComponents.expiry.el.appendTo(this.domReferences.frontPanel);
      this.fieldComponents.securityCode.el.appendTo(this.domReferences.rearPanel);

      return mainWrapper;
    };

    /**
     * Extracts initial values and validation states from the hidden DOM fields.
     * This method populates the component's state based on existing form data.
     * @private
     */
    PaymentInputWidget.prototype._loadInitialConfiguration = function() {
      const { hiddenFormFields, configuration } = this.domReferences;

      // Process each hidden field for initial values and validation.
      Object.keys(hiddenFormFields).forEach(fieldKey => {
        const fieldElement = hiddenFormFields[fieldKey];

        // Set initial value from DOM if not explicitly provided in options.
        if (!configuration.initialInputValues.hasOwnProperty(fieldKey) || configuration.initialInputValues[fieldKey] == null) {
          configuration.initialInputValues[fieldKey] = fieldElement.val();
        } else {
          // Ensure value is a string and update the underlying field.
          configuration.initialInputValues[fieldKey] = String(configuration.initialInputValues[fieldKey]);
          this._syncHiddenInputValue(fieldKey, configuration.initialInputValues[fieldKey]);
        }

        // Check if any field has an initial value.
        if (String(configuration.initialInputValues[fieldKey]).length > 0) {
          this.internalStatus.hasInitialContent = true;
        }

        // Set initial validation status.
        if (!configuration.fieldValidationStatus.hasOwnProperty(fieldKey) || configuration.fieldValidationStatus[fieldKey] == null) {
          configuration.fieldValidationStatus[fieldKey] = !fieldElement.hasClass(_componentConsts.CSS_FIELD_INVALID);
        }
      });

      // Populate permitted card brands from the 'type' select options if not provided.
      if (configuration.permittedCardBrands == null) {
        configuration.permittedCardBrands = [];
        if (this.domReferences.hiddenFormFields.type && this.domReferences.hiddenFormFields.type.is('select')) {
          this.domReferences.hiddenFormFields.type.find('option').each((i, el) => {
            const optionEl = domProcessor(el);
            const brandIdentifier = optionEl.attr('data-sc-type') || optionEl.attr('value');
            if (brandIdentifier) {
              configuration.permittedCardBrands.push(brandIdentifier);
            }
          });
        }
      }

      // Apply initial values to visual components.
      if (String(configuration.initialInputValues.number).length > 0) {
        this.setValueForField('number', configuration.initialInputValues.number);
      }
      if (String(configuration.initialInputValues.cardholderName).length > 0) {
        this.setValueForField('cardholderName', configuration.initialInputValues.cardholderName);
      }
      if (String(configuration.initialInputValues.securityCode).length > 0) {
        this.setValueForField('securityCode', configuration.initialInputValues.securityCode);
      }
      if (String(configuration.initialInputValues.expYear).length > 0 && String(configuration.initialInputValues.expMonth).length > 0) {
        const yearVal = parseInt(configuration.initialInputValues.expYear, 10);
        const monthVal = parseInt(configuration.initialInputValues.expMonth, 10);
        if (!isNaN(yearVal) && !isNaN(monthVal)) {
          const initialExpiryDate = new Date(yearVal, monthVal - 1, 1);
          this.setValueForField('expiry', initialExpiryDate);
        }
      }

      // Update validation status for both faces based on initial data.
      this._refreshSideValidationStatus('front');
      this._refreshSideValidationStatus('back');
    };

    /**
     * Sets a new value for a specific visual input field and triggers a change event.
     * @param {string} inputKey - The identifier of the input field (e.g., 'number', 'expiry').
     * @param {any} updatedValue - The new value to set.
     */
    PaymentInputWidget.prototype.setValueForField = function(inputKey, updatedValue) {
      if (this.fieldComponents[inputKey] && typeof this.fieldComponents[inputKey].setValue === 'function') {
        this.fieldComponents[inputKey].setValue(updatedValue);
        this.fieldComponents[inputKey].emitEvent(_componentConsts.EVENT_VALUE_CHANGE, [this.fieldComponents[inputKey]]);
      } else {
        this._debugOutput(`Warning: setValueForField called for unknown or non-settable field: ${inputKey}`);
      }
    };

    /**
     * Binds all necessary interaction events to the component's elements.
     * This includes changes in underlying fields and visual input components.
     * @private
     */
    PaymentInputWidget.prototype._attachInteractionHandlers = function() {
      const _this = this;

      // Handler for underlying number field changes.
      this.domReferences.hiddenFormFields.number.on("change", function() {
        _this.fieldComponents.number.setValue(_this.domReferences.hiddenFormFields.number.val());
        _this.displayComponent();
      });

      // Handler for underlying expiration fields (month/year) changes.
      const _onExpiryFieldChange = function() {
        const month = parseInt(_this.domReferences.hiddenFormFields.expMonth.val(), 10);
        const year = parseInt(_this.domReferences.hiddenFormFields.expYear.val(), 10);
        if (!isNaN(month) && !isNaN(year)) {
          _this.fieldComponents.expiry.setValue(new Date(year, month - 1));
        } else {
          _this.fieldComponents.expiry.setValue(null); // Clear if invalid
        }
        _this.displayComponent();
      };
      this.domReferences.hiddenFormFields.expMonth.on("change", _onExpiryFieldChange);
      this.domReferences.hiddenFormFields.expYear.on("change", _onExpiryFieldChange);

      // Handler for underlying name field changes.
      this.domReferences.hiddenFormFields.name.on("change", function() {
        _this.fieldComponents.cardholderName.setValue(_this.domReferences.hiddenFormFields.name.val());
        _this.displayComponent();
      });

      // Handler for underlying CVC field changes.
      this.domReferences.hiddenFormFields.cvc.on("change", function() {
        _this.fieldComponents.securityCode.setValue(_this.domReferences.hiddenFormFields.cvc.val());
        _this.displayComponent();
      });

      // --- Visual Input Component Event Handlers ---

      // Number input changes: detect card type, update product display.
      this.fieldComponents.number.on("keyup " + _componentConsts.EVENT_VALUE_CHANGE, function(event, inputComponent) {
        const enteredCardNumber = inputComponent.getValue();
        _this._syncHiddenInputValue('number', enteredCardNumber);
        _this._revalidateField('number', enteredCardNumber);

        const identifiedCardProduct = CardTypeIdentifier.firstMatchingNumber(enteredCardNumber);
        const currentProductShortname = _this.currentCardType ? _this.currentCardType.attrs.companyShortname : null;
        const newProductShortname = identifiedCardProduct ? identifiedCardProduct.attrs.companyShortname : null;

        // Only proceed if the identified card product has changed.
        if (_this.currentCardType === null || (identifiedCardProduct === null && _this.currentCardType !== null) || (identifiedCardProduct && !identifiedCardProduct.eql(_this.currentCardType))) {
          _this._debugOutput("Card type change detected:", _this.currentCardType, "=>", identifiedCardProduct);
          _this.emitEvent(_componentConsts.EVENT_PRODUCT_WILL_CHANGE, [_this, _this.currentCardType, identifiedCardProduct]);

          let priorCardType = _this.currentCardType;

          if (identifiedCardProduct && _arrayIncludes.call(_this.configuration.permittedCardBrands, newProductShortname)) {
            _this.domReferences.mainWrapper.removeClass(_componentConsts.CSS_UNACCEPTED);
            _this._updateProductDisplay(identifiedCardProduct);
            _this.currentCardType = identifiedCardProduct;
          } else if (identifiedCardProduct) { // Identified but not accepted
            _this.domReferences.mainWrapper.addClass(_componentConsts.CSS_UNACCEPTED);
            _this._updateProductDisplay(null); // Revert to generic display
            _this.currentCardType = null;
          } else { // No product identified
            _this.domReferences.mainWrapper.removeClass(_componentConsts.CSS_UNACCEPTED);
            _this._updateProductDisplay(null); // Revert to generic display
            _this.currentCardType = null;
          }
          _this.emitEvent(_componentConsts.EVENT_PRODUCT_DID_CHANGE, [_this, priorCardType, _this.currentCardType]);
        }
      });

      // Expiry input changes: update underlying fields and revalidate.
      this.fieldComponents.expiry.on("keyup " + _componentConsts.EVENT_VALUE_CHANGE, function(event, inputComponent) {
        const newDate = inputComponent.getValue();
        _this._revalidateField('expiry', newDate);
        if (newDate instanceof Date && !isNaN(newDate)) {
          _this._syncHiddenInputValue('expMonth', newDate.getMonth() + 1);
          _this._syncHiddenInputValue('expYear', newDate.getFullYear());
        } else {
          _this._syncHiddenInputValue('expMonth', '');
          _this._syncHiddenInputValue('expYear', '');
        }
      });

      // Cardholder name input changes: update underlying field and revalidate.
      this.fieldComponents.cardholderName.on("keyup " + _componentConsts.EVENT_VALUE_CHANGE, function(event, inputComponent) {
        const value = inputComponent.getValue();
        _this._syncHiddenInputValue('name', value);
        _this._revalidateField('cardholderName', value);
      });

      // Security code input changes: update underlying field and revalidate.
      this.fieldComponents.securityCode.on("keyup " + _componentConsts.EVENT_VALUE_CHANGE, function(event, inputComponent) {
        const value = inputComponent.getValue();
        _this._syncHiddenInputValue('cvc', value);
        _this._revalidateField('securityCode', value);
      });

      // Global delegate for tab key navigation within the card fields.
      this.domReferences.mainWrapper.on("keydown", "input", this._processTabNavigation.bind(this));

      // Click handlers for the flip controls.
      this.sideFlipperControls.front.el.on("click", () => this.toggleCardSide());
      this.sideFlipperControls.back.el.on("click", () => this.toggleCardSide());
    };

    /**
     * Handles tab key presses to enable flipping the card when navigating between faces.
     * @param {Event} eventObject - The keyboard event.
     * @private
     */
    PaymentInputWidget.prototype._processTabNavigation = function(eventObject) {
      if (eventObject.which !== 9) { // Not a tab key
        return true;
      }

      const currentFocusedElement = domProcessor(eventObject.currentTarget);
      const isShiftKeyPressed = eventObject.shiftKey;

      const currentVisibleFace = this.activeSide;
      const otherFace = currentVisibleFace === 'front' ? 'back' : 'front';

      const currentFaceInputs = this.domReferences[`${currentVisibleFace}Panel`].find('input:visible');
      const otherFaceInputs = this.domReferences[`${otherFace}Panel`].find('input:visible');

      const currentIndex = currentFaceInputs.index(currentFocusedElement);

      if (currentVisibleFace === 'front' && !isShiftKeyPressed) {
        // Moving forward from the last field on the front face.
        if (currentIndex === currentFaceInputs.length - 1 && otherFaceInputs.length > 0) {
          this.toggleCardSide();
          otherFaceInputs.first().focus();
          eventObject.preventDefault();
        }
      } else if (currentVisibleFace === 'back' && isShiftKeyPressed) {
        // Moving backward from the first field on the back face.
        if (currentIndex === 0 && otherFaceInputs.length > 0) {
          this.toggleCardSide();
          otherFaceInputs.last().focus();
          eventObject.preventDefault();
        }
      }
      return true;
    };

    /**
     * Revalidates a specific field based on its new value and the current card product.
     * Updates field-specific UI classes and emits events.
     * @param {string} fieldKey - The key of the field to revalidate (e.g., 'number', 'expiry').
     * @param {any} newValue - The new value of the field.
     * @private
     * @returns {boolean} True if validation was processed, false if no product is selected.
     */
    PaymentInputWidget.prototype._revalidateField = function(fieldKey, newValue) {
      if (this.currentCardType == null) {
        return false; // Cannot validate without a recognized card product.
      }

      // Map fieldKey to product attribute name for validation methods.
      const productFieldKey = {
        number: 'number',
        expiry: 'expiration',
        cardholderName: 'name',
        securityCode: 'cvc'
      }[fieldKey];

      if (!productFieldKey || !this.currentCardType[productFieldKey]) {
        this._debugOutput(`Warning: No validation logic found for field: ${fieldKey}`);
        return false;
      }

      const fieldComponent = this.fieldComponents[fieldKey];
      const fieldValidationLogic = this.currentCardType[productFieldKey];

      const hasContent = fieldValidationLogic.isFilled(newValue);
      const passesValidation = fieldValidationLogic.isValid(newValue);

      const previousFillState = this.internalStatus[`${fieldKey}HasContent`];
      const previousValidationState = this.internalStatus[`${fieldKey}IsValid`];

      const fillStateChanged = previousFillState !== hasContent;
      const validationStateChanged = previousValidationState !== passesValidation;

      if (fillStateChanged) {
        this.emitEvent(_componentConsts.EVENT_FIELD_FILL_WILL_CHANGE, [this, fieldKey, hasContent]);
        fieldComponent.el.toggleClass(_componentConsts.CSS_FIELD_FILLED, hasContent);
        this.internalStatus[`${fieldKey}HasContent`] = hasContent;
        this.emitEvent(_componentConsts.EVENT_FIELD_FILL_DID_CHANGE, [this, fieldKey, hasContent]);
      }

      if (validationStateChanged) {
        this.emitEvent(_componentConsts.EVENT_FIELD_VALID_WILL_CHANGE, [this, fieldKey, passesValidation]);
        fieldComponent.el.toggleClass(_componentConsts.CSS_FIELD_VALID, passesValidation);
        fieldComponent.el.toggleClass(_componentConsts.CSS_FIELD_INVALID, !passesValidation);
        this.internalStatus[`${fieldKey}IsValid`] = passesValidation;
        this.emitEvent(_componentConsts.EVENT_FIELD_VALID_DID_CHANGE, [this, fieldKey, passesValidation]);
      }

      // Trigger a re-evaluation of the entire card face's validation status.
      this._refreshSideValidationStatus(this.activeSide);
      return true;
    };

    /**
     * Updates the validation and fill status for a given card face (front or back).
     * @param {string} faceIdentifier - 'front' or 'back'.
     * @private
     */
    PaymentInputWidget.prototype._refreshSideValidationStatus = function(faceIdentifier) {
      const componentsOnFace = this.componentLayoutBySide[faceIdentifier];

      // Check if all fields on this face are filled.
      const allFieldsOnFaceFilled = componentsOnFace.every(component => component.el.hasClass(_componentConsts.CSS_FIELD_FILLED));
      // Check if all fields on this face are valid.
      const allFieldsOnFaceValid = componentsOnFace.every(component => component.el.hasClass(_componentConsts.CSS_FIELD_VALID));

      // Determine the overall filled and valid state for the face.
      const isFaceFilled = (allFieldsOnFaceFilled && (this.currentCardType != null)) || (this.internalStatus.hasInitialContent || false);
      const isFaceValid = allFieldsOnFaceValid && (this.currentCardType != null);

      const previousFaceFillState = this.internalStatus[`${faceIdentifier}Filled`];
      const previousFaceValidationState = this.internalStatus[`${faceIdentifier}Valid`];

      const fillStateChanged = previousFaceFillState !== isFaceFilled;
      const validationStateChanged = previousFaceValidationState !== isFaceValid;

      if (fillStateChanged) {
        this.emitEvent(_componentConsts.EVENT_FACE_FILL_WILL_CHANGE, [this, faceIdentifier, isFaceFilled]);
        this.domReferences[`${faceIdentifier}Panel`].toggleClass(_componentConsts.CSS_FIELD_FILLED, isFaceFilled);
        this.internalStatus[`${faceIdentifier}Filled`] = isFaceFilled;
        this.emitEvent(_componentConsts.EVENT_FACE_FILL_DID_CHANGE, [this, faceIdentifier, isFaceFilled]);
      }

      if (validationStateChanged) {
        this.emitEvent(_componentConsts.EVENT_FACE_VALID_WILL_CHANGE, [this, faceIdentifier, isFaceValid]);
        this.domReferences[`${faceIdentifier}Panel`].toggleClass(_componentConsts.CSS_FIELD_VALID, isFaceValid);
        this.domReferences[`${faceIdentifier}Panel`].toggleClass(_componentConsts.CSS_FIELD_INVALID, !isFaceValid);
        this.internalStatus[`${faceIdentifier}Valid`] = isFaceValid;
        this.emitEvent(_componentConsts.EVENT_FACE_VALID_DID_CHANGE, [this, faceIdentifier, isFaceValid]);
      }
    };

    /**
     * Resets the card display to a generic state, removing any product-specific styles.
     * @private
     */
    PaymentInputWidget.prototype._resetCardDisplay = function() {
      this._debugOutput("[_resetCardDisplay] Reverting to generic card display.");
      const { mainWrapper } = this.domReferences;

      // Remove all product/issuer specific classes.
      mainWrapper.removeClass((index, css) => (css.match(/\b(card-brand|card-issuer)-\S+/g) || []).join(' '));
      mainWrapper.removeClass(_componentConsts.CSS_UNACCEPTED);

      // Hide all fields except the number field.
      Object.keys(this.fieldComponents).forEach(fieldKey => {
        const component = this.fieldComponents[fieldKey];
        if (fieldKey !== 'number') {
          component.hide();
        }
      });

      // Reset number field grouping to generic.
      this.fieldComponents.number.setGroupings([this.configuration.defaultNumberPlaceholder.length], this.configuration.suppressInitialFocus);

      // Clear the underlying type field.
      this._syncHiddenInputValue('type', null);
    };

    /**
     * Applies rendering changes necessary for the identified card product.
     * A null value for `cardDetails` will revert to a generic display.
     * @param {Object|null} cardDetails - The detected card product object, or null.
     * @private
     */
    PaymentInputWidget.prototype._updateProductDisplay = function(cardDetails) {
      this._debugOutput("[_updateProductDisplay]", "Updating display for product:", cardDetails);
      const { mainWrapper } = this.domReferences;

      // If no card product is provided, reset to generic display.
      if (cardDetails == null) {
        this._resetCardDisplay();
        return;
      }

      // Apply product-specific CSS classes.
      const brandIdentifier = cardDetails.attrs.companyShortname;
      const issuerCode = cardDetails.attrs.issuerShortname;

      mainWrapper.removeClass((index, css) => (css.match(/\b(card-brand|card-issuer)-\S+/g) || []).join(' '));
      if (brandIdentifier) {
        mainWrapper.addClass(`${_componentConsts.CSS_PRODUCT_PREFIX}${brandIdentifier}`);
      }
      if (issuerCode) {
        mainWrapper.addClass(`${_componentConsts.CSS_ISSUER_PREFIX}${issuerCode}`);
      }

      // Update underlying type field.
      this._syncHiddenInputValue('type', brandIdentifier || null);

      // Update number input grouping.
      const numberFormat = cardDetails.attrs.cardNumberGrouping || [this.configuration.defaultNumberPlaceholder.length];
      this.fieldComponents.number.setGroupings(numberFormat, this.configuration.suppressInitialFocus);

      // Ensure suppressInitialFocus is reset after use.
      delete this.configuration.suppressInitialFocus;

      // Reconfigure expiration input pattern.
      this.fieldComponents.expiry.reconfigure({
        pattern: cardDetails.attrs.expirationFormat || "MM/YY"
      });

      // Update security code field attributes.
      const cvcLength = cardDetails.attrs.cvcLength;
      this.fieldComponents.securityCode.attr({
        maxlength: cvcLength,
        placeholder: new Array(cvcLength + 1).join(this.configuration.cardNumberSegmentChar)
      });

      // Re-layout input components based on card product's field placement.
      this.componentLayoutBySide = { front: [], back: [] }; // Reset layout
      const focusedElement = domProcessor('input:focus'); // Preserve focus

      Object.entries(cardDetails.attrs.layout).forEach(([fieldKey, targetSide]) => {
        const component = this.fieldComponents[fieldKey];
        if (component) {
          const componentElement = component.el.detach();
          const targetPanel = this.domReferences[`${targetSide}Panel`];
          componentElement.appendTo(targetPanel);
          this.componentLayoutBySide[targetSide].push(component);
          component.show(); // Ensure component is visible
        } else {
          this._debugOutput(`Warning: Layout specified for unknown field: ${fieldKey}`);
        }
      });

      // Restore focus after DOM manipulation.
      if (focusedElement.length > 0) {
        setTimeout(() => {
          const fieldEl = focusedElement.first();
          const fieldLength = fieldEl[0].maxLength;
          fieldEl.focus();
          if (fieldEl[0].setSelectionRange) {
            fieldEl[0].setSelectionRange(fieldLength, fieldLength);
          }
        }, 10);
      }
    };

    /**
     * Triggers a full validation pass for all visual input components.
     * @private
     */
    PaymentInputWidget.prototype._initiateValidationPass = function() {
      Object.keys(this.fieldComponents).forEach(fieldKey => {
        const component = this.fieldComponents[fieldKey];
        this._revalidateField(fieldKey, component.getValue());
      });
    };

    /**
     * Renders the entire payment input widget, applying product-specific styles and validation.
     */
    PaymentInputWidget.prototype.displayComponent = function() {
      this._updateProductDisplay(this.currentCardType);
      this._initiateValidationPass();
    };

    /**
     * Flips the card display between its front and back faces.
     */
    PaymentInputWidget.prototype.toggleCardSide = function() {
      const nextSide = this.activeSide === 'front' ? 'back' : 'front';

      this.emitEvent(_componentConsts.EVENT_FACE_WILL_BECOME_VISIBLE, [this, nextSide]);
      this.activeSide = nextSide;
      this.domReferences.cardDisplayArea.toggleClass('flip'); // Assumes 'flip' class handles CSS transition.

      // Attempt to focus the first non-filled input on the newly visible side.
      const currentDisplayedSidePanel = this.domReferences[`${this.activeSide}Panel`];
      currentDisplayedSidePanel.find('.cc-field').not(`.${_componentConsts.CSS_FIELD_FILLED}`).find('input').first().focus();

      this.emitEvent(_componentConsts.EVENT_FACE_DID_BECOME_VISIBLE, [this, nextSide]);
    };

    /**
     * Synchronizes a visual field's value with its corresponding hidden form field.
     * @param {string} fieldKey - The key of the field (e.g., 'number', 'expMonth').
     * @param {string|number|null} newValue - The value to set.
     * @private
     */
    PaymentInputWidget.prototype._syncHiddenInputValue = function(fieldKey, newValue) {
      const hiddenFieldElement = this.domReferences.hiddenFormFields[fieldKey];
      const stringifiedValue = (newValue === null || newValue === undefined) ? "" : String(newValue);

      if (!hiddenFieldElement || hiddenFieldElement.length === 0) {
        this._debugOutput(`Error: Attempted to sync value for unknown hidden field: ${fieldKey}.`);
        return;
      }

      this.emitEvent(_componentConsts.EVENT_CHANGE, [this]);

      if (!hiddenFieldElement.is('select')) {
        hiddenFieldElement.val(stringifiedValue);
      } else {
        // For select elements, find the option that matches the value or a data attribute.
        const dataAttributeKey = `data-sc-${fieldKey.toLowerCase()}`;
        let matched = false;
        hiddenFieldElement.find('option').each((i, el) => {
          const optionEl = domProcessor(el);
          if (stringifiedValue === (optionEl.attr(dataAttributeKey) || optionEl.attr('value'))) {
            hiddenFieldElement.val(optionEl.attr('value'));
            matched = true;
            return false; // Break from each loop
          }
        });
        if (!matched) {
          hiddenFieldElement.val(''); // Clear if no matching option found
        }
      }
    };

    return PaymentInputWidget;
  })();

  // Expose the PaymentInputWidget globally, similar to how Skeuocard was exposed.
  window.PaymentInputWidget = PaymentInputWidget;

  // Assume external dependencies are available or injected.
  // For this clone, we'll assign dummy implementations or assume they're set up externally.
  // In a real scenario, these would be properly imported/defined.
  if (typeof window.PaymentInputWidget.prototype.CardSideFlipperControl === 'undefined') {
    window.PaymentInputWidget.prototype.CardSideFlipperControl = function(widget, side, opts) {
      this.widget = widget;
      this.side = side;
      this.options = opts;
      this.el = domProcessor('<div>').addClass('card-flip-control').text(`Flip to ${side}`);
      this.hide = () => this.el.hide();
    };
  }
  if (typeof window.SegmentedNumberDisplay === 'undefined') {
    window.SegmentedNumberDisplay = function(opts) {
      this.el = domProcessor('<input type="text">').addClass('dummy-segmented-number-display');
      this.getValue = () => this.el.val();
      this.setValue = (val) => this.el.val(val);
      this.setGroupings = (groups, suppressFocus) => this.el.attr('placeholder', groups.join(' '));
      this.on = (event, handler) => this.el.on(event, handler);
      this.emitEvent = (event, args) => this.el.trigger(event, args);
      this.show = () => this.el.show();
      this.hide = () => this.el.hide();
    };
  }
  if (typeof window.ExpiryDateInput === 'undefined') {
    window.ExpiryDateInput = function(opts) {
      this.el = domProcessor('<input type="text">').addClass('dummy-expiry-date-input');
      this.getValue = () => {
        const val = this.el.val();
        if (val.match(/^\d{2}\/\d{2}$/)) {
          const [month, year] = val.split('/').map(Number);
          return new Date(2000 + year, month - 1);
        }
        return null;
      };
      this.setValue = (val) => {
        if (val instanceof Date) {
          this.el.val(`${(val.getMonth() + 1).toString().padStart(2, '0')}/${val.getFullYear().toString().slice(-2)}`);
        } else {
          this.el.val(val);
        }
      };
      this.reconfigure = (newOpts) => this.el.attr('placeholder', newOpts.pattern);
      this.on = (event, handler) => this.el.on(event, handler);
      this.emitEvent = (event, args) => this.el.trigger(event, args);
      this.show = () => this.el.show();
      this.hide = () => this.el.hide();
    };
  }
  if (typeof window.GenericTextEntry === 'undefined') {
    window.GenericTextEntry = function(opts) {
      this.el = domProcessor('<input type="text">').addClass(opts.class).attr('placeholder', opts.placeholder);
      if (opts.requireMaxLength) {
        this.el.attr('maxlength', '4'); // Dummy value
      }
      this.getValue = () => this.el.val();
      this.setValue = (val) => this.el.val(val);
      this.attr = (attrs) => this.el.attr(attrs);
      this.on = (event, handler) => this.el.on(event, handler);
      this.emitEvent = (event, args) => this.el.trigger(event, args);
      this.show = () => this.el.show();
      this.hide = () => this.el.hide();
    };
  }

  // Assign the dummy factories to the internal _componentFactories object
  _componentFactories.CardSideFlipperControl = window.PaymentInputWidget.prototype.CardSideFlipperControl;
  _componentFactories.SegmentedNumberDisplay = window.SegmentedNumberDisplay;
  _componentFactories.ExpiryDateInput = window.ExpiryDateInput;
  _componentFactories.GenericTextEntry = window.GenericTextEntry;


  // Dummy CardTypeIdentifier for compilation purposes, assuming actual logic is external
  if (typeof window.CardTypeIdentifier === 'undefined') {
    window.CardTypeIdentifier = {
      firstMatchingNumber: function(cardNumber) {
        // Simple dummy logic for demonstration
        if (cardNumber.startsWith('4')) {
          return {
            attrs: {
              companyShortname: 'visa',
              issuerShortname: 'visa',
              cardNumberGrouping: [4, 4, 4, 4],
              expirationFormat: 'MM/YY',
              cvcLength: 3,
              layout: {
                number: 'front',
                cardholderName: 'front',
                expiry: 'front',
                securityCode: 'back'
              }
            },
            eql: function(other) {
              return other && other.attrs.companyShortname === 'visa';
            },
            number: { isFilled: (v) => v.length >= 16, isValid: (v) => v.length === 16 },
            expiration: { isFilled: (d) => d instanceof Date && !isNaN(d), isValid: (d) => d instanceof Date && !isNaN(d) && d > new Date() },
            name: { isFilled: (v) => v.length > 0, isValid: (v) => v.length > 0 },
            cvc: { isFilled: (v) => v.length >= 3, isValid: (v) => v.length === 3 }
          };
        } else if (cardNumber.startsWith('5')) {
          return {
            attrs: {
              companyShortname: 'mastercard',
              issuerShortname: 'mastercard',
              cardNumberGrouping: [4, 4, 4, 4],
              expirationFormat: 'MM/YY',
              cvcLength: 3,
              layout: {
                number: 'front',
                cardholderName: 'front',
                expiry: 'front',
                securityCode: 'back'
              }
            },
            eql: function(other) {
              return other && other.attrs.companyShortname === 'mastercard';
            },
            number: { isFilled: (v) => v.length >= 16, isValid: (v) => v.length === 16 },
            expiration: { isFilled: (d) => d instanceof Date && !isNaN(d), isValid: (d) => d instanceof Date && !isNaN(d) && d > new Date() },
            name: { isFilled: (v) => v.length > 0, isValid: (v) => v.length > 0 },
            cvc: { isFilled: (v) => v.length >= 3, isValid: (v) => v.length === 3 }
          };
        }
        return null;
      }
    };
  }
  CardTypeIdentifier = window.CardTypeIdentifier; // Ensure the local reference points to the global one
})();