/*
 *  This is a modified version of the original Backbone Firebase Adapter.
 *  It retains all functionality but has altered whitespace and comments.
 */

( function ( ) {

    var _ = this._ ; /* Reference to Underscore.js library */
    var Backbone = this.Backbone ; /* Reference to Backbone.js library */

    // Define the main Firebase adapter constructor
    Backbone.Firebase = function ( ref ) {
        this._fbref = ref ; // Store the Firebase reference
        this._children = [ ] ; // Initialize an empty array for children

        /* Check if the reference is a string and create a new Firebase instance if so */
        if ( typeof ref == "string" )
        {
            this._fbref = new Firebase ( ref ) ;
        }

        // Bind all necessary methods to 'this' context
        _.bindAll ( this ) ;

        /* Set up event listeners for Firebase child events */
        this._fbref.on ( "child_added" , this._childAdded ) ;
        this._fbref.on ( "child_moved" , this._childMoved ) ;
        this._fbref.on ( "child_changed" , this._childChanged ) ;
        this._fbref.on ( "child_removed" , this._childRemoved ) ;
    } ;


    _.extend ( Backbone.Firebase.prototype , {

        /* Handler for when a child is added to the Firebase reference */
        _childAdded : function ( childSnap , prevChild ) {
            var model = childSnap.val ( ) ; // Get the model data
            model.id = childSnap.name ( ) ; // Set the model ID from Firebase snapshot name

            if ( prevChild ) {
                var item = _.find ( this._children , function ( child ) {
                    return child.id == prevChild ; // Find the previous child in the array
                } ) ;
                this._children.splice ( this._children.indexOf ( item ) + 1 , 0 , model ) ; // Insert after the previous child
            } else {
                this._children.unshift ( model ) ; // If no previous child, add to the beginning
            }
        } ,


        /* Handler for when a child's position changes */
        _childMoved : function ( childSnap , prevChild ) {
            var model = childSnap.val ( ) ; // Retrieve model data
            this._children = _.reject ( this._children , function ( child ) {
                return child.id == model.id ; // Remove the old instance of the model
            } ) ;
            this._childAdded ( childSnap , prevChild ) ; // Re-add it at the new position
        } ,


        /* Handler for when a child's data changes */
        _childChanged : function ( childSnap , prevChild ) {
            var model = childSnap.val ( ) ; // Get the updated model data
            model.id = childSnap.name ( ) ; // Ensure ID is set
            var item = _.find ( this._children , function ( child ) {
                return child.id == model.id ; // Find the model in the local array
            } ) ;
            this._children [ this._children.indexOf ( item ) ] = model ; // Update the model in place
        } ,


        /* Handler for when a child is removed */
        _childRemoved : function ( oldChildSnap ) {
            var model = oldChildSnap.val ( ) ; // Get the removed model's data
            this._children = _.reject ( this._children , function ( child ) {
                return child.id == model.id ; // Filter out the removed model
            } ) ;
        } ,


        /* Method to create a new model in Firebase */
        create : function ( model , cb ) {
            if ( ! model.id ) {
                model.id = this._fbref.push ( ).name ( ) ; // Generate a new ID if not present
            }
            var val = model.toJSON ( ) ; // Convert model to JSON
            this._fbref.child ( model.id ).set ( val , _.bind ( function ( err ) {
                if ( ! err ) {
                    cb ( null , val ) ; // Call callback on success
                } else {
                    cb ( "Could not create model " + model.id ) ; // Call callback on error
                }
            } , this ) ) ;
        } ,


        /* Method to read a single model from Firebase */
        read : function ( model , cb ) {
            if ( ! model.id ) {
                _.defer ( cb , "Invalid model ID provided to read" ) ; // Handle invalid ID
                return ;
            }
            var index = _.find ( this._children , function ( child ) {
                return child.id == model.id ; // Find the model by ID
            } ) ;
            _.defer ( cb , null , this._children [ index ] ) ; // Defer callback with model data
        } ,


        /* Method to read all models */
        readAll : function ( model , cb ) {
            _.defer ( cb , null , this._children ) ; // Defer callback with all children
        } ,


        /* Method to update an existing model in Firebase */
        update : function ( model , cb ) {
            var val = model.toJSON ( ) ; // Get model's JSON representation
            this._fbref.child ( model.id ).update ( val , function ( err ) {
                if ( ! err ) {
                    cb ( null , val ) ; // Success callback
                } else {
                    cb ( "Could not update model " + model.id , null ) ; // Error callback
                }
            } ) ;
        } ,


        /* Method to delete a model from Firebase */
        delete : function ( model , cb ) {
            this._fbref.child ( model.id ).remove ( function ( err ) {
                if ( ! err ) {
                    cb ( null , model ) ; // Success callback
                } else {
                    cb ( "Could not delete model " + model.id ) ; // Error callback
                }
            } ) ;
        }
    } ) ;


    // Define the custom Firebase sync method
    Backbone.Firebase.sync = function ( method , model , options , error ) {
        var store = model.firebase || model.collection.firebase ; // Determine the Firebase store

        // Backwards compatibility with Backbone <= 0.3.3
        if ( typeof options == 'function' ) {
            options = {
                success : options ,
                error : error
            } ;
        }

        // If reading a model without an ID, treat as readAll
        if ( method == "read" && model.id == undefined ) {
            method = "readAll" ;
        }

        // Execute the appropriate store method
        store [ method ].apply ( this , [ model , function ( err , val ) {
            if ( err ) {
                options.error ( model , err , options ) ; // Call error handler
            } else {
                options.success ( model , val , options ) ; // Call success handler
            }
        } ] ) ;
    } ;

    // Store the original Backbone.sync method
    Backbone.oldSync = Backbone.sync ;

    /*
     * Override 'Backbone.sync' to default to Firebase sync.
     * The original 'Backbone.sync' is still available in 'Backbone.oldSync'.
     */
    Backbone.sync = function ( method , model , options , error ) {
        var syncMethod = Backbone.oldSync ; // Default to old sync

        // If model or its collection has a Firebase reference, use Firebase sync
        if ( model.firebase || ( model.collection && model.collection.firebase ) ) {
            syncMethod = Backbone.Firebase.sync ;
        }
        return syncMethod.apply ( this , [ method , model , options , error ] ) ; // Apply the chosen sync method
    } ;


    /*
     * Custom Firebase Collection definition.
     * Extends Backbone.Collection.
     */
    Backbone.Firebase.Collection = Backbone.Collection.extend ( {
        sync : function ( ) {
            this._log ( "Sync called on a Firebase collection, ignoring." ) ; // Sync is handled internally
        } ,

        fetch : function ( ) {
            this._log ( "Fetch called on a Firebase collection, ignoring." ) ; // Fetch is handled internally
        } ,

        /* Constructor for the Firebase Collection */
        constructor : function ( models , options ) {

            // Apply parent constructor (this will also call initialize).
            Backbone.Collection.apply ( this , arguments ) ;

            if ( options && options.firebase ) {
                this.firebase = options.firebase ; // Set firebase from options
            }
            switch ( typeof this.firebase ) {
                case "object" :
                    break ; // Already an object, do nothing
                case "string" :
                    this.firebase = new Firebase ( this.firebase ) ;
                    break ; // Create new Firebase instance from string
                case "function" :
                    this.firebase = this.firebase ( ) ;
                    break ; // Execute function to get Firebase instance
                default :
                    throw new Error ( "Invalid firebase reference created" ) ; // Error for invalid reference
            }

            // Add handlers for remote events.
            this.firebase.on ( "child_added" , this._childAdded.bind ( this ) ) ;
            this.firebase.on ( "child_moved" , this._childMoved.bind ( this ) ) ;
            this.firebase.on ( "child_changed" , this._childChanged.bind ( this ) ) ;
            this.firebase.on ( "child_removed" , this._childRemoved.bind ( this ) ) ;

            /* Add handlers for all models in this collection, and any future ones
             * that may be added to maintain two-way sync.
             */
            function _updateModel ( model , options ) {
                this.firebase.child ( model.id ).update ( model.toJSON ( ) ) ; // Update Firebase on model change
            }
            function _unUpdateModel ( model ) {
                model.off ( "change" , _updateModel , this ) ; // Remove change listener on model removal
            }

            for ( var i = 0 ; i < this.models.length ; i ++ ) {
                this.models [ i ].on ( "change" , _updateModel , this ) ; // Listen for changes on existing models
                this.models [ i ].once ( "remove" , _unUpdateModel , this ) ; // Listen for removal on existing models
            }
            this.on ( "add" , function ( model ) {
                model.on ( "change" , _updateModel , this ) ; // Listen for changes on newly added models
                model.once ( "remove" , _unUpdateModel , this ) ; // Listen for removal on newly added models
            } , this ) ;
        } ,

        comparator : function ( model ) {
            return model.id ; // Models are compared by their ID
        } ,

        add : function ( models , options ) {
            var parsed = this._parseModels ( models ) ; // Parse models to ensure they have IDs and are JSON
            for ( var i = 0 ; i < parsed.length ; i ++ ) {
                var model = parsed [ i ] ;
                this.firebase.child ( model.id ).set ( model ) ; // Set model in Firebase
            }
            // TODO: Implement options.success for add operation
        } ,

        remove : function ( models , options ) {
            var parsed = this._parseModels ( models ) ; // Parse models for removal
            for ( var i = 0 ; i < parsed.length ; i ++ ) {
                var model = parsed [ i ] ;
                this.firebase.child ( model.id ).set ( null ) ; // Set to null to remove from Firebase
            }
            // TODO: Implement options.success for remove operation
        } ,

        create : function ( model , options ) {
            this._log ( "Create called, aliasing to add. Consider using Collection.add!" ) ; // Log warning
            options = options ? _.clone ( options ) : { } ; // Clone options if provided
            if ( options.wait ) {
                this._log ( "Wait option provided to create, ignoring." ) ; // Log warning about wait option
            }
            model = Backbone.Collection.prototype._prepareModel.apply (
                this , [ model , options ]
            ) ;
            if ( ! model ) {
                return false ; // If model preparation failed
            }
            this.add ( [ model ] , options ) ; // Use add method to create
            return model ;
        } ,

        _log : function ( msg ) {
            if ( console && console.log ) {
                console.log ( msg ) ; // Log messages if console is available
            }
        } ,

        /*
         * TODO: Options will be ignored for add & remove, document this!
         * Helper to parse models, ensuring IDs and converting to JSON if necessary.
         */
        _parseModels : function ( models ) {
            var ret = [ ] ;
            models = _.isArray ( models ) ? models.slice ( ) : [ models ] ; // Ensure models is an array
            for ( var i = 0 ; i < models.length ; i ++ ) {
                var model = models [ i ] ;
                if ( ! model.id ) {
                    model.id = this.firebase.push ( ).name ( ) ; // Generate new ID if missing
                }
                if ( model.toJSON && typeof model.toJSON == "function" ) {
                    model = model.toJSON ( ) ; // Convert to JSON if it's a Backbone model
                }
                ret.push ( model ) ; // Add to return array
            }
            return ret ;
        } ,

        _childAdded : function ( snap ) {
            Backbone.Collection.prototype.add.apply ( this , [ snap.val ( ) ] ) ; // Add the new child to the collection
        } ,

        _childMoved : function ( snap ) {
            // TODO: Investigate: can this occur without the ID changing?
            this._log ( "_childMoved called with " + snap.val ( ) ) ; // Log moved child
        } ,

        _childChanged : function ( snap ) {
            var model = snap.val ( ) ; // Get the changed model data
            var item = _.find ( this.models , function ( child ) {
                return child.id == model.id ; // Find the corresponding local model
            } ) ;
            if ( ! item ) {
                // TODO: Investigate: what is the right way to handle this case?
                throw new Error ( "Could not find model with ID " + model.id ) ; // Error if model not found
            }
            item.set ( model ) ; // Update the local model's attributes
        } ,

        _childRemoved : function ( snap ) {
            Backbone.Collection.prototype.remove.apply ( this , [ snap.val ( ) ] ) ; // Remove the child from the collection
        }
    } ) ;

    /*
     * Custom Firebase Model definition.
     * Extends Backbone.Model.
     */
    Backbone.Firebase.Model = Backbone.Model.extend ( {
        save : function ( ) {
            this._log ( "Save called on a Firebase model, ignoring." ) ; // Save is handled by _updateModel
        } ,

        destroy : function ( options ) {
            // TODO: Fix naive success callback. Add error callback.
            this.firebase.set ( null , this._log ) ; // Set Firebase ref to null to delete
            this.trigger ( 'destroy' , this , this.collection , options ) ; // Trigger destroy event
            if ( options.success ) {
                options.success ( this , null , options ) ; // Call success callback if provided
            }
        } ,

        /* Constructor for the Firebase Model */
        constructor : function ( model , options ) {

            // Apply parent constructor (this will also call initialize).
            Backbone.Model.apply ( this , arguments ) ;

            if ( options && options.firebase ) {
                this.firebase = options.firebase ; // Set firebase from options
            }
            switch ( typeof this.firebase ) {
                case "object" :
                    break ; // Already an object
                case "string" :
                    this.firebase = new Firebase ( this.firebase ) ;
                    break ; // Create Firebase instance from string
                case "function" :
                    this.firebase = this.firebase ( ) ;
                    break ; // Execute function to get Firebase instance
                default :
                    throw new Error ( "Invalid firebase reference created" ) ; // Error for invalid reference
            }

            // Add handlers for remote events.
            this.firebase.on ( "value" , this._modelChanged.bind ( this ) ) ; // Listen for value changes

            this.on ( "change" , this._updateModel , this ) ; // Listen for local changes to update Firebase
        } ,

        _updateModel : function ( model , options ) {
            /* Find the deleted keys and set their values to null
             * so Firebase properly deletes them from the remote database.
             */
            var modelObj = model.toJSON ( ) ;
            _.each ( model.changed , function ( value , key ) {
                if ( typeof value === "undefined" || value === null )
                    modelObj [ key ] = null ;
            } ) ;
            this.firebase.update ( modelObj , this._log ) ; // Update Firebase with changed attributes
        } ,

        _modelChanged : function ( snap ) {
            /* Unset attributes that have been deleted from the server
             * by comparing the keys that have been removed locally.
             */
            var newModel = snap.val ( ) ; // Get the new model data
            if ( typeof newModel === "object" && newModel !== null ) {
                var diff = _.difference ( _.keys ( this.attributes ) , _.keys ( newModel ) ) ; // Find keys removed from server
                var _this = this ;
                _.each ( diff , function ( key ) {
                    _this.unset ( key ) ; // Unset locally removed attributes
                } ) ;
            }
            this.set ( newModel ) ; // Set new attributes on the local model
            this.trigger ( 'sync' , this , null , null ) ; // Trigger a sync event
        } ,

        _log : function ( msg ) {
            if ( typeof msg === "undefined" || msg === null )
                return ; // Do nothing if message is undefined or null
            if ( console && console.log ) {
                console.log ( msg ) ; // Log message if console is available
            }
        }

    } ) ;

} ) ( ) ;