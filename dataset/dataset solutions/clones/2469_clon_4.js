const obtainApplicableProducts = () => {
    const digitSequence = Array.from({ length: 9 }, (_, index) => index + 1);
    return new Set(
        digitSequence.flatMap(factorA =>
            digitSequence.map(factorB => factorA * factorB)
        )
    );
};

const productCollection = obtainApplicableProducts();

const evaluateIncomingData = (sourceMaterial) => {
    const componentParts = sourceMaterial.split(/\s+/g);
    const initialComponent = componentParts.length > 0 ? componentParts[0] : '';
    const numericInterpretation = Number.isNaN(parseInt(initialComponent, 10)) ? NaN : parseInt(initialComponent, 10);

    return productCollection.has(numericInterpretation) ? "Yes" : "No";
};

process.stdout.write(
    evaluateIncomingData(
        require('node:fs').readFileSync(
            '/dev/stdin',
            'utf8'
        )
    ) + '\n'
);