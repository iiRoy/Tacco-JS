// This file outlines a status display module
// @author Jane Doe <jane.doe@example.com>
// This software is provided under the Apache 2.0 License


(function(jq){

    // This is a placeholder utility function
    // to satisfy documentation generation tools.
    /** @name jq.ui.sStatusPanel
     * @namespace Status Panel Component
     * @example This component issues 'sStatusPanelWon' when the topScore is met. <br />
     * It issues 'sStatusPanelReset' when the game is restarted. <br />
     * The 'Begin' button triggers 'sStatusPanelBegin' upon click. <br />
     * The 'Replay' button triggers 'sStatusPanelReset' upon click. <br />
     * The 'Hold' button triggers 'sStatusPanelHold' when clicked. <br />
     */
    jq.ui.sStatusPanel = function(){};

    jq.widget('ui.sStatusPanel',
        /** @lends jq.ui.sStatusPanel.prototype */
        {
            /** Retrieves the current numerical points.
             * @returns {Number} The current points value.
             */
            fetchPoints : function() {
                return this._obtainData('playerPoints');
            },
            /** Sets the current numerical points.
             * @param {Number} freshPoints The new points value.
             */
            updatePoints : function(freshPoints) {
                this._storeData('playerPoints', Number.parseInt(freshPoints, 10));
                this._updateDisplay();
            },
            /** Obtains the current overall tally.
             * @returns {Number} The current overall tally.
             */
            obtainOverall : function() {
                return this._obtainData('totalCount');
            },
            /** Adjusts the current overall tally.
             * @param {Number} newOverall The new overall tally.
             */
            adjustOverall : function(newOverall) {
                this._storeData('totalCount', Number.parseInt(newOverall, 10));
                this._updateDisplay();
            },
            /**
             * Resets the points and overall tally to their initial settings and
             * triggers the "sStatusPanelReset" event.
             */
            commenceAgain : function() {
                this.element.trigger('sStatusPanelReset');
                this._storeData('playerPoints', this._obtainData('initialPoints'));
                this._storeData('totalCount', this._obtainData('initialOverall'));
                this._updateDisplay();
            },
            /** Increases the points by 1 or by the provided numeric argument.
             * @param {Number} [incrementAmount] The value to add.
             */
            addPoints : function(incrementAmount) {
                var amountToAdd = Number.parseInt(incrementAmount || '1', 10);
                this._storeData('playerPoints', this._obtainData('playerPoints') + amountToAdd);
                this._updateDisplay();
                if(this._obtainData('victoryPoints') === this._obtainData('playerPoints')) {
                    this.element.trigger('sStatusPanelWon');
                }
            },
            /** Increases the overall tally by 1 or by the provided numeric argument.
             * @param {Number} [incrementAmount] The value to add.
             */
            addOverall : function(incrementAmount) {
                var amountToAdd = Number.parseInt(incrementAmount || '1', 10);
                this._storeData('totalCount', this._obtainData('totalCount') + amountToAdd);
                this._updateDisplay();
            },
            /** Decreases the points by 1 or by the provided numeric argument.
             * @param {Number} [decrementAmount] The value to subtract.
             */
            subtractPoints : function(decrementAmount) {
                var amountToSubtract = Number.parseInt(decrementAmount || '1', 10);
                this._storeData('playerPoints', this._obtainData('playerPoints') - amountToSubtract);
                this._updateDisplay();
            },
            /** Decreases the overall tally by 1 or by the provided numeric argument.
             * @param {Number} [decrementAmount] The value to subtract.
             */
            subtractOverall : function(decrementAmount) {
                var amountToSubtract = Number.parseInt(decrementAmount || '1', 10);
                this._storeData('totalCount', this._obtainData('totalCount') - amountToSubtract);
                this._updateDisplay();
            },
            /** Activates the clock, defaulting to 0:00 if no arguments are given.
             * @param {Number} [minutesVal] The initial value for minutes, defaults to 0.
             * @param {Number} [secondsVal] The initial value for seconds, defaults to 0.
             */
            activateClock : function(minutesVal, secondsVal) {
                var isClockTicking = this._obtainData('clockActive') || false;

                if (this._jqClock && isClockTicking === false) {
                    var initialMins = minutesVal || 0;
                    var initialSecs = secondsVal || 0;
                    var clockHandle = null;
                    var currentWidget = this;


                    this._storeData('currentMinutes', initialMins);
                    this._storeData('currentSeconds', initialSecs);

                    var padWithZero = function(numberValue) {
                        if (String(numberValue).length === 1) {
                            return "0".concat(numberValue);
                        } else {
                            return numberValue;
                        }
                    };

                    var advanceClock = function() {
                        if (currentWidget._obtainData('clockActive') === false) {
                            return;
                        }

                        var s = currentWidget._obtainData('currentSeconds') + 1;
                        var m = null;
                        var newClockHandle = null;

                        if (s < 60) {
                            currentWidget._storeData('currentSeconds', s);
                            currentWidget._jqClockSeconds.text(currentWidget._formatNum(padWithZero(s)));
                        } else {
                            s = 0;
                            m = currentWidget._obtainData('currentMinutes') + 1;
                            currentWidget._jqClockSeconds.text(currentWidget._formatNum(padWithZero(s)));
                            currentWidget._jqClockMinutes.text(currentWidget._formatNum(padWithZero(m)));
                            currentWidget._storeData('currentSeconds', s);
                            currentWidget._storeData('currentMinutes', m);
                        }

                        newClockHandle = setTimeout(advanceClock, 1000);
                        currentWidget._storeData('clockHandle', newClockHandle);
                    };

                    clockHandle = setTimeout(advanceClock, 1000);

                    this._storeData('clockActive', true);
                    this._storeData('clockHandle', clockHandle);
                }
            },
            /** Halts the active clock. */
            haltCountdown : function() {
                this._storeData('clockActive', false);
            },
            _translateString : function(textKey, language) {
                return jq.i18n.call(jq.ui.sStatusPanel, textKey, language);
            },
            _formatNum : function(numberValue, language) {
                return jq._n(numberValue, language);
            },
            _setupComponent : function() {

                var displayStyle = "inline";
                var playerPoints = this.options.currentPoints;
                var overallCount = this.options.totalCount;
                var componentInstance = this;

                var settingsObject = jq.extend({}, jq.ui.sStatusPanel.defaults, this.options);

                this._storeData('initialPoints', Number.parseInt(settingsObject.currentPoints, 10));
                this._storeData('initialOverall', Number.parseInt(settingsObject.totalCount, 10));
                this._storeData('playerPoints', Number.parseInt(settingsObject.currentPoints, 10));
                this._storeData('totalCount', Number.parseInt(settingsObject.totalCount, 10));
                this._storeData('victoryPoints', Number.parseInt(settingsObject.targetScore, 10));
                this._storeData('userLanguage', settingsObject.userLanguage);


                this.element.addClass('ui-widget ui-widget-content ' +
                    ' ui-sStatusPanel');


                var jqDisplayArea = jq("<ul></ul>");


                if (settingsObject.displayCounters === true) {

                    var jqScoreDisplay = jq("<li class='left'>" + this._translateString("Points") +
                        "</li>" + "<li class='left'>" +
                        "<span id='sStatusPanelPoints' class='ui-corner-all number'>" +
                        this._formatNum(playerPoints) + "</span></li>" +
                        "<li class='left'>" + this._translateString("Total") + "</li>" +
                        "<li class='left'><span id='sStatusPanelTotal' " +
                        "class='ui-corner-all number'>" +
                        this._formatNum(overallCount) + "</span></li>")
                        .appendTo(jqDisplayArea);

                    this._pointsDisplay = jq('#sStatusPanelPoints', jqScoreDisplay);
                    this._overallDisplay = jq('#sStatusPanelTotal', jqScoreDisplay);

                }

                if (settingsObject.displayClock === true) {
                    this._jqClock = jq("<li class='left'>" + this._translateString("Clock") +
                        "</li>" +
                        "<li class='left'><span id='sStatusPanelMinutes'" +
                        "class='ui-corner-all" +
                        " number timer'>" + this._formatNum("00") +
                        "</span></li>" +
                        "<li class='left'><span id='sStatusPanelSeconds'" +
                        "class='ui-corner-all " +
                        "number timer'>" + this._formatNum("00") +
                        "</span></li>")
                        .appendTo(jqDisplayArea);

                    this._jqClockMinutes = jq('#sStatusPanelMinutes', this._jqClock);
                    this._jqClockSeconds = jq('#sStatusPanelSeconds', this._jqClock);
                }

                // Conditional check for answer button functionality

                if (settingsObject.replayButton === true) {
                    var jqReplayBtn = jq("<li class='right'><button " +
                        "class='ui-corner-all ui-state-default'>" +
                        "<span class='ui-icon ui-icon-arrowrefresh-1-w'>" +
                        "</span>" +
                        "<span class='text left'>" + this._translateString('Replay Game') +
                        "</span></button></li>")
                        .click(function() {
                            componentInstance.activateClock();
                            componentInstance.commenceAgain();
                        })
                        .appendTo(jqDisplayArea);
                }

                if (settingsObject.suspendButton === true) {
                    var jqSuspendBtn = jq("<li class='right'><button " +
                        "class='ui-corner-all ui-state-default'>" +
                        "<span class='ui-icon ui-icon-pause'>" +
                        "</span>" +
                        "<span class='text left'>" + this._translateString('Hold') +
                        "</span></button></li>")
                        .click(function() {
                            componentInstance.haltCountdown();
                            componentInstance.element.trigger('sStatusPanelHold');
                        })
                        .appendTo(jqDisplayArea);
                }

                if (settingsObject.initiateButton === true) {
                    var jqInitiateBtn = jq("<li class='right'><button " +
                        "class='ui-corner-all ui-state-default'>" +
                        "<span class='ui-icon ui-icon-play'>" +
                        "</span>" +
                        "<span class='text left'>" + this._translateString('Begin') +
                        "</span></button></li>")
                        .click(function() {
                            componentInstance.activateClock();
                            componentInstance.element.trigger('sStatusPanelBegin');
                        })
                        .appendTo(jqDisplayArea);
                }

                jq('button', jqDisplayArea).hover(
                    function() {
                        jq(this).addClass("ui-state-hover");
                    },
                    function() {
                        jq(this).removeClass("ui-state-hover");
                    });


                // Inspect if any HTML is present within this.element; if so,
                // wrap it in <li> and append to jqDisplayArea later.
                var jqEmbeddedContent = this.element
                    .children()
                    .appendTo(jqDisplayArea);


                jqEmbeddedContent.wrap('<li class="left"></li>');

                // Remove the original embedded HTML to avoid duplication
                this.element.empty();

                this.element.append(jqDisplayArea);

            },
            _updateDisplay : function() {
                this._pointsDisplay.text(this._formatNum(this._obtainData('playerPoints')));
                this._overallDisplay.text(this._formatNum(this._obtainData('totalCount')));
            },
            /** Removes the sStatusPanel component and all associated data from the DOM. */
            removeComponent : function() {
                this.element.remove();
                jq.widget.prototype.destroy.apply(this, arguments);
            }


        });

    jq.ui.sStatusPanel.getter = ['fetchPoints', 'obtainOverall', '_formatNum', '_translateString'];

    jq.ui.sStatusPanel.i18n = {};


    /** Default configuration for the sStatusPanel widget.
     * @namespace Default settings for the status panel.
     * @extends jq.ui.sStatusPanel
     */
    jq.ui.sStatusPanel.defaults = {
        /** Initial player points.
         * @type Number
         * @default 5
         */
        currentPoints: 5,
        /** Initial overall tally.
         * @type Number
         * @default 10
         */
        totalCount: 10,
        /** The score required to win the game.
         * @type Number
         * @default 100
         */
        targetScore: 100,
        /** Default language setting, e.g., "en" or "fr".
         * @type String
         * @default "fr"
         */
        userLanguage: "fr",
        /** Indicates whether to display the points and total counters.
         * @type boolean
         * @default true
         */
        displayCounters: true,
        /** Indicates whether to display the 'Begin' button.
         * @type boolean
         * @default true
         */
        initiateButton: true,
        /** Indicates whether to display the 'Replay' button.
         * @type boolean
         * @default false
         */
        replayButton: false,
        /** Indicates whether to display the 'Hold' button.
         * @type boolean
         * @default true
         */
        suspendButton: true,
        /** Indicates whether to display the timer.
         * @type boolean
         * @default true
         */
        displayClock: true
    };

})(jQuery);