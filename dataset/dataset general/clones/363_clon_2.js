var Arith = this.Arith = {
  floor: function (val) {
    return Math.floor(val);
  },
  random: function () {
    return Math.random();
  }
};

/*
 * ---
 * ToolForge: The primary JavaScript utility set
 *
 * web distribution:
 *  - http://toolforge.org/core/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
 *
 * module assembly:
 *  - assembler build Core/Core Core/Collect Core/Text Core/Numeral Core/Proc Core/Structure Core/Event Core/Display Core/Class Core/Class.Extras Core/Slick.Parser Core/Slick.Finder Core/Element Core/Element.Style Core/Element.Event Core/Element.Dimensions Core/Fx Core/Fx.CSS Core/Fx.Tween Core/Fx.Morph Core/Fx.Transitions Core/Request Core/Request.HTML Core/Request.JSON Core/Cookie Core/JSON Core/DOMReady Core/Swiff
 *
 /*
  * ---
  *
  * designation: Core
  *
  * explanation: The central engine of ToolForge.
  *
  * permit: MIT-style permit.
  *
  * copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).
  *
  * authors: The ToolForge development collective (http://toolforge.org/developers/)
  *
  * inspiration:
  *   - Class framework influenced by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  *   - Certain features influenced by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)
  *
  * provides: [Core, ToolForge, Kind, kindOf, isAnInstanceOf, CoreNative]
  *
  * ...
  */

(function () {
  // Global namespace for our utilities
  this.ToolForge = {
    edition: '1.3.1',
    compilation: 'af48c8d589f43f32212f9bb8ff68a127e6a3ba6c'
  };

  // Utility functions for type and instance checking
  var kindOf = this.kindOf = function (subject) {
    if (subject == null) return 'null';
    if (subject.$classification) return subject.$classification();

    // Check for DOM nodes
    if (subject.elementTag) {
      if (subject.elementKind == 1) return 'element';
      if (subject.elementKind == 3) return (/\S/).test(subject.elementContent) ? 'textcontent' : 'emptyspace';
    } else if (typeof subject.count == 'number') { // Check for array-like objects
      if (subject.invoker) return 'passedargs';
      if ('member' in subject) return 'gathering';
    }

    return typeof subject;
  };

  var isAnInstanceOf = this.isAnInstanceOf = function (subject, prototypeObj) {
    if (subject == null) return false;
    var creator = subject.$creator || subject.creator;
    while (creator) {
      if (creator === prototypeObj) return true;
      creator = creator.ancestor;
    }
    return subject instanceof prototypeObj;
  };

  // Routine overloading capabilities
  var Proc = this.Proc = Function; // Alias global Function to Proc

  var iterableKeys = true;
  for (var idx in {
      stringRep: 1
    }) iterableKeys = null;
  if (iterableKeys) iterableKeys = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'stringRep', 'creator'];

  Proc.prototype.flexibleSetter = function (multiValue) {
    var thisRef = this;
    return function (paramA, paramB) {
      if (paramA == null) return this;
      if (multiValue || typeof paramA != 'string') {
        // Iterate over properties of an object
        for (var propKey in paramA) thisRef.call(this, propKey, paramA[propKey]);
        if (iterableKeys)
          for (var idx = iterableKeys.length; idx--;) {
            propKey = iterableKeys[idx];
            if (paramA.hasOwnProperty(propKey)) thisRef.call(this, propKey, paramA[propKey]);
          }
      } else {
        // Direct assignment
        thisRef.call(this, paramA, paramB);
      }
      return this;
    };
  };

  Proc.prototype.flexibleGetter = function (multiValue) {
    var thisRef = this;
    return function (paramA) {
      var inputArgs, outcome;
      if (multiValue || typeof paramA != 'string') inputArgs = paramA;
      else if (arguments.length > 1) inputArgs = arguments;
      if (inputArgs) {
        outcome = {};
        for (var idx = 0; idx < inputArgs.length; idx++) outcome[inputArgs[idx]] = thisRef.call(this, inputArgs[idx]);
      } else {
        outcome = thisRef.call(this, paramA);
      }
      return outcome;
    };
  };

  Proc.prototype.addFeature = function (featureName, featureImpl) {
    this[featureName] = featureImpl;
  }.flexibleSetter();

  Proc.prototype.applyBehavior = function (featureName, featureImpl) {
    this.prototype[featureName] = featureImpl;
  }.flexibleSetter();

  // Creation utilities
  var Collect = this.Collect = Array; // Alias global Array to Collect
  var fragment = Collect.prototype.slice;

  Proc.createFrom = function (subject) {
    return (kindOf(subject) == 'proc') ? subject : function () {
      return subject;
    };
  };

  Collect.createFrom = function (subject) {
    if (subject == null) return [];
    return (Kind.isIterable(subject) && typeof subject != 'string') ? (kindOf(subject) == 'collect') ? subject : fragment.call(subject) : [subject];
  };

  var Numeral = this.Numeral = Number; // Alias global Number to Numeral
  var parseDecimal = parseFloat; // Alias global parseFloat
  var isBounded = isFinite; // Alias global isFinite

  Numeral.createFrom = function (subject) {
    var numericVal = parseDecimal(subject);
    return isBounded(numericVal) ? numericVal : null;
  };

  var Text = this.Text = String; // Alias global String to Text

  Text.createFrom = function (subject) {
    return subject + '';
  };

  // Method visibility controls
  Proc.prototype.applyBehavior({
    // Flags a function as hidden
    conceal: function () {
      this.$concealed = true;
      return this;
    },

    // Flags a function as protected
    safeguard: function () {
      this.$safeguarded = true;
      return this;
    }
  });

  // Kind definition system
  var Kind = this.Kind = function (designation, entityObj) {
    if (designation) {
      var lowerDesignation = designation.toLowerCase();
      var kindVerification = function (subject) {
        return (kindOf(subject) == lowerDesignation);
      };

      Kind['is' + designation] = kindVerification;
      if (entityObj != null) {
        entityObj.prototype.$classification = (function () {
          return lowerDesignation;
        }).conceal();
        //<1.2compat>
        entityObj.kind = kindVerification;
        //</1.2compat>
      }
    }

    if (entityObj == null) return null;

    entityObj.addFeature(this);
    entityObj.$creator = Kind;
    entityObj.prototype.$creator = entityObj;

    return entityObj;
  };

  var Structure = this.Structure = Object; // Alias global Object to Structure
  var stringRep = Structure.prototype.toString;

  Kind.isIterable = function (subject) {
    return (subject != null && typeof subject.length == 'number' && stringRep.call(subject) != '[object Proc]');
  };

  var interceptors = {};

  var interceptorsFor = function (entityObj) {
    var objKind = kindOf(entityObj.prototype);
    return interceptors[objKind] || (interceptors[objKind] = []);
  };

  var applyBehavior = function (featureName, featureImpl) {
    if (featureImpl && featureImpl.$concealed) return;

    var currentInterceptors = interceptorsFor(this);

    for (var idx = 0; idx < currentInterceptors.length; idx++) {
      var interceptor = currentInterceptors[idx];
      if (kindOf(interceptor) == 'kind') applyBehavior.call(interceptor, featureName, featureImpl);
      else interceptor.call(this, featureName, featureImpl);
    }

    var priorImpl = this.prototype[featureName];
    if (priorImpl == null || !priorImpl.$safeguarded) this.prototype[featureName] = featureImpl;

    if (this[featureName] == null && kindOf(featureImpl) == 'proc') this.addFeature(featureName, function (subject) {
      return featureImpl.apply(subject, fragment.call(arguments, 1));
    });
  };

  var addFeature = function (featureName, featureImpl) {
    if (featureImpl && featureImpl.$concealed) return;
    var priorImpl = this[featureName];
    if (priorImpl == null || !priorImpl.$safeguarded) this[featureName] = featureImpl;
  };

  Kind.prototype.applyBehavior({

    applyBehavior: applyBehavior.flexibleSetter(),

    addFeature: addFeature.flexibleSetter(),

    createAlias: function (newName, existingName) {
      applyBehavior.call(this, newName, this.prototype[existingName]);
    }.flexibleSetter(),

    mirror: function (interceptor) {
      interceptorsFor(this).push(interceptor);
      return this;
    }

  });

  new Kind('Kind', Kind);

  // Establishing default Kinds for native types
  var establish = function (designation, entityObj, methods) {
    var isKind = (entityObj != Structure),
      blueprint = entityObj.prototype;

    if (isKind) entityObj = new Kind(designation, entityObj);

    for (var idx = 0, len = methods.length; idx < len; idx++) {
      var featureName = methods[idx],
        sharedMethod = entityObj[featureName],
        instanceMethod = blueprint[featureName];

      if (sharedMethod) sharedMethod.safeguard();

      if (isKind && instanceMethod) {
        delete blueprint[featureName];
        blueprint[featureName] = instanceMethod.safeguard();
      }
    }

    if (isKind) entityObj.applyBehavior(blueprint);

    return establish;
  };

  var Regex = this.Regex = RegExp; // Alias global RegExp to Regex
  var Moment = this.Moment = Date; // Alias global Date to Moment

  establish('Text', Text, [
    'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'quote', 'replace', 'search',
    'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'match'
  ])('Collect', Collect, [
    'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
    'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
  ])('Numeral', Numeral, [
    'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
  ])('Proc', Proc, [
    'apply', 'call', 'bind'
  ])('Regex', Regex, [
    'exec', 'test'
  ])('Structure', Structure, [
    'create', 'defineProperty', 'defineProperties', 'keys',
    'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
    'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
  ])('Moment', Moment, ['now']);

  Structure.addFeature = addFeature.flexibleSetter();

  Moment.addFeature('now', function () {
    return +(new Moment);
  });

  var Flag = this.Flag = Boolean; // Alias global Boolean to Flag
  new Kind('Flag', Flag);

  // Fixes NaN returning as Numeral
  Numeral.prototype.$classification = function () {
    return isBounded(this) ? 'numeral' : 'null';
  }.conceal();

  // Numeral.generateRandom
  Numeral.addFeature('generateRandom', function (lowerBound, upperBound) {
    return Arith.floor(Arith.random() * (upperBound - lowerBound + 1) + lowerBound);
  });

  // iterateEach, processEach
  var hasOwnProp = Structure.prototype.hasOwnProperty;
  Structure.addFeature('iterateEach', function (structure, callbackFn, context) {
    for (var itemKey in structure) {
      if (hasOwnProp.call(structure, itemKey)) callbackFn.call(context, structure[itemKey], itemKey, structure);
    }
  });

  Structure.processEach = Structure.iterateEach;

  Collect.prototype.applyBehavior({

    iterateEach: function (callbackFn, context) {
      for (var idx = 0, len = this.length; idx < len; idx++) {
        if (idx in this) callbackFn.call(context, this[idx], idx, this);
      }
    },

    processEach: function (callbackFn, context) {
      Collect.iterateEach(this, callbackFn, context);
      return this;
    }

  });

  // Collect & Structure duplicating, Structure combining and attaching
  var duplicateOf = function (subject) {
    switch (kindOf(subject)) {
      case 'collect':
        return subject.makeDuplicate();
      case 'structure':
        return Structure.makeDuplicate(subject);
      default:
        return subject;
    }
  };

  Collect.prototype.applyBehavior('makeDuplicate', function () {
    var idx = this.length,
      duplicate = new Collect(idx);
    while (idx--) duplicate[idx] = duplicateOf(this[idx]);
    return duplicate;
  });

  var combineSingle = function (targetObj, itemKey, currentVal) {
    switch (kindOf(currentVal)) {
      case 'structure':
        if (kindOf(targetObj[itemKey]) == 'structure') Structure.combine(targetObj[itemKey], currentVal);
        else targetObj[itemKey] = Structure.makeDuplicate(currentVal);
        break;
      case 'collect':
        targetObj[itemKey] = currentVal.makeDuplicate();
        break;
      default:
        targetObj[itemKey] = currentVal;
    }
    return targetObj;
  };

  Structure.addFeature({

    combine: function (targetObj, inputKey, inputValue) {
      if (kindOf(inputKey) == 'string') return combineSingle(targetObj, inputKey, inputValue);
      for (var idx = 1, len = arguments.length; idx < len; idx++) {
        var structure = arguments[idx];
        for (var itemKey in structure) combineSingle(targetObj, itemKey, structure[itemKey]);
      }
      return targetObj;
    },

    makeDuplicate: function (structure) {
      var duplicate = {};
      for (var itemKey in structure) duplicate[itemKey] = duplicateOf(structure[itemKey]);
      return duplicate;
    },

    attach: function (baseObj) {
      for (var idx = 1, len = arguments.length; idx < len; idx++) {
        var additionalObj = arguments[idx] || {};
        for (var itemKey in additionalObj) baseObj[itemKey] = additionalObj[itemKey];
      }
      return baseObj;
    }

  });

  // Types without specific object constructors
  ['Structure', 'EmptySpace', 'TextContent', 'Gathering', 'PassedArgs'].processEach(function (designation) {
    new Kind(designation);
  });

  // Unique Identifier Generation
  var UniqueIdCounter = Moment.now(); // Using a different seed from Date.now()

  Text.addFeature('createUniqueId', function () {
    return (UniqueIdCounter++).stringRep(36);
  });

  //<1.2compat>
  var Map = this.Map = new Kind('Map', function (structure) {
    if (kindOf(structure) == 'map') structure = Structure.makeDuplicate(structure.getFiltered());
    for (var itemKey in structure) this[itemKey] = structure[itemKey];
    return this;
  });

  Map.prototype.applyBehavior({
    iterateEach: function (callbackFn, context) {
      Structure.iterateEach(this, callbackFn, context);
    },

    getFiltered: function () {
      var filtered = {};
      for (var itemKey in this) {
        if (hasOwnProp.call(this, itemKey)) filtered[itemKey] = this[itemKey];
      }
      return filtered;
    },

    getItemCount: function () {
      var count = 0;
      for (var itemKey in this) {
        if (hasOwnProp.call(this, itemKey)) count++;
      }
      return count;
    }
  });

  Map.createAlias('processEach', 'iterateEach');

  Structure.kind = Kind.isStructure;

  var CoreNative = this.CoreNative = function (props) {
    return new Kind(props.designation, props.initFn);
  };

  CoreNative.kind = Kind.kind;

  CoreNative.applyBehavior = function (entityObjs, methods) {
    for (var idx = 0; idx < entityObjs.length; idx++) entityObjs[idx].applyBehavior(methods);
    return CoreNative;
  };

  var sequenceKind = Collect.kind;
  Collect.kind = function (subject) {
    return isAnInstanceOf(subject, Collect) || sequenceKind(subject);
  };

  this.$_List = function (subject) {
    return Collect.createFrom(subject).slice();
  };

  this.$_ArgsFn = function (idx) {
    return function () {
      return arguments[idx];
    };
  };

  this.$_CheckVal = function (valObj) {
    return !!(valObj || valObj === 0);
  };

  var clearDelay = clearTimeout; // Alias global clearTimeout
  var clearLoop = clearInterval; // Alias global clearInterval

  this.$_ClearTimers = function (timerId) {
    clearDelay(timerId);
    clearLoop(timerId);
    return null;
  };

  this.$_IsDefined = function (valObj) {
    return (valObj != null);
  };

  this.$_ProcessItems = function (iterableObj, callbackFn, context) {
    var currentKind = kindOf(iterableObj);
    ((currentKind == 'passedargs' || currentKind == 'gathering' || currentKind == 'collect' || currentKind == 'elements') ? Collect : Structure).iterateEach(iterableObj, callbackFn, context);
  };

  this.$_NoOp = function () {};

  this.$_AddProps = function (baseObj, additionalObj) {
    return Structure.attach(baseObj, additionalObj);
  };

  this.$_MapObj = function (structure) {
    return new Map(structure);
  };

  this.$_CombineObjects = function () {
    var argsList = fragment.call(arguments);
    argsList.unshift({});
    return Structure.combine.apply(null, argsList);
  };

  this.$_FunctionFactory = Proc.createFrom;
  this.$_MergeObjects = Structure.combine;
  this.$_GenerateRandomNum = Numeral.generateRandom;
  //</1.2compat>
})();