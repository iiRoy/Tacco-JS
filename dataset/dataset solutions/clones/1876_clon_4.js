const processInputData = (rawInput) => {
    const dataLines = rawInput.trim().split('\n');

    const firstLineValues = dataLines[0].split(' ').map(Number);
    const totalItems = firstLineValues[0];
    const requiredSkillCount = firstLineValues[1];
    const minimumAttainment = firstLineValues[2];

    const availableItems = [];
    for (let k = 1; k <= totalItems; k++) {
        const itemInfo = dataLines[k].split(' ').map(Number);
        availableItems.push({
            purchasePrice: itemInfo[0],
            skillLevels: itemInfo.slice(1)
        });
    }

    let currentMinCost = Infinity;

    const analyzeCombinations = (itemIndex, accumulatedCost, currentSkillTotals) => {
        if (itemIndex === totalItems) {
            const allSkillsSatisfied = currentSkillTotals.every(skillVal => skillVal >= minimumAttainment);
            if (allSkillsSatisfied) {
                currentMinCost = Math.min(currentMinCost, accumulatedCost);
            }
            return;
        }

        analyzeCombinations(itemIndex + 1, accumulatedCost, currentSkillTotals);

        const item = availableItems[itemIndex];
        const nextAccumulatedCost = accumulatedCost + item.purchasePrice;
        
        if (nextAccumulatedCost < currentMinCost) {
            const nextSkillTotals = currentSkillTotals.slice();
            for (let s = 0; s < requiredSkillCount; s++) {
                nextSkillTotals[s] += item.skillLevels[s];
            }
            analyzeCombinations(itemIndex + 1, nextAccumulatedCost, nextSkillTotals);
        }
    };

    const initialSkillTotals = Array.from({ length: requiredSkillCount }, () => 0);
    analyzeCombinations(0, 0, initialSkillTotals);

    const finalOutcome = (currentMinCost === Infinity) ? -1 : currentMinCost;
    console.info(finalOutcome);
    return finalOutcome;
};

const getFileContents = (filePath) => {
    return require('fs').readFileSync(filePath, 'utf8');
};

processInputData(getFileContents('/dev/stdin'));