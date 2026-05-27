function processInput(rawData) {
    const RADIX_DECIMAL = 10;
    const inputParts = rawData.split(' ');
    const [lowerBoundStr, upperBoundStr] = inputParts;
    const lowerBound = parseInt(lowerBoundStr, RADIX_DECIMAL);
    const upperBound = parseInt(upperBoundStr, RADIX_DECIMAL);

    let palindromeCount = 0;

    const generateFiveDigitPalindrome = (d1, d2, d3) => {
        const thousandsPlace = d2 * 1000;
        const hundredsPlace = d3 * 100;
        const tensPlace = d2 * 10;
        const unitsPlace = d1 * 1;
        const tenThousandsPlace = d1 * 10000;
        return tenThousandsPlace + thousandsPlace + hundredsPlace + tensPlace + unitsPlace;
    };

    const MIN_FIRST_DIGIT = 1;
    const MAX_FIRST_DIGIT = 9;
    const MIN_OTHER_DIGIT = 0;
    const MAX_OTHER_DIGIT = 9;

    for (let digitA = MIN_FIRST_DIGIT; digitA <= MAX_FIRST_DIGIT; digitA++) {
        for (let digitB = MIN_OTHER_DIGIT; digitB <= MAX_OTHER_DIGIT; digitB++) {
            for (let digitC = MIN_OTHER_DIGIT; digitC <= MAX_OTHER_DIGIT; digitC++) {
                const currentPalindrome = generateFiveDigitPalindrome(digitA, digitB, digitC);

                if (currentPalindrome >= lowerBound && currentPalindrome <= upperBound) {
                    palindromeCount++;
                }
            }
        }
    }

    console.log(palindromeCount);
}

const STD_INPUT_PATH = '/dev/stdin';
processInput(require('fs').readFileSync(STD_INPUT_PATH, 'utf8'));
