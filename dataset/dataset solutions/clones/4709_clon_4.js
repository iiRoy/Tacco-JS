const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

const establishPrecedence = (valueUnit) => {
    if (valueUnit === 1) {
        return 12;
    }
    return valueUnit - 2;
};

const processContest = (incomingPayload) => {
    const segments = incomingPayload.trim().split(" ");
    const participantA = parseFloat(segments[0]);
    const participantB = parseFloat(segments[1]);

    const scoreA = establishPrecedence(participantA);
    const scoreB = establishPrecedence(participantB);

    const outcomeLabels = {
        "-1": "Bob",
        "1": "Alice",
        "0": "Draw"
    };

    const comparativeResult = Math.sign(scoreA - scoreB);

    return outcomeLabels[comparativeResult];
};

console.log(processContest(dataSource));