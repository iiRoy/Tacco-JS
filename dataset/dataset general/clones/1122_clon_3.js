function ResourceAssetManager(assetRegistry, onAssetsLoaded) {
    // Internal state properties for asset management.
    // _expectedAssetCount: Stores the total number of assets anticipated for loading.
    this._expectedAssetCount = 0;
    // _completedAssetCount: Tracks the number of assets that have successfully finished loading.
    this._completedAssetCount = 0;
    // managedAssets: A Map to store references to the loaded asset objects, keyed by their identifiers.
    this.managedAssets = new Map();
    // completionHandler: The function to be invoked once all assets have successfully loaded.
    this.completionHandler = onAssetsLoaded;

    // A flag to indicate if the loading process has been initiated and is currently active.
    let _loadingInProgress = false;

    // --- Type III Change: Guard clauses and alternative calculation for total count ---
    // Validate input parameters. Ensure assetRegistry is a non-null, non-array object.
    if (!assetRegistry || typeof assetRegistry !== 'object' || Array.isArray(assetRegistry)) {
        console.error("ResourceAssetManager: Invalid or empty asset registry provided. Expected an object.");
        // Optionally, call completion handler immediately if nothing to load, to prevent indefinite waiting.
        if (typeof this.completionHandler === 'function') {
            this.completionHandler(this.managedAssets); // Pass loaded assets (will be empty)
        }
        return; // Exit if no valid assets to process.
    }

    const assetIdentifiers = Object.keys(assetRegistry);
    // Type III Change: Calculate total count directly using Object.keys.length instead of iterating.
    this._expectedAssetCount = assetIdentifiers.length;

    // Type III Change: Handle the edge case where the registry is valid but empty.
    if (this._expectedAssetCount === 0) {
        console.warn("ResourceAssetManager: No assets specified in the registry. Calling completion handler immediately.");
        if (typeof this.completionHandler === 'function') {
            this.completionHandler(this.managedAssets); // Callback with an empty map.
        }
        return;
    }

    // --- Type II & III Change: Self-reference, named helper functions, error handling ---
    const managerInstance = this; // Preserve 'this' context for asynchronous callbacks.
    _loadingInProgress = true; // Set flag to indicate loading has started.

    /**
     * Private helper function to handle successful asset load events.
     * Increments the completion count and checks if all assets are loaded.
     */
    const handleAssetLoadComplete = function() {
        managerInstance._completedAssetCount++; // Increment the count of successfully loaded assets.
        // console.log(`Asset loaded: ${this.src}. Progress: ${managerInstance._completedAssetCount}/${managerInstance._expectedAssetCount}`); // Optional progress log

        // Check if all expected assets have finished loading.
        if (managerInstance._completedAssetCount === managerInstance._expectedAssetCount) {
            _loadingInProgress = false; // All assets are loaded, clear the loading flag.
            // Execute the provided completion callback if it's a valid function.
            if (typeof managerInstance.completionHandler === 'function') {
                managerInstance.completionHandler(managerInstance.managedAssets); // Pass the loaded assets Map.
            } else {
                console.warn("ResourceAssetManager: No completion handler function was provided, but all assets have loaded.");
            }
        }
    };

    /**
     * Private helper function to handle asset load error events.
     * Logs the error and still counts the asset as 'processed' to prevent the loader from hanging.
     * The completion handler will still be called once all assets are processed (loaded or errored).
     */
    const handleAssetLoadError = function(event) {
        // Type III Change: Added onerror handler for robustness.
        console.error(`Failed to load asset: ${event.target.src}. Error type: ${event.type}.`, event);
        // Even on error, we count it as "processed" to ensure the completion handler eventually fires.
        // Depending on requirements, one might want to stop loading, retry, or flag specific assets as failed.
        managerInstance._completedAssetCount++;

        // If all assets (including errored ones) are processed, call the completion handler.
        if (managerInstance._completedAssetCount === managerInstance._expectedAssetCount) {
            _loadingInProgress = false; // All assets are processed.
            if (typeof managerInstance.completionHandler === 'function') {
                managerInstance.completionHandler(managerInstance.managedAssets);
            }
        }
    };

    // --- Type II & III Change: Iteration and asset creation using modern syntax ---
    // Iterate over each asset identifier in the provided registry.
    for (const assetIdentifier of assetIdentifiers) { // Using `for...of` loop for array iteration.
        // Create a new HTML Image element for each asset.
        const currentAsset = new Image();
        // Set the source URL for the image, initiating the download.
        currentAsset.src = assetRegistry[assetIdentifier];

        // Attach event listeners for load and error events to our private handlers.
        currentAsset.onload = handleAssetLoadComplete;
        currentAsset.onerror = handleAssetLoadError;

        // Store the image element in the managedAssets Map using its identifier.
        // Type II Change: Using Map.set() instead of object property assignment.
        this.managedAssets.set(assetIdentifier, currentAsset);
    }

    // --- Type II & III Change: Public methods for status and asset retrieval ---

    /**
     * Checks if all assets managed by this instance have finished loading (successfully or with error).
     * @returns {boolean} True if all assets are processed, false if loading is still in progress.
     */
    this.hasAllAssetsLoaded = function() {
        // Type III Change: Added check for _loadingInProgress flag for clearer status.
        return !(_loadingInProgress) && (this._completedAssetCount === this._expectedAssetCount);
    };

    /**
     * Retrieves a loaded asset by its identifier.
     * @param {string} id - The unique identifier of the asset.
     * @returns {HTMLImageElement|undefined} The loaded image element, or undefined if not found or not yet loaded.
     */
    this.getAsset = function(id) {
        // Type III Change: Added a new public method to access loaded assets.
        return this.managedAssets.get(id);
    };

    /**
     * Provides the current loading progress as a percentage.
     * @returns {number} A number between 0 and 100, representing the loading progress.
     */
    this.getLoadingProgress = function() {
        // Type III Change: Added a new public method to get loading progress.
        if (this._expectedAssetCount === 0) {
            return 100; // If no assets were specified, consider it 100% loaded.
        }
        return Math.floor((this._completedAssetCount / this._expectedAssetCount) * 100);
    };
}