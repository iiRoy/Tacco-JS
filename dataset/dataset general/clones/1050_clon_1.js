function lazyChain  ( obj )
{
  // This array will hold a sequence of operations
  var   calls   =   [];

  // Return an object with methods to build and execute the chain
  return {

    // Method to add an operation to the chain
    invoke: function  (methodName /*  ...arguments for the method */)
    {
      // Extract the actual arguments for the method, excluding methodName
      var args = _.rest(  arguments );

      // Push a function onto the 'calls' array.
      // This function represents a single step in the chain.
      calls.push(  function  (target)
      {
        // Get the method from the target object
        var meth  = target[ methodName ];

        // Apply the method to the target with the stored arguments
        return    meth.apply(target, args );
      }  );

      // Allow chaining of 'invoke' calls
      return this;
    },

    // Method to execute the entire chain of operations
    force: function ( )
    {
      // Use reduce to apply each queued function in sequence
      return _.reduce(
        calls,

        function  (ret, thunk)
        {
          // 'thunk' is one of the functions pushed into 'calls'
          // 'ret' is the accumulated result from previous steps
          return thunk(ret);
        },

        // The initial value for 'ret' is the original object
        obj
      );
    }
  };
}


// Function to sort an array using the lazy chain
function  deferredSort  ( ary )
{
  return lazyChain(ary).invoke('sort');
}

// Map a list of arrays to their deferred sort representations
var deferredSorts   = _.map(
  [
    [2,1,3],
    [7,7,1],
    [0,9,5]
  ],
  deferredSort
);

//=> [<thunk>, <thunk>, <thunk>] - Expected output after this line

// Function to force execution of a thunk
function  force ( thunk )
{
  return thunk.force();
}

// Validator for arrays to ensure each has three elements
var validateTriples = validator(
  "Each array should have three elements", // Error message
  function  (arrays)
  {
    // Check if every array in 'arrays' has a length of 3
    return _.every(arrays, function(a) {
      return a.length === 3;
    });
  }
);

// Create a partial function for validating triple stores
var validateTripleStore  = partial1( condition1(validateTriples), _.identity );

// Post-processing function to get the second element of each array
function  postProcess (arrays)
{
  return _.map(arrays, second);
}

// Main function to process triple data
function processTriples  (data)
{
  // Use a pipeline to apply a sequence of transformations
  return pipeline(data

           // Parse JSON string into an object
           , JSON.parse

           // Validate the structure of the triple store
           , validateTripleStore

           // Apply deferred sorting
           , deferredSort

           // Force execution of the deferred sort
           , force

           // Post-process the sorted data
           , postProcess

           // Invoke the 'sort' method on the result (presumably an array)
           , invoker('sort', Array.prototype.sort)

           // Convert the final result to a string
           , str
  );
}

// Compose a function to report processed data packets
var reportDataPackets = _.compose(
  function(s) { $('#result').text(s) }, // Update the DOM element with the result
  processTriples                        // Process the data first
);


/*
 *  Polymorphic toString function
 *  Handles Strings, Arrays, and other objects.
 */
function polyToString (  obj ) {
  if (obj instanceof String)
    return obj;
  else if (obj instanceof Array)
    return stringifyArray(obj);

  return obj.toString();
}

// Helper function to stringify an array
function stringifyArray (ary) {
  return ["[", _.map(ary, polyToString).join(","), "]"].join('');
}

// Redefine polyToString using dispatch for more robust type handling
var polyToString = dispatch(
  function(s) { return _.isString(s) ? s : undefined },
  function(s) { return _.isArray(s) ? stringifyArray(s) : undefined },
  function(s) { return _.isObject(s) ? JSON.stringify(s) : undefined },
  function(s) { return s.toString() }
);

// Extend Container.prototype with a custom toString method
Container.prototype.toString = function() {
  return ["@<", polyToString(this._value), ">"].join('');
};

/* --- Class Definitions --- */
function ContainerClass() {}
function ObservedContainerClass() {}
function HoleClass() {}
function CASClass() {}
function TableBaseClass() {}

// Set up inheritance hierarchy for initial class definitions
ObservedContainerClass.prototype = new ContainerClass();
HoleClass.prototype = new ObservedContainerClass();
CASClass.prototype = new HoleClass();
TableBaseClass.prototype = new HoleClass();

// Re-define ContainerClass using a Class.extend pattern
var ContainerClass = Class.extend({
  init: function(val) {
    this._value = val;
  },
});

// Create an instance of ContainerClass
var c = new ContainerClass(42);

c;
//=> {_value: 42 ...} - Expected output

c instanceof Class;
//=> true - Expected output

// Re-define ObservedContainerClass extending ContainerClass
var ObservedContainerClass = ContainerClass.extend({
  observe: function(f) { note("set observer") },
  notify: function() { note("notifying observers") }
});

// Re-define HoleClass extending ObservedContainerClass
var HoleClass = ObservedContainerClass.extend({
  init: function(val) { this.setValue(val) },
  setValue: function(val) {
    this._value = val;
    this.notify(); // Notify observers when value changes
    return val;
  }
});

// Re-define CASClass extending HoleClass
var CASClass = HoleClass.extend({
  swap: function(oldVal, newVal) {
    // Check if the current value matches oldVal before swapping
    if (!_.isEqual(oldVal, this._value)) fail("No match");

    return this.setValue(newVal);
  }
});

/* --- Alternative Container/Hole/CAS implementations --- */

// Basic Container constructor
function Container(val) {
  this._value = val;
  this.init(val); // Call init method (can be overridden)
}

Container.prototype.init = _.identity; // Default init does nothing

// Mixin for Hole-like behavior (setting values with validation and notification)
var HoleMixin = {
  setValue: function(newValue) {
    var oldVal = this._value; // Store old value

    this.validate(newValue); // Validate new value
    this._value = newValue;   // Update value
    this.notify(oldVal, newValue); // Notify observers of change
    return this._value;
  }
};

// Hole constructor
var Hole = function(val) {
  Container.call(this, val); // Call Container constructor
};

// Mixin for Observer pattern
var ObserverMixin = (function() {
  var _watchers = []; // Private array to store watcher functions

  return {
    watch: function(fun) {
      _watchers.push(fun); // Add a watcher
      return _.size(_watchers);
    },
    notify: function(oldVal, newVal) {
      // Call all watchers with old and new values
      _.each(_watchers, function(watcher) {
        watcher.call(this, oldVal, newVal);
      });

      return _.size(_watchers);
    }
  };
}());

// Mixin for validation logic
var ValidateMixin = {
  addValidator: function(fun) {
    this._validator = fun; // Set the validator function
  },
  init: function(val) {
    this.validate(val); // Validate initial value
  },
  validate: function(val) {
    // If validator exists and validation fails, throw an error
    if (existy(this._validator) &&
        !this._validator(val))
      fail("Attempted to set invalid value " + polyToString(val));
  }
};

// Extend Hole.prototype with mixins
_.extend(Hole.prototype
         , HoleMixin
         , ValidateMixin
         , ObserverMixin);

// Mixin for swap functionality (functional update)
var SwapMixin = {
  swap: function(fun /* , args... */) {
    var args = _.rest(arguments); // Get additional arguments for 'fun'
    // Apply 'fun' to the current value, constructing arguments
    var newValue = fun.apply(this, construct(this._value, args));

    return this.setValue(newValue); // Set the new value
  }
};

// Mixin for snapshot functionality
var SnapshotMixin = {
  snapshot: function() {
    return deepClone(this._value); // Return a deep clone of the current value
  }
};

// Extend Hole.prototype again with additional mixins
_.extend(Hole.prototype
         , HoleMixin
         , ValidateMixin
         , ObserverMixin
         , SwapMixin
         , SnapshotMixin);

// CAS constructor (inherits from Hole)
var CAS = function(val) {
  Hole.call(this, val); // Call Hole constructor
};

// Mixin for Compare-And-Swap functionality
var CASMixin = {
  swap: function(oldVal, f) {
    if (this._value === oldVal) { // Check if current value matches oldVal
      this.setValue(f(this._value)); // If so, update with result of 'f'
      return this._value;
    }
    else {
      return undefined; // If no match, return undefined
    }
  }
};

// Extend CAS.prototype with all relevant mixins
_.extend(CAS.prototype
         , HoleMixin
         , ValidateMixin
         , ObserverMixin
         , SwapMixin
         , CASMixin
         , SnapshotMixin);

// Factory function for Container
function contain(value) {
  return new Container(value);
}

// Factory function for Hole
function hole(val /*, validator */) {
  var h = new Hole();
  var v = _.toArray(arguments)[1]; // Get optional validator argument

  if (v) h.addValidator(v); // Add validator if provided

  h.setValue(val); // Set initial value

  return h;
}

// Create a 'swap' invoker for Hole instances
var swap = invoker('swap', Hole.prototype.swap);

// Factory function for CAS
function cas(val /*, args */) {
  var h = hole.apply(this, arguments); // Create a Hole with potential validator
  var c = new CAS(val);                 // Create a CAS instance
  c._validator = h._validator;          // Copy validator from the Hole

  return c;
}

// Create a 'compareAndSwap' invoker for CAS instances
var compareAndSwap = invoker('swap', CAS.prototype.swap);

// Helper function to get a snapshot
function snapshot(o) { return o.snapshot() }
// Helper function to add a watcher
function addWatcher(o, fun) { o.watch(fun) }