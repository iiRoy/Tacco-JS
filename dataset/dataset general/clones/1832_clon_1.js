/*
 * This file is part of a larger project and is licensed under the MIT License (MIT).
 * Please refer to the project's main license file for full details.
 */

var VirtualCollection = Backbone.VirtualCollection = Backbone.Collection.extend(
{

	  constructor :  function ( collection , options ) { // Main constructor for the VirtualCollection
		options = options || {};  // Ensure options object is initialized
		this.collection = collection; // Store the original Backbone collection

		// Check for specific options and apply them
		if  ( options.comparator !== undefined ) { this.comparator = options.comparator; }
		if  ( options.close_with ) { this.bindLifecycle ( options.close_with , 'close' ) ; /* For older Marionette versions (v1.x) */ }
		if  ( options.destroy_with ) { this.bindLifecycle ( options.destroy_with , 'destroy' ) ; /* For newer Marionette versions (v2.x) */ }
		if  ( !this.model ) { this.model = collection.model; } // Inherit model if not explicitly set

		this.accepts = VirtualCollection.buildFilter( options.filter ); // Build the filter function
		this._rebuildIndex(); // Initialize the internal index of accepted models

		// Listen to essential events from the parent collection
		this.listenTo ( this.collection , 'add'    , this._onAdd    ) ;
		this.listenTo ( this.collection , 'remove' , this._onRemove ) ;
		this.listenTo ( this.collection , 'change' , this._onChange ) ;
		this.listenTo ( this.collection , 'reset'  , this._onReset  ) ;
		this.listenTo ( this.collection , 'sort'   , this._onSort   ) ;

		this._proxyParentEvents ( [ 'sync' , 'request' , 'error' ] ) ; // Proxy specific events

		this.initialize.apply( this , arguments ) ; // Call Backbone's initialize method
	} ,

	/* This method handles binding lifecycle events from a Marionette view. */
	bindLifecycle :  function ( view , method_name ) {
		view.on ( method_name , _.bind ( this.stopListening , this ) ) ; // Binds the stopListening method to the view's lifecycle event.
	} ,

	updateFilter :  function ( filter ) {
		this.accepts = VirtualCollection.buildFilter ( filter ) ; // Re-build the filter function based on the new filter criteria.
		this._rebuildIndex ( ) ; // Re-index the collection to apply the new filter.
		this.trigger ( 'filter' , this , filter ) ; // Trigger a custom 'filter' event.
		this.trigger ( 'reset'  , this , filter ) ; // Trigger a 'reset' event after filter update.
		return this; // Allow for chaining.
	} ,

	_rebuildIndex :  function ( ) {
		// First, unbind all previous 'all' event listeners from models.
		_.invoke ( this.models , 'off' , 'all' , this._onAllEvent , this ) ;

		this._reset ( ) ; // Reset the internal state of the virtual collection.

		// Iterate over the parent collection to determine which models are accepted by the filter.
		this.collection.each (
			function ( model , i ) {
				// If the model passes the acceptance filter:
				if  ( this.accepts ( model , i ) ) {
					model.on ( 'all' , this._onAllEvent , this ) ; // Bind the 'all' event for accepted models.
					this.models.push ( model ) ; // Add the model to the virtual collection's internal models array.
					this._byId [ model.cid ] = model ; // Store by client ID.
					if  ( model.id ) { this._byId [ model.id ] = model ; } // Store by regular ID if available.
				}
			} ,
			this // Ensure 'this' context is maintained within the each loop.
		) ;

		this.length = this.models.length ; // Update the length property.

		// If a comparator is set, sort the collection silently after rebuilding the index.
		if  ( this.comparator ) { this.sort ( { silent : true } ) ; }
	} ,

	orderViaParent :  function ( options ) {
		// Re-order models based on the parent collection's order, but only include models present in this virtual collection.
		this.models = this.collection.filter (
			function ( model ) {
				return ( this._byId [ model.cid ] !== undefined ) ; // Only keep models that are currently in our index.
			} ,
			this // Maintain context.
		) ;

		// Trigger a 'sort' event if not explicitly silenced.
		if  ( !options.silent ) { this.trigger ( 'sort' , this , options ) ; }
	} ,

	_onSort :  function ( collection , options ) {
		// If a custom comparator is defined for this virtual collection, then the parent sort is irrelevant.
		if  ( this.comparator !== undefined ) { return ; }

		this.orderViaParent ( options ) ; // Otherwise, reflect the parent collection's sort order.
	} ,

	_proxyParentEvents :  function ( events ) {
		// Iterate through the list of event names to proxy.
		_.each (
			events ,
			function ( eventName ) {
				// For each event, listen to it on the parent collection and re-trigger it on this virtual collection.
				this.listenTo ( this.collection , eventName , _.partial ( this.trigger , eventName ) ) ;
			} ,
			this // Ensure correct 'this' context.
		) ;
	} ,

	_onAdd :  function ( model , collection , options ) {
		// Check if the model is already part of this virtual collection.
		var already_here = this.get ( model ) ;

		// If the model is not already here AND it passes the filter:
		if  ( !already_here && this.accepts ( model , options.index ) ) {
			this._indexAdd ( model ) ; // Add the model to the virtual collection's index.
			model.on ( 'all' , this._onAllEvent , this ) ; // Start listening to all events from the new model.
			this.trigger ( 'add' , model , this , options ) ; // Trigger an 'add' event for the virtual collection.
		}
	} ,

	_onRemove :  function ( model , collection , options ) {
		// If the model is not found in this virtual collection, there's nothing to do.
		if  ( !this.get ( model ) ) { return ; }

		var i = this._indexRemove ( model ) ; // Remove the model from our internal index and get its former position.
		var options_clone = _.clone ( options ) ; // Clone options to modify the index.
		options_clone.index = i ; // Set the index in the cloned options.

		model.off ( 'all' , this._onAllEvent , this ) ; // Stop listening to events from the removed model.
		this.trigger ( 'remove' , model , this , options_clone ) ; // Trigger a 'remove' event.
	} ,

	_onChange :  function ( model , options ) {
		// Guard against invalid arguments, which can happen with custom events.
		if  ( !model || !options ) { return ; }

		var already_here = this.get ( model ) ; // Check if the model is currently in this virtual collection.

		// Case 1: Model is accepted by the filter after the change.
		if  ( this.accepts ( model , options.index ) ) {
			// Subcase 1a: Model was already in the virtual collection.
			if  ( already_here ) {
				this.trigger ( 'change' , model , this , options ) ; // Just trigger a 'change' event.
			}
			// Subcase 1b: Model was NOT in the virtual collection (but now is accepted).
			else {
				this._indexAdd ( model ) ; // Add it to the index.
				this.trigger ( 'add' , model , this , options ) ; // Trigger an 'add' event.
			}
		}
		// Case 2: Model is NOT accepted by the filter after the change.
		else {
			// Subcase 2a: Model WAS in the virtual collection before the change.
			if  ( already_here ) {
				var i = this._indexRemove ( model ) ; // Remove it from the index.
				var options_clone = _.clone ( options ) ; // Prepare options for the 'remove' event.
				options_clone.index = i ; // Set the index.
				this.trigger ( 'remove' , model , this , options_clone ) ; // Trigger a 'remove' event.
			}
			// Subcase 2b: Model was NOT here and is still not accepted (do nothing).
		}
	} ,

	_onReset :  function ( collection , options ) {
		this._rebuildIndex ( ) ; // Rebuild the entire index when the parent collection resets.
		this.trigger ( 'reset' , this , options ) ; // Propagate the 'reset' event.
	} ,

	sortedIndex :  function ( model , value , context ) {
		// Determine the iterator function based on whether 'value' is a function or a property name.
		var iterator = _.isFunction ( value ) ? value : function ( target ) {
			return target.get ( value ) ; // If 'value' is a string, get that attribute from the model.
		} ;

		// Use Underscore's sortedIndex if the iterator expects one argument.
		if  ( iterator.length == 1 ) {
			return _.sortedIndex ( this.models , model , iterator , context ) ;
		}
		// Otherwise, use our custom 'sortedIndexTwo' for comparators expecting two arguments.
		else {
			return sortedIndexTwo ( this.models , model , iterator , context ) ;
		}
	} ,

	_indexAdd :  function ( model ) {
		// Prevent adding a model that is already present in the virtual collection.
		if  ( this.get ( model ) ) { return ; }

		var i ; // Declare index variable.

		// Use a binary search to find the correct insertion point to maintain sorted order.
		if  ( this.comparator ) {
			i = this.sortedIndex ( model , this.comparator , this ) ; // Use the custom comparator.
		}
		// If no custom comparator is set, but the collection is implicitly ordered (e.g., by parent index).
		else if  ( this.comparator === undefined ) {
			i = this.sortedIndex ( model , function ( target ) {
				// WARNING: This approach might be inefficient as indexOf is O(n) for each comparison.
				return this.collection.indexOf ( target ) ;
			} , this ) ;
		}
		// If no specific ordering, simply append to the end.
		else {
			i = this.length ;
		}

		this.models.splice ( i , 0 , model ) ; // Insert the model at the calculated index.
		this._byId [ model.cid ] = model ; // Add to internal ID lookup by client ID.
		if  ( model.id ) { this._byId [ model.id ] = model ; } // Add to internal ID lookup by regular ID if available.
		this.length += 1 ; // Increment the length of the virtual collection.
	} ,

	_indexRemove :  function ( model ) {
		// Stop listening to all events from the model before removing it.
		model.off ( 'all' , this._onAllEvent , this ) ;

		var i = this.indexOf ( model ) ; // Find the current index of the model.
		if  ( i === -1 ) { return i ; } // If not found, return -1.

		this.models.splice ( i , 1 ) ; // Remove the model from the internal array.
		delete this._byId [ model.cid ] ; // Remove from client ID lookup.
		if  ( model.id ) { delete this._byId [ model.id ] ; } // Remove from regular ID lookup if present.
		this.length -= 1 ; // Decrement the length.
		return i ; // Return the index where the model was removed.
	} ,

	_onAllEvent :  function ( eventName ) {
		// Define events that are handled explicitly by other methods (e.g., _onAdd, _onRemove, etc.).
		var explicitlyHandledEvents = [ 'add' , 'remove' , 'change' , 'reset' , 'sort' ] ;

		// If the event is not one of the explicitly handled ones, re-trigger it from the virtual collection.
		if  ( !_.contains ( explicitlyHandledEvents , eventName ) ) {
			this.trigger.apply ( this , arguments ) ; // Pass all arguments to the trigger function.
		}
	} ,

	clone :  function ( ) {
		// Create a new instance of the parent collection's constructor, initialized with the current models of this virtual collection.
		return new this.collection.constructor ( this.models ) ;
	}

} ,
{ // Static properties and methods for VirtualCollection itself.

	/**
	 * Helper function to build a filter predicate.
	 * Can accept null/undefined (no filter), a function, or an object (attribute matching).
	 * @param {Function|Object|null} options - The filter criteria.
	 * @returns {Function} A predicate function that takes a model and returns true if it passes the filter.
	 */
	buildFilter :  function ( options ) {
		// Case 1: No filter provided, so all models are accepted.
		if  ( !options ) {
			return function ( ) {
				return true ; // Always return true.
			} ;
		}
		// Case 2: A function is provided, use it directly as the filter.
		else if  ( _.isFunction ( options ) ) {
			return options ;
		}
		// Case 3: An object is provided, create a filter that matches model attributes.
		else if  ( options.constructor === Object ) {
			return function ( model ) {
				// Iterate through the keys of the options object.
				// If any model attribute does not match the corresponding option value, the model fails the filter.
				return !Boolean (
					_ ( _.keys ( options ) ).detect (
						function ( key ) {
							return model.get ( key ) !== options [ key ] ; // Check for mismatch.
						}
					)
				) ;
			} ;
		}
		// Default case (should ideally not be reached if inputs are well-defined).
	}
} ) ;

// A list of methods that modify the collection's data.
// These methods should not operate directly on the virtual collection but instead proxy their calls
// to the underlying parent collection to maintain data integrity.
_.each (
	[ 'add' , 'remove' , 'set' , 'reset' , 'push' , 'pop' , 'unshift' , 'shift' , 'slice' , 'sync' , 'fetch' ] ,
	function ( method_name ) {
		// Assign a proxy function to the prototype of VirtualCollection for each listed method.
		VirtualCollection.prototype [ method_name ] = function ( ) {
			// Call the corresponding method on the *parent* collection, passing all arguments.
			return this.collection [ method_name ].apply ( this.collection , _.toArray ( arguments ) ) ;
		} ;
	}
) ;

/*
 * This function provides a custom sortedIndex implementation.
 * It is specifically designed for iterators (comparators) that expect two arguments,
 * unlike the standard Underscore.js `_.sortedIndex` which expects a single-argument iterator.
 *
 * @param {Array} array - The array to search within.
 * @param {*} obj - The object to insert into the array.
 * @param {Function} iterator - The comparison function (takes two arguments: obj1, obj2).
 * @param {*} [context] - The context ('this' value) for the iterator.
 * @returns {number} The index at which the object should be inserted to maintain sort order.
 */
function sortedIndexTwo ( array , obj , iterator , context ) {
	var low = 0 , high = array.length ; // Initialize low and high pointers for binary search.

	// Perform a binary search.
	while ( low < high ) {
		var mid = ( low + high ) >>> 1 ; // Calculate the middle index (bitwise right shift for floor division).

		// Call the iterator with the provided context and compare the object with the middle element.
		// If iterator.call(context, obj, array[mid]) > 0, it means obj is "greater" than array[mid],
		// so we search in the upper half. Otherwise, we search in the lower half.
		iterator.call ( context , obj , array [ mid ] ) > 0 ? ( low = mid + 1 ) : ( high = mid ) ;
	}

	return low ; // 'low' will be the correct insertion point.
}

// Extend the VirtualCollection's prototype with Backbone.Events.
// This grants the VirtualCollection instances the ability to trigger and listen to custom events.
_.extend ( VirtualCollection.prototype , Backbone.Events ) ;