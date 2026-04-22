(function() {
    let allTestDefinitions = [];
    let currentScopeStack = [];

    function establishGroup(groupTitle, groupBuilder) {
        let newGroup = {
            title: groupTitle,
            elements: []
        };
        allTestDefinitions.push(newGroup);
        currentScopeStack.push(newGroup.elements);
        groupBuilder();
        currentScopeStack.pop();
    }

    function createScenario(scenarioTitle, scenarioLogic) {
        let currentElements = currentScopeStack[currentScopeStack.length - 1];
        if (!currentElements) {
            console.error("Scenario created outside a group.");
            return;
        }
        let newScenario = {
            title: scenarioTitle,
            conditions: []
        };
        currentElements.push(newScenario);
        currentScopeStack.push(newScenario.conditions);
        scenarioLogic();
        currentScopeStack.pop();
    }

    function verifyValue(actualEvaluation) {
        let currentConditions = currentScopeStack[currentScopeStack.length - 1];
        if (!currentConditions) {
            console.error("Verification outside a scenario.");
            return {
                isConsideredTrue: () => {},
                isConsideredFalse: () => {},
                matchesPrecisely: () => {}
            };
        }

        return {
            isConsideredTrue: function() {
                currentConditions.push({
                    checkType: 'truthiness',
                    actual: actualEvaluation
                });
            },
            isConsideredFalse: function() {
                currentConditions.push({
                    checkType: 'falsiness',
                    actual: actualEvaluation
                });
            },
            matchesPrecisely: function(expectedEvaluation) {
                currentConditions.push({
                    checkType: 'strictMatch',
                    actual: actualEvaluation,
                    expected: expectedEvaluation
                });
            }
        };
    }

    establishGroup('external.core', function() {

        createScenario('should yield an accurate outcome', function() {
            verifyValue(externalUtility.operation()).isConsideredTrue();
        });

        createScenario('should fail with an error', function() {
            verifyValue(externalUtility.operation()).isConsideredFalse();
        });

        createScenario('should fail with distinct failure messages', function() {
            verifyValue(externalUtility.operation()).matchesPrecisely('a specific outcome');
            verifyValue(new Date()).matchesPrecisely('another timestamp');
        });

        createScenario('should have mixed success and failure', function() {
            verifyValue('po' + 'ker').matchesPrecisely('poker');
            verifyValue('po' + 'ker').matchesPrecisely('something else');
            verifyValue(12 + 12).matchesPrecisely(24);
            verifyValue(12 + 12).matchesPrecisely(12);
        });

        createScenario('should not halt with a verbose scenario description', function() {
            verifyValue(true).matchesPrecisely(false);
        });

    });

})();