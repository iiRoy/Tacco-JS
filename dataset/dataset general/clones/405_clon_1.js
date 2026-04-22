/*
 * Command-line options parser library
 *
 * This utility provides robust parsing for command-line arguments based on a predefined schema.
 * Original Author: Valeriu Paloş (valeriu@palos.ro)
 * Copyright Year: 2011
 * License: Public Domain - Feel free to use, modify, and distribute without restrictions.
 *
 * Project URL: http://valeriu.palos.ro/1026/
 *
 * Core Functionality:
 * The parser expects a 'schema' array, which defines all possible command-line options.
 * It processes an 'argv' array (typically `process.argv` in Node.js or a custom array of strings).
 *
 * Output:
 * - An 'options' object: Contains all successfully parsed options as key-value pairs.
 * - An 'arguments' array: Stores all non-option arguments encountered during parsing,
 *   including the script name and any other positional arguments.
 *
 * Schema Entry Structure:
 * Each element in the 'schema' array is an array representing an option definition:
 *   [«short», «long», «attributes», «brief», «callback»]
 *
 *   - «short»: (string, optional) The single-character short form of the option (e.g., 't' for -t).
 *   - «long»:  (string, optional) The multi-character long form of the option (e.g., 'test' for --test).
 *              At least one of «short» or «long» must be provided for every option.
 *   - «attributes»: (string) A string containing special characters that define the option's behavior:
 *     - '!': Indicates that this option is mandatory. If not provided, parsing will fail.
 *     - ':': Specifies that this option expects a parameter (value).
 *     - '+': Denotes a repeatable option. If specified multiple times, its values will be collected into an array.
 *   - «brief»: (string) A short description of the option, used in the help message.
 *   - «callback»: (function, optional) A function to be executed when this option is encountered.
 *                 It receives the option's value as an argument.
 *
 * Important Notes and Behaviors:
 * - Case Sensitivity: The parser treats option names as case-sensitive.
 * - Implicit Help Option: The '-h' or '--help' option is automatically recognized and triggers a help message.
 * - Option Storage: Parsed options and their values are stored as properties in the 'options' object.
 * - Argument Storage: Non-option command-line arguments are collected into the 'arguments' array.
 * - Parameter Separation: Options and their parameters must be separated by a space (e.g., `--file my_file.txt`, not `--file=my_file.txt`).
 * - Cumulative Short Options: Supports combining short options (e.g., '-tv' is equivalent to '-t -v').
 * - Error Handling: If any parsing error occurs (e.g., unknown option, missing mandatory option, missing parameter),
 *   the process is halted, an error message is displayed, and the help output is shown.
 * - Repeatable Options: Values for options marked with '+' will be stored in an array. If the option is specified once,
 *   the array will contain one element. If specified multiple times, all values will be pushed into the array.
 * - Duplicate Definitions: This parser does *not* validate against duplicate option definitions in the schema.
 *   The behavior for duplicate definitions is undefined and might lead to unexpected results.
 */

// Example schema definitions would typically go here.
// For instance:
// var mySchema = [
//   ['f', 'file', ':', 'Specify input file', function(val) { console.log('File set to:', val); }],
//   ['v', 'verbose', '', 'Enable verbose output'],
//   [null, 'version', '', 'Show version information'],
//   ['o', 'output', '!:', 'Mandatory output path']
// ];


function parseOptions (
    schema,
    argv
) {

    // Begin the parsing process within a try-catch block to handle errors gracefully.
    try {

        // If the argument vector is empty, it implies a request for help or invalid invocation.
        // Immediately throw 'help' to trigger the help message display.
        if ( ! argv.length )
        {
            throw 'help';
        }

        // 'tokens' array will store all individual command-line elements after initial processing.
        var tokens = [ ] ;

        // 'options' object will hold the key-value pairs of parsed options.
        var options = { } ;

        // 'arguments' array will store non-option arguments (positional arguments).
        var arguments = [ ] ;

        /*
         * First pass: Tokenize the raw argv array.
         * This loop processes each raw argument from 'argv' and breaks down
         * combined short options (like '-abc') into individual tokens ('-a', '-b', '-c').
         * Long options are split into '--' and their name.
         */
        for (
            var i = 0, item = argv[0];
            i < argv.length;
            i++, item = argv[i]
        ) {
            // Check if the current argument starts with a hyphen, indicating it's an option.
            if ( item.charAt(0) == '-' ) {

                // Check for a double hyphen, signifying a long option.
                if ( item.charAt(1) == '-' ) {
                    // Push the '--' prefix and the option name as separate tokens.
                    tokens.push( '--', item.slice(2) );
                } else {
                    // Handle short options. Break 'abc' into '-a', '-b', '-c'.
                    // `item.split('')` converts "-abc" to ["-", "a", "b", "c"].
                    // `join('-')` converts ["-", "a", "b", "c"] to "-a-b-c".
                    // `split('')` converts "-a-b-c" to ["-", "a", "-", "b", "-", "c"].
                    // `slice(1)` removes the first "-" to get ["a", "-", "b", "-", "c"].
                    // This is an unusual way to split, but it's part of the original logic.
                    // The intent is likely to get ['a', 'b', 'c'] for '-abc' and then prepend '-' to each.
                    // The original implementation seems to have a bug here, or it expects specific input.
                    // The effect of `item.split('').join('-').split('').slice(1)` for '-abc' is actually
                    // `["a", "-", "b", "-", "c"]` which will then be processed as separate tokens.
                    // This is the literal interpretation of the original code, maintaining its behavior.
                    tokens = tokens.concat( item.split('').join('-').split('').slice(1) );
                }
            } else {
                // If it doesn't start with a hyphen, it's a non-option argument.
                tokens.push( item );
            }
        }

        /*
         * Second pass: Process the tokenized arguments.
         * This loop iterates through the 'tokens' array, identifying options and their values,
         * and populating the 'options' object and 'arguments' array.
         */
        var type; // Declare `type` outside the while loop for broader scope if needed, though here it's used as part of the condition.
        while ( type = tokens.shift() ) { // `tokens.shift()` removes and returns the first element, assigning it to `type`.

            // Check if the current token is an option prefix ('-' for short, '--' for long).
            if ( type == '-' || type == '--' ) {
                // The next token should be the actual option name.
                var name = tokens.shift();

                // Special handling for the implicit help option.
                if ( name == 'help' || name == 'h' ) {
                    throw 'help'; // Trigger help display.
                    // The `continue` here is technically unreachable because `throw` exits the block.
                    // It's preserved for exact Type I cloning.
                    continue;
                }

                // Initialize `option` to null. It will hold the matching schema definition.
                var option = null;

                // Search the schema for a matching option definition.
                // The `type.length - 1` logic distinguishes between short (length 1: '-') and long (length 2: '--') options.
                // For '-', type.length - 1 = 0, checking `item[0]` (short name).
                // For '--', type.length - 1 = 1, checking `item[1]` (long name).
                for ( var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i] ) {
                    if ( item[ type.length - 1 ] == name ) {
                        option = item; // Found a match.
                        break;         // Exit loop early.
                    }
                }

                // If no matching option was found in the schema, it's an unknown option.
                if ( ! option ) {
                    throw "Unknown option " + type + name + " encountered.";
                }

                // Default value for an option is true (for boolean flags).
                var value = true;

                // Check if the option expects a parameter (attribute ':').
                // If it expects a parameter AND the next token (which would be the parameter) is missing, throw an error.
                if ( ( option[2].indexOf(':') != -1 ) && !( value = tokens.shift() ) ) {
                    throw "Option " + type + name + " expects a parameter.";
                }

                // Determine the key to use in the 'options' object (prefer long name, then short name).
                var index = option[1] || option[0];

                // Check if the option is repeatable (attribute '+').
                if ( option[2].indexOf('+') != -1 ) {
                    // If it's repeatable, ensure its value in 'options' is an array.
                    // If it's not an array yet, initialize it as an empty array.
                    options[index] = options[index] instanceof Array ? options[index] : [];
                    // Push the current value into the array.
                    options[index].push(value);
                } else {
                    // If not repeatable, just assign the value directly.
                    options[index] = value;
                }

                // If a callback function is defined for this option, execute it with the value.
                if ( typeof(option[4]) == 'function' ) {
                    option[4](value);
                }

                // Remove the '!' attribute from the option's attribute string.
                // This is a side effect on the schema definition itself, marking that a mandatory option has been seen.
                // This is crucial for the final mandatory check.
                option[2] = option[2].replace('!', '');

            } else {
                // If the token is not an option prefix, it's a non-option argument.
                arguments.push(type);
                // Continue to the next token.
                continue;
            }
        }

        // Final check: Iterate through the schema again to ensure all mandatory options (those still having '!' in their attributes) were provided.
        for ( var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i] ) {
            if ( item[2].indexOf('!') != -1 ) {
                // If '!' is still present, the mandatory option was not encountered.
                throw "Option " + ( item[1] ? '--' + item[1] : '-' + item[0] ) +
                      " is mandatory and was not given.";
            }
        }

    } catch (e) {
        // Handle exceptions during parsing.
        // If the error is not 'help' (meaning it's a genuine parsing error), print it.
        if ( e !== 'help' ) {
            write("Error: " + e + "\n");
        }

        // Display usage information. (Note: `write` is assumed to be a globally available function, e.g., console.log).
        write("Usage: coffee [options] path/to/script.coffee");
        write("\nOptions:");

        // Generate and display the detailed options list from the schema.
        for ( var i = 0, item = schema[0]; i < schema.length; i++, item = schema[i] ) {
            // Construct the names string (e.g., "-f, --file" or "--file").
            var names = ( item[0] ? '-' + item[0] + ( item[1] ? ', ' : '' ) : '   ' ) +
                        ( item[1] ? '--' + item[1] : '' );

            // Construct the syntax string (names plus parameter placeholder if applicable).
            // `item[4]` here is the brief description, but it's used as a parameter placeholder in the syntax display.
            // This is a semantic detail of the original code's help formatting.
            var syntax = names + ( item[2].indexOf(':') == -1 ? '' : ' ' + item[4] );

            // Pad the syntax string with spaces to align the descriptions.
            syntax += syntax.length < 20 ? new Array(20 - syntax.length).join(' ') : '';

            // Output the formatted option line.
            // '*' for mandatory, '+' for repeatable.
            write("\n  " + ( item[2].indexOf('!') != -1 ? '*' : ' ' )
                             + ( item[2].indexOf('+') != -1 ? '+' : ' ' )
                             + syntax + "\t" + item[3] );
        }
        // In case of any error or help request, return false to indicate failure or help display.
        return false;
    }

    // If parsing completes successfully, return an object containing the parsed options and arguments.
    return {
        options: options,
        arguments: arguments
    };

}