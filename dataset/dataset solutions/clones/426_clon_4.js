const fetchSourceData = () => require('node:fs').readFileSync(0, 'utf8');

const symbolMapping = Object.freeze({
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E'
});

const processAllRecords = (fullContent) => {
    const lines = fullContent.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    
    const finalOutputLines = lines.reduce((accumulator, currentLine) => {
        let { temporaryGroup, processedResults } = accumulator;

        if (temporaryGroup.length === 0 && currentLine === '0 0') {
            accumulator.terminate = true;
            return accumulator;
        }
        
        if (accumulator.terminate) {
            return accumulator;
        }

        temporaryGroup.push(currentLine);

        if (temporaryGroup.length === 5) {
            const numericPairs = temporaryGroup.map(str => str.split(' ').map(Number));
            const combinedValues = numericPairs.map(pair => pair[0] + pair[1]);

            let greatestValue = -Infinity;
            let greatestIdx = -1;

            for (let k = 0; k < combinedValues.length; k++) {
                if (combinedValues[k] > greatestValue) {
                    greatestValue = combinedValues[k];
                    greatestIdx = k;
                }
            }

            const chosenSymbol = symbolMapping[greatestIdx];
            processedResults.push(`${chosenSymbol} ${greatestValue}`);
            
            accumulator.temporaryGroup = [];
        }
        
        return accumulator;
    }, { temporaryGroup: [], processedResults: [], terminate: false });

    return finalOutputLines.processedResults;
};

const beginExecution = () => {
    const rawData = fetchSourceData();
    const reports = processAllRecords(rawData);
    reports.forEach(entry => console.log(entry));
};

beginExecution();