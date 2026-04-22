( function ( context ) {

  // Enforcing strict mode for cleaner code and fewer errors.
  'use strict' ;

  // ----------------------------------------------------------------------------------------------------
  //
  //     FastList Class Definition
  //
  //     This data structure is a doubly linked list with O(1) access time for
  //     any element, provided its key is known.
  //     It relies on the Node Constructor defined further below.
  //     It also utilizes the getUUID function for generating unique keys if not provided.
  //
  // ----------------------------------------------------------------------------------------------------

  var FastList    =   function ( )
  {
    // Initialize an empty list instance.
    this . head      =   null    ; // Reference to the first node in the list.
    this . tail      =   null    ; // Reference to the last node in the list.
    this . length    =   0       ; // Current number of elements in the list.
    this . listIndex =   { }     ; // A hash map to store nodes, keyed by their unique identifier.

  } ; // End of FastList constructor.

  // ----------------------------------------------------------------------------------------------------
  //
  //     Prototype Methods for FastList
  //
  // ----------------------------------------------------------------------------------------------------

  // Private helper method: Ensures a node exists for the given key.
  FastList . prototype . _mustFind = function ( keyAt )
  {

    var   node =   this . listIndex [ keyAt ] ; // Attempt to retrieve the node.

    if (   node   )
    {
        return   node   ; // Node found, return it.
    }

    // If no node is found, throw an error.
    throw new Error ( keyAt + ' does not reference an existing node. Create a node with this key first using an add method' ) ;

  } ; // End of _mustFind.

  // Private helper method: Ensures no node exists for the given key.
  FastList . prototype . _mustNotFind = function ( keyAt )
  {

    // Check if a node with this key already exists.
    if (   this . listIndex [ keyAt ]   )
    {
        throw new Error ( keyAt + ' already refers to an existing node. Use \'set\' to update an existing node or make sure to pass in a unique key.' ) ;
    }

  } ; // End of _mustNotFind.

  // Private helper method: Adds a new node to the list's internal structure.
  FastList . prototype . _add = function ( val ,   key )
  {

    // Generate a UUID if no key is provided.
    key   = key   ||   getUUID ( ) ;

    try
    {
      this . _mustNotFind ( key ) ; // Ensure the key is unique before adding.

      var newNode =   new Node ( {
        value : val , // The actual data stored in the node.
        key   : key   // The unique identifier for this node.
      } ) ;

      this . listIndex [ key ] = newNode ; // Store the new node in the lookup index.
      this . length ++ ; // Increment the list's length.

      return   newNode ; // Return the newly created node.
    }

    catch ( e ) // Catch any errors (e.g., duplicate key).
    {
      throw   e ; // Re-throw the error to be handled by the caller.
    }

  } ; // End of _add.

  // Private helper method: Adds the very first element to an empty list.
  FastList . prototype . _addFirst = function ( val ,   key )
  {

    // This method should only be called if the list is empty.
    if (   ! this . length   )
    {
        // Add the node and set it as both head and tail.
        this . head =   this . tail =   this . _add ( val ,   key ) ;
    }
    else
    {
        throw new Error ( 'List already has elements. Use add before/after instead' ) ;
    }

    return   this . head . __key__ ; // Return the key of the new head node.

  } ; // End of _addFirst.

  // Private helper method: Places a new node either before or after an existing node.
  FastList . prototype . _placeIn = function ( newNode ,   keyAt ,   placeAbove )
  {

    try
    {
      var   nodeAt =   this . _mustFind ( keyAt ) ; // Find the reference node.

      // Determine the properties for linking based on 'placeAbove'.
      var   placeAt    =   placeAbove ? 'parent' : 'next' ;
      var   relation   =   placeAbove ? 'next'   : 'parent' ;

      // Adjust links of the node at the insertion point.
      if (   nodeAt [ placeAt ]   )
      {
        newNode [ placeAt ] =   nodeAt [ placeAt ] ; // Link new node to nodeAt's current 'placeAt' neighbor.
        nodeAt [ placeAt ] [ relation ] =   newNode ; // Link nodeAt's current 'placeAt' neighbor back to new node.
      }

      newNode [ relation ] =   nodeAt ; // Link new node to nodeAt.
      nodeAt [ placeAt ]   =   newNode ; // Link nodeAt to new node.

      // Update head or tail if the insertion is at either end.
      if (   placeAbove &&   nodeAt === this . head   )
      {
          this . head =   newNode ;
      }
      else if (   ! placeAbove &&   nodeAt === this . tail   )
      {
          this . tail =   newNode ;
      }

    }

    catch ( e ) // Catch any errors from _mustFind.
    {
      throw   e ; // Re-throw the error.
    }

  } ; // End of _placeIn.

  // Public method: Adds a new node *before* a specified node.
  FastList . prototype . addBefore = function ( keyAt ,   val ,   key )
  {

    try
    {
      var newNode =   this . _add ( val ,   key ) ; // Create the new node.
      this . _placeIn ( newNode ,   keyAt ,   true ) ; // Place it before the target node.

      return   newNode . __key__ ; // Return the key of the newly added node.
    }

    catch ( e )
    {
      throw   e ;
    }

  } ; // End of addBefore.

  // Public method: Adds a new node *after* a specified node.
  FastList . prototype . addAfter = function ( keyAt ,   val ,   key )
  {

    try
    {
      var newNode =   this . _add ( val ,   key ) ; // Create the new node.
      this . _placeIn ( newNode ,   keyAt ,   false ) ; // Place it after the target node.

      return   newNode . __key__ ; // Return the key of the newly added node.
    }

    catch ( e )
    {
      throw   e ;
    }

  } ; // End of addAfter.

  // Public method: Adds a new node to the end of the list (tail).
  FastList . prototype . addToTail = function ( val ,   key )
  {

    // If the list is not empty, use addAfter the current tail.
    if (   this . head   )
    {
        return   this . addAfter ( this . tail . __key__ ,   val ,   key ) ;
    }

    // If the list is empty, this is the first element.
    return   this . _addFirst ( val ,   key ) ;

  } ; // End of addToTail.

  // Public method: Adds a new node to the beginning of the list (head).
  FastList . prototype . addToHead = function ( val ,   key )
  {

    // If the list is not empty, use addBefore the current head.
    if (   this . head   )
    {
        return   this . addBefore ( this . head . __key__ ,   val ,   key ) ;
    }

    // If the list is empty, this is the first element.
    return   this . _addFirst ( val ,   key ) ;

  } ; // End of addToHead.

  // Public method: Removes a node by its key.
  FastList . prototype . removeAt = function ( keyAt )
  {

    var   nodeAt =   this . listIndex [ keyAt ] ; // Find the node to remove.

    if (   nodeAt   )
    {
      // Adjust the 'next' pointer of the parent node.
      if (   nodeAt . parent   )
      {
          nodeAt . parent . next =   nodeAt . next ;
      }
      else if (   this . head === nodeAt   ) // If it's the head node.
      {
          this . head =   nodeAt . next ;
      }

      // Adjust the 'parent' pointer of the next node.
      if (   nodeAt . next   )
      {
          nodeAt . next . parent =   nodeAt . parent ;
      }
      else if (   this . tail === nodeAt   ) // If it's the tail node.
      {
          this . tail =   nodeAt . parent ;
      }

      delete   this . listIndex [ keyAt ] ; // Remove the node from the lookup index.

      this . length -- ; // Decrement the list's length.

      return   nodeAt . value ; // Return the value of the removed node.
    }

    // If node not found, implicitly returns undefined.

  } ; // End of removeAt.

  // Public method: Removes the node at the head of the list.
  FastList . prototype . removeFromHead = function ( )
  {

    if (   this . head   )
    {
        return   this . removeAt ( this . head . __key__ ) ; // Use removeAt with the head's key.
    }
    return   null ; // Return null if the list is empty.

  } ; // End of removeFromHead.

  // Public method: Removes the node at the tail of the list.
  FastList . prototype . removeFromTail = function ( )
  {

    if (   this . tail   )
    {
        return   this . removeAt ( this . tail . __key__ ) ; // Use removeAt with the tail's key.
    }
    return   null ; // Return null if the list is empty.

  } ; // End of removeFromTail.

  // Public method: Retrieves the value of a node by its key.
  FastList . prototype . get = function ( keyAt )
  {

    var   node =   this . listIndex [ keyAt ] ; // Look up the node.

    if (   node   )
    {
        return   node . value ; // Return its value if found.
    }

    // If node not found, implicitly returns undefined.

  } ; // End of get.

  // Public method: Retrieves the value of the first node.
  FastList . prototype . first = function ( )
  {
    if (   this . length   )
    {
        return   this . get ( this . head . __key__ ) ; // Get value of the head node.
    }
  } ; // End of first.

  // Public method: Retrieves the value of the last node.
  FastList . prototype . last = function ( )
  {
    if (   this . length   )
    {
        return   this . get ( this . tail . __key__ ) ; // Get value of the tail node.
    }
  } ; // End of last.

  // Public method: Updates the value of an existing node.
  FastList . prototype . set = function ( keyAt ,   val )
  {

    try
    {
      var   node =   this . _mustFind ( keyAt ) ; // Find the node to update.
      node . value =   val ; // Update its value.
    }

    catch ( e ) // Catch error if node is not found.
    {
      throw   e ; // Re-throw the error.
    }

  } ; // End of set.

  // ----------------------------------------------------------------------------------------------------
  //
  //     Convenience Methods (Iteration and Sorting)
  //
  // ----------------------------------------------------------------------------------------------------

  // Public method: Iterates over each node in the list.
  FastList . prototype . forEach = FastList . prototype . each = function ( cb )
  {

    for (   var node =   this . head ;   node ;   node =   node . next   )
    {
      cb (   node . value ,   node . __key__ ,   this   ) ; // Execute callback for each node.
    }

  } ; // End of forEach/each.

  // Default comparison function for sorting.
  function   defaultSort ( a ,   b )
  {
    if (   a === null   ) a =   'null' ; // Handle null values for comparison.
    if (   b === null   ) b =   'null' ;
    return   a . toString ( ) <   b . toString ( ) ?   -1 :   1 ; // Compare as strings.
  } // End of defaultSort.

  // Public method: Sorts the list using insertion sort.
  FastList . prototype . sort = function ( sortFn )
  {

    sortFn =   sortFn   ||   defaultSort ; // Use default sort if none provided.

    for (   var node =   this . head ;   node ;   node =   node . next   )
    {
      var   oldParent =   node . parent ; // Keep track of the node's parent before potentially moving it.

      while (   oldParent &&   sortFn ( node . value ,   oldParent . value ) <   0   )
      {
        // Adjust links to remove 'node' from its current position.
        oldParent . next =   node . next ; // oldParent's next points past 'node'.
        node . parent =   oldParent . parent ; // 'node's new parent is oldParent's parent.

        // Update head if 'oldParent' was the head.
        if (   oldParent === this . head   )
        {
            this . head =   node ;
        }
        else
        {
            oldParent . parent . next =   node ; // Link oldParent's old parent to 'node'.
        }

        // Update tail if 'node' was the tail.
        if (   node === this . tail   )
        {
            this . tail =   oldParent ;
        }
        else
        {
            node . next . parent =   oldParent ; // Link node's old next to 'oldParent'.
        }

        // Re-insert 'node' before 'oldParent'.
        oldParent . parent =   node ; // 'oldParent's new parent is 'node'.
        node . next =   oldParent ; // 'node's new next is 'oldParent'.

        oldParent =   node . parent ; // Continue comparing 'node' with its new parent.
      }
    }
  } ; // End of sort.

  // ----------------------------------------------------------------------------------------------------
  //
  //     List Node Constructor
  //     Used internally by FastList to create individual nodes.
  //
  // ----------------------------------------------------------------------------------------------------

  function   Node ( node )
  {
    // Initialize node properties.
    this . value   =   node . value ;   // The actual data held by the node.
    this . next    =   node . next   ||   null ; // Reference to the next node in the list.
    this . parent  =   node . parent ||   null ; // Reference to the previous node in the list.
    this . __key__ =   node . key ;     // The unique key for this node.

  } // End of Node constructor.

  // Expose FastList to the global context (e.g., window in browsers, or exports in Node.js).
  context . FastList =   FastList ;

  // ----------------------------------------------------------------------------------------------------
  //
  //     getUUID Function
  //     Generates a simple unique identifier.
  //
  // ----------------------------------------------------------------------------------------------------

  function   getUUID ( )
  {

    var   d =   new Date ( ) . getTime ( ) ; // Get current timestamp.

    // Replace placeholders with random hexadecimal digits.
    var   uuid =   'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' . replace ( / [xy] / g ,   function ( c )
    {
        var   r =   ( d +   Math . random ( ) *   16 ) %   16   |   0 ; // Generate random digit.
        d =   Math . floor ( d /   16 ) ; // Update timestamp for next digit.
        return   ( c == 'x' ?   r :   ( r &   0x3 |   0x8 ) ) . toString ( 16 ) ; // Convert to hex.
    } ) ;

    return   uuid ; // Return the generated UUID.

  } // End of getUUID.

} ) ( window ) ; // Execute the IIFE, passing 'window' as the context.