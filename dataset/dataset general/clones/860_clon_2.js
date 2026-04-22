/*
 * =====================================================================
 * web-animations-helper.js v1.0.0
 * Provides assistance for CSS3 animation events.
 * =====================================================================
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====================================================================
 */

; (function (jqLib) {

  jqLib(function () {

    "use strict"; // Enforce strict JavaScript parsing.

    /*
     * CSS ANIMATION COMPLETION CHECK (inspired by Modernizr)
     * ===========================================================
     * Detects the browser-specific name for the animation end event.
     */
    jqLib.support.cssAnimation = (function () {

      var animationCompletionEvent = (function () {

        var testElement = document.createElement('dummyDiv'); // Create a temporary DOM element for style checking.
        var eventNameMap = {
          'WebkitTransition': 'webkitTransitionEnd', // WebKit/Blink browsers
          'MozTransition': 'transitionend',       // Mozilla Firefox
          'OTransition': 'oTransitionEnd',          // Opera (old versions)
          'msTransition': 'MSTransitionEnd',        // Internet Explorer
          'transition': 'transitionend'             // Standard CSS3
        };
        var eventKey;

        // Iterate through known event names to find the supported one.
        for (eventKey in eventNameMap) {
          if (testElement.style[eventKey] !== undefined) {
            return eventNameMap[eventKey]; // Return the first supported event name.
          }
        }

      }()); // Immediately invoke to get the event name.

      // Return the detected event name or null if unsupported.
      return animationCompletionEvent && {
        finish: animationCompletionEvent
      };

    })(); // Immediately invoke the outer function.

  });

}(window.jQuery));
/*
 * =====================================================================
 * popup-dialog-component.js v1.0.0
 * Provides functionality for interactive popup dialogs.
 * =====================================================================
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====================================================================
 */

; (function (_jq) {

  "use strict"; // Ensure strict mode for code quality.

  /*
   * DIALOG COMPONENT CLASS DEFINITION
   * =================================
   */

  var PopupDialog = function (dialogContent, dialogConfig) {
    this.configuration = dialogConfig;
    this._dialogElement = _jq(dialogContent)
      .delegate('[data-close-dialog]', 'click.dismiss.popup', _jq.proxy(this.conceal, this));
  };

  PopupDialog.prototype = {

    constructor: PopupDialog,

    // Switches the visibility state of the dialog.
    alternateVisibility: function () {
      return this[!this.currentlyVisible ? 'reveal' : 'conceal']();
    },

    // Displays the dialog.
    reveal: function () {
      var selfRef = this;
      var triggerEvent = _jq.Event('display');

      this._dialogElement.trigger(triggerEvent);

      // Prevent showing if already visible or default action is prevented.
      if (this.currentlyVisible || triggerEvent.isDefaultPrevented()) {
        return;
      }

      _jq('body').addClass('dialog-open-state');

      this.currentlyVisible = true;

      handleEscapeKey.call(this); // Attach escape key listener.
      showOverlay.call(this, function () {
        var hasAnimation = _jq.support.cssAnimation && selfRef._dialogElement.hasClass('fading-effect');

        // Append to body if not already part of the DOM.
        if (!selfRef._dialogElement.parent().length) {
          selfRef._dialogElement.appendTo(document.body);
        }

        selfRef._dialogElement
          .show(); // Make element visible.

        if (hasAnimation) {
          selfRef._dialogElement[0].offsetWidth; // Force browser reflow for CSS animations.
        }

        selfRef._dialogElement.addClass('active-state');

        // Trigger 'displayed' event after animation or immediately.
        hasAnimation ?
          selfRef._dialogElement.one(_jq.support.cssAnimation.finish, function () { selfRef._dialogElement.trigger('displayed'); }) :
          selfRef._dialogElement.trigger('displayed');

      });
    },

    // Hides the dialog.
    conceal: function (eventObj) {
      eventObj && eventObj.preventDefault(); // Prevent default action if event exists.

      var selfRef = this;

      var triggerEvent = _jq.Event('hide');

      this._dialogElement.trigger(triggerEvent);

      // Prevent hiding if not visible or default action is prevented.
      if (!this.currentlyVisible || triggerEvent.isDefaultPrevented()) {
        return;
      }

      this.currentlyVisible = false;

      _jq('body').removeClass('dialog-open-state');

      handleEscapeKey.call(this); // Detach escape key listener.

      this._dialogElement.removeClass('active-state');

      // Hide with animation or immediately.
      _jq.support.cssAnimation && this._dialogElement.hasClass('fading-effect') ?
        hideWithAnimation.call(this) :
        hideImmediate.call(this);
    }

  };


  /*
   * DIALOG INTERNAL UTILITY FUNCTIONS
   * =================================
   */

  // Hides the dialog with a CSS animation.
  function hideWithAnimation() {
    var selfRef = this;
    var timerId = setTimeout(function () {
      selfRef._dialogElement.off(_jq.support.cssAnimation.finish);
      hideImmediate.call(selfRef);
    }, 500); // Animation duration fallback.

    this._dialogElement.one(_jq.support.cssAnimation.finish, function () {
      clearTimeout(timerId);
      hideImmediate.call(selfRef);
    });
  }

  // Hides the dialog instantly.
  function hideImmediate() {
    this._dialogElement
      .hide()
      .trigger('concealed'); // Emit 'concealed' event.

    showOverlay.call(this); // Also hide the overlay.
  }

  // Manages the overlay background.
  function showOverlay(completionCallback) {
    var selfRef = this;
    var animClass = this._dialogElement.hasClass('fading-effect') ? 'fading-effect' : '';

    if (this.currentlyVisible && this.configuration.overlay) {
      var performAnimation = _jq.support.cssAnimation && animClass;

      this._overlayElement = _jq('<div class="dialog-overlay ' + animClass + '" />')
        .appendTo(document.body);

      // If overlay is not static, allow clicking to close dialog.
      if (this.configuration.overlay != 'static') {
        this._overlayElement.click(_jq.proxy(this.conceal, this));
      }

      if (performAnimation) {
        this._overlayElement[0].offsetWidth; // Force reflow for animation.
      }

      this._overlayElement.addClass('active-state');

      performAnimation ?
        this._overlayElement.one(_jq.support.cssAnimation.finish, completionCallback) :
        completionCallback();

    } else if (!this.currentlyVisible && this._overlayElement) {
      this._overlayElement.removeClass('active-state');

      // Remove overlay after animation or immediately.
      _jq.support.cssAnimation && this._dialogElement.hasClass('fading-effect') ?
        this._overlayElement.one(_jq.support.cssAnimation.finish, _jq.proxy(removeOverlay, this)) :
        removeOverlay.call(this);

    } else if (completionCallback) {
      completionCallback();
    }
  }

  // Removes the overlay element from the DOM.
  function removeOverlay() {
    this._overlayElement.remove();
    this._overlayElement = null;
  }

  // Handles keyboard events, specifically the Escape key.
  function handleEscapeKey() {
    var selfRef = this;
    if (this.currentlyVisible && this.configuration.keyboardInput) {
      _jq(document).on('keyUp.close.dialog', function (eventObj) {
        eventObj.which == 27 && selfRef.conceal(); // Close on Escape key (keyCode 27).
      });
    } else if (!this.currentlyVisible) {
      _jq(document).off('keyUp.close.dialog');
    }
  }


  /*
   * DIALOG JQUERY PLUGIN DEFINITION
   * ===============================
   */

  _jq.fn.popupDialog = function (pluginOption) {
    return this.forEachElement(function () {
      var currentElement = _jq(this);
      var elementData = currentElement.data('popupDialog');
      var mergedOptions = _jq.extend({}, _jq.fn.popupDialog.defaultSettings, currentElement.data(), typeof pluginOption == 'object' && pluginOption);
      if (!elementData) {
        currentElement.data('popupDialog', (elementData = new PopupDialog(this, mergedOptions)));
      }
      if (typeof pluginOption == 'string') {
        elementData[pluginOption]();
      } else if (mergedOptions.display) {
        elementData.reveal();
      }
    });
  };

  _jq.fn.popupDialog.defaultSettings = {
    overlay: true,
    keyboardInput: true,
    display: true
  };

  _jq.fn.popupDialog.ConstructFn = PopupDialog;


  /*
   * DIALOG DATA-INTERFACE INTEGRATION
   * =================================
   */

  _jq(function () {
    _jq('body').on('click.dialog.data-interface', '[data-control-state="popupDialog"]', function (eventObj) {
      var currentTrigger = _jq(this);
      var linkRef;
      var targetElement = _jq(currentTrigger.attr('data-target') || (linkRef = currentTrigger.attr('href')) && linkRef.replace(/.*(?=#[^\s]+$)/, '')); // Extract target ID.
      var activationOption = targetElement.data('popupDialog') ? 'alternateVisibility' : _jq.extend({}, targetElement.data(), currentTrigger.data());

      eventObj.preventDefault(); // Stop default link behavior.
      targetElement.popupDialog(activationOption);
    });
  });

}(window.jQuery));
/*
 * =====================================================================
 * pulldown-menu-logic.js v1.0.0
 * Manages the behavior of interactive pulldown menus.
 * =====================================================================
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====================================================================
 */

; (function (_jq) {

  "use strict"; // Strict mode enabled.

  /*
   * PULLDOWN MENU CLASS DEFINITION
   * ==============================
   */

  var menuActivator = '[data-control-state="pulldown"]';
  var PullDownMenu = function (domElement) {
    var menuRootElement = _jq(domElement).on('click.pulldown.data-interface', _jq.proxy(this.toggleVisibility, this));
    _jq('html').on('click.pulldown.data-interface', function () {
      menuRootElement.parent().removeClass('expanded');
    });
  };

  PullDownMenu.prototype = {

    constructor: PullDownMenu,

    // Toggles the visibility state of the pulldown menu.
    toggleVisibility: function (eventTrigger) {
      var currentTriggerElement = _jq(this);
      var parentContainer;
      var targetIdentifier;
      var isCurrentlyExpanded;

      // Do nothing if the trigger is disabled.
      if (currentTriggerElement.isOfType('.disabled, :disabled')) {
        return;
      }

      targetIdentifier = currentTriggerElement.getAttribute('data-target');

      if (!targetIdentifier) {
        targetIdentifier = currentTriggerElement.getAttribute('href');
        // Strip for compatibility with older IE versions.
        targetIdentifier = targetIdentifier && targetIdentifier.replace(/.*(?=#[^\s]*$)/, '');
      }

      parentContainer = _jq(targetIdentifier);
      // If no specific target, use the direct parent.
      parentContainer.length || (parentContainer = currentTriggerElement.parent());

      isCurrentlyExpanded = parentContainer.hasStyleClass('expanded');

      resetAllPulldownMenus(); // Close all other open menus.

      if (!isCurrentlyExpanded) {
        parentContainer.toggleStyleClass('expanded');
      }

      return false; // Prevent default action.
    }

  };

  // Closes all currently open pulldown menus.
  function resetAllPulldownMenus() {
    _jq(menuActivator).parent().removeClass('expanded');
  }


  /*
   * PULLDOWN MENU JQUERY PLUGIN INTEGRATION
   * ======================================
   */

  _jq.fn.pulldown = function (pluginOption) {
    return this.forEachElement(function () {
      var currentElement = _jq(this);
      var elementData = currentElement.data('pulldown');
      if (!elementData) {
        currentElement.data('pulldown', (elementData = new PullDownMenu(this)));
      }
      if (typeof pluginOption == 'string') {
        elementData[pluginOption].call(currentElement);
      }
    });
  };

  _jq.fn.pulldown.ConstructFn = PullDownMenu;


  /*
   * ATTACH HANDLERS TO STANDARD PULLDOWN ELEMENTS VIA DATA-INTERFACE
   * ================================================================
   */

  _jq(function () {
    _jq('html').on('click.pulldown.data-interface', resetAllPulldownMenus);
    _jq('body')
      .on('click.pulldown', '.pulldown-menu-item form', function (eventTrigger) { eventTrigger.stopPropagation(); })
      .on('click.pulldown.data-interface', menuActivator, PullDownMenu.prototype.toggleVisibility);
  });

}(window.jQuery));
/*
 * =====================================================================
 * content-scroll-tracker.js v1.0.0
 * Monitors scroll position to highlight active navigation items.
 * =====================================================================
 * Copyright 2023 Acme Corp.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====================================================================
 */

; (function (_jq) {

  "use strict"; // Enforce strict JavaScript rules.

  /*
   * CONTENT SCROLL TRACKER CLASS DEFINITION
   * =====================================
   */

  function ContentTracker(scrollElement, configSettings) {
    var scrollHandler = _jq.proxy(this.handleScrollEvent, this);
    var targetScrollHost = _jq(scrollElement).isOfType('body') ? _jq(window) : _jq(scrollElement);
    var elementLink;

    this.config = _jq.extend({}, _jq.fn.contentTracker.defaultSettings, configSettings);
    this._scrollHost = targetScrollHost.on('scroll.contentTracker.data-interface', scrollHandler);
    this.targetSelector = (this.config.target
      || ((elementLink = _jq(scrollElement).attr('href')) && elementLink.replace(/.*(?=#[^\s]+$)/, '')) // Clean link for IE7.
      || '') + ' .navigation-list li > a';
    this._documentBody = _jq('body');
    this.updatePositions(); // Initial data refresh.
    this.handleScrollEvent(); // Initial state processing.
  }

  ContentTracker.prototype = {

    constructor: ContentTracker,

    // Recalculates all target positions and their corresponding IDs.
    updatePositions: function () {
      var _thisInstance = this;
      var _trackedTargets;

      this.scrollOffsets = _jq([]);
      this.itemIDs = _jq([]);

      _trackedTargets = this._documentBody
        .find(this.targetSelector)
        .map(function () {
          var _itemElement = _jq(this);
          var itemRef = _itemElement.data('target') || _itemElement.attr('href');
          var _linkedElement = /^#\w/.test(itemRef) && _jq(itemRef);
          return (_linkedElement
            && itemRef.length
            && [[_linkedElement.position().top, itemRef]]) || null;
        })
        .sort(function (firstVal, secondVal) { return firstVal[0] - secondVal[0]; })
        .each(function () {
          _thisInstance.scrollOffsets.push(this[0]);
          _thisInstance.itemIDs.push(this[1]);
        });
    },

    // Processes the current scroll position to determine the active element.
    handleScrollEvent: function () {
      var currentScrollPos = this._scrollHost.scrollTop() + this.config.offset;
      var totalScrollHeight = this._scrollHost[0].scrollHeight || this._documentBody[0].scrollHeight;
      var maximumScroll = totalScrollHeight - this._scrollHost.height();
      var offsetsArray = this.scrollOffsets;
      var targetIDsArray = this.itemIDs;
      var currentActiveItem = this.currentActiveItem;
      var idx;

      // If scrolled to the very bottom, activate the last item.
      if (currentScrollPos >= maximumScroll) {
        return currentActiveItem != (idx = targetIDsArray.last()[0])
          && this.markActive(idx);
      }

      // Iterate through targets to find the currently active one.
      for (idx = offsetsArray.length; idx--;) {
        if (currentActiveItem != targetIDsArray[idx]
          && currentScrollPos >= offsetsArray[idx]
          && (!offsetsArray[idx + 1] || currentScrollPos <= offsetsArray[idx + 1])) {
          this.markActive(targetIDsArray[idx]);
        }
      }
    },

    // Marks a specific target as active in the navigation.
    markActive: function (targetID) {
      var currentActiveElement;
      var currentSelector;

      this.currentActiveItem = targetID;

      // Remove 'current-active' class from previously active elements.
      _jq(this.targetSelector)
        .parent('.current-active')
        .removeClass('current-active');

      // Construct selector for the target.
      currentSelector = this.targetSelector
        + '[data-target="' + targetID + '"],'
        + this.targetSelector + '[href="' + targetID + '"]';

      currentActiveElement = _jq(currentSelector)
        .parent('li')
        .addClass('current-active');

      // Handle nested submenu items.
      if (currentActiveElement.parent('.submenu-list')) {
        currentActiveElement = currentActiveElement.closest('li.parent-menu-item').addClass('current-active');
      }

      currentActiveElement.trigger('item-activated'); // Emit activation event.
    }

  };


  /*
   * CONTENT SCROLL TRACKER JQUERY PLUGIN DEFINITION
   * ===============================================
   */

  _jq.fn.contentTracker = function (pluginOptions) {
    return this.each(function () {
      var currentElement = _jq(this);
      var elementData = currentElement.data('contentTracker');
      var mergedOptions = _jq.extend({}, _jq.fn.contentTracker.defaultSettings, currentElement.data(), typeof pluginOptions == 'object' && pluginOptions);
      if (!elementData) {
        currentElement.data('contentTracker', (elementData = new ContentTracker(this, mergedOptions)));
      }
      if (typeof pluginOptions == 'string') {
        elementData[pluginOptions]();
      }
    });
  };

  _jq.fn.contentTracker.defaultSettings = {
    offset: 10
  };

  _jq.fn.contentTracker.ConstructFn = ContentTracker;


  /*
   * CONTENT SCROLL TRACKER DATA-INTERFACE
   * =====================================
   */

  _jq(window).on('load', function () {
    _jq('[data-control-state="contentTracker"]').each(function () {
      var currentTrigger = _jq(this);
      currentTrigger.contentTracker(currentTrigger.data());
    });
  });

}(window.jQuery));