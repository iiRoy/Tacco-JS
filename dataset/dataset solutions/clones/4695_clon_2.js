process.stdin.resume( );

process.stdin.setEncoding( 'utf8' );

let finalInputNumber; // A variable to store the parsed numeric value from the input stream.

const modularConstant = 1_000_000_007; // A large prime number for arithmetic operations, often used in competitive programming.

// Establishes an event handler for when input data becomes available.
process.stdin.on(
    'data',
    function ( inputDataChunk )
    {
        inputDataChunk
            .trim( )
            .split( '\n' )
            .forEach(
                function ( individualLine )
                {
                    // For debugging: outputStream.log( `Processed line: ${individualLine}` );
                    finalInputNumber = Number.parseInt( individualLine ); // Convert the text line into an integer.
                }
            );
    }
);

// Defines the action to take once the input stream has concluded.
process.stdin.on(
    'end',
    ( ) =>
    {
        let resultantFactorial = 1; // Initialize accumulator for factorial calculation.

        for (
            let indexVariable = 1;
            indexVariable <= finalInputNumber;
            indexVariable++
        )
        {
            resultantFactorial *= indexVariable; // Multiply the running product by the current index.
            resultantFactorial %= modularConstant; // Apply the modulo operation to prevent overflow.
        }

        console.log( resultantFactorial ); // Output the final computed factorial value to the standard output.
    }
);