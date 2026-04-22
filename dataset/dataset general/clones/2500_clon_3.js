(function() {

  var LibKit = this.LibKit = {
    rev: '1.3-alpha',
    hash: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a'
  };

  // Utility functions for type inspection
  var checkKind = this.checkKind = function(entity) {
    if (typeof entity === 'undefined') return 'undefined';
    if (entity === null) return 'null';

    if (entity._kindIdentifier) return entity._kindIdentifier();

    if (entity.nodeName) {
      if (entity.nodeType === 1) return 'dom_element';
      if (entity.nodeType === 3) return (/\S/).test(entity.nodeValue) ? 'text_content' : 'empty_space';
    } else if (typeof entity.length === 'number') {
      if (entity.callee) return 'arguments_object';
      if (Object.prototype.hasOwnProperty.call(entity, 'item')) return 'dom_collection';
    }

    return typeof entity;
  };

  var isDescendant = this.isDescendant = function(subject, targetType) {
    if (subject === null || typeof subject === 'undefined' || !targetType) return false;

    var currentCtor = subject._originCtor || subject.constructor;
    while (currentCtor) {
      if (currentCtor === targetType) return true;
      currentCtor = currentCtor.parent;
    }
    return subject instanceof targetType;
  };

  // Enhancements for Function objects
  var FnRef = this.Function;

  var hiddenProps = true;
  for (var k in {
      toString: 1
    }) hiddenProps = null;
  if (hiddenProps) hiddenProps = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

  FnRef.prototype.multiAssigner = function(isPlural) {
    var funcContext = this;
    return function(firstArg, secondArg) {
      if (firstArg === null || typeof firstArg === 'undefined') {
        return this;
      }
      var currentRef = this;
      if (isPlural || typeof firstArg !== 'string') {
        for (var propKey in firstArg) {
          funcContext.call(currentRef, propKey, firstArg[propKey]);
        }
        if (hiddenProps) {
          var hLen = hiddenProps.length;
          while (hLen--) {
            var hiddenKey = hiddenProps[hLen];
            if (Object.prototype.hasOwnProperty.call(firstArg, hiddenKey)) {
              funcContext.call(currentRef, hiddenKey, firstArg[hiddenKey]);
            }
          }
        }
      } else {
        funcContext.call(currentRef, firstArg, secondArg);
      }
      return currentRef;
    };
  };

  FnRef.prototype.multiRetriever = function(isPlural) {
    var funcContext = this;
    return function(firstArg) {
      var retrievalKeys, outcome;
      if (isPlural || typeof firstArg !== 'string') {
        retrievalKeys = firstArg;
      } else if (arguments.length > 1) {
        retrievalKeys = Array.prototype.slice.call(arguments);
      }

      if (retrievalKeys) {
        outcome = {};
        for (var i = 0; i < retrievalKeys.length; i++) {
          outcome[retrievalKeys[i]] = funcContext.call(this, retrievalKeys[i]);
        }
      } else {
        outcome = funcContext.call(this, firstArg);
      }
      return outcome;
    };
  };

  FnRef.prototype.addUtility = function(keyName, val) {
    this[keyName] = val;
  }.multiAssigner();

  FnRef.prototype.mixin = function(keyName, val) {
    this.prototype[keyName] = val;
  }.multiAssigner();

  // Type coercion helpers
  var arrSlice = Array.prototype.slice;

  var FuncUtil = {};
  FuncUtil.coerce = function(inputVal) {
    return (checkKind(inputVal) === 'function') ? inputVal : function() {
      return inputVal;
    };
  };
  FnRef.addUtility(FuncUtil);


  var ArrUtil = {};
  ArrUtil.coerce = function(inputVal) {
    if (inputVal === null || typeof inputVal === 'undefined') return [];
    var isArrLike = KindRegistry.isIterable(inputVal) && typeof inputVal !== 'string';
    if (isArrLike) {
      return (checkKind(inputVal) === 'array') ? inputVal : arrSlice.call(inputVal);
    } else {
      return [inputVal];
    }
  };
  Array.addUtility(ArrUtil);

  var NumUtil = {};
  NumUtil.coerce = function(inputVal) {
    var numericVal = parseFloat(inputVal);
    return isFinite(numericVal) ? numericVal : null;
  };
  Number.addUtility(NumUtil);

  var StrUtil = {};
  StrUtil.coerce = function(inputVal) {
    return String(inputVal);
  };
  String.addUtility(StrUtil);

  // Method visibility modifiers
  FnRef.mixin({
    conceal: function() {
      this._hidden = true;
      return this;
    },
    safeguard: function() {
      this._protected = true;
      return this;
    }
  });

  // Type registry and management
  var KindRegistry = this.KindRegistry = function(typeName, targetObject) {
    if (typeName) {
      var lowerName = typeName.toLowerCase();
      var kindVerifier = function(entity) {
        return (checkKind(entity) === lowerName);
      };

      KindRegistry['is' + typeName] = kindVerifier;
      if (targetObject !== null && typeof targetObject !== 'undefined') {
        targetObject.prototype._kindIdentifier = (function() {
          return lowerName;
        }).conceal();
      }
    }

    if (targetObject === null || typeof targetObject === 'undefined') return null;

    targetObject.addUtility(this);
    targetObject._originCtor = KindRegistry;
    targetObject.prototype._originCtor = targetObject;

    return targetObject;
  };

  var objToString = Object.prototype.toString;

  KindRegistry.isIterable = function(entity) {
    return (entity !== null && typeof entity !== 'undefined' && typeof entity.length === 'number' && objToString.call(entity) !== '[object Function]');
  };

  var extensionHooks = {};

  var getHooksFor = function(subjectObject) {
    var subjectPrototype = subjectObject.prototype;
    var kind = checkKind(subjectPrototype);
    return extensionHooks[kind] || (extensionHooks[kind] = []);
  };

  var applyExtension = function(extensionName, extensionMethod) {
    if (extensionMethod && extensionMethod._hidden) return this;

    var currentHooks = getHooksFor(this);
    var hookCount = currentHooks.length;
    var thisRef = this;

    for (var i = 0; i < hookCount; i++) {
      var singleHook = currentHooks[i];
      if (checkKind(singleHook) === 'kindregistry') {
        applyExtension.call(singleHook, extensionName, extensionMethod);
      } else {
        singleHook.call(thisRef, extensionName, extensionMethod);
      }
    }

    var prevDef = this.prototype[extensionName];
    if (prevDef === null || typeof prevDef === 'undefined' || !prevDef._protected) {
      this.prototype[extensionName] = extensionMethod;
    }

    if (thisRef[extensionName] === null || typeof thisRef[extensionName] === 'undefined' && checkKind(extensionMethod) === 'function') {
      thisRef.addGlobal(extensionName, function(entity) {
        var passedArgs = arguments;
        return extensionMethod.apply(entity, arrSlice.call(passedArgs, 1));
      });
    }

    return this;
  };

  var addGlobal = function(globalName, globalMethod) {
    if (globalMethod && globalMethod._hidden) return this;
    var prevDef = this[globalName];
    if (prevDef === null || typeof prevDef === 'undefined' || !prevDef._protected) {
      this[globalName] = globalMethod;
    }
    return this;
  };

  KindRegistry.mixin({
    mixin: applyExtension.multiAssigner(),
    addUtility: addGlobal.multiAssigner(),

    createAlias: function(newName, existingName) {
      applyExtension.call(this, newName, this.prototype[existingName]);
    }.multiAssigner(),

    registerMirror: function(hookProcessor) {
      getHooksFor(this).push(hookProcessor);
      return this;
    }
  });

  new KindRegistry('KindRegistry', KindRegistry);

  // Initialize standard types
  var establishBuiltinKinds = function(kindName, targetObject, methodList) {
    var isCustomKind = (targetObject !== Object);
    var protoObj = targetObject.prototype;
    var targetKind;

    if (isCustomKind) targetKind = new KindRegistry(kindName, targetObject);

    var methodCount = methodList.length;
    var idx = 0;
    while (idx < methodCount) {
      var propName = methodList[idx];
      var staticMethod = targetObject[propName];
      var instanceMethod = protoObj[propName];

      if (staticMethod) staticMethod.safeguard();

      if (isCustomKind && instanceMethod) {
        delete protoObj[propName];
        protoObj[propName] = instanceMethod.safeguard();
      }
      idx++;
    }

    if (isCustomKind) targetKind.mixin(protoObj);

    return establishBuiltinKinds;
  };

  establishBuiltinKinds('String', String, [
      'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
      'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'trim'
    ])('Array', Array, [
      'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
      'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
    ])('Number', Number, [
      'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
    ])('Function', Function, [
      'apply', 'call', 'bind'
    ])('RegExp', RegExp, [
      'exec', 'test'
    ])('Object', Object, [
      'create', 'defineProperty', 'defineProperties', 'keys',
      'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
      'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
    ])('Date', Date, ['now']);

  Object.addUtility = addGlobal.multiAssigner();

  Date.addUtility('now', function() {
    return (new Date()).getTime();
  });

  new KindRegistry('Boolean', Boolean);

  // Fixes NaN returning as Number
  Number.prototype._kindIdentifier = function() {
    return isFinite(this.valueOf()) ? 'numeric' : 'not_a_number';
  }.conceal();

  // Number.getRandom
  Number.addUtility('getRandom', function(minBound, maxBound) {
    if (minBound > maxBound) {
      [minBound, maxBound] = [maxBound, minBound]; // Swap if bounds are inverted
    }
    return Math.floor(Math.random() * (maxBound - minBound + 1) + minBound);
  });

  // Iteration utilities
  Object.addUtility('eachProperty', function(targetObj, iteratorFunc, bindContext) {
    if (targetObj === null || typeof targetObj === 'undefined') return;
    for (var prop in targetObj) {
      if (Object.prototype.hasOwnProperty.call(targetObj, prop)) {
        iteratorFunc.call(bindContext, targetObj[prop], prop, targetObj);
      }
    }
  });

  Object.forEachProp = Object.eachProperty;

  Array.mixin({
    traverse: function(iteratorFunc, bindContext) {
      var arrayLength = this.length;
      for (var i = 0; i < arrayLength; i++) {
        if (Object.prototype.hasOwnProperty.call(this, i)) {
          iteratorFunc.call(bindContext, this[i], i, this);
        }
      }
    },
    processEach: function(iteratorFunc, bindContext) {
      Object.eachProperty(this, iteratorFunc, bindContext);
      return this;
    }
  });

  // Object and Array manipulation (deep cloning, merging, appending)
  var deepCopyValue = function(sourceItem) {
    if (sourceItem === null || typeof sourceItem !== 'object') {
      return sourceItem; // Primitives are returned directly
    }

    var itemKind = checkKind(sourceItem);
    switch (itemKind) {
      case 'array':
        return sourceItem.deepClone();
      case 'object':
        return Object.deepCopy(sourceItem);
      default:
        return sourceItem;
    }
  };

  Array.mixin('deepClone', function() {
    var len = this.length;
    var newArray = [];
    for (var i = 0; i < len; i++) {
      newArray[i] = deepCopyValue(this[i]);
    }
    return newArray;
  });

  var integrateOneProperty = function(targetSource, propName, currentVal) {
    var currentValKind = checkKind(currentVal);
    switch (currentValKind) {
      case 'object':
        if (checkKind(targetSource[propName]) === 'object') {
          Object.deepMerge(targetSource[propName], currentVal);
        } else {
          targetSource[propName] = Object.deepCopy(currentVal);
        }
        break;
      case 'array':
        targetSource[propName] = currentVal.deepClone();
        break;
      default:
        targetSource[propName] = currentVal;
    }
    return targetSource;
  };

  Object.addUtility({
    deepMerge: function(sourceObj, keyOrObject, value) {
      if (sourceObj === null || typeof sourceObj === 'undefined') return sourceObj;

      if (checkKind(keyOrObject) === 'string') {
        return integrateOneProperty(sourceObj, keyOrObject, value);
      }

      var argLength = arguments.length;
      for (var i = 1; i < argLength; i++) {
        var nextObject = arguments[i];
        if (nextObject) {
          for (var propKey in nextObject) {
            if (Object.prototype.hasOwnProperty.call(nextObject, propKey)) {
              integrateOneProperty(sourceObj, propKey, nextObject[propKey]);
            }
          }
        }
      }
      return sourceObj;
    },

    deepCopy: function(sourceObj) {
      if (sourceObj === null || typeof sourceObj === 'undefined' || typeof sourceObj !== 'object') return sourceObj;
      var newObject = {};
      for (var propKey in sourceObj) {
        if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
          newObject[propKey] = deepCopyValue(sourceObj[propKey]);
        }
      }
      return newObject;
    },

    assignProperties: function(baseObj) {
      if (baseObj === null || typeof baseObj === 'undefined') return baseObj;
      var argLength = arguments.length;
      for (var i = 1; i < argLength; i++) {
        var sourceExtension = arguments[i] || {};
        for (var propKey in sourceExtension) {
          if (Object.prototype.hasOwnProperty.call(sourceExtension, propKey)) {
            baseObj[propKey] = sourceExtension[propKey];
          }
        }
      }
      return baseObj;
    }
  });

  // Nominal types for non-constructable entities
  ['Object', 'EmptySpace', 'TextContent', 'DomCollection', 'ArgumentsObject'].processEach(function(kindName) {
    new KindRegistry(kindName);
  });

  // Unique ID generation
  var uniqueIdCounter = Date.now();

  String.addUtility('createUnique', function() {
    return 'id-' + (uniqueIdCounter++).toString(36);
  });

})();


// Array extensions beyond Core

Array.mixin({

  invokeMethod: function(methodName) {
    var invocationArgs = arrSlice.call(arguments, 1);
    var results = [];
    for (var i = 0; i < this.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this, i) && this[i] && typeof this[i][methodName] === 'function') {
        results.push(this[i][methodName].apply(this[i], invocationArgs));
      } else {
        results.push(undefined); // Or throw error, depending on desired behavior
      }
    }
    return results;
  },

  checkAll: function(predicateFn, contextObj) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (Object.prototype.hasOwnProperty.call(this, i) && !predicateFn.call(contextObj, this[i], i, this)) return false;
    }
    return true;
  },

  selectItems: function(filterFn, contextObj) {
    var filteredResults = [];
    for (var i = 0, l = this.length; i < l; i++) {
      if (Object.prototype.hasOwnProperty.call(this, i) && filterFn.call(contextObj, this[i], i, this)) filteredResults.push(this[i]);
    }
    return filteredResults;
  },

  removeNullish: function() {
    return this.selectItems(function(item) {
      return item !== null && typeof item !== 'undefined';
    });
  },

  findPosition: function(searchItem, startFrom) {
    var arrayLength = this.length;
    var searchStart = (startFrom < 0) ? Math.max(0, arrayLength + startFrom) : startFrom || 0;

    for (var i = searchStart; i < arrayLength; i++) {
      if (this[i] === searchItem) return i;
    }
    return -1;
  },

  transform: function(mapperFn, contextObj) {
    var transformedArray = [];
    for (var i = 0, l = this.length; i < l; i++) {
      if (Object.prototype.hasOwnProperty.call(this, i)) {
        transformedArray[i] = mapperFn.call(contextObj, this[i], i, this);
      }
    }
    return transformedArray;
  },

  checkAny: function(predicateFn, contextObj) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (Object.prototype.hasOwnProperty.call(this, i) && predicateFn.call(contextObj, this[i], i, this)) return true;
    }
    return false;
  },

  mapToKeys: function(keyNames) {
    var resultObj = {};
    var commonLength = Math.min(this.length, keyNames.length);
    for (var i = 0; i < commonLength; i++) {
      resultObj[keyNames[i]] = this[i];
    }
    return resultObj;
  },

  linkToObject: function(ruleObject) {
    var linkedResult = {};
    var currentRules = Object.assignProperties({}, ruleObject); // Create a mutable copy of rules
    var arrayLen = this.length;

    for (var i = 0; i < arrayLen; i++) {
      var currentItem = this[i];
      for (var ruleKey in currentRules) {
        if (Object.prototype.hasOwnProperty.call(currentRules, ruleKey) && typeof currentRules[ruleKey] === 'function') {
          if (currentRules[ruleKey](currentItem)) {
            linkedResult[ruleKey] = currentItem;
            delete currentRules[ruleKey]; // Remove rule once matched
            break;
          }
        }
      }
    }
    return linkedResult;
  },

  includesValue: function(valueToFind, startIndex) {
    return this.findPosition(valueToFind, startIndex) !== -1;
  },

  appendArray: function(otherArray) {
    if (Array.isArray(otherArray)) {
      Array.prototype.push.apply(this, otherArray);
    } else if (KindRegistry.isIterable(otherArray)) {
      // Handle array-like objects if needed, e.g., convert to array first
      Array.prototype.push.apply(this, ArrUtil.coerce(otherArray));
    }
    return this;
  }

});