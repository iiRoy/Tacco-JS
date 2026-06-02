function processInputAndDetermineEquality(rawInputContent) {
    const lineSegments = rawInputContent.split('\n')[0].split(' ');
    const [firstSegment, secondSegment, thirdSegment] = lineSegments;

    const distinctSegments = new Set([firstSegment, secondSegment, thirdSegment]);

    const outcome = (distinctSegments.size === 1) ? "Yes" : "No";

    return outcome;
}

function executeMainLogic(dataSource) {
    const finalResult = processInputAndDetermineEquality(dataSource);
    console.log('%s', finalResult);
}

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
