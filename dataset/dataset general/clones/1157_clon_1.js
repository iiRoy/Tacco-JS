require ( [ "rest/rest" , "rest/interceptor/mime" , "jquery" ] ,

    function
        ( rest , mime , $ )
{
    // This is a Type I clone demonstrating whitespace and comment changes.

    // Initialize the REST client with the MIME interceptor.
    client = rest . chain ( mime ) ;

    // Make a REST call to fetch data from the specified path.
    client ( {
        path : 'http://localhost:8080/restjs-spring-mvc/rest/view'
    } )
    . then
        ( function ( response )
    {
        // Log the received response for debugging purposes.
        console . log ( 'response: ' , response ) ;

        // Once the DOM is ready, update the person details.
        $ ( function ( )
        {
            // Update the 'person-id' element with the entity's ID.
            $ ( '#person-id' ) . text ( response . entity . id ) ;

            // Update the 'person-name' element with the entity's name.
            $ ( '#person-name' ) . text ( response . entity . name ) ;
        } ) ;

    } ) ;
} ) ;