const ingestSystemData = (sourceText) => {
    const rawLines = sourceText.trim().split('\n');
    rawLines.shift(); 

    const linkMapping = new Map(); 
    const allKnownDesignations = new Set(); 

    for (const line of rawLines) {
        const parts = line.split(' ').map(Number);
        const currentDesignation = parts.shift();
        parts.shift(); // Discard subordinates count
        const subordinateDesignations = parts;

        allKnownDesignations.add(currentDesignation);
        for (const subD of subordinateDesignations) {
            allKnownDesignations.add(subD);
        }
        linkMapping.set(currentDesignation, subordinateDesignations);
    }
    return { connectionMap: linkMapping, totalDesignations: allKnownDesignations };
};

const constructComponentRegistry = (dataSchema) => {
    const componentCollection = new Map(); 

    for (const d of dataSchema.totalDesignations) {
        componentCollection.set(d, {
            designation: d,
            antecedentDesignation: null,
            subordinateDesignations: [], 
            layer: -1, 
            category: '' 
        });
    }

    for (const [parentD, childrenDs] of dataSchema.connectionMap.entries()) {
        const parentComponent = componentCollection.get(parentD);
        parentComponent.subordinateDesignations = childrenDs; 

        for (const childD of childrenDs) {
            const childComponent = componentCollection.get(childD);
            if (childComponent) { 
                childComponent.antecedentDesignation = parentD; 
            }
        }
    }
    return componentCollection;
};

const determineComponentProperties = (componentCollection) => {
    const rootComponents = [];
    for (const unit of componentCollection.values()) {
        if (unit.antecedentDesignation === null) {
            rootComponents.push(unit);
        }
    }

    const processingQueue = [];
    for (const root of rootComponents) {
        processingQueue.push({ designation: root.designation, currentLayer: 0 });
    }

    let head = 0;
    while(head < processingQueue.length) {
        const { designation, currentLayer } = processingQueue[head++];
        const currentUnit = componentCollection.get(designation);

        if (currentUnit.layer === -1 || currentUnit.layer > currentLayer) {
            currentUnit.layer = currentLayer;
            for (const subD of currentUnit.subordinateDesignations) {
                processingQueue.push({ designation: subD, currentLayer: currentLayer + 1 });
            }
        }
    }

    for (const unit of componentCollection.values()) {
        if (unit.antecedentDesignation === null) {
            unit.category = 'origin';
        } else if (unit.subordinateDesignations.length === 0) {
            unit.category = 'terminal';
        } else {
            unit.category = 'intermediate node';
        }
    }
};

const renderComponentSummary = (component) => {
    const antecedentInfo = component.antecedentDesignation !== null ? component.antecedentDesignation : -1;
    const subordinateList = component.subordinateDesignations.join(', ');
    return `unit ${component.designation}: antecedent = ${antecedentInfo}, layer = ${component.layer}, ${component.category}, [${subordinateList}]`;
};

(function applicationStart() {
    const rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');

    const schema = ingestSystemData(rawInputText);
    const registry = constructComponentRegistry(schema);
    determineComponentProperties(registry);

    const sortedComponents = Array.from(registry.values()).sort((a, b) => a.designation - b.designation);

    const outputLines = sortedComponents.map(renderComponentSummary);
    console.log(outputLines.join('\n'));
})();