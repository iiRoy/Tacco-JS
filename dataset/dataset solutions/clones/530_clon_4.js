const transformInputPayload = (rawPayload) => {
    process.stdin.setEncoding('utf8'); // Ensure input is treated as UTF-8

    const dataTokens = rawPayload.split(/\s+/).filter(Boolean);
    let tokenCursor = 0;

    const retrieveNumericDatum = () => +dataTokens[tokenCursor++];
    const retrieveTextualDatum = () => dataTokens[tokenCursor++];

    const vertexCount = retrieveNumericDatum();
    const constraintCount = retrieveNumericDatum();

    const definiteConstraints = [];
    const alternativeConstraints = [];

    for (let currentConstraintIndex = 0; currentConstraintIndex < constraintCount; ++currentConstraintIndex) {
        const constraintExpression = retrieveTextualDatum();

        const numericParts = constraintExpression.split(/<=|>=|\*|\+|-/);
        const firstOperandIndex = +numericParts[0] - 1;
        const secondOperandIndex = +numericParts[1] - 1;
        const magnitudeValue = +numericParts[2];

        let primaryOperatorCategory;
        if (constraintExpression.includes('*')) {
            primaryOperatorCategory = 2;
        } else {
            primaryOperatorCategory = +(constraintExpression.includes('<=') === false);
        }

        let sumOperatorAbsenceFlag;
        sumOperatorAbsenceFlag = +(constraintExpression.includes('+') === false);

        if (primaryOperatorCategory === 0) {
            if (sumOperatorAbsenceFlag === 0) {
                definiteConstraints.push([secondOperandIndex, firstOperandIndex, -magnitudeValue]);
            } else {
                definiteConstraints.push([secondOperandIndex, firstOperandIndex, 0]);
                definiteConstraints.push([firstOperandIndex, secondOperandIndex, magnitudeValue]);
            }
        } else if (primaryOperatorCategory === 1) {
            if (sumOperatorAbsenceFlag === 0) {
                definiteConstraints.push([firstOperandIndex, secondOperandIndex, -magnitudeValue]);
            } else {
                definiteConstraints.push([secondOperandIndex, firstOperandIndex, magnitudeValue]);
                definiteConstraints.push([firstOperandIndex, secondOperandIndex, 0]);
            }
        } else { // primaryOperatorCategory === 2
            if (sumOperatorAbsenceFlag === 0) {
                alternativeConstraints.push([[firstOperandIndex, secondOperandIndex, -magnitudeValue], [secondOperandIndex, firstOperandIndex, -magnitudeValue]]);
            } else {
                definiteConstraints.push([secondOperandIndex, firstOperandIndex, magnitudeValue]);
                definiteConstraints.push([firstOperandIndex, secondOperandIndex, magnitudeValue]);
            }
        }
    }

    return {
        totalNodes: vertexCount,
        totalConstraints: constraintCount,
        initialFixedEdges: definiteConstraints,
        initialChoiceEdges: alternativeConstraints
    };
};

const deliverOutcome = (value) => {
    console.log(value);
};

const executeSolution = (rawInputString) => {
    const { totalNodes, initialFixedEdges, initialChoiceEdges } = transformInputPayload(rawInputString);

    let ultimateMaximumDistance = -Infinity;

    const totalAlternativeChoices = initialChoiceEdges.length;
    const totalCombinations = 1 << totalAlternativeChoices;

    for (let combinationIndex = 0; combinationIndex < totalCombinations; ++combinationIndex) {
        let currentCombinedEdges = [...initialFixedEdges];
        const combinationBinaryString = combinationIndex.toString(2).padStart(totalAlternativeChoices, '0');

        for (let choiceIterator = 0; choiceIterator < totalAlternativeChoices; ++choiceIterator) {
            const selectionIndicator = parseInt(combinationBinaryString[choiceIterator]);
            const selectedEdge = initialChoiceEdges[choiceIterator][selectionIndicator];
            currentCombinedEdges.push(selectedEdge);
        }

        let nodeDistances = Array(totalNodes).fill(Infinity);
        nodeDistances[0] = 0;

        for (let iterationCount = 0; iterationCount < totalNodes; ++iterationCount) {
            for (const currentGraphEdge of currentCombinedEdges) {
                const [startVertex, endVertex, edgeWeight] = currentGraphEdge;
                nodeDistances[endVertex] = Math.min(nodeDistances[endVertex], nodeDistances[startVertex] + edgeWeight);
            }
        }

        if (nodeDistances[0] === 0) {
            ultimateMaximumDistance = Math.max(ultimateMaximumDistance, Math.max(...nodeDistances));
        }
    }

    if (ultimateMaximumDistance === Infinity) {
        deliverOutcome('inf');
    } else if (ultimateMaximumDistance === -Infinity) {
        deliverOutcome(-1);
    } else {
        deliverOutcome(ultimateMaximumDistance);
    }
};

const commenceProcessing = async () => {
    let completeInputBuffer = '';
    for await (const chunk of process.stdin) {
        completeInputBuffer += chunk;
    }
    executeSolution(completeInputBuffer);
};

commenceProcessing();