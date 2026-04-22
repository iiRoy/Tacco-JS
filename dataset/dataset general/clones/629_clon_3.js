/**
 * @fileOverview A dynamic widget for tracking game statistics and controls.
 * @author Elara Systems <dev@elara-systems.com>
 * @license Apache-2.0
 */

(function(jQ) {

    // The jQuery UI widget factory requires a basic definition
    // before the full implementation.
    jQ.ui.scoreTracker = function() {};

    jQ.widget('ui.scoreTracker', {
        /**
         * @lends $.ui.scoreTracker.prototype
         */

        /**
         * Internal helper to safely parse numeric inputs.
         * @private
         * @param {any} input The value to parse.
         * @param {number} [defaultValue=0] The default value if parsing fails.
         * @returns {number} The parsed integer or the default value.
         */
        _parseNumericInput: function(input, defaultValue = 0) {
            const parsed = Number(input);
            return Number.isFinite(parsed) ? Math.trunc(parsed) : defaultValue;
        },

        /**
         * Retrieves the current points tally.
         * @returns {number} The present score.
         */
        getPoints: function() {
            return this._getData('currentPoints');
        },

        /**
         * Updates the current points tally.
         * @param {number} newPoints The new score value.
         */
        setPoints: function(newPoints) {
            const validatedPoints = this._parseNumericInput(newPoints);
            this._setData('currentPoints', validatedPoints);
            this._updateVisuals();
            this._checkVictoryCondition();
        },

        /**
         * Fetches the current overall count.
         * @returns {number} The total count.
         */
        getOverallCount: function() {
            return this._getData('overallCount');
        },

        /**
         * Assigns a new value to the overall count.
         * @param {number} newTotal The new total count.
         */
        setOverallCount: function(newTotal) {
            const validatedTotal = this._parseNumericInput(newTotal);
            this._setData('overallCount', validatedTotal);
            this._updateVisuals();
        },

        /**
         * Resets all tracked statistics to their initial configurations and triggers a "trackerReset" event.
         */
        resetState: function() {
            this.element.trigger('trackerReset');
            const initialPts = this._getData('baselinePoints');
            const initialCnt = this._getData('baselineCount');

            // Ensure initial values are valid numbers before setting
            this._setData('currentPoints', this._parseNumericInput(initialPts));
            this._setData('overallCount', this._parseNumericInput(initialCnt));
            this._updateVisuals();
            this.haltChronometer(); // Stop timer on reset
            this._setData('chronoMinutes', 0); // Reset timer display data
            this._setData('chronoSeconds', 0);
            this._updateChronoDisplay(); // Update chrono display immediately
        },

        /**
         * Adjusts the points by a specified value.
         * @private
         * @param {number} value The amount to adjust by.
         */
        _adjustPoints: function(value) {
            const current = this._getData('currentPoints');
            this._setData('currentPoints', current + value);
            this._updateVisuals();
            this._checkVictoryCondition();
        },

        /**
         * Adjusts the overall count by a specified value.
         * @private
         * @param {number} value The amount to adjust by.
         */
        _adjustOverallCount: function(value) {
            const current = this._getData('overallCount');
            this._setData('overallCount', current + value);
            this._updateVisuals();
        },

        /**
         * Increments the points by a given value (defaults to 1).
         * @param {number} [amount] The increment value.
         */
        increasePoints: function(amount) {
            const increment = this._parseNumericInput(amount, 1);
            this._adjustPoints(increment);
        },

        /**
         * Increments the overall count by a given value (defaults to 1).
         * @param {number} [amount] The increment value.
         */
        increaseOverall: function(amount) {
            const increment = this._parseNumericInput(amount, 1);
            this._adjustOverallCount(increment);
        },

        /**
         * Decrements the points by a given value (defaults to 1).
         * @param {number} [amount] The decrement value.
         */
        decreasePoints: function(amount) {
            const decrement = this._parseNumericInput(amount, 1);
            this._adjustPoints(-decrement);
        },

        /**
         * Decrements the overall count by a given value (defaults to 1).
         * @param {number} [amount] The decrement value.
         */
        decreaseOverall: function(amount) {
            const decrement = this._parseNumericInput(amount, 1);
            this._adjustOverallCount(-decrement);
        },

        /**
         * Checks if the current points meet or exceed the winning threshold, triggering 'trackerVictory' if so.
         * @private
         */
        _checkVictoryCondition: function() {
            const currentPoints = this._getData('currentPoints');
            const winThreshold = this._getData('winningPointsThreshold');

            // Only trigger if a valid threshold is set and met
            if (Number.isFinite(winThreshold) && winThreshold > 0 && currentPoints >= winThreshold) {
                this.element.trigger('trackerVictory');
            }
        },

        /**
         * Formats a number by adding a leading zero if it's a single digit.
         * @private
         * @param {number} value The number to format.
         * @returns {string} The formatted string.
         */
        _padTwoDigits: function(value) {
            return String(value).padStart(2, '0');
        },

        /**
         * Updates the chronometer display elements.
         * @private
         */
        _updateChronoDisplay: function() {
            if (this._chronometerMinutesEl && this._chronometerSecondsEl) {
                const currentMins = this._getData('chronoMinutes');
                const currentSecs = this._getData('chronoSeconds');
                this._chronometerMinutesEl.text(this._formatNumber(this._padTwoDigits(currentMins)));
                this._chronometerSecondsEl.text(this._formatNumber(this._padTwoDigits(currentSecs)));
            }
        },

        /**
         * Core logic for incrementing the chronometer.
         * @private
         */
        _incrementChronometer: function() {
            if (!this._getData('isChronometerActive')) {
                clearInterval(this._getData('chronoIntervalId'));
                this._setData('chronoIntervalId', null);
                return; // Stop if not active
            }

            let currentSecs = this._getData('chronoSeconds') + 1;
            let currentMins = this._getData('chronoMinutes');

            if (currentSecs >= 60) {
                currentSecs = 0;
                currentMins += 1;
            }

            this._setData('chronoSeconds', currentSecs);
            this._setData('chronoMinutes', currentMins);
            this._updateChronoDisplay();
        },

        /**
         * Initiates the chronometer.
         * @param {number} [minutes=0] Starting minutes.
         * @param {number} [seconds=0] Starting seconds.
         */
        activateChronometer: function(minutes = 0, seconds = 0) {
            if (!this._chronometerContainer || this._getData('isChronometerActive')) {
                // Timer display not enabled or already running
                return;
            }

            const initialMins = this._parseNumericInput(minutes, 0);
            const initialSecs = this._parseNumericInput(seconds, 0);

            this._setData('chronoMinutes', initialMins);
            this._setData('chronoSeconds', initialSecs);
            this._setData('isChronometerActive', true);

            // Clear any potential leftover interval just in case
            if (this._getData('chronoIntervalId')) {
                clearInterval(this._getData('chronoIntervalId'));
            }

            // Set up a new interval
            const intervalId = setInterval(() => this._incrementChronometer(), 1000);
            this._setData('chronoIntervalId', intervalId);

            this._updateChronoDisplay(); // Initial display update
        },

        /**
         * Halts the chronometer.
         */
        haltChronometer: function() {
            this._setData('isChronometerActive', false);
            const currentInterval = this._getData('chronoIntervalId');
            if (currentInterval) {
                clearInterval(currentInterval);
                this._setData('chronoIntervalId', null);
            }
        },

        /**
         * Translates a string using the i18n utility.
         * @private
         * @param {string} key The translation key.
         * @param {string} [languageCode] Optional language code.
         * @returns {string} The translated string.
         */
        _translateString: function(key, languageCode) {
            if (jQ.i18n && typeof jQ.i18n.call === 'function') {
                return jQ.i18n.call(jQ.ui.scoreTracker, key, languageCode || this._getData('displayLanguage'));
            }
            return key; // Fallback if i18n is not available
        },

        /**
         * Formats a number using the number formatting utility.
         * @private
         * @param {number|string} value The value to format.
         * @param {string} [languageCode] Optional language code.
         * @returns {string} The formatted number string.
         */
        _formatNumber: function(value, languageCode) {
            if (jQ._n && typeof jQ._n === 'function') {
                return jQ._n(value, languageCode || this._getData('displayLanguage'));
            }
            return String(value); // Fallback
        },

        /**
         * Creates a standardized action button list item.
         * @private
         * @param {string} iconClass The UI icon class.
         * @param {string} labelText The button's text label.
         * @param {function} clickHandler The function to execute on click.
         * @returns {jQuery} The created list item jQuery object.
         */
        _createActionButton: function(iconClass, labelText, clickHandler) {
            const widgetInstance = this; // Capture 'this' for the handler
            const $buttonLi = jQ(`
                <li class="control-item align-right">
                    <button class="ui-corner-all ui-state-default">
                        <span class="ui-icon ${iconClass}"></span>
                        <span class="button-label">${this._translateString(labelText)}</span>
                    </button>
                </li>
            `);

            $buttonLi.find('button')
                .on('click', clickHandler.bind(widgetInstance)) // Bind 'this' to the handler
                .on('mouseenter', function() { jQ(this).addClass("ui-state-hover"); })
                .on('mouseleave', function() { jQ(this).removeClass("ui-state-hover"); });

            return $buttonLi;
        },

        /**
         * Widget initialization method.
         * @private
         */
        _createWidget: function() {
            const widgetInstance = this;

            // Merge default options with user-provided options
            const currentOptions = jQ.extend({}, jQ.ui.scoreTracker.defaultOptions, this.options);

            // Store initial and current state data
            this._setData('baselinePoints', this._parseNumericInput(currentOptions.initialPoints));
            this._setData('baselineCount', this._parseNumericInput(currentOptions.initialOverallCount));
            this._setData('currentPoints', this._parseNumericInput(currentOptions.initialPoints));
            this._setData('overallCount', this._parseNumericInput(currentOptions.initialOverallCount));
            this._setData('winningPointsThreshold', this._parseNumericInput(currentOptions.victoryThreshold));
            this._setData('displayLanguage', currentOptions.displayLanguage);
            this._setData('isChronometerActive', false); // Ensure timer is off initially
            this._setData('chronoIntervalId', null);

            // Apply base classes to the main element
            this.element.addClass('ui-widget ui-widget-content ui-game-stats-panel');

            // Create the main container list
            const $panelList = jQ('<ul></ul>');

            // Conditional rendering for the scoreboard display
            if (currentOptions.enableScorePanel) {
                const initialPtsVal = this._formatNumber(this._parseNumericInput(currentOptions.initialPoints));
                const initialCntVal = this._formatNumber(this._parseNumericInput(currentOptions.initialOverallCount));

                const $scorePanel = jQ(`
                    <li class="display-group align-left">
                        <span class="label">${this._translateString('Points')}</span>
                        <span id="scorePanelDisplay" class="ui-corner-all display-value">
                            ${initialPtsVal}
                        </span>
                    </li>
                    <li class="display-group align-left">
                        <span class="label">${this._translateString('Overall')}</span>
                        <span id="totalPanelDisplay" class="ui-corner-all display-value">
                            ${initialCntVal}
                        </span>
                    </li>
                `).appendTo($panelList);

                this._pointsDisplayEl = jQ('#scorePanelDisplay', $scorePanel);
                this._overallDisplayEl = jQ('#totalPanelDisplay', $scorePanel);
            }

            // Conditional rendering for the timer display
            if (currentOptions.enableChrono) {
                this._chronometerContainer = jQ(`
                    <li class="display-group align-left">
                        <span class="label">${this._translateString('Time')}</span>
                        <span id="timerMinsDisplay" class="ui-corner-all display-value timer-segment">
                            ${this._formatNumber('00')}
                        </span>
                        <span class="timer-separator">:</span>
                        <span id="timerSecsDisplay" class="ui-corner-all display-value timer-segment">
                            ${this._formatNumber('00')}
                        </span>
                    </li>
                `).appendTo($panelList);

                this._chronometerMinutesEl = jQ('#timerMinsDisplay', this._chronometerContainer);
                this._chronometerSecondsEl = jQ('#timerSecsDisplay', this._chronometerContainer);
            }

            // Create and append control buttons
            if (currentOptions.showResetControl) {
                const $resetBtn = this._createActionButton(
                    'ui-icon-arrowrefresh-1-w',
                    'Replay',
                    function() {
                        this.activateChronometer(); // Restart timer on replay
                        this.resetState();
                    }
                ).appendTo($panelList);
            }

            if (currentOptions.showPauseControl) {
                const $pauseBtn = this._createActionButton(
                    'ui-icon-pause',
                    'Suspend',
                    function() {
                        this.haltChronometer();
                        this.element.trigger('trackerSuspend');
                    }
                ).appendTo($panelList);
            }

            if (currentOptions.showStartControl) {
                const $startBtn = this._createActionButton(
                    'ui-icon-play',
                    'Commence',
                    function() {
                        this.activateChronometer();
                        this.element.trigger('trackerBegin');
                    }
                ).appendTo($panelList);
            }

            // Handle user-provided HTML content within the widget's element
            const $existingContent = this.element.children();
            if ($existingContent.length > 0) {
                // Wrap existing children in a list item and append to the panel
                jQ('<li class="user-content-wrapper align-left"></li>')
                    .append($existingContent)
                    .appendTo($panelList);
            }

            // Clear the original element and append the constructed panel
            this.element.empty().append($panelList);
        },

        /**
         * Updates the displayed score and total values.
         * @private
         */
        _updateVisuals: function() {
            if (this._pointsDisplayEl) {
                this._pointsDisplayEl.text(this._formatNumber(this._getData('currentPoints')));
            }
            if (this._overallDisplayEl) {
                this._overallDisplayEl.text(this._formatNumber(this._getData('overallCount')));
            }
        },

        /**
         * Cleans up the widget and removes it from the DOM.
         */
        _removeWidget: function() {
            this.haltChronometer(); // Ensure timer is stopped
            this.element.empty().remove(); // Remove content and the element itself
            jQ.widget.prototype.destroy.apply(this, arguments); // Call base destroy
        }
    });

    // Define methods accessible via .scoreTracker("methodName")
    jQ.ui.scoreTracker.accessibleMethods = [
        'getPoints',
        'getOverallCount',
        '_formatNumber',
        '_translateString'
    ];

    // Placeholder for internationalization data
    jQ.ui.scoreTracker.localizationData = {};

    /**
     * Default configuration options for the scoreTracker widget.
     * @namespace Default settings for the scoreTracker widget.
     * @extends $.ui.scoreTracker
     */
    jQ.ui.scoreTracker.defaultOptions = {
        /**
         * Initial points value.
         * @type {number}
         * @default 0
         */
        initialPoints: 0,
        /**
         * Initial overall count value.
         * @type {number}
         * @default 0
         */
        initialOverallCount: 0,
        /**
         * The points value that triggers the 'trackerVictory' event.
         * @type {number}
         * @default 0
         */
        victoryThreshold: 0,
        /**
         * Default language for display, e.g., "en", "es".
         * @type {string}
         * @default "en"
         */
        displayLanguage: "en",
        /**
         * Whether to display the points and overall count panel.
         * @type {boolean}
         * @default true
         */
        enableScorePanel: true,
        /**
         * Whether to display the "Start" control button.
         * @type {boolean}
         * @default false
         */
        showStartControl: false,
        /**
         * Whether to display the "Reset" control button.
         * @type {boolean}
         * @default true
         */
        showResetControl: true,
        /**
         * Whether to display the "Pause" control button.
         * @type {boolean}
         * @default false
         */
        showPauseControl: false,
        /**
         * Whether to display and enable the chronometer.
         * @type {boolean}
         * @default false
         */
        enableChrono: false
    };

})(jQuery);