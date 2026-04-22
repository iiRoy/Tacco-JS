/* This software is distributed under a permissive license.
 *
 * Copyright (c) 2023 [Your Name/Organization Here]
 *
 * Permission is granted, free of charge, to any individual
 * obtaining a copy of this software and its associated
 * documentation (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit individuals
 * to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice must
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Initiates a fresh multi-event synchronization utility.
 * @class <p>Facilitates the management of dependencies on multiple asynchronous operations.
 * To employ this utility, instantiate it, pass the return values of `createCallback()` invocations
 * as handlers to your async events, and finally establish the ultimate handler using `onCompletion()`.</p>
 * <p>If a `synchronize()` mechanism is available, it will be utilized to ensure the
 * EventAggregator operates in a thread-safe manner.</p>
 */
function EventAggregator() {
  if (!(this instanceof EventAggregator)) {
    return new EventAggregator();
  }
  this.results = [];
}

EventAggregator.prototype = {
  pendingTasks: 0,
  results: [],
  nextIndex: 0,
  completionHandler: null,
  handlerContext: null,

  /**
   * Delivers a function intended for use as an asynchronous signal. The final
   * completion routine triggers only when all such signals have been processed.
   * @param {Function} [subsequentCallback] An optional function to invoke after this specific event processes.
   * @returns {Function} A function to be used as a callback.
   */
  createCallback: function(subsequentCallback) {
    var currentIndex = this.nextIndex++;
    this.pendingTasks++;
    var aggregatorInstance = this; /* Secure a reference to the main instance for the closure */

    var eventTrigger = function(receivedData) {
      aggregatorInstance.results[currentIndex] = receivedData;
      if (--aggregatorInstance.pendingTasks === 0 && aggregatorInstance.completionHandler) {
        aggregatorInstance.completionHandler.apply(aggregatorInstance.handlerContext, aggregatorInstance.results);
      }
      if (subsequentCallback) /* Propagate the call to any additional handlers */
        subsequentCallback.apply(this, arguments);
    };
    return eventTrigger;
  },

  /**
   * Similar to createCallback(), but stores the entire array of arguments received by the callback,
   * rather than just the first argument.
   * @param {Function} [subsequentCallback] An optional function to invoke after this specific event processes.
   * @returns {Function} A function to be used as a callback that stores all arguments.
   */
  createArrayCallback: function(subsequentCallback) {
    var currentIndex = this.nextIndex++;
    this.pendingTasks++;
    var aggregatorInstance = this; /* Capture the 'this' context for inner function use */

    var eventTrigger = function() {
      aggregatorInstance.results[currentIndex] = arguments;
      if (--aggregatorInstance.pendingTasks === 0 && aggregatorInstance.completionHandler) {
        aggregatorInstance.completionHandler.apply(aggregatorInstance.handlerContext, aggregatorInstance.results);
      }
      if (subsequentCallback) /* Forward to any supplementary callbacks */
        subsequentCallback.apply(this, arguments);
    };
    return eventTrigger;
  },

  /**
   * Indicates that all necessary callbacks have been registered and specifies the function
   * to execute upon the completion of all asynchronous operations.
   * @param {Function} completionFunction The function to call when all events are done.
   * @param {Object} [contextObject] The 'this' context for the completion function.
   */
  onCompletion: function(completionFunction, contextObject) {
    this.handlerContext = contextObject || this;
    this.completionHandler = completionFunction;
    if (this.pendingTasks === 0) {
      this.completionHandler.apply(this.handlerContext, this.results);
    }
  }
};