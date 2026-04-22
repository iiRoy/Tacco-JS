let totalAssertions = 0;
let failedAssertions = 0;

function reportCondition(conditionEvaluation, failureDescription) {
    totalAssertions++;
    if (!conditionEvaluation) {
        failedAssertions++;
        console.error("VALIDATION FAILED: " + failureDescription);
        throw new Error(failureDescription);
    }
}

function verifyEquality(actualObservation, expectedOutcome, description) {
    reportCondition(actualObservation === expectedOutcome, `Equality mismatch for: "${description}". Expected: "${expectedOutcome}", Received: "${actualObservation}"`);
}

function confirmTruth(booleanExpression, description) {
    reportCondition(!!booleanExpression, `Truthiness check failed for: "${description}". Expression was falsy.`);
}

function rejectEquality(firstComparison, secondComparison, description) {
    reportCondition(firstComparison !== secondComparison, `Inequality mismatch for: "${description}". Values were identical: "${firstComparison}"`);
}

function verifyInequality(actualObservation, forbiddenValue, description) {
    reportCondition(actualObservation != forbiddenValue, `Value should not be: "${forbiddenValue}" for: "${description}". Received: "${actualObservation}"`);
}

function validateType(subjectEntity, anticipatedType, description) {
    reportCondition(typeof subjectEntity === anticipatedType, `Type mismatch for: "${description}". Expected: "${anticipatedType}", Received: "${typeof subjectEntity}"`);
}

const moduleLoader = require("../seedrandom");
const asynchronousModuleLoader = require("requirejs");

asynchronousModuleLoader.config({
  baseUrl: __dirname
});

function initiateTestCycle() {
    console.log("Initiating pseudorandom number generation validation...");

    try {
        runPrimaryFunctionalityTests();
        evaluateStatePreservationMechanism();
        validateAsynchronousLoadingIntegration();
    } catch (e) {
        console.error("\nTest cycle terminated due to an unhandled error:", e.message);
    } finally {
        console.log(`\nTest cycle concluded. Total verifications: ${totalAssertions}, Failures: ${failedAssertions}`);
        if (failedAssertions > 0) {
            process.exit(1);
        }
    }
}

function runPrimaryFunctionalityTests() {
    console.log("\n--- Executing Primary Functionality Checks ---");

    const initialMathRandomReference = Math.random;
    let operationReturn, generatedNumber, prngInstanceA, prngInstanceB, prngInstanceC;
    let auxiliaryObject, initialAutoseedMeasurement, comparableValueA, comparableValueB;
    let dedicatedGenerator;

    operationReturn = Math.seedrandom('hello.');
    prngInstanceA = Math.random;
    rejectEquality(initialMathRandomReference, prngInstanceA, "Math.random should be modified after first explicit seed.");
    verifyEquality(operationReturn, "hello.", "Short seed return verification.");
    generatedNumber = Math.random();
    verifyEquality(generatedNumber, 0.9282578795792454, "First 'hello.' generated value check.");
    generatedNumber = Math.random();
    verifyEquality(generatedNumber, 0.3752569768646784, "Second 'hello.' generated value check.");

    operationReturn = Math.seedrandom();
    prngInstanceB = Math.random;
    rejectEquality(initialMathRandomReference, prngInstanceB, "Math.random should be modified by autoseeding.");
    rejectEquality(prngInstanceA, prngInstanceB, "Math.random should change again with a new autoseed.");
    verifyEquality(operationReturn.length, 256, "Autoseed return value length check.");
    generatedNumber = Math.random();
    confirmTruth(generatedNumber > 0, "Autoseed generated value must be positive.");
    confirmTruth(generatedNumber < 1, "Autoseed generated value must be less than 1.");
    verifyInequality(generatedNumber, 0.9282578795792454, "Autoseed generated value should not match 'hello.'#1.");
    verifyInequality(generatedNumber, 0.3752569768646784, "Autoseed generated value should not match 'hello.'#2.");
    verifyInequality(generatedNumber, 0.7316977468919549, "Autoseed generated value should not match 'hello.'#3.");
    initialAutoseedMeasurement = generatedNumber;

    operationReturn = Math.seedrandom('added entropy.', { entropy:true });
    verifyEquality(operationReturn.length, 256, "Entropy addition result length check.");
    prngInstanceC = Math.random;
    rejectEquality(prngInstanceC, prngInstanceB, "Math.random should change with added entropy.");
    generatedNumber = Math.random();
    verifyInequality(generatedNumber, 0.597067214994467, "Entropy addition generated value should not match specific 'added entropy.'#1.");

    Math.random = initialMathRandomReference;
    dedicatedGenerator = new Math.seedrandom('hello.');
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should remain unaltered by new instance creation.");
    rejectEquality(initialMathRandomReference, dedicatedGenerator, "New PRNG instance should be distinct from Math.random.");
    generatedNumber = dedicatedGenerator();
    verifyEquality(generatedNumber, 0.9282578795792454, "New instance 'hello.'#1 generated value check.");

    let independentGenerator = moduleLoader('hello.');
    validateType(independentGenerator, 'function', "Independent generator should be a function.");
    generatedNumber = independentGenerator();
    verifyEquality(generatedNumber, 0.9282578795792454, "Independent 'hello.'#1 generated value check.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should remain unaltered by independent call.");
    rejectEquality(initialMathRandomReference, independentGenerator, "Independent generator should be distinct from Math.random.");

    operationReturn = moduleLoader('hello.', { global: true });
    verifyEquality(operationReturn, 'hello.', "Global seed return verification.");
    rejectEquality(initialMathRandomReference, Math.random, "Math.random should change with global seed.");
    generatedNumber = Math.random();
    verifyEquality(generatedNumber, 0.9282578795792454, "Global 'hello.'#1 generated value check.");

    Math.random = initialMathRandomReference;
    operationReturn = moduleLoader();
    validateType(operationReturn, 'function', "Autoseeded non-global call should return a function.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change for autoseeded non-global.");
    generatedNumber = operationReturn();
    verifyInequality(generatedNumber, initialAutoseedMeasurement, "Autoseeded non-global should not repeat previous autoseed.");
    verifyInequality(generatedNumber, 0.9282578795792454, "Autoseeded non-global should not match 'hello.'#1.");
    verifyInequality(generatedNumber, 0.7316977468919549, "Autoseeded non-global should not match 'hello.'#3.");

    independentGenerator = moduleLoader('added entropy.', { entropy: true });
    generatedNumber = operationReturn();
    verifyInequality(generatedNumber, initialAutoseedMeasurement, "Entropy mixed non-global should not repeat previous autoseed.");
    verifyInequality(generatedNumber, 0.597067214994467, "Entropy mixed non-global should not match 'added entropy.'#1.");

    independentGenerator = moduleLoader('added entropy.', true);
    generatedNumber = operationReturn();
    verifyInequality(generatedNumber, initialAutoseedMeasurement, "Legacy entropy mixed non-global should not repeat previous autoseed.");
    verifyInequality(generatedNumber, 0.597067214994467, "Legacy entropy mixed non-global should not match 'added entropy.'#1.");

    auxiliaryObject = Math.seedrandom(null, { pass: function(generatorSource, seedIdentifier) {
        return { randomNumberGenerator: generatorSource, seedIdentifier: seedIdentifier };
    }});
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change with pass option.");
    rejectEquality(initialMathRandomReference, auxiliaryObject.randomNumberGenerator, "Pass option PRNG should be different from Math.random.");
    validateType(auxiliaryObject.randomNumberGenerator, 'function', "Pass option should return a PRNG function.");
    validateType(auxiliaryObject.seedIdentifier, 'string', "Pass option should return a seed string.");
    comparableValueA = auxiliaryObject.randomNumberGenerator();
    verifyInequality(comparableValueA, 0.9282578795792454, "Pass option PRNG value should not match 'hello.'#1.");
    independentGenerator = moduleLoader(auxiliaryObject.seedIdentifier);
    comparableValueB = independentGenerator();
    verifyEquality(comparableValueA, comparableValueB, "Pass option PRNG should be reproducible from its seed.");

    operationReturn = Math.seedrandom('hello.', {
        global: 'abc',
        pass: function(generatorSource, seedIdentifier, globalIndicator) {
            validateType(generatorSource, 'function', "Callback argument #1 type check.");
            verifyEquality(seedIdentifier, 'hello.', "Callback argument #2 value check.");
            verifyEquality(globalIndicator, 'abc', "Callback argument #3 pass-through check.");
            verifyEquality(generatorSource(), 0.9282578795792454, "Callback PRNG 'hello.'#1 value check.");
            return 'def';
        }
    });
    verifyEquality(operationReturn, 'def', "Callback return value check.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change after pass with global.");

    operationReturn = Math.seedrandom('hello.', { global: 50 },
        function(generatorSource, seedIdentifier, globalIndicator) {
            validateType(generatorSource, 'function', "Legacy callback argument #1 type check.");
            verifyEquality(seedIdentifier, 'hello.', "Legacy callback argument #2 value check.");
            verifyEquality(globalIndicator, 50, "Legacy callback argument #3 value check.");
            verifyEquality(generatorSource(), 0.9282578795792454, "Legacy callback PRNG 'hello.'#1 value check.");
            return 'zzz';
        }
    );
    verifyEquality(operationReturn, 'zzz', "Legacy callback return value check.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change after legacy callback.");

    dedicatedGenerator = new Math.seedrandom('hello.', {global:false});
    validateType(dedicatedGenerator, 'function', "New instance with global:false should return a function.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change with global:false.");
    rejectEquality(initialMathRandomReference, dedicatedGenerator, "PRNG instance with global:false should not be Math.random.");
    generatedNumber = dedicatedGenerator();
    verifyEquality(generatedNumber, 0.9282578795792454, "New instance global:false 'hello.'#1 generated value check.");

    operationReturn = Math.seedrandom('hello.');
    let currentMathRandomReference = Math.random;
    rejectEquality(initialMathRandomReference, currentMathRandomReference, "Math.random should change with implicit global seed.");
    verifyEquality(operationReturn, "hello.", "Implicit global seed return verification.");
    generatedNumber = Math.random();
    verifyEquality(generatedNumber, 0.9282578795792454, "Implicit global 'hello.'#1 generated value check.");
    generatedNumber = Math.random();
    verifyEquality(generatedNumber, 0.3752569768646784, "Implicit global 'hello.'#2 generated value check.");
    Math.random = initialMathRandomReference;

    independentGenerator = moduleLoader('hello.', {});
    validateType(independentGenerator, 'function', "Independent with empty options should return a function.");
    generatedNumber = independentGenerator();
    verifyEquality(generatedNumber, 0.9282578795792454, "Independent with empty options 'hello.'#1 generated value check.");
    confirmTruth(initialMathRandomReference === Math.random, "Math.random should not change with independent empty options.");
    rejectEquality(initialMathRandomReference, independentGenerator, "Independent with empty options PRNG should not be Math.random.");
}

function evaluateStatePreservationMechanism() {
    console.log("\n--- Executing State Preservation Mechanism Checks ---");

    const ephemeralGenerator = moduleLoader('secret-seed');
    let unexpectedResult = -1;
    let anticipatedErrorEncountered = -1;
    try {
        unexpectedResult = ephemeralGenerator.state();
    } catch(e) {
        anticipatedErrorEncountered = 1;
    }
    verifyEquality(unexpectedResult, -1, "Default generator should not expose a state method result.");
    verifyEquality(anticipatedErrorEncountered, 1, "Default generator should throw error on state() invocation.");

    let enumerablePropertyCount = 0;
    for (const item in ephemeralGenerator) {
        enumerablePropertyCount++;
    }
    verifyEquality(enumerablePropertyCount, 0, "Default generator should have no enumerable properties.");

    const storableGenerator = moduleLoader("secret-seed", {state: true});
    const standardGenerator = moduleLoader("secret-seed");

    for (let currentCount = 0; currentCount < 100; ++currentCount) {
        verifyEquality(standardGenerator(), storableGenerator(), `Storable and standard generators should yield same value for iteration ${currentCount}.`);
    }

    const unblemishedGenerator = moduleLoader("secret-seed");
    const capturedInternalState = storableGenerator.state();
    const reconstructedGenerator = moduleLoader("", {state: capturedInternalState});

    for (let currentCount = 0; currentCount < 100; ++currentCount) {
        const reconstructedValue = reconstructedGenerator();
        verifyEquality(reconstructedValue, storableGenerator(), `Reconstructed and storable generators should match for iteration ${currentCount}.`);
        verifyEquality(reconstructedValue, standardGenerator(), `Reconstructed and standard generators should match for iteration ${currentCount}.`);
        verifyInequality(reconstructedValue, unblemishedGenerator(), `Reconstructed generator should not match unblemished generator for iteration ${currentCount}.`);
    }
}

function validateAsynchronousLoadingIntegration() {
    console.log("\n--- Executing Asynchronous Module Loading Integration Checks ---");

    const originalMathRandomHandle = Math.random;
    const requiredRandomSource = asynchronousModuleLoader('../seedrandom');
    const specificGenerator = requiredRandomSource('hello.');
    validateType(specificGenerator, 'function', "Asynchronously loaded generator should be a function.");
    const producedNumber = specificGenerator();
    verifyEquality(producedNumber, 0.9282578795792454, "Asynchronously loaded 'hello.'#1 generated value check.");
    confirmTruth(originalMathRandomHandle === Math.random, "Math.random should not change with asynchronously loaded generator.");
    rejectEquality(originalMathRandomHandle, specificGenerator, "Asynchronously loaded generator should be distinct from Math.random.");
}

initiateTestCycle();