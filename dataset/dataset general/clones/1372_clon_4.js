(function(scope, angularRef, undefined) {
'use strict';

angularRef.module('ngQueue', []).factory('$queue',
    ['$timeout',
    function(timerService) {

        var defaultSettings = {
            interval: 100,
            onFinish: null,
            initiallyStopped: false
        };

        /**
         * Core processing entity implementation
         *
         */
        class ItemProcessor {
            constructor(processFn, configObj) {
                configObj = angularRef.extend({}, defaultSettings, configObj);

                if (!angularRef.isFunction(processFn)) {
                    throw new Error('processing function must be a function');
                }

                //-- Internal state
                let currentTimerId = null;

                //-- Publicly accessible properties
                this.itemPile = [];
                this.interimDelay = configObj.interval;
                this.processCallback = processFn;
                this.completionNotifier = configObj.onFinish;
                this.isDormant = configObj.initiallyStopped;

                //-- Private helper function
                /**
                 * stopCurrentTimer() cancels any active processing timer
                 *
                 */
                const stopCurrentTimer = () => {
                    if (currentTimerId) {
                        timerService.cancel(currentTimerId);
                    }
                    currentTimerId = null;
                };

                //-- Public methods

                /**
                 * getCardinality() returns the number of items awaiting processing
                 *
                 * @return<Number> item count
                 */
                this.getCardinality = () => {
                    return this.itemPile.length;
                };

                /**
                 * addEntry() adds a single item to the end of the collection
                 *
                 * @param<Object> singleItem
                 * @return<Number> updated item count
                 */
                this.addEntry = (singleItem) => {
                    return this.addMany([singleItem]);
                };

                /**
                 * addMany() adds an array of items to the end of the collection
                 *
                 * @param<Array> newItems
                 * @return<Number> updated item count
                 */
                this.addMany = (newItems) => {
                    if (newItems) {
                        // Using spread syntax for immutable-like update
                        this.itemPile = [...this.itemPile, ...newItems];
                    }

                    if (!this.isDormant) {
                        this.initiateProcessing();
                    }

                    return this.getCardinality();
                };

                /**
                 * clearAll() removes all items from the collection
                 * and stops any ongoing processing
                 *
                 * @return<Array> the original collection of items
                 */
                this.clearAll = () => {
                    const originalPile = this.itemPile;
                    stopCurrentTimer();
                    this.itemPile = [];
                    return originalPile;
                };

                /**
                 * haltProcessing() suspends further processing of items
                 *
                 */
                this.haltProcessing = () => {
                    stopCurrentTimer();
                    this.isDormant = true;
                };


                /**
                 * initiateProcessing() begins or resumes processing of items.
                 * Can be called after haltProcessing()
                 *
                 */
                this.initiateProcessing = () => {
                    this.isDormant = false;

                    // Only start if there are items and no timer is currently active
                    if (this.getCardinality() > 0 && currentTimerId === null) {
                        // Use a self-invoking named function for recursion, but as a const for scope
                        const processNextElement = () => {
                            stopCurrentTimer(); // Ensure previous timer is cancelled

                            if (this.isDormant) { // If paused during the delay, just exit
                                return;
                            }

                            if (this.getCardinality() === 0) { // If collection is empty
                                if (angularRef.isFunction(this.completionNotifier)) {
                                    this.completionNotifier.call(this); // Call with 'this' context
                                }
                                return; // Stop processing
                            }

                            // Deconstruct the array to get the first item and the rest (functional shift)
                            const [currentElement, ...remainingElements] = this.itemPile;
                            this.itemPile = remainingElements; // Update itemPile immutably

                            this.processCallback.call(this, currentElement); // Call with 'this' context

                            // Schedule the next processing step
                            currentTimerId = timerService(processNextElement, this.interimDelay);
                        };

                        processNextElement(); // Start the first element's processing cycle
                    }
                };

                /**
                 * locateElement() finds the first index of a given item
                 *
                 * @param<Object> targetItem
                 * @return<Number> index of the item or -1 if not found
                 */
                this.locateElement = (targetItem) => {
                    // Using findIndex for a functional approach
                    return this.itemPile.findIndex(element => element === targetItem);
                };
            }
        }

        /**
         * createInstance() is a convenience function to return a new ItemProcessor
         *
         * Usage: var processor = ProcessorService.createInstance(someFunction, someConfiguration);
         *
         * @param<Function> processFn - *Required* - Function invoked for each item
         *          in the collection after each interval. Passed the item and called
         *          with the context of ItemProcessor.
         * @param<Object> configObj
         *      interval<Number> - *Optional* - Milliseconds between each processing step.
         *          Defaults to 100.
         *      onFinish<Function> - *Optional* - Function called when all items are processed.
         *      initiallyStopped<Boolean> - *Optional* - Flag to indicate if processing
         *          starts dormant. If false, processing begins immediately after the first add.
         * @return<ItemProcessor> a new ItemProcessor instance
         */
        ItemProcessor.createInstance = (processFn, configObj) => {
            return new ItemProcessor(processFn, configObj);
        };

        return ItemProcessor;
    }]);

})(window, window.angular);