/*
 *  Project: S6 Presentation System
 *  Module: Core JavaScript Logic
 *
 *  File: thias.js
 *  Version: 1.0.0
 *  Date: 2010-11-14 (Initial Release)
 *  Author: Matthias Edler-Golla <meg@wachenfeld-golla.de>
 *
 *  Description:
 *  This script provides interactive functionality for a web-based presentation system.
 *  It handles slide navigation via clicks, keyboard input, and a table of contents.
 *  Includes features for help, warnings, and external link handling.
 *
 *  Copyright (c) 2010 Wachenfeld + Golla, Buero fuer Gestaltung.
 *  Web: http://wachenfeld-golla.de
 *  All intellectual property rights reserved.
 */

$( function ( ) {
    // This anonymous function executes when the DOM is fully loaded.
    // Adds a class to the <html> element to indicate JavaScript is active.
    $( 'html' ).addClass( 'jsAktiv' );

} ); // End of DOM ready function.

$( function ( )
{
    // Initial setup: Hide all articles except the very first one.
    // The first article is marked as 'sichtbar' (visible).
    $( 'article:not(:first)' ).hide( );
    $( 'article:first' ).addClass( 'sichtbar' );


    // Prevent click events from propagating for specific elements.
    // This ensures that clicking these elements does not trigger the slide navigation.
    // Elements include links, the index div, back button, forms, video, and audio.
    $( 'body a, body div#index, body p#back, form, video, audio' ) .click( function ( e )
    {
        e .stopPropagation( );
    } );


    // Bind click event to all 'article' elements.
    // This allows navigating to the next slide by clicking anywhere on an article.
    // Note: Previous implementation using $(document).bind('click') caused issues on iOS devices.
    $( 'article' ) .bind( 'click', function ( e )
    {
        // Call the function to advance to the next slide.
        weiterGehen( );
    } );


    // Global keyboard event listener for navigation and utility functions.
    $( document ) .keydown( function ( event )
    {
        // Uncomment below for debugging key codes.
        // var taste = event.keyCode;
        // alert (taste);

        // Retrieve the current article number and total article count.
        var aktuelleArtikelNummer = aktuelleArtikelNummerFinden( );
        var artikelAnzahl = $( 'div#wrap article' ) .length;

        // Key code 39: Right arrow key - navigate forward.
        if ( event .keyCode == '39' )
        {
            weiterGehen( );
        }

        // Key code 37: Left arrow key - navigate backward.
        if ( event .keyCode == '37' )
        {
            zurueckGehen( );
        }

        // Key code 32: Spacebar - toggle the table of contents visibility.
        if ( event .keyCode == '32' )
        {
            $( 'div#inhaltsangabe' ) .toggle( 'fast' );
            hilfeVerbergen( ); // Also hide help if visible.
            return false; // Prevent default spacebar action (e.g., scrolling).
        }

        // Key code 48: '0' (Zero) key - reset to the first slide.
        if ( event .keyCode == '48' )
        {
            $( 'article:not(:first)' ) .hide( ) .removeClass( 'sichtbar' );
            $( 'article:first' ) .fadeIn( 600 ) .addClass( 'sichtbar' );
            warnungVerbergen( ); // Hide any active warnings.
            hilfeVerbergen( ); // Hide help if visible.
            aktuelleArtikelNummerEintragen( ); // Update current slide indicator.
        }


        // Key code 67: 'C' key - Toggle a 'pointerCursor' class on the visible article.
        // This class, typically styled via CSS, might display a large pointer for emphasis.
        if ( event .keyCode == '67' )
        {
            var c = $( 'article' ) .attr( 'class' );
            // Debugging: alert (c);
            if ( c .indexOf( 'pointerCursor' ) != -1 )
            {
                $( 'article.sichtbar' ) .removeClass( 'pointerCursor' );
            }
            else
            {
                $( 'article.sichtbar' ) .addClass( 'pointerCursor' );
            }
        }


        // Key codes 189 (Safari) or 0 (Firefox): '?' key - display help.
        // This handles cross-browser compatibility for the '?' key.
        if ( event .keyCode == '189' || event .keyCode == '0' )
        {
            hilfeZeigen( ); // Show the help overlay.
        }

    } ); // End of keydown event handler.

} ); // End of DOM ready function for main interactions.

$( function ( )
{
    // Click event for the main title (h1#titel).
    // This provides an alternative way to access the help documentation.
    $( 'h1#titel' ) .click( function ( )
    {
        hilfeZeigen( ); // Display the help overlay.
    } );

} ); // End of DOM ready function for title click.

function hilfeZeigen ( )
{
    // Check if the help container (div#hilfe) already exists in the DOM.
    if ( $( 'div#hilfe' ) .length == 0 )
    {
        // If it doesn't exist, create it and append it to the #wrap div.
        $( 'div#wrap' ) .append( '<div id="hilfe"></div>' );
        $( 'div#hilfe' ) .hide( ); // Ensure it's hidden initially.
    }

    // Toggle the visibility of the help div with a 'fast' animation.
    // This makes it appear or disappear.
    $( 'div#hilfe' ) .toggle( 'fast' );

    // Load content into the help div from an external HTML file.
    // It specifically targets the 'article.hilfe' section within that file.
    $( 'div#hilfe' ) .load( '../../meta/core/hilfe.html article.hilfe' );
} // End of hilfeZeigen function.


function hilfeVerbergen ( )
{
    // Fades out any 'article' elements found within the 'div#hilfe' container.
    // This effectively hides the help content.
    $( 'div#hilfe article' ) .fadeOut( 'slow' );
} // End of hilfeVerbergen function.

function ArtikelAustauschen ( bisherArtikel , neuArtikel )
{
    // Hides the currently visible article and removes its 'sichtbar' class.
    $( bisherArtikel ) .hide( ) .removeClass( 'sichtbar' );

    // Fades in the new article and assigns it the 'sichtbar' class, making it visible.
    $( neuArtikel ) .fadeIn( 600 ) .addClass( 'sichtbar' );
} // End of ArtikelAustauschen function.

// This block handles the creation of the table of contents and article IDs.
$( function ( )
{
    // Clone all H1 headers from articles and append them to the table of contents div.
    $( 'article h1' ) .clone( ) .appendTo( 'div#inhaltsangabe' );


    // Wrap each H1 in the table of contents with an anchor tag.
    // The href points to the corresponding article ID (e.g., #A_1).
    // The title attribute provides a tooltip for navigation.
    $( 'div#inhaltsangabe h1' ) .each( function ( index )
    {
        $( this ) .wrap( '<a href="#A_' + ( ( index - 1 ) + 1 ) + '" title="Springt zum jeweiligen Artikel"><\/a>' );
    } );


    // Assign a unique ID to each article within the #wrap container.
    // These IDs are used for direct navigation and referencing.
    $( 'div#wrap article' ) .each( function ( index )
    {
        $( this ) .attr( {
            id: 'A_' + ( ( index - 1 ) + 1 )
        } );
    } );


    // Calculate the total number of articles (slides) in the document.
    // Subtract 1 because the index is zero-based for the first slide.
    var artikelAnzahl = ( $( 'div#wrap article' ) .length ) - 1;
    // Debugging: alert (artikelAnzahl);

    // Update the display for the total number of pages/articles.
    $( 'h2#Seitenanzeige strong' ) .text( artikelAnzahl );


    // If there are many entries in the table of contents, apply a specific CSS class.
    // This class (vieleEintraege) might reduce vertical spacing for better readability.
    if ( artikelAnzahl >= 15 )
    {
        $( 'div#inhaltsangabe' ) .addClass( 'vieleEintraege' );
    }


    // Initialize the display of the current article number.
    aktuelleArtikelNummerEintragen( );

} ); // End of DOM ready function for article indexing.

// This function updates the display of the current article number and highlights it.
function aktuelleArtikelNummerEintragen ( )
{
    // Determine the number of the currently visible article.
    var aktuelleArtikelNummer = aktuelleArtikelNummerFinden( );
    // Debugging: alert (aktuelleArtikelNummer);


    // Update the displayed current page number in the UI.
    $( 'h2#Seitenanzeige span' ) .text( aktuelleArtikelNummer );


    // Highlight the corresponding entry in the table of contents.
    aktivenArtikelMarkieren( aktuelleArtikelNummer );


    // Control the visibility of the "back" button based on the current slide.
    zurueckButtonAusblenden( aktuelleArtikelNummer );

} // End of aktuelleArtikelNummerEintragen function.

function zurueckButtonAusblenden ( ziffer )
{
    // If the current slide number is 0 (the first slide), hide the "back" button.
    if ( ziffer == 0 )
    {
        $( 'p#back' ) .hide( );
    }
    // Otherwise, ensure the "back" button is visible.
    else
    {
        $( 'p#back' ) .show( );
    }
} // End of zurueckButtonAusblenden function.

function aktuelleArtikelNummerFinden ( )
{
    // Get the ID attribute of the currently visible article.
    var aktuellerArtikel = $( 'article.sichtbar' ) .attr( 'id' );

    // Extract the numeric part of the ID (e.g., from "A_7" get "7").
    // The .slice(2) removes the "A_" prefix.
    var aktuelleArtikelNummer = parseInt( aktuellerArtikel .slice( 2 ) );

    // Returns the current article number as an integer.
    return aktuelleArtikelNummer;
} // End of aktuelleArtikelNummerFinden function.

function aktivenArtikelMarkieren ( ziffer )
{
    // Remove the 'aktiv' class from any currently highlighted H1 in the table of contents.
    $( 'div#inhaltsangabe h1.aktiv' ) .removeClass( 'aktiv' );

    // Construct a selector to target the H1 corresponding to the given article number (ziffer).
    var x = 'div#inhaltsangabe h1:eq(' + ziffer + ')';

    // Add the 'aktiv' class to highlight the current article in the table of contents.
    $( x ) .addClass( 'aktiv' );
} // End of aktivenArtikelMarkieren function.

// This block implements the functionality for the table of contents.
$( function ( )
{
    // Initially hide the table of contents (div#inhaltsangabe).
    $( 'div#inhaltsangabe' ) .hide( );


    // Click event handler for the index button/element.
    $( 'div#index' ) .click( function ( )
    {
        warnungVerbergen( ); // Hide any active warnings.
        $( 'div#inhaltsangabe' ) .show( 'fast' ); // Show the table of contents with animation.
    } );


    // Click event handler for links within the table of contents.
    $( 'div#inhaltsangabe a' ) .click( function ( )
    {
        var ziel = $( this ) .attr( 'href' ); // Get the target href (e.g., #A_3).
        var zielArtikel = 'article' + ziel; // Construct the full selector (e.g., article#A_3).
        // Debugging: alert (zielArtikel);

        var aktArtikel = $( 'article.sichtbar' ); // Get the currently visible article.

        $( 'div#inhaltsangabe' ) .hide( 'slow' ); // Hide the table of contents after selection.

        // Swap the current article with the selected target article.
        ArtikelAustauschen( aktArtikel, zielArtikel );

        aktuelleArtikelNummerEintragen( ); // Update the current article display.

        return false; // Prevent default link behavior (page jump).
    } );

} ); // End of DOM ready function for table of contents.

// This block handles the click event for the "back" button.
$( function ( )
{
    // Click event handler for the "back" button (p#back).
    $( 'p#back' ) .click( function ( )
    {
        zurueckGehen( ); // Call the function to navigate to the previous slide.
    } );

} ); // End of DOM ready function for back button.

// Navigates to the next slide in the presentation, if not already on the last one.
function weiterGehen ( )
{
    // Hide the table of contents if it's currently open.
    $( 'div#inhaltsangabe' ) .hide( );

    // Get the current article number and the total count of articles.
    var aktuelleArtikelNummer = aktuelleArtikelNummerFinden( );
    var artikelAnzahl = $( 'div#wrap article' ) .length;

    // Check if the current article is not the last one in the presentation.
    if ( aktuelleArtikelNummer < ( artikelAnzahl - 1 ) )
    {
        // Construct selectors for the current and the next article.
        var aktArtikel = 'article#A_' + aktuelleArtikelNummer;
        var nextArtikel = 'article#A_' + ( aktuelleArtikelNummer + 1 );

        // Perform the article swap.
        ArtikelAustauschen( aktArtikel, nextArtikel );

        aktuelleArtikelNummerEintragen( ); // Update the displayed current article number.
        warnungVerbergen( ); // Hide any active warning messages.
    }
    else
    {
        // If it's the last slide, display a warning message.
        // Previously used: alert ('letzter Slide der Präsentation!');
        warnungZeigen( 'letzter Slide der Präsentation…' );
    }

    hilfeVerbergen( ); // Ensure help overlay is hidden.
} // End of weiterGehen function.

// Navigates to the previous slide in the presentation, if not already on the first one.
function zurueckGehen ( )
{
    // Hide the table of contents if it's currently visible.
    $( 'div#inhaltsangabe' ) .hide( );

    // Get the number of the currently active article.
    var aktuelleArtikelNummer = aktuelleArtikelNummerFinden( );

    // Check if the current article is not the very first one (index 0).
    if ( aktuelleArtikelNummer > 0 )
    {
        // Construct selectors for the current article and the previous one.
        var aktArtikel = 'article#A_' + aktuelleArtikelNummer;
        var lastArtikel = 'article#A_' + ( aktuelleArtikelNummer - 1 );

        // Swap the current article with the previous one.
        ArtikelAustauschen( aktArtikel, lastArtikel );

        aktuelleArtikelNummerEintragen( ); // Update the article number display.
        warnungVerbergen( ); // Dismiss any active warnings.
    }
    else
    {
        // If already on the first slide, display a warning.
        // Previously used: alert ('erste Slide der Präsentation erreicht!');
        warnungZeigen( 'erster Slide der Präsentation…' );
    }

    hilfeVerbergen( ); // Ensure the help overlay is not shown.
} // End of zurueckGehen function.

// This block processes links within articles to open them in new windows/tabs.
$( function ( )
{
    // Iterate over all anchor tags within 'article' elements that have an 'href' attribute.
    $( 'article a[href]' ) .each( function ( index )
    {
        var myRef = $( this ) .attr( 'href' ); // Get the href value of the current link.

        // The original intention might have been to only open external links in a new window.
        // However, the conditional check for "http://" is commented out.
        // Therefore, all links within articles will be treated as external.
        // if ( myRef .indexOf( "http://" ) != -1 ) {

        $( this ) .addClass( 'echtLink' ); // Add a class for styling (e.g., external link icon).
        $( this ) .attr( 'target', '_blank' ); // Set target to '_blank' to open in a new tab/window.

        // } // End of commented-out conditional block.
    } );

} ); // End of DOM ready function for external links.

// This block handles initial navigation if a specific article is specified in the URL hash.
$( function ( )
{
    // Retrieve the URL hash, e.g., "#A_0" or "#A_5".
    var ha = window .location .hash;

    // Proceed only if a hash is present in the URL.
    if ( ha .length > 0 )
    {
        // The first article is initially visible and will be swapped out.
        var aktArtikel = $( 'article:first' );

        // Construct the selector for the target article based on the hash.
        var hashArtikel = 'article' + ha;
        // For debugging purposes: alert (hashArtikel);


        // Extract the numeric part from the hash (e.g., from "#A_7" get "7").
        var gekuerzt = ha .slice( 3 ); // Remove "A_" prefix.
        var hashnummer = parseInt( gekuerzt ); // Convert to integer.

        // Get the total count of articles to validate the hash number.
        var artikelAnzahl = $( 'div#wrap article' ) .length;


        // If the hash number is a valid article index (within bounds).
        if ( hashnummer < artikelAnzahl )
        {
            // Swap to the article specified by the URL hash.
            ArtikelAustauschen( aktArtikel, hashArtikel );

            aktuelleArtikelNummerEintragen( ); // Update the current article display.
            warnungVerbergen( ); // Dismiss any warnings.
        }
        // If the hash is invalid or out of bounds, the presentation remains on the first slide.

    } // End of hash presence check.

} ); // End of DOM ready function for hash navigation.

// This block sets up the warning message display system.
$( function ( )
{
    // This section initializes the warning display mechanism.

    // The styling for 'div#warnung' is defined in 'basic.css'.
    // The warning div is appended to the end of the body element.
    $( 'body' ) .append( '<div id="warnung"><p></p></div>' );


    // Initially hide the warning div.
    $( 'div#warnung' ) .hide( );


    // Add a click handler to the paragraph inside the warning div.
    // Clicking the warning message will hide it.
    $( 'div#warnung p' ) .click( function ( )
    {
        warnungVerbergen( ); // Call the function to hide the warning.
        return false; // Prevent any default action of the paragraph click.
    } );

} ); // End of DOM ready function for warning system setup.

// Displays a warning message to the user.
function warnungZeigen ( Meldung )
{
    // Set the text content of the warning paragraph to the provided message.
    $( 'div#warnung p' ) .text( Meldung );

    // Make the warning div visible with a slow fade-in effect.
    $( 'div#warnung' ) .fadeIn( 'slow' );
} // End of warnungZeigen function.

// Hides any currently displayed warning message.
function warnungVerbergen ( )
{
    // Hide the warning div with a slow fade-out effect.
    $( 'div#warnung' ) .fadeOut( 'slow' );
} // End of warnungVerbergen function.