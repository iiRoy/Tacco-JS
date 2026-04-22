(function(void 0) {
  // The primary execution context object for the Ruby-like environment.
  // Exposed globally as RBX.
  const RBX = this.RBX = Object.create(null);

  // Custom error types for runtime issues.
  RBX.RuntimeError = class extends Error {};
  RBX.ArgumentError = class extends Error {};

  // Internal marker for method stubs.
  RBX.STUB_MARKER = Symbol('rbx_method_stub');
  // Internal value representing Ruby's nil.
  RBX.NULL_VALUE = Symbol('rbx_nil');

  // References to the foundational Ruby-like types.
  let PrimObjRef; // Represents BasicObject
  let BaseObjRef; // Represents Object
  let ModlDefRef; // Represents Module
  let ClssDefRef; // Represents Class

  // Core constructor functions for instances of foundational types.
  function PrimObjCtor() {} // Constructor for BasicObject instances
  function BaseObjCtor() {} // Constructor for Object instances
  function ClssDefCtor() {} // Constructor for Class instances
  function ModlDefCtor() {} // Constructor for Module instances
  function NullClsCtor() {} // Constructor for NilClass (nil) instances

  // Array to track native JavaScript classes bound to the Ruby-like system.
  const nativeBoundClasses = [];

  // A container for the top-level constant scope.
  const GlobalEnvHolder = function() {};
  GlobalEnvHolder.prototype = RBX; // Inherit from the global RBX object.

  // The constructor for new scope objects.
  RBX.envConstructor = GlobalEnvHolder;
  // An array to hold top-level defined symbols (constants).
  RBX.symbolTable = [];

  // A direct reference to the global object (e.g., `window` or `global`).
  RBX.globalRef = this;

  // Optimized references to common JavaScript functions.
  const _hasProp = Object.prototype.hasOwnProperty;
  const _arrSlice = Array.prototype.slice;
  RBX.arraySliceUtil = _arrSlice; // Expose slice utility for external use.

  // Counter for generating unique internal identifiers for objects.
  let nextUniqueId = 0;

  // Provides the next available unique identifier.
  RBX.getUniqueId = function() {
    return nextUniqueId++;
  };

  // Storage for class variables, indexed by internal class ID.
  RBX.classVars = Object.create(null);
  // Storage for global variables.
  RBX.globalVars = Object.create(null);

  /**
   * Creates a new constant scope for a given type definition.
   * Constants are resolved hierarchically, so the `parentCtx` acts as the outer scope.
   *
   * @param {object} parentCtx The parent scope context.
   * @param {object} typeDef The class or module definition for which to create the scope.
   * @param {string} [identifier] The name of the type in its parent scope, if applicable.
   */
  function establishContext(parentCtx, typeDef, identifier) {
    if (!parentCtx || !typeDef) {
      console.warn("Attempted to establish context with invalid parent or type definition.");
      return;
    }

    const contextAllocator = function() {};
    // Inherit from the parent's scope constructor prototype.
    const newContext = Object.create(parentCtx.envConstructor.prototype);

    typeDef._scope = newContext;
    newContext.owningType = typeDef;
    typeDef._parentModuleRef = parentCtx.owningType; // Link to the actual module object.
    newContext.envConstructor = contextAllocator;
    newContext.localSymbols = []; // Stores names of constants defined in this scope.

    if (identifier) {
      typeDef._originalScopeRef = parentCtx;
      // Register the type definition in the parent's scope and its constructor's properties.
      parentCtx[identifier] = parentCtx.envConstructor[identifier] = typeDef;
      parentCtx.localSymbols.push(identifier);
    }
  }
  RBX.establishContext = establishContext;

  /**
   * Defines a Ruby-like class or retrieves an existing one.
   * This function handles the `class Foo; end` construct.
   *
   * If a class with the given name already exists in the `parentScope`,
   * it validates the existing class against the provided `superClassRef`.
   * Otherwise, a new class is created.
   *
   * @param {object} parentScope The scope where the class is being defined.
   * @param {object|Function|null} superClassRef The Ruby-like superclass or a native constructor to bridge.
   * @param {string} className The name of the class to define.
   * @param {Function} instanceCtor The JavaScript constructor for instances of this class.
   * @return {object} The newly defined or existing Ruby-like class object.
   */
  RBX.defineClass = function(parentScope, superClassRef, className, instanceCtor) {
    // If the base is an object instance, use its class.
    if (!parentScope._isType) {
      parentScope = parentScope._typeRef;
    }

    // Default superclass to Object if not explicitly provided.
    if (superClassRef === null) {
      superClassRef = BaseObjRef;
    }

    let definedType = parentScope._scope[className];

    // Check if a constant with this name already exists in the current scope.
    if (_hasProp.call(parentScope._scope, className) && definedType && definedType._originalScopeRef === parentScope._scope) {
      // If it exists, ensure it's actually a class.
      if (!definedType._isType) {
        throw new RBX.RuntimeError(`Type error: '${className}' exists but is not a class-like entity.`);
      }

      // Check for superclass consistency.
      if (superClassRef && definedType._superRef !== superClassRef && superClassRef !== BaseObjRef) {
        throw new RBX.RuntimeError(`Superclass mismatch for class '${className}'.`);
      }
    } else if (typeof superClassRef === 'function') {
      // If a native constructor is passed as superclass, bridge it.
      return bindNativeClass(className, superClassRef);
    } else {
      // No existing class found, so create a new one.
      definedType = createNewClass(superClassRef, instanceCtor);
      definedType._typeName = className;

      // Establish a new constant scope for this class.
      establishContext(parentScope._scope, definedType, className);

      // Register the new class in the parent scope.
      parentScope[className] = parentScope._scope[className] = definedType;

      // Transfer constants from the superclass, excluding BasicObject and Object.
      if (superClassRef !== BaseObjRef && superClassRef !== PrimObjRef) {
        RBX.transferSymbols(superClassRef, definedType);
      }

      // Invoke the .inherited() hook on the superclass if available.
      if (superClassRef && typeof superClassRef.$inherited === 'function') {
        superClassRef.$inherited(definedType);
      }
    }

    return definedType;
  };

  /**
   * Internal function to create a new Ruby-like class by setting up its
   * prototype chain for instances.
   *
   * @param {object} parentType The Ruby-like superclass.
   * @param {Function} instancePrototypeCtor The JavaScript constructor for instances.
   * @returns {object} The newly created Ruby-like class object.
   */
  const createNewClass = RBX.bootClass = function(parentType, instancePrototypeCtor) {
    // Set up the prototype chain for instances (object hierarchy).
    const protoLinker = function() {};
    protoLinker.prototype = parentType._instancePrototype; // Inherit instance methods.

    // Use Object.create for cleaner prototype inheritance.
    instancePrototypeCtor.prototype = Object.create(protoLinker.prototype);
    instancePrototypeCtor.prototype.constructor = instancePrototypeCtor;

    return createClassMeta(parentType, instancePrototypeCtor);
  };

  /**
   * Internal function to create the "meta-class" part of a Ruby-like class,
   * handling the class's own properties and prototype chain.
   *
   * @param {object} parentType The Ruby-like superclass.
   * @param {Function} instancePrototypeCtor The JavaScript constructor for instances.
   * @returns {object} The fully initialized Ruby-like class object.
   */
  function createClassMeta(parentType, instancePrototypeCtor) {
    // Set up the prototype chain for the class itself (meta-class hierarchy).
    const metaProtoLinker = function() {};
    metaProtoLinker.prototype = parentType.constructor.prototype; // Inherit class methods.

    function TypeDefinition() {}
    TypeDefinition.prototype = Object.create(metaProtoLinker.prototype);

    const definedType = new TypeDefinition();

    definedType._internalId = nextUniqueId++; // Unique identifier for the class.
    definedType._allocator = instancePrototypeCtor; // The constructor for new instances.
    definedType._isType = true; // Flag indicating it's a class or module.
    definedType.constructor = TypeDefinition; // The constructor for this meta-class.
    definedType._superRef = parentType; // Reference to the direct superclass.
    definedType._definedMethods = []; // List of methods defined directly on this class.
    definedType._includes = []; // List of modules included in this class.
    definedType._parentClass = parentType; // Alias for _superRef, used in some contexts.
    definedType._instancePrototype = instancePrototypeCtor.prototype; // Prototype for instances.

    // Link the instance constructor's prototype back to this class definition.
    instancePrototypeCtor.prototype._typeRef = definedType;

    return definedType;
  }

  /**
   * Defines a Ruby-like module or retrieves an existing one.
   *
   * @param {object} parentScope The scope where the module is being defined.
   * @param {string} moduleName The name of the module.
   * @return {object} The newly defined or existing Ruby-like module object.
   */
  RBX.defineModule = function(parentScope, moduleName) {
    // If the base is an object instance, use its class.
    if (!parentScope._isType) {
      parentScope = parentScope._typeRef;
    }

    let existingModule = parentScope._scope[moduleName];

    // Check if a constant with this name already exists.
    if (_hasProp.call(parentScope._scope, moduleName) && existingModule) {
      // If it exists, ensure it's a module.
      if (!existingModule._isModule && existingModule !== BaseObjRef) {
        throw new RBX.RuntimeError(`Type error: '${moduleName}' exists but is not a module.`);
      }
    } else {
      // Create a new module.
      existingModule = createNewModule();
      existingModule._typeName = moduleName;

      // Establish a new constant scope for this module.
      establishContext(parentScope._scope, existingModule, moduleName);

      // Register the new module in the parent scope.
      parentScope[moduleName] = parentScope._scope[moduleName] = existingModule;
    }

    return existingModule;
  };

  /**
   * Internal function to create a new Ruby-like module instance.
   * This sets up its prototype hierarchy and internal properties.
   *
   * @returns {object} The newly created Ruby-like module object.
   */
  function createNewModule() {
    // Set up the prototype chain for the module itself.
    const metaProtoLinker = function() {};
    metaProtoLinker.prototype = ModlDefRef.constructor.prototype;

    function ModuleDefinition() {}
    ModuleDefinition.prototype = Object.create(metaProtoLinker.prototype);

    const definedModule = new ModuleDefinition();

    definedModule._internalId = nextUniqueId++;
    definedModule._isType = true; // Modules are also type-like entities.
    definedModule.constructor = ModuleDefinition;
    definedModule._superRef = ModlDefRef; // Modules inherit from Module.
    definedModule._definedMethods = [];
    definedModule._includes = [];
    definedModule._parentClass = ModlDefRef;
    definedModule._instancePrototype = Object.create(null); // Modules don't have instances in the same way classes do.
    definedModule._isModule = true; // Flag indicating it's a module.
    definedModule._dependencies = []; // Track dependencies, if any.

    return definedModule;
  }

  /**
   * Initializes the prototype of an instance constructor to inherit from a parent.
   * This is used for "bootstrapping" core classes' instance constructors.
   *
   * @param {string} typeName The name of the type.
   * @param {Function} instanceCtor The constructor function for instances.
   * @param {Function} parentType The prototype of the parent type.
   * @returns {Function} The configured instance constructor.
   */
  const initializeInstanceCtor = function(typeName, instanceCtor, parentType) {
    if (parentType) {
      const protoLinker = function() {};
      protoLinker.prototype = parentType.prototype;

      instanceCtor.prototype = Object.create(protoLinker.prototype);
    }
    instanceCtor.prototype.constructor = instanceCtor;
    return instanceCtor;
  };

  /**
   * Initializes the meta-class structure for core types.
   * This is used to set up the class object itself, not its instances.
   *
   * @param {string} typeName The name of the type.
   * @param {Function} instanceCtor The constructor function for instances.
   * @param {Function} parentType The prototype of the parent type.
   * @returns {object} The initialized Ruby-like class object.
   */
  const initializeTypeMeta = function(typeName, instanceCtor, parentType) {
    const metaProtoLinker = function() {};
    metaProtoLinker.prototype = parentType.prototype;

    function TypeDefinition() {}
    TypeDefinition.prototype = Object.create(metaProtoLinker.prototype);

    const definedType = new TypeDefinition();

    definedType._internalId = nextUniqueId++;
    definedType._allocator = instanceCtor;
    definedType._isType = true;
    definedType._typeName = typeName;
    definedType._superRef = parentType;
    definedType.constructor = TypeDefinition;
    definedType._definedMethods = [];
    definedType._includes = [];
    definedType._parentClass = parentType;
    definedType._instancePrototype = instanceCtor.prototype;

    instanceCtor.prototype._typeRef = definedType;

    // Register this core type definition globally within RBX.
    RBX[typeName] = definedType;
    RBX.symbolTable.push(typeName);

    return definedType;
  };

  /**
   * Bridges a native JavaScript constructor (e.g., `Array`) to behave like a Ruby-like class.
   * This involves creating a Ruby-like class definition that wraps the native constructor.
   *
   * @param {string} typeName The name of the Ruby-like class to create.
   * @param {Function} nativeCtor The native JavaScript constructor (e.g., `Array`, `Function`).
   * @return {object} The new Ruby-like class object representing the bridged native type.
   */
  function bindNativeClass(typeName, nativeCtor) {
    if (typeof nativeCtor !== 'function') {
      throw new RBX.RuntimeError(`Invalid native constructor provided for bridging type '${typeName}'.`);
    }

    // Create the Ruby-like meta-class, inheriting from Ruby's Object.
    const boundType = createClassMeta(BaseObjRef, nativeCtor);
    boundType._typeName = typeName;

    // Establish its scope and add it to the global RBX object.
    establishContext(RBX, boundType, typeName);
    nativeBoundClasses.push(boundType);

    // Donate methods from Ruby's BasicObject and Object to the native prototype.
    // This allows native objects to respond to Ruby-like methods.
    const coreMethods = PrimObjRef._definedMethods.concat(BaseObjRef._definedMethods);
    for (const methodName of coreMethods) {
      if (!nativeCtor.prototype[methodName]) { // Only add if not already present.
        nativeCtor.prototype[methodName] = BaseObjRef._instancePrototype[methodName];
      }
    }

    return boundType;
  }

  /**
   * Assigns a constant within a module's scope.
   * Handles special cases for class names.
   *
   * @param {object} moduleContext The module or class where the constant is defined.
   * @param {string} symbolKey The name of the constant.
   * @param {any} symbolValue The value to assign to the constant.
   * @returns {any} The assigned value.
   */
  RBX.assignConstant = function(moduleContext, symbolKey, symbolValue) {
    if (!moduleContext || !moduleContext._scope) {
      throw new RBX.RuntimeError(`Cannot assign constant '${symbolKey}': Invalid module context.`);
    }

    const contextScope = moduleContext._scope;

    // If the value is a class-like entity and its name is nil, assign the symbol key as its name.
    if (symbolValue._isType && symbolValue._typeName === RBX.NULL_VALUE) {
      symbolValue._typeName = symbolKey;
    }

    // If the value is a class-like entity, link it to its parent module.
    if (symbolValue._isType) {
      symbolValue._parentModuleRef = moduleContext;
    }

    if (!contextScope.localSymbols.includes(symbolKey)) {
        contextScope.localSymbols.push(symbolKey);
    }
    return contextScope[symbolKey] = symbolValue;
  };

  /**
   * Declares a constant directly in a given scope.
   *
   * @param {object} scopeRef The target scope object.
   * @param {string} symbolKey The name of the constant.
   * @param {any} symbolValue The value to assign.
   * @returns {any} The assigned value.
   */
  RBX.declareConstant = function(scopeRef, symbolKey, symbolValue) {
    if (!scopeRef) {
      throw new RBX.RuntimeError(`Cannot declare constant '${symbolKey}': Scope reference is invalid.`);
    }
    if (!scopeRef.localSymbols.includes(symbolKey)) {
        scopeRef.localSymbols.push(symbolKey);
    }
    return scopeRef[symbolKey] = symbolValue;
  };

  /**
   * Resolves a constant by its path (e.g., 'Foo::Bar').
   *
   * @param {object} scopeRef The starting scope for resolution.
   * @param {string} pathIdentifier The path to the constant.
   * @returns {any} The resolved constant value.
   */
  RBX.resolveConstant = function(scopeRef, pathIdentifier) {
    // If only one argument is given, assume it's the path and start from Object.
    if (pathIdentifier == null) {
      pathIdentifier = scopeRef;
      scopeRef = RBX.BaseObjRef;
    }

    if (!scopeRef || !pathIdentifier) {
        throw new RBX.RuntimeError("Invalid arguments for constant resolution.");
    }

    let currentResolution = scopeRef;
    const pathSegments = String(pathIdentifier).split('::');

    for (const segment of pathSegments) {
      if (!currentResolution || typeof currentResolution.$get_constant !== 'function') {
        throw new RBX.RuntimeError(`Constant resolution failed: Cannot find constant '${segment}' in path '${pathIdentifier}'.`);
      }
      currentResolution = currentResolution.$get_constant(segment);
    }

    return currentResolution;
  };

  /**
   * Transfers all constants from a source module to a target module.
   * This is typically used when a module is included into a class or another module.
   *
   * @param {object} sourceModule The module whose constants are to be transferred.
   * @param {object} targetModule The module/class receiving the constants.
   */
  RBX.transferSymbols = function(sourceModule, targetModule) {
    if (!sourceModule || !sourceModule._scope || !targetModule || !targetModule._scope) {
      console.warn("Attempted to transfer symbols with invalid source or target module.");
      return;
    }

    const srcSymbols = sourceModule._scope.localSymbols;
    const targetScopeRef = targetModule._scope;
    const targetSymbols = targetScopeRef.localSymbols;

    for (const symbolKey of srcSymbols) {
      // Only transfer if the symbol doesn't already exist in the target.
      if (!targetSymbols.includes(symbolKey)) {
        targetSymbols.push(symbolKey);
        targetScopeRef[symbolKey] = sourceModule._scope[symbolKey];
      }
    }
  };

  /**
   * Helper to generate a consistent method key for prototype properties.
   * @param {string} methodName The Ruby-like method name (e.g., "$foo").
   * @returns {string} The key for the JavaScript prototype.
   */
  function _generateMethodKey(methodName) {
    return methodName; // For now, direct use, but could add transformations.
  }

  /**
   * Installs method stubs on the BasicObject prototype.
   * Stubs act as placeholders that delegate to `method_missing` if a method is not defined.
   *
   * @param {Array<string>} methodNames An array of method names (prefixed with '$') to stub.
   */
  RBX.installMethodStubs = function(methodNames) {
    if (!Array.isArray(methodNames) || methodNames.length === 0) {
      return; // No stubs to install.
    }

    const proto = PrimObjCtor.prototype; // The prototype of BasicObject instances.

    for (const methodName of methodNames) {
      const methodKey = _generateMethodKey(methodName);
      // Only install a stub if the method key doesn't already exist.
      if (!proto[methodKey]) {
        proto[methodKey] = RBX.STUB_MARKER; // Mark as a placeholder.
        RBX.addStubImplementation(proto, methodName);
      }
    }
  };

  /**
   * Adds the actual `method_missing` stub function to a given prototype.
   *
   * @param {object} targetPrototype The prototype to add the stub to.
   * @param {string} methodName The name of the method (e.g., "$foo").
   */
  RBX.addStubImplementation = function(targetPrototype, methodName) {
    function stubDispatcher() {
      // Pass any associated block reference to the method_missing dispatcher.
      if (stubDispatcher._blockRef) {
        this.$method_missing._blockRef = stubDispatcher._blockRef;
        stubDispatcher._blockRef = null; // Clear for next call.
      }

      // Call $method_missing with the original method name (unprefixed) and arguments.
      return this.$method_missing.apply(this, [methodName.substring(1)].concat(_arrSlice.call(arguments)));
    }

    stubDispatcher._isRBXStub = true; // Mark this function as an RBX stub.
    targetPrototype[_generateMethodKey(methodName)] = stubDispatcher;
  };

  /**
   * Handles constant missing scenarios, delegating to the `const_missing` method
   * on the current scope's owning type.
   *
   * @param {string} constantName The name of the missing constant.
   * @returns {any} The result of `const_missing`.
   */
  RBX.constMissingHandler = function(constantName) {
    if (!this.owningType || typeof this.owningType.$missing_constant !== 'function') {
      throw new RBX.RuntimeError(`Undefined constant '${constantName}' and no 'const_missing' handler available.`);
    }
    return this.owningType.$missing_constant(constantName);
  };

  /**
   * Generates and throws an `ArgumentError` for arity mismatches.
   *
   * @param {number} actualArgs The number of arguments received.
   * @param {number} expectedArgs The number of arguments expected.
   * @param {object} receiver The object on which the method was called.
   * @param {string} methodSig The method signature (e.g., "$foo").
   * @throws {RBX.ArgumentError}
   */
  RBX.arityErrorChecker = function(actualArgs, expectedArgs, receiver, methodSig) {
    const debugInfo = (receiver._isType ? receiver._typeName + '::' : receiver._typeRef._typeName + '#') + methodSig.substring(1);
    const errorMessage = `Method '${debugInfo}' called with incorrect argument count: ${actualArgs} (expected ${expectedArgs}).`;
    throw new RBX.ArgumentError(errorMessage);
  };

  /**
   * Resolves the target prototype for a `super` call.
   *
   * @param {object} targetObj The object or class making the super call.
   * @param {string} jsMethodId The JavaScript method identifier (e.g., "$foo").
   * @param {Function} currentFn The currently executing function.
   * @param {object} blockIter An optional block iterator.
   * @param {boolean} isMetaDefs Indicates if we are looking for a method on the meta-class.
   * @returns {object} The prototype object where the super method should be found.
   */
  RBX.resolveSuperMethod = function(targetObj, jsMethodId, currentFn, blockIter, isMetaDefs) {
    let methodLookupTarget;

    if (isMetaDefs) {
      // If `isMetaDefs` is true, we're looking up a class method.
      methodLookupTarget = targetObj._isType ? isMetaDefs._superRef : targetObj._typeRef._instancePrototype;
    } else {
      // If `isMetaDefs` is false, we're looking up an instance method.
      methodLookupTarget = targetObj._isType ? targetObj._superRef : _findObjectSuperMethod(targetObj, jsMethodId, currentFn);
    }
    return methodLookupTarget;
  };

  /**
   * Internal helper to find the correct super dispatcher for an object's instance method.
   * (Implementation would typically be more complex, involving method lookup chains).
   *
   * @param {object} obj The object instance.
   * @param {string} jsid The JavaScript method identifier.
   * @param {Function} current_func The current function being executed.
   * @returns {object} The prototype containing the super method.
   */
  function _findObjectSuperMethod(obj, jsid, current_func) {
    // This is a simplified placeholder. In a real system, it would traverse the
    // inheritance chain (`obj._typeRef._superRef._instancePrototype`, etc.)
    // to find the method that was overridden by `current_func`.
    return obj._typeRef._superRef._instancePrototype;
  }

  // Initializing the core Ruby-like classes.
  // These are the foundation of the object model.

  // BasicObject
  initializeInstanceCtor('BasicObject', PrimObjCtor);
  PrimObjRef = initializeTypeMeta('BasicObject', PrimObjCtor, PrimObjCtor);
  PrimObjRef._superRef = null; // BasicObject has no superclass.

  // Object
  initializeInstanceCtor('Object', BaseObjCtor, PrimObjRef._instancePrototype);
  BaseObjRef = initializeTypeMeta('Object', BaseObjCtor, PrimObjRef);

  // Class
  initializeInstanceCtor('Class', ClssDefCtor, BaseObjRef._instancePrototype);
  ClssDefRef = initializeTypeMeta('Class', ClssDefCtor, BaseObjRef);

  // Module
  initializeInstanceCtor('Module', ModlDefCtor, BaseObjRef._instancePrototype);
  ModlDefRef = initializeTypeMeta('Module', ModlDefCtor, ClssDefRef); // Module inherits from Class.

  // NilClass
  initializeInstanceCtor('NilClass', NullClsCtor, BaseObjRef._instancePrototype);
  RBX.NilClass = initializeTypeMeta('NilClass', NullClsCtor, BaseObjRef);

  // Set the correct prototypes for the core meta-classes.
  // Class's meta-class should inherit from Module's meta-class.
  ClssDefRef.constructor.prototype = Object.create(ModlDefRef.constructor.prototype);
  // Module's meta-class should inherit from Class's meta-class.
  ModlDefRef.constructor.prototype = Object.create(ClssDefRef.constructor.prototype);

  // Set the initial top-level scope.
  establishContext(RBX, PrimObjRef); // BasicObject lives in the top scope.
  establishContext(RBX, BaseObjRef); // Object lives in the top scope.
  establishContext(RBX, ModlDefRef); // Module lives in the top scope.
  establishContext(RBX, ClssDefRef); // Class lives in the top scope.
  establishContext(RBX, RBX.NilClass); // NilClass lives in the top scope.

  // Define a global `nil` object.
  RBX.nil = new NullClsCtor();
  RBX.nil._typeName = RBX.NULL_VALUE; // Mark it as the nil value.
}).call(this);