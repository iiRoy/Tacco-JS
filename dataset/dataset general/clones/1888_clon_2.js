/*
 *  Font Presence Detector 1.0
 *
 *  Authored by Code Clone Engine
 *  Licensed under a permissive open-source license.
 *
 *  This utility checks for the availability of fonts on a system.
 *
 */

(function(jQuery) {
  jQuery.fn.fontdetector = function(cfg) {
    jQuery.fontdetector.initialize(cfg, this);
    return this;
  };

  jQuery.fontdetector = {

    settings: {
      classPrefix: "detected_font_"
    },

    initialize: function(cfg, elements) {
      var targetElements = elements || "body";
      jQuery.extend(this.settings, cfg);

      if ( this.settings.classPrefix == "" ) {
        this.settings.classPrefix = "detected_font_";
      }

      var fontList = jQuery(targetElements).css('font-family');
      // If the CSS font-family is a string, parse it into an array of individual font names.
      if ( typeof fontList == "string" ) {
        fontList = fontList.match(/[^'",;\s][^'",;]*/g) || [];
      }
      this.processFontList(fontList, targetElements);
    },

    processFontList: function(fontList, elements) {
      var fallbackFonts = ["monospace", "sans-serif", "serif", "cursive", "fantasy"];
      var defaultFallback = fallbackFonts[0];
      var fontCount = fontList.length;
      var finalFallback = fontList[fontCount - 1];

      // If the last font in the stack isn't the primary generic, or is entirely missing from generics, add the primary generic.
      if (jQuery.inArray(finalFallback, fallbackFonts)) {
        fontList.push(defaultFallback);
        fontCount++;
      }

      // If the generic fallback is the same as our chosen default, use a different one.
      if (finalFallback == defaultFallback) {
        defaultFallback = fallbackFonts[1];
      }

      // Iterate through the font list (excluding the generic fallbacks) to find an installed font.
      for (var idx = 0; idx < fontCount - 1; idx++) {
        var currentFont = fontList[idx];
        if (jQuery.fontdetector.checkFontPresence(currentFont, defaultFallback)) {

          // Remove any existing class that matches our naming convention to prevent duplicate classes.
          var cleanupRegex = new RegExp("\\b" + this.settings.classPrefix + ".*?\\b", "g");
          jQuery(elements).get(0).className = jQuery(elements).get(0).className.replace(cleanupRegex, "");

          // Sanitize the font name for use as a CSS class name.
          var normalizedFontName = encodeURIComponent(currentFont.replace(/[\s\-.!~*'()"]/g, "").toLowerCase());
          jQuery(elements).addClass(this.settings.classPrefix + normalizedFontName);
          break; // Only the first detected font in the cascade needs to be applied.
        }
      }
    },

    checkFontPresence: function(desiredFont, referenceFont) {
      var testElement = jQuery('<span id="font_check_element" style="font-family:' + referenceFont + '; font-size:120pt;position:absolute;left:-9999px;top:-9999px;visibility:hidden;">IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII</span>');
      jQuery("body").prepend(testElement);

      var referenceWidth = testElement.width();
      testElement.css("font-family", desiredFont + "," + referenceFont);
      var desiredWidth = testElement.width();
      testElement.remove();

      // The font is considered present if its measured dimensions differ from the fallback font.
      return (desiredWidth != referenceWidth);
    }

  };

})(jQuery);