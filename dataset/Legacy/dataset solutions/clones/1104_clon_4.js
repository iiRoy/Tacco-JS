const makeNode = (val, l = null, r = null) => ({ val, l, r });

const makeBinarySearchTree = () => {
    let top = null;

    const addValue = (val) => {
        const insertRecursive = (current, newValue) => {
            if (current === null) {
                return makeNode(newValue);
            }
            if (newValue < current.val) {
                current.l = insertRecursive(current.l, newValue);
            } else {
                current.r = insertRecursive(current.r, newValue);
            }
            return current;
        };
        top = insertRecursive(top, val);
    };

    const locateValue = (valToFind) => {
        let currentSpot = top;
        while (currentSpot !== null) {
            if (currentSpot.val === valToFind) {
                return true;
            }
            currentSpot = (valToFind < currentSpot.val) ? currentSpot.l : currentSpot.r;
        }
        return false;
    };

    const traverseInOrder = () => {
        let outputString = '';
        const nodeStack = [];
        let currentPointer = top;

        while (currentPointer !== null || nodeStack.length > 0) {
            while (currentPointer !== null) {
                nodeStack.push(currentPointer);
                currentPointer = currentPointer.l;
            }
            currentPointer = nodeStack.pop();
            outputString += ` ${currentPointer.val}`;
            currentPointer = currentPointer.r;
        }
        return outputString;
    };

    const traversePreOrder = () => {
        let outputString = '';
        if (top === null) {
            return outputString;
        }

        const nodeStack = [top];
        while (nodeStack.length > 0) {
            const currentSpot = nodeStack.pop();
            outputString += ` ${currentSpot.val}`;

            if (currentSpot.r !== null) {
                nodeStack.push(currentSpot.r);
            }
            if (currentSpot.l !== null) {
                nodeStack.push(currentSpot.l);
            }
        }
        return outputString;
    };

    const displayAll = () => {
        console.log(traverseInOrder());
        console.log(traversePreOrder());
    };

    return {
        addValue,
        locateValue,
        displayAll
    };
};

(function processInput() {
    const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const totalCommands = Number(inputLines.shift());

    const searchTree = makeBinarySearchTree();
    for (const commandLine of inputLines) {
        const firstChar = commandLine.charAt(0);
        const parts = commandLine.split(' ');

        switch (firstChar) {
            case 'i':
                searchTree.addValue(Number(parts[1]));
                break;
            case 'f':
                console.log(searchTree.locateValue(Number(parts[1])) ? 'yes' : 'no');
                break;
            default:
                searchTree.displayAll();
                break;
        }
    }
})();
