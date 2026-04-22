const filesystem = require('fs');
const pathfinder = require('path');
const verifier = require('assert');

const ephemeralFile = '/tmp/distinct-data-store.csv';

const sourceFilePath = pathfinder.join(__dirname, 'test.csv');
const sourceContent = filesystem.readFileSync(sourceFilePath, 'utf8');
filesystem.writeFileSync(ephemeralFile, sourceContent);

class DataVault {
    constructor(filePath, configuration) {
        this.sourcePath = filePath;
        this.loadDelay = configuration.autoLoadThreshold || 0;
        this.storedRecords = {};
        this.dataPromise = null;
        this.operationCeased = false;
    }

    async initiateLoad() {
        if (this.dataPromise) {
            return this.dataPromise;
        }

        this.dataPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (this.operationCeased) {
                        return reject(new Error("Operations ceased before data could be loaded."));
                    }
                    const rawText = filesystem.readFileSync(this.sourcePath, 'utf8');
                    this.processText(rawText);
                    resolve(this.storedRecords);
                } catch (error) {
                    reject(error);
                }
            }, this.loadDelay);
        });
        return this.dataPromise;
    }

    processText(inputString) {
        const lines = inputString.split('\n').filter(line => line.trim() !== '');
        if (lines.length <= 1) {
            return;
        }

        const columnTitles = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
            const currentValues = lines[i].split(',').map(v => v.trim());
            const currentEntry = {};
            let recordKey = null;

            columnTitles.forEach((title, index) => {
                let interpretedValue = currentValues[index];

                if (interpretedValue === 'true') {
                    interpretedValue = true;
                } else if (interpretedValue === 'false') {
                    interpretedValue = false;
                } else if (!isNaN(Number(interpretedValue)) && interpretedValue !== '') {
                    interpretedValue = Number(interpretedValue);
                } else if (title === 'update-time' && !isNaN(new Date(interpretedValue).getTime())) {
                    interpretedValue = new Date(interpretedValue);
                }
                
                currentEntry[title] = interpretedValue;
                if (title === 'key') {
                    recordKey = interpretedValue;
                }
            });
            if (recordKey !== null) {
                this.storedRecords[recordKey] = currentEntry;
            }
        }
    }

    ceaseOperations() {
        this.operationCeased = true;
    }
}

const dataManager = new DataVault(ephemeralFile, {
    autoLoadThreshold: 1000
});

(async function performValidation() {
    const gatheredData = await dataManager.initiateLoad();

    verifier.strictEqual(Object.keys(gatheredData).length, 2);

    const specificRecord = gatheredData["key3"];

    verifier.strictEqual(typeof specificRecord.enabled, "boolean");
    verifier.strictEqual(typeof specificRecord["update-time"], "object");
    verifier.strictEqual(typeof specificRecord.first, "string");
    verifier.strictEqual(typeof specificRecord.phone, "number");

    dataManager.ceaseOperations();
})();