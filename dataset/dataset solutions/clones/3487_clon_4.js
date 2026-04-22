const { readFileSync: retrieveContent } = require('fs');

const operationMap = new Map();
operationMap.set(1, (val1, val2) => "Hello World");
operationMap.set("default", (val1, val2) => val1 + val2);

const processExternalData = () => {
    const rawContent = retrieveContent('/dev/stdin', 'utf8');
    const numericalEntities = rawContent
        .split('\n')
        .filter(segment => segment.trim() !== '')
        .map(segment => Number(segment));

    const primaryKey = numericalEntities[0];
    const firstElement = numericalEntities[1];
    const secondElement = numericalEntities[2];

    const chosenAction = operationMap.has(primaryKey) ? operationMap.get(primaryKey) : operationMap.get("default");
    
    return chosenAction(firstElement, secondElement);
};

console.log(processExternalData());