/*
 * This file defines the ACGTHashList class, a custom hash table
 * implementation designed for storing DNA sequences (A, C, G, T)
 * and performing efficient lookups and insertions.
 *
 * It uses a double hashing strategy to resolve collisions.
 */
class ACGTHashList
{
    // A static getter that provides a mapping for DNA bases to integer values.
    // This mapping is crucial for converting DNA sequences into numerical keys.
    static    get    MAP    (   )
    {
        return    {
                     'A':    1,    // Adenine
                     'C':    2,    // Cytosine
                     'G':    3,    // Guanine
                     'T':    4,    // Thymine
                  }   ;
    }


    /*
     * Constructor for the ACGTHashList.
     * Initializes the hash table with a specified size.
     * @param {number} M - The size of the hash table array.
     */
    constructor    (   M   )
    {
        this.M    =    M   ; // Store the table size
        this.H    =    [   ]   ; // Initialize the hash table array

        // Populate the hash table array with empty strings to signify empty slots.
        for    (    let    i    =    0    ;    i    <    M    ;    i++    )
            this.H [ i ]    =    ''   ;
    }


    // Private method to generate a numerical key from a DNA sequence string.
    // Uses a polynomial hashing approach with base 5.
    _getKey    (    str    )
    {
        let    sum    =    0   ; // Accumulator for the hash key
        let    p    =    1   ; // Power of the base (5)

        // Iterate over each character (DNA base) in the input string.
        str.split    (    ''    )    .    forEach    (    c    =>    {
            sum    +=    p    *    ACGTHashList.MAP [ c ]   ; // Add weighted value of the base
            p    *=    5   ; // Increment the power for the next base
        }   )   ;

        return    sum   ; // Return the calculated numerical key
    }


    // The first hash function for double hashing.
    // Simply takes the key modulo the table size.
    _h1    (    key    )
    {
        return    key    %    this.M   ;
    }


    // The second hash function for double hashing.
    // Ensures a non-zero step size for collision resolution.
    _h2    (    key    )
    {
        return    1    +    key    %    (    this.M    -    1    )   ;
    }


    /*
     * Searches for a DNA sequence in the hash table.
     * @param {string} str - The DNA sequence to search for.
     * @returns {number} 1 if found, 0 otherwise.
     */
    find    (    str    )
    {
        let    key    =    ACGTHashList._getKey    (    str    )   ; // Get the numerical key for the string
        let    h   ; // Variable to store the current hash index

        // Calculate the initial hash indices using double hashing functions.
        const    h1    =    this._h1    (    key    )   ,    h2    =    this._h2    (    key    )   ;

        // Probe the hash table using double hashing.
        // The loop continues indefinitely until a match or an empty slot is found.
        for    (    let    i    =    0    ;    ;    i++    )
        {
            h    =    (    h1    +    i    *    h2    )    %    this.M   ; // Calculate the probed index

            if    (    this.H [ h ]    ===    str    )
            {
                return    1   ; // Sequence found
            }
            else    if    (    this.H [ h ]    ===    ''    )
            {
                return    0   ; // Empty slot found, sequence is not in the table
            }
        }
        // This line should theoretically not be reached if the table has empty slots or the item is found.
        return    0   ;
    }


    /*
     * Inserts a DNA sequence into the hash table.
     * @param {string} str - The DNA sequence to insert.
     * @returns {number} 1 if the sequence was already present, 0 if inserted successfully.
     */
    insert    (    str    )
    {
        let    key    =    ACGTHashList._getKey    (    str    )   ; // Generate the key for the string
        let    h   ; // Current hash index

        // Compute the initial hash values.
        const    h1    =    this._h1    (    key    )   ,    h2    =    this._h2    (    key    )   ;

        // Probe the hash table for an appropriate insertion point.
        for    (    let    i    =    0    ;    ;    i++    )
        {
            h    =    (    h1    +    i    *    h2    )    %    this.M   ; // Calculate the probed index

            if    (    this.H [ h ]    ===    str    )
            {
                return    1   ; // Sequence already exists in the table
            }
            else    if    (    this.H [ h ]    ===    ''    )
            {
                this.H [ h ]    =    str   ; // Insert the sequence into the empty slot
                return    0   ; // Insertion successful
            }
        }
        // This return is a fallback, typically unreachable in a properly sized hash table.
        return    0   ;
    }

} // End of ACGTHashList class definition


// Main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
(    function    main    (   )
{
    // Read input from stdin, decode as UTF-8, and split into lines.
    const    lines    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    .    split    (    '\n'    )   ;

    // Process each line to extract commands and their arguments.
    // The first line is typically metadata and is skipped (`.slice(1)`).
    const    commands    =    lines    .    map    (    l    =>    {
        const    cmd    =    l    .    split    (    ' '    )   ; // Split line into command parts
        return    [    cmd [ 0 ] [ 0 ]    ,    cmd [ 1 ]    ]   ; // Return only the first char of command and its argument
    }    )    .    slice    (    1    )   ;

    // Initialize a new ACGTHashList instance with a specific prime size.
    let    hl    =    new    ACGTHashList    (    1046527    )   ;

    // Iterate through each command and execute the corresponding hash table operation.
    commands    .    forEach    (    cmd    =>    {
        // Check if the command is 'insert' ('i').
        if    (    cmd [ 0 ]    ===    'i'    )
        {
            hl    .    insert    (    cmd [ 1 ]    )   ; // Perform an insertion
        }
        // Otherwise, it's assumed to be a 'find' operation.
        else
        {
            // Log 'yes' if found, 'no' if not found.
            console    .    log    (    hl    .    find    (    cmd [ 1 ]    )    ?    'yes'    :    'no'    )   ;
        }
    }    )   ;
}    )    (   )   ; // Execute the main function.