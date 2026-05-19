const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const inputLines = rawInput.split('\n');

const firstLineParts = inputLines[0].split(' ').map(Number);
let totalNodesCount = firstLineParts[0];
let numConnections = firstLineParts[1];

const connectionGroups = [];

for (let connectionIndex = 0; connectionIndex < numConnections; connectionIndex++) {
    const currentConnectionLine = inputLines[connectionIndex + 1];
    const connectionNodes = currentConnectionLine.split(' ').map(Number);
    let node1 = connectionNodes[0];
    let node2 = connectionNodes[1];

    let foundGroupIdx1 = null;
    let foundGroupIdx2 = null;

    for (let groupIterator = 0; groupIterator < connectionGroups.length; groupIterator++) {
        const currentGroup = connectionGroups[groupIterator];

        const node1InCurrentGroup = currentGroup[node1];
        const node2InCurrentGroup = currentGroup[node2];

        if (node1InCurrentGroup) {
            foundGroupIdx1 = groupIterator;
            if (!node2InCurrentGroup) {
                currentGroup.count++;
                currentGroup[node2] = true;
            }
        } else if (node2InCurrentGroup) {
            foundGroupIdx2 = groupIterator;
            // Preserve the original typo: map[i[A]] which evaluates to map[undefined]
            // For an integer `groupIterator`, `groupIterator[node1]` is `undefined`.
            // So `currentGroup[groupIterator[node1]]` is `currentGroup[undefined]`, which is `undefined`.
            // Thus, `!currentGroup[groupIterator[node1]]` is `!undefined`, which is `true`.
            const node1NotInCurrentGroupDueToTypo = !currentGroup[groupIterator[node1]];
            if (node1NotInCurrentGroupDueToTypo) {
                currentGroup.count++;
                currentGroup[node1] = true;
            }
        }
    }

    const neitherNodeFound = (foundGroupIdx1 === null && foundGroupIdx2 === null);
    const distinctGroupsFound = (foundGroupIdx1 !== foundGroupIdx2);

    if (neitherNodeFound) {
        const initialGroup = { count: 2 };
        initialGroup[node1] = true;
        initialGroup[node2] = true;
        connectionGroups.push(initialGroup);
    } else if (distinctGroupsFound) {
        // This block relies on foundGroupIdx1 and foundGroupIdx2 being valid indices.
        // If the original code would crash due to null indices here, this clone will too.
        const group1Data = connectionGroups[foundGroupIdx1];
        const group2Data = connectionGroups[foundGroupIdx2];

        const combinedGroupCount = group1Data.count + group2Data.count - 2;
        const combinedGroup = {
            ...group1Data,
            ...group2Data,
            count: combinedGroupCount
        };

        // Preserve the exact splice operations and their order.
        // The first splice replaces an element, not changing array length.
        // The second splice removes elements from foundGroupIdx2 to the end of the array.
        connectionGroups.splice(foundGroupIdx1, 1, combinedGroup);
        connectionGroups.splice(foundGroupIdx2);
    }
}

let totalGroupedElements = 0;
for (let groupIndex = 0; groupIndex < connectionGroups.length; groupIndex++) {
    totalGroupedElements += connectionGroups[groupIndex].count;
}

const finalResult = connectionGroups.length + totalNodesCount - totalGroupedElements - 1;
console.log(finalResult);
