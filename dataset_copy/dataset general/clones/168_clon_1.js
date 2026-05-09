var Gmail = function (localJQuery) {

    // This is a Type I clone of the original Gmail API wrapper.
    // The objective is to make it visually distinct through changes
    // in whitespace and comments, while maintaining identical
    // identifiers, operators, and logical structure.

    var $ ; // Declare the jQuery variable here.

    /*
     * This block handles the injection of the jQuery object.
     * It prioritizes a locally passed jQuery instance to prevent
     * conflicts with other scripts or browser extensions that might
     * also be using the global '$' symbol.
     * If a local instance is not provided, it attempts to use the
     * globally available 'jQuery' object.
     */
    if (typeof localJQuery !== "undefined") {
        $ = localJQuery ; // Use the provided local jQuery.
    }
    // Fallback to the global jQuery object if localJQuery is not defined.
    else if (typeof jQuery !== "undefined") {
        $ = jQuery ; // Use the global jQuery.
    }
    // If neither is found, $ remains undefined. This might necessitate
    // external handling or indicate that jQuery-dependent functions
    // will not operate correctly.


    var api = {
        get     :   {},         // Contains methods for retrieving data from Gmail.
        observe :   {},         // Houses methods for observing changes in Gmail's UI/data.
        check   :   {},         // Provides methods to check the current state or features of Gmail.
        tools   :   {},         // A collection of general utility functions.
        tracker :   {},         // Manages internal tracking data and global Gmail variables.
        dom     :   {},         // Offers methods for interacting with Gmail's Document Object Model.
        chat    :   {},         // Dedicated to chat-related functionalities.
        compose :   {}          // Contains methods pertaining to the email composition window.
    };


    // Initialize core properties and internal tracking data.
    api.version             = "0.4" ; // The current version string for this API.
    api.tracker.globals     = GLOBALS ; // A direct reference to Gmail's internal GLOBALS array.
    api.tracker.view_data   = typeof VIEW_DATA !== 'undefined' ? VIEW_DATA : [] ; // Data specific to the current Gmail view.
    api.tracker.ik          = api.tracker.globals[9] ; // A unique identifier, often related to the user's session or account.
    api.tracker.hangouts    = undefined ; // Placeholder for Hangouts data, initially not set.


    /**
     * Retrieves details about the user's last active session.
     *
     * @returns {object} An object containing:
     *   - `time`: The absolute timestamp of the last activity.
     *   - `ip`: The IP address from which the activity originated.
     *   - `mac_address`: The MAC address associated (may be generic or null).
     *   - `time_relative`: A human-readable relative time string (e.g., "5 minutes ago").
     */
    api.get.last_active = function () {
        var data = api.tracker.globals[17][15] ; // Accessing deeply nested global data for activity info.

        return {
            time          : data[1],        // Absolute time.
            ip            : data[3],        // IP address.
            mac_address   : data[9],        // MAC address.
            time_relative : data[10]        // Relative time string.
        } ;
    } ;


    /**
     * Fetches a list of all Google accounts currently logged into Gmail.
     *
     * @returns {Array<object>} An array where each object represents a user,
     *   containing their `name` and `email`.
     */
    api.get.loggedin_accounts = function () {
        var data = api.tracker.globals[17][23] ; // Global data structure for logged-in accounts.
        var users = [] ; // Initialize an empty array for user objects.

        for (i in data[1]) { // Iterate through the account data.
            // Construct user object and add to the list.
            users.push({name : data[1][i][4], email : data[1][i][0]}) ;
        }

        return users ; // Return the complete list of logged-in users.
    } ;


    /**
     * Retrieves the email address of the currently active Gmail user.
     *
     * @returns {string} The user's primary email address.
     */
    api.get.user_email = function () {
        return api.tracker.globals[10] ; // The user's email is found at this specific global index.
    } ;


    /**
     * Attempts to determine the current localization string (e.g., "en", "fr-CA").
     * This function checks multiple potential locations within Gmail's global variables.
     *
     * @returns {string|null} The locale string if successfully identified, otherwise `null`.
     */
    api.get.localization = function () {
        var isLocale = function (locale) {
            // A valid locale string must be a string of at least 2 characters,
            // and its first two characters must be lowercase (e.g., "en", not "US").
            if (!locale || ((typeof locale) !== 'string') || locale.length < 2) {
                return false ;
            }

            var localePrefix = locale.slice(0, 2) ; // Get the first two characters.
            return localePrefix.toLowerCase() === localePrefix ; // Check if they are lowercase.
        } ;

        var globals = api.tracker.globals ; // Reference to global variables for brevity.

        // First candidate location for the locale string.
        var locale = globals[17] && globals[17][8] && globals[17][8][8] ;
        if (isLocale(locale)) {
            return locale ;
        }

        // Second candidate location, if the first one yields no valid locale.
        locale = globals[17] && globals[17][9] && globals[17][9][8] ;
        if (isLocale(locale)) {
            return locale ;
        }

        return null ; // If no locale is found after all checks.
    } ;


    // Checks if the current view is a conversation thread (i.e., multiple emails grouped together).
    api.check.is_thread = function () {
        var check_1 = $('.nH .if').children(":eq(1)").children().children(":eq(1)").children() ; // DOM structure check.
        var check_2 = api.get.email_ids() ; // Check number of email IDs in the current view.

        return check_1.length > 1 || check_2.length > 1 ; // If more than one element or ID, it's likely a thread.
    } ;


    // Retrieves the main content area of the inbox.
    api.dom.inbox_content = function () {
        return $('div[role=main]:first') ; // Targets the primary 'main' role div.
    } ;


    /**
     * Determines if the preview pane feature is currently enabled and visible in the inbox.
     *
     * @returns {boolean} `true` if a preview pane is detected, `false` otherwise.
     */
    api.check.is_preview_pane = function () {
        var dom = api.dom.inbox_content() ; // Get the main inbox content DOM.
        var boxes = dom.find("[gh=tl]") ; // Look for top-level elements within the inbox.

        var previewPaneFound = false ; // Flag to indicate if the pane is found.
        boxes.each(function () {
            if ($(this).hasClass('aia')) { // A specific class 'aia' is often associated with the preview pane.
                previewPaneFound = true ;
            }
        }) ;

        return previewPaneFound ; // Return the result.
    } ;

    // Checks if the user has multiple inboxes configured (e.g., Primary, Social, Promotions).
    api.check.is_multiple_inbox = function () {
        var dom = api.dom.inboxes() ; // Get all detected inbox DOM elements.
        return dom.length > 1 ; // If there's more than one, multiple inboxes are active.
    } ;


    // Checks if the inbox layout is a horizontal split (e.g., email list on left, preview on right).
    api.check.is_horizontal_split = function () {
        var dom = api.dom.inbox_content() ; // Main inbox content.
        var box = dom.find("[gh=tl]").find('.nn') ; // Look for a specific class that indicates a non-horizontal layout.

        return box.length == 0 ; // If '.nn' is absent, it suggests a horizontal split.
    } ;


    // Checks if the inbox layout is a vertical split (e.g., email list on top, preview below).
    api.check.is_vertical_split = function () {
        return api.check.is_horizontal_split() == false ; // Vertical split is the logical opposite of horizontal split.
    } ;


    // Determines if the tabbed inbox interface (e.g., Primary, Social, Promotions) is active.
    api.check.is_tabbed_inbox = function () {
        return $(".aKh").length == 1 ; // The presence of this specific class indicates tabbed inbox.
    } ;


    // Verifies if the chat sidebar is positioned on the right side of the Gmail interface.
    api.check.is_right_side_chat = function () {
        // Checks a specific attribute of the chat container element.
        return $('.ApVoH')[0].getAttribute('aria-labelledby') == ':wf' ;
    } ;


    // Checks if the current user is a Google Apps (now Google Workspace) user.
    api.check.is_google_apps_user = function () {
        var email = api.get.user_email() ; // Retrieve the user's email address.
        // Google Apps users typically do not have emails ending in 'gmail.com'.
        return email.indexOf('gmail.com', email.length - 'gmail.com'.length) == -1 ;
    } ;


    /**
     * Retrieves information about the user's current storage usage within Gmail.
     *
     * @returns {object} An object containing:
     *   - `used`: The amount of storage currently used (as a string, e.g., "10 GB").
     *   - `total`: The total available storage (as a string, e.g., "15 GB").
     *   - `percent`: The percentage of storage used (as an integer).
     */
    api.get.storage_info = function () {
        var div = $('.md.mj').find('div')[0] ; // Locate the DOM element displaying storage info.
        var used = $(div).find('span')[0].text ; // Extract the text for used storage.
        var total = $(div).find('span')[1].text ; // Extract the text for total storage.
        // Calculate the percentage of storage used, stripping non-numeric characters.
        var percent = parseFloat(used.replace(/[^0-9\.]/g, '')) * 100 / parseFloat(total.replace(/[^0-9\.]/g, '')) ;

        return {used : used, total : total, percent : Math.floor(percent)} ; // Return a formatted object.
    } ;


    // Retrieves all top-level inbox DOM elements.
    api.dom.inboxes = function () {
        var dom = api.dom.inbox_content() ; // Get the main inbox content.
        return dom.find("[gh=tl]") ; // Find all elements marked as 'top-level' (tl).
    } ;

    // Fetches the jQuery object representing the email subject line's DOM element.
    api.dom.email_subject = function () {
        var e = $(".hP") ; // Selects elements typically used for email subjects.

        for (var i = 0; i < e.length; i++) { // Iterate through potential subject elements.
            if ($(e[i]).is(':visible')) { // Return the first visible subject element.
                return $(e[i]) ;
            }
        } ;

        return $() ; // Return an empty jQuery object if no visible subject is found.
    } ;


    // Gets the plain text content of the currently displayed email's subject.
    api.get.email_subject = function () {
        var subject_dom = api.dom.email_subject() ; // Get the subject's DOM element.

        return subject_dom.text() ; // Return its text content.
    } ;


    // Retrieves the jQuery object representing the email body's DOM element.
    api.dom.email_body = function () {
        return $('.nH.hx') ; // Selects the specific class combination for the email body.
    } ;

    // Returns the jQuery object for the main Gmail toolbar.
    api.dom.toolbar = function () {
        var tb = $("[gh='mtb']") ; // Find the element with the 'main toolbar' attribute.

        while ($(tb).children().length == 1) { // Traverse down the DOM if the toolbar is wrapped.
            tb = $(tb).children().first() ;
        }

        return tb ; // Return the actual toolbar element.
    } ;


    /**
     * Checks if the user is currently viewing an email, either in full view or via a preview pane.
     *
     * @returns {boolean} `true` if an email is being viewed, `false` otherwise.
     */
    api.check.is_inside_email = function () {
        // If on a different page or if a preview pane is active, it might not be considered "inside email" in the traditional sense.
        if (api.get.current_page() != null && !api.check.is_preview_pane()) {
            return false ;
        }

        var items = $('.ii.gt') ; // Select all email content items.
        var ids = [] ; // Array to store visible email content elements.

        for (var i = 0; i < items.length; i++) {
            var mail_id = items[i].getAttribute('class').split(' ')[2] ; // Extract mail ID from class list.
            // Check for valid mail ID and visibility.
            if (mail_id != 'undefined' && mail_id != undefined) {
                if ($(items[i]).is(':visible')) {
                    ids.push(items[i]) ;
                }
            }
        }

        return ids.length > 0 ; // If any visible email content is found, user is inside an email.
    } ;


    /**
     * Retrieves the DOM elements that constitute the content of the email(s) currently being viewed.
     * This function filters out any editable content sections.
     *
     * @returns {Array<HTMLElement>} An array of HTML elements representing the email contents.
     */
    api.dom.email_contents = function () {
        var items = $('.ii.gt') ; // Selects all elements identified as email content.
        var ids = [] ; // Array to hold the filtered content elements.

        for (var i = 0; i < items.length; i++) {
            var mail_id = items[i].getAttribute('class').split(' ')[2] ; // Extract the mail ID.
            var is_editable = items[i].getAttribute('contenteditable') ; // Check if the element is editable.
            // Only include elements with a valid mail ID and that are not editable.
            if (mail_id != 'undefined' && mail_id != undefined) {
                if (is_editable != 'true') {
                    ids.push(items[i]) ;
                }
            }
        }

        return ids ; // Return the array of email content elements.
    } ;


    /**
     * Gets the unique IDs of the emails currently displayed in the active view.
     * This is primarily used when inside an email conversation.
     *
     * @returns {Array<string>} An array of email IDs. Returns an empty array if not in an email view.
     */
    api.get.email_ids = function () {
        if (api.check.is_inside_email()) {
            var data = api.get.email_data() ; // Assumes api.get.email_data() provides relevant thread data.
            return Object.keys(data.threads) ; // Return the keys (IDs) from the threads object.
        }
        return [] ; // Return an empty array if not in an email view.
    } ;

    /**
     * Retrieves the IDs of any currently open email compose windows.
     *
     * @returns {Array<string>} An array of unique identifiers for open compose windows.
     */
    api.get.compose_ids = function () {
        var ret = [] ; // Initialize an empty array for compose IDs.
        var dom = $(".AD [name=draft]") ; // Select all draft input fields within compose windows.
        for (var i = 0; i < dom.length; i++) {
            if (dom[i].value != "undefined") { // Ensure the draft value is a valid ID.
                ret.push(dom[i].value) ; // Add the draft ID to the return array.
            }
        } ;
        return ret ; // Return the list of compose IDs.
    } ;

    /**
     * Fetches the unique ID of the email currently being viewed.
     * This function handles both full email views and preview pane scenarios.
     *
     * @returns {string|null} The email ID as a string, or `null` if no email ID can be determined.
     */
    api.get.email_id = function () {
        var hash = null ; // Initialize the email ID hash to null.

        if (api.check.is_inside_email()) {
            if (api.check.is_preview_pane()) {
                var items = api.dom.email_contents() ; // Get email content elements.
                var text = [] ; // Array to store visible mail IDs.

                for (var i = 0; i < items.length; i++) {
                    var mail_id = items[i].getAttribute('class').split(' ')[2] ; // Extract the mail ID.
                    var is_editable = items[i].getAttribute('contenteditable') ; // Check if content is editable.
                    var is_visible = items[i].offsetWidth > 0 && items[i].offsetHeight > 0 ; // Check if element is visible.
                    // Filter for valid, visible, and non-editable mail IDs.
                    if (mail_id != 'undefined' && mail_id != undefined && is_visible) {
                        if (is_editable != 'true') {
                            text.push(mail_id) ;
                        }
                    }
                }

                hash = text[0].substring(1, text[0].length) ; // Extract the first visible mail ID.
            } else {
                // For full email view, the ID is typically found in the URL hash.
                hash = window.location.hash.split("/").pop().replace(/#/, '').split('?')[0] ;
            }
        }

        return hash ; // Return the determined email ID.
    } ;


    // Checks if the "Priority Inbox" feature is enabled in Gmail.
    api.check.is_priority_inbox = function () {
        return $('.qh').length > 0 ; // The presence of the '.qh' class indicates Priority Inbox.
    } ;


    // Checks if the "Rapportive" browser extension is currently installed and active.
    api.check.is_rapportive_installed = function () {
        return $('#rapportive-sidebar').length == 1 ; // Rapportive injects a sidebar with this specific ID.
    } ;


    // Checks if the "Streak CRM" browser extension is installed and active.
    api.check.is_streak_installed = function () {
        // Streak injects elements with IDs or classes containing 'bentoBox'.
        return $("[id^='bentoBox'],[id*=' bentoBox'],[class*=' bentoBox'],[class*='bentoBox']").length > 0 ;
    } ;


    // Checks if the "Any.do" browser extension is installed and active.
    api.check.is_anydo_installed = function () {
        // Any.do injects elements with IDs or classes containing 'anydo'.
        return $("[id^='anydo'],[id*=' anydo'],[class*=' anydo'],[class*='anydo']").length > 0 ;
    } ;


    // Checks if the "Boomerang for Gmail" browser extension is installed and active.
    api.check.is_boomerang_installed = function () {
        // Boomerang injects elements with IDs or classes containing 'b4g_'.
        return $("[id^='b4g_'],[id*=' b4g_'],[class*=' b4g_'],[class*='b4g_']").length > 0 ;
    } ;


    // Checks if the "Xobni" browser extension is installed and active.
    api.check.is_xobni_installed = function () {
        return $('#xobni_frame').length > 0 ; // Xobni uses an iframe with this specific ID.
    } ;


    // Checks if the "Signal by HubSpot" browser extension is installed and active.
    api.check.is_signal_installed = function () {
        // Signal injects elements with IDs or classes containing 'Signal' or 'signal'.
        return $("[id^='Signal'],[id*=' Signal'],[class*=' signal'],[class*='signal']").length > 0 ;
    } ;


    /**
     * Determines whether Gmail's keyboard shortcuts feature is currently enabled.
     *
     * @returns {boolean} `true` if shortcuts are enabled, `false` otherwise.
     */
    api.check.are_shortcuts_enabled = function () {
        var flag_name = 'bx_hs' ; // The specific flag name within Gmail's globals for shortcuts.
        var flag_value = undefined ; // Initialize flag value as undefined.

        var check = true ; // Default assumption: shortcuts are enabled (flag might be missing in some views).

        var array_with_flag = api.tracker.globals[17][5][1] ; // The specific location of the flags array.

        for (var i = 0; i < array_with_flag.length; i++) {
            var current = array_with_flag[i] ; // Get the current flag entry.

            if (current[0] === flag_name) { // If the flag name matches.
                flag_value = current[1] ; // Retrieve the corresponding value.
                break ; // Exit the loop once the flag is found.
            }
        }

        if (flag_value !== undefined) {
            var values = {
                '0' : true, // '0' typically means enabled.
                '1' : false // '1' typically means disabled.
            } ;

            check = values[flag_value] ; // Map the flag value to a boolean.
        }

        return check ; // Return the final determination.
    } ;


    // Retrieves all clickable link elements present in the left-hand navigation sidebar.
    api.dom.get_left_sidebar_links = function () {
        return $("div[role=navigation] [title]") ; // Selects elements with a 'title' attribute within the navigation div.
    } ;


    // Returns the jQuery object representing the search bar at the top of Gmail.
    api.dom.search_bar = function () {
        return $("[gh=sb]") ; // Selects the element with the 'search bar' attribute.
    } ;


    // Retrieves the current text query entered into the Gmail search bar.
    api.get.search_query = function () {
        var dom = api.dom.search_bar() ; // Get the search bar's DOM element.
        return dom.find('input')[0].value ; // Return the value of the input field within the search bar.
    } ;


    /**
     * Gets the count of unread emails specifically in the main inbox.
     * It parses the count from the navigation link's text.
     *
     * @returns {number} The number of unread inbox emails, or 0 if not found.
     */
    api.get.unread_inbox_emails = function () {
        // Find the inbox navigation link using its localized title.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('inbox') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) { // Check if an unread count is indicated by parentheses.
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ; // Extract and parse the numeric count.
            }
        }

        return 0 ; // Default to 0 if no unread count is found.
    } ;


    /**
     * Gets the count of unread emails in the Drafts folder.
     *
     * @returns {number} The number of unread draft emails, or 0.
     */
    api.get.unread_draft_emails = function () {
        // Find the drafts navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('drafts') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Gets the count of unread emails in the Spam folder.
     *
     * @returns {number} The number of unread spam emails, or 0.
     */
    api.get.unread_spam_emails = function () {
        // Find the spam navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('spam') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Gets the count of unread emails in the "Forums" category.
     *
     * @returns {number} The number of unread forum emails, or 0.
     */
    api.get.unread_forum_emails = function () {
        // Find the forums navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('forums') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Gets the count of unread emails in the "Updates" category.
     *
     * @returns {number} The number of unread update emails, or 0.
     */
    api.get.unread_update_emails = function () {
        // Find the updates navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('updates') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Gets the count of unread emails in the "Promotions" category.
     *
     * @returns {number} The number of unread promotion emails, or 0.
     */
    api.get.unread_promotion_emails = function () {
        // Find the promotions navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('promotions') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Gets the count of unread emails in the "Social" category.
     *
     * @returns {number} The number of unread social emails, or 0.
     */
    api.get.unread_social_emails = function () {
        // Find the social updates navigation link.
        var dom = $("div[role=navigation]").find("[title*='" + api.tools.i18n('social_updates') + "']") ;

        if (dom.length > 0) {
            if (dom[0].text.indexOf('(') != -1) {
                return parseInt(dom[0].text.replace(/[^0-9]/g, '')) ;
            }
        }

        return 0 ;
    } ;


    /**
     * Retrieves information about various beta features or UI elements.
     * Currently checks for the presence of a "new navigation bar".
     *
     * @returns {object} An object with feature status, e.g., `{"new_nav_bar": true|false}`.
     */
    api.get.beta = function () {
        var features = {
            "new_nav_bar" : $('#gbz').length == 0 // Checks if the old navigation bar element is absent.
        } ;

        return features ; // Return the object containing beta feature statuses.
    } ;


    /**
     * Consolidates and returns the unread email counts for all major categories.
     *
     * @returns {object} An object with keys for each category (inbox, drafts, spam, forum, update, promotions, social)
     *   and their corresponding unread counts.
     */
    api.get.unread_emails = function () {
        return {
            inbox         : api.get.unread_inbox_emails(),        // Unread count for the primary inbox.
            drafts        : api.get.unread_draft_emails(),        // Unread count for draft emails.
            spam          : api.get.unread_spam_emails(),         // Unread count for spam emails.
            forum         : api.get.unread_forum_emails(),        // Unread count for the 'Forums' category.
            update        : api.get.unread_update_emails(),       // Unread count for the 'Updates' category.
            promotions    : api.get.unread_promotion_emails(),    // Unread count for the 'Promotions' category.
            social        : api.get.unread_social_emails()        // Unread count for the 'Social' category.
        } ;
    } ;


    /**
     * A utility function for handling errors. It logs the error to the console
     * if `console` is available, otherwise, it throws the error as an exception.
     *
     * @param {string} str The error message to be handled.
     */
    api.tools.error = function (str) {
        if (console) {
            console.error(str) ; // Log the error message to the browser console.
        } else {
            throw (str) ; // If no console, throw a JavaScript error.
        }
    } ;

    /**
     * Parses a given URL string and extracts its query parameters into an object.
     *
     * @param {string} url The complete URL string to be parsed.
     * @returns {object} An object where keys are parameter names and values are their corresponding string values.
     */
    api.tools.parse_url = function (url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g ; // Regular expression to capture key-value pairs in query string.
        var params = {} ; // Initialize an empty object to store the parsed parameters.
        var match ; // Variable to hold the result of each regex execution.

        // Loop through the URL to find all matching query parameters.
        while (match = regex.exec(url)) {
            params[match[1]] = match[2] ; // Assign the captured parameter name and value to the params object.
        }
    } ; // End of api.tools.parse_url function definition.

} ; // End of the main Gmail function wrapper.