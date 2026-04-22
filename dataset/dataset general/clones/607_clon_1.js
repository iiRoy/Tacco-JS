/*
 * This file contains a Type I code clone of another JavaScript module.
 * The purpose is to demonstrate variations in whitespace and comments
 * while maintaining exact logical and structural equivalence.
 *
 * All variable names, function names, operators, and expressions
 * are preserved precisely as they were in the original source.
 */


// Begin initialization of the 'Module' object.
// This block attempts to assign an existing 'Module' object,
// or creates a new empty object if 'Module' is not defined.
try
{

    this[ "Module" ] = Module; /* Assigning existing Module to global context */

}
catch ( e )
{
    // If an error occurs (e.g., Module is not defined), create a new one.
    this[ "Module" ] = Module = {}; // Initialize Module as an empty object
}


/*
 * Environment detection variables.
 * These variables help determine the current JavaScript execution context
 * (Node.js, Web browser, Web Worker, or Shell).
 */

var ENVIRONMENT_IS_NODE = typeof process === "object"; // Check for Node.js environment


var ENVIRONMENT_IS_WEB = typeof window === "object"; // Check for Web browser environment


var ENVIRONMENT_IS_WORKER = typeof importScripts === "function"; // Check for Web Worker environment


// Determine if the environment is a shell (neither web, node, nor worker).
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;


// Conditional setup based on the detected environment.

if ( ENVIRONMENT_IS_NODE )
{
    // Node.js specific configurations
    Module[ "print" ] = ( function ( x )
    {
        /*
         * Redirects standard output to process.stdout.
         * Appends a newline character for proper console display.
         */
        process[ "stdout" ].write( x + "\n" );
    } );


    Module[ "printErr" ] = ( function ( x )
    {
        /*
         * Redirects standard error to process.stderr.
         * Also appends a newline character.
         */
        process[ "stderr" ].write( x + "\n" );
    } );


    // Require Node's file system and path modules.
    var nodeFS = require( "fs" );
    var nodePath = require( "path" );


    Module[ "read" ] = ( function ( filename )
    {
        // Normalize the filename path.
        filename = nodePath[ "normalize" ]( filename );

        // Attempt to read the file synchronously.
        var ret = nodeFS[ "readFileSync" ]( filename ).toString();

        /*
         * If the file is not found and the path is not absolute,
         * try resolving it relative to the script's directory.
         */
        if ( !ret && filename != nodePath[ "resolve" ]( filename ) )
        {
            filename = path.join( __dirname, "..", "src", filename );
            ret = nodeFS[ "readFileSync" ]( filename ).toString();
        }
        return ret; // Return the file content as a string.
    } );


    Module[ "load" ] = ( function ( f )
    {
        // Load and execute a script using globalEval.
        globalEval( read( f ) );
    } );


    // Set Module arguments from process arguments if not already defined.
    if ( !Module[ "arguments" ] )
    {
        Module[ "arguments" ] = process[ "argv" ].slice( 2 ); // Exclude 'node' and script path.
    }
}
else if ( ENVIRONMENT_IS_SHELL )
{
    // Shell environment (e.g., SpiderMonkey, Rhino) configurations
    Module[ "print" ] = print;
    Module[ "printErr" ] = printErr;


    // Assign the 'read' function if available, otherwise define a fallback using 'snarf'.
    if ( typeof read != "undefined" )
    {
        Module[ "read" ] = read;
    }
    else
    {
        Module[ "read" ] = ( function ( f )
        {
            snarf( f ); // 'snarf' is a common shell-specific function to read file content.
        } );
    }


    // Set Module arguments based on shell-specific global variables.
    if ( !Module[ "arguments" ] )
    {
        if ( typeof scriptArgs != "undefined" )
        {
            Module[ "arguments" ] = scriptArgs;
        }
        else if ( typeof arguments != "undefined" )
        {
            Module[ "arguments" ] = arguments;
        }
    }
}
else if ( ENVIRONMENT_IS_WEB )
{
    // Web browser specific configurations
    if ( !Module[ "print" ] )
    {
        Module[ "print" ] = ( function ( x )
        {
            console.log( x ); // Use console.log for print in browsers.
        } );
    }


    if ( !Module[ "printErr" ] )
    {
        Module[ "printErr" ] = ( function ( x )
        {
            console.log( x ); // Use console.log for printErr in browsers.
        } );
    }


    Module[ "read" ] = ( function ( url )
    {
        // Synchronously read a file (or URL) using XMLHttpRequest.
        var xhr = new XMLHttpRequest;
        xhr.open( "GET", url, false ); // 'false' makes the request synchronous.
        xhr.send( null );
        return xhr.responseText; // Return the response text.
    } );


    // Set Module arguments from browser's 'arguments' if available.
    if ( !Module[ "arguments" ] )
    {
        if ( typeof arguments != "undefined" )
        {
            Module[ "arguments" ] = arguments;
        }
    }
}
else if ( ENVIRONMENT_IS_WORKER )
{
    // Web Worker specific configurations
    Module[ "load" ] = importScripts; // In workers, importScripts loads scripts.
}
else
{
    // If no known environment is detected, throw an error.
    throw "Unknown runtime environment. Where are we?";
}


/*
 * Helper function to execute arbitrary JavaScript code in the global scope.
 * This is typically used for loading external scripts.
 */
function globalEval( x )
{
    eval.call( null, x ); // Execute the provided string 'x' as code.
}


// Fallback for Module.load if it's not defined or is 'undefined' string and Module.read exists.
if ( !Module[ "load" ] == "undefined" && Module[ "read" ] )
{
    Module[ "load" ] = ( function ( f )
    {
        globalEval( Module[ "read" ]( f ) ); // Load and evaluate script content.
    } );
}


// Ensure Module.printErr is defined, defaulting to an empty function if not.
if ( !Module[ "printErr" ] )
{
    Module[ "printErr" ] = ( function ( ) { } ); // Placeholder for error printing.
}


// If Module.print is not defined, default it to Module.printErr.
if ( !Module[ "print" ] )
{
    Module[ "print" ] = Module[ "printErr" ];
}


// Initialize Module.arguments as an empty array if it's not already set.
if ( !Module[ "arguments" ] )
{
    Module[ "arguments" ] = [ ];
}


// Create aliases for Module.print and Module.printErr for easier access.
Module.print = Module[ "print" ];


Module.printErr = Module[ "printErr" ];


/*
 * The Runtime object encapsulates various low-level utility functions
 * for memory management, type handling, and data manipulation.
 */
var Runtime =
{
    // Saves the current stack pointer.
    stackSave: ( function ( )
    {
        return STACKTOP;
    } ),


    // Restores the stack pointer to a previous state.
    stackRestore: ( function ( stackTop )
    {
        STACKTOP = stackTop;
    } ),


    /*
     * Forces alignment of a target value to a specified quantum.
     * Quantum defaults to 4.
     */
    forceAlign: ( function ( target, quantum )
    {
        quantum = quantum || 4; // Default quantum to 4 if not provided.

        if ( quantum == 1 )
        {
            return target; // No alignment needed for quantum of 1.
        }

        if ( isNumber( target ) && isNumber( quantum ) )
        {
            return Math.ceil( target / quantum ) * quantum; // Numeric alignment.
        }
        else if ( isNumber( quantum ) && isPowerOfTwo( quantum ) )
        {
            var logg = log2( quantum ); // Calculate log base 2 for bitwise operations.
            // Return a string representation for bitwise alignment.
            return "((((" + target + ")+" + ( quantum - 1 ) + ")>>" + logg + ")<<" + logg + ")";
        }

        // Default to a string representation of Math.ceil for non-bitwise alignment.
        return "Math.ceil((" + target + ")/" + quantum + ")*" + quantum;
    } ),


    // Checks if a given type string represents a number type.
    isNumberType: ( function ( type )
    {
        return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
    } ),


    // Checks if a given type string represents a pointer type.
    isPointerType: function isPointerType( type )
    {
        return type[ type.length - 1 ] == "*"; // Pointer types end with an asterisk.
    },


    // Checks if a given type string represents a struct type.
    isStructType: function isStructType( type )
    {
        if ( isPointerType( type ) )
        {
            return false; // Pointers are not structs themselves.
        }

        // Check for array-like struct syntax (e.g., [N x type]).
        if ( /^\[\d+\ x\ (.*)\]/.test( type ) )
        {
            return true;
        }

        // Check for struct-like syntax (e.g., { ... }).
        if ( /<?{ ?[^}]* ?}>?/.test( type ) )
        {
            return true;
        }

        return type[ 0 ] == "%"; // LLVM IR struct types often start with '%'.
    },


    // Set of integer types recognized by the runtime.
    INT_TYPES:
    {
        "i1": 0,
        "i8": 0,
        "i16": 0,
        "i32": 0,
        "i64": 0
    },


    // Set of floating-point types recognized by the runtime.
    FLOAT_TYPES:
    {
        "float": 0,
        "double": 0
    },


    /*
     * Performs 64-bit bitshift operations on two 32-bit integers (low and high parts).
     * `op` can be "shl" (shift left), "ashr" (arithmetic shift right), or "lshr" (logical shift right).
     */
    bitshift64: ( function ( low, high, op, bits )
    {
        var ander = Math.pow( 2, bits ) - 1; // Mask for bitwise operations.

        if ( bits < 32 )
        {
            switch ( op )
            {
                case "shl": // Shift left
                    return [ low << bits, high << bits | ( low & ander << 32 - bits ) >>> 32 - bits ];
                case "ashr": // Arithmetic shift right
                    return [ ( low >>> bits | ( high & ander ) << 32 - bits ) >> 0 >>> 0, high >> bits >>> 0 ];
                case "lshr": // Logical shift right
                    return [ ( low >>> bits | ( high & ander ) << 32 - bits ) >>> 0, high >>> bits ];
            }
        }
        else if ( bits == 32 )
        {
            switch ( op )
            {
                case "shl": // Shift left by 32
                    return [ 0, low ];
                case "ashr": // Arithmetic shift right by 32
                    return [ high, ( high | 0 ) < 0 ? ander : 0 ];
                case "lshr": // Logical shift right by 32
                    return [ high, 0 ];
            }
        }
        else // bits > 32
        {
            switch ( op )
            {
                case "shl": // Shift left by more than 32
                    return [ 0, low << bits - 32 ];
                case "ashr": // Arithmetic shift right by more than 32
                    return [ high >> bits - 32 >>> 0, ( high | 0 ) < 0 ? ander : 0 ];
                case "lshr": // Logical shift right by more than 32
                    return [ high >>> bits - 32, 0 ];
            }
        }
        // If an unknown operation is encountered, abort execution.
        abort( "unknown bitshift64 op: " + [ value, op, bits ] );
    } ),


    // Performs a 64-bit bitwise OR operation.
    or64: ( function ( x, y )
    {
        var l = x | 0 | ( y | 0 ); // OR operation on the low 32 bits.
        var h = ( Math.round( x / 4294967296 ) | Math.round( y / 4294967296 ) ) * 4294967296; // OR on high bits, scaled.
        return l + h; // Combine low and high parts.
    } ),


    // Performs a 64-bit bitwise AND operation.
    and64: ( function ( x, y )
    {
        var l = ( x | 0 ) & ( y | 0 ); // AND operation on the low 32 bits.
        var h = ( Math.round( x / 4294967296 ) & Math.round( y / 4294967296 ) ) * 4294967296; // AND on high bits, scaled.
        return l + h; // Combine low and high parts.
    } ),


    // Performs a 64-bit bitwise XOR operation.
    xor64: ( function ( x, y )
    {
        var l = ( x | 0 ) ^ ( y | 0 ); // XOR operation on the low 32 bits.
        var h = ( Math.round( x / 4294967296 ) ^ Math.round( y / 4294967296 ) ) * 4294967296; // XOR on high bits, scaled.
        return l + h; // Combine low and high parts.
    } ),


    /*
     * Returns the size in bytes of a given native type.
     * Considers QUANTUM_SIZE for pointer types.
     */
    getNativeTypeSize: ( function ( type, quantumSize )
    {
        if ( Runtime.QUANTUM_SIZE == 1 )
        {
            return 1; // If quantum size is 1, all types are 1 byte.
        }

        // Predefined sizes for common types.
        var size =
        {
            "%i1": 1,
            "%i8": 1,
            "%i16": 2,
            "%i32": 4,
            "%i64": 8,
            "%float": 4,
            "%double": 8
        }[ "%" + type ]; // Access using prefixed type string.

        if ( !size )
        {
            if ( type[ type.length - 1 ] == "*" )
            {
                size = Runtime.QUANTUM_SIZE; // Pointer types take QUANTUM_SIZE.
            }
            else if ( type[ 0 ] == "i" )
            {
                var bits = parseInt( type.substr( 1 ) ); // Extract bit count from integer type string.
                assert( bits % 8 == 0 ); // Ensure bit count is a multiple of 8.
                size = bits / 8; // Convert bits to bytes.
            }
        }
        return size;
    } ),


    // Returns the effective size of a field, considering alignment.
    getNativeFieldSize: ( function ( type )
    {
        return Math.max( Runtime.getNativeTypeSize( type ), Runtime.QUANTUM_SIZE );
    } ),


    // Removes duplicate items from an array.
    dedup: function dedup( items, ident )
    {
        var seen = {}; // Object to track seen items.

        if ( ident )
        {
            // If an identifier property is provided, use it for uniqueness.
            return items.filter( ( function ( item )
            {
                if ( seen[ item[ ident ] ] )
                {
                    return false;
                }
                seen[ item[ ident ] ] = true;
                return true;
            } ) );
        }
        else
        {
            // Otherwise, use the item itself for uniqueness.
            return items.filter( ( function ( item )
            {
                if ( seen[ item ] )
                {
                    return false;
                }
                seen[ item ] = true;
                return true;
            } ) );
        }
    },


    // Creates an object where keys are arguments and values are 0 (like a set).
    set: function set( )
    {
        // Handle both direct arguments and array-like first argument.
        var args = typeof arguments[ 0 ] === "object" ? arguments[ 0 ] : arguments;
        var ret = {}; // The resulting set-like object.

        for ( var i = 0; i < args.length; i++ )
        {
            ret[ args[ i ] ] = 0; // Assign 0 to each key.
        }
        return ret;
    },


    /*
     * Calculates alignment and sizes for a given struct type.
     * Populates `flatSize`, `alignSize`, `flatIndexes`, `flatFactor`, and `needsFlattening`.
     */
    calculateStructAlignment: function calculateStructAlignment( type )
    {
        type.flatSize = 0; // Total size of the flattened struct.
        type.alignSize = 0; // Maximum alignment requirement of any field.
        var diffs = [ ]; // Stores differences between field offsets.
        var prev = -1; // Previous field's offset.

        type.flatIndexes = type.fields.map( ( function ( field )
        {
            var size, alignSize; // Size and alignment for the current field.

            if ( Runtime.isNumberType( field ) || Runtime.isPointerType( field ) )
            {
                size = Runtime.getNativeTypeSize( field );
                alignSize = size;
            }
            else if ( Runtime.isStructType( field ) )
            {
                // Recursively get size and alignment for nested structs.
                size = Types.types[ field ].flatSize;
                alignSize = Types.types[ field ].alignSize;
            }
            else
            {
                throw "Unclear type in struct: " + field + ", in " + type.name_ + " :: " + dump( Types.types[ type.name_ ] );
            }

            // Apply packing constraint if specified.
            alignSize = type.packed ? 1 : Math.min( alignSize, Runtime.QUANTUM_SIZE );
            type.alignSize = Math.max( type.alignSize, alignSize ); // Update overall struct alignment.

            var curr = Runtime.alignMemory( type.flatSize, alignSize ); // Calculate current field's aligned offset.
            type.flatSize = curr + size; // Update total struct size.

            if ( prev >= 0 )
            {
                diffs.push( curr - prev ); // Record offset difference.
            }
            prev = curr;
            return curr; // Return the current field's offset.
        } ) );

        type.flatSize = Runtime.alignMemory( type.flatSize, type.alignSize ); // Final alignment of total struct size.

        if ( diffs.length == 0 )
        {
            type.flatFactor = type.flatSize; // If no fields, factor is just total size.
        }
        else if ( Runtime.dedup( diffs ).length == 1 )
        {
            type.flatFactor = diffs[ 0 ]; // If all diffs are same, use that as factor.
        }

        type.needsFlattening = type.flatFactor != 1; // Determine if flattening is necessary.
        return type.flatIndexes; // Return array of field offsets.
    },


    /*
     * Generates structure info, including sizes and field offsets.
     * Can be used for named types or ad-hoc structures.
     */
    generateStructInfo: ( function ( struct, typeName, offset )
    {
        var type, alignment; // Variables for type definition and alignment info.

        if ( typeName )
        {
            offset = offset || 0; // Default offset to 0.
            type = ( typeof Types === "undefined" ? Runtime.typeInfo : Types.types )[ typeName ]; // Get type definition.
            if ( !type )
            {
                return null;
            }
            assert( type.fields.length === struct.length, "Number of named fields must match the type for " + typeName );
            alignment = type.flatIndexes; // Use pre-calculated flat indexes for named types.
        }
        else
        {
            // For ad-hoc structs, create a temporary type definition.
            var type =
            {
                fields: struct.map( ( function ( item )
                {
                    return item[ 0 ]; // Extract field types.
                } ) )
            };
            alignment = Runtime.calculateStructAlignment( type ); // Calculate alignment on the fly.
        }

        var ret =
        {
            __size__: type.flatSize // Add total size to the return object.
        };

        if ( typeName )
        {
            // Process named struct fields.
            struct.forEach( ( function ( item, i )
            {
                if ( typeof item === "string" )
                {
                    ret[ item ] = alignment[ i ] + offset; // Assign offset for simple fields.
                }
                else
                {
                    // Recursively generate info for nested structs.
                    var key;
                    for ( var k in item )
                    {
                        key = k; // Get the key for the nested struct.
                    }
                    ret[ key ] = Runtime.generateStructInfo( item[ key ], type.fields[ i ], alignment[ i ] );
                }
            } ) );
        }
        else
        {
            // Process ad-hoc struct fields.
            struct.forEach( ( function ( item, i )
            {
                ret[ item[ 1 ] ] = alignment[ i ]; // Assign offset using the second element as key.
            } ) );
        }
        return ret; // Return the generated struct info.
    } ),


    // Adds a function to the global function table and returns its index.
    addFunction: ( function ( func )
    {
        var ret = FUNCTION_TABLE.length; // Get the next available index.
        FUNCTION_TABLE.push( func ); // Add the function.
        FUNCTION_TABLE.push( 0 ); // Add a dummy entry (for alignment/compatibility?).
        return ret;
    } ),


    // Allocates memory on the stack.
    stackAlloc: function stackAlloc( size )
    {
        var ret = STACKTOP; // Current stack top.
        STACKTOP += size; // Advance stack top by size.
        STACKTOP = STACKTOP + 3 >> 2 << 2; // Align stack top to 4-byte boundary.
        return ret; // Return the allocated address.
    },


    // Allocates memory in the static data segment.
    staticAlloc: function staticAlloc( size )
    {
        var ret = STATICTOP; // Current static top.
        STATICTOP += size; // Advance static top by size.
        STATICTOP = STATICTOP + 3 >> 2 << 2; // Align static top to 4-byte boundary.
        if ( STATICTOP >= TOTAL_MEMORY )
        {
            enlargeMemory( ); // Enlarge memory if static segment overflows.
        }
        return ret; // Return the allocated address.
    },


    // Aligns a given memory size to a specified quantum (defaults to 4).
    alignMemory: function alignMemory( size, quantum )
    {
        var ret = size = Math.ceil( size / ( quantum ? quantum : 4 ) ) * ( quantum ? quantum : 4 );
        return ret; // Return the aligned size.
    },


    /*
     * Creates a BigInt-like number from two 32-bit integers (low and high parts).
     * Supports both signed and unsigned interpretations.
     */
    makeBigInt: function makeBigInt( low, high, unsigned )
    {
        var ret = unsigned ? ( low >>> 0 ) + ( high >>> 0 ) * 4294967296 : ( low >>> 0 ) + ( high | 0 ) * 4294967296;
        return ret;
    },


    QUANTUM_SIZE: 4, // Default memory quantum size (e.g., pointer size).
    __dummy__: 0 // Placeholder or unused property.
};


/*
 * CorrectionsMonitor object:
 * Tracks and limits the number of "corrections" (e.g., type coercions or runtime adjustments)
 * to prevent excessive or unexpected behavior.
 */
var CorrectionsMonitor =
{
    MAX_ALLOWED: 0, // Maximum allowed corrections before aborting.
    corrections: 0, // Current count of corrections.
    sigs: {}, // Stores signatures of corrections (unused in this snippet).


    // Notes a correction attempt. If 'succeed' is false, increments correction count.
    note: ( function ( type, succeed, sig )
    {
        if ( !succeed )
        {
            this.corrections++; // Increment the counter.
            // If corrections exceed the maximum, abort.
            if ( this.corrections >= this.MAX_ALLOWED )
            {
                abort( "\n\nToo many corrections!" );
            }
        }
    } ),


    print: ( function ( ) { } ) // Placeholder for printing correction information.
};


var __THREW__ = false; // Flag to indicate if an exception was thrown.


var ABORT = false; // Flag to indicate if the program should abort.


var undef = 0; // Undefined value placeholder.


/*
 * Temporary variables used for various internal operations,
 * often for value conversions or intermediate calculations.
 */
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;


var tempI64, tempI64b; // Additional temporary variables, specifically for 64-bit integers.


/*
 * Abort function:
 * Prints an error message, stack trace, sets the ABORT flag, and throws an exception.
 */
function abort( text )
{
    Module.print( text + ":\n" + ( new Error ).stack ); // Print error message and stack trace.
    ABORT = true; // Set abort flag.
    throw "Assertion: " + text; // Throw an assertion error.
}


/*
 * Assertion function:
 * Checks a condition; if false, calls abort with a descriptive message.
 */
function assert( condition, text )
{
    if ( !condition )
    {
        abort( "Assertion failed: " + text ); // Abort if condition is false.
    }
}


var globalScope = this; // Reference to the global execution context.


/*
 * ccall function:
 * Calls a C-exported function from JavaScript, handling argument and return type conversions.
 */
function ccall( ident, returnType, argTypes, args )
{
    var stack = 0; // Stack pointer for temporary allocations.


    // Converts a JavaScript value to a C-compatible value based on the specified type.
    function toC( value, type )
    {
        if ( type == "string" )
        {
            if ( !stack )
            {
                stack = Runtime.stackSave( ); // Save stack if first allocation.
            }
            var ret = Runtime.stackAlloc( value.length + 1 ); // Allocate memory for string + null terminator.
            writeStringToMemory( value, ret ); // Write string to allocated memory.
            return ret;
        }
        else if ( type == "array" )
        {
            if ( !stack )
            {
                stack = Runtime.stackSave( ); // Save stack if first allocation.
            }
            var ret = Runtime.stackAlloc( value.length ); // Allocate memory for array.
            writeArrayToMemory( value, ret ); // Write array elements to memory.
            return ret;
        }
        return value; // Return value as-is for other types.
    }


    // Converts a C-returned value back to a JavaScript value.
    function fromC( value, type )
    {
        if ( type == "string" )
        {
            return Pointer_stringify( value ); // Convert C-string pointer to JavaScript string.
        }
        assert( type != "array" ); // Arrays are not directly returned from C.
        return value; // Return value as-is for other types.
    }


    try
    {
        var func = eval( "_" + ident ); // Try to find the function directly using eval.
    }
    catch ( e )
    {
        try
        {
            func = globalScope[ "Module" ][ "_" + ident ]; // Fallback: try finding it in Module object.
        }
        catch ( e ) { } // Ignore errors if not found in Module.
    }
    assert( func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)" ); // Assert function existence.

    var i = 0; // Counter for argument types.
    // Convert JavaScript arguments to C-compatible arguments.
    var cArgs = args ? args.map( ( function ( arg )
    {
        return toC( arg, argTypes[ i++ ] );
    } ) ) : [ ];

    // Call the C function and convert its return value.
    var ret = fromC( func.apply( null, cArgs ), returnType );

    if ( stack )
    {
        Runtime.stackRestore( stack ); // Restore stack if temporary memory was allocated.
    }
    return ret; // Return the converted result.
}


// Expose ccall function on the Module object.
Module[ "ccall" ] = ccall;


/*
 * cwrap function:
 * Creates a JavaScript wrapper for a C-exported function, handling type conversions automatically.
 */
function cwrap( ident, returnType, argTypes )
{
    return ( function ( )
    {
        // Use ccall internally to handle the actual call and type conversions.
        return ccall( ident, returnType, argTypes, Array.prototype.slice.call( arguments ) );
    } );
}


// Expose cwrap function on the Module object.
Module[ "cwrap" ] = cwrap;


/*
 * setValue function:
 * Writes a JavaScript value to a specific memory address (ptr) with a given type.
 */
function setValue( ptr, value, type, noSafe )
{
    type = type || "i8"; // Default type to "i8" if not provided.
    if ( type[ type.length - 1 ] === "*" )
    {
        type = "i32"; // Pointers are treated as 32-bit integers.
    }

    switch ( type )
    {
        case "i1":
            HEAP8[ ptr ] = value; // 1-bit integer, stored as byte.
            break;
        case "i8":
            HEAP8[ ptr ] = value; // 8-bit integer.
            break;
        case "i16":
            HEAP16[ ptr >> 1 ] = value; // 16-bit integer, aligned to 2 bytes.
            break;
        case "i32":
            HEAP32[ ptr >> 2 ] = value; // 32-bit integer, aligned to 4 bytes.
            break;
        case "i64":
            HEAP32[ ptr >> 2 ] = value; // 64-bit integer (only low 32 bits written here).
            break;
        case "float":
            HEAPF32[ ptr >> 2 ] = value; // Single-precision float, aligned to 4 bytes.
            break;
        case "double":
            // Double-precision float: convert to two 32-bit integers and write.
            tempDoubleF64[ 0 ] = value, HEAP32[ ptr >> 2 ] = tempDoubleI32[ 0 ], HEAP32[ ptr + 4 >> 2 ] = tempDoubleI32[ 1 ];
            break;
        default:
            abort( "invalid type for setValue: " + type ); // Abort for unknown types.
    }
}


// Expose setValue function on the Module object.
Module[ "setValue" ] = setValue;


/*
 * getValue function:
 * Reads a value from a specific memory address (ptr) with a given type.
 */
function getValue( ptr, type, noSafe )
{
    type = type || "i8"; // Default type to "i8" if not provided.
    if ( type[ type.length - 1 ] === "*" )
    {
        type = "i32"; // Pointers are treated as 32-bit integers.
    }

    switch ( type )
    {
        case "i1":
            return HEAP8[ ptr ]; // 1-bit integer, read as byte.
        case "i8":
            return HEAP8[ ptr ]; // 8-bit integer.
        case "i16":
            return HEAP16[ ptr >> 1 ]; // 16-bit integer, aligned to 2 bytes.
        case "i32":
            return HEAP32[ ptr >> 2 ]; // 32-bit integer, aligned to 4 bytes.
        case "i64":
            return HEAP32[ ptr >> 2 ]; // 64-bit integer (only low 32 bits read here).
        case "float":
            return HEAPF32[ ptr >> 2 ]; // Single-precision float, aligned to 4 bytes.
        case "double":
            // Double-precision float: read two 32-bit integers and convert to double.
            return tempDoubleI32[ 0 ] = HEAP32[ ptr >> 2 ], tempDoubleI32[ 1 ] = HEAP32[ ptr + 4 >> 2 ], tempDoubleF64[ 0 ];
        default:
            abort( "invalid type for setValue: " + type ); // Abort for unknown types.
    }
    return null; // Should not be reached if type is valid.
}


// Expose getValue function on the Module object.
Module[ "getValue" ] = getValue;


/*
 * Memory allocation constants:
 * Define different strategies for memory allocation.
 */
var ALLOC_NORMAL = 0; // Normal heap allocation.


var ALLOC_STACK = 1; // Stack allocation (temporary, automatically cleaned up).


var ALLOC_STATIC = 2; // Static allocation (persists for program lifetime).


// Expose ALLOC_NORMAL constant on the Module object.
Module[ "ALLOC_NORMAL" ] = ALLOC_NORMAL;