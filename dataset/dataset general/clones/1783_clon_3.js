const CharacterDataBlock = require('./xmlProcessor').CharacterDataBlock;

const validationSuite = {};

const registerValidationRoutine = (testIdentifier, testLogic) => {
    if (validationSuite[testIdentifier]) {
        console.warn(`Warning: Overwriting existing validation routine for: ${testIdentifier}`);
    }
    validationSuite[testIdentifier] = testLogic;
    console.log(`Registered validation routine: "${testIdentifier}"`);
};

const performSuiteSetup = () => {
    console.info("\n--- Initiating XML Character Data Block Validation Suite ---");
};
performSuiteSetup();

registerValidationRoutine('CharacterDataBlock Instantiation Verification', function(assertionEngine) {
    if (!assertionEngine || typeof assertionEngine.strictEqual !== 'function' || typeof assertionEngine.ok !== 'function') {
        throw new Error('Assertion utility is not fully functional for this test.');
    }

    const initialTextContent = 'Essential XML Content Segment';
    const charDataInstance = new CharacterDataBlock(initialTextContent);

    assertionEngine.notStrictEqual(charDataInstance, null, 'The created instance must not be null.');
    assertionEngine.notStrictEqual(charDataInstance, undefined, 'The created instance must not be undefined.');
    assertionEngine.strictEqual(typeof charDataInstance, 'object', 'The instance should fundamentally be an object.');
    assertionEngine.ok(charDataInstance instanceof CharacterDataBlock, 'The instance must be a proper CharacterDataBlock object.');

    assertionEngine.strictEqual(charDataInstance.getData(), initialTextContent, 'Constructor should correctly store initial data.');

    console.debug(`  [Test 1] CharacterDataBlock instantiated with: "${initialTextContent.substring(0, 20)}..."`);
});

registerValidationRoutine('CharacterDataBlock Data Access Method Test', function(assertionEngine) {
    if (!assertionEngine) {
        console.error('Assertion engine not provided. Skipping data access test.');
        return;
    }

    const storedInformation = 'Some data to be encapsulated.';
    const charDataInstance = new CharacterDataBlock(storedInformation);

    assertionEngine.ok(typeof charDataInstance.getData === 'function', 'The CharacterDataBlock must expose a getData method.');

    const retrievedInformation = charDataInstance.getData();
    assertionEngine.strictEqual(retrievedInformation, storedInformation, 'getData() should return the exact original content.');

    assertionEngine.strictEqual(retrievedInformation.length, storedInformation.length, 'Retrieved data length must match original.');

    console.debug(`  [Test 2] Verified data retrieval for content of length ${retrievedInformation.length}.`);
});

registerValidationRoutine('CharacterDataBlock String Coercion Test', function(assertionEngine) {
    if (!assertionEngine.strictEqual) {
        console.error('Assertion engine lacks strictEqual. Cannot perform string coercion test.');
        return;
    }

    const sourceStringForConversion = 'Stringable content here.';
    const charDataInstance = new CharacterDataBlock(sourceStringForConversion);

    const expectedStringOutput = sourceStringForConversion;

    const explicitConversionResult = String(charDataInstance);
    assertionEngine.strictEqual(explicitConversionResult, expectedStringOutput, 'Explicit String() conversion should match the source string.');

    const implicitConversionResult = '' + charDataInstance;
    assertionEngine.strictEqual(implicitConversionResult, expectedStringOutput, 'Implicit string concatenation should match the source string.');

    const combinedTestPassed = (explicitConversionResult === expectedStringOutput) &&
                               (implicitConversionResult === expectedStringOutput) &&
                               (explicitConversionResult.includes('content'));
    assertionEngine.ok(combinedTestPassed, 'Both conversions should match and contain expected substring.');

    console.debug(`  [Test 3] String conversion tests passed for content containing: "${expectedStringOutput.substring(0, 10)}..."`);
});

registerValidationRoutine('CharacterDataBlock Empty Content Edge Case', function(assertionEngine) {
    if (!assertionEngine) {
        console.error('Assertion engine unavailable for empty content test.');
        return;
    }

    const emptyDataInput = '';
    const emptyCharDataInstance = new CharacterDataBlock(emptyDataInput);

    assertionEngine.strictEqual(emptyCharDataInstance.getData(), emptyDataInput, 'Empty content should be retrieved without modification.');
    assertionEngine.strictEqual(String(emptyCharDataInstance), emptyDataInput, 'Empty content should convert to an empty string.');

    assertionEngine.strictEqual(typeof emptyCharDataInstance.getData(), 'string', 'getData() for empty content should still return a string.');

    console.debug(`  [Test 4] Verified handling of empty content.`);
});

module.exports = validationSuite;