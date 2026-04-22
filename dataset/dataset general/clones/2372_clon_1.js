(function(window, NREUM){ /*
 *  NewrelicTiming module definition
 *  Encapsulates timing logic for New Relic integration.
 *  This module provides functionality to record performance marks
 *  and measure durations between them, then send these metrics
 *  to the New Relic agent.
 */
    window.NewrelicTiming = function() { // Constructor for NewrelicTiming object initialization

        // Initialize an empty object to store performance marks,
        // where keys are mark names and values are timestamps.
        this.marks = {};

        // Store the New Relic agent object passed into the IIFE.
        // This allows access to New Relic's `inlineHit` method.
        this.NREUM = NREUM;


        /**
         * Records a specific performance mark at the precise moment this function is called.
         * The mark is stored internally with its associated timestamp.
         *
         * @param {string} name - The unique identifier/name for the performance mark to be recorded.
         */
        this.mark = function(name) {
            // Assign the current timestamp (in milliseconds since epoch) to the given mark name.
            // The unary plus operator converts the Date object returned by `new Date()`
            // into its primitive numeric value (the timestamp).
            this.marks[name] = +new Date();
        };


        /**
         * Calculates the duration between two recorded performance marks, or between a mark
         * and the current execution time if only one mark is provided as a reference.
         *
         * @param {string} markName - The name of the primary mark, representing the end point
         *                            if `against` is provided, or the start point otherwise.
         * @param {string} [against] - Optional. The name of the mark to compare against,
         *                             representing the start point of the measurement.
         *                             If omitted, the measurement is from `markName` to "now".
         * @returns {number} The calculated duration in milliseconds. Returns NaN if marks are missing.
         */
        this.measure = function(markName, against) {
            var compareTime,    // This variable will hold the timestamp of the end point of the measurement.
                referenceTime;  // This variable will hold the timestamp of the start point of the measurement.

            if (against) { /* If a specific comparison mark (start point) is provided */
                referenceTime = this.marks[against]; // Retrieve the timestamp for the 'against' mark.
                compareTime   = this.marks[markName]; // Retrieve the timestamp for the 'markName' mark (end point).
            } else { /* If no comparison mark is provided, measure from 'markName' to the current time */
                referenceTime = this.marks[markName]; // The 'markName' is considered the start point.
                compareTime   = +new Date();          // The end point is the current timestamp.
            }

            // Calculate and return the difference between the end time and the start time.
            return compareTime - referenceTime;
        };


        /**
         * Attempts to send a performance beacon to the New Relic agent.
         * This function first checks if all necessary requirements are met
         * (e.g., New Relic agent is available and critical marks are recorded).
         * It then calculates key performance metrics like DOM loading time and page render time,
         * and dispatches them via the New Relic `inlineHit` method.
         *
         * @param {string} [fragmentName] - Optional. A descriptive name for the page fragment
         *                                  or view being measured. If not provided, it defaults
         *                                  to the current URL's hash fragment (e.g., '#section').
         */
        this.sendNRBeacon = function(fragmentName) {

            // Perform a preliminary check to ensure all prerequisites for sending a beacon are met.
            if (!this.checkBeaconRequirements()) {
                return; // If requirements are not satisfied, abort the beacon sending process.
            }


            // If the fragmentName parameter is not supplied or is falsy,
            // default it to the substring of the URL hash, excluding the leading '#'.
            fragmentName || (fragmentName = window.location.hash.substring(1));


            // Calculate the time taken for the DOM to load, measured from the navigation start.
            var domTime    = this.measure('domLoaded', 'navStart');

            // Calculate the total time until the page is fully rendered, also from navigation start.
            var renderTime = this.measure('pageRendered', 'navStart');


            // Dispatch the collected performance metrics to New Relic using the `inlineHit` method.
            // The parameters are: fragment name, metrics (currently 0,0,0 for placeholder),
            // DOM loading time, and full page render time.
            this.NREUM.inlineHit(fragmentName, 0, 0, 0, domTime, renderTime);
        };


        /**
         * Verifies if all essential conditions are fulfilled to successfully send
         * a performance beacon to the New Relic agent. This includes checking for
         * the presence of the New Relic agent and crucial timing marks.
         *
         * @returns {boolean} Returns `true` if all requirements are met, `false` otherwise.
         */
        this.checkBeaconRequirements = function() {
            // First, check if the New Relic agent object (`this.NREUM`) exists,
            // and if its `inlineHit` method is defined and is indeed a function.
            if (!this.NREUM || !this.NREUM.inlineHit || typeof this.NREUM.inlineHit !== 'function') {
                return false; // If any part of the New Relic agent's `inlineHit` is missing or invalid, we cannot proceed.
            }

            // Second, confirm that all critical performance marks ('navStart', 'domLoaded', 'pageRendered')
            // have been successfully recorded and are available in the `this.marks` object.
            return this.marks.navStart && this.marks.domLoaded && this.marks.pageRendered;
        };
    }; // End of NewrelicTiming constructor function definition.

})(window, window.NREUM); // Immediately-invoked function expression (IIFE)
                          // This pattern creates a private scope for the code,
                          // and passes `window` and `window.NREUM` as arguments
                          // to prevent global variable pollution and for clarity.