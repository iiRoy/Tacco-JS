const rawInputParts = [];
const streamProcessor = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

streamProcessor.on('line', (incomingLine) => {
    rawInputParts.push(incomingLine);
});

streamProcessor.on('close', () => {
    const [quarterLiterPrice, halfLiterPrice, oneLiterPrice, twoLiterPrice] = rawInputParts[0].split(' ').map(val => BigInt(val));
    const totalVolumeNeeded = BigInt(rawInputParts[1]);

    const selectMinimum = (val1, val2) => val1 < val2 ? val1 : val2;

    const calculateOptimalExpense = (vol, q, h, s, d) => {
        const costOneL_fromQ = q * 4n;
        const costOneL_fromH = h * 2n;
        const costOneL_fromS = s;
        const bestOneLiterEquivalent = selectMinimum(costOneL_fromQ, selectMinimum(costOneL_fromH, costOneL_fromS));

        const costTwoL_fromQ = q * 8n;
        const costTwoL_fromH = h * 4n;
        const costTwoL_fromS = s * 2n;
        const costTwoL_fromD = d;
        const bestTwoLiterEquivalentAllSources = selectMinimum(costTwoL_fromQ, selectMinimum(costTwoL_fromH, selectMinimum(costTwoL_fromS, costTwoL_fromD)));

        const isVolumeEven = vol % 2n === 0n;

        const expenseStrategists = new Map();

        expenseStrategists.set(true, (currentVol) => { // Strategy for even volume
            return (currentVol / 2n) * bestTwoLiterEquivalentAllSources;
        });

        expenseStrategists.set(false, (currentVol) => { // Strategy for odd volume
            const costOfTwoBestOneLiters = bestOneLiterEquivalent * 2n;
            if (costOfTwoBestOneLiters < costTwoL_fromD) {
                return currentVol * bestOneLiterEquivalent;
            } else {
                return ((currentVol - 1n) / 2n) * costTwoL_fromD + bestOneLiterEquivalent;
            }
        });

        return expenseStrategists.get(isVolumeEven)(vol);
    };

    const finalCalculatedCost = calculateOptimalExpense(totalVolumeNeeded, quarterLiterPrice, halfLiterPrice, oneLiterPrice, twoLiterPrice);

    process.stdout.write(finalCalculatedCost.toString() + '\n');
});