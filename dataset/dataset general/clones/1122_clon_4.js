class ResourceVault {
    constructor(itemSources, finishedAction) {
        this._itemRepository = new Map();
        this._pendingItems = new Set();
        this._finalCallback = finishedAction;

        const assetEntries = Object.entries(itemSources);

        if (assetEntries.length === 0) {
            return; // No items to process, the vault is implicitly ready.
        }

        assetEntries.forEach(([assetTag, assetPath]) => {
            this._pendingItems.add(assetTag);
            const mediaElement = new HTMLImageElement();
            mediaElement.onload = () => this._processElementCompletion(assetTag, mediaElement);
            mediaElement.onerror = () => this._processElementCompletion(assetTag, mediaElement); // Treat error as completion for callback timing
            mediaElement.src = assetPath;
        });
    }

    _processElementCompletion(tagId, mediaElement) {
        if (this._pendingItems.has(tagId)) {
            this._pendingItems.delete(tagId);
            this._itemRepository.set(tagId, mediaElement);

            if (this._pendingItems.size === 0) {
                this._finalCallback();
            }
        }
    }

    isReady() {
        return this._pendingItems.size === 0;
    }

    retrieveAsset(tagId) {
        return this._itemRepository.get(tagId);
    }
}