'use strict';

(function () {
  'use strict';

  var visualsModule = angular.module('visualsModule', []);

  const visualKindRegistry = [
    { typeKey: 'line', displayLabel: 'Line' },
    { typeKey: 'bar', displayLabel: 'Bar' },
    { typeKey: 'radar', displayLabel: 'Radar' },
    { typeKey: 'polar', displayLabel: 'PolarArea' },
    { typeKey: 'pie', displayLabel: 'Pie' },
    { typeKey: 'doughnut', displayLabel: 'Doughnut' }
  ];

  function combineObjectsDeeply(target, ...sources) {
    if (typeof target !== 'object' || target === null || Array.isArray(target)) {
      return target;
    }
    for (const source of sources) {
      if (typeof source !== 'object' || source === null || Array.isArray(source)) {
        continue;
      }
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (typeof source[key] === 'object' && source[key] !== null &&
              typeof target[key] === 'object' && target[key] !== null &&
              !Array.isArray(source[key]) && !Array.isArray(target[key])) {
            target[key] = combineObjectsDeeply({}, target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }

  visualKindRegistry.forEach(function(kindEntry) {
    const capitalizedKind = kindEntry.typeKey.charAt(0).toUpperCase() + kindEntry.typeKey.slice(1);
    visualsModule.directive('vzc' + capitalizedKind, ['GraphicProducer', function(GraphicProducer) {
      return new GraphicProducer(kindEntry.typeKey);
    }]);
  });

  visualsModule.factory('GraphicProducer', function () {
    return function (graphicKind) {
      const typeDefinition = visualKindRegistry.find(entry => entry.typeKey === graphicKind);
      if (!typeDefinition) {
        return;
      }
      const chartJsTypeName = typeDefinition.displayLabel;

      const deriveComponentSettings = function (referenceSettings, componentAttributes) {
        const extractedAttributes = {};
        Object.keys(referenceSettings).forEach(function(settingKey) {
          const attributeValue = componentAttributes[settingKey];
          if (typeof attributeValue !== 'undefined') {
            extractedAttributes[settingKey] = attributeValue;
          }
        });
        return extractedAttributes;
      };

      return {
        restrict: 'EAC',
        template: '<div><canvas class="vzc-canvas-element"></canvas><div class="vzc-legend-panel"></div></div>',
        replace: true,
        scope: {
          dataModel: '=',
          configuration: '='
        },
        link: function linkProcedure(componentScope, hostElement, componentAttributes) {
          const primaryCanvas = angular.element(hostElement).find('canvas')[0];
          const renderContext = primaryCanvas.getContext('2d');
          let activeVisualization;
          let finalSettings = {};

          combineObjectsDeeply(finalSettings, Chart.defaults.global);
          combineObjectsDeeply(finalSettings, Chart.defaults[chartJsTypeName]);
          combineObjectsDeeply(finalSettings, componentScope.configuration);
          
          Object.assign(finalSettings, deriveComponentSettings(finalSettings, componentAttributes));

          activeVisualization = new Chart(renderContext)[chartJsTypeName](componentScope.dataModel, finalSettings);

          const legendPanel = angular.element(hostElement).find('.vzc-legend-panel')[0];
          if (legendPanel) {
            legendPanel.innerHTML = activeVisualization.generateLegend();
          }

          componentScope.$watch('dataModel', function (updatedData, previousData) {
            if (updatedData === previousData) return;
            if (activeVisualization) {
              activeVisualization.initialize(updatedData);
              if (legendPanel) {
                legendPanel.innerHTML = activeVisualization.generateLegend();
              }
            }
          }, true);

          componentScope.$watch('configuration', function (updatedConfig, previousConfig) {
            if (updatedConfig === previousConfig) return;
            if (activeVisualization) {
              combineObjectsDeeply(activeVisualization.options, componentScope.configuration);
              activeVisualization.update();
              if (legendPanel) {
                legendPanel.innerHTML = activeVisualization.generateLegend();
              }
            }
          }, true);
        }
      };
    };
  });
})();