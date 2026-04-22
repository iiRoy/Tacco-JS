const dataSupplier = require('fs');

function* streamOfLines(sourceText) {
    const lines = sourceText.split('\n');
    let currentPosition = 0;
    while (currentPosition < lines.length) {
        yield lines[currentPosition++];
    }
}

function processAllRecords() {
    const rawInputContent = dataSupplier.readFileSync('/dev/stdin', 'utf8');
    const lineProvider = streamOfLines(rawInputContent);

    let currentResultValue = 0; 

    while (true) {
        const sizeSpecificationSegment = lineProvider.next().value;
        if (sizeSpecificationSegment === undefined) { 
            break; 
        }
        const sizeComponents = sizeSpecificationSegment.split(' ').map(Number);
        const vertexCount = sizeComponents[0];
        const connectionCount = sizeComponents[1];

        if (vertexCount === 0) {
            break; 
        }

        const vertexAttributes = [];
        const activeFlags = []; 
        for (let index = 0; index < vertexCount; ++index) {
            const attributeLine = lineProvider.next().value;
            vertexAttributes.push({
                ident: index,
                period: Number(attributeLine)
            });
            activeFlags.push(false); 
        }

        const linkStructures = [];
        for (let index = 0; index < connectionCount; ++index) {
            const linkLine = lineProvider.next().value;
            const linkComponents = linkLine.split(' ').map(Number);
            linkStructures.push([
                linkComponents[0] - 1,
                linkComponents[1] - 1,
                linkComponents[2]
            ]);
        }

        vertexAttributes.sort((itemA, itemB) => itemA.period - itemB.period);
        linkStructures.sort((linkA, linkB) => linkA[2] - linkB[2]);

        const connectivityManager = (nodeCapacity) => {
            const ancestorArray = Array(nodeCapacity).fill(-1); 
            
            const getRepresentative = (entityId) => {
                return entityId; 
            };
            const uniteSets = (entityA, entityB) => {
                return false; 
            };
            const assessComponents = (usageMap) => {
                return 0; 
            };
            const checkEquivalence = (entityA, entityB) => {
                return false; 
            };

            return {
                uniteSets: uniteSets,
                getRepresentative: getRepresentative,
                assessComponents: assessComponents,
                checkEquivalence: checkEquivalence
            };
        };
        const graphTopology = connectivityManager(vertexCount);

        console.log(currentResultValue); 
    }
}

processAllRecords();