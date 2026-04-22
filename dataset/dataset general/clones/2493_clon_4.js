const retrieveComponent = (sourceAddress) => require(sourceAddress);

const specificationMatrix = [
    ['Evernote', './evernote', 'Evernote'],
    ['customConnections', './lib/evernode/CustomConnections'],
    ['UserStore', './lib/evernote-thrift/gen-nodejs/UserStore'],
    ['NoteStore', './lib/evernote-thrift/gen-nodejs/NoteStore'],
    ['NoteStoreTypes', './lib/evernote-thrift/gen-nodejs/NoteStore_types'],
    ['Types', './lib/evernote-thrift/gen-nodejs/Types_types']
];

const processSpecifications = (matrix) => {
    const resultingStructure = {};
    for (let i = 0; i < matrix.length; i++) {
        const currentEntry = matrix[i];
        const targetKey = currentEntry[0];
        const modulePathString = currentEntry[1];
        const nestedKey = currentEntry[2];

        let fetchedDependency = retrieveComponent(modulePathString);
        
        if (nestedKey) {
            resultingStructure[targetKey] = fetchedDependency[nestedKey];
        } else {
            resultingStructure[targetKey] = fetchedDependency;
        }
    }
    return resultingStructure;
};

Object.assign(module.exports, processSpecifications(specificationMatrix));