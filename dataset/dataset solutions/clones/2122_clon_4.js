class DisjointSet {
    constructor(nodeCount) {
        this.parentMap = new Map();
        this.componentSize = new Map();
        for (let i = 0; i < nodeCount; i++) {
            this.parentMap.set(i, i);
            this.componentSize.set(i, 1);
        }
    }

    findSet(element) {
        if (this.parentMap.get(element) === element) {
            return element;
        }
        const root = this.findSet(this.parentMap.get(element));
        this.parentMap.set(element, root);
        return root;
    }

    uniteSets(elementA, elementB) {
        let rootA = this.findSet(elementA);
        let rootB = this.findSet(elementB);

        if (rootA !== rootB) {
            if (this.componentSize.get(rootA) < this.componentSize.get(rootB)) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.parentMap.set(rootB, rootA);
            this.componentSize.set(rootA, this.componentSize.get(rootA) + this.componentSize.get(rootB));
            this.componentSize.delete(rootB);
            return true;
        }
        return false;
    }
}

function CalculateFriendSuggestions(rawData) {
    const dataLines = rawData.trim().split("\n");
    const [totalNodes, directFriendships, blockedRelations] = dataLines[0].split(" ").map(Number);

    const dsu = new DisjointSet(totalNodes);
    const exclusionRegistry = new Map();

    const registerExclusion = (personA, personB) => {
        if (!exclusionRegistry.has(personA)) exclusionRegistry.set(personA, new Set());
        exclusionRegistry.get(personA).add(personB);
    };

    for (let i = 0; i < directFriendships; i++) {
        const [p1, p2] = dataLines[i + 1].split(" ").map(s => Number(s) - 1);
        dsu.uniteSets(p1, p2);
        registerExclusion(p1, p2);
        registerExclusion(p2, p1);
    }

    for (let i = 0; i < blockedRelations; i++) {
        const [p1, p2] = dataLines[i + directFriendships + 1].split(" ").map(s => Number(s) - 1);
        registerExclusion(p1, p2);
        registerExclusion(p2, p1);
    }

    const componentMemberSets = new Map();
    for (let i = 0; i < totalNodes; i++) {
        const rootIdentifier = dsu.findSet(i);
        if (!componentMemberSets.has(rootIdentifier)) {
            componentMemberSets.set(rootIdentifier, new Set());
        }
        componentMemberSets.get(rootIdentifier).add(i);
    }

    const suggestionCounts = new Array(totalNodes);

    for (let i = 0; i < totalNodes; i++) {
        const currentRoot = dsu.findSet(i);
        const membersOfComponent = componentMemberSets.get(currentRoot);
        const currentPersonExclusions = exclusionRegistry.get(i) || new Set();

        let count = 0;
        for (const memberId of membersOfComponent) {
            if (memberId !== i && !currentPersonExclusions.has(memberId)) {
                count++;
            }
        }
        suggestionCounts[i] = count;
    }

    console.log(suggestionCounts.join(" "));
}

CalculateFriendSuggestions(require("fs").readFileSync("/dev/stdin", "utf8"));
