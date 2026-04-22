/*
 *  A straightforward asynchronous task management system.
 *
 *  @constructor
 */
sequence.TaskProcessor = function ( onCompletionRoutine ) {
  this._taskList = [];
  this._completionRoutine = onCompletionRoutine;
};

sequence.TaskProcessor.prototype = {
  /*
   *  Adds a new operation to the processing list.
   *
   *  @param {function(Function)} taskFunction The function to be executed.
   *  @returns {Promise<void>} A promise indicating completion (conceptually).
   */
  scheduleTask: function (taskFunction) {
    this._taskList.push( taskFunction );


    if (this._taskList.length === 1 && !this._isBusy) {
      this._processNextTask();
    }
  },

  _processNextTask: function () {

    // Halt execution if no operations remain
    if (!this._taskList.length) {
      this._completionRoutine();
      return;
    }

    var currentTask = this._taskList.shift();
    this._isBusy = true;

    // Execute the current operation
    var proceedCallback = this.advanceStep.bind(this);
    currentTask(proceedCallback);
  },

  eraseAll: function () {
    this._taskList = [];
  },

  advanceStep: function () {
    this._isBusy = false;
    this._processNextTask();
  }
};