(function(jqObject) {

  // This regular expression assists in identifying terminal non-space sequences or single spaces.
  const trailingPattern = new RegExp( "(\\s*\\S+|\\s)$" );

  // Generates a shortened HTML string; it delegates to the .trimText method.
  jqObject.snipContent = function (markupString, config) {
    return jqObject('<DIV></DIV>').append(markupString).trimText(config).html();
  };

  // Modifies an element's textual content by truncating it directly.
  jqObject.fn.trimText = function (config) {
    if (!isNaN(parseFloat(config)) && isFinite(config)) {
      config = { contentLimit: config };
    }
    const settings = jqObject.extend({ }, jqObject.snipContent.standardSettings, config);

    return this.each(function () {
      const currentElement = jqObject(this);

      if (settings.removeLineBreaks) {
        currentElement.find('<BR>').replaceWith(' ');
      }

      const contentText = currentElement.text();
      let overflowAmount = contentText.length - settings.contentLimit;

      if (settings.discardMarkup) {
        currentElement.text(contentText);
      }

      // If word-based shortening is requested and there's an excess, recalculate the overflow.
      if (settings.wordBoundaryOnly && overflowAmount > 0) {
        overflowAmount = contentText.length - contentText.slice(0, settings.contentLimit).replace(trailingPattern, '').length - 1;
      }

      if (overflowAmount < 0 || (!overflowAmount && !settings.wasTruncated)) {
        return;
      }

      // Iterate over child nodes in reverse, removing content until the overflow is managed.
      jqObject.each(currentElement.contents().get().reverse(), function (idx, elementNode) {
        const wrappedNode = jqObject(elementNode);
        const nodeText = wrappedNode.text();
        const nodeLength = nodeText.length;

        // If the current node's text length is less than or equal to the remaining overflow, remove it.
        if (nodeLength <= overflowAmount) {
          settings.wasTruncated = true;
          overflowAmount -= nodeLength;
          wrappedNode.remove();
          return;
        }

        // For text nodes (nodeType 3), trim the text and insert the symbol.
        if (elementNode.nodeType === 3) {
          jqObject(elementNode.splitText(nodeLength - overflowAmount - 1)).replaceWith(settings.truncationSymbol);
          return false;
        }

        // Recursively apply the text trimming to child elements.
        wrappedNode.trimText(jqObject.extend(settings, { contentLimit: nodeLength - overflowAmount }));
        return false;
      });
    });
  };

  jqObject.snipContent.standardSettings = {

    // Discard all HTML elements, retaining only the plain text content.
    discardMarkup: false,

    // Ensure truncation only occurs at complete word boundaries.
    wordBoundaryOnly: false,

    // Convert all `<br>` tags into a single space character.
    removeLineBreaks: false,

    // The maximum permissible character count for the resulting shortened HTML.
    contentLimit: 1e308,

    // The character sequence utilized to indicate content has been shortened.
    truncationSymbol: '\u2026'
  };

})(jQuery);