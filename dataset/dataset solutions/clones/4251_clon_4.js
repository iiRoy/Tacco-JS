function processInputData(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');

    const firstSegment = contentLines[0];
    const secondSegment = contentLines[1];

    const comparisonPoints = [
        [firstSegment.charAt(0), secondSegment.charAt(2)],
        [secondSegment.charAt(0), firstSegment.charAt(2)],
        [firstSegment.charAt(1), secondSegment.charAt(1)]
    ];

    const allConditionsSatisfied = comparisonPoints.every(
        (pair) => pair[0] === pair[1]
    );

    console.log(allConditionsSatisfied ? 'YES' : 'NO');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
