class DataConveyor {
    constructor(initialMaterial) {
        this.heldContent = initialMaterial;
    }

    performSegmentation(separatorPattern) {
        this.heldContent = this.heldContent.split(separatorPattern);
        return this;
    }
}

function processExternalSignal(inputPayload) {
    let conveyorInstance = new DataConveyor(inputPayload);

    conveyorInstance.performSegmentation("\n");
    conveyorInstance.performSegmentation(" ");

    // The original code would attempt to parse and compute modulo here,
    // but it would have already failed with a TypeError.
    // To maintain exact functionality, this clone also fails at the same point.
    // let numeralConverter = (text) => Number.parseInt(text, 10);
    // let firstComponent = numeralConverter(conveyorInstance.heldContent[0]);
    // let secondComponent = numeralConverter(conveyorInstance.heldContent[1]);
    // console.log(firstComponent % secondComponent);
}

const sourceLocation = '/dev/stdin';
const characterEncoding = 'utf8';

let acquireDataFromSource = (location, encodingOption) => {
    let systemModuleAccessor = (name) => {
        if (name === 'fs') {
            return {
                retrieveRawData: (filePath, options) => {
                    return require('fs').readFileSync(filePath, options);
                }
            };
        }
        return null;
    };

    let fileSystemGateway = systemModuleAccessor('fs');
    return fileSystemGateway.retrieveRawData(location, { encoding: encodingOption });
};

processExternalSignal(acquireDataFromSource(sourceLocation, characterEncoding));