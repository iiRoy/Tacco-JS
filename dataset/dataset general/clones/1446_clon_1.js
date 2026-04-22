var ExampleApp =  angular.module ( 'ExampleApp' ,  [ 'ModelCore' ] ) ;

/*
 * This section defines the "Videos" factory.
 * It's a model created using the ModelCore service.
 */
ExampleApp.factory ( "Videos" , function ( ModelCore )
{
  return ModelCore.instance ( {
    $type : "Videos" ,
    $settings :
    {
      dataField : {
        many : "items"  /* Key for collections of data. */
      } ,
      urls :
      {
        // This is the base URL for fetching video data from the YouTube API.
        base : "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyBgu9gTtZQBVovfWnhw58Om5unY0YeRvak"
      }
    }
  } ) ;
} ) ;


/**
 * MainCrtl: The primary controller for the application.
 * Manages interactions with the Videos model.
 * @param   {object} $scope   Angular's scope object.
 * @param   {function} Videos Videos model factory.
 */
function MainCrtl ( $scope , Videos )
{
  $scope.models =  new Videos ( ) ;

  // Initiating a search for 'php' videos using the standard $find method.
  $scope.models.$find ( { q : "php" , maxResults : 10 } ) .success ( function ( )
  {
    console.log ( $scope.models.$dataset ) ; // Outputting the dataset after the first search.

    /*
     * Performing another search, this time for 'angularjs'.
     * The third argument 'true' indicates an incremental fetch.
     */
    $scope.models.$find ( { q : "angularjs" , maxResults : 10 } , { } , true ) .success ( function ( )
    {
      console.log ( $scope.models.$dataset ) ; // Displaying the dataset after the AngularJS search.

      // Using the $incremental alias for 'nodejs' videos; it implicitly handles incremental fetching.
      $scope.models.$incremental ( { q : "nodejs" , maxResults : 10 } ) .success ( function ( )
      {
        console.log ( $scope.models.$dataset ) ; // Final dataset display.
      } ) ;
    } ) ;
  } ) .error ( function ( response , code )
  {
    // This block handles any errors that occur during the API calls.
    console.log ( code , response ) ;
  } ) ;
}