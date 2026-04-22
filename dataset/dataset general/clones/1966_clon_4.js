(function() {

    // --- Browser and Feature Detection ---
    const currentAgent = window.navigator.userAgent.toLowerCase();
    const documentMode = document.documentMode;

    const browserCapabilities = {
        isIE: !!documentMode || currentAgent.includes('msie'),
        ieVersion: documentMode || (currentAgent.includes('msie') ? parseInt(currentAgent.split('msie ')[1]) : 0),
        isFirefox: currentAgent.includes('firefox'),
        firefoxVersion: currentAgent.includes('firefox') ? parseInt(currentAgent.split('firefox/')[1]) : 0,
        isChrome: currentAgent.includes('chrome'),
        chromeVersion: currentAgent.includes('chrome') ? parseInt(currentAgent.split('chrome/')[1]) : 0,
        isOpera: currentAgent.includes('opera') || currentAgent.includes('opr'),
        operaVersion: currentAgent.includes('opera') ? parseInt(currentAgent.split('opera ')[1] || currentAgent.split('opera/')[1]) : 0,
        isSafari: currentAgent.includes('safari') && !currentAgent.includes('chrome'),
        safariVersion: currentAgent.includes('version/') ? parseInt(currentAgent.split('version/')[1]) : 0,
        isAndroid: currentAgent.includes('android'),
        androidVersion: currentAgent.includes('android') ? parseInt(currentAgent.split('android ')[1]) : 0,
    };

    // Feature test elements
    const featureTestInput = document.createElement('input');
    featureTestInput.style.display = 'none';
    document.body.appendChild(featureTestInput); // Temporarily add to DOM for feature detection
    const featureTestTextarea = document.createElement('textarea');

    const needsCustomValidityPolyfill = !('setCustomValidity' in featureTestInput) || browserCapabilities.isAndroid;
    const needsAutofocusPolyfill = !('autofocus' in featureTestInput);
    const needsRequiredPolyfill = !('required' in featureTestInput) || browserCapabilities.isAndroid;
    const needsPatternPolyfill = !('pattern' in featureTestInput) || browserCapabilities.isAndroid;
    const needsPlaceholderPolyfill = !('placeholder' in featureTestInput);

    // Spinners, number, range
    const needsSpinnersPolyfill = !('step' in featureTestInput) || !('min' in featureTestInput) || !!browserCapabilities.isFirefox || !!browserCapabilities.isIE;
    const needsNumberPolyfill = (!!browserCapabilities.isAndroid || (needsSpinnersPolyfill && !(browserCapabilities.ieVersion > 9)));
    const needsRangePolyfill = needsNumberPolyfill && !(browserCapabilities.firefoxVersion > 22);

    // Date/Time inputs
    const needsDateTimeLocalPolyfill = !(browserCapabilities.operaVersion > 8 || browserCapabilities.chromeVersion > 24);
    const needsDateTimePolyfill = !(browserCapabilities.operaVersion > 8);
    const needsDatePolyfill = needsDateTimeLocalPolyfill && !(browserCapabilities.chromeVersion > 21);
    const needsTimePolyfill = needsDateTimeLocalPolyfill && !(browserCapabilities.chromeVersion > 22);
    const needsMonthPolyfill = needsDateTimeLocalPolyfill; // Chrome version unknown

    const needsMaxlengthPolyfill = !('maxLength' in featureTestTextarea);
    const needsFormAttributePolyfill = !('form' in featureTestInput) || !('formAction' in featureTestInput) || browserCapabilities.isAndroid;
    const needsDatalistPolyfill = !('autocomplete' in featureTestInput) || !('list' in featureTestInput);
    const needsBuggyButtonFix = (browserCapabilities.isIE && browserCapabilities.ieVersion < 8);
    const needsBuggyEnterKeyFix = (browserCapabilities.isIE && browserCapabilities.ieVersion < 9) || browserCapabilities.isAndroid;

    // Remove temporary test element
    document.body.removeChild(featureTestInput);

    // --- Configuration ---
    const standardSettings = {
        errorDisplayClass: 'feedback-response',
        hiddenInputClass: '.behind-control',
        errorHighlightStyle: { backgroundColor: 'mistyrose' },
        placeholderDisplayClass: 'input-placeholder',
        messageEmptyField: 'Please complete this required field.',
        messageUnselected: 'Kindly select an option.',
        messageUnchecked: 'Kindly mark this checkbox.',
        messagePatternMismatch: 'Input does not match the expected format.',
        messageEmailInvalid: 'Provided e-mail address is incorrect.',
        messageUrlInvalid: 'Provided URL is incorrect.',
        messageNumberInvalid: 'Provided number is incorrect.',
        messageDatetimeInvalid: 'Provided date and time are incorrect.',
        messageDateInvalid: 'Provided date is incorrect.',
        messageTimeInvalid: 'Provided time is incorrect.',
        messageStepMismatch: 'Value does not match the specified step interval.',
        messageMinValue: 'Value must be greater than or equal to #.',
        messageMaxValue: 'Value must be less than or equal to #.',
        messageMaxCharacters: 'Exceeds maximum # characters.',
        rangeIndicatorClass: 'value-range',
        timeSpinnerClass: 'time-spinner',
        datetimeContainerClass: 'full-datetime',
        dateInputMask: '9999-99-99',
        monthInputMask: '9999-99',
        timeInputMask: '99:99',
        spinnerTip: 'Hold Shift for hour adjustment, Ctrl for fine steps.',
        extraSettings: {},
        dynamicContentArea: '.auto-update-area'
    };

    // --- Utility Functions ---

    function retrieveAttribute(element, attributeName) {
        const value = element.getAttribute(attributeName);
        return value === null ? '' : value;
    }

    function getOuterHtmlString(element) {
        return element.outerHTML || new XMLSerializer().serializeToString(element);
    }

    function timeStringToSeconds(timeString, includeSeconds = false) {
        if (!timeString) return 0;
        const parts = timeString.split(':').map(Number);
        let seconds = parts[0] * 3600 + parts[1] * 60;
        if (includeSeconds && parts.length > 2) {
            seconds += parts[2];
        }
        return seconds;
    }

    function secondsToTimeString(totalSeconds, precisionSeconds, includeSeconds = false) {
        totalSeconds = Math.max(0, totalSeconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        if (includeSeconds || precisionSeconds < 60) {
             result += `:${seconds.toString().padStart(2, '0')}`;
        }
        return result;
    }

    function parseLocalTimestamp(datetimeString, isLocalFormat) {
        if (!datetimeString) return ['', ''];
        const separator = isLocalFormat ? 'T' : ' ';
        const parts = datetimeString.split(separator);
        return [parts[0] || '', parts[1] || ''];
    }

    function getCurrentTimezone() {
        const date = new Date();
        const offsetMinutes = date.getTimezoneOffset();
        const sign = offsetMinutes > 0 ? '-' : '+';
        const absOffset = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
        const minutes = (absOffset % 60).toString().padStart(2, '0');
        return `GMT${sign}${hours}:${minutes}`;
    }

    function readNumericAttribute(element, attributeName, defaultValue) {
        const value = retrieveAttribute(element, attributeName);
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function reconstructInputType(originalInput, newType, originalTypeClassSuffix) {
        const newElement = document.createElement('input');
        const attributesToCopy = ['class', 'id', 'name', 'value', 'min', 'max', 'step', 'placeholder', 'title', 'required', 'disabled', 'readonly'];

        for (const attrName of attributesToCopy) {
            const attrValue = retrieveAttribute(originalInput, attrName);
            if (attrValue !== '') {
                newElement.setAttribute(attrName, attrValue);
            }
        }
        if (originalInput.hasAttribute('required')) newElement.setAttribute('required', '');
        if (originalInput.hasAttribute('disabled')) newElement.setAttribute('disabled', '');
        if (originalInput.hasAttribute('readonly')) newElement.setAttribute('readonly', '');
        if (originalInput.hasAttribute('checked')) newElement.setAttribute('checked', '');

        newElement.setAttribute('type', newType);
        newElement.classList.add(`cloned-${originalTypeClassSuffix}`);

        originalInput.parentNode.replaceChild(newElement, originalInput);
        return newElement;
    }

    // --- Global State & Event Listeners (for modifier keys) ---
    let shiftModifierActive = false;
    let controlModifierActive = false;

    function trackModifierKeys(event, isActive) {
        if (event.keyCode === 17) controlModifierActive = isActive;
        if (event.keyCode === 16) shiftModifierActive = isActive;
    }

    document.addEventListener('keydown', (e) => trackModifierKeys(e, true));
    document.addEventListener('keyup', (e) => trackModifierKeys(e, false));

    // --- Validation and Error Display ---

    let isFirstFormProcess = true;
    let globalNoValidate = false;

    function updateValidationStatus(inputElement, message, currentSettings) {
        if (globalNoValidate) message = '';

        if (inputElement.matches('input:enabled:not([type="button"], [type="submit"], [type="hidden"]), select:enabled, textarea:enabled')) {
            let fullMessage = message;
            const existingTitle = retrieveAttribute(inputElement, 'title');
            if (message && existingTitle) {
                fullMessage = `${message.trim()}\n${existingTitle}`;
            }

            if (needsCustomValidityPolyfill) {
                if (fullMessage) {
                    inputElement.dataset.customValidityMessage = fullMessage.replace(/\n/, '<br />');
                } else {
                    delete inputElement.dataset.customValidityMessage;
                }

                if (!isFirstFormProcess && currentSettings.errorHighlightStyle) {
                    for (const prop in currentSettings.errorHighlightStyle) {
                        if (currentSettings.errorHighlightStyle.hasOwnProperty(prop)) {
                            inputElement.style[prop] = fullMessage ? currentSettings.errorHighlightStyle[prop] : '';
                        }
                    }
                }
            } else {
                inputElement.setCustomValidity(fullMessage);
            }
        }
    }

    function isInputValid(inputElement) {
        if (needsCustomValidityPolyfill) {
            return !inputElement.dataset.customValidityMessage;
        } else {
            return inputElement.checkValidity();
        }
    }

    function presentErrorMessage(inputElement, message, currentSettings) {
        let existingError = inputElement.previousElementSibling;
        const baseErrorClass = currentSettings.errorDisplayClass.split(',')[0].trim();
        const errorClassName = baseErrorClass.startsWith('.') ? baseErrorClass.substring(1) : baseErrorClass;

        if (!existingError || !existingError.classList.contains(errorClassName)) {
            const errorElement = document.createElement('span');
            const responseClasses = currentSettings.errorDisplayClass.split(',').map(cls => cls.trim().replace('.', ''));
            const classNameToUse = (window.innerWidth - inputElement.getBoundingClientRect().left < 300 && responseClasses.length > 1)
                ? responseClasses[1] : responseClasses[0];
            errorElement.classList.add(classNameToUse);
            inputElement.parentNode.insertBefore(errorElement, inputElement);
            existingError = errorElement;

            document.querySelectorAll(currentSettings.hiddenInputClass).forEach(el => el.setAttribute('disabled', 'disabled'));
        }
        existingError.innerHTML = `<p>${message.replace(/\n/, '<br/>')}</p>`;
        inputElement.focus();
        inputElement.select();
    }

    // --- Main Form Enhancer Function ---

    window.formEnhancer = function(elements, customConfiguration = {}) {
        const targetElements = elements instanceof NodeList ? Array.from(elements) : [elements];
        const currentSettings = { ...standardSettings, ...customConfiguration };

        Object.assign(currentSettings, currentSettings.extraSettings);

        document.addEventListener('click', function(event) {
            const target = event.target;
            const baseErrorClass = currentSettings.errorDisplayClass.split(',')[0].trim();
            const errorClassName = baseErrorClass.startsWith('.') ? baseErrorClass.substring(1) : baseErrorClass;

            if (target.closest(`.${errorClassName}`)) {
                target.remove();
            }
            if (target.matches('input:enabled:not([type="button"], [type="submit"], [type="hidden"]), select:enabled, textarea:enabled')) {
                let errorSibling = target.previousElementSibling;
                if (errorSibling && errorSibling.classList.contains(errorClassName)) {
                    errorSibling.remove();
                }
                document.querySelectorAll(currentSettings.hiddenInputClass).forEach(el => el.removeAttribute('disabled'));
            }
        });

        targetElements.forEach(rootElement => {
            if (!rootElement.hasAttribute('data-enhanced-processed')) {
                rootElement.setAttribute('data-enhanced-processed', 'true');

                const isForm = rootElement.tagName === 'FORM';
                if (isForm) {
                    globalNoValidate = !!getOuterHtmlString(rootElement).match(/^[^>]+ novalidate/i);
                }

                let initialFocusElement;
                const processableInputs = Array.from(rootElement.querySelectorAll('input:enabled:not([type="button"], [type="submit"], [type="hidden"]), select:enabled, textarea:enabled'));

                function processInputField(inputElement, isInitialPass) {
                    isFirstFormProcess = isInitialPass;

                    const inputType = retrieveAttribute(inputElement, 'type').toLowerCase();

                    if (needsAutofocusPolyfill && !initialFocusElement && retrieveAttribute(inputElement, 'autofocus')) {
                        initialFocusElement = inputElement;
                    }

                    const placeholderText = retrieveAttribute(inputElement, 'placeholder');
                    if (needsPlaceholderPolyfill && placeholderText) {
                        const placeholderDisplay = document.createElement('span');
                        placeholderDisplay.classList.add(currentSettings.placeholderDisplayClass);
                        placeholderDisplay.textContent = placeholderText;
                        inputElement.parentNode.insertBefore(placeholderDisplay, inputElement);
                        placeholderDisplay.addEventListener('click', () => inputElement.focus());

                        const updatePlaceholderVisibility = () => {
                            placeholderDisplay.style.display = inputElement.value.length > 0 ? 'none' : '';
                        };
                        inputElement.addEventListener('input', updatePlaceholderVisibility);
                        inputElement.addEventListener('change', updatePlaceholderVisibility);
                        inputElement.addEventListener('focus', updatePlaceholderVisibility);
                        inputElement.addEventListener('blur', updatePlaceholderVisibility);
                        updatePlaceholderVisibility();
                        inputElement.removeAttribute('placeholder');
                    }

                    if (needsSpinnersPolyfill && (inputType === 'number' || inputType === 'time')) {
                        const originalType = inputType;
                        let processedInput = reconstructInputType(inputElement, 'text', originalType);

                        const spinnerWrapper = document.createElement('div');
                        spinnerWrapper.classList.add('custom-spinner-wrapper');
                        processedInput.parentNode.insertBefore(spinnerWrapper, processedInput);
                        spinnerWrapper.appendChild(processedInput);

                        const upButton = document.createElement('button');
                        upButton.textContent = '▲';
                        upButton.classList.add('spinner-up-button');
                        upButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (originalType === 'number') adjustNumericValue(processedInput, false);
                            else adjustTimeValue(processedInput, false);
                            processedInput.dispatchEvent(new Event('change', { bubbles: true }));
                            processedInput.focus();
                        });
                        spinnerWrapper.appendChild(upButton);

                        const downButton = document.createElement('button');
                        downButton.textContent = '▼';
                        downButton.classList.add('spinner-down-button');
                        downButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (originalType === 'number') adjustNumericValue(processedInput, true);
                            else adjustTimeValue(processedInput, true);
                            processedInput.dispatchEvent(new Event('change', { bubbles: true }));
                            processedInput.focus();
                        });
                        spinnerWrapper.appendChild(downButton);

                        upButton.setAttribute('title', currentSettings.spinnerTip);
                        downButton.setAttribute('title', currentSettings.spinnerTip);


                        if (originalType === 'time' && currentSettings.timeInputMask) {
                            applyInputMask(processedInput, currentSettings.timeInputMask);
                        }

                        inputElement = processedInput;
                    }

                    if ((needsDatePolyfill && inputType === 'date') || (needsMonthPolyfill && inputType === 'month')) {
                        const originalType = inputType;
                        let processedInput = reconstructInputType(inputElement, 'text', originalType);
                        const mask = (inputType === 'date') ? currentSettings.dateInputMask : currentSettings.monthInputMask;
                        if (mask) {
                            applyInputMask(processedInput, mask);
                        }
                        inputElement = processedInput;
                    }

                    if (needsRangePolyfill && inputType === 'range') {
                        const originalType = inputType;
                        let processedInput = reconstructInputType(inputElement, 'text', originalType);
                        processedInput.style.display = 'none';

                        const minVal = readNumericAttribute(processedInput, 'min', 0);
                        const maxVal = readNumericAttribute(processedInput, 'max', 100);
                        const stepVal = readNumericAttribute(processedInput, 'step', 1);
                        let initialVal = readNumericAttribute(processedInput, 'value', (minVal + maxVal) / 2);
                        initialVal = minVal + Math.round((initialVal - minVal) / stepVal) * stepVal;

                        processedInput.value = initialVal.toString();

                        const rangeVisualContainer = document.createElement('span');
                        rangeVisualContainer.classList.add(currentSettings.rangeIndicatorClass);
                        processedInput.parentNode.insertBefore(rangeVisualContainer, processedInput.nextSibling);

                        const rangeSlider = document.createElement('div');
                        rangeVisualContainer.appendChild(rangeSlider);

                        const rangeThumb = document.createElement('div');
                        rangeThumb.classList.add('custom-range-thumb');
                        rangeSlider.appendChild(rangeThumb);

                        const updateVisual = () => {
                            const val = parseFloat(processedInput.value);
                            const percent = ((val - minVal) / (maxVal - minVal)) * 100;
                            rangeThumb.style.left = `${percent}%`;
                            rangeSlider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percent}%, #ddd ${percent}%, #ddd 100%)`;
                        };

                        let isDragging = false;
                        rangeThumb.addEventListener('mousedown', (e) => {
                            isDragging = true;
                            rangeThumb.classList.add('active');
                            e.preventDefault();
                        });
                        document.addEventListener('mousemove', (e) => {
                            if (!isDragging) return;
                            const rect = rangeSlider.getBoundingClientRect();
                            let clientX = e.clientX;

                            if (clientX < rect.left) clientX = rect.left;
                            if (clientX > rect.right) clientX = rect.right;

                            const rawPercent = (clientX - rect.left) / rect.width;
                            let newValue = minVal + rawPercent * (maxVal - minVal);
                            newValue = minVal + Math.round((newValue - minVal) / stepVal) * stepVal;
                            newValue = Math.max(minVal, Math.min(maxVal, newValue));

                            if (parseFloat(processedInput.value) !== newValue) {
                                processedInput.value = newValue.toString();
                                processedInput.dispatchEvent(new Event('input', { bubbles: true }));
                                processedInput.dispatchEvent(new Event('change', { bubbles: true }));
                                updateVisual();
                            }
                        });
                        document.addEventListener('mouseup', () => {
                            isDragging = false;
                            rangeThumb.classList.remove('active');
                        });

                        processedInput.addEventListener('input', updateVisual);
                        processedInput.addEventListener('change', updateVisual);
                        updateVisual();

                        inputElement = processedInput;
                    }

                    if (needsMaxlengthPolyfill && inputElement.tagName === 'TEXTAREA') {
                        const maxLength = parseInt(retrieveAttribute(inputElement, 'maxlength'), 10);
                        if (!isNaN(maxLength) && maxLength > 0) {
                            const enforceMaxLength = (e) => {
                                if (inputElement.value.length > maxLength) {
                                    inputElement.value = inputElement.value.substring(0, maxLength);
                                }
                            };
                            inputElement.addEventListener('input', enforceMaxLength);
                            inputElement.addEventListener('paste', () => setTimeout(enforceMaxLength, 0));
                            inputElement.addEventListener('cut', () => setTimeout(enforceMaxLength, 0));
                        }
                    }

                    if ((needsDateTimeLocalPolyfill && inputType === 'datetime-local') || (needsDateTimePolyfill && inputType === 'datetime')) {
                        const originalType = inputType;
                        inputElement.style.display = 'none';

                        const datetimeValue = retrieveAttribute(inputElement, 'value');
                        const minDatetime = retrieveAttribute(inputElement, 'min');
                        const maxDatetime = retrieveAttribute(inputElement, 'max');

                        const [datePart, timePart] = parseLocalTimestamp(datetimeValue, inputType === 'datetime-local');
                        const [minDatePart, minTimePart] = parseLocalTimestamp(minDatetime, inputType === 'datetime-local');
                        const [maxDatePart, maxTimePart] = parseLocalTimestamp(maxDatetime, inputType === 'datetime-local');

                        const datetimeContainer = document.createElement('span');
                        datetimeContainer.classList.add(currentSettings.datetimeContainerClass);
                        inputElement.parentNode.insertBefore(datetimeContainer, inputElement.nextSibling);

                        const dateInput = document.createElement('input');
                        dateInput.setAttribute('type', 'date');
                        dateInput.setAttribute('value', datePart);
                        dateInput.setAttribute('min', minDatePart);
                        dateInput.setAttribute('max', maxDatePart);
                        dateInput.classList.add(`cloned-${originalType}-date`);
                        dateInput.setAttribute('size', retrieveAttribute(inputElement, 'size'));
                        dateInput.setAttribute('class', retrieveAttribute(inputElement, 'class'));
                        dateInput.setAttribute('title', retrieveAttribute(inputElement, 'title'));
                        datetimeContainer.appendChild(dateInput);

                        const timeInput = document.createElement('input');
                        timeInput.setAttribute('type', 'time');
                        timeInput.setAttribute('value', timePart);
                        timeInput.setAttribute('step', retrieveAttribute(inputElement, 'step') || '60');
                        timeInput.classList.add(`cloned-${originalType}-time`);
                        timeInput.setAttribute('size', retrieveAttribute(inputElement, 'size'));
                        timeInput.setAttribute('class', retrieveAttribute(inputElement, 'class'));
                        timeInput.setAttribute('title', retrieveAttribute(inputElement, 'title'));
                        datetimeContainer.appendChild(timeInput);

                        if (inputType === 'datetime') {
                            const timezoneSpan = document.createElement('span');
                            timezoneSpan.classList.add('cloned-timezone-display');
                            timezoneSpan.textContent = getCurrentTimezone();
                            datetimeContainer.appendChild(timezoneSpan);
                        }

                        if (inputElement.hasAttribute('required')) {
                            inputElement.removeAttribute('required');
                            dateInput.setAttribute('required', '');
                            timeInput.setAttribute('required', '');
                            processInputField(dateInput, isInitialPass);
                            processInputField(timeInput, isInitialPass);
                        } else {
                            processInputField(dateInput, isInitialPass);
                            processInputField(timeInput, isInitialPass);
                        }

                        const updateOriginalValue = () => {
                            const combinedValue = `${dateInput.value}${inputType === 'datetime-local' ? 'T' : ' '}${timeInput.value}`;
                            inputElement.value = combinedValue.trim();
                            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                        };
                        dateInput.addEventListener('change', updateOriginalValue);
                        timeInput.addEventListener('change', updateOriginalValue);
                        dateInput.addEventListener('input', updateOriginalValue);
                        timeInput.addEventListener('input', updateOriginalValue);
                    }

                    if (needsDatalistPolyfill && inputElement.hasAttribute('list')) {
                        const listId = retrieveAttribute(inputElement, 'list');
                        const dataListElement = document.getElementById(listId);

                        if (dataListElement) {
                            let suggestionOptions = [];
                            Array.from(dataListElement.querySelectorAll('option')).forEach(opt => suggestionOptions.push(opt.value));
                            const dataOptionsAttr = retrieveAttribute(dataListElement, 'data-option');
                            if (dataOptionsAttr) {
                                try {
                                    const parsedOptions = JSON.parse(dataOptionsAttr);
                                    if (Array.isArray(parsedOptions)) {
                                        suggestionOptions.push(...parsedOptions);
                                    }
                                } catch (e) {
                                    console.warn(`Error parsing data-option attribute for datalist '${listId}':`, e);
                                }
                            }
                            suggestionOptions = [...new Set(suggestionOptions)];

                            inputElement.removeAttribute('list');
                            inputElement.setAttribute('autocomplete', 'off');

                            const suggestionsContainer = document.createElement('div');
                            suggestionsContainer.classList.add('custom-autocomplete-suggestions');
                            suggestionsContainer.style.display = 'none';
                            inputElement.parentNode.insertBefore(suggestionsContainer, inputElement.nextSibling);

                            const updateSuggestions = () => {
                                const inputValue = inputElement.value.toLowerCase();
                                suggestionsContainer.innerHTML = '';
                                if (inputValue.length > 0) {
                                    const filtered = suggestionOptions.filter(opt => opt.toLowerCase().includes(inputValue));
                                    if (filtered.length > 0) {
                                        filtered.forEach(opt => {
                                            const suggestionItem = document.createElement('div');
                                            suggestionItem.textContent = opt;
                                            suggestionItem.classList.add('autocomplete-item');
                                            suggestionItem.addEventListener('mousedown', (e) => {
                                                e.preventDefault();
                                                inputElement.value = opt;
                                                suggestionsContainer.style.display = 'none';
                                                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                                                inputElement.focus();
                                            });
                                            suggestionsContainer.appendChild(suggestionItem);
                                        });
                                        suggestionsContainer.style.display = 'block';
                                    } else {
                                        suggestionsContainer.style.display = 'none';
                                    }
                                } else {
                                    suggestionsContainer.style.display = 'none';
                                }
                            };

                            inputElement.addEventListener('input', updateSuggestions);
                            inputElement.addEventListener('focus', updateSuggestions);
                            inputElement.addEventListener('blur', () => {
                                setTimeout(() => {
                                    suggestionsContainer.style.display = 'none';
                                }, 150);
                            });
                        }
                    }

                    const validateAndDisplay = () => {
                        performValidation(inputElement, currentSettings, rootElement);
                    };

                    inputElement.addEventListener('input', validateAndDisplay);
                    inputElement.addEventListener('change', validateAndDisplay);
                    inputElement.addEventListener('blur', validateAndDisplay);

                    if (needsBuggyEnterKeyFix && !['select', 'textarea', 'button'].includes(inputElement.tagName.toLowerCase())) {
                        inputElement.addEventListener('keypress', (e) => {
                            if (e.keyCode === 13) {
                                e.preventDefault();

                                if (browserCapabilities.isAndroid) {
                                    const currentIndex = processableInputs.indexOf(inputElement);
                                    if (currentIndex !== -1 && currentIndex + 1 < processableInputs.length) {
                                        processableInputs[currentIndex + 1].focus();
                                    }
                                } else {
                                    const submitButton = rootElement.querySelector('[type="submit"]');
                                    if (submitButton) {
                                        submitButton.focus();
                                        submitButton.click();
                                    }
                                }
                            }
                        });
                    }

                    performValidation(inputElement, currentSettings, rootElement);
                }

                function performValidation(inputElement, currentSettings, formContext) {
                    let validationMessage = '';
                    const inputValue = inputElement.value.trim();
                    const inputType = retrieveAttribute(inputElement, 'type').toLowerCase();
                    const inputName = retrieveAttribute(inputElement, 'name');
                    const isRequired = inputElement.hasAttribute('required');
                    const hasValue = inputValue !== '';

                    updateValidationStatus(inputElement, '', currentSettings);

                    if (needsRequiredPolyfill && isRequired) {
                        let isInputEmpty = false;
                        if (inputType === 'checkbox' || inputType === 'radio') {
                            const groupElements = Array.from(formContext.querySelectorAll(`[name="${inputName}"]`));
                            isInputEmpty = !groupElements.some(el => el.checked);
                        } else if (inputElement.tagName === 'SELECT') {
                            isInputEmpty = (inputElement.selectedIndex === -1 || inputElement.options[inputElement.selectedIndex].value === '');
                        } else {
                            isInputEmpty = !hasValue;
                        }

                        if (isInputEmpty) {
                            if (inputElement.tagName === 'SELECT' || inputType === 'radio') {
                                validationMessage = currentSettings.messageUnselected;
                            } else if (inputType === 'checkbox') {
                                validationMessage = currentSettings.messageUnchecked;
                            } else {
                                validationMessage = currentSettings.messageEmptyField;
                            }
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    }

                    if (!hasValue && !isRequired) {
                        return;
                    }

                    const patternAttribute = retrieveAttribute(inputElement, 'pattern');
                    if (needsPatternPolyfill && patternAttribute) {
                        try {
                            const regex = new RegExp(patternAttribute);
                            if (!regex.test(inputValue)) {
                                validationMessage = currentSettings.messagePatternMismatch;
                                updateValidationStatus(inputElement, validationMessage, currentSettings);
                                presentErrorMessage(inputElement, validationMessage, currentSettings);
                                return;
                            }
                        } catch (e) {
                            console.warn(`Invalid regex pattern "${patternAttribute}" for input "${inputName}":`, e);
                        }
                    }

                    if (inputType === 'email' && needsPatternPolyfill) {
                        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                        if (!emailRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageEmailInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    }

                    if (inputType === 'url' && needsPatternPolyfill) {
                        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
                        if (!urlRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageUrlInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    }

                    if (inputType === 'number' || (inputElement.classList.contains('cloned-number') && hasValue)) {
                        const numValue = parseFloat(inputValue);
                        if (isNaN(numValue)) {
                            validationMessage = currentSettings.messageNumberInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }

                        const minAttr = retrieveAttribute(inputElement, 'min');
                        const maxAttr = retrieveAttribute(inputElement, 'max');
                        const stepAttr = retrieveAttribute(inputElement, 'step');

                        if (minAttr !== '') {
                            const minValue = parseFloat(minAttr);
                            if (!isNaN(minValue) && numValue < minValue) {
                                validationMessage = currentSettings.messageMinValue.replace('#', minValue);
                                updateValidationStatus(inputElement, validationMessage, currentSettings);
                                presentErrorMessage(inputElement, validationMessage, currentSettings);
                                return;
                            }
                        }
                        if (maxAttr !== '') {
                            const maxValue = parseFloat(maxAttr);
                            if (!isNaN(maxValue) && numValue > maxValue) {
                                validationMessage = currentSettings.messageMaxValue.replace('#', maxValue);
                                updateValidationStatus(inputElement, validationMessage, currentSettings);
                                presentErrorMessage(inputElement, validationMessage, currentSettings);
                                return;
                            }
                        }
                        if (stepAttr !== '') {
                            const stepValue = parseFloat(stepAttr);
                            if (!isNaN(stepValue) && stepValue > 0) {
                                const minForStep = minAttr !== '' ? parseFloat(minAttr) : 0;
                                if (Math.abs((numValue - minForStep) % stepValue) > 0.0001) {
                                    validationMessage = currentSettings.messageStepMismatch;
                                    updateValidationStatus(inputElement, validationMessage, currentSettings);
                                    presentErrorMessage(inputElement, validationMessage, currentSettings);
                                    return;
                                }
                            }
                        }
                    }

                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    const monthRegex = /^\d{4}-\d{2}$/;
                    const timeRegex = /^\d{2}:\d{2}$/;
                    const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
                    const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

                    if (inputType === 'date' || inputElement.classList.contains('cloned-date')) {
                        if (!dateRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageDateInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    } else if (inputType === 'month' || inputElement.classList.contains('cloned-month')) {
                        if (!monthRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageDateInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    } else if (inputType === 'time' || inputElement.classList.contains('cloned-time')) {
                        if (!timeRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageTimeInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    } else if (inputType === 'datetime-local' || inputElement.classList.contains('cloned-datetime-local')) {
                        if (!datetimeLocalRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageDatetimeInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    } else if (inputType === 'datetime' || inputElement.classList.contains('cloned-datetime')) {
                        if (!datetimeRegex.test(inputValue)) {
                            validationMessage = currentSettings.messageDatetimeInvalid;
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    }

                    if (inputElement.tagName !== 'TEXTAREA' && inputElement.hasAttribute('maxlength') && needsMaxlengthPolyfill) {
                        const maxLength = parseInt(retrieveAttribute(inputElement, 'maxlength'), 10);
                        if (!isNaN(maxLength) && inputValue.length > maxLength) {
                            validationMessage = currentSettings.messageMaxCharacters.replace('#', maxLength);
                            updateValidationStatus(inputElement, validationMessage, currentSettings);
                            presentErrorMessage(inputElement, validationMessage, currentSettings);
                            return;
                        }
                    }
                }

                function adjustTimeValue(inputElement, isDecrement) {
                    const minSeconds = timeStringToSeconds(retrieveAttribute(inputElement, 'min'));
                    const maxSeconds = timeStringToSeconds(retrieveAttribute(inputElement, 'max'), true) || 86400;
                    const baseStep = readNumericAttribute(inputElement, 'step', 60);

                    let currentSeconds = timeStringToSeconds(inputElement.value, true);
                    let effectiveStep = baseStep;

                    if (shiftModifierActive) effectiveStep = 3600;
                    else if (!controlModifierActive) effectiveStep = (baseStep < 600) ? 600 : baseStep;

                    currentSeconds = currentSeconds - (currentSeconds % effectiveStep) + effectiveStep * (isDecrement ? -1 : 1);

                    currentSeconds = Math.max(minSeconds, Math.min(maxSeconds, currentSeconds));

                    inputElement.value = secondsToTimeString(currentSeconds, baseStep);
                }

                function adjustNumericValue(inputElement, isDecrement) {
                    const minVal = readNumericAttribute(inputElement, 'min', -Infinity);
                    const maxVal = readNumericAttribute(inputElement, 'max', Infinity);
                    const stepVal = readNumericAttribute(inputElement, 'step', 1);
                    let currentVal = parseFloat(inputElement.value);

                    if (isNaN(currentVal)) {
                        currentVal = 0;
                    }

                    let effectiveStep = stepVal;
                    if (shiftModifierActive) effectiveStep *= 10;
                    if (controlModifierActive) effectiveStep /= 10;
                    effectiveStep = Math.max(stepVal / 100, effectiveStep);

                    let newValue = currentVal + effectiveStep * (isDecrement ? -1 : 1);

                    newValue = minVal + Math.round((newValue - minVal) / stepVal) * stepVal;

                    newValue = Math.max(minVal, Math.min(maxVal, newValue));

                    inputElement.value = newValue.toString();
                }

                function applyInputMask(inputElement, mask) {
                    const maskChars = { '9': /\d/, 'a': /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ };
                    let currentMask = mask;

                    const formatInput = (e) => {
                        let val = inputElement.value;
                        let formattedVal = '';
                        let valIdx = 0;
                        let maskIdx = 0;

                        while (maskIdx < currentMask.length && valIdx < val.length) {
                            const maskChar = currentMask[maskIdx];
                            const pattern = maskChars[maskChar];

                            if (pattern) {
                                if (pattern.test(val[valIdx])) {
                                    formattedVal += val[valIdx];
                                    valIdx++;
                                    maskIdx++;
                                } else {
                                    if (e.type === 'input' && e.data !== null) {
                                        valIdx++;
                                    } else {
                                        break;
                                    }
                                }
                            } else {
                                if (maskChar === val[valIdx]) {
                                    formattedVal += maskChar;
                                    valIdx++;
                                    maskIdx++;
                                } else {
                                    formattedVal += maskChar;
                                    maskIdx++;
                                }
                            }
                        }
                        inputElement.value = formattedVal;
                    };

                    inputElement.addEventListener('input', formatInput);
                    inputElement.addEventListener('paste', () => setTimeout(formatInput, 0));
                    inputElement.addEventListener('focus', formatInput);
                }

                processableInputs.forEach(input => processInputField(input, true));

                if (initialFocusElement) {
                    initialFocusElement.focus();
                }

                if (isForm) {
                    rootElement.addEventListener('submit', function(event) {
                        let formValidityOverall = true;
                        let firstInvalidElement = null;

                        processableInputs.forEach(input => {
                            performValidation(input, currentSettings, rootElement);
                            if (!isInputValid(input)) {
                                formValidityOverall = false;
                                if (!firstInvalidElement) {
                                    firstInvalidElement = input;
                                }
                            }
                        });

                        if (!formValidityOverall) {
                            event.preventDefault();
                            if (firstInvalidElement) {
                                firstInvalidElement.focus();
                                const errorMessage = firstInvalidElement.dataset.customValidityMessage || currentSettings.messageEmptyField;
                                presentErrorMessage(firstInvalidElement, errorMessage, currentSettings);
                            }
                        }
                    });
                }
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('form').forEach(form => {
            window.formEnhancer(form, {});
        });
    });

})();