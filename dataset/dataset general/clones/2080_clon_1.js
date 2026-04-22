/*
 * This JavaScript file defines the 'keyval' constructor function.
 * It implements a simple key-value store that also maintains
 * insertion order using a doubly linked list structure internally.
 *
 * This is a Type I code clone, meaning its functionality and
 * internal logic are exactly preserved. Only whitespace and
 * comments have been altered significantly to achieve visual
 * distinction without any behavioral changes.
 */

function keyval( )
{
    "use strict" ; // Enforces stricter parsing and error handling in the code.

    // --- Private Internal Variables ---
    // These variables manage the linked list structure.
    var _head,  // Reference to the first node in the list.
        _tail,  // Reference to the last node in the list.
        _pos;   // Current position for the iterator.

    // A hash map to quickly access nodes by their key.
    var _keys = { } ;

    // Public property: tracks the number of items currently in the list.
    this.len = 0 ;


    // --- Public Methods ---

    /**
     * Sets a key-value pair in the store.
     * If the key already exists, the operation is skipped (no update or re-insertion).
     *
     * @param {string} k - The key to associate with the value.
     * @param {*} v - The value to store.
     */
    this.set = function ( k, v )
    {
        // Check if the key does not already exist in our key map.
        if ( ! _keys[k] )
        {
            // Create a new node object. 'v' holds the actual value.
            // 'p' and 'n' will hold references to previous and next nodes respectively.
            var node = { v : v } ;

            // If the list is currently empty, this new node becomes both head and tail.
            if ( this.len === 0 )
            {
                _head = _tail = node ; // The first node is also the last.
                this.rwd( ) ;          // Rewind the iterator to the start of this new list.
            }
            else
            {
                // If the list is not empty, append the new node to the end.
                node.p = _tail ;    // The new node's previous pointer points to the current tail.
                _tail.n = node ;    // The current tail's next pointer points to the new node.
                _tail = node ;      // Update the list's tail to be the new node.
            }

            // Store a reference to the newly created node in the _keys map.
            _keys[k] = node ;

            // Increment the length of the list.
            this.len ++ ;
        }
    } ; // End of 'set' method.


    /**
     * Deletes a key-value pair from the store.
     *
     * @param {string} k - The key of the item to delete.
     * @returns {*} The value of the deleted item, or undefined if the key was not found.
     */
    this.del = function ( k )
    {
        var v ; // Variable to temporarily hold the value of the node being deleted.

        // Retrieve the node associated with the given key.
        var node = _keys[k] ;

        // Proceed only if a node was found for the key.
        if ( node )
        {
            v = node.v ; // Store the value before the node is removed.

            // Adjust pointers of the neighboring nodes to bypass the current node.
            // If the node has a previous node, link its 'next' pointer to the current node's 'next'.
            if ( node.p ) {
                node.p.n = node.n ;
            }

            // If the node has a next node, link its 'previous' pointer to the current node's 'previous'.
            if ( node.n ) {
                node.n.p = node.p ;
            }

            /*
             * Important: The original implementation does not explicitly update _head or _tail
             * if the deleted node happens to be _head or _tail.
             * This specific behavior (or lack thereof) is preserved for a Type I clone.
             * For example, if _head is deleted, _head still points to the old node.
             * Accessing _head.n would then retrieve the new head.
             */

            // Remove the node reference from the _keys map.
            _keys[k] = null ;

            // Decrement the length of the list.
            this.len -- ;
        }

        return v ; // Return the value of the deleted item.
    } ; // End of 'del' method.


    /**
     * Retrieves a node by its key.
     *
     * @param {string} k - The key of the node to retrieve.
     * @returns {object|undefined} The node object if found, otherwise undefined.
     */
    this.get = function ( k )
    {
        return _keys[k] ; // Directly return the node reference from the _keys map.
    } ; // End of 'get' method.


    /**
     * Advances the internal iterator to the next node.
     *
     * @returns {object|undefined} The next node, or undefined if at the end of the list.
     */
    this.itr = function ( )
    {
        // Move _pos to its next node and return the new _pos.
        // The _pos object itself holds a 'n' property which points to the actual list node.
        return _pos = _pos.n ;
    } ; // End of 'itr' method.


    /**
     * Rewinds the internal iterator to the beginning of the list.
     */
    this.rwd = function ( )
    {
        // _pos is an object whose 'n' property points to the actual current node.
        // To rewind, we make _pos.n point to the head of the list.
        _pos = { n : _head } ;
    } ; // End of 'rwd' method.


    /**
     * Clears all key-value pairs from the store, effectively making it empty.
     */
    this.empty = function ( )
    {
        _keys = { } ;                   // Reset the key map to an empty object.
        _head = _tail = _pos = null ;   // Clear all references to list nodes and the iterator.
        this.len = 0 ;                  // Reset the length to zero.
    } ; // End of 'empty' method.

} // End of 'keyval' constructor function.