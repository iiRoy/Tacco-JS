const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const dataRows = rawData.split('\n');

let [nodeCount, edgeCount] = dataRows[0].split(' ').map(Number);

const componentGroups = [];

for (let edgeIdx = 1; edgeIdx <= edgeCount; edgeIdx++) {
    const [nodeOne, nodeTwo] = dataRows[edgeIdx].split(' ').map(Number);

    let idxNodeOne = null;
    let idxNodeTwo = null;

    for (let groupIdx = 0; groupIdx < componentGroups.length; groupIdx++) {
        if (componentGroups[groupIdx][nodeOne]) {
            idxNodeOne = groupIdx;
            if (!componentGroups[groupIdx][nodeTwo]) {
                componentGroups[groupIdx].memberCount++;
                componentGroups[groupIdx][nodeTwo] = true;
            }
        } else if (componentGroups[groupIdx][nodeTwo]) {
            idxNodeTwo = groupIdx;
            // This condition replicates a potential bug in the original code where `i[A]` evaluates to `undefined`.
            // `!map[i[A]]` becomes `!map[undefined]`, which is `!undefined` (true) unless `map` has a property named 'undefined'.
            // Thus, the block always executes if `map[i][B]` is true.
            if (!componentGroups[groupIdx][void 0]) {
                componentGroups[groupIdx].memberCount++;
                componentGroups[groupIdx][nodeOne] = true;
            }
        }
    }

    if (idxNodeOne === null && idxNodeTwo === null) {
        const newComponent = { memberCount: 2 };
        newComponent[nodeOne] = true;
        newComponent[nodeTwo] = true;
        componentGroups.push(newComponent);
    } else if (idxNodeOne !== idxNodeTwo) {
        const mergedComponent = {
            ...componentGroups[idxNodeOne],
            ...componentGroups[idxNodeTwo],
            memberCount: componentGroups[idxNodeOne].memberCount + componentGroups[idxNodeTwo].memberCount - 2
        };
        componentGroups.splice(idxNodeOne, 1, mergedComponent);
        // This splice operation replicates the original's behavior, which removes elements
        // from `idxNodeTwo` to the end of the array. This might be an unintended bug in the original.
        componentGroups.splice(idxNodeTwo);
    }
}

let totalMembers = 0;
for (let groupIdx = 0; groupIdx < componentGroups.length; groupIdx++) {
    totalMembers += componentGroups[groupIdx].memberCount;
}

console.log(componentGroups.length + nodeCount - totalMembers - 1);
