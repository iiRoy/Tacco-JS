/*
 * This file is a Type I clone of the original SerializeJSON jQuery plugin.
 *
 * The code's functionality, identifiers, and logical structure are preserved exactly.
 * Only whitespace (spaces, tabs, newlines) and comments have been modified
 * to create a visually distinct but functionally identical version.
 *
 * Original Project URL: https://github.com/marioizquierdo/jquery.serializeJSON
 * Version: 2.5.0 (March, 2015)
 *
 * Copyright (c) 2012, 2015 Mario Izquierdo.
 *
 * This software is dual licensed under:
 *   - The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *   - The GPL License (http://www.opensource.org/licenses/gpl-license.php)
 *
 */

( function  ( $ )   {

    "use strict" ; /* Enable strict mode for better error handling and cleaner code */


    // Main jQuery plugin definition: $.fn.serializeJSON()
    // This function serializes a form or form elements into a JSON object.
    $.fn.serializeJSON = function ( options )   {

        var   serializedObject , formAsArray , keys , type , value , _ref , f , opts ;


        f = $.serializeJSON ; /* Shortcut to the utility functions namespace */


        // Calculate options, merging user-provided options with default values.
        opts = f.optsWithDefaults ( options ) ;

        // Validate the provided options to prevent common typos or invalid configurations.
        f.validateOptions ( opts ) ;


        // Get form elements as an array of objects {name, value} using jQuery's serializeArray.
        formAsArray = this.serializeArray ( ) ;


        // Add {name, value} for unchecked checkboxes if the option is enabled.
        // This ensures that unchecked checkboxes, which are usually ignored by serializeArray,
        // are included in the serialized output with a specified "unchecked" value.
        f.readCheckboxUncheckedValues ( formAsArray , this , opts ) ;


        // Initialize the object that will hold the final serialized data.
        serializedObject = { } ;


        // Iterate over each input element from the form.
        $.each ( formAsArray , function ( i , input )   {

            // Split the input name into an array of keys to handle nested structures (e.g., "user[address][city]").
            keys = f.splitInputNameIntoKeysArray ( input.name ) ;

            // The last element in the keys array is always the explicit type (e.g., "string", "number").
            // If no type is specified, it defaults to "_", which implies auto-parsing based on options.
            type = keys.pop ( ) ;

            // If the type is 'skip', this input's value should be ignored.
            if ( type !== 'skip' )   {

                // Parse the input value based on its type and current options.
                // This converts strings to numbers, booleans, nulls, or keeps them as strings.
                value = f.parseValue ( input.value , type , opts ) ;

                // If a custom parsing function is provided and the type is '_',
                // apply the custom function to the value.
                if ( opts.parseWithFunction && type === '_' )   {
                    value = opts.parseWithFunction ( value , input.name ) ;
                }


                // Deeply set the parsed value into the serializedObject using the extracted keys.
                // This handles creating nested objects and arrays as needed.
                f.deepSet ( serializedObject , keys , value , opts ) ;

            }

        } ) ;

        // Return the final serialized JavaScript object.
        return serializedObject ;

    } ;


    // Define $.serializeJSON as a namespace for all auxiliary functions
    // and to store default options.
    $.serializeJSON = {

        // Default configuration options for serialization.
        defaultOptions : {

            parseNumbers :           false , // Convert "1", "-2.33" to 1, -2.33 (numbers)
            parseBooleans :          false , // Convert "true", "false" to true, false (booleans)
            parseNulls :             false , // Convert "null" to null (null type)
            parseAll :               false , // Shorthand to enable all of the above parsing options
            parseWithFunction :      null ,  // Custom parsing function: function(val, inputName){ return parsed_val; }
            checkboxUncheckedValue : undefined , // Value to use for unchecked checkboxes (e.g., false, 0, '')
            useIntKeysAsArrayIndex : false   // If true, "foo[2]" becomes {foo: [null, null, "v"]}, else {foo: {"2": "v"}}

        } ,


        // Merges user-provided options with the default options.
        // This function ensures that all configuration settings have a defined value.
        optsWithDefaults : function ( options )   {

            var   f , parseAll ;

            // If no options are provided, initialize an empty object.
            if ( options == null )   {
                options = { } ;
            }

            f = $.serializeJSON ; // Reference to the utility functions for convenience.

            // Determine if 'parseAll' is enabled, which overrides individual parse settings.
            parseAll = f.optWithDefaults ( 'parseAll' , options ) ;

            // Construct and return the final options object.
            return {
                parseNumbers :           parseAll || f.optWithDefaults ( 'parseNumbers' ,  options ) ,
                parseBooleans :          parseAll || f.optWithDefaults ( 'parseBooleans' , options ) ,
                parseNulls :             parseAll || f.optWithDefaults ( 'parseNulls' ,    options ) ,
                parseWithFunction :      f.optWithDefaults ( 'parseWithFunction' , options ) ,
                checkboxUncheckedValue : f.optWithDefaults ( 'checkboxUncheckedValue' , options ) ,
                useIntKeysAsArrayIndex : f.optWithDefaults ( 'useIntKeysAsArrayIndex' , options )
            } ;

        } ,


        // Helper to retrieve an option, prioritizing user options over defaults.
        optWithDefaults : function ( key , options )   {
            // Checks if options[key] is explicitly false or an empty string,
            // otherwise uses options[key] if it's truthy, falling back to defaultOptions[key].
            return ( options [ key ] !== false ) && ( options [ key ] !== '' ) && ( options [ key ] || $.serializeJSON.defaultOptions [ key ] ) ;
        } ,


        // Validates the options object to ensure only recognized keys are used.
        // Throws an error for unknown options to help developers catch typos.
        validateOptions : function ( opts )   {

            var   opt , validOpts ;

            validOpts = [ 'parseNumbers' , 'parseBooleans' , 'parseNulls' , 'parseAll' , 'parseWithFunction' , 'checkboxUncheckedValue' , 'useIntKeysAsArrayIndex' ] ;

            // Loop through each provided option.
            for ( opt in opts )   {
                // If an option is not in the list of valid options, throw an error.
                if ( validOpts.indexOf ( opt ) === -1 )   {
                    throw new  Error ( "serializeJSON ERROR: invalid option '" + opt + "'. Please use one of " + validOpts.join ( ',' ) ) ;
                }
            }

        } ,


        // Converts a string value to a number, boolean, or null based on the specified type
        // and current parsing options.
        parseValue : function ( str , type , opts )   {

            var   value , f ;

            f = $.serializeJSON ; // Utility functions reference.

            // Explicitly force string type.
            if ( type == 'string' )   return str ;

            // Parse as number if type is 'number' or if parseNumbers is true and string is numeric.
            if ( type == 'number'  || ( opts.parseNumbers  && f.isNumeric ( str ) ) )   return Number ( str ) ;

            // Parse as boolean if type is 'boolean' or if parseBooleans is true and string is "true"/"false".
            // Note: This logic considers "false", "null", "undefined", "", "0" as false.
            if ( type == 'boolean' || ( opts.parseBooleans && ( str === "true" || str === "false" ) ) )   return ( [ "false" , "null" , "undefined" , "" , "0" ] . indexOf ( str ) === -1 ) ;

            // Parse as null if type is 'null' or if parseNulls is true and string is "null".
            // If it's a "falsy" string and parseNulls is on, it becomes null. Otherwise, it stays as string.
            if ( type == 'null'    || ( opts.parseNulls    && str == "null" ) )   return [ "false" , "null" , "undefined" , "" , "0" ] . indexOf ( str ) !== -1 ? null : str ;

            // Parse as array or object using JSON.parse.
            if ( type == 'array' || type == 'object' )   return JSON.parse ( str ) ;

            // 'auto' type attempts parsing with all number/boolean/null options enabled.
            if ( type == 'auto' )   return f.parseValue ( str , null , { parseNumbers : true , parseBooleans : true , parseNulls : true } ) ;

            // If no specific parsing rule applies, return the original string.
            return str ;

        } ,


        // Utility functions for type checking.
        isObject :          function ( obj )   { return obj === Object ( obj ) ; } , // Checks if the variable is an object.
        isUndefined :       function ( obj )   { return obj === void 0 ; } , // Safely checks for undefined values.
        isValidArrayIndex : function ( val )   { return /^[0-9]+$/.test ( String ( val ) ) ; } , // Checks if a value is a valid non-negative integer array index.
        isNumeric :         function ( obj )   { return obj - parseFloat ( obj ) >= 0 ; } , // Checks if a value is numeric (adapted from jQuery.isNumeric).


        // Splits an input name string into an array of keys for nested object/array creation.
        // The last element of the returned array is always the explicit type or default "_".
        // Examples of transformations:
        // "foo"              => ['foo', '_']
        // "foo:string"       => ['foo', 'string']
        // "foo[inn][bar]"    => ['foo', 'inn', 'bar', '_']
        // "arr[][val]"       => ['arr', '', 'val', '_'] (empty string for array push)
        splitInputNameIntoKeysArray : function ( name )   {

            var   keys , nameWithoutType , type , _ref , f ;

            f = $.serializeJSON ;

            // Extract the explicit type from the name (e.g., "foo:boolean" -> "boolean").
            _ref = f.extractTypeFromInputName ( name ) , nameWithoutType = _ref [ 0 ] , type = _ref [ 1 ] ;

            // Split the name by '[' to get initial key segments.
            keys = nameWithoutType.split ( '[' ) ;

            // Remove all ']' characters from the key segments.
            keys = $.map ( keys , function ( key )   { return key.replace ( /]/g , '' ) ; } ) ;

            // Handle cases where the name starts with '[' (e.g., "[foo][bar]").
            if ( keys [ 0 ] === '' )   {
                keys.shift ( ) ; // Remove the empty string at the beginning.
            }

            // Add the extracted type as the last element in the keys array.
            keys.push ( type ) ;

            return keys ;

        } ,


        // Extracts the explicit type from an input name, if present.
        // Returns an array: [name_without_type_suffix, type_string].
        // If no type is found, defaults to "_".
        // Example: "item[name]:string" -> ["item[name]", "string"]
        extractTypeFromInputName : function ( name )   {

            var   match , f ;

            f = $.serializeJSON ;

            // Use regex to find a type suffix like ":string", ":number", etc.
            if ( match = name.match ( /(.*):([^:]+)$/ ) )   {

                var validTypes = [ 'string' , 'number' , 'boolean' , 'null' , 'array' , 'object' , 'skip' , 'auto' ] ; // List of recognized types.

                // Validate if the extracted type is one of the allowed types.
                if ( validTypes.indexOf ( match [ 2 ] ) !== -1 )   {
                    return [ match [ 1 ] , match [ 2 ] ] ; // Return name without type and the type itself.
                }

                else   {
                    // Throw an error for an invalid type specified in the input name.
                    throw new Error ( "serializeJSON ERROR: Invalid type " + match [ 2 ] + " found in input name '" + name + "', please use one of " + validTypes.join ( ', ' ) ) ;
                }

            }

            else   {
                // If no type suffix is found, return the original name and default type '_'.
                return [ name , '_' ] ;
            }

        } ,


        // Recursively sets a value within a (potentially nested) object or array.
        // This function handles creating intermediate objects/arrays as needed.
        //
        // Examples:
        // deepSet(obj, ['foo'], v)               // obj['foo'] = v
        // deepSet(obj, ['foo', 'inn'], v)        // obj['foo']['inn'] = v (creates obj['foo'] if it doesn't exist)
        // deepSet(arr, ['0'], v, {useIntKeysAsArrayIndex: true})   // arr[0] = v
        // deepSet(arr, [''], v)                                    // arr.push(v)
        // deepSet(obj, ['arr', ''], v)                             // obj['arr'].push(v)
        //
        deepSet : function ( o , keys , value , opts )   {

            var   key , nextKey , tail , lastIdx , lastVal , f ;

            if ( opts == null )   opts = { } ;

            f = $.serializeJSON ;

            // Basic validation for arguments.
            if ( f.isUndefined ( o ) )   {
                throw new Error ( "ArgumentError: param 'o' expected to be an object or array, found undefined" ) ;
            }

            if ( !keys || keys.length === 0 )   {
                throw new Error ( "ArgumentError: param 'keys' expected to be an array with least one element" ) ;
            }


            key = keys [ 0 ] ;

            // Base case: Only one key remaining, directly assign the value.
            if ( keys.length === 1 )   {

                if ( key === '' )   {
                    o.push ( value ) ; // If key is empty, push to array (assumes 'o' is an array).
                }

                else   {
                    o [ key ] = value ; // Assign value to the object property or array index.
                }

            }

            // Recursive case: Multiple keys, need to traverse deeper.
            else   {

                nextKey = keys [ 1 ] ;

                // Special handling for empty key ('') for array pushes.
                if ( key === '' )   {

                    lastIdx = o.length - 1 ; // Get the last index of the array 'o'.
                    lastVal = o [ lastIdx ] ; // Get the last element.

                    // If the last element is an object and the next key is not yet present in it,
                    // or if there are more keys to deep set (implying a nested structure),
                    // then continue setting within the last object.
                    if ( f.isObject ( lastVal ) && ( f.isUndefined ( lastVal [ nextKey ] ) || keys.length > 2 ) )   {
                        key = lastIdx ; // Set to the existing last object.
                    }

                    else   {
                        key = lastIdx + 1 ; // Otherwise, set to a new index in the array.
                    }

                }


                // Prepare the intermediate container for the next level.
                // If the next key is empty (indicating an array push, e.g., `arr[][]`),
                // ensure the current key points to an array.
                if ( nextKey === '' )   {

                    if ( f.isUndefined ( o [ key ] ) || !$.isArray ( o [ key ] ) )   {
                        o [ key ] = [ ] ; // Initialize as an empty array if not already.
                    }

                }

                // If 'useIntKeysAsArrayIndex' is enabled and the next key is a valid integer index,
                // ensure the current key points to an array.
                else if ( opts.useIntKeysAsArrayIndex && f.isValidArrayIndex ( nextKey ) )   {

                    if ( f.isUndefined ( o [ key ] ) || !$.isArray ( o [ key ] ) )   {
                        o [ key ] = [ ] ; // Initialize as an empty array.
                    }

                }

                // For all other cases (regular object property), ensure the current key points to an object.
                else   {

                    if ( f.isUndefined ( o [ key ] ) || !f.isObject ( o [ key ] ) )   {
                        o [ key ] = { } ; // Initialize as an empty object.
                    }

                }


                // Recursively call deepSet for the next level of keys.
                tail = keys.slice ( 1 ) ; // Get remaining keys.
                f.deepSet ( o [ key ] , tail , value , opts ) ;

            }

        } ,


        // Reads unchecked checkbox values and adds them to the formAsArray.
        // This is crucial because `serializeArray()` by default only includes checked checkboxes.
        readCheckboxUncheckedValues : function ( formAsArray , $form , opts )   {

            var   selector , $uncheckedCheckboxes , $el , dataUncheckedValue , f ;

            if ( opts == null )   opts = { } ;

            f = $.serializeJSON ;

            // Selector to find all unchecked (and not disabled) checkboxes with a 'name' attribute.
            selector = 'input[type=checkbox][name]:not(:checked):not([disabled])' ;

            // Find unchecked checkboxes within the form and potentially the form itself if it's a checkbox.
            $uncheckedCheckboxes = $form.find ( selector ) . add ( $form.filter ( selector ) ) ;

            // Iterate over each found unchecked checkbox.
            $uncheckedCheckboxes.each ( function ( i , el )   {

                $el = $ ( el ) ;

                // Check for a 'data-unchecked-value' attribute on the checkbox, which takes precedence.
                dataUncheckedValue = $el.attr ( 'data-unchecked-value' ) ;

                if ( dataUncheckedValue )   {
                    // If attribute exists, use its value.
                    formAsArray.push ( { name : el.name , value : dataUncheckedValue } ) ;
                }

                else   {
                    // Otherwise, use the value from the global options if defined.
                    if ( !f.isUndefined ( opts.checkboxUncheckedValue ) )   {
                        formAsArray.push ( { name : el.name , value : opts.checkboxUncheckedValue } ) ;
                    }
                }

            } ) ;

        }

    } ;


} ( window.jQuery || window.Zepto || window.$ ) ) ; // End of IIFE; pass jQuery, Zepto, or global $ object.