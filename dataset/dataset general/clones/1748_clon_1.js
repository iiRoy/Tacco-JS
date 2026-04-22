Flatdoc.run(
    {
        fetcher: Flatdoc.file('index.md') // Initialize Flatdoc with the main markdown file
    }
);


// Event handler for when Flatdoc is ready
$(document).on( 'flatdoc:ready', function () {
    // Perform several DOM manipulations and fixes after content is loaded
    fixHeaders(); // Corrects header issues
    fixIDs();     // Adjusts element IDs
    wrapElements(); // Wraps certain elements for styling
    fixiFrame();    // Ensures iframes are correctly sized
    configJSON();   // Loads and applies configuration from JSON
} );

/*
 * This function attempts to resolve linking issues
 * that arise when images are used within <h1> or <h2> elements.
 * It's a heuristic solution, but it generally works well.
 */
function fixHeaders() {

    // Process all H1 elements
    $('h1').each( function () {
        // Check if the H1 element has no text content
        if ( $(this).text().length == 0 ) {
            // Define constants for attribute manipulation
            var key   = 'id';
            var value = 'root';

            // Extract alt text from child image to use as new header text
            var text = $(this).children('img').attr('alt');
            // Generate a slug from the extracted text for ID consistency
            var slug = Flatdoc.slugify(text);

            // Locate the root list item and its child list
            var rootItem = $( 'li#root-item.level-1' ).eq(0);
            var rootList = rootItem.children( 'ul#root-list.level-2' );

            // Update the 'id' attributes of the root item and list
            rootItem.attr(key, rootItem.attr(key).replace(value, slug));
            rootList.attr(key, rootList.attr(key).replace(value, slug));

            // Prepend a new anchor link to the root item
            rootItem.prepend( $( '<a id=' + slug + '-link class=level-1 href=#' + slug + '>' + text + '</a>' ) );

            // Finally, update the H1 element's ID
            $(this).attr(key, slug);
        }
    } ); // End of H1 processing

    // Process all H2 elements
    $('h2').each( function () {
        // Again, check for empty H2 text content
        if ( $(this).text().length == 0 ) {
            // Define keys for ID and href manipulation
            var key  = 'id';
            var value = '-'; // Placeholder value for H2s
            var link = 'href';

            // Extract alt text and generate slug, similar to H1s
            var text = $(this).children('img').attr('alt');
            var slug = Flatdoc.slugify(text);

            // Find the corresponding root item for H2
            var rootItem = $('li#--item.level-2').eq(0);

            // Update the root item's ID
            rootItem.attr(key, rootItem.attr(key).replace(value, (value + slug)));

            // Iterate over all child elements of the root item to fix their IDs and links
            rootItem.find('*').each( function (index) {
                $(this).attr(key, $(this).attr(key).replace(value, (value + slug)));

                // Check if the element has an href attribute
                if (typeof($(this).attr(link)) !== typeof undefined && $(this).attr(link) !== false) {
                    $(this).attr(link, $(this).attr(link).replace(value, (value + slug)));

                    // Fix any other elements with the placeholder ID pattern
                    var fixId = $('[id*="--"]');
                    fixId.attr(key, fixId.attr(key).replace(value, (value + slug)));
                }
            } );

            // Prepend a new anchor link to the H2 root item
            rootItem.prepend( $('<a id=-' + slug + '-link class=level-2 href=#-' + slug + '>' + text + '</a>') );

            // Update the H2 element's ID
            $(this).attr(key, ('-' + slug));
        }
    } ); // End of H2 processing
} // End of fixHeaders function

/*
 * This function is designed to correct links
 * when an image is used as an H1, which can
 * disrupt the standard linking behavior.
 * It aims to restore the original, expected link structure.
 */
function fixIDs() {
    var key  = 'id'; // Attribute key for ID
    var slug = '';   // Variable to store the extracted slug
    var link = 'href'; // Attribute key for links

    // Iterate over all relevant list elements and anchor tags within #root-list
    $('#root-list ul, #root-list li, #root-list a').each( function ( index ) {
        // Check if the ID does not start with a hyphen (indicating a top-level item)
        if ( $(this).attr(key).substring(0, 1) !== '-' ) {
            // Extract the slug by removing the last 5 characters (e.g., "-link")
            slug = $(this).attr(key).slice(0, -5);
        }
        else {
            // For sub-items, prepend the previously captured slug to their ID
            $(this).attr(key, (slug + $(this).attr(key)));

            // If the element has an href attribute, update it as well
            if ( typeof($(this).attr(link)) !== typeof undefined && $(this).attr(link) !== false ) {
                $(this).attr(link, $(this).attr(link).replace('#', ('#' + slug)));
            }
        }
    } );
} // End of fixIDs function

/*
 * This function wraps sub-groups of content
 * within `div` elements, making them easier
 * to style and manage using CSS.
 */
function wrapElements() {
    var h1Div = ''; // Variable to store the ID of the current H1's wrapper
    var key   = 'id'; // Key for attribute manipulation

    // Iterate over all H1, H2, and H3 elements within the '.content' area
    $('.content h1, .content h2, .content h3').each( function (index) {
        if ( $(this).is('h1') ) {
            // If it's an H1, its ID becomes the base for subsequent H2/H3s
            h1Div = $(this).attr(key);
        }
        else if ( $(this).is('h2') ) {
            // For H2s, wrap itself and all siblings until the next H1 or H2
            $(this).nextUntil('h1, h2').andSelf().wrapAll('<div ' + key + '=' + $(this).attr(key).substring(1, $(this).attr(key).length) + '/>');
            // Update the H2's ID by prepending the H1's ID
            $(this).attr(key, (h1Div + $(this).attr(key)));
        }
        else if ( $(this).is('h3') ) {
            // For H3s, simply update its ID by prepending the H1's ID
            $(this).attr(key, (h1Div + $(this).attr(key)));
        }
    } );
} // End of wrapElements function

/*
 * This function encloses all iframe elements
 * within a `div` container. This is primarily
 * to facilitate correct resizing and responsive
 * behavior using CSS.
 */
function fixiFrame() {
    // Iterate over every iframe found in the document
    $('iframe').each( function ( index ) {
        // Wrap the current iframe with a div having the class 'iframe-container'
        $(this).wrap('<div class="iframe-container"/>');
    } );
} // End of fixiFrame function

function configJSON() {
    // Fetch configuration data from 'config.json'
    $.getJSON('config.json', function (json) {

        // Apply title and header links based on JSON data
        titleAndHeaderLinks(json['title'], json['largeLinks'], json['projectLinks']);
        // Apply Bootstrap-related elements and classes
        bootstrapElements(json['layout']);

        // If Google Analytics configuration is empty, return early
        if ($.isEmptyObject(json['googleAnalytics']) || json['googleAnalytics'].length === 0) {
            return;
        }

        // Append Google Analytics script to the head of the document
        $('head').append('\
    <script>\
      var _gaq=[["_setAccount",' + json['googleAnalytics'] + '] ,["_trackPageview"]];\
      (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];\
        g.src=("https:""==location.protocol?""//ssl":""//www")+"".google-analytics.com/ga.js";\
        s.parentNode.insertBefore(g,s)}(document,"script"));\
    </script>');
    } );
}

function titleAndHeaderLinks(title, largeLinks, projectLinks) {

    // Set the document title
    $('title').text(title);

    // If both largeLinks and projectLinks are empty, there's nothing more to do
    if ($.isEmptyObject(largeLinks) && $.isEmptyObject(projectLinks)) {
        return;
    }

    // Insert the main header structure before the content root
    $('.content-root').before('<div class="header"><div class="left"><ul></ul></div></div>');

    // Process large links if they exist
    if (!$.isEmptyObject(largeLinks)) {
        $.each(largeLinks, function (index, data) {
            // Append each large link as an H1 within a list item
            $('.left ul').append('<li><a href=' + data['link'] + '><h1>' + data['name'] + '</h1></a></li>');
        } );
    }

    // Process project links if they exist
    if (!$.isEmptyObject(projectLinks)) {
        $.each(projectLinks, function (index, data) {
            // Append each project link as a standard link within a list item
            $('.left ul').append(' <li><a href=' + data['link'] + '>' + data['name'] + '</a></li>');
        } );
    }
}

/*
 * This function adds various CSS classes
 * to elements, which are required for
 * proper rendering and layout using
 * the Bootstrap framework.
 */
function bootstrapElements(json) {
    var key = 'id'; // Attribute key for IDs

    // Apply Bootstrap classes to the header
    $('.header').addClass('navbar navbar-default navbar-static-top');

    // Apply Bootstrap container class to the content root
    $('.content-root').addClass('container-fluid');

    // Apply Bootstrap classes to the menubar (sidebar)
    $('.menubar').addClass('col-sm-3 col-md-3 sidebar');
    // Apply navigation classes to the first unordered list in the menubar
    $('.menubar ul').first().addClass('nav nav-sidebar');

    // Apply Bootstrap classes to the main content area
    $('.content').addClass('col-sm-9 col-md-9 main');
    // Apply Bootstrap column class to the first H1 in the content
    $('.content h1').first().addClass('col-md-12');

    // Iterate over all div elements within the content area
    $('.content div').each( function ( index, data ) {
        // Check if the div has an ID attribute
        if ( typeof($(this).attr(key)) !== typeof undefined && $(this).attr(key) !== false ) {

            var divID = $(this).attr(key); // Get the ID of the current div

            // Check if the div's ID matches any in the '40%_Width' configuration
            if ( $.grep(json['40%_Width'], function (value, i) { return (divID.indexOf(value) >= 0); }).length > 0 ) {
                $(this).addClass('col-md-4'); // Assign 40% width (approx. 4/12 columns)
            }
            // Check if the div's ID matches any in the '50%_Width' configuration
            else if ( $.grep(json['50%_Width'], function (value, i) { return (divID.indexOf(value) >= 0); }).length > 0 ) {
                $(this).addClass('col-md-6'); // Assign 50% width (6/12 columns)
            }
            // Check for '60%_Width' but don't apply a class here directly
            else if ( $.grep(json['60%_Width'], function (value, i) { return (divID.indexOf(value) >= 0); }).length > 0 ) {
                // No class applied directly to this div, it will be wrapped later
            }
            // Default case: if no specific width is configured, assign full width
            else {
                $(this).addClass('col-md-12'); // Assign 100% width (12/12 columns)
            }
        }
    } );

    // Wrap elements starting from the first '60%_Width' ID until the next 'col-md-12'
    // This creates a 8-column wrapper for a group of elements
    $('#' + json['60%_Width'][0]).nextUntil('.col-md-12').andSelf().wrapAll('<div class=col-md-8></div>');
} // End of bootstrapElements function