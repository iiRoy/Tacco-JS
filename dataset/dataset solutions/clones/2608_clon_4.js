const moduleRegistrar = function(moduleCollection) {
    const moduleStore = {};

    function moduleResolver(moduleIdentifier) {
        if (moduleStore[moduleIdentifier]) {
            return moduleStore[moduleIdentifier].exports;
        }
        const moduleInstance = moduleStore[moduleIdentifier] = {
            id: moduleIdentifier,
            loaded: false,
            exports: {}
        };
        moduleCollection[moduleIdentifier].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            moduleResolver
        );
        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    moduleResolver.allModules = moduleCollection;
    moduleResolver.cache = moduleStore;

    moduleResolver.defineExport = function(target, propertyName, getterFunc) {
        moduleResolver.hasProperty(target, propertyName) || Object.defineProperty(target, propertyName, {
            enumerable: true,
            get: getterFunc
        });
    };

    moduleResolver.markAsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    moduleResolver.interopDefault = function(value, mode) {
        if (mode & 1) value = moduleResolver(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === "object" && value && value.__esModule) return value;
        const defaultExport = Object.create(null);
        moduleResolver.markAsModule(defaultExport);
        Object.defineProperty(defaultExport, "default", { enumerable: true, value: value });
        if ((mode & 2) && typeof value !== "string") {
            for (const key in value) {
                moduleResolver.defineExport(defaultExport, key, ((k) => value[k]).bind(null, key));
            }
        }
        return defaultExport;
    };

    moduleResolver.namespaceObject = function(moduleExports) {
        const getter = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        moduleResolver.defineExport(getter, "a", getter);
        return getter;
    };

    moduleResolver.hasProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    moduleResolver.basePath = "";

    return moduleResolver(moduleResolver.startModule = 0);
};

module.exports = moduleRegistrar([
    function(currentModule, moduleExports, getDependency) {
        getDependency(1)(getDependency(2).readSync("/dev/stdin", "UTF-8"));
    },
    function(currentModule, moduleExports, getDependency) {
        moduleExports = function(rawDataStream) {
            const linesOfData = rawDataStream.trim().split('\n');
            const totalEntities = Number(linesOfData[0]);

            class EngagementParticipant {
                #uniqueId;
                #preferredPartners;
                #currentPreferenceIndex;
                #currentlyMatchedWith;
                #interactionLevel;

                constructor(identifierValue, initialPreferences) {
                    this.#uniqueId = identifierValue;
                    this.#preferredPartners = initialPreferences;
                    this.#currentPreferenceIndex = 0;
                    this.#currentlyMatchedWith = initialPreferences[0];
                    this.#interactionLevel = 0;
                }

                get participantId() { return this.#uniqueId; }
                get matchedPartnerId() { return this.#currentlyMatchedWith; }
                get currentLevelValue() { return this.#interactionLevel; }
                get hasFurtherPreferences() { return this.#currentPreferenceIndex < this.#preferredPartners.length; }

                set updateLevel(val) { this.#interactionLevel = val; }

                advancePartnerPreference() {
                    this.#currentPreferenceIndex++;
                    if (this.hasFurtherPreferences) {
                        this.#currentlyMatchedWith = this.#preferredPartners[this.#currentPreferenceIndex];
                    }
                }
            }

            const participantCollection = new Map();
            for (let k = 0; k < totalEntities; k++) {
                const entityPreferences = linesOfData[k + 1].split(' ').map(prefStr => Number(prefStr) - 1);
                participantCollection.set(k, new EngagementParticipant(k, entityPreferences));
            }

            const expectedMutualConnections = totalEntities * (totalEntities - 1) / 2;
            let highestEncounteredLevel = 0;
            let acknowledgedMutualMatches = 0;

            const activeProcessingQueue = Array.from({ length: totalEntities }, (_, i) => i);

            while (activeProcessingQueue.length > 0) {
                const currentParticipantIdentifier = activeProcessingQueue.shift();
                const currentParticipantObject = participantCollection.get(currentParticipantIdentifier);
                const designatedPartnerIdentifier = currentParticipantObject.matchedPartnerId;
                const designatedPartnerObject = participantCollection.get(designatedPartnerIdentifier);

                if (designatedPartnerObject.matchedPartnerId === currentParticipantIdentifier) {
                    acknowledgedMutualMatches++;

                    const calculatedInteractionLevel = Math.max(currentParticipantObject.currentLevelValue, designatedPartnerObject.currentLevelValue) + 1;
                    highestEncounteredLevel = Math.max(highestEncounteredLevel, calculatedInteractionLevel);

                    currentParticipantObject.updateLevel = calculatedInteractionLevel;
                    designatedPartnerObject.updateLevel = calculatedInteractionLevel;

                    if (currentParticipantObject.hasFurtherPreferences) {
                        currentParticipantObject.advancePartnerPreference();
                        const newMatchForCurrent = participantCollection.get(currentParticipantObject.matchedPartnerId);
                        if (newMatchForCurrent.matchedPartnerId === currentParticipantObject.participantId) {
                            activeProcessingQueue.push(currentParticipantObject.participantId);
                        }
                    }

                    if (designatedPartnerObject.hasFurtherPreferences) {
                        designatedPartnerObject.advancePartnerPreference();
                        const newMatchForPartner = participantCollection.get(designatedPartnerObject.matchedPartnerId);
                        if (newMatchForPartner.matchedPartnerId === designatedPartnerObject.participantId) {
                            activeProcessingQueue.push(designatedPartnerObject.participantId);
                        }
                    }
                }
            }

            if (acknowledgedMutualMatches === expectedMutualConnections) {
                console.log(highestEncounteredLevel);
            } else {
                console.log(-1);
            }
        };
        currentModule.exports = moduleExports;
    },
    function(currentModule, moduleExports, getDependency) {
        moduleExports.readSync = require("node:fs").readFileSync;
    }
]);