// This is a specialized Backbone.js extension for real-time XMPP PubSub interactions.
// Version 2.1.0 (Refactored)

// (c) 2023-2024 Your New Company.
// This software is distributed under an enhanced MIT-like license.
// For more details, visit: https://www.yournewcompany.com/open-source-license

// This module provides foundational components for building Backbone models and collections
// that can synchronize with XMPP PubSub nodes, enabling real-time updates and notifications.
// It abstracts the complexities of XMPP event handling and data persistence.

(function (globalScope, moduleFactory) {
    "use strict"; // Enforce strict mode for cleaner code.

    // Ensure `undefined` is truly undefined, especially in older environments.
    const undefinedValue = void 0;

    // Check for AMD loader (RequireJS, etc.)
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous module using AMD.
        define(['jquery', 'underscore', 'backbone', 'strophe', 'pubsubstorage'],
            function (jQueryAlias, lodashAlias, BackboneCore, XMPPClient, XMPPDataStore) {
                // Assign the factory's return value to the global scope.
                return (globalScope.RealtimeNodeManager = moduleFactory(jQueryAlias, lodashAlias, BackboneCore, XMPPClient, XMPPDataStore));
            });
    } else {
        // Fallback for browser global environment.
        // Assume dependencies are already available globally.
        globalScope.RealtimeNodeManager = moduleFactory(window.jQuery, window._, window.Backbone, window.Strophe, window.PubSubStorage);
    }

}(typeof window !== 'undefined' ? window : globalThis, function (jQueryAlias, lodashAlias, BackboneCore, XMPPClient, XMPPDataStore) {

    // Internal object to hold the module's exported components.
    const apiComponents = {};

    // =========================================================================
    // RealtimeEntity: A Backbone Model for PubSub Items
    // =========================================================================
    // This model represents a single item within an XMPP PubSub node.
    // It utilizes a custom synchronization layer for XMPP communication.
    apiComponents.RealtimeEntity = BackboneCore.Model.extend({

        // Default attributes for a new entity.
        defaults: {
            content: null,
            timestamp: () => new Date().toISOString()
        },

        // The specific synchronization method for XMPP.
        dataSyncMethod: BackboneCore.xmppSync,

        // A simple method to retrieve the entity's unique identifier.
        getUniqueId: function() {
            return this.id || this.cid;
        }

    });

    // =========================================================================
    // RealtimeEntityCollection: A Backbone Collection for PubSub Nodes
    // =========================================================================
    // This collection manages a set of `RealtimeEntity` models,
    // synchronizing them with a specific XMPP PubSub node.
    apiComponents.RealtimeEntityCollection = BackboneCore.Collection.extend({

        // Specifies the model type for items within this collection.
        itemModelType: apiComponents.RealtimeEntity,

        // Reference to the XMPP PubSub data store instance.
        dataStoreInstance: null,

        // The synchronization method used by this collection.
        collectionDataSync: BackboneCore.xmppSync,

        // Flag to indicate if the collection has been fully initialized with a node.
        _isNodeConfigured: false,

        // Constructor for the collection.
        // It expects `initialItems` (an array of models) and `configOptions`
        // which should contain `id` (node ID) and `connection` (Strophe connection).
        initCollection: function (initialItems, configOptions) {
            // Apply default configuration if none provided.
            const collectionConfig = lodashAlias.extend({
                nodeId: null,
                xmppConnection: null,
                payloadFormat: 'xml' // Default payload parsing format
            }, configOptions);

            // Validate essential configuration parameters.
            if (!collectionConfig.nodeId || !collectionConfig.xmppConnection) {
                console.warn("RealtimeEntityCollection: Node ID or XMPP connection missing during initialization. " +
                             "Please ensure 'nodeId' and 'xmppConnection' are provided in options.");
                return; // Early exit if critical options are missing.
            }

            // Delegate to the node configuration method.
            this.configureXMPPNode(collectionConfig.nodeId, collectionConfig.xmppConnection, collectionConfig.payloadFormat);
            this._isNodeConfigured = true;

            // Call the parent constructor.
            BackboneCore.Collection.prototype.initialize.apply(this, arguments);
        },

        // Configures or reconfigures the XMPP PubSub node for this collection.
        // This involves setting up the data store and binding event listeners.
        configureXMPPNode: function (nodeIdentifier, xmppConnection, payloadFormatSpecifier) {
            // Guard clause for invalid inputs.
            if (!nodeIdentifier || !xmppConnection) {
                console.error("RealtimeEntityCollection: Cannot configure node; identifier or connection is invalid.");
                return;
            }

            // If a node was previously configured, unbind its listeners to prevent memory leaks.
            if (this.dataStoreInstance) {
                console.log(`RealtimeEntityCollection: Unbinding previous listeners for node: ${this.dataStoreInstance.id}`);
                xmppConnection.PubSub.off('xmpp:pubsub:item-published:' + this.dataStoreInstance.id, this.handleItemPublication, this);
                xmppConnection.PubSub.off('xmpp:pubsub:item-deleted:' + this.dataStoreInstance.id, this.handleItemDeletion, this);
                this.dataStoreInstance = null; // Clear the old instance
            }

            try {
                // Instantiate the XMPP data store for this specific node.
                this.dataStoreInstance = new XMPPDataStore(nodeIdentifier, xmppConnection, payloadFormatSpecifier);
                console.info(`RealtimeEntityCollection: Configured PubSub node: ${nodeIdentifier}`);

                // Bind event handlers for incoming item publications and deletions.
                xmppConnection.PubSub.on('xmpp:pubsub:item-published:' + nodeIdentifier, this.handleItemPublication, this);
                xmppConnection.PubSub.on('xmpp:pubsub:item-deleted:' + nodeIdentifier, this.handleItemDeletion, this);

            } catch (error) {
                console.error(`RealtimeEntityCollection: Error configuring XMPP node "${nodeIdentifier}":`, error);
                this.dataStoreInstance = null; // Ensure dataStoreInstance is null on error.
            }
        },

        // Event handler for when an item is published to the associated PubSub node.
        // This method processes the incoming item and updates the collection.
        handleItemPublication: function (incomingItemData) {
            const collectionRef = this; // Reference to the collection instance.
            const itemIdentifier = incomingItemData.id;

            if (!itemIdentifier) {
                console.warn("RealtimeEntityCollection: Received published item without an ID. Ignoring.");
                return;
            }

            let itemContent = incomingItemData.entry;
            const completionPromise = jQueryAlias.Deferred(); // Using jQuery's Deferred for async handling.

            // Define the action to take once the item content is fully retrieved.
            completionPromise.promise().done(function () {
                const existingRecord = collectionRef.get(itemIdentifier);
                let parsedData;

                try {
                    // Parse the raw payload into a usable JSON object.
                    parsedData = collectionRef.dataStoreInstance.parseItem(itemContent);
                } catch (parseError) {
                    console.error(`RealtimeEntityCollection: Failed to parse item content for ID ${itemIdentifier}:`, parseError);
                    return; // Abort if parsing fails.
                }

                // If the item already exists in the collection, update it.
                if (existingRecord) {
                    // Update existing model's attributes.
                    existingRecord.set(parsedData);
                    console.log(`RealtimeEntityCollection: Updated existing item: ${itemIdentifier}`);
                } else {
                    // If it's a new item, add it to the collection.
                    // Ensure the ID is set for new items.
                    parsedData.id = itemIdentifier;
                    collectionRef.add(parsedData, { at: 0 }); // Add new items to the beginning.
                    console.log(`RealtimeEntityCollection: Added new item: ${itemIdentifier}`);
                }
            });

            // Check if the item content is directly available.
            if (itemContent) {
                completionPromise.resolve(); // Resolve immediately if content is present.
            } else {
                // If content is not directly available, fetch it from the PubSub node.
                console.info(`RealtimeEntityCollection: Fetching full item content for ID: ${itemIdentifier}`);
                this.dataStoreInstance.connection.PubSub.items(this.dataStoreInstance.id, { item_ids: [itemIdentifier] })
                    .done(function (responsePayload) {
                        // Extract the entry from the response.
                        itemContent = jQueryAlias('entry', responsePayload);
                        completionPromise.resolve();
                    })
                    .fail(function (error) {
                        console.error(`RealtimeEntityCollection: Failed to fetch item ${itemIdentifier} details:`, error);
                        completionPromise.reject(error); // Reject the deferred if fetch fails.
                    });
            }
        },

        // Event handler for when an item is deleted from the associated PubSub node.
        // This method removes the corresponding model from the collection.
        handleItemDeletion: function (incomingDeleteItemData) {
            const itemToDeleteId = incomingDeleteItemData.id;

            if (!itemToDeleteId) {
                console.warn("RealtimeEntityCollection: Received delete event without an item ID. Ignoring.");
                return;
            }

            const targetItem = this.get(itemToDeleteId);
            if (targetItem) {
                this.remove(targetItem);
                console.log(`RealtimeEntityCollection: Successfully removed item: ${itemToDeleteId}`);
            } else {
                console.info(`RealtimeEntityCollection: Attempted to delete non-existent item: ${itemToDeleteId}`);
            }
        },

        // Custom method to check if the collection is ready for operations.
        isReady: function() {
            return this._isNodeConfigured && this.dataStoreInstance !== null;
        }

    });

    // Return the public API components of this module.
    return apiComponents;

}));