var     Benchmark       =   require   ('benchmark'  ); // Core benchmarking library
var     mash            =   require   ('../mash.js' ); /* Custom
                                                           mash utility
                                                           for object
                                                           composition */
var     P               =   require   ('pjs').P      ; // PJS library for prototyping

// -----------------------------------
// Start of the mashTest section
var mashTest = (function    () /* anonymous function
                                  to encapsulate mashTest logic */
{

  // Define base Canid class using mash
  function Canid() { /* Constructor for Canid */ }
  mash( Canid  , function  () {
    this.init  =  function  ( name ) {
      this.name   =   name ; // Initialize name property
    };

    this.describe   = function  () {
      // Returns a descriptive string
      return  this.name + ' ' + this.size + ' ' + this.color ;
    } ;
  } )  ;

  // Define Wolf class, extending Canid using mash
  function Wolf() {}
  mash  (  Wolf  ,  function  () {
    var supr  = Canid.mixin (  this  ) ; // Get the super-class mixin

    this.init  =  function  ( name, size ) {
      supr.init.call( this, name ) ; // Call super-class init method
      this.size  =  size ;
      this.color  =  'White' ; // Default color for Wolf
    } ;
  } ) ;

  // Define Dingo class, extending Wolf using mash
  function Dingo() {}
  mash  (  Dingo  ,  function  () {
    var supr  = Wolf.mixin ( this ) ; // Get the super-class mixin for Dingo

    this.init  =  function  ( name, size ) {
      supr.init.call (  this  ,  name  ) ;
      this.size  =  size ;
      this.color  =  'Red' ; // Default color for Dingo
    } ;
  } ) ;

  // Return the actual benchmark function for mashTest
  return function   () {
    var wolf  = Wolf.create (  'Ghost'  ,  '160cm'  ) ; // Create a Wolf instance
    wolf.describe () ; // Call describe method

    var dingo  = Dingo.create (  'Patch'  ,  '60cm'  ) ; // Create a Dingo instance
    dingo.describe () ; // Call describe method
  } ;
}() ) ; // End of mashTest IIFE

// -----------------------------------
// Start of the coffeeTest section (generated from CoffeeScript)
var coffeeTest = (function  () {
  /* jshint ignore:start */
  /* This block contains generated CoffeeScript output,
   * which might not conform to typical JavaScript style
   * but needs to be preserved for Type I cloning. */

  var Canid, Dingo, Wolf, dingo, wolf,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; } ;

  Canid = (function() {
    function Canid(name) {
      this.name = name;
    }

    Canid.prototype.describe = function() {
      return this.name + ' ' + this.size + ' ' + this.color;
    };

    return Canid;

  })();

  Wolf = (function(_super) {
    __extends(Wolf, _super);

    function Wolf(name, size) {
      Wolf.__super__.constructor.call(this, name);
      this.size = size;
      this.color = 'White';
    }

    return Wolf;

  })(Canid);

  Dingo = (function(_super) {
    __extends(Dingo, _super);

    function Dingo(name, size) {
      Dingo.__super__.constructor.call(this, name);
      this.size = size;
      this.color = 'Red';
    }

    return Dingo;

  })(Wolf);
  /* jshint ignore:end */

  // Return the actual benchmark function for coffeeTest
  return function  () {
    var wolf = new Wolf('Ghost', '160cm');
    wolf.describe();

    var dingo = new Dingo('Patch', '60cm');
    dingo.describe();
  };
}()); // End of coffeeTest IIFE

// -----------------------------------
// Start of the pjsTest section
var pjsTest = (function  () {

  // Define Canid class using PJS
  var Canid = P(function (proto) {
    proto.init = function(name) {
      this.name = name;
    };

    proto.describe = function () {
      return this.name + ' ' + this.size + ' ' + this.color;
    };
  });

  // Define Wolf class, extending Canid using PJS
  var Wolf = P(Canid, function (proto, supr) {
    proto.init = function (name, size) {
      supr.init.call(this, name);
      this.size = size;
      this.color = 'White';
    };
  });

  // Define Dingo class, extending Wolf using PJS
  var Dingo = P(Wolf, function (proto, supr) {
    proto.init = function (name, size) {
      supr.init.call(this, name);
      this.size = size;
      this.color = 'Red';
    };
  });

  // Return the actual benchmark function for pjsTest
  return function () {
    var wolf = new Wolf('Ghost', '160cm');
    wolf.describe();

    var dingo = new Dingo('Patch', '60cm');
    dingo.describe();
  };
}()); // End of pjsTest IIFE

// -----------------------------------
// Benchmark suite execution section
// This part sets up and runs the performance tests.

console.log('Measuring constructor abstractions..'); // Log a message before starting

(new Benchmark.Suite)
.add('[mash.js create]', mashTest) // Add mashTest to the suite
.add('[coffee class]', coffeeTest) // Add coffeeTest to the suite
.add('[p.js init]', pjsTest) // Add pjsTest to the suite

// Add listeners for benchmark events
.on('cycle', function(event) {
  console.log(String(event.target)); // Log results for each cycle
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name')); // Log the fastest test
  console.log(); // Add a blank line for readability
})
.run(); // Run the benchmark suite