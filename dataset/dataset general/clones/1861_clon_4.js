function produceCollectionManager() {
    let storedElements = [];

    return {
        obtainAllEntries: function() {
            return storedElements;
        },

        addPair: function(valueOne, valueTwo) {
            storedElements.push({ identifierOne: valueOne, identifierTwo: valueTwo });
        },

        eraseAll: function() {
            storedElements = [];
        }
    };
}