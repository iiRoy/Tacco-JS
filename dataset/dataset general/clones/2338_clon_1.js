//= require ./jquery_ui

/*
 * jQuery Tocify - A dynamic table of contents plugin.
 * Version: 1.8.0
 * Date: 2013-09-16
 * Project URL: http://www.gregfranko.com/jquery.tocify.js/
 * Copyright (c) 2013 Greg Franko; Licensed under the MIT License.
 *
 * This file has been modified by Robert Lord.
 * Changes include bug fixes, automatic ID generation for headers,
 * and height caching to improve performance and prevent lag spikes
 * when dealing with many H1/H2 elements.
 */

// This is an Immediately-Invoked Function Expression (IIFE).
// It wraps another IIFE containing the main plugin logic.
// This pattern, inspired by Ben Alman, helps keep the global scope clean
// and allows local parameters to be passed without requiring users to scroll
// to the bottom of the file to see them.
(function(tocify) {

  // ECMAScript 5 Strict Mode is enforced here,
  // following a pattern described by John Resig.
  "use strict";

  // The main plugin IIFE is called, passing essential global objects
  // (jQuery, window, document) as local arguments for performance.
  tocify( window.jQuery, window, document );

}

// This is the primary IIFE for the Tocify plugin.
// It accepts `jQuery` (aliased as `$`), `window`, `document`,
// and an `undefined` variable as local parameters.
// Passing these global objects locally improves performance
// by reducing scope chain lookups.
// The `undefined` parameter is used to ensure its value is truly undefined,
// as it is not a reserved keyword in older JavaScript versions.
(function($, window, document, undefined) {

  // Strict Mode for ECMAScript 5, as recommended by John Resig.
  // This helps catch common coding errors and "unsafe" actions.
  "use strict";

  // --- Constants and Class Names ---
  // These variables define the CSS class names used throughout the plugin.
  // They are prefixed with 'tocify' to avoid conflicts.

  var tocClassName       = "tocify"
    , tocClass           = "." + tocClassName
    , tocFocusClassName  = "tocify-focus"
    , tocHoverClassName  = "tocify-hover"
    , hideTocClassName   = "tocify-hide"
    , hideTocClass       = "." + hideTocClassName
    , headerClassName    = "tocify-header"
    , headerClass        = "." + headerClassName
    , subheaderClassName = "tocify-subheader"
    , subheaderClass     = "." + subheaderClassName
    , itemClassName      = "tocify-item"
    , itemClass          = "." + itemClassName
    , extendPageClassName= "tocify-extend-page"
    , extendPageClass    = "." + extendPageClassName
    ; // End of variable declarations.


  // --- jQuery UI Widget Factory Integration ---
  // The plugin is built using the jQuery UI Widget Factory,
  // allowing it to benefit from its architecture for stateful plugins.
  $.widget( "toc.tocify", {

    // --- Plugin Version ---
    // Specifies the current version of the Tocify plugin.
    version: "1.8.0",

    // --- Default Options ---
    // These are the default configuration options for the plugin.
    // Users can override these by passing an options object during initialization.
    options: {

      // **context**: Accepts String (jQuery selector).
      // This defines the main container element where the content for the
      // table of contents is located.
      context: "body",

      // **ignoreSelector**: Accepts String (jQuery selector) or null.
      // A selector for elements that should be explicitly excluded from
      // being processed for the table of contents, even if they match
      // the `selectors` option.
      ignoreSelector: null,

      // **selectors**: Accepts an Array of Strings (jQuery selectors).
      // These are the HTML elements (e.g., "h1", "h2", "h3") that will be
      // used to generate the table of contents. The order is crucial
      // as it dictates the nesting structure of the TOC.
      selectors: "h1, h2, h3",

      // **showAndHide**: Accepts a boolean (true/false).
      // If true, nested table of contents items will be shown and hidden
      // dynamically based on user interaction or scrolling.
      showAndHide: true,

      // **showEffect**: Accepts String: "none", "fadeIn", "show", or "slideDown".
      // The animation effect to use when displaying nested TOC items.
      showEffect: "slideDown",

      // **showEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast".
      // The duration of the `showEffect` animation.
      showEffectSpeed: "medium",

      // **hideEffect**: Accepts String: "none", "fadeOut", "hide", or "slideUp".
      // The animation effect to use when hiding nested TOC items.
      hideEffect: "slideUp",

      // **hideEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast".
      // The duration of the `hideEffect` animation.
      hideEffectSpeed: "medium",

      // **smoothScroll**: Accepts a boolean (true/false).
      // If true, clicking on a TOC item will trigger a smooth animated scroll
      // to the corresponding section on the page.
      smoothScroll: true,

      // **smoothScrollSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast".
      // The duration of the `smoothScroll` animation.
      smoothScrollSpeed: "medium",

      // **scrollTo**: Accepts Number (pixels).
      // The vertical offset (in pixels) from the top of the viewport
      // when scrolling to a selected TOC item. Useful for fixed headers.
      scrollTo: 0,

      // **showAndHideOnScroll**: Accepts a boolean (true/false).
      // If true, nested TOC items will be automatically shown and hidden
      // as the user scrolls through the document.
      showAndHideOnScroll: true,

      // **highlightOnScroll**: Accepts a boolean (true/false).
      // If true, the corresponding TOC item will be highlighted
      // as the user scrolls to its section on the page.
      highlightOnScroll: true,

      // **highlightOffset**: Accepts a number (pixels).
      // The pixel distance from the top of the viewport at which
      // a new active TOC item should be triggered during scrolling.
      highlightOffset: 40,

      // **theme**: Accepts a string: "bootstrap", "jqueryui", or "none".
      // Specifies which CSS framework's classes (if any) should be applied
      // to the generated table of contents for styling.
      theme: "bootstrap",

      // **extendPage**: Accepts a boolean (true/false).
      // If true, and the user scrolls to the bottom of the page,
      // the page height will be extended if necessary to ensure that
      // the last table of contents item can be scrolled to and highlighted.
      extendPage: true,

      // **extendPageOffset**: Accepts a number (pixels).
      // The distance (in pixels) from the bottom of the page
      // that triggers the `extendPage` functionality.
      extendPageOffset: 100,

      // **history**: Accepts a boolean (true/false).
      // If true, the browser's history will be updated with a hash
      // corresponding to the active TOC item, allowing direct linking.
      history: true,

      // **scrollHistory**: Accepts a boolean (true/false).
      // If true, the hash in the URL will be updated to reflect the
      // currently active TOC item as the user scrolls, maintaining history.
      scrollHistory: false,

      // **hashGenerator**: Defines how the URL hash value (the part after '#')
      // will be created for each table of contents item.
      // - "compact" (default): Generates a hash like `#CompressesEverythingTogether`.
      // - "pretty": Generates a more readable hash like `#looks-like-a-nice-url-and-is-easily-readable`.
      // - function(text, element){}: A custom function that receives the header text
      //   and the header element, and returns the desired hash string.
      hashGenerator: "compact",

      // **highlightDefault**: Accepts a boolean (true/false).
      // If true, the very first table of contents item will be highlighted
      // by default if no other item is currently active (e.g., on page load
      // without a specific hash in the URL).
      highlightDefault: true

    }, // End of options object.


    // --- _create Method ---
    // This method is part of the jQuery UI Widget Factory lifecycle.
    // It is called automatically when the plugin is instantiated,
    // performing the initial setup and construction of the table of contents.
    _create: function() {

      // Store a reference to the plugin instance for use within callbacks.
      var self = this;

      // Initialize the tocifyWrapper property.
      self.tocifyWrapper = $('.tocify-wrapper');

      // Flag to control page extension scrolling behavior.
      self.extendPageScroll = true;

      // An internal array to keep track of all generated TOC item texts.
      // This helps in detecting and handling duplicate titles.
      self.items = [];

      // Generate the initial HTML structure for the table of contents.
      self._generateToc();

      // Initialize arrays to cache element heights and anchor positions.
      // This optimization prevents repeated DOM lookups during scrolling.
      self.cachedHeights = [];
      self.cachedAnchors = [];

      // Apply appropriate CSS classes based on the chosen theme and plugin structure.
      self._addCSSClasses();

      // Detect if the browser is WebKit-based.
      // This is an internal check, possibly for specific browser compatibility issues.
      self.webkit = (function() {

        // Iterate through properties of the window object.
        for ( var prop in window ) {

          if ( prop ) {

            // Check if any property name contains "webkit" (case-insensitive).
            if ( prop.toLowerCase().indexOf("webkit") !== -1 ) {

              return true; // WebKit detected.

            }

          }

        }

        return false; // Not a WebKit browser.

      }()); // Immediately invoke the detection function.


      // Attach all necessary event handlers (e.g., click, scroll) to the TOC.
      self._setEventHandlers();


      // Bind to the window's `load` event.
      // This ensures that all images and resources are loaded, allowing for
      // accurate `scrollTop` calculations.
      $(window).load(function() {

        // Set the initially active TOC item based on the URL hash or defaults.
        self._setActiveElement(true);

        // After all animations on the page have completed (e.g., from other plugins),
        // execute this callback.
        $("html, body").promise().done(function() {

          // Use a small timeout to defer setting the scroll flag.
          // This helps ensure initial page rendering and scrolling is stable.
          setTimeout(function() {

            self.extendPageScroll = false;

          }, 0 ); // Execute after a minimal delay.

        }); // End of promise.done callback.

      }); // End of window.load callback.

    }, // End of _create method.


    // --- _generateToc Method ---
    // This private method is responsible for dynamically generating
    // the HTML structure of the table of contents based on the
    // document's content and plugin options.
    _generateToc: function() {

      // --- Local Variables for _generateToc ---
      // `self` refers to the plugin instance.
      var self           = this
        // `firstElem` will store the top-level header elements.
        , firstElem
        // `ul` will be used to create unordered list elements for the TOC.
        , ul
        // `ignoreSelector` is cached for performance.
        , ignoreSelector = self.options.ignoreSelector
        ; // End of variable declarations.


      // Check if the `selectors` option contains multiple selectors (indicated by a comma).
      if ( this.options.selectors.indexOf(",") !== -1 ) {

        // If multiple selectors, extract the first one and find matching elements
        // within the specified `context`. Spaces are removed for consistency.
        firstElem = $( this.options.context ).find( this.options.selectors.replace( / /g, "" ).substr( 0, this.options.selectors.indexOf(",") ) );

      }

      // If only a single selector is provided in the `selectors` option.
      else {

        // Find elements matching the single selector within the `context`,
        // ensuring no extra spaces.
        firstElem = $( this.options.context ).find( this.options.selectors.replace( / /g, "" ) );

      }


      // If no matching header elements are found in the document.
      if ( !firstElem.length ) {

        // Add a class to hide the TOC container, as there's no content for it.
        self.element.addClass(hideTocClassName);

        return; // Exit the method early.

      }


      // Add the base class to the main TOC element.
      self.element.addClass(tocClassName);


      // Iterate over each top-level header element found.
      firstElem.each(function(index) {

        // Check if the current element matches the `ignoreSelector`.
        if ( $(this).is(ignoreSelector) ) {
          return; // Skip this element if it should be ignored.
        }

        // Create a new unordered list (`<ul>`) element.
        // Assign a unique ID and a common class name for styling.
        ul = $("<ul/>", {
          "id":    headerClassName + index, // e.g., "tocify-header0"
          "class": headerClassName          // e.g., "tocify-header"
        }).

        // Append a list item (`<li>`) representing the current header.
        // The `_nestElements` method handles the creation of the list item and its anchor.
        append( self._nestElements( $(this), index ) );


        // Add the newly created `<ul>` (with its `<li>` item) to the main TOC container.
        self.element.append(ul);


        // Find all sibling elements between the current header and the next header
        // of the same or higher level.
        $(this).nextUntil( this.nodeName.toLowerCase() ).each(function() {

          // If there are no nested subheader elements within the current sibling block.
          if ( $(this).find( self.options.selectors ).length === 0 ) {

            // Filter the current sibling element to check if it is itself a subheader.
            $(this).filter( self.options.selectors ).each(function() {

              // Check if this subheader element should be ignored.
              if ( $(this).is(ignoreSelector) ) {
                return; // Skip ignored subheaders.
              }

              // Append this subheader to the appropriate list.
              // `call(this, ...)` ensures `this` refers to the current subheader in `_appendSubheaders`.
              self._appendSubheaders.call(this, self, ul);

            }); // End of filter.each.

          }

          // If there *are* nested subheader elements within the current sibling block.
          else {

            // Find all subheader elements within the current sibling block.
            $(this).find( self.options.selectors ).each(function() {

              // Check if this nested subheader element should be ignored.
              if ( $(this).is(ignoreSelector) ) {
                return; // Skip ignored nested subheaders.
              }

              // Append this nested subheader to the appropriate list.
              self._appendSubheaders.call(this, self, ul);

            }); // End of find.each.

          }

        }); // End of nextUntil.each.

      }); // End of firstElem.each.

    }, // End of _generateToc method.


    // --- _setActiveElement Method ---
    // This private method is responsible for setting the "active" or "focused"
    // state on a table of contents item, typically based on the URL hash
    // or by default on page load.
    _setActiveElement: function(pageload) {

      // Store a reference to the plugin instance.
      var self = this
        // Get the current URL hash, removing the leading '#' character.
        , hash = window.location.hash.substring(1)
        // Find the TOC list item (`<li>`) that corresponds to the current hash.
        , elem = self.element.find("li[data-unique='" + hash + "']")
        ; // End of variable declarations.


      // If a hash exists in the URL (i.e., a specific section is targeted).
      if ( hash.length ) {

        // Remove the highlight class from any previously focused TOC item.
        self.element.find("." + self.focusClass).removeClass(self.focusClass);

        // Add the highlight class to the currently targeted TOC item.
        elem.addClass(self.focusClass);

        // If the `showAndHide` option is enabled.
        if ( self.options.showAndHide ) {

          // Trigger a click event on the focused TOC item.
          // This typically expands its sub-items if they are hidden.
          elem.click();

        }

      }

      // If no hash exists in the URL (i.e., no specific section is targeted).
      else {

        // Remove the highlight class from any previously focused TOC item.
        self.element.find("." + self.focusClass).removeClass(self.focusClass);

        // If it's a page load and the `highlightDefault` option is true.
        if ( !hash.length && pageload && self.options.highlightDefault ) {

          // Highlight the very first TOC item as the default active item.
          self.element.find(itemClass).first().addClass(self.focusClass);

        }

      }

      return self; // Return the plugin instance for chaining.

    }, // End of _setActiveElement method.


    // --- _nestElements Method ---
    // This helper method creates and returns a list item (`<li>`)
    // for the table of contents, including its anchor tag.
    // It also handles duplicate title detection and hash generation.
    _nestElements: function(self, index) {

      // Declare local variables for the array of duplicates, the list item, and the hash value.
      var arr, item, hashValue;

      // Filter the internal `this.items` array to find any existing TOC items
      // that have the exact same text as the current header element.
      arr = $.grep( this.items, function (item) {

        return item === self.text();

      });


      // If there are already duplicate TOC items with the same text.
      if ( arr.length ) {

        // Add the current TOC item text along with its index to the internal array.
        // The index helps create a unique identifier for duplicates.
        this.items.push( self.text() + index );

      }

      // If there are no duplicate TOC items with the same text.
      else {

        // Simply add the current TOC item text to the internal array.
        this.items.push( self.text() );

      }


      // Generate the hash value for the current header element.
      hashValue = this._generateHashValue( arr, self, index );


      // ADDED BY ROBERT:
      // This line is commented out in the original source, but the intention was
      // to actually add the generated hash value as an 'id' attribute
      // to the header element itself (e.g., `<h1 id="link-my-header">`).
      // self.attr("id", "link-" + hashValue);


      // Create a new list item (`<li>`) HTML element.
      item = $("<li/>", {

        // Assign a common class name to the list item for styling.
        "class": itemClassName,

        // Store a unique identifier (the hash value) as a data attribute.
        "data-unique": hashValue

      }).

      // Append an anchor (`<a>`) tag inside the list item.
      append( $("<a/>", {

        // Set the text of the anchor to the text of the header element.
        "text": self.text()

      }) );


      // Insert a new `<div>` element immediately *before* the current header element.
      // This `<div>` acts as the actual anchor point that the smooth scroll
      // functionality will target.
      self.before( $("<div/>", {

        // Set the `name` attribute of the anchor div to the generated hash value.
        // This is important for older browsers and general anchor linking.
        "name": hashValue,

        // Also store the unique identifier as a data attribute on this div.
        "data-unique": hashValue

      }) );


      return item; // Return the created list item.

    }, // End of _nestElements method.


    // --- _generateHashValue Method ---
    // This private method generates a unique hash string for each
    // table of contents item, based on the configured `hashGenerator` option.
    _generateHashValue: function(arr, self, index) {

      // Initialize the hash value string.
      var hashValue         = ""
        // Get the chosen hash generation strategy from the options.
        , hashGeneratorOption = this.options.hashGenerator
        ; // End of variable declarations.


      // Check if the `hashGenerator` option is set to "pretty".
      if ( hashGeneratorOption === "pretty" ) {

        // Convert the header text to lowercase and replace spaces with hyphens.
        hashValue = self.text().toLowerCase().replace( /\s/g, "-" );

        // ADDED BY ROBERT:
        // Remove any non-ASCII characters from the hash value.
        // This ensures compatibility and cleaner URLs.
        hashValue = hashValue.replace( /[^\x00-\x7F]/g, "" );

        // Replace consecutive hyphens with a single hyphen for tidiness.
        while ( hashValue.indexOf("--") > -1 ) {
          hashValue = hashValue.replace(/--/g, "-");
        }

        // Replace instances of ":-" with just "-" for cleaner URLs (e.g., "Section:-Sub" becomes "section-sub").
        while ( hashValue.indexOf(":-") > -1 ) {
          hashValue = hashValue.replace(/:-/g, "-");
        }

      }

      // Check if the `hashGenerator` option is a custom function.
      else if ( typeof hashGeneratorOption === "function" ) {

        // Call the custom function, passing the header text and the element itself.
        hashValue = hashGeneratorOption( self.text(), self );

      }

      // If `hashGenerator` is "compact" (the default) or any other value.
      else {

        // Generate a compact hash by removing all whitespace from the header text.
        hashValue = self.text().replace( /\s/g, "" );

      }


      // If duplicate items were detected (indicated by `arr.length`),
      // append the index to the hash to ensure uniqueness.
      if ( arr.length ) {
        hashValue += "" + index;
      }


      return hashValue; // Return the final generated hash value.

    }, // End of _generateHashValue method.


    // --- _appendSubheaders Method ---
    // This helper method is responsible for appending subheader elements
    // to the correct nested list within the table of contents structure.
    _appendSubheaders: function(self, ul) {

      // Determine the index of the current element among all `selectors`.
      var index         = $(this).index( self.options.selectors )
        // Find the previous header element based on its index.
        , previousHeader  = $( self.options.selectors ).eq( index - 1 )
        // Get the tag name (e.g., "H1", "H2") of the current element and extract its level (1, 2, etc.).
        , currentTagName  = +$(this).prop("tagName").charAt(1)
        // Get the tag name level of the previous header element.
        , previousTagName = +previousHeader.prop("tagName").charAt(1)
        // `lastSubheader` is declared but not used in the provided snippet.
        , lastSubheader
        ; // End of variable declarations.


      // If the current header's tag level is numerically smaller than the previous header's tag level.
      // This indicates a jump to a higher-level header (e.g., from H3 to H2).
      if ( currentTagName < previousTagName ) {

        // Find the correct parent `<ul>` for this higher-level header.
        // It looks for the last subheader `<ul>` that matches the `currentTagName`.
        self.element.find( subheaderClass + "[data-tag=" + currentTagName + "]" ).last().append( self._nestElements( $(this), index ) );

      }

      // If the current header's tag level is the same as the previous header's tag level.
      // This means they are siblings at the same level (e.g., H2 followed by another H2).
      else if ( currentTagName === previousTagName ) {
        // The original code continues here, presumably to append to the same level.
        // (Implementation for this part is truncated in the provided snippet.)
      }