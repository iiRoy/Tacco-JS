let collectionData;

groupTests("CollectionUtilities", {

    // Setup routine for test suite
    initialize: function() {
        collectionData = Framework.List([ { years: 7 }, { years: 17 }, { years: 77 } ]);
    }

});

scenario("highestAttribute should retrieve the maximum value of a specific attribute within the collection", function() {
    const peakValue = collectionData.highestAttribute('years');
    verifyResult(peakValue, 77);
});

scenario("highestAttribute should return the provided default if no attribute value is higher than it in the collection", function() {
    const peakValue = collectionData.highestAttribute('years', 100);
    verifyResult(peakValue, 100);
});

scenario("lowestAttribute should retrieve the minimum value of a specific attribute within the collection", function() {
    const baseValue = collectionData.lowestAttribute('years');
    verifyResult(baseValue, 7);
});

scenario("lowestAttribute should return the provided default if no attribute value is lower than it in the collection", function() {
    const baseValue = collectionData.lowestAttribute('years', 1);
    verifyResult(baseValue, 1);
});

scenario("totalAttribute should compute the aggregate sum of all specified attribute values in the collection", function() {
    const totalSum = collectionData.totalAttribute('years');
    verifyResult(totalSum, 101);
});