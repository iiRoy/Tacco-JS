const FILE_SYSTEM_ACCESSOR = require('fs');
const RAW_STREAM_CONTENT = FILE_SYSTEM_ACCESSOR.readFileSync(process.stdin.fd, 'utf8');
let TEXTUAL_SEGMENTS = RAW_STREAM_CONTENT.trim().split('\n');

function EXTRACT_NEXT_ENTRY() {
    return TEXTUAL_SEGMENTS.shift();
}

class ComponentAggregator {
    #parentMapping;
    #groupSize;

    constructor(totalElements) {
        this.#parentMapping = new Map();
        this.#groupSize = new Map();
        for (let i = 0; i < totalElements; i++) {
            this.#parentMapping.set(i, i);
            this.#groupSize.set(i, 1);
        }
    }

    determineRepresentative(itemIdentifier) {
        const currentParent = this.#parentMapping.get(itemIdentifier);
        if (currentParent === itemIdentifier) {
            return itemIdentifier;
        }
        const root = this.determineRepresentative(currentParent);
        this.#parentMapping.set(itemIdentifier, root);
        return root;
    }

    mergeComponents(elementA, elementB) {
        let rootA = this.determineRepresentative(elementA);
        let rootB = this.determineRepresentative(elementB);

        if (rootA !== rootB) {
            let sizeA = this.#groupSize.get(rootA);
            let sizeB = this.#groupSize.get(rootB);

            if (sizeA < sizeB) {
                [rootA, rootB] = [rootB, rootA];
                [sizeA, sizeB] = [sizeB, sizeA];
            }
            this.#parentMapping.set(rootB, rootA);
            this.#groupSize.set(rootA, sizeA + sizeB);
            return true;
        }
        return false;
    }

    areAligned(elementA, elementB) {
        return this.determineRepresentative(elementA) === this.determineRepresentative(elementB);
    }

    calculateDistinctComponents(activeElementSet) {
        const uniqueRepresentatives = new Set();
        for (const element of activeElementSet) {
            uniqueRepresentatives.add(this.determineRepresentative(element));
        }
        return uniqueRepresentatives.size;
    }
}

function PROCESS_GRAPH_SEQUENCES() {
    let currentLineData;

    while (true) {
        currentLineData = EXTRACT_NEXT_ENTRY().split(' ').map(Number);
        const VERTEX_COUNT = currentLineData[0];
        const EDGE_COUNT = currentLineData[1];

        if (VERTEX_COUNT === 0 && EDGE_COUNT === 0) {
            break;
        }

        const NODAL_TIMINGS = [];
        for (let i = 0; i < VERTEX_COUNT; i++) {
            NODAL_TIMINGS.push({
                INDEX_LABEL: i,
                TIME_MARK: Number(EXTRACT_NEXT_ENTRY())
            });
        }

        const CONNECTIVE_PATHS = [];
        for (let i = 0; i < EDGE_COUNT; i++) {
            const pathDetails = EXTRACT_NEXT_ENTRY().split(' ').map(Number);
            CONNECTIVE_PATHS.push({
                ORIGIN_VERTEX: pathDetails[0] - 1,
                TERMINUS_VERTEX: pathDetails[1] - 1,
                PATH_COST: pathDetails[2]
            });
        }

        NODAL_TIMINGS.sort((a, b) => a.TIME_MARK - b.TIME_MARK);
        CONNECTIVE_PATHS.sort((a, b) => a.PATH_COST - b.PATH_COST);

        let finalCalculatedMetric = 0;
        let participatingVertices = new Set();
        
        let cursor = VERTEX_COUNT - 1;
        while (cursor >= 0) {
            const currentVertexRecord = NODAL_TIMINGS[cursor];
            const currentTemporalMarker = currentVertexRecord.TIME_MARK;

            participatingVertices.add(currentVertexRecord.INDEX_LABEL);

            let tempCursor = cursor; // Use a temporary cursor for the inner loop
            while (tempCursor > 0 && NODAL_TIMINGS[tempCursor - 1].TIME_MARK === currentTemporalMarker) {
                tempCursor--;
                participatingVertices.add(NODAL_TIMINGS[tempCursor].INDEX_LABEL);
            }
            cursor = tempCursor; // Update outer cursor after processing all nodes with same TIME_MARK

            let componentTracker = new ComponentAggregator(VERTEX_COUNT);
            let iterationCost = 0;

            for (const currentPath of CONNECTIVE_PATHS) {
                if (participatingVertices.has(currentPath.ORIGIN_VERTEX) && participatingVertices.has(currentPath.TERMINUS_VERTEX)) {
                    if (!componentTracker.areAligned(currentPath.ORIGIN_VERTEX, currentPath.TERMINUS_VERTEX)) {
                        componentTracker.mergeComponents(currentPath.ORIGIN_VERTEX, currentPath.TERMINUS_VERTEX);
                        iterationCost += currentPath.PATH_COST;
                    }
                }
            }

            if (componentTracker.calculateDistinctComponents(participatingVertices) > 1) {
                finalCalculatedMetric = 0;
            } else {
                finalCalculatedMetric = iterationCost;
            }
            
            cursor--; // Move to the next distinct TIME_MARK group (or the next individual node if no group)
        }
        console.log(finalCalculatedMetric);
    }
}

PROCESS_GRAPH_SEQUENCES();