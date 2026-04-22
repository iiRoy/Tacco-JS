const objectDuplicator = require('./object-copier');

/**
 * Generates a string representation of a JavaScript object,
 * specifically designed for comparison or debugging, with robust
 * handling for circular references to prevent infinite loops during serialization.
 *
 * @param {object} targetObject - The object to be serialized into a string.
 * @returns {string} A JSON string representing the object, with cyclic references marked.
 */
function serializeForComparison(targetObject) {
  // Utilizing a Set for efficient tracking of objects already encountered during the serialization process.
  const encounteredObjects = new Set();

  return JSON.stringify(targetObject, (propertyKey, currentPropertyValue) => {
    // Only process non-null objects; primitives and null are returned as-is.
    if (currentPropertyValue !== null && typeof currentPropertyValue === 'object') {
      // If the current object has been seen before, it indicates a circular reference.
      if (encounteredObjects.has(currentPropertyValue)) {
        return '[CIRCULAR_REFERENCE_DETECTED]'; // Custom marker for cyclic structures.
      }
      // Add the object to the set of encountered objects before delving into its properties.
      encounteredObjects.add(currentPropertyValue);
    }
    // For primitives, null, or the first encounter of an object, return the value directly.
    return currentPropertyValue;
  });
}

/**
 * Provides a mechanism to execute JavaScript code in an isolated environment,
 * supporting both Node.js's 'vm' module and browser iframes.
 *
 * @param {object} initialScopeData - An object containing data to be made available in the isolated context.
 * @param {string} codeToExecute - The JavaScript code string that will be run.
 * @param {function(any): void} completionHandler - A callback function to receive the outcome of the script's execution.
 */
function executeInIsolatedContext(initialScopeData, codeToExecute, completionHandler) {
  // Dynamically load the 'vm' module, which is Node.js specific.
  let nodeVmModule = null;
  try {
    nodeVmModule = require('vm');
  } catch (err) {
    // The 'vm' module is typically not found in browser environments.
    // console.log("Node.js 'vm' module not available, likely running in a browser environment."); // Deleted for Type III.
  }

  // Node.js environment: Check if the 'vm' module was successfully loaded and is functional.
  if (nodeVmModule && typeof nodeVmModule.createContext === 'function') {
    const vmExecutionContext = nodeVmModule.createContext({ externalBindings: initialScopeData });
    try {
      // Execute the script within the created VM context.
      const executionOutcome = nodeVmModule.runInContext(codeToExecute, vmExecutionContext);
      completionHandler(executionOutcome);
    } catch (scriptExecutionError) {
      console.error('Error during script execution in Node.js VM:', scriptExecutionError);
      throw scriptExecutionError; // Re-throw to signal failure in the Node.js path.
    }
  }
  // Browser environment: Check for the presence of 'document' and ability to create elements.
  else if (typeof document !== 'undefined' && document.createElement) {
    const sandboxedIframe = document.createElement('iframe');
    sandboxedIframe.style.display = 'none'; // Keep the iframe invisible to the user.
    document.body.appendChild(sandboxedIframe); // Attach to the DOM temporarily.

    // Generate a unique identifier to pass data to the iframe via the parent window's global scope.
    const uniqueDataKey = `isolated_data_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Expose the initial data to the iframe's context through the parent window.
    window[uniqueDataKey] = initialScopeData;

    // Construct the URL for the iframe, passing the data key and the script as URL parameters.
    const encodedScriptContent = encodeURIComponent(codeToExecute);
    sandboxedIframe.src = `isolated-runner.html?contextKey=${uniqueDataKey}&scriptBody=${encodedScriptContent}`;

    // Set up an event listener for when the iframe's content has loaded.
    sandboxedIframe.onload = () => {
      try {
        // Retrieve the results from the iframe's contentWindow, assuming it populates a 'results' property.
        const iframeExecutionResults = sandboxedIframe.contentWindow.scriptOutput;
        completionHandler(iframeExecutionResults);
      } catch (resultAccessError) {
        console.error('Failed to retrieve results from iframe:', resultAccessError);
        throw resultAccessError;
      } finally {
        // Ensure the iframe and its global reference are cleaned up.
        if (sandboxedIframe.parentNode) {
          sandboxedIframe.parentNode.removeChild(sandboxedIframe);
        }
        delete window[uniqueDataKey];
      }
    };

    // Add an error handler for the iframe itself.
    sandboxedIframe.onerror = (iframeError) => {
      console.error('An error occurred during iframe loading or execution:', iframeError);
      // Depending on requirements, could call completionHandler with an error or throw.
    };
  } else {
    // If neither Node.js VM nor browser iframe capabilities are detected, throw an error.
    throw new Error('Environment not supported for isolated context execution. Requires Node.js VM or browser iframe.');
  }
}

// --- Test Suite for ObjectDuplicator Functionality ---

module.exports.testStringReplication = function (assertionUtility) {
  const primaryString = "sample string for duplication";
  assertionUtility.strictEqual(objectDuplicator(primaryString), primaryString, "A simple string should be perfectly replicated.");
  const emptyStringValue = "";
  assertionUtility.strictEqual(objectDuplicator(emptyStringValue), emptyStringValue, "An empty string should also be replicated.");

  assertionUtility.done();
};

module.exports.testNumericReplication = function (assertionUtility) {
  let valueToDuplicate = 0;
  assertionUtility.strictEqual(objectDuplicator(valueToDuplicate), valueToDuplicate, "Zero value must be duplicated correctly.");
  valueToDuplicate = 12345;
  assertionUtility.strictEqual(objectDuplicator(valueToDuplicate), valueToDuplicate, "Positive integer value must be duplicated correctly.");
  valueToDuplicate = -67890;
  assertionUtility.strictEqual(objectDuplicator(valueToDuplicate), valueToDuplicate, "Negative integer value must be duplicated correctly.");
  valueToDuplicate = 98.7654321;
  assertionUtility.strictEqual(objectDuplicator(valueToDuplicate), valueToDuplicate, "Positive floating point value must be duplicated correctly.");
  valueToDuplicate = -1.2345678;
  assertionUtility.strictEqual(objectDuplicator(valueToDuplicate), valueToDuplicate, "Negative floating point value must be duplicated correctly.");

  assertionUtility.done();
};

module.exports.testDateObjectReplication = function (assertionUtility) {
  const originalDateTime = new Date();
  const replicatedDateTime = objectDuplicator(originalDateTime);

  assertionUtility.ok(typeof originalDateTime.getUTCDate === 'function', "Original object should be a valid Date instance.");
  assertionUtility.ok(replicatedDateTime instanceof Date, "Replicated object should also be an instance of Date.");
  assertionUtility.equal(originalDateTime.getTime(), replicatedDateTime.getTime(), "The time value of the replicated date must match the original.");

  assertionUtility.done();
};

module.exports.testPlainObjectReplication = function (assertionUtility) {
  const sourcePlainObject = { key1: { nestedKey: "nestedValue" } };
  const duplicatedPlainObject = objectDuplicator(sourcePlainObject);

  assertionUtility.deepStrictEqual(duplicatedPlainObject, sourcePlainObject, "Duplicated plain object should be deeply equal to the source.");

  assertionUtility.done();
};

module.exports.testArrayStructureReplication = function (assertionUtility) {
  const sourceArray = [
    { elementProp: "item one" },
    "item two"
  ];
  const duplicatedArray = objectDuplicator(sourceArray);

  assertionUtility.ok(Array.isArray(duplicatedArray), "The duplicated entity must be an Array instance.");
  assertionUtility.deepStrictEqual(duplicatedArray, sourceArray, "Duplicated array structure should be deeply equal to the source.");

  assertionUtility.done();
};

module.exports.testBufferObjectReplication = function (assertionUtility) {
  if (typeof Buffer === 'undefined' || !Buffer.isBuffer) { // Enhanced guard for Buffer availability.
    return assertionUtility.done();
  }

  const originalByteBuffer = Buffer.from("this is a byte array for testing");
  const replicatedByteBuffer = objectDuplicator(originalByteBuffer);

  assertionUtility.deepStrictEqual(replicatedByteBuffer, originalByteBuffer, "Replicated Buffer content should be identical to the original.");
  assertionUtility.done();
};

module.exports.testRegExpObjectReplication = function (assertionUtility) {
  const baseRegExp = /expression_test/gi;
  const copiedRegExp = objectDuplicator(baseRegExp);
  assertionUtility.deepStrictEqual(copiedRegExp, baseRegExp, "Cloned RegExp instance should be deeply equal to the original.");

  const dynamicRegExp = /x/g;
  assertionUtility.strictEqual(dynamicRegExp.lastIndex, 0, "Initial lastIndex for a new RegExp should be zero.");

  dynamicRegExp.exec('123x456x');
  assertionUtility.strictEqual(dynamicRegExp.lastIndex, 4, "lastIndex should advance after a successful exec call.");

  const dynamicRegExpCopy = objectDuplicator(dynamicRegExp);
  assertionUtility.ok(dynamicRegExpCopy.global, "Copied RegExp should preserve its global flag.");
  assertionUtility.strictEqual(dynamicRegExpCopy.lastIndex, 4, "Copied RegExp should maintain the lastIndex state from the original.");

  assertionUtility.done();
};

module.exports.testObjectWithNestedArraysReplication = function (assertionUtility) {
  const complexSource = {
    firstList: [{ id: 'A1', value: 'Data A' }],
    secondList: [{ id: 'B1', value: 'Data B' }]
  };

  const copiedComplex = objectDuplicator(complexSource);

  assertionUtility.deepStrictEqual(copiedComplex, complexSource, "Complex object containing nested arrays must be deeply equal after duplication.");

  assertionUtility.done();
};

module.exports.testCircularReferenceHandlingInDuplication = function (assertionUtility) {
  const itemCollection = [10, "label", { 'detail': 'info' }, () => {}, true, [20]];
  const parentCollection = [itemCollection, 20, 30, 40];

  const mainEntity = { 'subCollection': parentCollection, 'sharedCollection': itemCollection };
  // Establish circular references.
  mainEntity.selfReference = mainEntity;
  mainEntity.secondarySelfRef = mainEntity;
  itemCollection.recursiveLink = itemCollection;
  itemCollection.backLink = mainEntity;

  const duplicatedMainEntity = objectDuplicator(mainEntity);

  // Assertions to verify distinct instances but preserved structural integrity.
  assertionUtility.notStrictEqual(mainEntity, duplicatedMainEntity, "Original and duplicated root objects must be distinct instances.");
  assertionUtility.notStrictEqual(mainEntity.sharedCollection, duplicatedMainEntity.sharedCollection, "Original and duplicated shared collections must be distinct instances.");
  assertionUtility.strictEqual(duplicatedMainEntity.sharedCollection, duplicatedMainEntity.subCollection[0], "Duplicated shared collection should be referenced correctly from duplicated subCollection.");
  assertionUtility.strictEqual(duplicatedMainEntity.sharedCollection.recursiveLink.backLink, duplicatedMainEntity, "Deeply nested circular reference should correctly point to the duplicated root.");
  assertionUtility.strictEqual(duplicatedMainEntity.sharedCollection[0], mainEntity.sharedCollection[0], "Primitive values within nested structures should remain identical.");

  // Helper function for structural equivalence using string serialization.
  const areStructurallyEquivalent = (objA, objB) => serializeForComparison(objA) === serializeForComparison(objB);

  assertionUtility.ok(areStructurallyEquivalent(mainEntity, duplicatedMainEntity), "Original and duplicated objects should be structurally equivalent.");
  duplicatedMainEntity.sharedCollection[0] = 2000; // Modify the duplicated object.
  assertionUtility.ok(!areStructurallyEquivalent(mainEntity, duplicatedMainEntity), "Modification to duplicated object should break structural equivalence.");
  duplicatedMainEntity.sharedCollection = "new_collection_ref"; // Replace a reference in the duplicate.
  assertionUtility.ok(!areStructurallyEquivalent(mainEntity, duplicatedMainEntity), "Replacing a reference in duplicated object should break structural equivalence.");

  assertionUtility.done();
};

module.exports.testPrototypeChainDuplication = function (assertionUtility) {
  const sourcePrototypeObject = {
    propOne: "valueA",
    propTwo: 101,
    propThree: 20.25
  };
  // Renamed the prototype cloning method.
  const prototypeCopy = objectDuplicator.createPrototypeCopy(sourcePrototypeObject);

  assertionUtility.strictEqual(prototypeCopy.propOne, sourcePrototypeObject.propOne, "Copied prototype property 'propOne' should match.");
  assertionUtility.strictEqual(prototypeCopy.propTwo, sourcePrototypeObject.propTwo, "Copied prototype property 'propTwo' should match.");
  assertionUtility.strictEqual(prototypeCopy.propThree, sourcePrototypeObject.propThree, "Copied prototype property 'propThree' should match.");

  assertionUtility.done();
};

module.exports.testCloningInIsolatedContext = function (assertionUtility) {
  executeInIsolatedContext(
    { copier: objectDuplicator },
    "scriptOutput = externalBindings.copier({ numberList: [100, 200, 300], transactionDate: new Date(), searchPattern: /^search$/im })",
    (resultFromContext) => {
      // Using .name property for constructor checks for more clarity.
      assertionUtility.strictEqual(resultFromContext.numberList.constructor.name, Array.name, "Array from isolated context must be recognized as Array.");
      assertionUtility.strictEqual(resultFromContext.transactionDate.constructor.name, Date.name, "Date from isolated context must be recognized as Date.");
      assertionUtility.strictEqual(resultFromContext.searchPattern.constructor.name, RegExp.name, "RegExp from isolated context must be recognized as RegExp.");
      assertionUtility.done();
    }
  );
};

module.exports.testObjectWithoutConstructorDuplication = function (assertionUtility) {
  const bareObject = Object.create(null); // Modern way to create an object with no prototype chain.
  bareObject.specialField = 'no_proto_data';

  assertionUtility.strictEqual(typeof bareObject, 'object', "Object.create(null) should indeed return an object.");
  assertionUtility.notStrictEqual(bareObject, null, "A bare object is distinct from null."); // Added a new assertion.

  const copiedBareObject = objectDuplicator(bareObject);
  assertionUtility.strictEqual(copiedBareObject.specialField, bareObject.specialField, "Copied object without a constructor should retain its data fields.");

  assertionUtility.done();
};

module.exports.testDepthLimitedDuplicationFeature = function (assertionUtility) {
  const multiLevelObject = {
    levelOne: {
      levelTwo: {
        levelThree: 'deep_value'
      }
    }
  };

  // Perform a shallow copy (depth 1).
  let shallowDuplication = objectDuplicator(multiLevelObject, false, 1);
  assertionUtility.deepStrictEqual(shallowDuplication, multiLevelObject, "Shallow copy (depth 1) should be deeply content-equal.");
  assertionUtility.notStrictEqual(shallowDuplication, multiLevelObject, "Shallow copy (depth 1) root object must be a distinct instance.");
  assertionUtility.strictEqual(shallowDuplication.levelOne, multiLevelObject.levelOne, "Shallow copy (depth 1) should share reference at the first nested level.");

  // Perform a deeper copy (depth 2).
  let deeperDuplication = objectDuplicator(multiLevelObject, true, 2);
  assertionUtility.deepStrictEqual(deeperDuplication, multiLevelObject, "Deeper copy (depth 2) should be deeply content-equal.");
  assertionUtility.notStrictEqual(deeperDuplication.levelOne, multiLevelObject.levelOne, "Deeper copy (depth 2) level one object must be a distinct instance.");
  assertionUtility.strictEqual(deeperDuplication.levelOne.levelTwo, multiLevelObject.levelOne.levelTwo, "Deeper copy (depth 2) should share reference at the second nested level.");

  assertionUtility.done();
};

module.exports.testPrototypeChainPreservation = function (assertionUtility) {
  function MyCustomClass() {}
  const instanceOfCustom = new MyCustomClass();
  const duplicatedInstanceOfCustom = objectDuplicator(instanceOfCustom);
  assertionUtility.strictEqual(Object.getPrototypeOf(instanceOfCustom), Object.getPrototypeOf(duplicatedInstanceOfCustom), "Cloned object must preserve its original prototype chain.");

  assertionUtility.done();
};

module.exports.testPrototypeOverrideWithNull = function (assertionUtility) {
  function OriginalPrototypeClass() {}
  const originalInstance = new OriginalPrototypeClass();
  // The 'null' argument here specifically instructs to set the prototype of the clone to null.
  const clonedWithNullPrototype = objectDuplicator(originalInstance, true, Infinity, null);
  // Assert that common methods from Object.prototype are no longer available.
  assertionUtility.strictEqual(clonedWithNullPrototype.hasOwnProperty, undefined, "Cloned object with null prototype should not inherit Object.prototype methods.");

  assertionUtility.done();
};

module.exports.testObjectWithNullChildrenDuplication = function (assertionUtility) {
  const containerObject = {
    mainData: {
      subData: null,
      furtherData: {
        statusFlag: false
      }
    }
  };

  const copiedContainer = objectDuplicator(containerObject);

  assertionUtility.deepStrictEqual(copiedContainer, containerObject, "Object containing null child properties should be deeply equal after duplication.");
  assertionUtility.done();
};

module.exports.testInstanceWithGetterDuplication = function (assertionUtility) {
  function ItemDescriptor() {};
  // Define a getter property on the prototype chain.
  Object.defineProperty(ItemDescriptor.prototype, 'displayValue', {
    configurable: true,
    enumerable: true,
    get: function() {
      return 'dynamically_calculated_value';
    }
  });

  const sourceItem = new ItemDescriptor();
  const duplicatedItem = objectDuplicator(sourceItem);

  // Verify that the getter property is correctly inherited and callable on the duplicated instance.
  assertionUtility.strictEqual(duplicatedItem.displayValue, 'dynamically_calculated_value', "Duplicated instance should correctly resolve its getter property.");
  assertionUtility.done();
};

module.exports.testRegExpModifierExtraction = function (assertionUtility) {
  // Renamed internal helper for clarity.
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_a/), '', "RegExp with no flags should return an empty string.");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_b/i), 'i', "RegExp with 'i' flag.");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_c/g), 'g', "RegExp with 'g' flag.");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_d/gi), 'gi', "RegExp with 'gi' flags.");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_e/m), 'm', "RegExp with 'm' flag.");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_f/u), 'u', "RegExp with 'u' flag (added for modern regex).");
  assertionUtility.strictEqual(objectDuplicator.extractRegExpModifiers(/pattern_g/s), 's', "RegExp with 's' flag (added for modern regex).");

  assertionUtility.done();
};

// Grouping type-checking helpers under a new property `typeCheckers`.
objectDuplicator.typeCheckers = {
  isArrayInstance: (val) => Array.isArray(val),
  isDateInstance: (val) => val instanceof Date,
  isRegExpInstance: (val) => val instanceof RegExp,
  // Adding a new type checker for Buffer for completeness.
  isBufferInstance: (val) => typeof Buffer !== 'undefined' && Buffer.isBuffer(val)
};

module.exports.testArrayTypeRecognition = function (assertionUtility) {
  executeInIsolatedContext(null, "scriptOutput = [1000, 2000, 3000]", function (alienArrayObject) {
    const localArrayObject = [4000, 5000, 6000];
    assertionUtility.ok(objectDuplicator.typeCheckers.isArrayInstance(alienArrayObject), "Should correctly identify an Array from an external context.");
    assertionUtility.ok(objectDuplicator.typeCheckers.isArrayInstance(localArrayObject), "Should correctly identify an Array from the local context.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isDateInstance(alienArrayObject), "Should not mistake external Array for a Date.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isDateInstance(localArrayObject), "Should not mistake local Array for a Date.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isRegExpInstance(alienArrayObject), "Should not mistake external Array for a RegExp.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isRegExpInstance(localArrayObject), "Should not mistake local Array for a RegExp.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isBufferInstance(alienArrayObject), "Should not mistake external Array for a Buffer (new check)."); // Added new check.
    assertionUtility.done();
  });
};

module.exports.testDateTypeRecognition = function (assertionUtility) {
  executeInIsolatedContext(null, "scriptOutput = new Date()", function (alienDateObject) {
    const localDateObject = new Date();

    assertionUtility.ok(objectDuplicator.typeCheckers.isDateInstance(alienDateObject), "Should correctly identify a Date from an external context.");
    assertionUtility.ok(objectDuplicator.typeCheckers.isDateInstance(localDateObject), "Should correctly identify a Date from the local context.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isArrayInstance(alienDateObject), "Should not mistake external Date for an Array.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isArrayInstance(localDateObject), "Should not mistake local Date for an Array.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isRegExpInstance(alienDateObject), "Should not mistake external Date for a RegExp.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isRegExpInstance(localDateObject), "Should not mistake local Date for a RegExp.");
    assertionUtility.done();
  });
};

module.exports.testRegExpTypeRecognition = function (assertionUtility) {
  executeInIsolatedContext(null, "scriptOutput = /search_pattern/", function (alienRegExpObject) {
    const localRegExpObject = /another_pattern/;

    assertionUtility.ok(objectDuplicator.typeCheckers.isRegExpInstance(alienRegExpObject), "Should correctly identify a RegExp from an external context.");
    assertionUtility.ok(objectDuplicator.typeCheckers.isRegExpInstance(localRegExpObject), "Should correctly identify a RegExp from the local context.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isArrayInstance(alienRegExpObject), "Should not mistake external RegExp for an Array.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isArrayInstance(localRegExpObject), "Should not mistake local RegExp for an Array.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isDateInstance(alienRegExpObject), "Should not mistake external RegExp for a Date.");
    assertionUtility.ok(!objectDuplicator.typeCheckers.isDateInstance(localRegExpObject), "Should not mistake local RegExp for a Date.");
    assertionUtility.done();
  });
};

// --- New Test Cases / Utility Additions (Type III) ---

module.exports.testBooleanValueDuplication = function (assertionUtility) {
  const truthy = true;
  const falsy = false;
  assertionUtility.strictEqual(objectDuplicator(truthy), truthy, "Boolean true should duplicate without change.");
  assertionUtility.strictEqual(objectDuplicator(falsy), falsy, "Boolean false should duplicate without change.");
  assertionUtility.done();
};

// Adding a new helper function to the duplicator for primitive type checking.
objectDuplicator.isSimplePrimitive = function(value) {
  // Checks if a value is a primitive (excluding functions, which are technically primitive types but behave differently for cloning)
  // and not null (as typeof null is 'object').
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
};

module.exports.testSimplePrimitiveRecognition = function (assertionUtility) {
  assertionUtility.ok(objectDuplicator.isSimplePrimitive(123), "Numbers are simple primitives.");
  assertionUtility.ok(objectDuplicator.isSimplePrimitive("text"), "Strings are simple primitives.");
  assertionUtility.ok(objectDuplicator.isSimplePrimitive(true), "Booleans are simple primitives.");
  assertionUtility.ok(objectDuplicator.isSimplePrimitive(null), "Null is a simple primitive.");
  assertionUtility.ok(objectDuplicator.isSimplePrimitive(undefined), "Undefined is a simple primitive.");
  assertionUtility.ok(!objectDuplicator.isSimplePrimitive({}), "Objects are not simple primitives.");
  assertionUtility.ok(!objectDuplicator.isSimplePrimitive([]), "Arrays are not simple primitives.");
  assertionUtility.ok(!objectDuplicator.isSimplePrimitive(() => {}), "Functions are not simple primitives.");
  assertionUtility.done();
};