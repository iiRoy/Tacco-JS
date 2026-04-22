var structureFinder = require("../treeql"); // Rename the utility module
const valPlaceholder = structureFinder.variable; // Alias the variable placeholder function

// A collection of test scenarios for the data querying functionality.
testSuite("Data Selection Operations", function() {

    // Scenario: Verify that the root-level object can be matched correctly.
    testCase("Should identify and process the top-level entity", function() {
        // Define the target data structure.
        const targetObject = {
            "entityName": "Andrei",
            "entityAge": 28
        };

        // Define the search pattern for the root.
        const searchPattern = {
            "entityName": "Andrei"
        };

        // Execute the query operation.
        structureFinder.query(
            targetObject,
            searchPattern,
            function(matchedNode) {
                // Ensure the matched node is valid before asserting.
                if (matchedNode && typeof matchedNode === 'object') {
                    assert(matchedNode.entityAge).toEqual(28); // Verify a property of the matched node.
                } else {
                    assert.fail("Matched node was not an object or was null.");
                }
            },
            function(modifiedStructure, foundInstances) {
                // Confirm the total number of matches.
                assert(foundInstances).toEqual(1);
            }
        );
    });

    // Scenario: Ensure simple scalar values can be matched directly.
    testCase("Should correctly match a basic scalar value", function() {
        const testString = "Andrei";
        // Perform a query where the target and pattern are identical strings.
        structureFinder.query(
            testString,
            testString,
            null, // No specific node callback needed here.
            function(finalOutput, matchQuantity) {
                // The result should be the matched string itself.
                assert(finalOutput).toEqual(testString);
                // Expect exactly one match.
                assert(matchQuantity).toEqual(1);
            }
        );
    });

    // Scenario: Confirm that an object cannot match an empty array query.
    testCase("Should not yield matches when an object is queried with an empty array pattern", function() {
        const sourceData = {
            personIdentifier: "Andrei"
        };
        const invalidPattern = []; // An empty array is not a valid query for an object.

        // Execute the query, expecting no matches.
        structureFinder.query(
            sourceData,
            invalidPattern,
            null,
            function(processedData, totalMatches) {
                // No matches should be found.
                assert(totalMatches).toEqual(0);
                // The original data structure should remain unchanged in this case.
                assert(processedData).toEqual(sourceData);
            }
        );
    });

    // Scenario: Test matching objects based on the presence of an undefined property value.
    testCase("Should locate entities based on an undefined property value", function() {
        // Prepare the input data set.
        const inputDataSet = [{
            personName: "Andrei"
        }, {
            uniqueAttribute: 10
        }];

        // Define the query pattern to find objects where 'personName' exists but its value is not specified.
        const queryForUndefined = {
            personName: undefined
        };

        // Execute the query.
        structureFinder.query(
            inputDataSet,
            queryForUndefined,
            null,
            function(finalOutput, matchQuantity) {
                // We expect one object to match (the one with 'personName').
                assert(matchQuantity).toEqual(1);
                // Optionally, verify the output structure if it were modified.
                assert(finalOutput).toEqual(inputDataSet);
            }
        );
    });

    // Scenario: Demonstrate finding objects using a custom function within the query.
    testCase("Should identify objects matching a functional criterion", function() {
        const personRecords = [{
            fullName: "Andrei",
            yearsOld: 28
        }, {
            fullName: "Corina",
            yearsOld: 26
        }, {
            fullName: "Homer Simpson",
            yearsOld: 60
        }];

        // A named function for the age condition.
        const isUnderFifty = function(currentAge) {
            return currentAge < 50;
        };

        // Query to find people whose age satisfies the `isUnderFifty` function.
        const ageCriteria = {
            yearsOld: isUnderFifty
        };

        structureFinder.query(
            personRecords,
            ageCriteria,
            null,
            function(resultCollection, matchedCount) {
                // Expect two individuals to match the age criterion.
                assert(matchedCount).toEqual(2);
                // The result collection should be the original array if no modifications.
                assert(resultCollection).toEqual(personRecords);
            }
        );
    });

    // Scenario: Match a nested array element based on a partial definition and a functional check.
    testCase("Should match a specific element within a nested array using a functional predicate", function() {
        const complexDataObject = {
            metadata: {
                itemType: 'category'
            },
            propertyList: [{
                propType: 'a',
                propValue: 4
            }, {
                propType: 'b',
                propValue: 5
            }]
        };

        // Define a query targeting an element in 'propertyList' where 'propValue' is 5.
        const arrayElementPattern = {
            propertyList: [{
                propValue: (v) => {
                    // Using strict equality for robustness.
                    return v === 5;
                }
            }]
        };

        structureFinder.query(
            complexDataObject,
            arrayElementPattern,
            null,
            function(outcome, totalMatches) {
                // We expect one match within the 'propertyList' array.
                assert(totalMatches).toEqual(1);
                // Verify the overall structure remains consistent.
                assert(outcome).toEqual(complexDataObject);
            }
        );
    });

    // Scenario: Find a simple object nested within another object.
    testCase("Should successfully locate a simple nested object", function() {
        const rootContainer = {
            userData: {
                "givenName": "Andrei",
                "currentAge": 28
            }
        };

        // Query for an object with 'givenName'.
        const targetQuery = {
            "givenName": "Andrei"
        };

        structureFinder.query(
            rootContainer,
            targetQuery,
            function(foundElement) {
                // Verify properties of the found nested element.
                if (foundElement && typeof foundElement.currentAge === 'number') {
                    assert(foundElement.currentAge).toEqual(28);
                } else {
                    assert.fail("Expected 'currentAge' to be a number on the found element.");
                }
            },
            function(finalResultTree, matchCount) {
                // One nested object should match.
                assert(matchCount).toEqual(1);
            }
        );
    });

    // Scenario: Test capturing distinct variable values that appear only once.
    testCase("Should capture unique variable occurrences", function() {
        const nestedData = {
            userDetails: {
                "personName": "Andrei",
                "personAge": 28,
                "personCity": "London"
            }
        };

        // Query using placeholders for 'personAge' and 'personCity'.
        const variableQuery = {
            "personName": "Andrei",
            "personAge": valPlaceholder("ageValue"), // Capture age
            "personCity": valPlaceholder("cityValue") // Capture city
        };

        structureFinder.query(
            nestedData,
            variableQuery,
            function(matchedItem, boundValues) {
                // Verify the original node properties.
                assert(matchedItem.personAge).toEqual(28);
                // Verify the captured variable values.
                assert(boundValues.ageValue).toEqual(28);
                assert(boundValues.cityValue).toEqual("London");
            },
            function(resultingTree, totalMatches) {
                assert(totalMatches).toEqual(1);
            }
        );
    });

    // Scenario: Ensure identical variables appearing multiple times are correctly matched.
    testCase("Should correctly bind identical variables across multiple locations", function() {
        const complexHierarchy = {
            personDetails: {
                "firstName": "Andrei",
                "currentYears": 28,
                "operatingSystem": "MacOS",
                "workGroup": {
                    "groupName": "idevelop",
                    "preferredOS": "MacOS"
                }
            }
        };

        // Query where 'os_preference' is expected to be the same in two places.
        const multiVarQuery = {
            "operatingSystem": valPlaceholder("os_preference"),
            "workGroup": {
                "preferredOS": valPlaceholder("os_preference")
            }
        };

        structureFinder.query(
            complexHierarchy,
            multiVarQuery,
            function(targetNode, collectedVariables) {
                // If a node is matched, its 'firstName' should be 'Andrei'.
                if (targetNode) {
                    assert(targetNode.firstName).toEqual("Andrei");
                }
                // The captured variable 'os_preference' must be 'MacOS'.
                assert(collectedVariables.os_preference).toEqual("MacOS");
            },
            function(outputStructure, foundCount) {
                assert(foundCount).toEqual(1);
            }
        );
    });

    // Scenario: Confirm that a query fails if the same variable is bound to different values.
    testCase("Should fail to match when a variable's bindings conflict", function() {
        const divergentData = {
            userInfo: {
                "userName": "Andrei",
                "userAge": 28,
                "primaryOS": "MacOS",
                "teamInfo": {
                    "teamIdentifier": "devOps",
                    "secondaryOS": "Windows" // This conflicts with primaryOS
                }
            }
        };

        // Query attempting to bind 'common_os' to two different values.
        const conflictingVarQuery = {
            "primaryOS": valPlaceholder("common_os"),
            "teamInfo": {
                "secondaryOS": valPlaceholder("common_os")
            }
        };

        structureFinder.query(
            divergentData,
            conflictingVarQuery,
            null, // No node callback since it shouldn't match.
            function(processedTree, totalMatches) {
                // Expect zero matches due to the conflicting variable assignment.
                assert(totalMatches).toEqual(0);
            }
        );
    });
});

// A collection of test scenarios for the data replacement/modification functionality.
testSuite("Data Modification Operations", function() {

    // Scenario: Verify that a property of a matched node can be updated.
    testCase("Should successfully modify a property value within a matched node", function() {
        let mutableDataArray = [{
            person: "Andrei",
            years: 28
        }, {
            person: "Corina",
            years: 26
        }];

        // Query to find the object where 'person' is "Andrei".
        const searchTarget = {
            "person": "Andrei"
        };

        structureFinder.query(
            mutableDataArray,
            searchTarget,
            function(elementToUpdate) {
                // Only proceed if the element is valid and has the 'years' property.
                if (elementToUpdate && typeof elementToUpdate.years === 'number') {
                    elementToUpdate.years++; // Increment the age.
                } else {
                    assert.fail("Expected element to have a numeric 'years' property.");
                }
            },
            function(resultingArray, numFound) {
                assert(resultingArray.length).toEqual(2);
                assert(numFound).toEqual(1); // One match was found and updated.

                // Now, re-query the modified array to verify the change.
                structureFinder.query(
                    resultingArray,
                    searchTarget,
                    function(verifiedNode) {
                        assert(verifiedNode.years).toEqual(29); // The age should now be 29.
                    }
                );
                // Also verify the other element is unchanged.
                assert(resultingArray[1].years).toEqual(26);
            }
        );
    });

    // Scenario: Replace a simple scalar value with a new one.
    testCase("Should substitute a basic scalar value with an alternative", function() {
        const initialObject = {
            subjectName: "Andrei"
        };
        const searchString = "Andrei";
        const replacementString = "Homer";

        structureFinder.query(
            initialObject,
            searchString,
            function() {
                // The replacement function returns the new value.
                return replacementString;
            },
            function(finalObject) {
                // The 'subjectName' property should now hold the new string.
                assert(finalObject.subjectName).toEqual(replacementString);
            }
        );
    });

    // Scenario: Replace an entire node object with a new object.
    testCase("Should entirely replace an identified node with a new object structure", function() {
        let initialDataSet = [{
            user: "Andrei",
            age: 28
        }, {
            user: "Corina",
            age: 26
        }];

        const queryPattern = {
            "user": "Andrei"
        };
        const replacementNode = {
            user: "Andrei Gheorghe",
            age: 28.5,
            status: "updated" // Added a new property for Type III.
        };

        structureFinder.query(
            initialDataSet,
            queryPattern,
            function(matchedRecord) {
                // This callback returns the new object that will replace the matched one.
                return replacementNode;
            },
            function(updatedDataSet, matchedItems) {
                assert(updatedDataSet.length).toEqual(2);
                assert(matchedItems).toEqual(1); // One item was replaced.

                // Verify the replacement by querying for the new node.
                structureFinder.query(
                    updatedDataSet, {
                        "user": "Andrei Gheorghe"
                    },
                    null,
                    function(finalResultCollection, newMatchCount) {
                        assert(newMatchCount).toEqual(1);
                        // Ensure the new property is also present.
                        assert(updatedDataSet[0].status).toEqual("updated");
                    }
                );
            }
        );
    });

    // Scenario: Recursively sum up numbers in a nested array structure.
    testCase("Should recursively compute the sum of numeric elements within a nested array", function() {
        const sourceArray = [1, 2, 3, [4, 5, [6, 0]]]; // Added a 0 for Type III change.
        const emptyQuery = []; // An empty array query applies the callback to all array nodes.

        // Helper function for summing array elements.
        const sumArrayElements = (arr) => {
            if (!Array.isArray(arr)) {
                return arr; // Return non-array elements as-is.
            }
            return arr.reduce((accumulator, currentValue) => {
                // Recursively sum if currentValue is an array, otherwise add it directly.
                return accumulator + (Array.isArray(currentValue) ? sumArrayElements(currentValue) : currentValue);
            }, 0);
        };

        structureFinder.query(
            sourceArray,
            emptyQuery,
            function(currentNode) {
                // The callback is applied to each array node.
                // It should return the sum of its immediate numeric children.
                if (Array.isArray(currentNode)) {
                    return sumArrayElements(currentNode);
                }
                return currentNode; // Non-array nodes are returned as is.
            },
            function(finalSumResult, totalProcessedNodes) {
                // The final result should be the total sum of all numbers.
                // 1 + 2 + 3 + (4 + 5 + (6 + 0)) = 21
                assert(finalSumResult).toEqual(21);
                // The number of processed nodes (arrays) might vary based on implementation detail,
                // but generally, it should be at least 3 (outer array, [4,5,[6,0]], [6,0])
                assert(totalProcessedNodes).toBeGreaterThanOrEqual(3);
            }
        );
    });
});