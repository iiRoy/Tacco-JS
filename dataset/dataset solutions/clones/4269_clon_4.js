((sourceMaterial) => {
    const parseConstituents = (textualStream) => {
        const adjustedStream = textualStream.trim();
        const lineSeparatorPosition = adjustedStream.indexOf('\n');

        const firstComponentString = adjustedStream.substring(0, lineSeparatorPosition);
        const secondComponentString = adjustedStream.substring(lineSeparatorPosition + 1);

        return {
            primaryOperand: Number(firstComponentString),
            secondaryOperand: Number(secondComponentString)
        };
    };

    const deriveFinalValue = (operandsContainer) => {
        return (operandsContainer.secondaryOperand * 2) - operandsContainer.primaryOperand;
    };

    const evaluationResult = deriveFinalValue(parseConstituents(sourceMaterial));
    console.log(evaluationResult);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));