var verifier = require("assert");
var rngFactory = require("../seedrandom");
var moduleLoader = require("requirejs");

// Set up the RequireJS configuration for the test environment.
moduleLoader.config({
  baseUrl: __dirname
});

// Define the main test suite for the Node.js API of the random number generator.
testSuite("Node.js Random Number Generator API Validation", function() {

  // This test case covers the fundamental operations and various seeding mechanisms.
  testCase('Verify core random number generator operations.', function() {
    var initialGlobalRNG = Math.random; // Safeguard the initial reference to Math.random.
    var testOutcome = null; // Variable to hold results from seeding operations.
    var generatedValue = null; // Holds individual random numbers.
    var temporaryRNGRef = null; // Temporary reference for a PRNG function.
    var callbackResultObject = null; // Stores object returned by 'pass' callback.
    var valA = null,
      valB = null; // Used for comparative random values.
    var firstAutoSeedValue = null; // Stores the first value from an autoseed sequence.
    var instanceSpecificRNG = null; // A PRNG instance created with 'new'.
    var firstRNGState = null,
      secondRNGState = null,
      thirdRNGState = null; // References to Math.random at different states.

    // --- Test Block 1: Seeding with a specific string ---
    // Validate that seeding Math.random with a string works as expected.
    testOutcome = Math.seedrandom('hello.');
    firstRNGState = Math.random; // Capture the new Math.random reference after seeding.
    verifier.ok(initialGlobalRNG !== firstRNGState, "Global RNG reference must be updated upon explicit seeding.");
    verifier.strictEqual(typeof testOutcome, 'string', "The seed method must return a string type."); // Added type check.
    verifier.strictEqual(testOutcome, "hello.", "The seed method should echo the provided seed string.");
    generatedValue = Math.random();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "The first random value for 'hello.' seed is incorrect.");
    generatedValue = Math.random();
    verifier.strictEqual(generatedValue, 0.3752569768646784, "The second random value for 'hello.' seed is incorrect.");

    // --- Test Block 2: Autoseeding functionality ---
    // Confirm that the generator can autoseed itself when no explicit seed is provided.
    testOutcome = Math.seedrandom();
    secondRNGState = Math.random; // Capture Math.random after autoseeding.
    verifier.ok(initialGlobalRNG !== secondRNGState, "Math.random must be updated by the autoseed process.");
    verifier.ok(firstRNGState !== secondRNGState, "Autoseeding should result in a distinct RNG state from previous seeding.");
    verifier.strictEqual(testOutcome.length, 256, "Autoseed should generate and return a 256-character seed string.");
    generatedValue = Math.random();
    verifier.ok(generatedValue > 0 && generatedValue < 1, "Autoseeded value must strictly be between 0 and 1.");
    verifier.notStrictEqual(generatedValue, 0.9282578795792454, "Autoseed must not produce values matching 'hello.'#1.");
    verifier.notStrictEqual(generatedValue, 0.3752569768646784, "Autoseed must not produce values matching 'hello.'#2.");
    firstAutoSeedValue = generatedValue; // Store this value for subsequent comparisons.
    console.log(`[DEBUG] Initial autoseeded value observed: ${firstAutoSeedValue}`); // Debugging output added.

    // --- Test Block 3: Adding entropy to the global generator ---
    // Verify the capability to mix additional entropy into the currently active generator.
    testOutcome = Math.seedrandom('added entropy.', {
      entropy: true
    });
    verifier.strictEqual(testOutcome.length, 256, "Entropy addition should also return a full-length seed string.");
    thirdRNGState = Math.random; // Capture Math.random after entropy addition.
    verifier.ok(thirdRNGState !== secondRNGState, "Adding entropy must result in a new RNG state.");
    generatedValue = Math.random();
    verifier.notStrictEqual(generatedValue, 0.597067214994467, "Entropy-seeded value should not match 'added entropy.'#1 from a fresh seed.");

    // --- Test Block 4: Instantiating a new generator without affecting Math.random ---
    // Restore Math.random to its initial state to ensure isolation.
    Math.random = initialGlobalRNG;
    instanceSpecificRNG = new Math.seedrandom('hello.'); // Create a new PRNG instance using the 'new' keyword.
    verifier.strictEqual(initialGlobalRNG, Math.random, "Creating a new instance should not modify the global Math.random.");
    verifier.ok(initialGlobalRNG !== instanceSpecificRNG, "The new PRNG instance must be a distinct object from Math.random.");
    generatedValue = instanceSpecificRNG();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "Value from the new instance ('hello.'#1) is incorrect.");

    // --- Test Block 5: Direct use of rngFactory (non-global) ---
    // Test direct invocation of the loaded factory to get a local PRNG function.
    var localRNG = rngFactory('hello.'); // Obtain a local PRNG function.
    verifier.strictEqual(typeof localRNG, 'function', "Direct factory call must yield a function type.");
    generatedValue = localRNG();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "Direct factory call result ('hello.'#1) is not as expected.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Direct factory call should have no side effects on Math.random.");
    verifier.ok(initialGlobalRNG !== localRNG, "The direct factory result must be distinct from the global Math.random.");
    if (generatedValue === 0.9282578795792454) { // Conditional check for logging.
      console.log("[INFO] First 'hello.' value from local generator confirmed.");
    }

    // --- Test Block 6: Global PRNG update via factory ---
    // Confirm the factory's ability to explicitly update Math.random using the 'global' option.
    testOutcome = rngFactory('hello.', {
      global: true
    });
    verifier.strictEqual(testOutcome, 'hello.', "Global seed factory call should return the provided seed string.");
    verifier.notStrictEqual(initialGlobalRNG, Math.random, "The 'global: true' option must change Math.random.");
    generatedValue = Math.random();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "Global-seeded Math.random ('hello.'#1) value is incorrect.");

    // --- Test Block 7: Autoseeded non-global factory call ---
    // Reset Math.random to its original state for a clean test of autoseeding without global effect.
    Math.random = initialGlobalRNG;
    testOutcome = rngFactory(); // Autoseed without modifying Math.random.
    verifier.strictEqual(typeof testOutcome, 'function', "Autoseeded factory call should return a PRNG function.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Autoseeded factory call should not modify Math.random.");
    generatedValue = testOutcome();
    verifier.notStrictEqual(generatedValue, firstAutoSeedValue, "Autoseed should not repeat the previously stored autoseed value.");
    // Combined multiple checks for non-equality into one 'ok' assertion.
    verifier.ok(generatedValue !== 0.9282578795792454 && generatedValue !== 0.7316977468919549,
      "Autoseeded local PRNG must not match specific 'hello.' sequence values.");

    // --- Test Block 8: Mixing accumulated entropy via factory ---
    // Test the factory call with the entropy option for a local generator.
    localRNG = rngFactory('added entropy.', {
      entropy: true
    });
    generatedValue = testOutcome(); // Continue using the previously autoseeded localRNG.
    verifier.notStrictEqual(generatedValue, firstAutoSeedValue, "Entropy mixing should not yield the initial autoseed value.");
    verifier.notStrictEqual(generatedValue, 0.597067214994467, "Entropy mixed value should not match a fixed 'added entropy.'#1.");

    // --- Test Block 9: Legacy entropy mixing call ---
    // Validate the older calling convention where a boolean argument signified entropy.
    localRNG = rngFactory('added entropy.', true); // Legacy call for entropy mixing.
    generatedValue = testOutcome(); // Still using the same autoseeded localRNG.
    verifier.notStrictEqual(generatedValue, firstAutoSeedValue, "Legacy entropy call should not produce the initial autoseed.");
    verifier.notStrictEqual(generatedValue, 0.597067214994467, "Legacy entropy mixed value should not match 'added entropy.'#1.");

    // --- Test Block 10: The 'pass' option for custom return values ---
    // This feature allows a callback to process the generated PRNG and seed before returning.
    callbackResultObject = Math.seedrandom(null, {
      pass: function(prngFunction, currentSeed) {
        // This callback demonstrates transforming the return value.
        return {
          generator: prngFunction,
          seedValue: currentSeed
        };
      }
    });
    verifier.strictEqual(initialGlobalRNG, Math.random, "Math.random must remain unchanged when 'pass' option is used.");
    verifier.ok(initialGlobalRNG !== callbackResultObject.generator, "The returned generator must be distinct from global Math.random.");
    verifier.strictEqual(typeof callbackResultObject.generator, 'function', "The callback should return an object containing a PRNG function.");
    verifier.strictEqual(typeof callbackResultObject.seedValue, 'string', "The callback should return an object containing a seed string.");
    valA = callbackResultObject.generator();
    verifier.notStrictEqual(valA, 0.9282578795792454, "Value from 'pass' callback generator should not be 'hello.'#1.");
    localRNG = rngFactory(callbackResultObject.seedValue); // Re-seed a new generator using the returned seed.
    valB = localRNG();
    verifier.strictEqual(valA, valB, "Generated values must be reproducible when using the seed from the 'pass' callback.");

    // --- Test Block 11: 'pass' option with explicit seed and global context ---
    // Further exercise the 'pass' callback with more arguments and options.
    testOutcome = Math.seedrandom('explicit-seed', {
      global: 'custom-global-id',
      pass: function(prngFunc, currentSeed, globalContext) {
        verifier.strictEqual(typeof prngFunc, 'function', "Callback argument #1 must be a function.");
        verifier.strictEqual(currentSeed, 'explicit-seed', "Callback argument #2 must match the input seed.");
        verifier.strictEqual(globalContext, 'custom-global-id', "Callback argument #3 must pass the global context value.");
        verifier.strictEqual(prngFunc(), 0.9282578795792454, "PRNG within callback ('hello.'#1) yields an incorrect value.");
        return 'custom-return-value'; // Return a custom string from the callback.
      }
    });
    verifier.strictEqual(testOutcome, 'custom-return-value', "The final result should be the value returned by the callback.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Math.random should remain unaffected when using the 'pass' option.");

    // --- Test Block 12: Legacy third argument for callback ---
    // Test the older convention where a callback could be provided as the third argument.
    testOutcome = Math.seedrandom('legacy-seed', {
        global: 50
      },
      function(prngFunc, currentSeed, globalContext) {
        verifier.strictEqual(typeof prngFunc, 'function', "Legacy callback arg #1 must be a function.");
        verifier.strictEqual(currentSeed, 'legacy-seed', "Legacy callback arg #2 must match the provided seed.");
        verifier.strictEqual(globalContext, 50, "Legacy callback arg #3 must match the global context value.");
        verifier.strictEqual(prngFunc(), 0.9282578795792454, "PRNG in legacy callback ('hello.'#1) is incorrect.");
        return 'another-custom-string';
      });
    verifier.strictEqual(testOutcome, 'another-custom-string', "Result from the legacy callback is incorrect.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Math.random remains unchanged with the legacy callback.");

    // --- Test Block 13: New instance with explicit global:false ---
    // Ensure that creating a new instance with 'global: false' option works as expected.
    instanceSpecificRNG = new Math.seedrandom('specific-instance-seed', {
      global: false
    });
    verifier.strictEqual(typeof instanceSpecificRNG, 'function', "A new instance must return a PRNG function.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Math.random should not change when 'new' is used with 'global:false'.");
    verifier.ok(initialGlobalRNG !== instanceSpecificRNG, "The new instance must be distinct from the global Math.random.");
    generatedValue = instanceSpecificRNG();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "Value from new instance (global:false) is incorrect.");

    // --- Test Block 14: Options object for Math.seedrandom (explicitly empty) ---
    // Test behavior when an empty options object is explicitly provided to Math.seedrandom.
    testOutcome = Math.seedrandom('hello.', {}); // Added an explicit empty options object.
    temporaryRNGRef = Math.random;
    verifier.notStrictEqual(initialGlobalRNG, temporaryRNGRef, "Math.random should change even with an explicit empty options object.");
    verifier.strictEqual(testOutcome, "hello.", "The seed string should be returned as the outcome.");
    generatedValue = Math.random();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "First value with empty options is incorrect.");
    generatedValue = Math.random();
    verifier.strictEqual(generatedValue, 0.3752569768646784, "Second value with empty options is incorrect.");
    Math.random = initialGlobalRNG; // Restore global RNG for subsequent tests.

    // --- Test Block 15: Options object for direct rngFactory call (explicitly empty) ---
    // Test with an empty options object explicitly for the non-Math method.
    localRNG = rngFactory('hello.', {}); // Explicit empty options for factory call.
    verifier.strictEqual(typeof localRNG, 'function', "Factory call with empty options must return a function.");
    generatedValue = localRNG();
    verifier.strictEqual(generatedValue, 0.9282578795792454, "Value from factory (empty options) is incorrect.");
    verifier.strictEqual(initialGlobalRNG, Math.random, "Math.random must not change for a non-global factory call.");
    verifier.ok(initialGlobalRNG !== localRNG, "Factory result must be distinct from the global Math.random.");
  });

  // This test case validates the state API, allowing saving and restoring PRNG states.
  testCase('Verify state persistence and restoration.', function() {
    // Initial check: Confirm that the 'state' method is not present by default.
    var tempGenerator = rngFactory('initial-seed');
    var unforeseenResult = null; // Initialize to null.
    var anticipatedOutcome = 0; // Initialize to 0, will change if error caught.
    try {
      unforeseenResult = tempGenerator.state();
    } catch (err) {
      anticipatedOutcome = 1; // Indicate that an error was successfully caught.
    }
    verifier.strictEqual(unforeseenResult, null, "The 'state' method should not return a value when non-existent.");
    verifier.strictEqual(anticipatedOutcome, 1, "An error was expected when calling a non-existent state method.");

    var propertyCounter = 0;
    for (var prop in tempGenerator) {
      if (tempGenerator.hasOwnProperty(prop)) { // Use hasOwnProperty for robustness.
        propertyCounter++;
      }
    }
    verifier.strictEqual(propertyCounter, 0, "A default generator instance should not have enumerable properties.");

    // Verify that a state method can be explicitly enabled and functions correctly.
    var storableRNG = rngFactory("persistent-seed", {
      state: true
    });
    var standardRNG = rngFactory("persistent-seed");
    var loopIterations = 100; // Using a named variable instead of a magic number.

    for (var iterationIndex = 0; iterationIndex < loopIterations; ++iterationIndex) {
      verifier.strictEqual(standardRNG(), storableRNG(), `Iteration ${iterationIndex}: Generated values must consistently match.`);
    }

    var freshRNG = rngFactory("persistent-seed"); // Create a new generator from the same seed.
    var persistedState = storableRNG.state(); // Capture the current state of the storable RNG.

    // Ensure the saved state is a valid object.
    verifier.ok(typeof persistedState === 'object' && persistedState !== null, "The persisted state must be a non-null object.");

    var clonedRNG = rngFactory("", {
      state: persistedState
    }); // Create a new generator, restoring its state.

    for (var iterationIndex = 0; iterationIndex < loopIterations; ++iterationIndex) {
      var currentRandom = clonedRNG();
      verifier.strictEqual(currentRandom, storableRNG(), `Iteration ${iterationIndex}: Cloned and storable values must match.`);
      verifier.strictEqual(currentRandom, standardRNG(), `Iteration ${iterationIndex}: Cloned and standard values must match.`);
      verifier.notStrictEqual(currentRandom, freshRNG(), `Iteration ${iterationIndex}: Cloned value must diverge from a freshly seeded RNG.`);
    }
  });

  // This test case specifically checks for RequireJS integration within a Node.js environment.
  testCase('Verify RequireJS compatibility in Node.js.', function() {
    var initialRNGContext = Math.random; // Preserve Math.random's state before RequireJS loading.
    var loadedModule = moduleLoader('../seedrandom'); // Load the seedrandom module via RequireJS.
    var localGenerator = loadedModule('requirejs-hello.'); // Utilize the loaded module to create a generator.

    verifier.strictEqual(typeof loadedModule, 'function', "The loaded seedrandom module itself should be a function."); // Added extra assertion.
    verifier.strictEqual(typeof localGenerator, 'function', "The RequireJS loaded module should return a function when invoked.");
    var generatedRValue = localGenerator();
    verifier.strictEqual(generatedRValue, 0.9282578795792454, "RequireJS generated value ('hello.'#1) is not correct.");
    verifier.strictEqual(initialRNGContext, Math.random, "RequireJS module loading must not alter the global Math.random.");
    verifier.ok(initialRNGContext !== localGenerator, "The RequireJS generator must be distinct from the global Math.random.");
  });

  // Marker indicating the conclusion of all test cases within this suite.
  // This comment is a structural element to delineate the end of the test definitions.
});