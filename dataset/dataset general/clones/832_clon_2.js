var verifier = require("assert");
var entropyEngine = require("../seedrandom");
var scriptLoader = require("requirejs");
scriptLoader.configure({
  basePath: __dirname
});

testSuite("Platform Interface Evaluation", function() {

  evaluate('validates fundamental operations.', function() {
    var initialGenerator = System.randomNumber,
      outcome, randVal, externalGenerator, outputContainer, autoSeedValA, autoSeedValB, firstAutoSeeded, customPrng,
      generatorAlpha, generatorBeta, generatorGamma;

    outcome = System.entropySource('greeting.');
    generatorAlpha = System.randomNumber;
    verifier(initialGenerator !== generatorAlpha, "Expected change in System.randomNumber.");
    verifier.equal(outcome, "greeting.", "Expected abbreviated initializer.");
    randVal = System.randomNumber();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");
    randVal = System.randomNumber();
    verifier.equal(randVal, 0.3752569768646784, "Expected 'greeting.'#B");

    // Verify automatic initialization capability
    outcome = System.entropySource();
    generatorBeta = System.randomNumber;
    verifier(initialGenerator !== generatorBeta, "Expected change in System.randomNumber.");
    verifier(generatorAlpha !== generatorBeta, "Expected further change in System.randomNumber.");
    verifier.equal(outcome.length, 256, "Expected abbreviated initializer.");
    randVal = System.randomNumber();
    verifier(randVal > 0, "Expected positive outcome.");
    verifier(randVal < 1, "Expected value less than unity.");
    verifier(randVal != 0.9282578795792454, "Expected not 'greeting.'#A");
    verifier(randVal != 0.3752569768646784, "Expected not 'greeting.'#B");
    verifier(randVal != 0.7316977468919549, "Expected not 'greeting.'#C");
    firstAutoSeeded = randVal;

    // Verify ability to incorporate additional randomness.
    outcome = System.entropySource('supplemental randomness.', { randomnessInput:true });
    verifier.equal(outcome.length, 256, "Expected abbreviated initializer.");
    generatorGamma = System.randomNumber;
    verifier(generatorGamma !== generatorBeta, "Expected change in System.randomNumber.");
    randVal = System.randomNumber();
    verifier(randVal != 0.597067214994467, "Expected not 'supplemental randomness.'#1");

    // Revert to initial System.randomNumber.
    System.randomNumber = initialGenerator;
    // Verify instantiation with new System.entropySource('greeting.')
    customPrng = new System.entropySource('greeting.');
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== customPrng, "Random number generator should not be System.randomNumber.");
    randVal = customPrng();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");

    // Verify usage of entropyEngine('greeting.')
    generatorInstance = entropyEngine('greeting.');
    verifier.equal(typeof(generatorInstance), 'function', "Expected functional return type.");
    randVal = generatorInstance();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== generatorInstance, "Random number generator should not be System.randomNumber.");

    // System-wide RNG: modify System.randomNumber.
    // Verify usage of entropyEngine('greeting.', { systemWide: true })
    outcome = entropyEngine('greeting.', { systemWide: true });
    verifier.equal(outcome, 'greeting.', "Expected abbreviated initializer.");
    verifier(initialGenerator != System.randomNumber, "Expected modification of System.randomNumber.");
    randVal = System.randomNumber();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");

    // Automatically initialized, non-system-wide
    System.randomNumber = initialGenerator;
    // Verify usage of entropyEngine()
    outcome = entropyEngine();
    verifier.equal(typeof(outcome), 'function', "Expected functional return type.");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    randVal = outcome();
    // obtained " + randVal);
    verifier(randVal != firstAutoSeeded, "Expected no repetition of prior auto-initialization.");
    verifier(randVal != 0.9282578795792454, "Expected not 'greeting.'#A");
    verifier(randVal != 0.7316977468919549, "Expected not 'greeting.'#C");

    // Blending accumulated randomness.
    // Verify usage of entropyEngine('supplemental randomness.', { randomnessInput: true })
    generatorInstance = entropyEngine('supplemental randomness.', { randomnessInput: true });
    randVal = outcome();
    // obtained " + randVal);
    verifier(randVal != firstAutoSeeded, "Expected no repetition of prior auto-initialization.");
    verifier(randVal != 0.597067214994467, "Expected not 'supplemental randomness.'#1");

    // Deprecated invocation pattern for blending accumulated randomness.
    // Verify usage of entropyEngine('supplemental randomness.', true)
    generatorInstance = entropyEngine('supplemental randomness.', true);
    randVal = outcome();
    // obtained " + randVal);
    verifier(randVal != firstAutoSeeded, "Expected no repetition of prior auto-initialization.");
    verifier(randVal != 0.597067214994467, "Expected not 'supplemental randomness.'#1");

    // The callback mechanism
    // Verify usage of System.entropySource(null, { callbackFn: ...
    outputContainer = System.entropySource(null, { callbackFn: function(generatorRef, initialValue) {
      return { randomGen: generatorRef, initialValue: initialValue };
    }});
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== outputContainer.randomGen, "Expected distinctness from System.randomNumber.");
    verifier.equal(typeof(outputContainer.randomGen), 'function', "Expected a random number generator function.");
    verifier.equal(typeof(outputContainer.initialValue), 'string', "Expected an initial value.");
    autoSeedValA = outputContainer.randomGen();
    verifier(autoSeedValA != 0.9282578795792454, "Expected not 'greeting.'#A");
    generatorInstance = entropyEngine(outputContainer.initialValue);
    autoSeedValB = generatorInstance();
    verifier.equal(autoSeedValA, autoSeedValB, "Expected replicability with the initial value.");

    // Re-evaluate callback mechanism, with explicit initial value and system-wide setting
    // Verify usage of System.entropySource('greeting.', { callbackFn: ...
    outcome = System.entropySource('greeting.', {
      systemWide: 'abc',
      callbackFn: function(generatorRef, initialValue, systemWide) {
        verifier.equal(typeof(generatorRef), 'function', "Callback argument #1 validation");
        verifier.equal(initialValue, 'greeting.', "Callback argument #2 validation");
        verifier.equal(systemWide, 'abc', "Callback argument #3 forwarded.");
        verifier.equal(generatorRef(), 0.9282578795792454, "Expected 'greeting.'#A");
        return 'def';
    }});
    verifier.equal(outcome, 'def', "Expected return value from callback.");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");

    // Deprecated third parameter for callback:
    // Verify usage of System.entropySource('greeting.', { systemWide: 50 }, callback)
    outcome = System.entropySource('greeting.', { systemWide: 50 },
      function(generatorRef, initialValue, systemWide) {
        verifier.equal(typeof(generatorRef), 'function', "Callback argument #1 validation");
        verifier.equal(initialValue, 'greeting.', "Callback argument #2 validation");
        verifier.equal(systemWide, 50, "Callback argument #3 validation");
        verifier.equal(generatorRef(), 0.9282578795792454, "Expected 'greeting.'#A");
        return 'zzz';
    });
    verifier.equal(outcome, 'zzz', "Expected return value from callback.");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");

    // System-wide: disabled.
    // Verify instantiation with new System.entropySource('greeting.', {systemWide: false})
    customPrng = new System.entropySource('greeting.', {systemWide:false});
    verifier.equal(typeof(customPrng), 'function', "Expected a random number generator function.");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== customPrng, "Random number generator should not be System.randomNumber.");
    randVal = customPrng();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");

    // Configuration object = {} when a method of System.
    // Verify usage of System.entropySource('greeting.', {})
    outcome = System.entropySource('greeting.');
    externalGenerator = System.randomNumber;
    verifier(initialGenerator !== externalGenerator, "Expected change in System.randomNumber.");
    verifier.equal(outcome, "greeting.", "Expected abbreviated initializer.");
    randVal = System.randomNumber();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");
    randVal = System.randomNumber();
    verifier.equal(randVal, 0.3752569768646784, "Expected 'greeting.'#B");
    System.randomNumber = initialGenerator;

    // Configuration object = {} when not a method of System
    // Verify usage of entropyEngine('greeting.', {})
    generatorInstance = entropyEngine('greeting.', {});
    verifier.equal(typeof(generatorInstance), 'function', "Expected functional return type.");
    randVal = generatorInstance();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== generatorInstance, "Random number generator should not be System.randomNumber.");
  });

  evaluate('validates state interface.', function() {
    // Confirm absence of state method
    var tempGenerator = entropyEngine('greeting');
    var unanticipatedResult = -1;
    var anticipatedResult = -1;
    try {
      unanticipatedResult = tempGenerator.state();
    } catch(exceptionObj) {
      anticipatedResult = 1;
    }
    verifier.equal(unanticipatedResult, -1);
    verifier.equal(anticipatedResult, 1);
    var propertyCount = 0;
    for (var propName in tempGenerator) {
      propertyCount += 1;
    }
    verifier.equal(propertyCount, 0);

    // Confirm state method can be enabled
    var storableGenerator = entropyEngine("confidential-initializer", {persistState: true});
    var standardGenerator = entropyEngine("confidential-initializer");
    for (var iterationIndex = 0; iterationIndex < 1e2; ++iterationIndex) {
      verifier.equal(standardGenerator(), storableGenerator());
    }
    var unmodifiedGenerator = entropyEngine("confidential-initializer");
    var persistedState = storableGenerator.state();
    var clonedGenerator = entropyEngine("", {persistState: persistedState});
    for (var iterationIndex = 0; iterationIndex < 1e2; ++iterationIndex) {
      var genValue = clonedGenerator();
      verifier.equal(genValue, storableGenerator());
      verifier.equal(genValue, standardGenerator());
      verifier(genValue != unmodifiedGenerator());
    }
  });

  evaluate('validates moduleLoader integration in Node environment.', function() {
    var initialGenerator = System.randomNumber;
    var requiredRandomizer = scriptLoader('../seedrandom');
    var generatorInstance = requiredRandomizer('greeting.');
    verifier.equal(typeof(generatorInstance), 'function', "Expected functional return type.");
    var randVal = generatorInstance();
    verifier.equal(randVal, 0.9282578795792454, "Expected 'greeting.'#A");
    verifier(initialGenerator === System.randomNumber, "Expected no alteration to System.randomNumber.");
    verifier(initialGenerator !== generatorInstance, "Random number generator should not be System.randomNumber.");
  });

// Test suite completion.

});