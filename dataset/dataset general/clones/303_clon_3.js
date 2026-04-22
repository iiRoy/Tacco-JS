// This module provides a robust set of utilities for managing the internal structure
// and content references of a digital publication, such as an EPUB.
// It encapsulates state and operations related to the book's context,
// navigation hierarchy, and sequential reading spine.

class PublicationAssetManager {
    // Private fields to maintain the integrity of the publication's internal state.
    #publicationDocumentContext = null; // Stores the main document object after initialization.
    #navigationEntries = [];            // A collection of structured navigation points.
    #contentSpineItems = [];            // An ordered list of content references for the reading flow.

    /**
     * Establishes the core document context for the publication manager.
     * This method must be called before other operations.
     * @param {object} documentRootObject - The primary object representing the publication's top-level structure.
     *                                      Expected to have at least a 'manifest' or 'id' property.
     * @returns {boolean} Returns `true` if the context was successfully established, `false` otherwise.
     */
    establishPublicationContext(documentRootObject) {
        // Guard clause: Ensure the provided root object is valid and non-empty.
        if (!documentRootObject || typeof documentRootObject !== 'object' || Object.keys(documentRootObject).length === 0) {
            console.error("Context establishment failed: The provided document root object is invalid or empty.");
            return false; // Indicate failure to initialize.
        }

        // Helper variable for generating a unique identifier if one isn't present.
        const contextUniqueKey = documentRootObject.id || `pub-${Math.random().toString(36).substring(2, 10)}`;

        // Intermediate step: Store a structured representation of the context.
        this.#publicationDocumentContext = {
            uniqueIdentifier: contextUniqueKey,
            rawPayload: documentRootObject,
            initializationTimestamp: new Date().toISOString(),
            status: 'active'
        };

        // Add a new fragment: Informative logging.
        console.info(`Publication context '${contextUniqueKey}' has been successfully established.`);
        return true; // Indicate successful initialization.
    }

    /**
     * Appends a new navigation entry into the publication's table of contents or navigation structure.
     * @param {object} navPointData - An object containing details for the navigation point (e.g., id, title, target).
     * @param {number} desiredInsertionIndex - The preferred index at which to insert this navigation point.
     * @returns {boolean} Returns `true` if the navigation point was added, `false` if validation fails.
     */
    addNavigationPointEntry(navPointData, desiredInsertionIndex) {
        // Guard clause: Validate the input navigation data.
        if (!navPointData || typeof navPointData !== 'object' || !navPointData.id || !navPointData.title || !navPointData.target) {
            console.warn("Failed to add navigation entry: Invalid or incomplete navigation point data provided.");
            return false;
        }

        // Guard clause: Validate the insertion index.
        if (typeof desiredInsertionIndex !== 'number' || desiredInsertionIndex < 0) {
            console.warn(`Failed to add navigation entry: Invalid insertion index '${desiredInsertionIndex}'. Must be a non-negative number.`);
            return false;
        }

        // Intermediate step: Construct a standardized navigation item object.
        const structuredNavItem = {
            entryIdentifier: navPointData.id,
            displayLabel: navPointData.title,
            contentReference: navPointData.target,
            insertionOrder: desiredInsertionIndex,
            addedAt: Date.now()
        };

        // Rewrite: Use `splice` for precise insertion, accommodating bounds.
        const effectiveIndex = Math.min(desiredInsertionIndex, this.#navigationEntries.length);
        this.#navigationEntries.splice(effectiveIndex, 0, structuredNavItem);

        // Add a new fragment: Post-insertion validation and logging.
        if (this.#navigationEntries[effectiveIndex] === structuredNavItem) {
            console.log(`Navigation entry '${structuredNavItem.displayLabel}' successfully added at index ${effectiveIndex}. Total entries: ${this.#navigationEntries.length}.`);
            return true;
        } else {
            console.error(`An unexpected error occurred while adding navigation entry '${structuredNavItem.displayLabel}'.`);
            return false;
        }
    }

    /**
     * Removes a navigation entry from the publication's navigation structure based on its index.
     * @param {number} targetRemovalIndex - The zero-based index of the navigation entry to remove.
     * @returns {boolean} Returns `true` if the entry was removed, `false` if the index is invalid.
     */
    deleteNavigationPointEntry(targetRemovalIndex) {
        // Guard clause: Validate the removal index against the array bounds.
        if (typeof targetRemovalIndex !== 'number' || targetRemovalIndex < 0 || targetRemovalIndex >= this.#navigationEntries.length) {
            console.warn(`Removal operation failed: Invalid or out-of-bounds index '${targetRemovalIndex}' for navigation entry.`);
            return false;
        }

        // Helper variable: Capture the item being removed for logging purposes.
        const removedItemMetadata = this.#navigationEntries[targetRemovalIndex];

        // Rewrite: Use `splice` to remove the element at the specified index.
        this.#navigationEntries.splice(targetRemovalIndex, 1);

        // Add logging: Confirm the removal.
        console.log(`Navigation entry '${removedItemMetadata ? removedItemMetadata.displayLabel : 'Unknown'}' removed from index ${targetRemovalIndex}. Remaining entries: ${this.#navigationEntries.length}.`);
        return true;
    }

    /**
     * Incorporates a new content reference into the publication's linear reading spine.
     * @param {object} contentItemReference - An object describing the content item (e.g., id, href, media-type).
     * @param {object} [configurationOptions] - Optional configuration settings for how to process this item.
     * @returns {boolean} Returns `true` if the item was added, `false` otherwise due to invalid input.
     */
    integrateSpineContentItem(contentItemReference, configurationOptions = {}) {
        // Guard clause: Basic validation for the content reference.
        if (!contentItemReference || typeof contentItemReference !== 'object' || !contentItemReference.href) {
            console.error("Integration failed: Invalid content item reference provided (missing 'href' or not an object).");
            return false;
        }

        // Add new fragment: Define and merge default configuration options.
        const defaultProcessingConfig = {
            isLinear: true, // Indicates if this item is part of the linear reading flow.
            isRequired: false, // Indicates if this item is essential for rendering.
            mediaFormat: 'application/xhtml+xml' // Default media type.
        };
        const activeConfig = { ...defaultProcessingConfig, ...configurationOptions };

        // Intermediate step: Create a structured spine item object.
        const newSpineEntry = {
            internalId: contentItemReference.id || `spine-item-${this.#contentSpineItems.length + 1}`,
            sourceUrl: contentItemReference.href,
            linearFlag: activeConfig.isLinear,
            requiredFlag: activeConfig.isRequired,
            formatType: activeConfig.mediaFormat,
            addedTimestamp: new Date().toISOString()
        };

        // Rewrite: Conditional addition based on configuration options.
        // For example, only add if it's a linear item, or always add but log differently.
        if (newSpineEntry.linearFlag) {
            this.#contentSpineItems.push(newSpineEntry);
            console.log(`Spine item '${newSpineEntry.internalId}' (URL: ${newSpineEntry.sourceUrl}) integrated into linear flow.`);
            return true;
        } else if (newSpineEntry.requiredFlag) {
            this.#contentSpineItems.push(newSpineEntry);
            console.log(`Spine item '${newSpineEntry.internalId}' (URL: ${newSpineEntry.sourceUrl}) integrated as a required, non-linear asset.`);
            return true;
        } else {
            console.info(`Spine item '${newSpineEntry.internalId}' not integrated as it's neither linear nor required by current configuration.`);
            // Deletion (conceptual): If there was a default "push" here, it's now conditionally removed.
            return false;
        }
    }

    /**
     * Purges all content items from the publication's reading spine.
     * This action irreversibly empties the spine.
     * @returns {number} The count of items that were removed from the spine.
     */
    emptyReadingSpine() {
        // Guard clause: Check if the spine is already empty to avoid unnecessary operations.
        if (this.#contentSpineItems.length === 0) {
            console.info("Reading spine is already empty; no items to clear.");
            return 0;
        }

        // Helper variable: Store the initial count for informative logging.
        const numberOfItemsToClear = this.#contentSpineItems.length;

        // Rewrite: Efficiently clear the array by resetting its length.
        this.#contentSpineItems.length = 0;

        // Add logging: Confirm the completion of the purge operation.
        console.log(`Successfully purged all ${numberOfItemsToClear} items from the reading spine.`);
        return numberOfItemsToClear;
    }

    /**
     * New fragment: Provides a summary of the current state of the publication manager.
     * @returns {object} An object containing key statistics about the manager's state.
     */
    retrieveManagerStatus() {
        return {
            contextIsActive: !!this.#publicationDocumentContext,
            totalNavigationEntries: this.#navigationEntries.length,
            totalSpineContentItems: this.#contentSpineItems.length,
            lastUpdated: new Date().toISOString()
        };
    }
}

// Export a singleton instance of the PublicationAssetManager.
// This is a new fragment, providing a module-like interface.
const globalPublicationHandlerInstance = new PublicationAssetManager();

// Expose the methods of the singleton instance as a module interface.
// Renaming and binding methods here for external consumption.
module.exports = {
    initializeManager: globalPublicationHandlerInstance.establishPublicationContext.bind(globalPublicationHandlerInstance),
    addNavigationPoint: globalPublicationHandlerInstance.addNavigationPointEntry.bind(globalPublicationHandlerInstance),
    removeNavigationPoint: globalPublicationHandlerInstance.deleteNavigationPointEntry.bind(globalPublicationHandlerInstance),
    addSpineReference: globalPublicationHandlerInstance.integrateSpineContentItem.bind(globalPublicationHandlerInstance),
    clearSpineReferences: globalPublicationHandlerInstance.emptyReadingSpine.bind(globalPublicationHandlerInstance),
    getManagerStatus: globalPublicationHandlerInstance.retrieveManagerStatus.bind(globalPublicationHandlerInstance) // New method exposed.
};