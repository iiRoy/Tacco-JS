'use strict';

function EventDispatcher() {
    this.subscribers = {};
}

EventDispatcher.prototype.on = function(signalIdentifier, actionFunction) {
    if (!this.subscribers[signalIdentifier]) {
        this.subscribers[signalIdentifier] = [];
    }
    this.subscribers[signalIdentifier].push(actionFunction);
};

EventDispatcher.prototype.emit = function(signalIdentifier, dataPayload) {
    if (this.subscribers[signalIdentifier]) {
        this.subscribers[signalIdentifier].forEach(function(actionFunction) {
            actionFunction(dataPayload);
        });
    }
};

function ActivityController() {
    var _runningTasks = 0;
    var _systemEngaged = false;
    var _signalEmitter = new EventDispatcher();

    var ACTIVATION_SIGNAL = 'activity_initiated_event';
    var COMPLETION_SIGNAL = 'activity_concluded_event';

    function startNewTask() {
        if (_runningTasks === 0) {
            _systemEngaged = true;
            _signalEmitter.emit(ACTIVATION_SIGNAL);
        }
        _runningTasks++;
    }

    function completeTask() {
        _runningTasks--;
        if (_runningTasks < 0) {
            _runningTasks = 0;
        }
        if (_runningTasks === 0) {
            _systemEngaged = false;
            _signalEmitter.emit(COMPLETION_SIGNAL);
        }
    }

    function registerStartListener(callbackFunction) {
        _signalEmitter.on(ACTIVATION_SIGNAL, callbackFunction);
    }

    function registerEndListener(callbackFunction) {
        _signalEmitter.on(COMPLETION_SIGNAL, callbackFunction);
    }

    Object.defineProperty(this, 'currentSystemState', {
        get: function() { return _systemEngaged; },
        enumerable: true,
        configurable: false
    });

    return {
        startNewTask: startNewTask,
        completeTask: completeTask,
        registerStartListener: registerStartListener,
        registerEndListener: registerEndListener,
        get currentSystemState() { return _systemEngaged; }
    };
}

var globalActivityController = new ActivityController();

(function() {
    var originalSendMethod = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function() {
        globalActivityController.startNewTask();

        var taskFinished = false;
        var finaliseTask = function() {
            if (!taskFinished) {
                taskFinished = true;
                globalActivityController.completeTask();
            }
        };

        this.addEventListener('load', finaliseTask);
        this.addEventListener('error', finaliseTask);
        this.addEventListener('abort', finaliseTask);
        this.addEventListener('timeout', finaliseTask);

        return originalSendMethod.apply(this, arguments);
    };
})();

Object.defineProperty(window, 'globalUiIndicator', {
    get: function() { return globalActivityController.currentSystemState; },
    enumerable: true,
    configurable: false
});