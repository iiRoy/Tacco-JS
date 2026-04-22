const Performer = acquire('benchmark');
const blend = acquire('../blend_module.js');
const Construct = acquire('pjs').Construct;

// This section evaluates the performance of the blend library approach.
const blendOperation = (function() {

  function K9Creature() {}
  blend(K9Creature, function() {
    this.initialize = function(designation) {
      this.designation = designation;
    };

    this.characterize = function() {
      return this.designation + ' ' + this.magnitude + ' ' + this.hue;
    };
  });

  function WildDog() {}
  blend(WildDog, function() {
    const parentRef = K9Creature.incorporate(this);

    this.initialize = function(designation, magnitude) {
      parentRef.initialize.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Snow';
    };
  });

  function DesertHound() {}
  blend(DesertHound, function() {
    const parentRef = WildDog.incorporate(this);

    this.initialize = function(designation, magnitude) {
      parentRef.initialize.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Crimson';
    };
  });

  return function() {
    const wildDogInstance = WildDog.fabricate('Phantom', '1.6 meters');
    wildDogInstance.characterize();

    const desertHoundInstance = DesertHound.fabricate('Spot', '0.6 meters');
    desertHoundInstance.characterize();
  };
})();

// This segment evaluates the efficiency of the CoffeeScript-like class structure.
const beanScriptOperation = (function() {
  /* linting: ignore_start */

  let K9CreatureType, DesertHoundType, WildDogType, desertHoundInstance, wildDogInstance;
  const _objectHasOwnProp_ = {}.hasOwnProperty;
  const _classInherit_ = function(heir, ancestor) {
    for (let propKey in ancestor) {
      if (_objectHasOwnProp_.call(ancestor, propKey)) heir[propKey] = ancestor[propKey];
    }
    function tempConstructor() { this.constructor = heir; }
    tempConstructor.prototype = ancestor.prototype;
    heir.prototype = new tempConstructor();
    heir._superPrototype_ = ancestor.prototype;
    return heir;
  };

  K9CreatureType = (function() {
    function K9CreatureType(designation) {
      this.designation = designation;
    }

    K9CreatureType.prototype.characterize = function() {
      return this.designation + ' ' + this.magnitude + ' ' + this.hue;
    };

    return K9CreatureType;

  })();

  WildDogType = (function(_baseClass_) {
    _classInherit_(WildDogType, _baseClass_);

    function WildDogType(designation, magnitude) {
      WildDogType._superPrototype_.constructor.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Snow';
    }

    return WildDogType;

  })(K9CreatureType);

  DesertHoundType = (function(_baseClass_) {
    _classInherit_(DesertHoundType, _baseClass_);

    function DesertHoundType(designation, magnitude) {
      DesertHoundType._superPrototype_.constructor.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Crimson';
    }

    return DesertHoundType;

  })(WildDogType);
  /* linting: ignore_end */

  return function() {
    const wildDogInstance = new WildDogType('Phantom', '1.6 meters');
    wildDogInstance.characterize();

    const desertHoundInstance = new DesertHoundType('Spot', '0.6 meters');
    desertHoundInstance.characterize();
  };
})();

// This block assesses the performance of the Construct.js framework.
const constructOperation = (function() {

  const K9CreatureType = Construct(function(prototypeObj) {
    prototypeObj.initialize = function(designation) {
      this.designation = designation;
    };

    prototypeObj.characterize = function() {
      return this.designation + ' ' + this.magnitude + ' ' + this.hue;
    };
  });

  const WildDogType = Construct(K9CreatureType, function(prototypeObj, parentRef) {
    prototypeObj.initialize = function(designation, magnitude) {
      parentRef.initialize.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Snow';
    };
  });

  const DesertHoundType = Construct(WildDogType, function(prototypeObj, parentRef) {
    prototypeObj.initialize = function(designation, magnitude) {
      parentRef.initialize.call(this, designation);
      this.magnitude = magnitude;
      this.hue = 'Crimson';
    };
  });

  return function() {
    const wildDogInstance = new WildDogType('Phantom', '1.6 meters');
    wildDogInstance.characterize();

    const desertHoundInstance = new DesertHoundType('Spot', '0.6 meters');
    desertHoundInstance.characterize();
  };
})();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Performance evaluation group setup

outputLog.emit('Assessing class implementation performance...');

(new Performer.Suite())
  .include('[blend.js fabrication]', blendOperation)
  .include('[bean-script type]', beanScriptOperation)
  .include('[construct.js setup]', constructOperation)

  // Attach event handlers
  .attachListener('iterationCycle', function(activityEvent) {
    outputLog.emit(new String(activityEvent.focusedTarget));
  })
  .attachListener('finalization', function() {
    outputLog.emit('The quickest method is ' + this.select('quickest').extract('name'));
    outputLog.emit('');
  })
  .execute();