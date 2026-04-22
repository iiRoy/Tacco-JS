// ==UserScript==                                                                        // This block defines metadata for the UserScript.
// @name          MusicBrainz: Import from iTunes                                           // Name of the script.
// @description   Import releases from iTunes                                               // What the script does.
// @version       2014-06-21                                                                // Version number.
// @author        -                                                                         // Script author.
// @namespace     http://userscripts.org/users/41307                                        // Unique namespace.
//
// @include       *://itunes.apple.com/*                                                    // URLs where this script will run.
//
// ==/UserScript==                                                                           // End of UserScript metadata.
/*
 **************************************************************************
 *                                                                        *
 *                     iTunes to MusicBrainz Importer                     *
 *                                                                        *
 **************************************************************************
*/


//  Initialize a new HTML form element for submitting data to MusicBrainz.
var myform = document.createElement( "form" );

//  Set the HTTP method for the form submission.
myform.method = "post";

//  Specify the target window/frame for the form submission.
myform.target = "blank";

//  Define the action URL where the form data will be sent.
myform.action = document.location.protocol + "//musicbrainz.org/release/add";

//  Set the character encoding for the form data.
myform.acceptCharset = "UTF-8";



// Section to define and inject custom CSS for the MusicBrainz button.
var btnCSS = document.createElement( "style" );

btnCSS.type = "text/css"; // Set the style element's type attribute.

// Check if a specific element exists to determine button styling.
if ( document.getElementsByClassName( 'view-more' ).length )
{
    // Apply styling with additional margin for 'view-more' context.
    btnCSS.innerHTML = ".mbBtn {border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-top: 25px; margin-right: -150px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}";
}
else
{
    // Apply standard styling without extra margin.
    btnCSS.innerHTML = ".mbBtn {border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}";
}

// Append the created style element to the document's body.
document.body.appendChild( btnCSS );


// Create the submit button element.
var mysubmit = document.createElement( "input" );

mysubmit.type = "submit";               // Set the input type to 'submit'.
mysubmit.value = "Add to MusicBrainz";  // Define the text displayed on the button.
mysubmit.classList.add( "mbBtn" );     // Add the custom CSS class for styling.

// Append the submit button to the previously created form.
myform.appendChild( mysubmit );


// Section to add a link for downloading album artwork in different resolutions.

var linkCSS = document.createElement( "style" ); // Create a new style element for the artwork link.

linkCSS.type = "text/css";                                 // Specify the type of the style element.
linkCSS.innerHTML = ".artLink {margin-top: 10px;}";        // Define CSS for the artwork link.

document.body.appendChild( linkCSS );                      // Attach the artwork link styles to the document body.

var left = document.getElementById( 'left-stack' );        // Get the 'left-stack' element.
var art = left.getElementsByTagName( 'img' )[0];           // Find the first image within 'left-stack'.

// Retrieve the high-DPI source URL for the artwork.
src = art.getAttribute( 'src-swap-high-dpi' );

// Get the 'view-in-itunes' button element.
var viewBtn = left.getElementsByClassName( 'view-in-itunes' )[0];

var artLink = document.createElement( "p" ); // Create a paragraph element for the artwork links.

// Construct the HTML for artwork download links, replacing image dimensions in the source URL.
artLink.innerHTML = "Artwork: <a href=" + src.replace( /340x340/g, "600x600" ) + ">600px</a>" +
                    ", <a href=" + src.replace( /340x340/g, "1200x1200" ) + ">1200px</a>";

artLink.classList.add( "artLink" ); // Apply the custom CSS class to the artwork link paragraph.

// Insert the artwork links before the 'view-in-itunes' button.
viewBtn.parentNode.insertBefore( artLink, viewBtn );


// Create a container div and add a class.
var div = document.createElement( "div" );
div.classList.add( "right" );

// Initialize various metadata variables with default values.
var artist = '',
    album = '',
    label = '',
    year = 0,
    month = 0,
    day = 0,
    country = 'XW',
    type = 'album',
    discs = 0;


// Attempt to parse the current URL to extract album ID and country code.
// The regex matches iTunes album URLs.
if ( m = /^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/.exec( document.location.href ) )
{
    country = m[1]; // Extract the country code from the URL match.

    // Construct the iTunes API lookup URL.
    var url = document.location.protocol + "//itunes.apple.com/lookup?id=" + m[2] + "&entity=song&limit=200";

    // If a country code was found, append it to the API URL.
    if ( m[1] ) {
        url = url + "&country=" + m[1];
    }

    // Create a new XMLHttpRequest object for making API calls.
    var xmlhttp = new XMLHttpRequest();

    // Initialize the HTTP request: GET method, URL, asynchronous.
    xmlhttp.open( 'GET', url, true );

    // Define the callback function to be executed when the ready state changes.
    xmlhttp.onreadystatechange = function() { callbackFunction( xmlhttp ); };

    // Send the HTTP request.
    xmlhttp.send( null );
}


// Defines the callback function for the XMLHttpRequest.
function callbackFunction( req )
{
    // Ensure the request is complete (readyState 4).
    if ( xmlhttp.readyState != 4 ) {
        return; // Exit if not complete.
    }

    // Parse the JSON response from the API.
    var r = eval( '(' + xmlhttp.responseText + ')' );
    // The following line is commented out in the original, so it remains commented.
    //  var r = $.parseJSON(xmlhttp.responseText);

    // Iterate through the results array received from the iTunes API.
    for ( var i = 0; i < r.results.length; i++ )
    {
        // Process results that are of type "collection" (album/EP/single metadata).
        if ( r.results[i].wrapperType == "collection" )
        {
            artist = r.results[i].artistName; // Store the artist name.

            album = r.results[i].collectionName; // Store the album name.

            // Check if the album name indicates a Single or EP.
            if ( m = /(.*?) - (Single|EP)/.exec( r.results[i].collectionName ) )
            {
                album = m[1]; // Update album name, removing the type suffix.
                type = m[2];  // Set the release type (Single or EP).
            }

            // Parse the release date.
            if ( m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec( r.results[i].releaseDate ) )
            {
                year = m[1];  // Extract the year.
                month = m[2]; // Extract the month.
                day = m[3];   // Extract the day.
            }

            label = r.results[i].copyright; // Store the copyright information as label.

            // Extract the actual label name from the copyright string.
            if ( m = /(?:[0-9]{4} )?(.*)/.exec( r.results[i].copyright ) )
            {
                label = m[1]; // Update label name.
            }
        }
        // Process results that are of type "track" (individual song metadata).
        else if ( r.results[i].wrapperType == "track" )
        {
            var discno = r.results[i].discNumber - 1;  // Calculate zero-indexed disc number.
            var trackno = r.results[i].trackNumber - 1; // Calculate zero-indexed track number.
            discs = r.results[i].discCount;             // Store the total number of discs.

            var trackname = r.results[i].trackName;     // Get the track name.

            // Check for censored track names and adjust if necessary.
            if ( r.results[i].trackCensoredName && trackname != r.results[i].trackCensoredName )
            {
                var str1 = r.results[i].trackCensoredName.substr( 0, trackname.length );
                var str2 = r.results[i].trackCensoredName.substr( trackname.length );

                if ( trackname == str1 && str2.match( /^ \(.*\)$/ ) )
                {
                    trackname = r.results[i].trackCensoredName; // Use the censored name if it matches the pattern.
                }
            }

            // Add track name and length as hidden fields to the form.
            add_field( "mediums." + discno + ".track." + trackno + ".name", trackname );
            add_field( "mediums." + discno + ".track." + trackno + ".length", r.results[i].trackTimeMillis );

            // Process track artists.
            var artists = r.results[i].artistName.split( /[,&]/ );
            for ( var j = 0; j < artists.length; j++ )
            {
                // Add artist name.
                add_field( "mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".name", artists[j].trim() );

                // Determine join phrase for artist credits.
                var join_phrase = ( j != artists.length - 1 ) ? ( j == artists.length - 2 ) ? " & " : ", " : "";

                // Add join phrase if not the last artist.
                if ( j != artists.length - 1 ) {
                    add_field( "mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".join_phrase", join_phrase );
                }
            }
        }
    }

    // Add format for each disc.
    for ( var i = 0; i < discs; i++ ) {
        add_field( "mediums." + i + ".format", 'Digital Media' );
    }

    // Add general release information to the form.
    add_field( "name", album );                                           // Album title.
    add_field( "artist_credit.names.0.artist.name", artist );             // Main artist name.
    add_field( "packaging", 'None' );                                     // Packaging type.
    add_field( "date.year", year );                                       // Release year.
    add_field( "date.month", month );                                     // Release month.
    add_field( "date.day", day );                                         // Release day.
    add_field( "labels.0.name", label );                                  // Label name.
    add_field( "country", country );                                      // Country of release.
    add_field( "status", "official" );                                    // Release status.
    // The following lines are commented out in the original, so they remain commented.
    //add_field("language", "jpn");
    //add_field("script", "Jpan");
    add_field( "type", type );                                            // Release type (album, single, EP).
    add_field( "edit_note", "Imported from: " + document.location.href + // Edit note with source URL.
                              " using https://github.com/dufferzafar/Userscripts/blob/master/MB-Import-From-iTunes.user.js" );
    add_field( "urls.0.link_type", "74" );                                // Link type for the iTunes URL.
    add_field( "urls.0.url", document.location.href );                    // iTunes URL.

    // Append the constructed form to the container div.
    div.appendChild( myform );

    // Append the container div (with form) to the 'title' element on the page.
    document.getElementById( 'title' ).appendChild( div );
}


/*
 *  --------------------------------------------------------------------------
 *   Helper Function: add_field
 *  --------------------------------------------------------------------------
 */

// Function to dynamically add a hidden input field to the 'myform'.
function add_field ( name, value )
{
    var field = document.createElement( "input" ); // Create a new input element.

    field.type = "hidden"; // Set the input type to 'hidden'.
    field.name = name;     // Assign the provided name to the input field.
    field.value = value;   // Set the value of the hidden input field.

    myform.appendChild( field ); // Append the created hidden field to the global form.
}