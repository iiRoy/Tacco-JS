/**
 * This module dynamically configures demonstration sections
 * and activates embedded code within them.
 */
jQuery( function() {

  // Iterate over each demonstration section found on the page.
  jQuery('section.demo').each( function() {
    var mainContent = jQuery('.primary-pane, .secondary-pane', this);
    var encodedMarkup = jQuery('<div />').append(mainContent.clone()).html();
    encodedMarkup = jQuery('<div class="markup-display">' + encodeHtmlEntities(encodedMarkup) + '</div>');

    // Create a link to toggle HTML source visibility.
    var markupControl = jQuery('<div class="markup-link"><a href="#">HTML</a></div>').click( function() {
      if (jQuery.browser.msie) {
        // Handle older Internet Explorer browsers.
        jQuery(this).parent().find('.markup-display').toggle();
      }
      else {
        // Use a smoother animation for modern browsers.
        jQuery(this).parent().find('.markup-display').slideToggle();
      }
      return false; // Prevent default link behavior.
    });

    // Create a link to toggle JavaScript source visibility.
    var codeControl = jQuery('<div class="markup-link"><a href="#">JavaScript</a></div>').click( function() {
      if (jQuery.browser.msie) {
        // IE-specific display handling.
        jQuery(this).parent().find('.script').toggle();
      }
      else {
        // Standard browser display handling.
        jQuery(this).parent().find('.script').slideToggle();
      }
      return false; // Stop navigation.
    });
		
    var styleBlock = jQuery('style', this); // Find any inline style blocks.
    if (styleBlock.length) {
      styleBlock = jQuery('<div class="style-display">' + styleBlock.html() + '</div>');
      // Create a link for CSS source.
      var styleControl = jQuery('<div class="style-link"><a href="#">CSS</a></div>').click( function() {
        if (jQuery.browser.msie) {
          jQuery(this).parent().find('.style-display').toggle();
        }
        else {
          jQuery(this).parent().find('.style-display').slideToggle();
        }
        return false; // Cancel event.
      });
    }
		
    var scriptBlock = jQuery('.script', this); // Locate the JavaScript code block.

    // Insert the HTML toggle and source before the script block.
    jQuery(scriptBlock).before(markupControl);
    jQuery(scriptBlock).before(encodedMarkup);
    adjustTextareaSize(encodedMarkup); // Convert source to editable textarea.

    // Attach a change handler to update the live content.
    jQuery('textarea', encodedMarkup).data('live-target', mainContent[0]).change( function() {
      var newElement = jQuery(jQuery(this).val()).get(0);
      jQuery(jQuery(this).data('live-target')).replaceWith(newElement);
      jQuery(this).data('live-target', newElement);
    });
    encodedMarkup.hide(); // Initially hide the HTML source.
		
    // If CSS content exists, insert its toggle and source.
    if (typeof styleControl !== 'undefined') {
      jQuery(scriptBlock).before(styleControl);
      jQuery(scriptBlock).before(styleBlock);
      adjustTextareaSize(styleBlock);
      styleBlock.hide(); // Hide CSS source by default.
    }
		
    // Insert the JavaScript toggle link.
    jQuery(scriptBlock).before(codeControl);

    // Execute the embedded JavaScript code.
    eval(scriptBlock.html());
    adjustTextareaSize(scriptBlock, true); // Convert script block to textarea, with encoding.

    // Set up a change listener for live script editing.
    jQuery('textarea', scriptBlock).change( function() {
      eval(jQuery(this).val()); // Re-evaluate script on change.
    });
    scriptBlock.hide(); // Hide the JavaScript source initially.
  });
	
  // Apply a tooltip to all editable source textareas.
  jQuery('section.script textarea, section.markup-display textarea').bt('This is interactive code. Feel free to modify and experiment with new settings. Click (or use tab) outside the textarea to observe the results of your modifications. If issues arise, simply refresh the page.', {
    positions: 'right',
    trigger: ['focus', 'blur'],
    overlap: 8,
    width: 150,
    cssStyles: {
      fontSize: '11px'
    }
  });
});

/**
 * Converts a content block into a dynamically sized textarea.
 * @param {jQuery} elementContainer - The jQuery object containing the content to wrap.
 * @param {boolean} [applyEncoding=false] - Whether to HTML-encode the content before placing it in the textarea.
 */
function adjustTextareaSize(elementContainer, applyEncoding) {
  var contentVal = jQuery(elementContainer).html();
  if (applyEncoding) {
    contentVal = encodeHtmlEntities(contentVal);
  }
  jQuery(elementContainer).empty().append(jQuery('<textarea />').append(contentVal));

  var activeTextarea = jQuery('textarea', elementContainer);
  activeTextarea.width('100%'); // Ensure full width.

  // Calculate and set the height based on content.
  var calculatedHeight = activeTextarea.get(0).scrollHeight || 50;
  jQuery('textarea', elementContainer).css({
    height: calculatedHeight
  });
}

/**
 * Encodes HTML entities in a given string to prevent browser rendering.
 * @param {string} inputString - The string to encode.
 * @returns {string} The HTML-encoded string.
 */
function encodeHtmlEntities(inputString) {
  var tempDivElement = document.createElement('div');
  var textNode = document.createTextNode(inputString);
  tempDivElement.appendChild(textNode);
  return tempDivElement.innerHTML;
}