/*
*
* jclass v1.1.3
*
* This is a library for creating classes in JavaScript.
* Original source: https://github.com/riga/jclass
*
*
* Marcel Rieger, 2014.
*
* Released under the MIT license, which can be found here:
* http://www.opensource.org/licenses/mit-license
*
*/

( function ( factory ) {

    if ( typeof define === "function" && define.amd ) {
        // Asynchronous Module Definition (AMD) support.
        // This is typically used with RequireJS.
        define( [ ], factory );
    }

    else if ( typeof exports === "object" ) {

        // CommonJS support.
        // This is used in environments like Node.js.
        exports = factory( );

        if ( typeof module === "object" ) {
            // Specific Node.js export for module compatibility.
            module.exports = exports;
        }
    }

    else if ( window ) {

        // Browser environment.
        // The Class object is attached directly to the global window object.
        window.Class = factory( );

    }

    else if ( typeof console === "object" && console.error instanceof Function ) {

        // Fallback for environments where no specific module system is detected
        // and 'window' is not available. This is considered an error case.
        console.error( "cannot determine environment" );
    }

} ) ( function ( ) {


    // --- Helper Functions ---
    // These utility functions assist in type checking and object manipulation.


    // Checks if the given object is a function.
    var isFn = function ( obj ) {

        return obj instanceof Function;
    };


    // Checks if the given object is undefined.
    var isUndef = function ( obj ) {

        return obj === undefined;
    };


    // Checks if the given object is an object (and not null).
    var isObj = function ( obj ) {

        return typeof obj === "object";
    };


    // Checks if the given object is a descriptor object.
    // A descriptor object is an object with a 'descriptor: true' property.
    var isDescr = function ( obj ) {

        return isObj( obj ) && obj.descriptor === true;
    };


    // Extends a target object with properties from one or more source objects.
    // Only properties that are undefined in the target are copied.
    var extend = function ( target ) {

        // Convert arguments to a real array, excluding the target.
        var objs = Array.prototype.slice.call( arguments, 1 );

        var i, obj, key, originalValue;

        // Iterate through each source object.
        for ( i in objs ) {

            obj = objs[ i ];

            // Ensure the source object is actually an object.
            if ( !isObj( obj ) ) return;

            // Iterate through properties of the current source object.
            for ( key in obj ) {

                originalValue = target[ key ];

                // Copy the property only if it's not already defined in the target.
                if ( isUndef( originalValue ) ) target[ key ] = obj[ key ];
            }
        }

        return target;
    };


    // --- Configuration and Internal State ---


    // Default options for class creation.
    // _isClassObject is an internal flag used during class member propagation.
    var defaultOptions = { _isClassObject: false };


    // A flag used internally during prototype chain setup.
    // Prevents the constructor's 'init' method from being called prematurely.
    var initializing = false;


    // The base class from which all other classes implicitly inherit.
    // It's an empty constructor function by default.
    var BaseClass = function ( ) { };


    // Initialize an array to keep track of all classes that extend BaseClass.
    BaseClass._subClasses = [ ];


    // --- Core Class Extension Mechanism ---


    // This is the main method for creating new classes.
    // It allows a class to extend another (SuperClass) by providing instance
    // members, class members, and configuration options.
    BaseClass._extend = function ( instanceMembers, classMembers, options ) {

        // --- Argument Normalization ---

        // Ensure instanceMembers is an object, defaulting to an empty object if undefined.
        if ( isUndef( instanceMembers ) ) instanceMembers = { };

        // Ensure classMembers is an object, defaulting to an empty object if undefined.
        if ( isUndef( classMembers ) ) classMembers = { };

        // Ensure options is an object, defaulting to an empty object if undefined.
        if ( isUndef( options ) ) options = { };


        // Mix in the default options, ensuring internal flags are set.
        extend( options, defaultOptions );


        // --- Class Setup ---

        // 'this' refers to the SuperClass when _extend is called.
        var SuperClass = this;


        // The constructor function for the new class being created.
        var Class = function ( ) {
            // If the 'initializing' flag is set, it means we are temporarily
            // constructing an object to set up the prototype chain.
            // In this case, we skip the actual initialization logic.
            if ( initializing ) return;

            // Store a reference to the class constructor on the instance.
            this._class = Class;

            // If an 'init' method is defined on the instance, call it.
            // This method serves as the actual constructor for the class.
            if ( this.init ) this.init.apply( this, arguments );
        };


        // --- Prototype Chain Establishment ---

        // Temporarily set the 'initializing' flag to true.
        // This prevents the SuperClass's constructor (and its 'init' method)
        // from being called when we create an instance of it.
        initializing = true;

        // Create an instance of the SuperClass. This instance will become
        // the prototype of our new Class.
        var prototype = new SuperClass( );

        // Reset the 'initializing' flag.
        initializing = false;


        // Get the prototype object of the SuperClass.
        var superPrototype = SuperClass.prototype;


        // Set the new Class's prototype to the instance of the SuperClass.
        // This establishes the inheritance chain.
        Class.prototype = prototype;


        // Correctly set the constructor property of the new Class's prototype.
        // This ensures 'instance.constructor' points to 'Class'.
        Class.prototype.constructor = Class;


        // Store a reference to the parent class (SuperClass) on the new Class.
        Class._superClass = SuperClass;


        // Initialize an array to hold references to classes that extend *this* Class.
        Class._subClasses = [ ];

        // Add the newly created Class to its SuperClass's list of sub-classes.
        SuperClass._subClasses.push( Class );


        // Propagate the _extend method to the new Class, making it extendable.
        Class._extend = SuperClass._extend;


        // --- Instance Members Propagation ---

        // Iterate through the instanceMembers object provided to _extend.
        var key, member, superMember;
        for ( key in instanceMembers ) {

            member = instanceMembers[ key ];

            // If the member is a descriptor, use Object.defineProperty
            // to define the property with its specific attributes (get, set, value, etc.).
            if ( isDescr( member ) ) {

                Object.defineProperty( prototype, key, member );

            } else {
                // If it's a normal member, simply assign it to the prototype.
                prototype[ key ] = member;

                // Check if both the new member and the corresponding super member are functions.
                // If they are distinct functions, add a reference to the super member
                // as '_super' on the new member function. This enables calling 'this._super()'
                // within an overridden method.
                superMember = superPrototype[ key ];
                if ( isFn( member ) && isFn( superMember ) && member !== superMember ) {

                    member._super = superMember;
                }
            }
        }


        // --- Class Members Propagation ---

        // Class members are stored in a special '_members' instance, which itself is a class.
        // This allows class members to inherit and be extended.
        if ( !options._isClassObject ) {

            // Determine the super class for the _members instance.
            // If the SuperClass doesn't have _members, its _members' super class is BaseClass.
            var ClassMembersSuperClass = isUndef( SuperClass._members ) ?
                BaseClass : SuperClass._members._class;


            // Create the actual class for the _members instance.
            // We pass an internal option '_isClassObject: true' to prevent infinite recursion
            // during class member processing for the _members class itself.
            var opts = { _isClassObject: true };
            var ClassMembersClass = ClassMembersSuperClass._extend( classMembers, { }, opts );


            // Create an instance of the ClassMembersClass and assign it to Class._members.
            // This instance holds all the class-level properties and methods.
            Class._members = new ClassMembersClass( );
        }


        // --- Helper Method for Inheritance Checking ---

        // Defines a method to check if the current class extends a given target class.
        Class._extends = function ( target ) {
            // If the direct super class is BaseClass, then it doesn't extend anything further up.
            if ( this._superClass == BaseClass ) return false;

            // If the target is the direct super class or BaseClass, it extends it.
            if ( target == this._superClass || target == BaseClass ) return true;

            // Recursively check the super class's inheritance chain.
            return this._superClass._extends( target );
        };


        // Return the newly created Class constructor.
        return Class;
    };


    // --- Class Conversion Utility ---


    // Converts a traditional JavaScript prototype-style class (constructor function)
    // into our jclass system.
    BaseClass._convert = function ( cls, options ) {

        // The prototype of the original class becomes the instance members.
        var instanceMembers = cls.prototype;


        // Define the 'init' method for the new jclass-style class.
        // This 'init' will create an instance of the original class.
        instanceMembers.init = function ( ) {

            var self = this;

            // Create an instance of the original class using _construct.
            // This handles passing arguments correctly.
            this._origin = BaseClass._construct( cls, arguments );


            // For each own property in the original instance, create a getter
            // on the new jclass instance. This makes properties of the original
            // instance accessible directly through the new jclass instance.
            Object.keys( this._origin ).forEach( function ( key ) {

                // Only consider own properties of the original object.
                if ( !self._origin.hasOwnProperty( key ) ) {
                    return;
                }

                // Define a getter for the property.
                Object.defineProperty( self, key, {
                    get: function ( ) {
                        return self._origin[ key ];
                    }
                } );
            } );
        };

        // Finally, extend BaseClass with the prepared instanceMembers
        // and return the new jclass-style class.
        return BaseClass._extend( instanceMembers, { }, options );
    };


    // --- Constructor Helper ---


    // A utility function to create a new instance of a class,
    // allowing arguments to be passed as an array (similar to Function.prototype.apply).
    BaseClass._construct = function ( cls, args ) {

        // A temporary constructor that calls the original class's constructor
        // with the provided arguments.
        var Class = function ( ) {
            return cls.apply( this, args || [ ] );
        };

        // Set the prototype of the temporary constructor to the original class's prototype.
        // This ensures correct inheritance for the new instance.
        Class.prototype = cls.prototype;

        // Return a new instance created via the temporary constructor.
        return new Class( );
    };


    // The main entry point for the library.
    // When the IIFE is executed, it returns the BaseClass object.
    return BaseClass;

} );