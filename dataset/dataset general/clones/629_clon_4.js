var KiloFoot = (function($) {

    // --- External Dependency Mock/Fallback ---
    // These functions mimic the behavior of $.i18n and $._n if they are not provided by an external library.
    // The original code assumes these are available globally via jQuery.
    if (typeof $.i18n === 'undefined') {
        $.i18n = function(key, currentLocale) {
            const translationMap = {
                "Score": { "en": "Score", "ne": "अंक" },
                "Total": { "en": "Total", "ne": "कुल" },
                "Timer": { "en": "Timer", "ne": "समय" },
                "Play Again": { "en": "Play Again", "ne": "फेरि खेल्नुहोस्" },
                "Pause": { "en": "Pause", "ne": "रोक्नुहोस्" },
                "Start": { "en": "Start", "ne": "सुरु गर्नुहोस्" }
            };
            const locale = currentLocale || "en";
            return (translationMap[key] && translationMap[key][locale]) ? translationMap[key][locale] : key;
        };
    }

    if (typeof $._n === 'undefined') {
        $._n = function(value, currentLocale) {
            if (currentLocale === "ne") {
                const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
                return String(value).split('').map(digit => nepaliNumerals[parseInt(digit)] || digit).join('');
            }
            return String(value);
        };
    }
    // --- End External Dependency Mock/Fallback ---

    class StatusDisplayModule {
        // Private fields for internal state and DOM references
        #currentMetricScore;
        #currentMetricTotal;
        #initialMetricScore;
        #initialMetricTotal;
        #victoryScoreThreshold;
        #activeLanguageCode;

        #chronometerIntervalId = null;
        #isChronometerActive = false;
        #chronometerMinutes;
        #chronometerSeconds;

        #containerElement;
        #scoreValueDisplay;
        #totalValueDisplay;
        #minuteValueDisplay;
        #secondValueDisplay;

        // Custom event dispatcher
        #signalEmitter;

        // Merged configuration settings
        #componentSettings;

        constructor(domElement, componentOptions) {
            this.#containerElement = $(domElement);
            this.#signalEmitter = new EventTarget();

            // Merge default options with provided options
            this.#componentSettings = this.#mergeConfiguration(componentOptions);

            // Initialize internal state from settings
            this.#initialMetricScore = parseInt(this.#componentSettings.commenceScore);
            this.#initialMetricTotal = parseInt(this.#componentSettings.commenceTotal);
            this.#currentMetricScore = this.#initialMetricScore;
            this.#currentMetricTotal = this.#initialMetricTotal;
            this.#victoryScoreThreshold = parseInt(this.#componentSettings.victoryScore);
            this.#activeLanguageCode = this.#componentSettings.languageCode;

            // Build the visual components and update their initial state
            this.#buildInterface();
            this.#syncVisualElements();
        }

        // Private method to merge user options with defaults
        #mergeConfiguration(userOptions) {
            const standardOptions = {
                commenceScore: 0,
                commenceTotal: 0,
                victoryScore: 0,
                languageCode: "en",
                showScoreboard: true,
                showInitiateButton: false,
                showReplayButton: true,
                showSuspendButton: false,
                showChronometer: false
            };
            return $.extend({}, standardOptions, userOptions);
        }

        // Private method for translating text, using the module's static helper
        #getLocalizedText(key) {
            return KiloFoot.getTranslation(key, this.#activeLanguageCode);
        }

        // Private method for number formatting, using the module's static helper
        #getFormattedNumber(value) {
            return KiloFoot.getFormattedNumber(value, this.#activeLanguageCode);
        }

        // Private method to construct the DOM elements
        #buildInterface() {
            this.#containerElement.addClass('view-component view-content view-status-bar');

            const primaryList = $('<ul></ul>');

            if (this.#componentSettings.showScoreboard) {
                const scoreBoardMarkup = $(
                    `<li class="left">${this.#getLocalizedText("Score")}</li>` +
                    `<li class="left"><span id="score_value_id" class="corner-style figure-text"></span></li>` +
                    `<li class="left">${this.#getLocalizedText("Total")}</li>` +
                    `<li class="left"><span id="total_value_id" class="corner-style figure-text"></span></li>`
                ).appendTo(primaryList);

                this.#scoreValueDisplay = $('#score_value_id', scoreBoardMarkup);
                this.#totalValueDisplay = $('#total_value_id', scoreBoardMarkup);
            }

            if (this.#componentSettings.showChronometer) {
                const timerMarkup = $(
                    `<li class="left">${this.#getLocalizedText("Timer")}</li>` +
                    `<li class="left"><span id="minute_value_id" class="corner-style figure-text clock-part"></span></li>` +
                    `<li class="left"><span id="second_value_id" class="corner-style figure-text clock-part"></span></li>`
                ).appendTo(primaryList);

                this.#minuteValueDisplay = $('#minute_value_id', timerMarkup);
                this.#secondValueDisplay = $('#second_value_id', timerMarkup);
            }

            if (this.#componentSettings.showReplayButton) {
                $(`<li class="right"><button class="corner-style-button state-default-button">` +
                  `<span class="icon-refresh"></span>` +
                  `<span class="label-text left">${this.#getLocalizedText('Play Again')}</span></button></li>`)
                    .on('click', () => {
                        this.activateChronometer();
                        this.resetMetrics();
                    })
                    .appendTo(primaryList);
            }

            if (this.#componentSettings.showSuspendButton) {
                $(`<li class="right"><button class="corner-style-button state-default-button">` +
                  `<span class="icon-pause"></span>` +
                  `<span class="label-text left">${this.#getLocalizedText('Pause')}</span></button></li>`)
                    .on('click', () => {
                        this.deactivateChronometer();
                        this.#signalEmitter.dispatchEvent(new CustomEvent('metricPause'));
                    })
                    .appendTo(primaryList);
            }

            if (this.#componentSettings.showInitiateButton) {
                $(`<li class="right"><button class="corner-style-button state-default-button">` +
                  `<span class="icon-play"></span>` +
                  `<span class="label-text left">${this.#getLocalizedText('Start')}</span></button></li>`)
                    .on('click', () => {
                        this.activateChronometer();
                        this.#signalEmitter.dispatchEvent(new CustomEvent('metricStart'));
                    })
                    .appendTo(primaryList);
            }

            // Apply hover effects to buttons
            $('button', primaryList).hover(
                function() { $(this).addClass("state-hover-button"); },
                function() { $(this).removeClass("state-hover-button"); }
            );

            // Handle existing user HTML within the container
            const userContent = this.#containerElement.children().detach();
            userContent.wrap('<li class="left"></li>');
            primaryList.append(userContent.parent());

            this.#containerElement.empty().append(primaryList);
        }

        // Private method to refresh score and total displays
        #syncVisualElements() {
            if (this.#scoreValueDisplay) {
                this.#scoreValueDisplay.text(this.#getFormattedNumber(this.#currentMetricScore));
            }
            if (this.#totalValueDisplay) {
                this.#totalValueDisplay.text(this.#getFormattedNumber(this.#currentMetricTotal));
            }
        }

        // Private helper for adding leading zero to numbers
        #prefixZero(num) {
            return String(num).length === 1 ? `0${num}` : String(num);
        }

        // Private method to update chronometer display
        #syncChronometerDisplay() {
            if (this.#minuteValueDisplay && this.#secondValueDisplay) {
                this.#minuteValueDisplay.text(this.#getFormattedNumber(this.#prefixZero(this.#chronometerMinutes)));
                this.#secondValueDisplay.text(this.#getFormattedNumber(this.#prefixZero(this.#chronometerSeconds)));
            }
        }

        // --- Public Methods (API) ---

        // Retrieves the current score
        obtainCurrentScore() {
            return this.#currentMetricScore;
        }

        // Modifies the current score
        modifyCurrentScore(newAmount) {
            this.#currentMetricScore = parseInt(newAmount);
            this.#syncVisualElements();
        }

        // Retrieves the current total
        obtainCurrentTotal() {
            return this.#currentMetricTotal;
        }

        // Modifies the current total
        modifyCurrentTotal(newAmount) {
            this.#currentMetricTotal = parseInt(newAmount);
            this.#syncVisualElements();
        }

        // Resets scores and triggers a restart event
        resetMetrics() {
            this.#signalEmitter.dispatchEvent(new CustomEvent('metricRestart'));
            this.#currentMetricScore = this.#initialMetricScore;
            this.#currentMetricTotal = this.#initialMetricTotal;
            this.#syncVisualElements();
            this.deactivateChronometer(); // Stop timer on reset
            this.#chronometerMinutes = 0;
            this.#chronometerSeconds = 0;
            this.#syncChronometerDisplay();
        }

        // Increases the score
        increaseScore(increment = 1) {
            const effectiveIncrement = parseInt(increment) || 1;
            this.#currentMetricScore += effectiveIncrement;
            this.#syncVisualElements();
            if (this.#victoryScoreThreshold === this.#currentMetricScore) {
                this.#signalEmitter.dispatchEvent(new CustomEvent('metricVictory'));
            }
        }

        // Increases the total
        increaseTotal(increment = 1) {
            const effectiveIncrement = parseInt(increment) || 1;
            this.#currentMetricTotal += effectiveIncrement;
            this.#syncVisualElements();
        }

        // Decreases the score
        decreaseScore(decrement = 1) {
            const effectiveDecrement = parseInt(decrement) || 1;
            this.#currentMetricScore -= effectiveDecrement;
            this.#syncVisualElements();
        }

        // Decreases the total
        decreaseTotal(decrement = 1) {
            const effectiveDecrement = parseInt(decrement) || 1;
            this.#currentMetricTotal -= effectiveDecrement;
            this.#syncVisualElements();
        }

        // Starts the chronometer
        activateChronometer(startMinutes = 0, startSeconds = 0) {
            if (!this.#componentSettings.showChronometer || this.#isChronometerActive) {
                return;
            }

            this.#chronometerMinutes = startMinutes || 0;
            this.#chronometerSeconds = startSeconds || 0;
            this.#syncChronometerDisplay();

            this.#isChronometerActive = true;
            this.#chronometerIntervalId = setInterval(() => {
                if (!this.#isChronometerActive) {
                    clearInterval(this.#chronometerIntervalId);
                    this.#chronometerIntervalId = null;
                    return;
                }

                let currentSeconds = this.#chronometerSeconds + 1;
                let currentMinutes = this.#chronometerMinutes;

                if (currentSeconds >= 60) {
                    currentSeconds = 0;
                    currentMinutes++;
                }

                this.#chronometerSeconds = currentSeconds;
                this.#chronometerMinutes = currentMinutes;
                this.#syncChronometerDisplay();

            }, 1000);
        }

        // Stops the chronometer
        deactivateChronometer() {
            if (this.#chronometerIntervalId) {
                clearInterval(this.#chronometerIntervalId);
                this.#chronometerIntervalId = null;
            }
            this.#isChronometerActive = false;
        }

        // Registers a callback for custom events
        onEvent(eventName, callback) {
            this.#signalEmitter.addEventListener(eventName, callback);
        }

        // Cleans up the component and removes it from the DOM
        removeComponent() {
            this.deactivateChronometer();
            this.#containerElement.removeClass('view-component view-content view-status-bar');
            this.#containerElement.empty();
            // In the original, $.widget.prototype.destroy clears data and events.
            // For a plain class, clearing the DOM and stopping intervals is the primary cleanup.
            // Event listeners added via `onEvent` would need to be explicitly removed if this.onEvent
            // used a custom event system that didn't automatically clean up. EventTarget handles this.
        }
    }

    // Expose the class and static helper functions under a new namespace
    return {
        StatusDisplayModule: StatusDisplayModule,
        getTranslation: function(textKey, localeCode) {
            // This calls the (potentially mocked) global $.i18n function
            return $.i18n(textKey, localeCode);
        },
        getFormattedNumber: function(numericValue, localeCode) {
            // This calls the (potentially mocked) global $._n function
            return $._n(numericValue, localeCode);
        }
    };

})(jQuery);