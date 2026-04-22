function createEntity(initialProperties, parentEntityContainer) {
    const propertyStore = new Map(Object.entries(initialProperties));

    return {
        fetchValue: function(keyIdentifier) {
            if (propertyStore.has(keyIdentifier)) {
                return propertyStore.get(keyIdentifier);
            }
            if (parentEntityContainer && typeof parentEntityContainer.fetchValue === 'function') {
                return parentEntityContainer.fetchValue(keyIdentifier);
            }
            return undefined;
        },
        updateValue: function(keyIdentifier, newValue) {
            propertyStore.set(keyIdentifier, newValue);
        }
    };
}

const primaryUnit = createEntity({ "dimensionA": 13, "dimensionB": 7 }, null);
const secondaryUnit = createEntity({ "characteristicC": true }, primaryUnit);

console.log(secondaryUnit.fetchValue("dimensionA"));
console.log(secondaryUnit.fetchValue("dimensionB"));

const tertiaryUnit = createEntity({ "dimensionA": 2 }, secondaryUnit);

console.log(tertiaryUnit.fetchValue("dimensionA"));
console.log(tertiaryUnit.fetchValue("dimensionB"));
console.log(tertiaryUnit.fetchValue("characteristicC"));

secondaryUnit.updateValue("dimensionB", 19);

console.log(secondaryUnit.fetchValue("dimensionB"));
console.log(primaryUnit.fetchValue("dimensionB"));

console.log(tertiaryUnit.fetchValue("dimensionB"));