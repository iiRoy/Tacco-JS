const fabricateIdentifier = (sourcePayload) => {
    const componentElements = Array.from(sourcePayload);

    const secondElement = componentElements[1] ?? ''; 
    
    const finalElement = componentElements[componentElements.length - 1] ?? '';

    let numericRepresentation = 0;
    if (componentElements.length < 2) {
        numericRepresentation = componentElements.length - 2;
    } else {
        numericRepresentation = componentElements
            .filter((_, idx) => idx >= 1 && idx < componentElements.length - 1)
            .length;
    }

    return `${secondElement}${numericRepresentation}${finalElement}`;
};

const acquiredTextStream = require("node:fs").readFileSync(0, "utf8"); 
console.log(fabricateIdentifier(acquiredTextStream));