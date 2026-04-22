/*
 *    XMPP Subscription Hub for Backbone v1.0.0
 *
 *    (c) 2012-2013 Yiorgis Gozadinos.
 *    Backbone.xmpp distributed under the MIT license.
 *    http://github.com/ggozad/Backbone.xmpp
 */

/*
 * A basic model and collection utilizing **BackboneCore.xmppDataSync**
 * and providing support for XMPP notifications. This can serve as a foundation
 * for your custom models.
 */

( function ( globalScope, moduleCreator ) {
    if ( typeof defineModule === 'function' && defineModule.amd ) {
        // Asynchronous Module Definition (AMD) registration.
        defineModule( [ 'jquery', 'underscore', 'backbone', 'strophe', 'pubsubstorage' ], function ( jQ, lodashUtil, BackboneCore, StropheConn, SubscriptionStore ) {
            return ( globalScope.SubscriptionPoint = moduleCreator( jQ, lodashUtil, BackboneCore, StropheConn, SubscriptionStore ) );
        } );
    } else {
        // Standard browser globals setup.
        globalScope.SubscriptionPoint = moduleCreator( jQ, lodashUtil, BackboneCore, StropheConn, SubscriptionStore );
    }

}( this, function ( jQ, lodashUtil, BackboneCore, StropheConn, SubscriptionStore ) {

    var moduleExports = {};

    // Represents a single subscription entry.
    moduleExports.SubscriptionEntry = BackboneCore.Model.extend({

        dataSync: BackboneCore.xmppDataSync

    });

    // Manages a collection of subscription entries.
    moduleExports.SubscriptionCollection = BackboneCore.Collection.extend({

        entryModel: moduleExports.SubscriptionEntry,
        currentPoint: null,
        dataSync: BackboneCore.xmppDataSync,

        /*
         * The `initCollection` method expects the node's identifier to be provided
         * in `configOpts.nodeId`, along with the Strophe connection instance
         * in `configOpts.xmppConn`.
         * If you don't know these upfront, you'll need to set the `currentPoint`
         * attribute and subscribe to XMPP events manually.
         */
        initCollection: function ( initialEntries, configOpts ) {
            configOpts = configOpts || {};
            if ( configOpts.nodeId && configOpts.xmppConn ) {
                this.configurePoint( configOpts.nodeId, configOpts.xmppConn, configOpts.contentFormat );
            }
        },

        configurePoint: function( pointId, connInstance, dataFormat ) {
            if ( this.currentPoint ) {
                connInstance.PubSub.off( 'xmpp:sub:entry-published:' + this.currentPoint.pointId, this.handleEntryPublished, this );
                connInstance.PubSub.off( 'xmpp:sub:entry-removed:' + this.currentPoint.pointId, this.handleEntryRemoved, this );
            }
            this.currentPoint = new SubscriptionStore( pointId, connInstance, dataFormat );
            connInstance.PubSub.on( 'xmpp:sub:entry-published:' + pointId, this.handleEntryPublished, this );
            connInstance.PubSub.on( 'xmpp:sub:entry-removed:' + pointId, this.handleEntryRemoved, this );
        },

        /*
         * `handleEntryPublished` is a callback for the `xmpp:sub:entry-published` event.
         * When a model is pushed to the server from another client, it's received
         * and automatically added to this collection, triggering an `add` event.
         * If an existing model is updated, it triggers a `change` event.
         */
        handleEntryPublished: function ( publishedItem ) {
            var itemContent = publishedItem.entry,
                collectionRef = this,
                deferredOp = jQ.Deferred(),
                existingEntry,
                parsedData;

            deferredOp.promise().done( function () {
                existingEntry = collectionRef.get( publishedItem.id );
                parsedData = collectionRef.currentPoint.parseItem( itemContent );
                if ( existingEntry ) {
                    collectionRef.remove( existingEntry, { quiet: true } );
                    collectionRef.add( existingEntry, { position: 0, quiet: true } );
                    existingEntry.set( parsedData );
                } else {
                    parsedData.id = publishedItem.id;
                    collectionRef.add( parsedData, { position: 0 } );
                }
            } );

            if ( itemContent ) {
                deferredOp.resolve();
            } else {
                this.currentPoint.connInstance.PubSub.items( this.currentPoint.pointId, { entry_identifiers: [ publishedItem.id ] } )
                    .done( function ( responseObj ) {
                        itemContent = jQ( 'entry', responseObj );
                        deferredOp.resolve();
                    } );
            }
        },

        handleEntryRemoved: function ( removedItem ) {
            removedItem = this.get( removedItem.id );
            if ( removedItem ) {
                this.remove( removedItem );
            }
        }

    });

    return moduleExports;

} ) );