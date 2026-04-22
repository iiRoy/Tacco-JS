var streamContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var dataLines = ( streamContent . trim ( ) ) . split ( "\n" ) ; // Normalize input and split into records
dataLines . forEach ( function ( inputStr ) { // Process each individual line of data
    var numericValues = inputStr . split ( " " ) . map ( Number ) ; // Parse space-separated numbers
    var candidateNumbers = [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 ] ; // Define the universal set of integers
    candidateNumbers = candidateNumbers . filter ( function ( testVal ) { // Filter out numbers already in the current input
        return ( testVal !== numericValues [ 0 ] && testVal !== numericValues [ 1 ] && testVal !== numericValues [ 2 ] ) ;
    } ) ;
    var positiveOutcomes = 0 ; // Counter for conditions met
    var negativeOutcomes = 0 ; // Counter for conditions not met
    candidateNumbers . forEach ( function ( elementForSum ) { // Evaluate each remaining candidate
        ( ( numericValues [ 0 ] + numericValues [ 1 ] + elementForSum ) <= 20 ) ? positiveOutcomes ++ : negativeOutcomes ++ ; // Ternary increment based on sum
    } ) ;
    console . log ( positiveOutcomes >= negativeOutcomes ? "YES" : "NO" ) ; // Output final decision
} ) ;