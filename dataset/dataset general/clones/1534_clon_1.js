( function (undefined)
{
  /*
   * The main Opal object.
   * This object will be exposed globally in the JavaScript environment.
   */
  var Opal = this.Opal = {};


  // --- Core Classes ---

  // Represents the most basic Ruby object.
  function BasicObject () {}

  // The base class for all standard Ruby objects.
  function Object () {}

  // The metaclass for all classes.
  function Class () {}

  // The class of the 'nil' object.
  function NilClass () {}


  // --- Scope Management ---

  // TopScope facilitates constant inheritance from the global scope.
  var TopScope = function () {};

  // Opal itself functions as the top-level scope for constant lookups.
  TopScope.prototype = Opal;

  // Method to allocate new scopes within Opal's hierarchy.
  Opal.alloc = TopScope;


  // --- Global References ---

  // Reference to the global 'this' context, useful within Ruby files.
  Opal.global = this;


  // --- Internal Utilities ---

  // Shorthand for Object.prototype.hasOwnProperty, frequently used for checks.
  var __hasOwn = Opal.hasOwnProperty;
  // Shorthand for Array.prototype.slice, also exposed on Opal for convenience.
  var __slice = Opal.slice = Array.prototype.slice;

  // Counter for generating unique object IDs for internal tracking.
  var unique_id = 0;

  // Function to retrieve the next unique ID. Increments the counter each call.
  Opal.uid = function ()
  {
    return unique_id++;
  };

  /*
   * Stores class variables across the Opal runtime.
   */
  Opal.cvars = {};

  /*
   * Stores global variables, accessible from anywhere in Ruby code.
   */
  Opal.gvars = {};

  // Function to define or retrieve a class in the Opal runtime.
  Opal.klass = function ( base, superklass, id, constructor )
  {
    var klass; // Declare the variable that will hold the class.

    if ( base._isObject )
    {
      base = base._klass; // If base is an object instance, get its class.
    }

    if ( superklass === null )
    {
      superklass = Object; // Default superclass to Object if none specified.
    }

    // Check if a class with the given ID already exists in the base's scope.
    if ( __hasOwn.call( base._scope, id ) )
    {
      klass = base._scope[id]; // If it exists, retrieve it.
    }
    else
    {
      // The class does not exist, so we need to create it.
      if ( !superklass._methods )
      {
        // If the superklass doesn't have _methods, it's likely a native JS object.
        var bridged = superklass; // Store the original superclass.
        superklass = Object; // Set Opal's Object as its superclass.
        klass = bridge_class(bridged); // Bridge the native constructor.
      }
      else
      {
        klass = boot_class(superklass, constructor); // Boot a standard Ruby class.
      }

      // Set the class name, handling nested class names (e.g., MyModule::MyClass).
      klass._name = ( base === Object ? id : base._name + '::' + id );

      // Set up the constant scope for the new class.
      var const_alloc = function () {};
      var const_scope = const_alloc.prototype = new base._scope.alloc();
      klass._scope = const_scope;
      const_scope.base = klass;
      const_scope.alloc = const_alloc;

      // Register the new class in the base's scope and directly on the base.
      base[id] = base._scope[id] = klass;

      // Call the `inherited` hook on the superclass if it exists.
      if ( superklass.$inherited )
      {
        superklass.$inherited(klass);
      }
    }

    return klass; // Return the newly created or existing class.
  };

  // Defines a new module or retrieves an existing one in the Opal runtime.
  Opal.module = function ( base, id, constructor )
  {
    var klass; // Declare the variable for the module.

    if ( base._isObject )
    {
      base = base._klass; // If base is an object instance, get its class.
    }

    // Check if a module with the given ID already exists in the base's scope.
    if ( __hasOwn.call( base._scope, id ) )
    {
      klass = base._scope[id]; // If it exists, retrieve it.
    }
    else
    {
      // The module does not exist, so create it.
      klass = boot_class(Class, constructor); // Modules are essentially classes that inherit from Class.
      klass._name = ( base === Object ? id : base._name + '::' + id );

      klass.$included_in = []; // Initialize array for modules it's included in.

      var const_alloc = function () {};
      var const_scope = const_alloc.prototype = new base._scope.alloc();
      klass._scope = const_scope;
      const_scope.alloc = const_alloc;

      base[id] = base._scope[id] = klass; // Register the new module.
    }

    return klass; // Return the module.
  };


  /*
   * Helper function to throw an error when a block is expected but not provided.
   */
  var no_block_given = function ()
  {
    throw new Error('no block given');
  };


  // Initializes a fundamental class, setting up its prototype chain and properties.
  // This function is used for core classes like BasicObject, Object, and Class.
  var boot_defclass = function ( id, constructor, superklass )
  {
    if ( superklass )
    {
      // Create an intermediate constructor to manage prototype inheritance.
      var ctor = function () {};
      ctor.prototype = superklass.prototype;

      // Set the constructor's prototype to inherit from the superclass.
      constructor.prototype = new ctor();
    }

    var prototype = constructor.prototype;

    // Set up instance properties for objects created from this class.
    prototype.constructor = constructor;
    prototype._isObject = true; // Mark as an Opal object instance.
    prototype._klass = constructor; // Reference to its class.

    // Set up class-level properties.
    constructor._inherited = []; // List of subclasses that inherit from this.
    constructor._included_in = []; // List of modules included in this class.
    constructor._isClass = true; // Mark as an Opal class.
    constructor._name = id; // The name of the class.
    constructor._super = superklass; // Reference to its superclass.
    constructor._methods = []; // Instance methods defined directly on this class.
    constructor._smethods = []; // Singleton methods (class methods).
    constructor._isObject = false; // A class itself is not an object instance.

    // Assign method donation and definition functions.
    constructor._donate = __donate;
    constructor._defs = __defs;

    // Assign standard Ruby methods to the class constructor.
    constructor['$==='] = module_eqq;
    constructor.$to_s = module_to_s;
    constructor.toString = module_to_s; // Alias for JavaScript compatibility.

    // Register the class globally under its ID in the Opal object.
    Opal[id] = constructor;

    return constructor; // Return the newly booted class.
  };


  // Creates a generic class, inheriting from a specified superclass.
  // This function is also exposed as Opal.boot.
  var boot_class = Opal.boot = function ( superklass, constructor )
  {
    // Intermediate constructor for managing prototype chain inheritance.
    var ctor = function () {};
    ctor.prototype = superklass.prototype;

    constructor.prototype = new ctor(); // Set up prototype inheritance.
    var prototype = constructor.prototype;

    // Instance properties for objects created from this class.
    prototype._klass = constructor; // Reference to its class.
    prototype.constructor = constructor; // Reference back to the constructor function.

    // Class properties.
    constructor._inherited = []; // Subclasses.
    constructor._included_in = []; // Included modules.
    constructor._isClass = true; // Mark as a class.
    constructor._super = superklass; // Superclass reference.
    constructor._methods = []; // Instance methods.
    constructor._isObject = false; // Not an object instance.
    constructor._klass = Class; // Its metaclass is Opal's Class.
    constructor._donate = __donate; // Method to donate methods to subclasses/modules.
    constructor._defs = __defs; // Method to define singleton methods.

    // Standard Ruby methods for classes.
    constructor['$==='] = module_eqq;
    constructor.$to_s = module_to_s;
    constructor.toString = module_to_s;

    // Initialize these to undefined, they might be overridden later.
    constructor['$[]'] = undefined;
    constructor['$call'] = undefined;

    var smethods; // Variable to hold superclass singleton methods.

    // Inherit singleton methods from the superclass.
    smethods = superklass._smethods.slice(); // Create a shallow copy of the array.

    constructor._smethods = smethods;
    for ( var i = 0, length = smethods.length; i < length; i++ )
    {
      var m = smethods[i];
      constructor[m] = superklass[m]; // Copy each singleton method.
    }

    // Add this new class to the superclass's inherited list.
    superklass._inherited.push(constructor);

    return constructor; // Return the newly created class.
  };

  // Bridges a native JavaScript constructor to make it behave like an Opal class.
  var bridge_class = function ( constructor )
  {
    // Ensure the prototype points back to this constructor as its class.
    constructor.prototype._klass = constructor;

    // Initialize class properties for the bridged class.
    constructor._inherited = []; // No direct subclasses in Opal yet.
    constructor._included_in = []; // No modules included yet.
    constructor._isClass = true; // It is an Opal class.
    constructor._super = Object; // Its superclass is Opal's Object.
    constructor._klass = Class; // Its metaclass is Opal's Class.
    constructor._methods = []; // Instance methods.
    constructor._smethods = []; // Singleton methods.
    constructor._isObject = false; // It's a class, not an object instance.

    // Bridged classes don't donate in the same way as pure Opal classes.
    constructor._donate = function () {};
    constructor._defs = __defs; // Still uses standard singleton method definition.

    // Assign standard Ruby methods to the class itself.
    constructor['$==='] = module_eqq;
    constructor.$to_s = module_to_s;
    constructor.toString = module_to_s;

    // Inherit singleton methods from Opal's Class.
    var smethods = constructor._smethods = Class._methods.slice();
    for ( var i = 0, length = smethods.length; i < length; i++ )
    {
      var m = smethods[i];
      constructor[m] = Object[m]; // Inherit from Object for now.
    }

    // Add this bridged class to the list of all bridged classes.
    bridged_classes.push(constructor);

    // Copy instance methods from Opal's Object prototype to the bridged class's prototype.
    var table = Object.prototype,
        methods = Object._methods;

    for ( var i = 0, length = methods.length; i < length; i++ )
    {
      var m = methods[i];
      constructor.prototype[m] = table[m];
    }

    // Add '$allocate' as a singleton method for bridged classes.
    constructor._smethods.push('$allocate');

    return constructor; // Return the bridged class.
  };

  // Simple console output function for debugging or basic output.
  Opal.puts = function ( a )
  {
    console.log(a);
  };

  /*
   * Method missing dispatcher.
   * This function creates a dynamic method that handles `method_missing`
   * or delegates to `native_send` for native JavaScript objects.
   */
  Opal.mm = function ( mid )
  {
    var dispatcher = function ()
    {
      var args = __slice.call(arguments); // Capture all arguments passed to the dispatcher.

      if ( this.$method_missing )
      {
        // If method_missing is defined on the receiver, call it.
        this.$method_missing._p = dispatcher._p; // Pass along the block if present.
        return this.$method_missing.apply( this, [mid].concat(args) );
      }
      else
      {
        // Otherwise, attempt to send the method to a native object.
        return native_send( this, mid, args );
      }
    };

    return dispatcher; // Return the created dispatcher function.
  };


  // Dispatches a method call to a native JavaScript object.
  var native_send = function ( obj, mid, args )
  {
    var prop,
        block = native_send._p; // Retrieve the block if it was set by the dispatcher.
    native_send._p = null; // Clear the block reference for the next call.

    // Check if the method is a predefined native method handler.
    if ( prop = native_methods[mid] )
    {
      return prop( obj, args, block ); // Execute the custom handler.
    }

    // Attempt to access the property directly on the native object.
    prop = obj[mid];

    if ( typeof ( prop ) === "function" )
    {
      // If it's a function, call it with arguments converted to native JS.
      prop = prop.apply( obj, args.$to_native() );
    }
    else if ( mid.charAt( mid.length - 1 ) === "=" )
    {
      // Handle setter methods (e.g., `foo=` becomes `obj.foo = value`).
      prop = mid.slice( 0, mid.length - 1 );
      return obj[prop] = args[0]; // Assign the first argument as the value.
    }

    // If a property was found and is not null/undefined, return it.
    if ( prop != null )
    {
      return prop;
    }

    return nil; // Otherwise, return Opal's nil.
  };


  // A collection of predefined handlers for common Ruby methods when called on native JavaScript objects.
  var native_methods =
  {
    "==": function ( obj, args )
    {
      return obj === args[0]; // Strict equality check for native objects.
    },

    "[]": function ( obj, args )
    {
      var prop = obj[args[0]]; // Access property by index/key.

      if ( prop != null )
      {
        return prop;
      }

      return nil; // Return nil if property is null or undefined.
    },

    "respond_to?": function ( obj, args )
    {
      return obj[args[0]] != null; // Check if property exists and is not null/undefined.
    },

    "each": function ( obj, args, block )
    {
      var prop; // Declare property variable.

      // Check if the object is array-like (has a numeric length property).
      if ( obj.length === +obj.length )
      {
        // Iterate over array-like objects.
        for ( var i = 0, len = obj.length; i < len; i++ )
        {
          prop = obj[i];

          if ( prop == null )
          {
            prop = nil; // Convert null/undefined to Opal's nil.
          }

          block(prop); // Call the block with the element.
        }
      }
      else
      {
        // Iterate over plain objects (key-value pairs).
        for ( var key in obj )
        {
          prop = obj[key];

          if ( prop == null )
          {
            prop = nil; // Convert null/undefined to Opal's nil.
          }

          block( key, prop ); // Call the block with key and value.
        }
      }

      return obj; // Return the original object.
    },

    "to_a": function ( obj, args )
    {
      var result = []; // Initialize an empty array.

      // Convert array-like object to a new array.
      for ( var i = 0, length = obj.length; i < length; i++ )
      {
        result.push(obj[i]);
      }

      return result; // Return the new array.
    }
  };


  // Constant missing dispatcher.
  Opal.cm = function ( name )
  {
    return this.base.$const_missing(name); // Delegates to the base object's const_missing.
  };


  // Arity (argument count) error dispatcher.
  Opal.ac = function ( actual, expected, object, meth )
  {
    // Construct an inspection string for the method call, indicating class or object.
    var inspect = ( object._isObject ? object._klass._name + '#' : object._name + '.' ) + meth;
    // Construct the full error message.
    var msg = '[' + inspect + '] wrong number of arguments(' + actual + ' for ' + expected + ')';
    // Throw an Opal ArgumentError.
    throw Opal.ArgumentError.$new(msg);
  };


  /*
   * Call a Ruby method on a Ruby object with some arguments:
   *
   *   var my_array = [1, 2, 3, 4]
   *   Opal.send(my_array, 'length')     # => 4
   *   Opal.send(my_array, 'reverse!')   # => [4, 3, 2, 1]
   *
   * A missing method will be forwarded to the object via
   * method_missing.
   *
   * The result of either call will be returned.
   *
   * @param [Object] recv the Ruby object
   * @param [String] mid  the Ruby method to call
   */
  Opal.send = function ( recv, mid )
  {
    var args = __slice.call(arguments, 2), // Extract arguments starting from the third.
        func = recv['$' + mid]; // Look up the method on the receiver (prefixed with '$').

    if ( func )
    {
      return func.apply(recv, args); // If method found, call it.
    }

    // If method not found, delegate to the object's method_missing.
    return recv.$method_missing.apply(recv, [mid].concat(args));
  };


  // --- Core Initialization ---
  //
  // Bootstrapping the fundamental classes of the Opal runtime.

  boot_defclass('BasicObject', BasicObject); // Define BasicObject.
  boot_defclass('Object', Object, BasicObject); // Define Object, inheriting from BasicObject.
  boot_defclass('Class', Class, Object); // Define Class, inheriting from Object.

  // Make Class's prototype inherit from Function's prototype for native JS function behavior.
  Class.prototype = Function.prototype;

  // Set the metaclass for these core classes to Class itself.
  BasicObject._klass = Object._klass = Class._klass = Class;


  // Implementation of `Class#===` (case equality operator).
  // This checks if an object is an instance of this class or one of its subclasses.
  function module_eqq ( object )
  {
    if ( object == null )
    {
      return false; // null or undefined objects are not instances of any class.
    }

    var search = object._klass; // Start search from the object's direct class.

    while ( search )
    {
      if ( search === this )
      {
        return true; // Found a match in the inheritance chain.
      }

      search = search._super; // Move up to the superclass.
    }

    return false; // No match found in the inheritance chain.
  }


  // Implementation of `Class#to_s` for Ruby classes.
  function module_to_s ()
  {
    return this._name; // Returns the name of the class/module.
  }


  /*
   * Method donator function for classes and modules.
   * When methods are added to a class/module, this ensures they are
   * propagated to its subclasses and included modules.
   */
  function __donate ( defined, indirect )
  {
    var methods = this._methods,
        included_in = this.$included_in;

    // If not an indirect donation, update the class's own method list.
    // if (!indirect)
    // {
      this._methods = methods.concat(defined);
    // }

    // If this class/module has included other modules,
    // propagate the new methods to them as well.
    if ( included_in )
    {
      for ( var i = 0, length = included_in.length; i < length; i++ )
      {
        var includee = included_in[i]; // The module that included this one.
        var dest = includee.prototype; // The prototype to add methods to.

        for ( var j = 0, jj = defined.length; j < jj; j++ )
        {
          var method = defined[j];
          dest[method] = this.prototype[method]; // Copy the method to the includee's prototype.
        }

        // Recursively donate to modules that included the current includee.
        if ( includee.$included_in )
        {
          includee._donate(defined, true);
        }
      }
    }
  }


  // Defines a singleton method (class method) on the current class/module.
  function __defs ( mid, body )
  {
    this._smethods.push(mid); // Add method ID to singleton methods list.
    this[mid] = body; // Assign the method body to the class itself.

    var inherited = this._inherited; // Get list of inherited classes.
    if ( inherited.length )
    {
      // Propagate the new singleton method to subclasses.
      for ( var i = 0, length = inherited.length, subclass; i < length; i++ )
      {
        subclass = inherited[i];
        // Only define if the subclass doesn't already have its own version.
        if ( !subclass[mid] )
        {
          subclass._defs(mid, body); // Recursively define on subclasses.
        }
      }
    }
  }


  /*
   * Defines instance methods directly onto `Object.prototype`.
   * These methods are then donated to all bridged classes.
   * This is a special method used during core library setup.
   */
  Object._defn = function ( mid, body )
  {
    this.prototype[mid] = body; // Assign the method to Object's prototype.
    this._donate([mid]); // Trigger donation to propagate to bridged classes.
  };


  // Initialize the list of bridged classes. This is also assigned to Object.$included_in.
  var bridged_classes = Object.$included_in = [];

  // Set Opal's base object to the core Object class.
  Opal.base = Object;
  // Set the scope for BasicObject and Object to the global Opal object.
  BasicObject._scope = Object._scope = Opal;
  // Alias Opal.Module to Opal.Class for semantic clarity.
  Opal.Module = Opal.Class;
  // Alias Opal.Kernel to Object, as Kernel module methods are mixed into Object.
  Opal.Kernel = Object;

  // Set up the constant scope for the Class class itself.
  var class_const_alloc = function () {};
  var class_const_scope = new TopScope();
  class_const_scope.alloc = class_const_alloc;
  Class._scope = class_const_scope;

  // Override the native JavaScript `toString` method for Opal objects.
  Object.prototype.toString = function ()
  {
    return this.$to_s(); // Delegate to the Ruby `to_s` method for consistent representation.
  };

  // Create an instance of Object to serve as the top-level scope object.
  Opal.top = new Object();

  // Define the NilClass and create the singleton `nil` object.
  Opal.klass(Object, Object, 'NilClass', NilClass);
  var nil = Opal.nil = new NilClass(); // The singleton nil object.
  // Make `nil` callable, but it always throws a LocalJumpError if called as a block.
  nil.call = nil.apply = function () { throw Opal.LocalJumpError.$new('no block given'); };

  // Define a special error for handling `break` outside of a loop context.
  Opal.breaker = new Error('unexpected break');

}) .call(this); // Immediately invoke the IIFE, binding 'this' to the global object.
( function ( __opal )
{
  // Destructure common Opal references for local use, improving readability and performance.
  var self = __opal.top,
      __scope = __opal,
      nil = __opal.nil,
      $mm = __opal.mm,
      __breaker = __opal.breaker,
      __slice = __opal.slice,
      __klass = __opal.klass;

  // This inner IIFE defines and configures the Class class within the Opal runtime.
  return ( function ( __base, __super )
  {
    function Class () {} // Dummy constructor for the Class class itself.
    // Define the Class class using Opal's class bootstrapping mechanism.
    Class = __klass( __base, __super, "Class", Class );

    var def = Class.prototype, // Shorthand for Class's prototype for defining instance methods.
        __scope = Class._scope,    // Current scope for constant lookups within Class.
        TMP_1, TMP_2, TMP_3, TMP_4; // Temporary variables used for block references.

    // Define the '$new' singleton method for Class. This method is typically used to create new classes.
    Class._defs( '$new', TMP_1 = function ( sup )
    {
      var block;
      block = TMP_1._p || nil, // Retrieve block if passed, otherwise default to Opal's nil.
      TMP_1._p = null;         // Clear the block reference after use.
      if ( sup == null )
      {
        sup = __scope.Object; // Default superclass to Object if not explicitly provided.
      }