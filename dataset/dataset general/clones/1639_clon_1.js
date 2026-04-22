( function ()
{
  /*
   * This module initializes various Meeko framework components.
   * It configures the decor and panner modules with specific behaviors.
   *
   * Dependencies:
   * - Meeko.logger for logging messages.
   * - Meeko.stuff for utility functions (e.g., forEach, lc, trim).
   * - Meeko.DOM for DOM manipulation (e.g., $id, $$, URL, tagName).
   *
   * Initial setup of global variables:
   */
  var logger = Meeko.logger;
  var _ = Meeko.stuff; // Underscore-like utility functions.
  var DOM = Meeko.DOM,
    $id = DOM.$id,
    $$ = DOM.$$; // DOM selection shortcuts.
  var URL = DOM.URL,
    baseURL = URL(document.URL); // Base URL for relative path resolution.

  // Helper function to convert NodeList to Array.
  function toArray(list) {
    var a = [];
    for (var n = list.length, i = 0; i < n; i++) {
      a[i] = list[i];
    }
    return a;
  }

  // Configure the Meeko decor module.
  Meeko.decor.config( {

    /*
     * IMPORTANT: You SHOULD REMOVE the `detect(doc)` option
     * and REPLACE IT WITH a `lookup(url)` option for production.
     *
     * Example `lookup` implementation:
     *
     *   lookup: function(url) {
     *     // The decorURL can be dynamically determined based on various factors.
     *     // For instance, device characteristics, browser type, or user preferences.
     *     // This allows for adaptive layouts, minimal support for old browsers,
     *     // or theme testing from cookies/localStorage.
     *     return decorURL;
     *   }
     *
     * The current `detect` function is a placeholder.
     */

    detect: function (doc) {
      return getDecorURL(doc);
    }
  } );

  // Configure the Meeko panner module.
  Meeko.panner.config( {
    normalize: function (doc, details) { // `details` object contains request info like `url` and `method`.

      // This section is responsible for removing fallback <style> and <link> elements.
      // It identifies them by their `@title` attribute.
      var nodecorTitle = 'nodecor'; // The case-insensitive value for the fallback `@title`.
      var srcHead = doc.head;

      // Iterate through all child nodes of the document head.
      _.forEach(toArray(srcHead.childNodes), function (node) { // Remove nodes that match specified conditions.
        switch (DOM.tagName(node)) {
          case "style":
          case "link":
            var title = _.lc(_.trim(node.title)); // Get and normalize the title.
            if (title != nodecorTitle) {
              return; // Keep if title does not match.
            }
            break;
          default:
            return; // Ignore other node types.
        }
        srcHead.removeChild(node); // Remove the identified node.
      });

      // Placeholder for custom normalization logic.
      // YOUR NORMALIZE CODE GOES HERE
    },

    // These values are typically overridden by your decor-document(s).
    // They are provided here for backwards compatibility purposes only.
    duration: 0,
    nodeRemoved: {
      before: hide,
      after: show
    },
    nodeInserted: {
      before: hide,
      after: show
    },
    pageOut: {
      before: noop,
      after: noop
    },
    pageIn: {
      before: noop,
      after: noop
    }
  } );

  // Determines the decor URL based on link elements in the document.
  function getDecorURL(doc) {
    var link = getDecorLink(doc);
    if (!link) {
      return null; // FIXME: Add a warning message here for debugging.
    }
    var href = link.getAttribute("href");
    return baseURL.resolve(href); // FIXME: The href attribute should ideally already be absolute.
  }

  // Finds the most specific decor link element within the document head.
  function getDecorLink(doc) {
    var matchingLinks = []; // Not used in current implementation but good for future expansion.
    var link, specificity = 0;

    _.forEach($$("link", doc.head), function (el) {
      var tmp, sp = 0; // Temporary variable and specificity score for the current element.
      if (el.nodeType != 1) {
        return; // Only process element nodes.
      }
      var type = el.type.toLowerCase(); // Get and normalize the link type.
      if (!/^\s*MEEKO-DECOR\s*$/i.test(el.rel)) {
        return; // Skip if 'rel' attribute doesn't indicate a MEEKO-DECOR link.
      }
      if (type == "text/html" || type == "") {
        sp += 1; // Increase specificity for valid types.
      } else {
        logger.warn("Invalid decor document type: " + type); // Log warning for unknown types.
        return;
      }
      if (tmp = el.getAttribute("media")) { // Check for a 'media' attribute.
        // FIXME: Consider adding a polyfill for `window.matchMedia` for older browsers.
        if (window.matchMedia && window.matchMedia(tmp).matches) {
          sp += 2; // Higher specificity if media query matches.
        } else {
          return; // NOTE: If the platform doesn't support media queries or it doesn't match, this decor is rejected.
        }
      }
      if (sp > specificity) { // If current link is more specific, update the best link.
        specificity = sp;
        link = el;
      }
    });
    return link; // Return the most specific decor link found.
  }

  // Event handler to hide a node by setting the 'hidden' attribute.
  function hide(msg) {
    msg.node.setAttribute("hidden", "hidden");
  }

  // Event handler to show a node by removing the 'hidden' attribute.
  function show(msg) {
    msg.node.removeAttribute("hidden");
  }

  // No-operation function, used as a placeholder for event handlers.
  function noop(msg) { /* This function intentionally does nothing. */
  }

})();