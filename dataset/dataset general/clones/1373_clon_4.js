const ModuleDispatcher = (function() {
    const pendingActions = new Map();
    const fulfilledDependencies = new Set();

    function meetDependency(dependencyKey) {
        if (!fulfilledDependencies.has(dependencyKey)) {
            fulfilledDependencies.add(dependencyKey);
            if (pendingActions.has(dependencyKey)) {
                pendingActions.get(dependencyKey).forEach(actionFn => actionFn());
                pendingActions.delete(dependencyKey);
            }
        }
    }

    function enqueueOrExecute(dependencyKey, actionFn) {
        if (fulfilledDependencies.has(dependencyKey)) {
            actionFn();
        } else {
            if (!pendingActions.has(dependencyKey)) {
                pendingActions.set(dependencyKey, []);
            }
            pendingActions.get(dependencyKey).push(actionFn);
        }
    }

    function manageModuleFlow(flowDefinitions) {
        if (!Array.isArray(flowDefinitions)) {
            flowDefinitions = [flowDefinitions];
        }

        flowDefinitions.forEach(definition => {
            const { requiredModule, taskProcedure } = definition;

            if (requiredModule) {
                if (taskProcedure) {
                    enqueueOrExecute(requiredModule, taskProcedure);
                }
                meetDependency(requiredModule);
            }
        });
    }

    return {
        manageModuleFlow: manageModuleFlow,
        signalModuleAvailability: meetDependency
    };
})();

const PageRouter = {
    extractEndpoint: () => {
        const fullURI = window.location.pathname;
        const lastForwardSlash = fullURI.lastIndexOf('/');
        return lastForwardSlash !== -1 ? fullURI.substring(lastForwardSlash + 1) : '';
    }
};

const VisualizerCore = {
    renderGraph: (targetId, factor, graphSeries, displayOptions) => {
        if (typeof window.Cascade !== 'undefined' && typeof window.Cascade.drawchart === 'function') {
            window.Cascade.drawchart(targetId, factor, graphSeries, displayOptions);
        } else {
            console.warn("VisualizerCore: Underlying chart library not detected.");
        }
    }
};

const FormProcessor = {
    applyValidators: (domSelector) => {
        if (typeof window.$ !== 'undefined' && typeof window.$.fn.parsley === 'function') {
            $(domSelector).parsley();
        } else {
            console.warn("FormProcessor: Underlying validation library not detected.");
        }
    }
};

ModuleDispatcher.manageModuleFlow([
    {
        requiredModule: 'coreVisuals',
        taskProcedure: function() {
            const currentEndpoint = PageRouter.extractEndpoint();

            const endpointActions = {
                'components.html': () => {
                    ModuleDispatcher.manageModuleFlow({
                        requiredModule: 'graphRenderer',
                        taskProcedure: function() {
                            VisualizerCore.renderGraph(
                                    "#flot-demo",
                                    1.6,
                                    [[["January", 10], ["February", 8], ["March", 4], ["April", 13], ["May", 17], ["June", 9]]],
                                    {
                                        series: {
                                            bars: {
                                                show: true,
                                                barWidth: 0.5,
                                                align: "center"
                                            }
                                        },
                                        xaxis: {
                                            mode: "categories",
                                            font: {
                                                size: 12
                                            }
                                        },
                                        yaxis: {
                                            font: {
                                                size: 12
                                            }
                                        }
                                    });
                        }
                    });
                },
                'typography-form.html': () => {
                    ModuleDispatcher.manageModuleFlow({
                        requiredModule: 'inputValidation',
                        taskProcedure: function() {
                            FormProcessor.applyValidators('form');
                        }
                    });
                }
            };

            if (currentEndpoint === 'components.html') {
                endpointActions['components.html']();
                endpointActions['typography-form.html']();
            } else if (currentEndpoint === 'typography-form.html') {
                endpointActions['typography-form.html']();
            }
        }
    },
    {
        requiredModule: 'dataTelemetry'
    }
]);