var triplesHtml = "";                                      /* Global variable to store HTML output, initialized as an empty string. */

var n = document;                                               /* Assigns the global 'document' object to a local variable 'n'. */
var rootNode = n;                                               /* 'rootNode' also refers to the document object, for potential future use or legacy. */
var triple_store = new Array();                                 /* An array to hold extracted data triples (subject, predicate, object). */
var license_found = false;                                      /* Boolean flag indicating whether a license has been identified on the page. */

// --- Chrome Extension Message Listener Setup ---
chrome.extension.onMessage.addListener(
    function ( request, sender, sendResponse )
    {
        // This function is executed when a message is received by the extension.
        // It immediately sends a response back, requesting the current URL.
        chrome.extension.sendMessage(
            {
                wanting: "url_please",                          /* Key indicating the type of request. */
                data_url: document.location.href                /* The current URL of the document. */
            }
        );

    }
);

/**
 * Adds a new data triple to the 'triple_store'.
 * Handles duplicate checking and specific actions for 'license' triples.
 * @param {Array} data_triple - An array representing a triple [subject, predicate, object].
 */
function add_triple( data_triple )
{
    // Check if the triple_store is currently empty.
    if ( triple_store.length == 0 )
    {
        triple_store.push( data_triple );                       /* Simply add the triple if the store is empty. */

        // Check if the added triple is a 'license' triple.
        if ( data_triple[1] == "license" )
        {
            license_found = true;                               /* Set the license_found flag to true. */
            // Send a message to the Chrome extension indicating a license has been found.
            chrome.extension.sendMessage(
                {
                    license: "namespace",                       /* Identifier for the type of message. */
                    url: data_triple[2],                        /* The URL of the license. */
                    site: data_triple[0]                        /* The subject URL (website) associated with the license. */
                }
            );
        }
    }
    else // If the triple_store is not empty, perform duplicate checking.
    {
        var triple_not_found = false;                           /* Flag to track if the current triple is unique. */

        // Iterate through the existing triples in the store.
        for ( var x = 0; x < triple_store.length; x++ )
        {
            // If the subject part of the current stored triple is different from the new triple.
            if ( triple_store[x][0] != data_triple[0] )
            {
                triple_store.push( data_triple );               /* Add the new triple. */
                triple_not_found = false;                       /* Reset the flag as it's been added. */
                break;                                          /* Exit the loop, no need to check further. */
            }

            // If the predicate part of the current stored triple is different from the new triple.
            if ( triple_store[x][1] != data_triple[1] )
            {
                triple_not_found = true;                        /* Mark as potentially new. */
            }
            else // If both subject and predicate match, it's a potential duplicate or related.
            {
                triple_not_found = false;                       /* Not a new unique triple in this context. */
                break;                                          /* Exit the loop, as a matching triple is found. */
            }
        }

        // If after the loop, the triple was determined to be unique.
        if ( triple_not_found )
        {
            triple_store.push( data_triple );                   /* Add the unique triple to the store. */
            // Check again if this newly added triple is a 'license'.
            if ( data_triple[1] == "license" )
            {
                license_found = true;                           /* Update the global flag. */
                // Notify the extension about the found license.
                chrome.extension.sendMessage(
                    {
                        license: "namespace",
                        url: data_triple[2],
                        site: data_triple[0]
                    }
                );
            }
        }
    }
}

var namespace_data = "";                                        /* Another global variable, perhaps for storing namespace-related data. */

// --- Initial Messages to Chrome Extension ---
chrome.extension.sendMessage(
    {
        data: "url",                                            /* Requesting to send URL data. */
        url: document.location.href                             /* The current page's URL. */
    }
);
chrome.extension.sendMessage(
    {
        data: "title",                                          /* Requesting to send title data. */
        title: document.title,                                  /* The current page's title. */
        url: document.location.href                             /* The current page's URL (duplicated for context). */
    }
);

// --- Delayed Execution of HTML Parsing ---
setTimeout(
    function()
    {
        parse_html();                                           /* Call the main HTML parsing function after a delay. */
    },
    7000                                                        /* Delay of 7000 milliseconds (7 seconds). */
);

/**
 * Main function to parse the HTML document for license and attribution information.
 * Uses jQuery selectors to find relevant elements.
 */
function parse_html()
{
    // --- Section 1: Parsing elements with an 'about' attribute (e.g., RDFa). ---
    if ( $('[about]') )
    {
        var url = $('[about]').attr("about");                  /* Extract the 'about' attribute value, which is often a URL. */

        if ( url != undefined )                                 /* Check if the 'about' attribute actually had a value. */
        {
            // If the URL doesn't start with "http", it might be a relative path or an identifier.
            if ( url.indexOf("http") == -1 )
            {
                url = document.location.href;                   /* Default to the current document's URL if it's not an absolute HTTP URL. */
            }
        }
        else // If the 'about' attribute was undefined.
        {
            url = document.location.href;                       /* Fallback to the current page's URL. */
        }

        // Check for a license link within the context of the '[about]' element.
        if ( $('[about] > [rel*="license"]')[0] )
        {
            add_triple( Array(url, "license", $('[about] > [rel*="license"]')[0].href) ); /* Add a license triple. */
            license_found = true;                               /* Set the flag. */
        }

        // Check for an attribution URL within the context of the '[about]' element.
        if ( $('[about] > [rel="cc:attributionURL"]')[0] )
        {
            add_triple( Array(url, "attributionName", $('[about] > [rel="cc:attributionURL"]')[0].href) ); /* Add an attribution URL triple. */
        }

        // Check for an attribution name within the context of the '[about]' element.
        if ( $('[about] > [property="cc:attributionName"]')[0] )
        {
            add_triple( Array(url, "attributionName", $('[about] > [property="cc:attributionName"]')[0].innerHTML) ); /* Add an attribution name triple. */
        }
    }

    // --- Section 2: Parsing generic license links. ---
    if ( $('[rel*="license"]')[0] )
    {
        // Special handling for Wikipedia pages.
        if ( document.location.href.indexOf("wikipedia.org") != -1 )
        {
            // Wikipedia often has multiple license links; this targets a specific one (the second one).
            add_triple( Array(document.location.href, "license", $('[rel*="license"]')[1].href) );
        }
        else // For all other websites.
        {
            // Use the first found license link.
            add_triple( Array(document.location.href, "license", $('[rel*="license"]')[0].href) );
        }

        license_found = true;                                   /* Confirm a license has been found. */
    }

    // --- Section 3: Parsing Creative Commons specific attribution URLs. ---
    if ( $('[rel="cc:attributionURL"]')[0] )
    {
        if ( $('[rel="cc:attributionURL"]')[0].href )          /* Ensure the element has an 'href' attribute. */
        {
            add_triple( Array(document.location.href, "attributionURL", $('[rel="cc:attributionURL"]')[0].href) ); /* Add the attribution URL. */
        }
    }

    // --- Section 4: Parsing Creative Commons specific attribution names. ---
    if ( $('[property="cc:attributionName"]')[0] )
    {
        if ( $('[property="cc:attributionName"]')[0].innerHTML ) /* Ensure the element has inner HTML content. */
        {
            add_triple( Array(document.location.href, "attributionName", $('[property="cc:attributionName"]')[0].innerHTML) ); /* Add the attribution name. */
        }
    }

    // --- Section 5: Parsing specific "charm-item-license-url" class. ---
    if ( $(".charm-item-license-url")[0] )
    {
        add_triple( Array(document.location.href, "license", $(".charm-item-license-url").attr("href")) ); /* Extract license from a custom class. */
    }

    // --- Section 6: Domain-specific parsing logic (e.g., Flickr). ---
    switch ( document.location.href.split(".")[1] )            /* Get the second part of the domain (e.g., "flickr" from "www.flickr.com"). */
    {
        case "flickr":                                          /* If the domain is Flickr. */
            var author = $('.owner-name').html();               /* Try to find the author from an element with class 'owner-name'. */

            if ( author == undefined )                          /* If 'owner-name' not found. */
            {
                // Attempt to find author from a different Flickr-specific element structure.
                author = $('.photo-name-line-1')
                            .children()
                            .first()
                            .html();
            }

            if ( author != undefined )                          /* If an author name was successfully extracted. */
            {
                if ( author.length != 1 )                       /* Ensure the author name is not just a single character. */
                {
                    var triple_array = Array(document.location.href, "author", author); /* Create an author triple. */
                    add_triple( triple_array );                 /* Add the author triple to the store. */
                    triple_array = Array();                     /* Clear the temporary array. */
                    break;                                      /* Exit the switch statement. */
                }
            }
            break;                                              /* End of 'flickr' case. */

        default:                                                /* Default case for all other domains. */
            break;                                              /* Do nothing. */
    }

    // --- Final Action: Notify extension if a license was found. ---
    if ( license_found )                                        /* If at least one license was identified during parsing. */
    {
        chrome.extension.sendMessage(
            {
                url_to_show: document.location.href,            /* The URL of the page where the license was found. */
                show: "icon",                                   /* Instruction to the extension to display an icon. */
                html: triple_store                              /* The collected triples to be sent with the message. */
            }
        );
    }

}