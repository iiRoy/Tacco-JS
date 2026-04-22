(function(utilTool, baseFramework, pieceCollectionMaker, pieceMaker) {
    let uniqueLineCounter = 0;

    const createSoundUnit = (initialSettings) => {
        const currentLineId = "unit_" + (uniqueLineCounter++);

        const unitData = {
            designation: 'Default Audio Unit',
            colorValue: '#00a0b0',
            amplitudeFactor: 1,
            stereoBalance: 0.5,
            isMuted: false,
            isSoloed: false,
            maxDuration: 1920,
            linkedSource: null
        };

        utilTool.assign(unitData, initialSettings);

        const internalPieces = pieceCollectionMaker();
        let copyRecord = null;

        const unitEventHandlers = {};
        const registerEvent = (eventKey, handlerFunc) => {
            if (!unitEventHandlers[eventKey]) {
                unitEventHandlers[eventKey] = [];
            }
            unitEventHandlers[eventKey].push(handlerFunc);
        };
        const dispatchEvent = (eventKey, ...args) => {
            if (unitEventHandlers[eventKey]) {
                unitEventHandlers[eventKey].forEach(handler => handler(...args));
            }
        };

        const updateDataProperty = (keyName, newValue) => {
            const oldVal = unitData[keyName];
            if (oldVal !== newValue) {
                unitData[keyName] = newValue;
                dispatchEvent(`dataChanged:${keyName}`, newValue, oldVal);
                dispatchEvent('dataChanged', keyName, newValue, oldVal);
            }
        };

        const initializeUnit = () => {
            registerEvent('unitRemoved', tearDownUnit);
            registerEvent('dataChanged:designation', clearCopyRecords);

            const addInitialPiece = () => {
                const source = unitData.linkedSource;
                if (source && source.file && source.buffer) {
                    const newPiece = pieceMaker({
                        pieceName: source.file.name,
                        endingTimestamp: source.buffer.duration,
                        audioContentRef: source.buffer
                    });
                    internalPieces.addItem(newPiece);
                }
            };
            addInitialPiece();

            CentralApplication.AudioEngine.registerUnit(currentLineId);
        };

        const tearDownUnit = () => {
            CentralApplication.AudioEngine.deregisterUnit(currentLineId);
            dispatchEvent('unitDestroyed', currentLineId);
        };

        const retrieveTimeSegment = (startMark, endMark) => {
            return internalPieces.getSegment(startMark, endMark);
        };

        const removeTimeArea = (startMark, endMark, exclusionId) => {
            internalPieces.deleteSegment(startMark, endMark, exclusionId);
        };

        const injectContent = (insertPoint, sourceArray) => {
            sourceArray.forEach(item => {
                const newPiece = pieceMaker({
                    startingTimestamp: item.startingTimestamp,
                    endingTimestamp: item.endingTimestamp,
                    unitOffset: item.offset + insertPoint,
                    isLooped: item.isLooped,
                    pieceName: item.pieceName,
                    colorValue: item.colorValue,
                    audioContentRef: item.audioContentRef
                });

                const pieceStart = newPiece.fetchProperty('unitOffset');
                const pieceEnd = pieceStart + newPiece.calculateLength();

                CentralApplication.UnitCollections.masterUnitCollection.removeRange(pieceStart, pieceEnd, currentLineId);
                internalPieces.addItem(newPiece);
            });
        };

        const clearCopyRecords = () => {
            copyRecord = null;
        };

        const generateDuplicate = () => {
            const duplicatedData = { ...unitData };
            const newUnit = createSoundUnit(duplicatedData);

            newUnit.updateInternalPieces(internalPieces.exportAll());

            let newDesignation = newUnit.accessProperty('designation');
            const pattern = newDesignation.match(/\(\d+\)$/);
            let currentCopyCount;

            if (copyRecord) {
                copyRecord.count += 1;
            } else {
                copyRecord = { count: 2 };
            }
            currentCopyCount = copyRecord.count;

            if (pattern) {
                newDesignation = newDesignation.replace(/\(\d+\)$/, ` (${currentCopyCount})`);
            } else {
                newDesignation += ` (${currentCopyCount})`;
            }

            newUnit.modifyProperty('designation', newDesignation);
            newUnit.assignCopyTracker(copyRecord);

            CentralApplication.UnitCollections.masterUnitCollection.addUnit(newUnit);
            CentralApplication.UnitCollections.masterUnitCollection.decrementUnitCount();

            return newUnit;
        };

        const publicInterface = {
            get identifier() { return currentLineId; },
            accessProperty: (key) => unitData[key],
            modifyProperty: updateDataProperty,
            assignCopyTracker: (tracker) => { copyRecord = tracker; },
            initModule: initializeUnit,
            destroyModule: tearDownUnit,
            getSegmentSnapshot: retrieveTimeSegment,
            deleteSegmentRegion: removeTimeArea,
            insertSegmentContent: injectContent,
            resetCopyMarks: clearCopyRecords,
            createCopyOfUnit: generateDuplicate,
            updateInternalPieces: (data) => internalPieces.replaceContents(data),
            get segmentCollection() { return internalPieces; },
            onEvent: registerEvent,
            triggerEvent: dispatchEvent
        };

        publicInterface.initModule();

        return publicInterface;
    };

    return createSoundUnit;

})(
    typeof _ !== 'undefined' ? _ : { assign: Object.assign },
    typeof Backbone !== 'undefined' ? Backbone : {},
    function() {
        let items = [];
        return {
            addItem: (item) => items.push(item),
            getSegment: (s, e) => items.filter(i => i.fetchProperty('unitOffset') >= s && i.fetchProperty('unitOffset') + i.calculateLength() <= e),
            deleteSegment: (s, e, x) => { items = items.filter(i => !(i.fetchProperty('unitOffset') >= s && i.fetchProperty('unitOffset') + i.calculateLength() <= e && i.identifier !== x)); },
            exportAll: () => items.map(u => u.exportContent()),
            replaceContents: (newData) => { items = newData.map(d => pieceMaker(d)); }
        };
    },
    function(cfg) {
        let pieceState = {
            pieceName: 'Default Piece',
            startingTimestamp: 0,
            endingTimestamp: 0,
            unitOffset: 0,
            isLooped: false,
            colorValue: '#FFF',
            audioContentRef: null,
            uniquePieceId: "piece_" + Math.random().toString(36).substr(2, 9),
            ...cfg
        };
        return {
            fetchProperty: (key) => pieceState[key],
            calculateLength: () => pieceState.endingTimestamp - pieceState.startingTimestamp,
            exportContent: () => ({ ...pieceState }),
            get identifier() { return pieceState.uniquePieceId; }
        };
    }
);