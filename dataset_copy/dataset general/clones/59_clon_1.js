angular . module ( 'caco.MiniRSS.FeedList' , [ 'caco.LocalObjectStorage' ] )
    /*
     * This service handles the management of RSS feed lists.
     * It relies on LocalObjectStorage for persistence.
     */
  .service( 'FeedList' , function ( $rootScope , LocalObjectStorage )
  {
    // Method to add a new feed to the list.
    this.add = function ( url , title )
    {
      // Retrieve the current list of feeds.
      var list = this . get ( ) ;

      // Determine the next available ID for the new feed.
      // If 'FeedListId' exists in localStorage, use it; otherwise, start from 1.
      var id = localStorage . getItem ( 'FeedListId' )
        ? localStorage . getItem ( 'FeedListId' )
        : 1 ;

      // Add the new feed object to the list.
      list . push ( {
          url   : url ,   // The URL of the RSS feed.
          title : title , // The title of the RSS feed.
          id    : id      // A unique identifier for the feed.
      } ) ;

      // Persist the updated feed list to local storage.
      LocalObjectStorage . setObject ( 'FeedList' , list ) ;

      // Increment and store the next available ID.
      localStorage . setItem ( 'FeedListId' , ++id ) ;

      // Broadcast an event to notify listeners of the feed list change.
      $rootScope . $broadcast ( 'FeedList' , list ) ;
    } ; /* End of add method */


    /*
     * Method to delete a feed from the list by its ID.
     * @param {number} id - The ID of the feed to be deleted.
     */
    this . delete = function ( id )
    {
      // Get the current list of feeds.
      var list = this . get ( ) ;

      // Iterate through the list in reverse to safely remove items.
      for ( var i = list . length - 1 ; i >= 0 ; i-- )
      {
        // Check if the current feed's ID matches the target ID.
        if ( list [ i ] . id == id )
        {
          // Remove the feed from the array.
          list . splice ( i , 1 ) ;
        }
      }

      // Save the modified list back to local storage.
      LocalObjectStorage . setObject ( 'FeedList' , list ) ;

      // Broadcast the updated list.
      $rootScope . $broadcast ( 'FeedList' , list ) ;
    } ; /* End of delete method */


    // Retrieves the entire list of feeds.
    this . get = function ( )
    {
      // Check if the 'FeedList' object exists in local storage.
      if ( LocalObjectStorage . contains ( 'FeedList' ) )
      {
        // If it exists, retrieve and return it.
        return LocalObjectStorage . getObject ( 'FeedList' ) ;
      }

      // If no feed list exists, return a new array with a default feed.
      return new Array ( {
        url   : 'http://cacodaemon.de/index.php?rss=1' ,
        title : 'Cacomania' ,
        id    : 0
      } ) ;
    } ; /* End of get method */


    // Retrieves a single feed by its ID.
    this . getById = function ( id )
    {
      var list = this . get ( ) ; // Fetch the complete feed list.

      // Loop backwards through the list to find the feed.
      for ( var i = list . length - 1 ; i >= 0 ; i-- )
      {
        // If the ID matches, return the feed object.
        if ( list [ i ] . id == id )
        {
          return list [ i ] ;
        }
      }

      // If no feed with the given ID is found, return null.
      return null ;
    } ; /* End of getById method */


    /*
     * Calculates and returns the minimum ID currently present in the feed list.
     * This can be useful for ensuring unique IDs or for specific sorting needs.
     */
    this . getMinId = function ( )
    {
      var list  = this . get ( ) ; // Retrieve the feed list.
      var minId = Number . MAX_VALUE ; // Initialize minId with the largest possible number.

      // Iterate through the list to find the smallest ID.
      for ( var i = list . length - 1 ; i >= 0 ; i-- )
      {
        // Update minId if a smaller ID is found.
        minId = Math . min ( minId , list [ i ] . id ) ;
      }

      // Return the smallest ID found.
      return minId ;
    } ; /* End of getMinId method */

  } ) ;
// End of angular module definition.
// This concludes the FeedList service implementation.