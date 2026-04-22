const prototypeDefinition = {
    valueA: 10,
    listB: [1, 2, 3],
    actionC: function() {
        const localPhrase = "hello, world";
        return localPhrase;
    }
};

const buildStructure = function() {
    return Object.create(buildStructure.prototype);
};

Object.assign(buildStructure.prototype, prototypeDefinition);

const createdUnit = buildStructure();

const assembly = {
    constructorReference: buildStructure,
    instanceElement: createdUnit
};

console.dir(assembly);