/*
 * Simple OpenID Plugin - Type I Clone
 *
 * Original source: http://code.google.com/p/openid-selector/
 * This code is licensed under the New BSD License.
 *
 * This version includes extensive changes to whitespace and comments
 * while preserving all original identifiers, operators, and expressions.
 */


var providers; // Global variable to store combined provider data

var openid;    // Main OpenID selector object

(function ($) {

  openid = { // OpenID selector configuration and methods

    version : '1.3', /* Current version of the plugin */
    demo : false, // Flag to enable or disable demo mode
    demo_text : null, // Text to display in demo mode alert

    cookie_expires : 6 * 30, // Cookie expiration time in days (6 months)
    cookie_name : 'openid_provider', // Name of the cookie to store selected provider
    cookie_path : '/', // Path for the cookie

    img_path : '/Views/_Content/img/openid-images/', // Base path for provider images
    locale : null, // Current locale, set in locale-specific JS files
    sprite : null, // Sprite sheet name, usually same as locale

    signin_text : null, // Text for the submit button on the form
    all_small : false, // Render all providers with small icons
    no_sprite : false, // Do not use sprite image for icons
    image_title : '{provider}', // Title attribute template for provider images

    input_id : null, // ID of the hidden input field for the OpenID URL
    provider_url : null, // URL of the selected provider
    provider_id : null, // ID of the selected provider


    /**
     * Initializes the OpenID selector.
     * Combines provider lists, renders buttons, and sets up event handlers.
     *
     * @param {String} input_id The ID of the input field to populate with the OpenID URL.
     * @return {Void}
     */
    init : function(input_id) {

      // Merge large and small providers into a single object
      providers = $.extend({}, providers_large, providers_small);

      var openid_btns = $('#openid_btns'); // Cache the buttons container

      this.input_id = input_id; // Store the input ID

      $('#openid_choice').show(); // Display the provider choice section

      $('#openid_input_area').empty(); // Clear any existing input area content


      var i = 0; // Counter for sprite positioning


      // Add a box for each large provider
      for (id in providers_large) {
        box = this.getBoxHTML(id, providers_large[id], (this.all_small ? 'small' : 'large'), i++);
        openid_btns.append(box);
      }


      // If small providers exist, add a separator and then their boxes
      if (providers_small) {
        openid_btns.append('<br/>'); // Add a line break for separation
        for (id in providers_small) {
          box = this.getBoxHTML(id, providers_small[id], 'small', i++);
          openid_btns.append(box);
        }
      }

      // Attach the submit handler to the OpenID form
      $('#openid_form').submit(this.submit);

      var box_id = this.readCookie(); // Read the last selected provider from cookie

      // If a provider was previously selected, sign in with it
      if (box_id) {
        this.signin(box_id, true);
      }

    }, // End of init function


    /**
     * Generates the HTML for a single provider button/box.
     *
     * @param {String} box_id The unique ID of the provider.
     * @param {Object} provider The provider object containing name, URL, etc.
     * @param {String} box_size 'small' or 'large' for image size.
     * @param {Number} index The index of the provider for sprite positioning.
     * @return {String} The HTML string for the provider box.
     */
    getBoxHTML : function(box_id, provider, box_size, index) {

      // If sprites are not used, construct URL for individual images
      if (this.no_sprite) {
        var image_ext = box_size == 'small' ? '.ico.gif' : '.gif';
        return '<a title="' + this.image_title.replace('{provider}', provider["name"]) + '" href="javascript:openid.signin(\'' + box_id + '\');"'
          + ' style="background: #FFF url(' + this.img_path + '../images.' + box_size + '/' + box_id + image_ext + ') no-repeat center center" '
          + 'class="' + box_id + ' openid_' + box_size + '_btn"></a>';
      }

      // Calculate background position for sprite image
      var x = box_size == 'small' ? -index * 24 : -index * 100;
      var y = box_size == 'small' ? -60 : 0;

      // Return HTML using sprite background positioning
      return '<a title="' + this.image_title.replace('{provider}', provider["name"]) + '" href="javascript:openid.signin(\'' + box_id + '\');"'
        + ' style="background: #FFF url(' + this.img_path + 'openid-providers-' + this.sprite + '.png); background-position: ' + x + 'px ' + y + 'px" '
        + 'class="' + box_id + ' openid_' + box_size + '_btn"></a>';

    }, // End of getBoxHTML function


    /**
     * Handles the click event on a provider image.
     * Highlights the selected provider, sets cookie, and prepares for submission.
     *
     * @param {String} box_id The ID of the clicked provider box.
     * @param {Boolean} onload True if called on page load from cookie, false otherwise.
     * @return {Void}
     */
    signin : function(box_id, onload) {

      var provider = providers[box_id]; // Get provider data

      if (!provider) { // If provider not found, exit
        return;
      }

      this.highlight(box_id); // Highlight the selected provider
      this.setCookie(box_id); // Store selected provider in cookie

      this.provider_id = box_id; // Set current provider ID
      this.provider_url = provider['url']; // Set current provider URL


      // Check if the provider requires user input (e.g., username)
      if (provider['label']) {
        this.useInputBox(provider); // Show input box
      } else {
        $('#openid_input_area').empty(); // Clear input area
        if (!onload) { // If not called on page load, submit the form
          $('#openid_form').submit();
        }
      }

    }, // End of signin function


    /**
     * Handles the form submission event.
     * Replaces placeholders in the URL and sets the hidden input value.
     *
     * @return {Boolean} True to allow form submission, false to prevent.
     */
    submit : function() {

      var url = openid.provider_url; // Get the provider URL

      if (url) {
        url = url.replace('{username}', $('#openid_username').val()); // Replace username placeholder
        openid.setOpenIdUrl(url); // Set the URL in the hidden input
      }

      // Handle demo mode
      if (openid.demo) {
        alert(openid.demo_text + "\r\n" + document.getElementById(openid.input_id).value);
        return false; // Prevent actual form submission in demo
      }

      // Handle JavaScript URLs
      if (url.indexOf("javascript:") == 0) {
        url = url.substr("javascript:".length);
        eval(url); // Execute JavaScript code
        return false; // Prevent form submission
      }

      return true; // Allow normal form submission

    }, // End of submit function


    /**
     * Sets the OpenID URL in the hidden input field.
     * Creates the input if it doesn't exist.
     *
     * @param {String} url The OpenID URL to set.
     * @return {Void}
     */
    setOpenIdUrl : function(url) {

      var hidden = document.getElementById(this.input_id); // Get the hidden input element

      if (hidden != null) {
        hidden.value = url; // Update its value
      } else {
        // Create the hidden input if it doesn't exist
        $('#openid_form').append('<input type="hidden" id="' + this.input_id + '" name="' + this.input_id + '" value="' + url + '"/>');
      }

    }, // End of setOpenIdUrl function


    /**
     * Highlights the selected provider box.
     * Removes previous highlight and applies a new one.
     *
     * @param {String} box_id The ID of the provider to highlight.
     * @return {Void}
     */
    highlight : function(box_id) {

      var highlight = $('#openid_highlight'); // Find existing highlight

      if (highlight) {
        highlight.replaceWith($('#openid_highlight a')[0]); // Remove highlight wrapper
      }

      // Add new highlight wrapper around the selected provider's anchor
      $('.' + box_id).wrap('<div id="openid_highlight"></div>');

    }, // End of highlight function


    /**
     * Sets a cookie to remember the last selected provider.
     *
     * @param {String} value The ID of the provider to store.
     * @return {Void}
     */
    setCookie : function(value) {

      var date = new Date(); // Current date and time

      // Set cookie expiration date
      date.setTime(date.getTime() + (this.cookie_expires * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();

      // Write the cookie
      document.cookie = this.cookie_name + "=" + value + expires + "; path=" + this.cookie_path;

    }, // End of setCookie function


    /**
     * Reads the last selected provider ID from the cookie.
     *
     * @return {String|null} The provider ID if found, otherwise null.
     */
    readCookie : function() {

      var nameEQ = this.cookie_name + "="; // Prefix to look for in the cookie string
      var ca = document.cookie.split(';'); // Split cookie string into individual cookies

      for ( var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') // Remove leading whitespace
          c = c.substring(1, c.length);

        if (c.indexOf(nameEQ) == 0) // If this cookie is our target
          return c.substring(nameEQ.length, c.length); // Return its value
      }

      return null; // Cookie not found

    }, // End of readCookie function


    /**
     * Displays an input box for providers that require user input (e.g., username).
     *
     * @param {Object} provider The provider object.
     * @return {Void}
     */
    useInputBox : function(provider) {

      var input_area = $('#openid_input_area'); // Get the input area container
      var html = ''; // HTML string for the input box
      var id = 'openid_username'; // Default input ID
      var value = ''; // Default input value
      var label = provider['label']; // Label for the input field
      var style = ''; // Inline style for the input field

      if (label) {
        html = '<p>' + label + '</p>'; // Add label paragraph if provided
      }

      // Special handling for generic OpenID provider
      if (provider['name'] == 'OpenID') {
        id = this.input_id; // Use the main input ID
        value = 'http://'; // Pre-fill with http://
        // Add specific style for the OpenID input icon
        style = 'background: #FFF url(' + this.img_path + 'openid-inputicon.gif) no-repeat scroll 0 50%; padding-left:18px;';
      }

      // Construct the input field and submit button HTML
      html += '<input id="' + id + '" type="text" style="' + style + '" name="' + id + '" value="' + value + '" />'
        + '<input id="openid_submit" type="submit" value="' + this.signin_text + '"/>';

      input_area.empty(); // Clear existing content
      input_area.append(html); // Add new input box HTML

      $('#' + id).focus(); // Focus on the input field

    }, // End of useInputBox function


    /**
     * Sets the demo mode flag.
     *
     * @param {Boolean} demoMode True to enable demo mode, false to disable.
     * @return {Void}
     */
    setDemoMode : function(demoMode) {
      this.demo = demoMode; // Update the demo mode flag
    }

  }; // End of openid object literal

})(jQuery); // Pass jQuery object to the IIFE