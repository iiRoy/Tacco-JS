/*
 * This file contains core JavaScript logic for the diploma thesis website.
 * It handles internationalization, dynamic script loading, content templating,
 * and navigation features.
 *
 * Author: Benjamin Erb
 * License: Creative Commons BY-SA 3.0
 *
 * Last Modified: 2023-10-27 (Simulated)
 */

var lastest_edition = "1" ; // The latest available edition of the thesis.

var lang = "en" ; /* Default language setting */

// Supported languages and their display names.
var languages = {
    "en": "English"
} ;



var l10n = { // Localization object for various text strings.
    "en": {
        "draftEdition" : "Draft edition", // Title for the draft version.
        "draftNotice": "This is the community edition. Please <a href='http://github.com/berb/diploma-thesis/issues/'>create a ticket or pull request</a> for any corrections, suggestions and enhancements. ",
        "edition": "Edition", // Label for an edition.
        "editionNotice": "This is the original version of the thesis. There is also an <a href='../community/index.html'>alternative version</a> that can be collaboratively extended.",
        "footer": "Diploma Thesis by <a href='http://www.benjamin-erb.de'>Benjamin Erb</a>, released under a <a href='http://creativecommons.org/licenses/by-sa/3.0/'>Creative Commons</a> license",
        "home": "Home",
        "nextPage": "Next Page",
        "prevPage": "Previous Page",
        "search": "Search",
        "title": "Concurrent Programming for Scalable Web Architectures",
        "subtitle":"Diploma Thesis by Benjamin Erb",
        "subtitleLink":"http://www.benjamin-erb.de/"
    }
} ;

// Array of external JavaScript libraries to be loaded.
var scripts = [
    "http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js",
    "../script/all/jquery.sausage.js"
    // The following line is commented out in the original and remains so.
    // "http://christophercliff.github.com/sausage/jquery.sausage.js"
] ;

// Determine Piwik base URL based on protocol (HTTPS or HTTP).
var pkBaseURL = ( ( "https:" == document.location.protocol ) ? "https://stats.benjamin-erb.de/piwik/" : "http://stats.benjamin-erb.de/piwik/" ) ;
scripts.push(pkBaseURL + "piwik.js") ; // Add Piwik tracking script.


// Dynamically load all scripts listed in the 'scripts' array.
for ( i = 0 ; i < scripts.length ; i++ ) {
    document.write( "<script src='" + scripts[i] + "'></script>" ) ;
}

// Conditional comments for IE-specific stylesheets.
var condcoms = [
    "<!--[if lte IE 8]><link rel='stylesheet' href='../style/all/lte/ie8.css'><![endif]-->",
    "<!--[if lt IE 8]><link rel='stylesheet' href='../style/all/lt/ie8.css'><![endif]-->"
] ;

// Write conditional comments to the document.
for ( i = 0 ; i < condcoms.length ; i++ ) {
    document.write( condcoms[i] ) ;
}

// URL routing patterns and their corresponding handler functions.
var urls = [
    [".*/editions/([0-9]+)/([a-z]{2})/([a-z]+).html", "build_edition"],
    [".*/draft/([a-z]+).html", "build_draft"],
    [".*/original/([0-9]+_)?([a-z]+).html", "build_edition"],
    [".*/community/([0-9]+_)?([a-z]+).html", "build_draft"],
    [".*/index.html", "build_index"]
] ;

/**
 * Checks if the document processing flag is already set.
 * Throws an error if it is, preventing redundant processing.
 */
function check_flag( ) {
    if ( $( "body" ).hasClass( "complete" ) ) {
        throw "Document processing is already complete." ;
    }
}

/**
 * Sets a flag on the body element to indicate that document processing is complete.
 */
function raise_flag( ) {
    $( "body" ).addClass( "complete" ) ;
}

/**
 * Generates the HTML string for the page header, including search and title.
 * @returns {string} The HTML for the header.
 */
function get_header( ) {
    return '\
      <div class="page_header_spacer inner  ">\
        <div class="search_box">\
          <form class="search" action="http://www.google.com/search">\
            <input type="hidden" name="as_sitesearch" value="http://berb.github.com/diploma-thesis/">\
            <input type="text" name="as_q" value="" class="search_field">\
            <input type="submit" value="' + l10n[lang].search + '" class="search_btn" />\
          </form>\
      </div>\
      </div>\
      <div class="page_header_title ">\
        <h1 class="logo">\
          <a href="#" title="home">' + l10n[lang].title + '</a>\
        </h1>\
      </div>\
      <div class="page_header_sub ">\
        <h1 class="sublogo">\
          <a href="' + l10n[lang].subtitleLink + '" title="home">' + l10n[lang].subtitle + '</a>\
        </h1>\
      </div>\
    ' ;
}

/**
 * Generates the HTML string for the page footer.
 * @returns {string} The HTML for the footer.
 */
function get_footer( ) {
    return '\
      <div class="footer">\
        <div class="container"><p>'
          + l10n[lang].footer +
        '</p></div>\
      </div>\
    ' ;
}

/**
 * Applies a common template structure to the page.
 * It wraps existing body content into a templated layout.
 */
function template( ) {
    var contents = $( "body" ).contents( ) ; // Get original body contents.
    if ( $( ".home" ).length ) {
        // Template for home page.
        $( "body" ).html( '\
          <div class="container">\
            ' + get_header( ) + '\
            <div class="body">\
            </div>\
          </div>\
          ' + get_footer( ) + '\
        ' ) ;
    } else {
        // Template for other pages.
        $( "body" ).html( '\
          <div class="container">\
            ' + get_header( ) + '\
            <div class="notice"></div>\
            <div class="inner wrap">\
              <div class="sidebar">\
              </div>\
              <div class="content body">\
              </div>\
              <div class="content_footer">\
              </div>\
            </div>\
          </div>\
          ' + get_footer( ) + '\
        ' ) ;
    }
    $( "div.body" ).html( contents ) ; // Re-insert original content into the new 'body' div.
    $( "div.buy" ).html(
        '<iframe id="buy" scrolling="no"></iframe>'
    ) ;
    $( "#buy" ).load( function( ) {
        $( "iframe" ).contents( ).find( "a" ).attr( "target", "_blank" ) ;
    } ) ;
    $( "#buy" ).attr( "src", "buy.html" ) ;
}

/**
 * Updates the href attribute of the logo link.
 * @param {string} url The new URL for the logo link.
 */
function link_logo( url ) {
    $( ".logo a" ).attr( "href", url ) ;
}

/**
 * Appends a given text string as a notice to the notice area.
 * @param {string} text The HTML content of the notice.
 */
function add_notice( text ) {
    $( ".notice" ).append( text ) ;
}

/**
 * Adds a specific notice for the draft edition.
 */
function add_notice_draft( ) {
    add_notice( '<p class="inner info_bubble">' + l10n[lang].draftNotice + '</p>' ) ;
}

/**
 * Adds an edition-specific notice, especially if it's not the latest edition.
 * @param {string} edition The current edition number.
 */
function add_notice_edition( edition ) {
    // Replace current edition in URL with the latest edition for the link.
    href = document.location.href.replace(
        "/editions/" + edition + "/", "/editions/" + lastest_edition + "/"
    ) ;
    notice = l10n[lang].editionNotice.replace( "%s", href ) ;
    if ( edition != lastest_edition ) {
        add_notice( '<p class="inner info_bubble">' + l10n[lang].editionNotice + '</p>' ) ;
    }
}

/**
 * Adds a "Previous Page" link to the sidebar if available.
 */
function add_prev_link( ) {
    prev_url = $( "link/[rel='prev']" ).attr( "href" ) ;
    if ( prev_url ) {
        // .sidebar, .content_footer (originally noted as targets)
        $( ".sidebar" ).append(
            "<h3><a href='" + prev_url + "'>" + l10n[lang].prevPage + "</a></h3>"
        ) ;
    } else {
        $( ".sidebar" ).append(
            "<h3 class='disabled'>" + l10n[lang].prevPage + "</h3>"
        ) ;
    }
}

/**
 * Adds a "Next Page" link to the sidebar if available.
 */
function add_next_link( ) {
    next_url = $( "link/[rel='next']" ).attr( "href" ) ;
    if ( next_url ) {
        // .sidebar, .content_footer (originally noted as targets)
        $( ".sidebar" ).append(
            "<h3><a href='" + next_url + "'>" + l10n[lang].nextPage + "</a></h3>"
        ) ;
    } else {
        $( ".sidebar" ).append(
            "<h3 class='disabled'>" + l10n[lang].nextPage + "</h3>"
        ) ;
    }
}

/**
 * Generates and adds a Table of Contents (TOC) to the sidebar based on H1-H6 tags with IDs.
 */
function add_toc( ) {
    var old_depth = 0 ;
    var html = "" ;
    $( "*/[id!='']" ).each( function( index ) {
        var id = $( this ).attr( "id" ) ;
        var name = $( this )[0].nodeName ;
        var text = $( this ).text( ) ;
        // Only process heading tags (H1-H6).
        if ( name.length != 2 || name.slice( 0, 1 ) != "H" ) {
            return ;
        }
        var new_depth = name.slice( 1, 2 ) ;
        if ( new_depth > old_depth ) {
            html += "<ul>" ;
        } else if ( new_depth < old_depth ) {
            html += "</li></ul></li>" ;
        } else {
            html += "</li>" ;
        }
        html += "<li><a href='#" + id + "'>" + text + "</a>" ;
        old_depth = new_depth ;
    } ) ;
    html += "</li></ul>" ; // Close any remaining open list items/uls.
    $( ".sidebar" ).append( "<h3>Contents</h3>" ) ;
    $( ".sidebar" ).append( html ) ;
}

/**
 * Routes the current page URL to the appropriate build function.
 * Iterates through defined URL patterns and calls the matching handler.
 */
function build( ) {
    for ( i = 0 ; i < urls.length ; i++ ) {
        var matches = document.location.href.match( urls[i][0] ) ;
        if ( matches ) {
            window[urls[i][1]]( matches ) ; // Call the handler function.
            break ; // Stop after the first match.
        }
    }
}

/**
 * Handles building page elements specific to an 'edition' page.
 * @param {Array} matches Regex matches from the URL pattern.
 */
function build_edition( matches ) {
    var edition = matches[1] ;
    var language = languages[matches[2]] ;
    var page = matches[3] ;
    var edition_text = l10n[lang].edition + " " + edition + " (" + language + ")" ;
    link_logo( "../index.html" ) ;
    add_notice_edition( edition ) ;
    $( ".sidebar" ).append( "<h3><a href='../index.html'>" + l10n[lang].home + "</a></h3>" ) ;
    if ( page == "index" ) {
        $( ".sidebar" ).append(
            "<h3>" + edition_text + "</h3>"
        ) ;
    } else {
        $( ".sidebar" ).append(
            "<h3><a href='index.html'>Table of Contents</a></h3>"
        ) ;
    }
    add_prev_link( ) ;
    add_next_link( ) ;
    add_toc( ) ;
}

/**
 * Handles building page elements specific to a 'draft' page.
 * @param {Array} matches Regex matches from the URL pattern.
 */
function build_draft( matches ) {
    var page = matches[1] ;
    link_logo( "../index.html" ) ;
    add_notice_draft( ) ;
    $( ".sidebar" ).append( "<h3><a href='../index.html'>" + l10n[lang].home + "</a></h3>" ) ;
    if ( page == "index" ) {
        $( ".sidebar" ).append(
            "<h3>" + l10n[lang].draftEdition + "</h3>"
        ) ;
    } else {
        $( ".sidebar" ).append(
            "<h3><a href='index.html'>Table of Contents</a></h3>"
        ) ;
    }
    add_prev_link( ) ;
    add_next_link( ) ;
    add_toc( ) ;
}

/**
 * Handles building page elements specific to an 'index' page.
 * @param {Array} matches Regex matches from the URL pattern (not used in this simple case).
 */
function build_index( matches ) {
    link_logo( "index.html" ) ;
}

/**
 * Creates anchor links for all elements with IDs that are not figures.
 */
function autolink( ) {
    $( "*/[id!='']:not(.figure)" ).wrap( function( ) {
	        return "<a class='anchor' href='#" + $( this ).attr( "id" ) + "' />" ;
    } ) ;
}

/**
 * Chops the content area into sections based on anchor tags.
 * This is likely for a "sausage" (progress indicator) navigation.
 */
function chop( ) {
    var $content = $( ".content" ) ;
    var $sections = $( "<div/>" ) ;
    var $as = $content.find( "a.anchor" ) ;
    var j = -1 ;
    $as.each( function( i, el ) {
    	$sections.append( "<section/>" ) ;
    } ) ;
    $content.children( ).each( function( i, el ) {
        var $el = $( el ) ;
        var $section ;
        if ( $el.hasClass( "anchor" ) ) {
            j++ ;
        }
        $section = $sections.find( "section" ).eq( j ) || $sections ;
        $section.append( $( el ).clone( ) ) ;
    } ) ;
    $content.html( $sections ) ;
}

/**
 * Initializes the "sausage" (jQuery.sausage) navigation plugin.
 * Requires the content to be chopped into <section> elements.
 */
function sausage( ) {
    if ( $( "section" ).length < 1 ) {
        return ; // No sections, no sausage.
    }
    $( window ).sausage( {
        page: "section",
        content: function( i, $page ) {
            return "<span class='sausage-span'>"
                + $page.find( ".anchor" ).first( ).text( )
                + "</span>" ;
        }
    } ) ;
}

/**
 * Determines the current language based on the URL.
 * Defaults to 'en' if no language is found in the URL pattern.
 */
function get_lang( ) {
    var matches = document.location.href.match( urls[0][0] ) ;
    if ( matches && matches.length > 2 ) {
        lang = matches[2] ;
    } else {
        lang = "en" ;
    }
}

/**
 * Initializes Piwik tracking.
 * Includes a noscript fallback.
 */
function track( ) {
	try {
		var piwikTracker = Piwik.getTracker( pkBaseURL + "piwik.php", 6 ) ;
		piwikTracker.trackPageView( ) ;
		piwikTracker.enableLinkTracking( ) ;
	} catch( err ) { /* Piwik might not be available */ }
	$( "body" ).append( '<noscript><p><img src="http://stats.benjamin-erb.de/piwik/piwik.php?idsite=6" style="border:0" alt="" /></p></noscript>' ) ;
}

/**
 * Handles keyboard shortcuts for page navigation (left/right arrow keys).
 * @param {Event} evt The keyboard event.
 */
function access( evt ) {
    prevNext = document.getElementsByTagName( "link" ) ;
    if ( evt.keyCode == 37 ) {
        location = prevNext[1].href ; // Left arrow for previous page.
    }
    if ( evt.keyCode == 39 ) {
        location = prevNext[2].href ; // Right arrow for next page.
    }
}

// Entry point: Execute functions when the document is ready.
document.onready = function( ) {
    document.documentElement.addEventListener( "keydown", access, true ) ; // Add keyboard navigation listener.
    try {
        check_flag( ) ; // Ensure processing hasn't already occurred.
        raise_flag( ) ; // Mark processing as started.
        get_lang( ) ;   // Determine page language.
        template( ) ;   // Apply page layout.
        build( ) ;      // Route and build page content.
        autolink( ) ;   // Create internal anchor links.
        chop( ) ;       // Prepare content for sausage navigation.
        track( ) ;      // Initialize analytics.
        sausage( ) ;    // Initialize sausage navigation.
    } catch ( error ) {
        // Log or handle the error, e.g., if document processing was already complete.
        // console.error("Error during document initialization:", error);
    }
} ;