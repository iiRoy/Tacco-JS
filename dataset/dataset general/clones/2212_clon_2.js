var testLib = {
    assert: chai.expect
};

objectHelpers.countProperties = function (inputObject) {
    let propertyCount = 0;
    for (let propertyName in inputObject) {
        if (inputObject.hasOwnProperty(propertyName)) {
            propertyCount++;
        }
    }
    return propertyCount;
};

specSuite('BattlegroundSystem Validation 001', () => {

    specSuite('Setup Readiness Check', () => {

        test('battleground module must be ready', () => {
            testLib.assert(battleground).to.be.an.instanceof(Object);
        });

        if (!/oldEngine|legacyBrowser/i.test(browserInfo.agentString)) {
            test(`battleground should utilizeStorageBroadcast == true with ${browserInfo.agentString}`, () => {
                testLib.assert(battleground.utilizeStorageBroadcast).to.be.true;
            });
        } else {
            test(`battleground should utilizeStorageBroadcast == false with ${browserInfo.agentString}`, () => {
                testLib.assert(battleground.utilizeStorageBroadcast).to.be.false;
            });
        }

        test('battleground.canAccessLocalDataStore should be a function and should return true', () => {
            testLib.assert(battleground.canAccessLocalDataStore).to.not.be.an('undefined');
            testLib.assert(battleground.canAccessLocalDataStore()).to.be.true;
        });

        test('battleground integrity check should pass', () => {
            testLib.assert(battleground.duplicate).to.not.be.an('undefined');
            testLib.assert(battleground.BattleAbstractConduit).to.not.be.an('undefined');
            testLib.assert(battleground.retrieveWindowIdentifier).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.fetchName).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.runEventAction).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.attachListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.attachOnceListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.detachListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.dispatchSignal).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.designateCurrentWindowAsPrimary).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.isCurrentWindowPrimary).to.not.be.an('undefined');
            testLib.assert(battleground.BattleLocalDataConduit.prototype.transmitData).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.fetchName).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.runEventAction).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.attachListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.attachOnceListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.detachListener).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.dispatchSignal).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.designateCurrentWindowAsPrimary).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.isCurrentWindowPrimary).to.not.be.an('undefined');
            testLib.assert(battleground.BattleMockConduit.prototype.transmitData).to.not.be.an('undefined');
            testLib.assert(battleground.activeConduits).to.be.an('array');
            testLib.assert(battleground.conduit).to.not.be.an('undefined');
            testLib.assert(battleground.establishCurrentWindowAsPrimary).to.not.be.an('undefined');
            testLib.assert(window.isPrimary).to.not.be.an('undefined');
            testLib.assert(battleground.addEventHandler).to.not.be.an('undefined');
            testLib.assert(battleground.dataStoreEvent).to.not.be.an('undefined');
        });
    });

    specSuite('Browser Window Functionality Test', () => {

        battleground.activeConduits = [];

        test('battleground.retrieveWindowIdentifier should return a unique Window ID', () => {
            const uniqueWindowIdentifier = battleground.retrieveWindowIdentifier();
            testLib.assert(uniqueWindowIdentifier).to.be.a('number');
            testLib.assert(battleground.retrieveWindowIdentifier()).to.equal(uniqueWindowIdentifier);
        });

        test('window.isPrimary() should be true without conduits', () => {
            testLib.assert(window.isPrimary()).to.be.true;

            specSuite('BattlegroundSystem Validation 002', () => {
                specSuite('Conduit Interaction Tests', () => {
                    let currentConduit = battleground.conduit('_testChannel');

                    test('battleground.conduit should return a new conduit instance', () => {
                        testLib.assert(currentConduit).to.be.an.instanceof(Object);
                    });

                    test('window.isPrimary() should be true with an initialized conduit', () => {
                        testLib.assert(window.isPrimary()).to.be.true;
                    });

                    test('should not duplicate conduits', () => {
                        currentConduit = battleground.conduit('_testChannel');
                        currentConduit = battleground.conduit('_testChannel');
                        const secondaryConduit = battleground.conduit('_anotherTestChannel');
                        const tertiaryConduit = battleground.conduit('_testChannel');
                        testLib.assert(battleground.activeConduits.length).to.equal(2);
                        testLib.assert(tertiaryConduit).to.equal(currentConduit);
                        testLib.assert(currentConduit.isCurrentWindowPrimary()).to.be.true;
                        testLib.assert(secondaryConduit.isCurrentWindowPrimary()).to.be.true;
                        testLib.assert(tertiaryConduit.isCurrentWindowPrimary()).to.be.true;
                    });

                    test('should establish an event listener', (completionCallback) => {
                        let accumulatorValue = -5;
                        currentConduit.attachListener('test_signal', (paramA, paramB, paramC) => {
                            accumulatorValue += paramA + paramB + paramC;
                            testLib.assert(accumulatorValue).to.equal(0);
                        });
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        testLib.assert(currentConduit._eventListeners).to.not.eql({});
                        currentConduit._eventListeners = {};
                        completionCallback();
                    });

                    test('should unregister an event listener', (completionCallback) => {
                        let accumulatorValue = -5;
                        currentConduit.attachListener('test_signal', (paramA, paramB, paramC) => {
                            accumulatorValue += paramA + paramB + paramC;
                        });
                        currentConduit.detachListener('test_signal');
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        testLib.assert(accumulatorValue).to.equal(-5);
                        testLib.assert(currentConduit._eventListeners).to.eql({});
                        completionCallback();
                    });

                    test('should register once-off event and verify removal', (completionCallback) => {
                        let finalAccumulator = -5;
                        testLib.assert(currentConduit._eventListeners).to.eql({});
                        currentConduit.attachOnceListener('test_signal', (valX, valY, valZ) => {
                            finalAccumulator += valX + valY + valZ;
                        });
                        testLib.assert(currentConduit._eventListeners).to.not.eql({});
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        testLib.assert(finalAccumulator).to.equal(0);
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        testLib.assert(finalAccumulator).to.equal(0);
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] }, true);
                        testLib.assert(finalAccumulator).to.equal(0);
                        testLib.assert(currentConduit._eventListeners).to.eql({});
                        currentConduit.detachListener('test_signal');
                        completionCallback();
                    });

                    test('should prevent trigger execution in primary window', () => {
                        let finalAccumulator = -5;
                        currentConduit.attachOnceListener('test_signal', (valX, valY, valZ) => {
                            finalAccumulator += valX + valY + valZ;
                        });
                        currentConduit.runEventAction({ eventName: 'test_signal', arguments: [0, 4, 1] });
                        testLib.assert(finalAccumulator).to.equal(-5);
                        currentConduit.detachListener('test_signal');
                    });

                    test('should avoid duplicating event triggers', () => {
                        testLib.assert(currentConduit._eventListeners).to.eql({});
                        currentConduit.attachListener('test_signal', () => {
                            return true;
                        });
                        testLib.assert(currentConduit._eventListeners).to.not.eql({});
                        testLib.assert(objectHelpers.countProperties(currentConduit._eventListeners)).to.eql(1);
                        currentConduit.attachListener('test_signal', () => {
                            return true;
                        });
                        testLib.assert(objectHelpers.countProperties(currentConduit._eventListeners)).to.eql(1);
                        currentConduit.detachListener('test_signal');
                        testLib.assert(objectHelpers.countProperties(currentConduit._eventListeners)).to.eql(0);
                    });
                });
            });
        });
    });
});