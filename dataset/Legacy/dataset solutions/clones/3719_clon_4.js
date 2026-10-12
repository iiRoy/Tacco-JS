function processSequence(rawData) {
    const signalElements = rawData.split('\n')[0].split('');

    const symbolImpact = {
        '+': 1
    };

    const finalScore = signalElements.reduce((currentAccumulator, charUnit) => {
        return currentAccumulator + (symbolImpact[charUnit] || -1);
    }, 0);

    console.log(finalScore);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
