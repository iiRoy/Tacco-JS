/*
 * File: org-info.js - Core JavaScript library for Org-mode HTML exports.
 *
 * Current Version: 0.1.7.1
 *
 * Author: Sebastian Rose, Hannover, Germany - sebastian_rose at gmx dot de
 *
 *
 * This software is distributed under the terms of the GNU General Public License version 3.
 * Please refer to: http://www.gnu.org/licenses/ for licensing details.
 *
 *
 * Minimum Requirements for Org-mode:
 *
 *   - Org-mode version 6.12a or newer.
 *
 *   - For Org-mode versions greater than 6.23 (specifically, commit a68eb4b1e64cbe6e495fdd2c1eaf8ae597bf8602),
 *     you must use org-info.js v.0.1.0.1 or a later version.
 *
 *
 * How to Use:
 *
 * To integrate this script, include it within the <head> section of your HTML-exported Org files.
 * This can be achieved by customizing the 'org-export-html-style' variable in your Emacs configuration.
 * (Note: Future updates might include file-local export options here).
 *
 * Additionally, you need to embed the following JavaScript block somewhere in your HTML page:
 *
 * <script type="text/javascript" language="JavaScript" src="org-info.js"></script>
 * <script type="text/javascript" language="JavaScript">
 *  <![CDATA[ // This CDATA section helps prevent parsing errors in older browsers or XML contexts.
 *
 *  org_html_manager.set("LOCAL_TOC", "1");         // Enable local table of contents.
 *  org_html_manager.set("VIEW", "info");           // Set the default view mode to "info".
 *  org_html_manager.set("VIEW_BUTTONS", "true");   // Display view mode control buttons.
 *  org_html_manager.set("LINK_UP", "http://full/path/to/index/of/this/directory.html"); // Link to parent directory.
 *  org_html_manager.set("LINK_HOME", "http://full/path/to/homepage.html");             // Link to main homepage.
 *  org_html_manager.set("MOUSE_HINT", "underline"); // Apply a 'underline' style hint on mouse hover (or use a color like '#eeeeee').
 *
 *  org_html_manager.setup (); // Initialize the manager with the configured settings.
 *
 *  ]]> // End of CDATA section.
 * </script>
 *
 *
 * The source code is now structured into distinct sections, separated by form-feed characters.
 * Emacs users can navigate between these sections efficiently using common commands like 'C-x ]'
 * and 'C-x ['.
 *
 * The primary sections are:
 *
 *    1.  This initial comprehensive comment block.
 *    2.  Code related to the `OrgNodes` data structure.
 *    3.  The `org_html_manager` constructor and its setup routines.
 *    4.  Folding and view-related functionalities within `org_html_manager`.
 *    5.  History management methods for `org_html_manager`.
 *    6.  Minibuffer handling implementation for `org_html_manager`.
 *    7.  User input processing by `org_html_manager`.
 *    8.  Search functionality within `org_html_manager`.
 *    9.  Miscellaneous utility functions in `org_html_manager`.
 *    10. Global helper functions.
 */



/**
 * Initializes a new OrgNode object.
 * Each OrgNode encapsulates references to its corresponding DOM elements in the document tree,
 * along with several additional properties describing its state and relationships.
 *
 * @param {HTMLElement} _div        The main DIV element wrapping this OrgNode's content.
 * @param {HTMLElement} _heading    The heading element (e.g., H1, H2) associated with this node.
 * @param {HTMLElement} _link       A link element associated with this node.
 * @param {number}      _depth      The hierarchical depth of this node (e.g., H1 is depth 1).
 * @param {OrgNode}     _parent     A reference to the parent OrgNode.
 * @param {string}      _base_id    The common suffix used for heading and content DIV IDs.
 * @param {HTMLElement} _toc_anchor The anchor element in the Table of Contents linking to this node.
 */
function OrgNode ( _div , _heading , _link , _depth , _parent , _base_id , _toc_anchor )
{
    var t                               =   this;

    t.DIV                               =   _div;
    t.BASE_ID                           =   _base_id;           // The unique ID suffix shared by the heading and content DIVs.
    t.IDX                               =   -1;                 // Stores the index of this node within the OrgHtmlManager::SECS[] array.
    t.HEADING                           =   _heading;
    t.L                                 =   _link;
    t.HAS_HIGHLIGHT                     =   false;              // Flag indicating if this node is currently highlighted (e.g., from a search).
    t.PARENT                            =   _parent;
    t.DIRTY                             =   false;              // A node is marked 'dirty' if its children are folded/unfolded independently.
                                                                // This state implies that the next parent folding action should collapse all.
    t.STATE                             =   OrgNode.STATE_FOLDED;
    t.TOC                               =   _toc_anchor;
    t.DEPTH                             =   _depth;             // The root element has a depth of 0. Other nodes derive their depth
                                                                // from their HTML heading level (h1, h2, etc.).
    t.FOLDER                            =   null;
    t.CHILDREN                          =   new Array();
    t.NAV                               =   "";                 // Placeholder for info navigation elements.
    t.BUTTONS                           =   null;

    if ( null != t.PARENT )
    {
        t.PARENT.addChild ( this );
        t.hide(); // New nodes are hidden by default if they have a parent.
    }

    var folder                          =   document.getElementById("text-" + t.BASE_ID);

    if ( null == folder && _base_id )
    {
        // Fallback for older ID schemas: try to find the folder using a modified ID.
        var fid                         =   _base_id.substring(4);
        folder                          =   document.getElementById("text-" + fid);
    }

    if ( null != folder )
    {
        t.FOLDER                        =   folder; // Assign the found folder element.
    }

    // Initialize an object to store target IDs and their priorities.
    t.isTargetFor                       =   new Object();
    t.isTargetFor['#' + t.BASE_ID]      =   2; // The node's own base ID has a medium priority.

    // Find and register other potential target IDs within the heading and folder.
    OrgNode.findTargetsIn ( t.isTargetFor , t.HEADING , 1 ); // Higher priority for targets within the heading.
    OrgNode.findTargetsIn ( t.isTargetFor , t.FOLDER , 3 );  // Lower priority for targets within the main content folder.
}


/* --- Static variables for OrgNode class --- */

OrgNode.STATE_FOLDED                    =   0; // Node is completely collapsed, only its heading is visible (if at all).
OrgNode.STATE_HEADLINES                 =   1; // Node shows only its children's headlines, but not its own content.
OrgNode.STATE_UNFOLDED                  =   2; // Node is fully expanded, showing all its content and children.


//
// --- Static Helper Functions for OrgNode ---
//

/**
 * Scans a given container element for anchor tags and registers their IDs as potential targets.
 *
 * @param {Object}      safe        The object where target IDs will be stored.
 * @param {HTMLElement} container   The DOM element to search within.
 * @param {number}      priority    The priority level to assign to found targets.
 */
OrgNode.findTargetsIn = function ( safe , container , priority )
{
    if ( container )
    {
        var a                           =   container.getElementsByTagName("a");

        if ( a )
        {
            for ( var i = 0 ; i < a.length ; ++i )
            {
                var n                   =   a[i].getAttribute('id');

                if ( n )
                {
                    safe['#' + n]       =   priority;
                }
                else
                {
                    n                   =   a[i].getAttribute('name');

                    if ( n )
                    {
                        safe['#' + n]   =   priority;
                    }
                }
            }
        }
    }
};


/**
 * Hides a given DOM element by setting its display and visibility styles.
 *
 * @param {HTMLElement} e The element to hide.
 */
OrgNode.hideElement = function ( e )
{
    // Check for 'style' property to avoid errors on elements that might not have it (e.g., fixed TOC or title elements).
    if ( e && e['style'] )
    {
        e.style.display                 =   'none';
        e.style.visibility              =   'hidden';
    }
};


/**
 * Shows a given DOM element by setting its display to 'block' and visibility to 'visible'.
 *
 * @param {HTMLElement} e The element to show.
 */
OrgNode.showElement = function ( e )
{
    if ( e && e['style'] )
    {
        e.style.display                 =   'block';
        e.style.visibility              =   'visible';
    }
};


/**
 * Restores an element's default display and visibility styles, effectively unhiding it.
 *
 * @param {HTMLElement} e The element to unhide.
 */
OrgNode.unhideElement = function ( e )
{
    e.style.display                     =   ""; // Revert to default display.
    e.style.visibility                  =   ""; // Revert to default visibility.
};


/**
 * Checks if a given DOM element is currently hidden.
 *
 * @param {HTMLElement} e The element to check.
 * @returns {boolean} True if the element is hidden, false otherwise.
 */
OrgNode.isHidden = function ( e )
{
    if ( e.style.display == 'none' || e.style.visibility == 'hidden' )
    {
        return true;
    }

    return false;
};


/**
 * Toggles the visibility of a given DOM element. If hidden, it becomes visible; if visible, it becomes hidden.
 *
 * @param {HTMLElement} e The element whose visibility is to be toggled.
 */
OrgNode.toggleElement = function ( e )
{
    if ( e.style.display == 'none' )
    {
        e.style.display                 =   'block';
        e.style.visibility              =   'visible';
    }
    else
    {
        e.style.display                 =   'none';
        e.style.visibility              =   'hidden';
    }
};


/**
 * Traverses up the DOM tree from a given text node to find its containing OrgNode.
 *
 * @param {Node}    dom The starting DOM node (expected to be a text node or a child of the outline container).
 * @param {OrgNode} org The root OrgNode of the document tree, used for searching.
 * @returns {OrgNode|null} The OrgNode corresponding to the text node's container, or null if not found.
 */
OrgNode.textNodeToIdx = function ( dom , org )
{
    // Keep traversing up until an element node with an ID containing "outline-container-" is found.
    while ( dom.nodeType != 1 /* Note: IE lacks Node.ELEMENT_NODE constant, so use 1 directly. */
            || -1 == dom.attributes["id"].value.indexOf("outline-container-") )
    {
        dom                             =   dom.parentNode;
    }

    // Extract the base ID from the container's ID attribute.
    var base_id                         =   dom.attributes["id"].value.substr(18);

    // Find the OrgNode corresponding to this base ID.
    return OrgNode.idxForBaseId ( base_id , org );
};


/**
 * Recursively searches for an OrgNode with a specific base ID within a given OrgNode's subtree.
 *
 * @param {string}  base    The base ID to search for.
 * @param {OrgNode} org     The OrgNode (and its children) to search within.
 * @returns {OrgNode|null} The matching OrgNode, or null if no match is found.
 */
OrgNode.idxForBaseId = function ( base , org )
{
    if ( org.BASE_ID == base )
    {
        return org; // Found a direct match.
    }

    // Recursively search through children.
    for ( var i = 0 ; i < org.CHILDREN.length ; ++i )
    {
        var o                           =   OrgNode.idxForBaseId ( base , org.CHILDREN[i] ); // Corrected: pass 'base' instead of 'idx'.
        if ( null != o )
        {
            return o; // Found in a child's subtree.
        }
    }

    return null; // Not found in this subtree.
};


//
// --- OrgNode Prototype Methods ---
//

/**
 * Adds a child OrgNode to this node's CHILDREN array.
 *
 * @param {OrgNode} child The OrgNode to add as a child.
 * @returns {OrgNode} A reference to the parent node.
 */
OrgNode.prototype.addChild = function ( child )
{
    this.CHILDREN.push(child);
    return this.PARENT;
};


//
// --- OrgNode Methods for Paging (Info Mode) ---
//

/**
 * Hides this OrgNode's main DIV element and recursively hides its parent nodes if they exist.
 * This is primarily used in "info" view mode for navigation.
 */
OrgNode.prototype.hide = function ()
{
    OrgNode.hideElement(this.DIV); // Hide the node's main content wrapper.

    if ( this.PARENT )
    {
        this.PARENT.hide(); // Recursively hide parent if present.
    }
};


/**
 * Shows this OrgNode's main DIV element and recursively shows parent nodes up to a certain depth.
 * Used in "info" view mode.
 */
OrgNode.prototype.show = function ()
{
    OrgNode.showElement(this.DIV); // Show the node's main content wrapper.

    // Show parents up to depth 2 (e.g., if this is H3, show H2 and H1).
    if ( this.DEPTH > 2 )
    {
        this.PARENT.show();
    }
};


/**
 * Recursively shows all children of this OrgNode, and then shows this node itself.
 * Used to expand entire branches of the document tree.
 */
OrgNode.prototype.showAllChildren = function ()
{
    for ( var i = 0 ; i < this.CHILDREN.length ; ++i )
    {
        this.CHILDREN[i].showAllChildren(); // Recurse for all children.
    }

    this.show(); // Finally, show this node.
};


/**
 * Recursively hides all children of this OrgNode, and then hides this node itself.
 * Used to collapse entire branches of the document tree.
 */
OrgNode.prototype.hideAllChildren = function ()
{
    for ( var i = 0 ; i < this.CHILDREN.length ; ++i )
    {
        this.CHILDREN[i].hideAllChildren(); // Recurse for all children.
    }

    this.hide(); // Finally, hide this node.
};


/**
 * Sets the CSS class for the Table of Contents (TOC) link associated with this OrgNode.
 * This helps visually indicate the currently active section and previously visited sections.
 *
 * @param {boolean} on If true, sets the class to "current"; otherwise, sets it to "visited_after_load".
 *                     Note: "visited_after_load" state is reset upon page reload.
 */
OrgNode.prototype.setLinkClass = function ( on )
{
    if ( this.TOC )
    {
        if ( on )
        {
            this.TOC.className          =   "current"; // Mark as the currently active section.
        }
        else
        {
            this.TOC.className          =   "visited_after_load"; // Mark as visited previously.
        }
    }
}


//
// --- OrgNode Methods for Folding Functionality ---
//

/**
 * Toggles the folding state of this OrgNode. This method is typically called via an onclick event.
 * If this node's folding state is changed individually, its parent is marked as 'dirty' to
 * ensure that subsequent folding actions on the parent correctly collapse all children.
 *
 * @param {boolean} hide_folder Optional. If true, prevents this OrgNode from showing its content folder.
 *                              This is primarily used for the special toggling behavior of the ROOT element.
 */
OrgNode.prototype.fold = function ( hide_folder )
{
    if ( this.PARENT )
    {
        this.PARENT.DIRTY               =   true; // Mark parent as dirty because this node's state changed independently.
    }

    if ( this.DIRTY )
    {
        this.DIRTY                      =   false;
        this.STATE                      =   OrgNode.STATE_UNFOLDED; // Reset dirty state; next fold will be FOLDED.
    }

    if ( null != this.FOLDER )
    {
        if ( this.STATE == OrgNode.STATE_FOLDED )
        {
            // If currently folded, clicking means we want to show headlines (if children exist).
            if ( this.CHILDREN.length )
            {
                this.STATE              =   OrgNode.STATE_HEADLINES;
                OrgNode.hideElement(this.FOLDER); // Hide own content.
                for ( var i = 0 ; i < this.CHILDREN.length ; ++i )
                {
                    this.CHILDREN[i].setState(OrgNode.STATE_HEADLINES); // Show children's headlines.
                }
            }
            else if ( ! hide_folder )
            {
                // If no children, directly jump to unfolded state and show content.
                this.STATE              =   OrgNode.STATE_UNFOLDED;
                OrgNode.showElement(this.FOLDER);
            }
        }
        else if ( this.STATE == OrgNode.STATE_HEADLINES )
        {
            // If currently showing headlines, clicking means we want to show all content recursively.
            this.STATE                  =   OrgNode.STATE_UNFOLDED;
            OrgNode.showElement(this.FOLDER); // Show own content.
            for ( var i = 0 ; i < this.CHILDREN.length ; ++i )
            {
                this.CHILDREN[i].setState(OrgNode.STATE_UNFOLDED); // Unfold all children.
            }
        }
        else // this.STATE == OrgNode.STATE_UNFOLDED
        {
            // If currently unfolded, clicking means we want to collapse everything, showing only own headline.
            this.STATE                  =   OrgNode.STATE_FOLDED;
            OrgNode.hideElement(this.FOLDER); // Hide own content.
            for ( var i = 0 ; i < this.CHILDREN.length ; ++i )
            {
                this.CHILDREN[i].setState(OrgNode.STATE_FOLDED); // Fold all children.
            }
        }
    }
};


/**
 * Recursively sets the folding state for this OrgNode and all its children.
 * This function handles the visual display of both the node's content folder and its main DIV wrapper.
 * The states (FOLDED, HEADLINES, UNFOLDED) have a slightly different interpretation here,
 * as OrgNode.STATE_FOLDED will also hide the surrounding div.
 *
 * @param {number} state The desired folding state (OrgNode.STATE_FOLDED, OrgNode.STATE_HEADLINES, or OrgNode.STATE_UNFOLDED).
 */
OrgNode.prototype.setState = function ( state )
{
    var t                               =   this;

    // Recursively set state for all children first.
    for ( var i = 0 ; i < t.CHILDREN.length ; ++i )
    {
        t.CHILDREN[i].setState(state);
    }

    // Apply the state to the current node.
    switch ( state )
    {
        case OrgNode.STATE_FOLDED:
            OrgNode.hideElement(t.FOLDER); // Hide the content area.
            OrgNode.hideElement(t.DIV);    // Hide the entire node's main wrapper.
            break;

        case OrgNode.STATE_HEADLINES:
            OrgNode.hideElement(t.FOLDER); // Hide the content area.
            OrgNode.showElement(t.DIV);    // Show the entire node's main wrapper (to display children's headlines).
            break;

        default: // OrgNode.STATE_UNFOLDED
            OrgNode.showElement(t.FOLDER); // Show the content area.
            OrgNode.showElement(t.DIV);    // Show the entire node's main wrapper.
    }

    t.STATE                             =   state; // Update the internal state.
};



/**
 * The `org_html_manager` object is responsible for managing all OrgNodes within the document.
 * It coordinates view modes, folding, history, and user interaction.
 *
 * The manager's initialization (`setup` method) is deferred because the DOM may not be fully loaded
 * when this script is first parsed.
 */
var org_html_manager = {

    // --- Configuration Options (Publicly Setable) ---
    MOUSE_HINT:                 0,                 // Controls mouse hover highlighting for headings. Can be 'underline' or a color string (e.g., '#eeeeee').
    BODY:                       null,              // Reference to the main content container element (usually the document body or a specific div).
    PLAIN_VIEW:                 0,                 // Constant for "overview" or "plain" view mode.
    CONTENT_VIEW:               1,                 // Constant for "content" view mode (shows structure).
    ALL_VIEW:                   2,                 // Constant for "all" view mode (shows everything).
    INFO_VIEW:                  3,                 // Constant for "info" view mode (single section at a time).
    SLIDE_VIEW:                 4,                 // Constant for "slide" view mode (for presentations).
    VIEW:                       this.CONTENT_VIEW, // The currently active view mode. Default is CONTENT_VIEW, but set in setup().
    LOCAL_TOC:                  false,             // Flag or string indicating local table of contents behavior ("0", "1", "above", "below").
    LINK_HOME:                  0,                 // URL for the "Home" link. If 0, no home link.
    LINK_UP:                    0,                 // URL for the "Up" link (to parent directory). If 0, no up link.
    LINKS:                      "",                // String to store pre-formatted navigation links (Home, Up, Help).
    RUN_MAX:                    1200,              // Maximum number of attempts to scan the document for OrgNodes (~2 minutes at 100ms interval).
    RUN_INTERVAL:               100,               // Interval in milliseconds between document scan attempts.
    HIDE_TOC:                   false,             // Boolean flag: if true, hides the main table of contents.
    TOC_DEPTH:                  0,                 // Numeric level to cut the table of contents. 0 means no cutting.
    STARTUP_MESSAGE:            0,                 // Boolean flag: if true, displays an info message on startup.
    POSTAMBLE:                  null,              // Cached reference to the 'postamble' element in the HTML.

    // --- Private Internal Variables ---
    BASE_URL:                   document.URL,      // The base URL of the current page, without any hash part.
    Q_PARAM:                    "",                // Stores a query parameter (e.g., "?VIEW=content").
    ROOT:                       null,              // The root OrgNode of the document's hierarchical structure.
    NODE:                       null,              // The currently active OrgNode.
    TITLE:                      null,              // Cached reference to the document's title element, used for hide/show.
    INNER_TITLE:                false,             // Flag indicating if the title is cloned into the first section.
    LOAD_CHECK:                 null,              // Stores the ID returned by `setTimeout()` for the document scan loop.
    WINDOW:                     null,              // A DIV element used to display content in "info" view mode.
    SECS:                       new Array(),       // An array containing all discovered OrgNode objects.
    REGEX:                      /(#)(.*$)/,        // Regular expression to identify a section link in the TOC.
    SID_REGEX:                  /(^#)(sec-\d+([._]\d+)*$)/, // Regular expression to identify a plain section ID.
    UNTAG_REGEX:                /<[^>]+>/i,        // Regular expression to remove HTML tags from a string.
    ORGTAG_REGEX:               /^(.*)<span\s+class=[\'\"]tag[\'\"]>(<span[^>]+>[^<]+<\/span>)+<\/span>/i, // Regex to remove Org-mode tags.
    TRIMMER:                    /^(\s*)([^\s].*)(\s*)$/, // Regex for trimming leading and trailing whitespace.
    // FNREF_REGEX:             /(fnr\.*)/,        // Footnote reference regex - currently unused.
    TOC:                        null,              // Cached reference to the Table of Contents element.
    RUNS:                       0,                 // Counter for the number of document scan attempts.
    HISTORY:                    new Array(50),     // Array to store navigation history (last 50 entries).
    HIST_INDEX:                 0,                 // Current index in the history array.
    SKIP_HISTORY:               false,             // Flag to temporarily disable history recording (e.g., during `popHistory`).
    FIXED_TOC:                  false,             // Flag: if true, TOC position is fixed/absolute and should not be modified.

    // --- Command Line / Minibuffer Related ---
    CONSOLE:                    null,              // Reference to the DIV element serving as the minibuffer console.
    CONSOLE_INPUT:              null,              // Reference to the input field within the console.
    CONSOLE_LABEL:              null,              // Reference to the label element in the console.
    CONSOLE_OFFSET:             "50px",            // Offset for console positioning.
    OCCUR:                      "",                // Stores the last search string used in "occur" (search) command.
    SEARCH_REGEX:               "",                // The compiled regular expression for the current search.
    SEARCH_HL_REGEX:            new RegExp('(<span class="org-info-js_search-highlight">)([^<]*?)(<\/span>)', "gi"), // Regex for removing search highlights.
    MESSAGING:                  0,                 // Message display mode (0: none, 1: inplace, 2: top).
    MESSAGING_INPLACE:          1,                 // Constant for inplace messaging.
    MESSAGING_TOP:              2,                 // Constant for top-of-page messaging.

    // --- State Flags ---
    HELPING:                    false,             // True if the help screen is currently displayed.
    READING:                    false,             // True if the console is in a "read" (awaiting input) mode.
    READ_COMMAND:               "",                // Stores the command that initiated the current "read" mode.
    READ_COMMAND_NULL:          "_0",              // Internal ID for null read command.
    READ_COMMAND_HTML_LINK:     "_1",              // Internal ID for HTML link read command.
    READ_COMMAND_ORG_LINK:      "_2",              // Internal ID for Org-mode link read command.
    READ_COMMAND_PLAIN_URL_LINK: "_03",             // Internal ID for plain URL link read command.
    LAST_VIEW_MODE:             0,                 // Stores the view mode prior to a temporary switch (e.g., help).
    TAB_INDEX:                  1000,              // Starting tabindex for dynamically added elements to avoid conflicts.
    SEARCH_HIGHLIGHT_ON:        false,             // True if search highlights are currently active.

    // --- Tag and Section Mapping ---
    TAGS:                       {},                // Object to store tags: {tag:[index1, index2,...], tag2:[indexA, indexB,...]}
    SORTED_TAGS:                new Array(),       // An array of sorted tag names.
    TAGS_INDEX:                 null,              // Caches the HTML content of the tags index screen.
    CLICK_TIMEOUT:              null,              // Stores the timeout ID for mouse click handling.
    SECNUM_MAP:                 {},                // Maps section numbers (e.g., "1.2.3") to their corresponding OrgNode objects.
    TOC_LINK:                   null,              // Stores the last link clicked in the Table of Contents.

    // --- Hook System ---
    HOOKS:                      {
        run_hooks:              false,             // Flag, becomes true after onReady() is executed, enabling hooks.
        onShowSection:          [],                // Array of functions to call when a section is shown.
        onReady:                []                 // Array of functions to call when the manager is fully ready.
    },


    /**
     * Initializes the OrgHtmlManager by checking and adjusting user-defined settings,
     * and sets up the periodic document scan for OrgNodes.
     * This method is where user-settable configuration variables are validated.
     */
    setup: function ()
    {
        var t                           =   this; // Reference to the manager object.

        // Load custom hooks if defined globally.
        if ( window['orgInfoHooks'] )
        {
            for ( var i in orgInfoHooks )
            {
                t.HOOKS[i]              =   orgInfoHooks[i];
            }
            t.HOOKS['run_hooks']        =   false; // Hooks are not yet runnable until onReady.
        }

        // Process URL query parameters to allow overwriting of settings.
        if ( location.search )
        {
            var sets                    =   location.search.substring(1).split('&');

            for ( var i = 0 ; i < sets.length ; ++i )
            {
                var pos                 =   sets[i].indexOf('=');

                if ( -1 != pos )
                {
                    var v               =   sets[i].substring(pos + 1);
                    var k               =   sets[i].substring(0, pos);

                    switch ( k )
                    {
                        // Explicitly allowed parameters that can be overwritten via URL.
                        case 'TOC':
                        case 'TOC_DEPTH':
                        case 'MOUSE_HINT':
                        case 'HELP':
                        case 'VIEW':
                        case 'HIDE_TOC':
                        case 'LOCAL_TOC':
                        case 'OCCUR':
                            t.set(k, decodeURIComponent(v)); // Set the manager property.
                            break;

                        default: // Ignore other query parameters by default.
                            break;
                    }
                }
            }
        }

        // Normalize and validate configuration values.
        t.VIEW                          =   t.VIEW ? t.VIEW : t.PLAIN_VIEW;
        t.VIEW_BUTTONS                  =   ( t.VIEW_BUTTONS && t.VIEW_BUTTONS != "0" ) ? true : false;
        t.STARTUP_MESSAGE               =   ( t.STARTUP_MESSAGE && t.STARTUP_MESSAGE != "0" ) ? true : false;
        t.LOCAL_TOC                     =   ( t.LOCAL_TOC && t.LOCAL_TOC != "0" ) ? t.LOCAL_TOC : false;
        t.HIDE_TOC                      =   ( t.TOC && t.TOC != "0" ) ? false : true; // T.TOC is a string, not boolean.
        t.INNER_TITLE                   =   ( t.INNER_TITLE && t.INNER_TITLE != "title_above" ) ? false : true;

        if ( t.FIXED_TOC && t.FIXED_TOC != "0" )
        {
            t.FIXED_TOC                 =   true;
            t.HIDE_TOC                  =   false; // Cannot hide TOC if it's fixed.
        }
        else
        {
            t.FIXED_TOC                 =   false;
        }

        // Construct the navigation links string.
        t.LINKS += ( ( t.LINK_UP && t.LINK_UP != document.URL ) ? '<a href="' + t.LINK_UP + '">Up</a> / ' : "" ) +
                   ( ( t.LINK_HOME && t.LINK_HOME != document.URL ) ? '<a href="' + t.LINK_HOME + '">HOME</a> / ' : "" ) +
                   '<a href="javascript:org_html_manager.showHelp();">HELP</a> / ';

        // Start the periodic check for document readiness.
        t.LOAD_CHECK                    =   window.setTimeout("OrgHtmlManagerLoadCheck()", 50);
    },


    /**
     * Trims leading and trailing whitespace from a string.
     *
     * @param {string} s The input string to trim.
     * @returns {string} The trimmed string.
     */
    trim: function ( s )
    {
        var r                           =   this.TRIMMER.exec(s);
        return RegExp.$2; // Return the captured group containing the string without leading/trailing spaces.
    },


    /**
     * Removes all HTML tags from a given string.
     *
     * @param {string} s The input string containing HTML.
     * @returns {string} The string with HTML tags stripped out.
     */
    removeTags: function ( s )
    {
        if ( s )
        {
            // Repeatedly remove tags until no more are found.
            while ( s.match(this.UNTAG_REGEX) )
            {
                s                       =   s.substr(0, s.indexOf('<')) + s.substr(s.indexOf('>') + 1);
            }
        }
        return s;
    }
};