(function (jqObject, noValue) {

    jqObject.augment(jqObject.userInterface, { clockSelector: { buildId: "0.2.9"} });

    var ELEMENT_KEY = 'clockSelector';
    var elementTracker = new Date().getTime();

    /* Clock selector manager.
     * Utilizes a single instance of this class, jqObject.clockSelector, for all interactions.
     * Configuration for various clock selectors is maintained in separate instance objects,
     * allowing diverse settings across a single webpage. */

    function ClockSelector() {
        this.verboseMode = true; // Toggle to true to enable detailed logging
        this._currentInstance = null; // The currently active selector instance
        this._isEmbedded = false; // Flag: true if the selector is displayed within the page content
        this._inactiveInputs = []; // Collection of input fields where the clock selector is deactivated
        this._selectorVisible = false; // Flag: true if the pop-up selector is currently displayed
        this._withinModal = false; // Flag: true if the selector appears inside a modal dialog
        this._modalClassId = 'ui-clockselector-dialog'; // CSS class name for modal display
        this._primaryPanelId = 'ui-clockselector-div'; // ID for the main clock selector container
        this._embeddedClassId = 'ui-clockselector-inline'; // CSS class name for embedded display
        this._activePeriodClass = 'ui-clockselector-current'; // CSS class for highlighting active hour/minute
        this._cellHoverClass = 'ui-clockselector-days-cell-over'; // CSS class for cell hover effect (unused here)

        this.localeSettings = []; // Available localization settings, indexed by language code
        this.localeSettings[''] = { // Default localization settings
            hourLabel: 'Hour',           // Text for the hour section
            minuteLabel: 'Minute',       // Text for the minute section
            dayPeriodLabels: ['AM', 'PM'],     // Text for AM/PM indicators
            doneButtonLabel: 'Done',        // Text for the confirmation button
            presentButtonLabel: 'Now',           // Text for the "Now" button
            clearSelectionLabel: 'Deselect'  // Text for the "Deselect" button
        };
        this._globalOptions = { // Global default configuration for all clock selector instances
            displayTrigger: 'focus',    // 'focus' for popup on input focus,
                                // 'button' for a dedicated trigger button, or 'both' (not yet implemented)
            triggerButtonRef: null,                   // Reference to the 'button' element that activates the selector
            displayAnimation: 'fadeIn',             // Name of jQuery animation for showing the popup
            animationOptions: {},                // Additional options for advanced animations
            suffixText: '',                 // Text to append after the input field, e.g., to show format

            preDisplayCallback: null,               // Callback function executed before the selector is shown
            onTimeChosen: null,                 // Callback function when an hour or minute is selected
            onSelectorClose: null,                  // Callback function when the selector is dismissed

            timeValueDelimiter: ':',             // Character used to separate hours and minutes
            periodDelimiter: ' ',           // Character used to separate time from its period (AM/PM)
            displayPeriod: false,              // Determines whether to show AM/PM with the chosen time
            displayPeriodIndicators: true,         // Display AM/PM labels on the selector's left side
            leadingZeroHours: true,          // Show a leading zero for hours less than 10 [true/false]
            leadingZeroMinutes: true,   // Show a leading zero for minutes less than 10
            alternateFieldSelector: '',                   // CSS selector for an alternative field to store the selected time
            initialTimeValue: 'now',             // Default time when input is empty or for inline selectors
                                            // ('now' for current time, '' for no initial highlight)
            myAlignment: 'left top',         // Alignment of the selector dialog relative to the input.
                                            // See jQuery UI Position utility for details: http://jqueryui.com/demos/position/
            atAlignment: 'left bottom',            // Alignment of the input element to match
                                            // Note: If position utility is not loaded, selector attaches left top to left bottom
            //NEW: 2011-02-03
            hourDisplayFilter: null,         // Callback for enabling/disabling selectable hours (e.g., function(hour) { return true; })
            minuteDisplayFilter: null,             // Callback for enabling/disabling minute selection (e.g., function(hour,minute) { return true; })

            hourRange: {
                startValue: 0,                  // First hour displayed
                endValue: 23                    // Last hour displayed
            },
            minuteRange: {
                startValue: 0,                  // First minute displayed
                endValue: 55,                   // Last minute displayed
                stepValue: 5                 // Interval between displayed minutes
            },
            displayRows: 4,                        // Number of rows for the time tables (minimum 2, multiple of 2 is best)
            // 2011-08-05 0.2.4
            displayHourSection: true,                // Show the hours section of the dialog
            displayMinuteSection: true,              // Show the minute section of the dialog
            allowOptionalMinutes: false,         // Allow parsing inputs of whole hours with minutes omitted
            
            // Buttons
            displayDoneButton: false,         // Show an "OK" button to confirm the edit
            displayNowButton: false,           // Show the "Now" button
            displayClearButton: false        // Show the "Deselect Time" button

        };
        jqObject.augment(this._globalOptions, this.localeSettings['']);

        this.selectionPanel = jqObject('<div id="' + this._primaryPanelId + '" class="ui-clockselector ui-widget ui-helper-clearfix ui-corner-all " style="display: none"></div>');
    }

    jqObject.augment(ClockSelector.prototype, {
        /* CSS class added to elements to indicate they are already configured with a clock selector. */
        markedElementClass: 'hasClockSelector',

        /* Debug logging (if enabled). */
        outputLog: function () {
            if (this.verboseMode)
                console.log.apply('', arguments);
        },

        _getWidgetPanel: function () {
            return this.selectionPanel;
        },

        /* Overrides the default settings for all instances of the clock selector.
         * @param  options  object - the new settings to use as defaults (anonymous object)
         * @return the manager object */
        configureGlobalOptions: function (options) {
            mergeAndOverwrite(this._globalOptions, options || {});
            return this;
        },

        /* Binds the clock selector to a jQuery selection.
         * @param  targetElement    element - the target input field or division or span
         * @param  options  object - the new settings for this specific clock selector instance (anonymous) */
        _bindClockSelector: function (targetElement, options) {
            // Check for element-specific settings within its attributes (namespace 'time:')
            var elementSpecificOptions = null;
            for (var attributeKey in this._globalOptions) {
                var attributeContent = targetElement.getAttribute('time:' + attributeKey);
                if (attributeContent) {
                    elementSpecificOptions = elementSpecificOptions || {};
                    try {
                        elementSpecificOptions[attributeKey] = eval(attributeContent);
                    } catch (err) {
                        elementSpecificOptions[attributeKey] = attributeContent;
                    }
                }
            }
            var nodeType = targetElement.nodeName.toLowerCase();
            var isEmbedded = (nodeType == 'div' || nodeType == 'span');

            if (!targetElement.id) {
                this.uniqueIdCounter = (this.uniqueIdCounter || 0) + 1;
                targetElement.id = 'cs' + this.uniqueIdCounter;
            }
            var currentInst = this._createNewInstance(jqObject(targetElement), isEmbedded);
            currentInst.settings = jqObject.augment({}, options || {}, elementSpecificOptions || {});
            if (nodeType == 'input') {
                this._linkClockSelector(targetElement, currentInst);
                // Initialize currentInst.hours and currentInst.minutes from the input's value
                this._setPanelTimeFromField(currentInst);
            } else if (isEmbedded) {
                this._embedClockSelector(targetElement, currentInst);
            }


        },

        /* Generates a new instance object. */
        _createNewInstance: function (targetInput, isEmbedded) {
            var instanceId = targetInput[0].id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1'); // Escape jQuery meta chars
            return {
                instanceId: instanceId, targetInput: targetInput, // Associated target element
                isEmbedded: isEmbedded, // Is the clock selector inline or not?
                panelDiv: (!isEmbedded ? this.selectionPanel : // Presentation div
                    jqObject('<div class="' + this._embeddedClassId + ' ui-clockselector ui-widget  ui-helper-clearfix"></div>'))
            };
        },

        /* Links the clock selector to an input field. */
        _linkClockSelector: function (targetElement, currentInst) {
            var targetInput = jqObject(targetElement);
            currentInst.appendixElement = jqObject([]);
            currentInst.triggerElement = jqObject([]);
            if (targetInput.hasClass(this.markedElementClass)) { return; }
            this._establishLinks(targetInput, currentInst);
            targetInput.addClass(this.markedElementClass).
                keydown(this._handleKeyPress).
                keyup(this._handleKeyRelease).
                bind("setData.clockSelector", function (eventObject, key, value) {
                    currentInst.settings[key] = value;
                }).
                bind("getData.clockSelector", function (eventObject, key) {
                    return this._getOption(currentInst, key);
                });
            jqObject.data(targetElement, ELEMENT_KEY, currentInst);
        },

        /* Handles keyboard key press events. */
        _handleKeyPress: function (eventObject) {
            var currentInst = jqObject.clockSelector._getInstanceRef(eventObject.target);
            var eventHandled = true;
            currentInst._keyboardAction = true;
            if (jqObject.clockSelector._selectorVisible) {
                switch (eventObject.keyCode) {
                    case 9: jqObject.clockSelector._concealSelector();
                        eventHandled = false;
                        break; // Hide on tab out
                    case 13:
                        jqObject.clockSelector._updateChosenValue(currentInst);
                        jqObject.clockSelector._concealSelector();
                            
            return false; // Prevent form submission
            break; // Select the value on Enter
                    case 27: jqObject.clockSelector._concealSelector();
                        break; // Hide on Escape
                    default: eventHandled = false;
                }
            }
            else if (eventObject.keyCode == 36 && eventObject.ctrlKey) { // Display the clock selector on Ctrl+Home
                jqObject.clockSelector._revealSelector(this);
            }
            else {
                eventHandled = false;
            }
            if (eventHandled) {
                eventObject.preventDefault();
                eventObject.stopPropagation();
            }
        },

        /* Updates selected time on keyUp. */
        /* Added version 0.0.5 */
        _handleKeyRelease: function (eventObject) {
            var currentInst = jqObject.clockSelector._getInstanceRef(eventObject.target);
            jqObject.clockSelector._setPanelTimeFromField(currentInst);
            jqObject.clockSelector._refreshSelector(currentInst);
        },

        /* Establishes attachments based on settings. */
        _establishLinks: function (targetInput, currentInst) {
            var suffixContent = this._getOption(currentInst, 'suffixText');
            var isRightToLeft = this._getOption(currentInst, 'isRTL');
            if (currentInst.appendixElement) { currentInst.appendixElement.remove(); }
            if (suffixContent) {
                currentInst.appendixElement = jqObject('<span class="' + this._suffixClass + '">' + suffixContent + '</span>');
                targetInput[isRightToLeft ? 'before' : 'after'](currentInst.appendixElement);
            }
            targetInput.unbind('focus.clockSelector', this._revealSelector);
            targetInput.unbind('click.clockSelector', this._adjustDisplayLayer);

            if (currentInst.triggerElement) { currentInst.triggerElement.remove(); }

            var displayEvent = this._getOption(currentInst, 'displayTrigger');
            if (displayEvent == 'focus' || displayEvent == 'both') { // Pop-up clock selector when in the marked field
                targetInput.bind("focus.clockSelector", this._revealSelector);
                targetInput.bind("click.clockSelector", this._adjustDisplayLayer);
            }
            if (displayEvent == 'button' || displayEvent == 'both') { // Pop-up clock selector when 'button' element is clicked
                var triggerButton = this._getOption(currentInst, 'triggerButtonRef');
                jqObject(triggerButton).bind("click.clockSelector", function () {
                    if (jqObject.clockSelector._selectorVisible && jqObject.clockSelector._lastActiveInput == targetInput[0]) {
                        jqObject.clockSelector._concealSelector();
                    } else if (!currentInst.targetInput.is(':disabled')) {
                        jqObject.clockSelector._revealSelector(targetInput[0]);
                    }
                    return false;
                });

            }
        },


        /* Binds an embedded clock selector to a div. */
        _embedClockSelector: function(targetElement, currentInst) {
            var containerDivSpan = jqObject(targetElement);
            if (containerDivSpan.hasClass(this.markedElementClass))
                return;
            containerDivSpan.addClass(this.markedElementClass).append(currentInst.panelDiv).
                bind("setData.clockSelector", function(eventObject, key, value){
                    currentInst.settings[key] = value;
                }).bind("getData.clockSelector", function(eventObject, key){
                    return this._getOption(currentInst, key);
                });
            jqObject.data(targetElement, ELEMENT_KEY, currentInst);

            this._setPanelTimeFromField(currentInst);
            this._refreshSelector(currentInst);
            currentInst.panelDiv.show();
        },

        _adjustDisplayLayer: function(targetInput) {
            targetInput = targetInput.target || targetInput;
            var currentInst = jqObject.clockSelector._getInstanceRef(targetInput);
            currentInst.panelDiv.css('zIndex', jqObject.clockSelector._fetchDisplayLayer(targetInput) +1);
        },

        /* Displays the clock selector for a given input field.
         * @param  targetInput  element - the input field linked to the selector or
         * event - if triggered by focus */
        _revealSelector: function (targetInput) {
            targetInput = targetInput.target || targetInput;
            if (targetInput.nodeName.toLowerCase() != 'input') { targetInput = jqObject('input', targetInput.parentNode)[0]; } // Find from button/image trigger

            if (jqObject.clockSelector._isSelectorInactive(targetInput) || jqObject.clockSelector._lastActiveInput == targetInput) { return; } // Already active

            // Fix v 0.0.8 - close existing selector before displaying a new one
            jqObject.clockSelector._concealSelector();

            var currentInst = jqObject.clockSelector._getInstanceRef(targetInput);
            if (jqObject.clockSelector._currentActiveInstance && jqObject.clockSelector._currentActiveInstance != currentInst) {
                jqObject.clockSelector._currentActiveInstance.panelDiv.stop(true, true);
            }
            var preDisplayCallback = jqObject.clockSelector._getOption(currentInst, 'preDisplayCallback');
            mergeAndOverwrite(currentInst.settings, (preDisplayCallback ? preDisplayCallback.apply(targetInput, [targetInput, currentInst]) : {}));
            currentInst.lastVal = null;
            jqObject.clockSelector._lastActiveInput = targetInput;

            jqObject.clockSelector._setPanelTimeFromField(currentInst);

            // Calculate default position
            if (jqObject.clockSelector._withinModal) { targetInput.value = ''; } // Hide cursor
            if (!jqObject.clockSelector._positionCoordinates) { // Position below input
                jqObject.clockSelector._positionCoordinates = jqObject.clockSelector._findPos(targetInput);
                jqObject.clockSelector._positionCoordinates[1] += targetInput.offsetHeight; // Add the height
            }
            var isPositionFixed = false;
            jqObject(targetInput).parents().each(function () {
                isPositionFixed |= jqObject(this).css('position') == 'fixed';
                return !isPositionFixed;
            });
            if (isPositionFixed && jqObject.browserInfo.opera) { // Correction for Opera when fixed and scrolled
                jqObject.clockSelector._positionCoordinates[0] -= document.documentElement.scrollX;
                jqObject.clockSelector._positionCoordinates[1] -= document.documentElement.scrollY;
            }

            var layoutOffset = { left: jqObject.clockSelector._positionCoordinates[0], top: jqObject.clockSelector._positionCoordinates[1] };

            jqObject.clockSelector._positionCoordinates = null;
            // Determine sizing offscreen
            currentInst.panelDiv.css({ position: 'absolute', display: 'block', top: '-1000px' });
            jqObject.clockSelector._refreshSelector(currentInst);


            // Position with the UI position utility, if loaded
            if ( ( ! currentInst.isEmbedded )  && ( typeof jqObject.userInterface.placement == 'object' ) ) {
                currentInst.panelDiv.position({
                    of: currentInst.targetInput,
                    my: jqObject.clockSelector._getOption( currentInst, 'myAlignment' ),
                    at: jqObject.clockSelector._getOption( currentInst, 'atAlignment' ),
                    // offset: jqObject( "#offset" ).val(),
                    // using: using,
                    collision: 'flip'
                });
                var offsetCoord = currentInst.panelDiv.offset();
                jqObject.clockSelector._positionCoordinates = [offsetCoord.top, offsetCoord.left];
            }


            // Reset clicked state
            currentInst._hoursChosen = false;
            currentInst._minutesChosen = false;

            // Fix width for dynamic number of time pickers
            // and adjust position before showing
            layoutOffset = jqObject.clockSelector._verifyPosition(currentInst, layoutOffset, isPositionFixed);
            currentInst.panelDiv.css({ position: (jqObject.clockSelector._withinModal && jqObject.blockUI ?
          'static' : (isPositionFixed ? 'fixed' : 'absolute')), display: 'none',
                left: layoutOffset.left + 'px', top: layoutOffset.top + 'px'
            });
            if ( ! currentInst.isEmbedded ) {
                var animationEffect = jqObject.clockSelector._getOption(currentInst, 'displayAnimation');
                var animationDuration = jqObject.clockSelector._getOption(currentInst, 'duration');

                var afterAnimation = function () {
                    jqObject.clockSelector._selectorVisible = true;
                    var borderDimensions = jqObject.clockSelector._getBorders(currentInst.panelDiv);
                    currentInst.panelDiv.find('iframe.ui-clockselector-overlay'). // IE6- only
          css({ left: -borderDimensions[0], top: -borderDimensions[1],
              width: currentInst.panelDiv.externalWidth(), height: currentInst.panelDiv.externalHeight()
          });
                };

                // Fixed the zIndex problem for real (I hope) - FG - v 0.2.9
                jqObject.clockSelector._adjustDisplayLayer(targetInput);
                //currentInst.panelDiv.css('zIndex', jqObject.clockSelector._fetchDisplayLayer(targetInput) +1);

                if (jqObject.effectsPlugin && jqObject.effectsPlugin[animationEffect]) {
                    currentInst.panelDiv.show(animationEffect, jqObject.clockSelector._getOption(currentInst, 'animationOptions'), animationDuration, afterAnimation);
                }
                else {
                    currentInst.panelDiv[animationEffect || 'show']((animationEffect ? animationDuration : null), afterAnimation);
                }
                if (!animationEffect || !animationDuration) { afterAnimation(); }
                if (currentInst.targetInput.is(':visible') && !currentInst.targetInput.is(':disabled')) { currentInst.targetInput.focus(); }
                jqObject.clockSelector._currentActiveInstance = currentInst;
            }
        },

        // This is a copy of the zIndex function from UI core 1.8.??
        // Copied into the timepicker to maintain backward compatibility.
        _fetchDisplayLayer: function (targetElement) {
            var elementRef = jqObject( targetElement ), positionStyle, valueZ;
            while ( elementRef.length && elementRef[ 0 ] !== document ) {
                positionStyle = elementRef.css( "position" );
                if ( positionStyle === "absolute" || positionStyle === "relative" || positionStyle === "fixed" ) {
                    valueZ = parseInt( elementRef.css( "zIndex" ), 10 );
                    if ( !isNaN( valueZ ) && valueZ !== 0 ) {
                        return valueZ;
                    }
                }
                elementRef = elementRef.parent();
            }
        },

        /* Generates the content for the clock selector. */
        _refreshSelector: function (currentInst) {
            currentInst.panelDiv.empty().append(this._createSelectorMarkup(currentInst));
            this._rebindModalEvents(currentInst);

        },

        _rebindModalEvents: function (currentInst) {
            var borderDimensions = jqObject.clockSelector._getBorders(currentInst.panelDiv),
                thisRef = this;
            currentInst.panelDiv
      .find('iframe.ui-clockselector-overlay') // IE6- only
        .css({ left: -borderDimensions[0], top: -borderDimensions[1],
            width: currentInst.panelDiv.externalWidth(), height: currentInst.panelDiv.externalHeight()
        })
      .end()
            // After the selector HTML is appended, bind click and double-click events (faster in IE this way
            // than relying on inline events).
            // The binding for minute cells also exists within _updateMinuteDisplay.
            .find('.ui-clockselector-minute-cell')
                .unbind()
                .bind("click", { fromDoubleClick:false }, jqObject.proxyMethod(jqObject.clockSelector.chooseMinutes, this))
                .bind("dblclick", { fromDoubleClick:true }, jqObject.proxyMethod(jqObject.clockSelector.chooseMinutes, this))
            .end()
            .find('.ui-clockselector-hour-cell')
                .unbind()
                .bind("click", { fromDoubleClick:false }, jqObject.proxyMethod(jqObject.clockSelector.chooseHours, this))
                .bind("dblclick", { fromDoubleClick:true }, jqObject.proxyMethod(jqObject.clockSelector.chooseHours, this))
            .end()
      .find('.ui-clockselector td a')
                .unbind()
        .bind('mouseout', function () {
            jqObject(this).removeClass('ui-state-hover');
            if (this.className.indexOf('ui-clockselector-prev') != -1) jqObject(this).removeClass('ui-clockselector-prev-hover');
            if (this.className.indexOf('ui-clockselector-next') != -1) jqObject(this).removeClass('ui-clockselector-next-hover');
        })
        .bind('mouseover', function () {
            if ( ! thisRef._isSelectorInactive(currentInst.isEmbedded ? currentInst.panelDiv.parent()[0] : currentInst.targetInput[0])) {
                jqObject(this).parents('.ui-clockselector-calendar').find('a').removeClass('ui-state-hover');
                jqObject(this).addClass('ui-state-hover');
                if (this.className.indexOf('ui-clockselector-prev') != -1) jqObject(this).addClass('ui-clockselector-prev-hover');
                if (this.className.indexOf('ui-clockselector-next') != -1) jqObject(this).addClass('ui-clockselector-next-hover');
            }
        })
      .end()
      .find('.' + this._cellHoverClass + ' a')
        .trigger('mouseover')
      .end()
            .find('.ui-clockselector-now').bind("click",function(e) {
                    jqObject.clockSelector.selectCurrentTime(e);
            }).end()
            .find('.ui-clockselector-deselect').bind("click",function(e) {
                    jqObject.clockSelector.clearSelectedTime(e);
            }).end()
            .find('.ui-clockselector-close').bind("click",function(e) {
                    jqObject.clockSelector._concealSelector();
            }).end();
        },

        /* Generates the HTML markup for the current state of the clock selector. */
        _createSelectorMarkup: function (currentInst) {

            var hr, min, dispRow, dispCol, markupOutput, hoursMarkup, minutesMarkup = '',
                displayPeriod = (this._getOption(currentInst, 'displayPeriod') == true),
                displayPeriodIndicators = (this._getOption(currentInst, 'displayPeriodIndicators') == true),