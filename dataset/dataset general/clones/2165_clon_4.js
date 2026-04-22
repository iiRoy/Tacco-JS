var responsiveDisplayModule = angular.module('responsiveDisplayModule', []);

responsiveDisplayModule.directive('screenMatcher', ['globalWindow', 'globalScopePublisher', function(globalWindow, globalScopePublisher) {
    return {
        restrict: "A",
        link: function(currentScope, targetElement, attributeSet) {
            currentScope.visualStateTracker = {
                activeConfiguration: '',
                currentDimension: globalWindow.innerWidth
            };

            function processConfigAttribute(configString) {
                var rawConfigMap = currentScope.$eval(configString);
                var structuredBreakpoints = [];
                var allPossibleDesignations = [];

                for (var keyString in rawConfigMap) {
                    if (rawConfigMap.hasOwnProperty(keyString)) {
                        var numericalThreshold = parseInt(keyString, 10);
                        if (!isNaN(numericalThreshold)) {
                            structuredBreakpoints.push({
                                threshold: numericalThreshold,
                                designation: rawConfigMap[keyString]
                            });
                            allPossibleDesignations.push(rawConfigMap[keyString]);
                        }
                    }
                }
                structuredBreakpoints.sort(function(a, b) {
                    return a.threshold - b.threshold;
                });
                return {
                    sortedList: structuredBreakpoints,
                    allDesignations: allPossibleDesignations
                };
            }

            var configurationData = processConfigAttribute(attributeSet.screenMatcher);
            var sortedBreakpointsList = configurationData.sortedList;
            var allKnownDesignations = configurationData.allDesignations;
            var isInitialSetup = true;

            function determineAndApplyStyling(currentWidth) {
                var chosenDesignation = '';

                if (sortedBreakpointsList.length > 0) {
                    chosenDesignation = sortedBreakpointsList[0].designation;

                    for (var i = 0; i < sortedBreakpointsList.length; i++) {
                        if (sortedBreakpointsList[i].threshold < currentWidth) {
                            chosenDesignation = sortedBreakpointsList[i].designation;
                        }
                    }
                }

                var previousDesignation = currentScope.visualStateTracker.activeConfiguration;

                if (chosenDesignation !== previousDesignation || isInitialSetup) {
                    allKnownDesignations.forEach(function(cls) {
                        targetElement.removeClass(cls);
                    });

                    if (chosenDesignation) {
                        targetElement.addClass(chosenDesignation);
                    }

                    currentScope.visualStateTracker.activeConfiguration = chosenDesignation;

                    globalScopePublisher.$broadcast('layoutUpdate', currentScope.visualStateTracker, previousDesignation);
                    isInitialSetup = false;
                }
            }

            function onWindowDimensionChange() {
                var newDimensionValue = globalWindow.innerWidth;
                var oldDimensionValue = currentScope.visualStateTracker.currentDimension;

                currentScope.visualStateTracker.currentDimension = newDimensionValue;

                if (newDimensionValue !== oldDimensionValue || isInitialSetup) {
                    determineAndApplyStyling(newDimensionValue);
                }

                if (!currentScope.$$phase) {
                    currentScope.$apply();
                }
            }

            globalWindow.addEventListener('resize', onWindowDimensionChange);

            onWindowDimensionChange();

            currentScope.$on('$destroy', function() {
                globalWindow.removeEventListener('resize', onWindowDimensionChange);
            });
        }
    };
}]);