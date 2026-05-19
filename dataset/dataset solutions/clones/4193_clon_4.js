process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    processData(rawInputBuffer.split(/\r?\n/));
});

function processData(lines) {
    const shopCount = parseInt(lines[0], 10);

    const featureAvailability = lines.slice(1, 1 + shopCount).map(lineContent =>
        lineContent.split(' ').map(Number)
    );

    const profitMatrix = lines.slice(1 + shopCount, 1 + shopCount * 2).map(lineContent =>
        lineContent.split(' ').map(Number)
    );

    let maxProfit = Number.MIN_SAFE_INTEGER;

    for (let featureConfigMask = 1; featureConfigMask < 1024; featureConfigMask++) {
        const currentConfigurationProfit = featureAvailability.reduce((totalProfitAccumulator, shopFeatures, shopIndex) => {
            const activeFeatureCountForShop = shopFeatures.reduce((countAccumulator, featureStatus, featurePosition) => {
                const isFeatureSelectedInMask = (featureConfigMask >> featurePosition) & 1;
                return countAccumulator + (featureStatus > 0 && isFeatureSelectedInMask ? 1 : 0);
            }, 0);

            return totalProfitAccumulator + profitMatrix[shopIndex][activeFeatureCountForShop];
        }, 0);

        maxProfit = Math.max(maxProfit, currentConfigurationProfit);
    }

    console.log(maxProfit);
}
