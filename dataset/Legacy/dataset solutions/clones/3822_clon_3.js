(function processInputData() {
    const INPUT_DELIMITER = " ";
    let strValA, strValB, strValC;

    const rawInputLine = readline();
    const inputSegments = rawInputLine.split(INPUT_DELIMITER);

    strValA = inputSegments[0];
    strValB = inputSegments[1];
    strValC = inputSegments[2];

    const parsedNumA = parseInt(strValA);
    const parsedNumB = parseInt(strValB);

    const computedSum = parsedNumA + parsedNumB;

    print(computedSum);
})();
