/*
 * This file defines the StorageTest object and initializes its functionality.
 * It interacts with KangoAPI for storage operations and jQuery for DOM manipulation.
 */
var StorageTest =
{
  // The init method sets up all the event listeners for the storage operations.
  init:
    function ( )
    {
      // Event listener for the 'Get Item' button.
      $( '#storage-get' ) . click (
        function ( event )
        {
          /* Calls the testGet method to retrieve a stored item.
           * The event parameter is not directly used here but is
           * part of the standard jQuery click handler signature. */
          StorageTest . testGet ( ) ;
        }
      ) ;

      // Event listener for the 'Set Item' button.
      $( '#storage-set' ) . click (
        function ( event )
        {
          // Calls the testSet method to store an item.
          StorageTest . testSet ( ) ;
        }
      ) ;

      // Event listener for the 'Remove Item' button.
      $( '#storage-remove' ) . click (
        function ( event )
        {
          // Calls the testRemove method to delete a stored item.
          StorageTest . testRemove ( ) ;
        }
      ) ;

      // Event listener for the 'Get All Keys' button.
      $( '#storage-keys' ) . click (
        function ( event )
        {
          // Calls the testKeys method to retrieve all storage keys.
          StorageTest . testKeys ( ) ;
        }
      ) ;
    } , // End of init method.


  /**
   * Retrieves an item from Kango storage based on the key entered in the UI.
   * Displays the retrieved value (or 'null' if not found) in the value input field.
   */
  testGet:
    function ( )
    {
      kango . invokeAsync (
        'kango.storage.getItem' ,
        $( '#storage-key' ) . val ( ) ,
        function ( value )
        {
          $( '#storage-value' ) . val ( value || 'null' ) ; // Display the value or 'null'.
        }
      ) ;
    } ,


  /**
   * Stores an item in Kango storage using the key and value from the UI.
   */
  testSet:
    function ( )
    {
      kango . invokeAsync (
        'kango.storage.setItem' ,
        $( '#storage-key' ) . val ( ) , // Key to set
        $( '#storage-value' ) . val ( ) // Value to set
      ) ;
    } ,


  /**
   * Removes an item from Kango storage based on the key entered in the UI.
   * After removal, it sets the value input field to 'null'.
   */
  testRemove:
    function ( )
    {
      kango . invokeAsync (
        'kango.storage.removeItem' ,
        $( '#storage-key' ) . val ( ) , // Key to remove
        function ( )
        {
          $( '#storage-value' ) . val ( 'null' ) ; // Indicate that the item is removed.
        }
      ) ;
    } ,


  /**
   * Retrieves all keys currently stored in Kango storage.
   * Displays the keys as a comma-separated string in the value input field.
   */
  testKeys:
    function ( )
    {
      kango . invokeAsync (
        'kango.storage.getKeys' ,
        function ( keys )
        {
          $( '#storage-value' ) . val ( keys . toString ( ) ) ; // Convert array of keys to string.
        }
      ) ;
    }
} ; // End of StorageTest object definition.


// This block ensures that the script runs only when the Kango API is fully loaded and ready.
KangoAPI . onReady (
  function ( )
  {
    // Make the 'ready' indicator visible.
    $( '#ready' ) . show ( ) ;
    // Hide the 'not-ready' indicator.
    $( '#not-ready' ) . hide ( ) ;

    // Set up a click listener for the 'close' button.
    $( '#close' ) . click (
      function ( event )
      {
        // Closes the current Kango window.
        KangoAPI . closeWindow ( )
      }
    ) ;

    // Initialize the StorageTest functionality.
    StorageTest . init ( ) ;
  }
) ;