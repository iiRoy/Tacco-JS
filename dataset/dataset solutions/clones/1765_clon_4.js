function processInputSeries(inputData) {
    const segments = inputData.split('\n');
    const initialSequence = segments[0];
    const valueUnits = initialSequence.split(' ');
    
    let foundOrdinal = valueUnits.slice(0, 5).findIndex(elementValue => elementValue === '0');
    
    let computedResult;
    if (foundOrdinal === -1) {
        computedResult = Number.NaN;
    } else {
        computedResult = foundOrdinal + 1;
    }
    
    console.log(computedResult);
}

processInputSeries(require("fs").readFileSync("/dev/stdin","utf8"));