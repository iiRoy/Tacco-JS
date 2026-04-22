/*
 *    Backbone XMPP PubSub Storage v1.0.0
 *
 *    (c) 2012-2013 Yiorgis Gozadinos.
 *    Backbone.xmpp is distributed under the MIT license.
 *    For more information, see: http://github.com/ggozad/Backbone.xmpp
 *
 *    This file defines a simple Backbone model and collection,
 *    leveraging Backbone.xmpp.storage for XMPP PubSub integration.
 *    It provides a foundation for models that need to interact with XMPP PubSub nodes
 *    and receive real-time notifications.
 */


( function ( root, factory ) {


    // Check for AMD loader environment
    if ( typeof define === 'function'   &&   define.amd ) {

        /*
         *   AMD: Register as an anonymous module.
         *   Dependencies are jQuery, Underscore, Backbone, Strophe, and PubSubStorage.
         */
        define( [ 'jquery', 'underscore', 'backbone', 'strophe', 'pubsubstorage' ],
            function ( $, _, Backbone, Strophe, PubSubStorage ) {
                return ( root.PubSubNode = factory( $, _, Backbone, Strophe, PubSubStorage ) );
            }
        );

    } else {

        // Browser globals: Assign the factory output to the root object.
        root.PubSubNode = factory( $, _, Backbone, Strophe, PubSubStorage );

    }

} ( this, function ( $, _, Backbone, Strophe, PubSubStorage ) {


    var exports = {}; // This object will hold our exported modules.


    // PubSub Item Model Definition
    // ----------------------------
    // Represents a single item within an XMPP PubSub node.
    exports.PubSubItem = Backbone.Model . extend ( {

        // Use the custom Backbone.xmppSync for persistence.
        sync : Backbone.xmppSync

    } );


    // PubSub Items Collection Definition
    // ----------------------------------
    // Represents a collection of items from an XMPP PubSub node.
    // It manages the subscription to PubSub events and keeps the collection in sync.
    exports.PubSubNode = Backbone . Collection . extend ( {

        // The model for this collection is PubSubItem.
        model : exports.PubSubItem,


        // The PubSubStorage instance associated with this node.
        node : null,


        // Use the custom Backbone.xmppSync for collection-level operations (e.g., fetch).
        sync : Backbone.xmppSync,


        // Initialize the collection.
        // Expects `options.id` (the PubSub node ID) and `options.connection` (Strophe connection).
        // If these are provided, `setNode` is called to configure the PubSub node.
        initialize : function ( models, options ) {

            options = options || {}; // Ensure options is an object.

            if ( options.id   &&   options.connection ) {

                this . setNode ( options.id, options.connection, options.payloadFormat );

            }

        },


        // Sets or updates the PubSub node for this collection.
        // It also manages subscribing/unsubscribing from XMPP PubSub events.
        setNode : function ( id, connection, format ) {

            // If a node was previously set, unsubscribe from its events to prevent leaks.
            if ( this.node ) {

                connection.PubSub.off ( 'xmpp:pubsub:item-published:' + this.node.id, this.onItemPublished, this );
                connection.PubSub.off ( 'xmpp:pubsub:item-deleted:'   + this.node.id, this.onItemDeleted,   this );

            }

            // Create a new PubSubStorage instance for the given node ID and connection.
            this.node = new PubSubStorage ( id, connection, format );

            // Subscribe to new item published and item deleted events for the new node.
            connection.PubSub.on ( 'xmpp:pubsub:item-published:' + id, this.onItemPublished, this );
            connection.PubSub.on ( 'xmpp:pubsub:item-deleted:'   + id, this.onItemDeleted,   this );

        },


        // Handler for the 'xmpp:pubsub:item-published' event.
        // This method is invoked when an item is published to the PubSub node,
        // either by this client or another. It ensures the collection is updated.
        onItemPublished : function ( item ) {

            var payload  = item.entry,
                self     = this,
                d        = $.Deferred(),
                existing,
                json;


            // Once the payload is resolved (either directly or via fetch), process the item.
            d.promise().done( function () {

                existing = self.get( item.id ); // Check if the item already exists in the collection.
                json     = self.node.parseItem( payload ); // Parse the payload into a JSON object.


                if ( existing ) {

                    // If the item exists, update it.
                    // Remove and re-add to move it to the beginning if desired (silent to avoid double events).
                    self.remove( existing, { silent: true } );
                    self.add( existing, { at: 0, silent: true } );
                    existing.set( json ); // Update the model's attributes.

                } else {

                    // If it's a new item, add it to the collection.
                    json.id = item.id; // Ensure the ID is set.
                    self.add( json, { at: 0 } ); // Add to the beginning of the collection.

                }

            } );


            // If the payload is directly available, resolve immediately.
            if ( payload ) {

                d.resolve();

            } else {

                // Otherwise, fetch the item payload from the PubSub node.
                this.node.connection.PubSub.items ( this.node.id, { item_ids: [item.id] } )
                    .done( function ( res ) {

                        payload = $( 'entry', res ); // Extract the entry payload from the response.
                        d.resolve(); // Resolve the deferred.

                    } );

            }

        },


        // Handler for the 'xmpp:pubsub:item-deleted' event.
        // This method removes an item from the collection when it's deleted from the PubSub node.
        onItemDeleted : function ( item ) {

            item = this.get( item.id ); // Find the corresponding model in the collection.

            if ( item ) {

                this.remove( item ); // Remove the model from the collection.

            }

        }

    } );


    // Export the PubSubNode collection and PubSubItem model.
    return exports;


} ) );