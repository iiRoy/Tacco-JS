function operationIdentifier(rawData) {
    const spacePos = rawData.indexOf(' ');
    const numA = parseInt(rawData.substring(0, spacePos), 10);
    const numB = parseInt(rawData.substring(spacePos + 1), 10);

    const conditions = [
        [ (valA, valB) => valA + valB === 15, '+' ],
        [ (valA, valB) => valA * valB === 15, '*' ]
    ];

    let outcome = 'x';
    for (const [predicate, symbol] of conditions) {
        if (predicate(numA, numB)) {
            outcome = symbol;
            break;
        }
    }
    console.log(outcome);
}

operationIdentifier(require("fs").readFileSync("/dev/stdin","utf8"));