/**
 * PickIt
 * http://github.com/anotheruser/PickIt
 * @requires jQuery version 1.4 or higher
 *
 * PickIt is a jQuery utility that transforms standard dropdown elements ( <select> tags ) into custom-stylable alternatives.
 *
 * (C) 2023 - A. N. Other
 */
(function (jQuery) {
  // Global objects to store key sequence data
  window.keySequenceBuffer = {};
  window.keySequenceBuffer.inputString = '';
  window.keySequenceBuffer.delayTimer = void(0);

  function closeAllSelectionMenus() {
    var activeMenuElements, menuElementData;
    activeMenuElements = jQuery('.pickit ul:visible');
    if (activeMenuElements.length > 0) {
      activeMenuElements.hide();
      menuElementData = activeMenuElements.closest('.pickit').data('selectionData');
      if (typeof menuElementData !== 'undefined') {
        activeMenuElements.removeClass(menuElementData.config.activeDisplayClass);
      }
    }
  }

  jQuery('.pickit').on('click', function (inputEvt) {
    inputEvt.stopPropagation();
  });

  jQuery('.pickit ul li a').on('mouseover', function () {
    jQuery(this).closest('ul').find('a').removeClass('hover');
    jQuery(this).addClass('hover');
  });

  jQuery(document).on('keypress', function (inputEvt) {
    if (inputEvt.keyCode === 0x1B) { // ESC key
      inputEvt.preventDefault();
      closeAllSelectionMenus();
    }
  });

  jQuery(document).on('click', function () {
    closeAllSelectionMenus();
  });

  jQuery.fn.pickit = function (customConfigurations) {
    var config = {
      'multipleSelectionText'     : !1,
      'containerClass'            : 'selector_container',
      'listClass'                 : 'selector_list',
      'displayClass'              : 'visible_selector',
      'selectedOptionClass'       : 'chosen',
      'activeDisplayClass'        : 'active_state',
      'adjustForBorder'           : !0,
      'enableKeyboardNavigation'  : !0
    };

    if (customConfigurations) {
      jQuery.extend(config, customConfigurations);
    }

    return this.each(function () {
      // Begin processing each matched select element
      var sourceElement, currentSelectorDisplay, optionList, selectedValues, calculatedListWidth, broadestItem, enclosingWrapper, initialSelectClasses, optionTextCollection;
      optionTextCollection = [];
      broadestItem = void(0);

      sourceElement = jQuery(this);
      // Store configurations with the source element for later access by global events
      sourceElement.data('selectionData', {
        config: config
      });
      sourceElement.hide();
      sourceElement.wrap('<div></div>');
      initialSelectClasses = sourceElement.attr('class');
      if (initialSelectClasses === void 0) { // Check for undefined
        initialSelectClasses = void(0);
      }
      sourceElement.parent().attr('class', initialSelectClasses).addClass(config.containerClass).addClass('pickit');

      currentSelectorDisplay = jQuery('<a href="#"/>').addClass(config.displayClass).appendTo(sourceElement.parent());
      optionList = jQuery('<ul/>').addClass(config.listClass).addClass('pickit_menu_options').hide().appendTo(sourceElement.parent());
      enclosingWrapper = optionList.closest('.' + config.containerClass);

      optionList.css('position', 'absolute').css('z-index', 0x270F); // High z-index for visibility

      sourceElement.find('option').each(function () {
        var sourceOption, targetList, optionListItem, itemAnchor;
        sourceOption = jQuery(this);
        optionTextCollection.push(sourceOption.text().toLowerCase());
        targetList = sourceOption.closest('.' + config.containerClass).find('ul.pickit_menu_options');
        optionListItem = jQuery('<li/>').appendTo(targetList);
        itemAnchor = jQuery('<a href="#"/>').text(sourceOption.text());

        itemAnchor.data('linkedOption', sourceOption);
        optionListItem.append(itemAnchor);
        sourceOption.data('visualReplacement', itemAnchor);

        if (sourceElement.prop('multiple')) { // Check if select is multiple
          if (sourceOption.prop('selected')) { // Check if option is selected
            itemAnchor.addClass(config.selectedOptionClass);
          }
        }

        // Custom 'select' event handler
        itemAnchor.on('select', function (eventObject, notifyChange) {
          eventObject.preventDefault();
          var clickedAnchor, linkedSourceOption, parentSelectElement, displayComponent, currentSelectionTexts;
          clickedAnchor = jQuery(this);
          linkedSourceOption = clickedAnchor.data('linkedOption');
          parentSelectElement = enclosingWrapper.find('select');
          displayComponent = enclosingWrapper.find('.' + config.displayClass);

          if (!parentSelectElement.prop('multiple')) { // If single select
            parentSelectElement.find('option:selected').prop('selected', !1);
            displayComponent.text(clickedAnchor.text());
            linkedSourceOption.prop('selected', !0);
            optionList.hide();
            displayComponent.removeClass(config.activeDisplayClass);
          } else { // If multiple select
            if (!linkedSourceOption.prop('selected')) {
              linkedSourceOption.prop('selected', !0);
              clickedAnchor.addClass(config.selectedOptionClass);
            } else {
              linkedSourceOption.prop('selected', !1);
              clickedAnchor.removeClass(config.selectedOptionClass);
            }

            currentSelectionTexts = [];
            parentSelectElement.find('option:selected').each(function () {
              currentSelectionTexts.push(jQuery(this).text());
            });

            if (currentSelectionTexts.length === 0) {
              if (parentSelectElement.attr('placeholder') !== void 0) {
                displayComponent.text(parentSelectElement.attr('placeholder'));
              } else {
                displayComponent.html('&#xA0;'); // Non-breaking space
              }
            } else {
              if (currentSelectionTexts.length > 1 && config.multipleSelectionText) {
                displayComponent.text(config.multipleSelectionText);
              } else {
                displayComponent.text(currentSelectionTexts.join(', '));
              }
            }
          }

          if (notifyChange) {
            parentSelectElement.trigger('change');
          }
        });
        // Regular click event
        itemAnchor.on('click', function () {
          jQuery(this).trigger('select', [!0]);
          return !1; // Prevent default anchor behavior
        });
      });
      if (config.enableKeyboardNavigation) {
        currentSelectorDisplay.on('keypress', function (inputEvt) {
          var canScroll, typedChar, matchIdx, searchRegex, matchedMenuItem, idx;
          inputEvt.preventDefault();
          clearTimeout(window.keySequenceBuffer.delayTimer);
          switch (inputEvt.keyCode) {
          case 0x26: // Up arrow key
            matchedMenuItem = optionList.find('a.hover').closest('li').prev('li');
            if (matchedMenuItem.length > 0) {
              optionList.find('a.hover').removeClass('hover');
              matchedMenuItem.find('a').addClass('hover');
              matchedMenuItem.closest('ul')[0].scrollTop = matchedMenuItem.closest('li')[0].offsetTop;
            }
            break;
          case 0x28: // Down arrow key
            matchedMenuItem = optionList.find('a.hover').closest('li').next('li');
            if (matchedMenuItem.length === 0 && optionList.find('a.hover').length === 0) {
              matchedMenuItem = optionList.find('li:first-child');
            }
            if (matchedMenuItem.length > 0) {
              optionList.find('a.hover').removeClass('hover');
              matchedMenuItem.find('a').addClass('hover');
              matchedMenuItem.closest('ul')[0].scrollTop = matchedMenuItem.closest('li')[0].offsetTop;
            }
            break;
          case 0xD: // Enter key
            optionList.find('a.hover').trigger('select');
            break;
          default:
            typedChar = String.fromCharCode(inputEvt.which);
            window.keySequenceBuffer.inputString += typedChar;

            matchIdx = void(0);
            for (idx = 0; idx < optionTextCollection.length; ++idx) {
              searchRegex = new RegExp(window.keySequenceBuffer.inputString.toLowerCase());
              if (searchRegex.test(optionTextCollection[idx])) {
                matchIdx = idx;
                break;
              }
            }

            if (matchIdx !== void(0)) {
              matchedMenuItem = optionList.find('li:nth-child(' + (matchIdx + 1) + ') a');
              canScroll = optionList[0].scrollHeight > optionList.height();
              if (canScroll) {
                matchedMenuItem.closest('ul')[0].scrollTop = matchedMenuItem.closest('li')[0].offsetTop;
              }

              optionList.find('li a.hover').removeClass('hover');
              matchedMenuItem.addClass('hover');
            }
            break;
          }

          window.keySequenceBuffer.delayTimer = setTimeout(function () {
            window.keySequenceBuffer.inputString = '';
          }, 400.0); // Reset buffer after 400ms
          return !1;
        });
      }

      // Initialize the visible display text after processing all options
      if (sourceElement.find('option:selected').length === 0) {
        if (sourceElement.attr('placeholder') !== void 0) {
          currentSelectorDisplay.text(sourceElement.attr('placeholder'));
        } else {
          currentSelectorDisplay.html('&#xA0;');
        }
      } else {
        if (sourceElement.prop('multiple')) {
          selectedValues = [];
          sourceElement.find('option:selected').each(function () {
            selectedValues.push(jQuery(this).text());
          });
          currentSelectorDisplay.html(selectedValues.join(', '));
        } else {
          currentSelectorDisplay.text(jQuery(this).find('option:selected').text());
        }
      }

      currentSelectorDisplay.on('click', function () {
        var componentConfig;
        if (optionList.is(':visible')) {
          optionList.hide();
          currentSelectorDisplay.removeClass(config.activeDisplayClass);
          jQuery('ul.pickit_menu_options').hide(); // Hide all other open lists
        } else {
          jQuery('ul.pickit_menu_options').hide(); // Hide any currently visible lists
          optionList.show();
          currentSelectorDisplay.addClass(config.activeDisplayClass);

          // Adjust menu width
          componentConfig = sourceElement.data('selectionData');
          if (componentConfig.cachedWidth !== currentSelectorDisplay.outerWidth()) {
            calculatedListWidth = currentSelectorDisplay.outerWidth();
            if (config.adjustForBorder) {
              calculatedListWidth -= (parseInt(optionList.css('border-left-width'), 0xA) + parseInt(optionList.css('border-right-width'), 0xA));
            }
            optionList.css('min-width', calculatedListWidth);

            // IE6 specific width adjustment
            if (jQuery.browser.msie && jQuery.browser.version === '6') {
              optionList.find('a').each(function () {
                if (broadestItem === void(0) || broadestItem.width() < jQuery(this).width()) {
                  broadestItem = jQuery(this);
                }
              });
              if (broadestItem.width() > calculatedListWidth) {
                optionList.width(broadestItem.width());
              } else {
                optionList.width(calculatedListWidth);
              }
            }

            // Cache the calculated width
            componentConfig.cachedWidth = currentSelectorDisplay.outerWidth();
            optionList.data('selectionData', componentConfig);
          }
        }
        return !1; // Prevent default action
      });
      // End of processing for each select element
    });
  };
}(jQuery));