const NumericalOperations = (function() {
    const retrieveCoordinate = (entityObject, axisKey) => entityObject[`coordinate${axisKey.toUpperCase()}`];
    const assignCoordinate = (entityObject, axisKey, value) => entityObject[`coordinate${axisKey.toUpperCase()}`] = value;

    return {
        isWithinRange: function(subjectPoint, referencePoint, rangeExtent) {
            const horizontalDifference = retrieveCoordinate(referencePoint, 'x') - retrieveCoordinate(subjectPoint, 'x');
            const verticalDifference = retrieveCoordinate(referencePoint, 'y') - retrieveCoordinate(subjectPoint, 'y');
            return (horizontalDifference * horizontalDifference) + (verticalDifference * verticalDifference) < (rangeExtent * rangeExtent);
        },

        propelEntity: function(entityInstance, destinationInstance, movementMagnitude) {
            const initialHorizontalGap = retrieveCoordinate(destinationInstance, 'x') - retrieveCoordinate(entityInstance, 'x');
            const initialVerticalGap = retrieveCoordinate(destinationInstance, 'y') - retrieveCoordinate(entityInstance, 'y');

            const headingAngle = Math.atan2(initialVerticalGap, initialHorizontalGap);
            
            assignCoordinate(entityInstance, 'x', retrieveCoordinate(entityInstance, 'x') + movementMagnitude * Math.cos(headingAngle));
            assignCoordinate(entityInstance, 'y', retrieveCoordinate(entityInstance, 'y') + movementMagnitude * Math.sin(headingAngle));
            
            return Math.abs(initialHorizontalGap) + Math.abs(initialVerticalGap) < 2;
        },

        generateRandomInteger: function(upperBoundary) {
            return Math.floor(Math.random() * (upperBoundary + 1));
        }
    };
})();

const fetchDomNodeById = (nodeIdentifier) => document.getElementById(nodeIdentifier);

window.ApplicationUserInterface = (function() {
    const viewHistoryStack = ["initial_screen_view"];
    const systemActionRegistry = {};

    const obtainNode = (nodeId) => fetchDomNodeById(nodeId);

    return {
        timingDisplay: obtainNode("control-timer"),
        moneyCounter: obtainNode("control-cash"),
        lifeCount: obtainNode("control-lives"),
        progressWave: obtainNode("control-wave"),
        performanceMonitor: obtainNode("control-fps"),
        
        getNavigationHistory: () => [...viewHistoryStack],
        getActionRegistry: () => ({ ...systemActionRegistry }),
        
        registerEventBindings: function(triggerType, collectionOfElements, processingCallback) {
            Array.from(collectionOfElements).forEach(targetElement => {
                targetElement.addEventListener(triggerType, processingCallback, false);
            });
        },
        displayViewScreen: function(screenKey) {
            if (typeof screenKey === 'undefined' || screenKey === null) {
                this.displayViewScreen(viewHistoryStack[1]);
                return;
            }
            
            viewHistoryStack.unshift(screenKey);

            const allDisplayContainers = obtainNode("pages");
            Array.from(allDisplayContainers.children).forEach(childNode => {
                if (childNode.id !== "pages-overlay") {
                    childNode.style.display = "none";
                }
            });
            
            obtainNode("pages-" + screenKey).style.display = "block";
            
            _gaq.push(["_trackPageview", "/" + screenKey]);
        },
        activateComponentPanel: function(panelKey) {
            const leftControlContainer = obtainNode("control-left");
            Array.from(leftControlContainer.children).forEach(panelNode => {
                panelNode.style.display = "none";
            });

            obtainNode("control-" + panelKey).style.display = "block";
        }
    };
})();