Albums   =  new  Meteor.Collection ( "albums" ) ; /* Global collection for music albums */

Playlist =   new   Meteor.Collection ( "playlist" )  ; // Another global collection for user playlists

// --- Meteor Publications --- //

Meteor.publish ( "albums" ,  function ( )  {
    // Publishes all albums available in the database
    return   Albums.find ( { } ) ;
} ) ;


Meteor.publish ( "playlist" ,  function ( )  {
    // Publishes the current playlist data
    return   Playlist.find ( { } ) ;
} ) ;


/*
 * This section contains a commented-out publication for a 'Player' collection.
 * It is currently not active in the application logic.
 */
// Meteor.publish("player", function ( ) {
//     return Player.find ( { } ) ; // This line would return all player data if uncommented
// } ) ;


/* Client-side code block */
if  ( Meteor.isClient )
{

    console.log ( "CLIENT" ) ; // Log message for client startup

    Template.hello.greeting  =  function ( )
    {
        // This function provides the greeting message for the 'hello' template.
        return   "Welcome to tunes." ;
    } ;


    Template.hello.events ( {
        'click input'  :  function ( )
        {
            // Event handler for a click on an input element within the 'hello' template.
            // The 'this' keyword here refers to the current template data context.
            if  ( typeof  console  !==  'undefined' )
            {
                console.log ( "You pressed the button" ) ; // User action feedback
            }

        }
    } ) ;

}


/* Server-side operations and initial data seeding */
if  ( Meteor.isServer )
{

    console.log ( "ALBUM COUNT" ) ;
    console.log ( Albums.find ( ) . count ( ) ) ; // Display current album count
    console.log ( "PLAYLIST COUNT" ) ;
    console.log ( Playlist.find ( ) . count ( ) ) ; // Display current playlist count
    console.log ( "SERVE" ) ;

    Meteor.startup ( function ( )
    {
        console.log ( "START" ) ; // Server startup log

        // Check if there are no albums in the collection
        if  ( Albums.find ( ) . count ( )  ===  0 )
        {
            console.log ( "NO ALBUMS" ) ; // Indicate that album data will be inserted

            var   data   =   [
                {
                    "title"  :  "Bound - Zen Bound Ingame Music" ,
                    "artist" :  "Ghost Monkey" ,
                    "tracks" :  [
                        {
                            "title" : "Care",
                            "url"   : "music/blue.mp3"
                        } ,
                        {
                            "title" : "Rope and Wood",
                            "url"   : "music/jazz.mp3"
                        } ,
                        {
                            "title" : "Problem Solvent",
                            "url"   : "music/minimalish.mp3"
                        } ,
                        {
                            "title" : "Unpaint My Skin",
                            "url"   : "music/slower.mp3"
                        } ,
                        {
                            "title" : "Nostalgia",
                            "url"   : "music/blue.mp3"
                        } ,
                        {
                            "title" : "Interludum",
                            "url"   : "music/jazz.mp3"
                        } ,
                        {
                            "title" : "Grind",
                            "url"   : "music/minimalish.mp3"
                        } ,
                        {
                            "title" : "Diagrams",
                            "url"   : "music/slower.mp3"
                        } ,
                        {
                            "title" : "Hare",
                            "url"   : "music/blue.mp3"
                        } ,
                        {
                            "title" : "Carefree",
                            "url"   : "music/jazz.mp3"
                        } ,
                        {
                            "title" : "Tunnel At The End Of Light",
                            "url"   : "music/minimalish.mp3"
                        }
                    ]
                } , // End of first album object
                {
                    "title"  :  "Where the Earth Meets the Sky" ,
                    "artist" :  "Tom Heasley" ,
                    "tracks" :  [
                        {
                            "title" : "Ground Zero",
                            "url"   : "music/blue.mp3"
                        } ,
                        {
                            "title" : "Western Sky",
                            "url"   : "music/jazz.mp3"
                        } ,
                        {
                            "title" : "Monterey Bay",
                            "url"   : "music/minimalish.mp3"
                        } ,
                        {
                            "title" : "Where the Earth Meets the Sky",
                            "url"   : "music/slower.mp3"
                        }
                    ]
                }
            ] ; // End of data array initialization


            console.log ( data ) ; // Log the data that is about to be inserted

            // Insert an empty playlist for initial setup
            Playlist.insert ( { albums : [ ] } ) ;


            // Loop through the album data and insert each album into the Albums collection
            for  ( var  i  =  0 ;  i  <  data.length ;  i++ )
            {
                console.log ( "FOR" ) ; // Log for each iteration
                Albums.insert ( data [ i ] ) ;
            }

            // This is a comment that was originally present, indicating startup code.
            // code to run on server at startup
        }
    } ) ;

}

/*
 * This is another commented-out block, possibly a duplicate or
 * an alternative way to define the 'albums' publication.
 * It is not active in the current application.
 */
// Meteor.publish ( 'albums' ,  function ( )  {
//     return  Albums.find ( { } ) ;
// } ) ;