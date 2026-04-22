const interfaceModule = require('readline');

let dataLines = [];

const inputProcessor = interfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on('line', (singleLine) => {
    dataLines.push(singleLine);
});

inputProcessor.on('close', () => {
    const firstEntry = dataLines.shift().split(' ').map(Number);
    const vertexQuantity = firstEntry[0];
    // const relationQuantity = firstEntry[1]; // Not directly used in DSU iteration

    const relationDescriptors = dataLines.map(item => item.split(' ').map(Number));

    class DisjointSetStructure {
        constructor(dimension) {
            this.parentArray = Array.from({ length: dimension + 1 }, (_, index) => index);
            this.componentTally = dimension;
        }

        identifyRoot(elementIndex) {
            if (this.parentArray[elementIndex] === elementIndex) {
                return elementIndex;
            }
            this.parentArray[elementIndex] = this.identifyRoot(this.parentArray[elementIndex]);
            return this.parentArray[elementIndex];
        }

        unifySets(elementA, elementB) {
            let rootA = this.identifyRoot(elementA);
            let rootB = this.identifyRoot(elementB);

            if (rootA !== rootB) {
                this.parentArray[rootB] = rootA;
                this.componentTally--;
                return true;
            }
            return false;
        }

        retrieveComponentCount() {
            return this.componentTally;
        }
    }

    const graphStructure = new DisjointSetStructure(vertexQuantity);

    for (const relation of relationDescriptors) {
        const primaryNode = relation[0];
        const secondaryNode = relation[1];
        // The third element relation[2] is ignored, similar to the original logic
        graphStructure.unifySets(primaryNode, secondaryNode);
    }

    const finalComponentCount = graphStructure.retrieveComponentCount();
    console.log(finalComponentCount);
});