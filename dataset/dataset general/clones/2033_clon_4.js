(function(voidParam) {
  // The global namespace for our Ruby-like object model, replacing 'Opal'
  const RubyCore = this.RubyCore = {};

  // Internal counter for generating unique identifiers for Ruby entities
  let globalEntityCounter = 0;

  // Utility function for checking own properties, replacing '$hasOwn'
  const ownPropertyChecker = Object.prototype.hasOwnProperty;
  // Utility function for slicing arrays, replacing '$slice'
  const arraySectionExtractor = Array.prototype.slice;

  // A WeakMap to store internal metadata for each Ruby entity (class, module, instance, etc.).
  // This is a key divergence from the original, which directly attaches properties.
  const entityMetaRegistry = new WeakMap();

  // Helper to safely retrieve metadata associated with a JavaScript object or function.
  function getEntityMeta(target) {
    if (target && (typeof target === 'object' || typeof target === 'function')) {
      return entityMetaRegistry.get(target);
    }
    return null;
  }

  // Helper to safely set metadata for a JavaScript object or function.
  function setEntityMeta(target, metadata) {
    if (target && (typeof target === 'object' || typeof target === 'function')) {
      entityMetaRegistry.set(target, metadata);
    }
  }

  // Base JavaScript constructors for core Ruby types. These are the "allocators" for instances.
  function RootBehaviorOrigin() {} // Replaces BasicObject constructor
  function UniversalBehaviorOrigin() {} // Replaces Object constructor
  function TypeHierarchyBlueprint() {} // Replaces Class constructor
  function BehaviorGroupContainer() {} // Replaces Module constructor
  function AbsenceDefinition() {} // Replaces NilClass constructor

  // References to the actual Ruby *entity objects* (not just their JS constructors).
  let BaseRubyObjectEntity;
  let UniversalRubyObjectEntity;
  let BehaviorGroupEntity;
  let TypeHierarchyEntity;

  // List to track native JS classes integrated as Ruby classes, replacing 'bridged_classes'.
  const integratedNativeTypes = [];

  // Top-level constant realm, replacing 'TopScope' and 'Opal' as the base for constants.
  const GlobalConstantRealmRoot = function() {};
  GlobalConstantRealmRoot.prototype = RubyCore; // Allows RubyCore to inherit constants from this root
  RubyCore.constructor = GlobalConstantRealmRoot; // Links the constructor
  RubyCore.constantNames = new Set(); // Stores constant names in this top-level realm, replacing 'Opal.constants'

  // Reference to the global execution environment, replacing 'Opal.global'.
  RubyCore.globalEnvironment = this;

  // Function to generate a unique identifier, replacing 'Opal.uid'.
  RubyCore.generateUniqueKey = function() {
    return ++globalEntityCounter;
  };

  // Storage for class variables, replacing 'Opal.cvars'.
  RubyCore.classVariableStore = new Map();

  // Storage for global variables, replacing 'Opal.gvars'.
  RubyCore.globalVariableStore = new Map();

  /*
   * Establishes a new constant realm for a given Ruby entity (class or module).
   * This realm prototypically inherits constants from its designated parent realm.
   *
   * @param {Object} parentConstantRealm - The parent constant realm object from which to inherit.
   * @param {Object} ownerRubyEntity - The Ruby entity (class/module) that owns this new realm.
   * @param {string} [constantLabel] - The name under which the `ownerRubyEntity` will be registered in the `parentConstantRealm`.
   * @returns {Object} The newly created constant realm object.
   */
  function establishConstantRealm(parentConstantRealm, ownerRubyEntity, constantLabel) {
    // The new realm prototypically inherits from the parent realm for constant lookup.
    const newRealm = Object.create(parentConstantRealm);
    newRealm.constantNames = new Set(); // Local set to track constant names within this specific realm.

    // Link the owner entity's metadata to this new realm.
    getEntityMeta(ownerRubyEntity).constantRealm = newRealm;
    newRealm.owningEntity = ownerRubyEntity; // Link realm back to its owning entity.

    if (constantLabel) {
      // Register the owner entity as a property on the parent realm and add its name to the parent's set.
      parentConstantRealm[constantLabel] = ownerRubyEntity;
      parentConstantRealm.constantNames.add(constantLabel);
    }
    return newRealm;
  }
  RubyCore.establishConstantRealm = establishConstantRealm;

  /*
   * Helper function to configure a JavaScript constructor's prototype for instances.
   * This is part of the logic that replaces 'boot_defclass'.
   *
   * @param {Function} constructorFunc - The JavaScript constructor for instances.
   * @param {Function|null} parentConstructorFunc - The JavaScript constructor of the superclass, if any.
   * @returns {Function} The configured constructorFunc.
   */
  function setupInstanceConstructor(constructorFunc, parentConstructorFunc) {
    if (parentConstructorFunc) {
      // Use a temporary constructor to establish the prototype chain without calling the parent's constructor.
      const prototypeInheritor = function() {};
      prototypeInheritor.prototype = parentConstructorFunc.prototype;
      constructorFunc.prototype = new prototypeInheritor();
    }
    constructorFunc.prototype.constructor = constructorFunc; // Ensure 'constructor' property points correctly.
    return constructorFunc;
  }

  /*
   * Helper function to create and configure a Ruby class entity (the meta-object).
   * This is part of the logic that replaces 'boot_makemeta'.
   *
   * @param {string} classLabel - The name of the Ruby class.
   * @param {Function} instanceConstructorFunc - The JavaScript constructor for instances of this class.
   * @param {Object} parentClassEntity - The Ruby class entity from which this class inherits.
   * @returns {Object} The newly created Ruby class entity.
   */
  function setupClassEntityMeta(classLabel, instanceConstructorFunc, parentClassEntity) {
    const parentMeta = getEntityMeta(parentClassEntity);

    // The prototype for the class object itself (where class methods are defined).
    // It inherits from the parent class's meta-prototype.
    const metaProtoInheritor = function() {};
    metaProtoInheritor.prototype = parentMeta.metaPrototype;

    function RubyClassContainer() {} // Temporary constructor to establish prototype for the class object.
    RubyClassContainer.prototype = new metaProtoInheritor();

    const classEntity = new RubyClassContainer(); // This is the actual Ruby class object.

    setEntityMeta(classEntity, {
      kind: 'class',
      label: classLabel,
      identifier: RubyCore.generateUniqueKey(),
      instanceConstructor: instanceConstructorFunc,
      isClassEntity: true, // Flag to indicate it's a class.
      parentEntity: parentClassEntity, // Reference to the direct Ruby superclass entity.
      classReference: TypeHierarchyEntity, // Default: most classes are instances of Ruby's 'Class'.
      metaObject: TypeHierarchyEntity, // Default: the meta-object of most classes is Ruby's 'Class'.
      instancePrototype: instanceConstructorFunc.prototype, // The JS prototype for instances of this class.
      metaPrototype: classEntity.prototype, // The JS prototype for this class object itself (where its class methods live).
      constantRealm: null, // Will be set by establishConstantRealm.
      definedMethods: new Set(), // Methods defined directly on this class.
      includedModules: [], // Replaces '__inc__'.
      inheritanceParent: parentClassEntity, // Replaces '__parent'.
      originalScope: null // Replaces '_orig_scope'.
    });

    // Link the instance prototype back to its owning class entity.
    instanceConstructorFunc.prototype.classReference = classEntity; // Replaces '_klass'.

    // For core classes, also attach to the global RubyCore object and its constant names.
    RubyCore[classLabel] = classEntity;
    RubyCore.constantNames.add(classLabel);

    return classEntity;
  }

  /*
   * Main function to define or retrieve a Ruby class, replacing 'Opal.klass'.
   *
   * @param {Object} currentContext - The current `self` value (Ruby entity or instance) where the class is being defined.
   * @param {Object|null} superClassCandidate - The potential superclass Ruby entity, or null if none specified.
   * @param {string} classLabel - The name of the class to define or retrieve.
   * @param {Function} classInstanceConstructor - A JavaScript constructor function for instances (used for debugging names).
   * @returns {Object} The Ruby class entity.
   */
  RubyCore.defineClass = function(currentContext, superClassCandidate, classLabel, classInstanceConstructor) {
    // Determine the effective base entity (class or module) from the current context.
    const baseMeta = getEntityMeta(currentContext);
    let effectiveBaseEntity = baseMeta && baseMeta.isClassEntity ? currentContext : baseMeta.classReference;

    // If no superclass is explicitly given, default to UniversalRubyObjectEntity ('Object').
    let effectiveSuperClass = superClassCandidate === null ? UniversalRubyObjectEntity : superClassCandidate;

    const baseConstantRealm = getEntityMeta(effectiveBaseEntity).constantRealm;
    let existingClass = baseConstantRealm[classLabel];
    let classMetadata;

    // Check if a constant with this name already exists in the scope.
    if (ownPropertyChecker.call(baseConstantRealm, classLabel) && getEntityMeta(existingClass).originalScope === baseConstantRealm) {
      classMetadata = getEntityMeta(existingClass);
      // Ensure the existing constant is indeed a class.
      if (!classMetadata.isClassEntity) {
        throw new TypeError(classLabel + " is not a class");
      }
      // Ensure the superclass matches, preventing runtime superclass changes.
      if (classMetadata.parentEntity !== effectiveSuperClass && effectiveSuperClass !== UniversalRubyObjectEntity) {
        throw new TypeError("superclass mismatch for class " + classLabel);
      }
      return existingClass; // Return the existing class.
    } else if (typeof(effectiveSuperClass) === 'function') {
      // If a native JS constructor is provided as a 'superclass', bridge it as a Ruby class.
      return RubyCore.integrateNativeType(classLabel, effectiveSuperClass);
    } else {
      // Create a new class entity.
      setupInstanceConstructor(classInstanceConstructor, getEntityMeta(effectiveSuperClass).instanceConstructor);
      const newClassEntity = setupClassEntityMeta(classLabel, classInstanceConstructor, effectiveSuperClass);
      classMetadata = getEntityMeta(newClassEntity);

      // Establish a new constant realm for the new class, linked to the base context's realm.
      establishConstantRealm(baseConstantRealm, newClassEntity, classLabel);

      // Store a reference to the original scope to differentiate re-opening classes.
      classMetadata.originalScope = baseConstantRealm;

      // Copy constants from the superclass (unless it's BasicObject or Object).
      if (effectiveSuperClass !== UniversalRubyObjectEntity && effectiveSuperClass !== BaseRubyObjectEntity) {
        RubyCore.transferConstants(effectiveSuperClass, newClassEntity);
      }

      // Invoke the '$inherited' hook on the superclass if it exists.
      const superMeta = getEntityMeta(effectiveSuperClass);
      if (superMeta.inheritedHook) {
        superMeta.inheritedHook.call(effectiveSuperClass, newClassEntity);
      }

      return newClassEntity;
    }
  };

  /*
   * Creates a fundamental Ruby module entity, replacing 'boot_module' logic.
   *
   * @returns {Object} The newly created Ruby module entity object.
   */
  function initializeModuleEntity() {
    // Modules don't have a direct instance constructor in the same way classes do.
    // Their `instancePrototype` is mainly for mixin purposes.
    const moduleInstanceProto = {};
    const parentMeta = getEntityMeta(UniversalRubyObjectEntity); // Modules implicitly inherit from Object.

    // Setup the prototype for the module object itself (where module methods are defined).
    const metaProtoInheritor = function() {};
    metaProtoInheritor.prototype = parentMeta.metaPrototype;

    function ModuleContainer() {}
    ModuleContainer.prototype = new metaProtoInheritor();

    const moduleEntity = new ModuleContainer();

    setEntityMeta(moduleEntity, {
      kind: 'module',
      label: null, // Will be set later.
      identifier: RubyCore.generateUniqueKey(),
      instanceConstructor: null, // Modules don't instantiate directly.
      isClassEntity: true, // Modules are often treated as classes in some contexts.
      parentEntity: UniversalRubyObjectEntity, // Modules inherit from Ruby Object.
      classReference: TypeHierarchyEntity, // A module's class is Ruby's 'Class'.
      metaObject: TypeHierarchyEntity, // A module's meta-object is Ruby's 'Class'.
      instancePrototype: moduleInstanceProto,
      metaPrototype: moduleEntity.prototype,
      constantRealm: null,
      definedMethods: new Set(),
      includedModules: [],
      inheritanceParent: UniversalRubyObjectEntity,
      isModuleEntity: true, // Replaces '__mod__'.
      dependentEntities: [] // Replaces '__dep__'.
    });

    return moduleEntity;
  }
  RubyCore.initializeModuleEntity = initializeModuleEntity; // Expose for use by defineModule.

  /*
   * Defines or retrieves a Ruby module, replacing 'Opal.module'.
   *
   * @param {Object} currentContext - The current `self` value (Ruby entity or instance).
   * @param {string} moduleLabel - The name of the module.
   * @returns {Object} The Ruby module entity.
   */
  RubyCore.defineModule = function(currentContext, moduleLabel) {
    const baseMeta = getEntityMeta(currentContext);
    let effectiveBaseEntity = baseMeta && baseMeta.isClassEntity ? currentContext : baseMeta.classReference;
    const baseConstantRealm = getEntityMeta(effectiveBaseEntity).constantRealm;

    let moduleEntity;

    if (ownPropertyChecker.call(baseConstantRealm, moduleLabel)) {
      moduleEntity = baseConstantRealm[moduleLabel];
      const moduleMetadata = getEntityMeta(moduleEntity);

      // Ensure the existing constant is actually a module.
      if (!moduleMetadata.isModuleEntity && moduleEntity !== UniversalRubyObjectEntity) {
        throw new TypeError(moduleLabel + " is not a module");
      }
    } else {
      // Create a new module if it doesn't exist.
      moduleEntity = initializeModuleEntity();
      getEntityMeta(moduleEntity).label = moduleLabel;

      establishConstantRealm(baseConstantRealm, moduleEntity, moduleLabel);
    }
    return moduleEntity;
  };

  /*
   * Bridges a native JavaScript constructor (e.g., Array, Function) to behave like a Ruby class.
   * Replaces 'bridge_class'.
   *
   * @param {string} name - The name of the Ruby class to create.
   * @param {Function} constructor - The native JavaScript constructor to bridge.
   * @returns {Object} The new Ruby class entity.
   */
  RubyCore.integrateNativeType = function(name, constructor) {
    // Set up the instance prototype for the native constructor.
    setupInstanceConstructor(constructor, getEntityMeta(UniversalRubyObjectEntity).instanceConstructor);
    // Create the class entity, inheriting from UniversalRubyObjectEntity ('Object').
    const newClassEntity = setupClassEntityMeta(name, constructor, UniversalRubyObjectEntity);
    const classMetadata = getEntityMeta(newClassEntity);

    // Establish a constant realm for it under the global scope.
    establishConstantRealm(RubyCore, newClassEntity, name);
    integratedNativeTypes.push(newClassEntity);

    // Donate methods from BasicObject and Object to the native constructor's prototype.
    const baseObjectInstanceProto = getEntityMeta(BaseRubyObjectEntity).instancePrototype;
    const universalObjectInstanceProto = getEntityMeta(UniversalRubyObjectEntity).instancePrototype;

    const methodsToDonate = new Set();
    // Collect methods from BaseRubyObjectEntity's instance prototype.
    Object.getOwnPropertyNames(baseObjectInstanceProto).forEach(prop => {
      if (typeof baseObjectInstanceProto[prop] === 'function' && !baseObjectInstanceProto[prop].isPlaceholderMethod) {
        methodsToDonate.add(prop);
      }
    });
    // Collect methods from UniversalRubyObjectEntity's instance prototype (will override BasicObject's if names conflict).
    Object.getOwnPropertyNames(universalObjectInstanceProto).forEach(prop => {
      if (typeof universalObjectInstanceProto[prop] === 'function' && !universalObjectInstanceProto[prop].isPlaceholderMethod) {
        methodsToDonate.add(prop);
      }
    });

    // Assign collected methods to the native constructor's prototype.
    methodsToDonate.forEach(methodName => {
      constructor.prototype[methodName] = universalObjectInstanceProto[methodName];
    });

    return newClassEntity;
  };

  /*
   * Assigns a constant within a module's scope, replacing 'Opal.casgn'.
   *
   * @param {Object} targetModule - The Ruby module entity.
   * @param {string} constantName - The name of the constant.
   * @param {Object} constantValue - The value to assign.
   * @returns {Object} The assigned value.
   */
  RubyCore.assignConstant = function(targetModule, constantName, constantValue) {
    const moduleMetadata = getEntityMeta(targetModule);
    const targetRealm = moduleMetadata.constantRealm;
    const valueMetadata = getEntityMeta(constantValue);

    if (valueMetadata.isClassEntity && valueMetadata.label === voidParam) {
      valueMetadata.label = constantName;
    }

    if (valueMetadata.isClassEntity) {
      valueMetadata.baseModule = targetModule; // Replaces '_base_module'.
    }

    targetRealm.constantNames.add(constantName);
    return targetRealm[constantName] = constantValue;
  };

  /*
   * Declares a constant directly in a given scope, replacing 'Opal.cdecl'.
   *
   * @param {Object} targetRealm - The constant realm where the constant will be declared.
   * @param {string} constantName - The name of the constant.
   * @param {Object} constantValue - The value to assign.
   * @returns {Object} The declared value.
   */
  RubyCore.declareConstant = function(targetRealm, constantName, constantValue) {
    targetRealm.constantNames.add(constantName);
    return targetRealm[constantName] = constantValue;
  };

  /*
   * Retrieves a constant from a scope, potentially traversing a path, replacing 'Opal.cget'.
   *
   * @param {Object} initialRealmOrPath - The starting constant realm or the full path string.
   * @param {string} [pathString] - The constant path (e.g., "Foo::Bar") if `initialRealmOrPath` is the realm.
   * @returns {Object} The retrieved constant.
   */
  RubyCore.retrieveConstant = function(initialRealmOrPath, pathString) {
    let currentRealm;
    let lookupPath;

    if (pathString === null || pathString === voidParam) {
      lookupPath = initialRealmOrPath;
      currentRealm = getEntityMeta(UniversalRubyObjectEntity).constantRealm; // Default base for lookup is Object's realm.
    } else {
      currentRealm = getEntityMeta(initialRealmOrPath).constantRealm;
      lookupPath = pathString;
    }

    const pathSegments = String(lookupPath).split('::');

    let resultEntity = currentRealm.owningEntity; // Start lookup from the entity associated with the current realm.

    while (pathSegments.length > 0) {
      const segment = pathSegments.shift();
      // Assumes Ruby entities have a 'getConstantValue' method (equivalent to '$const_get').
      if (!resultEntity.getConstantValue) {
        throw new Error(`Constant lookup error: ${getEntityMeta(resultEntity).label} does not support constant retrieval.`);
      }
      resultEntity = resultEntity.getConstantValue(segment);
    }
    return resultEntity;
  };

  /*
   * Transfers constants from a source Ruby entity (module/class) to a target Ruby entity, replacing 'Opal.donate_constants'.
   *
   * @param {Object} sourceEntity - The Ruby entity from which to copy constants.
   * @param {Object} targetEntity - The Ruby entity to which constants will be copied.
   */
  RubyCore.transferConstants = function(sourceEntity, targetEntity) {
    const sourceRealm = getEntityMeta(sourceEntity).constantRealm;
    const targetRealm = getEntityMeta(targetEntity).constantRealm;

    sourceRealm.constantNames.forEach(name => {
      if (!targetRealm.constantNames.has(name)) { // Only add if not already present.
        targetRealm.constantNames.add(name);
        targetRealm[name] = sourceRealm[name];
      }
    });
  };

  /*
   * Installs method placeholder functions on the base instance prototype (BasicObject.prototype),
   * replacing 'Opal.add_stubs'. These placeholders dispatch to `handleMissingMethod` if the actual method is not defined.
   *
   * @param {Array<string>} placeholderNames - An array of method names (e.g., "$foo").
   */
  RubyCore.installMethodPlaceholders = function(placeholderNames) {
    const baseInstanceProto = getEntityMeta(BaseRubyObjectEntity).instancePrototype;

    for (let i = 0, len = placeholderNames.length; i < len; i++) {
      const placeholderKey = placeholderNames[i];
      if (!ownPropertyChecker.call(baseInstanceProto, placeholderKey)) {
        // Only add if not already defined on the prototype.
        createPlaceholderFunction(baseInstanceProto, placeholderKey);
      }
    }
  };

  /*
   * Creates and adds a method placeholder function to a given prototype. Replaces 'add_stub_for'.
   *
   * @param {Object} targetPrototype - The prototype to add the function to.
   * @param {string} placeholderKey - The name of the placeholder method (e.g., "$foo").
   */
  function createPlaceholderFunction(targetPrototype, placeholderKey) {
    function methodMissingDispatcher() {
      // Transfer any associated block argument to the 'handleMissingMethod' equivalent.
      this.handleMissingMethod.blockArgument = methodMissingDispatcher.blockArgument;
      methodMissingDispatcher.blockArgument = null; // Clear for the next call.

      // Call the 'handleMissingMethod' equivalent, stripping the '$' prefix from the method name.
      return this.handleMissingMethod.apply(this, [placeholderKey.slice(1)].concat(arraySectionExtractor.call(arguments)));
    }
    methodMissingDispatcher.isPlaceholderMethod = true; // Mark as a placeholder method, replacing 'rb_stub'.
    targetPrototype[placeholderKey] = methodMissingDispatcher;
  }
  RubyCore.createPlaceholderFunction = createPlaceholderFunction;

  // Constant missing dispatcher, replacing 'Opal.cm'.
  RubyCore.handleConstantMissing = function(constantName) {
    // Assumes the owning entity has a 'triggerConstantMissing' method.
    return this.owningEntity.triggerConstantMissing(constantName);
  };

  // Arity check error dispatcher, replacing 'Opal.ac'.
  RubyCore.handleArgumentError = function(actualCount, expectedCount, targetObject, methodName) {
    const targetMetadata = getEntityMeta(targetObject);
    const inspectLabel = (targetMetadata.isClassEntity ? targetMetadata.label + '.' : targetMetadata.classReference.label + '#') + methodName;
    const errorMessage = '[' + inspectLabel + '] wrong number of arguments(' + actualCount + ' for ' + expectedCount + ')';
    throw new TypeError(errorMessage); // Using native TypeError consistent with original's TypeErrors.
  };

  /*
   * Super method dispatcher, replacing 'Opal.find_super_dispatcher'.
   * Locates the next method in the inheritance chain for 'super' calls.
   *
   * @param {Object} receiverObject - The object on which 'super' is called.
   * @param {string} jsMethodId - The JavaScript method ID (e.g., "$method").
   * @param {Function} currentInvokerFunc - The function from which 'super' is being called.
   * @param {Object} [optionalBlock] - An optional block argument.
   * @param {Object} [methodDefinitions] - Optional explicit method definitions source (e.g., from a module include).
   * @returns {Object} The prototype object where the 'super' method is found.
   */
  RubyCore.locateSuperMethod = function(receiverObject, jsMethodId, currentInvokerFunc, optionalBlock, methodDefinitions) {
    let methodSourcePrototype;
    const receiverMetadata = getEntityMeta(receiverObject);

    if (methodDefinitions) {
      // If explicit method definitions are provided (e.g., from a module include/prepend).
      methodSourcePrototype = receiverMetadata.isClassEntity ? getEntityMeta(methodDefinitions).parentEntity : getEntityMeta(methodDefinitions).instancePrototype;
    } else {
      if (receiverMetadata.isClassEntity) {
        // If the receiver is a class, look in its parent class's meta-prototype.
        methodSourcePrototype = getEntityMeta(receiverMetadata.parentEntity).metaPrototype;
      } else {
        // If the receiver is an instance, traverse its prototype chain to find the method after 'currentInvokerFunc'.
        let currentInstanceProto = receiverObject.classReference.instancePrototype;
        let foundCurrent = false;
        while (currentInstanceProto) {
          if (ownPropertyChecker.call(currentInstanceProto, jsMethodId) && currentInstanceProto[jsMethodId] === currentInvokerFunc) {
            foundCurrent = true; // Found the current method's definition.
          } else if (foundCurrent && ownPropertyChecker.call(currentInstanceProto, jsMethodId)) {
            methodSourcePrototype = currentInstanceProto; // This is the 'super' method's prototype.
            break;
          }
          currentInstanceProto = Object.getPrototypeOf(currentInstanceProto);
        }
        if (!methodSourcePrototype) {
          // Fallback: if 'currentInvokerFunc' wasn't found or 'super' is at the top, use parent class's instance prototype.
          methodSourcePrototype = getEntityMeta(receiverMetadata.classReference.parentEntity).instancePrototype;
        }
      }
    }
    return methodSourcePrototype;
  };

  // --- Core Ruby Class Bootstrapping ---

  // 1. BaseRubyObjectEntity (replaces BasicObject)
  setupInstanceConstructor(RootBehaviorOrigin, null); // Root instances have no JS prototype parent.
  BaseRubyObjectEntity = setupClassEntityMeta('BasicObject', RootBehaviorOrigin, {
    // Dummy parent for initial meta-prototype, BasicObject's class methods inherit from JS Object.prototype.
    metaPrototype: Object.prototype
  });
  const baseObjectMetadata = getEntityMeta(BaseRubyObjectEntity);
  baseObjectMetadata.parentEntity = null; // BasicObject has no Ruby superclass.
  baseObjectMetadata.classReference = null; // Will be set to TypeHierarchyEntity ('Class') later.
  baseObjectMetadata.metaObject = BaseRubyObjectEntity; // BasicObject is its own meta-object initially.
  baseObjectMetadata.constantRealm = establishConstantRealm(GlobalConstantRealmRoot, BaseRubyObjectEntity, 'BasicObject');
  RubyCore.BaseRubyObject = BaseRubyObjectEntity;

  // 2. UniversalRubyObjectEntity (replaces Object)
  setupInstanceConstructor(UniversalBehaviorOrigin, RootBehaviorOrigin); // Object instances inherit from BasicObject instances.
  UniversalRubyObjectEntity = setupClassEntityMeta('Object', UniversalBehaviorOrigin, BaseRubyObjectEntity);
  const universalObjectMetadata = getEntityMeta(UniversalRubyObjectEntity);
  universalObjectMetadata.constantRealm = establishConstantRealm(getEntityMeta(BaseRubyObjectEntity).constantRealm, UniversalRubyObjectEntity, 'Object');
  RubyCore.UniversalRubyObject = UniversalRubyObjectEntity;

  // 3. TypeHierarchyEntity (replaces Class)
  setupInstanceConstructor(TypeHierarchyBlueprint, UniversalBehaviorOrigin); // Class instances inherit from Object instances.
  TypeHierarchyEntity = setupClassEntityMeta('Class', TypeHierarchyBlueprint, UniversalRubyObjectEntity);
  const typeHierarchyMetadata = getEntityMeta(TypeHierarchyEntity);
  // Special case: Class's class is Class itself, and its meta-object is Class itself.
  typeHierarchyMetadata.classReference = TypeHierarchyEntity;
  typeHierarchyMetadata.metaObject = TypeHierarchyEntity;
  typeHierarchyMetadata.constantRealm = establishConstantRealm(getEntityMeta(UniversalRubyObjectEntity).constantRealm, TypeHierarchyEntity, 'Class');
  RubyCore.TypeHierarchy = TypeHierarchyEntity;

  // Now that TypeHierarchyEntity ('Class') is defined, update the class references for previously defined classes.
  getEntityMeta(BaseRubyObjectEntity).classReference = TypeHierarchyEntity;
  getEntityMeta(UniversalRubyObjectEntity).classReference = TypeHierarchyEntity;

  // 4. BehaviorGroupEntity (replaces Module)
  BehaviorGroupEntity = initializeModuleEntity(); // Uses the specialized module initializer.
  getEntityMeta(BehaviorGroupEntity).label = 'Module';
  getEntityMeta(BehaviorGroupEntity).constantRealm = establishConstantRealm(getEntityMeta(UniversalRubyObjectEntity).constantRealm, BehaviorGroupEntity, 'Module');
  RubyCore.BehaviorGroup = BehaviorGroupEntity;

  // 5. NullEntity (replaces NilClass)
  setupInstanceConstructor(AbsenceDefinition, UniversalBehaviorOrigin); // NilClass instances inherit from Object instances.
  const NullEntity = setupClassEntityMeta('NilClass', AbsenceDefinition, UniversalRubyObjectEntity);
  getEntityMeta(NullEntity).constantRealm = establishConstantRealm(getEntityMeta(UniversalRubyObjectEntity).constantRealm, NullEntity, 'NilClass');
  RubyCore.NullEntity = NullEntity;

  // Add the 'getConstantValue' method to Ruby entities for constant lookup (equivalent to '$const_get').
  function getConstantValueImplementation(constantName) {
    const entityMetadata = getEntityMeta(this);
    let currentConstantRealm = entityMetadata.constantRealm;
    while (currentConstantRealm) {
      if (ownPropertyChecker.call(currentConstantRealm, constantName)) {
        return currentConstantRealm[constantName];
      }
      // Traverse the prototypal chain of constant realms for inherited constants.
      currentConstantRealm = Object.getPrototypeOf(currentConstantRealm);
    }
    // If constant not found, dispatch to 'handleConstantMissing'.
    return RubyCore.handleConstantMissing.call(entityMetadata.constantRealm, constantName);
  }

  // Attach 'getConstantValue' to the instance prototypes of Class and Module, and to the core class objects themselves.
  getEntityMeta(TypeHierarchyEntity).instancePrototype.getConstantValue = getConstantValueImplementation;
  getEntityMeta(BehaviorGroupEntity).instancePrototype.getConstantValue = getConstantValueImplementation;
  BaseRubyObjectEntity.getConstantValue = getConstantValueImplementation;
  UniversalRubyObjectEntity.getConstantValue = getConstantValueImplementation;
  TypeHierarchyEntity.getConstantValue = getConstantValueImplementation;
  BehaviorGroupEntity.getConstantValue = getConstantValueImplementation;
  NullEntity.getConstantValue = getConstantValueImplementation;

  // Add a default 'handleMissingMethod' to the BaseRubyObject instance prototype.
  RootBehaviorOrigin.prototype.handleMissingMethod = function(methodName, ...args) {
      throw new Error(`Method '${methodName}' not found for ${getEntityMeta(this.classReference).label} instance.`);
  };

})(void 0); // Using 'void 0' instead of 'undefined' for divergence.