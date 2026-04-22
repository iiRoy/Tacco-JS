(function(globalScope, factoryFn) {
  // Universal Module Definition (UMD) pattern adaptation
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS environment
    module.exports = factoryFn(globalScope, exports);
  } else if (typeof define === 'function' && define.amd) {
    // AMD environment
    define(['exports'], function(exports) {
      return globalScope.dataPatcher = factoryFn(globalScope, exports);
    });
  } else {
    // Browser global
    globalScope.dataPatcher = factoryFn(globalScope, {});
  }
})(this, function(currentGlobal) {
  'use strict'; // Enforce strict mode for cleaner code

  // --- Core Utility Functions ---

  // Cache prototype methods for consistency and slight performance
  const objectPrototypeToString = Object.prototype.toString;
  const objectHasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * Checks if a given value is an array.
   * @param {*} val - The value to check.
   * @returns {boolean} - True if the value is an array, false otherwise.
   */
  const isTypeArray = (val) => objectPrototypeToString.call(val) === '[object Array]';

  /**
   * Checks if a given value is a plain object.
   * @param {*} val - The value to check.
   * @returns {boolean} - True if the value is a plain object, false otherwise.
   */
  const isTypeObject = (val) => objectPrototypeToString.call(val) === '[object Object]';

  /**
   * Checks if a given value is a string.
   * @param {*} val - The value to check.
   * @returns {boolean} - True if the value is a string, false otherwise.
   */
  const isTypeString = (val) => objectPrototypeToString.call(val) === '[object String]';

  /**
   * Performs a deep comparison of two values.
   * This function handles primitives, arrays, and plain objects.
   * It detects circular references to prevent infinite loops.
   * @param {*} valA - The first value for comparison.
   * @param {*} valB - The second value for comparison.
   * @param {Array<Object>} [visitedStack=[]] - Internal stack to track visited objects for circular reference detection.
   * @returns {boolean} - True if values are deeply equal, false otherwise.
   */
  const recursiveValueCompare = (valA, valB, visitedStack = []) => {
    // Strict equality check (handles primitives, null, undefined, same object reference)
    if (valA === valB) {
      // Special case for -0 and +0, which are strictly equal but not truly equal in some contexts.
      // This ensures 1 / -0 !== 1 / +0 is true for deep equality, meaning they are not equal.
      return valA !== 0 || 1 / valA === 1 / valB;
    }

    // If one is null/undefined and the other isn't, they are not equal (already handled by valA === valB if both are)
    if (valA == null || valB == null) { // Using == to catch both null and undefined
      return valA === valB;
    }

    // Check if types are different (excluding objects/arrays for now)
    const typeA = objectPrototypeToString.call(valA);
    const typeB = objectPrototypeToString.call(valB);

    if (typeA !== typeB) {
      return false;
    }

    // Handle primitive types wrapped in objects (e.g., new Number(5))
    switch (typeA) {
      case '[object String]':
        return String(valA) === String(valB);
      case '[object Number]':
        // Handle NaN specifically (NaN !== NaN)
        return Number(valA) === Number(valB) || (Number.isNaN(valA) && Number.isNaN(valB));
      case '[object Boolean]':
        return Boolean(valA) === Boolean(valB);
      case '[object Date]':
      case '[object RegExp]':
        return valA.toString() === valB.toString(); // Simple string comparison for these
    }

    // If not a primitive and not an object/array, they are not equal
    if (typeof valA !== 'object' && typeof valB !== 'object') {
      return false;
    }

    // Handle circular references
    let stackLength = visitedStack.length;
    while (stackLength--) {
      if (visitedStack[stackLength] === valA) {
        return true; // Already visited this object in the current comparison path
      }
    }

    // Add current objects to stack to detect circular references
    visitedStack.push(valA);

    let result = true; // Assume equality until proven otherwise
    let propCountA = 0;

    if (isTypeArray(valA)) {
      if (valA.length !== valB.length) {
        result = false;
      } else {
        for (let i = 0; i < valA.length; i++) {
          if (!(result = recursiveValueCompare(valA[i], valB[i], visitedStack))) {
            break;
          }
        }
      }
    } else if (isTypeObject(valA)) {
      // Check constructors for strict object type comparison
      if (valA.constructor !== valB.constructor) {
        result = false;
      } else {
        // Compare properties of objects
        for (const key in valA) {
          if (objectHasOwnProperty.call(valA, key)) {
            propCountA++;
            if (!(result = objectHasOwnProperty.call(valB, key) && recursiveValueCompare(valA[key], valB[key], visitedStack))) {
              break;
            }
          }
        }
        // Ensure valB doesn't have extra properties
        if (result) {
          let propCountB = 0;
          for (const key in valB) {
            if (objectHasOwnProperty.call(valB, key)) {
              propCountB++;
            }
          }
          result = propCountA === propCountB;
        }
      }
    } else {
      // For other object types (e.g., custom classes not derived from Error/Object),
      // consider them unequal by default if their class types don't match or
      // if they are not plain objects/arrays.
      result = false;
    }

    // Remove from stack after comparison
    visitedStack.pop();
    return result;
  };

  /**
   * Public interface for deep value equality comparison.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {boolean} - True if deeply equal, false otherwise.
   */
  const deepValueEquality = (valA, valB) => recursiveValueCompare(valA, valB, []);

  // --- Custom Error Classes for Patching ---

  /**
   * Base class for all patch-related errors.
   * @extends Error
   */
  class PatchErrorBase extends Error {
    constructor(message = 'A generic patch operation error occurred.') {
      super(message);
      this.name = 'PatchErrorBase';
      // Capture stack trace for better debugging in V8
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }

  /**
   * Error indicating an invalid JSON Pointer syntax or structure.
   * @extends PatchErrorBase
   */
  class BadPointerSyntax extends PatchErrorBase {
    constructor(message = 'The provided JSON Pointer is invalid or malformed.') {
      super(message);
      this.name = 'BadPointerSyntax';
    }
  }

  /**
   * Error indicating an invalid patch operation structure.
   * @extends PatchErrorBase
   */
  class MalformedPatchError extends PatchErrorBase {
    constructor(message = 'The patch instruction provided is not well-formed.') {
      super(message);
      this.name = 'MalformedPatchError';
    }
  }

  /**
   * Error indicating a conflict during patch application (e.g., trying to add to an existing key).
   * @extends PatchErrorBase
   */
  class OperationConflictError extends PatchErrorBase {
    constructor(message = 'The patch operation resulted in a conflict with the document structure.') {
      super(message);
      this.name = 'OperationConflictError';
    }
  }

  // --- Path Resolution Logic ---

  /**
   * Parses and resolves JSON Pointers.
   */
  class PathSegmentParser {
    /**
     * Creates an instance of PathSegmentParser.
     * @param {string} rawPathString - The JSON Pointer string (e.g., "/a/b/c").
     * @throws {BadPointerSyntax} If the path is invalid.
     */
    constructor(rawPathString) {
      if (!isTypeString(rawPathString)) {
        throw new BadPointerSyntax('JSON Pointer must be a string.');
      }

      // Decode URI components and split by '/', then remove the initial empty string from split.
      // Example: "/a/b~0c" -> ["", "a", "b~0c"] -> ["a", "b~0c"]
      const initialSegments = decodeURIComponent(rawPathString).split('/');

      if (initialSegments.shift() !== '') {
        // A valid JSON Pointer must start with '/', meaning the first element after split is an empty string.
        // If it's not empty, the path is malformed.
        throw new BadPointerSyntax('JSON Pointer must start with a "/" or be an empty string.');
      }

      // Replace '~1' with '/' and '~0' with '~' in each segment.
      // Using map for a cleaner transformation.
      this.parsedSegments = initialSegments.map(segment =>
        segment.replace(/~1/g, '/').replace(/~0/g, '~')
      );

      // The last segment is the actual property/index to operate on.
      this.finalKeyOrIndex = this.parsedSegments.pop() || ''; // Handle root path '/' where pop returns undefined
      this.rawPathString = rawPathString;
    }

    /**
     * Resolves the parent object or array that contains the target of the pointer.
     * @param {Object|Array} rootDocument - The document to resolve the path within.
     * @returns {Object|Array} The parent object or array.
     * @throws {OperationConflictError} If a path segment does not exist or array index is out of bounds.
     */
    resolveParentContainer(rootDocument) {
      let currentRef = rootDocument;

      for (let i = 0; i < this.parsedSegments.length; i++) {
        let segment = this.parsedSegments[i];

        if (isTypeArray(currentRef)) {
          // For arrays, segment must be a valid integer index.
          const arrayIndex = Number.parseInt(segment, 10);
          if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex >= currentRef.length) {
            throw new OperationConflictError(`Array index '${segment}' out of bounds or invalid during path resolution.`);
          }
          currentRef = currentRef[arrayIndex];
        } else if (isTypeObject(currentRef)) {
          // For objects, segment must be an existing property.
          if (!objectHasOwnProperty.call(currentRef, segment)) {
            throw new OperationConflictError(`Object property '${segment}' does not exist during path resolution.`);
          }
          currentRef = currentRef[segment];
        } else {
          // Cannot traverse into a primitive or null/undefined value
          throw new OperationConflictError(`Cannot resolve path segment '${segment}' on a non-object/non-array value.`);
        }
      }
      return currentRef;
    }
  }

  // --- Base Class for All Patch Operations ---

  /**
   * Abstract base class for all JSON Patch operations.
   */
  class BasePatchInstruction {
    /**
     * @param {Object} instructionData - The raw patch instruction object.
     * @throws {MalformedPatchError} If the patch instruction is missing a 'path' property.
     */
    constructor(instructionData) {
      if (!instructionData || !objectHasOwnProperty.call(instructionData, 'path')) {
        throw new MalformedPatchError('All patch operations must specify a "path" property.');
      }

      this.instructionData = instructionData;
      this.targetPathParser = new PathSegmentParser(instructionData.path);
      this.verifyInstructionSchema(instructionData); // Validate specific properties for the operation type
      this.prepareInstruction(instructionData); // Perform any initial setup
    }

    /**
     * Placeholder method for operation-specific schema validation.
     * Should be overridden by subclasses.
     * @param {Object} instructionData - The raw patch instruction object.
     * @protected
     */
    verifyInstructionSchema(instructionData) {
      // Default validation: none, or common checks
    }

    /**
     * Placeholder method for operation-specific initialization.
     * Should be overridden by subclasses.
     * @param {Object} instructionData - The raw patch instruction object.
     * @protected
     */
    prepareInstruction(instructionData) {
      // Default: no specific preparation
    }

    /**
     * Executes the patch operation on the given document.
     * Must be overridden by subclasses.
     * @param {Object|Array} document - The document to apply the patch to.
     * @returns {*} The result of the operation (e.g., true for 'test' operation).
     * @throws {Error} If not implemented by a subclass.
     */
    executeInstruction(document) {
      throw new Error('Method "executeInstruction" must be implemented by subclasses.');
    }
  }

  // --- Specific Patch Operation Implementations ---

  /**
   * Implements the 'add' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class AddPropertyInstruction extends BasePatchInstruction {
    verifyInstructionSchema(instructionData) {
      if (!objectHasOwnProperty.call(instructionData, 'value')) {
        throw new MalformedPatchError('Add operation requires a "value" property.');
      }
    }

    executeInstruction(document) {
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;
      const newValue = this.instructionData.value;

      if (isTypeArray(parentContainer)) {
        if (targetKeyOrIndex === '-') {
          // Append to the end of the array
          parentContainer.push(newValue);
        } else {
          const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
          if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex > parentContainer.length) {
            throw new OperationConflictError(`Array index '${targetKeyOrIndex}' is out of bounds for add operation.`);
          }
          parentContainer.splice(arrayIndex, 0, newValue);
        }
      } else if (isTypeObject(parentContainer)) {
        if (objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          // JSON Patch 'add' operation cannot replace an existing value in an object.
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' already exists in object; use 'replace' for updates.`);
        }
        parentContainer[targetKeyOrIndex] = newValue;
      } else {
        throw new OperationConflictError(`Cannot add property '${targetKeyOrIndex}' to a non-object/non-array value.`);
      }
    }
  }

  /**
   * Implements the 'remove' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class RemovePropertyInstruction extends BasePatchInstruction {
    executeInstruction(document) {
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;

      if (isTypeArray(parentContainer)) {
        const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
        if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex >= parentContainer.length) {
          throw new OperationConflictError(`Array index '${targetKeyOrIndex}' out of bounds for remove operation.`);
        }
        parentContainer.splice(arrayIndex, 1);
      } else if (isTypeObject(parentContainer)) {
        if (!objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' does not exist in object for remove operation.`);
        }
        delete parentContainer[targetKeyOrIndex];
      } else {
        throw new OperationConflictError(`Cannot remove property '${targetKeyOrIndex}' from a non-object/non-array value.`);
      }
    }
  }

  /**
   * Implements the 'replace' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class ReplacePropertyInstruction extends BasePatchInstruction {
    verifyInstructionSchema(instructionData) {
      if (!objectHasOwnProperty.call(instructionData, 'value')) {
        throw new MalformedPatchError('Replace operation requires a "value" property.');
      }
    }

    executeInstruction(document) {
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;
      const newValue = this.instructionData.value;

      if (isTypeArray(parentContainer)) {
        const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
        if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex >= parentContainer.length) {
          throw new OperationConflictError(`Array index '${targetKeyOrIndex}' out of bounds for replace operation.`);
        }
        parentContainer.splice(arrayIndex, 1, newValue);
      } else if (isTypeObject(parentContainer)) {
        if (!objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' does not exist in object for replace operation.`);
        }
        parentContainer[targetKeyOrIndex] = newValue;
      } else {
        throw new OperationConflictError(`Cannot replace property '${targetKeyOrIndex}' on a non-object/non-array value.`);
      }
    }
  }

  /**
   * Implements the 'test' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class TestPropertyInstruction extends BasePatchInstruction {
    verifyInstructionSchema(instructionData) {
      if (!objectHasOwnProperty.call(instructionData, 'value')) {
        throw new MalformedPatchError('Test operation requires a "value" property.');
      }
    }

    executeInstruction(document) {
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;
      const expectedValue = this.instructionData.value;

      let actualValue;
      if (isTypeArray(parentContainer)) {
        const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
        if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex >= parentContainer.length) {
          throw new OperationConflictError(`Array index '${targetKeyOrIndex}' out of bounds for test operation.`);
        }
        actualValue = parentContainer[arrayIndex];
      } else if (isTypeObject(parentContainer)) {
        if (!objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' does not exist in object for test operation.`);
        }
        actualValue = parentContainer[targetKeyOrIndex];
      } else {
        throw new OperationConflictError(`Cannot test property '${targetKeyOrIndex}' on a non-object/non-array value.`);
      }

      // Use the deep equality check
      if (!deepValueEquality(actualValue, expectedValue)) {
        throw new OperationConflictError(`Test operation failed: value at path '${this.instructionData.path}' is not equal to expected value.`);
      }
      return true; // Indicate success for the test operation
    }
  }

  /**
   * Helper function to extract a value from a source path.
   * @param {Object|Array} document - The root document.
   * @param {PathSegmentParser} sourcePathParser - The parser for the 'from' path.
   * @param {boolean} shouldRemove - If true, the value is removed from its source.
   * @returns {Object} An object containing the extracted value and its source container.
   * @throws {OperationConflictError} If the source path is invalid or value doesn't exist.
   */
  const extractAndOptionallyRemoveValue = (document, sourcePathParser, shouldRemove) => {
    const sourceParent = sourcePathParser.resolveParentContainer(document);
    const sourceKeyOrIndex = sourcePathParser.finalKeyOrIndex;
    let extractedValue;

    if (isTypeArray(sourceParent)) {
      const sourceIndex = Number.parseInt(sourceKeyOrIndex, 10);
      if (Number.isNaN(sourceIndex) || sourceIndex < 0 || sourceIndex >= sourceParent.length) {
        throw new OperationConflictError(`Source array index '${sourceKeyOrIndex}' out of bounds.`);
      }
      extractedValue = sourceParent[sourceIndex];
      if (shouldRemove) {
        sourceParent.splice(sourceIndex, 1);
      }
    } else if (isTypeObject(sourceParent)) {
      if (!objectHasOwnProperty.call(sourceParent, sourceKeyOrIndex)) {
        throw new OperationConflictError(`Source property '${sourceKeyOrIndex}' does not exist.`);
      }
      extractedValue = sourceParent[sourceKeyOrIndex];
      if (shouldRemove) {
        delete sourceParent[sourceKeyOrIndex];
      }
    } else {
      throw new OperationConflictError(`Cannot extract value from a non-object/non-array at source path.`);
    }
    return extractedValue;
  };

  /**
   * Implements the 'move' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class MovePropertyInstruction extends BasePatchInstruction {
    verifyInstructionSchema(instructionData) {
      if (!objectHasOwnProperty.call(instructionData, 'from')) {
        throw new MalformedPatchError('Move operation requires a "from" path.');
      }
    }

    prepareInstruction(instructionData) {
      this.sourcePathParser = new PathSegmentParser(instructionData.from);

      // Optimization: If source and target paths are identical, it's a no-op.
      if (this.sourcePathParser.rawPathString === this.targetPathParser.rawPathString) {
        this.executeInstruction = () => {}; // Override apply to do nothing
        return;
      }

      // Prevent moving an object into one of its own descendants.
      // E.g., moving /a/b to /a/b/c is invalid.
      const sourceSegments = this.sourcePathParser.parsedSegments;
      const targetSegments = this.targetPathParser.parsedSegments;
      const sourceKey = this.sourcePathParser.finalKeyOrIndex;
      const targetKey = this.targetPathParser.finalKeyOrIndex;

      // The "to" path is a descendant of the "from" path if:
      // 1. The "from" path is a prefix of the "to" path (including final segment).
      // 2. The "to" path is strictly longer than the "from" path.
      let isDescendantMoveAttempt = true;
      if (targetSegments.length < sourceSegments.length ||
        (targetSegments.length === sourceSegments.length && targetKey !== sourceKey)) {
        isDescendantMoveAttempt = false; // "to" is not longer or final key differs
      } else {
        // Check if source path is a prefix of target path
        for (let i = 0; i < sourceSegments.length; i++) {
          if (sourceSegments[i] !== targetSegments[i]) {
            isDescendantMoveAttempt = false;
            break;
          }
        }
        if (isDescendantMoveAttempt && sourceKey !== targetSegments[sourceSegments.length]) {
            isDescendantMoveAttempt = false; // Final segments differ
        }
      }

      if (isDescendantMoveAttempt) {
        throw new MalformedPatchError(`Cannot move a value from path '${instructionData.from}' into one of its own descendants at path '${instructionData.path}'.`);
      }
    }

    executeInstruction(document) {
      // 1. Extract and remove the value from the source path
      const valueToMove = extractAndOptionallyRemoveValue(document, this.sourcePathParser, true);

      // 2. Add the value to the target path (similar to 'add' operation)
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;

      if (isTypeArray(parentContainer)) {
        if (targetKeyOrIndex === '-') {
          parentContainer.push(valueToMove);
        } else {
          const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
          if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex > parentContainer.length) {
            throw new OperationConflictError(`Array index '${targetKeyOrIndex}' out of bounds for move operation target.`);
          }
          parentContainer.splice(arrayIndex, 0, valueToMove);
        }
      } else if (isTypeObject(parentContainer)) {
        if (objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' already exists at target for move operation; use 'replace' if overwriting is intended.`);
        }
        parentContainer[targetKeyOrIndex] = valueToMove;
      } else {
        throw new OperationConflictError(`Cannot move value to a non-object/non-array at target path '${this.instructionData.path}'.`);
      }
    }
  }

  /**
   * Implements the 'copy' JSON Patch operation.
   * @extends BasePatchInstruction
   */
  class CopyPropertyInstruction extends BasePatchInstruction {
    verifyInstructionSchema(instructionData) {
      if (!objectHasOwnProperty.call(instructionData, 'from')) {
        throw new MalformedPatchError('Copy operation requires a "from" path.');
      }
    }

    prepareInstruction(instructionData) {
      this.sourcePathParser = new PathSegmentParser(instructionData.from);
    }

    executeInstruction(document) {
      // 1. Extract the value from the source path (without removing it)
      const valueToCopy = extractAndOptionallyRemoveValue(document, this.sourcePathParser, false);

      // 2. Add the value to the target path (similar to 'add' operation)
      const parentContainer = this.targetPathParser.resolveParentContainer(document);
      const targetKeyOrIndex = this.targetPathParser.finalKeyOrIndex;

      if (isTypeArray(parentContainer)) {
        if (targetKeyOrIndex === '-') {
          parentContainer.push(valueToCopy);
        } else {
          const arrayIndex = Number.parseInt(targetKeyOrIndex, 10);
          if (Number.isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex > parentContainer.length) {
            throw new OperationConflictError(`Array index '${targetKeyOrIndex}' out of bounds for copy operation target.`);
          }
          parentContainer.splice(arrayIndex, 0, valueToCopy);
        }
      } else if (isTypeObject(parentContainer)) {
        if (objectHasOwnProperty.call(parentContainer, targetKeyOrIndex)) {
          throw new OperationConflictError(`Property '${targetKeyOrIndex}' already exists at target for copy operation; use 'replace' if overwriting is intended.`);
        }
        parentContainer[targetKeyOrIndex] = valueToCopy;
      } else {
        throw new OperationConflictError(`Cannot copy value to a non-object/non-array at target path '${this.instructionData.path}'.`);
      }
    }
  }

  // --- Patch Processor and Public API ---

  // Map patch operation names to their respective class constructors
  const instructionTypeMap = {
    add: AddPropertyInstruction,
    remove: RemovePropertyInstruction,
    replace: ReplacePropertyInstruction,
    move: MovePropertyInstruction,
    copy: CopyPropertyInstruction,
    test: TestPropertyInstruction
  };

  /**
   * Compiles an array of JSON Patch instructions into a single, executable function.
   * This function can then be called repeatedly with different documents.
   * @param {Array<Object>} patchInstructions - An array of JSON Patch instruction objects.
   * @returns {Function(Object|Array): (Object|Array|boolean)} A function that takes a document and applies the compiled patch.
   *                                                              Returns the modified document or `true` if the last operation was a successful 'test'.
   * @throws {MalformedPatchError} If any instruction in the patch is malformed or has an unknown operation type.
   */
  const createPatchProcessor = (patchInstructions) => {
    if (!isTypeArray(patchInstructions)) {
      throw new MalformedPatchError('Patch instructions must be provided as an array.');
    }

    const compiledOperations = [];
    for (const instruction of patchInstructions) {
      if (!instruction || !isTypeObject(instruction) || !objectHasOwnProperty.call(instruction, 'op')) {
        throw new MalformedPatchError('Each patch instruction must be an object with an "op" property.');
      }

      const OperationClass = instructionTypeMap[instruction.op];
      if (!OperationClass) {
        throw new MalformedPatchError(`Unknown patch operation type: '${instruction.op}'.`);
      }
      compiledOperations.push(new OperationClass(instruction));
    }

    /**
     * Applies the compiled patch operations to a given document.
     * @param {Object|Array} documentToPatch - The document to modify.
     * @returns {Object|Array|boolean} The modified document, or `true` if the last operation was a successful 'test'.
     */
    return function(documentToPatch) {
      // Create a deep copy of the document to ensure non-mutating behavior if desired,
      // or work directly on the provided document if mutation is acceptable.
      // For JSON Patch, the standard behavior is to mutate the provided document.
      // If a non-mutating version is needed, the user should provide a deep copy.

      let operationResult;
      for (const opInstance of compiledOperations) {
        operationResult = opInstance.executeInstruction(documentToPatch);
      }
      return operationResult === true ? true : documentToPatch; // Return true for 'test' success, otherwise the (potentially modified) document
    };
  };

  /**
   * Applies a set of JSON Patch instructions to a document.
   * This is a convenience function that compiles and immediately applies the patch.
   * For applying the same patch multiple times, `createPatchProcessor` is more efficient.
   * @param {Object|Array} document - The document to modify.
   * @param {Array<Object>} patchInstructions - An array of JSON Patch instruction objects.
   * @returns {Object|Array|boolean} The modified document, or `true` if the last operation was a successful 'test'.
   * @throws {PatchErrorBase} Any specific patch error.
   */
  const processDocumentWithPatch = (document, patchInstructions) => {
    const patchExecutor = createPatchProcessor(patchInstructions);
    return patchExecutor(document);
  };

  // --- Export Public API ---
  currentGlobal.processDocumentWithPatch = processDocumentWithPatch;
  currentGlobal.createPatchProcessor = createPatchProcessor;
  currentGlobal.PatchErrorBase = PatchErrorBase;
  currentGlobal.BadPointerSyntax = BadPointerSyntax;
  currentGlobal.MalformedPatchError = MalformedPatchError;
  currentGlobal.OperationConflictError = OperationConflictError;

  // Return the public API for module systems
  return {
    apply: processDocumentWithPatch,
    compile: createPatchProcessor,
    PatchErrorBase: PatchErrorBase,
    BadPointerSyntax: BadPointerSyntax,
    MalformedPatchError: MalformedPatchError,
    OperationConflictError: OperationConflictError
  };
});