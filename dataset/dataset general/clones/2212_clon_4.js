var verify = chai.expect;

var retrievePropertyCount = function (inputObject) {
    return Object.keys(inputObject).length;
};

var globalSuite = describe;
var individualTest = it;

globalSuite('Main Application Validation', function () {
    globalSuite('Setup Verification', function () {

        individualTest('Application instance check', function () {
            verify(contest).to.be.an.instanceof(Object);
        });

        var isOldBrowser = navigator.userAgent.includes('Trident') || navigator.userAgent.includes('MSIE');
        var expectedStorageEventStatus = !isOldBrowser;

        individualTest('Storage event usage status (' + navigator.userAgent + ')', function () {
            verify(contest.useStorageEvent).to.equal(expectedStorageEventStatus);
        });

        individualTest('Local storage availability check', function () {
            verify(contest.checkLocalStoreReadiness).is.not.a('undefined');
            verify(contest.checkLocalStoreReadiness()).to.equal(true);
        });

        individualTest('Application integrity completeness', function () {
            verify(contest.duplicator).is.not.a('undefined');
            verify(contest.AbstractConduit).is.not.a('undefined');
            verify(contest.fetchWindowIdentifier).is.not.a('undefined');
            verify(contest.LocalStoreConduit).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.retrieveName).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.triggerExecution).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.registerListener).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.registerOneTimeListener).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.deregisterListener).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.signalEvent).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.setPrimaryWindow).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.isCurrentWindowPrimary).is.not.a('undefined');
            verify(contest.LocalStoreConduit.prototype.transmitBroadcast).is.not.a('undefined');
            verify(contest.SimulatedConduit).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.retrieveName).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.triggerExecution).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.registerListener).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.registerOneTimeListener).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.deregisterListener).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.signalEvent).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.setPrimaryWindow).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.isCurrentWindowPrimary).is.not.a('undefined');
            verify(contest.SimulatedConduit.prototype.transmitBroadcast).is.not.a('undefined');
            verify(contest.activeConduits).to.be.an('array');
            verify(contest.getConduit).is.not.a('undefined');
            verify(contest.establishMasterWindow).is.not.a('undefined');
            verify(window.isPrimary).is.not.a('undefined');
            verify(contest.attachEventHook).is.not.a('undefined');
            verify(contest.storageEventHandler).is.not.a('undefined');
        });
    });

    globalSuite('Window Functionality Tests', function () {

        contest.activeConduits = [];

        individualTest('Window ID uniqueness', function () {
            var currentWindowIdentifier = contest.fetchWindowIdentifier();
            verify(currentWindowIdentifier).to.be.a('number');
            verify(contest.fetchWindowIdentifier()).to.equal(currentWindowIdentifier);
        });

        individualTest('Primary window status without conduits', function () {
            verify(window.isPrimary()).to.equal(true);

            globalSuite('Conduit Management Tests', function () {
                var conduitInstance = contest.getConduit('_test_conduit');

                individualTest('Conduit instance creation', function () {
                    verify(conduitInstance).to.be.an.instanceof(Object);
                });

                individualTest('Primary window status with initialized conduit', function () {
                    verify(window.isPrimary()).to.equal(true);
                });

                individualTest('Conduit de-duplication', function () {
                    conduitInstance = contest.getConduit('_test_conduit');
                    conduitInstance = contest.getConduit('_test_conduit');
                    var secondConduit = contest.getConduit('_another_conduit');
                    var thirdConduit = contest.getConduit('_test_conduit');
                    verify(contest.activeConduits.length).to.equal(2);
                    verify(thirdConduit).to.equal(conduitInstance);
                    verify(conduitInstance.isCurrentWindowPrimary()).to.equal(true);
                    verify(secondConduit.isCurrentWindowPrimary()).to.equal(true);
                    verify(thirdConduit.isCurrentWindowPrimary()).to.equal(true);
                });

                individualTest('Event registration', function (completionCallback) {
                    var counterVariable = -5;
                    conduitInstance.registerListener('my_custom_event', function (valA, valB, valC) {
                        counterVariable += valA + valB + valC;
                        verify(counterVariable).to.equal(0);
                    });
                    conduitInstance.triggerExecution({eventName: 'my_custom_event', argsArray: [0, 4, 1]}, true);
                    verify(conduitInstance.eventRegistry).not.to.eql({});
                    conduitInstance.eventRegistry = {};
                    completionCallback();
                });

                individualTest('Event deregistration', function (completionCallback) {
                    var counterVariable = -5;
                    conduitInstance.registerListener('my_custom_event_to_remove', function (valA, valB, valC) {
                        counterVariable += valA + valB + valC;
                    });
                    conduitInstance.deregisterListener('my_custom_event_to_remove');
                    conduitInstance.triggerExecution({eventName: 'my_custom_event_to_remove', argsArray: [0, 4, 1]}, true);
                    verify(counterVariable).to.equal(-5);
                    verify(conduitInstance.eventRegistry).to.eql({});
                    completionCallback();
                });

                individualTest('One-time event registration and auto-removal', function (completionCallback) {
                    var oneTimeCounter = -5;
                    verify(conduitInstance.eventRegistry).to.eql({});
                    conduitInstance.registerOneTimeListener('single_use_event', function (valA, valB, valC) {
                        oneTimeCounter += valA + valB + valC;
                    });
                    verify(conduitInstance.eventRegistry).not.to.eql({});
                    conduitInstance.triggerExecution({eventName: 'single_use_event', argsArray: [0, 4, 1]}, true);
                    verify(oneTimeCounter).to.equal(0);
                    conduitInstance.triggerExecution({eventName: 'single_use_event', argsArray: [0, 4, 1]}, true);
                    verify(oneTimeCounter).to.equal(0);
                    conduitInstance.triggerExecution({eventName: 'single_use_event', argsArray: [0, 4, 1]}, true);
                    conduitInstance.triggerExecution({eventName: 'single_use_event', argsArray: [0, 4, 1]}, true);
                    conduitInstance.triggerExecution({eventName: 'single_use_event', argsArray: [0, 4, 1]}, true);
                    verify(oneTimeCounter).to.equal(0);
                    verify(conduitInstance.eventRegistry).to.eql({});
                    conduitInstance.deregisterListener('single_use_event');
                    completionCallback();
                });

                individualTest('Master window trigger suppression', function () {
                    var suppressedCounter = -5;
                    conduitInstance.registerOneTimeListener('suppressed_event', function (valA, valB, valC) {
                        suppressedCounter += valA + valB + valC;
                    });
                    conduitInstance.triggerExecution({eventName: 'suppressed_event', argsArray: [0, 4, 1]});
                    verify(suppressedCounter).to.equal(-5);
                    conduitInstance.deregisterListener('suppressed_event');
                });

                individualTest('Trigger listener de-duplication', function () {
                    verify(conduitInstance.eventRegistry).to.eql({});
                    conduitInstance.registerListener('unique_event', function () {
                        return true;
                    });
                    verify(conduitInstance.eventRegistry).not.to.eql({});
                    verify(retrievePropertyCount(conduitInstance.eventRegistry)).to.eql(1);
                    conduitInstance.registerListener('unique_event', function () {
                        return true;
                    });
                    verify(retrievePropertyCount(conduitInstance.eventRegistry)).to.eql(1);
                    conduitInstance.deregisterListener('unique_event');
                    verify(retrievePropertyCount(conduitInstance.eventRegistry)).to.eql(0);
                });
            });
        });
    });
});