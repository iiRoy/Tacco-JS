( function( undefined ) {
  // This is the primary Opal object; it's made available globally.
  var Opal = this.Opal = {};

  /*
   * Declaration for the RubyBasicObject class.
   * Its value will be assigned later during initialization.
   */
  var RubyBasicObject;

  // This variable will hold a reference to the fundamental Ruby Object class.
  var RubyObject;

  // Placeholder for the RubyModule class.
  var RubyModule;

  // The RubyClass class reference.
  var RubyClass;

  // Constructor function for instances of BasicObject.
  function BasicObject( ) {
  }

  // Constructor for new instances of the Object class.
  function Object( ) {
  }

  // Constructor for instances of the Class class.
  function Class( ) {
  }

  // Constructor for instances of the Module class.
  function Module( ) {
  }

  // This constructor is specifically for instances of NilClass, representing Ruby's 'nil'.
  function NilClass( ) {
  }

  // An array to keep track of all bridged classes.
  // This is necessary for donating methods from Object later.
  var bridged_classes = [ ];

  // TopScope serves as a mechanism for inheriting constants from the top-level scope.
  var TopScope = function( ) {
  };

  // Opal itself acts as the top-level scope for constants.
  TopScope.prototype = Opal;

  // To facilitate scope inheritance, Opal's constructor is set to TopScope.
  Opal.constructor = TopScope;

  // Initialize an empty array to store constants defined in the Opal scope.
  Opal.constants = [ ];

  /*
   * A crucial reference to the global object within Ruby files.
   * This allows Ruby code to interact with the JavaScript global context.
   */
  Opal.global = this;

  // Minify frequently used function calls for efficiency.
  var $hasOwn = Opal.hasOwnProperty;
  var $slice = Opal.slice = Array.prototype.slice;

  // A counter to generate unique identifiers for every Ruby object.
  var unique_id = 0;

  // Function to return the next available unique ID and increment the counter.
  Opal.uid = function( ) {
    return unique_id++;
  };

  // This object stores all class variables.
  Opal.cvars = {};

  // This object stores all global variables.
  Opal.gvars = {};

  /**
   * Creates a new constants scope for a given class.
   * Constants are resolved hierarchically through parent scopes.
   * The `base` scope defines the outer context for the new `klass`.
   *
   * @param {Object} base - The parent scope from which constants are inherited.
   * @param {Object} klass - The class or module for which the new scope is being created.
   * @param {string} id - The name of the class/module, used to register it in the base scope.
   */
  function create_scope( base, klass, id ) {
    var const_alloc = function( ) {
    };
    var const_scope = const_alloc.prototype = new base.constructor( );
    klass._scope = const_scope;
    const_scope.base = klass;
    klass._base_module = base.base;
    const_scope.constructor = const_alloc;
    const_scope.constants = [ ];

    if ( id ) {
      klass._orig_scope = base;
      base[id] = base.constructor[id] = klass;
      base.constants.push( id );
    }
  }

  // Expose the create_scope function on the Opal object.
  Opal.create_scope = create_scope;

  /*
   * The `Opal.klass` function is invoked when a `class Foo; end` expression
   * is encountered in Ruby code. Its purpose is to either retrieve an existing
   * class by the given name or to construct a new one within the specified `base` scope.
   *
   * If a constant already exists with the given name, a check is performed
   * to ensure it is indeed a class and that its superclass matches.
   * Any discrepancies will result in a `TypeError`. Note that `superklass`
   * might be `null` if no explicit superclass was declared in the Ruby code.
   *
   * A `constructor` function (e.g., `function ClassName() {}`) is passed
   * primarily for debugging purposes, allowing class names to appear clearly
   * in browser developer tools or Node.js inspectors.
   *
   * The `base` argument represents the `self` context where the class definition
   * originates. This determines the scope in which the new class will be created.
   * If `base` is an object (not a class or module), its class is used as the base instead.
   *
   * @param {Object} base The context (self) where the class is being defined.
   * @param {Class|null} superklass The superclass of the new class, or null if none specified.
   * @param {string} id The name of the class to be created or retrieved.
   * @param {Function} constructor A JavaScript constructor function for the class.
   * @returns {Class} The new or existing Ruby class.
   */
  Opal.klass = function( base, superklass, id, constructor ) {

    // If the base is not a class itself, use its own class as the base.
    if ( !base._isClass ) {
      base = base._klass;
    }

    // If no superclass is explicitly provided, it defaults to RubyObject.
    if ( superklass === null ) {
      superklass = RubyObject;
    }

    var klass = base._scope[id];

    // Check if a constant with the same ID already exists in the scope.
    if ( $hasOwn.call( base._scope, id ) && klass._orig_scope === base._scope ) {

      // If it exists, ensure it is actually a class.
      if ( !klass._isClass ) {
        throw Opal.TypeError.$new( id + " is not a class" );
      }

      // Also, verify that the existing class's superclass matches the one being defined.
      if ( superklass !== klass._super && superklass !== RubyObject ) {
        throw Opal.TypeError.$new( "superclass mismatch for class " + id );
      }
    }
    // Handle the case where a native JavaScript constructor is passed as superklass.
    else if ( typeof( superklass ) === 'function' ) {
      // Bridge the native constructor as a Ruby class.
      return bridge_class( id, superklass );
    }
    else {
      // If the class does not exist, create a new one with the specified superclass.
      klass = boot_class( superklass, constructor );

      // Assign the class name (e.g., 'Foo' or 'Foo::Baz').
      klass._name = id;

      // Each class gets its own constant scope, inheriting from the current scope.
      create_scope( base._scope, klass, id );

      // Register the new class directly on the current scope.
      base[id] = base._scope[id] = klass;

      // Copy constants from the parent, unless the parent is Object or BasicObject.
      if ( superklass !== RubyObject && superklass !== RubyBasicObject ) {
        Opal.donate_constants( superklass, klass );
      }

      // Invoke the .inherited() hook on the superclass, if it exists.
      if ( superklass.$inherited ) {
        superklass.$inherited( klass );
      }
    }

    return klass;
  };

  // Helper function to create a generic class with a given superclass.
  // This handles the prototype chain for instances.
  var boot_class = Opal.boot = function( superklass, constructor ) {
    // Create a temporary constructor to set up the prototype chain for instances.
    var ctor = function( ) {
    };
    ctor.prototype = superklass._proto;

    // The new class's constructor prototype inherits from the superclass's instance prototype.
    constructor.prototype = new ctor( );

    // Ensure the constructor property points back to itself.
    constructor.prototype.constructor = constructor;

    // Then, create the meta-class (the class object itself).
    return boot_class_meta( superklass, constructor );
  };

  // This function creates the meta-class (the class object itself) for a Ruby class.
  function boot_class_meta( superklass, constructor ) {
    var mtor = function( ) {
    };
    mtor.prototype = superklass.constructor.prototype; // Inherit from the superclass's meta-class prototype.

    function OpalClass( ) {
    } // A temporary constructor for the meta-class.
    OpalClass.prototype = new mtor( );

    var klass = new OpalClass( ); // The actual class object.

    klass._id = unique_id++; // Assign a unique ID to the class.
    klass._alloc = constructor; // Reference to the JavaScript constructor for instances.
    klass._isClass = true; // Flag to identify this as a class.
    klass.constructor = OpalClass; // The constructor for the meta-class.
    klass._super = superklass; // Reference to its superclass.
    klass._methods = [ ]; // Array to store method names.
    klass.__inc__ = [ ]; // Included modules.
    klass.__parent = superklass; // Parent in the class hierarchy.
    klass._proto = constructor.prototype; // The prototype for instances of this class.

    constructor.prototype._klass = klass; // Link instance prototype back to its class.

    return klass;
  }

  // Function to define a new module or retrieve an existing one.
  Opal.module = function( base, id ) {
    var module;

    // If the base is an object, use its class as the base.
    if ( !base._isClass ) {
      base = base._klass;
    }

    // Check if a constant with the given ID already exists in the base scope.
    if ( $hasOwn.call( base._scope, id ) ) {
      module = base._scope[id];

      // If it exists, ensure it's a module (or RubyObject).
      if ( !module.__mod__ && module !== RubyObject ) {
        throw Opal.TypeError.$new( id + " is not a module" );
      }
    }
    else {
      // If the module doesn't exist, create a new one.
      module = boot_module( );
      module._name = id;

      // Create a scope for the new module.
      create_scope( base._scope, module, id );

      // Register the new module directly on the current scope.
      base[id] = base._scope[id] = module;
    }

    return module;
  };

  /*
   * Internal function: `boot_module`
   * Creates a new module instance by setting up its prototype hierarchy
   * and initializing its internal method tables and properties.
   */
  function boot_module( ) {
    var mtor = function( ) {
    };
    mtor.prototype = RubyModule.constructor.prototype; // Inherit from RubyModule's meta-class prototype.

    function OpalModule( ) {
    } // A temporary constructor for the module's meta-class.
    OpalModule.prototype = new mtor( );

    var module = new OpalModule( ); // The actual module object.

    module._id = unique_id++; // Assign a unique ID.
    module._isClass = true; // Modules are treated like classes in some contexts.
    module.constructor = OpalModule; // The constructor for the module's meta-class.
    module._super = RubyModule; // Its superclass is RubyModule.
    module._methods = [ ]; // Array to store method names.
    module.__inc__ = [ ]; // Included modules.
    module.__parent = RubyModule; // Parent in the hierarchy.
    module._proto = {}; // Prototype for objects that include this module.
    module.__mod__ = true; // Flag to identify this as a module.
    module.__dep__ = [ ]; // Dependencies.

    return module;
  }

  // `boot_defclass` is used to boot a base class, primarily for creating instances.
  var boot_defclass = function( id, constructor, superklass ) {
    if ( superklass ) {
      var ctor = function( ) {
      };
      ctor.prototype = superklass.prototype; // Inherit prototype from superklass.

      constructor.prototype = new ctor( ); // Set up the instance prototype chain.
    }

    constructor.prototype.constructor = constructor; // Ensure constructor points back.

    return constructor;
  };

  // `boot_makemeta` is for booting the actual (meta) classes of core Ruby classes.
  var boot_makemeta = function( id, constructor, superklass ) {

    var mtor = function( ) {
    };
    mtor.prototype = superklass.prototype; // Inherit prototype from the superklass.

    function OpalClass( ) {
    } // Temporary constructor for the meta-class.
    OpalClass.prototype = new mtor( );

    var klass = new OpalClass( ); // The actual class object.

    klass._id = unique_id++; // Unique ID for the class.
    klass._alloc = constructor; // The JavaScript constructor for instances.
    klass._isClass = true; // Flag indicating it's a class.
    klass._name = id; // The name of the class.
    klass._super = superklass; // Its superclass.
    klass.constructor = OpalClass; // Constructor for its meta-class.
    klass._methods = [ ]; // Array for method names.
    klass.__inc__ = [ ]; // Included modules.
    klass.__parent = superklass; // Parent in the hierarchy.
    klass._proto = constructor.prototype; // Prototype for instances.

    constructor.prototype._klass = klass; // Link instance prototype to its class.

    Opal[id] = klass; // Register the class on the Opal object.
    Opal.constants.push( id ); // Add its name to Opal's constants.

    return klass;
  };

  /*
   * For performance considerations, certain core Ruby classes are "toll-free" bridged
   * to their corresponding native JavaScript counterparts (e.g., a Ruby Array
   * is directly represented by a JavaScript Array).
   *
   * This `bridge_class` method sets up a native constructor (like `Array`) so that
   * its prototype behaves like a standard Ruby class. A new Ruby class is created
   * using the native constructor, and its prototype is configured as the target
   * for this new class. All bridged classes implicitly inherit from `Object`.
   *
   * Bridged classes are tracked in the `bridged_classes` array. This allows
   * methods defined on `Object` to be "donated" to these bridged classes,
   * effectively faking inheritance from our `Object` prototype for native prototypes.
   *
   * Example usage:
   *    `bridge_class("Proc", Function);`
   *
   * @param {string} name The name of the Ruby class to be created.
   * @param {Function} constructor The native JavaScript constructor to use.
   * @returns {Class} The newly created Ruby class.
   */
  function bridge_class( name, constructor ) {
    var klass = boot_class_meta( RubyObject, constructor );

    klass._name = name; // Set the name of the bridged class.

    create_scope( Opal, klass, name ); // Create a constant scope for it under Opal.
    bridged_classes.push( klass ); // Add to the list of bridged classes.

    // Combine methods from RubyBasicObject and RubyObject for donation.
    var object_methods = RubyBasicObject._methods.concat( RubyObject._methods );

    // Donate methods from RubyObject's prototype to the native constructor's prototype.
    for ( var i = 0, len = object_methods.length; i < len; i++ ) {
      var meth = object_methods[i];
      constructor.prototype[meth] = RubyObject._proto[meth];
    }

    return klass;
  }

  /*
   * `Opal.casgn` - Constant Assignment
   * Assigns a value to a constant within a base module's scope.
   *
   * @param {Object} base_module The module or class where the constant is defined.
   * @param {string} name The name of the constant.
   * @param {any} value The value to assign to the constant.
   * @returns {any} The assigned value.
   */
  Opal.casgn = function( base_module, name, value ) {
    var scope = base_module._scope;

    if ( value._isClass && value._name === nil ) {
      value._name = name;
    }

    if ( value._isClass ) {
      value._base_module = base_module;
    }

    scope.constants.push( name ); // Add constant name to the scope's list.
    return scope[name] = value; // Assign and return the value.
  };

  /*
   * `Opal.cdecl` - Constant Declaration
   * Declares and assigns a value to a constant in a given base scope.
   *
   * @param {Object} base_scope The scope where the constant is declared.
   * @param {string} name The name of the constant.
   * @param {any} value The value to assign to the constant.
   * @returns {any} The assigned value.
   */
  Opal.cdecl = function( base_scope, name, value ) {
    base_scope.constants.push( name ); // Add constant name to the scope's list.
    return base_scope[name] = value; // Assign and return the value.
  };

  /*
   * `Opal.cget` - Constant Get
   * Retrieves a constant from a given base scope, potentially traversing a path.
   *
   * @param {Object} base_scope The starting scope for constant lookup.
   * @param {string} path The path to the constant (e.g., "Foo::Bar").
   * @returns {any} The value of the constant.
   */
  Opal.cget = function( base_scope, path ) {
    if ( path == null ) {
      path = base_scope; // If path is null, base_scope is the path.
      base_scope = Opal.Object; // Default base_scope to Opal.Object.
    }

    var result = base_scope;

    path = path.split( '::' ); // Split path by '::' for nested constants.
    while ( path.length != 0 ) {
      result = result.$const_get( path.shift( ) ); // Resolve each part of the path.
    }

    return result;
  };

  /*
   * `Opal.donate_constants`
   * When a source module is included into a target module, its constants
   * must also be copied over to the target module's scope.
   *
   * @param {Object} source_mod The module from which constants are donated.
   * @param {Object} target_mod The module to which constants are donated.
   */
  Opal.donate_constants = function( source_mod, target_mod ) {
    var source_constants = source_mod._scope.constants,
      target_scope = target_mod._scope,
      target_constants = target_scope.constants;

    for ( var i = 0, length = source_constants.length; i < length; i++ ) {
      target_constants.push( source_constants[i] ); // Add to target's constant list.
      target_scope[source_constants[i]] = source_mod._scope[source_constants[i]]; // Copy the constant value.
    }
  };

  /*
   * `Opal.add_stubs`
   * Method stubs are essential for implementing `method_missing` in Opal.
   * A stub is a lightweight placeholder function that, when called,
   * dispatches to `method_missing` on the receiver. If a method with a given
   * name isn't actually defined on an object, the stub will be invoked,
   * which then triggers `method_missing`.
   *
   * When Ruby code is compiled to JavaScript, it includes a call to this function
   * to add stubs for all method names used in the compiled file. This ensures
   * that `method_missing` will function correctly for any detected method call.
   *
   * Method stubs are added to the `BasicObject.prototype`, from which all other
   * Ruby objects inherit, guaranteeing `method_missing` support across all objects.
   * A stub is only added if a property with the given name is not already defined.
   *
   * Note: All Ruby methods are prefixed with `$` in JavaScript for performance.
   * Consequently, all stubs also have this prefix.
   *
   * Example:
   *    `Opal.add_stubs(["$foo", "$bar", "$baz="]);`
   *
   * All stub functions possess a private `rb_stub` property set to `true`.
   * This allows internal methods, such as `Kernel#respond_to?`, to differentiate
   * between actual methods and stubs.
   *
   * @param {Array<string>} stubs An array of method stub names (e.g., "$method_name") to add.
   */
  Opal.add_stubs = function( stubs ) {
    for ( var i = 0, length = stubs.length; i < length; i++ ) {
      var stub = stubs[i];

      if ( !BasicObject.prototype[stub] ) {
        BasicObject.prototype[stub] = true; // Mark as present to avoid re-adding.
        add_stub_for( BasicObject.prototype, stub ); // Actually add the stub function.
      }
    }
  };

  /*
   * `add_stub_for`
   * Adds a `method_missing` stub function to the specified prototype for a given method name.
   *
   * @param {Object} prototype The target prototype object (e.g., BasicObject.prototype).
   * @param {string} stub The name of the stub to add (e.g., "$foo").
   */
  function add_stub_for( prototype, stub ) {
    function method_missing_stub( ) {
      // Transfer any provided block to the method_missing dispatcher.
      this.$method_missing._p = method_missing_stub._p;

      // Clear the block property for the next call to prevent false positives.
      method_missing_stub._p = null;

      // Call `method_missing` with the correct arguments (removing the '$' prefix from the method name).
      return this.$method_missing.apply( this, [ stub.slice( 1 ) ].concat( $slice.call( arguments ) ) );
    }

    method_missing_stub.rb_stub = true; // Mark this function as an Opal stub.
    prototype[stub] = method_missing_stub; // Assign the stub function to the prototype.
  }

  // Expose `add_stub_for` for internal use by other parts of Opal.
  Opal.add_stub_for = add_stub_for;

  // `Opal.cm` - Constant Missing dispatcher
  // Handles cases where a constant cannot be found, delegating to `$const_missing`.
  Opal.cm = function( name ) {
    return this.base.$const_missing( name );
  };

  // `Opal.ac` - Arity Check dispatcher
  // Throws an `ArgumentError` when a method is called with the wrong number of arguments.
  Opal.ac = function( actual, expected, object, meth ) {
    // Construct an inspect string for the object/method.
    var inspect = ( object._isClass ? object._name + '.' : object._klass._name + '#' ) + meth;
    var msg = '[' + inspect + '] wrong number of arguments(' + actual + ' for ' + expected + ')';
    throw Opal.ArgumentError.$new( msg );
  };

  // `Opal.find_super_dispatcher` - Super Method Dispatcher
  // Locates the correct `super` method to call in the inheritance chain.
  Opal.find_super_dispatcher = function( obj, jsid, current_func, iter, defs ) {
    var dispatcher;

    if ( defs ) {
      // If `defs` (definitions) are provided, determine dispatcher based on whether `obj` is a class.
      dispatcher = obj._isClass ? defs._super : obj._klass._proto;
    }
    else {
      if ( obj._isClass ) {
        dispatcher = obj._super; // If `obj` is a class, use its superclass.
      }
      else {
        // Otherwise, find the super dispatcher for an object instance.
        dispatcher = find_obj_super_dispatcher( obj, jsid, current_func );
      }
    }