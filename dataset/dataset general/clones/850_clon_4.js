const fsa = require('fs');
const pth = require('path');

const dataPath = pth.resolve(__dirname, '..', 'config.json');

class EndpointManager {
    #collection;
    #storagePath;

    constructor(filePath) {
        this.#storagePath = filePath;
        this.#collection = this.#loadCollection();
    }

    #loadCollection() {
        try {
            const rawData = fsa.readFileSync(this.#storagePath, 'utf8');
            return JSON.parse(rawData);
        } catch (issue) {
            if (issue.code === 'ENOENT' || issue instanceof SyntaxError) {
                return [];
            }
            throw issue;
        }
    }

    #saveCollection() {
        const jsonString = JSON.stringify(this.#collection, null, 2);
        fsa.writeFileSync(this.#storagePath, jsonString, 'utf8');
    }

    getCollectionReference() {
        return this.#collection;
    }

    addEntry(entryObject) {
        this.#collection.push(entryObject);
        this.#saveCollection();
        return this.#collection;
    }

    removeEntryByLabel(identifierLabel) {
        const targetPosition = this.#collection.findIndex(item => item.label === identifierLabel);

        if (targetPosition !== -1) {
            this.#collection.splice(targetPosition, 1);
            this.#saveCollection();
        }
        return this.#collection;
    }
}

const dataManager = new EndpointManager(dataPath);
const globalEndpointsList = dataManager.getCollectionReference();

module.exports = function(serverInstance) {

    serverInstance.get("/hosts", function(requestContext, responseHandle) {
        responseHandle.render('host', {
            endpoints: globalEndpointsList,
            currentEndpoint: null
        });
    });

    serverInstance.post("/hosts/add", function(requestContext, responseHandle, errorPropagator) {
        try {
            const inputData = requestContext.body || {};
            const newEntry = {
                address: inputData.host,
                label: inputData.name
            };

            dataManager.addEntry(newEntry);

            responseHandle.json({
                endpoints: globalEndpointsList
            });
        } catch (issue) {
            return errorPropagator(issue);
        }
    });

    serverInstance.post("/hosts/delete", function(requestContext, responseHandle, errorPropagator) {
        try {
            const inputData = requestContext.body || {};
            const identifierToErase = inputData.name;

            dataManager.removeEntryByLabel(identifierToErase);

            responseHandle.json({
                endpoints: globalEndpointsList
            });
        } catch (issue) {
            return errorPropagator(issue);
        }
    });
};

module.exports.currentEndpoints = globalEndpointsList;