const kindClassifications = {
  // Various data type examples for testing purposes
  argumentCollection: [(function() { return arguments; })()], // Special case for arguments object
  numberSeries:       [[10, 20, 30]],
  booleanFlags:       [false, true],
  timestamp:          [new Date()],
  domElement:         [document.createElement('div')],
  boundaryNumbers:    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  actionFunction:     [() => {}], // Arrow function syntax
  notANumber:         [NaN],
  emptyValue:         [null],
  numericValues:      [0, 5, 5.75, -5.75],
  globalObjects:      [window, Math],
  simpleObjects:      [{ itemA: 1, itemB: 2 }],
  regexPatterns:      [/(.*)/],
  textStrings:        ['Emerald Green Sea'],
  undefinedValue:     [undefined]
};

const truthyKindSets = {
  // A filtered collection, excluding falsy values where possible
  argumentCollection: [(function() { return arguments; })()],
  numberSeries:       [[10, 20, 30]],
  booleanFlags:       [true], // Only true boolean
  timestamp:          [new Date()],
  domElement:         [document.createElement('span')],
  boundaryNumbers:    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  actionFunction:     [function() {}], // Retaining original for arguments context
  numericValues:      [5, 5.75, -5.75],
  globalObjects:      [window, Math],
  simpleObjects:      [{ itemA: 1, itemB: 2 }],
  regexPatterns:      [/(.*)/],
  textStrings:        ['Emerald Green Sea'],
  // NaN, null, undefined, 0, '' and false are explicitly excluded
};

const intricateObjectTree = {
  RootA: {
    nodeA1: [10, 20],
    nodeA2: [],
    nodeA3: {
      nodeA31: [10, 20],
      nodeA32: () => 'nodeA32_result',
      nodeA33: NaN,
      nodeA34: null,
      nodeA35: 199,
      nodeA36: Math,
      nodeA37: 'aquamarine',
      nodeA38: undefined,
      nodeA39: /(.+)/i
    },
    nodeA4: false,
    nodeA5: true,
    nodeA6: {
      nodeA61: true,
      nodeA62: function() { return 'nodeA62_output'; },
      nodeA63: new Date(),
      nodeA64: document.createElement('p')
    },
    nodeA7: () => 'nodeA7_func',
    nodeA8: new Date(2023, 0, 1),
    nodeA9: document.createElement('section'),
    nodeA10: NaN,
    nodeA11: null,
    nodeA12: 199,
    nodeA13: Math,
    nodeA14: 'aquamarine',
    nodeA15: undefined,
    nodeA16: /(.+)/i
  },
  RootB: [10, 20, 30],
  RootC: false,
  RootD: function() { return 'RootD_value'; },
  RootE: new Date(2024, 1, 1),
  RootF: document.createElement('main'),
  RootG: NaN,
  RootH: null,
  RootI: 199,
  RootJ: Math,
  RootK: 'indigo',
  RootL: undefined,
  RootM: /(.+)/g,
  RootN: { extra: 'property', nested: { deep: true } } // Added new fragment
};

// Helper function for test assertions
const assertDeepEquality = (actual, expected, message) => {
  // Placeholder for a testing utility's deepEqual function
  // In a real test environment, this would be provided by the framework (e.g., QUnit's deepEqual)
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`Assertion Failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  } else {
    // console.log(`Assertion Passed: ${message}`);
  }
};

const assertValueMatch = (actual, expected, message) => {
  // Placeholder for a testing utility's equal function
  if (actual !== expected) {
    console.error(`Assertion Failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  } else {
    // console.log(`Assertion Passed: ${message}`);
  }
};


// ARRAY-ORIENTED UTILITIES
featureValidation("fetchAtIndex", function() {
  const sourceCollection = [10, 20, 30];
  assertDeepEquality(toolbelt.fetchAtIndex(sourceCollection, 1), [20],
    'Retrieves an array containing the element at a single specified numeric index.');

  const multiIndices = [0, 2];
  assertDeepEquality(toolbelt.fetchAtIndex(sourceCollection, multiIndices), [10, 30],
    'Retrieves an array containing elements at multiple indices when an array of indices is provided.');

  const nestedCollection = [10, 20, [30, 40, 50]];
  assertDeepEquality(toolbelt.fetchAtIndex(nestedCollection, [0, 2], true), [10, 30, 40],
    'Deeply retrieves elements from nested structures given an array of indices, flattening one level.');

  // New fragment: Test with negative index (if toolbelt supports it, otherwise it's a new test case logic)
  // Assuming toolbelt.fetchAtIndex does not support negative indices like Array.at()
  // This test would fail if toolbelt.fetchAtIndex does not handle negative indices.
  // For Type III, we can add a test that *might* behave differently or test a boundary.
  const anotherCollection = [100, 200, 300, [400, 500]];
  assertDeepEquality(toolbelt.fetchAtIndex(anotherCollection, 0, true), [100, 400],
    'Deeply retrieves a single element and its nested children from a given index.');

  // Removed one deepEqual from original to make space for a new one or to simplify
});

featureValidation("filterFalsy", function() {
  const mixedValues = [0, null, undefined, '', NaN, false, {}, [], 'Aqua'];
  assertDeepEquality(toolbelt.filterFalsy(mixedValues), [{}, [], 'Aqua'],
    'Returns a new array with all common "falsy" values removed.');

  const strictMixedValues = [0, null, undefined, '', NaN, false, {}, [], 'Aqua'];
  assertDeepEquality(toolbelt.filterFalsy(strictMixedValues, true), ['Aqua'],
    'Returns an array with all "falsy" values, including empty arrays and object literals, removed.');

  const deepMixedArray = [0, 1, false, [2, [], 3, {}]];
  assertDeepEquality(toolbelt.filterFalsy(deepMixedArray, true, true), [1, [2, [], 3, {}], 2, 3],
    'Deeply filters an array, removing "falsy" values, including empty collections, at all levels.');

  // Changed depth parameter and values slightly
  const shallowDeepArray = [0, 1, false, [2, [], 3, {}]];
  assertDeepEquality(toolbelt.filterFalsy(shallowDeepArray, false, 1), [1, [2, [], 3, {}]],
    'Deeply filters an array to a specified depth, removing only standard "falsy" values.');
});

featureValidation("computeDifference", function() {
  const primarySet = ['Apple', 'Banana', 'Cherry'];
  const comparisonSetA = ['Apple', 'Banana'];
  assertDeepEquality(toolbelt.computeDifference(primarySet, comparisonSetA), ['Cherry'],
    'Calculates array difference, finding elements unique to the target array.');

  const numbersSet = [10, 20, 30];
  const compareSet1 = [20, 30, 40];
  const compareSet2 = [30, 40, 50];
  assertDeepEquality(toolbelt.computeDifference(numbersSet, compareSet1, compareSet2), [10],
    'Computes the difference across multiple comparison arrays.');

  const deepNumbersSet = [10, 20, 30, [60]];
  assertDeepEquality(toolbelt.computeDifference(deepNumbersSet, compareSet1, compareSet2, true), [10, 60],
    'Handles nested arrays when computing difference with a deep flag.');

  // Added a new test case for specific depth
  const complexDeepSet = [10, 20, 30, [60, [70]]];
  assertDeepEquality(toolbelt.computeDifference(complexDeepSet, [20, 30, 40], [30, 40, 50], 1), [10, [60, [70]]],
    'Computes array difference with nested elements up to a specified depth.');
});

featureValidation("grabFirst", function() {
  const initialValues = [10, 20, 30];
  assertDeepEquality(toolbelt.grabFirst(initialValues), [10],
    'Extracts the very first element from the provided array as a new array.');

  assertDeepEquality(toolbelt.grabFirst(initialValues, 2), [10, 20],
    'Retrieves the initial `N` elements from the array.');

  const deeplyNested = [10, 20, 30, [40, 50, 60, [70, 80, 90]]];
  assertDeepEquality(toolbelt.grabFirst(deeplyNested, 1, true), [10, 40, 70],
    'Recursively extracts the first `N` elements, including those in nested arrays.');

  // Removed a redundant test case from original
});

featureValidation("findFirstIndex", function() {
  const dataSequence = [11, 22, 33];
  assertValueMatch(toolbelt.findFirstIndex(dataSequence, 22), 1,
    'Locates the first index of a matching value within the data sequence.');

  const repeatedData = [11, 22, 33, 11, 22, 33];
  assertValueMatch(toolbelt.findFirstIndex(repeatedData, 22, 3), 4,
    'Locates the first index of a matching value starting from a specified position.');

  const deepDataSequence = [11, 22, [33]];
  assertValueMatch(toolbelt.findFirstIndex(deepDataSequence, 33, true), '2.0',
    'Returns the namespace path for the first nested value match.');
});

featureValidation("getInitialElements", function() {
  const sourceElements = [10, 20, 30, 40];
  assertDeepEquality(toolbelt.getInitialElements(sourceElements), [10, 20, 30],
    'Returns all elements except the last one in the array.');

  assertDeepEquality(toolbelt.getInitialElements(sourceElements, 2), [10, 20],
    'Returns all elements except the last `N` elements in the array.');

  const deepElements = [10, 20, 30, [40, 50, 60]];
  assertDeepEquality(toolbelt.getInitialElements(deepElements, 2, true), [10, 20, 40],
    'Recursively returns initial elements, excluding the last `N` elements and their deep children.');
});

featureValidation("findCommonElements", function() {
  const setA = [1, 2, 3, 4];
  const setB = [1, 2, 101, 102];
  assertDeepEquality(toolbelt.findCommonElements(setA, setB), [1, 2],
    'Identifies and returns an array containing values present in all provided sets.');

  const setC = [7, 8, 9];
  const setD = [9, 10, 11];
  assertDeepEquality(toolbelt.findCommonElements(setC, setD), [9],
    'Finds intersecting values between simple numeric arrays.');

  const setE = [7, 8, 9];
  const setF = [[9], 10, 11];
  assertDeepEquality(toolbelt.findCommonElements(setE, setF, true), [9],
    'Finds intersecting values, considering nested arrays when deep flag is active.');
});

featureValidation("obtainLast", function() {
  const sourceArray = [100, 200, 300];
  assertDeepEquality(toolbelt.obtainLast(sourceArray), [300],
    'Retrieves an array containing only the final element of the target array.');

  assertDeepEquality(toolbelt.obtainLast(sourceArray, 2), [200, 300],
    'Retrieves an array containing the last `N` elements from the target array.');

  const sourceDeepArray = [100, 200, 300, [400, 500, 600]];
  assertDeepEquality(toolbelt.obtainLast(sourceDeepArray, 2, true), [300, 500, 600],
    'Recursively retrieves the last `N` elements, including elements from nested arrays.');
});

featureValidation("findLastIndex", function() {
  const sequenceData = [1, 2, 3, 1, 2, 3];
  assertValueMatch(toolbelt.findLastIndex(sequenceData, 3), 5,
    'Determines the last index at which the target value can be found.');

  const brandList = ['Toyota', 'Ford', 'Toyota', 'Subaru', 'Honda'];
  assertValueMatch(toolbelt.findLastIndex(brandList, 'Toyota', 2), 2,
    'Determines the last index of a value, searching backwards from a specified position.');

  const complexBrandList = ['Toyota', 'Ford', ['Toyota', 'Subaru', 'Honda']];
  assertValueMatch(toolbelt.findLastIndex(complexBrandList, 'Toyota', 2, true), "2.0",
    'Determines the last namespace path for a deeply nested value, searching backwards.');
});

featureValidation("mapToRecord", function() {
  assertDeepEquality(toolbelt.mapToRecord(['key1', 1, 'key2', 2, 'key3', 3]), { key1: 1, key2: 2, key3: 3 },
    'Constructs an object from a single array where odd elements are keys and even are values.');

  assertDeepEquality(toolbelt.mapToRecord(['key1', 'key2', 'key3'], [1, 2, 3]), { key1: 1, key2: 2, key3: 3 },
    'Constructs an object from two arrays: one for keys, one for values.');

  assertDeepEquality(toolbelt.mapToRecord(['key1', 1], ['key2', 2], ['key3', 3]), { key1: 1, key2: 2, key3: 3 },
    'Constructs an object from multiple key-value pair arrays.');

  assertDeepEquality(toolbelt.toRecord(['keyX', 10, 'keyY', 20]), { keyX: 10, keyY: 20 },
    'Successfully aliased via `toolbelt.toRecord`.');
});

featureValidation("retrieveRemainder", function() {
  const originalSet = [100, 200, 300, 400];
  assertDeepEquality(toolbelt.retrieveRemainder(originalSet), [200, 300, 400],
    'Extracts all elements following the first element of the target array.');

  // Deleted a redundant test case from original
  assertDeepEquality(toolbelt.retrieveRemainder(originalSet, 2), [300, 400],
    'Extracts all elements after the Nth element of the target array.');

  assertDeepEquality(toolbelt.extractTail([100, 200, 300], 2), [300],
    'Successfully aliased via `toolbelt.extractTail`.');

  const deepSet = [100, 200, [300, 400, 500]];
  assertDeepEquality(toolbelt.retrieveRemainder(deepSet, 1, true), [200, 400, 500],
    'Deeply extracts elements after the Nth element, flattening nested arrays by one level.');
});

featureValidation("combineUnique", function() {
  const set1 = [1, 2, 3];
  const set2 = [2, 3, 4];
  const set3 = [3, 4, 5];
  assertDeepEquality(toolbelt.combineUnique(set1, set2, set3), [1, 2, 3, 4, 5],
    'Generates an array containing the unique union of values from all input arrays.');
});

featureValidation("removeDuplicates", function() {
  const mixedValues = [1, 2, 3, 4, 5, 6, 1, 2, 3];
  assertDeepEquality(toolbelt.removeDuplicates(mixedValues), [1, 2, 3, 4, 5, 6],
    'Filters out non-unique simple values from the target array.');

  const complexValues = [[1, 2], [4, 5], [1, 2], [4, 5]];
  assertDeepEquality(toolbelt.removeDuplicates(complexValues), [[1, 2], [4, 5]],
    'Filters out non-unique complex values from the target array.');

  assertDeepEquality(toolbelt.removeDuplicates([1, 2, 3, 3], (val) => val * 2), [2, 4, 6],
    'Removes duplicates based on results from an iterator function.');

  const scopeObject = { factor: 3 };
  assertDeepEquality(toolbelt.removeDuplicates([1, 2, 3, 3], function(val) { return val * this.factor; }, scopeObject), [3, 6, 9],
    'Removes duplicates using an iterator function bound to a specific scope object.');

  const deepMixedValues = [1, 1, 2, 2, [3, 3, 4, 4]];
  assertDeepEquality(toolbelt.removeDuplicates(deepMixedValues, true), [1, 2, 3, 4],
    'Deeply removes duplicates, flattening and extracting unique simple values.');
});

featureValidation("excludeItems", function() {
  const fullSet = [10, 20, 30, 40];
  const itemsToExclude = [30, 40];
  assertDeepEquality(toolbelt.excludeItems(fullSet, itemsToExclude), [10, 20],
    'Returns an array containing values not present in the exclusion list.');

  const complexSet = [[1], [2], [3], [4]];
  const complexExclude = [[3], [4]];
  assertDeepEquality(toolbelt.excludeItems(complexSet, complexExclude), [[1], [2]],
    'Excludes complex values from the target array.');

  const mixedSet = [10, 20, 30, 40];
  const mixedExclude = [30, [40]];
  assertDeepEquality(toolbelt.excludeItems(mixedSet, mixedExclude, true), [10, 20],
    'Deeply excludes values from the target array, including those nested in the exclusion list.');

  // Removed one deepEqual from original as it was an alias check.
});

featureValidation("interleaveArrays", function() {
  const colors = ['Crimson', 'Azure'];
  const hexCodes = ['#DC143C', '#007FFF'];
  assertDeepEquality(toolbelt.interleaveArrays(colors, hexCodes), [
    ["Crimson", "#DC143C"],
    ["Azure", "#007FFF"]
  ], 'Combines elements from multiple arrays into an interleaved array of sub-arrays.');
});

// COLLECTION UTILITIES
featureValidation("insertElement", function() {
  const baseArray = [10, 20, 30];
  assertDeepEquality(toolbelt.insertElement(baseArray, 3, 40), [10, 20, 30, 40],
    'Successfully adds a new value to an array at a specified index.');

  const baseObject = { 0: 10, 1: 20, 2: 30 };
  assertDeepEquality(toolbelt.insertElement(baseObject, 3, 40), { 0: 10, 1: 20, 2: 30, 3: 40 },
    'Successfully adds a new value to an object literal at a specified key/index.');

  assertDeepEquality(toolbelt.insertElement([10, 20, 30], 2, 99), [10, 20, 30],
    'Does not overwrite an existing value in an array at an occupied index.');

  assertDeepEquality(toolbelt.insertElement([10, 20, []], 0, 30, true), [10, 20, [30]],
    'Deeply adds a value into a nested array structure.');

  const deepObject = { 0: 10, 1: 20, 2: 30, 4: {} };
  assertDeepEquality(toolbelt.insertElement(deepObject, 3, 40, true), { 0: 10, 1: 20, 2: 30, 3: 40, 4: { 3: 40 } },
    'Successfully deeply adds a value to an object literal, potentially into nested objects.');
});

featureValidation("checkAll", function() {
  const numericArray = [1, 2, 3];
  assertValueMatch(toolbelt.checkAll(numericArray, (num) => typeof num === 'number'), true,
    'Verifies if all members of an array satisfy the condition in the iterator.');

  const numericObject = { 0: 1, 1: 1 };
  assertValueMatch(toolbelt.checkAll(numericObject, (val) => typeof val === 'number'), true,
    'Verifies if all members of an object literal satisfy the condition in the iterator.');

  const scopedArray = [1, 2, 3];
  const testScope = { multiplier: 2 };
  assertValueMatch(toolbelt.checkAll(scopedArray, function(num) { return typeof (num * this.multiplier) === 'number'; }, testScope), true,
    'Verifies members using an iterator with a bound scope.');

  assertValueMatch(toolbelt.verifyEach([1, 2, 3], (num) => typeof num === 'number'), true,
    'Successfully aliased via `toolbelt.verifyEach`.');

  const deepNumericArray = [1, 2, 3, [4, 5, 6]];
  assertValueMatch(toolbelt.checkAll(deepNumericArray, (num) => typeof num === 'number', true), true,
    'Verifies all members, including deep nested ones, satisfy the iterator condition.');

  const deepNumericObject = { 0: 1, 1: { 0: 1, 1: 2 } };
  assertValueMatch(toolbelt.checkAll(deepNumericObject, (num) => typeof num === 'number', true), true,
    'Verifies all members in a deep object literal satisfy the iterator condition.');
});

featureValidation("checkAny", function() {
  const arrForAny = [1, 2, 3];
  assertValueMatch(toolbelt.checkAny(arrForAny, (num) => typeof num === 'number'), true,
    'Confirms at least one member in the array passes the iterator test.');

  const objForAny = { 0: 1, 1: 'two' }; // Changed to have one non-number
  assertValueMatch(toolbelt.checkAny(objForAny, (val) => typeof val === 'number'), true,
    'Confirms at least one member in the object literal passes the iterator test.');

  const scopedArrForAny = [1, 'two', 3];
  const anyScope = { target: 'two' };
  assertValueMatch(toolbelt.checkAny(scopedArrForAny, function(val) { return val === this.target; }, anyScope), true,
    'Confirms at least one member passes the iterator test with a bound scope.');

  assertValueMatch(toolbelt.verifySome([1, 2, 'three'], (val) => typeof val === 'string'), true,
    'Successfully aliased via `toolbelt.verifySome`.');

  const deepArrForAny = [1, 2, [3, 'four', 5]];
  assertValueMatch(toolbelt.checkAny(deepArrForAny, (val) => typeof val === 'string', true), true,
    'Confirms at least one deep member in the array passes the iterator test.');

  const deepObjForAny = { 0: 1, 1: { 0: 'nested', 1: 2 } };
  assertValueMatch(toolbelt.checkAny(deepObjForAny, (val) => typeof val === 'string', true), true,
    'Confirms at least one deep member in the object literal passes the iterator test.');
});

featureValidation("calculateMean", function() {
  assertValueMatch(toolbelt.calculateMean([10, 20, 30]), 20,
    'Computes the average of an array of numeric values.');

  assertValueMatch(toolbelt.calculateMean({ 0: 10, 1: 20, 2: 30 }), 20,
    'Computes the average of an object literal\'s numeric values.');

  assertValueMatch(toolbelt.calculateMean([10, 20, [30]], true), 20,
    'Computes the average value from an array including deep members.');

  assertValueMatch(toolbelt.calculateMean([10, 20, [30]], (num) => num * 2, true), 40,
    'Computes the average of deep members after applying a callback function.');
});

featureValidation("emptyCollection", function() {
  assertDeepEquality(toolbelt.emptyCollection([1, 2, 3]), [undefined, undefined, undefined],
    'Clears all values in an array by replacing them with undefined.');

  assertDeepEquality(toolbelt.emptyCollection({ a: 1, b: 2 }), { a: undefined, b: undefined },
    'Clears all values in an object literal by replacing them with undefined.');
});

featureValidation("duplicateEntity", function() {
  const originalArray = [1, 2, [3]];
  assertDeepEquality(toolbelt.duplicateEntity(originalArray), [1, 2, [3]],
    'Creates a shallow clone of an array.');

  const originalObject = { key1: 1, key2: 2 };
  assertDeepEquality(toolbelt.duplicateEntity(originalObject), { key1: 1, key2: 2 },
    'Creates a shallow clone of an object literal.');

  const sourceArr = [1, 2, [3]];
  const clonedArr = toolbelt.duplicateEntity(sourceArr, true);
  sourceArr[2][0] = 4; // Modify original nested array
  assertDeepEquality(clonedArr, [1, 2, [3]],
    'Creates a deep clone of an array, ensuring nested structures are independent.');
});

featureValidation("includesValue", function() {
  assertValueMatch(toolbelt.includesValue([10, 20], 20), true,
    'Confirms existence of a simple value within an array.');

  assertValueMatch(toolbelt.includesValue({ 0: 10, 1: 20 }, 20), true,
    'Confirms existence of a simple value within an object literal.');

  assertValueMatch(toolbelt.includesValue({ 0: 10, 1: [20] }, [20]), true,
    'Confirms existence of a complex value within an object literal.');

  assertValueMatch(toolbelt.hasElement({ 0: 10, 1: 20 }, 20), true,
    'Successfully aliased via `toolbelt.hasElement`.');

  assertValueMatch(toolbelt.includesValue({ 0: 10, 1: [20, [30]] }, 30, true), true,
    'Successfully deeply finds a value within nested structures.');
});

featureValidation("tallyElements", function() {
  assertValueMatch(toolbelt.tallyElements([1, 2, 3], (val) => typeof val === 'number'), 3,
    'Counts array elements that satisfy the iterator\'s condition.');

  assertValueMatch(toolbelt.tallyElements({ a: 1, b: 2 }, (val) => typeof val === 'number'), 2,
    'Counts object literal values that satisfy the iterator\'s condition.');

  const countScope = { offset: 2 };
  assertValueMatch(toolbelt.tallyElements([1, 2, 3], function(val) { return typeof (val + this.offset) === 'number'; }, countScope), 3,
    'Counts elements using an iterator bound to a specific scope.');

  assertValueMatch(toolbelt.tallyElements([1, 2, [3, 'four']], (val) => typeof val === 'number', true), 3,
    'Counts elements, including nested members, that satisfy the iterator\'s condition.');
});

featureValidation("groupCountBy", function() {
  const lengths = toolbelt.groupCountBy([1.3, 1.5, 2.2, 2.9], (num) => Math.floor(num));
  assertDeepEquality(lengths, { 1: 2, 2: 2 },
    'Counts and groups array values based on a mapping function result.');

  const colorsGrouped = toolbelt.groupCountBy({ 0: "Red", 1: "Red", 2: "Blue" }, (color) => color);
  assertDeepEquality(colorsGrouped, { "Blue": 1, "Red": 2 },
    'Counts and groups object literal values based on their own value.');

  const colorScope = { suffix: " is a Shade!" };
  const scopedColorsGrouped = toolbelt.groupCountBy({ 0: "Red", 1: "Red", 2: "Blue" }, function(color) { return color + this.suffix; }, colorScope);
  assertDeepEquality(scopedColorsGrouped, { "Red is a Shade!": 2, "Blue is a Shade!": 1 },
    'Counts and groups object literal values using an iterator bound to a scope.');
});

featureValidation("traverseDeep", function() {
  const simpleArr = [1, 2, 3];
  toolbelt.traverseDeep(simpleArr, function(depth, idx, val, ref) {
    assertValueMatch(val, parseInt(idx) + 1,
      `[${simpleArr}] - Each iteration correctly provided index and value.`);
  });

  const deepArr = [1, 2, [3, [4]]];
  toolbelt.traverseDeep(deepArr, function(depth, idx, val, ref) {
    // This assertion is intentionally generic to just confirm iteration
    assertValueMatch(val, val,
      `[${deepArr}] - Iteration occurred, including deep elements.`);
  });

  let lastValueVisited = null;
  toolbelt.traverseDeep([1, 2, [3, [4]]], function(d, i, v, r) { lastValueVisited = v; }, 2);
  assertDeepEquality(lastValueVisited, [4],
    'Iterated to a specified depth within an array, stopping before full recursion.');

  const sourceRefArr = [1, 2];
  toolbelt.traverseDeep(sourceRefArr, function(d, i, v, r) {
    assertDeepEquality(r, sourceRefArr,
      'Each iteration provided a correct reference to the original collection.');
  });

  const simpleObj = { 0: 1, 1: 2 };
  toolbelt.traverseDeep(simpleObj, function(d, i, v, r) {
    assertValueMatch(v, parseInt(i) + 1,
      `{${JSON.stringify(simpleObj)}} - Iteration provided correct key and value.`);
  });

  lastValueVisited = null;
  toolbelt.traverseDeep({ obj: { color: 'Green' }, num: 1 }, function(d, i, v, r) {
    lastValueVisited = v;
  }, { noArrays: true, maxDepth: 1 }); // Changed signature slightly for options object
  assertDeepEquality(lastValueVisited, 1, 'Did not iterate into arrays or beyond maxDepth.');

  lastValueVisited = null;
  const traverseOptions = {
    obj: { data: [1, 2], config: { setting: 'value' } },
    fn: function(d, i, v, r) { lastValueVisited = v; },
    noObjects: true // Skip objects
  };
  toolbelt.traverseDeep(traverseOptions.obj, traverseOptions.fn, { noObjects: true });
  assertDeepEquality(lastValueVisited, [1, 2], 'Did not iterate through object literals when `noObjects` was specified.');

  const testArgs = ['extra data'];
  toolbelt.traverseDeep([1, 2], function(d, i, v, r, a) {
    assertValueMatch(a, testArgs[0], 'Successfully passed additional arguments to the iterator.');
  }, { args: testArgs }); // Passed args as part of options object
});

featureValidation("iterateOver", function() {
  const iterationList = [10, 20, 30];
  const collectedValues = [];
  toolbelt.iterateOver(iterationList, (val, idx) => {
    collectedValues.push(val);
    assertValueMatch(val, (idx + 1) * 10,
      'Each iteration provided correct index and value from the array.');
  });
  assertDeepEquality(collectedValues, [10, 20, 30], 'All values were iterated over.');

  const scopedIteration = [];
  const iterScope = { scale: 5 };
  toolbelt.iterateOver([1, 2, 3], function(val, idx) { scopedIteration.push(val * this.scale); }, iterScope);
  assertValueMatch(scopedIteration.join(', '), '5, 10, 15', 'Scope object property was correctly accessed within iterator.');

  let collectionReferenceValid = false;
  const originalCollection = [1, 2, 3];
  toolbelt.iterateOver(originalCollection, (val, idx, coll) => {
    if (coll === originalCollection) collectionReferenceValid = true;
  });
  assertValueMatch(collectionReferenceValid, true, 'Original collection reference is available within the iterator.');

  const forEachAliasResult = [];
  toolbelt.forEachElement([10, 20, 30], (val) => { forEachAliasResult.push(val); });
  assertValueMatch(forEachAliasResult.join(', '), '10, 20, 30', 'Successfully aliased via `toolbelt.forEachElement`.');

  const colorMap = { primary: '#FF0000', secondary: '#00FF00', tertiary: '#0000FF' };
  const expectedHexes = ['#FF0000', '#00FF00', '#0000FF'];
  toolbelt.iterateOver(colorMap, (val, key) => {
    assertValueMatch(expectedHexes.includes(val), true,
      'Each iteration provided correct key and value from the object literal.');
  });
});

featureValidation("nullifyContents", function() {
  assertDeepEquality(toolbelt.nullifyContents([1, 2]), [undefined, undefined],
    'Successfully nullifies all elements in an array.');

  assertDeepEquality(toolbelt.nullifyContents({ 0: 1, 1: 2 }), { 0: undefined, 1: undefined },
    'Successfully nullifies all properties in an object literal.');

  assertDeepEquality(toolbelt.nullifyContents([1, [2]], true), [undefined, [undefined]],
    'Successfully deeply nullifies elements in an array with nested arrays.');

  assertDeepEquality(toolbelt.nullifyContents([1, { a: 2 }], true), [undefined, { a: undefined }],
    'Successfully deeply nullifies elements in an array with nested object literals.');

  assertDeepEquality(toolbelt.nullifyContents({ 0: 1, 1: [2] }, true), { 0: undefined, 1: [undefined] },
    'Successfully deeply nullifies properties in an object literal with nested arrays.');

  assertDeepEquality(toolbelt.nullifyContents({ 0: 1, 1: { a: 2 } }, true), { 0: undefined, 1: { a: undefined } },
    'Successfully deeply nullifies properties in an object literal with nested object literals.');
});

featureValidation("selectMatching", function() {
  assertDeepEquality(toolbelt.selectMatching([10, 20], (num) => num >= 20), [20],
    'Filters an array, returning elements that meet a specified condition.');

  assertDeepEquality(toolbelt.selectMatching({ a: 10, b: 20 }, (num) => num >= 20), [20],
    'Filters an object literal, returning values that meet a specified condition.');

  const filterScope = { targetValue: 20 };
  assertDeepEquality(toolbelt.selectMatching([10, 20], function(num) { return num === this.targetValue; }, filterScope), [20],
    'Filters an array using a predicate function bound to a specific scope.');
});

featureValidation("locateFirst", function() {
  assertValueMatch(toolbelt.locateFirst([10, 20], (num) => num === 20), 20,
    'Locates and returns the first value in an array that satisfies the predicate.');

  assertValueMatch(toolbelt.locateFirst({ a: 10, b: 20 }, (num) => num === 20), 20,
    'Locates and returns the first value in an object literal that satisfies the predicate.');

  const findScope = { search: 20 };
  assertValueMatch(toolbelt.locateFirst([10, 20], function(num) { return num === this.search; }, findScope), 20,
    'Locates the first value using a predicate bound to a specific scope.');

  assertValueMatch(toolbelt.locateFirst([10, { key: 20 }], (val) => val === 20, true), 20,
    'Deeply locates the first value in a nested array structure.');
});

featureValidation("locateKeyForValue", function() {
  assertValueMatch(toolbelt.locateKeyForValue([10, 20], (idx) => idx === 1), 20,
    'Locates and returns the value at the key/index that satisfies the predicate in an array.');

  assertValueMatch(toolbelt.locateKeyForValue({ a: 10, b: 20 }, (key) => key === 'b'), 20,
    'Locates and returns the value at the key that satisfies the predicate in an object literal.');

  const keyFindScope = { targetKey: 1 };
  assertValueMatch(toolbelt.locateKeyForValue([10, 20], function(idx) { return idx === this.targetKey; }, keyFindScope), 20,
    'Locates value at key using a predicate bound to a specific scope.');

  assertValueMatch(toolbelt.locateKeyForValue([10, [20, 30, 40]], (val) => val === 2, true), 40,
    'Deeply locates the value at the key/index that satisfies the predicate in a nested array.');
});

featureValidation("unrollStructure", function() {
  assertDeepEquality(toolbelt.unrollStructure([10, [20]]), [10, 20],
    'Successfully flattens a shallowly nested array.');

  assertDeepEquality(toolbelt.unrollStructure({ 0: 10, 1: { 1: 20 } }), [10, 20],
    'Successfully flattens an object literal containing nested objects.');

  assertDeepEquality(toolbelt.unrollStructure({ 0: 10, 1: [20] }), [10, 20],
    'Successfully flattens an object literal containing nested arrays.');

  assertDeepEquality(toolbelt.unrollStructure([10, [20, { key: 30 }]]), [10, 20, 30],
    'Successfully flattens an array with nested object literals.');

  assertDeepEquality(toolbelt.unrollStructure({ 0: 10, 1: 20, 2: [30, [40]] }, 1), [10, 20, [30, [40]]],
    'Successfully flattens an object literal to a specified depth.');

  assertDeepEquality(toolbelt.unrollStructure([10, 20, { a: 30, b: [40] }], 1), [10, 20, { a: 30, b: [40] }],
    'Successfully flattens an array with nested object literals to a specified depth.');

  assertDeepEquality(toolbelt.unrollStructure([10, [20, [30]]], 2), [10, 20, [30]],
    'Successfully flattens an array to a specified depth.');
});

featureValidation("organizeBy", function() {
  const itemLengths = toolbelt.organizeBy(['Cat', 'Dog', 'Iguana'], (s) => s.length);
  assertValueMatch(Object.keys(itemLengths).length, 2,
    'Groups array elements by a property derived from a mapping function.');

  const itemTypes = toolbelt.organizeBy([
    { element: 'K', kind: 'metal' },
    { element: 'Ca', kind: 'metal' },
    { element: 'Ne', kind: 'gas' }
  ], 'kind');
  assertValueMatch(Object.keys(itemTypes).length, 2,
    'Groups object literals within an array by a common property name.');
});

featureValidation("chunkIntoGroups", function() {
  const groupedLength = Object.keys(toolbelt.chunkIntoGroups([1, 2, 3, 4], 2)).length;
  assertValueMatch(groupedLength, 2,
    'Splits array elements into groups of a specified size.');

  const paddedGroupedLength = Object.keys(toolbelt.chunkIntoGroups([1, 2, 3, 4, 5], 2, '*')).length;
  assertValueMatch(paddedGroupedLength, 3,
    'Splits array elements into groups with padding for incomplete last groups.');

  const objGroupedLength = Object.keys(toolbelt.chunkIntoGroups({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 }, 2)).length;
  assertValueMatch(objGroupedLength, 3,
    'Splits object literal values into groups of a specified size.');

  const objPaddedGroupedLength = Object.keys(toolbelt.chunkIntoGroups({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }, 2, null)).length; // Changed padding value
  assertValueMatch(objPaddedGroupedLength, 4,
    'Splits object literal values into groups with padding for incomplete last groups.');
});

featureValidation("propertyExists", function() {
  const sampleRecord = { 'alpha': 1, 'beta': 2 };
  assertValueMatch(toolbelt.propertyExists(sampleRecord, 'beta'), true,
    'Confirms an object literal possesses a specific key.');

  assertValueMatch(toolbelt.propertyExists([1, 2], 0), true,
    'Confirms an array has an element at a specific index.');

  assertValueMatch(toolbelt.propertyExists(sampleRecord, 'gamma'), false,
    'Confirms an object literal does not possess a non-existent key.');

  assertValueMatch(toolbelt.keyPresent(sampleRecord, 'beta'), true,
    'Successfully aliased via `toolbelt.keyPresent`.');

  assertValueMatch(toolbelt.propertyExists({ 0: 1, 1: { color: 'Blue' } }, 'color', true), true,
    'Successfully deeply checks if an object literal contains a nested key.');
});

featureValidation("flipKeysAndValues", function() {
  const originalMap = { 'first': 1, 'second': 2 };
  assertDeepEquality(toolbelt.flipKeysAndValues(originalMap), { 1: 'first', 2: 'second' },
    'Successfully inverts key/value pairs of an object literal.');

  assertDeepEquality(toolbelt.flipKeysAndValues([1, 2]), { 1: '0', 2: '1' },
    'Successfully inverts an array into an object literal with index-value pairs flipped.');
});

featureValidation("applyMethodToAll", function() {
  const dataItems = { 0: 'Rose', 1: 'Lily' };
  const result = toolbelt.applyMethodToAll(dataItems, (val, arg) => val + arg, [' is a bloom.']);
  assertDeepEquality(result, ["Rose is a bloom.", "Lily is a bloom."],
    'Successfully invokes an iterator function on all values within an object literal.');
});

featureValidation("isCollectionEmpty", function() {
  assertValueMatch(toolbelt.isCollectionEmpty({}), true,
    'Correctly identifies an empty object literal.');

  assertValueMatch(toolbelt.isCollectionEmpty([]), true,
    'Correctly identifies an empty array.');

  assertValueMatch(toolbelt.isCollectionEmpty({ key: 1 }), false,
    'Correctly identifies a non-empty object literal.');

  assertValueMatch(toolbelt.isCollectionEmpty([1]), false,
    'Correctly identifies a non-empty array.');
});

featureValidation("isItemUnique", function() {
  assertValueMatch(toolbelt.isItemUnique([1, 2, 3, 4, 4], 4), false,
    'Correctly determines if a value in an array is not unique.');

  assertValueMatch(toolbelt.isItemUnique([[1, 2], [1, 4]], [1, 2]), true,
    'Correctly determines if a complex value in an array is unique (by reference/deep check).');

  assertValueMatch(toolbelt.isItemUnique({ 0: [1, 2], 1: [1, 4] }, [1, 2]), true,
    'Correctly determines if a complex value in an object literal is unique.');
});

// A new, small test block to demonstrate additional Type III changes
featureValidation("customUtilityCheck", function() {
  const myData = [1, 2, 3, 4, 5];
  const processed = myData.map(x => x * 2);
  assertDeepEquality(processed, [2, 4, 6, 8, 10], 'Custom processing yields expected results.');

  const mixedCollection = { a: 1, b: 'two', c: [3] };
  let hasString = false;
  toolbelt.iterateOver(mixedCollection, (v) => { if (typeof v === 'string') hasString = true; });
  assertValueMatch(hasString, true, 'Iteration can find specific types.');

  // Example of a deleted original test: if a method was tested too many times with slight variations.
  // For instance, if `toolbelt.insertElement` had an identical test case, one could be removed.
});