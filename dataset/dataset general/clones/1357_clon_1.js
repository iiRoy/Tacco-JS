/* This module handles global configuration settings. */
var Config = ( function ( ) {

    var config = {
        // Core configuration variables for the chapter.
        'name'          :   _CHAPTER_NAME_ ,
        'id'            :   _CHAPTER_ID_ ,
        'google_api'    :   _API_KEY_ ,
        'pwa_id'        :   _PICASA_ALBUM_ID , /* Picasa Web Album Identifier */

        /* Customization options */
        'cover_photo'   :   true , // Set to true for a custom cover image (recommended size: 940x180 pixels).
        'cover_color'   :   '#ffffff' ,
        'theme'         :   'gdg.css' , /* Other themes like 'devgoogle.css' might be available */
        'custom_albums' :   {
                                events : {
                                    // Example: 'ahNzfmdvb2dsZS1kZXZlbG9wZXJzcg4LEgVFdmVudBib8PsDDA':'5738801490307387457'
                                }
                            }
    } ; /* End of config object definition */

    // Expose a public 'get' method to access configuration values.
    return { get : function ( a ) { return config[ a ] } } ;

} ) ( ) ;

/*--------------------------------------------------------------------------------------------------------------------*/
/*                                                    INITIALIZATION                                                  */
/*--------------------------------------------------------------------------------------------------------------------*/
$( document ).ready( function ( ) {
    // Add the stylesheet link to the document's head based on the configured theme.
    $( 'head' ).append( '<link href="css/' + Config.get( 'theme' ) + '" rel="stylesheet"/>' ) ;

    // Call the function to manage panel visibility based on URL hash.
    changePanel( ) ;

    // Initially display the 'about' section and set its navigation item as active.
    $( '#about_sec' ).show( ) ;
    $( '#about_nav' ).addClass( 'active' ) ;
} ) ;

// Prepend the chapter name to the document title.
$( 'title' ).prepend( Config.get( 'name' ) + ' | ' ) ;

// Set the brand element's HTML content to the chapter name.
$( '.brand' ).html( '<strong>' + Config.get( 'name' ) + '</strong>' ) ;
/*--------------------------------------------------------------------------------------------------------------------*/


// Event listener for URL hash changes.
$( window ).on( 'hashchange' , function ( ) {
    // When the hash changes, update the displayed panel.
    changePanel( ) ;
} ) ;

var changePanel = function ( ) {
    // Extract the panel identifier from the URL hash.
    var panel = location.hash.substr( 1 ) ;

    // Only proceed if a panel identifier is present.
    if ( panel != '' ) {
        // Hide all panels.
        $( '.panel' ).hide( ) ;

        // Remove 'active' class from all navigation items.
        $( '.nav li' ).removeClass( 'active' ) ;

        // Show the panel corresponding to the hash.
        $( '#' + panel + '_sec' ).show( ) ;

        // Add 'active' class to the navigation item corresponding to the hash.
        $( '#' + panel + '_nav' ).addClass( 'active' ) ;
    }
} ;

// Event handler for the "Join Chapter" button.
$( '#join_chapter' ).click( function ( ) {
    // Open a new window for joining the chapter.
    var win = window.open( 'https://developers.google.com/groups/chapter/join/' + Config.get( 'id' ) ) ;

    // After a short delay, redirect the new window to the chapter's main page.
    setTimeout( function ( ) {
        win.location.href = 'https://developers.google.com/groups/chapter/' + Config.get( 'id' ) + '/' ;
    } , 500 ) ;
} ) ;

// Event handler for the Google+ navigation link.
$( 'li#googleplus' ).click( function ( ) {
    // Open the chapter's Google+ page in a new window.
    window.open( 'https://plus.google.com/' + Config.get( 'id' ) ) ;
} ) ;

/* Fetching Google+ page information for the chapter. */
$.getJSON( 'https://www.googleapis.com/plus/v1/people/' + Config.get( 'id' ) + '?fields=aboutMe%2Ccover%2CdisplayName%2Cimage%2CplusOneCount&key=' + Config.get( 'google_api' ) , function ( data ) {
    // Update the 'about' section with the Google+ 'aboutMe' content.
    $( '#about' ).next( ).html( data.aboutMe ) ;

    // Handle the cover photo display if available and enabled in config.
    if ( data.cover.coverPhoto.url && Config.get( 'cover_photo' ) ) {
        $( '#home' ).css( {
            'background' : 'url(' + data.cover.coverPhoto.url + ') ' + data.cover.coverInfo.leftImageOffset + 'px ' + ( data.cover.coverInfo.topImageOffset ) + 'px' ,
            'color'      :   Config.get( 'cover_color' )
        } ) ;
    }
} ) ;

/* Function to fetch and display photos from a Picasa album associated with an event. */
var handleEventPhotos = function ( event_id , album_id ) {
    $.getJSON( 'https://picasaweb.google.com/data/feed/api/user/' + Config.get( 'id' ) + '/albumid/' + album_id + '?alt=json-in-script&callback=?&max-results=12&kind=photo' , function ( d ) {
        var tn ; // Thumbnail HTML string.
        var p  = d.feed.entry ; // Array of photo entries.

        // Iterate through each photo entry.
        for ( var x in p ) {
            // Construct the HTML for a thumbnail.
            tn = '<li class="span2"><a href="' + p[ x ].link[ 1 ].href + '" class="thumbnail" target="_blank"><img src="' + p[ x ].content.src + '?sz=260" alt="' + p[ x ].title.$t + '" title="' + p[ x ].summary.$t + '"></a></li>' ;

            // Append the thumbnail to the specified event container.
            $( '#' + event_id ).append( tn ) ;
        }
    } ) ;
} ;

/* Fetching and displaying events from the GDG dev site feed. */
$.getJSON( "http://gdgfresno.com/gdgfeed.php?id=" + Config.get( 'id' ) , function ( data ) {
    var now = new Date( ) ; // Current date and time.

    // Process events in reverse chronological order.
    for ( var i = data.length - 1 ; i >= 0 ; i -- ) {
        var start = new Date( data[ i ].start ) ; // Event start date.

        var format = start.format( "longDate" ) ; // Format date part.
        format += ' ' + start.format( "shortTime" ) ; // Append time part.

        var html = '<div class="media">' ;
        // Add event icon if available.
        html += data[ i ].iconUrl != undefined ? '<a class="pull-left" href="https://developers.google.com' + data[ i ].link + '" target="_blank"><img class="media-object" src="https://developers.google.com' + data[ i ].iconUrl + '"></a>' : '' ;
        html += '<div class="media-body">' +
                            '<h4 class="media-heading"><a href="https://developers.google.com' + data[ i ].link + '" target="_blank">' + data[ i ].title + '</a></h4>' +
                            '<h5>' + data[ i ].location + '<br/>' + format + '</h5>' +
                            data[ i ].description +
                        '</div>' ;

        // Check for custom photo albums linked to this event.
        if ( Config.get( 'custom_albums' ) ) {
            var album_id = Config.get( 'custom_albums' ).events[ data[ i ].id ] ;
            if ( album_id ) {
                html += '<div><ul class="thumbnails" id="' + data[ i ].id + '"></ul></div>' ;
                handleEventPhotos( data[ i ].id , album_id ) ;
            }
        }

        html += '</div>' ; // Close media div.

        // Distribute events between 'past' and 'upcoming' sections.
        if ( start < now ) {
            $( '#past_events' ).next( ).next( ).append( html ) ;
        } else {
            $( '#upcoming_events' ).next( ).next( ).prepend( html ) ;
        }
    }

    // Handle "View More" functionality for past events.
    var past = $( '#past_events' ).next( ).next( ).children( ) ;
    if ( past.length > 5 ) {
        $( '#past_events' ).next( ).next( ).append( '<div id="view_more_events"><a href="#">View More...</a></div>' ) ;
    }
    // Hide older past events initially.
    for ( var i = past.length - 1 ; i >= 5 ; i -- ) {
        past[ i ].style.display = 'none' ;
    }
    // Set up click handler for "View More" button.
    $( '#view_more_events' ).click( function ( ) {
        $( '#past_events' ).next( ).next( ).children( ).slideDown( ) ;
        setTimeout( function ( ) { $( '#view_more_events' ).hide( ) ; } , 1 ) ;
    } ) ;
} ) ;

/* Fetching and displaying photos from a Google+ (Picasa Web Albums) album. */
var pwa = 'https://picasaweb.google.com/data/feed/api/user/' + Config.get( 'id' ) + '/albumid/' + Config.get( 'pwa_id' ) + '?access=public&alt=json-in-script&kind=photo&max-results=18&fields=entry(title,link/@href,summary,content/@src)&v=2.0&callback=?' ;
$.getJSON( pwa , function ( d ) {
    var html ; // HTML string for each photo item.
    var p    = d.feed.entry ; // Array of photo entries.
    var count = 0 ; // Counter for photo items.

    // Iterate through each photo entry to generate HTML.
    for ( var x in p ) {
        count ++ ;
        if ( count == 1 ) {
            // Special styling for the first photo.
            html = '<li class="span4"><a href="' + p[ x ].link[ 1 ].href + '" class="thumbnail" target="_blank"><img src="' + p[ x ].content.src + '?sz=460" alt="' + p[ x ].title.$t + '" title="' + p[ x ].summary.$t + '"></a></li>' ;
        } else if ( count == 14 ) {
            // Special styling for the fourteenth photo.
            html = '<li class="span4 pull-right"><a href="' + p[ x ].link[ 1 ].href + '" class="thumbnail" target="_blank"><img src="' + p[ x ].content.src + '?sz=460" alt="' + p[ x ].title.$t + '" title="' + p[ x ].summary.$t + '"></a></li>' ;
        } else {
            // Default styling for other photos.
            html = '<li class="span2"><a href="' + p[ x ].link[ 1 ].href + '" class="thumbnail" target="_blank"><img src="' + p[ x ].content.src + '?sz=260" alt="' + p[ x ].title.$t + '" title="' + p[ x ].summary.$t + '"></a></li>' ;
        }
        // Append the generated HTML to the photo container.
        $( '#photo_container' ).append( html ) ;
    }
} ) ;

/* Fetching Google+ stream activities for news (adapted from Roman Nurik's aggregation code). */
$.getJSON( 'https://www.googleapis.com/plus/v1/people/' + Config.get( 'id' ) + '/activities/public?maxResults=10&key=' + Config.get( 'google_api' ) , function ( response ) {
    // Check for API errors.
    if ( response.error ) {
        rebuildStreamUI( [ ] ) ; // Render an empty stream if an error occurs.
        if ( console && console.error ) {
            console.error( 'Error loading Google+ stream.' , response.error ) ;
        }
        return ; // Exit the function.
    }

    var entries = [ ] ; // Array to hold normalized stream entries.

    // Process each item from the Google+ activities response.
    for ( var i = 0 ; i < response.items.length ; i ++ ) {
        var item   = response.items[ i ] ;
        var actor  = item.actor || { } ;
        var object = item.object || { } ;

        // Construct the item title with a link.
        var item_title = '<b><a href="' + item.url + '">' + item.title + '</a></b>' ;

        // Initialize HTML content, replacing newlines with <br /> tags.
        var html = [ item_title.replace( new RegExp( '\n' , 'g' ) , '<br />' ) ] ;
        // html.push( ' <b>Read More &raquo;</a>' ) ; // Optional: Read More link.

        var thumbnails = [ ] ; // Array to store attachment thumbnails.

        var attachments = object.attachments || [ ] ;
        // Process each attachment within the activity.
        for ( var j = 0 ; j < attachments.length ; j ++ ) {
            var attachment = attachments[ j ] ;
            switch ( attachment.objectType ) {
                case 'album' :
                    // Album handling: display a subset of thumbnails.
                    // This section might need further development for full album display.
                    var upper = attachment.thumbnails.length > 7 ? 7 : attachment.thumbnails.length ;
                    html.push( '<ul class="thumbnails">' ) ;
                    for ( var k = 1 ; k < upper ; k ++ ) {
                        html.push( '<li class="span2"><img src="' + attachment.thumbnails[ k ].image.url + '" /></li>' ) ;
                    }
                    html.push( '</ul>' ) ;
                    break ;

                case 'photo' :
                    // Add photo attachment to thumbnails array.
                    thumbnails.push( {
                        url  : attachment.image.url ,
                        link : attachment.fullImage.url
                    } ) ;
                    break ;

                case 'video' :
                    // Add video attachment to thumbnails array.
                    thumbnails.push( {
                        url  : attachment.image.url ,
                        link : attachment.url
                    } ) ;
                    break ;

                case 'article' :
                    // Display article attachment with title and content.
                    html.push( '<div class="link-attachment"><a href="' +
                        attachment.url + '">' + attachment.displayName + '</a>' ) ;
                    if ( attachment.content ) {
                        html.push( '<br>' + attachment.content + '' ) ;
                    }
                    html.push( '</div>' ) ;
                    break ;
            }
        }

        html = html.join( '' ) ; // Join HTML parts into a single string.

        // Adjust actor image URL for a smaller size.
        var actor_image = actor.image.url ;
        actor_image = actor_image.substr( 0 , actor_image.length - 2 ) + '16' ;

        // Create a normalized entry object.
        var entry = {
            via      : {
                name : 'Google+' ,
                url  : item.url
            } ,
            body     : html ,
            date     : item.updated ,
            reshares : ( object.resharers || { } ).totalItems ,
            plusones : ( object.plusoners || { } ).totalItems ,
            comments : ( object.replies || { } ).totalItems ,
            thumbnails : thumbnails ,
            icon     : actor_image
        } ;

        entries.push( entry ) ; // Add the entry to the collection.
    }

    rebuildStreamUI( entries ) ; // Render the stream with the collected entries.
} ) ;

/**
 * Function to dynamically build the stream UI with fetched entries.
 * @param {Array} entries - An array of stream entry objects.
 */
function rebuildStreamUI ( entries ) {
    entries = entries || [ ] ; // Ensure entries is an array, even if null/undefined.
    // Sort entries by date in descending order.
    entries.sort( function ( x , y ) { return y.date - x.date ; } ) ;

    // Iterate through each entry to create and append to the stream.
    for ( var i = 0 ; i < entries.length ; i ++ ) {
        var entry = entries[ i ] ;
        var $entry = $( '<li>' ) // Create a new list item for the entry.
            .addClass( entry.via.name ) // Add class based on source (e.g., 'Google+').
            .html( entry.body ) ; // Set the main content of the entry.

        // Append the entry icon.
        $( '<img class="icon">' )
            .attr( 'src' , entry.icon )
            .appendTo( $entry ) ;

        // Handle thumbnails if they exist.
        if ( entry.thumbnails && entry.thumbnails.length ) {
            var $thumbs = $( '<ul class="thumbnails">' ).appendTo( $entry ) ;
            for ( var j = 0 ; j < entry.thumbnails.length ; j ++ ) {
                var thumb = entry.thumbnails[ j ] ;
                var $thumb = $( '<li>' ).appendTo( $thumbs ) ;
                if ( thumb.link ) {
                    // If a link is present, wrap the image in an anchor tag.
                    $thumb = $( '<a>' )
                        .attr( 'href' , thumb.link )
                        .appendTo( $thumb ) ;
                }
                $( '<img>' )
                    .attr( {
                        src : thumb.url /*,
                        width: thumb.width,
                        height: thumb.height*/
                    } )
                    .appendTo( $thumb ) ;
            }
        }

        // Add meta information (date/time, source link).
        var $meta = $( '<div class="meta">' ).appendTo( $entry ) ;
        $( '<span class="from">' )
            .html( 'Posted on ' + dateFormat( entry.date , 'fullDate' ) ) // Format and display post date.
            .appendTo( $meta ) ;

        // Display comments count if available.
        if ( entry.comments ) {
            $( '<span class="label">' )
                .text( entry.comments + ' comment' +
                    ( ( entry.comments == 1 ) ? '' : 's' ) ) // Handle pluralization.
                .appendTo( $entry ) ;
        }
        // Display reshares count if available.
        if ( entry.reshares ) {
            $( '<span class="label">' )
                .text( entry.reshares + ' reshare' +
                    ( ( entry.reshares == 1 ) ? '' : 's' ) ) // Handle pluralization.
                .appendTo( $entry ) ;
        }
        // Add a Google +1 button for the entry.
        $( '<span class="g-plusone label" data-size="medium" data-annotation="bubble" data-href="' + entry.via.url + '">' )
            .appendTo( $entry ) ;

        $entry.appendTo( '#news-feed' ) ; // Append the complete entry to the news feed container.
    }

    // Render all Google +1 buttons on the page.
    gapi.plusone.go( ) ;
}