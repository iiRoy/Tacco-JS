(function() {

  // This utility object provides functions for aggregating data from collections.
  // It replaces the original methods assumed to be on the collection object itself,
  // demonstrating a Type III structural change by centralizing logic.
  const CollectionDataProcessor = {
    /**
     * Identifies the greatest numeric value for a specified attribute across a dataset.
     * @param {Array<Object>} records - The array of objects to process.
     * @param {string} attributeKey - The string key of the numeric attribute to evaluate.
     * @param {number} [initialComparisonValue] - An optional starting point for comparison.
     * @returns {number|null} The highest attribute value, or the initialComparisonValue if higher, or null if no valid numbers are found.
     */
    retrieveHighestAttribute: function(records, attributeKey, initialComparisonValue) {
      // Type III: Added a guard clause for empty or invalid input arrays.
      if (!Array.isArray(records) || records.length === 0) {
        return initialComparisonValue !== undefined ? initialComparisonValue : null;
      }

      // Type II: Renamed variable. Type III: Use -Infinity for robust initial comparison.
      let currentMaximum = initialComparisonValue !== undefined ? initialComparisonValue : -Infinity;
      let foundAnyNumeric = false; // Type III: Flag to track if any numeric values were processed.

      // Type II: Renamed loop variable for clarity.
      for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
        const currentRecord = records[recordIndex]; // Type II: Renamed variable.
        // Type III: Added a check for property existence before accessing.
        if (currentRecord && currentRecord.hasOwnProperty(attributeKey)) {
          const attributeValue = currentRecord[attributeKey];

          // Type III: Explicit type validation for robustness.
          if (typeof attributeValue === 'number' && !isNaN(attributeValue)) {
            if (attributeValue > currentMaximum) {
              currentMaximum = attributeValue;
            }
            foundAnyNumeric = true;
          }
        }
      }
      // Type III: Return null if no numeric values were found and no initial value was provided.
      return foundAnyNumeric ? currentMaximum : (initialComparisonValue !== undefined ? initialComparisonValue : null);
    },

    /**
     * Determines the smallest numeric value for a designated attribute in a collection.
     * @param {Array<Object>} records - The array of objects for analysis.
     * @param {string} attributeKey - The string key of the numeric attribute to examine.
     * @param {number} [initialComparisonValue] - An optional floor value for comparison.
     * @returns {number|null} The lowest attribute value, or the initialComparisonValue if lower, or null if no valid numbers are found.
     */
    retrieveLowestAttribute: function(records, attributeKey, initialComparisonValue) {
      if (!Array.isArray(records) || records.length === 0) {
        return initialComparisonValue !== undefined ? initialComparisonValue : null;
      }

      // Type II: Renamed variable. Type III: Use Infinity for robust initial comparison.
      let currentMinimum = initialComparisonValue !== undefined ? initialComparisonValue : Infinity;
      let numericValuesEncountered = false; // Type III: Flag for tracking numeric data.

      // Type II: Renamed loop variable.
      for (let idx = 0; idx < records.length; idx++) {
        const itemEntry = records[idx]; // Type II: Renamed variable.
        if (itemEntry && itemEntry.hasOwnProperty(attributeKey)) {
          const entryAttributeVal = itemEntry[attributeKey];

          if (typeof entryAttributeVal === 'number' && !isNaN(entryAttributeVal)) {
            if (entryAttributeVal < currentMinimum) {
              currentMinimum = entryAttributeVal;
            }
            numericValuesEncountered = true;
          }
        }
      }
      return numericValuesEncountered ? currentMinimum : (initialComparisonValue !== undefined ? initialComparisonValue : null);
    },

    /**
     * Computes the total sum of a specified numeric attribute across all objects in a collection.
     * Non-numeric values for the attribute are ignored (treated as zero).
     * @param {Array<Object>} records - The array of objects to sum from.
     * @param {string} attributeKey - The string key of the numeric attribute to sum.
     * @returns {number} The aggregated sum, or 0 if no valid numeric attributes are found.
     */
    calculateAttributeTotal: function(records, attributeKey) {
      if (!Array.isArray(records) || records.length === 0) {
        return 0; // Type III: Return 0 for an empty dataset.
      }

      // Type II: Renamed variable.
      let runningSumTotal = 0;

      // Type III: Introduce an intermediate step to filter and map values, enhancing readability.
      const validNumericAttributes = records
        .filter(rec => rec && rec.hasOwnProperty(attributeKey) && typeof rec[attributeKey] === 'number' && !isNaN(rec[attributeKey]))
        .map(rec => rec[attributeKey]);

      // Type II: Renamed loop variable.
      for (let sumIdx = 0; sumIdx < validNumericAttributes.length; sumIdx++) {
        runningSumTotal += validNumericAttributes[sumIdx];
      }
      return runningSumTotal;
    }
  };

  // Declare a collection variable to hold our test data.
  // Type II: Renamed 'array' to 'sampleObjectCollection'.
  // Type III: Changed from global 'var' to 'let' within IIFE scope for better encapsulation.
  let sampleObjectCollection;

  // Define the QUnit test module.
  // Type II: Renamed module name from "EnumerableExt" to "CollectionDataOperationsSuite".
  // Type III: Added a descriptive comment for the module.
  QUnit.module("CollectionDataOperationsSuite: Advanced Property Aggregations", {
    // This function executes before every test case in this module.
    // Type II: Renamed 'setup' to 'initializeTestData', added a descriptive comment.
    initializeTestData: function() {
      // Initialize our collection with diverse objects.
      // Type III: Replaced Ember.A with a standard JavaScript array.
      // Type III: Modified the structure and values of objects, and added more items.
      sampleObjectCollection = [
        { uniqueIdentifier: 'itemA', numericValue: 7, category: 'A' },
        { uniqueIdentifier: 'itemB', numericValue: 17, category: 'B' },
        { uniqueIdentifier: 'itemC', numericValue: 77, category: 'A' },
        { uniqueIdentifier: 'itemD', numericValue: 5, category: 'C' },
        { uniqueIdentifier: 'itemE', numericValue: -10, category: 'B' } // Type III: Added an item with a negative value.
      ];
      // Type III: Added a non-essential log for setup confirmation.
      // console.log("Test data collection prepared for the suite.");
    }
  });

  // Test for finding the maximum property value.
  // Type II: Rewrote the test description for clarity.
  QUnit.test("retrieveHighestAttribute should correctly ascertain the largest numeric attribute in the set", function(assert) {
    // Type III: Introduced a helper constant for the property key.
    const targetAttribute = 'numericValue';
    // Type III: Calling the new utility function with our dataset.
    const highestDeterminedValue = CollectionDataProcessor.retrieveHighestAttribute(sampleObjectCollection, targetAttribute);

    // Type II: Renamed assertion variable. Type III: Updated expected value due to changed data.
    // Original max was 77. The new data still has 77 as max.
    assert.strictEqual(highestDeterminedValue, 77, "The highest 'numericValue' should be 77.");
  });

  // Test for maximum value when an initial comparison value is provided and is higher.
  // Type II: Rewrote the test description.
  QUnit.test("retrieveHighestAttribute should yield the initial comparison value if no attribute is higher", function(assert) {
    const attributeToSearch = 'numericValue'; // Type III: Helper constant.
    const initialFloor = 100; // Type III: Helper constant.
    const outcomeOfHighestSearch = CollectionDataProcessor.retrieveHighestAttribute(sampleObjectCollection, attributeToSearch, initialFloor);

    // Type II: Renamed assertion variable.
    assert.strictEqual(outcomeOfHighestSearch, 100, "The initial value of 100 should be returned as no attribute exceeds it.");
  });

  // Test for finding the minimum property value.
  // Type II: Rewrote the test description.
  QUnit.test("retrieveLowestAttribute should accurately pinpoint the smallest numeric attribute in the set", function(assert) {
    const minAttributeKey = 'numericValue'; // Type III: Helper constant.
    const ascertainedLowestValue = CollectionDataProcessor.retrieveLowestAttribute(sampleObjectCollection, minAttributeKey);

    // Type II: Renamed assertion variable. Type III: Updated expected value due to added data (-10).
    assert.strictEqual(ascertainedLowestValue, -10, "The lowest 'numericValue' should be -10 from the updated dataset.");
  });

  // Test for minimum value when an initial comparison value is provided and is lower.
  // Type II: Rewrote the test description.
  QUnit.test("retrieveLowestAttribute should return the initial comparison value if no attribute is lower", function(assert) {
    const searchAttribute = 'numericValue'; // Type III: Helper constant.
    const initialCeiling = 1; // Type III: Helper constant.
    const finalLowestResult = CollectionDataProcessor.retrieveLowestAttribute(sampleObjectCollection, searchAttribute, initialCeiling);

    // Type II: Renamed assertion variable.
    assert.strictEqual(finalLowestResult, 1, "The initial value of 1 should be returned as no attribute is lower.");
  });

  // Test for calculating the sum of property values.
  // Type II: Rewrote the test description.
  QUnit.test("calculateAttributeTotal should correctly sum all designated numeric attributes", function(assert) {
    const sumAttributeName = 'numericValue'; // Type III: Helper constant.
    // Original sum: 7 + 17 + 77 = 101
    // New sum with {numericValue: 5} and {numericValue: -10} added: 7 + 17 + 77 + 5 + (-10) = 96
    const totalAggregatedNumeric = CollectionDataProcessor.calculateAttributeTotal(sampleObjectCollection, sumAttributeName);

    // Type II: Renamed assertion variable. Type III: Updated expected value due to changed data.
    assert.strictEqual(totalAggregatedNumeric, 96, "The total sum of 'numericValue' should be 96.");
  });

  // Type III: Added a new test case to cover an edge scenario: an empty collection.
  QUnit.test("retrieveHighestAttribute gracefully handles an empty collection", function(assert) {
    const emptyCollection = [];
    const propKey = 'numericValue';
    const defaultValueForEmpty = null; // Type III: Explicitly testing for null.
    const outcomeForEmpty = CollectionDataProcessor.retrieveHighestAttribute(emptyCollection, propKey, defaultValueForEmpty);
    assert.strictEqual(outcomeForEmpty, defaultValueForEmpty, "Should return the default value (null) for an empty collection.");
  });

  // Type III: Added another new test case for a collection containing mixed data types, ensuring robustness.
  QUnit.test("calculateAttributeTotal correctly processes collections with non-numeric or missing attributes", function(assert) {
    const mixedTypeCollection = [
      { dataPoint: 10 },
      { dataPoint: 'invalid_number' }, // Non-numeric string
      { dataPoint: 30 },
      { anotherKey: 50 }, // Missing target attribute
      { dataPoint: null }, // Null value
      { dataPoint: undefined } // Undefined value
    ];
    const attributeForSum = 'dataPoint';
    // Expected: 10 + 30 = 40 (others are ignored)
    const computedTotal = CollectionDataProcessor.calculateAttributeTotal(mixedTypeCollection, attributeForSum);
    assert.strictEqual(computedTotal, 40, "Should sum only valid numeric values for 'dataPoint', ignoring others.");
  });

})(); // End of the Immediately Invoked Function Expression (IIFE)