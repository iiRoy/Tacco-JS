'use strict';

const FlowManager = (function() {
  const FlowManager = function(opLimit, timeframe, permitSpikes) {
    this._topSpeed = permitSpikes ? opLimit : opLimit / timeframe;
    this._period = timeframe;
    this._spikesAllowed = permitSpikes;

    this._currentCount = 0;
    this._beginTime = (new Date()).getTime();
    this._pendingTasks = [];
  };

  FlowManager.prototype.dispatch = function(taskFunc) {
    const selfRef = this;
    let currentFreq = 0;
    const moment = (new Date()).getTime();
    const duration = moment - this._beginTime;

    if (duration > this._period) {
      this._currentCount = 0;
      this._beginTime = moment;
    }

    currentFreq = this._currentCount / (this._spikesAllowed ? 1 : duration);

    if (currentFreq < this._topSpeed) {
      if (this._pendingTasks.length === 0) {
        this._currentCount++;
        taskFunc();
      } else {
        if (taskFunc) {
          this._pendingTasks.push(taskFunc);
        }
        this._currentCount++;
        this._pendingTasks.shift()();
      }
    } else {
      if (taskFunc) {
        this._pendingTasks.push(taskFunc);
      }

      setTimeout(function() {
        selfRef.dispatch();
      }, 1 / this._topSpeed);
    }
  };

  return FlowManager;
})();

module.exports = FlowManager;