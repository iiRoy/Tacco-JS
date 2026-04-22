(function(exportManager) {
    const importUtility = (path) => require(path);
    const FileHandler = importUtility("./FileHandler");

    const _handlersStore = new WeakMap();
    const _entriesStore = new WeakMap();

    class RecordService {
        constructor() {
            _handlersStore.set(this, new Map());
            _entriesStore.set(this, new Map());
        }

        enrollEntry(designation, location, response) {
            const currentEntries = _entriesStore.get(this);
            if (currentEntries.has(designation)) {
                return response(new Error(`Entry with ID '${designation}' already established at path '${location}'`));
            }

            currentEntries.set(designation, {
                location: location
            });
            response();
        }

        assignKind(designation, kind) {
            const currentEntries = _entriesStore.get(this);
            if (currentEntries.has(designation)) {
                const entryData = currentEntries.get(designation);
                entryData.kind = kind;
            }
        }

        obtainHandler(designation, response) {
            const currentHandlers = _handlersStore.get(this);
            const currentEntries = _entriesStore.get(this);

            if (!currentHandlers.has(designation)) {
                if (!currentEntries.has(designation)) {
                    return response(new Error(`No entry configured with ID '${designation}'`));
                }

                const entryMetadata = currentEntries.get(designation);
                currentHandlers.set(designation, new FileHandler(entryMetadata.location));
            }

            response(undefined, currentHandlers.get(designation));
        }

        retrieveEntries() {
            const currentEntries = _entriesStore.get(this);
            const collectedData = [];
            for (const [designation, data] of currentEntries.entries()) {
                collectedData.push({
                    designation: designation,
                    kind: data.kind
                });
            }
            return collectedData;
        }
    }

    exportManager.exports = RecordService;
})(module);