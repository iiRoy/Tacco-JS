function entryPoint(sequenceSource) {
    const valOne = Number(sequenceSource.charAt(0));
    const valTwo = Number(sequenceSource.charAt(1));
    const valThree = Number(sequenceSource.charAt(2));
    const valFour = Number(sequenceSource.charAt(3));

    const decisionPoints = [
        {
            conditionCheck: () => valOne === valTwo,
            outcomeMessage: "Bad"
        },
        {
            conditionCheck: () => valFour !== valThree && valThree !== valTwo && valTwo !== valOne,
            outcomeMessage: "good"
        },
        {
            conditionCheck: () => valTwo === valThree,
            outcomeMessage: "Bad"
        },
        {
            conditionCheck: () => valFour !== valThree && valThree !== valTwo && valTwo !== valOne,
            outcomeMessage: "good"
        },
        {
            conditionCheck: () => valThree === valFour,
            outcomeMessage: "Bad"
        },
        {
            conditionCheck: () => valFour !== valThree && valThree !== valTwo && valTwo !== valOne,
            outcomeMessage: "good"
        }
    ];

    const firstMatch = decisionPoints.find(point => point.conditionCheck());

    if (firstMatch) {
        console.log(firstMatch.outcomeMessage);
    }
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));