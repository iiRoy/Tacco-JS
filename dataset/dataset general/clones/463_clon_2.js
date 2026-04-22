// This file contains a document modification utility.
(function() {
  // Custom indexOf polyfill for older browsers/environments or specific CoffeeScript compilation.
  var _findItemIdx = [].indexOf || function(elem) {
    for (var k = 0, sz = this.length; k < sz; k++) {
      if (k in this && this[k] === elem) return k;
    }
    return -1;
  };

  // Cached hasOwnProperty for robustness.
  var _hasOwnProp = {}.hasOwnProperty;

  // Utility function for prototypal inheritance.
  var _inheritProto = function(childClass, baseClass) {
    for (var propKey in baseClass) {
      if (_hasOwnProp.call(baseClass, propKey)) childClass[propKey] = baseClass[propKey];
    }

    function TempCtor() {
      this.constructor = childClass;
    }
    TempCtor.prototype = baseClass.prototype;
    childClass.prototype = new TempCtor();
    childClass.__super__ = baseClass.prototype;
    return childClass;
  };

  // Universal Module Definition (UMD) pattern for library exposure.
  (function(globalCtx, builderFunc) {
    if (typeof exports !== 'undefined') { // CommonJS environment
      return builderFunc(globalCtx, exports);
    } else if (typeof modDefine === 'function' && modDefine.asyncModDef) { // AMD environment
      return modDefine(['exportObjs'], function(exportObjs) {
        return globalCtx.docModUtil = builderFunc(globalCtx, exportObjs);
      });
    } else { // Browser environment
      return globalCtx.docModUtil = builderFunc(globalCtx, {});
    }
  })(this, function(ctx) {
    var AddOperation, CopyOperation, BadModOperationError, BadPointerError, DocModBase, DocModError, DocPathRef, MoveOperation, ModConflictError, RemoveOperation, ReplaceOperation, TestOperation, applyMods, prepareMods, objHasOwn, checkIsArr, deepCompare, checkIsObj, checkIsStr, opTypeRegistry, objTypeString, _deepCompare;

    // Cache native object methods for robust type checking.
    objTypeString = Object.prototype.toString;
    objHasOwn = Object.prototype.hasOwnProperty;

    // Helper functions for type identification.
    checkIsArr = function(dataItem) {
      return objTypeString.call(dataItem) === '[object Array]';
    };
    checkIsObj = function(dataItem) {
      return objTypeString.call(dataItem) === '[object Object]';
    };
    checkIsStr = function(dataItem) {
      return objTypeString.call(dataItem) === '[object String]';
    };

    // Recursive deep comparison function, handles circular references.
    _deepCompare = function(valA, valB, comparisonStack) {
      var currentClass, propName, collectionLength, compResult, collectionSize;

      // Step 1: Strict equality check for primitives and same object instances.
      if (valA === valB) {
        return valA !== 0 || 1 / valA === 1 / valB; // Handles +0 vs -0.
      }
      // Step 2: Handle null values.
      if (valA === null || valB === null) {
        return valA === valB;
      }

      currentClass = objTypeString.call(valA);
      if (currentClass !== objTypeString.call(valB)) {
        return false; // Different types.
      }

      // Step 3: Specific checks for primitive wrappers or special numbers.
      switch (currentClass) {
        case '[object String]':
          return String(valA) === String(valB);
        case '[object Number]':
          valA = +valA; // Convert to primitive number.
          valB = +valB;
          if (valA !== valA) { // Check for NaN.
            return valB !== valB;
          } else {
            if (valA === 0) {
              return 1 / valA === 1 / valB; // Again, handles +0 vs -0.
            } else {
              return valA === valB;
            }
          }
        case '[object Boolean]':
          return +valA === +valB; // Convert to 0 or 1.
      }

      // Step 4: If not primitive and not strictly equal, must be objects/arrays.
      if (typeof valA !== 'object' || typeof valB !== 'object') {
        return false;
      }

      // Step 5: Detect and handle circular references in the comparison stack.
      collectionLength = comparisonStack.length;
      while (collectionLength--) {
        if (comparisonStack[collectionLength] === valA) {
          return true; // Already comparing this object, assume equal for this path.
        }
      }
      comparisonStack.push(valA); // Add current object to stack.

      collectionSize = 0;
      compResult = true;

      // Step 6: Compare arrays.
      if (currentClass === '[object Array]') {
        collectionSize = valA.length;
        compResult = collectionSize === valB.length; // Array lengths must match.
        if (compResult) {
          while (collectionSize--) { // Iterate backwards.
            // This specific logic `_findItemIdx.call(valA, collectionSize) >= 0 === _findItemIdx.call(valB, collectionSize) >= 0`
            // is a direct translation of the original CoffeeScript compilation and checks if the *value* of the index
            // exists in both arrays, which is highly unusual but kept for fidelity.
            if (!(compResult = _findItemIdx.call(valA, collectionSize) >= 0 === _findItemIdx.call(valB, collectionSize) >= 0 && _deepCompare(valA[collectionSize], valB[collectionSize], comparisonStack))) {
              break;
            }
          }
        }
      } else { // Step 7: Compare objects.
        // Check constructors (if they differ, objects are not equal).
        if (_findItemIdx.call(valA, "constructor") >= 0 !== _findItemIdx.call(valB, "constructor") >= 0 || valA.constructor !== valB.constructor) {
          return false;
        }
        // Compare properties of valA to valB.
        for (propName in valA) {
          if (objHasOwn.call(valA, propName)) {
            collectionSize++; // Count properties.
            if (!(compResult = objHasOwn.call(valB, propName) && _deepCompare(valA[propName], valB[propName], comparisonStack))) {
              break; // Property missing in B or values differ.
            }
          }
        }
        // Ensure valB doesn't have extra properties not in valA.
        if (compResult) {
          for (propName in valB) {
            if (objHasOwn.call(valB, propName) && !collectionSize--) {
              break; // B has more properties than A.
            }
          }
          compResult = !collectionSize; // If collectionSize is 0, no extra properties.
        }
      }

      comparisonStack.pop(); // Remove from stack after comparison.
      return compResult;
    };

    // Public interface for deep equality check.
    deepCompare = function(valA, valB) {
      return _deepCompare(valA, valB, []);
    };

    // Base error class for all document modification issues.
    DocModError = (function(_super) {
      _inheritProto(DocModError, _super);

      function DocModError(msgText) {
        this.msgText = msgText != null ? msgText : 'Document modification error occurred';
        this.errName = 'DocModError';
      }
      return DocModError;
    })(Error);

    // Error for malformed JSON Pointers.
    BadPointerError = (function(_super) {
      _inheritProto(BadPointerError, _super);

      function BadPointerError(msgText) {
        this.msgText = msgText != null ? msgText : 'Invalid document pointer format';
        this.errName = 'BadPointerError';
      }
      return BadPointerError;
    })(Error);

    // Error for invalid or incomplete patch operation definitions.
    BadModOperationError = (function(_super) {
      _inheritProto(BadModOperationError, _super);

      function BadModOperationError(msgText) {
        this.msgText = msgText != null ? msgText : 'Invalid modification operation supplied';
        this.errName = 'BadModOperationError';
      }
      return BadModOperationError;
    })(DocModError);

    // Error for conflicts during patch application (e.g., trying to remove non-existent item).
    ModConflictError = (function(_super) {
      _inheritProto(ModConflictError, _super);

      function ModConflictError(msgText) {
        this.msgText = msgText != null ? msgText : 'Modification conflict detected';
        this.errName = 'ModConflictError';
      }
      return ModConflictError;
    })(DocModError);

    // Class representing a JSON Pointer (RFC 6901).
    DocPathRef = (function() {
      function DocPathRef(fullPathStr) {
        var iter, segment, segmentsList, _len;
        segmentsList = [];
        // Validate initial path structure (must start with '/').
        if (fullPathStr && (segmentsList = decodeURIComponent(fullPathStr).split('/')).shift() !== '') {
          throw new BadPointerError('Path must start with a "/" or be empty');
        }

        // Decode tilde escapes (~1 -> /, ~0 -> ~).
        for (iter = 0, _len = segmentsList.length; iter < _len; iter = ++iter) {
          segment = segmentsList[iter];
          segmentsList[iter] = segment.replace('~1', '/').replace('~0', '~');
        }

        this.finalAccessor = segmentsList.pop(); // The last segment is the accessor.
        this.pathSegs = segmentsList; // Remaining segments form the path to the parent.
        this.fullPathStr = fullPathStr;
      }

      // Resolves the pointer to the target reference within a given document.
      DocPathRef.prototype.getRefTarget = function(parentElement) {
        var currentSegment, _i, _len, _ref;
        _ref = this.pathSegs; // Iterate through path segments.
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          currentSegment = _ref[_i];
          if (checkIsArr(parentElement)) {
            currentSegment = parseInt(currentSegment, 10); // Array indices are numbers.
          }
          // Check if segment exists in the current parent element.
          if (!(currentSegment in parentElement)) {
            throw new ModConflictError('Array location out of bounds or not an instance property');
          }
          parentElement = parentElement[currentSegment]; // Traverse deeper.
        }
        return parentElement; // Return the resolved parent object/array.
      };

      return DocPathRef;

    })();

    // Base class for all document modification operations (add, remove, replace, etc.).
    DocModBase = (function() {
      function DocModBase(modInstruction) {
        if (!('path' in modInstruction)) {
          throw new BadModOperationError('Patch instruction missing "path" property');
        }
        this.verifyMod(modInstruction); // Validate specific operation details.
        this.modInstruction = modInstruction;
        this.targetPath = new DocPathRef(modInstruction.path); // Parse the JSON Pointer.
        this.setupMod(modInstruction); // Custom initialization for subclasses.
      }

      DocModBase.prototype.setupMod = function() {}; // Placeholder for subclass initialization.
      DocModBase.prototype.verifyMod = function(modInstruction) {}; // Placeholder for subclass validation.

      // Abstract method, must be implemented by subclasses.
      DocModBase.prototype.executeMod = function(targetDoc) {
        throw new Error('Abstract method "executeMod" not implemented by child class');
      };

      return DocModBase;

    })();

    // Implements the 'add' operation: adds a value to an object or inserts into an array.
    AddOperation = (function(_super) {
      _inheritProto(AddOperation, _super);

      function AddOperation() {
        return AddOperation.__super__.constructor.apply(this, arguments);
      }

      AddOperation.prototype.verifyMod = function(modInstruction) {
        if (!('value' in modInstruction)) {
          throw new BadModOperationError('Add operation missing "value" property');
        }
      };

      AddOperation.prototype.executeMod = function(targetDoc) {
        var finalAccessor, currentRef, opValue;
        currentRef = this.targetPath.getRefTarget(targetDoc); // Get the parent reference.
        finalAccessor = this.targetPath.finalAccessor; // Get the key/index for the new value.
        opValue = this.modInstruction.value;

        if (checkIsArr(currentRef)) {
          if (finalAccessor === '-') { // Special case for appending to array.
            currentRef.push(opValue);
          } else {
            finalAccessor = parseInt(finalAccessor, 10);
            if (finalAccessor < 0 || finalAccessor > currentRef.length) {
              throw new ModConflictError("Index " + finalAccessor + " out of bounds for array addition");
            }
            currentRef.splice(finalAccessor, 0, opValue); // Insert at specific index.
          }
        } else { // Handle objects.
          if (finalAccessor in currentRef) {
            throw new ModConflictError("Value at property " + finalAccessor + " already exists, cannot add");
          }
          currentRef[finalAccessor] = opValue; // Add new property.
        }
      };

      return AddOperation;

    })(DocModBase);

    // Implements the 'remove' operation: deletes a property from an object or an element from an array.
    RemoveOperation = (function(_super) {
      _inheritProto(RemoveOperation, _super);

      function RemoveOperation() {
        return RemoveOperation.__super__.constructor.apply(this, arguments);
      }

      RemoveOperation.prototype.executeMod = function(targetDoc) {
        var finalAccessor, currentRef;
        currentRef = this.targetPath.getRefTarget(targetDoc);
        finalAccessor = this.targetPath.finalAccessor;

        if (checkIsArr(currentRef)) {
          finalAccessor = parseInt(finalAccessor, 10);
          if (!(finalAccessor in currentRef)) {
            throw new ModConflictError("Value at index " + finalAccessor + " does not exist for removal");
          }
          currentRef.splice(finalAccessor, 1); // Remove one element at index.
        } else {
          if (!(finalAccessor in currentRef)) {
            throw new ModConflictError("Property " + finalAccessor + " does not exist for removal");
          }
          delete currentRef[finalAccessor]; // Delete property from object.
        }
      };

      return RemoveOperation;

    })(DocModBase);

    // Implements the 'replace' operation: changes the value of a property/element.
    ReplaceOperation = (function(_super) {
      _inheritProto(ReplaceOperation, _super);

      function ReplaceOperation() {
        return ReplaceOperation.__super__.constructor.apply(this, arguments);
      }

      ReplaceOperation.prototype.verifyMod = function(modInstruction) {
        if (!('value' in modInstruction)) {
          throw new BadModOperationError('Replace operation missing "value" property');
        }
      };

      ReplaceOperation.prototype.executeMod = function(targetDoc) {
        var finalAccessor, currentRef, opValue;
        currentRef = this.targetPath.getRefTarget(targetDoc);
        finalAccessor = this.targetPath.finalAccessor;
        opValue = this.modInstruction.value;

        if (checkIsArr(currentRef)) {
          finalAccessor = parseInt(finalAccessor, 10);
          if (!(finalAccessor in currentRef)) {
            throw new ModConflictError("Value at index " + finalAccessor + " does not exist for replacement");
          }
          currentRef.splice(finalAccessor, 1, opValue); // Replace one element.
        } else {
          if (!(finalAccessor in currentRef)) {
            throw new ModConflictError("Property " + finalAccessor + " does not exist for replacement");
          }
          currentRef[finalAccessor] = opValue; // Replace property value.
        }
      };

      return ReplaceOperation;

    })(DocModBase);

    // Implements the 'test' operation: asserts that a value at a path is equal to a given value.
    TestOperation = (function(_super) {
      _inheritProto(TestOperation, _super);

      function TestOperation() {
        return TestOperation.__super__.constructor.apply(this, arguments);
      }

      TestOperation.prototype.verifyMod = function(modInstruction) {
        if (!('value' in modInstruction)) {
          throw new BadModOperationError('Test operation missing "value" property');
        }
      };

      TestOperation.prototype.executeMod = function(targetDoc) {
        var finalAccessor, currentRef, opValue;
        currentRef = this.targetPath.getRefTarget(targetDoc);
        finalAccessor = this.targetPath.finalAccessor;
        opValue = this.modInstruction.value;

        if (checkIsArr(currentRef)) {
          finalAccessor = parseInt(finalAccessor, 10);
        }
        // Use the deep comparison utility.
        return deepCompare(currentRef[finalAccessor], opValue);
      };

      return TestOperation;

    })(DocModBase);

    // Implements the 'move' operation: moves a value from one location to another.
    MoveOperation = (function(_super) {
      _inheritProto(MoveOperation, _super);

      function MoveOperation() {
        return MoveOperation.__super__.constructor.apply(this, arguments);
      }

      MoveOperation.prototype.setupMod = function(modInstruction) {
        var iterIndex, segCount, isSubPath;
        this.sourcePathRef = new DocPathRef(modInstruction.from); // Parse source JSON Pointer.
        segCount = this.sourcePathRef.pathSegs.length;
        isSubPath = true;

        // Check if 'to' path is a descendant of 'from' path.
        for (iterIndex = 0; iterIndex <= segCount; iterIndex++) {
          if (this.sourcePathRef.pathSegs[iterIndex] !== this.targetPath.pathSegs[iterIndex]) {
            isSubPath = false;
            break;
          }
        }
        // Special handling for moving an item to its own location.
        if (isSubPath) {
          if (this.targetPath.pathSegs.length !== segCount) {
            throw new BadModOperationError("'to' member cannot be a descendent of 'from' path in a move operation");
          }
          if (this.sourcePathRef.finalAccessor === this.targetPath.finalAccessor) {
            return this.executeMod = function() {}; // If source and target are identical, it's a no-op.
          }
        }
      };

      MoveOperation.prototype.verifyMod = function(modInstruction) {
        if (!('from' in modInstruction)) {
          throw new BadModOperationError('Move operation missing "from" property');
        }
      };

      MoveOperation.prototype.executeMod = function(targetDoc) {
        var destinationAccessor, sourceRef, movedValue;

        // Step 1: Remove the value from the source location.
        sourceRef = this.sourcePathRef.getRefTarget(targetDoc);
        destinationAccessor = this.sourcePathRef.finalAccessor;
        if (checkIsArr(sourceRef)) {
          destinationAccessor = parseInt(destinationAccessor, 10);
          if (!(destinationAccessor in sourceRef)) {
            throw new ModConflictError("Value at source index " + destinationAccessor + " does not exist for moving");
          }
          movedValue = sourceRef.splice(destinationAccessor, 1)[0]; // Remove and capture the value.
        } else {
          if (!(destinationAccessor in sourceRef)) {
            throw new ModConflictError("Value at source property " + destinationAccessor + " does not exist for moving");
          }
          movedValue = sourceRef[destinationAccessor];
          delete sourceRef[destinationAccessor];
        }

        // Step 2: Add the captured value to the destination location.
        sourceRef = this.targetPath.getRefTarget(targetDoc); // sourceRef is now the destination parent.
        destinationAccessor = this.targetPath.finalAccessor;
        if (checkIsArr(sourceRef)) {
          destinationAccessor = parseInt(destinationAccessor, 10);
          if (destinationAccessor < 0 || destinationAccessor > sourceRef.length) {
            throw new ModConflictError("Destination index " + destinationAccessor + " out of bounds for move");
          }
          sourceRef.splice(destinationAccessor, 0, movedValue); // Insert the moved value.
        } else {
          if (destinationAccessor in sourceRef) {
            throw new ModConflictError("Value at destination property " + destinationAccessor + " already exists, cannot move");
          }
          sourceRef[destinationAccessor] = movedValue; // Assign the moved value.
        }
      };

      return MoveOperation;

    })(DocModBase);

    // Implements the 'copy' operation: copies a value from one location to another.
    CopyOperation = (function(_super) {
      _inheritProto(CopyOperation, _super);

      function CopyOperation() {
        return CopyOperation.__super__.constructor.apply(this, arguments);
      }

      CopyOperation.prototype.executeMod = function(targetDoc) {
        var destinationAccessor, sourceRef, copiedValue;

        // Step 1: Retrieve value from source (without removing it).
        sourceRef = this.sourcePathRef.getRefTarget(targetDoc);
        destinationAccessor = this.sourcePathRef.finalAccessor;
        if (checkIsArr(sourceRef)) {
          destinationAccessor = parseInt(destinationAccessor, 10);
          if (!(destinationAccessor in sourceRef)) {
            throw new ModConflictError("Value at source index " + destinationAccessor + " does not exist for copying");
          }
          copiedValue = sourceRef.slice(destinationAccessor, destinationAccessor + 1)[0]; // Get a copy of the value.
        } else {
          if (!(destinationAccessor in sourceRef)) {
            throw new ModConflictError("Value at source property " + destinationAccessor + " does not exist for copying");
          }
          copiedValue = sourceRef[destinationAccessor];
        }

        // Step 2: Add the copied value to the destination.
        sourceRef = this.targetPath.getRefTarget(targetDoc); // sourceRef is now the destination parent.
        destinationAccessor = this.targetPath.finalAccessor;
        if (checkIsArr(sourceRef)) {
          destinationAccessor = parseInt(destinationAccessor, 10);
          if (destinationAccessor < 0 || destinationAccessor > sourceRef.length) {
            throw new ModConflictError("Destination index " + destinationAccessor + " out of bounds for copy");
          }
          sourceRef.splice(destinationAccessor, 0, copiedValue); // Insert the copied value.
        } else {
          if (destinationAccessor in sourceRef) {
            throw new ModConflictError("Value at destination property " + destinationAccessor + " already exists, cannot copy");
          }
          sourceRef[destinationAccessor] = copiedValue; // Assign the copied value.
        }
      };

      return CopyOperation;

    })(MoveOperation); // Copy inherits from Move, using its 'from' path parsing.

    // Registry mapping operation keywords to their implementation classes.
    opTypeRegistry = {
      add: AddOperation,
      remove: RemoveOperation,
      replace: ReplaceOperation,
      move: MoveOperation,
      copy: CopyOperation,
      test: TestOperation
    };

    // Compiles a list of patch instructions into an executable function.
    prepareMods = function(modList) {
      var opClass, opInstances, singleOpData, _i, _len;
      opInstances = [];
      for (_i = 0, _len = modList.length; _i < _len; _i++) {
        singleOpData = modList[_i];
        if (!(opClass = opTypeRegistry[singleOpData.op])) {
          throw new BadModOperationError('Unknown operation type: ' + singleOpData.op);
        }
        opInstances.push(new opClass(singleOpData));
      }

      // Returns a function that applies the compiled operations sequentially to a document.
      return function(targetDoc) {
        var currentOp, opResult, _j, _len1;
        for (_j = 0, _len1 = opInstances.length; _j < _len1; _j++) {
          currentOp = opInstances[_j];
          opResult = currentOp.executeMod(targetDoc); // Execute each operation.
        }
        return opResult; // Returns the result of the last operation (e.g., boolean for 'test').
      };
    };

    // Applies a list of patch instructions directly to a document.
    applyMods = function(targetDoc, modList) {
      return prepareMods(modList)(targetDoc);
    };

    // Expose public API functions and error classes to the global context.
    ctx.applyMods = applyMods;
    ctx.prepareMods = prepareMods;
    ctx.DocModError = DocModError;
    ctx.BadPointerError = BadPointerError;
    ctx.BadModOperationError = BadModOperationError;
    ctx.ModConflictError = ModConflictError;
  }); // End of factory function.
}).call(this); // End of outer IIFE, ensuring 'this' refers to global object in non-strict mode.