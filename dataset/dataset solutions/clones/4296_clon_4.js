let inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});
process.stdin.on('end', function() {
    const rawLines = inputBuffer.trim().split('\n');
    const targetLine = rawLines[0];
    const numericParts = targetLine.split(' ');

    const initialValue = Number(numericParts[0]);
    const secondaryValue = Number(numericParts[1]);
    const tertiaryValue = Number(numericParts[2]);

    const isFirstMatchingSecond = (initialValue === secondaryValue);
    const isFirstMatchingThird = (initialValue === tertiaryValue);

    let comparisonOutcomeTag = '';
    if (isFirstMatchingSecond) {
        comparisonOutcomeTag += 'M_S'; // Matches Second
    } else {
        comparisonOutcomeTag += 'N_S'; // Not Matches Second
    }

    if (isFirstMatchingThird) {
        comparisonOutcomeTag += 'M_T'; // Matches Third
    } else {
        comparisonOutcomeTag += 'N_T'; // Not Matches Third
    }

    const resolutionMap = {
        'M_SM_T': tertiaryValue,
        'M_SN_T': tertiaryValue,
        'N_SM_T': secondaryValue,
        'N_SN_T': initialValue
    };

    console.log(resolutionMap[comparisonOutcomeTag]);
});