//
// Angular Task Processor Service
// @version 1.0.0
// @author YourNameHere
// @license Custom License, https://example.com/license
//
(function (globalScope, ngFramework, undef) {
  'use strict';

  ngFramework.module('ngProcessor', [])
    .factory('$taskerService',
      ['$asyncService',
        function ($asyncService) {

          var defaultSettings = {
            interval: 150,
            finished: null,
            suspended: false
          };

          //
          // Core implementation of the TaskProcessor class
          //
          function TaskProcessor(processFunction, config) {
            config = ngFramework.extend({}, defaultSettings, config);

            if (!ngFramework.isFunction(processFunction)) {
              throw new Error('The processFunction argument must be a function.');
            }

            // Internal state variables
            var resetFlag = false,
              timerPromise = null;

            // Public instance properties
            this.taskList = [];
            this.processingInterval = config.interval;
            this.itemHandler = processFunction;
            this.completionHandler = config.finished;
            this.isSuspended = config.suspended;

            // Internal utility methods
            //
            // haltProcessing() stops the ongoing task execution
            //
            var haltProcessing = function () {
              if (timerPromise) {
                $asyncService.cancel(timerPromise);
              }

              timerPromise = null;
            };

            //
            // Publicly accessible methods
            //

            //
            // countItems() retrieves the total number of items in the queue
            //
            // @returns {Number} The current size of the task list
            //
            this.countItems = function () {
              return this.taskList.length;
            };

            //
            // enqueueItem() adds a single work item to the end of the list
            //
            // @param {Object} workItem The item to be added
            // @returns {Number} The updated size of the task list
            //
            this.enqueueItem = function (workItem) {
              return this.enqueueMany([workItem]);
            };

            //
            // enqueueMany() appends a collection of work items to the list
            //
            // @param {Array} workItems An array of items to add
            // @returns {Number} The updated size of the task list
            //
            this.enqueueMany = function (workItems) {
              if (workItems) {
                resetFlag = false;
                this.taskList = this.taskList.concat(workItems);
              }

              if (!this.isSuspended) {
                this.resumeProcessing();
              }

              return this.countItems();
            };

            //
            // emptyQueue() removes all items from the task list
            // and ceases any active processing
            //
            // @returns {Array} The contents of the task list before clearing
            //
            this.emptyQueue = function () {
              var originalContents = this.taskList;
              haltProcessing();
              this.taskList = [];
              resetFlag = true;
              return originalContents;
            };

            //
            // suspendProcessing() temporarily pauses the task execution
            //
            this.suspendProcessing = function () {
              haltProcessing();
              this.isSuspended = true;
            };


            //
            // resumeProcessing() initiates or continues the processing of tasks.
            // This can be invoked after a pause.
            //
            this.resumeProcessing = function () {
              var selfRef = this;
              this.isSuspended = false;
              if (this.countItems() && !timerPromise) {
                (function loopExecutor() {
                  var currentWorkItem;

                  haltProcessing();

                  if (selfRef.isSuspended)
                    return;

                  if (!selfRef.countItems()) {
                    resetFlag = true;
                    if (ngFramework.isFunction(selfRef.completionHandler)) {
                      selfRef.completionHandler.call(selfRef);
                    }
                    return;
                  }

                  currentWorkItem = selfRef.taskList.shift();
                  selfRef.itemHandler.call(selfRef, currentWorkItem);

                  timerPromise = $asyncService(loopExecutor,
                    selfRef.processingInterval);

                  return;
                })();
              }
            };

            //
            // findItemIndex() determines the initial position of a given item
            //
            // @param {Object} workItem The item to locate
            // @returns {Number} The zero-based index if found, otherwise -1
            //
            this.findItemIndex = function (workItem) {
              if (this.taskList.indexOf) return this.taskList.indexOf(workItem);

              for (var idx = 0; idx < this.taskList.length; idx++) {
                if (workItem === this.taskList[idx]) return idx;
              }
              return -1;
            };
          }

          //
          // createInstance() is a factory method to instantiate a new TaskProcessor
          //
          // Usage: var myProcessor = $taskerService.createInstance(myFunction, mySettings);
          //
          // @param {Function} itemProcessor - *Mandatory* - The function to execute for
          //          each item in the list, after a defined interval. It receives
          //          the item as an argument and executes in the context of the processor.
          // @param {Object} settings - *Optional* - Configuration object
          //      interval {Number} - *Optional* - Milliseconds between each processing step.
          //          Defaults to 150.
          //      finished {Function} - *Optional* - Function invoked once all items
          //          in the list have been processed.
          //      suspended {Boolean} - *Optional* - Indicates if the processor should begin
          //          in a paused state. If false, processing starts immediately upon first item addition.
          // @returns {TaskProcessor} A newly created TaskProcessor instance
          //
          TaskProcessor.createInstance = function (itemProcessor, settings) {
            return new TaskProcessor(itemProcessor, settings);
          };

          return TaskProcessor;
        }]);

})(window, window.angular);