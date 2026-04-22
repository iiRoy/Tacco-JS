class PanelDisplay {
    #contentLines = [];
    #eventRegistry = new Map();

    constructor(capacity) {
        this.displayCapacity = capacity;
    }

    updateContent(dataLines) {
        this.#contentLines = dataLines;
    }

    registerListener(eventIdentifier, callbackRoutine) {
        if (!this.#eventRegistry.has(eventIdentifier)) {
            this.#eventRegistry.set(eventIdentifier, []);
        }
        this.#eventRegistry.get(eventIdentifier).push(callbackRoutine);
    }

    _signalActivation() {
        if (this.#eventRegistry.has('start')) {
            this.#eventRegistry.get('start').forEach(routine => routine());
        }
    }
}

class DataStreamProcessor {
    #connectionAddress;
    #maximumLineCharacterCount;
    #collectedMessages = [];
    #projectIdentifierMap = new Map();
    #uiPanel;
    #databaseName = 'historical_records';
    #recordStoreName = 'event_entries';
    #databaseVersion = 2;
    #databaseInstance;
    #pollingInitiated = false;

    constructor(networkHost, characterLimit, panelReference) {
        this.#connectionAddress = networkHost;
        this.#maximumLineCharacterCount = characterLimit;
        this.#uiPanel = panelReference;

        this.#projectIdentifierMap.set('buildname', 'BUILDALIAS');

        this.#initializePersistentStorage();
    }

    async #initializePersistentStorage() {
        return new Promise((resolve, reject) => {
            const dbRequest = indexedDB.open(this.#databaseName, this.#databaseVersion);

            dbRequest.onupgradeneeded = (event) => {
                this.#databaseInstance = event.target.result;
                if (!this.#databaseInstance.objectStoreNames.contains(this.#recordStoreName)) {
                    this.#databaseInstance.createObjectStore(this.#recordStoreName, { keyPath: 'id', autoIncrement: true });
                }
            };

            dbRequest.onsuccess = (event) => {
                this.#databaseInstance = event.target.result;
                this.#retrieveStoredRecords().then(() => {
                    resolve();
                    this.#uiPanel._signalActivation();
                }).catch(reject);
            };

            dbRequest.onerror = (event) => {
                console.error("Database access failed:", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    async #retrieveStoredRecords() {
        return new Promise((resolve) => {
            const transaction = this.#databaseInstance.transaction(this.#recordStoreName, 'readonly');
            const objectStore = transaction.objectStore(this.#recordStoreName);
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = () => {
                this.#collectedMessages = getAllRequest.result.map(entry => entry.data);
                resolve();
            };

            getAllRequest.onerror = () => {
                console.error("Record retrieval error.");
                resolve();
            };
        });
    }

    async #persistCurrentRecords() {
        return new Promise((resolve, reject) => {
            const clearTransaction = this.#databaseInstance.transaction(this.#recordStoreName, 'readwrite');
            const clearStore = clearTransaction.objectStore(this.#recordStoreName);
            const clearOperation = clearStore.clear();

            clearOperation.onsuccess = () => {
                const addTransaction = this.#databaseInstance.transaction(this.#recordStoreName, 'readwrite');
                const addStore = addTransaction.objectStore(this.#recordStoreName);
                this.#collectedMessages.forEach(line => addStore.add({ data: line }));
                addTransaction.oncomplete = () => resolve();
                addTransaction.onerror = (e) => reject(e);
            };
            clearOperation.onerror = (e) => reject(e);
        });
    }

    #processIncomingInformation(incomingEvent) {
        const projectKey = incomingEvent.project;
        if (!this.#projectIdentifierMap.has(projectKey)) {
            return;
        }

        if (this.#collectedMessages.length >= this.#uiPanel.displayCapacity) {
            this.#collectedMessages.pop();
        }

        const numericSuffix = ` #${incomingEvent.number}`;
        const projectAlias = this.#projectIdentifierMap.get(projectKey);

        const availableWidth = this.#maximumLineCharacterCount - numericSuffix.length;
        let paddedProjectName = projectAlias.substring(0, availableWidth);
        while (paddedProjectName.length < availableWidth) {
            paddedProjectName += ' ';
        }

        const completeLine = paddedProjectName + numericSuffix + incomingEvent.result[0];
        this.#collectedMessages.unshift(completeLine);

        this.#uiPanel.updateContent(this.#collectedMessages);
        this.#persistCurrentRecords();
    }

    async #initiateContinuousPolling() {
        if (this.#pollingInitiated) return;
        this.#pollingInitiated = true;

        const performPoll = async () => {
            try {
                const queryResponse = await fetch(`http://${this.#connectionAddress}/data-feed`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Client-Activity': 'Polling'
                    }
                });

                if (queryResponse.ok) {
                    const receivedObject = await queryResponse.json();
                    if (receivedObject && Object.keys(receivedObject).length > 0) {
                        this.#processIncomingInformation(receivedObject);
                    }
                } else {
                    console.warn(`Data feed query failed: ${queryResponse.status}`);
                }
            } catch (error) {
                console.error("Polling operation encountered an error:", error);
            } finally {
                setTimeout(performPoll, 4000);
            }
        };
        performPoll();
    }

    beginOperation() {
        this.#initializePersistentStorage().then(() => {
            this.#initiateContinuousPolling();
        });
    }

    displayCurrentRecords() {
        this.#uiPanel.updateContent(this.#collectedMessages);
    }
}

(() => {
    const systemPanel = new PanelDisplay(12);

    const processor = new DataStreamProcessor(
        'host-machine:8080',
        22,
        systemPanel
    );

    systemPanel.registerListener('start', () => {
        processor.displayCurrentRecords();
    });

    processor.beginOperation();
})();