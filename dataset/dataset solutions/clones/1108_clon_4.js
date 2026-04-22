const constructVault = () => {
    let identifierCounter = 0;
    // Maps a unique identifier to its component data: value, parent identifier, left child identifier, right child identifier
    const elementRegister = new Map();
    let primaryRootIdentifier = null; // Stores the identifier of the tree's root component

    // Generates a new unique identifier for a component
    const mintIdentifier = () => ++identifierCounter;

    // Retrieves a component's data by its identifier
    const retrieveComponent = (id) => elementRegister.get(id);

    // Recursive method to place a new value into the vault
    // Returns the identifier of the component at the current position (which might be new or existing)
    const depositElement = (value, currentId, parentId) => {
        if (currentId === null) {
            const freshIdentifier = mintIdentifier();
            elementRegister.set(freshIdentifier, { v: value, p: parentId, l: null, r: null });
            return freshIdentifier;
        }
        const currentComponent = retrieveComponent(currentId);
        if (value < currentComponent.v) {
            currentComponent.l = depositElement(value, currentComponent.l, currentId);
        } else { // For binary search trees, duplicates typically go to the right or are disallowed. Assuming right for non-strict inequality.
            currentComponent.r = depositElement(value, currentComponent.r, currentId);
        }
        return currentId; // The current node's identifier remains unchanged
    };

    // Iterative method to locate a value's identifier in the vault
    // Returns the identifier if found, otherwise null
    const spotElement = (value) => {
        let presentIdentifier = primaryRootIdentifier;
        while (presentIdentifier !== null) {
            const presentComponent = retrieveComponent(presentIdentifier);
            if (presentComponent.v === value) {
                return presentIdentifier;
            }
            if (value < presentComponent.v) {
                presentIdentifier = presentComponent.l;
            } else {
                presentIdentifier = presentComponent.r;
            }
        }
        return null;
    };

    // Helper for deletion: Counts the number of direct child links for a component
    const measureDirectLinks = (id) => {
        const component = retrieveComponent(id);
        let count = 0;
        if (component.l !== null) count++;
        if (component.r !== null) count++;
        return count;
    };

    // Helper for deletion: Ascertains the in-order successor's identifier (recursive implementation)
    const ascertainNextComponent = (id) => {
        // Finds the minimum value's identifier in a subtree (leftmost descendant)
        const _findMinimumId = (startId) => {
            const startComponent = retrieveComponent(startId);
            if (startComponent.l === null) return startId;
            return _findMinimumId(startComponent.l);
        };

        // Finds the first ancestor for which the current child is a left descendant
        const _findAncestorId = (childId, ancestorId) => {
            if (ancestorId === null) return null; // Reached the root or no such ancestor exists
            const ancestorComponent = retrieveComponent(ancestorId);
            if (ancestorComponent.l === childId) { // If child is the left descendant, ancestor is the successor
                return ancestorId;
            }
            // Move up the tree
            return _findAncestorId(ancestorId, ancestorComponent.p);
        };

        const component = retrieveComponent(id);
        if (component.r !== null) {
            // If there's a right subtree, successor is the minimum in that subtree
            return _findMinimumId(component.r);
        } else {
            // Otherwise, successor is the lowest ancestor whose left child is also an ancestor of the current node
            return _findAncestorId(id, component.p);
        }
    };

    // Main deletion method
    const eraseElement = (value) => {
        const objectiveIdentifier = spotElement(value);
        if (objectiveIdentifier === null) return; // Value not found

        const objectiveComponent = retrieveComponent(objectiveIdentifier);
        const forebearIdentifier = objectiveComponent.p;
        const linkCount = measureDirectLinks(objectiveIdentifier);

        // Determine if the objective component is the left or right child of its forebear
        let linkDirection = null;
        if (forebearIdentifier !== null) {
            linkDirection = (retrieveComponent(forebearIdentifier).l === objectiveIdentifier) ? 'l' : 'r';
        }

        if (linkCount === 0) { // Component has no children
            if (forebearIdentifier === null) { // It's the root
                primaryRootIdentifier = null;
            } else {
                retrieveComponent(forebearIdentifier)[linkDirection] = null;
            }
            elementRegister.delete(objectiveIdentifier);
        } else if (linkCount === 1) { // Component has one child
            const connectedIdentifier = objectiveComponent.l !== null ? objectiveComponent.l : objectiveComponent.r;
            const connectedComponent = retrieveComponent(connectedIdentifier);
            connectedComponent.p = forebearIdentifier; // Update child's parent pointer

            if (forebearIdentifier === null) { // It's the root
                primaryRootIdentifier = connectedIdentifier;
            } else {
                retrieveComponent(forebearIdentifier)[linkDirection] = connectedIdentifier;
            }
            elementRegister.delete(objectiveIdentifier);
        } else { // Component has two children
            const subsequentIdentifier = ascertainNextComponent(objectiveIdentifier);
            const subsequentValue = retrieveComponent(subsequentIdentifier).v;

            // Recursively remove the successor from its original position (it will have 0 or 1 child)
            eraseElement(subsequentValue);
            // Replace the objective component's value with the successor's value
            retrieveComponent(objectiveIdentifier).v = subsequentValue;
        }
    };

    // Iterative in-order traversal using a stack
    const traverseAndOutputOrdered = () => {
        if (primaryRootIdentifier === null) {
            console.log('');
            return;
        }

        let outputSequence = [];
        let traversalStack = [];
        let presentIdentifier = primaryRootIdentifier;

        while (presentIdentifier !== null || traversalStack.length > 0) {
            while (presentIdentifier !== null) {
                traversalStack.push(presentIdentifier);
                presentIdentifier = retrieveComponent(presentIdentifier).l;
            }
            presentIdentifier = traversalStack.pop();
            outputSequence.push(retrieveComponent(presentIdentifier).v);
            presentIdentifier = retrieveComponent(presentIdentifier).r;
        }
        console.log(' ' + outputSequence.join(' ')); // Prepend space to match original output format
    };

    // Iterative pre-order traversal using a stack
    const traverseAndOutputPreOrdered = () => {
        if (primaryRootIdentifier === null) {
            console.log('');
            return;
        }

        let outputSequence = [];
        let traversalStack = [primaryRootIdentifier]; // Start with the root

        while (traversalStack.length > 0) {
            const presentIdentifier = traversalStack.pop();
            const presentComponent = retrieveComponent(presentIdentifier);
            outputSequence.push(presentComponent.v);

            // Push right child first, then left, so that left is popped and processed first (LIFO)
            if (presentComponent.r !== null) {
                traversalStack.push(presentComponent.r);
            }
            if (presentComponent.l !== null) {
                traversalStack.push(presentComponent.l);
            }
        }
        console.log(' ' + outputSequence.join(' ')); // Prepend space to match original output format
    };

    // Public interface for the vault
    return {
        lodge: (val) => {
            if (primaryRootIdentifier === null) {
                primaryRootIdentifier = depositElement(val, null, null);
            } else {
                depositElement(val, primaryRootIdentifier, null);
            }
        },
        spotElement: (val) => Boolean(spotElement(val)), // Returns true if value is found, false otherwise
        eraseElement: eraseElement,
        presentStructure: () => {
            traverseAndOutputOrdered();
            traverseAndOutputPreOrdered();
        }
    };
};

(function processInput() {
    const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const numCommands = Number(dataLines.shift()); // Number of commands, not used but consumed

    const dataVault = constructVault(); // Create an instance of the data vault

    dataLines.forEach(function(commandText) {
        const commandParts = commandText.split(' ');
        const operation = commandParts[0];
        const value = Number(commandParts[1]); // Value for insert, find, delete operations

        switch (operation.charAt(0)) {
            case 'i': dataVault.lodge(value); break;
            case 'f': console.log(dataVault.spotElement(value) ? 'yes' : 'no'); break;
            case 'd': dataVault.eraseElement(value); break;
            default: dataVault.presentStructure(); // 'print' command
        }
    });
})();