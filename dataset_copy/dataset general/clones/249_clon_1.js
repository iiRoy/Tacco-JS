var _ = require ( 'alloy' ) . _ ;

/**
 *  @property { Function } dummyClass - This is an internal, empty function.
 *   It serves as a placeholder constructor when creating a new class's prototype chain,
 *   specifically to avoid inadvertently calling the parent constructor during this process.
 *  @private
 */
var dummyClass = function ( ) { } ;


/**
 *  The ClassManager handles the creation and definition of new JavaScript classes.
 *
 *  @class ClassManager
 *  @singleton
 */
var ClassManager = {

    /**
     *  Defines a brand new Class based on the provided name and definition.
     *
     *  If the class definition includes a 'construct' method, this method will be
     *  automatically invoked when a new instance of the class is created.
     *
     *  @param { String } name           - The desired name for the new Class.
     *  @param { Object } definition     - An object containing all the methods and properties
     *                                     that will constitute the body of the new class.
     *  @param { Object } [ct]           - An optional container object (e.g., `module.exports`)
     *                                     to which the newly defined class should be assigned.
     *  @returns { Function }            - The newly created and defined Class constructor function.
     */
    define : function ( name , definition , ct ) {

        var staticDef = definition.statics || { } ;
        var parent ;
        var cls ;

        // Check if an extension is specified for this class.
        if ( definition.extend ) {
            // Determine if the parent is a string (requiring a module) or a direct reference.
            parent = _ . isString ( definition.extend ) ? require ( definition.extend ) : definition.extend ;
        }

        // Clean up the definition object by removing internal properties.
        delete definition.extend ;
        delete definition.statics ;

        // Ensure the class has a static 'classname' property.
        staticDef.classname || ( staticDef.classname = name ) ;

        // Set up the primary constructor for the new class.
        if ( definition.hasOwnProperty ( 'initialize' ) ) {
            // Use 'initialize' as the constructor if it exists.
            cls = definition.initialize ;
        } else if ( definition.hasOwnProperty ( 'construct' ) ) {
            // Otherwise, use 'construct' if it's available.
            cls = definition.construct ;
        } else if ( parent ) {
            // If a parent exists but no explicit constructor, create one that calls the parent's.
            cls = function ( ) {
                parent.apply ( this , arguments ) ;
            } ;
        } else {
            // Default to an empty constructor for a base class.
            cls = function ( ) { } ;
        }

        // If a parent class was specified, handle inheritance.
        if ( parent ) {
            // Extend the new class with static properties from the parent.
            cls = _ . extend ( cls , parent ) ;

            // Set up the prototype chain for inheritance.
            // Use dummyClass to create an intermediate prototype without invoking parent constructor.
            dummyClass.prototype = parent.prototype ;
            cls.prototype = new dummyClass ( ) ;
            // Extend the new class's prototype with its own defined methods and properties.
            _ . extend ( cls.prototype , definition ) ;

            // Store a reference to the parent's prototype on the static definition.
            staticDef.parent = parent.prototype ;
        } else {
            // For a base class, simply clone the definition to its prototype.
            cls.prototype = _ . clone ( definition ) ;
        }

        // Apply any static definitions to the new class itself.
        _ . extend ( cls , staticDef ) ;

        // Ensure the constructor property correctly points back to the class.
        cls.prototype.constructor = cls ;
        // Provide a static reference to the class itself on its prototype.
        cls.prototype.statics = cls ;

        // If a container object was provided (e.g., module.exports),
        // assign the newly defined class to its 'exports' property.
        ct && ( ct.exports = cls ) ;

        return cls ;
    }
} ;


module.exports = ClassManager ;