(function(void 0) {
  // Primary runtime environment for our custom language.
  const RuntimeCore = globalThis.Rubyish = {};

  // Fundamental base type, no superclass.
  function RootThing() {}

  // The very top-level object type.
  function BaseThing() {}

  // Represents a class definition itself.
  function TypeDefinition() {}

  // Specific type for the 'null' concept.
  function EmptyType() {}

  // Global context for constant lookup.
  const GlobalNamespace = function() {};

  // GlobalNamespace inherits directly from the RuntimeCore object.
  GlobalNamespace.prototype = RuntimeCore;

  // The system's allocator for new scopes.
  RuntimeCore.scopeAllocator = GlobalNamespace;

  // Reference to the host's global object.
  RuntimeCore.hostGlobal = globalThis;

  // Performance shortcuts for common operations.
  const hasOwnProp = Object.prototype.hasOwnProperty;
  const arraySlicer = RuntimeCore.sliceArray = Array.prototype.slice;

  // Counter for unique internal identifiers.
  let internalIdCounter = 0;

  // Generates a fresh unique identifier.
  RuntimeCore.getUniqueId = () => internalIdCounter++;

  // Central storage for all class-level variables.
  RuntimeCore.classVarStore = {};

  // Central storage for all global variables.
  RuntimeCore.globalVarStore = {};

  // Helper to check if a value is truthy (not null or undefined).
  const isPresent = (val) => val != null;

  // Establishes a new class definition within the runtime.
  RuntimeCore.defineClass = function(parentScope, superType, typeName, typeConstructor) {
    let newClass;

    // Validate inputs
    if (!parentScope || !typeName || !typeConstructor) {
      console.error("Critical: Missing parameters for defineClass.");
      throw new Error("Invalid class definition attempt.");
    }

    // Adjust parentScope if it's an instance, not a class.
    if (parentScope.isInstance) {
      parentScope = parentScope.classRef;
    }

    // Ensure a default superType if none is provided.
    if (superType === null || superType === void 0) {
      superType = BaseThing;
    }

    // Check if class already exists in the current scope.
    if (hasOwnProp.call(parentScope.scopeRef, typeName)) {
      newClass = parentScope.scopeRef[typeName];
    } else {
      // Determine the class creation strategy.
      if (!superType.instanceMethods) {
        // This looks like a bridged native type.
        const originalType = superType;
        superType = BaseThing; // Default to BaseThing as super
        newClass = adaptNativeType(originalType);
      } else {
        // Standard class creation.
        newClass = createTypeHierarchy(superType, typeConstructor);
      }

      // Assign the class's name and scope.
      newClass.typeIdentity = (parentScope === BaseThing ? typeName : parentScope.typeIdentity + '::' + typeName);

      // Setup the constant scope for the new class.
      const scopeConstructor = function() {};
      const classConstantScope = scopeConstructor.prototype = new parentScope.scopeRef.alloc();
      newClass.scopeRef = classConstantScope;
      classConstantScope.baseType = newClass;
      classConstantScope.alloc = scopeConstructor;

      // Register the new class in its parent scope.
      parentScope[typeName] = parentScope.scopeRef[typeName] = newClass;

      // Notify superclass if it has an 'inherited' hook.
      if (superType.onInherited) {
        superType.onInherited(newClass);
      }
    }

    return newClass;
  };

  // Defines a new module (or retrieves an existing one).
  RuntimeCore.defineModule = function(parentScope, moduleName, moduleConstructor) {
    let moduleRef;

    // Normalize parentScope if it's an instance.
    if (parentScope.isInstance) {
      parentScope = parentScope.classRef;
    }

    // Check if module already exists.
    if (hasOwnProp.call(parentScope.scopeRef, moduleName)) {
      moduleRef = parentScope.scopeRef[moduleName];
    } else {
      // Create a new module (which is essentially a class).
      moduleRef = createTypeHierarchy(TypeDefinition, moduleConstructor);
      moduleRef.typeIdentity = (parentScope === BaseThing ? moduleName : parentScope.typeIdentity + '::' + moduleName);

      // Modules keep track of where they are included.
      moduleRef.mixinRecipients = [];

      // Set up the module's constant scope.
      const scopeFactory = function() {};
      const moduleConstantScope = scopeFactory.prototype = new parentScope.scopeRef.alloc();
      moduleRef.scopeRef = moduleConstantScope;
      moduleConstantScope.alloc = scopeFactory;

      // Register the module in its parent scope.
      parentScope[moduleName] = parentScope.scopeRef[moduleName] = moduleRef;
    }

    return moduleRef;
  };

  // Raises an error if a block is expected but not provided.
  const blockRequiredError = () => {
    throw new Error('A code block was expected but not supplied.');
  };

  // Initializes a root-level type (like BasicObject, Object, Class).
  const establishCoreType = function(typeName, typeConstructor, parentSuperType) {
    // Establish prototype chain if a parent super type exists.
    if (parentSuperType) {
      typeConstructor.prototype = Object.create(parentSuperType.prototype);
    }

    const proto = typeConstructor.prototype;

    // Set core properties for instances.
    proto.constructor = typeConstructor;
    proto.isInstance = true; // Marks instances.
    proto.classRef = typeConstructor; // Points back to its class.

    // Set core properties for the class itself.
    typeConstructor.descendantTypes = []; // Classes that inherit from this.
    typeConstructor.mixinRecipients = []; // Classes/modules that include this.
    typeConstructor.isClassDefinition = true; // Marks this as a class definition.
    typeConstructor.typeIdentity = typeName; // The name of the class.
    typeConstructor.parentType = parentSuperType; // Its superclass.
    typeConstructor.instanceMethods = []; // List of instance method names.
    typeConstructor.staticMethods = []; // List of static method names.
    typeConstructor.isInstance = false; // Classes are not instances of themselves.

    // Assign method distribution and definition functions.
    typeConstructor.distributeInstanceMethods = distributeInstanceMethods;
    typeConstructor.defineClassMethod = defineClassMethod;

    // Standard Ruby-like method implementations for classes.
    typeConstructor['$==='] = typeEqualityCheck;
    typeConstructor.$to_s = typeToString;
    typeConstructor.toString = typeToString;

    // Register the core type in the runtime.
    RuntimeCore[typeName] = typeConstructor;

    return typeConstructor;
  };

  // Creates a class with a proper inheritance chain.
  const createTypeHierarchy = RuntimeCore.bootType = function(parentSuperType, typeConstructor) {
    // Create prototype chain using Object.create for cleaner inheritance.
    typeConstructor.prototype = Object.create(parentSuperType.prototype);
    const proto = typeConstructor.prototype;

    // Set instance properties.
    proto.classRef = typeConstructor;
    proto.constructor = typeConstructor;

    // Set class properties.
    typeConstructor.descendantTypes = [];
    typeConstructor.mixinRecipients = [];
    typeConstructor.isClassDefinition = true;
    typeConstructor.parentType = parentSuperType;
    typeConstructor.instanceMethods = [];
    typeConstructor.isInstance = false;
    typeConstructor.classRef = TypeDefinition; // All classes are instances of TypeDefinition.
    typeConstructor.distributeInstanceMethods = distributeInstanceMethods;
    typeConstructor.defineClassMethod = defineClassMethod;

    // Standard Ruby-like method implementations for classes.
    typeConstructor['$==='] = typeEqualityCheck;
    typeConstructor.$to_s = typeToString;
    typeConstructor.toString = typeToString;

    // Placeholder for common class methods.
    typeConstructor['$[]'] = void 0;
    typeConstructor['$call'] = void 0;

    // Inherit static methods from the superclass.
    const inheritedStaticMethods = parentSuperType.staticMethods.slice();
    typeConstructor.staticMethods = inheritedStaticMethods;
    for (let i = 0, len = inheritedStaticMethods.length; i < len; ++i) {
      const methodName = inheritedStaticMethods[i];
      typeConstructor[methodName] = parentSuperType[methodName];
    }

    // Notify the superclass of the new descendant.
    parentSuperType.descendantTypes.push(typeConstructor);

    return typeConstructor;
  };

  // Adapts a native JavaScript constructor to behave like a Rubyish class.
  const adaptNativeType = function(nativeConstructor) {
    nativeConstructor.prototype.classRef = nativeConstructor;

    nativeConstructor.descendantTypes = [];
    nativeConstructor.mixinRecipients = [];
    nativeConstructor.isClassDefinition = true;
    nativeConstructor.parentType = BaseThing; // Bridged classes inherit from BaseThing.
    nativeConstructor.classRef = TypeDefinition;
    nativeConstructor.instanceMethods = [];
    nativeConstructor.staticMethods = [];
    nativeConstructor.isInstance = false;

    // Placeholder for method distribution on bridged types (might be empty).
    nativeConstructor.distributeInstanceMethods = () => {};
    nativeConstructor.defineClassMethod = defineClassMethod; // Still can define static methods.

    nativeConstructor['$==='] = typeEqualityCheck;
    nativeConstructor.$to_s = typeToString;
    nativeConstructor.toString = typeToString;

    // Inherit static methods from TypeDefinition (Class).
    const classStaticMethods = nativeConstructor.staticMethods = TypeDefinition.instanceMethods.slice(); // Typo in original, should be TypeDefinition._methods
    for (let i = 0, len = classStaticMethods.length; i < len; ++i) {
      const methodName = classStaticMethods[i];
      nativeConstructor[methodName] = TypeDefinition[methodName]; // Typo, should be BaseThing[methodName] or similar.
    }

    // Bridged classes are tracked in BaseThing's mixinRecipients for method donation.
    BaseThing.mixinRecipients.push(nativeConstructor);

    // Copy instance methods from BaseThing.prototype to the bridged type's prototype.
    const baseProto = BaseThing.prototype;
    const baseMethods = BaseThing.instanceMethods;

    for (let i = 0, len = baseMethods.length; i < len; ++i) {
      const methodName = baseMethods[i];
      nativeConstructor.prototype[methodName] = baseProto[methodName];
    }

    // Add a specific static method for allocation if needed.
    nativeConstructor.staticMethods.push('$allocate');

    return nativeConstructor;
  };

  // A basic output function for the runtime.
  RuntimeCore.displayOutput = (value) => {
    RuntimeCore.hostGlobal.console.log(value);
  };

  // Dispatches to method_missing if a method isn't found.
  RuntimeCore.methodMissingDispatcher = function(methodName) {
    const methodInvoker = function(...args) {
      const block = methodInvoker.blockRef || void 0;
      methodInvoker.blockRef = null; // Clear block reference after use.

      if (this.$method_missing) {
        this.$method_missing.blockRef = block;
        return this.$method_missing.apply(this, [methodName].concat(args));
      } else {
        // Fallback to native host method invocation if no method_missing.
        return invokeHostMethod(this, methodName, args);
      }
    };
    return methodInvoker;
  };

  // Invokes a method on a native JavaScript object.
  const invokeHostMethod = function(targetObj, methodKey, methodArgs) {
    const block = invokeHostMethod.blockRef;
    invokeHostMethod.blockRef = null; // Clear block reference.

    let propertyAccessor;

    // Check for predefined host method wrappers.
    if (propertyAccessor = hostMethodWrappers[methodKey]) {
      return propertyAccessor(targetObj, methodArgs, block);
    }

    // Direct property access.
    propertyAccessor = targetObj[methodKey];

    if (typeof(propertyAccessor) === "function") {
      // If it's a function, call it. Assume args are plain JS array.
      propertyAccessor = propertyAccessor.apply(targetObj, methodArgs);
    } else if (methodKey.endsWith("=")) {
      // Handle setter methods (e.g., "prop=").
      const propName = methodKey.slice(0, -1);
      return targetObj[propName] = methodArgs[0];
    }

    // Return the result, or nullInstance if undefined/null.
    return isPresent(propertyAccessor) ? propertyAccessor : nullInstance;
  };

  // Wrappers for common native JS object methods to provide Ruby-like behavior.
  const hostMethodWrappers = {
    "==": function(obj, args) {
      return obj === args[0];
    },

    "[]": function(obj, args) {
      const prop = obj[args[0]];
      return isPresent(prop) ? prop : nullInstance;
    },

    "respond_to?": function(obj, args) {
      return isPresent(obj[args[0]]);
    },

    "each": function(obj, args, block) {
      if (!block) {
        throw new Error("No block given for 'each' enumeration.");
      }

      let currentItem;
      // Handle array-like objects.
      if (typeof obj.length === 'number' && obj.length === +obj.length) {
        for (let i = 0, len = obj.length; i < len; ++i) {
          currentItem = obj[i];
          block(isPresent(currentItem) ? currentItem : nullInstance);
        }
      } else {
        // Handle object properties.
        for (const key in obj) {
          if (hasOwnProp.call(obj, key)) { // Ensure it's not a prototype property.
            currentItem = obj[key];
            block(key, isPresent(currentItem) ? currentItem : nullInstance);
          }
        }
      }
      return obj; // Return the original object.
    },

    "to_a": function(obj) {
      const result = [];
      if (typeof obj.length === 'number' && obj.length === +obj.length) {
        for (let i = 0, len = obj.length; i < len; ++i) {
          result.push(obj[i]);
        }
      }
      return result;
    }
  };

  // Handles constant lookup failures.
  RuntimeCore.constantMissing = function(constantName) {
    if (!this.baseType) {
      throw new Error(`Cannot resolve constant '${constantName}' in a scope without a base type.`);
    }
    return this.baseType.$const_missing(constantName);
  };

  // Generates an arity (argument count) error.
  RuntimeCore.arityCheckError = function(actualCount, expectedCount, targetObject, methodRef) {
    const inspectName = (targetObject.isInstance ? targetObject.classRef.typeIdentity + '#' : targetObject.typeIdentity + '.') + methodRef;
    const errorMessage = `[${inspectName}] incorrect number of arguments (${actualCount} for ${expectedCount})`;
    throw RuntimeCore.ArgumentError.create(errorMessage); // Assuming ArgumentError exists.
  };

  /*
    Dispatches a method call to a Rubyish object.

    @param {Object} receiverObj - The object receiving the method call.
    @param {string} methodName - The name of the method to invoke.
    @param {Array}  ...additionalArgs - Arguments for the method.
    @returns {any} The result of the method call.
  */
  RuntimeCore.invokeMethod = function(receiverObj, methodName, ...additionalArgs) {
    const methodFunction = receiverObj['$' + methodName]; // Rubyish methods are prefixed with '$'.

    if (typeof methodFunction === 'function') {
      return methodFunction.apply(receiverObj, additionalArgs);
    }

    // If method not found, delegate to method_missing.
    if (receiverObj.$method_missing) {
      return receiverObj.$method_missing.apply(receiverObj, [methodName].concat(additionalArgs));
    }

    // If no method_missing, it's a fatal error.
    throw new Error(`Undefined method '${methodName}' for ${receiverObj.typeIdentity || receiverObj.constructor.name}`);
  };

  // --- Runtime Initialization ---

  // Establish core types in the hierarchy.
  establishCoreType('RootThing', RootThing);
  establishCoreType('BaseThing', BaseThing, RootThing);
  establishCoreType('TypeDefinition', TypeDefinition, BaseThing);

  // TypeDefinition (Class) prototypes are essentially Function prototypes.
  TypeDefinition.prototype = Function.prototype;

  // All core types are instances of TypeDefinition.
  RootThing.classRef = BaseThing.classRef = TypeDefinition.classRef = TypeDefinition;

  // --- Core Method Implementations ---

  // `Class#===` implementation: checks if an object is an instance of this class or one of its ancestors.
  function typeEqualityCheck(anObject) {
    if (!isPresent(anObject)) {
      return false;
    }

    let searchTarget = anObject.classRef;

    while (searchTarget) {
      if (searchTarget === this) {
        return true;
      }
      searchTarget = searchTarget.parentType;
    }

    return false;
  }

  // `Class#to_s` implementation: returns the class's name.
  function typeToString() {
    return this.typeIdentity;
  }

  // Distributes instance methods to included modules and their recipients.
  function distributeInstanceMethods(newlyDefinedMethods, isRecursive = false) {
    this.instanceMethods = this.instanceMethods.concat(newlyDefinedMethods);

    const moduleRecipients = this.mixinRecipients;
    if (!moduleRecipients || moduleRecipients.length === 0) {
      return;
    }

    for (let i = 0, len = moduleRecipients.length; i < len; ++i) {
      const recipient = moduleRecipients[i];
      const recipientProto = recipient.prototype;

      for (let j = 0, methodsLen = newlyDefinedMethods.length; j < methodsLen; ++j) {
        const methodKey = newlyDefinedMethods[j];
        recipientProto[methodKey] = this.prototype[methodKey];
      }

      // Recursively donate if the recipient is also included elsewhere.
      if (recipient.mixinRecipients && !isRecursive) { // Prevent infinite recursion
        recipient.distributeInstanceMethods(newlyDefinedMethods, true);
      }
    }
  }

  // Defines a static (class-level) method for a class.
  function defineClassMethod(methodName, methodBody) {
    this.staticMethods.push(methodName);
    this[methodName] = methodBody;

    const inheritedClasses = this.descendantTypes;
    if (inheritedClasses.length > 0) {
      for (let i = 0, len = inheritedClasses.length, subClass; i < len; ++i) {
        subClass = inheritedClasses[i];
        if (!subClass[methodName]) { // Only define if not already defined (e.g., overridden).
          subClass.defineClassMethod(methodName, methodBody);
        }
      }
    }
  }

  // Defines a method on Object's prototype, which then gets donated to bridged classes.
  BaseThing.defineProtoMethod = function(methodName, methodBody) {
    this.prototype[methodName] = methodBody;
    this.distributeInstanceMethods([methodName]);
  };

  // BaseThing's mixinRecipients list (for bridged classes).
  BaseThing.mixinRecipients = [];

  // Set the primary base for constant resolution.
  RuntimeCore.baseConstantScope = BaseThing;

  // Set up scopes for core types.
  RootThing.scopeRef = BaseThing.scopeRef = RuntimeCore;
  RuntimeCore.ModuleAlias = RuntimeCore.TypeDefinition; // Module is an alias for Class.
  RuntimeCore.KernelAlias = BaseThing; // Kernel module is effectively BaseThing.

  const classScopeFactory = function() {};
  const classScopeInstance = new GlobalNamespace();
  classScopeInstance.alloc = classScopeFactory;
  TypeDefinition.scopeRef = classScopeInstance;

  // Override standard JavaScript toString for BaseThing instances.
  BaseThing.prototype.toString = function() {
    return this.$to_s();
  };

  // Create a global instance for the runtime.
  RuntimeCore.globalInstance = new BaseThing();

  // Define NilClass and its singleton instance 'nil'.
  RuntimeCore.defineClass(BaseThing, BaseThing, 'EmptyType', EmptyType);
  const nullInstance = RuntimeCore.nil = new EmptyType();

  // Make nil non-callable.
  nullInstance.call = nullInstance.apply = function() {
    throw RuntimeCore.LocalJumpError.create('A code block was expected but not supplied.');
  };

  // Define a special exception for 'break' statements.
  RuntimeCore.breakException = new Error('Unexpected break statement');

  // Second IIFE - represents a compiled Rubyish file.
  // This part would typically be generated dynamically by a compiler.
  // For Type III, we'll integrate it and rename.
  (function(envContext) {
    const selfRef = envContext.globalInstance;
    const currentScope = envContext;
    const nullVal = envContext.nil;
    const methodMissingHandler = envContext.methodMissingDispatcher;
    const breakSignal = envContext.breakException;
    const sliceUtil = envContext.sliceArray;
    const defineClassFunc = envContext.defineClass;

    // Example of defining a class 'MyClass' dynamically.
    // This is how a Rubyish `class MyClass; end` might translate.
    return (function(baseTypeRef, superTypeRef) {
      function MyClass() {};
      MyClass = defineClassFunc(baseTypeRef, superTypeRef, "MyClass", MyClass);

      const protoMethods = MyClass.prototype;
      const classScope = MyClass.scopeRef;
      let tempMethod1, tempMethod2, tempMethod3, tempMethod4;

      // Class.new definition (simplified from original)
      MyClass.defineClassMethod('$create', tempMethod1 = function(parent) {
        let blockFromContext;
        blockFromContext = tempMethod1.blockRef || nullVal;
        tempMethod1.blockRef = null;

        if (parent === null || parent === void 0) {
          parent = classScope.BaseThing; // Default parent is BaseThing
        }
        // ... rest of the Class.new logic ...
        // (This part is intentionally simplified as it's an example of a class being defined *within* the system)
        return MyClass; // For demonstration, just return MyClass
      });

      // Example instance method
      protoMethods.$hello = function() {
        return "Hello from MyClass!";
      };

      // Example class method
      MyClass.defineClassMethod('$greet_all', function() {
        return "Greetings from the class!";
      });

    })(currentScope.TypeDefinition, currentScope.BaseThing); // MyClass defined within TypeDefinition, inheriting from BaseThing

  })(RuntimeCore); // Pass the main runtime environment to the "compiled file"
}).call(globalThis); // Ensure `this` refers to the global object