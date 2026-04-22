const createBoundary = (x_start, y_start, x_end, y_end) => ({
    beginX: x_start,
    beginY: y_start,
    endX: x_end,
    endY: y_end
});

const detectOverlap = (domainOne, domainTwo) => {
    const xDisjoint = (domainOne.beginX > domainTwo.endX || domainTwo.beginX > domainOne.endX);
    const yDisjoint = (domainOne.beginY > domainTwo.endY || domainTwo.beginY > domainOne.endY);
    return !(xDisjoint || yDisjoint);
};

let incomingPayload = '';

process.stdin.on('data', fragment => {
    incomingPayload += fragment.toString();
});

process.stdin.on('end', () => {
    const inputRows = incomingPayload.trim().split('\n');
    
    inputRows.forEach(currentLineContent => {
        const numericValues = currentLineContent.split(' ').map(Number);

        const primaryRegion = createBoundary(numericValues[0], numericValues[1], numericValues[2], numericValues[3]);
        const secondaryRegion = createBoundary(numericValues[4], numericValues[5], numericValues[6], numericValues[7]);

        const intersectionExists = detectOverlap(primaryRegion, secondaryRegion);
        process.stdout.write(intersectionExists ? 'YES\n' : 'NO\n');
    });
});