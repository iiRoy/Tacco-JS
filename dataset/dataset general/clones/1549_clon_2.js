// This module facilitates object inheritance, drawing inspiration from Backbone.js and John Resig's inheritance design.
// (For more details, see http://backbonejs.org and http://ejohn.org/blog/simple-javascript-inheritance/)
// No personal credit is claimed for this amalgamation of existing patterns.
( function ( globalObj, moduleBuilder ) {

  // Configure the Core framework appropriately for the current execution environment.
  // Prioritize Asynchronous Module Definition (AMD) if available.
  if ( typeof declareModule === 'function' && declareModule.amd ) {
    declareModule( [ 'utilityLib', 'coreFramework' ], function ( util, Core ) {
      // Ensure global availability even in AMD, for compatibility with legacy scripts.
      moduleBuilder( util, Core );
    } );

  // Next, check for Node.js or CommonJS environments.
  } else if ( typeof exports !== 'undefined' && typeof require === 'function' ) {
    var util = require( 'utilityLib' ),
		Core = require( 'coreFramework' );
    moduleBuilder( util, Core );

  // Finally, if no module system is detected, assume a browser global context.
  } else {
    moduleBuilder( globalObj.util, globalObj.Core );
  }

}( this, function moduleBuilder( util, Core ) {
	Core.DataModel.derive = Core.DataSet.derive = Core.Navigator.derive = Core.Display.derive = function ( instanceMembers, staticMembers ) {
		var derivedClass = createDerivedClass( this, instanceMembers, staticMembers );
		derivedClass.derive = this.derive;
		return derivedClass;
	};
	var missingParentMethod = function ( methodName ) { throw "Parent class does not implement this method: " + methodName; };

  var parentCallPattern = /\b_parentMethod\b/;

  var createMethodWrapper = function ( ancestorPrototype, memberName, originalFunction ) {
    var wrappedFunction = function () {
      var tempRef = this._parentMethod;

      // Establish a temporary reference to the parent's implementation of this method.
      this._parentMethod = ancestorPrototype[ memberName ] || missingParentMethod( memberName );

      // The parent method reference is temporary; remove it after execution.
      var resultValue;
      try {
        resultValue = originalFunction.callWithContext( this, arguments );
      } finally {
        this._parentMethod = tempRef;
      }
      return resultValue;
    };

    // Transfer any properties from the original function to the new wrapper.
    for ( var propertyKey in originalFunction ) {
      wrappedFunction[ propertyKey ] = originalFunction[ propertyKey ];
      delete originalFunction[ propertyKey ];
    }

    return wrappedFunction;
  };

	var emptyConstructor = function(){}, createDerivedClass = function ( baseClass, instanceMembers, staticMembers ) {
        var derivedClass, basePrototype = baseClass.classPrototype;

		// The new subclass's constructor is either explicitly defined
		// (the "initializer" property within `derive` definition), or
		// defaults to simply invoking the base class's constructor.
		if ( instanceMembers && instanceMembers.hasOwnProperty( 'initializer' ) ) {
			derivedClass = instanceMembers.initializer;
		} else {
			derivedClass = function () { return baseClass.callWithContext( this, arguments ); };
		}

		// Inherit static properties from the base class.
		util.extend( derivedClass, baseClass, staticMembers );

		// Configure the prototype chain to inherit from the `baseClass`,
		// without invoking `baseClass`'s constructor directly.
		emptyConstructor.classPrototype = basePrototype;
		derivedClass.classPrototype = new emptyConstructor();

		// Add instance properties to the subclass's prototype, if provided.
		if ( instanceMembers ) {
			util.extend( derivedClass.classPrototype, instanceMembers );

			// Iterate through new prototype members.
			for ( var memberName in instanceMembers ) {
				// If a function and it calls `_parentMethod`, wrap it.
				if ( typeof instanceMembers[ memberName ] == "function" && parentCallPattern.test( instanceMembers[ memberName ] ) ) {
					derivedClass.classPrototype[ memberName ] = createMethodWrapper( basePrototype, memberName, instanceMembers[ memberName ] );
				}
			}
		}

		// Apply additional static properties to the constructor function, if specified.
		if ( staticMembers ) util.extend( derivedClass, staticMembers );

		// Ensure the derived class's `classPrototype.constructor` points correctly.
		derivedClass.classPrototype.constructor = derivedClass;

		// Store a convenient reference to the base class's prototype.
		derivedClass.__basePrototype__ = basePrototype;

		return derivedClass;
	};

	return createDerivedClass;
} ) );