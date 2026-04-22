(function(void 0) {
  // The Core library object that is exposed globally
  var Core = this.Core = {};

  // Most basic entity class
  function BaseEntity() {}

  // Standard entity class
  function GenericEntity() {}

  // Type descriptor class
  function TypeDescriptor() {}

  // The type of the null reference
  function NullDescriptor() {}

  // GlobalNamespace is utilized for inheriting constants from the top namespace
  var GlobalNamespace = function() {};

  // Core acts as the main global namespace
  GlobalNamespace.prototype = Core;

  // To facilitate namespace inheritance
  Core.instanceFactory = GlobalNamespace;

  // This is a valuable reference to the global object within ruby files
  Core.globalContext = this;

  // Optimize frequently used function calls
  var _ownProp = Core.hasOwnProp = Object.prototype.hasOwnProperty;
  var _arrSlice = Core.arraySlice = Array.prototype.slice;

  // Generates a unique identifier for each ruby object
  var _nextUniqueId = 0;

  // Returns the subsequent unique identifier
  Core.generateId = function() {
    return _nextUniqueId++;
  };

  // Table to hold all class-level variables
  Core.classVariables = {};

  // Global variables table
  Core.globalVariables = {};

  Core.createClass = function(parentScope, baseType, identifier, constructorFunc) {
    var newClass;
    if (parentScope._isInstance) {
      parentScope = parentScope._typeRef;
    }

    if (baseType === void 0) {
      baseType = GenericEntity;
    }

    if (_ownProp.call(parentScope._namespace, identifier)) {
      newClass = parentScope._namespace[identifier];
    } else {
      if (!baseType._instanceMethods) {
        var proxiedType = baseType;
        baseType = GenericEntity;
        newClass = proxyClass(proxiedType);
      } else {
        newClass = initializeClass(baseType, constructorFunc);
      }

      newClass._typeName = (parentScope === GenericEntity ? identifier : parentScope._typeName + '::' + identifier);

      var scopeAllocator = function() {};
      var classScope = scopeAllocator.prototype = new parentScope._namespace.instanceFactory();
      newClass._namespace = classScope;
      classScope.typeBase = newClass;
      classScope.instanceFactory = scopeAllocator;

      parentScope[identifier] = parentScope._namespace[identifier] = newClass;

      if (baseType.$typeInherited) {
        baseType.$typeInherited(newClass);
      }
    }

    return newClass;
  };

  // Define a new module (or retrieve an existing one)
  Core.createModule = function(parentScope, identifier, constructorFunc) {
    var moduleRef;
    if (parentScope._isInstance) {
      parentScope = parentScope._typeRef;
    }

    if (_ownProp.call(parentScope._namespace, identifier)) {
      moduleRef = parentScope._namespace[identifier];
    } else {
      moduleRef = initializeClass(TypeDescriptor, constructorFunc);
      moduleRef._typeName = (parentScope === GenericEntity ? identifier : parentScope._typeName + '::' + identifier);

      moduleRef.$moduleIncludes = [];

      var scopeAllocator = function() {};
      var classScope = scopeAllocator.prototype = new parentScope._namespace.instanceFactory();
      moduleRef._namespace = classScope;
      classScope.instanceFactory = scopeAllocator;

      parentScope[identifier] = parentScope._namespace[identifier] = moduleRef;
    }

    return moduleRef;
  };

  // Utility function to raise a "no block provided" error
  var noBlockProvided = function() {
    throw new TypeError('no block provided');
  };

  // Set up a fundamental type (creates instances).
  var setupBaseType = function(identifier, typeConstructor, baseType) {
    if (baseType) {
      var tempCtor = function() {};
      tempCtor.prototype = baseType.prototype;

      typeConstructor.prototype = new tempCtor();
    }

    var typeProto = typeConstructor.prototype;

    typeProto.constructor = typeConstructor;
    typeProto._isInstance = !0;
    typeProto._typeRef = typeConstructor;

    typeConstructor._childTypes = [];
    typeConstructor._moduleIncludes = [];
    typeConstructor._isType = !0;
    typeConstructor._typeName = identifier;
    typeConstructor._parentType = baseType;
    typeConstructor._instanceMethods = [];
    typeConstructor._staticMethods = [];
    typeConstructor._isInstance = !1;

    typeConstructor._publishMethods = _publishMethods;
    typeConstructor._defineStatic = _defineStatic;

    typeConstructor['$typeEquals'] = type_equality;
    typeConstructor.$toStr = type_toString;
    typeConstructor.toString = type_toString;

    Core[identifier] = typeConstructor;

    return typeConstructor;
  };

  // Create a generic type with a specified supertype.
  var initializeClass = Core.initType = function(baseType, typeConstructor) {
    var tempCtor = function() {};
    tempCtor.prototype = baseType.prototype;

    typeConstructor.prototype = new tempCtor();
    var typeProto = typeConstructor.prototype;

    typeProto._typeRef = typeConstructor;
    typeProto.constructor = typeConstructor;

    typeConstructor._childTypes = [];
    typeConstructor._moduleIncludes = [];
    typeConstructor._isType = !0;
    typeConstructor._parentType = baseType;
    typeConstructor._instanceMethods = [];
    typeConstructor._isInstance = !1;
    typeConstructor._typeRef = TypeDescriptor;
    typeConstructor._publishMethods = _publishMethods;
    typeConstructor._defineStatic = _defineStatic;

    typeConstructor['$typeEquals'] = type_equality;
    typeConstructor.$toStr = type_toString;
    typeConstructor.toString = type_toString;

    typeConstructor['$arrayAccess'] = void 0;
    typeConstructor['$invoke'] = void 0;

    var parentStaticMethods;

    parentStaticMethods = baseType._staticMethods.slice();

    typeConstructor._staticMethods = parentStaticMethods;
    for (var idx = 0, len = parentStaticMethods.length; idx < len; idx++) {
      var methodName = parentStaticMethods[idx];
      typeConstructor[methodName] = baseType[methodName];
    }

    baseType._childTypes.push(typeConstructor);

    return typeConstructor;
  };

  var proxyClass = function(typeConstructor) {
    typeConstructor.prototype._typeRef = typeConstructor;

    typeConstructor._childTypes = [];
    typeConstructor._moduleIncludes = [];
    typeConstructor._isType = !0;
    typeConstructor._parentType = GenericEntity;
    typeConstructor._typeRef = TypeDescriptor;
    typeConstructor._instanceMethods = [];
    typeConstructor._staticMethods = [];
    typeConstructor._isInstance = !1;

    typeConstructor._publishMethods = function() {};
    typeConstructor._defineStatic = _defineStatic;

    typeConstructor['$typeEquals'] = type_equality;
    typeConstructor.$toStr = type_toString;
    typeConstructor.toString = type_toString;

    var parentStaticMethods = typeConstructor._staticMethods = TypeDescriptor._instanceMethods.slice();
    for (var idx = 0, len = parentStaticMethods.length; idx < len; idx++) {
      var methodName = parentStaticMethods[idx];
      typeConstructor[methodName] = GenericEntity[methodName];
    }

    proxiedTypes.push(typeConstructor);

    var protoTable = GenericEntity.prototype,
      methodsList = GenericEntity._instanceMethods;

    for (var idx = 0, len = methodsList.length; idx < len; idx++) {
      var methodName = methodsList[idx];
      typeConstructor.prototype[methodName] = protoTable[methodName];
    }

    typeConstructor._staticMethods.push('$allocateInstance');

    return typeConstructor;
  };

  Core.printLine = function(argVal) {
    console.log(argVal);
  };

  // Method invocation dispatcher for missing methods
  Core.methodMissingDispatcher = function(methodIdent) {
    var missingMethodHandler = function() {
      var invocationArgs = _arrSlice.call(arguments);

      if (this.$callMissingMethod) {
        this.$callMissingMethod._p = missingMethodHandler._p;
        return this.$callMissingMethod.apply(this, [methodIdent].concat(invocationArgs));
      } else {
        return invokeNativeMethod(this, methodIdent, invocationArgs);
      }
    };

    return missingMethodHandler;
  };

  // Dispatch a method to a native object
  var invokeNativeMethod = function(targetObj, methodIdent, argumentList) {
    var memberRef, codeBlock = invokeNativeMethod._p;
    invokeNativeMethod._p = void 0;

    if (memberRef = platformMethods[methodIdent]) {
      return memberRef(targetObj, argumentList, codeBlock);
    }

    memberRef = targetObj[methodIdent];

    if (typeof(memberRef) === "function") {
      memberRef = memberRef.apply(targetObj, argumentList.$toNative());
    } else if (methodIdent.charAt(methodIdent.length - 1) === "=") {
      memberRef = methodIdent.slice(0, methodIdent.length - 1);
      return targetObj[memberRef] = argumentList[0];
    }

    if (memberRef != void 0) {
      return memberRef;
    }

    return nullRef;
  };

  var platformMethods = {
    "equals": function(targetObj, args) {
      return targetObj === args[0];
    },

    "atIndex": function(targetObj, args) {
      var memberRef = targetObj[args[0]];

      if (memberRef != void 0) {
        return memberRef;
      }

      return nullRef;
    },

    "respondsTo": function(targetObj, args) {
      return targetObj[args[0]] != void 0;
    },

    "iterate": function(targetObj, args, codeBlock) {
      var itemRef;

      if (targetObj.length === +targetObj.length) {
        for (var idx = 0, len = targetObj.length; idx < len; idx++) {
          itemRef = targetObj[idx];

          if (itemRef == void 0) {
            itemRef = nullRef;
          }

          codeBlock(itemRef);
        }
      } else {
        for (var propKey in targetObj) {
          itemRef = targetObj[propKey];

          if (itemRef == void 0) {
            itemRef = nullRef;
          }

          codeBlock(propKey, itemRef);
        }
      }

      return targetObj;
    },

    "toArray": function(targetObj, args) {
      var resultCollection = [];

      for (var idx = 0, len = targetObj.length; idx < len; idx++) {
        resultCollection.push(targetObj[idx]);
      }

      return resultCollection;
    }
  };

  // Constant missing dispatcher
  Core.constantMissingDispatcher = function(constName) {
    return this.typeBase.$handleConstMissing(constName);
  };

  // Arity count error dispatcher
  Core.arityError = function(receivedCount, expectedCount, targetObject, methodName) {
    var debugInfo = (targetObject._isInstance ? targetObject._typeRef._typeName + '#' : targetObject._typeName + '.') + methodName;
    var message = '[' + debugInfo + '] incorrect number of arguments(' + receivedCount + ' for ' + expectedCount + ')'
    throw Core.ArgumentError.$create(message);
  };

  /*
    Call a Ruby method on a Ruby object with given arguments:

      var my_collection = [1, 2, 3, 4]
      Core.dispatchMethod(my_collection, 'length')     # => 4
      Core.dispatchMethod(my_collection, 'reverse!')   # => [4, 3, 2, 1]

    A non-existent method will be forwarded to the object via
    method_missing.

    The outcome of either call will be returned.

    @param [Object] receiver the ruby object
    @param [String] methodIdentifier ruby method to invoke
  */
  Core.dispatchMethod = function(receiver, methodIdentifier) {
    var callArgs = _arrSlice.call(arguments, 2),
      targetFunc = receiver['$' + methodIdentifier];

    if (targetFunc) {
      return targetFunc.apply(receiver, callArgs);
    }

    return receiver.$callMissingMethod.apply(receiver, [methodIdentifier].concat(callArgs));
  };

  // Initialization Sequence
  // -----------------------

  setupBaseType('BaseEntity', BaseEntity)
  setupBaseType('GenericEntity', GenericEntity, BaseEntity);
  setupBaseType('TypeDescriptor', TypeDescriptor, GenericEntity);

  TypeDescriptor.prototype = Function.prototype;

  BaseEntity._typeRef = GenericEntity._typeRef = TypeDescriptor._typeRef = TypeDescriptor;

  // Implementation of TypeDescriptor#===
  function type_equality(target) {
    if (target == void 0) {
      return !1;
    }

    var currentType = target._typeRef;

    while (currentType) {
      if (currentType === this) {
        return !0;
      }

      currentType = currentType._parentType;
    }

    return !1;
  }

  // Implementation of TypeDescriptor#to_s
  function type_toString() {
    return this._typeName;
  }

  // Method publisher for all 'standard' types and modules
  function _publishMethods(methodsToPublish, isIndirect) {
    var currentMethods = this._instanceMethods,
      modulesIncluded = this.$moduleIncludes;

    // if (!isIndirect) {
    this._instanceMethods = currentMethods.concat(methodsToPublish);
    // }

    if (modulesIncluded) {
      for (var idx = 0, len = modulesIncluded.length; idx < len; idx++) {
        var includedModule = modulesIncluded[idx];
        var targetProto = includedModule.prototype;

        for (var jdx = 0, jlen = methodsToPublish.length; jdx < jlen; jdx++) {
          var methodName = methodsToPublish[jdx];
          targetProto[methodName] = this.prototype[methodName];
        }

        if (includedModule.$moduleIncludes) {
          includedModule._publishMethods(methodsToPublish, !0);
        }
      }

    }
  }

  // Defines a static method on a type
  function _defineStatic(methodIdent, methodBody) {
    this._staticMethods.push(methodIdent);
    this[methodIdent] = methodBody;

    var childTypes = this._childTypes;
    if (childTypes.length) {
      for (var idx = 0, len = childTypes.length, childType; idx < len; idx++) {
        childType = childTypes[idx];
        if (!childType[methodIdent]) {
          childType._defineStatic(methodIdent, methodBody);
        }
      }
    }
  }

  // Defines methods onto GenericEntity (which are then propagated to proxied types)
  GenericEntity._defineInstance = function(methodIdent, methodBody) {
    this.prototype[methodIdent] = methodBody;
    this._publishMethods([methodIdent]);
  };

  var proxiedTypes = GenericEntity.$moduleIncludes = [];

  Core.baseType = GenericEntity;
  BaseEntity._namespace = GenericEntity._namespace = Core;
  Core.ModuleAlias = Core.TypeDescriptor;
  Core.KernelAlias = GenericEntity;

  var type_const_allocator = function() {};
  var type_const_scope = new GlobalNamespace();
  type_const_scope.instanceFactory = type_const_allocator;
  TypeDescriptor._namespace = type_const_scope;

  GenericEntity.prototype.toString = function() {
    return this.$toStr();
  };

  Core.topLevel = new GenericEntity;

  Core.createClass(GenericEntity, GenericEntity, 'NullDescriptor', NullDescriptor)
  var nullRef = Core.nullRef = new NullDescriptor;
  nullRef.call = nullRef.apply = function() {
    throw Core.LocalJumpError.$create('no block provided');
  };

  Core.breakSignal = new TypeError('unanticipated break');
}).call(this);
(function(__core_lib) {
  var currentContext = __core_lib.topLevel,
    currentScope = __core_lib,
    nullRef = __core_lib.nullRef,
    $methodDispatcher = __core_lib.methodMissingDispatcher,
    __breakSignal = __core_lib.breakSignal,
    __arraySlice = __core_lib.arraySlice,
    __createClass = __core_lib.createClass;
  return (function(baseObj, superObj) {
    function TypeDescriptor() {}
    TypeDescriptor = __createClass(baseObj, superObj, "TypeDescriptor", TypeDescriptor);

    var typeDefinition = TypeDescriptor.prototype,
      currentScope = TypeDescriptor._namespace,
      TEMP_FUNC_1, TEMP_FUNC_2, TEMP_FUNC_3, TEMP_FUNC_4;

    TypeDescriptor._defineStatic('$new', TEMP_FUNC_1 = function(sup) {
      var codeBlock;
      codeBlock = TEMP_FUNC_1._p || nullRef, TEMP_FUNC_1._p = void 0;
      if (sup == void 0) {
        sup = currentScope.GenericEntity
      }