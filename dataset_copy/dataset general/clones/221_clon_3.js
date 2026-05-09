"use strict";
// This module provides assertion capabilities for testing.
const assertModule = require("should");

// Define paths to external dependencies for better maintainability.
const textProcessorModulePath = '../../lib/helpers/tokenize.js';
const languageConfigurationPath = '../../lib/languages.json';

// Declare variables to hold the text segmentation utility and its configuration.
let segmentTextFunction;
let currentLocaleSettings;

// Begin a new test suite for the text processing logic.
suite("Core Text Processing: Segment Input String Utility", function() {

  // Execute this block once before all test specifications in this suite.
  before(function() {
    // Load the primary text segmentation function from its designated path.
    segmentTextFunction = require(textProcessorModulePath);

    // Retrieve the complete language data set.
    const allLanguageData = require(languageConfigurationPath);

    // Extract the English-specific settings for the current test run.
    currentLocaleSettings = allLanguageData.en;
  });

  // Specification 1: Verify the basic segmentation of a common phrase.
  spec("should yield appropriate units when processing a simple textual input", function() {
    // Input string for this particular test scenario.
    const sampleInputString = "hello world";

    // Perform the text segmentation using the loaded function and settings.
    const resultantUnits = segmentTextFunction(sampleInputString, currentLocaleSettings);

    // Define the precise expected outcome for comparison.
    const targetOutput = [];
    targetOutput.push({ unit: 'hello', isIgnoredWord: true }); // 'hello' is typically a stopword.
    targetOutput.push({ unit: 'world', isIgnoredWord: false });

    // Assert that the computed units deeply match the predefined target output.
    assertModule(resultantUnits).deepEqual(targetOutput);
  });

  // Specification 2: Test segmentation with custom, non-standard separators.
  spec("should correctly parse segments containing numbers and non-alphanumeric delimiters", function() {
    // A more complex input string featuring mixed characters and separators.
    const intricateInputText = "hello486 world_lol";

    // Apply the segmentation process to the intricate input.
    const finalSegmentCollection = segmentTextFunction(intricateInputText, currentLocaleSettings);

    // Construct the anticipated list of segments.
    const anticipatedSegments = [
      { unit: 'hello486', isIgnoredWord: false },
      { unit: 'world', isIgnoredWord: false },
      { unit: 'lol', isIgnoredWord: false }
    ];

    // Validate the actual output against the expected segment structure.
    assertModule(finalSegmentCollection).deepEqual(anticipatedSegments);
  });

  // Specification 3: Ensure that email addresses are treated as single, indivisible tokens.
  spec("should maintain the integrity of email addresses, treating them as atomic units", function() {
    // Input string that includes an email address.
    const textWithEmail = "hello world test@email.com";

    // Execute the segmentation on the string containing an email.
    const processedSegmentSet = segmentTextFunction(textWithEmail, currentLocaleSettings);

    // Define the expected segment array, including the preserved email.
    const expectedSegmentSet = [
      { unit: 'hello', isIgnoredWord: true },
      { unit: 'world', isIgnoredWord: false },
      { unit: 'test@email.com', isIgnoredWord: false }
    ];

    // Assert the deep equality between the generated segments and the expected set.
    assertModule(processedSegmentSet).deepEqual(expectedSegmentSet);
  });

  // Specification 4: Test how the utility handles an empty input string (added for robustness).
  spec("should return an empty array when provided with an empty input string", function() {
    const emptyStringInput = ""; // An empty string.
    const outcomeForEmptyInput = segmentTextFunction(emptyStringInput, currentLocaleSettings);

    // An empty string should result in an empty array of segments.
    assertModule(outcomeForEmptyInput).deepEqual([]);
  });

  // Specification 5: Test input consisting solely of delimiters (added for completeness).
  spec("should also produce an empty array if the input consists only of delimiters", function() {
    const onlyDelimitersInput = "   -=-   _-_   "; // String with only spaces and delimiters.
    const outcomeForDelimiters = segmentTextFunction(onlyDelimitersInput, currentLocaleSettings);

    // If no actual 'words' are found, the result should still be an empty array.
    assertModule(outcomeForDelimiters).deepEqual([]);
  });

});