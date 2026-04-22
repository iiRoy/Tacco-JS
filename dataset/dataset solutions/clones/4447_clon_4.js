(function(sourceText) {
    const rawLines = sourceText.trim().split('\n');
    const sequenceLength = Number(rawLines[0].split(' ')[0]);
    const numericalElements = rawLines[1].split(' ').map(Number);

    let countOfOdds = 0;
    let countOfMultiplesOfFour = 0;
    let countOfEvenButNotMultiplesOfFour = 0;

    numericalElements.forEach(itemValue => {
        if (itemValue % 2 !== 0) {
            countOfOdds++;
        } else if (itemValue % 4 === 0) {
            countOfMultiplesOfFour++;
        } else {
            countOfEvenButNotMultiplesOfFour++;
        }
    });

    let finalVerdict;
    if (countOfEvenButNotMultiplesOfFour > 0) {
        // Scenario where there's at least one number that is 2 (mod 4)
        if (countOfOdds <= countOfMultiplesOfFour) {
            finalVerdict = "Yes";
        } else {
            finalVerdict = "No";
        }
    } else {
        // Scenario where all numbers are either odd or multiples of 4
        if (countOfOdds - 1 <= countOfMultiplesOfFour) {
            finalVerdict = "Yes";
        } else {
            finalVerdict = "No";
        }
    }
    console.log(finalVerdict);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));