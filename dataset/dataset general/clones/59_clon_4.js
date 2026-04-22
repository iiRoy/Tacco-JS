const createPersistentDataStore = (storageMechanism) => {
    const acquireData = (storageKey) => {
        try {
            const storedRepresentation = storageMechanism.getItem(storageKey);
            return storedRepresentation ? JSON.parse(storedRepresentation) : void 0;
        } catch (e) {
            console.error("Acquisition failure:", e);
            return void 0;
        }
    };

    const commitData = (storageKey, contentValue) => {
        try {
            storageMechanism.setItem(storageKey, JSON.stringify(contentValue));
        } catch (e) {
            console.error("Commitment failure:", e);
        }
    };

    const checkAvailability = (storageKey) => {
        return storageMechanism.getItem(storageKey) !== null;
    };

    return {
        commitData,
        acquireData,
        checkAvailability
    };
};

const createIndexGenerator = (storageMechanism, indexKey) => {
    const retrieveCurrentIndex = () => {
        const storedValue = storageMechanism.getItem(indexKey);
        return storedValue ? parseInt(storedValue, 10) : 1;
    };

    const incrementAndStore = (currentValue) => {
        const nextValue = currentValue + 1;
        storageMechanism.setItem(indexKey, String(nextValue));
        return nextValue;
    };

    return {
        retrieveCurrentIndex,
        incrementAndStore
    };
};

const createEventDistributor = () => {
    const recipientMap = new Map();

    const issueNotification = (topicLabel, transmittedPayload) => {
        const handlers = recipientMap.get(topicLabel);
        if (handlers) {
            handlers.forEach(individualHandler => {
                try {
                    individualHandler(transmittedPayload);
                } catch (e) {
                    console.error(`Handler for ${topicLabel} encountered an issue:`, e);
                }
            });
        }
    };

    const enrollHandler = (topicLabel, handlerFunction) => {
        if (!recipientMap.has(topicLabel)) {
            recipientMap.set(topicLabel, []);
        }
        recipientMap.get(topicLabel).push(handlerFunction);
    };

    return {
        issueNotification,
        enrollHandler
    };
};

const createSourceManifestController = (dataStore, identifierDispenser, eventNotifier) => {
    const listKey = 'ConduitChronicle';
    const notificationTopic = 'ConduitUpdate';

    const fetchAllRecords = () => {
        if (dataStore.checkAvailability(listKey)) {
            return dataStore.acquireData(listKey);
        }
        return [{
            linkAddress: 'http://cacodaemon.de/index.php?rss=1',
            captionText: 'Cacomania',
            uniqueIdentifier: 0
        }];
    };

    const appendNewRecord = (incomingLink, descriptiveCaption) => {
        const currentCollection = fetchAllRecords();
        let currentIdentifier = identifierDispenser.retrieveCurrentIndex();
        
        const newEntry = {
            linkAddress: incomingLink,
            captionText: descriptiveCaption,
            uniqueIdentifier: currentIdentifier
        };

        const updatedCollection = [...currentCollection, newEntry];

        dataStore.commitData(listKey, updatedCollection);
        identifierDispenser.incrementAndStore(currentIdentifier);
        eventNotifier.issueNotification(notificationTopic, updatedCollection);
    };

    const expungeRecord = (targetIdentifier) => {
        const currentCollection = fetchAllRecords();
        const remainingCollection = currentCollection.filter(
            element => element.uniqueIdentifier !== targetIdentifier
        );

        dataStore.commitData(listKey, remainingCollection);
        eventNotifier.issueNotification(notificationTopic, remainingCollection);
    };

    const locateRecordByIdentifier = (desiredIdentifier) => {
        const currentCollection = fetchAllRecords();
        const foundElement = currentCollection.find(
            element => element.uniqueIdentifier === desiredIdentifier
        );
        return foundElement === void 0 ? null : foundElement;
    };

    const determineSmallestIdentifier = () => {
        const currentCollection = fetchAllRecords();
        const minimumValue = currentCollection.reduce(
            (currentMin, element) => (element.uniqueIdentifier < currentMin ? element.uniqueIdentifier : currentMin),
            Infinity
        );
        return minimumValue;
    };

    return {
        appendNewRecord,
        expungeRecord,
        fetchAllRecords,
        locateRecordByIdentifier,
        determineSmallestIdentifier
    };
};