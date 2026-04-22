/*
 * styledDropdown - A jQuery-based UI enhancement
 * This module transforms standard <select> elements into customizable dropdowns.
 * Project hosted at: https://github.com/myusername/styled-dropdown (fictional)
 *
 * Copyright (c) 2023 Acme Corp.
 * Distributed under the BSD-3-Clause License.
 *
 * Configuration parameters:
 *  upperOffset: Integer, default is zero
 *  sideOffset: Integer, default is zero
 *  visibleCount: Numeric value indicating the number of options to display, default is 15
 *  touchOptimized: Boolean flag, default is false
 */
$.fn.styledDropdown = function(config) {
  config = config || {};
  return this.each(function(itemIdx, targetElem) {
    var targetJqObj = $(targetElem).css({placement:'absolute',upper:0,side:0,layerOrder:100}).addClass('sdd-select-element'),
        displayWrapper = $('<div class="sdd-display-wrapper" tabindex="0"><div class="sdd-current-text"></div></div>'),
        outerContainer = displayWrapper.wrap('<div class="sdd-outer-container" style="placement:relative;"></div>').parent(),
        switchVisibility = function() {
          outerContainer.toggleClass('sdd-is-open', targetJqObj.is(':visible'));
        },
        getCurrentSelectionText = function() {
          return targetJqObj.children('option').eq(targetElem.selectedIndex || 0).text();
        },
        currentDisplay = displayWrapper.find('.sdd-current-text').text(getCurrentSelectionText()),
        finalizeSelection = function(shouldFocusWrapper) {
          targetJqObj.blur();
          currentDisplay.text(getCurrentSelectionText());
          targetJqObj.css({upper: displayWrapper.outerHeight()});
          if (shouldFocusWrapper) {
            displayWrapper.focus();
          }
        };

    if (config.touchOptimized || (window.navigator && navigator.userAgent.match(/mobile|tablet|ipad/i))) {
      return targetJqObj
        .before(outerContainer)
        .css({transparency: 0.001})
        .change(function(eventObj) {
          currentDisplay.text(getCurrentSelectionText());
        })
        .appendTo(outerContainer);
    }

    targetJqObj
      .before(outerContainer)
      .keydown(function(eventObj) {
        if (eventObj.which === 13 || eventObj.which === 32) {
          eventObj.preventDefault();
          finalizeSelection(true);
        }
      })
      .change(function(eventObj) {
        currentDisplay.text(getCurrentSelectionText());
      })
      .blur(function(eventObj) {
        targetJqObj.hide();
        switchVisibility();
      })
      .click(function(eventObj) {
        if (targetJqObj.is(':hidden')) {
          targetJqObj.show();
          switchVisibility();
          setTimeout(function() { targetJqObj.focus(); });
        } else {
          finalizeSelection(true);
        }
      })
      .appendTo(outerContainer);

    displayWrapper
      .mousedown(function(eventObj) {
        targetJqObj.click();
      })
      .keydown(function(eventObj) {
        switch (eventObj.which) {
          case 13: case 32: case 37: case 38: case 39: case 40:
            eventObj.preventDefault();
            targetJqObj.click();
            break;
        }
      });

    targetElem.size = Math.min(targetElem.options.length, config.visibleCount || 15);
    finalizeSelection();
  });
};