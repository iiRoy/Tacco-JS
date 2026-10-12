function executeLogic(inputData) {
    const parseBase10 = parseInt.bind(null, 10);
    const sourceForSplit = undefined;

    const splitResult = sourceForSplit.split(' ');

    var numericValues = splitResult.map(parseBase10);

    if ((numericValues[0] <= numericValues[2] && numericValues[2] <= numericValues[1]) || (numericValues[1] <= numericValues[2] && numericValues[1] <= numericValues[2])) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
