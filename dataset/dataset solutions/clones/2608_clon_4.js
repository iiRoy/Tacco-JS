module.exports = function(moduleDefinitions) {
  const moduleRegistry = {};
  function retrieveModule(moduleId) {
    if (moduleRegistry[moduleId]) return moduleRegistry[moduleId].exports;
    const moduleInstance = moduleRegistry[moduleId] = { id: moduleId, loaded: false, exports: {} };
    moduleDefinitions[moduleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, retrieveModule);
    moduleInstance.loaded = true;
    return moduleInstance.exports;
  }
  retrieveModule.moduleDefinitions = moduleDefinitions;
  retrieveModule.moduleCache = moduleRegistry;
  retrieveModule.defineExport = function(target, property, getter) {
    retrieveModule.hasOwn(target, property) || Object.defineProperty(target, property, { enumerable: true, get: getter });
  };
  retrieveModule.registerNamespace = function(target) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(target, "__esModule", { value: true });
  };
  retrieveModule.interopDefault = function(moduleValue, flags) {
    if (1 & flags && (moduleValue = retrieveModule(moduleValue)), 8 & flags) return moduleValue;
    if (4 & flags && "object" == typeof moduleValue && moduleValue && moduleValue.__esModule) return moduleValue;
    var defaultExport = Object.create(null);
    retrieveModule.registerNamespace(defaultExport);
    Object.defineProperty(defaultExport, "default", { enumerable: true, value: moduleValue });
    if (2 & flags && "string" != typeof moduleValue)
      for (var propName in moduleValue)
        retrieveModule.defineExport(defaultExport, propName, ((p) => () => moduleValue[p]).bind(null, propName));
    return defaultExport;
  };
  retrieveModule.getDefaultExport = function(moduleValue) {
    var getter = moduleValue && moduleValue.__esModule ? () => moduleValue.default : () => moduleValue;
    return retrieveModule.defineExport(getter, "a", getter), getter;
  };
  retrieveModule.hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
  retrieveModule.publicPath = "";
  return retrieveModule(0);
}(
  [
    function(moduleInstance, moduleExports, getModule) {
      const fileSystemModule = getModule(2);
      const coreLogicModule = getModule(1);
      coreLogicModule.processInput(fileSystemModule.fileSystem.readFileSync("/dev/stdin", "UTF-8"));
    },
    function(moduleInstance, moduleExports) {
      moduleExports.processInput = function(rawInputContent) {
        const dataLines = rawInputContent.split('\n');
        const entityCount = parseInt(dataLines[0], 10);

        const entityMap = new Map();
        const initialActiveQueue = new Set();

        for (let currentId = 0; currentId < entityCount; currentId++) {
          const preferences = dataLines[currentId + 1].split(' ').map(val => parseInt(val, 10) - 1);
          const entityObject = {
            id: currentId,
            preferenceSequence: preferences,
            currentPreferencePointer: 0,
            assignedPartnerId: preferences[0],
            matchLevelDepth: 0
          };
          entityMap.set(currentId, entityObject);
        }

        for (let currentId = 0; currentId < entityCount; currentId++) {
          const currentEntity = entityMap.get(currentId);
          const assignedPartner = entityMap.get(currentEntity.assignedPartnerId);
          if (assignedPartner && assignedPartner.assignedPartnerId === currentEntity.id) {
            initialActiveQueue.add(currentEntity.id);
          }
        }

        let maxObservedDepth = 0;
        let completedConnections = 0;
        const totalPossibleConnections = entityCount * (entityCount - 1) / 2;

        while (initialActiveQueue.size > 0) {
          const currentEntityId = initialActiveQueue.values().next().value;
          initialActiveQueue.delete(currentEntityId);

          const currentEntity = entityMap.get(currentEntityId);
          const partnerEntityId = currentEntity.assignedPartnerId;
          const partnerEntity = entityMap.get(partnerEntityId);

          if (partnerEntity && partnerEntity.assignedPartnerId === currentEntity.id) {
            completedConnections++;

            const newDepth = Math.max(currentEntity.matchLevelDepth, partnerEntity.matchLevelDepth) + 1;
            maxObservedDepth = Math.max(maxObservedDepth, newDepth);

            currentEntity.matchLevelDepth = newDepth;
            partnerEntity.matchLevelDepth = newDepth;

            currentEntity.currentPreferencePointer++;
            partnerEntity.currentPreferencePointer++;

            if (currentEntity.currentPreferencePointer < currentEntity.preferenceSequence.length) {
              currentEntity.assignedPartnerId = currentEntity.preferenceSequence[currentEntity.currentPreferencePointer];
              const newPartnerForCurrent = entityMap.get(currentEntity.assignedPartnerId);
              if (newPartnerForCurrent && newPartnerForCurrent.assignedPartnerId === currentEntity.id) {
                initialActiveQueue.add(currentEntity.id);
              }
            }
            if (partnerEntity.currentPreferencePointer < partnerEntity.preferenceSequence.length) {
              partnerEntity.assignedPartnerId = partnerEntity.preferenceSequence[partnerEntity.currentPreferencePointer];
              const newPartnerForPartner = entityMap.get(partnerEntity.assignedPartnerId);
              if (newPartnerForPartner && newPartnerForPartner.assignedPartnerId === partnerEntity.id) {
                initialActiveQueue.add(partnerEntity.id);
              }
            }
          }
        }

        if (completedConnections === totalPossibleConnections) {
          console.log(maxObservedDepth);
        } else {
          console.log(-1);
        }
      };
    },
    function(moduleInstance, moduleExports) {
      moduleExports.fileSystem = require("fs");
    }
  ]
);
