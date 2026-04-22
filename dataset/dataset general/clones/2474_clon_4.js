// Custom Test Framework
const testReport = [];
let currentTestModule = null;
let asyncTestPending = false;
let asyncCompletionCallback = null;

function customAssert(actual, expected, description) {
    const result = actual === expected;
    testReport.push({
        module: currentTestModule ? currentTestModule.name : 'Global',
        description: description,
        passed: result,
        actual: actual,
        expected: expected
    });
}

function defineTestGroup(label, config) {
    currentTestModule = {
        name: label,
        config: config,
        tests: []
    };
}

function completeAsyncOperation() {
    if (asyncTestPending && asyncCompletionCallback) {
        asyncCompletionCallback();
    }
}

// Timer Manager for mocking setTimeout
class TimerManager {
    constructor() {
        this.timers = [];
        this.currentTime = 0;
    }

    addTimer(callback, delay) {
        this.timers.push({ callback, delay: this.currentTime + delay });
        this.timers.sort((a, b) => a.delay - b.delay);
    }

    advanceTime(ms) {
        this.currentTime += ms;
        while (this.timers.length > 0 && this.timers[0].delay <= this.currentTime) {
            const timer = this.timers.shift();
            timer.callback();
        }
    }

    reset() {
        this.timers = [];
        this.currentTime = 0;
    }
}

const globalTimerManager = new TimerManager();

function executeSynchronousTest(label, expectedAssertions, testFunction) {
    if (!currentTestModule) {
        throw new Error("Tests must be defined within a test group.");
    }
    const context = {};
    if (currentTestModule.config && currentTestModule.config.prepare) {
        currentTestModule.config.prepare.call(context);
    }

    try {
        testFunction.call(context);
    } catch (e) {
        testReport.push({
            module: currentTestModule.name,
            description: `Error in ${label}`,
            passed: false,
            error: e.message
        });
    } finally {
        if (currentTestModule.config && currentTestModule.config.clean) {
            currentTestModule.config.clean.call(context);
        }
    }
}

function executeAsynchronousTest(label, expectedAssertions, testFunction) {
    if (!currentTestModule) {
        throw new Error("Tests must be defined within a test group.");
    }
    const context = {};
    if (currentTestModule.config && currentTestModule.config.prepare) {
        currentTestModule.config.prepare.call(context);
    }

    asyncTestPending = true;
    asyncCompletionCallback = () => {
        asyncTestPending = false;
        if (currentTestModule.config && currentTestModule.config.clean) {
            currentTestModule.config.clean.call(context);
        }
    };

    const originalSetTimeoutRef = setTimeout;
    setTimeout = (cb, delay) => globalTimerManager.addTimer(cb, delay);

    try {
        testFunction.call(context);
        globalTimerManager.advanceTime(250);
    } catch (e) {
        testReport.push({
            module: currentTestModule.name,
            description: `Error in ${label}`,
            passed: false,
            error: e.message
        });
    } finally {
        setTimeout = originalSetTimeoutRef;
        globalTimerManager.reset();
    }
}

// Mock DOM and Plugin system
let nextDomId = 1;

class MockDomNode {
    constructor(selector) {
        this._id = `mock-node-${nextDomId++}`;
        this._selector = selector;
        this._attributes = {};
        this._value = '';
        this._dataStore = {};
        this._parentControl = null;
    }

    setAttr(key, val) {
        this._attributes[key] = val;
        return this;
    }

    getAttr(key) {
        return this._attributes[key];
    }

    removeAttr(key) {
        delete this._attributes[key];
        return this;
    }

    setValue(val) {
        this._value = val;
        return this;
    }

    getValue() {
        return this._value;
    }

    storeData(key, val) {
        this._dataStore[key] = val;
        return this;
    }

    retrieveData(key) {
        return this._dataStore[key];
    }

    // Mimic jQuery's find method for specific selectors
    find(childSelector) {
        const childNode = new MockDomNode(childSelector);
        childNode._parentControl = this; // Link child to parent
        return childNode;
    }

    // Mimic jQuery chaining
    chain() {
        return this;
    }

    // Mock click event for up/down buttons
    activate() {
        if (this._parentControl) {
            const controllerInstance = this._parentControl.retrieveData('plugin-instance');
            if (controllerInstance) {
                const direction = this._selector.includes('up') ? 'up' : 'down';
                controllerInstance.adjustValue(direction);
            }
        }
        return this;
    }
}

// Mock of jQuery selector
function queryDom(selector) {
    return new MockDomNode(selector);
}

// Mock plugin method
queryDom.fn = {};

// Mock Value Control Plugin Logic
class MockValueControl {
    static currentControlDelay = 600;

    constructor(initialElement) {
        this._attachedElement = initialElement;
        this._currentNumericValue = initialElement.getValue() ? parseInt(initialElement.getValue(), 10) : 1;
        this._changeNotifier = null;
        this._changingNotifier = null;
        this._stepFunction = (direction) => 1;
        this._internalInputField = initialElement;
        this._oldValue = this._currentNumericValue;
    }

    readCurrentValue() {
        return this._currentNumericValue;
    }

    // Mimics spinner('delay', value) -> sets constructor.delay to value + 100
    setControlDelay(newDelay) {
        MockValueControl.currentControlDelay = newDelay + 100;
    }

    registerChangeCallback(callback) {
        this._changeNotifier = callback;
    }

    registerChangingCallback(callback) {
        this._changingNotifier = callback;
    }

    setStepMechanism(func) {
        this._stepFunction = func;
    }

    getUnderlyingInput() {
        return this._internalInputField;
    }

    adjustValue(direction) {
        if (this._internalInputField.getAttr('disabled') === 'disabled') {
            return;
        }

        this._oldValue = this._currentNumericValue;
        let stepAmount = this._stepFunction.call({ oldValue: this._oldValue }, direction);
        if (typeof stepAmount !== 'number' || isNaN(stepAmount)) {
             stepAmount = 1;
        }

        let tempValue = this._currentNumericValue;
        if (direction === 'up') {
            tempValue += stepAmount;
        } else if (direction === 'down') {
            tempValue -= stepAmount;
        }

        if (this._changingNotifier) {
            this._changingNotifier(null, tempValue);
        }

        this._currentNumericValue = tempValue;
        this._internalInputField.setValue(this._currentNumericValue);

        setTimeout(() => { // Uses the globally overridden setTimeout
            if (this._changeNotifier) {
                this._changeNotifier(null, this._currentNumericValue);
            }
        }, MockValueControl.currentControlDelay);
    }
}

// Extend MockDomNode prototype to include the plugin method
MockDomNode.prototype.control = function(...args) {
    const command = args[0];
    let instance = this.retrieveData('plugin-instance');

    if (!instance) {
        instance = new MockValueControl(this);
        this.storeData('plugin-instance', instance);
    }

    if (command === 'value') {
        return instance.readCurrentValue();
    } else if (command === 'delay') {
        instance.setControlDelay(args[1]);
        return this;
    } else if (command === 'changed') {
        instance.registerChangeCallback(args[1]);
        return this;
    } else if (command === 'changing') {
        instance.registerChangingCallback(args[1]);
        return this;
    } else if (command === 'retrieve-instance') {
        return instance;
    }
    return this;
};

// Main execution context for tests
(function(elementSelector) {

    defineTestGroup('ValueManipulator', {
        prepare: function() {
            this.mainElement = elementSelector('[data-trigger="spinner"]');
            this.mainElement.setValue(1);
            this.upButton = this.mainElement.find("[data-spin='up']");
            this.downButton = this.mainElement.find("[data-spin='down']");
            this.valueController = this.mainElement.control('retrieve-instance');
        },
        clean: function() {
            this.mainElement
                .control('delay', 500)
                .control('changed', null)
                .control('changing', null);
            this.valueController.getUnderlyingInput().setValue(1);
            MockValueControl.currentControlDelay = 600;
        }
    });

    executeSynchronousTest('ValueManipulator#read', 1, function() {
        customAssert(this.valueController.readCurrentValue(), 1, 'Initial value should be 1');
    });

    executeSynchronousTest('ValueManipulator#adjustDelay', 2, function() {
        customAssert(MockValueControl.currentControlDelay, 600, 'Initial delay should be 600');
        this.mainElement.control('delay', 300, 'should plus 100');
        customAssert(MockValueControl.currentControlDelay, 400, 'Delay should be adjusted to 400');
    });

    executeAsynchronousTest('ValueManipulator#notifiedOfChange', 1, function() {
        let currentVal = this.valueController.readCurrentValue();
        let receivedVal = 0;
        this.mainElement.control('delay', 50).control('changed', function(evt, newValue) {
            receivedVal = newValue;
        });
        this.upButton.activate();
        setTimeout(() => {
            customAssert(receivedVal, currentVal + 1, 'Callback should receive incremented value');
            completeAsyncOperation();
        }, 200);
    });

    executeSynchronousTest('ValueManipulator#notifiedOfChanging', 1, function() {
        this.mainElement.control('changing', function(evt, newValue) {
            customAssert(newValue, 2, 'Changing callback should be invoked with prospective new value 2');
        });
        this.upButton.activate();
    });

    executeSynchronousTest('spin via mouse activation', 3, function() {
        customAssert(this.valueController.readCurrentValue(), 1, 'Initial value is 1');
        this.upButton.activate();
        customAssert(this.valueController.readCurrentValue(), 2, 'Value incremented to 2');
        this.downButton.activate();
        customAssert(this.valueController.readCurrentValue(), 1, 'Value decremented to 1');
    });

    executeSynchronousTest('pass step as custom function', 3, function() {
        customAssert(this.valueController.readCurrentValue(), 1, 'Initial value is 1');
        this.valueController.setStepMechanism(function(direction) {
            if ((this.oldValue === 1 && direction === 'down') || (this.oldValue === -1 && direction === 'up')) {
                return 2;
            }
            return 1;
        });
        this.downButton.activate();
        customAssert(this.valueController.readCurrentValue(), -1, 'Value decremented to -1 (skipped 0)');
        this.upButton.activate();
        customAssert(this.valueController.readCurrentValue(), 1, 'Value incremented to 1 (skipped 0)');
    });

    executeSynchronousTest('no value adjustment on disabled input', 3, function() {
        this.valueController.getUnderlyingInput().setAttr('disabled', 'disabled');
        customAssert(this.valueController.readCurrentValue(), 1, 'Initial value is 1');
        this.upButton.activate();
        customAssert(this.valueController.readCurrentValue(), 1, 'Value remains 1 when disabled');
        this.valueController.getUnderlyingInput().setValue(2);
        this.downButton.activate();
        customAssert(this.valueController.readCurrentValue(), 2, 'Value remains 2 when disabled');
        this.valueController.getUnderlyingInput().removeAttr('disabled');
    });

}(queryDom));