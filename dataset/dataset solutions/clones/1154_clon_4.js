class GroupManager {
    #ancestors;
    #depths;

    constructor(itemCount) {
        this.#ancestors = Array.from({ length: itemCount }, (_, idx) => idx);
        this.#depths = new Array(itemCount).fill(0);
    }

    discoverRoot(memberId) {
        const traversalPath = [];
        let currentElement = memberId;

        while (this.#ancestors[currentElement] !== currentElement) {
            traversalPath.push(currentElement);
            currentElement = this.#ancestors[currentElement];
        }

        // Compress path by directly linking all nodes in the path to the root
        for (const nodeOnPath of traversalPath) {
            this.#ancestors[nodeOnPath] = currentElement;
        }
        return currentElement;
    }

    belongToSameGroup(firstMember, secondMember) {
        return this.discoverRoot(firstMember) === this.discoverRoot(secondMember);
    }

    joinSets(firstMember, secondMember) {
        let rootA = this.discoverRoot(firstMember);
        let rootB = this.discoverRoot(secondMember);

        if (rootA === rootB) {
            return;
        }

        // Union by rank optimization
        if (this.#depths[rootA] < this.#depths[rootB]) {
            // Ensure rootA is the deeper or equal-depth tree for simpler merge logic
            [rootA, rootB] = [rootB, rootA];
        }

        this.#ancestors[rootB] = rootA; // Attach smaller tree to root of larger tree
        if (this.#depths[rootA] === this.#depths[rootB]) {
            this.#depths[rootA]++; // Increment rank if ranks were equal
        }
    }
}

let inputBuffer = '';
let tokenPointer = 0;
let processedTokens = [];

function readInputToken(dataType) {
    if (dataType === 'string') {
        return processedTokens[tokenPointer++];
    } else {
        return Number(processedTokens[tokenPointer++]);
    }
}

function displayOutput(value) {
    console.log(value);
}

function conductOperations() {
    const totalEntities = readInputToken();
    const groupHandler = new GroupManager(totalEntities);

    const commandCount = readInputToken();

    for (let i = 0; i < commandCount; ++i) {
        const operationCode = readInputToken();
        const entityX = readInputToken();
        const entityY = readInputToken();

        if (operationCode === 0) {
            groupHandler.joinSets(entityX, entityY);
        } else {
            displayOutput(Number(groupHandler.belongToSameGroup(entityX, entityY)));
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    processedTokens = inputBuffer.trim().split(/\s+/);
    conductOperations();
});