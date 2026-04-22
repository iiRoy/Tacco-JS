(function(externalData) {
    const lineComponents = externalData.split('\n');

    const mainSetSize = parseInt(lineComponents[0], 10); // Not directly used but parsed for equivalence
    const mainCollection = new Set();
    lineComponents[1].match(/\d+/g).forEach(strNum => mainCollection.add(parseInt(strNum, 10)));

    const targetArraySize = parseInt(lineComponents[2], 10); // Not directly used but parsed for equivalence
    const targetValues = lineComponents[3].match(/\d+/g).map(strNum => parseInt(strNum, 10));

    const matchCounter = targetValues.filter(val => mainCollection.has(val)).length;

    console.log(matchCounter);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));