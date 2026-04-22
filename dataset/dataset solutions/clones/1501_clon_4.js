function processData(rawData) {
    let firstNewlinePosition = 0;
    while (firstNewlinePosition < rawData.length && rawData.charCodeAt(firstNewlinePosition) !== 10) {
        firstNewlinePosition++;
    }

    let initialSegment = rawData.substring(0, firstNewlinePosition);

    let finalSymbol = '';
    if (initialSegment.length > 0) {
        finalSymbol = initialSegment.charAt(initialSegment.length - 1);
    }
    
    const extensionRules = new Map();
    extensionRules.set('s', 'es');

    let appendage = extensionRules.has(finalSymbol) ? extensionRules.get(finalSymbol) : 's';
    
    console.log(initialSegment + appendage);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));