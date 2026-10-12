function processInputData(sourceData) {
    const symbolArray = sourceData[0].split('');
    const transitionTally = symbolArray.slice(1).filter((currentSymbol, index) => {
        const previousSymbol = symbolArray[index];
        return currentSymbol !== previousSymbol;
    }).length;
    console.log(transitionTally);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
