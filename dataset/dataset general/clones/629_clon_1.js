/*******************************************************************************
 * This file defines the kFooter widget for jQuery UI.
 * It provides a configurable footer with score, total, timer, and control buttons.
 *
 * @fileOverview A comprehensive footer widget for interactive applications.
 * @author Bryan Berry <bryan@olenepal.org>
 * @license MIT License - Freely usable and distributable under MIT terms.
 ******************************************************************************/


// Encapsulates the widget definition within a self-executing anonymous function
// to prevent global scope pollution, passing jQuery as an argument.
( function ( $ ) {

    // This is a placeholder function, primarily to satisfy JSDoc tooling.
    // It documents the main namespace for the kFooter widget.
    /**
     * @name $.ui.kFooter
     * @namespace The kFooter widget, providing interactive footer functionalities.
     * @example
     * // The widget emits various events based on user interactions and game state:
     * // - 'kFooterWinGame' is triggered when the winning score condition is met.
     * // - 'kFooterRestart' is emitted when the game state is reset via the restart button.
     * // - 'kFooterStart' fires when the start button is clicked, initiating the timer.
     * // - 'kFooterPause' is emitted when the pause button is clicked, stopping the timer.
     */
    $.ui.kFooter = function () {};

    // Defines the jQuery UI widget 'kFooter' within the 'ui' namespace.
    $.widget( 'ui.kFooter',
        /**
         * @lends $.ui.kFooter.prototype
         * @description Prototype methods for the kFooter widget.
         */
        {
            // Method to retrieve the current score value.
            /**
             * Retrieves the current score of the game.
             * @returns {Number} The current score.
             */
            getScore: function () {
                return this._getData( 'score' );
            },

            // Method to update the current score.
            /**
             * Sets a new value for the current score.
             * The input is parsed to an integer.
             * @param {Number} newScore The new score to be set.
             */
            setScore: function ( newScore ) {
                this._setData( 'score', parseInt( newScore, 10 ) );
                this._refresh(); // Update the UI to reflect the new score.
            },

            // Method to retrieve the current total value.
            /**
             * Retrieves the current total value.
             * @returns {Number} The current total.
             */
            getTotal: function () {
                return this._getData( 'total' );
            },

            // Method to update the current total.
            /**
             * Sets a new value for the current total.
             * The input is parsed to an integer.
             * @param {Number} newTotal The new total to be set.
             */
            setTotal: function ( newTotal ) {
                this._setData( 'total', parseInt( newTotal, 10 ) );
                this._refresh(); // Update the UI to reflect the new total.
            },

            // Resets game state and triggers a restart event.
            /**
             * Resets both the score and total to their initial configured values.
             * Additionally, it triggers the "kFooterRestart" event.
             */
            restart: function () {
                this.element.trigger( 'kFooterRestart' ); // Notify listeners of a restart.
                this._setData( 'score', this._getData( 'initialScore' ) ); // Reset score.
                this._setData( 'total', this._getData( 'initialTotal' ) ); // Reset total.
                this._refresh(); // Update the displayed values.
            },

            // Increments the score.
            /**
             * Increments the current score. If a value is provided, it increments by that amount;
             * otherwise, it increments by 1.
             * @param {Number} [val] Optional value to increment the score by. Defaults to 1.
             */
            inc: function ( val ) {
                var incVal = parseInt( val, 10 ) || 1; // Determine increment value, default to 1.
                this._setData( 'score', this._getData( 'score' ) + incVal );
                this._refresh(); // Update the UI.

                // Check for win condition after incrementing score.
                if ( this._getData( 'winScore' ) === this._getData( 'score' ) ) {
                    this.element.trigger( 'kFooterWinGame' ); // Trigger win game event.
                }
            },

            // Increments the total.
            /**
             * Increments the current total. If a value is provided, it increments by that amount;
             * otherwise, it increments by 1.
             * @param {Number} [val] Optional value to increment the total by. Defaults to 1.
             */
            incTotal: function ( val ) {
                var incVal = parseInt( val, 10 ) || 1; // Determine increment value, default to 1.
                this._setData( 'total', this._getData( 'total' ) + incVal );
                this._refresh(); // Update the UI.
            },

            // Decrements the score.
            /**
             * Decrements the current score. If a value is provided, it decrements by that amount;
             * otherwise, it decrements by 1.
             * @param {Number} [val] Optional value to decrement the score by. Defaults to 1.
             */
            dec: function ( val ) {
                var decVal = parseInt( val, 10 ) || 1; // Determine decrement value, default to 1.
                this._setData( 'score', this._getData( 'score' ) - decVal );
                this._refresh(); // Update the UI.
            },

            // Decrements the total.
            /**
             * Decrements the current total. If a value is provided, it decrements by that amount;
             * otherwise, it decrements by 1.
             * @param {Number} [val] Optional value to decrement the total by. Defaults to 1.
             */
            decTotal: function ( val ) {
                var decVal = parseInt( val, 10 ) || 1; // Determine decrement value, default to 1.
                this._setData( 'total', this._getData( 'total' ) - decVal );
                this._refresh(); // Update the UI.
            },

            // Starts the timer.
            /**
             * Starts the timer display. If no arguments are supplied, the timer starts from 0:00.
             * @param {Number} [minutes] Initial minutes for the timer. Defaults to 0.
             * @param {Number} [seconds] Initial seconds for the timer. Defaults to 0.
             */
            startTimer: function ( minutes, seconds ) {
                var timerRunning = this._getData( 'timerRunning' ) || false; // Check if timer is already active.

                // Only proceed if the timer element exists and the timer is not already running.
                if ( this._$timer && timerRunning === false ) {
                    var mins = minutes || 0; // Initialize minutes.
                    var secs = seconds || 0; // Initialize seconds.
                    var timerId = null; // Variable to hold the timer ID.
                    var self = this; // Cache 'this' for use in nested functions.

                    this._setData( 'mins', mins ); // Store initial minutes.
                    this._setData( 'secs', secs ); // Store initial seconds.

                    /**
                     * Helper function to add a leading zero to numbers less than 10.
                     * @param {Number} num The number to format.
                     * @returns {String} The formatted number with a leading zero if necessary.
                     */
                    var addLeadingZero = function ( num ) {
                        if ( ( '' + num ).length === 1 ) {
                            return "0" + num; // Prepend zero for single-digit numbers.
                        } else {
                            return num; // Return as is for two-digit numbers.
                        }
                    };

                    /**
                     * Recursive function to increase the timer every second.
                     */
                    var increaseTimer = function () {
                        // Stop if the timer has been paused or stopped externally.
                        if ( self._getData( 'timerRunning' ) === false ) {
                            return;
                        }

                        var s = self._getData( 'secs' ) + 1; // Increment seconds.
                        var m = null; // Declare minutes variable.
                        var timerId = null; // Local timer ID variable.

                        if ( s < 60 ) {
                            self._setData( 'secs', s ); // Update seconds if less than 60.
                            self._$timerSecs.text( self._n( addLeadingZero( s ) ) ); // Update seconds display.
                        } else {
                            s = 0; // Reset seconds to 0.
                            m = self._getData( 'mins' ) + 1; // Increment minutes.
                            self._$timerSecs.text( self._n( addLeadingZero( s ) ) ); // Update seconds display to 00.
                            self._$timerMins.text( self._n( addLeadingZero( m ) ) ); // Update minutes display.
                            self._setData( 'secs', s ); // Store new seconds.
                            self._setData( 'mins', m ); // Store new minutes.
                        }

                        // Schedule the next timer increment.
                        timerId = setTimeout( increaseTimer, 1000 );
                        self._setData( 'timerId', timerId ); // Store the current timer ID.
                    };

                    // Initial call to start the timer, after a 1-second delay.
                    timerId = setTimeout( increaseTimer, 1000 );

                    this._setData( 'timerRunning', true ); // Mark timer as running.
                    this._setData( 'timerId', timerId ); // Store the initial timer ID.
                }
            },

            // Stops the timer.
            /**
             * Stops the running timer by setting its status to not running.
             * The `increaseTimer` function checks this flag.
             */
            stopTimer: function () {
                this._setData( 'timerRunning', false ); // Set flag to stop timer.
            },

            // Internationalization function (single string).
            /**
             * Provides internationalization for a single string.
             * @param {String} val The string key to translate.
             * @param {String} [loc] Optional locale override.
             * @returns {String} The translated string.
             */
            _: function ( val, loc ) {
                return $.i18n.call( $.ui.kFooter, val, loc );
            },

            // Internationalization function (number formatting).
            /**
             * Provides internationalization for number formatting.
             * @param {Number|String} val The number or string representing a number to format.
             * @param {String} [loc] Optional locale override.
             * @returns {String} The formatted number string.
             */
            _n: function ( val, loc ) {
                return $._n( val, loc );
            },

            // Widget initialization logic.
            /**
             * The internal initialization method for the widget.
             * This method is called automatically when the widget is created.
             */
            _init: function () {
                var divDisplay = "inline"; // Unused variable, possibly for future use.
                var score = this.options.score; // Get initial score from options.
                var total = this.options.total; // Get initial total from options.
                var self = this; // Cache 'this' for use in event handlers.

                // Merge default options with user-provided options.
                var options = $.extend( {}, $.ui.kFooter.defaults, this.options );

                // Store initial and current state data.
                this._setData( 'initialScore', parseInt( options.score, 10 ) );
                this._setData( 'initialTotal', parseInt( options.total, 10 ) );
                this._setData( 'score', parseInt( options.score, 10 ) );
                this._setData( 'total', parseInt( options.total, 10 ) );
                this._setData( 'winScore', parseInt( options.winningScore, 10 ) );
                this._setData( 'locale', options.locale );

                // Add base classes to the widget element for styling.
                this.element.addClass( 'ui-widget ui-widget-content ui-kFooter' );

                // Create the main unordered list element for the footer content.
                var $kFooter = $( "<ul></ul>" );

                // Conditionally render the scoreboard section.
                if ( options.scoreboard === true ) {
                    var $scoreboard = $(
                            "<li class='left'>" + this._( "Score" ) + "</li>" +
                            "<li class='left'>" +
                            "<span id='kFooterScore' class='ui-corner-all number'>" +
                            this._n( score ) + "</span></li>" +
                            "<li class='left'>" + this._( "Total" ) + "</li>" +
                            "<li class='left'><span id='kFooterTotal' " +
                            "class='ui-corner-all number'>" +
                            this._n( total ) + "</span></li>"
                        )
                        .appendTo( $kFooter ); // Append scoreboard HTML to the footer list.

                    // Cache references to the score and total display elements.
                    this._score = $( '#kFooterScore', $scoreboard );
                    this._total = $( '#kFooterTotal', $scoreboard );
                }

                // Conditionally render the timer section.
                if ( options.timer === true ) {
                    this._$timer = $(
                            "<li class='left'>" + this._( "Timer" ) + "</li>" +
                            "<li class='left'><span id='kFooterMins'" +
                            "class='ui-corner-all number timer'>" + this._n( "00" ) +
                            "</span></li>" +
                            "<li class='left'><span id='kFooterSecs'" +
                            "class='ui-corner-all number timer'>" + this._n( "00" ) +
                            "</span></li>"
                        )
                        .appendTo( $kFooter ); // Append timer HTML to the footer list.

                    // Cache references to the timer minutes and seconds display elements.
                    this._$timerMins = $( '#kFooterMins', this._$timer );
                    this._$timerSecs = $( '#kFooterSecs', this._$timer );
                }

                // Conditionally render the restart button.
                if ( options.restartButton === true ) {
                    var $restartButton = $(
                            "<li class='right'><button " +
                            "class='ui-corner-all ui-state-default'>" +
                            "<span class='ui-icon ui-icon-arrowrefresh-1-w'>" +
                            "</span>" +
                            "<span class='text left'>" + this._( 'Play Again' ) +
                            "</span></button></li>"
                        )
                        .click( function () {
                            self.startTimer(); // Restarting typically implies starting the timer again.
                            self.restart(); // Call the widget's restart method.
                        } )
                        .appendTo( $kFooter ); // Add button to the footer list.
                }

                // Conditionally render the pause button.
                if ( options.pauseButton === true ) {
                    var $pauseButton = $(
                            "<li class='right'><button " +
                            "class='ui-corner-all ui-state-default'>" +
                            "<span class='ui-icon ui-icon-pause'>" +
                            "</span>" +
                            "<span class='text left'>" + this._( 'Pause' ) +
                            "</span></button></li>"
                        )
                        .click( function () {
                            self.stopTimer(); // Stop the timer.
                            self.element.trigger( 'kFooterPause' ); // Emit pause event.
                        } )
                        .appendTo( $kFooter ); // Add button to the footer list.
                }

                // Conditionally render the start button.
                if ( options.startButton === true ) {
                    var $startButton = $(
                            "<li class='right'><button " +
                            "class='ui-corner-all ui-state-default'>" +
                            "<span class='ui-icon ui-icon-play'>" +
                            "</span>" +
                            "<span class='text left'>" + this._( 'Start' ) +
                            "</span></button></li>"
                        )
                        .click( function () {
                            self.startTimer(); // Start the timer.
                            self.element.trigger( 'kFooterStart' ); // Emit start event.
                        } )
                        .appendTo( $kFooter ); // Add button to the footer list.
                }

                // Apply hover effects to all buttons within the footer.
                $( 'button', $kFooter ).hover(
                    function () {
                        $( this ).addClass( "ui-state-hover" ); // Add hover class on mouse enter.
                    },
                    function () {
                        $( this ).removeClass( "ui-state-hover" ); // Remove hover class on mouse leave.
                    }
                );

                // Check if the initial element contains any child HTML.
                // If so, wrap it in an <li> and append to the footer.
                var $userHtml = this.element
                    .children() // Select all direct children.
                    .appendTo( $kFooter ); // Move them to the new footer list.

                // Wrap the user-provided HTML children within list items for proper formatting.
                $userHtml.wrap( '<li class="left"></li>' );

                // Clear the original widget element content.
                this.element.empty();

                // Append the constructed footer (<ul>) to the widget's main element.
                this.element.append( $kFooter );
            },

            // Refreshes the displayed score and total.
            /**
             * Refreshes the score and total displays with their current data values.
             */
            _refresh: function () {
                // Update score display using internationalized number formatting.
                this._score.text( this._n( this._getData( 'score' ) ) );
                // Update total display using internationalized number formatting.
                this._total.text( this._n( this._getData( 'total' ) ) );
            },

            // Destroys the widget instance.
            /**
             * Removes the kFooter widget from the DOM and cleans up all associated data.
             * It also calls the base jQuery UI widget destroy method.
             */
            destroy: function () {
                this.element.remove(); // Remove the widget's DOM element.
                // Call the parent widget's destroy method to ensure proper cleanup.
                $.widget.prototype.destroy.apply( this, arguments );
            }
        } );

    // Defines methods that can be called directly on the widget instance via getter.
    $.ui.kFooter.getter = [ 'getScore', 'getTotal', '_n', '_' ];

    // Placeholder for internationalization strings.
    $.ui.kFooter.i18n = {};


    /**
     * @namespace Default settings for the kFooter widget.
     * @extends $.ui.kFooter
     * @description These options define the initial state and behavior of the kFooter widget.
     */
    $.ui.kFooter.defaults = {
        /**
         * The initial score displayed in the scoreboard.
         * @type Number
         * @default 0
         */
        score: 0,

        /**
         * The initial total displayed in the scoreboard.
         * @type Number
         * @default 0
         */
        total: 0,

        /**
         * The target score that, when reached, triggers the 'kFooterWinGame' event.
         * @type Number
         * @default 0
         */
        winningScore: 0,

        /**
         * The default locale to be used for internationalization (e.g., "en", "ne").
         * @type String
         * @default "ne"
         */
        locale: "ne",

        /**
         * A boolean indicating whether the scoreboard (score and total display) should be shown.
         * @type boolean
         * @default true
         */
        scoreboard: true,

        /**
         * A boolean indicating whether the Start button should be displayed.
         * @type boolean
         * @default false
         */
        startButton: false,

        /**
         * A boolean indicating whether the Restart button should be displayed.
         * @type boolean
         * @default true
         */
        restartButton: true,

        /**
         * A boolean indicating whether the Pause button should be displayed.
         * @type boolean
         * @default false
         */
        pauseButton: false,

        /**
         * A boolean indicating whether the timer display should be shown.
         * @type boolean
         * @default false
         */
        timer: false
    };

} )( jQuery ); // Pass jQuery to the anonymous function.