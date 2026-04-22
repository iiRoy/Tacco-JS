;(function(globalRef, buildProduct) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = buildProduct(require('../is.js'), require('./objects'));
    } else if (typeof define === 'function' && define.amd) {
        define(['../is.js', './objects'], buildProduct);
    } else {
        globalRef.test_suite_for_inclusion = buildProduct(globalRef.is, globalRef.TEST_OBJECTS);
    }
}(this, function(validatorUtility, dataRepository) {

    const checkInclusionStatus = validatorUtility.inside;

    const testSpecificationsList = [
        { desc: "Elements of an array are in the array", container: "ARRAY_LITERAL_NONEMPTY", item: 1, outcome: true },
        { desc: "Elements not in an array are not in the array", container: "ARRAY_LITERAL_NONEMPTY", item: 0, outcome: false },
        { desc: "The value of object properties are in the object", container: "OBJECT_USER_DEFINED", item: 'propValue', outcome: true },
        { desc: "Object property names are not in the object", container: "OBJECT_USER_DEFINED", item: 'aProperty', outcome: false },
        { desc: "Object prototype properties are not in the object", container: "OBJECT_USER_DEFINED", item: 'aMethod', outcome: false },
        { desc: "Object prototype property values are not in the object", container: "OBJECT_USER_DEFINED", item: 'protoPropValue', outcome: false },
        { desc: "Object literal property values are in the object", container: "OBJECT_LITERAL_NONEMPTY", item: 1, outcome: true },
        { desc: "Object literal property names are not in the object", container: "OBJECT_LITERAL_NONEMPTY", item: 'a', outcome: false },
        { desc: "Undefined properties are not in an object literal", container: "OBJECT_LITERAL_NONEMPTY", item: 'not_in', outcome: false },
        { desc: "Invalid container objects (non-array/non-object) do not contain properties", container: null, item: 'not_in', outcome: false }
    ];

    const generatedTestCases = testSpecificationsList.reduce((accumulatorObject, currentSpec) => {
        let targetSubject;
        if (currentSpec.container === null) {
            targetSubject = null;
        } else {
            targetSubject = dataRepository[currentSpec.container];
        }

        accumulatorObject[currentSpec.desc] = {
            actual: checkInclusionStatus(targetSubject, currentSpec.item),
            expected: currentSpec.outcome
        };
        return accumulatorObject;
    }, {});

    return generatedTestCases;
}));