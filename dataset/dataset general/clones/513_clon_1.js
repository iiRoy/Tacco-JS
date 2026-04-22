// This file defines the 'Items' collection and related UI logic for a Meteor application.
// It also sets up a recurring task to insert new items.


Items  =   new  Meteor.Collection ( "items" ,  { connection :  null } ) ;


// --- Template 'list' helpers and lifecycle hooks ---


Template.list .items   =   function  ( )
{
    // This helper returns all items currently in the collection.
    // It's used to populate the list template.
    return   Items.find ( ) ;
}
;


var   renderCount   =   1 ;

// This function logs when the 'list' template is rendered.
// It increments a counter each time it's called.
var   logRender   =   function  ( )
{
    console.log ( "rendered #"   +   renderCount ) ;

    renderCount ++ ;
}
;


Template.list .rendered   =   function  ( )
{
    // Call the logging function when the template is rendered to the DOM.
    logRender ( ) ;
}
;


// --- Data insertion interval ---


// Set up an interval to periodically insert new items into the 'Items' collection.
// This simulates dynamic data updates.
setInterval (
    function  ( )
    {
        Items.insert (
            {
                name :   Random.choice (
                    [ "one" ,
                      "two" ,
                      "three" ]
                )
            }
        ) ;
    }
    ,
    1000
) ;