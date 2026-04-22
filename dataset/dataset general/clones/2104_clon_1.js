/*
 * This is a Type I clone generated from the original JavaScript source.
 * It maintains identical functionality and structure.
 * Changes are limited to whitespace modifications and comment additions/removals.
 * Original author and license information (if any) are preserved implicitly.
 */
"use strict" ;

( function ( ) { // Start of self-executing anonymous function to encapsulate the code.

    Error . stackTraceLimit = -1 ; // Disable stack trace limit for better performance or specific error handling.

    var $global ; // Declare a variable to hold the global object reference.

    // Determine the global object based on the current JavaScript environment.
    if  ( typeof window !== "undefined" )   {
        /* This branch handles a web browser environment. */
        $global = window ; // In a browser, 'window' is the global object.
    }
    else if ( typeof self   !==   "undefined" ) { // Check for Web Worker environment.
        $global = self ; // In a web worker, 'self' is the global object.
    }
    else if ( typeof global !== "undefined" ) { /* Node.js environment detection. */
        $global = global ; // In Node.js, 'global' is the global object.
        $global . require = require ; // Make 'require' available globally in Node.js context.
    }
    else {
        // Fallback warning if no known global object is found.
        console . log ( "warning: no global object found" )
    }


    var $idCounter = 0 ; // Counter for generating unique IDs, especially for NaN keys.
    var $keys = function ( m ) { // Helper function to get object keys safely.
        // If 'm' is truthy, return its keys; otherwise, return an empty array.
        return m ? Object.keys ( m ) : [ ] ;
    } ;
    var $min = Math . min ; // Shorthand for Math.min.
    var $parseInt = parseInt ; // Shorthand for the global parseInt function.
    var $parseFloat = function ( f ) { // Custom parseFloat to handle Number constructor.
        if ( f . constructor === Number ) {
            return f ; // If already a Number, return as is.
        }
        return parseFloat ( f ) ; // Otherwise, parse as a float.
    } ;
    var $mod = function ( x , y ) { return x % y ; } ; // Modulo operator function.
    var $toString = String ; // Shorthand for the String constructor.
    var $reflect , $newStringPtr ; // Declarations for reflection-related variables.
    var $Array = Array ; // Shorthand for the Array constructor.


    var $floatKey = function ( f ) { // Generates a unique key for float values, handling NaN.
        if ( f !== f ) { // Check for NaN (NaN is the only value not equal to itself).
            $idCounter ++ ; // Increment counter for unique NaN ID.
            return "NaN$" + $idCounter ; // Return a unique string for NaN.
        }
        return String ( f ) ; // For other floats, convert to string.
    } ;


    var $mapArray = function ( array , f ) { // Maps a function over an array, preserving constructor.
        var newArray = new array . constructor ( array . length ) , i ; // Create a new array of the same type and length.
        for ( i = 0 ; i < array . length ; i ++ ) { // Iterate through the original array.
            newArray [ i ] = f ( array [ i ] ) ; // Apply the function 'f' to each element.
        }
        return newArray ; // Return the new array with mapped values.
    } ;

    // Main function for creating new Go-like types in JavaScript.
    var $newType = function ( size , kind , string , name , pkgPath , constructor ) {

        var typ ; // Variable to hold the new type definition.

        // First switch block: Defines the constructor and $key method based on the 'kind' of type.
        switch ( kind ) {

            case "Bool" :
            case "Int" :
            case "Int8" :
            case "Int16" :
            case "Int32" :
            case "Uint" :
            case "Uint8" :
            case "Uint16" :
            case "Uint32" :
            case "Uintptr" :
            case "String" :
            case "UnsafePointer" :
                typ = function ( v ) { this . $val = v ; } ; // Simple value wrapper.
                typ . prototype . $key = function ( ) { return string + "$" + this . $val ; } ; // Key generation.
                break ;

            case "Float32" :
            case "Float64" :
                typ = function ( v ) { this . $val = v ; } ; // Float value wrapper.
                typ . prototype . $key = function ( ) { return string + "$" + $floatKey ( this . $val ) ; } ; // Uses $floatKey.
                break ;

            case "Int64" :
                typ = function ( high , low ) { // Constructor for 64-bit integers.
                    this . high = ( high + Math . floor ( Math . ceil ( low ) / 4294967296 ) ) >> 0 ; // High part.
                    this . low = low >>> 0 ; // Low part (unsigned).
                    this . $val = this ; // Self-reference for value.
                } ;
                typ . prototype . $key = function ( ) { return string + "$" + this . high + "$" + this . low ; } ;
                break ;

            case "Uint64" :
                typ = function ( high , low ) { // Constructor for unsigned 64-bit integers.
                    this . high = ( high + Math . floor ( Math . ceil ( low ) / 4294967296 ) ) >>> 0 ; // High part (unsigned).
                    this . low = low >>> 0 ; // Low part (unsigned).
                    this . $val = this ; // Self-reference for value.
                } ;
                typ . prototype . $key = function ( ) { return string + "$" + this . high + "$" + this . low ; } ;
                break ;

            case "Complex64" :
            case "Complex128" :
                typ = function ( real , imag ) { // Constructor for complex numbers.
                    this . real = real ;
                    this . imag = imag ;
                    this . $val = this ; // Self-reference for value.
                } ;
                typ . prototype . $key = function ( ) { return string + "$" + this . real + "$" + this . imag ; } ;
                break ;

            case "Array" :
                typ = function ( v ) { this . $val = v ; } ; // Array type wrapper.
                typ . Ptr = $newType ( 4 , "Ptr" , "*" + string , "" , "" , function ( array ) { // Pointer type for array.
                    this . $get = function ( ) { return array ; } ;
                    this . $val = array ;
                } ) ;
                typ . init = function ( elem , len ) { // Initialization for array type.
                    typ . elem = elem ; // Element type.
                    typ . len = len ; // Array length.
                    typ . prototype . $key = function ( ) { // Key generation for arrays.
                        return string + "$" + Array . prototype . join . call ( $mapArray ( this . $val , function ( e ) {
                            var key = e . $key ? e . $key ( ) : String ( e ) ; // Get key or string representation.
                            return key . replace ( /\\/g , "\\\\" ) . replace ( /\$/g , "\\$" ) ; // Escape special characters.
                        } ) , "$" ) ;
                    } ;
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        rt . arrayType = new $reflect . arrayType . Ptr ( rt , elem . reflectType ( ) , undefined , len ) ;
                    } ;
                    typ . Ptr . init ( typ ) ; // Initialize the pointer type.
                } ;
                break ;

            case "Chan" :
                typ = function ( ) { this . $val = this ; } ; // Channel type constructor.
                typ . prototype . $key = function ( ) { // Key generation for channels.
                    if ( this . $id === undefined ) {
                        $idCounter ++ ;
                        this . $id = $idCounter ;
                    }
                    return String ( this . $id ) ;
                } ;
                typ . init = function ( elem , sendOnly , recvOnly ) { // Initialization for channel type.
                    typ . nil = new typ ( ) ; // Nil channel instance.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        rt . chanType = new $reflect . chanType . Ptr ( rt , elem . reflectType ( ) , sendOnly ? $reflect . SendDir : ( recvOnly ? $reflect . RecvDir : $reflect . BothDir ) ) ;
                    } ;
                } ;
                break ;

            case "Func" :
                typ = function ( v ) { this . $val = v ; } ; // Function type wrapper.
                typ . init = function ( params , results , variadic ) { // Initialization for function type.
                    typ . params = params ; // Parameter types.
                    typ . results = results ; // Result types.
                    typ . variadic = variadic ; // Whether it's a variadic function.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        var typeSlice = ( $sliceType ( $ptrType ( $reflect . rtype . Ptr ) ) ) ;
                        rt . funcType = new $reflect . funcType . Ptr ( rt , variadic , new typeSlice ( $mapArray ( params , function ( p ) { return p . reflectType ( ) ; } ) ) , new typeSlice ( $mapArray ( results , function ( p ) { return p . reflectType ( ) ; } ) ) ) ;
                    } ;
                } ;
                break ;

            case "Interface" :
                typ = { implementedBy : [ ] } ; // Interface type structure.
                typ . init = function ( methods ) { // Initialization for interface type.
                    typ . methods = methods ; // Methods defined by the interface.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        var imethods = $mapArray ( methods , function ( m ) {
                            return new $reflect . imethod . Ptr ( $newStringPtr ( m [ 1 ] ) , $newStringPtr ( m [ 2 ] ) , $funcType ( m [ 3 ] , m [ 4 ] , m [ 5 ] ) . reflectType ( ) ) ;
                        } ) ;
                        var methodSlice = ( $sliceType ( $ptrType ( $reflect . imethod . Ptr ) ) ) ;
                        rt . interfaceType = new $reflect . interfaceType . Ptr ( rt , new methodSlice ( imethods ) ) ;
                    } ;
                } ;
                break ;

            case "Map" :
                typ = function ( v ) { this . $val = v ; } ; // Map type wrapper.
                typ . init = function ( key , elem ) { // Initialization for map type.
                    typ . key = key ; // Key type.
                    typ . elem = elem ; // Element type.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        rt . mapType = new $reflect . mapType . Ptr ( rt , key . reflectType ( ) , elem . reflectType ( ) , undefined , undefined ) ;
                    } ;
                } ;
                break ;

            case "Ptr" :
                typ = constructor || function ( getter , setter , target ) { // Pointer type constructor.
                    this . $get = getter ; // Getter function.
                    this . $set = setter ; // Setter function.
                    this . $target = target ; // Target object.
                    this . $val = this ; // Self-reference for value.
                } ;
                typ . prototype . $key = function ( ) { // Key generation for pointers.
                    if ( this . $id === undefined ) {
                        $idCounter ++ ;
                        this . $id = $idCounter ;
                    }
                    return String ( this . $id ) ;
                } ;
                typ . init = function ( elem ) { // Initialization for pointer type.
                    typ . nil = new typ ( $throwNilPointerError , $throwNilPointerError ) ; // Nil pointer instance.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        rt . ptrType = new $reflect . ptrType . Ptr ( rt , elem . reflectType ( ) ) ;
                    } ;
                } ;
                break ;

            case "Slice" :
                var nativeArray ; // Variable to hold the underlying native array constructor.
                typ = function ( array ) { // Slice type constructor.
                    if ( array . constructor !== nativeArray ) {
                        array = new nativeArray ( array ) ; // Convert to native array type if necessary.
                    }
                    this . array = array ; // Underlying array.
                    this . offset = 0 ; // Slice offset.
                    this . length = array . length ; // Slice length.
                    this . capacity = array . length ; // Slice capacity.
                    this . $val = this ; // Self-reference for value.
                } ;
                typ . make = function ( length , capacity , zero ) { // Factory function to create new slices.
                    capacity = capacity || length ; // Default capacity to length.
                    var array = new nativeArray ( capacity ) , i ; // Create native array.
                    for ( i = 0 ; i < capacity ; i ++ ) {
                        array [ i ] = zero ( ) ; // Initialize elements with zero value.
                    }
                    var slice = new typ ( array ) ; // Create slice instance.
                    slice . length = length ; // Set slice length.
                    return slice ;
                } ;
                typ . init = function ( elem ) { // Initialization for slice type.
                    typ . elem = elem ; // Element type.
                    nativeArray = $nativeArray ( elem . kind ) ; // Determine native array type.
                    typ . nil = new typ ( [ ] ) ; // Nil slice instance.
                    typ . extendReflectType = function ( rt ) { // Reflection type extension.
                        rt . sliceType = new $reflect . sliceType . Ptr ( rt , elem . reflectType ( ) ) ;
                    } ;
                } ;
                break ;

            case "Struct" :
                typ = function ( v ) { this . $val = v ; } ; // Struct type wrapper.
                typ . Ptr = $newType ( 4 , "Ptr" , "*" + string , "" , "" , constructor ) ; // Pointer type for struct.
                typ . Ptr . Struct = typ ; // Link back to the struct type.
                typ . init = function ( fields ) { // Initialization for struct type.
                    var i ;
                    typ . fields = fields ; // Struct fields definition.
                    typ . Ptr . extendReflectType = function ( rt ) { // Reflection type extension for struct pointers.
                        rt . ptrType = new $reflect . ptrType . Ptr ( rt , typ . reflectType ( ) ) ;
                    } ;
                    /* nil value for struct pointers */
                    typ . Ptr . nil = Object . create ( constructor . prototype ) ;
                    typ . Ptr . nil . $val = typ . Ptr . nil ;
                    for ( i = 0 ; i < fields . length ; i ++ ) {
                        var field = fields [ i ] ;
                        Object . defineProperty ( typ . Ptr . nil , field [ 0 ] , { get : $throwNilPointerError , set : $throwNilPointerError } ) ;
                    }
                    /* methods for embedded fields */
                    for ( i = 0 ; i < typ . methods . length ; i ++ ) {
                        var method = typ . methods [ i ] ;
                        if ( method [ 6 ] != -1 ) {
                            ( function ( field , methodName ) {
                                typ . prototype [ methodName ] = function ( ) {
                                    var v = this . $val [ field [ 0 ] ] ;
                                    return v [ methodName ] . apply ( v , arguments ) ;
                                } ;
                            } ) ( fields [ method [ 6 ] ] , method [ 0 ] ) ;
                        }
                    }
                    for ( i = 0 ; i < typ . Ptr . methods . length ; i ++ ) {
                        var method = typ . Ptr . methods [ i ] ;
                        if ( method [ 6 ] != -1 ) {
                            ( function ( field , methodName ) {
                                typ . Ptr . prototype [ methodName ] = function ( ) {
                                    var v = this [ field [ 0 ] ] ;
                                    if ( v . $val === undefined ) {
                                        v = new field [ 3 ] ( v ) ;
                                    }
                                    return v [ methodName ] . apply ( v , arguments ) ;
                                } ;
                            } ) ( fields [ method [ 6 ] ] , method [ 0 ] ) ;
                        }
                    }
                    /* map key generation for structs */
                    typ . prototype . $key = function ( ) {
                        var keys = new Array ( fields . length ) ;
                        for ( i = 0 ; i < fields . length ; i ++ ) {
                            var v = this . $val [ fields [ i ] [ 0 ] ] ;
                            var key = v . $key ? v . $key ( ) : String ( v ) ;
                            keys [ i ] = key . replace ( /\\/g , "\\\\" ) . replace ( /\$/g , "\\$" ) ;
                        }
                        return string + "$" + keys . join ( "$" ) ;
                    } ;
                    /* reflect type definition for structs */
                    typ . extendReflectType = function ( rt ) {
                        var reflectFields = new Array ( fields . length ) , i ;
                        for ( i = 0 ; i < fields . length ; i ++ ) {
                            var field = fields [ i ] ;
                            reflectFields [ i ] = new $reflect . structField . Ptr ( $newStringPtr ( field [ 1 ] ) , $newStringPtr ( field [ 2 ] ) , field [ 3 ] . reflectType ( ) , $newStringPtr ( field [ 4 ] ) , i ) ;
                        }
                        rt . structType = new $reflect . structType . Ptr ( rt , new ( $sliceType ( $reflect . structField . Ptr ) ) ( reflectFields ) ) ;
                    } ;
                } ;
                break ;

            default :
                throw $panic ( new $String ( "invalid kind: " + kind ) ) ; // Handle unknown kinds.
        }

        // Second switch block: Defines the 'zero' method for each type, returning its zero value.
        switch ( kind ) {

            case "Bool" :
            case "Map" :
                typ . zero = function ( ) { return false ; } ; // Boolean and Map zero value is false.
                break ;

            case "Int" :
            case "Int8" :
            case "Int16" :
            case "Int32" :
            case "Uint" :
            case "Uint8" :
            case "Uint16" :
            case "Uint32" :
            case "Uintptr" :
            case "UnsafePointer" :
            case "Float32" :
            case "Float64" :
                typ . zero = function ( ) { return 0 ; } ; // Numeric types zero value is 0.
                break ;

            case "String" :
                typ . zero = function ( ) { return "" ; } ; // String zero value is an empty string.
                break ;

            case "Int64" :
            case "Uint64" :
            case "Complex64" :
            case "Complex128" :
                var zero = new typ ( 0 , 0 ) ; // Create a zero instance for complex/64-bit types.
                typ . zero = function ( ) { return zero ; } ;
                break ;

            case "Chan" :
            case "Ptr" :
            case "Slice" :
                typ . zero = function ( ) { return typ . nil ; } ; // Channel, Pointer, Slice zero value is their nil instance.
                break ;

            case "Func" :
                typ . zero = function ( ) { return $throwNilPointerError ; } ; // Function zero value throws a nil pointer error.
                break ;

            case "Interface" :
                typ . zero = function ( ) { return null ; } ; // Interface zero value is null.
                break ;

            case "Array" :
                typ . zero = function ( ) { // Array zero value involves creating a new array.
                    var arrayClass = $nativeArray ( typ . elem . kind ) ;
                    if ( arrayClass !== Array ) {
                        return new arrayClass ( typ . len ) ; // Use typed array if applicable.
                    }
                    var array = new Array ( typ . len ) , i ;
                    for ( i = 0 ; i < typ . len ; i ++ ) {
                        array [ i ] = typ . elem . zero ( ) ; // Initialize elements with their zero values.
                    }
                    return array ;
                } ;
                break ;

            case "Struct" :
                typ . zero = function ( ) { return new typ . Ptr ( ) ; } ; // Struct zero value is a new instance of its pointer type.
                break ;

            default :
                throw $panic ( new $String ( "invalid kind: " + kind ) ) ; // Handle unknown kinds again.
        }

        typ . kind = kind ; // Assign kind property.
        typ . string = string ; // Assign string representation.
        typ . typeName = name ; // Assign type name.
        typ . pkgPath = pkgPath ; // Assign package path.
        typ . methods = [ ] ; // Initialize methods array.
        var rt = null ; // Reflection type cache.

        typ . reflectType = function ( ) { // Method to get the reflection type.
            if ( rt === null ) { // If not yet cached.
                rt = new $reflect . rtype . Ptr ( size , 0 , 0 , 0 , 0 , $reflect . kinds [ kind ] , undefined , undefined , $newStringPtr ( string ) , undefined , undefined ) ;
                rt . jsType = typ ; // Link back to the JavaScript type.

                var methods = [ ] ;
                if ( typ . methods !== undefined ) {
                    var i ;
                    for ( i = 0 ; i < typ . methods . length ; i ++ ) {
                        var m = typ . methods [ i ] ;
                        methods . push ( new $reflect . method . Ptr ( $newStringPtr ( m [ 1 ] ) , $newStringPtr ( m [ 2 ] ) , $funcType ( m [ 3 ] , m [ 4 ] , m [ 5 ] ) . reflectType ( ) , $funcType ( [ typ ] . concat ( m [ 3 ] ) , m [ 4 ] , m [ 5 ] ) . reflectType ( ) , undefined , undefined ) ) ;
                    }
                }
                if ( name !== "" || methods . length !== 0 ) {
                    var methodSlice = ( $sliceType ( $ptrType ( $reflect . method . Ptr ) ) ) ;
                    rt . uncommonType = new $reflect . uncommonType . Ptr ( $newStringPtr ( name ) , $newStringPtr ( pkgPath ) , new methodSlice ( methods ) ) ;
                    rt . uncommonType . jsType = typ ;
                }

                if ( typ . extendReflectType !== undefined ) {
                    typ . extendReflectType ( rt ) ; // Call extension function if available.
                }
            }
            return rt ; // Return the cached reflection type.
        } ;
        return typ ; // Return the newly created type.
    } ;


    // Basic Go types defined using the $newType factory function.
    var $Bool = $newType ( 1 , "Bool" , "bool" , "bool" , "" , null ) ;
    var $Int = $newType ( 4 , "Int" , "int" , "int" , "" , null ) ;
    var $Int8 = $newType ( 1 , "Int8" , "int8" , "int8" , "" , null ) ;
    var $Int16 = $newType ( 2 , "Int16" , "int16" , "int16" , "" , null ) ;
    var $Int32 = $newType ( 4 , "Int32" , "int32" , "int32" , "" , null ) ;
    var $Int64 = $newType ( 8 , "Int64" , "int64" , "int64" , "" , null ) ;
    var $Uint = $newType ( 4 , "Uint" , "uint" , "uint" , "" , null ) ;
    var $Uint8 = $newType ( 1 , "Uint8" , "uint8" , "uint8" , "" , null ) ;
    var $Uint16 = $newType ( 2 , "Uint16" , "uint16" , "uint16" , "" , null ) ;
    var $Uint32 = $newType ( 4 , "Uint32" , "uint32" , "uint32" , "" , null ) ;
    var $Uint64 = $newType ( 8 , "Uint64" , "uint64" , "uint64" , "" , null ) ;
    var $Uintptr = $newType ( 4 , "Uintptr" , "uintptr" , "uintptr" , "" , null ) ;
    var $Float32 = $newType ( 4 , "Float32" , "float32" , "float32" , "" , null ) ;
    var $Float64 = $newType ( 8 , "Float64" , "float64" , "float64" , "" , null ) ;
    var $Complex64 = $newType ( 8 , "Complex64" , "complex64" , "complex64" , "" , null ) ;
    var $Complex128 = $newType ( 16 , "Complex128" , "complex128" , "complex128" , "" , null ) ;
    var $String = $newType ( 8 , "String" , "string" , "string" , "" , null ) ;
    var $UnsafePointer = $newType ( 4 , "UnsafePointer" , "unsafe.Pointer" , "Pointer" , "" , null ) ;


    // Helper to get the appropriate JavaScript typed array constructor based on element kind.
    var $nativeArray = function ( elemKind ) {
        return ( { Int : Int32Array , Int8 : Int8Array , Int16 : Int16Array , Int32 : Int32Array , Uint : Uint32Array , Uint8 : Uint8Array , Uint16 : Uint16Array , Uint32 : Uint32Array , Uintptr : Uint32Array , Float32 : Float32Array , Float64 : Float64Array } ) [ elemKind ] || Array ;
    } ;
    var $toNativeArray = function ( elemKind , array ) { // Converts a generic array to a native typed array if possible.
        var nativeArray = $nativeArray ( elemKind ) ;
        if ( nativeArray === Array ) {
            return array ; // If it's just a regular array, return as is.
        }
        return new nativeArray ( array ) ; // Otherwise, convert to the specific typed array.
    } ;
    var $arrayTypes = { } ; // Cache for array types.
    var $arrayType = function ( elem , len ) { // Factory function for array types.
        var string = "[" + len + "]" + elem . string ;
        var typ = $arrayTypes [ string ] ;
        if ( typ === undefined ) {
            typ = $newType ( 12 , "Array" , string , "" , "" , null ) ;
            typ . init ( elem , len ) ;
            $arrayTypes [ string ] = typ ; // Cache the new type.
        }
        return typ ;
    } ;

    var $chanType = function ( elem , sendOnly , recvOnly ) { // Factory function for channel types.
        var string = ( recvOnly ? "<-" : "" ) + "chan" + ( sendOnly ? "<- " : " " ) + elem . string ;
        var field = sendOnly ? "SendChan" : ( recvOnly ? "RecvChan" : "Chan" ) ;
        var typ = elem [ field ] ;
        if ( typ === undefined ) {
            typ = $newType ( 4 , "Chan" , string , "" , "" , null ) ;
            typ . init ( elem , sendOnly , recvOnly ) ;
            elem [ field ] = typ ; // Cache the new type on the element type.
        }
        return typ ;
    } ;

    var $funcSig = function ( params , results , variadic ) { // Generates a string representation of a function signature.
        var paramTypes = $mapArray ( params , function ( p ) { return p . string ; } ) ;
        if ( variadic ) {
            paramTypes [ paramTypes . length - 1 ] = "..." + paramTypes [ paramTypes . length - 1 ] . substr ( 2 ) ;
        }
        var string = "(" + paramTypes . join ( ", " ) + ")" ;
        if ( results . length === 1 ) {
            string += " " + results [ 0 ] . string ;
        }
        else if ( results . length > 1 ) {
            string += " (" + $mapArray ( results , function ( r ) { return r . string ; } ) . join ( ", " ) + ")" ;
        }
        return string ;
    } ;

    var $funcTypes = { } ; // Cache for function types.
    var $funcType = function ( params , results , variadic ) { // Factory function for function types.
        var string = "func" + $funcSig ( params , results , variadic ) ;
        var typ = $funcTypes [ string ] ;
        if ( typ === undefined ) {
            typ = $newType ( 4 , "Func" , string , "" , "" , null ) ;
            typ . init ( params , results , variadic ) ;
            $funcTypes [ string ] = typ ; // Cache the new type.
        }
        return typ ;
    } ;

    var $interfaceTypes = { } ; // Cache for interface types.
    var $interfaceType = function ( methods ) { // Factory function for interface types.
        var string = "interface {}" ;
        if ( methods . length !== 0 ) {
            string = "interface { " + $mapArray ( methods , function ( m ) {
                return ( m [ 2 ] !== "" ? m [ 2 ] + "." : "" ) + m [ 1 ] + $funcSig ( m [ 3 ] , m [ 4 ] , m [ 5 ] ) ;
            } ) . join ( "; " ) + " }" ;
        }
        var typ = $interfaceTypes [ string ] ;
        if ( typ === undefined ) {
            typ = $newType ( 8 , "Interface" , string , "" , "" , null ) ;
            typ . init ( methods ) ;
            $interfaceTypes [ string ] = typ ; // Cache the new type.
        }
        return typ ;
    } ;
    var $emptyInterface = $interfaceType ( [ ] ) ; // Define the empty interface type.

} ) ( ) ; // End of IIFE.