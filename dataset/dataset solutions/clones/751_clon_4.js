const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSet = rawContent.trim().split('\n');

const validLineSet = lineSet.filter(l => l !== '0 0 0 0 0');

const dataChunks = [];
for (let i = 0; i < validLineSet.length; i += 2) {
    const combinedLine = validLineSet[i] + ' ' + validLineSet[i + 1];
    dataChunks.push(combinedLine.split(' ').map(Number));
}

const determineOptimalExpenditure = (
    unitCostAlpha, unitCostBeta, unitCostGamma,
    packageSizeDelta, packageCostEpsilon,
    initialQuantityAlpha, initialQuantityBeta, totalQuantityGamma
) => {
    let scenarioOneCost;
    let scenarioTwoCost;

    const remainderUnits = totalQuantityGamma % packageSizeDelta;
    const fullPackages = Math.floor(totalQuantityGamma / packageSizeDelta);
    scenarioOneCost = (initialQuantityAlpha * unitCostAlpha) +
                      (initialQuantityBeta * unitCostBeta) +
                      (fullPackages * packageSizeDelta * packageCostEpsilon) +
                      (remainderUnits * unitCostGamma);

    if (totalQuantityGamma >= packageSizeDelta) {
        scenarioTwoCost = (initialQuantityAlpha * unitCostAlpha) +
                          (initialQuantityBeta * unitCostBeta) +
                          (totalQuantityGamma * packageCostEpsilon);
    } else {
        const neededToReachPackageSize = packageSizeDelta - totalQuantityGamma;
        
        let adjustedQuantityBeta = initialQuantityBeta;
        let adjustedQuantityAlpha = initialQuantityAlpha;
        let remainingToCover = neededToReachPackageSize;

        adjustedQuantityBeta = Math.max(0, initialQuantityBeta - remainingToCover);
        remainingToCover = Math.max(0, remainingToCover - initialQuantityBeta); 
        
        adjustedQuantityAlpha = Math.max(0, initialQuantityAlpha - remainingToCover);
        
        scenarioTwoCost = (adjustedQuantityAlpha * unitCostAlpha) +
                          (adjustedQuantityBeta * unitCostBeta) +
                          (packageSizeDelta * packageCostEpsilon);
    }

    return Math.min(scenarioOneCost, scenarioTwoCost);
};

dataChunks.forEach(params => {
    const result = determineOptimalExpenditure(
        params[0], params[1], params[2], params[3], params[4],
        params[5], params[6], params[7]
    );
    console.log(result);
});