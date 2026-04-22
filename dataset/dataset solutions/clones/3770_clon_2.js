// This function receives the entire input string for processing.
function ProcessCalc ( sourceData ) {
    // The input string is converted into a numerical value.
    let currentVal = Number(sourceData);
    let finalResult = 0;

    // This outer loop effectively runs only once due to an immediate break.
    while (true)
    {
        // Iterate through powers of nine to find the largest fitting multiple.
        for (let factorNine = 9; ; factorNine *= 9) {
            if (currentVal - factorNine < 0) {
                if (factorNine !== 9) {
                    factorNine /= 9;
                    currentVal -= factorNine;
                    finalResult++;
                } else {
                    // If even 9 is too large, break this internal loop.
                    break;
                }
            }
        }

        // Iterate through powers of six to find the largest fitting multiple.
        for (let factorSix = 6; ; factorSix *= 6)
        {
            if ( currentVal - factorSix < 0 ) {
                if (factorSix !== 6) {
                    factorSix /= 6;
                    currentVal -= factorSix;
                    finalResult++;
                } else {
                    // If even 6 is too large, break this internal loop.
                    break;
                }
            }
        }
        finalResult += currentVal;
        break; // Exit the main processing loop after one iteration.
    }
    console.log(finalResult);
}
// Do not modify the following line; it handles reading from standard input and invoking the core logic.
ProcessCalc ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;