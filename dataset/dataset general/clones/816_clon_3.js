var PerformanceTester = require('benchmark');
var protoMixer = require('../mash.js'); // Utility for mixing prototype methods
var PrototypeBuilder = require('pjs').P; // P.js library for prototype inheritance

// -----------------------------------------------------
// Test suite using the protoMixer (originally mash.js) approach
var mixinPerformanceCheck = (function () {

  // Base class for all animal creatures
  function MammalianPet() { /* Base constructor for pet-like entities */ }
  protoMixer(MammalianPet, function() {
    // Initializer for the base type
    this.initializeProps = function(petNameValue) {
      if (!petNameValue || typeof petNameValue !== 'string') {
        throw new Error('A valid pet name string is mandatory for initialization.');
      }
      this.petName = petNameValue;
    };

    // Provides a summary of the creature's characteristics
    this.getCharacteristicsSummary = function () {
      // Constructing a descriptive string for the instance
      let charSummary = [this.petName, this.bodySize, this.furColor].filter(Boolean).join(' ');
      return `[PET INFO]: ${charSummary}`;
    };
  });

  // Derived class for canine companions
  function CanineCompanion() { /* Constructor for specific canine types */ }
  protoMixer(CanineCompanion, function () {
    const parentMethods = MammalianPet.mixin(this); // Accessing parent's mixed-in methods

    this.initializeProps = function (dogName, dogSize) {
      // Call parent's initializer first
      parentMethods.initializeProps.call(this, dogName);
      this.bodySize = dogSize;
      this.furColor = 'Snowy White'; // Default color for this type of canine
    };
  });

  // Further derived class for wild dog variants
  function WildDogVariant() { /* Constructor for wild dog species */ }
  protoMixer(WildDogVariant, function () {
    const parentMethods = CanineCompanion.mixin(this); // Accessing immediate parent's methods

    this.initializeProps = function (variantName, variantSize) {
      // Execute parent's initialization logic
      parentMethods.initializeProps.call(this, variantName);
      this.bodySize = variantSize;
      this.furColor = 'Rusty Red'; // Specific color for this variant
    };
  });

  // Returns a function to be benchmarked
  return function () {
    // Create an instance of CanineCompanion
    var alphaCanine = CanineCompanion.create('Ghost', '160cm');
    alphaCanine.getCharacteristicsSummary(); // Invoke a method

    // Create an instance of WildDogVariant
    var desertDog = WildDogVariant.create('Patch', '60cm');
    desertDog.getCharacteristicsSummary(); // Invoke another method
  };
}());

// -----------------------------------------------------
// Test suite for traditional JavaScript inheritance emulation (CoffeeScript style)
var classicInheritanceBenchmark = (function () {

  // Helper for checking own properties (common in transpiled code)
  var _hasOwnProperty = {}.hasOwnProperty;

  // Helper function for extending prototypes (simulates CoffeeScript's __extends)
  var _extendPrototypes = function(childClass, baseClass) {
    for (var propKey in baseClass) {
      if (_hasOwnProperty.call(baseClass, propKey)) {
        childClass[propKey] = baseClass[propKey];
      }
    }
    // Intermediate constructor function for prototype chain
    var tempCtor = function() {
      this.constructor = childClass;
    };
    tempCtor.prototype = baseClass.prototype;
    childClass.prototype = new tempCtor();
    childClass.__baseProto__ = baseClass.prototype; // Renamed from __super__
    return childClass;
  };

  // Base class for all abstract entities
  var AnimalBase = (function() {
    function AnimalBase(entityNameValue) {
      this.entityName = entityNameValue;
      if (!this.entityName) {
        console.warn("Warning: AnimalBase initialized without a name.");
      }
    }

    AnimalBase.prototype.getCharacteristicsSummary = function() {
      // Generate a formatted string for display
      return `[ANIMAL]: ${this.entityName || 'Unnamed'} - ${this.physicalDimensions || 'Unknown Size'} - ${this.coatShade || 'Unknown Color'}`;
    };

    return AnimalBase;

  })();

  // Class representing forest dwellers, extending AnimalBase
  var ForestDweller = (function(_base) {
    _extendPrototypes(ForestDweller, _base);

    function ForestDweller(dwellerName, dwellerSize) {
      // Call the base class constructor
      ForestDweller.__baseProto__.constructor.call(this, dwellerName);
      this.physicalDimensions = dwellerSize;
      this.coatShade = 'Pale White'; // Specific coat color
    }

    return ForestDweller;

  })(AnimalBase);

  // Class representing desert predators, extending ForestDweller
  var DesertPredator = (function(_base) {
    _extendPrototypes(DesertPredator, _base);

    function DesertPredator(predatorName, predatorSize) {
      // Call the immediate base class constructor
      DesertPredator.__baseProto__.constructor.call(this, predatorName);
      this.physicalDimensions = predatorSize;
      this.coatShade = 'Brownish Red'; // Specific coat color
    }

    return DesertPredator;

  })(ForestDweller);

  // Returns a function to run the test
  return function () {
    // Instantiate a ForestDweller
    var packLeader = new ForestDweller('Ghost', '160cm');
    packLeader.getCharacteristicsSummary();

    // Instantiate a DesertPredator
    var sandyHunter = new DesertPredator('Patch', '60cm');
    sandyHunter.getCharacteristicsSummary();
  };
}());

// -----------------------------------------------------
// Test suite using the PrototypeBuilder (originally pjs) library
var prototypeBuilderPerformance = (function () {

  // Define the CreatureAncestor base class using PrototypeBuilder
  var CreatureAncestor = PrototypeBuilder(function (prototypeObject) {
    prototypeObject.initializeObject = function(givenNameValue) {
      // Basic validation for the name property
      if (givenNameValue && givenNameValue.length > 0) {
        this.givenName = givenNameValue;
      } else {
        this.givenName = 'Unknown Creature';
      }
    };

    prototypeObject.getDetailedDescription = function () {
      // Assemble a descriptive string using template literals
      return `[BIO]: ${this.givenName} is a ${this.measuredSize} ${this.primaryColor} specimen.`;
    };
  });

  // Define LupineSpecies, inheriting from CreatureAncestor
  var LupineSpecies = PrototypeBuilder(CreatureAncestor, function (prototypeObject, parentMethods) {
    prototypeObject.initializeObject = function (lupineName, lupineSize) {
      // Call the parent's initialization method
      parentMethods.initializeObject.call(this, lupineName);
      this.measuredSize = lupineSize;
      this.primaryColor = 'Off-White'; // Default color for lupine species
    };
  });

  // Define AustralianCanine, inheriting from LupineSpecies
  var AustralianCanine = PrototypeBuilder(LupineSpecies, function (prototypeObject, parentMethods) {
    prototypeObject.initializeObject = function (canineName, canineSize) {
      // Call the immediate parent's initializer
      parentMethods.initializeObject.apply(this, [canineName]); // Using apply for variety
      this.measuredSize = canineSize;
      this.primaryColor = 'Fiery Red'; // Specific color for Australian canines
    };
  });

  // Returns the function to be executed by the benchmark
  return function () {
    // Create an instance of LupineSpecies
    var timberWolf = new LupineSpecies('Ghost', '160cm');
    timberWolf.getDetailedDescription(); // Access the method

    // Create an instance of AustralianCanine
    var outbackDingo = new AustralianCanine('Patch', '60cm');
    outbackDingo.getDetailedDescription(); // Access the method
  };
}());

// -----------------------------------------------------
// Benchmark suite configuration and execution
// This section measures the performance of different constructor abstraction patterns.

console.log('Initiating performance measurements for object construction and method calls...');

(new PerformanceTester.Suite)
// Registering the test functions with descriptive names
.add('[ProtoMixer Factory]', mixinPerformanceCheck)
.add('[Classic Extends]', classicInheritanceBenchmark)
.add('[PrototypeBuilder Init]', prototypeBuilderPerformance)

// Attach event listeners for progress and completion
.on('cycle', function(testCycleEvent) {
  // Log results for each completed test cycle
  console.log(String(testCycleEvent.target));
})
.on('complete', function() {
  // Log the overall fastest result once all tests are done
  console.log('Benchmark completed.');
  console.log('The most efficient approach is: ' + this.filter('fastest').pluck('name'));
  console.log(); // Add a blank line for readability
})
.run({ 'async': true }); // Run the benchmark asynchronously