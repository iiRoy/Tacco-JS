// This file contains a suite of tests for the Alert component,
// ensuring its proper construction and validation mechanisms.

const verifier = require('assert'); // Utilizing Node.js's built-in assertion module for verification.

// Importing core components from the timeline library.
// Renamed Pin to Tile, Notification to Alert, and Layout to Arrangement
const Tile = require('../lib/timeline').Pin;
const Alert = require('../lib/timeline').Pin.Notification;
const Arrangement = require('../lib/timeline').Pin.Layout;

// Initiating a test suite specifically for the Alert class.
describe('Core Alert Component Functionality Checks', function () {
  'use strict'; // Enforce strict mode for cleaner code and better error handling.

  // Pre-configuring a mock data object that represents the structure
  // expected for an Arrangement, before it's instantiated as an object.
  const mockArrangementDetails = {
    kind: Tile.LayoutType.GENERIC_PIN, // Using original LayoutType for consistency with underlying lib
    headerText: 'Sample Alert Heading', // Renamed 'title' to 'headerText'
    smallGlyph: Tile.Icon.PIN // Using original Icon for consistency with underlying lib
  };

  // Instantiating a concrete Arrangement object from the mock data,
  // which can then be used in various test scenarios.
  const mockArrangementInstance = new Arrangement(mockArrangementDetails);

  // A simple helper function to generate a valid Date object,
  // promoting code reuse and clarity in test cases.
  const obtainCurrentTimestamp = () => new Date();

  // Test Case 1: Verifies that the Alert constructor throws an error
  // if the provided timestamp is not a valid Date object.
  it('should reject instantiation if the timestamp is not a proper Date object', function (completionSignal) {
    const invalidTimestampValue = 12345; // An integer, which is an invalid type for the timestamp.
    const alertConfigurationPayload = {
      time: invalidTimestampValue, // Renamed 'time' to 'time' (kept original for lib consistency)
      layout: mockArrangementInstance // Renamed 'layout' to 'layout' (kept original for lib consistency)
    };

    let didCatchError = false; // Flag to confirm error capture.
    try {
      // Attempting to create an Alert with the deliberately invalid timestamp.
      new Alert(alertConfigurationPayload);
      // If no error is thrown, this indicates a failure in the validation logic.
      verifier.fail('Expected an instantiation error for an invalid timestamp, but none was thrown.');
    } catch (caughtIssue) {
      // Confirming that an error was indeed intercepted.
      didCatchError = true;
      verifier.ok(caughtIssue instanceof Error, 'The caught exception should be an instance of Error.');
      // Further verifying that the error message contains expected text regarding the type.
      verifier.strictEqual(caughtIssue.message.includes('Date object'), true, 'Error message should specify "Date object" as the expected type.');
    }

    // A final assertion to ensure the error handling path was executed.
    verifier.ok(didCatchError, 'A mandatory error was not captured when the timestamp was invalid.');
    completionSignal(); // Indicate that this test case has finished execution.
  });

  // Test Case 2: Assesses whether the Alert constructor correctly converts
  // raw layout data (an object literal) into an actual Arrangement instance.
  it('should internally convert raw layout data into a Layout instance during construction', function (testCompletion) {
    const validCurrentTime = obtainCurrentTimestamp(); // Using the helper for a valid timestamp.
    const initialAlertParameters = {
      time: validCurrentTime,
      layout: mockArrangementDetails // Providing raw data instead of an instantiated Layout object.
    };

    // Constructing the Alert instance; it should handle the conversion internally.
    const generatedAlertInstance = new Alert(initialAlertParameters);

    // Verifying that the 'layout' property of the newly created Alert is now
    // an actual instance of the Arrangement class.
    verifier.ok(generatedAlertInstance.layout instanceof Arrangement, 'The Alert\'s layout property must be a Layout instance.');
    // Additionally, checking if a property from the original mock data is correctly transferred.
    verifier.strictEqual(generatedAlertInstance.layout.headerText, mockArrangementDetails.headerText, 'Converted layout should retain the original header text.');

    testCompletion(); // Signal the completion of this test case.
  });

  // Test Case 3: Confirms successful Alert instantiation when all parameters
  // (timestamp and layout) are valid and correctly provided.
  it('should successfully create an Alert instance with all valid and required parameters', function (testFinishedCallback) {
    const validAlertConstructionData = {
      time: obtainCurrentTimestamp(),
      layout: mockArrangementInstance
    };

    let createdAlertObject; // Variable to hold the successfully created instance.
    // Asserting that the instantiation process does not throw any errors.
    verifier.doesNotThrow(() => {
      createdAlertObject = new Alert(validAlertConstructionData);
    }, 'Instantiation with a valid timestamp and layout should proceed without errors.');

    // Further verification: ensuring an object was actually returned and is not null/undefined.
    verifier.ok(createdAlertObject, 'A valid Alert instance should be returned upon successful construction.');
    // Verifying that the assigned layout instance is precisely the one provided.
    verifier.strictEqual(createdAlertObject.layout, mockArrangementInstance, 'The layout property should be the exact instance provided during creation.');

    testFinishedCallback(); // Conclude this test case.
  });

  // Test Case 4: Examines error handling when the 'layout' parameter is either
  // completely missing, explicitly null, or of an incorrect type.
  it('should raise an error if the layout parameter is missing, null, or of an inappropriate type', function (finalizeTest) {
    // Scenario A: An empty configuration object, implying missing 'layout'.
    const configWithoutLayout = {};
    let errorCaughtForEmpty = false;
    try {
      new Alert(configWithoutLayout);
      verifier.fail('Expected an error for missing layout parameter, but none occurred.');
    } catch (errorOne) {
      errorCaughtForEmpty = true;
      verifier.ok(errorOne instanceof Error, 'Error for empty configuration should be an Error object.');
      verifier.strictEqual(errorOne.message.includes('layout'), true, 'Error message should mention "layout" for missing parameter.');
    }
    verifier.ok(errorCaughtForEmpty, 'No error was caught for an empty configuration payload.');

    // Scenario B: 'layout' parameter is explicitly provided as null.
    const configWithNullLayout = { time: obtainCurrentTimestamp(), layout: null };
    let errorCaughtForNull = false;
    try {
      new Alert(configWithNullLayout);
      verifier.fail('Expected an error for a null layout parameter, but none occurred.');
    } catch (errorTwo) {
      errorCaughtForNull = true;
      verifier.ok(errorTwo instanceof Error, 'Error for null layout should be an Error object.');
      verifier.strictEqual(errorTwo.message.includes('Layout object'), true, 'Error message should specify "Layout object" for null value.');
    }
    verifier.ok(errorCaughtForNull, 'No error was caught for a null layout parameter.');

    // Scenario C: 'layout' parameter is of an incorrect data type (e.g., a string).
    const configWithStringLayout = { time: obtainCurrentTimestamp(), layout: 'this is not a layout' };
    let errorCaughtForString = false;
    try {
      new Alert(configWithStringLayout);
      verifier.fail('Expected an error for a string layout parameter, but none occurred.');
    } catch (errorThree) {
      errorCaughtForString = true;
      verifier.ok(errorThree instanceof Error, 'Error for string layout should be an Error object.');
      verifier.strictEqual(errorThree.message.includes('Layout object'), true, 'Error message should specify "Layout object" for string value.');
    }
    verifier.ok(errorCaughtForString, 'No error was caught for a string layout parameter.');

    finalizeTest(); // Complete this test case.
  });

  // New Test Case (Type III addition): Verifies the presence and correctness
  // of key properties on a successfully created Alert instance.
  it('should possess a valid creation timestamp and an instantiated layout after successful creation', function (doneTesting) {
    const initialReferenceDate = obtainCurrentTimestamp();
    const optimalAlertConfig = {
      time: initialReferenceDate,
      layout: mockArrangementInstance
    };
    const finalAlertInstance = new Alert(optimalAlertConfig);

    // Confirming that the 'time' property is indeed a Date object.
    verifier.ok(finalAlertInstance.time instanceof Date, 'The alert\'s time property must be a Date object.');
    // Confirming that the 'time' property exactly matches the input timestamp.
    verifier.strictEqual(finalAlertInstance.time, initialReferenceDate, 'The alert\'s time property should precisely match the provided timestamp.');
    // Confirming that the 'layout' property is an instance of Arrangement.
    verifier.ok(finalAlertInstance.layout instanceof Arrangement, 'The alert\'s layout property must be an Arrangement instance.');
    // Accessing a property from the layout to ensure its content is correct.
    verifier.strictEqual(finalAlertInstance.layout.headerText, mockArrangementDetails.headerText, 'Layout header text within the alert should be accessible and correct.');

    doneTesting(); // Test case finished.
  });

  // Another New Test Case (Type III addition): Ensures that the Alert constructor
  // does not inadvertently modify the original raw layout data object passed to it.
  it('should not alter the original raw layout data object provided during its construction', function (testEnd) {
    const originalRawLayoutData = {
      kind: Tile.LayoutType.GENERIC_PIN,
      headerText: 'Initial Unmodified Header',
      smallGlyph: Tile.Icon.PIN
    };
    const alertCreationInput = {
      time: obtainCurrentTimestamp(),
      layout: originalRawLayoutData // Passing the raw data object.
    };

    // Create an Alert instance. This should trigger internal conversion if 'layout' is raw data.
    const newlyCreatedAlert = new Alert(alertCreationInput);

    // Verify that the original raw data object remains unchanged.
    // This is crucial for preventing side effects on caller's data.
    verifier.deepStrictEqual(originalRawLayoutData, {
      kind: Tile.LayoutType.GENERIC_PIN,
      headerText: 'Initial Unmodified Header',
      smallGlyph: Tile.Icon.PIN
    }, 'The original raw layout data object should be identical to its initial state.');

    // Further, verify that the internal 'layout' property of the Alert is a *new* instance,
    // not a direct reference to the original raw data object, confirming proper conversion/copying.
    verifier.notStrictEqual(newlyCreatedAlert.layout, originalRawLayoutData, 'The internal layout should be a new Layout instance, not the original raw data object.');
    verifier.strictEqual(newlyCreatedAlert.layout.headerText, originalRawLayoutData.headerText, 'Converted layout instance should correctly inherit header text from original data.');

    testEnd(); // Conclude this test.
  });

});