function processInputData(rawData) {
    const [firstLineContent, secondLineContent, thirdLineContent] = rawData.split('\n');
    const [primaryPlayerName] = firstLineContent.split(' ');
    const currentScores = secondLineContent.split(' ').map(Number);

    const adjustedScores = currentScores.map((scoreValue, scoreIndex) => {
        const isPrimaryPlayerMatch = (primaryPlayerName === thirdLineContent);
        return (scoreIndex === 0)
            ? (isPrimaryPlayerMatch ? scoreValue - 1 : scoreValue)
            : (isPrimaryPlayerMatch ? scoreValue : scoreValue - 1);
    });

    console.log(adjustedScores.join(' '));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
