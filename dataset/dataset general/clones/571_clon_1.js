/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been extensively altered
 * to create a visually distinct, yet functionally identical, version.
 * This file demonstrates a perfect Type I clone.
 */
; ( function ( root, deps, factory ) {
// Check for CommonJS environment (Node.js)
if ( typeof exports === 'object' ) {
    return module.exports = factory( root._ , root ) ; /* Not entirely sure about this part for all setups. */
}

    // Check for AMD (RequireJS) environment
    if ( typeof define === 'function' && define.amd )
    {
        return define( deps, factory ) ;
    }

// Fallback to global scope for browser
root . type = factory( root._, root ) ;
} ( window || this , [ 'underscore' ] , function ( _ , root ) {

    var _VERSION = '0.3' ; /* Current version of this library. */

    // Let's build a little nest here... a collection of utility variables and functions.
    var undefined ; /* Ensure 'undefined' is truly undefined, especially in older JS engines. */
    var noop = function ( ) { } ; /* An empty function, useful as a default callback or placeholder. */

    var log = ( root && root.console && root.console.log )
        ? root.console.log
        : noop ; /* Simple logging utility. */

    var value = function ( v ) {
        return function ( ) {
            return v ;
        } ;
    } ; /* Returns a function that always returns the given value. */

    var compare = function ( v1 ) {
        return function ( v2 ) {
            return v1 === v2 ;
        } ;
    } ; /* Creates a comparison function for strict equality. */

    var can = function ( name ) {
        return function ( v ) {
            var t = type[ name ] ;
            return v === t.a() || ( v != t.a() && t.to( v ) === t.a() ) ;
        } ;
    } ; /* Determines if a value can be converted to a specific type. */

    // Essential library requirements
    if ( ! _ ) { log( "type requires underscore.js" ) ; return false ; } ;
    if ( ! Math ) { log( "type requires Math" ) ; return false ; } ;
    if ( ! JSON ) { log( "type requires JSON" ) ; return false ; } ;

    /*
     * This is the core `type` function, providing basic type identification.
     * It checks for specific custom types before falling back to `typeof`.
     */
    var type = function ( v ) {
        if ( type.arr( v ) ) { return 'array' ; }
        if ( type.nan( v ) ) { return 'nan' ; }
        if ( type.nul( v ) ) { return 'null' ; }
        if ( type.args( v ) ) { return 'arguments' ; }
        return typeof v ;
    } ;

    type.VERSION = _VERSION ; // Expose the version number.

    /*
     * The `type.extend` function is used to define new types
     * or add functionality to existing ones.
     */
    type.extend = function ( obj ) {
        var isNew = false ; // Flag to track if we're creating a new type
        if ( ! type[ obj.name ] ) {
            isNew = true ;
            type[ obj.name ] = obj.is ; /* Assign the 'is' function as the type check. */
        }

        // Handle inheritance first
        if ( obj.inherits ) {
            if ( ! ( obj.inherits instanceof Array ) ) { obj.inherits = [ obj.inherits ] ; }
            _.each( obj.inherits, function ( name ) {
                _.extend( type[ obj.name ] , type[ name ] ) ;
            } ) ;
        }

        // Clobber (overwrite/add) with new type-specific methods
        if ( obj.methods ) { _.extend( type[ obj.name ] , obj.methods ) ; }

        // If it's a new type, always set its base functions: `a`, `to`, `can`.
        if ( isNew ) {
            type[ obj.name ].a = value( obj.a ) ; // 'a' is the "default" or "archetype" value
            type[ obj.name ].to = obj.to ; // 'to' converts to this type
            type[ obj.name ].can = obj.can ; // 'can' checks if conversion is possible
        }
    } ;

    // #### Definition of Core Types ####

    // Base Primitive Types
    type.extend({
        name: "nul", /* Null type */
        a : null, /* Archetype value for null */
        is: _.isNull, /* Check if value is null */
        to: value( null ), /* Convert to null */
        can: value( true ) /* Any value can conceptually become null */
    }) ;

    type.extend({
        name: "undef", /* Undefined type */
        a : undefined, /* Archetype value for undefined */
        is: _.isUndefined, /* Check if value is undefined */
        to: value( undefined ), /* Convert to undefined */
        can: value( true ) /* Any value can conceptually become undefined */
    }) ;

    type.extend({
        name: "nan", /* Not-a-Number type */
        a : NaN, /* Archetype value for NaN */
        is: _.isNaN, /* Check if value is NaN */
        to: value( NaN ), /* Convert to NaN */
        can: value( true ) /* Any value can conceptually become NaN */
    }) ;

    type.extend({
        name: 'def', /* Defined type (not NaN, undefined, or null) */
        a: true, /* Archetype value for defined (a boolean to represent existence) */
        is: function ( v ) {
            return !( type.nan( v ) || type.undef( v ) || type.nul( v ) ) ;
        },
        to: function ( v ) {
            return ( type.def( v ) )
                ? v
                : type.def.a() ;
        },
        can: function ( v ) {
            return ( type.def( v ) )
                ? true
                : false ;
        }
    }) ;

    /*
     *
     * Dual Types - Boolean-related
     *
     */

    type.extend({
        name:'bool', /* Boolean type */
        a: true, /* Archetype value for boolean */
        is: _.isBoolean, /* Check if value is a boolean */
        to: function ( v ) {
            return /^true$/i.test( v ) ; /* Converts string "true" (case-insensitive) to true. */
        },
        can: can( 'bool' ), /* Can be converted to a boolean? */
        methods: {
            not : function ( v ) { return ! v ; } /* Boolean negation */
        }
    }) ;

    type.extend({
        name: 'tru', /* Strict true type */
        inherits: 'bool', /* Inherits from boolean */
        a: true, /* Archetype value is true */
        is: compare( true ), /* Strictly checks for true */
        to: type.bool.a, /* Converts to archetype boolean true */
        can: value( true ) /* Always true for this type */
    }) ;

    type.extend({
        name: 'fal', /* Strict false type */
        inherits: 'bool', /* Inherits from boolean */
        a: false, /* Archetype value is false */
        is: compare( false ), /* Strictly checks for false */
        to: value( false ), /* Converts to archetype boolean false */
        can: value( false ) /* Always false for this type */
    }) ;

    type.extend({
        name: 'truy', /* Truthy type */
        inherits: 'bool', /* Inherits from boolean */
        a: true, /* Archetype value is true */
        is: function ( v ) { return v == true ; }, /* Checks for truthiness (loose equality) */
        to: function ( v ) { return ( v ) ? v : true ; }, /* Converts to truthy value */
        can: value( true ) /* Always true for this type */
    }) ;

    type.extend({
        name: 'faly', /* Falsy type */
        inherits: 'bool', /* Inherits from boolean */
        a: false, /* Archetype value is false */
        is: function ( v ) { return v !== true ; }, /* Checks for falsiness (not strictly true) */
        to: function ( v ) { return ( ! v ) ? v : false ; }, /* Converts to falsy value */
        can: value( false ) /* Always false for this type */
    }) ;

    // Numeric Types
    type.extend({
        name:'num', /* Number type */
        a: 0 , /* Archetype value for number */
        is: function ( v ) {
            return _.isNumber( v ) && ! type.nan( parseFloat( v ) ) ; /* Checks if it's a number and not NaN after parsing. */
        },
        to: function ( v ) {
            if ( type.num( v ) ) { return v ; } ; // If already a number, return it.
            if ( type.bool( v ) ) { return v ? 1 : 0 ; } ; // Booleans to 1 or 0.
            if ( type.fn( v ) ) {
                var val = v() ;
                if ( type.num( val ) ) { return val ; } ; // If function returns a number.
            } ;
            if ( type.obj( v ) && type.fn( v.a ) ) {
                if ( type.num( v.a() ) ) { return v.a() ; }
            }
            if ( type.arr( v ) ) { return v.length ; } ; // Array length as number.
            if ( type.str( v ) ) {
                var num = v * 1 || 0 ; // Attempt to convert string to number.
                return ( num === 0 && ! v.match( /^0+$/ ) )
                    ? type.num.a()
                    : num ;
            }
            return type.num.a() ; /* Default to archetype number (0). */
        },
        can: can( "num" ), /* Can be converted to a number? */

        methods : { /* Math-related methods */
            random : _.random,
            range : _.range,

            abs : Math.abs,
            acos : Math.acos,
            asin : Math.asin,
            atan : Math.atan,
            ceil : Math.ceil,
            cos : Math.cos,
            exp : Math.exp,
            floor : Math.floor,
            log : Math.log,
            max : Math.max,
            min : Math.min,
            pow : Math.pow,
            round : Math.round,
            sin : Math.sin,
            sqrt : Math.sqrt,
            tan : Math.tan,

            plus : function ( a, b ) { return a + b ; },
            minus : function ( a, b ) { return a - b ; },
            mod : function ( a, b ) { return a % b ; },
            times : function ( a, b ) { return a * b ; },
            div : function ( a, b ) { return a / b ; },

            sign : function ( n ) { return n == 0 ? 0 : n / Math.abs( n ) ; },
            between : function ( v, low, high ) { return ( v >= low && v <= high ) ; },
            eq : function ( a, b ) { return a === b ; },
            neq : function ( a, b ) { return a !== b ; },
            lt : function ( a, b ) { return a < b ; },
            lte : function ( a, b ) { return a <= b ; },
            gt : function ( a, b ) { return a > b ; },
            gte : function ( a, b ) { return a >= b ; },

            fixed: function ( a, b ) { return parseFloat( a.toFixed( type.int( b ) ? b : 2 ), 10 ) ; },
            hex : function ( a ) { return a.toString( 16 ) ; },
            binary : function ( a ) { return a.toString( 2 ) ; }
        }
    }) ;

    type.extend({
        name:'int', /* Integer type */
        a: 1, /* Archetype value for integer */
        inherits: "num", /* Inherits from number type */
        is: function ( v ) { return ( Math.floor( v ) === v ) ; }, /* Checks if value is an integer */
        to: function ( v ) {
            var value = parseInt( v, 10 ) ;
            if ( ! isNaN( value ) ) { return value ; }
            return type.num.a() ; /* Default to archetype number if conversion fails. */
        },
        can: can( "int" ), /* Can be converted to an integer? */
        methods : {
            dec: function ( v ) { return --v ; }, /* Decrement */
            inc: function ( v ) { return ++v ; } /* Increment */
        }
    }) ;

    type.extend({
        name:'flt', /* Float type (floating-point number) */
        a: 0.1, /* Archetype value for float */
        inherits: "num", /* Inherits from number type */
        is: function ( v, p ) {
            return v === type.num.fixed( v, p ) ; /* Checks if value is a float, possibly with precision. */
        },
        to: function ( v, p ) {
            return type.num.fixed( type.num.to( v ), p ) ; /* Converts to a float with optional precision. */
        },
        can: can( "flt" ), /* Can be converted to a float? */
        methods: {
            eq : function ( a, b, p ) {
                return type.num.fixed( a, p ) === type.num.fixed( b, p ) ; /* Compares floats with precision. */
            },
            decimal : function ( a ) { return a % 1 ; } /* Returns the decimal part of a number. */
        }
    }) ;

    /*
     *
     * String Types
     *
     */

    type.extend({
        name:'str', /* String type */
        a: '', /* Archetype value for string */
        is: _.isString, /* Check if value is a string */
        to: function ( v ) {
            if ( type.def( v ) ) { return String( v ) ; } return type.str.a() ; /* Converts to string or archetype. */
        },
        can: can( "str" ), /* Can be converted to a string? */

        methods: {

            fromCharCode: String.fromCharCode,
            charAt: function ( a, b ) { return a.charAt( b ) ; },
            charCodeAt: function ( a, b ) { return a.charCodeAt( b ) ; },
            lower: function ( a ) { return a.toLowerCase() ; },
            upper: function ( a ) { return a.toUpperCase() ; },

            escape: _.escape,
            unescape: _.unescape,
            template: _.template,
            contains: _.contains,
            "array": _.toArray, /* Converts string to array of characters. */
            length: _.size, /* String length. */

            trim: function ( a ) { return type.str.ltrim( type.str.rtrim( a ) ) ; },
            ltrim: function ( a ) { return a.replace( /^\s+/,'' ) ; }, /* Left trim whitespace. */
            rtrim: function ( a ) { return a.replace( /\s+$/,'' ) ; }, /* Right trim whitespace. */

            truncate : function ( text, strLength, noDots ) {
                if ( text.length > strLength ) {
                    if ( strLength && ! isNaN( strLength ) ) {
                        if ( type.faly( noDots ) ) {
                            return text.substr( 0, strLength ) ;
                        }
                        return text.substr( 0, strLength ) + '&hellip;' ; /* Appends ellipsis. */
                    }
                } return text ; /* Returns original text if no truncation needed. */
            }

            // not sure about these - commented out in original.
            //split: function(){return this.a().split.apply(this, arguments);},
            //replace: function(a){return a.replace.apply(this, arguments);},
            //replaceAll: function(a,b){ return this.a().replace( //...// )}
        }
    }) ;


    type.extend({
        name:'plain', /* Plain text string type (alphanumeric, basic symbols) */
        a: "", /* Archetype value for plain string */
        inherits: "str", /* Inherits from string type */
        is: function ( v ) { return type.plain.to( v ).length === v.length ; }, /* Checks if value is plain text. */
        to: function ( v ) {
            if ( type.str( v ) ) { return v.replace( /^[^a-zA-Z0-9@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/, '' ) ; } return type.plain.a() ;
        },
        can: function ( v ) {
            return type.str.can( v ) ; /* If it can be a string, it can potentially be plain. */
        }
    }) ;

    type.extend({
        name:'email', /* Email address string type */
        a: 'test@test.com', /* Archetype value for email */
        inherits: "str", /* Inherits from string type */
        is: function ( v ) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
            return re.test( v ) ; /* Validates email format using regex. */
        },
        to: function ( v, w, x ) {
            if ( type.email( v ) ) { return v ; }
            if ( type.def( v ) && type.def( w ) && type.def( x ) ) { return v + '@' + w + '.' + x ; }
            if ( type.def( v ) && type.def( w ) ) { return v + '@' + w ; }
            return type.email.a() ; /* Default to archetype email if conversion fails. */
        },
        can: can( "email" ) /* Can be converted to an email? */
    }) ;


    type.extend({
        name:'unique', /* Unique identifier string type */
        a: "0", /* Archetype value for unique ID */
        is: function ( v ) {
            v = type.str( v ) ;
            if ( v ) { return _.indexOf( type.unique.ids, v ) !== -1 ; } /* Checks if ID already exists. */
            return false ;
        },
        can: function ( v ) {
            v = type.make( 'str', v ) ;
            if ( v ) { return _.indexOf( type.unique.ids, v ) === -1 ; } /* Checks if ID does NOT exist (can be made unique). */
            return false ;
        },
        to: function ( v ) {
            v = type.make( 'str', v ) ;
            while ( _.indexOf( type.unique.ids, v ) !== -1 ) {
                v = _.uniqueId() ; /* Generate new unique ID if already exists. */
            }
            type.unique.ids.push( v ) ; /* Add new unique ID to the list. */
            return v ;
        },
        methods: {
            ids: [ "0" ] /* Internal storage for generated unique IDs. */
        }
    }) ;


    /*
     * COLLECTION TYPES
     * These types handle groups of data, like arrays and objects.
     */

    type.extend({
        name:'col', /* Generic collection type (object or array) */
        a: [], /* Archetype value for collection (empty array) */
        is: function ( v ) { return _.isObject( v ) || _.isArray( v ) ; }, /* Checks if value is an object or array. */
        can: function ( v ) { return type.col( v ) ; }, /* Can be converted to a collection? */
        to: function ( v ) {
            if ( type.col( v ) ) { return v ; }
            return type.arr.to( v ) ; /* Convert to array if not already a collection. */
        },
        methods : { /* Underscore.js collection methods */
            each: _.each,
            map: _.map,
            reduce: _.reduce,
            reduceRight: _.reduceRight,
            find: _.find,
            filter: _.filter,
            where: _.where,
            reject: _.reject,
            contains: _.contains,
            invoke: _.invoke,
            pluck: _.pluck,
            sortBy: _.sortBy,
            groupBy: _.groupBy,
            countBy: _.countBy,
            shuffle: _.shuffle,
            toArray: _.toArray,
            length: _.length,

            all: _.all,
            any: _.any,
            max: _.max,
            min: _.min,

            mapValues: function ( a, fn ) {
                return _.reduce( a, function ( obj, v, k ) {
                    obj[ k ] = fn( v, k, a ) ; return obj ;
                }, {} ) ;
            }
        }
    }) ;

    type.extend({
        name:'arr', /* Array type */
        a: [], /* Archetype value for array */
        inherits: "col", /* Inherits from collection type */
        is: _.isArray, /* Checks if value is an array */
        to: function ( v ) {
            if ( type.args( v ) ) { return _.toArray( v ) ; } /* Arguments object to array. */
            if ( type.arr( v ) ) { return v ; } /* Already an array, return as is. */
            if ( type.obj( v ) ) { return _.map( v, function ( v ) { return v ; } ) ; } /* Object values to array. */
            if ( type.fn( v ) ) {
                if ( type.arr( v() ) ) { return v() ; } /* If function returns an array. */
            } ;
            if ( type.def( v ) ) { return _.toArray( arguments ) ; } /* Convert arguments to array. */
            return false ; /* Failed to convert to array. */
        },
        can: can( "arr" ), /* Can be converted to an array? */
        methods : { /* Array manipulation methods */

            push: function ( a, b ) { return a.push( b ) ; },
            pop: function ( a ) { return a.pop() ; },
            unshift: function ( a, b ) { return a.unshift( b ) ; },
            shift: function ( a ) { return a.shift() ; },
            slice: function ( a, b, c ) { return a.slice( b, c ) ; },
            splice: function ( a ) { return a.splice.apply( this, arguments ) ; },
            sort: function ( a, b ) { return a.sort( b ) ; },

            range: _.range,
            toObject: _.object,
            zip: _.zip,
            indexOf: _.indexOf,
            lastIndexOf: _.lastIndexOf,

            first: _.first,
            last: _.last,
            initial: _.initial,
            rest: _.rest,
            compact: _.compact,
            flatten: _.flatten,
            without: _.without,
            union: _.union,
            intersection: _.intersection,
            difference: _.difference,
            unique: _.unique,
            sortedIndex: _.sortedIndex,

            average: function ( arr ) {
                return _.reduce( arr, function ( memo, num ) {
                    return memo + num ;
                }, 0 ) / arr.length ; /* Calculate average of numbers in an array. */
            }
        }
    }) ;

    type.extend({
        name:'args', /* Arguments object type */
        a: ( function ( ) { return arguments ; } )(), /* Archetype value (an empty arguments object) */
        inherits: 'arr', /* Inherits from array type (as it's array-like) */
        is: function ( v ) {
            return ( v != null ) // since undefined == null, check for not null
                && ( ( Object.prototype.toString.call( v ) == '[object Arguments]' )
                || ( !! v.callee ) ) ; // fixes for ie8 non-strict-mode
        },
        can: function ( v ) { return type.args.is( v ) || type.arr( v ) ; }, /* Can be converted to arguments or array. */
        to: function ( ) { return arguments ; }, /* Converts to an arguments object. */
        methods: {
            toArray: function ( a ) { return Array.prototype.slice.call( a ) ; }, /* Converts arguments to a true array. */
            sub: function ( a, b ) { return type.arr.to( a ).slice( ( b || 1 ), a.length ) ; }, /* Sub-array from arguments. */
            pre: function ( a, b ) { return type.arr.to( a ).unshift( b ) ; } /* Prepend to arguments (as an array). */
        }
    }) ;

    type.extend({
        name:'obj', /* Object type (plain JavaScript object) */
        a: {}, /* Archetype value for object */
        inherits: "col", /* Inherits from collection type */
        is: function ( v ) { return _.isObject( v ) && ! type.arr( v ) ; }, /* Checks if value is an object but not an array. */
        to: function ( v, w ) {
            if ( type.obj( v ) ) { return v ; } /* Already an object, return as is. */
            if ( type.arr( v ) ) { return ( type.arr( w ) ) ? _.object( v, w ) : _.extend( {}, v ) ; } ; /* Array to object. */
            if ( type.fn( v ) ) { if ( type.obj( v() ) ) { return v() ; } ; } ; /* If function returns an object. */
            if ( type.def( v ) ) { return { a: value( v ) } ; } ; /* Wrap defined value in an object. */
            return false ; /* Failed to convert to object. */
        },
        can: can( "obj" ), /* Can be converted to an object? */

        methods: { /* Object utility methods */
            extend: _.extend,
            clone: _.clone,