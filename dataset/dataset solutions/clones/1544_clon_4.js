function* makeNumberStream(textData) {
    const rawParts = textData.split(/\s+/);
    for (const part of rawParts) {
        if (part) {
            yield parseInt(part, 10);
        }
    }
}

let numberDispenser;

function orchestrateProcess() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    numberDispenser = makeNumberStream(rawInput);

    const elementCount = numberDispenser.next().value;
    const operationCount = numberDispenser.next().value;

    const disjointSetManager = (function(count) {
        const componentParents = Array.from({ length: count }, (_, idx) => idx);
        const componentSizes = Array.from({ length: count }, () => 1);
        let currentComponentCount = count;

        const findRepresentative = (idx) => {
            if (componentParents[idx] === idx) {
                return idx;
            }
            return findRepresentative(componentParents[idx]);
        };

        const linkComponents = (idxA, idxB) => {
            const rootA = findRepresentative(idxA);
            const rootB = findRepresentative(idxB);

            if (rootA === rootB) {
                return;
            }

            let largerRoot, smallerRoot;
            if (componentSizes[rootA] >= componentSizes[rootB]) {
                largerRoot = rootA;
                smallerRoot = rootB;
            } else {
                largerRoot = rootB;
                smallerRoot = rootA;
            }

            componentParents[smallerRoot] = largerRoot;
            componentSizes[largerRoot] += componentSizes[smallerRoot];
            currentComponentCount--;
        };

        const areConnected = (idxA, idxB) => {
            return findRepresentative(idxA) === findRepresentative(idxB);
        };

        return {
            findRepresentative,
            linkComponents,
            areConnected
        };
    })(elementCount);

    for (let loopIndex = 0; loopIndex < operationCount; ++loopIndex) {
        const queryType = numberDispenser.next().value;
        const param1 = numberDispenser.next().value;
        const param2 = numberDispenser.next().value;

        if (queryType === 0) {
            disjointSetManager.linkComponents(param1, param2);
        } else {
            if (disjointSetManager.areConnected(param1, param2)) {
                console.log(1);
            } else {
                console.log(0);
            }
        }
    }
}

orchestrateProcess();