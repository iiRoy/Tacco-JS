const Main = (input) => {
    const initialComponents = [1, 1];
    const finalComputation = initialComponents.reduce((accumulatedValue, currentElement) => {
        return accumulatedValue + currentElement;
    }, 0);
    return finalComputation;
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
