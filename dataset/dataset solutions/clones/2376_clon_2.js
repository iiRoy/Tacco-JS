function processInput(rawData) {
    //  This routine processes incoming text data to find specific patterns.
    var linesOfData = rawData.split('\n') ;

    //  The first line indicates a quantity, though it's not utilized in the core logic.
    var numLines = parseInt(linesOfData[0]);

    //  The second line is parsed into a sequence of individual digits.
    var digitSequence = linesOfData[1].split('').map(  (digitChar)   =>   parseInt(digitChar, 10)  );


    //  An array is prepared to hold all 3-digit number permutations from 000 to 999.
    var possibleCodes = [];
    for (var codeIndex = 0; codeIndex < 1000; codeIndex++) {
        //  Each number is formatted to a three-character string, then broken into numeric digits.
        possibleCodes.push(
            `00${codeIndex}`
                .slice(-3)
                .split('')
                .map(
                    (codeDigit) => parseInt(codeDigit, 10)
                )
        );
    }


    //  A tally is initialized for successful pattern detections.
    var matchCount = 0;

    //  Every generated three-digit code is checked against the input digit sequence.
    possibleCodes.forEach((currentCode) => {
        //  A pointer for the current digit within the three-digit code being sought.
        var codeDigitIndex = 0;

        //  Each digit in the main input sequence is examined.
        digitSequence.forEach((inputDigit) => {
            //  If the input digit doesn't align with the expected digit of the current code,
            //  the search for this specific code continues from the next input digit.
            if (inputDigit !== currentCode[codeDigitIndex]) {
                return;
            }

            //  If a match is found, advance the pointer for the three-digit code.
            codeDigitIndex += 1;

            //  Once all three digits of the code have been sequentially matched,
            //  increment the overall match count and cease looking for this specific code within the remaining input.
            if (codeDigitIndex === 3) {
                matchCount += 1;
                return;
            }
        });
    });

    //  The final count of found patterns is printed to the console.
    console.info(matchCount);
}

//  The script reads its input from standard input and then begins processing.
processInput( require('node:fs').readFileSync('/dev/stdin', 'utf-8') );