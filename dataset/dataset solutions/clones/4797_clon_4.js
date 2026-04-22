(function() {
    const outputFacility = globalThis[String.fromCharCode(99, 111, 110, 115, 111, 108)][String.fromCharCode(108, 111, 103)];

    const initialStatement = String.fromCharCode(89, 101, 115);

    const numericPatternElements = [
        { val: 1, count: 1 },
        { val: 3, count: 2 },
        { val: 2, count: 2 },
        { val: 1, count: 2 },
        { val: 2, count: 1 },
        { val: 3, count: 1 }
    ];

    const generatedSequence = numericPatternElements
        .flatMap(element => Array(element.count).fill(element.val))
        .join(String.fromCharCode(32));

    outputFacility(initialStatement);
    outputFacility(generatedSequence);
})();