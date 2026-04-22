// Initial competitive programming problem reference.
// Another problem specification from a different contest.

process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;

process.stdin.on('data', function (inputBlock)
    {
        let digitSequence = inputBlock.toString() // Convert the received buffer to a string.
                                        .split("\n") // Split the string by newline characters.
                                        .map ( item => Number ( item ) )
                                        .filter ( item => item !== 0 ) ;
        const initialSet = digitSequence.slice(0, 3);
        const finalSet = digitSequence.slice(3, 5);
        const firstMinimum = Math.min.apply(null, initialSet);  // This yields the smallest value from the first array.
        const secondMinimum = Math.min.apply(null, finalSet);  // This yields the smallest value from the second array.

        const outcome = firstMinimum + secondMinimum - 50;
        console.log( outcome );
    }
);