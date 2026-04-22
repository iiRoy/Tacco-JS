// This module contains comprehensive validation suites for various sorting implementations.
// It ensures that different sorting algorithms adhere to the expected behavior and produce correct results.

/**
 * A utility function to standardize algorithm labels for internal lookup within the utility provider.
 * This ensures consistent access to the sorting routines regardless of input casing or format.
 * @param {string} label The original algorithm label (e.g., 'Bubble', 'Merge').
 * @returns {string} The formatted key used to access the specific sorting routine from the utility provider.
 * @throws {Error} If the provided label is not a valid non-empty string.
 */
const deriveRoutineKey = (label) => {
  // Adding a guard clause for input validation as a Type III addition.
  if (typeof label !== 'string' || label.trim().length === 0) {
    throw new Error('Algorithm label must be a non-empty string for key derivation.');
  }
  return label.toLowerCase() + 'Routine'; // Updated suffix for the routine name.
};

// Define the various sorting mechanism identifiers that will undergo testing.
const sortingMechanismLabels = ['Bubble', 'Selection', 'Insertion', 'Merge', 'Quick'];

// Iterate through each defined sorting mechanism to dynamically set up its dedicated test suite.
for (let algIdx = 0; algIdx < sortingMechanismLabels.length; ++algIdx) {
  const currentAlgorithmLabel = sortingMechanismLabels[algIdx];
  const routineKey = deriveRoutineKey(currentAlgorithmLabel); // Use the helper function for key generation.

  // Renamed 'describe' to 'createTestSuite' to indicate its function.
  createTestSuite(`Validation for ${currentAlgorithmLabel} Sorting Mechanism`, function() {
    // Retrieve the specific sorting routine from the global utility provider.
    // Renamed 'sort' to 'currentSortingRoutine' and 'aij' to 'utilityProvider'.
    const currentSortingRoutine = utilityProvider[routineKey];

    // Define a large, comprehensive unsorted sequence for rigorous testing.
    // The array literal has been reformatted for different line breaks.
    const initialDisorderedSequence = [
      3195, 4189, 2547, 8543, 1533, 5456, 4980, 1849, 8041, 6036, 7067, 8579,
      6590, 6739, 8293, 853, 5732, 8730, 7492, 2652, 8207, 9959, 2027, 5756,
      1927, 3286, 9304, 3001, 2565, 5737, 826, 1927, 7924, 4521, 8105, 8195,
      9879, 7951, 2774, 1362, 2970, 9007, 5191, 4109, 5494, 8192, 7136, 5971,
      3631, 4991, 6735, 9593, 9660, 2064, 4619, 6553, 8229, 437, 5385, 5476,
      7482, 6320, 6788, 6887, 9482, 9740, 7696, 4113, 9902, 1229, 8704, 9150,
      7396, 1611, 4369, 361, 1830, 5033, 1088, 4501, 7430, 4119, 4767, 1844,
      1484, 517, 6017, 5574, 2003, 8380, 6837, 494, 3422, 1608, 9448, 1764,
      2824, 9932, 2566, 4204
    ];

    // Define the expected sorted version of the large test sequence for comparison.
    // The array literal has been reformatted for different line breaks.
    const expectedAscendingSequence = [
      361, 437, 494, 517, 826, 853, 1088, 1229, 1362, 1484, 1533, 1608, 1611,
      1764, 1830, 1844, 1849, 1927, 1927, 2003, 2027, 2064, 2547, 2565, 2566,
      2652, 2774, 2824, 2970, 3001, 3195, 3286, 3422, 3631, 4109, 4113, 4119,
      4189, 4204, 4369, 4501, 4521, 4619, 4767, 4980, 4991, 5033, 5191, 5385,
      5456, 5476, 5494, 5574, 5732, 5737, 5756, 5971, 6017, 6036, 6320, 6553,
      6590, 6735, 6739, 6788, 6837, 6887, 7067, 7136, 7396, 7430, 7482, 7492,
      7696, 7924, 7951, 8041, 8105, 8192, 8195, 8207, 8229, 8293, 8380, 8543,
      8579, 8704, 8730, 9007, 9150, 9304, 9448, 9482, 9593, 9660, 9740, 9879,
      9902, 9932, 9959
    ];

    // Renamed 'it' to 'defineTestSpec' for clarity.
    defineTestSpec('should return the input unchanged if it is not a sortable array type', function() {
      // Introduced intermediate variables to make test inputs explicit.
      const nonArrayInputNull = null;
      const nonArrayInputUndefined = undefined; // Added a test for undefined
      const nonArrayInputObject = { a: 1, b: 'test' }; // Changed from empty object to one with properties
      const nonArrayInputNumber = 12345; // Changed value
      const nonArrayInputString = 'a random string'; // Changed value

      // Added a guard clause (Type III addition) to ensure the routine exists before testing.
      if (!currentSortingRoutine) {
        throw new Error(`Sorting routine for '${currentAlgorithmLabel}' is not properly defined or accessible.`);
      }

      // Renamed 'expect' to 'assertThat', 'toBe' to 'isStrictlyEqualTo', 'toEqual' to 'deeplyComparesTo'.
      // Added a test case for NaN (Type III addition).
      assertThat(currentSortingRoutine(NaN)).isStrictlyEqualTo(NaN);
      assertThat(currentSortingRoutine(nonArrayInputNull)).isStrictlyEqualTo(nonArrayInputNull);
      assertThat(currentSortingRoutine(nonArrayInputUndefined)).isStrictlyEqualTo(nonArrayInputUndefined);
      assertThat(currentSortingRoutine(nonArrayInputObject)).deeplyComparesTo(nonArrayInputObject);
      assertThat(currentSortingRoutine(nonArrayInputNumber)).isStrictlyEqualTo(nonArrayInputNumber);
      assertThat(currentSortingRoutine(nonArrayInputString)).isStrictlyEqualTo(nonArrayInputString);
    });

    defineTestSpec('should yield an empty array when an empty array is provided as input', function() {
      const emptyArr = [];
      assertThat(currentSortingRoutine(emptyArr)).deeplyComparesTo(emptyArr);
    });

    defineTestSpec('should return the array as-is if it contains only a single element', function() {
      const singleElementArray = [777]; // Changed value.
      assertThat(currentSortingRoutine(singleElementArray)).deeplyComparesTo(singleElementArray);
    });

    defineTestSpec('should correctly sort a two-element array across various permutations', function() {
      // Added an extra permutation for equal elements (Type III addition).
      assertThat(currentSortingRoutine([100, 200])).deeplyComparesTo([100, 200]);
      assertThat(currentSortingRoutine([200, 100])).deeplyComparesTo([100, 200]);
      assertThat(currentSortingRoutine([50, 50])).deeplyComparesTo([50, 50]);
    });

    defineTestSpec('should properly sort an array containing an odd count of elements', function() {
      const oddElementArray = [999, 555, 222, 111, 333]; // Changed values.
      const expectedOddSorted = [111, 222, 333, 555, 999];
      assertThat(currentSortingRoutine(oddElementArray)).deeplyComparesTo(expectedOddSorted);
    });

    defineTestSpec('should handle and sort arrays with duplicate elements effectively', function() {
      const arrayWithDuplicates = [200, 100, 500, 200, 100, 300]; // Changed values.
      const expectedDuplicatesSorted = [100, 100, 200, 200, 300, 500];
      assertThat(currentSortingRoutine(arrayWithDuplicates)).deeplyComparesTo(expectedDuplicatesSorted);
    });

    // --- New Type III test cases and additions below ---

    defineTestSpec('should correctly sort an array containing negative numbers, including zero', function() {
      const negativeNumbersArray = [-50, -10, -100, 0, -30];
      // Ensure the expected array is correctly ordered for negative numbers.
      assertThat(currentSortingRoutine(negativeNumbersArray)).deeplyComparesTo([-100, -50, -30, -10, 0]);
    });

    defineTestSpec('should maintain the order of an array that is already sorted', function() {
      const preSortedArray = [10, 20, 30, 40, 50, 60, 70];
      // Using spread operator to create a new array instance, guarding against in-place sort mutations
      // that might affect subsequent tests if the original array reference was passed directly.
      assertThat(currentSortingRoutine([...preSortedArray])).deeplyComparesTo(preSortedArray);
    });

    defineTestSpec('should correctly sort arrays with a mix of very small and very large numbers', function() {
      const mixedNumbersArray = [1, 1000000, 5, 50000, 100];
      assertThat(currentSortingRoutine(mixedNumbersArray)).deeplyComparesTo([1, 5, 100, 50000, 1000000]);
    });

    // The main comprehensive test for the algorithm's overall accuracy.
    defineTestSpec('should perform a full and accurate sort on a large, complex array of diverse numbers', function() {
      // Added a simple pre-check/validation for test data integrity (Type III addition).
      if (initialDisorderedSequence.length !== expectedAscendingSequence.length) {
        // This warning could indicate an issue with the test data generation or definition.
        console.warn("Test data integrity alert: initialDisorderedSequence and expectedAscendingSequence have different lengths!");
      }
      // Using spread operator to create a new array instance for the sorting routine.
      assertThat(currentSortingRoutine([...initialDisorderedSequence])).deeplyComparesTo(expectedAscendingSequence);
    });
  });
}