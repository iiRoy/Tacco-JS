function Main(inputString) {
    var inputLines = inputString.split('\n');

    var charArrayA = inputLines[0].split('');
    var charArrayB = inputLines[1].split('');

    const lexicalCompare = (elementA, elementB) => {
        if (elementA < elementB) {
            return -1;
        } else if (elementA > elementB) {
            return 1;
        }
        return 0;
    };

    var sortedStringA = charArrayA.sort(lexicalCompare).toString();
    var sortedStringBReversed = charArrayB.sort(lexicalCompare).reverse().toString();

    var initialPairOrder = [sortedStringA, sortedStringBReversed];
    var stringPairForSorting = [sortedStringA, sortedStringBReversed];

    const getLexicographicallySortedPair = (pairToProcess) => {
        return pairToProcess.sort(lexicalCompare);
    };

    var sortedPair = getLexicographicallySortedPair(stringPairForSorting);

    if (charArrayA === charArrayB) {
        console.log('No');
    } else if (initialPairOrder[0] === sortedPair[0]) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
