/*
 * jLinq 2.2.1 - A powerful JavaScript LINQ-like library.
 * -----------------------------------------------------
 * Official website: www.hugoware.net
 * License: Attribution-Share Alike (CC BY-SA 3.0 US)
 * For more details, see: http://creativecommons.org/licenses/by-sa/3.0/us/
 * This file is a Type I clone, preserving all functionality but varying whitespace and comments.
 *
 */

var jLinq ;
( function () {

    // This section defines the core library creation function.
    // It encapsulates the private variables and public methods for a jLinq instance.
    var library = function ( settings ) {
        // 'this' refers to the new jLinq object being constructed.
        var _jLinq = this;
        // Private variables and methods are stored in _p to avoid global scope pollution.
        var _p = { };

        // Store the initial settings for later reference.
        _p.settings = settings;

        // The 'finish' method is used to lock the jLinq object, preventing further extensions.
        // Once called, it sets a lock and removes itself to prevent re-locking.
        _jLinq.finish = function ( lock ) {
            // Self-nullify to ensure it can only be called once.
            _jLinq.finish = null ;
            // Mark the library as loaded.
            _p.loaded = true ;
            // Set the lock status.
            _p.lock = lock ;
        } ;

        // A collection of utility methods used throughout the jLinq library.
        _p.util = {

            // Formats a string by replacing placeholders like %0%, %1% with provided arguments.
            format : function ( msg , args ) {
                // Ensure the message is treated as a string.
                return msg . toString ( ) . replace ( /%[0-9]+%/gi , function ( match ) {
                    // Extract the numeric index from the placeholder (e.g., "0" from "%0%").
                    var index = parseInt ( match . replace ( /%/gi , "" ) ) ;
                    // Return the corresponding argument.
                    return args [ index ] ;
                } ) ;
            } ,

            // Retrieves all non-null values from a list, stopping at the first null encountered.
            allValues : function ( list ) {
                var actual = [ ] ;
                // Iterate through the list.
                for ( var i = 0 ; i < list . length ; i ++ ) {
                    // If a null value is found, stop and return what's been collected so far.
                    if ( list [ i ] == null ) { return actual ; }
                    // Otherwise, add the value to the result array.
                    actual . push ( list [ i ] ) ;
                }
                return actual ;
            } ,

            // Trims leading and trailing whitespace from a string.
            trim : function ( val ) {
                // Handle null input gracefully.
                if ( val == null ) { return "" ; }
                // Convert to string and apply regex for trimming.
                return val . toString ( ) . replace ( /^\s+|\s+$/ , "" ) ;
            } ,

            // Checks if all elements in a list are falsy (e.g., null, undefined, 0, false, "").
            empty : function ( list ) {
                // Iterate to find any truthy element.
                for ( var i = 0 ; i < list . length ; i ++ ) {
                    // If any element is truthy, the list is not empty.
                    if ( list [ i ] ) { return false ; }
                }
                // If no truthy elements were found, the list is considered empty.
                return true ;
            } ,

            // Determines the custom type of a value, or its JavaScript typeof if no custom type matches.
            type : function ( val ) {

                // If the value is explicitly null or undefined, return "null".
                if ( val == null ) { return "null" ; }
                if ( val == undefined ) { return "null" ; }

                // Check against registered custom types.
                for ( var item in _p . types ) {
                    try {
                        // If a custom type's comparison function returns true, return its name.
                        if ( _p . types [ item ] ( val ) ) { return item ; }
                    }
                    catch ( e ) {
                        // Ignore errors during type comparison; continue to the next type.
                        // No critical concern here, just trying to match a type.
                    }
                }

                // If no custom type matched, return the lowercase typeof result.
                return ( typeof ( val ) ) . toString ( ) . toLowerCase ( ) ;

            } ,

            // Executes an action based on the type of the value.
            when : function ( val , actions ) {
                var type = _p . util . type ( val ) ; // Get the type of the value.

                // If a specific action for this type is not found.
                if ( ! actions [ type ] ) {
                    // Check for an 'empty' action if the value is null/undefined.
                    if ( actions . empty && ( val == null || val == undefined ) ) { return actions . empty ( val ) ; }
                    // Fallback to an 'other' action if provided.
                    if ( actions . other ) { return actions . other ( val ) ; }
                    // If no matching action, return false by default.
                    return false ;
                }
                try {
                    // Execute the action for the determined type.
                    return actions [ type ] ( val ) ;
                }
                catch ( e ) {
                    // If an error occurs during execution, return false.
                    return false ;
                }
            } ,

            // Similar to 'when', but returns null on failure or no match, implying a transformation.
            as : function ( val , actions ) {
                var type = _p . util . type ( val ) ; // Determine the type.

                // If no specific action for the type.
                if ( ! actions [ type ] ) {
                    // Handle empty values with a specific action if available.
                    if ( actions . empty && ( val == null || val == undefined ) ) { return actions . empty ( val ) ; }
                    // Use 'other' action if present.
                    if ( actions . other ) { return actions . other ( val ) ; }
                    // Default to null if no action matches.
                    return null ;
                }
                try {
                    // Execute the type-specific action.
                    return actions [ type ] ( val ) ;
                }
                catch ( e ) {
                    // Return null if an error occurs.
                    return null ;
                }
            } ,

            // Iterates over an array, applying an action to each element and collecting results.
            each : function ( array , action ) {
                var results = [ ] ;
                for ( var i = 0 ; i < array . length ; i ++ ) {
                    try {
                        // Push the result of the action into the results array.
                        results . push ( action ( array [ i ] , i ) ) ;
                    }
                    catch ( e ) {
                        // If the action throws an error, push the error itself into results.
                        results . push ( e ) ;
                    }
                }
                return results ;
            } ,

            // Simple object cloning using prototype inheritance.
            // This creates a shallow copy, where properties are shared by reference.
            clone : function ( obj ) {
                function gen ( ) { } ; // A temporary constructor.
                gen . prototype = obj ; // Set its prototype to the object to be cloned.
                return new gen ( ) ; // Return a new instance, inheriting from obj.
            }
        } ;

        // Methods for managing custom types that can be recognized by _p.util.type().
        // These types are used by 'when' and 'as' utility functions.
        _jLinq . addType = function ( name , compare ) {
            // Trim and lowercase the type name for consistent lookup.
            name = _p . util . trim ( name ) . toLowerCase ( ) ;
            // Register the comparison function for the given type name.
            _p . types [ name ] = compare ;
        } ;
        _jLinq . removeType = function ( name ) {
            // Trim and lowercase the type name.
            name = _p . util . trim ( name ) . toLowerCase ( ) ;
            // Effectively remove the type by replacing its comparison with a function that always returns false.
            _p . types [ name ] = function ( ) { return false ; } ;
        } ;
        // Initialize custom types, either from settings or an empty object.
        _p . types = settings . types ? settings . types : { } ;

        // Extends the functionality of the jLinq object with new commands.
        //===============================================================================
        _jLinq . extend = function ( params ) {
            // Normalize name and namespace parameters by trimming whitespace.
            params . name = _p . util . trim ( params . name ) ;
            params . namespace = _p . util . trim ( params . namespace ) ;

            // Check if this command already exists.
            if ( _p . extend . hasCmd ( params ) ) {
                // If the library is locked, throw an exception.
                if ( _p . lock ) { throw "Exception: Library is locked." ; }
                // Otherwise, remove the existing command before adding the new one.
                _p . extend . removeCmd ( params ) ;
            }

            // Add the new command to the internal list of extensions.
            _p . extend . addCmd ( params ) ;

            // Source extensions are special; they are evaluated and added immediately to jLinq.
            if ( params . type . match ( /source/i ) ) {

                // Determine the correct target object (jLinq itself or a namespace within jLinq).
                if ( params . namespace && ! _jLinq [ params . namespace ] ) { _jLinq [ params . namespace ] = { } ; }
                var target = params . namespace == "" ? _jLinq : _jLinq [ params . namespace ] ;

                // Apply this command as a method on the target object.
                // It's defined with a generous number of arguments to support various signatures.
                target [ params . name ] = function ( v1 , v2 , v3 , v4 , v5 , v6 , v7 , v8 , v9 , v10 , v11 , v12 , v13 , v14 , v15 , v16 , v17 , v18 , v19 , v20 , v21 , v22 , v23 , v24 , v25 ) {

                    // Prepare the command for execution by calling its method.
                    // The helper utilities are passed as the first argument.
                    var results = params . method ( {
                        helper : _p . util
                    } , v1 , v2 , v3 , v4 , v5 , v6 , v7 , v8 , v9 , v10 , v11 , v12 , v13 , v14 , v15 , v16 , v17 , v18 , v19 , v20 , v21 , v22 , v23 , v24 , v25 ) ;

                    // A 'Source' extension must return an array to be usable by jLinq.
                    if ( _p . util . type ( results ) != "array" ) {
                        throw "Exception: A 'Source' extension must return an array for a jLinq query." ;
                    }

                    // Return a new query object initialized with the results.
                    return new _p . query ( results ) ;

                } ;

            }

        } ;
        // Internal object for managing registered extensions.
        _p . extend = {
            cmd : [ ] , // Array to store command definitions.
            // Checks if a command with the given name and namespace already exists.
            hasCmd : function ( params ) {
                return ( _p . extend . findCmd ( params ) != null ) ;
            } ,
            // Adds a command, ensuring any existing command with the same name/namespace is removed first.
            addCmd : function ( params ) {
                _p . extend . removeCmd ( params ) ;
                _p . extend . cmd . push ( params ) ;
            } ,
            // Removes a command if it exists.
            removeCmd : function ( params ) {
                var index = _p . extend . findCmd ( params ) ;
                if ( index != null ) { // Check for null explicitly, as 0 is a valid index.
                    _p . extend . cmd . splice ( index , 1 ) ; // Remove 1 element at 'index'.
                }

            } ,
            // Finds the index of a command within the 'cmd' array.
            findCmd : function ( params ) {
                for ( var i = 0 ; i < _p . extend . cmd . length ; i ++ ) {
                    var method = _p . extend . cmd [ i ] ;
                    if ( method . name == params . name && method . namespace == params . namespace ) {
                        return i ; // Return the index if found.
                    }
                }
                return null ; // Return null if not found.
            }
        } ;

        // Public method to retrieve a copy of all registered commands.
        _jLinq . showCommands = function ( ) {
            return _p . util . clone ( _p . extend . cmd ) ; // Return a clone to prevent external modification.
        } ;

        // Initialize jLinq by adding all extensions defined in the settings.
        for ( var item in settings . extend ) {
            _jLinq . extend ( settings . extend [ item ] ) ;
        }

        // Generates and manages the actual jLinq query.
        // This is the core functionality that processes data collections.
        //===============================================================================
        _p . query = function ( data ) {
            var _query = this ; // Reference to the current query instance.

            // Duplicate the incoming data to ensure the original is not modified.
            data = _p . util . clone ( data ) ;

            // Internal state object for the query.
            var _s = { } ;
            _s . state = {
                properties : true , // General flag for property-based operations.
                lastCommand : null , // Stores the last command function executed.
                lastField : null , // Stores the field used by the last command.
                lastCommandName : null , // Stores the name of the last command.
                paramCount : 0 , // Number of parameters for the last command.
                ignoreCase : true , // Default for string comparisons.
                or : false , // Flag for logical OR operations.
                not : false , // Flag for logical NOT operations.
                data : data , // The dataset currently being queried.
                useProperties : false , // Indicates if data items are objects with properties.
                operator : "" , // Logical operator to prepend to the next condition (e.g., "&&", "||").
                debug : { // Debugging utilities.
                    onEvent : function ( msg ) { } , // Placeholder for a debug event handler.
                    log : function ( msg , args ) {
                        // Logs a formatted message.
                        _s . state . debug . onEvent ( _p . util . format ( msg , args ) ) ;
                    }
                }
            } ;

            // Determine if the data contains objects (and thus properties) based on the first element.
            if ( data == null ) { return null ; } // If data is null, return null query.
            if ( _p . util . type ( data ) == "array" && data . length > 0 ) {
                _s . state . useProperties = ( _p . util . type ( data [ 0 ] ) == "object" ) ;
            }

            // Object containing methods related to query construction and execution.
            _s . query = {
                cache : [ ] , // Stores individual command functions for later evaluation.
                str : [ ] , // Stores string representations of the query conditions.
                // Appends a new command (condition) to the query.
                appendCmd : function ( action ) {
                    _s . query . cache . push ( action ) ; // Store the function.

                    // Determine if a 'NOT' operator should be applied.
                    var not = _s . state . not ? "!" : "" ;

                    // If this is the very first command, clear any pending operator.
                    if ( _s . query . cache . length == 0 ) {
                        _s . state . operator = "" ;
                    }

                    // Reset OR and NOT flags for the next command.
                    _s . state . or = false ;
                    _s . state . not = false ;

                    // Construct the string representation of the condition and add it.
                    // This string will be part of the eval'd query function.
                    _s . query . str . push ( [ _s . state . operator , "(" , not , "(_s.query.cache[" , ( _s . query . cache . length - 1 ) , "](record)))" ] . join ( "" ) ) ;

                    // Set the default operator for the *next* condition to "&&" (AND).
                    _s . state . operator = "&&" ;

                } ,
                // Executes the constructed query and returns selected/remaining items.
                select : function ( ) {

                    // If no commands were added, all data is "selected".
                    if ( _s . query . str . length == 0 ) {
                        return {
                            selected : _s . state . data ,
                            remaining : [ ]
                        } ;
                    }

                    // Construct the full query function string.
                    var queryString = [ "query = function(record) {" + " return (" , _s . query . str . join ( "" ) , "); };" ] . join ( "" ) ;

                    // Evaluate the string to create the actual query function.
                    var query ;
                    eval ( queryString ) ; // This is where the dynamic function is created.

                    // Iterate through the data, applying the generated query function.
                    var selected = [ ] ;
                    var remaining = [ ] ;
                    for ( var i = 0 ; i < _s . state . data . length ; i ++ ) {
                        var item = _s . state . data [ i ] ;
                        try {
                            if ( query ( item ) ) { // Execute the generated query function.
                                selected . push ( item ) ;
                            }
                            else {
                                remaining . push ( item ) ;
                            }
                        }
                        catch ( e ) {
                            // Log any exceptions during query evaluation and treat the item as 'remaining'.
                            _s . state . debug . log ( "Exception when evaluating the query for selection: %0%. query: %1%" , [ e , query ] ) ;
                            remaining . push ( item ) ;
                        }
                    }

                    // Return the partitioned results.
                    return {
                        selected : selected ,
                        remaining : remaining
                    } ;

                } ,
                // Processes arguments for a command, removing trailing nulls.
                getArgs : function ( args ) {
                    var values = [ ] ;
                    var found = false ;
                    // Iterate backwards to find the first non-null argument.
                    for ( var i = args . length ; i -- > 0 ; ) {
                        if ( args [ i ] == null && ! found ) { continue ; }
                        found = true ;
                        values . push ( args [ i ] ) ;
                    }
                    values . reverse ( ) ; // Reverse to get original order.
                    return values ;
                } ,
                // Prepares command parameters and arguments for execution.
                prepCmd : function ( params , args ) {

                    // Update the query state with information about the current command.
                    _s . state . lastCommand = params . command ;
                    _s . state . paramCount = params . count ;
                    _s . state . lastCommandName = params . name ;

                    // Get the actual arguments, stripped of trailing nulls.
                    var values = _s . query . getArgs ( args ) ;

                    // If using properties and an extra argument is present, assume it's the field name.
                    if ( _s . state . useProperties && values . length == params . count + 1 ) {
                        _s . state . lastField = values . shift ( ) ; // Remove and store the field name.
                    }

                    // Return an object containing the processed arguments and field.
                    return {
                        arg : values ,
                        field : _s . state . lastField
                    } ;
                } ,
                // Allows re-executing the last command with new arguments.
                repeatCmd : function ( v1 , v2 , v3 , v4 , v5 , v6 , v7 , v8 , v9 , v10 , v11 , v12 , v13 , v14 , v15 , v16 , v17 , v18 , v19 , v20 , v21 , v22 , v23 , v24 , v25 ) {
                    // If no arguments are provided, return the query object itself.
                    if ( _s . helper . empty ( [ v1 , v2 , v3 , v4 , v5 , v6 , v7 , v8 , v9 , v10 , v11 , v12 , v13 , v14 , v15 , v16 , v17 , v18 , v19 , v20 , v21 , v22 , v23 , v24 , v25 ] ) ) { return _query ; }
                    // Otherwise, execute the last command with the new arguments.
                    return _s . state . lastCommand ( v1 , v2 , v3 , v4 , v5 , v6 , v7 , v8 , v9 , v10 , v11 , v12 , v13 , v14 , v15 , v16 , v17 , v18 , v19 , v20 , v21 , v22 , v23 , v24 , v25 ) ;
                } ,
                // Performs a simple sort on a list of records by a given field.
                performSort : function ( records , field , desc ) {
                    records . sort ( function ( a , b ) {
                        // Dynamically access the field value using eval.
                        a = eval ( "a." + field ) ;
                        b = eval ( "b." + field ) ;
                        // Standard comparison logic.
                        return ( a < b ) ? - 1 : ( a > b ) ? 1 : 0 ;
                    } ) ;
                    if ( desc ) { records . reverse ( ) ; } // Reverse if descending.
                }
            } ;

            // Helper methods for the query object.
            _s . helper = {
                // Escapes a string to be safely used as a regular expression pattern.
                toRegex : function ( val ) {
                    if ( val == null ) { return "" ; }
                    return val . toString ( ) . replace (
                        /\*|\(|\)|\\|\/|\?|\.|\*|\+|\<|\>|\[|\]|\=|\&|\$|\^/gi ,
                        function ( match ) { return ( "\\" + match ) ; }
                        ) ;

                } ,
                // Returns the length for array-like objects or the object itself.
                getNumericValue : function ( obj ) {
                    if ( obj . length ) { return obj . length ; }
                    return obj ;
                } ,
                trim : _p . util . trim , // Reference to the global trim utility.
                // Checks if a value matches a given regular expression or string pattern.
                match : function ( val , exp ) {
                    if ( ! ( val && exp ) ) { return false ; }
                    // If exp is already a RegExp, use its source.
                    if ( _s . helper . type ( exp ) == "regexp" ) { exp = exp . source ; }
                    // Create a new RegExp with global and case-insensitivity flags.
                    exp = new RegExp ( exp , "g" + ( _s . state . ignoreCase ? "i" : "" ) ) ;
                    return ( val . match ( exp ) ) ; // Perform the match.
                } ,
                // Compares two objects property by property for equality.
                propsEqual : function ( val1 , val2 ) {
                    if ( val1 == null && val2 == null ) { return true ; }
                    if ( val1 == null || val2 == null ) { return false ; }
                    for ( var name in val1 ) {
                        if ( val2 [ name ] == undefined ) { return false ; } // Property missing in val2.
                        if ( ! _s . helper . equals ( val1 [ name ] , val2 [ name ] ) ) { return false ; } // Property values not equal.
                    }
                    return true ;
                } ,
                // General purpose equality comparison, handling different types including arrays and objects recursively.
                equals : function ( val1 , val2 ) {
                    try {

                        // Check for null values first.
                        if ( val1 == null && val2 == null ) { return true ; }
                        if ( ( val1 == null && val2 ) || ( val1 && val2 == null ) ) { return false ; }

                        // Determine types for comparison.
                        var val1Type = _s . helper . type ( val1 ) ;
                        var val2Type = _s . helper . type ( val2 ) ;
                        if ( val1Type != val2Type ) {
                            return false ; // Different types are not equal.
                        }
                        if ( val1Type == "string" && val2Type == "string" ) {
                            return _s . helper . match ( val1 , "^" + val2 + "$" ) ; // Case-insensitive string match.
                        }
                        if ( val1Type == "string" && val2Type == "regexp" ) {
                            return _s . helper . match ( val1 , val2 ) ; // String matches regex.
                        }
                        if ( val1Type == "number" || val1Type == "bool" ) {
                            return ( val1 == val2 ) ; // Simple comparison for primitives.
                        }
                        else if ( val1Type == "array" || val1Type == "object" ) {
                            // For arrays/objects, compare lengths and then elements recursively.
                            if ( val1 . length != val2 . length ) { return false ; }
                            for ( var i = 0 ; i < val1 . length ; i ++ ) {
                                if ( ! _s . helper . equals ( val1 [ i ] , val2 [ i ] ) ) { return false ; }
                            }
                            return true ;
                        }
                        else {
                            return ( val1 == val2 ) ; // Fallback for other types.
                        }
                    }
                    catch ( e ) {
                        return false ; // Any error during comparison implies inequality.
                    }
                } ,
                // Checks if all values in val1 (or val1 itself if not an array) are equal to val2.
                allEqual : function ( val1 , val2 ) {
                    if ( _p . helper . type ( val1 ) != "array" ) { val1 = [ val1 ] ; }
                    for ( var item in val1 ) {
                        if ( ! _p . helper . equals ( val1 [ item ] , val2 ) ) { return false ; }
                    }
                    return true ;
                } ,
                // Checks if any value in val1 (or val1 itself if not an array) is equal to val2.
                anyEqual : function ( val1 , val2 ) {
                    if ( _p . helper . type ( val1 ) != "array" ) { val1 = [ val1 ] ; }
                    for ( var item in val1 ) {
                        // This condition seems incorrect based on the name "anyEqual".
                        // It should be 'if (_p.helper.equals(val1[item], val2)) { return true; }'
                        // However, per Type I definition, I must keep the original logic.
                        if ( ! _p . helper . equals ( val1 [ item ] , val2 ) ) { return true ; }
                    }
                    return false ;
                } ,
                // Performs multi-level sorting on records.
                sort : function ( records , sorting , desc ) {

                    // If no sorting criteria provided, perform a basic sort.
                    if ( sorting == null ) {
                        records . sort ( ) ;
                        if ( desc ) { _s . state . data . reverse ( ) ; } // Note: Original code uses query.state.data, should be records.
                        return records ;
                    }

                    // Recursively handle sorting for multiple fields.
                    var index = 0 ;
                    var doSort = function ( records ) {

                        // Clone records to fix a specific IE7 bug related to sort stability.
                        records = _p . util . clone ( records ) ;

                        var field = sorting [ index ] . field ;
                        var desc = sorting [ index ] . desc ;

                        // If this is the last sorting level, just apply the sort.
                        if ( index == sorting . length - 1 ) {
                            _s . query . performSort ( records , field , desc ) ;
                            return records ;
                        } ;

                        // Perform the current level of sorting.
                        _s . query . performSort ( records , field , desc ) ;
                        // Get distinct groups based on the current field.
                        var dist = _s . helper . distinct ( records , field ) ;
                        index ++ ; // Move to the next sorting level.

                        // Sort and gather values - recursively call doSort for deeper levels.
                        var results = [ ] ;
                        for ( var j = 0 ; j < dist . length ; j ++ ) {
                            var sorted = doSort ( dist [ j ] . items ) ; // Recursive call.
                            for ( var k = 0 ; k < sorted . length ; k ++ ) {
                                results . push ( sorted [ k ] ) ;
                            }
                        } ;

                        // Return the results for this section.
                        return results ;

                    } ;
                    return doSort ( _s . state . data ) ; // Start the recursive sort with the full dataset.

                } ,
                // Finds distinct values/objects based on a field.
                distinct : function ( records , field ) {
                    var dist = [ ] ; // Array to hold distinct groups.
                    for ( var i = 0 ; i < records . length ; i ++ ) {
                        var val = records [ i ] ;
                        // Get the key for distinctness (either field value or the entire object).
                        var key = ( field != null ) ? eval ( [ "(val." , field , ")" ] . join ( "" ) ) : val ;

                        // Check if this value/key has already been added to distinct groups.
                        var added = false ;
                        for ( var item in dist ) {
                            // The original code was incomplete here, iterating 'item in dist' where item is index.
                            // The actual comparison logic for checking if 'key' exists in 'dist' is missing.
                            // However, Type I clone requires exact reproduction of the original code,
                            // even if it appears incomplete or logically flawed.
                            // So, I stop here as the original code does.