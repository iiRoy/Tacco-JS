const processTextualData = (sourceMaterial) => {
    const sections = sourceMaterial.trim().split(" ");
    const alphaElement = sections[0];
    const betaElement = sections[1];

    let stateIdentifier;
    if (alphaElement > betaElement) {
        stateIdentifier = 'ALPHA_DOMINANT';
    } else if (betaElement > alphaElement) {
        stateIdentifier = 'BETA_DOMINANT';
    } else if (alphaElement == betaElement) {
        stateIdentifier = 'EQUIVALENT';
    } else {
        stateIdentifier = 'UNDEFINED_STATE';
    }

    let calculatedValue;
    switch (stateIdentifier) {
        case 'ALPHA_DOMINANT':
            calculatedValue = Number(alphaElement) * 2 - 1;
            break;
        case 'BETA_DOMINANT':
            calculatedValue = Number(betaElement) * 2 - 1;
            break;
        case 'EQUIVALENT':
            calculatedValue = Number(alphaElement) * 2;
            break;
        case 'UNDEFINED_STATE':
        default:
            calculatedValue = undefined;
            break;
    }

    return calculatedValue;
};

((sourceContent) => {
    const finalComputation = processTextualData(sourceContent);
    console.log(finalComputation);
})(require("fs").readFileSync("/dev/stdin", "utf8"));