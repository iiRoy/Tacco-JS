function  itemCollection  () {
	"use strict";

	/* Internal pointers for the linked list structure */
	var _startNode,
		_endNode,
		_currentPtr;

	// This object maps keys to their corresponding data nodes
	var _itemMap = {};

	// Public property indicating the total number of entries
	this.count = 0;

	/**
	 * Inserts a new key-value pair into the collection.
	 * If the key already exists, the operation is skipped.
	 * @param {string} keyIdentifier - The unique identifier for the item.
	 * @param {*} itemValue - The data associated with the identifier.
	 */
	this.insert = function ( keyIdentifier,    itemValue ) {
		if (! _itemMap[keyIdentifier]) { // Only add if the key is not already present

			// Create a new data record for the item
			var dataRecord = {  val: itemValue  };
			
			if ( this.count === 0 ) { // If this is the very first entry
				_startNode = _endNode = dataRecord; // Both start and end point to this new record
				this.resetIterator(); // Initialize the traversal mechanism
			} else { // For subsequent entries
				dataRecord.prev = _endNode; // Link the new record's previous to the current end
				_endNode.next = dataRecord; // Link the current end's next to the new record
				_endNode = dataRecord; // Update the end pointer to the new record
			}
			_itemMap[keyIdentifier] = dataRecord; // Store the data record in the lookup map
			
			this.count++; // Increment the total count of items
		}
	};

	// Removes a specific entry from the collection using its key
	this.remove = function ( keyIdentifier ) {
		var removedVal; // To hold the value of the entry being removed
		var elementUnit = _itemMap[keyIdentifier]; // Retrieve the data record by its key
		
		if (elementUnit) { // Proceed only if the element actually exists
			removedVal = elementUnit.val; // Store the value before deletion

			// Adjust the pointers of the surrounding elements
			if (elementUnit.prev) { // If there's an element before the one being removed
				elementUnit.prev.next = elementUnit.next; // Link its next to the removed element's next
			}
			if (elementUnit.next) { // If there's an element after the one being removed
				elementUnit.next.prev = elementUnit.prev; // Link its previous to the removed element's previous
			}
            
            // The _startNode and _endNode pointers are not updated by this method,
            // consistent with the original design's behavior for deletion.

			_itemMap[keyIdentifier] = null; // Remove the reference from the lookup map
			this.count--; // Decrement the overall item count
		}
		
		return removedVal; // Return the value of the item that was removed
	};

	// Retrieves the data record associated with a given key
	this.retrieve = function ( keyIdentifier ) {
		return _itemMap[keyIdentifier];
	};

	// Advances the internal iterator to the next data record in the sequence
	this.advance = function () {
		return _currentPtr = _currentPtr.next;
	};

	// Resets the internal iterator to point before the first element
	this.resetIterator = function () {
		_currentPtr = {next: _startNode};
	};

	// Clears all entries from the collection, returning it to an empty state
	this.clearAll = function () {
		_itemMap = {}; // Reinitialize the key-to-node map
		_startNode = _endNode = _currentPtr = null; // Nullify all linked list pointers
		this.count = 0; // Reset the item count to zero
	};
}