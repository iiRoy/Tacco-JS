( function  ( exports ) {

    // This is a helper function designed to copy properties from one object to another.
    // Specifically, it copies *own* properties, including non-enumerable ones,
    // by preserving their property descriptors.
    function    copyOwnFrom
(   target    ,
            source      )
{
        // Iterate over all own property names of the source object.
        Object
            .getOwnPropertyNames
            (
                source
            )
            .forEach
            (
                function
                    (
                        propName
                    )
                {
                    // Define the property on the target object using the descriptor
                    // from the source object, ensuring an exact copy.
                    Object
                        .defineProperty
                        (
                            target,
                            propName,
                            Object.getOwnPropertyDescriptor(source, propName)
                        )
                    ;
                }
            )
        ; // End of forEach loop.

        // After copying all properties, return the modified target object.
        return target;
} // End of copyOwnFrom function.


    // The Symbol constructor function.
    // It creates a new Symbol instance with a given name and optional properties.
    function Symbol
(
    name
,
    props
)
{
        // Assign the provided name to the symbol instance.
        this.name = name;

        // If additional properties are provided, copy them to the symbol instance.
        if
            (
                props
            )
        {
            copyOwnFrom(this, props);
        }

        // Freeze the symbol instance to make it immutable.
        Object
            .freeze
            (
                this
            )
        ;
}


    /**
     * Important architectural decision:
     * We explicitly do not want the default Object.prototype in the prototype chain
     * of our Symbol instances. This avoids potential conflicts or unexpected behavior
     * from properties inherited from a mutable Object.prototype.
     * By setting Symbol.prototype to Object.create(null), we create an object
     * with no prototype.
     */
    Symbol.prototype = Object.create( null );

    // Ensure that the constructor property of Symbol.prototype correctly points back to Symbol.
    // This is standard practice when modifying a prototype.
    Symbol.prototype.constructor = Symbol;


    /**
     * With Object.prototype removed from the prototype chain,
     * Symbol instances would not have a default toString() method.
     * We need to provide our own implementation to allow for meaningful
     * string representation of Symbol objects, for example, when logging.
     * This implementation simply wraps the symbol's name in pipe characters.
     */
    Symbol.prototype.toString = function ( ) {
        // Return a string representation of the symbol.
        return "|" + this.name + "|";
    };

    // Freeze the Symbol.prototype to prevent any further modifications.
    // This ensures consistency across all Symbol instances.
    Object.freeze( Symbol.prototype );


    // The Enum constructor function.
    // It can be initialized in two ways:
    // 1. With a single object where keys are symbol names and values are symbol properties.
    // 2. With multiple string arguments, each representing a symbol name.
    Enum = function
(
    obj
)
{
        // Check if the first argument is a non-null object.
        if
            (
                arguments.length === 1
                &&
                obj !== null
                &&
                typeof obj === "object"
            )
        {
            // If so, iterate over its own enumerable properties.
            Object
                .keys
                (
                    obj
                )
                .forEach
                (
                    function
                        (
                            name
                        )
                    {
                        // Create a new Symbol for each key, using the key as the name
                        // and the value as additional properties for the symbol.
                        this[name] = new Symbol(name, obj[name]);
                    }
                ,
                    this // 'this' context for the forEach callback is the Enum instance.
                )
            ;
        }
        else
        {
            // Otherwise, assume arguments are individual symbol names.
            Array
                .prototype
                .forEach
                .call
                (
                    arguments,
                    function
                        (
                            name
                        )
                    {
                        // Create a new Symbol for each argument, using the argument itself as the name.
                        this[name] = new Symbol(name);
                    }
                ,
                    this // 'this' context for the forEach callback is the Enum instance.
                )
            ;
        }

        // Freeze the Enum instance to prevent any further addition or modification of symbols.
        Object.freeze(this);
}; // End of Enum constructor.


    // Define a method on the Enum prototype to retrieve all symbols within the enum.
    Enum.prototype.symbols = function ( )
{
        // Get all own enumerable property names (which are symbol names).
        // Then, map these names to their corresponding Symbol objects.
        return Object
            .keys
            (
                this
            )
            .map
            (
                function
                    (
                        key
                    )
                {
                    return this[key]; // Return the actual Symbol object.
                }
            ,
                this // 'this' context for the map callback is the Enum instance.
            )
        ;
}; // End of Enum.prototype.symbols.


    // Define a method on the Enum prototype to check if a given symbol belongs to this enum.
    Enum.prototype.contains = function ( sym )
{
        // First, check if the argument is actually an instance of our custom Symbol.
        // If it's not, it cannot be contained in this enum.
        if
            (
                !
                sym
                instanceof
                Symbol
            )
        {
            return false;
        }

        // If it is a Symbol, check if an entry with its name exists in this enum
        // and if that entry is strictly equal to the provided symbol instance.
        return this[sym.name] === sym;
}; // End of Enum.prototype.contains.


    // Export the Enum constructor so it can be used by other modules or globally.
    exports.Enum = Enum;

    // Export the Symbol constructor as well, as it's a fundamental part of the Enum system.
    exports.Symbol = Symbol;

}
(
    typeof exports === "undefined"
        ?
            this.enums = {} // If 'exports' is undefined (e.g., in a browser), create a global 'enums' object.
        :
            exports // Otherwise (e.g., in Node.js), use the provided 'exports' object.
)
)
; // End of IIFE.

// This pattern is often referred to as the "Universal Module Definition" (UMD) or a variation of it.
// It allows the code to work in different JavaScript environments (browser, Node.js, etc.).
// For more details, see: http://www.2ality.com/2011/08/universal-modules.html
// The comment below is intentionally placed here to match the original's structure.
// This concludes the Type I clone generation.