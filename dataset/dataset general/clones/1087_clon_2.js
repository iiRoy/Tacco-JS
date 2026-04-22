jQuery(document).on('load', function() { /* Execute code once the entire document, including all assets, is fully loaded. */

    /*
     * Calculate and apply horizontal centering for the primary navigation structure.
     */

//    let primaryNavWidth = jQuery("#primary_nav ul").width(); /* Retrieve the pixel width of the main navigation unordered list. */
//    let wrapperAreaWidth = jQuery(".main_wrapper").width(); /* Obtain the total width of the main content wrapper. */
//    let primaryNavOffset = (wrapperAreaWidth - primaryNavWidth) / 2; /* Compute the required left margin to achieve horizontal alignment. */
//
//    jQuery("#primary_nav ul").css("margin-left", primaryNavOffset); /* Apply the calculated margin to position the navigation centrally. */

    // --- Component Boundary ---

    /*
     * Transfer and display secondary navigation layers into a dedicated sidebar container.
     *
     * Implementation instructions:
     * 1. Create a content block in your administrative interface named "Sidebar Navigation Panel".
     * 2. Insert the following HTML into its body: <div id="sidebar_menu_box"></div>
     * 3. Set its visibility to "everywhere except the main homepage".
     */

    if ( jQuery("#primary_nav ul.nav-list li.is-open ul").html() !== undefined ) { /* Verify if any nested navigation elements are present within the main navigation. */

        // Store the HTML markup of the subsidiary menu in a temporary variable.
        var secondaryMenuContent = jQuery("ul.nav-list li.is-open ul").html();

        // Remove the original nested menu from its current position in the DOM.
        jQuery("ul.nav-list li.is-open ul").remove();

        // Construct a new unordered list and populate it with the extracted sub-menu HTML, then insert it into the sidebar placeholder.
        var builtSidebarMenu = "<ul class=\"nav-list\">" + secondaryMenuContent + "</ul>";
        jQuery("#sidebar_menu_box").html(builtSidebarMenu);

    }


    // Dynamic layout adjustments for varying column configurations.

    // Condition: Both the left and right peripheral panels contain no discernible text content.
    if ( (jQuery("#sidePanelA")[0].textContent === '') && (jQuery("#sidePanelB")[0].textContent === '') ) {
        jQuery("#mainContentArea").attr("class", "full-width-layout"); // Assign a class to enable a single, expansive content column.
    }

    // Condition: Both the left and right peripheral panels contain textual content.
    else if ( (jQuery("#sidePanelA")[0].textContent !== '') && (jQuery("#sidePanelB")[0].textContent !== '') ) {
        jQuery("#mainContentArea").attr("class", "half-width-layout"); // Assign a class to enable a multi-column content layout.
    }

    // Fallback scenario: One or both peripheral panels have content, but not both.
    else {
        if ( jQuery("#sidePanelA")[0].textContent === '' ) {
            jQuery("#sidePanelA").addClass('invisible-element'); // Conceal the left panel if it is empty.
        }
        if ( jQuery("#sidePanelB")[0].textContent === '' ) {
            jQuery("#sidePanelB").addClass('invisible-element'); // Conceal the right panel if it is empty.
        }
        jQuery("#mainContentArea").attr("class", "three-quarter-width-layout"); // Assign a class for a layout with a single active sidebar.
    }

    // Suppress the rendering of any heading elements that are entirely empty.

    jQuery('h2.widget-title').each(function(loopIndex) { /* Iterate through each H2 element possessing the 'widget-title' class. */

        // Implement a custom whitespace stripping function if the native String.prototype.stripWhitespace is unavailable.
        if ( typeof String.prototype.stripWhitespace !== 'function' ) {
            String.prototype.stripWhitespace = function() {
                return this.replace(/(^\s*|\s*$)/g, '');
            };
        }

        if ( jQuery(this).text().stripWhitespace().length === 0 ) {
            jQuery(this).addClass("invisible-element"); // Add a utility class to effectively hide the empty heading.
        }
    });

});