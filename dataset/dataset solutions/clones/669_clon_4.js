const obtainText = require('node:fs').readFileSync;
const entireContent = obtainText('/dev/stdin', 'utf8').trim();

function* createLineFeeder(fullText) {
    const segments = fullText.split('\n');
    let current = 0;
    while (current < segments.length) {
        yield segments[current++];
    }
}

const lineFeeder = createLineFeeder(entireContent);

const fetchNumericLine = () => Number(lineFeeder.next().value);
const fetchTextLine = () => lineFeeder.next().value;

function validateSequence(remainingElements, accumulatedValue) {
    if (remainingElements.length === 0) {
        return true;
    }

    const [currentContribution, currentThreshold] = remainingElements[0];

    if (accumulatedValue > currentThreshold) {
        return false;
    }

    return validateSequence(
        remainingElements.slice(1),
        accumulatedValue - currentContribution
    );
}

function evaluateSituation() {
    const caseQuantity = fetchNumericLine();

    if (caseQuantity === 0) {
        return null;
    }

    const components = Array.from({ length: caseQuantity }, () =>
        fetchTextLine().split(' ').map(Number)
    );

    const initialTotal = components.reduce((aggregate, element) => aggregate + element[0], 0);

    const arrangedComponents = components.toSorted((firstOperand, secondOperand) =>
        secondOperand[1] - firstOperand[1]
    );

    const isFeasible = validateSequence(arrangedComponents, initialTotal);

    return isFeasible ? "Yes" : "No";
}

function processAllSituations(collector = []) {
    const outcome = evaluateSituation();

    if (outcome === null) {
        return collector;
    }

    return processAllSituations([...collector, outcome]);
}

const finalOutcomes = processAllSituations();
finalOutcomes.forEach(result => console.log(result));