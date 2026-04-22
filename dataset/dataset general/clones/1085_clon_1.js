/*
 * This file implements the Levenshtein distance algorithm.
 *
 * It uses a Universal Module Definition (UMD) pattern to support
 * various environments: AMD (RequireJS), CommonJS (Node.js), and
 * browser globals.
 */
( function ( root_object, module_factory ) {
    // Check for Asynchronous Module Definition (AMD) environment.
    // This typically means a loader like RequireJS is present.
    if  (  typeof define === 'function'  &&  typeof define.amd  === 'object'  &&  define.amd  )
    {
        // Define the module using AMD syntax.
        // The factory function will be called with the root object.
        define( function ( )
        {
            return module_factory( root_object );
        } );
    }
    // Check for CommonJS environment, typically Node.js.
    else  if  (  typeof module  ===  'object'  &&  module  &&  module.exports  )
    {
        // Export the module for CommonJS.
        // The factory function is called with the root object.
        module.exports = module_factory( root_object );
    }
    // If neither AMD nor CommonJS, assume a browser global environment.
    else
    {
        // Attach the Levenshtein object to the global root object (e.g., window).
        root_object.Levenshtein = module_factory( root_object );
    }
} ( this, function ( root_global_object )
{

    /**
     * Executes a provided function once for each array element.
     * Similar to Array.prototype.forEach, but for generic arrays/array-like objects.
     * @param {Array} array - The array to iterate over.
     * @param {Function} fn - The function to execute for each element.
     *                          It receives (element, index, array).
     */
    function forEach ( array_to_iterate, callback_function )
    {
        var  current_index;    // Loop counter for iteration.
        var  array_length;     // Stores the length of the array to avoid repeated access.

        current_index = -1;
        array_length  = array_to_iterate.length;

        // Loop through the array, incrementing the index before each check.
        while ( ++current_index < array_length )
        {
            // Call the provided function with the current element, its index, and the array itself.
            callback_function( array_to_iterate[ current_index ], current_index, array_to_iterate );
        }
    }


    /**
     * Creates a new array with the results of calling a provided function
     * on every element in the calling array.
     * @param {Array} original_array - The array to map over.
     * @param {Function} mapping_function - Function that produces an element of the new Array.
     * @returns {Array} A new array with each element being the result of the callback function.
     */
    function map ( original_array, mapping_function )
    {
        var  mapped_result_array; // The array to store the results of the mapping.

        // Initialize the result array with the same length as the original array.
        mapped_result_array = Array( original_array.length );

        // Iterate over the original array using the custom forEach helper.
        forEach( original_array, function ( value_element, element_index, full_array )
        {
            // Apply the mapping function and store the result in the new array.
            mapped_result_array[ element_index ] = mapping_function( value_element, element_index, full_array );
        } );

        return mapped_result_array;
    }


    /**
     * Executes a reducer function (that you provide) on each element of the array,
     * resulting in a single output value.
     * Note: This implementation assumes the accumulator is always updated and returned.
     *       It doesn't handle the initial accumulator being optional or different `fn` signatures.
     * @param {Array} data_array - The array to iterate over.
     * @param {Function} reducer_function - The function to execute on each element.
     * @param {*} initial_accumulator - The initial value of the accumulator.
     * @returns {*} The single value that results from the reduction.
     */
    function reduce ( data_array, reducer_function, initial_accumulator )
    {
        var  current_accumulator_value = initial_accumulator; // Initialize the accumulator.

        // Iterate over the array.
        forEach( data_array, function ( current_value, current_index, complete_array )
        {
            // Update the accumulator with the result of the reducer function.
            current_accumulator_value = reducer_function( current_value, current_index, complete_array );
        } );

        return current_accumulator_value;
    }


    // The main Levenshtein distance calculation constructor.
    // It calculates and stores the distance between two strings,
    // and also retains the full distance matrix for inspection.
    function Levenshtein ( source_string_m, target_string_n )
    {
        var  previous_row_distances; // Stores the distances from the previous row of the matrix.
        var  current_row_distances;  // Stores the distances for the current row being calculated.
        var  distance_matrix;        // The 2D array representing the Levenshtein distance matrix.

        // Initialize the matrix property on the instance.
        distance_matrix = this._matrix = [ ];

        // --- Handle edge cases and trivial scenarios first for efficiency ---

        // If the strings are identical, the distance is 0.
        if ( source_string_m === target_string_n )
        {
            return ( this.distance = 0 );
        }
        // If the first string is empty, the distance is the length of the second string
        // (all insertions).
        else if ( source_string_m === '' )
        {
            return ( this.distance = target_string_n.length );
        }
        // If the second string is empty, the distance is the length of the first string
        // (all deletions).
        else if ( target_string_n === '' )
        {
            return ( this.distance = source_string_m.length );
        }
        // --- If no trivial case, proceed with the full dynamic programming algorithm ---
        else
        {
            // Initialize the first row (row 0) of the distance matrix.
            // This represents the cost of transforming an empty string to a prefix of str_m.
            previous_row_distances = [ 0 ];
            forEach( source_string_m, function ( char_m, index_m )
            {
                // Fill the first row: previous[i] = i
                // The index needs to be 1-based for the matrix.
                index_m++;
                previous_row_distances[ index_m ] = index_m;
            } );

            // Store the first row in the matrix.
            distance_matrix[ 0 ] = previous_row_distances;

            // Iterate through the characters of the target string (str_n).
            forEach( target_string_n, function ( n_char_value, n_char_index )
            {
                var  adjusted_n_index = ++n_char_index; // Adjust to 1-based index for matrix.

                // Initialize the current row with the cost of transforming an empty string
                // to the current prefix of str_n.
                current_row_distances = [ adjusted_n_index ];

                // Iterate through the characters of the source string (str_m) for the current row.
                forEach( source_string_m, function ( m_char_value, m_char_index )
                {
                    var  adjusted_m_index = ++m_char_index; // Adjust to 1-based index for matrix.

                    // Check if the characters at the current positions are the same.
                    if ( source_string_m.charAt( adjusted_m_index - 1 ) === target_string_n.charAt( adjusted_n_index - 1 ) )
                    {
                        // If characters match, no cost for substitution,
                        // so take the distance from the diagonal (previous row, previous column).
                        current_row_distances[ adjusted_m_index ] = previous_row_distances[ adjusted_m_index - 1 ];
                    }
                    else
                    {
                        // If characters don't match, calculate the minimum of three operations:
                        // 1. Deletion: cost from (previous row, current column) + 1
                        // 2. Insertion: cost from (current row, previous column) + 1
                        // 3. Substitution: cost from (previous row, previous column) + 1
                        current_row_distances[ adjusted_m_index ] = Math.min
                        (
                            previous_row_distances[ adjusted_m_index ]     + 1,   // Cost of deletion from str_m
                            current_row_distances[  adjusted_m_index - 1 ] + 1,   // Cost of insertion into str_m
                            previous_row_distances[ adjusted_m_index - 1 ] + 1    // Cost of substitution
                        );
                    }
                } );

                // The current row becomes the previous row for the next iteration.
                previous_row_distances = current_row_distances;
                // Add the completed row to the matrix.
                distance_matrix[ distance_matrix.length ] = previous_row_distances;
            } );

            // The final Levenshtein distance is the value in the bottom-right cell of the matrix.
            return ( this.distance = current_row_distances[ current_row_distances.length - 1 ] );
        }
    }


    /**
     * Returns a string representation of the Levenshtein distance matrix.
     * This method is also aliased as `inspect` for Node.js console output.
     * @param {boolean} [suppress_output] - An unused parameter, kept for compatibility.
     * @returns {string} A formatted string representing the distance matrix.
     */
    Levenshtein.prototype.toString = Levenshtein.prototype.inspect = function inspect_matrix_representation ( suppress_output_flag )
    {
        var  full_distance_matrix; // The 2D array of distances.
        var  maximum_value_in_matrix; // The largest distance value, used for formatting.
        var  padding_buffer_string;   // A string of spaces for consistent cell width.
        var  separator_line_array;    // Array to build the horizontal separator line.
        var  formatted_rows_array;    // Array of strings, each representing a formatted row.

        // Retrieve a copy of the internal matrix.
        full_distance_matrix = this.getMatrix( );

        // Determine the maximum value in the entire matrix to calculate required cell width.
        maximum_value_in_matrix = reduce( full_distance_matrix, function ( current_max, row_object )
        {
            // For each row, find its maximum value and compare with the overall max.
            return Math.max( current_max, reduce( row_object, Math.max, 0 ) );
        }, 0 ); // Start with 0 as initial max.

        // Create a padding string (e.g., "   " for max value 999)
        padding_buffer_string = Array( ( '' + maximum_value_in_matrix ).length ).join( ' ' );

        // --- Construct the separator line for between rows ---
        separator_line_array = [ ];
        // Ensure there's at least one row to get length, otherwise default to 0.
        while ( separator_line_array.length < ( full_distance_matrix[ 0 ] && full_distance_matrix[ 0 ].length || 0 ) )
        {
            // Each segment of the separator matches the width of a cell plus a space for the '|'.
            separator_line_array[ separator_line_array.length ] = Array( padding_buffer_string.length + 1 ).join( '-' );
        }
        // Join segments with '-+' and add a final '-' for the right edge.
        var  final_separator_string = separator_line_array.join( '-+' ) + '-';

        // --- Format each row of the matrix ---
        formatted_rows_array = map( full_distance_matrix, function ( single_row )
        {
            var  cell_strings_in_row; // Array of formatted strings for cells in the current row.

            cell_strings_in_row = map( single_row, function ( cell_value )
            {
                // Pad the cell value with leading spaces to match the `padding_buffer_string` length.
                // Example: ( "   " + 5 ).slice( -3 ) -> "  5"
                return ( padding_buffer_string + cell_value ).slice( - padding_buffer_string.length );
            } );
            // Join cells with " |" and add a trailing space for alignment.
            return cell_strings_in_row.join( ' |' ) + ' ';
        } );

        // Join all formatted rows with the separator line.
        return formatted_rows_array.join( "\n" + final_separator_string + "\n" );
    };


    /**
     * Returns a shallow copy of the internal Levenshtein distance matrix.
     * This prevents external modification of the internal state.
     * @returns {Array<Array<number>>} A copy of the distance matrix.
     */
    Levenshtein.prototype.getMatrix = function ( )
    {
        // Use slice() to return a shallow copy of the array of rows.
        // Note: The rows themselves are still references to the original arrays.
        return this._matrix.slice( );
    };


    /**
     * Returns the calculated Levenshtein distance, allowing Levenshtein instances
     * to be used in numerical contexts (e.g., `+lev_instance`).
     * @returns {number} The Levenshtein distance.
     */
    Levenshtein.prototype.valueOf = function ( )
    {
        // Return the pre-calculated distance.
        return this.distance;
    };


    // Make the Levenshtein constructor the public API.
    return Levenshtein;

} ) );