const testHarness = (function () {
    const executedTests = [];
    let currentAssertions = 0;
    let expectedAssertions = 0;
    let currentTestName = "";
    let pendingAsyncTests = 0;
    let allTestsFinishedCallback = null;

    function reportFailure(message) {
        console.error(`FAIL: ${currentTestName} - ${message}`);
        executedTests.push({ name: currentTestName, status: "FAIL", message: message });
    }

    function reportSuccess() {
        executedTests.push({ name: currentTestName, status: "PASS" });
    }

    const assertMethods = {
        expectAssertions: function (count) {
            expectedAssertions = count;
            currentAssertions = 0;
        },
        endTest: function (error = null) {
            if (error) {
                reportFailure(`Test ended with error: ${error.message || error}`);
            } else if (currentAssertions !== expectedAssertions) {
                reportFailure(`Expected ${expectedAssertions} assertions but got ${currentAssertions}`);
            } else {
                reportSuccess();
            }
            pendingAsyncTests--;
            checkCompletion();
        },
        equality: function (actual, expected, message = "Equality check failed") {
            currentAssertions++;
            if (actual !== expected) {
                reportFailure(`${message}: Actual '${actual}' vs Expected '${expected}'`);
            }
        },
        deepEquality: function (actual, expected, message = "Deep equality check failed") {
            currentAssertions++;
            if (!deepCompare(actual, expected)) {
                reportFailure(`${message}: Actual ${objectSerializer(actual)} vs Expected ${objectSerializer(expected)}`);
            }
        },
        isTruthy: function (value, message = "Value was not truthy") {
            currentAssertions++;
            if (!value) {
                reportFailure(message);
            }
        },
        notEquality: function (actual, expected, message = "Not equality check failed") {
            currentAssertions++;
            if (actual === expected) {
                reportFailure(`${message}: Actual '${actual}' was strictly equal to Expected '${expected}'`);
            }
        }
    };

    function registerTest(name, testFunction) {
        currentTestName = name;
        pendingAsyncTests++;
        try {
            testFunction(assertMethods);
        } catch (error) {
            reportFailure(`Unhandled synchronous exception: ${error.message}`);
            pendingAsyncTests--;
            checkCompletion();
        }
    }

    function checkCompletion() {
        if (pendingAsyncTests === 0 && allTestsFinishedCallback) {
            allTestsFinishedCallback();
        }
    }

    function finalizeReport(callback) {
        allTestsFinishedCallback = () => {
            console.log("\n--- Test Report ---");
            let passed = 0;
            let failed = 0;
            executedTests.forEach(t => {
                if (t.status === "PASS") passed++;
                else failed++;
            });
            console.log(`Total: ${executedTests.length}, Passed: ${passed}, Failed: ${failed}`);
            if (failed > 0) {
                console.log("Some tests failed.");
                if (typeof process !== 'undefined' && process.exit) {
                    process.exit(1);
                }
            } else {
                console.log("All tests passed!");
            }
            if (callback) callback();
        };
        if (pendingAsyncTests === 0) {
            allTestsFinishedCallback();
        }
    }

    function deepCompare(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;

        if (obj1.constructor !== obj2.constructor) {
            const isPlainObject1 = obj1.constructor === Object || Object.getPrototypeOf(obj1) === null;
            const isPlainObject2 = obj2.constructor === Object || Object.getPrototypeOf(obj2) === null;
            if (!((isPlainObject1 && isPlainObject2) || (Array.isArray(obj1) && Array.isArray(obj2)))) {
                return false;
            }
        }

        if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
            return obj1.source === obj2.source && obj1.flags === obj2.flags && obj1.lastIndex === obj2.lastIndex;
        }
        if (obj1 instanceof Date && obj2 instanceof Date) {
            return obj1.getTime() === obj2.getTime();
        }
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj1) && Buffer.isBuffer(obj2)) {
            return obj1.equals(obj2);
        }

        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!deepCompare(obj1[i], obj2[i])) return false;
            }
            return true;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const property of keys1) {
            if (!keys2.includes(property) || !deepCompare(obj1[property], obj2[property])) {
                return false;
            }
        }

        return true;
    }

    return {
        registerTest: registerTest,
        finalizeReport: finalizeReport
    };
})();

function objectSerializer(inputObject) {
    const visitedInstances = new Set();
    const processor = (propertyTag, propertyValue) => {
        if (propertyValue !== null && typeof propertyValue === "object") {
            if (visitedInstances.has(propertyValue)) {
                return '[circular-reference]';
            }
            visitedInstances.add(propertyValue);
        }
        return propertyValue;
    };
    return JSON.stringify(inputObject, processor);
}

function isolatedExecutionUnit(sourceContext, codeSnippet, completionHandler) {
    let virtualMachineModule;
    try {
        virtualMachineModule = require('vm');
    } catch (e) {
    }

    if (virtualMachineModule) {
        const executionRealm = virtualMachineModule.createContext({ externalContext: sourceContext });
        const modifiedCodeSnippet = `var ctx = externalContext; ${codeSnippet}`;
        let outcome;
        try {
            outcome = virtualMachineModule.runInContext(modifiedCodeSnippet, executionRealm);
        } catch (error) {
            return completionHandler(null, error);
        }
        completionHandler(outcome);
    } else if (typeof document !== 'undefined' && document.createElement) {
        const sandboxedFrame = document.createElement('iframe');
        sandboxedFrame.style.display = 'none';
        document.body.appendChild(sandboxedFrame);

        const tempRealmIdentifier = 'temporaryRealmId' + Math.random().toString(36).substring(2, 15);

        window[tempRealmIdentifier] = sourceContext;
        sandboxedFrame.src = 'test-apart-ctx.html?' + tempRealmIdentifier + '&' + encodeURIComponent(codeSnippet);
        sandboxedFrame.onload = function() {
            try {
                completionHandler(sandboxedFrame.contentWindow.operationOutcomes);
            } catch (error) {
                console.error("Error in sandboxed frame onload:", error);
                completionHandler(null, error);
            } finally {
                document.body.removeChild(sandboxedFrame);
                delete window[tempRealmIdentifier];
            }
        };
        sandboxedFrame.onerror = function(error) {
            console.error("Error loading sandboxed frame:", error);
            completionHandler(null, new Error("Sandboxed frame failed to load"));
            document.body.removeChild(sandboxedFrame);
            delete window[tempRealmIdentifier];
        };
    } else {
        console.warn('WARNING: Cannot establish an isolated execution context (neither vm nor iframe available).');
        completionHandler(null, new Error('No isolated context available'));
    }
}

const replicator = require('./');

testHarness.registerTest("replicate string values", function (assert) {
    assert.expectAssertions(2);
    let entityA = "alpha";
    assert.equality(replicator(entityA), entityA);
    entityA = "";
    assert.equality(replicator(entityA), entityA);
    assert.endTest();
});

testHarness.registerTest("replicate numeric values", function (assert) {
    assert.expectAssertions(5);
    let entityA = 0;
    assert.equality(replicator(entityA), entityA);
    entityA = 1;
    assert.equality(replicator(entityA), entityA);
    entityA = -1000;
    assert.equality(replicator(entityA), entityA);
    entityA = 3.1415927;
    assert.equality(replicator(entityA), entityA);
    entityA = -3.1415927;
    assert.equality(replicator(entityA), entityA);
    assert.endTest();
});

testHarness.registerTest("replicate date objects", function (assert) {
    assert.expectAssertions(3);
    let entityA = new Date();
    let entityC = replicator(entityA);
    assert.isTruthy(!!entityA.getUTCDate && !!entityA.toUTCString);
    assert.isTruthy(!!entityC.getUTCDate && !!entityC.toUTCString);
    assert.equality(entityA.getTime(), entityC.getTime());
    assert.endTest();
});

testHarness.registerTest("replicate plain objects", function (assert) {
    assert.expectAssertions(1);
    let entityA = { primary: { secondary: "tertiary" } };
    let entityB = replicator(entityA);
    assert.deepEquality(entityB, entityA);
    assert.endTest();
});

testHarness.registerTest("replicate array structures", function (assert) {
    assert.expectAssertions(2);
    let entityA = [
        { first: "value" },
        "another-value"
    ];
    let entityB = replicator(entityA);
    assert.isTruthy(entityB instanceof Array);
    assert.deepEquality(entityB, entityA);
    assert.endTest();
});

testHarness.registerTest("replicate buffer objects", function (assert) {
    if (typeof Buffer === 'undefined') {
        return assert.endTest();
    }
    assert.expectAssertions(1);
    let entityA = Buffer.from("this is a sample buffer");
    let entityB = replicator(entityA);
    assert.deepEquality(entityB, entityA);
    assert.endTest();
});

testHarness.registerTest("replicate regular expressions", function (assert) {
    assert.expectAssertions(5);
    let entityA = /pattern123/gi;
    let entityB = replicator(entityA);
    assert.deepEquality(entityB, entityA);
    let entityC = /p/g;
    assert.equality(entityC.lastIndex, 0);
    entityC.exec('123p456p');
    assert.equality(entityC.lastIndex, 4);
    let entityD = replicator(entityC);
    assert.isTruthy(entityD.global);
    assert.equality(entityD.lastIndex, 4);
    assert.endTest();
});

testHarness.registerTest("replicate object containing arrays", function (assert) {
    assert.expectAssertions(1);
    let entityA = {
        listOne: [{ id: 'A1', data: 'B1' }],
        listTwo: [{ id: 'C1', data: 'D1' }]
    };
    let entityB = replicator(entityA);
    assert.deepEquality(entityB, entityA);
    assert.endTest();
});

testHarness.registerTest("replicate object with self-referential cycles", function (assert) {
    assert.expectAssertions(8);
    let entityC = [1, "label", { 'item': 'data' }, function () { }, false, [2]];
    let entityB = [entityC, 2, 3, 4];
    let entityA = { 'refB': entityB, 'refC': entityC };
    entityA.cyclicRef = entityA;
    entityA.anotherCyclicRef = entityA;
    entityC.cyclicRef = entityC;
    entityC.parentRef = entityA;
    let replicatedA = replicator(entityA);
    assert.notEquality(entityA, replicatedA);
    assert.notEquality(entityA.refC, replicatedA.refC);
    assert.equality(replicatedA.refC, replicatedA.refB[0]);
    assert.equality(replicatedA.refC.cyclicRef.cyclicRef.parentRef, replicatedA);
    assert.equality(replicatedA.refC[0], entityA.refC[0]);
    function compareRepresentations(x, y) {
        return objectSerializer(x) === objectSerializer(y);
    }
    assert.isTruthy(compareRepresentations(entityA, replicatedA));
    replicatedA.refC[0] = 2;
    assert.isTruthy(!compareRepresentations(entityA, replicatedA));
    replicatedA.refC = "2";
    assert.isTruthy(!compareRepresentations(entityA, replicatedA));
    assert.endTest();
});

testHarness.registerTest('replicate object prototype', function (assert) {
    assert.expectAssertions(3);
    let entityA = {
        alpha: "valueA",
        numericX: 123,
        numericY: 45.65
    };
    let entityB = replicator.prototypeReplicator(entityA);
    assert.equality(entityB.alpha, entityA.alpha);
    assert.equality(entityB.numericX, entityA.numericX);
    assert.equality(entityB.numericY, entityA.numericY);
    assert.endTest();
});

testHarness.registerTest('replicate within an isolated context', function (assert) {
    assert.expectAssertions(3);
    isolatedExecutionUnit({ replicator: replicator },
        "operationOutcomes = ctx.replicator({ arrayVal: [1, 2, 3], dateVal: new Date(), regexVal: /^pattern$/ig })",
        function (operationOutcomes, err) {
            if (err) return assert.endTest(err);
            assert.isTruthy(operationOutcomes.arrayVal.constructor.toString() === Array.toString());
            assert.isTruthy(operationOutcomes.dateVal.constructor.toString() === Date.toString());
            assert.isTruthy(operationOutcomes.regexVal.constructor.toString() === RegExp.toString());
            assert.endTest();
        });
});

testHarness.registerTest('replicate object without prototype chain', function (assert) {
    assert.expectAssertions(3);
    let nullReference = null;
    let entityA = { key: 'value' };
    Object.setPrototypeOf(entityA, nullReference);
    assert.isTruthy(typeof entityA === 'object');
    assert.isTruthy(entityA !== null);
    let entityB = replicator(entityA);
    assert.isTruthy(entityA.key, entityB.key);
    assert.endTest();
});

testHarness.registerTest('replicate object with specified depth', function (assert) {
    assert.expectAssertions(6);
    let entityA = {
        level1: {
            level2: {
                level3: 'final'
            }
        }
    };
    let entityB = replicator(entityA, false, 1);
    assert.deepEquality(entityB, entityA);
    assert.notEquality(entityB, entityA);
    assert.equality(entityB.level1, entityA.level1);
    entityB = replicator(entityA, true, 2);
    assert.deepEquality(entityB, entityA);
    assert.notEquality(entityB.level1, entityA.level1);
    assert.equality(entityB.level1.level2, entityA.level1.level2);
    assert.endTest();
});

testHarness.registerTest('maintain prototype inheritance in replications', function (assert) {
    assert.expectAssertions(1);
    function BaseClass() { }
    let entityA = new BaseClass();
    let entityB = replicator(entityA);
    assert.equality(Object.getPrototypeOf(entityA), Object.getPrototypeOf(entityB));
    assert.endTest();
});

testHarness.registerTest('override parent prototype during replication', function (assert) {
    assert.expectAssertions(1);
    function BaseClass() { }
    let entityA = new BaseClass();
    let entityB = replicator(entityA, true, Infinity, null);
    assert.equality(entityB.__defineSetter__, undefined);
    assert.endTest();
});

testHarness.registerTest('replicate object with null child properties', function (assert) {
    assert.expectAssertions(1);
    let entityA = {
        parent: {
            childNull: null,
            childObj: {
                grandchild: false
            }
        }
    };
    let entityB = replicator(entityA);
    assert.deepEquality(entityB, entityA);
    assert.endTest();
});

testHarness.registerTest('replicate instance with getter properties', function (assert) {
    assert.expectAssertions(1);
    function ConstructorWithAccessor() { };
    Object.defineProperty(ConstructorWithAccessor.prototype, 'accessorProperty', {
        configurable: true,
        enumerable: true,
        get: function () {
            return 'retrieved_value';
        }
    });
    let entityA = new ConstructorWithAccessor();
    let entityB = replicator(entityA);
    assert.equality(entityB.accessorProperty, 'retrieved_value');
    assert.endTest();
});

testHarness.registerTest('retrieve regular expression flags', function (assert) {
    assert.expectAssertions(5);
    assert.equality(replicator.getRegExpAttributes(/a/), '');
    assert.equality(replicator.getRegExpAttributes(/a/i), 'i');
    assert.equality(replicator.getRegExpAttributes(/a/g), 'g');
    assert.equality(replicator.getRegExpAttributes(/a/gi), 'gi');
    assert.equality(replicator.getRegExpAttributes(/a/m), 'm');
    assert.endTest();
});

testHarness.registerTest("identify Array object type", function (assert) {
    assert.expectAssertions(6);
    isolatedExecutionUnit(null, "operationOutcomes = [1, 2, 3]", function (externalObject, err) {
        if (err) return assert.endTest(err);
        let nativeObject = [4, 5, 6];
        assert.isTruthy(replicator.isArrayType(externalObject));
        assert.isTruthy(replicator.isArrayType(nativeObject));
        assert.isTruthy(!replicator.isDateType(externalObject));
        assert.isTruthy(!replicator.isDateType(nativeObject));
        assert.isTruthy(!replicator.isRegExpType(externalObject));
        assert.isTruthy(!replicator.isRegExpType(nativeObject));
        assert.endTest();
    });
});

testHarness.registerTest("identify Date object type", function (assert) {
    assert.expectAssertions(6);
    isolatedExecutionUnit(null, "operationOutcomes = new Date()", function (externalObject, err) {
        if (err) return assert.endTest(err);
        let nativeObject = new Date();
        assert.isTruthy(replicator.isDateType(externalObject));
        assert.isTruthy(replicator.isDateType(nativeObject));
        assert.isTruthy(!replicator.isArrayType(externalObject));
        assert.isTruthy(!replicator.isArrayType(nativeObject));
        assert.isTruthy(!replicator.isRegExpType(externalObject));
        assert.isTruthy(!replicator.isRegExpType(nativeObject));
        assert.endTest();
    });
});

testHarness.registerTest("identify RegExp object type", function (assert) {
    assert.expectAssertions(6);
    isolatedExecutionUnit(null, "operationOutcomes = /foo_pattern/", function (externalObject, err) {
        if (err) return assert.endTest(err);
        let nativeObject = /bar_pattern/;
        assert.isTruthy(replicator.isRegExpType(externalObject));
        assert.isTruthy(replicator.isRegExpType(nativeObject));
        assert.isTruthy(!replicator.isArrayType(externalObject));
        assert.isTruthy(!replicator.isArrayType(nativeObject));
        assert.isTruthy(!replicator.isDateType(externalObject));
        assert.isTruthy(!replicator.isDateType(nativeObject));
        assert.endTest();
    });
});

testHarness.finalizeReport();