function Main(inputString) {
    const targetValue = parseInt(inputString, 10);

    const availableDenominations = [1, 6, 9, 36, 81, 216, 729, 1296, 6561, 7776, 46656, 59049];

    const minimumCounts = new Array(targetValue + 1).fill(Infinity);
    minimumCounts[0] = 0;

    for (let currentAmount = 1; currentAmount <= targetValue; currentAmount++) {
        for (const denomination of availableDenominations) {
            if (currentAmount >= denomination) {
                minimumCounts[currentAmount] = Math.min(minimumCounts[currentAmount], minimumCounts[currentAmount - denomination] + 1);
            }
        }
    }
    
    console.log(minimumCounts[targetValue]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
