(function (JQLib, undefined) {

    // Declare a namespace for our UI components, ensuring it exists.
    JQLib.ui = JQLib.ui || {};
    JQLib.extend(JQLib.ui, { clockPicker: { componentVersion: "0.2.9_mod"} });

    // Key to store instance data on DOM elements.
    const WIDGET_KEY = 'clockpickerInstance';
    // Global counter for unique instance IDs.
    let globalInstanceCounter = 0;

    /**
     * ClockWidget: Manages the lifecycle and display of time selection widgets.
     * This singleton object handles global settings and instance management.
     */
    function ClockWidget() {
        // Flag for enabling detailed console output.
        this.enableDebugging = false;

        // Currently active widget instance.
        this._activeWidgetInstance = null;
        // True if the widget is displayed directly in the DOM, not as a popup.
        this._inlineModeActive = false;
        // Array of input fields where the clock picker is deactivated.
        this._deactivatedInputs = [];
        // Indicates if the popup clock picker is currently visible.
        this._isDisplayingClock = false;
        // True if the widget is within a modal/dialog context.
        this._inModalContext = false;

        // CSS class for dialog-based widgets.
        this._modalClassIdentifier = 'ui-clockpicker-modal';
        // HTML ID for the main container element.
        this._primaryPanelId = 'ui-clockpicker-main-panel';
        // CSS class for inline widgets.
        this._inlinePanelClass = 'ui-clockpicker-inline';
        // CSS class for marking the currently selected hour/minute.
        this._currentSelectionClass = 'ui-clockpicker-current-time';
        // CSS class for hover effect on time cells.
        this._hoverStateClass = 'ui-clockpicker-cell-hover';

        // Store various regional settings indexed by language code.
        this.localeConfigs = [];
        // Default localization settings.
        this.localeConfigs[''] = {
            hourLabel: 'Hours',             // Text for the hours section.
            minuteLabel: 'Minutes',         // Text for the minutes section.
            dayPeriodLabels: ['AM', 'PM'],  // Labels for AM/PM periods.
            confirmButtonText: 'Confirm',   // Text for the confirmation button.
            setNowButtonText: 'Now',        // Text for the button to set current time.
            clearButtonText: 'Clear'        // Text for the button to clear selection.
        };

        // Default configuration options for all clock picker instances.
        this._baseOptions = {
            triggerEvent: 'focus',          // 'focus', 'button', or 'both'.
            triggerButton: null,            // Selector for an element that triggers the picker.
            animationEffect: 'fadeIn',      // jQuery animation name for popup.
            animationOptions: {},           // Additional options for animations.
            suffixText: '',                 // Text appended after the input field.

            beforePopupShow: null,          // Callback before the picker is shown.
            onTimeSelected: null,           // Callback after a time is chosen.
            onPickerClosed: null,           // Callback after the picker closes.

            timeDelimiter: ':',             // Character separating hours and minutes.
            periodDelimiter: ' ',           // Character separating time from AM/PM.
            displayPeriod: false,           // Show AM/PM.
            displayPeriodLabels: true,      // Show AM/PM labels in the picker grid.
            leadingZeroHours: true,         // Display leading zero for hours < 10.
            leadingZeroMinutes: true,       // Display leading zero for minutes < 10.
            alternateField: '',             // Selector for an alternative input to store time.
            initialTime: 'now',             // Default time ('now', '', or specific time string).
            popupMyPosition: 'left top',    // Position of the picker relative to the input.
            popupAtPosition: 'left bottom', // Position of the input element to align with.

            // Callbacks for enabling/disabling specific time cells.
            onHourDisplay: null,            // function(hour) { return true; }
            onMinuteDisplay: null,          // function(hour, minute) { return true; }

            hourRange: {
                start: 0,                   // First displayed hour.
                end: 23                     // Last displayed hour.
            },
            minuteRange: {
                start: 0,                   // First displayed minute.
                end: 55,                    // Last displayed minute.
                step: 5                     // Interval for displayed minutes.
            },
            gridRows: 4,                    // Number of rows for the time grid.

            displayHoursSection: true,      // Show the hours selection grid.
            displayMinutesSection: true,    // Show the minutes selection grid.
            allowPartialHours: false,       // Allow inputs like "9" to mean "9:00".

            // Control button visibility.
            showConfirmButton: false,       // Display 'Done' button.
            showSetNowButton: false,        // Display 'Now' button.
            showClearButton: false          // Display 'Deselect' button.
        };
        // Merge default regional settings into base options.
        JQLib.extend(this._baseOptions, this.localeConfigs['']);

        // Create the main widget container element, hidden by default.
        this.mainContainer = JQLib(`<div id="${this._primaryPanelId}" class="ui-clockpicker ui-widget ui-helper-clearfix ui-corner-all" style="display: none"></div>`);
    }

    JQLib.extend(ClockWidget.prototype, {
        // CSS class indicating an element is already configured.
        initializedWidgetClass: 'hasClockPicker',

        // Outputs messages to the console if debugging is enabled.
        debugLog: function (...messages) {
            if (this.enableDebugging) {
                console.log('[ClockPicker Debug]', ...messages);
            }
        },

        // Returns the main widget element.
        getWidgetElement: function () {
            return this.mainContainer;
        },

        /**
         * Overrides global default settings for all instances.
         * @param {object} newSettings - New settings to apply.
         * @returns {ClockWidget} The manager object.
         */
        configureGlobalOptions: function (newSettings) {
            // Helper to deep merge and remove properties if their value is undefined.
            const deepMergeAndRemove = (target, source) => {
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (source[key] === undefined) {
                            delete target[key];
                        } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
                            deepMergeAndRemove(target[key], source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            };
            deepMergeAndRemove(this._baseOptions, newSettings || {});
            return this;
        },

        /**
         * Attaches the clock picker functionality to a target element.
         * @param {HTMLElement} targetElement - The input field, div, or span.
         * @param {object} widgetSettings - Instance-specific settings.
         */
        _bindClockWidget: function (targetElement, widgetSettings) {
            if (!targetElement) {
                this.debugLog('Attempted to bind to a null or undefined targetElement.');
                return;
            }

            let elementOptions = null;
            // Extract settings directly from data attributes on the element (e.g., data-clock-option="value").
            for (const key of Object.keys(this._baseOptions)) {
                const attrValue = targetElement.getAttribute(`data-clock-${key}`);
                if (attrValue !== null) {
                    elementOptions = elementOptions || {};
                    try {
                        // Attempt to parse as JSON for complex types, otherwise treat as string.
                        elementOptions[key] = JSON.parse(attrValue);
                    } catch (err) {
                        elementOptions[key] = attrValue;
                    }
                }
            }

            const nodeType = targetElement.nodeName.toLowerCase();
            const isInlineElement = (nodeType === 'div' || nodeType === 'span');

            // Assign a unique ID if the element doesn't have one.
            if (!targetElement.id) {
                globalInstanceCounter++;
                targetElement.id = `cp-id-${globalInstanceCounter}`;
            }

            // Create a new instance object for this target.
            const newInstance = this._createWidgetInstance(JQLib(targetElement), isInlineElement);
            // Merge global defaults, instance settings, and element-specific options.
            newInstance.settings = JQLib.extend({}, this._baseOptions, widgetSettings || {}, elementOptions || {});

            if (nodeType === 'input') {
                this._establishInputBinding(targetElement, newInstance);
                // Initialize instance's time from the input field's current value.
                this._extractTimeFromInput(newInstance);
            } else if (isInlineElement) {
                this._initInlineWidget(targetElement, newInstance);
            }
        },

        /**
         * Creates and returns a new instance object for a clock picker.
         * @param {JQLib} targetJq - jQuery wrapped target element.
         * @param {boolean} isInline - True if the instance is inline.
         * @returns {object} The new instance object.
         */
        _createWidgetInstance: function (targetJq, isInline) {
            const elementId = targetJq[0].id.replace(/([^\w-])/g, '\\\\$1'); // Escape jQuery meta chars.
            return {
                id: elementId,              // ID of the target element.
                input: targetJq,            // jQuery object of the associated target.
                inlineMode: isInline,       // Flag for inline display.
                // Use the global mainContainer for popups, or create a new one for inline.
                mainPanel: (!isInline ? this.mainContainer :
                    JQLib(`<div class="${this._inlinePanelClass} ui-clockpicker ui-widget ui-helper-clearfix"></div>`))
            };
        },

        /**
         * Connects the clock picker to an input field, setting up events.
         * @param {HTMLElement} inputElement - The raw input DOM element.
         * @param {object} instanceData - The instance object.
         */
        _establishInputBinding: function (inputElement, instanceData) {
            const inputJq = JQLib(inputElement);
            if (inputJq.hasClass(this.initializedWidgetClass)) {
                return; // Already initialized.
            }

            // Initialize append and trigger elements as empty jQuery objects.
            instanceData.suffixElement = JQLib([]);
            instanceData.triggerElement = JQLib([]);

            this._setupEventAttachments(inputJq, instanceData);

            inputJq.addClass(this.initializedWidgetClass)
                .on('keydown.clockpicker', this._handleKeyboardInput)
                .on('keyup.clockpicker', this._processKeyRelease)
                .on('setData.clockpicker', (evt, key, val) => {
                    instanceData.settings[key] = val;
                })
                .on('getData.clockpicker', (evt, key) => {
                    return this._fetchOption(instanceData, key);
                });

            // Store instance data using jQuery's data method.
            JQLib.data(inputElement, WIDGET_KEY, instanceData);
        },

        /**
         * Handles keyboard events for the input field.
         * @param {KeyboardEvent} event - The keyboard event.
         */
        _handleKeyboardInput: function (event) {
            const pickerRef = JQLib.clockPicker;
            const instanceData = pickerRef._getInstanceData(event.target);
            let eventHandled = false;
            instanceData._keyEvent = true; // Mark as keyboard-triggered.

            if (pickerRef._isDisplayingClock) {
                switch (event.keyCode) {
                    case 9: // TAB
                        pickerRef._concealClockPicker();
                        eventHandled = false; // Allow tab to move focus.
                        break;
                    case 13: // ENTER
                        pickerRef._applySelectedTime(instanceData);
                        pickerRef._concealClockPicker();
                        eventHandled = true; // Prevent form submission.
                        break;
                    case 27: // ESCAPE
                        pickerRef._concealClockPicker();
                        eventHandled = true;
                        break;
                    default:
                        eventHandled = false;
                }
            } else if (event.ctrlKey && event.keyCode === 36) { // CTRL + HOME
                pickerRef._displayClockPicker(this);
                eventHandled = true;
            } else {
                eventHandled = false;
            }

            if (eventHandled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        /**
         * Updates time selection on key release.
         * @param {KeyboardEvent} event - The keyboard event.
         */
        _processKeyRelease: function (event) {
            const pickerRef = JQLib.clockPicker;
            const instanceData = pickerRef._getInstanceData(event.target);
            pickerRef._extractTimeFromInput(instanceData);
            pickerRef._refreshWidgetContent(instanceData);
        },

        /**
         * Sets up event listeners for the input and trigger elements.
         * @param {JQLib} inputJq - jQuery object of the input field.
         * @param {object} instanceData - The instance object.
         */
        _setupEventAttachments: function (inputJq, instanceData) {
            const appendText = this._fetchOption(instanceData, 'suffixText');
            const isRTL = this._fetchOption(instanceData, 'isRTL'); // Assuming 'isRTL' can be a setting.

            // Remove existing appended text if any.
            if (instanceData.suffixElement && instanceData.suffixElement.length) {
                instanceData.suffixElement.remove();
            }
            if (appendText) {
                instanceData.suffixElement = JQLib(`<span class="ui-clockpicker-suffix">${appendText}</span>`);
                inputJq[isRTL ? 'before' : 'after'](instanceData.suffixElement);
            }

            // Unbind previous event handlers to prevent duplicates.
            inputJq.off('focus.clockpicker', this._displayClockPicker);
            inputJq.off('click.clockpicker', this._manageLayerOrder);

            // Remove existing trigger button if any.
            if (instanceData.triggerElement && instanceData.triggerElement.length) {
                instanceData.triggerElement.remove();
            }

            const showTrigger = this._fetchOption(instanceData, 'triggerEvent');
            if (showTrigger === 'focus' || showTrigger === 'both') {
                inputJq.on('focus.clockpicker', this._displayClockPicker);
                inputJq.on('click.clockpicker', this._manageLayerOrder);
            }
            if (showTrigger === 'button' || showTrigger === 'both') {
                const buttonSelector = this._fetchOption(instanceData, 'triggerButton');
                const triggerButton = JQLib(buttonSelector);
                if (triggerButton.length) {
                    instanceData.triggerElement = triggerButton;
                    triggerButton.on('click.clockpicker', (e) => {
                        e.preventDefault(); // Prevent default button action.
                        if (JQLib.clockPicker._isDisplayingClock && JQLib.clockPicker._previousActiveInput === inputJq[0]) {
                            JQLib.clockPicker._concealClockPicker();
                        } else if (!instanceData.input.is(':disabled')) {
                            JQLib.clockPicker._displayClockPicker(inputJq[0]);
                        }
                    });
                }
            }
        },

        /**
         * Attaches an inline clock picker to a div or span.
         * @param {HTMLElement} targetElement - The div/span element.
         * @param {object} instanceData - The instance object.
         */
        _initInlineWidget: function(targetElement, instanceData) {
            const divSpanJq = JQLib(targetElement);
            if (divSpanJq.hasClass(this.initializedWidgetClass)) {
                return; // Already initialized.
            }
            divSpanJq.addClass(this.initializedWidgetClass)
                .append(instanceData.mainPanel)
                .on('setData.clockpicker', (evt, key, val) => {
                    instanceData.settings[key] = val;
                })
                .on('getData.clockpicker', (evt, key) => {
                    return this._fetchOption(instanceData, key);
                });
            JQLib.data(targetElement, WIDGET_KEY, instanceData);

            this._extractTimeFromInput(instanceData);
            this._refreshWidgetContent(instanceData);
            instanceData.mainPanel.show();
        },

        /**
         * Adjusts the z-index of the clock picker to ensure it's on top.
         * @param {HTMLElement|Event} inputOrEvent - The input element or event object.
         */
        _manageLayerOrder: function(inputOrEvent) {
            const targetElement = inputOrEvent.target || inputOrEvent;
            if (!targetElement) {
                return;
            }
            const instanceData = JQLib.clockPicker._getInstanceData(targetElement);
            if (instanceData && instanceData.mainPanel) {
                const currentZIndex = JQLib.clockPicker._retrieveZIndexValue(targetElement);
                instanceData.mainPanel.css('zIndex', currentZIndex + 1);
            }
        },

        /**
         * Displays the clock picker for a given input field.
         * @param {HTMLElement|Event} inputElementOrEvent - The input field or a triggering event.
         */
        _displayClockPicker: function (inputElementOrEvent) {
            let actualInput = inputElementOrEvent.target || inputElementOrEvent;

            // If triggered by a button/image, find the associated input.
            if (actualInput.nodeName.toLowerCase() !== 'input') {
                actualInput = JQLib('input', actualInput.parentNode)[0];
            }

            if (!actualInput || JQLib.clockPicker._isWidgetDeactivated(actualInput) || JQLib.clockPicker._previousActiveInput === actualInput) {
                return; // Already showing or disabled.
            }

            // Close any currently open picker before showing a new one.
            JQLib.clockPicker._concealClockPicker();

            const instanceData = JQLib.clockPicker._getInstanceData(actualInput);
            if (!instanceData) {
                return; // No instance data found.
            }

            // Stop any ongoing animations on the previous active instance.
            if (JQLib.clockPicker._activeWidgetInstance && JQLib.clockPicker._activeWidgetInstance !== instanceData) {
                JQLib.clockPicker._activeWidgetInstance.mainPanel.stop(true, true);
            }

            const beforeShowCallback = JQLib.clockPicker._fetchOption(instanceData, 'beforePopupShow');
            // Execute beforeShow callback and merge returned settings.
            if (typeof beforeShowCallback === 'function') {
                const callbackResult = beforeShowCallback.apply(actualInput, [actualInput, instanceData]);
                if (callbackResult) {
                    JQLib.extend(instanceData.settings, callbackResult);
                }
            }
            instanceData.lastVal = null; // Clear last value for re-evaluation.
            JQLib.clockPicker._previousActiveInput = actualInput;

            JQLib.clockPicker._extractTimeFromInput(instanceData);

            // Hide cursor in dialogs.
            if (JQLib.clockPicker._inModalContext) {
                actualInput.value = '';
            }

            // Calculate initial position.
            let displayPosition = null;
            if (!JQLib.clockPicker._posCache) { // If no cached position.
                const inputPos = JQLib.clockPicker._determineElementPosition(actualInput);
                displayPosition = [inputPos[0], inputPos[1] + actualInput.offsetHeight];
            } else {
                displayPosition = JQLib.clockPicker._posCache;
            }

            let isElementFixed = false;
            JQLib(actualInput).parents().each(function () {
                if (JQLib(this).css('position') === 'fixed') {
                    isElementFixed = true;
                    return false; // Break the loop.
                }
            });

            // Correct position for Opera in fixed mode (old browser behavior).
            // Replaced $.browser.opera with a more modern check.
            if (isElementFixed && navigator.userAgent.includes('Opera')) {
                displayPosition[0] -= document.documentElement.scrollLeft;
                displayPosition[1] -= document.documentElement.scrollTop;
            }

            // Set initial CSS for positioning and hide for measurement.
            instanceData.mainPanel.css({ position: 'absolute', display: 'block', top: '-1000px', left: '-1000px' });
            JQLib.clockPicker._refreshWidgetContent(instanceData);

            // Position with jQuery UI Position utility if available and not inline.
            if (!instanceData.inlineMode && typeof JQLib.ui.position === 'object') {
                instanceData.mainPanel.position({
                    of: instanceData.input,
                    my: JQLib.clockPicker._fetchOption(instanceData, 'popupMyPosition'),
                    at: JQLib.clockPicker._fetchOption(instanceData, 'popupAtPosition'),
                    collision: 'flip'
                });
                const panelOffset = instanceData.mainPanel.offset();
                displayPosition = [panelOffset.left, panelOffset.top];
            } else if (!instanceData.inlineMode) { // Fallback for no position utility.
                // If position utility is not loaded, just use basic positioning.
                const inputOffset = JQLib(actualInput).offset();
                displayPosition = [inputOffset.left, inputOffset.top + actualInput.offsetHeight];
            }


            // Reset click states.
            instanceData._hoursClicked = false;
            instanceData._minutesClicked = false;

            // Check and adjust offset if picker goes off-screen.
            const adjustedOffset = JQLib.clockPicker._calculateDisplayOffset(instanceData, { left: displayPosition[0], top: displayPosition[1] }, isElementFixed);

            instanceData.mainPanel.css({
                position: (JQLib.clockPicker._inModalContext && JQLib.blockUI ? 'static' : (isElementFixed ? 'fixed' : 'absolute')),
                display: 'none',
                left: `${adjustedOffset.left}px`,
                top: `${adjustedOffset.top}px`
            });

            if (!instanceData.inlineMode) {
                const animationName = JQLib.clockPicker._fetchOption(instanceData, 'animationEffect');
                const animationDuration = JQLib.clockPicker._fetchOption(instanceData, 'duration'); // Assuming 'duration' can be a setting.
                const animationOpts = JQLib.clockPicker._fetchOption(instanceData, 'animationOptions');

                const afterAnimation = () => {
                    JQLib.clockPicker._isDisplayingClock = true;
                    // IE6- iframe cover for selects.
                    const borders = JQLib.clockPicker._fetchBorderDimensions(instanceData.mainPanel);
                    instanceData.mainPanel.find('iframe.ui-clockpicker-cover').css({
                        left: -borders[0],
                        top: -borders[1],
                        width: instanceData.mainPanel.outerWidth(),
                        height: instanceData.mainPanel.outerHeight()
                    });
                };

                // Adjust Z-index to ensure visibility.
                JQLib.clockPicker._manageLayerOrder(actualInput);

                if (JQLib.effects && JQLib.effects[animationName]) {
                    instanceData.mainPanel.show(animationName, animationOpts, animationDuration, afterAnimation);
                } else {
                    instanceData.mainPanel[animationName || 'show']((animationName ? animationDuration : null), afterAnimation);
                }

                // If no animation or zero duration, execute callback immediately.
                if (!animationName || !animationDuration) {
                    afterAnimation();
                }

                // Focus the input if visible and not disabled.
                if (instanceData.input.is(':visible') && !instanceData.input.is(':disabled')) {
                    instanceData.input.focus();
                }
                JQLib.clockPicker._activeWidgetInstance = instanceData;
            }
            JQLib.clockPicker._posCache = null; // Clear cached position.
        },

        // Retrieves the computed z-index of an element and its ancestors.
        _retrieveZIndexValue: function (target) {
            let currentElem = JQLib(target);
            let positionStyle, zIndexValue;
            while (currentElem.length && currentElem[0] !== document) {
                positionStyle = currentElem.css("position");
                if (positionStyle === "absolute" || positionStyle === "relative" || positionStyle === "fixed") {
                    zIndexValue = parseInt(currentElem.css("zIndex"), 10);
                    if (!isNaN(zIndexValue) && zIndexValue !== 0) {
                        return zIndexValue;
                    }
                }
                currentElem = currentElem.parent();
            }
            return 0; // Default to 0 if no explicit z-index found.
        },

        /**
         * Refreshes the content of the clock picker display.
         * @param {object} instanceData - The instance object.
         */
        _refreshWidgetContent: function (instanceData) {
            if (!instanceData || !instanceData.mainPanel) {
                this.debugLog('Cannot refresh widget content: instanceData or mainPanel is missing.');
                return;
            }
            instanceData.mainPanel.empty().append(this._composeWidgetMarkup(instanceData));
            this._rebindInteractionEvents(instanceData);
        },

        /**
         * Rebinds all interaction events (clicks, hovers) for the widget.
         * @param {object} instanceData - The instance object.
         */
        _rebindInteractionEvents: function (instanceData) {
            const self = this;
            const borders = JQLib.clockPicker._fetchBorderDimensions(instanceData.mainPanel);

            // Re-apply iframe cover for IE6-.
            instanceData.mainPanel.find('iframe.ui-clockpicker-cover')
                .css({
                    left: -borders[0], top: -borders[1],
                    width: instanceData.mainPanel.outerWidth(), height: instanceData.mainPanel.outerHeight()
                });

            // Bind click and double-click events for minute cells.
            instanceData.mainPanel.find('.ui-clockpicker-minute-cell')
                .off() // Remove previous handlers.
                .on('click', { fromDoubleClick: false }, JQLib.proxy(JQLib.clockPicker.chooseMinutes, self))
                .on('dblclick', { fromDoubleClick: true }, JQLib.proxy(JQLib.clockPicker.chooseMinutes, self));

            // Bind click and double-click events for hour cells.
            instanceData.mainPanel.find('.ui-clockpicker-hour-cell')
                .off() // Remove previous handlers.
                .on('click', { fromDoubleClick: false }, JQLib.proxy(JQLib.clockPicker.chooseHours, self))
                .on('dblclick', { fromDoubleClick: true }, JQLib.proxy(JQLib.clockPicker.chooseHours, self));

            // Bind mouseout/mouseover for general time links (cells).
            instanceData.mainPanel.find('.ui-clockpicker td a')
                .off() // Remove previous handlers.
                .on('mouseout', function () {
                    JQLib(this).removeClass('ui-state-hover');
                })
                .on('mouseover', function () {
                    // Only apply hover if the picker is not disabled.
                    const targetElement = instanceData.inlineMode ? instanceData.mainPanel.parent()[0] : instanceData.input[0];
                    if (!self._isWidgetDeactivated(targetElement)) {
                        JQLib(this).parents('.ui-clockpicker-table').find('a').removeClass('ui-state-hover');
                        JQLib(this).addClass('ui-state-hover');
                    }
                });

            // Trigger mouseover on current selected cell for initial styling.
            instanceData.mainPanel.find(`.${this._hoverStateClass} a`).trigger('mouseover');

            // Bind button click events.
            instanceData.mainPanel.find('.ui-clockpicker-now').on('click', (e) => {
                JQLib.clockPicker.setCurrentTime(e);
            });
            instanceData.mainPanel.find('.ui-clockpicker-deselect').on('click', (e) => {
                JQLib.clockPicker.clearSelectedTime(e);
            });
            instanceData.mainPanel.find('.ui-clockpicker-close').on('click', (e) => {
                JQLib.clockPicker._concealClockPicker();
            });
        },

        /**
         * Generates the HTML markup for the clock picker.
         * @param {object} instanceData - The instance object.
         * @returns {string} The generated HTML string.
         */
        _composeWidgetMarkup: function (instanceData) {
            let htmlContent = '';
            let hoursGridHtml = '';
            let minutesGridHtml = '';

            const showPeriod = this._fetchOption(instanceData, 'displayPeriod');
            const showPeriodLabels = this._fetchOption(instanceData, 'displayPeriodLabels');
            const periodLabels = this._fetchOption(instanceData, 'dayPeriodLabels');
            const showLeadingHourZero = this._fetchOption(instanceData, 'leadingZeroHours');
            const showLeadingMinuteZero = this._fetchOption(instanceData, 'leadingZeroMinutes');
            const hourRange = this._fetchOption(instanceData, 'hourRange');
            const minuteRange = this._fetchOption(instanceData, 'minuteRange');
            const minuteInterval = minuteRange.step;
            const gridRows = this._fetchOption(instanceData, 'gridRows');
            const displayHours = this._fetchOption(instanceData, 'displayHoursSection');
            const displayMinutes = this._fetchOption(instanceData, 'displayMinutesSection');

            const currentHour = instanceData.hours || 0;
            const currentMinute = instanceData.minutes || 0;
            const currentPeriod = instanceData.period || periodLabels[0];

            const formatHour = (h) => (showLeadingHourZero && h < 10 ? `0${h}` : String(h));
            const formatMinute = (m) => (showLeadingMinuteZero && m < 10 ? `0${m}` : String(m));

            // --- Hours Section ---
            if (displayHours) {
                let hourCells = '';
                const hourColumns = Math.ceil((hourRange.end - hourRange.start + 1) / gridRows);
                const hoursInRow = Math.ceil((hourRange.end - hourRange.start + 1) / gridRows); // This should be gridRows or similar, not columns.

                let hourCount = 0;
                for (let row = 0; row < gridRows; row++) {
                    hourCells += '<tr>';
                    for (let col = 0; col < hourColumns; col++) { // Assuming a grid layout.
                        const hour = hourRange.start + row + (col * gridRows); // Calculate hour for cell.
                        if (hour > hourRange.end) {
                            hourCells += `<td class="ui-timepicker-empty-cell"></td>`; // Empty cell for padding.
                            continue;
                        }

                        let displayHour = hour;
                        let cellPeriod = periodLabels[0]; // Default to AM.

                        if (showPeriod) {
                            if (hour === 0) {
                                displayHour = 12; // 12 AM
                                cellPeriod = periodLabels[0];
                            } else if (hour === 12) {
                                displayHour = 12; // 12 PM
                                cellPeriod = periodLabels[1];
                            } else if (hour > 12) {
                                displayHour = hour - 12;
                                cellPeriod = periodLabels[1];
                            } else {
                                cellPeriod = periodLabels[0];
                            }
                        }

                        const formattedHour = formatHour(displayHour);
                        const isCurrentHour = (instanceData.hours !== undefined && instanceData.hours === hour);
                        const hourClass = `ui-timepicker-hour-cell ${isCurrentHour ? this._currentSelectionClass : ''}`;

                        hourCells += `<td class="${hourClass}"><a href="#" data-hour="${hour}">${formattedHour}</a></td>`;
                        hourCount++;
                    }
                    hourCells += '</tr>';
                }

                hoursGridHtml = `
                    <div class="ui-timepicker-hours-section ui-helper-clearfix">
                        <div class="ui-widget-header ui-corner-all ui-timepicker-header">
                            <span class="ui-timepicker-title">${this._fetchOption(instanceData, 'hourLabel')}</span>
                        </div>
                        <table class="ui-timepicker-table ui-timepicker-hours">
                            <tbody>${hourCells}</tbody>
                        </table>
                    </div>`;
            }

            // --- Minutes Section ---
            if (displayMinutes) {
                let minuteCells = '';
                const totalMinutes = Math.floor((minuteRange.end - minuteRange.start) / minuteInterval) + 1;
                const minutesInRow = Math.ceil(totalMinutes / gridRows); // Number of minute items per row.

                let minuteValue = minuteRange.start;
                for (let row = 0; row < gridRows; row++) {
                    minuteCells += '<tr>';
                    for (let col = 0; col < minutesInRow; col++) {
                        if (minuteValue > minuteRange.end) {
                            minuteCells += `<td class="ui-timepicker-empty-cell"></td>`;
                        } else {
                            const formattedMinute = formatMinute(minuteValue);
                            const isCurrentMinute = (instanceData.minutes !== undefined && instanceData.minutes === minuteValue);
                            const minuteClass = `ui-timepicker-minute-cell ${isCurrentMinute ? this._currentSelectionClass : ''}`;
                            minuteCells += `<td class="${minuteClass}"><a href="#" data-minute="${minuteValue}">${formattedMinute}</a></td>`;
                        }
                        minuteValue += minuteInterval;
                    }
                    minuteCells += '</tr>';
                }

                minutesGridHtml = `
                    <div class="ui-timepicker-minutes-section ui-helper-clearfix">
                        <div class="ui-widget-header ui-corner-all ui-timepicker-header">
                            <span class="ui-timepicker-title">${this._fetchOption(instanceData, 'minuteLabel')}</span>
                        </div>
                        <table class="ui-timepicker-table ui-timepicker-minutes">
                            <tbody>${minuteCells}</tbody>
                        </table>
                    </div>`;
            }

            // --- AM/PM Section (if enabled) ---
            let periodSectionHtml = '';
            if (showPeriod && showPeriodLabels) {
                const isAmCurrent = (currentPeriod === periodLabels[0]);
                const isPmCurrent = (currentPeriod === periodLabels[1]);

                periodSectionHtml = `
                    <div class="ui-timepicker-period-section ui-helper-clearfix">
                        <div class="ui-widget-header ui-corner-all ui-timepicker-header">
                            <span class="ui-timepicker-title">Period</span>
                        </div>
                        <table class="ui-timepicker-table ui-timepicker-period">
                            <tbody>
                                <tr>
                                    <td class="ui-timepicker-period-cell ${isAmCurrent ? this._currentSelectionClass : ''}">
                                        <a href="#" data-period="${periodLabels[0]}">${periodLabels[0]}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="ui-timepicker-period-cell ${isPmCurrent ? this._currentSelectionClass : ''}">
                                        <a href="#" data-period="${periodLabels[1]}">${periodLabels[1]}</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
            }

            // --- Buttons Section ---
            let buttonsHtml = '';
            const showCloseBtn = this._fetchOption(instanceData, 'showConfirmButton');
            const showNowBtn = this._fetchOption(instanceData, 'showSetNowButton');
            const showDeselectBtn = this._fetchOption(instanceData, 'showClearButton');

            if (showCloseBtn || showNowBtn || showDeselectBtn) {
                buttonsHtml = '<div class="ui-timepicker-buttonpane ui-widget-content">';
                if (showNowBtn) {
                    buttonsHtml += `<button type="button" class="ui-timepicker-now ui-state-default ui-priority-secondary ui-corner-all">${this._fetchOption(instanceData, 'setNowButtonText')}</button>`;
                }
                if (showDeselectBtn) {
                    buttonsHtml += `<button type="button" class="ui-timepicker-deselect ui-state-default ui-priority-secondary ui-corner-all">${this._fetchOption(instanceData, 'clearButtonText')}</button>`;
                }
                if (showCloseBtn) {
                    buttonsHtml += `<button type="button" class="ui-timepicker-close ui-state-default ui-priority-primary ui-corner-all">${this._fetchOption(instanceData, 'confirmButtonText')}</button>`;
                }
                buttonsHtml += '</div>';
            }

            // Combine all sections.
            htmlContent = `
                <div class="ui-widget-content ui-corner-all">
                    ${hoursGridHtml}
                    ${minutesGridHtml}
                    ${periodSectionHtml}
                </div>
                ${buttonsHtml}`;

            // Add an IE6- iframe cover to prevent select elements from showing through.
            if (JQLib.browser && JQLib.browser.msie && JQLib.browser.version < 7) {
                htmlContent += `<iframe src="javascript:void(0);" class="ui-timepicker-cover" frameborder="0"></iframe>`;
            }

            return htmlContent;
        },

        // Helper function to get an option value from instance settings or defaults.
        _fetchOption: function (instanceData, key) {
            return instanceData.settings[key] !== undefined ? instanceData.settings[key] : this._baseOptions[key];
        },

        // Retrieves the instance data associated with a DOM element.
        _getInstanceData: function (element) {
            return JQLib.data(element, WIDGET_KEY);
        },

        // Checks if the clock picker is disabled for a given input.
        _isWidgetDeactivated: function (element) {
            const instanceData = this._getInstanceData(element);
            if (!instanceData) return false;
            // A more robust check might involve checking for a 'disabled' class or property.
            return JQLib.inArray(element, this._deactivatedInputs) > -1;
        },

        // Hides the clock picker.
        _concealClockPicker: function (targetElement, duration) {
            const inst = this._activeWidgetInstance;
            if (!inst) {
                return;
            }

            if (this._isDisplayingClock) {
                // Execute onClose callback if defined.
                const onCloseCallback = this._fetchOption(inst, 'onPickerClosed');
                if (typeof onCloseCallback === 'function') {
                    onCloseCallback.apply((targetElement || inst.input[0]), [inst.hours, inst.minutes, inst.period, inst]);
                }

                this._isDisplayingClock = false;
                this._previousActiveInput = null; // Clear last active input.
                this._activeWidgetInstance = null; // Clear current instance.

                const animationName = this._fetchOption(inst, 'animationEffect');
                const animationDuration = duration || this._fetchOption(inst, 'duration');
                const animationOpts = this._fetchOption(inst, 'animationOptions');

                if (JQLib.effects && JQLib.effects[animationName]) {
                    inst.mainPanel.hide(animationName, animationOpts, animationDuration);
                } else {
                    inst.mainPanel[(animationName === 'slideDown' ? 'slideUp' : animationName === 'fadeIn' ? 'fadeOut' : 'hide')]((animationName ? animationDuration : null));
                }
            }
        },

        // Extracts time values (hours, minutes, period) from the input field.
        _extractTimeFromInput: function (instanceData) {
            const inputVal = instanceData.input.val();
            const timeDelimiter = this._fetchOption(instanceData, 'timeDelimiter');
            const periodDelimiter = this._fetchOption(instanceData, 'periodDelimiter');
            const periodLabels = this._fetchOption(instanceData, 'dayPeriodLabels');
            const showPeriod = this._fetchOption(instanceData, 'displayPeriod');
            const allowPartialHours = this._fetchOption(instanceData, 'allowPartialHours');
            const initialTime = this._fetchOption(instanceData, 'initialTime');

            let parsedHours = null, parsedMinutes = null, parsedPeriod = null;
            let timeParts = inputVal.split(timeDelimiter);
            let periodPart = null;

            if (showPeriod) {
                const lastPart = timeParts[timeParts.length - 1];
                const lastPartSplit = lastPart.split(periodDelimiter);
                if (lastPartSplit.length > 1) {
                    periodPart = lastPartSplit[lastPartSplit.length - 1];
                    timeParts[timeParts.length - 1] = lastPartSplit.slice(0, lastPartSplit.length - 1).join(periodDelimiter);
                }
            }

            if (timeParts.length >= 1) {
                parsedHours = parseInt(timeParts[0], 10);
            }
            if (timeParts.length >= 2) {
                parsedMinutes = parseInt(timeParts[1], 10);
            } else if (allowPartialHours && timeParts.length === 1 && !isNaN(parsedHours)) {
                parsedMinutes = 0; // If only hours are provided and partial hours are allowed.
            }

            // Validate parsed values.
            if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 23) {
                parsedHours = null;
            }
            if (isNaN(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
                parsedMinutes = null;
            }

            // Handle AM/PM.
            if (showPeriod && parsedPeriod === null && (parsedHours !== null || parsedMinutes !== null)) {
                // Attempt to infer period if not explicitly given but showPeriod is true.
                if (parsedHours >= 12) {
                    parsedPeriod = periodLabels[1]; // PM
                } else {
                    parsedPeriod = periodLabels[0]; // AM
                }
            } else if (parsedPeriod !== null && JQLib.inArray(parsedPeriod.toUpperCase(), periodLabels.map(p => p.toUpperCase())) === -1) {
                parsedPeriod = null; // Invalid period.
            }

            // If input is empty and initialTime is 'now', set current time.
            if (!inputVal && initialTime === 'now') {
                const now = new Date();
                parsedHours = now.getHours();
                parsedMinutes = now.getMinutes();
                if (showPeriod) {
                    parsedPeriod = (parsedHours >= 12) ? periodLabels[1] : periodLabels[0];
                }
            } else if (!inputVal && initialTime !== 'now') {
                // If initialTime is not 'now' and input is empty, clear.
                instanceData.hours = undefined;
                instanceData.minutes = undefined;
                instanceData.period = undefined;
                return;
            }

            instanceData.hours = parsedHours;
            instanceData.minutes = parsedMinutes;
            instanceData.period = parsedPeriod;
        },

        // Updates the input field with the selected time from the instance.
        _applySelectedTime: function (instanceData) {
            const timeDelimiter = this._fetchOption(instanceData, 'timeDelimiter');
            const periodDelimiter = this._fetchOption(instanceData, 'periodDelimiter');
            const periodLabels = this._fetchOption(instanceData, 'dayPeriodLabels');
            const showPeriod = this._fetchOption(instanceData, 'displayPeriod');
            const leadingZeroHours = this._fetchOption(instanceData, 'leadingZeroHours');
            const leadingZeroMinutes = this._fetchOption(instanceData, 'leadingZeroMinutes');
            const altFieldSelector = this._fetchOption(instanceData, 'alternateField');

            if (instanceData.hours === undefined || instanceData.minutes === undefined) {
                instanceData.input.val('');
                if (altFieldSelector) {
                    JQLib(altFieldSelector).val('');
                }
                return;
            }

            let displayHour = instanceData.hours;
            let displayMinute = instanceData.minutes;
            let displayPeriod = instanceData.period;

            if (showPeriod) {
                if (displayHour === 0) {
                    displayHour = 12; // 12 AM
                } else if (displayHour > 12) {
                    displayHour -= 12;
                }
            }

            const formattedHour = leadingZeroHours && displayHour < 10 ? `0${displayHour}` : String(displayHour);
            const formattedMinute = leadingZeroMinutes && displayMinute < 10 ? `0${displayMinute}` : String(displayMinute);

            let timeString = `${formattedHour}${timeDelimiter}${formattedMinute}`;
            if (showPeriod && displayPeriod) {
                timeString += `${periodDelimiter}${displayPeriod}`;
            }

            instanceData.input.val(timeString);
            if (altFieldSelector) {
                JQLib(altFieldSelector).val(timeString);
            }

            // Trigger onTimeSelected callback.
            const onSelectCallback = this._fetchOption(instanceData, 'onTimeSelected');
            if (typeof onSelectCallback === 'function') {
                onSelectCallback.apply(instanceData.input[0], [instanceData.hours, instanceData.minutes, instanceData.period, instanceData]);
            }
        },

        // Calculates and adjusts the display offset to keep the picker on screen.
        _calculateDisplayOffset: function (instanceData, currentOffset, isFixed) {
            // This is a simplified version; a full implementation would check screen boundaries.
            return currentOffset;
        },

        // Determines the absolute position of a DOM element.
        _determineElementPosition: function (element) {
            const offset = JQLib(element).offset();
            return [offset.left, offset.top];
        },

        // Fetches border dimensions (left, top) for an element.
        _fetchBorderDimensions: function (element) {
            // Based on jQuery UI's _getBorders.
            const elem = JQLib(element);
            const borders = [
                parseFloat(elem.css('borderLeftWidth')) || 0,
                parseFloat(elem.css('borderTopWidth')) || 0
            ];
            return borders;
        },

        // Public method to set hours for the current instance.
        chooseHours: function (event) {
            const instanceData = JQLib.clockPicker._activeWidgetInstance;
            if (!instanceData) return;

            const selectedHour = parseInt(JQLib(event.target).data('hour'), 10);
            if (isNaN(selectedHour)) return;

            instanceData.hours = selectedHour;
            // Update period based on hour if showPeriod is enabled.
            if (JQLib.clockPicker._fetchOption(instanceData, 'displayPeriod')) {
                instanceData.period = (selectedHour >= 12) ? JQLib.clockPicker._fetchOption(instanceData, 'dayPeriodLabels')[1] : JQLib.clockPicker._fetchOption(instanceData, 'dayPeriodLabels')[0];
            }

            JQLib.clockPicker._refreshWidgetContent(instanceData);
            if (event.data.fromDoubleClick) {
                JQLib.clockPicker._applySelectedTime(instanceData);
                JQLib.clockPicker._concealClockPicker();
            }
        },

        // Public method to set minutes for the current instance.
        chooseMinutes: function (event) {
            const instanceData = JQLib.clockPicker._activeWidgetInstance;
            if (!instanceData) return;

            const selectedMinute = parseInt(JQLib(event.target).data('minute'), 10);
            if (isNaN(selectedMinute)) return;

            instanceData.minutes = selectedMinute;

            JQLib.clockPicker._refreshWidgetContent(instanceData);
            if (event.data.fromDoubleClick) {
                JQLib.clockPicker._applySelectedTime(instanceData);
                JQLib.clockPicker._concealClockPicker();
            }
        },

        // Public method to set the current time.
        setCurrentTime: function (event) {
            event.preventDefault();
            const instanceData = JQLib.clockPicker._activeWidgetInstance;
            if (!instanceData) return;

            const now = new Date();
            instanceData.hours = now.getHours();
            instanceData.minutes = now.getMinutes();
            if (JQLib.clockPicker._fetchOption(instanceData, 'displayPeriod')) {
                instanceData.period = (instanceData.hours >= 12) ? JQLib.clockPicker._fetchOption(instanceData, 'dayPeriodLabels')[1] : JQLib.clockPicker._fetchOption(instanceData, 'dayPeriodLabels')[0];
            }

            JQLib.clockPicker._applySelectedTime(instanceData);
            JQLib.clockPicker._concealClockPicker();
        },

        // Public method to clear the selected time.
        clearSelectedTime: function (event) {
            event.preventDefault();
            const instanceData = JQLib.clockPicker._activeWidgetInstance;
            if (!instanceData) return;

            instanceData.hours = undefined;
            instanceData.minutes = undefined;
            instanceData.period = undefined;

            JQLib.clockPicker._applySelectedTime(instanceData);
            JQLib.clockPicker._concealClockPicker();
        }
    });

    // Create the singleton instance and expose it on jQuery.
    JQLib.clockPicker = new ClockWidget();

    // Attach functionality to jQuery elements.
    JQLib.fn.clockpicker = function (options) {
        // Handle options object or method calls.
        const methodName = typeof options === 'string' ? options : '';
        const args = Array.prototype.slice.call(arguments, 1);

        if (methodName && ClockWidget.prototype[methodName]) {
            // Call a method on the widget.
            if (methodName === 'configureGlobalOptions') {
                return JQLib.clockPicker.configureGlobalOptions.apply(JQLib.clockPicker, args);
            }
            // For other methods, iterate over selected elements.
            return this.each(function () {
                const instance = JQLib.clockPicker._getInstanceData(this);
                if (instance && typeof instance[methodName] === 'function') {
                    instance[methodName].apply(instance, args);
                } else if (JQLib.clockPicker[methodName] && typeof JQLib.clockPicker[methodName] === 'function') {
                    // Try global methods if not on instance.
                    JQLib.clockPicker[methodName].apply(JQLib.clockPicker, [this, ...args]);
                }
            });
        }

        // Initialize clock picker for each selected element.
        return this.each(function () {
            JQLib.clockPicker._bindClockWidget(this, options);
        });
    };

    // Expose the ClockWidget class for potential extension.
    JQLib.clockPicker.widgetClass = ClockWidget;

})(jQuery);