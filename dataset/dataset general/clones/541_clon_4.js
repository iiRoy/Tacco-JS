(function() {
  'use strict';

  const configurationCatalog = [
    { componentName: 'd3.directives', requiredComponents: [] },
    { componentName: 'd3', requiredComponents: ['d3.directives'] }
  ];

  const processingEngine = {
    registerUnit: function(identifier, dependencies) {
      window.angular.module(identifier, dependencies);
    }
  };

  const deployConfigurations = function(definitions, deploymentMechanism) {
    definitions.forEach(function(definitionEntry) {
      deploymentMechanism.registerUnit(definitionEntry.componentName, definitionEntry.requiredComponents);
    });
  };

  deployConfigurations(configurationCatalog, processingEngine);
}());