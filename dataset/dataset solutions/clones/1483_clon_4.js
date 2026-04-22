const createComponentManager = (entityCount) => {
    const ancestorMap = Array.from({ length: entityCount }, (_, i) => i);
    const rankMap = new Array(entityCount).fill(0);
    const groupSizeMap = new Array(entityCount).fill(1);

    const identifyRoot = (elementIndex) => {
        if (ancestorMap[elementIndex] === elementIndex) {
            return elementIndex;
        }
        return identifyRoot(ancestorMap[elementIndex]);
    };

    const establishHierarchy = (primaryRoot, secondaryRoot) => {
        if (primaryRoot === secondaryRoot) return null;

        if (rankMap[primaryRoot] > rankMap[secondaryRoot]) {
            ancestorMap[secondaryRoot] = primaryRoot;
            groupSizeMap[primaryRoot] += groupSizeMap[secondaryRoot];
        } else {
            ancestorMap[primaryRoot] = secondaryRoot;
            groupSizeMap[secondaryRoot] += groupSizeMap[primaryRoot];
            if (rankMap[primaryRoot] === rankMap[secondaryRoot]) {
                rankMap[secondaryRoot]++;
            }
        }
    };

    const mergeComponents = (firstElement, secondElement) => {
        establishHierarchy(identifyRoot(firstElement), identifyRoot(secondElement));
    };

    return {
        mergeComponents: mergeComponents,
        getAncestorRegistry: () => ancestorMap
    };
};

const processInputData = (inputContent) => {
    const lines = inputContent.trim().split('\n');
    const [initialLine, ...operationLines] = lines;

    const [totalEntities, opCount] = initialLine.split(' ').map(Number);

    const componentHandler = createComponentManager(totalEntities);

    operationLines.forEach(line => {
        const [itemA, itemB] = line.split(' ').map(Number);
        componentHandler.mergeComponents(itemA - 1, itemB - 1);
    });

    const finalAncestorRegistry = componentHandler.getAncestorRegistry();

    const uniqueAncestors = new Set(finalAncestorRegistry);
    const finalResult = uniqueAncestors.size - 1;

    console.log(finalResult);
};

process.env.MY_ENVIRONMENT_FLAG
    ? (process.env.MY_ENVIRONMENT_FLAG === 'test_mode'
        ? (() => { /* Placeholder for test function */ })()
        : processInputData(require('node:fs').readFileSync('data/source.txt', 'utf8'))
    )
    : processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));