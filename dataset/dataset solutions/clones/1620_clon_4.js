function processInputCondition(valueText) {
    const numericalValue = Number(valueText);
    const comparisonResultSign = Math.sign(numericalValue - 30);

    const outcomeDispatch = {
        1: 'Yes', // For values > 30
        0: 'Yes', // For values === 30
        '-1': 'No' // For values < 30
    };

    // If numericalValue is NaN (e.g., from Number('abc')),
    // then numericalValue - 30 is NaN, Math.sign(NaN) is NaN.
    // outcomeDispatch[NaN] will be undefined.
    // The || 'No' ensures that NaN (and any other unexpected sign) defaults to 'No',
    // matching the original behavior where NaN >= 30 is false.
    console.log(outcomeDispatch[comparisonResultSign] || 'No');
}

processInputCondition(require('fs').readFileSync('/dev/stdin', 'utf8'));
