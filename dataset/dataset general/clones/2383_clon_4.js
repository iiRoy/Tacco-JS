const customAssertionEngine = {
    totalTestUnits: 0,
    failedTestUnits: 0,
    currentTestGroup: null,
    currentPreUnitHooks: [],
    currentPostUnitHooks: [],

    group: function(name, callback) {
        const previousTestGroup = this.currentTestGroup;
        const previousPreUnitHooks = [...this.currentPreUnitHooks];
        const previousPostUnitHooks = [...this.currentPostUnitHooks];

        this.currentTestGroup = name;
        this.currentPreUnitHooks = [];
        this.currentPostUnitHooks = [];

        callback();

        this.currentTestGroup = previousTestGroup;
        this.currentPreUnitHooks = previousPreUnitHooks;
        this.currentPostUnitHooks = previousPostUnitHooks;
    },

    unit: function(name, callback) {
        this.totalTestUnits++;
        try {
            this.currentPreUnitHooks.forEach(fn => fn());
            callback();
        } catch (error) {
            this.failedTestUnits++;
            throw error;
        } finally {
            this.currentPostUnitHooks.forEach(fn => fn());
        }
    },

    preUnitHook: function(callback) {
        this.currentPreUnitHooks.push(callback);
    },

    postUnitHook: function(callback) {
        this.currentPostUnitHooks.push(callback);
    },

    verify: function(value) {
        return {
            isDefined: function() {
                if (value === undefined || value === null) {
                    throw new Error(`Expected value to be defined, but it was ${value}`);
                }
            },
            isUndefined: function() {
                if (value !== undefined && value !== null) {
                    throw new Error(`Expected value to be undefined, but it was ${value}`);
                }
            },
            strictEquals: function(expected) {
                if (value !== expected) {
                    throw new Error(`Expected ${JSON.stringify(value)} to strictly equal ${JSON.stringify(expected)}`);
                }
            },
            hasLength: function(expectedLength) {
                if (value === null || typeof value.length === 'undefined' || value.length !== expectedLength) {
                    throw new Error(`Expected value to have length ${expectedLength}, but it was ${value?.length}`);
                }
            }
        };
    },

    methodMonitor: function(obj, methodName) {
        const originalMethod = obj[methodName];
        if (typeof originalMethod !== 'function') {
             throw new Error(`Cannot monitor non-function property: ${methodName}`);
        }

        let invocationRecord = {
            invocations: [],
            invocationCount: 0,
            hasBeenInvoked: false,
        };

        obj[methodName] = function(...args) {
            invocationRecord.hasBeenInvoked = true;
            invocationRecord.invocationCount++;
            invocationRecord.invocations.push({
                args: args,
                context: this
            });
            return originalMethod.apply(this, args);
        };

        Object.defineProperty(obj[methodName], 'callCount', {
            get: () => invocationRecord.invocationCount,
            configurable: true
        });
        obj[methodName].reset = () => {
            invocationRecord = {
                invocations: [],
                invocationCount: 0,
                hasBeenInvoked: false,
            };
        };

        return {
            wasInvoked: function() {
                if (!invocationRecord.hasBeenInvoked) {
                    throw new Error(`Expected ${methodName} to have been invoked.`);
                }
            },
            wasInvokedWith: function(...expectedArgs) {
                if (!invocationRecord.invocations.some(c => JSON.stringify(c.args) === JSON.stringify(expectedArgs))) {
                    throw new Error(`Expected ${methodName} to have been invoked with ${JSON.stringify(expectedArgs)}.`);
                }
            }
        };
    }
};

const testGroup = customAssertionEngine.group.bind(customAssertionEngine);
const testUnit = customAssertionEngine.unit.bind(customAssertionEngine);
const setupUnit = customAssertionEngine.preUnitHook.bind(customAssertionEngine);
const teardownUnit = customAssertionEngine.postUnitHook.bind(customAssertionEngine);
const verify = customAssertionEngine.verify.bind(customAssertionEngine);
const monitor = customAssertionEngine.methodMonitor.bind(customAssertionEngine);

const sampleModule = {
    checkSelf: function() {
        1 + 2;
    },
    addObserver: function() {
        1 + 1;
    },
    contextCheck: function() {
        this.addObserver();
    }
};

const signalHub = (function() {
    let internalState = {
        protocolVersion: '1.0.0',
        currentConduit: null,
        connectionPoints: {}
    };

    function retrieveConduit(conduitIdentifier) {
        if (!internalState.connectionPoints[conduitIdentifier]) {
            internalState.connectionPoints[conduitIdentifier] = [];
        }
        return internalState.connectionPoints[conduitIdentifier];
    }

    function processObserver(observer) {
        if (typeof observer === 'function') {
            return {
                func: observer,
                ctx: window
            };
        } else if (Array.isArray(observer) && typeof observer[0] === 'function' && typeof observer[1] === 'object') {
            return {
                func: observer[0],
                ctx: observer[1]
            };
        }
        return null;
    }

    const API = function(conduitIdentifier) {
        internalState.currentConduit = conduitIdentifier;
        retrieveConduit(conduitIdentifier);
        return API;
    };

    API.channel = function(conduitIdentifier) {
        internalState.currentConduit = conduitIdentifier;
        retrieveConduit(conduitIdentifier);
        return API;
    };

    API.register = function(...observers) {
        const currentConduit = internalState.currentConduit;
        if (!currentConduit) return API;

        const conduitObservers = retrieveConduit(currentConduit);

        observers.forEach(observer => {
            const processed = processObserver(observer);
            if (processed) {
                conduitObservers.push(processed);
            }
        });
        return API;
    };

    API.deregister = function(...observersToDeregister) {
        const currentConduit = internalState.currentConduit;
        if (!currentConduit || !internalState.connectionPoints[currentConduit]) {
            return API;
        }

        let conduitObservers = internalState.connectionPoints[currentConduit];

        observersToDeregister.forEach(targetObserver => {
            conduitObservers = conduitObservers.filter(registeredObserver => {
                const registeredFunc = registeredObserver.func;
                return registeredFunc !== targetObserver;
            });
        });
        internalState.connectionPoints[currentConduit] = conduitObservers;
        return API;
    };

    API.transmit = function(...args) {
        const currentConduit = internalState.currentConduit;
        if (!currentConduit || !internalState.connectionPoints[currentConduit]) {
            return API;
        }
        [...internalState.connectionPoints[currentConduit]].forEach(observerWrapper => {
            observerWrapper.func.apply(observerWrapper.ctx, args);
        });
        return API;
    };

    API.$ = internalState;

    return API;
})();

window.signalHub = signalHub;

window.handlerA = function() {};
window.handlerB = function() {};
window.handlerC = function() {};

testGroup("Signal Hub Core Evaluation", function() {
    setupUnit(function() {
        window.handlerA = function() {};
        window.handlerB = function() {};
        window.handlerC = function() {};
    });

    testGroup("When signal hub is initialized", function() {
        testUnit("should be global and accessible", function() {
            verify(signalHub).isDefined();
        });

        testUnit("should return a protocol version", function() {
            verify(signalHub.$.protocolVersion).isDefined();
        });
    });

    testGroup("signalHub() invocation", function() {
        testUnit("should establish the conduit identifier", function() {
            signalHub('conduitAlpha');
            verify(signalHub.$.currentConduit).strictEquals('conduitAlpha');
        });
        testUnit("requires a string identifier", function() {
            signalHub('conduitAlpha');
            verify(signalHub.$.currentConduit).strictEquals('conduitAlpha');
        });
    });

    testGroup("signalHub.channel method", function() {
        testUnit("should establish the conduit identifier", function() {
            signalHub('temporary').channel('conduitAlpha');
            verify(signalHub.$.currentConduit).strictEquals('conduitAlpha');
        });
        testUnit("should permit chaining of multiple conduits", function() {
            signalHub('conduitAlpha').register(handlerA, handlerA).channel('conduitBeta').register(handlerA);
            verify(signalHub.$.currentConduit).strictEquals('conduitBeta');
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
            verify(signalHub.$.connectionPoints.conduitBeta).hasLength(1);
        });
        testUnit("should initialize a new conduit if nonexistent", function() {
            verify(signalHub.$.connectionPoints['temporaryConduit']).isUndefined();
            signalHub('temporaryConduit');
            verify(signalHub.$.connectionPoints['temporaryConduit']).isDefined();
        });
    });

    testGroup("signalHub.register method", function() {
        testUnit("should add a lone observer to a conduit", function() {
            signalHub('conduitAlpha').register(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(1);
        });
        testUnit("should add multiple observers to a conduit", function() {
            signalHub('conduitAlpha').register(handlerA, handlerA, handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(3);
        });
        testUnit("should support observers with specific execution contexts", function() {
            signalHub('conduitAlpha').register([sampleModule.checkSelf, sampleModule]);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(1);
        });
        testUnit("should accommodate mixed observer registration formats", function() {
            signalHub('conduitAlpha').register(handlerA, [sampleModule.checkSelf, sampleModule], handlerB);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(3);
        });
        testUnit("should disregard non-function or invalid array observers", function() {
            signalHub('conduitAlpha').register("text", handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(1);
            signalHub('conduitAlpha').register(2, handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
        });
        testUnit("should support method chaining", function() {
            signalHub('conduitAlpha').register(handlerA).register(handlerB);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
        });
    });

    testGroup("signalHub.deregister method", function() {
        testUnit("should remove a single observer from a conduit", function() {
            signalHub('conduitAlpha').register(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(1);
            signalHub('conduitAlpha').deregister(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(0);
        });
        testUnit("should remove multiple observers from a conduit", function() {
            signalHub('conduitAlpha').register(handlerA, handlerB, handlerC);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(3);
            signalHub('conduitAlpha').deregister(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
        });
        testUnit("should remove all instances of duplicate observers from a conduit", function() {
            signalHub('conduitAlpha').register(handlerA, handlerA, handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(3);
            signalHub('conduitAlpha').deregister(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(0);

            signalHub('conduitAlpha').register(handlerA, handlerA, handlerA, handlerB, handlerC, [sampleModule.checkSelf, sampleModule], sampleModule.checkSelf);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(7);
            signalHub('conduitAlpha').deregister(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(4);
            signalHub('conduitAlpha').deregister(sampleModule.checkSelf);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
            signalHub('conduitAlpha').deregister(handlerB, handlerC);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(0);
        });
        testUnit("should remove observers registered with context from a conduit", function() {
            signalHub('conduitAlpha').register([sampleModule.checkSelf, sampleModule], handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
            signalHub('conduitAlpha').deregister(sampleModule.checkSelf);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(1);
        });
        testUnit("should not error when deregistering a nonexistent item", function() {
            signalHub('newConduit').deregister(handlerB);
        });
        testUnit("should support method chaining", function() {
            signalHub('conduitAlpha').register(handlerA, handlerB, handlerC).deregister(handlerB);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
        });
    });

    testGroup("signalHub.transmit method", function() {
        testUnit("should invoke each observer - scenario 1", function() {
            monitor(sampleModule, 'addObserver');
            monitor(sampleModule, 'checkSelf');

            signalHub('conduitAlpha').register([sampleModule.checkSelf, sampleModule], [sampleModule.addObserver, sampleModule]);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);
            signalHub('conduitAlpha').transmit('test');
            verify(sampleModule.checkSelf.callCount).strictEquals(1);
            verify(sampleModule.addObserver.callCount).strictEquals(1);
            sampleModule.checkSelf.reset();
            sampleModule.addObserver.reset();
        });
        testUnit("should invoke each observer - scenario 2", function() {
            monitor(window, 'handlerA');
            monitor(window, 'handlerB');
            monitor(window, 'handlerC');

            signalHub('conduitAlpha').register(handlerA, handlerA, handlerA, handlerA, handlerB, handlerB, handlerC).transmit('test');
            verify(window.handlerA.callCount).strictEquals(4);
            verify(window.handlerB.callCount).strictEquals(2);
            verify(window.handlerC.callCount).strictEquals(1);
            window.handlerA.reset();
            window.handlerB.reset();
            window.handlerC.reset();
        });
        testUnit("should forward transmission arguments to the observer", function() {
            const spyOnAddObserver = monitor(sampleModule, 'addObserver');
            const spyOnCheckSelf = monitor(sampleModule, 'checkSelf');

            signalHub('conduitAlpha').register([sampleModule.checkSelf, sampleModule]);
            signalHub('conduitBeta').register([sampleModule.addObserver, sampleModule]);
            signalHub('conduitAlpha').transmit('datum1', ['collection', 'element2'], 'datum3');
            signalHub('conduitBeta').transmit('datum1');
            spyOnCheckSelf.wasInvokedWith('datum1', ['collection', 'element2'], 'datum3');
            spyOnAddObserver.wasInvokedWith('datum1');
        });
        testUnit("should invoke observer while preserving its defined scope", function() {
            monitor(sampleModule, 'addObserver');
            signalHub('conduitAlpha').register([sampleModule.contextCheck, sampleModule]).transmit('test');
            verify(sampleModule.addObserver.callCount).strictEquals(1);
        });
        testUnit("should invoke observer with global scope if none specified", function() {
            monitor(window, 'handlerA');
            signalHub('conduitAlpha').register(handlerA).transmit('test');
            verify(window.handlerA.callCount).strictEquals(1);
            window.handlerA.reset();
        });
    });

    testGroup("signalHub register, deregister, and transmit methods", function() {
        testUnit("should function cohesively in a chained sequence", function() {
            signalHub('conduitAlpha').register(handlerA, handlerB, handlerC).deregister(handlerA);
            verify(signalHub.$.connectionPoints.conduitAlpha).hasLength(2);

            monitor(window, 'handlerA');
            monitor(window, 'handlerB');
            monitor(window, 'handlerC');

            signalHub('conduitBeta').register(handlerA, handlerA, handlerA, handlerA, handlerB).deregister(handlerA, handlerB).register(handlerC).transmit('test');
            verify(window.handlerB.callCount).strictEquals(0);
            verify(window.handlerC.callCount).strictEquals(1);
            window.handlerA.reset();
            window.handlerB.reset();
            window.handlerC.reset();
        });
    });

    postUnitHook(function() {
        signalHub.$.connectionPoints = {};
    });
});