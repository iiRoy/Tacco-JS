const obtainParameters = (sourceText) => {
    const sections = sourceText.split(/\s+/).filter(Boolean);
    return {
        numericalValueA: Number(sections[0]),
        numericalValueB: Number(sections[1])
    };
};

const deriveOutcome = (parametersContainer) => {
    const factorX = parametersContainer.numericalValueA - 2;
    const factorY = parametersContainer.numericalValueB - 2;

    const initialProductMagnitude = Math.abs(factorX * factorY);

    const boundaryValue = 1000000000000000;

    return (initialProductMagnitude > boundaryValue)
        ? (() => {
            const aDivThousand = Math.floor(parametersContainer.numericalValueA / 1000);
            const aModThousand = parametersContainer.numericalValueA % 1000;
            const absoluteFactorY = Math.abs(factorY);

            const subProductTerm = (aModThousand - 2) * absoluteFactorY;

            const compositeHighPart = aDivThousand * absoluteFactorY + Math.floor(subProductTerm / 1000);
            const compositeLowPart = subProductTerm % 1000;

            return [compositeHighPart, compositeLowPart].join('');
        })()
        : initialProductMagnitude;
};

const processExternalData = (externalFeed) => {
    const dataSet = obtainParameters(externalFeed.split('\n')[0]);
    const finalResult = deriveOutcome(dataSet);
    globalThis.console.log(finalResult);
};

processExternalData(require("node:fs").readFileSync("/dev/stdin", "utf8"));