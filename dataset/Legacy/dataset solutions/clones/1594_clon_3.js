function processInputData(incomingData) {
    const patternToValueMap = new Map();
    patternToValueMap.set('RRS', 2);
    patternToValueMap.set('SRR', 2);
    patternToValueMap.set('RRR', 3);
    patternToValueMap.set('SSS', 0);

    let finalComputedValue;

    // Check if the input string matches any predefined pattern
    if (patternToValueMap.has(incomingData)) {
        finalComputedValue = patternToValueMap.get(incomingData);
    } else {
        // If no specific pattern matches, assign the default value
        finalComputedValue = 1;
    }

    console.log('%d', finalComputedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
