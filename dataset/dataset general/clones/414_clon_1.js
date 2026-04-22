/*
 *  Foundation v2.2.1 - Core JavaScript File
 *  http://foundation.zurb.com - ZURB Foundation Framework
 *  This script handles various UI components and interactions.
 */

jQuery(document) . ready ( function($) {

    // This section contains all application-specific JavaScript code.
    // It's executed once the entire DOM is ready for manipulation.

    /*
     *  TABS COMPONENT ----------------------------------------------------
     *  You can safely remove this entire block if your project
     *  does not require tabbed content functionality.
     */

    /**
     * Activates a specified tab and displays its corresponding content panel.
     * @param {jQuery} $tab - The jQuery object representing the tab (anchor element) to activate.
     */
    function activateTab ($tab) {
        // Retrieve the currently active tab within the same tab group.
        var $activeTab = $tab . closest('dl') . find('a.active'),
            // Construct the content location ID from the tab's href attribute.
            contentLocation = $tab . attr("href") + 'Tab';

        // Internet Explorer often prepends the full URL to href values.
        // This line strips off any leading URL parts, leaving only the hash.
        contentLocation = contentLocation . replace(/^.+#/, '#');

        // Remove 'active' class from the previously active tab.
        $activeTab . removeClass('active');
        // Add 'active' class to the newly selected tab.
        $tab . addClass('active');

        // Hide all sibling content panels and then show the one corresponding to the active tab.
        // This ensures only one tab content is visible at a time.
        $(contentLocation) . closest('.tabs-content') . children('li') . hide();
        $(contentLocation) . css('display', 'block');
    } /* End of activateTab function */

    // Initialize tab functionality for all elements with class 'dl.tabs'.
    $('dl.tabs') . each ( function () {
        // Get all individual tabs (anchor elements) within this tab group.
        var tabs = $(this) . children('dd') . children('a');
        // Attach a click event handler to each tab.
        tabs . click ( function (e) {
            // Prevent the default anchor click behavior (page jump).
            e . preventDefault();
            // Call activateTab with the clicked tab.
            activateTab($(this));
        });
    });

    // Check if the URL contains a hash, indicating a specific tab should be active on page load.
    if (window . location . hash) {
        // Activate the tab whose href matches the URL hash.
        activateTab ($('a[href="' + window . location . hash + '"]'));
        // Re-apply custom form markup (if Foundation custom forms are in use).
        $.foundation . customForms . appendCustomMarkup();
    } /* End of hash check */

    /*
     *  ALERT BOXES ---------------------------------------------------------
     *  Handles the closing mechanism for alert boxes.
     */
    $(".alert-box") . delegate ("a.close", "click", function(event) {
        // Stop the default action of the link (e.g., navigating to #).
        event . preventDefault();
        // Fade out the parent alert box, then remove it from the DOM after animation.
        $(this) . closest(".alert-box") . fadeOut ( function(event){
            $(this) . remove();
        });
    }); /* End of alert box delegate */


    /*
     *  PLACEHOLDER FOR FORMS -----------------------------------------------
     *  Integrates jQuery Placeholder plugin for older browsers.
     *  Remove this line and jquery.placeholder.min.js if not needed.
     */
    $('input, textarea') . placeholder();

    /*
     *  TOOLTIPS ------------------------------------------------------------
     *  Initializes tooltips functionality.
     */
    $(this) . tooltips();


    /*
     *  BLOCK GRID SUPPORT FOR IE6/7/8 --------------------------------------
     *  Uncomment the appropriate line(s) below if you are using .block-grids
     *  and require specific clearfixes for older Internet Explorer versions.
     */
    // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'left'}); // Two columns
    // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'left'}); // Three columns
    // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'left'}); // Four columns
    // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'left'}); // Five columns


    /*
     *  DROPDOWN NAVIGATION -------------------------------------------------
     *  Manages the behavior of dropdown navigation menus (flyouts).
     */
    var lockNavBar = false; // Prevents multiple flyouts from opening/closing simultaneously.

    // Using .live() for dynamically added elements (deprecated in jQuery 1.9+, use .on()).
    $('.nav-bar a.flyout-toggle') . live ( 'click', function(e) {
        e . preventDefault(); // Prevent default link behavior.

        var flyout = $(this) . siblings('.flyout'); // Get the associated flyout menu.

        // Only proceed if the navigation bar is not currently locked.
        if (lockNavBar === false) {
            // Close any other open flyouts in the navigation bar.
            $('.nav-bar .flyout') . not(flyout) . slideUp(500);
            // Toggle the clicked flyout's visibility with a slide animation.
            flyout . slideToggle(500, function(){
                lockNavBar = false; // Unlock nav bar after animation completes.
            });
        }
        lockNavBar = true; // Lock nav bar immediately to prevent rapid clicks.
    }); /* End of flyout-toggle click handler */

    // Check for touch device support using Modernizr.
    if (Modernizr . touch) {
        // Adjust padding for main links in touch-enabled dropdowns.
        $('.nav-bar>li.has-flyout>a.main') . css({
            'padding-right' : '75px'
        });
        // Add a border to the flyout toggle for visual separation on touch devices.
        $('.nav-bar>li.has-flyout>a.flyout-toggle') . css({
            'border-left' : '1px dashed #eee'
        });
    } else {
        // For non-touch devices, use hover events for dropdowns.
        $('.nav-bar>li.has-flyout') . hover ( function() {
            $(this) . children('.flyout') . show(); // Show flyout on hover in.
        }, function() {
            $(this) . children('.flyout') . hide(); // Hide flyout on hover out.
        })
    } /* End of Modernizr.touch check */


    /*
     *  DISABLED BUTTONS ----------------------------------------------------
     *  This section is commented out in the original, but the comment
     *  suggests a feature for 'disabled' elements.
     *  No active code here.
     */
    /* Gives elements with a class of 'disabled' a return: false; */

    /**
     * Extracts the value of a specific query parameter from the current URL.
     * @param {string} name - The name of the query parameter to retrieve.
     * @returns {string} The decoded value of the parameter, or an empty string if not found.
     */
    function getParameterByName(name)
    {
        // Escape special characters in the parameter name for regex safety.
        name = name . replace(/[\[]/, "\\\[") . replace(/[\]]/, "\\\]");
        // Construct the regular expression for finding the parameter.
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        // Execute the regex against the URL's query string.
        var results = regex . exec(window . location . search);

        // If no results are found, return an empty string.
        if (results == null) {
            return "";
        } else {
            // Decode the URI component, replacing '+' with spaces.
            return decodeURIComponent(results[1] . replace(/\+/g, " "));
        }
    } /* End of getParameterByName function */

    // Get 'date' parameter from URL and format it using Moment.js.
    var display_date = moment(getParameterByName("date"), "YYYY-MM-DD");
    // Update the element with ID 'edition' to display the formatted date.
    $("#edition") . html (display_date . format("DD/MM/YYYY"));

    // Make an AJAX call to retrieve an XML feed from Feedburner.
    $.ajax({
        type: "GET", // HTTP GET request.
        url: "http://feeds.feedburner.com/Octocats?format=xml", // URL of the XML feed.
        dataType: "xml", // Expected data type is XML.
        success: function(xml) {
            // On successful retrieval, parse the XML to find 'entry' elements.
            var entries = $(xml) . find('entry');
            // Select a random entry from the list.
            var selected_entry = entries[Math . floor(Math . random() * (entries . length + 1))];

            // Check if there's an entry matching the display_date.
            // This part of the code might have a bug: 'entries.find('updated')[0]'
            // will only get the first 'updated' element across ALL entries.
            // It should likely be 'entries.eq(0).find('updated')[0]' for the first entry's date.
            var first_entry_day = moment(entries . find('updated')[0] . textContent . split("T")[0], "YYYY-MM-DD");
            // If the first entry's date matches the display_date, select it.
            if (first_entry_day . diff(display_date, 'days') == 0){
                selected_entry = entries[0]
            }

            // Update the 'octodex' element with an image from the selected entry.
            $("#octodex") . html ("<span class='fancy'><img src='" + $(selected_entry) . find('img') . attr('src') + "'></span>");
        }
    }); /* End of Octocats AJAX call */

    // Make a JSON GET request to a local file path.
    $.getJSON ("file:///tmp/" + display_date . format("YYYY-MM-DD[.json]"), function(data) {
        var items = []; // Initialize an array to hold generated HTML list items.
        console . log("data: " + data . length); // Log the length of the received data.

        // Iterate over the main data object (likely an array of repositories).
        $.each (data, function(key, repo) {
            var items = []; // Re-initialize items array for each repository group.
            var max_count = repo[0]["count"]; // Get the maximum count for scaling.

            // Iterate over each individual repository within the current group.
            $.each (repo, function(){
                // Start building the HTML for a list item.
                items . push ("<li class='project'><span class='count black round label' style='padding-left:");
                // Calculate padding based on count relative to max_count.
                items . push (Math . abs(this["count"] * 50 / max_count));
                items . push ("px'>" + this["count"] + "</span>");
                // If a language is specified, add a language label.
                if (this["language"] != null) {
                    items . push ("<span class='lang black radius label'>" + this["language"] + "</span>");
                }
                items . push ("<br><a href='http://github.com/" + this["owner"] + "/" + this["name"] + "/'>");
                items . push (this["owner"] + "/" + this["name"] + "</a></li>");
            });
            // Join the HTML fragments and insert them into the element identified by 'key'.
            $("#" + key) . html (items . join(""));
        });
    }); /* End of getJSON call */

}); /* End of jQuery(document).ready() */