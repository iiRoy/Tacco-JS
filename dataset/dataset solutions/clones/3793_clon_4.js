const processSequence = (rawData) => {
    const lines = rawData.split('\n');
    const seqLength = Number(lines[0]);
    const directionString = lines[1];

    let minimumTurns = 300000; 

    if (seqLength > 1) {
        const leftECounts = [0]; 
        directionString.split('').forEach(character => {
            leftECounts.push(leftECounts[leftECounts.length - 1] + (character === 'E' ? 1 : 0));
        });

        const suffixWCounts = new Array(seqLength + 1).fill(0); 
        for (let position = seqLength - 1; position >= 0; position--) {
            suffixWCounts[position] = suffixWCounts[position + 1] + (directionString[position] === 'W' ? 1 : 0);
        }
        
        for (let leaderIndex = 1; leaderIndex < seqLength; ++leaderIndex) {
            const currentCost = leftECounts[leaderIndex] + suffixWCounts[leaderIndex + 1];
            minimumTurns = Math.min(minimumTurns, currentCost);
        }
    }

    console.log(minimumTurns);
    return 0;
};

processSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());