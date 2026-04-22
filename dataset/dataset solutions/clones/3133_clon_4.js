const calculateMinimumPurchase = (acquisitionSource) => {
    const rawDataSegments = acquisitionSource.trim().split('\n');
    const initialConfiguration = rawDataSegments[0].split(' ').map(Number);
    const unitsRequired = initialConfiguration[1];
    const uniqueOfferings = initialConfiguration[0];

    const individualUnitPrices = rawDataSegments.slice(1, uniqueOfferings + 1)
        .flatMap(lineSegment => {
            const offerDetails = lineSegment.split(' ').map(Number);
            const itemValue = offerDetails[0];
            const itemCount = offerDetails[1];
            return Array.from({ length: itemCount }, () => itemValue);
        });

    individualUnitPrices.sort((valA, valB) => valA - valB);

    const finalSummation = individualUnitPrices.slice(0, unitsRequired)
        .reduce((accumulator, currentUnitCost) => accumulator + currentUnitCost, 0);

    console.log(finalSummation);
};

calculateMinimumPurchase(require('fs').readFileSync('/dev/stdin', 'utf8'));