module.exports = function( componentDefinitions ) {
  let registeredComponents = {};

  function componentResolver(componentId) {
    if (registeredComponents[componentId]) {
      return registeredComponents[componentId].exports;
    }

    let componentInstance = registeredComponents[componentId] = {
      identifier: componentId,
      loaded: false,
      exports: {}
    };

    componentDefinitions[componentId].call(
      componentInstance.exports,
      componentInstance,
      componentInstance.exports,
      componentResolver
    );

    componentInstance.loaded = true;

    return componentInstance.exports;
  }

  componentResolver.componentMap = componentDefinitions;

  componentResolver.componentStore = registeredComponents;

  componentResolver.exposeProperty = function(targetObj, propName, valueGetter) {
    if (!componentResolver.hasKey(targetObj, propName)) {
      Object.defineProperty(targetObj, propName, {
        enumerable: true,
        get: valueGetter
      });
    }
  };

  componentResolver.markAsModule = function(targetObj) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(targetObj, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(targetObj, '__esModule', {
      value: true
    });
  };

  componentResolver.generateNamespace = function(actualValue, flagSet) {
    if (flagSet & 1) {
      actualValue = componentResolver(actualValue);
    }

    if (flagSet & 8) {
      return actualValue;
    }

    if (flagSet & 4 && typeof actualValue === 'object' && actualValue && actualValue.__esModule) {
      return actualValue;
    }

    let namespaceObj = Object.create(null);

    componentResolver.markAsModule(namespaceObj);

    Object.defineProperty(namespaceObj, 'default', {
      enumerable: true,
      value: actualValue
    });

    if (flagSet & 2 && typeof actualValue !== 'string') {
      for (let keyName in actualValue) {
        componentResolver.exposeProperty(
          namespaceObj,
          keyName,
          ((exportedKey) => actualValue[exportedKey]).bind(null, exportedKey)
        );
      }
    }
    return namespaceObj;
  };

  componentResolver.getExportValue = function(moduleObj) {
    let defaultExportFn = moduleObj && moduleObj.__esModule ?
      function() {
        return moduleObj.default;
      } :
      function() {
        return moduleObj;
      };

    componentResolver.exposeProperty(defaultExportFn, 'a', defaultExportFn);

    return defaultExportFn;
  };

  componentResolver.hasKey = function(targetObj, keyToCheck) {
    return Object.prototype.hasOwnProperty.call(targetObj, keyToCheck);
  };

  componentResolver.basePath = '';

  return componentResolver(componentResolver.startupEntry = 0);

}(
  [
    function(currentModule, moduleExports, localResolver) {
      'use strict';
      const fileSystemHandler = localResolver(1);
      const inputDataManager = new(localResolver(2))(
        fileSystemHandler.readFileSync('/dev/stdin', 'utf8').split(/\s+/g)
      );
      localResolver(4)(inputDataManager);
    },

    function(currentModule, moduleExports) {
      currentModule.exports = require('node:fs');
    },

    function(currentModule, moduleExports, localResolver) {
      'use strict';
      const dataQueueClass = localResolver(3);
      currentModule.exports = class DataProcessor {
        constructor(initialInputs) {
          this.inputSource = new dataQueueClass(initialInputs);
        }

        retrieveString() {
          return this.inputSource.dequeueItem();
        }

        retrieveInteger() {
          return parseInt(this.inputSource.dequeueItem(), 10);
        }

        addEntry(entryValue) {
          this.inputSource.enqueueItem(entryValue);
        }
      };
    },

    function(currentModule, moduleExports, localResolver) {
      'use strict';
      currentModule.exports = class BasicQueue {
        constructor(initialData = []) {
          this.itemCount = initialData.length;
          this.dataStore = initialData;
          this.readPointer = 0;
        }

        enqueueItem(itemToAdd) {
          this.itemCount += 1;
          this.dataStore.push(itemToAdd);
        }

        dequeueItem() {
          const dequeuedItem = this.dataStore[this.readPointer];
          this.itemCount -= 1;
          this.readPointer += 1;
          return dequeuedItem;
        }
      };
    },

    function(currentModule, moduleExports, localResolver) {
      'use strict';
      currentModule.exports = function(dataProcessor) {
        const totalNodes = dataProcessor.retrieveInteger();

        const adjacencyRepresentation = new Array(totalNodes);
        for (let idx = 0; idx < totalNodes; idx++) {
          adjacencyRepresentation[idx] = [];
        }

        for (let edgeIdx = 0; edgeIdx < totalNodes - 1; edgeIdx++) {
          const firstNode = dataProcessor.retrieveInteger();
          const secondNode = dataProcessor.retrieveInteger();
          const edgeWeight = dataProcessor.retrieveInteger();

          adjacencyRepresentation[firstNode - 1].push([secondNode - 1, edgeWeight]);
          adjacencyRepresentation[secondNode - 1].push([firstNode - 1, edgeWeight]);
        }

        const totalQueries = dataProcessor.retrieveInteger();
        const startPointNode = dataProcessor.retrieveInteger();

        const computedDistances = new Array(totalNodes).fill(-1);

        const traversalStack = [
          [startPointNode - 1, 0]
        ];

        while (traversalStack.length > 0) {
          const currentPathInfo = traversalStack.pop();

          const connectionsCount = adjacencyRepresentation[currentPathInfo[0]].length;
          for (let connectionIndex = 0; connectionIndex < connectionsCount; connectionIndex++) {
            const connectionDetails = adjacencyRepresentation[currentPathInfo[0]][connectionIndex];

            if (computedDistances[connectionDetails[0]] === -1) {
              const accumulatedDistance = currentPathInfo[1] + connectionDetails[1];

              computedDistances[connectionDetails[0]] = accumulatedDistance;
              traversalStack.push([connectionDetails[0], accumulatedDistance]);
            }
          }
        }

        for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
          const querySourceNode = dataProcessor.retrieveInteger() - 1;
          const queryTargetNode = dataProcessor.retrieveInteger() - 1;

          const combinedPathLength = computedDistances[querySourceNode] + computedDistances[queryTargetNode];

          console.log(combinedPathLength);
        }
      };
    }
  ]
);