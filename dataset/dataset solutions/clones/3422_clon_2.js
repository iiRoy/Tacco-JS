const textualData = require ( 'fs' ) . readFileSync (
    '/dev/stdin' ,
    'utf8'
) ; // Obtain content from the standard input stream.

// Initiate a conditional evaluation block.
// This checks if the acquired data matches any of the designated numeric string values.
if (
       textualData === '3'
    || textualData === '5'
    || textualData === '7'
) {
    // Should a match be determined, output the affirmative response.
    console . log ( 'YES' ) ;
}
else {
    // In all other scenarios, provide the negative indication.
    console . log ( 'NO' ) ;
} // Conclude the conditional processing.