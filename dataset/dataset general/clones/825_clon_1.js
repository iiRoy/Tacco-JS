var      dirname_re =/^.*\//; /* This regular expression captures the directory name up to the last slash. */



// Given the data from pages.json, build the navigation links that should
// appear in the header, and insert them there.
function build_header_nav(   data   ) {
    /*
     * FIXME this code is disgusting, rewrite it. It's a mess of conditional logic.
     * This function's primary purpose is to dynamically create the top-level
     * navigation menu items based on the provided site data.
     */
    var nav = $.map( data, function(item, i) {
        // The 'data' parameter contains all pages in the site.
        // Toplevel navigation headers should include all direct children of the root.
        // Specifically, these are nodes conforming to the pattern:
        //      (root)/something/index.html
        // And importantly, it excludes the root's own index.html page:
        //      (root)/index.html

        // Skip the dummy object that might mark the end of the array,
        // or any item without a valid title.
        if (!item.title) {
            return;
        }

        // Filter out anything that isn't a direct subdirectory's index.html.
        // For example, "sub/index.html" is okay, "sub/sub2/index.html" is not.
        var path = item.path.substr(1).split('/');
        // If the path has more than 2 segments (e.g., "a/b/c"), it's too deep.
        if (path.length > 2) return;
        // If it has 2 segments, the second MUST be "index.html".
        if (path.length == 2 && path[1] != "index.html") {
            return;
        }
        // Path must have at least one segment.
        if (path.length < 1) return;
        // Exclude the root index.html itself.
        if (path[0] == "index.html") return;

        // Construct the full target URL for the navigation link.
        var target = site_root + path.join('/');
        // Initialize a variable to hold the CSS class for the current page.
        var current = '';
        // Check if the current window location matches the target link.
        // This handles cases like "/about/" vs "/about/index.html".
        if (window.location.pathname == target ||
            (window.location.pathname.substr(-1) == '/' &&
             window.location.pathname + "index.html" == target)) {
            current = 'active'; // Mark as active if it's the current page.
        }

        // Build up the HTML string for the navigation list item.
        return (
            "<li class='" + current +
            "'><a href=\'"+ target +
            "\'>" + (item.short_title || item.title) +
            "</a></li>"
        );

    }).join(""); /* Joins all generated list items into a single string. */
    nav = $(nav) // Convert the HTML string into a jQuery object.


    // Ensure the DOM is fully loaded before attempting to append elements.
    $(document).ready(function(){
        // Find the unordered list with class 'nav' and append the generated navigation items.
        $('ul.nav').append(nav);
    });
} /* End of build_header_nav function */


// Can be passed in data.sort() to sort by modification date.
function sort_modified(a,b)
{
    // FIXME use this somewhere... This function is currently unused.
    return a.modified - b.modified;
}


// Given data in the form of pages.json, build an object tree.
function build_tree(data)
{
    // FIXME TODO: This function is a placeholder and not yet implemented.
    data.forEach(function(v){

    });
}


// Given the data from pages.json, build a hierarchical site-map.
function build_sitemap(data)
{
    // FIXME TODO: This function is also a placeholder.
    var target = $('#sitemap');
    // If there's no element with id 'sitemap' on the page, do nothing.
    if (!target.length) return;
}


// Given the data from pages.json, build a list of child nodes of the current page.
function build_child_links(data) {
    /*
     * FIXME this code is disgusting, rewrite it. Similar to header nav,
     * it's quite complex.
     * This function generates a list of links to child pages
     * for the *current* page being viewed.
     */
    var nav = $.map(data, function(item, i){
        // 'data' contains all site pages. Child links should be
        // direct children of the *current* node.
        // E.g., if current page is (blah)/, we look for (blah)/something/index.html.
        // If current page is (blah)/index.html, same pattern applies.

        // Skip items without a title, likely dummy objects.
        if (!item.title) return;

        // Throw out anything that's not a direct child's index.html
        // relative to the current page's path.
        var current = window.location.pathname;
        var path = site_root + item.path.substr(1);

        // Normalize the current path: remove "index.html" if present.
        if (current.substr(-10) == "index.html") {
            current = current.slice(0,-10);
        }

        // Check if the item's path starts with the current page's path.
        if (path.substr(0,current.length) != current) return;
        // Check if the remaining part of the path (after the current path)
        // has exactly two segments (e.g., "something/index.html").
        if (path.substr(current.length).split('/').length != 2) return;

        // Build up the HTML for the object.
        return (
            "<li><a href=\'"+
            path +
            "\'>" +
            (item.short_title || item.title) +
            "</a></li>"
        );

    }).join(""); // Concatenate all generated list items.
    nav = $("<ul>" + nav + "</ul>"); // Wrap the generated links in an unordered list.


    // Execute this code once the DOM is fully loaded.
    $(document).ready(function(){
        // Find an <h2> element that contains the text "Child pages".
        var target = $('h2:contains(Child pages)');
        // If no such heading is found, there's nowhere to insert the links.
        if (!target.length) return;
        // Insert the generated navigation list immediately after the target heading.
        target.after(nav);
    });
} /* End of build_child_links function */


// Fetch the pages.json data asynchronously.
$.getJSON(site_root + 'pages.json')
    // Once data is successfully loaded, call build_header_nav.
    .done(build_header_nav)
    // Then, using the same data, call build_child_links.
    .done(build_child_links);
    // The following functions are commented out as they are not yet implemented or desired.
    // .done(build_sitemap)