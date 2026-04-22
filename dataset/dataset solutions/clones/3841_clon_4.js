function numParse(txtLine) {
    return txtLine.split(" ").map(Number);
}

function ingestData(rawData) {
    const lines = rawData.split("\n");
    const firstLineNums = numParse(lines[0]);
    const totalItems = firstLineNums[0];
    const mappingArray = numParse(lines[1]);
    const linkPairs = lines.slice(2).map(line => {
        const [left, right] = numParse(line);
        return { initial: left, final: right };
    });
    return { totalItems, mappingArray, linkPairs };
}

function locateRoot(element, parents) {
    if (parents[element] === element) {
        return element;
    }
    parents[element] = locateRoot(parents[element], parents);
    return parents[element];
}

function mergeGroups(elemA, elemB, parents, heights) {
    let rootA = locateRoot(elemA, parents);
    let rootB = locateRoot(elemB, parents);

    if (rootA !== rootB) {
        if (heights[rootA] < heights[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }
        parents[rootB] = rootA;
        if (heights[rootA] === heights[rootB]) {
            heights[rootA]++;
        }
        return true;
    }
    return false;
}

function formStructures(itemCount, connections) {
    const parents = Array.from({ length: itemCount + 1 }, (_, i) => i);
    const heights = Array(itemCount + 1).fill(0);

    connections.forEach(pair => {
        mergeGroups(pair.initial, pair.final, parents, heights);
    });

    return {
        parents: parents,
        shareComponent: (a, b) => locateRoot(a, parents) === locateRoot(b, parents)
    };
}

function AssessMappings(rawData) {
    const { totalItems, mappingArray, linkPairs } = ingestData(rawData);

    const { shareComponent } = formStructures(totalItems, linkPairs);

    let tally = 0;
    for (let i = 0; i < mappingArray.length; i++) {
        const mappedValue = mappingArray[i];
        const originalIndex = i + 1;
        if (shareComponent(mappedValue, originalIndex)) {
            tally++;
        }
    }

    console.log(tally);
    return tally;
}

AssessMappings(require("fs").readFileSync("/dev/stdin", "utf8"));