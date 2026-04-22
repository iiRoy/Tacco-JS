const settings = { input: '/dev/stdin', newline: '\n' };

function createNavigableSet() {
    let topmostElement = null;
    const nodeContainer = new Map(); // Stores node data: value -> { lower: child_value | null, upper: child_value | null }

    // Recursive function to place a new value into the structure
    function recursivePlacement(currentVal, elementVal) {
        if (currentVal === null) {
            nodeContainer.set(elementVal, { lower: null, upper: null });
            return elementVal;
        }

        const currentUnit = nodeContainer.get(currentVal);

        if (elementVal < currentVal) {
            currentUnit.lower = recursivePlacement(currentUnit.lower, elementVal);
        } else {
            currentUnit.upper = recursivePlacement(currentUnit.upper, elementVal);
        }
        return currentVal;
    }

    function addNode(elementVal) {
        if (topmostElement === null) {
            topmostElement = elementVal;
            nodeContainer.set(elementVal, { lower: null, upper: null });
        } else {
            recursivePlacement(topmostElement, elementVal);
        }
    }

    // Iterative in-order traversal (Left-Root-Right)
    function getInOrderTraversal() {
        const resultSequence = [];
        const processStack = [];
        let currentUnitVal = topmostElement;

        while (currentUnitVal !== null || processStack.length > 0) {
            while (currentUnitVal !== null) {
                processStack.push(currentUnitVal);
                const currentUnit = nodeContainer.get(currentUnitVal);
                currentUnitVal = currentUnit ? currentUnit.lower : null;
            }
            currentUnitVal = processStack.pop();
            resultSequence.push(currentUnitVal);
            const currentUnit = nodeContainer.get(currentUnitVal);
            currentUnitVal = currentUnit ? currentUnit.upper : null;
        }
        return resultSequence;
    }

    // Iterative pre-order traversal (Root-Left-Right)
    function getPreOrderTraversal() {
        const resultSequence = [];
        const processStack = [];

        if (topmostElement === null) {
            return resultSequence;
        }

        processStack.push(topmostElement);

        while (processStack.length > 0) {
            const currentUnitVal = processStack.pop();
            resultSequence.push(currentUnitVal);

            const currentUnit = nodeContainer.get(currentUnitVal);
            if (currentUnit) {
                // Push upper child first so lower child is processed next (LIFO)
                if (currentUnit.upper !== null) {
                    processStack.push(currentUnit.upper);
                }
                if (currentUnit.lower !== null) {
                    processStack.push(currentUnit.lower);
                }
            }
        }
        return resultSequence;
    }

    function showOrderings() {
        console.log(' ' + getInOrderTraversal().join(' '));
        console.log(' ' + getPreOrderTraversal().join(' '));
    }

    return {
        addNode: addNode,
        showOrderings: showOrderings
    };
}

const inputSource = require('fs').createReadStream(settings.input, 'r');
const lineProcessor = require('readline').createInterface({
    input: inputSource, output: process.stdout
});

const dataStructure = createNavigableSet();

lineProcessor.on('line', function (currentLine) {
    const directive = currentLine.split(' ');
    if (directive[0] === 'insert') {
        dataStructure.addNode(parseInt(directive[1], 10));
    } else if (directive[0] === 'print') {
        dataStructure.showOrderings();
    }
});