( function ( ) {
  'use strict';

  // This variable holds the string name for the constructor-like method.
  // It can be adjusted if a different convention is preferred.
  var entryPointName = 'setup',
      ClassGen,
      BehaviorHook;

  /**
   * createTypeFromBlueprint
   * This utility function processes a definition object. It identifies the
   * constructor method (named by `entryPointName`) and uses it as the class
   * constructor, then assigns other properties to its prototype.
   *
   * @param classBlueprint {Object} An object containing class members.
   * @return {Function} The newly created class constructor.
   */
  function createTypeFromBlueprint( classBlueprint ) {
    var memberKey,
        newlyFormedType = classBlueprint[entryPointName] || function ( ) {
          /* Default empty constructor */
        };

    for ( memberKey in classBlueprint ) {
      if ( classBlueprint.hasOwnProperty( memberKey ) && memberKey !== entryPointName ) {
        newlyFormedType.prototype[memberKey] = classBlueprint[memberKey];
      }
    }
    return newlyFormedType;
  }

  /**
   * overlayDefinitionProperties
   * This routine merges properties from a parent definition into a child definition.
   * It only adds properties that are not already present in the child,
   * skipping the constructor entry point.
   *
   * @param derivedDef {Object} The definition of the derived class.
   * @param parentDef {Object} The definition of the parent class.
   */
  function overlayDefinitionProperties( derivedDef, parentDef ) {
    var attributeName;
    for ( attributeName in parentDef ) {
      if ( !derivedDef.hasOwnProperty( attributeName ) && attributeName !== entryPointName ) {
        derivedDef[attributeName] = parentDef[attributeName];
      }
    }
  }

  /**
   * ClassGen
   * This is the primary factory function, supporting two usage patterns:
   *
   * 1. Creating a new class type:
   *    var MyObject = ClassGen({
   *      setup: function (value) {
   *        this.value = value;
   *      },
   *      getValue: function () {
   *        return this.value;
   *      }
   *    });
   *
   *    var myInstance = new MyObject('example');
   *    console.log(myInstance.getValue()); // 'example'
   *
   * 2. Augmenting an existing class definition with static methods:
   *    ClassGen(MyObject, {
   *      createDefault: function () {
   *        return new MyObject('default');
   *      }
   *    });
   *
   *    var defaultInstance = MyObject.createDefault();
   *
   * @param typeDefinition {Object | Function} Either a class blueprint or an existing class.
   * @param staticMembers {Object} Optional. An object of static methods to add to the class.
   * @returns {Function | undefined} The new class constructor or nothing if augmenting.
   */
  ClassGen = function ( typeDefinition, staticMembers ) {
    if ( staticMembers ) {
      // If staticMembers are provided, we're extending the class itself, not its prototype.
      overlayDefinitionProperties( typeDefinition, staticMembers );
      return;
    }

    var parentEntity = createTypeFromBlueprint( typeDefinition );

    /**
     * deriveFrom
     * This static method allows for easy inheritance from the current class.
     * It creates a new class that inherits from this one.
     *
     * @param subTypeDefinition {Object} The blueprint for the derived class.
     * @return {Function} The new derived class constructor.
     */
    parentEntity.deriveFrom = function ( subTypeDefinition ) {
      var derivedEntity;
      overlayDefinitionProperties( subTypeDefinition, typeDefinition );
      derivedEntity = ClassGen( subTypeDefinition );

      // This helper method allows derived classes to invoke their parent's constructor.
      // It should be called as the first line within the derived class's 'setup' method.
      derivedEntity.superCtor = function ( ) {
        var callArguments = Array.prototype.slice.call( arguments ),
            targetInstance = callArguments.shift( );
        parentEntity.apply( targetInstance, callArguments );
      };

      // Provides access to the parent class for method overriding and calling.
      derivedEntity.ancestor = parentEntity;

      return derivedEntity;
    };
    return parentEntity;
  };

  // Setting up Aspect-Oriented Programming (AOP) capabilities.
  BehaviorHook = ClassGen({
    setup: function ( subjectClass, operationName ) {
      this._hookedOperation = operationName;
      this._targetPrototype = subjectClass.prototype;
    },

    preExecution: function ( preHandler ) {
      var originalOperation = this._targetPrototype[this._hookedOperation];

      this._targetPrototype[this._hookedOperation] = function ( ) {
        preHandler.apply( this, arguments );
        return originalOperation.apply( this, arguments );
      };

      return this;
    },

    postSuccess: function ( successHandler ) {
      var originalFunc = this._targetPrototype[this._hookedOperation];

      this._targetPrototype[this._hookedOperation] = function ( ) {
        var operationResult = originalFunc.apply( this, arguments );
        return successHandler.call( this, operationResult );
      };

      return this;
    },

    postFailure: function ( errorHandler ) {
      var originalRoutine = this._targetPrototype[this._hookedOperation];

      this._targetPrototype[this._hookedOperation] = function ( ) {
        var operationResult;
        try {
          operationResult = originalRoutine.apply( this, arguments );
        } catch ( exceptionThrown ) {
          operationResult = errorHandler.call( this, exceptionThrown );
        }
        return operationResult;
      };

      return this;
    }
  });

  /**
   * Aspect-Oriented Programming (AOP) Module
   *
   * To apply cross-cutting concerns using AOP, pass the target class and the
   * method name to be advised. Then, chain advice methods like `preExecution`,
   * `postSuccess`, or `postFailure`.
   *
   * @param targetClass {Function} The class constructor to apply advice to.
   * @param actionToHook {string} The name of the method within the class to advise.
   * @returns {BehaviorHook} An instance configured for the specified method.
   */
  ClassGen.BehaviorHook = function ( targetClass, actionToHook ) {
    return new BehaviorHook( targetClass, actionToHook );
  };

  // Export the framework for various environments.
  // For Node.js, use `require('your-lib-name')`.
  if ( 'undefined' !== typeof module && module.exports ) {
    module.exports = ClassGen;
  } else {
    // For browser environments, attach to the global window object.
    window.ClassGen = ClassGen;
  }

}( ) );