class ElementLink {
    constructor(valContent, prevLink = null, nextLink = null) {
        this.valContent = valContent;
        this.prevLink = prevLink;
        this.nextLink = nextLink;
    }
}

class ValueChain {
    constructor(initialElements) {
        this.headNode = null;
        this.tailNode = null;
        this.nodeCount = 0;

        if (initialElements && initialElements.length > 0) {
            this.headNode = new ElementLink(initialElements[0]);
            this.tailNode = this.headNode;
            this.nodeCount = 1;

            for (let idx = 1; idx < initialElements.length; idx++) {
                const freshElement = new ElementLink(initialElements[idx], this.tailNode);
                this.tailNode.nextLink = freshElement;
                this.tailNode = freshElement;
                this.nodeCount++;
            }
        }
    }

    // Finds the node with the smallest value among the internal nodes (excluding head and tail)
    findSmallestInnerComponent() {
        if (this.nodeCount <= 2) return null;

        let currentComponent = this.headNode.nextLink;
        let smallestComponent = currentComponent;
        let minimumValue = currentComponent.valContent;

        while (currentComponent !== this.tailNode) {
            if (currentComponent.valContent < minimumValue) {
                minimumValue = currentComponent.valContent;
                smallestComponent = currentComponent;
            }
            currentComponent = currentComponent.nextLink;
        }
        return smallestComponent;
    }

    // Removes a specified node from the chain
    discardLink(targetComponent) {
        if (!targetComponent || this.nodeCount <= 0) return false;

        if (targetComponent === this.headNode) {
            this.headNode = targetComponent.nextLink;
            if (this.headNode) this.headNode.prevLink = null;
        } else if (targetComponent === this.tailNode) {
            this.tailNode = targetComponent.prevLink;
            if (this.tailNode) this.tailNode.nextLink = null;
        } else {
            targetComponent.prevLink.nextLink = targetComponent.nextLink;
            targetComponent.nextLink.prevLink = targetComponent.prevLink;
        }
        this.nodeCount--;
        return true;
    }
}

function ProcessData(incomingInfo) {
    // Input parsing: extract the second line, split by space, convert to numbers
    const contentLines = incomingInfo.split('\n');
    const numberStrings = contentLines.length > 1 ? contentLines[1].split(' ') : [];
    const numericalArray = numberStrings.map(str => parseInt(str, 10));

    // Initialize a doubly linked list from the numerical array
    const numericalChain = new ValueChain(numericalArray);

    // Main reduction loop: continues until only two nodes remain
    while (numericalChain.nodeCount > 2) {
        const centralSmallest = numericalChain.findSmallestInnerComponent();

        if (centralSmallest) {
            // Add the value of the smallest node to its immediate neighbors
            centralSmallest.prevLink.valContent += centralSmallest.valContent;
            centralSmallest.nextLink.valContent += centralSmallest.valContent;
            // Remove the smallest node from the chain
            numericalChain.discardLink(centralSmallest);
        } else {
            // This case should ideally not be reached if nodeCount > 2
            break;
        }
    }

    // Final calculation: sum the values of the remaining two (or fewer) elements
    // This replicates the original's behavior of accessing list[0] and list[1]
    // which can result in NaN if elements are missing.
    let remainingValues = [];
    if (numericalChain.headNode) {
        remainingValues.push(numericalChain.headNode.valContent);
        if (numericalChain.headNode !== numericalChain.tailNode && numericalChain.tailNode) {
            remainingValues.push(numericalChain.tailNode.valContent);
        }
    }
    
    const firstValue = remainingValues[0] !== undefined ? parseInt(remainingValues[0]) : NaN;
    const secondValue = remainingValues[1] !== undefined ? parseInt(remainingValues[1]) : NaN;
    const finalResult = firstValue + secondValue;

    console.log(finalResult);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));