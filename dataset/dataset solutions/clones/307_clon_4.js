(async function () {
    let collectedInputSegments = '';

    const acquireStreamData = () => new Promise(resolve => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (dataSegment) => {
            collectedInputSegments += dataSegment;
        });

        process.stdin.on('end', () => {
            resolve(collectedInputSegments);
        });
    });

    const calculateOutput = (rawContent) => {
        const numericalRepresentations = rawContent.match(/-?\d+(\.\d+)?/g);

        if (!numericalRepresentations || numericalRepresentations.length < 2) {
            throw new Error("Insufficient numeric data received for calculation.");
        }

        const initialDimension = Number(numericalRepresentations[0]);
        const finalDimension = Number(numericalRepresentations[1]);

        const conversionBase = 3305785;
        const conversionDivisor = 1000000;
        const spatialUnitEquivalence = conversionBase / conversionDivisor;

        const intermediateProduct = initialDimension * finalDimension;
        const finalResult = intermediateProduct / spatialUnitEquivalence;

        console.log(String(finalResult));
    };

    try {
        const fullContent = await acquireStreamData();
        calculateOutput(fullContent);
    } catch (err) {
        console.error("Processing error:", err.message);
        process.exit(1);
    }
})();