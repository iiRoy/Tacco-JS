process . stdin . resume ( ) ; // Initiate the standard input stream to begin data reception.

process
    . stdin
    . setEncoding (
        'utf8'
    ) ; // Set the character encoding for the input stream to UTF-8.


process
    . stdin
    . on (
        'data'
        ,
        function ( incomingBuffer ) { // Callback function executed upon receiving a data buffer.
            // Divide the incoming text buffer into an array of strings using space as a delimiter.
            const inputParts = incomingBuffer . split ( ' ' ) ;

            // Parse the first string segment into a numerical value.
            const firstOperand = Number ( inputParts [ 0 ] ) ;

            // Parse the second string segment into a numerical value.
            const secondOperand = Number ( inputParts [ 1 ] ) ;

            // Parse the third string segment into a numerical value.
            const thirdOperand = Number ( inputParts [ 2 ] ) ;


            // Evaluate if the three numerical operands are in strictly ascending order.
            if (
                firstOperand < secondOperand
                &&
                secondOperand < thirdOperand
            ) {
                // If the condition is met, output a positive confirmation.
                console . log (
                    'Affirmative'
                ) ;
            }

            // If the strict ascending order condition is not satisfied.
            else {
                // Output a negative confirmation.
                console . log ( 'Negative' ) ;
            }
        }
    ) ; // Conclude the event listener definition.