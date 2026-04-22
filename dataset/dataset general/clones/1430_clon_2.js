/*
"PaymentCardUI" -- A Dynamic Credit Card Input Visualizer
@overview This utility enhances standard payment card input fields, presenting
          a skeuomorphic, interactive card interface. It supports graceful degradation
          and provides a more intuitive user experience.
@contributor Jane Doe <jane.doe@example.com>
@revision 2024-03-15
@homepage https://example.com/paymentcardui
@exposed [window.PaymentCardUI]
*/


(function() {
  var jq, PaymentCardUI, initialBrandProduct,
    arraySliceHelper = [].slice,
    arrayIndexOfHelper = [].indexOf || function(itemToCheck) {
      for (var i = 0, len = this.length; i < len; i++) {
        if (i in this && this[i] === itemToCheck) return i;
      }
      return -1;
    };

  jq = jQuery;

  PaymentCardUI = (function() {
    PaymentCardUI.currentSystemDate = new Date();

    function PaymentCardUI(domElementRef, settings) {
      var defaultSettings;
      if (settings == null) {
        settings = {};
      }
      this.uiComponents = {
        mainContainer: jq(domElementRef),
        hiddenInputElements: {}
      };
      this.inputWidgets = {};
      this.fieldDisplaysBySide = {
        frontPanel: [],
        rearPanel: []
      };
      this.faceSwitchers = {};
      this.currentStatus = {};
      this.paymentBrand = null;
      this.activeSide = 'frontPanel';
      defaultSettings = {
        enableDebugging: false,
        preventInitialFocus: false,
        allowedCardBrands: null,
        numberMaskCharacter: '#',
        defaultNumberMask: "#### #### #### ####",
        brandInputSelector: '[name="payment_brand_type"]',
        cardNumInputSelector: '[name="card_number_field"]',
        monthInputSelector: '[name="expiration_month_field"]',
        yearInputSelector: '[name="expiration_year_field"]',
        nameInputSelector: '[name="cardholder_name_field"]',
        securityCodeInputSelector: '[name="security_code_field"]',
        prefillData: {},
        initialValidityStatus: {},
        uiTextLabels: {
          otherSideFillPrompt: "<strong>Click to flip</strong> for <br>more details.",
          otherSideErrorAlert: "Issue found on the other side.",
          otherSideReminder: "Forgot something?<br> Toggle the view."
        }
      };
      this.optionsConfig = jq.extend(defaultSettings, settings);
      this._structureDOMElements();
      this._linkInteractionHandlers();
      this._loadInitialSettings();
      this.displayUI();
    }

    PaymentCardUI.prototype._recordDebugMessage = function() {
      var logMessageArgs;
      logMessageArgs = 1 <= arguments.length ? arraySliceHelper.call(arguments, 0) : [];
      if ((typeof console !== "undefined" && console !== null ? console.log : void 0) && !!this.optionsConfig.enableDebugging) {
        if (this.optionsConfig.enableDebugging != null) {
          return console.log.apply(console, ["[PaymentCardUI]"].concat(arraySliceHelper.call(logMessageArgs)));
        }
      }
    };

    PaymentCardUI.prototype.emitEvent = function() {
      var eventArguments, _ref;
      eventArguments = 1 <= arguments.length ? arraySliceHelper.call(arguments, 0) : [];
      return (_ref = this.uiComponents.mainContainer).trigger.apply(_ref, eventArguments);
    };

    PaymentCardUI.prototype.attachEventHandler = function() {
      var eventArguments, _ref;
      eventArguments = 1 <= arguments.length ? arraySliceHelper.call(arguments, 0) : [];
      return (_ref = this.uiComponents.mainContainer).bind.apply(_ref, eventArguments);
    };

    /*
    Transforms the internal elements of the UI container, ensuring the DOM
    is structured for proper styling and that the original input fields
    are appropriately concealed.
    */
    PaymentCardUI.prototype._structureDOMElements = function() {
      this.uiComponents.mainContainer.removeClass('no-script-enabled');
      this.uiComponents.mainContainer.addClass("payment-card-ui script-enabled");
      this.uiComponents.mainContainer.find("> :not(input,select,textarea)").remove();
      this.uiComponents.mainContainer.find("> input,select,textarea").hide();
      this.uiComponents.hiddenInputElements = {
        brandType: this.uiComponents.mainContainer.find(this.optionsConfig.brandInputSelector),
        cardNumber: this.uiComponents.mainContainer.find(this.optionsConfig.cardNumInputSelector),
        expirationMonth: this.uiComponents.mainContainer.find(this.optionsConfig.monthInputSelector),
        expirationYear: this.uiComponents.mainContainer.find(this.optionsConfig.yearInputSelector),
        cardholderName: this.uiComponents.mainContainer.find(this.optionsConfig.nameInputSelector),
        securityCode: this.uiComponents.mainContainer.find(this.optionsConfig.securityCodeInputSelector)
      };
      this.uiComponents.frontPanel = jq("<div>").attr({
        "class": "card-panel front-panel"
      });
      this.uiComponents.rearPanel = jq("<div>").attr({
        "class": "card-panel rear-panel"
      });
      this.uiComponents.cardDisplayBody = jq("<div>").attr({
        "class": "card-visual-body"
      });
      this.uiComponents.frontPanel.appendTo(this.uiComponents.cardDisplayBody);
      this.uiComponents.rearPanel.appendTo(this.uiComponents.cardDisplayBody);
      this.uiComponents.cardDisplayBody.appendTo(this.uiComponents.mainContainer);
      this.faceSwitchers.frontPanel = new PaymentCardUI.prototype.SideFlipperView(this, 'frontPanel', {
        uiTextLabels: this.optionsConfig.uiTextLabels
      });
      this.faceSwitchers.rearPanel = new PaymentCardUI.prototype.SideFlipperView(this, 'rearPanel', {
        uiTextLabels: this.optionsConfig.uiTextLabels
      });
      this.uiComponents.frontPanel.prepend(this.faceSwitchers.frontPanel.uiElement);
      this.uiComponents.rearPanel.prepend(this.faceSwitchers.rearPanel.uiElement);
      this.faceSwitchers.frontPanel.hideControl();
      this.faceSwitchers.rearPanel.hideControl();
      this.inputWidgets = {
        cardNumber: new this.SegmentedCardNumberWidget(),
        expiration: new this.ExpirationDateWidget({
          currentDate: this.optionsConfig.currentSystemDate
        }),
        cardholderName: new this.GenericTextInputWidget({
          "class": "cardholder-name-field",
          placeholder: "FULL NAME"
        }),
        securityCode: new this.GenericTextInputWidget({
          "class": "card-security-code-field",
          placeholder: "###",
          requireMaxLength: true
        })
      };
      this.inputWidgets.cardNumber.uiElement.addClass('card-number-display');
      this.inputWidgets.cardNumber.uiElement.appendTo(this.uiComponents.frontPanel);
      this.inputWidgets.cardholderName.uiElement.appendTo(this.uiComponents.frontPanel);
      this.inputWidgets.expiration.uiElement.addClass('card-expiration-display');
      this.inputWidgets.expiration.uiElement.appendTo(this.uiComponents.frontPanel);
      this.inputWidgets.securityCode.uiElement.appendTo(this.uiComponents.rearPanel);
      return this.uiComponents.mainContainer;
    };

    /*
    Retrieves initial configuration options from the DOM, such as accepted
    card types, default validation statuses, and existing values.
    */
    PaymentCardUI.prototype._loadInitialSettings = function() {
      var dataElement, dataFieldKey, initialExpirationDate, _ref,
        _this = this;
      _ref = this.uiComponents.hiddenInputElements;
      for (dataFieldKey in _ref) {
        dataElement = _ref[dataFieldKey];
        if (this.optionsConfig.prefillData[dataFieldKey] == null) {
          this.optionsConfig.prefillData[dataFieldKey] = dataElement.val();
        } else {
          this.optionsConfig.prefillData[dataFieldKey] = this.optionsConfig.prefillData[dataFieldKey].toString();
          this._syncHiddenInputValue(dataFieldKey, this.optionsConfig.prefillData[dataFieldKey]);
        }
        if (this.optionsConfig.prefillData[dataFieldKey].length > 0) {
          this.currentStatus['initiallyPopulated'] = true;
        }
        if (this.optionsConfig.initialValidityStatus[dataFieldKey] == null) {
          this.optionsConfig.initialValidityStatus[dataFieldKey] = !dataElement.hasClass('is-invalid');
        }
      }
      if (this.optionsConfig.allowedCardBrands == null) {
        this.optionsConfig.allowedCardBrands = [];
        this.uiComponents.hiddenInputElements.brandType.find('option').each(function(idx, domElementRef) {
          var optionElement, shortBrandName;
          optionElement = jq(domElementRef);
          shortBrandName = optionElement.attr('data-pcui-brand') || optionElement.attr('value');
          return _this.optionsConfig.allowedCardBrands.push(shortBrandName);
        });
      }
      if (this.optionsConfig.prefillData.cardNumber.length > 0) {
        this.setValueForField('cardNumber', this.optionsConfig.prefillData.cardNumber);
      }
      if (this.optionsConfig.prefillData.cardholderName.length > 0) {
        this.setValueForField('cardholderName', this.optionsConfig.prefillData.cardholderName);
      }
      if (this.optionsConfig.prefillData.securityCode.length > 0) {
        this.setValueForField('securityCode', this.optionsConfig.prefillData.securityCode);
      }
      if (this.optionsConfig.prefillData.expirationYear.length > 0 && this.optionsConfig.prefillData.expirationMonth.length > 0) {
        initialExpirationDate = new Date(parseInt(this.optionsConfig.prefillData.expirationYear), parseInt(this.optionsConfig.prefillData.expirationMonth) - 1, 1);
        this.setValueForField('expiration', initialExpirationDate);
      }
      this._refreshSideValidation('frontPanel');
      return this._refreshSideValidation('rearPanel');
    };

    PaymentCardUI.prototype.setValueForField = function(inputFieldId, updatedValue) {
      this.inputWidgets[inputFieldId].setWidgetValue(updatedValue);
      return this.inputWidgets[inputFieldId].emitEvent('valueChanged', this.inputWidgets[inputFieldId]);
    };

    /*
    Establishes event listeners and links them to their corresponding
    handling functions.
    */
    PaymentCardUI.prototype._linkInteractionHandlers = function() {
      var expirationUpdateHandler,
        _this = this;
      this.uiComponents.hiddenInputElements.cardNumber.bind("change", function(evt) {
        _this.inputWidgets.cardNumber.setWidgetValue(_this._getUnderlyingValue('cardNumber'));
        return _this.displayUI();
      });
      expirationUpdateHandler = function(evt) {
        var expMonthVal, expYearVal;
        expMonthVal = parseInt(_this._getUnderlyingValue('expirationMonth'));
        expYearVal = parseInt(_this._getUnderlyingValue('expirationYear'));
        _this.inputWidgets.expiration.setWidgetValue(new Date(expYearVal, expMonthVal - 1));
        return _this.displayUI();
      };
      this.uiComponents.hiddenInputElements.expirationMonth.bind("change", expirationUpdateHandler);
      this.uiComponents.hiddenInputElements.expirationYear.bind("change", expirationUpdateHandler);
      this.uiComponents.hiddenInputElements.cardholderName.bind("change", function(evt) {
        _this.inputWidgets.cardholderName.setWidgetValue(_this._getUnderlyingValue('cardholderName'));
        return _this.displayUI();
      });
      this.uiComponents.hiddenInputElements.securityCode.bind("change", function(evt) {
        _this.inputWidgets.securityCode.setWidgetValue(_this._getUnderlyingValue('securityCode'));
        return _this.displayUI();
      });
      this.inputWidgets.cardNumber.bind("change valueChanged", function(evt, inputWidget) {
        var paymentCardNumber, identifiedBrand, numericValue, priorBrand, _ref1, _ref2;
        paymentCardNumber = inputWidget.getWidgetValue();
        _this._syncHiddenInputValue('cardNumber', paymentCardNumber);
        _this._refreshFieldValidation('cardNumber', paymentCardNumber);
        numericValue = _this._getUnderlyingValue('cardNumber');
        identifiedBrand = PaymentCardUI.prototype.CardBrandDefinition.firstMatchingNumber(numericValue);
        if (!((_ref1 = _this.paymentBrand) != null ? _ref1.isEqual(identifiedBrand) : void 0)) {
          _this._recordDebugMessage("Brand will change:", _this.paymentBrand, "=>", identifiedBrand);
          if (_ref2 = identifiedBrand != null ? identifiedBrand.attributes.companyShortname : void 0, arrayIndexOfHelper.call(_this.optionsConfig.allowedCardBrands, _ref2) >= 0) {
            _this.emitEvent('brandChanging.paymentcardui', [_this, _this.paymentBrand, identifiedBrand]);
            priorBrand = _this.paymentBrand;
            _this.uiComponents.mainContainer.removeClass('brand-not-allowed');
            _this._applyBrandSpecificRender(identifiedBrand);
            _this.paymentBrand = identifiedBrand;
          } else if (identifiedBrand != null) {
            _this.emitEvent('brandChanging.paymentcardui', [_this, _this.paymentBrand, null]);
            _this.uiComponents.mainContainer.addClass('brand-not-allowed');
            _this._applyBrandSpecificRender(null);
            _this.paymentBrand = null;
          } else {
            _this.emitEvent('brandChanging.paymentcardui', [_this, _this.paymentBrand, null]);
            _this.uiComponents.mainContainer.removeClass('brand-not-allowed');
            _this._applyBrandSpecificRender(null);
            _this.paymentBrand = null;
          }
          return _this.emitEvent('brandChanged.paymentcardui', [_this, priorBrand, _this.paymentBrand]);
        }
      });
      this.inputWidgets.expiration.bind("keyup valueChanged", function(evt, inputWidget) {
        var updatedDateVal;
        updatedDateVal = inputWidget.getWidgetValue();
        _this._refreshFieldValidation('expiration', updatedDateVal);
        if (updatedDateVal != null) {
          _this._syncHiddenInputValue('expirationMonth', updatedDateVal.getMonth() + 1);
          return _this._syncHiddenInputValue('expirationYear', updatedDateVal.getFullYear());
        }
      });
      this.inputWidgets.cardholderName.bind("keyup valueChanged", function(evt, inputWidget) {
        var currentFieldValue;
        currentFieldValue = inputWidget.getWidgetValue();
        _this._syncHiddenInputValue('cardholderName', currentFieldValue);
        return _this._refreshFieldValidation('cardholderName', currentFieldValue);
      });
      this.inputWidgets.securityCode.bind("keyup valueChanged", function(evt, inputWidget) {
        var currentFieldValue;
        currentFieldValue = inputWidget.getWidgetValue();
        _this._syncHiddenInputValue('securityCode', currentFieldValue);
        return _this._refreshFieldValidation('securityCode', currentFieldValue);
      });
      this.uiComponents.mainContainer.delegate("input", "keyup keydown", this._processTabNavigation.bind(this));
      this.faceSwitchers.frontPanel.uiElement.click(function() {
        return _this.toggleCardSide();
      });
      return this.faceSwitchers.rearPanel.uiElement.click(function() {
        return _this.toggleCardSide();
      });
    };

    PaymentCardUI.prototype._processTabNavigation = function(evt) {
      var rearSideFields, activeInputElement, frontSideFields, otherSide, activeSideName;
      if (evt.which === 9) {
        activeInputElement = jq(evt.currentTarget);
        otherSide = this.activeSide === 'frontPanel' ? 'rearPanel' : 'frontPanel';
        activeSideName = this.activeSide === 'frontPanel' ? 'frontPanel' : 'rearPanel';
        rearSideFields = this.uiComponents[otherSide].find('input');
        frontSideFields = this.uiComponents[activeSideName].find('input');
        if (this.activeSide === 'frontPanel' && this.uiComponents.frontPanel.hasClass('data-entered') && rearSideFields.length > 0 && frontSideFields.index(activeInputElement) === frontSideFields.length - 1 && !evt.shiftKey) {
          this.toggleCardSide();
          rearSideFields.first().focus();
          evt.preventDefault();
        }
        if (this.activeSide === 'rearPanel' && evt.shiftKey) {
          this.toggleCardSide();
          rearSideFields.last().focus();
          evt.preventDefault();
        }
      }
      return true;
    };

    PaymentCardUI.prototype._refreshFieldValidation = function(inputFieldId, currentFieldValue) {
      var populationStateChanged, isPopulated, hasBeenCorrected, passesValidation, requiresCorrection, validityStatusChanged;
      if (this.paymentBrand == null) {
        return false;
      }
      isPopulated = this.paymentBrand[inputFieldId].isPopulated(currentFieldValue);
      requiresCorrection = (this.optionsConfig.initialValidityStatus[inputFieldId] != null) === false;
      hasBeenCorrected = (this.optionsConfig.prefillData[inputFieldId] != null) && currentFieldValue !== this.optionsConfig.prefillData[inputFieldId];
      passesValidation = this.paymentBrand[inputFieldId].isValid(currentFieldValue) && ((requiresCorrection && hasBeenCorrected) || true);
      populationStateChanged = this.currentStatus["" + inputFieldId + "Populated"] !== isPopulated;
      validityStatusChanged = this.currentStatus["" + inputFieldId + "Valid"] !== passesValidation;
      if (populationStateChanged) {
        this.emitEvent("fieldPopulating.paymentcardui", [this, inputFieldId, isPopulated]);
        this.inputWidgets[inputFieldId].uiElement.toggleClass('data-entered', isPopulated);
        this.currentStatus["" + inputFieldId + "Populated"] = isPopulated;
        this.emitEvent("fieldPopulated.paymentcardui", [this, inputFieldId, isPopulated]);
      }
      if (validityStatusChanged) {
        this.emitEvent("fieldValidityChanging.paymentcardui", [this, inputFieldId, passesValidation]);
        this.inputWidgets[inputFieldId].uiElement.toggleClass('is-valid', passesValidation);
        this.inputWidgets[inputFieldId].uiElement.toggleClass('is-invalid', !passesValidation);
        this.currentStatus["" + inputFieldId + "Valid"] = passesValidation;
        this.emitEvent("fieldValidityChanged.paymentcardui", [this, inputFieldId, passesValidation]);
      }
      return this._refreshSideValidation(this.activeSide);
    };

    PaymentCardUI.prototype._refreshSideValidation = function(panelName) {
      var allFieldsPopulated, allFieldsValid, populationStateChanged, isPopulated, passesValidation, inputWidget, validityStatusChanged;
      allFieldsPopulated = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.fieldDisplaysBySide[panelName];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          inputWidget = _ref1[_i];
          _results.push(inputWidget.uiElement.hasClass('data-entered'));
        }
        return _results;
      }).call(this)).every(Boolean);
      allFieldsValid = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.fieldDisplaysBySide[panelName];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          inputWidget = _ref1[_i];
          _results.push(inputWidget.uiElement.hasClass('is-valid'));
        }
        return _results;
      }).call(this)).every(Boolean);
      isPopulated = (allFieldsPopulated && (this.paymentBrand != null)) || (this.currentStatus['initiallyPopulated'] || false);
      passesValidation = allFieldsValid && (this.paymentBrand != null);
      populationStateChanged = this.currentStatus["" + panelName + "Populated"] !== isPopulated;
      validityStatusChanged = this.currentStatus["" + panelName + "Valid"] !== passesValidation;
      if (populationStateChanged) {
        this.emitEvent("sidePopulating.paymentcardui", [this, panelName, isPopulated]);
        this.uiComponents[panelName].toggleClass('data-entered', isPopulated);
        this.currentStatus["" + panelName + "Populated"] = isPopulated;
        this.emitEvent("sidePopulated.paymentcardui", [this, panelName, isPopulated]);
      }
      if (validityStatusChanged) {
        this.emitEvent("sideValidityChanging.paymentcardui", [this, panelName, passesValidation]);
        this.uiComponents[panelName].toggleClass('is-valid', passesValidation);
        this.uiComponents[panelName].toggleClass('is-invalid', !passesValidation);
        this.currentStatus["" + panelName + "Valid"] = passesValidation;
        return this.emitEvent("sideValidityChanged.paymentcardui", [this, panelName, passesValidation]);
      }
    };

    /*
    Applies rendering adjustments specific to the currently identified card brand.
    A null value for 'product' reverts the card UI to a generic state.
    */
    PaymentCardUI.prototype._applyBrandSpecificRender = function(cardBrandInfo) {
      var destinationSide, dataFieldKey, currentlyFocused, widgetInstance, widgetElement, _ref1, _ref2,
        _this = this;
      this._recordDebugMessage("[_applyBrandSpecificRender]", "Rendering for brand:", cardBrandInfo);
      this.uiComponents.mainContainer.removeClass(function(idx, cssClasses) {
        return (cssClasses.match(/\b(brand-type|issuer-brand)-\S+/g) || []).join(' ');
      });
      if ((cardBrandInfo != null ? cardBrandInfo.attributes.companyShortname : void 0) != null) {
        this.uiComponents.mainContainer.addClass("brand-type-" + cardBrandInfo.attributes.companyShortname);
      }
      if ((cardBrandInfo != null ? cardBrandInfo.attributes.issuerShortname : void 0) != null) {
        this.uiComponents.mainContainer.addClass("issuer-brand-" + cardBrandInfo.attributes.issuerShortname);
      }
      this._syncHiddenInputValue('brandType', (cardBrandInfo != null ? cardBrandInfo.attributes.companyShortname : void 0) || null);
      this.inputWidgets.cardNumber.setGroupingPatterns((cardBrandInfo != null ? cardBrandInfo.attributes.cardNumberGrouping : void 0) || [this.optionsConfig.defaultNumberMask.length], this.optionsConfig.preventInitialFocus);
      delete this.optionsConfig.preventInitialFocus;
      if (cardBrandInfo != null) {
        this.inputWidgets.expiration.reconfigureWidget({
          pattern: (cardBrandInfo != null ? cardBrandInfo.attributes.expirationFormat : void 0) || "MM/YY"
        });
        this.inputWidgets.securityCode.setAttributes({
          maxlength: cardBrandInfo.attributes.cvcLength,
          placeholder: new Array(cardBrandInfo.attributes.cvcLength + 1).join(this.optionsConfig.numberMaskCharacter)
        });
        this.fieldDisplaysBySide = {
          frontPanel: [],
          rearPanel: []
        };
        currentlyFocused = jq('input:focus');
        _ref1 = cardBrandInfo.attributes.layout;
        for (dataFieldKey in _ref1) {
          destinationSide = _ref1[dataFieldKey];
          this._recordDebugMessage("Moving", dataFieldKey, "to", destinationSide);
          widgetElement = this.inputWidgets[dataFieldKey].uiElement.detach();
          widgetElement.appendTo(this.uiComponents[destinationSide]);
          this.fieldDisplaysBySide[destinationSide].push(this.inputWidgets[dataFieldKey]);
          this.inputWidgets[dataFieldKey].showWidget();
        }
        setTimeout(function() {
          var fieldElement, inputLength;
          if ((fieldElement = currentlyFocused.first()) != null) {
            inputLength = fieldElement[0].maxLength;
            fieldElement.focus();
            return fieldElement[0].setSelectionRange(inputLength, inputLength);
          }
        }, 10);
      } else {
        _ref2 = this.inputWidgets;
        for (dataFieldKey in _ref2) {
          widgetInstance = _ref2[dataFieldKey];
          if (dataFieldKey !== 'cardNumber') {
            widgetInstance.hideWidget();
          }
        }
      }
      return cardBrandInfo;
    };

    PaymentCardUI.prototype._executeValidationRender = function() {
      var dataFieldKey, fieldWidget, _ref1, _results;
      _ref1 = this.inputWidgets;
      _results = [];
      for (dataFieldKey in _ref1) {
        fieldWidget = _ref1[dataFieldKey];
        _results.push(this._refreshFieldValidation(dataFieldKey, fieldWidget.getWidgetValue()));
      }
      return _results;
    };

    PaymentCardUI.prototype.displayUI = function() {
      this._applyBrandSpecificRender(this.paymentBrand);
      return this._executeValidationRender();
    };

    PaymentCardUI.prototype.toggleCardSide = function() {
      var panelName, desiredSide;
      desiredSide = this.activeSide === 'frontPanel' ? 'rearPanel' : 'frontPanel';
      this.emitEvent('sideChanging.paymentcardui', [this, desiredSide]);
      this.activeSide = desiredSide;
      this.uiComponents.cardDisplayBody.toggleClass('is-flipped');
      panelName = this.activeSide === 'frontPanel' ? 'frontPanel' : 'rearPanel';
      this.uiComponents[panelName].find('.card-field').not('.data-entered').find('input').first().focus();
      return this.emitEvent('sideChanged.paymentcardui', [this, desiredSide]);
    };

    PaymentCardUI.prototype._syncHiddenInputValue = function(inputFieldId, updatedValue) {
      var dataElement, attributeMappingKey, formattedNewValue,
        _this = this;
      dataElement = this.uiComponents.hiddenInputElements[inputFieldId];
      formattedNewValue = (updatedValue || "").toString();
      if (dataElement == null) {
        throw "Attempted to set value for unknown hidden field: " + inputFieldId + ".";
      }
      this.emitEvent('valueUpdated.paymentcardui', [this]);
      if (!dataElement.is('select')) {
        return this.uiComponents.hiddenInputElements[inputFieldId].val(formattedNewValue);
      } else {
        attributeMappingKey = "data-pcui-" + inputFieldId.toLowerCase();
        return dataElement.find('option').each(function(idx, domElementRef) {
          var optionElement;
          optionElement = jq(domElementRef);
          if (formattedNewValue === (optionElement.attr(attributeMappingKey) || optionElement.attr('value'))) {
            return _this.uiComponents.hiddenInputElements[inputFieldId].val(optionElement.attr('value'));
          }
        });
      }
    };

    // Helper to retrieve value from hidden fields, mirroring _setUnderlyingValue
    PaymentCardUI.prototype._getUnderlyingValue = function(inputFieldId) {
      var dataElement = this.uiComponents.hiddenInputElements[inputFieldId];
      if (dataElement == null) {
          this._recordDebugMessage("Warning: Attempted to get value of unknown hidden field: " + inputFieldId + ".");
          return null;
      }
      return dataElement.val();
    };

    // Placeholder for sub-classes and their methods, as their full implementation
    // was not provided in the original code snippet.
    PaymentCardUI.prototype.SideFlipperView = function() {
      this.uiElement = jq('<div>');
      this.hideControl = function() {};
    };
    PaymentCardUI.prototype.SegmentedCardNumberWidget = function() {
      this.uiElement = jq('<div>');
      this.setWidgetValue = function() {};
      this.bind = function() {};
      this.getWidgetValue = function() {};
      this.setGroupingPatterns = function() {};
    };
    PaymentCardUI.prototype.ExpirationDateWidget = function() {
      this.uiElement = jq('<div>');
      this.setWidgetValue = function() {};
      this.bind = function() {};
      this.getWidgetValue = function() {};
      this.reconfigureWidget = function() {};
    };
    PaymentCardUI.prototype.GenericTextInputWidget = function() {
      this.uiElement = jq('<div>');
      this.setWidgetValue = function() {};
      this.bind = function() {};
      this.getWidgetValue = function() {};
      this.setAttributes = function() {};
      this.showWidget = function() {};
      this.hideWidget = function() {};
    };
    PaymentCardUI.prototype.CardBrandDefinition = {
      firstMatchingNumber: function() {
        return {
          attributes: {
            companyShortname: 'generic',
            issuerShortname: 'generic',
            cardNumberGrouping: [4, 4, 4, 4],
            expirationFormat: 'MM/YY',
            cvcLength: 3,
            layout: {
              cardNumber: 'frontPanel',
              expiration: 'frontPanel',
              cardholderName: 'frontPanel',
              securityCode: 'rearPanel'
            }
          },
          isEqual: function(otherBrand) {
            return otherBrand && this.attributes.companyShortname === otherBrand.attributes.companyShortname;
          },
          cardNumber: { isPopulated: function() { return true; }, isValid: function() { return true; } },
          expiration: { isPopulated: function() { return true; }, isValid: function() { return true; } },
          cardholderName: { isPopulated: function() { return true; }, isValid: function() { return true; } },
          securityCode: { isPopulated: function() { return true; }, isValid: function() { return true; } }
        };
      }
    };


    return PaymentCardUI;

  })();

  window.PaymentCardUI = PaymentCardUI;

}).call(this);