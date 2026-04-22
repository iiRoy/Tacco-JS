( function ( rawInputData )
{
    // A mapping to store the frequency of each lowercase alphabet character.
    const letterFrequencies = {};

    // Populate the frequency map with all lowercase letters, initialized to zero.
    for ( let letterCode = 'a'.charCodeAt(0); letterCode <= 'z'.charCodeAt(0); letterCode++ )
    {
        letterFrequencies[ String.fromCharCode(letterCode) ] = 0;
    }

    // Iterate through the input data to count character occurrences.
    rawInputData.split('').forEach( function ( currentCharacter )
    {
        const normalizedChar = currentCharacter.toLowerCase();
        // If the character is a lowercase alphabet letter, increment its count.
        if ( normalizedChar in letterFrequencies )
        {
            letterFrequencies[normalizedChar]++;
        }
    } );

    // Format and display the character counts to the console.
    console.log(
        Object.keys(letterFrequencies).map( function ( charKey )
        {
            return charKey + ': ' + this[charKey];
        }, letterFrequencies ).join('\n')
    );

} )( require('fs').readFileSync('/dev/stdin', 'utf8') );


/*
 * This utility function processes a string, breaking it down into a two-dimensional array
 * based on provided field and record delimiters.
 *
 * @param {string} sourceString - The text content to be parsed.
 * @param {string} [fieldDelimiter=' '] - The character(s) used to separate fields within a record.
 * @param {string} [recordDelimiter='\n'] - The character(s) used to separate records (e.g., lines).
 * @returns {Array<Array<string>>} A nested array representing the parsed structure.
 */
function decomposeContent( sourceString, fieldDelimiter, recordDelimiter )
{
    // Assign default delimiters if not explicitly provided.
    fieldDelimiter = ( typeof fieldDelimiter !== 'undefined' ) ? fieldDelimiter : ' ';
    recordDelimiter = ( typeof recordDelimiter !== 'undefined' ) ? recordDelimiter : '\n';

    // Remove a potential trailing record delimiter to avoid an empty final record.
    sourceString = sourceString.replace( /\n$/, '' );

    // Split the source string into an array of records using the record delimiter.
    const recordList = sourceString.split( recordDelimiter );

    // Iterate through each record and split it further into fields using the field delimiter.
    for ( let recordIdx = 0; recordIdx < recordList.length; recordIdx++ )
    {
        recordList[recordIdx] = recordList[recordIdx].split( fieldDelimiter );
    }

    // Return the fully parsed two-dimensional array.
    return recordList;
}