(function () {
    'use strict';
    
    var graphMod = angular.module('graphMod', []),
        graphVarieties = {
            line: 'Line',
            bar: 'Bar',
            radar: 'Radar',
            polar: 'PolarArea',
            pie: 'Pie',
            doughnut: 'Doughnut'
        },
        buildGraphInstruction = function (graphKind) {
            var firstCap = graphKind.charAt(0).toUpperCase() + graphKind.slice(1);
            graphMod.directive('cjs' + firstCap, ['GraphProducer', function (GraphProducer) {
                return new GraphProducer(graphKind);
            }]);
        };

    for (var gK in graphVarieties) {
        buildGraphInstruction(gK);
    }

    graphMod.factory('GraphProducer', function () {
        return function (graphTypeInput) {

            graphTypeInput = graphVarieties[graphTypeInput];
            var retrieveSpecialOptions = function (settings, attributes) {
                var obtainedSettings = {},
                    key,
                    val;

                for (key in settings) {
                    val = attributes[key];
                    if (typeof(val) !== 'undefined') {
                        obtainedSettings[key] = val;
                    }
                }
                return obtainedSettings;
            };

            if (typeof(graphTypeInput) === 'undefined') {
                return;
            }

            return {
                restrict: 'EAC',
                template: '<div><canvas class="cjs-chart"></canvas><legend class="cjs-legend"></legend></div>',
                replace: true,
                scope: {
                    dataModel: '=',
                    configOptions: '='
                },
                link: function connectElements(scopeObj, domElement, elementAttributes) {
                    var renderCtx = domElement[0].children[0].getContext('2d'),
                        visual = new Chart(renderCtx),
                        graphConfig = {};

                    angular.extend(
                        graphConfig, 
                        Chart.defaults.global,
                        Chart.defaults[graphTypeInput]
                    );

                    angular.extend(
                        graphConfig, 
                        scopeObj.configOptions,
                        retrieveSpecialOptions(
                            graphConfig,
                            elementAttributes
                        )
                    );
                
                    visual = visual[graphTypeInput](scopeObj.dataModel, graphConfig);
                    domElement[0].children[1].innerHTML = visual.generateLegend();

                    scopeObj.$watch('dataModel', function (latestData, previousData) {
                        visual.initialize(latestData);
                    }, true);

                    scopeObj.$watch('configOptions', function (latestConfig, previousConfig) {
                        angular.extend(
                            visual.options, 
                            scopeObj.configOptions
                        );
                    }, true);
                    
                }
            };
        };
    });
})();