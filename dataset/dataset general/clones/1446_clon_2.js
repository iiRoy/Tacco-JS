let MediaViewerApp = angular.module( 'MediaViewerApp',  ['ResourceProvider'] );

// Centralized service for managing streamable content objects
MediaViewerApp.factory( "StreamableContent", function (ResourceProvider)  {

    return ResourceProvider.instance( {
        $type   : "StreamableContent", // Defines the type of resource being managed
        $settings : {
            dataField : {
                many : "results" // Specifies the field containing multiple items in a collection
            },
            urls      : { // Configuration for API endpoints
                base : "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyBgu9gTtZQBVovfWnhw58Om5unY0YeRvak" // Base endpoint for external data retrieval
            }
        }
    } );
} );

/*
 * Controller responsible for displaying and interacting with media content.
 * It fetches various content types using an external resource provider.
 */
function ContentViewController( $dataContext, StreamableContent ) {

    $dataContext.contentItems = new StreamableContent(); // Instantiate a new collection of content

    // Initiate a standard content search operation for "java"
    $dataContext.contentItems.$find( { q : "java", maxResults : 10 } )
        .success( function ( ) {
            console.log($dataContext.contentItems.$dataset); // Log the fetched data to console

            // Perform another search, appending results incrementally for "reactjs"
            $dataContext.contentItems.$find( { q : "reactjs", maxResults : 10 }, { }, true )
                .success( function ( ) {
                    console.log($dataContext.contentItems.$dataset); // Display the combined dataset

                    // Use the convenience method for incremental fetching for "python"
                    $dataContext.contentItems.$incremental( { q : "python", maxResults : 10 } )
                        .success( function ( ) {
                            console.log($dataContext.contentItems.$dataset); // Show all accumulated data
                        } );
                } );
        } )
        .error( function ( serverResponse, statusCode ) {
            console.log(statusCode, serverResponse); // Handle and log any errors that occur during fetching
        } );
}