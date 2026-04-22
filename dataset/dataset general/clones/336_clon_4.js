((globalContext) => {

    // Internal flag to confirm persistent data support.
    const _persistenceReady = (() => {
        try {
            const testKey = '__test_persistent_storage';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Registry for event callbacks.
    const _eventRegistrar = new Map();

    // Emits notifications to registered handlers.
    const _notifySubscribers = (eventKey) => {
        const subscriberList = _eventRegistrar.get(eventKey);
        if (subscriberList) {
            subscriberList.forEach(callbackFn => callbackFn.apply(null, []));
        }
    };

    // Messages for internal concerns.
    const _issueMessages = {
        'SEGMENT_MISSING': (ctx) => `DataVault Concern 100: ${ctx} - This segment does not exist. Verify spelling or use dataVaultManager.establishSegment() to create a new one.`,
        'SEGMENT_EXISTS': (ctx) => `DataVault Concern 200: ${ctx} - This segment already exists.`,
        'PARSE_FAIL': (ctx) => `DataVault Concern 300: ${ctx} - Failed to parse stored data.`,
        'SAVE_FAIL': (ctx) => `DataVault Concern 301: ${ctx} - Failed to save data to storage.`,
        'GENERAL_FAILURE': () => 'UNEXPECTED ERROR: DataVault encountered an unhandled issue.'
    };

    // Reports an internal concern.
    const _raiseConcern = (code, context) => {
        const message = _issueMessages[code] ? _issueMessages[code](context) : _issueMessages['GENERAL_FAILURE']();
        console.log(`Oh dear! ${message}`);
    };

    // Utility to safely retrieve and parse data from storage.
    const _extractPayload = (key) => {
        if (!_persistenceReady) return null;
        try {
            const rawData = window.localStorage.getItem(key);
            return rawData ? JSON.parse(rawData) : null;
        } catch (e) {
            _raiseConcern('PARSE_FAIL', `Key: ${key}`);
            return null;
        }
    };

    // Utility to safely stringify and deposit data into storage.
    const _depositPayload = (key, data) => {
        if (!_persistenceReady) return;
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            _raiseConcern('SAVE_FAIL', `Key: ${key}`);
        }
    };

    // Generates a unique identifier and timestamp for a data unit.
    const _makeIdentifier = (dataUnit) => {
        if (!dataUnit.accessKey) {
            dataUnit.accessKey = `_K${Math.random().toString(36).substring(2, 11)}`;
        }
        if (!dataUnit.creationTime) {
            dataUnit.creationTime = Date.now();
        }
        return dataUnit;
    };

    // The core data vault manager object.
    const _vault = {

        // Registers a callback for a specific event.
        subscribe: (eventKey, callbackFn) => {
            if (!_eventRegistrar.has(eventKey)) {
                _eventRegistrar.set(eventKey, []);
            }
            _eventRegistrar.get(eventKey).push(callbackFn);
        },

        // Checks if a named segment exists.
        segmentExists: (segmentKey) => {
            if (!_persistenceReady) return false;
            return !!window.localStorage.getItem(segmentKey);
        },

        // Retrieves a segment's entire content.
        obtainSegment: (segmentKey) => {
            const content = _extractPayload(segmentKey);
            if (content) {
                _notifySubscribers('segmentObtained');
                return content;
            } else {
                _raiseConcern('SEGMENT_MISSING', `Method: obtainSegment(${segmentKey})`);
                return false;
            }
        },

        // Locates units within a segment based on a property and value.
        locateUnits: (segmentKey, propertyName, propertyValue) => {
            const allUnits = _vault.obtainSegment(segmentKey);
            if (allUnits && Array.isArray(allUnits)) {
                const matchedUnits = allUnits.filter(unit => unit[propertyName] == propertyValue);
                _notifySubscribers('unitsLocated');
                return matchedUnits;
            } else {
                // obtainSegment already logs error if segment is missing
                return undefined;
            }
        },

        // Fetches a single unit by its accessKey.
        fetchUnit: (segmentKey, unitIdentifier) => {
            const found = _vault.locateUnits(segmentKey, 'accessKey', unitIdentifier);
            _notifySubscribers('unitFetched');
            return found ? found[0] : undefined;
        },

        // Appends new units to an existing segment.
        appendUnits: (segmentKey, newUnitData) => {
            let existingUnits = _extractPayload(segmentKey);
            if (existingUnits) {
                const unitsToAdd = Array.isArray(newUnitData) ? newUnitData : [newUnitData];
                const processedUnits = unitsToAdd.map(_makeIdentifier);
                const updatedUnits = [...existingUnits, ...processedUnits];
                _depositPayload(segmentKey, updatedUnits);
                _notifySubscribers('unitsAppended');
                return updatedUnits;
            } else {
                _raiseConcern('SEGMENT_MISSING', `Method: appendUnits(${segmentKey})`);
                return undefined;
            }
        },

        // Creates a new segment or overwrites an existing one with new units.
        insertUnits: (segmentKey, newUnitData) => {
            const unitsToAdd = Array.isArray(newUnitData) ? newUnitData : [newUnitData];
            const processedUnits = unitsToAdd.map(_makeIdentifier);
            _depositPayload(segmentKey, processedUnits);
            _notifySubscribers('unitsInserted');
            return processedUnits;
        },

        // Establishes a new segment, optionally with initial data.
        establishSegment: (segmentKey, initialData = []) => {
            _depositPayload(segmentKey, initialData);
            _notifySubscribers('segmentEstablished');
        },

        // Removes an entire segment from storage.
        purgeSegment: (segmentKey) => {
            if (!_persistenceReady) return;
            window.localStorage.removeItem(segmentKey);
            _notifySubscribers('segmentPurged');
        },

        // Removes a specific unit from a segment by its accessKey.
        removeUnit: (segmentKey, unitIdentifier, completionCallback) => {
            const currentUnits = _vault.obtainSegment(segmentKey);
            if (currentUnits) {
                const filteredUnits = currentUnits.filter(unit => unit.accessKey !== unitIdentifier);
                _vault.insertUnits(segmentKey, filteredUnits); // Overwrites the segment with the filtered list
                if (completionCallback) {
                    completionCallback(filteredUnits);
                }
            } else {
                _raiseConcern('SEGMENT_MISSING', `Method: removeUnit(${segmentKey})`);
            }
            _notifySubscribers('unitRemoved');
        },

        // Revises an existing unit in a segment.
        reviseUnit: (segmentKey, updatedUnit) => {
            _vault.removeUnit(segmentKey, updatedUnit.accessKey, () => {
                _vault.appendUnits(segmentKey, updatedUnit);
            });
            _notifySubscribers('unitRevised');
        },

        // Assigns an empty array property to all units within a primary segment.
        associateSegments: (primarySegment, secondarySegmentProperty) => {
            const primaryData = _vault.obtainSegment(primarySegment);
            if (primaryData && Array.isArray(primaryData)) {
                const modifiedData = primaryData.map(unit => ({
                    ...unit,
                    [secondarySegmentProperty]: [] // Overwrites or adds an empty array
                }));
                _vault.purgeSegment(primarySegment);
                _vault.establishSegment(primarySegment, modifiedData);
                _notifySubscribers('segmentsAssociated');
            } else {
                _raiseConcern('SEGMENT_MISSING', `Method: associateSegments(${primarySegment})`);
            }
        },

        // Clears all data from persistent storage.
        annihilateAll: () => {
            if (!_persistenceReady) return;
            window.localStorage.clear();
            _notifySubscribers('allAnnihilated');
        },

        // Publicly exposed in-memory cache (object).
        inMemoryCache: {},

        // Retrieves an item from the in-memory cache.
        retrieveFromCache: (segmentKey, attrName, attrValue) => {
            const cachedSegment = _vault.inMemoryCache[segmentKey];
            if (cachedSegment && Array.isArray(cachedSegment)) {
                for (let i = 0; i < cachedSegment.length; i += 1) {
                    if (cachedSegment[i][attrName] === attrValue) {
                        return cachedSegment[i];
                    }
                }
            }
            return undefined;
        }
    };

    globalContext.dataVaultManager = globalContext.dataVaultManager || {};
    Object.assign(globalContext.dataVaultManager, _vault);

})(this);