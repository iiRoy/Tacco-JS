(function(jq) { /* Start of the form processing module */

    jq.fn.formWiz = function(cfgObj) { /* Initializes the form enhancement functionality */
        // Discover user agent details
        var clientAgentStr = window.navigator.userAgent.toLowerCase(),
            oldIEVersion = document.documentMode || parseInt(clientAgentStr.replace(/.*msie (\d+).*/, '$1')),
            foxBrowserVersion = parseInt(clientAgentStr.replace(/.*firefox\/(\d+).*/, '$1')),
            chromiumVersion = parseInt(clientAgentStr.replace(/.*chrome\/(\d+).*/, '$1')),
            // Old Opera versions like "opara/9.80" or "opera 10.10"
            operaBrowserVersion = parseInt(clientAgentStr.replace(/.*opera[\/ ](\d+).*/, '$1')),
            // Safari with "Version/5.0 Safari/533.16"
            safariVersion = parseInt(clientAgentStr.replace(/.*version\/(\d+).*safari.*/, '$1')),
            droidPlatformVersion = parseInt(clientAgentStr.replace(/.*android (\d+).*/, '$1'));

        var fetchOuterMarkup = function(targetDomElement) {
            // Firefox versions 10 and below lack the outerHTML property
            var nativeDomObject = targetDomElement.get(0);
            return nativeDomObject.outerHTML || new XMLSerializer().serializeToString(nativeDomObject);
        };

        // Default configuration properties for the component
        var initialConfigurations = {
            feedbackElementSelector: '.web-widget-feedback, .web-widget-reversed',
            hiddenControlSelector: '.web-widget-behind',
            problemDisplayStyles: {
                backgroundColor: 'rgb(228, 200, 200)'
            },
            ghostTextCssClass: 'web-widget-placeholder',
            emptyFieldNotice: 'Kindly fill in this input area.',
            noSelectionNotice: 'Kindly choose an option.',
            noCheckNotice: 'Kindly tick this checkbox.',
            formatMismatchNotice: 'Input does not conform to the expected pattern.',
            invalidEmailNotice: 'The email address provided is incorrect.',
            invalidUrlNotice: 'The URL provided is incorrect.',
            invalidNumberNotice: 'The number provided is incorrect.',
            invalidDatetimeNotice: 'The date and time format is incorrect.',
            invalidDateNotice: 'The date format is incorrect.',
            invalidTimeNotice: 'The time format is incorrect.',
            invalidStepNotice: 'The step increment is incorrect.',
            minimumValueNotice: 'Value must be greater than or equal to #.',
            maximumValueNotice: 'Value must be less than or equal to #.',
            maxLengthNotice: 'Too many # characters entered.',
            sliderWidgetCssClass: 'web-widget-range',
            timeSpinWidgetCssClass: 'web-widget-spin-time',
            dateTimeWidgetCssClass: 'web-widget-date-time',
            calendarComponentOptions: {
                onClose: function() {
                    jq(this).blur();
                }
            },
            dateInputMask: 'YYYY-MM-DD',
            monthInputMask: 'YYYY-MM',
            timeInputMask: 'HH:MM',
            spinnerTipMessage: 'Hold Shift to modify by hours, or Ctrl for smaller increments.',
            additionalParameters: {},
            dynamicHtmlContainer: '.web-widget-dynamic'
        };
        var activeConfiguration = jq.extend({}, initialConfigurations, cfgObj);

        // Perform browser capability tests
        var tempInputElem = jq('<input>').hide().appendTo(jq('body'))[0],
            tempTextareaElem = jq('textarea:first')[0] || new Object(),
            customValidityRequired = !('setCustomValidity' in tempInputElem) || droidPlatformVersion,
            autofocusPolyfillNeeded = !('autofocus' in tempInputElem),
            requiredPolyfillNeeded = !('required' in tempInputElem) || droidPlatformVersion,
            patternPolyfillNeeded = !('pattern' in tempInputElem) || droidPlatformVersion,
            emailPolyfillNeeded = urlPolyfillNeeded = customValidityRequired || patternPolyfillNeeded || droidPlatformVersion, // likely
            placeholderPolyfillNeeded = !('placeholder' in tempInputElem),
            // Android platform should have spinPolyfillNeeded = false and numberPolyfillNeeded = true
            // numberPolyfillNeeded handles min/max validation
            spinPolyfillNeeded = !('step' in tempInputElem) || !('min' in tempInputElem) || !!foxBrowserVersion || !!oldIEVersion,
            numberPolyfillNeeded = (!!droidPlatformVersion || spinPolyfillNeeded && !(oldIEVersion > 9)),
            rangePolyfillNeeded = numberPolyfillNeeded && !(foxBrowserVersion > 22),
            datetimeLocalPolyfillNeeded = !(operaBrowserVersion > 8 || chromiumVersion > 24),
            datetimePolyfillNeeded = !(operaBrowserVersion > 8),
            datePolyfillNeeded = datetimeLocalPolyfillNeeded && !(chromiumVersion > 21),
            timePolyfillNeeded = datetimeLocalPolyfillNeeded && !(chromiumVersion > 22),
            monthPolyfillNeeded = datetimeLocalPolyfillNeeded, // Exact Chrome version unknown for month input
            maxLengthPolyfillNeeded = !('maxLength' in tempTextareaElem),
            formAttributePolyfillNeeded = !('form' in tempInputElem) || !('formAction' in tempInputElem) || droidPlatformVersion,
            datalistPolyfillNeeded = !('autocomplete' in tempInputElem) || !('list' in tempInputElem),
            buttonClickBugFix = (oldIEVersion && oldIEVersion < 8),
            enterKeyBugFix = (oldIEVersion && oldIEVersion < 9) || droidPlatformVersion;

        for (configParamName in activeConfiguration.additionalParameters) {
            eval(configParamName + '=' + activeConfiguration.additionalParameters[configParamName] + ';');
        }

        jq('input:last').remove(); // Clean up temporary element

        var validateCandidateSelector = ':input:enabled:not(:button, :submit, [type="hidden"])';
        // Clear previous validation balloons
        if ('on' in jq(document)) {
            // .live() was deprecated in jQuery 1.9, now using .on()
            jq(document).on('click', validateCandidateSelector, function() {
                jq(this).siblings(activeConfiguration.feedbackElementSelector).remove();
                jq(activeConfiguration.hiddenControlSelector).removeAttr('disabled');
            })
            .on('click', activeConfiguration.feedbackElementSelector, function() {
                jq(this).remove();
            });
        } else { // Fallback for older jQuery versions
            jq(validateCandidateSelector).live('click', function() {
                jq(this).siblings(activeConfiguration.feedbackElementSelector).remove();
                jq(activeConfiguration.hiddenControlSelector).removeAttr('disabled');
            });
            jq(activeConfiguration.feedbackElementSelector).live('click', function() {
                jq(this).remove();
            });
        }
        // Focus on the first server-side error if present
        if (jq(activeConfiguration.feedbackElementSelector).length) {
            var targetDomElement = jq(activeConfiguration.feedbackElementSelector).eq(0).next(':input');
            if (targetDomElement.is(':hidden')) {
                targetDomElement = targetDomElement.parent().find(':input:not(:hidden)');
            }
            targetDomElement.eq(0).focus();
        }

        var retrieveAttributeValue = function(targetDomElement, attributeName) {
            var attrValue = targetDomElement.attr(attributeName);
            return (attrValue == undefined) ? '' : attrValue;
        };

        /**
         * Reconfigures an input element's type.
         * @param {object} targetDomElement -- The jQuery element to modify.
         * @param {string} desiredTypeString -- The new input type (e.g., 'text').
         * @param {string} initialTypeString -- The original input type.
         * @return {object} -- The newly created and replaced jQuery element.
         */
        var alterInputType = function(targetDomElement, desiredTypeString, initialTypeString) {
            var elementAttributes = targetDomElement.get(0).attributes,
                convertedInputElem = jq('<input type="' + desiredTypeString + '">'),
                booleanPropertyNames = ['required', /*'disabled',*/ 'readonly', 'checked'];

            for (idx = elementAttributes.length - 1; idx >= 0; idx--) {
                configParamName = elementAttributes[idx].nodeName;
                attrValue = elementAttributes[idx].nodeValue;
                if (!attrValue && jq.inArray(configParamName, booleanPropertyNames) >= 0) {
                    attrValue = configParamName;
                }
                if (configParamName && attrValue) {
                    if (configParamName != 'type') {
                        convertedInputElem.attr(configParamName, attrValue);
                    }
                }
            }
            convertedInputElem.addClass('web-widget-' + initialTypeString);

            return convertedInputElem.replaceAll(targetDomElement);
        };

        /**
         * Sets a custom validation message for the provided element.
         * @param {object} targetDomElement -- The jQuery element.
         * @param {string} validationFeedbackText -- The message to display.
         * @return {object} -- The jQuery element itself.
         */
        var isInitialRun = true,
            isNoValidation = false,
            assignCustomValidationMsg = function(targetDomElement, validationFeedbackText) {
            if (isNoValidation) validationFeedbackText = ''; // Null is not valid in Opera
            if (targetDomElement.is(validateCandidateSelector)) {
                // Incorporate the element's title into the message
                if (validationFeedbackText && (title = retrieveAttributeValue(targetDomElement, 'title'))) {
                    validationFeedbackText = jq.trim(validationFeedbackText + '\n' + title);
                }
                // Apply the custom validation status
                if (customValidityRequired) {
                    if (validationFeedbackText) {
                        targetDomElement.data('customValidity', validationFeedbackText.replace(/\n/, '<br />'));
                    } else {
                        targetDomElement.removeData('customValidity');
                    }

                    if (!isInitialRun && activeConfiguration.problemDisplayStyles) {
                        if (validationFeedbackText) {
                            targetDomElement.css(activeConfiguration.problemDisplayStyles);
                        } else {
                            for (styleProp in activeConfiguration.problemDisplayStyles) {
                                targetDomElement.css(styleProp, '');
                            }
                        }
                    }
                } else {
                    targetDomElement[0].setCustomValidity(validationFeedbackText);
                }
            }
            return targetDomElement;
        };
        jq.fn.formWiz.assignCustomValidationMsg = assignCustomValidationMsg;

        /**
         * Verifies the validity state of the given element(s).
         * @param {object} targetDomElement -- The jQuery element(s) to check.
         * @return {boolean} -- True if all elements are valid, false otherwise.
         */
        jq.fn.formWiz.verifyInputValidity = function(targetDomElement) {
            var isValid = true;
            targetDomElement.each(function() {
                if (customValidityRequired) {
                    if (jq(this).data('customValidity')) {
                        return (isValid = false);
                    }
                } else {
                    if (!jq(this)[0].checkValidity()) {
                        return (isValid = false);
                    }
                }
            });
            return isValid;
        };
        var displayFeedbackBalloon = function(targetDomElement, validationFeedbackText) {
            if (!targetDomElement.prev().is(activeConfiguration.feedbackElementSelector)) {
                var selectorParts = activeConfiguration.feedbackElementSelector.match(/^\.([^, ]+),? *\.?([^, ]*)/),
                    cssClassPart = (jq(window).width() - targetDomElement.offset().left < 300 && !!selectorParts[2]) ?
                    selectorParts[2] : selectorParts[1];
                targetDomElement.before('<span class="' + cssClassPart + '"></span>');
                jq(activeConfiguration.hiddenControlSelector).attr('disabled', 'disabled');
            }
            targetDomElement.prev().html('<p>' +
                validationFeedbackText.replace(/\n/, '<br/>') + '</p>');
            targetDomElement.focus().select(); // Focus alone does not work consistently in IE
        };
        jq.fn.formWiz.displayFeedbackBalloon = displayFeedbackBalloon;

        // Iterate over each form element selected by the jQuery object
        return jq(this).each(function() {

            // Private properties for the current form
            var targetForm = jq(this),
                autoFocusElement,
                allValidatableInputs = targetForm.find(validateCandidateSelector);

            // Check if 'novalidate' attribute is present on the form
            // form.attr('novalidate') returns undefined if it's a boolean attribute without value
            isNoValidation = !!fetchOuterMarkup(targetForm).match(/^[^>]+ novalidate/);

            var handleNumberInput = function(eventObject) {
                var allowedKeyCodes = [8, 9, 35, 36, 37, 39, 46, 58, 186, 190];
                var characterCode = eventObject.charCode || eventObject.keyCode;
                return ((jq.inArray(characterCode, allowedKeyCodes) >= 0) || (characterCode >= 48 && characterCode <= 57));
            };
            var shiftPressed = false,
                ctrlPressed = false;

            var updateKeyStates = (function(eventObject, isPressed) {
                var characterCode = eventObject.charCode || eventObject.keyCode;
                if (characterCode == 17) ctrlPressed = isPressed;
                if (characterCode == 16) shiftPressed = isPressed;
            });

            jq('body')
                .unbind('keydown', updateKeyStates)
                .unbind('keyup', updateKeyStates)
                .keydown(function(eventObject) { updateKeyStates(eventObject, true); })
                .keyup(function(eventObject) { updateKeyStates(eventObject, false); });

            var attributeToNumber = function(element, attrName, defaultValue) {
                var val = retrieveAttributeValue(element, attrName);
                if (val === '') return defaultValue;
                return parseFloat(val);
            };

            var str2sec = function(timeStr, allowEmpty) {
                if (!timeStr && allowEmpty) return 0;
                var parts = timeStr.split(':');
                return parseInt(parts[0] || 0) * 3600 + parseInt(parts[1] || 0) * 60 + parseInt(parts[2] || 0);
            };

            var sec2str = function(totalSeconds, allowSeconds, padHours) {
                var hours = Math.floor(totalSeconds / 3600);
                var minutes = Math.floor((totalSeconds % 3600) / 60);
                var seconds = totalSeconds % 60;

                var timeString = (padHours ? (hours < 10 ? '0' : '') + hours : hours) + ':' +
                    (minutes < 10 ? '0' : '') + minutes;
                if (allowSeconds) {
                    timeString += ':' + (seconds < 10 ? '0' : '') + seconds;
                }
                return timeString;
            };

            var adjustTimeSpinner = function(targetDomElement, decreaseValue) {
                var minimumVal = attributeToNumber(targetDomElement, 'min', 0.0),
                    maximumVal = attributeToNumber(targetDomElement, 'max', 86400.0),
                    currentStep = initialStep = attributeToNumber(targetDomElement, 'step', 60.0),
                    baseValue = 0.0,
                    currentValue = str2sec(targetDomElement.val(), true);

                if (shiftPressed) currentStep = 3600;
                else if (ctrlPressed) currentStep = initialStep;
                else currentStep = (initialStep < 600) ? 600 : initialStep;

                currentValue = currentValue - ((currentValue - baseValue) % currentStep) + currentStep * ((decreaseValue) ? -1 : 1);

                if ((maximumVal || maximumVal == 0.0) && currentValue > maximumVal) currentValue = maximumVal;
                if ((minimumVal || minimumVal == 0.0) && currentValue < minimumVal) currentValue = minimumVal;

                targetDomElement.val(sec2str(currentValue, currentStep % 60, true));
                return targetDomElement;
            };
            /**
             * Function to initialize and enhance each form control.
             * @param {object} inputElements -- The jQuery elements to process.
             * @param {boolean} isFirstPass -- Indicates if this is the initial processing run.
             * @return {object} -- The inputElements for chaining.
             */
            var initializeFormControl = function(inputElements, isFirstPass) {
                isInitialRun = isFirstPass;

                return inputElements.each(function() {

                    var targetDomElement = jq(this),
                        inputType = retrieveAttributeValue(targetDomElement, 'type').toLowerCase();

                    // Handle autofocus polyfill
                    if (autofocusPolyfillNeeded && !autoFocusElement && retrieveAttributeValue(targetDomElement, 'autofocus')) {
                        autoFocusElement = targetDomElement;
                    }
                    // Attach focus/blur events for placeholder polyfill
                    var placeholderText = retrieveAttributeValue(targetDomElement, 'placeholder');
                    if (placeholderPolyfillNeeded && placeholderText) {
                        jq(this).prev('.' + activeConfiguration.ghostTextCssClass).remove();
                        var placeholderSpan = jq('<span />').insertBefore(targetDomElement)
                            .addClass(activeConfiguration.ghostTextCssClass)
                            .text(placeholderText).click(function() {
                                targetDomElement.focus();
                            });
                        var updatePlaceholderVisibility = (function() {
                            if (targetDomElement.val().length > 0) placeholderSpan.hide();
                            else placeholderSpan.show();
                        });
                        targetDomElement.bind('keyup keydown cut paste', updatePlaceholderVisibility).keyup()
                            .removeAttr('placeholder');
                    }

                    // Handle spinner widgets (jQuery UI)
                    if ('spinner' in targetDomElement) {
                        if (spinPolyfillNeeded && inputType == "number") {
                            targetDomElement = alterInputType(targetDomElement, 'text', inputType).spinner()
                                .unbind('keydown', handleNumberInput).keydown(handleNumberInput);
                        }
                        if (timePolyfillNeeded && inputType == 'time') {
                            targetDomElement = alterInputType(targetDomElement, 'text', inputType).spinner({
                                spin: function() {
                                    return false;
                                }
                            });

                            if (('mask' in targetDomElement)) {
                                targetDomElement.unbind('mask').mask(activeConfiguration.timeInputMask);
                            }

                            widgetInstance = targetDomElement.spinner('widget');
                            widgetInstance.find('.ui-icon')
                                .attr('title', activeConfiguration.spinnerTipMessage)
                                .click(function() {
                                    adjustTimeSpinner(targetDomElement, jq(this).parents('.ui-spinner').find('.ui-icon').index(jq(this))).change().blur();
                                });
                        }
                    }
                    // Handle datepicker widgets (jQuery UI)
                    if ((datePolyfillNeeded && inputType == 'date') || (monthPolyfillNeeded && inputType == 'month')) {
                        var inputMaskPattern;
                        if ('datepicker' in targetDomElement) {
                            var datepickerOption = activeConfiguration.calendarComponentOptions;
                            switch (inputType) {
                                case 'date':
                                    datepickerOption.dateFormat = 'yy-mm-dd';
                                    datepickerOption.minDate = retrieveAttributeValue(targetDomElement, 'min');
                                    datepickerOption.maxDate = retrieveAttributeValue(targetDomElement, 'max');
                                    inputMaskPattern = activeConfiguration.dateInputMask;
                                    break;
                                case 'month':
                                    datepickerOption.dateFormat = 'yy-mm';
                                    inputMaskPattern = activeConfiguration.monthInputMask;
                                    // Datepicker has issues with minDate/maxDate for yy-mm format
                                    datepickerOption.minDate = '';
                                    datepickerOption.maxDate = '';
                                    break;
                            }
                            targetDomElement = alterInputType(targetDomElement, 'text', inputType).datepicker(datepickerOption);
                        }
                        if ('mask' in targetDomElement) {
                            targetDomElement.unbind('mask').mask(inputMaskPattern);
                        }
                    }
                    // Handle slider widgets (jQuery UI) for range inputs
                    if (rangePolyfillNeeded && (inputType == 'range') && ('slider' in targetDomElement)) {
                        var minimumVal = attributeToNumber(targetDomElement, 'min', 0),
                            maximumVal = attributeToNumber(targetDomElement, 'max', 100),
                            currentStep = attributeToNumber(targetDomElement, 'step', 1),
                            currentSliderValue = attributeToNumber(targetDomElement, 'val', (minimumVal + maximumVal) / 2 - ((minimumVal + maximumVal) / 2 % currentStep));

                        targetDomElement.hide().css({
                            width: 0,
                            margin: 0
                        }).after('<span class="' + activeConfiguration.sliderWidgetCssClass +
                            '"><div></div></span>').val(currentSliderValue);
                        targetDomElement.next().children().slider({
                            min: minimumVal,
                            max: maximumVal,
                            step: currentStep,
                            value: currentSliderValue,
                            change: function(eventObj, sliderObj) {
                                jq(this).val(jq(this).slider('value'));
                            }
                        });
                    }

                    // Handle maxlength polyfill for textareas
                    if (maxLengthPolyfillNeeded && targetDomElement.is('textarea') &&
                        (maxLengthLimit = retrieveAttributeValue(targetDomElement, 'maxlength'))) {
                        // Attach keypress event to limit input
                        var handleKeypressLimit = (function(eventObject) {
                            var characterCode = eventObject.charCode || eventObject.keyCode;
                            return ((jq.inArray(characterCode, [8, 9, 37, 39, 46]) >= 0) ||
                                (this.value.length < maxLengthLimit));
                        });
                        targetDomElement.unbind('keypress', handleKeypressLimit).keypress(handleKeypressLimit);
                    }

                    // Handle datetime-local and datetime inputs
                    if ((isLocalTimezone = (datetimeLocalPolyfillNeeded && inputType == 'datetime-local')) || (datetimePolyfillNeeded && inputType == 'datetime')) {
                        targetDomElement = alterInputType(targetDomElement, 'text', inputType);
                        var parsedValue = parseLocalDatetime(targetDomElement.val(), isLocalTimezone),
                            parsedMin = parseLocalDatetime(retrieveAttributeValue(targetDomElement, 'min'), isLocalTimezone),
                            parsedMax = parseLocalDatetime(retrieveAttributeValue(targetDomElement, 'max'), isLocalTimezone),
                            timezoneSpan = (inputType == 'datetime') ?
                            '<span class="web-widget-timezone">' + getTimezoneOffsetString() + '</span>' : '';

                        targetDomElement.hide().after(
                            '<span class="' + activeConfiguration.dateTimeWidgetCssClass + '">' +

                            '<input type="date" value="' + parsedValue[0] + '"' +
                            ' min="' + parsedMin[0] + '" max="' + parsedMax[0] + '"' +
                            ' size="' + retrieveAttributeValue(targetDomElement, 'size') + '"' +
                            ' class="' + retrieveAttributeValue(targetDomElement, 'class') + '"' +
                            ' title="' + retrieveAttributeValue(targetDomElement, 'title') + '">' +

                            '<input type="time" value="' + parsedValue[1] + '"' +
                            ' step="' + attributeToNumber(targetDomElement, 'step', 60) + '"' +
                            ' size="' + retrieveAttributeValue(targetDomElement, 'size') + '"' +
                            ' class="' + retrieveAttributeValue(targetDomElement, 'class') + '"' +
                            ' title="' + retrieveAttributeValue(targetDomElement, 'title') + '">' +
                            timezoneSpan +
                            '</span>');
                        if (retrieveAttributeValue(targetDomElement, 'required')) {
                            targetDomElement.removeAttr('required');
                            initializeFormControl(targetDomElement.next().children().attr('required', 'required'));
                        } else {
                            initializeFormControl(targetDomElement.next().children());
                        }
                    }
                    // Handle datalist polyfill
                    if ((datalistPolyfillNeeded) &&
                        (datalistElement = retrieveAttributeValue(targetDomElement, 'list')) &&
                        (datalistElement = jq('#' + datalistElement)) &&
                        ('autocomplete' in targetDomElement)) {
                        var valuesArray = new Array();
                        if (datalistElement.find('option').length) {
                            datalistElement.find('option').each(function() {
                                valuesArray.push(jq(this).val());
                            });
                        } else if (dataOptionString = datalistElement.attr('data-option')) {
                            valuesArray = jq.parseJSON(dataOptionString);
                        }
                        // Remove 'list' attribute to prevent browser's native datalist
                        targetDomElement.removeAttr('list');

                        targetDomElement.autocomplete({
                                source: valuesArray,
                                // Prevent search on certain input methods
                                search: function(eventObject, ui) {
                                    if (eventObject.keyCode == 229) return false;
                                    return true;
                                }

                            })
                            .keyup(function(eventObject) {
                                // Trigger search on Enter key for input method output
                                if (eventObject.keyCode == 13) jq(this).autocomplete('search');
                            });
                    }

                    /**
                     * Change event handler for validation.
                     * @return {boolean} -- Indicates if further processing is necessary.
                     */
                    var handleValidationChange = (function() {

                        var validationRequired = false,
                            inputName = targetDomElement.attr('name'),
                            elementIsChecked = jq('[name="' + inputName + '"]:checked').length,
                            elementIsEmpty = ((targetDomElement.val() == '') ||
                                (targetDomElement.is(':checkbox, :radio') && !elementIsChecked));

                        // First, clear any existing validity messages
                        // NOTE: Opera handles null validity messages differently
                        assignCustomValidationMsg(jq('[name="' + inputName + '"]'), '');
                        if (enterKeyBugFix && !targetDomElement.is('select, textarea, button')) {
                            // Attach keypress event for Enter key behavior fix
                            var handleEnterKey = (function(eventObject) {
                                var characterCode = eventObject.charCode || eventObject.keyCode;
                                if (characterCode == 13) {
                                    if (droidPlatformVersion &&
                                        (nextElementIndex = allValidatableInputs.index(targetDomElement) + 1) < allValidatableInputs.length) {
                                        allValidatableInputs.eq(nextElementIndex).focus();
                                    } else {
                                        targetForm.find('[type="submit"]').eq(0).focus().click();
                                    }
                                    return false;
                                }
                                return true;
                            });
                            targetDomElement.unbind('keypress', handleEnterKey).keypress(handleEnterKey);
                            validationRequired = true;
                        }
                        // Required field validation
                        if (requiredPolyfillNeeded && retrieveAttributeValue(targetDomElement, 'required')) {
                            validationRequired = true;
                            if (elementIsEmpty) {
                                var feedbackMsg = activeConfiguration.emptyFieldNotice;
                                if (targetDomElement.is('select, :radio')) feedbackMsg = activeConfiguration.noSelectionNotice;
                                if (targetDomElement.is(':checkbox')) feedbackMsg = activeConfiguration.noCheckNotice;
                                assignCustomValidationMsg(targetDomElement, feedbackMsg);
                                return true;
                            }
                        }
                        // Pattern validation
                        if (patternPolyfillNeeded && retrieveAttributeValue(targetDomElement, 'pattern') && !elementIsEmpty) {
                            validationRequired = true;
                            var patternRegex = new RegExp('^(?:' + retrieveAttributeValue(targetDomElement, 'pattern') + ')$');
                            if (!patternRegex.test(targetDomElement.val())) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.formatMismatchNotice);
                                return true;
                            }
                        }
                        // Email validation
                        if (emailPolyfillNeeded && inputType == 'email' && !elementIsEmpty) {
                            validationRequired = true;
                            var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                            if (!emailRegex.test(targetDomElement.val())) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidEmailNotice);
                                return true;
                            }
                        }
                        // URL validation
                        if (urlPolyfillNeeded && inputType == 'url' && !elementIsEmpty) {
                            validationRequired = true;
                            var urlRegex = /^\s*https?:\/\/.*/; // Simplified URL regex
                            if (!urlRegex.test(targetDomElement.val())) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidUrlNotice);
                                return true;
                            }
                        }
                        // Number validation (min, max, step)
                        if (numberPolyfillNeeded && inputType == 'number' && !elementIsEmpty) {
                            validationRequired = true;
                            var numVal = parseFloat(targetDomElement.val());
                            if (isNaN(numVal)) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidNumberNotice);
                                return true;
                            }
                            var minimumVal = attributeToNumber(targetDomElement, 'min', -Infinity),
                                maximumVal = attributeToNumber(targetDomElement, 'max', Infinity),
                                currentStep = attributeToNumber(targetDomElement, 'step', 1);

                            if (numVal < minimumVal) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.minimumValueNotice.replace('#', minimumVal));
                                return true;
                            }
                            if (numVal > maximumVal) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.maximumValueNotice.replace('#', maximumVal));
                                return true;
                            }
                            if (currentStep > 0 && ((numVal - minimumVal) % currentStep) !== 0) { // Check step validity
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidStepNotice);
                                return true;
                            }
                        }
                        // Maxlength validation (for non-textarea elements, or if polyfill needed for textarea)
                        if (maxLengthPolyfillNeeded && !targetDomElement.is('textarea') &&
                            (maxLengthLimit = retrieveAttributeValue(targetDomElement, 'maxlength'))) {
                            validationRequired = true;
                            if (targetDomElement.val().length > maxLengthLimit) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.maxLengthNotice.replace('#', maxLengthLimit));
                                return true;
                            }
                        }
                        // Datetime validation (datetime, datetime-local)
                        if ((datetimePolyfillNeeded && inputType == 'datetime') ||
                            (datetimeLocalPolyfillNeeded && inputType == 'datetime-local')) {
                            validationRequired = true;
                            var parsed = parseLocalDatetime(targetDomElement.val(), inputType == 'datetime-local');
                            if (!parsed[0] || !parsed[1]) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidDatetimeNotice);
                                return true;
                            }
                            // Further min/max datetime validation would go here
                        }
                        // Date validation
                        if (datePolyfillNeeded && inputType == 'date' && !elementIsEmpty) {
                            validationRequired = true;
                            // Simple date format YYYY-MM-DD
                            var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                            if (!dateRegex.test(targetDomElement.val())) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidDateNotice);
                                return true;
                            }
                            // Date range validation
                            var inputDate = new Date(targetDomElement.val());
                            var minimumDate = retrieveAttributeValue(targetDomElement, 'min') ? new Date(retrieveAttributeValue(targetDomElement, 'min')) : null;
                            var maximumDate = retrieveAttributeValue(targetDomElement, 'max') ? new Date(retrieveAttributeValue(targetDomElement, 'max')) : null;

                            if (minimumDate && inputDate < minimumDate) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.minimumValueNotice.replace('#', retrieveAttributeValue(targetDomElement, 'min')));
                                return true;
                            }
                            if (maximumDate && inputDate > maximumDate) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.maximumValueNotice.replace('#', retrieveAttributeValue(targetDomElement, 'max')));
                                return true;
                            }
                        }
                        // Time validation
                        if (timePolyfillNeeded && inputType == 'time' && !elementIsEmpty) {
                            validationRequired = true;
                            // Simple time format HH:MM or HH:MM:SS
                            var timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
                            if (!timeRegex.test(targetDomElement.val())) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.invalidTimeNotice);
                                return true;
                            }
                            // Time range validation (more complex, using seconds)
                            var inputSeconds = str2sec(targetDomElement.val(), false);
                            var minSeconds = retrieveAttributeValue(targetDomElement, 'min') ? str2sec(retrieveAttributeValue(targetDomElement, 'min'), false) : -Infinity;
                            var maxSeconds = retrieveAttributeValue(targetDomElement, 'max') ? str2sec(retrieveAttributeValue(targetDomElement, 'max'), false) : Infinity;

                            if (inputSeconds < minSeconds) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.minimumValueNotice.replace('#', retrieveAttributeValue(targetDomElement, 'min')));
                                return true;
                            }
                            if (inputSeconds > maxSeconds) {
                                assignCustomValidationMsg(targetDomElement, activeConfiguration.maximumValueNotice.replace('#', retrieveAttributeValue(targetDomElement, 'max')));
                                return true;
                            }
                        }

                        return validationRequired; // Return true if any validation was performed
                    });

                    // Attach the change event listener
                    targetDomElement.change(function() {
                        if (handleValidationChange()) {
                            displayFeedbackBalloon(targetDomElement, targetDomElement.data('customValidity') || targetDomElement[0].validationMessage);
                        } else {
                            jq(this).siblings(activeConfiguration.feedbackElementSelector).remove();
                            for (styleProp in activeConfiguration.problemDisplayStyles) {
                                jq(this).css(styleProp, '');
                            }
                        }
                    });

                    // Initial check for elements that already have issues (e.g., server-side validation)
                    if (!isFirstPass && !jq.fn.formWiz.verifyInputValidity(targetDomElement)) {
                        targetDomElement.change();
                    }
                });
            };

            // Helper for parsing local datetime strings
            var parseLocalDatetime = function(dateTimeStr, isLocal) {
                var datePart = '',
                    timePart = '';
                if (dateTimeStr) {
                    var parts = dateTimeStr.split('T');
                    datePart = parts[0];
                    if (parts.length > 1) {
                        timePart = parts[1];
                    }
                }
                return [datePart, timePart];
            };

            // Helper to get local timezone offset string (e.g., "+09:00")
            var getTimezoneOffsetString = function() {
                var offsetMinutes = new Date().getTimezoneOffset(); // returns difference in minutes between UTC and local time
                var sign = offsetMinutes > 0 ? '-' : '+';
                var absOffset = Math.abs(offsetMinutes);
                var hours = Math.floor(absOffset / 60);
                var minutes = absOffset % 60;
                return sign + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            };

            // Initialize all validatable controls in the form
            initializeFormControl(allValidatableInputs, true);

            // Handle form submission
            targetForm.submit(function(eventObject) {
                // Clear all previous balloons before new validation
                jq(activeConfiguration.feedbackElementSelector).remove();
                jq(activeConfiguration.hiddenControlSelector).removeAttr('disabled');

                var firstInvalidElement = null;

                // Iterate through all validatable elements to check validity
                allValidatableInputs.each(function() {
                    var currentElement = jq(this);
                    assignCustomValidationMsg(currentElement, ''); // Clear message first
                    handleValidationChange.call(this); // Trigger change handler for validation logic

                    if (!jq.fn.formWiz.verifyInputValidity(currentElement)) {
                        if (!firstInvalidElement) {
                            firstInvalidElement = currentElement;
                        }
                    }
                });

                if (firstInvalidElement) {
                    displayFeedbackBalloon(firstInvalidElement, firstInvalidElement.data('customValidity') || firstInvalidElement[0].validationMessage);
                    eventObject.preventDefault(); // Prevent form submission
                    return false;
                } else {
                    // If all valid, remove any remaining error styles
                    allValidatableInputs.each(function() {
                        for (styleProp in activeConfiguration.problemDisplayStyles) {
                            jq(this).css(styleProp, '');
                        }
                    });
                }
            });

            // Focus on the first autofocus element if available
            if (autoFocusElement) {
                autoFocusElement.focus();
            }

            // Handle dynamic HTML content
            jq(activeConfiguration.dynamicHtmlContainer).on('DOMNodeInserted', function(eventObject) {
                initializeFormControl(jq(eventObject.target).find(validateCandidateSelector), false);
            });
        });

    };

})(jQuery); // Pass jQuery object as 'jq' alias