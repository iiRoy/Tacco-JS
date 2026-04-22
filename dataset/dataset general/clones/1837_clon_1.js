/*
 * Copyright (c) 2013, Pantor Engineering AB
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *
 *   * Neither the name of Pantor Engineering AB nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *
 * IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 */

var  util    =  require ( "./util" );
var  schema  =  require ( "./schema" );
var  sbuilder=  require ( "./schema-builder" );
var  fs      =  require ( "fs" );


module.provide(
    /*
     * This module provides functionality to read a Blink schema.
     * It offers two primary methods: `read` for file input and `readFromString` for string input.
     *
     * The `read` function processes a Blink schema from a specified file path.
     * The `readFromString` function processes a Blink schema from an input string,
     * optionally taking a file name for error reporting.
     *
     * Both functions accept a second argument which can be either:
     *   1. A `schema.Schema` object: In this case, the reader will parse the schema
     *      definitions and populate the provided schema object with the parsed data.
     *   2. An observer object: If an observer is provided, the reader will emit
     *      events corresponding to the schema definitions encountered during parsing.
     *      The observer should implement specific methods to handle these events.
     *
     * The observer methods expected are:
     *   - onNsDecl(name): Notifies about a namespace declaration.
     *   - onStartGroupDef(name, id, super, annots, loc): Signals the beginning of a group definition.
     *   - onEndGroupDef(): Signals the end of a group definition.
     *   - onStartField(loc): Indicates the start of a field definition.
     *   - onEndField(name, id, pres, annots): Indicates the end of a field definition.
     *   - onStartDefine(name, id, annots, loc): Signals the start of a define block.
     *   - onEndDefine(): Signals the end of a define block.
     *   - onStartEnum(loc): Signals the start of an enumeration definition.
     *   - onEndEnum(): Signals the end of an enumeration definition.
     *   - onTypeRef(name, layout, rank, annots, loc): Notifies about a type reference.
     *   - onStringType(rank, maxSize, annots, loc): Notifies about a string type definition.
     *   - onBinaryType(rank, maxSize, annots, loc): Notifies about a binary type definition.
     *   - onFixedType(rank, size, annots, loc): Notifies about a fixed-size type definition.
     *   - onPrimType(type, rank, annots, loc): Notifies about a primitive type definition.
     *   - onEnumSym(name, val, annots, loc): Notifies about an enumeration symbol.
     *   - onSchemaAnnot(annots, loc): Notifies about a schema-level annotation.
     *   - onIncrAnnot(name, substep, pathType, id, annots, loc): Notifies about an incremental annotation.
     *
     * Note: Components that can contain nested structures (like groups or defines)
     * are represented by a pair of matching 'Start' and 'End' events.
     *
     * Description of common event arguments:
     *   - name: A string representing a name (e.g., field name, type name).
     *   - super: A string representing a super type.
     *   - type: A schema.TypeCode enum value (e.g., I8, Object).
     *   - layout: A schema.Layout enum value (e.g., Dynamic, Static).
     *   - val: A string representing an enum symbol's value.
     *   - id: A string identifier.
     *   - rank: A schema.Rank enum value (e.g., Single, Sequence).
     *   - pres: A Presence enum value (Optional, Required).
     *   - substep: A string indicating a component reference substep.
     *   - pathType: A schema.PathType enum value (Name or Type).
     *   - annots: An object where properties correspond to annotation names and their values.
     *   - loc: An object containing location information { line: number, col: number, src: string }.
     *   - maxSize: An integer representing the maximum size for string or binary types.
     *   - size: An integer representing the fixed size.
     */
    read, // Main function to read schema from a file. Accepts a filename and a schema object or observer.

    /*
     * This function reads a Blink schema from a provided string.
     * It's useful for in-memory schema definitions or testing.
     * The `data` argument can also be an array of strings which will be flattened and joined by newlines.
     * An optional `fileName` argument can be provided for better error reporting context.
     */
    readFromString // Function to parse schema from a string.
);

function read ( f, s )
{
    // Delegates to innerRead after reading file content
    innerRead( fs.readFileSync(f), f || "-", makeObs(s) );
}

function readFromString ( data, s, fileName )
{
    // If the input 's' is an array, flatten and join its elements.
    if ( util.isArray(s) )
    {
        data = util.flatten( data ).join( "\n" );
    }

    // Process the data using the core reader logic.
    innerRead( data, fileName || "-", makeObs(s) );
}

// List of all possible event types that the schema parser can emit.
var Events = [
    "NsDecl",          // Namespace declaration
    "StartGroupDef",   // Start of a group definition
    "EndGroupDef",     // End of a group definition
    "StartField",      // Start of a field definition
    "EndField",        // End of a field definition
    "StartDefine",     // Start of a 'define' block
    "EndDefine",       // End of a 'define' block
    "StartEnum",       // Start of an enumeration
    "EndEnum",         // End of an enumeration
    "TypeRef",         // Type reference
    "StringType",      // String type definition
    "BinaryType",      // Binary type definition
    "FixedType",       // Fixed-size type definition
    "PrimType",        // Primitive type definition
    "EnumSym",         // Enumeration symbol
    "SchemaAnnot",     // Schema-level annotation
    "IncrAnnot"        // Incremental annotation
];

function makeObs ( obs )
{
    // Ensure an observer is always present; default to a dump observer if none provided.
    obs = obs || createDumpObs();

    // If the observer is a Schema object, wrap it with a schema builder for population.
    if ( obs instanceof schema.Schema )
    {
        obs = sbuilder.create( obs );
    }

    /*
     * Create a new observer object that includes default (no-op)
     * handlers for events not explicitly handled by the provided 'obs'.
     * This prevents errors from missing methods.
     */
    var withDefaults = {};

    Events.forEach( function( e )
    {
        var n = "on" + e; // Construct the event handler method name.
        var m = obs[n];   // Get the actual handler from the provided observer.

        if ( m )
        {
            // If a handler exists, bind it to the new observer.
            withDefaults[n] = function() { m.apply( obs, arguments ); };
        }
        else
        {
            // Otherwise, provide a dummy (empty) handler.
            withDefaults[n] = function() { /* No operation */ };
        }
    } );

    return withDefaults; // Return the observer with all event handlers.
}

function createDumpObs ( )
{
    // Initializes an observer that logs all received events to the console.
    var obs = {};

    Events.forEach( function( e )
    {
        // Define a handler for each event type.
        obs[ "on" + e ] = function ( )
        {
            var args = []; // Array to store formatted arguments for logging.

            // Iterate through all arguments passed to the event handler.
            for ( var i = 0; i < arguments.length; ++i )
            {
                var a = arguments[i]; // Current argument.

                // Format argument based on its type.
                if ( util.isString(a) )
                {
                    args.push( '"' + a + '"' ); // Enclose strings in quotes.
                }
                else if ( util.isNumber(a) || util.isEnum(a) )
                {
                    args.push( a ); // Numbers and enums are logged directly.
                }
                else if ( a instanceof schema.Location )
                {
                    args.push( a ); // Location objects are logged as is.
                }
                else
                {
                    // For other object types (e.g., annotations), format as key="value" pairs.
                    var annots = util.getPropertyArray( a ).map( function( nm )
                    {
                        return nm + "=\"" + a[nm] + "\"";
                    } );
                    args.push( "[" + annots.join( ", " ) + "]" ); // Join formatted annotations.
                }
            }
            // Log the event name and its formatted arguments to the console.
            console.log( e + " ( " + args.join( ", " ) + " )" );
        };
    } );

    return obs; // Return the console-logging observer.
}

// Placeholder for the tokenizer module.
var Token;

// Placeholder for single-character tokens.
var Single = {};

// Placeholder for keyword tokens.
var Keyword = {};

function innerRead( data, fileName, obs )
{
    // Initialize the tokenizer with the schema data and filename.
    var tok = tokenize( data, fileName );

    // Variables to temporarily store annotations, pending ID, and pending name.
    var annotations = {};
    var pendId      = "";
    var pendName    = "";


    // A schema can optionally start with a namespace declaration.
    if ( tok.next("namespace") )
    {
        nsDecl(); // Process namespace declaration if present.
    }

    // Continue processing definitions until the end of the input is reached.
    while ( !tok.match("End") )
    {
        def(); // Parse a single definition.
    }

    /**
     * @private
     * Helper function to retrieve and clear pending annotations.
     * @returns {object} The collected annotations.
     */
    function consumeAnnots ( )
    {
        var tmp = annotations;
        annotations = {}; // Reset annotations for the next parsing block.
        return tmp;
    }

    /**
     * @private
     * Helper function to retrieve and clear a pending ID.
     * @returns {string} The pending ID.
     */
    function consumeId ( )
    {
        var id = pendId;
        pendId = ""; // Reset pending ID.
        return id;
    }

    /**
     * @private
     * Parses a single annotation in the format "@name=value".
     * Supports multi-part string values.
     */
    function annot ( )
    {
        var name = tok.nextNameOrKeyword() || tok.expected( "annotation name" );
        tok.require( "=" );
        var val = tok.require( "String" );

        // Concatenate subsequent string tokens if they are part of the same annotation value.
        for ( ; ; )
        {
            var cont = tok.next( "String" );
            if ( cont )
            {
                val += cont;
            }
            else
            {
                break;
            }
        }
        annotations[name] = val; // Store the parsed annotation.
    }

    /**
     * @private
     * Parses a sequence of annotations.
     */
    function annots ( )
    {
        while ( tok.next( "@" ) )
        {
            annot(); // Parse each annotation.
        }
    }

    /**
     * @private
     * Parses a namespace declaration.
     * Emits an `onNsDecl` event.
     */
    function nsDecl ( )
    {
        obs.onNsDecl( tok.require( "Name", "namespace name" ) );
    }

    /**
     * @private
     * Parses a name followed by an optional ID (e.g., "MyName /123").
     * Stores the name in `pendName` and ID in `pendId`.
     * @param {string} what - Description of what is being named, for error messages.
     */
    function nameWithId ( what )
    {
        pendName = tok.require( "Name", what );
        pendId   = "";

        if ( tok.next("/") )
        {
            pendId = tok.next( "Uint", "Hex" ) ||
                tok.expected( "unsigned integer or hex number" );
        }
    }

    /**
     * @private
     * Determines the rank (Single or Sequence) of a type.
     * Looks for `[]` after the type.
     * @returns {schema.Rank} The determined rank.
     */
    function rank ( )
    {
        if ( tok.next("[") )
        {
            tok.require( "]" );
            return schema.Rank.Sequence;
        }
        else
        {
            return schema.Rank.Single;
        }
    }

    /**
     * @private
     * Parses a type reference (e.g., "MyType" or "MyType*").
     * Emits an `onTypeRef` event.
     */
    function ref ( )
    {
        var name = tok.next();
        var kind = tok.next( "*" ) ? schema.Layout.Dynamic : schema.Layout.Static;
        var r    = rank();
        obs.onTypeRef( name, kind, r, consumeAnnots(), tok.lastLoc() );
    }

    /**
     * @private
     * Parses a string type definition (e.g., "string" or "string(100)").
     * Emits an `onStringType` event.
     */
    function string ( )
    {
        tok.next(); // Consume "string" keyword.
        var maxSize;

        if ( tok.next("(") )
        {
            maxSize = tok.require( "Uint", "string max size" );
            tok.require( ")" );
        }

        var r = rank();
        obs.onStringType( r, maxSize, consumeAnnots(), tok.lastLoc() );
    }

    /**
     * @private
     * Parses a binary type definition (e.g., "binary" or "binary(1024)").
     * Emits an `onBinaryType` event.
     */
    function binary ( )
    {
        tok.next(); // Consume "binary" keyword.
        var maxSize;

        if ( tok.next("(") )
        {
            maxSize = tok.require( "Uint", "binary max size" );
            tok.require( ")" );
        }

        var r = rank();
        obs.onBinaryType( r, maxSize, consumeAnnots(), tok.lastLoc() );
    }

    /**
     * @private
     * Parses a fixed-size type definition (e.g., "fixed(8)").
     * Emits an `onFixedType` event.
     */
    function fixed ( )
    {
        tok.next(); // Consume "fixed" keyword.
        tok.require( "(" );
        var size = tok.require( "Uint", "fixed max size" );
        tok.require( ")" );

        var r = rank();
        obs.onFixedType( r, size, consumeAnnots(), tok.lastLoc() );
    }

    /**
     * @private
     * Parses a primitive type (e.g., "i8", "bool", "object").
     * Emits an `onPrimType` event.
     */
    function primType ( )
    {
        var t = schema.TypeCode[ util.capitalize( tok.next() ) ];
        var r = rank();
        obs.onPrimType( t, r, consumeAnnots(), tok.lastLoc() );
    }

    /**
     * @private
     * Parses a general type specification.
     * Dispatches to specific type parsing functions based on the current token.
     */
    function type ( )
    {
        if ( tok.match("Name", "Qname") )
        {
            ref();
        }
        else if ( tok.match("string") )
        {
            string();
        }
        else if ( tok.match("binary") )
        {
            binary();
        }
        else if ( tok.match("fixed") )
        {
            fixed();
        }
        else if ( tok.match("namespace", "schema", "type") )
        {
            tok.expected( "type specifier" ); // Keywords that cannot be type names.
        }
        else if ( tok.matchAnyKeyword() )
        {
            primType();
        }
        else
        {
            tok.expected( "type specifier" ); // Fallback for unexpected tokens.
        }
    }

    /**
     * @private
     * Parses a field definition within a group.
     * Emits `onStartField` and `onEndField` events.
     */
    function field ( )
    {
        annots(); // Parse any annotations preceding the field.
        obs.onStartField( tok.loc() ); // Notify observer of field start.
        type(); // Parse the field's type.
        annots(); // Parse any annotations between type and name.
        nameWithId( "field name" ); // Parse the field's name and optional ID.

        // Determine if the field is optional or required.
        var pres = tok.next("?") ? schema.Presence.Optional : schema.Presence.Required;

        obs.onEndField( pendName, consumeId(), pres, consumeAnnots() ); // Notify observer of field end.
    }

    /**
     * @private
     * Parses a group definition, including its name, optional supertype, and fields.
     * Emits `onStartGroupDef` and `onEndGroupDef` events.
     */
    function groupDef ( )
    {
        var sup = ""; // Initialize supertype to empty.

        // Check for an optional supertype declaration (e.g., ": MySuperType").
        if ( tok.next(":") )
        {
            sup = tok.next( "Name", "Qname" ) || tok.expected( "supertype name" );
        }

        obs.onStartGroupDef( pendName, consumeId(), sup, consumeAnnots(), tok.lastLoc() ); // Notify group start.

        // Parse fields within the group if the "->" symbol is present.
        if ( tok.next("->") )
        {
            for ( ; ; ) // Loop to parse multiple fields.
            {
                field(); // Parse a single field.
                if ( !tok.next(",") ) // Fields are separated by commas.
                {
                    break; // Exit loop if no more commas.
                }
            }
        }

        obs.onEndGroupDef(); // Notify group end.
    }

    /**
     * @private
     * Parses an enumeration symbol (e.g., "SYM_NAME /10").
     * Emits an `onEnumSym` event.
     */
    function sym ( )
    {
        annots(); // Parse annotations for the symbol.
        var name = tok.require( "Name", "enum symbol name" );
        var val  = ""; // Initialize symbol value.

        // Check for an optional numeric value (e.g., "/10").
        if ( tok.next("/") )
        {
            val = tok.next( "Uint", "Int", "Hex" ) ||
                tok.expected( "integer or hex number" );
        }

        obs.onEnumSym( name, val, consumeAnnots(), tok.lastLoc() ); // Notify observer.
    }

    /**
     * @private
     * Parses an enumeration definition.
     * Emits `onStartEnum` and `onEndEnum` events.
     */
    function enumeration ( )
    {
        obs.onStartEnum( tok.lastLoc() ); // Notify start of enumeration.

        // Enumerations can start with a '|' if the first symbol is empty, or directly with a symbol.
        if ( tok.next("|") )
        {
            sym(); // Parse the first symbol (potentially empty).
        }
        else
        {
            for ( ; ; ) // Loop to parse multiple symbols.
            {
                sym(); // Parse a single symbol.
                if ( !tok.next("|") ) // Symbols are separated by '|'.
                {
                    break; // Exit loop if no more '|'.
                }
            }
        }

        obs.onEndEnum(); // Notify end of enumeration.
    }

    /**
     * @private
     * Parses a 'define' block, which can contain either an enum or a type definition.
     * Emits `onStartDefine` and `onEndDefine` events.
     */
    function define ( )
    {
        obs.onStartDefine( pendName, consumeId(), consumeAnnots(), tok.lastLoc() ); // Notify define start.
        annots(); // Parse annotations for the define content.

        // Determine if the define contains an enumeration or a type.
        if ( tok.match("|") || (tok.match("Name") && tok.matchPend("/", "|")) )
        {
            enumeration(); // It's an enumeration.
        }
        else
        {
            type(); // It's a type definition.
        }

        obs.onEndDefine(); // Notify define end.
    }

    // --- The 'incrAnnotList' and subsequent functions are incomplete in the provided source. ---
    // Assuming the structure, I will apply consistent formatting.

    /**
     * @private
     * Parses a list of incremental annotations.
     * This function appears incomplete in the original source,
     * but its structure will be formatted consistently.
     */
    function incrAnnotList ( )
    {
        // Requires a "<-" token at the start of an incremental annotation list.
        if ( !tok.match("<-") )
        {
            tok.expected( "'<-'" );
        }

        // Keep processing "<-" separated items.
        while ( tok.next("<-") )
        {
            // The body of the loop is empty in the provided code,
            // implying further parsing logic for 'incrAnnotItem' would follow here.
}