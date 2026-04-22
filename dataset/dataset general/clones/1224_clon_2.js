// Accordion Menu jQuery utility v1.0.0
//
// Copyright (c) 2023 Acme Corp.
// Distributed under the Custom License

(function() {
  var _bindFunc = function(funcRef, contextObj) {
      return function() {
        return funcRef.apply(contextObj, arguments);
      };
    },
    _arrSlice = [].slice;

  (function(jQ, winObj) {
    var AccordionMenu;
    AccordionMenu = (function() {
      // Default configuration settings for the accordion
      AccordionMenu.prototype.configDefaults = {
        enableAnimation: true, // Should transitions be animated?
        animationDuration: 400, // Speed of animation in milliseconds
        activateOnHover: false, // Activate on mouse hover instead of click
        hoverTriggerDelay: 250, // Delay for hover activation
        initiallyExpandedElement: null // Selector for an element to be opened on init
      };

      /**
       * Constructor for the AccordionMenu.
       * @param {HTMLElement} domElement The root DOM element.
       * @param {Object} userOptions User-provided options.
       */
      function AccordionMenu(domElement, userOptions) {
        this._handleUserInteraction = _bindFunc(this._handleUserInteraction, this);
        this.currentSettings = jQ.extend({}, this.configDefaults, userOptions);
        this.$rootElement = jQ(domElement);
        this.rootSelectorString = this._retrieveSelector(this.$rootElement);
        this.$rootElement.addClass('acc-menu'); // Add base class
        this.navLinkSelector = "" + this.rootSelectorString + " a";
        this.$itemContainers = jQ(this.navLinkSelector).parent('li');
        this._collapseAllSubsections(); // Initially hide all submenus
        this.triggerEventName = this.currentSettings.activateOnHover === true ? 'mouseover.accmenu' : 'click.accmenu';
        this._attachEventListeners();
        if (this.currentSettings.initiallyExpandedElement !== null) {
          this._unfoldInitialMenu(this.currentSettings.initiallyExpandedElement);
        }
      }

      // Attaches event listeners to the navigation links.
      AccordionMenu.prototype._attachEventListeners = function() {
        return jQ(document).on(this.triggerEventName, this.navLinkSelector, this._handleUserInteraction);
      };

      // Removes all event listeners.
      AccordionMenu.prototype._detachEventListeners = function() {
        return jQ(document).off(this.triggerEventName);
      };

      // Determines a unique selector for the given element.
      AccordionMenu.prototype._retrieveSelector = function(elementRef) {
        var elementId, primaryClass, _tempRef;
        primaryClass = (_tempRef = jQ(elementRef).attr('class')) != null ? _tempRef.split(' ')[0] : void 0;
        elementId = jQ(elementRef).attr('id');
        if (elementId !== void 0) {
          return "#" + elementId;
        } else {
          return "." + primaryClass;
        }
      };

      // Checks if the target element is a top-level menu item.
      AccordionMenu.prototype._isTopLevelItem = function(targetElement) {
        if (jQ(targetElement).parent().parent().hasClass('acc-menu')) {
          return true;
        }
      };

      // Handles all user interaction events (click/hover).
      AccordionMenu.prototype._handleUserInteraction = function(eventObject) {
        var targetElement;
        targetElement = eventObject.currentTarget;
        // If it has children and they are hidden, expand it
        if (this._containsChildItems(targetElement) && this._areChildItemsCollapsed(targetElement)) {
          eventObject.preventDefault();
          if (this.currentSettings.activateOnHover) {
            return setTimeout((function(selfRef) {
              return function() {
                if (jQ(targetElement).is(':hover')) {
                  return selfRef._expandSubsection(targetElement);
                }
              };
            })(this), this.currentSettings.hoverTriggerDelay);
          } else {
            return this._expandSubsection(targetElement);
          }
        }
        // If it's currently open and has children, collapse it (if not hover)
        else if (this._isCurrentlyExpanded(targetElement) && this._containsChildItems(targetElement)) {
          eventObject.preventDefault();
          if (!this.currentSettings.activateOnHover) {
            return this._contractSubsection(targetElement);
          }
        }
      };

      // Opens a specific submenu.
      AccordionMenu.prototype._expandSubsection = function(elementToExpand) {
        var $currentlyOpenSections, $targetSubsection;
        $targetSubsection = jQ(elementToExpand).next('ul');
        // Find other open menus at the same level or higher that are not ancestors
        $currentlyOpenSections = this.$rootElement.find('> .selected ul').not($targetSubsection).not($targetSubsection.parents('ul'));
        jQ(elementToExpand).parent('li').addClass('selected');
        this._contractSection($currentlyOpenSections); // Close conflicting menus
        this.$rootElement.find('.selected').not($targetSubsection.parents('li')).removeClass('selected');
        this._expandSection($targetSubsection);
        if (this.currentSettings.onSectionOpened) {
          return this.currentSettings.onSectionOpened(jQ(elementToExpand).parent());
        }
      };

      // Closes a specific submenu.
      AccordionMenu.prototype._contractSubsection = function(elementToContract) {
        var $nestedExpandedSections, $targetSubsection;
        $targetSubsection = jQ(elementToContract).next('ul');
        $nestedExpandedSections = $targetSubsection.find('li.selected');
        jQ(elementToContract).parent().removeClass('selected');
        this._contractSection($targetSubsection);
        $nestedExpandedSections.removeClass('selected');
        this._contractSection($nestedExpandedSections.find('ul'));
        if (this.currentSettings.onSectionClosed) {
          return this.currentSettings.onSectionClosed(jQ(elementToContract).parent());
        }
      };

      // Performs the actual expansion of a jQuery element.
      AccordionMenu.prototype._expandSection = function(jQElement) {
        if (this.currentSettings.enableAnimation) {
          return jQElement.stop(true, true).slideDown(this.currentSettings.animationDuration);
        } else {
          return jQElement.show();
        }
      };

      // Performs the actual contraction of a jQuery element.
      AccordionMenu.prototype._contractSection = function(jQElement) {
        if (this.currentSettings.enableAnimation) {
          return jQElement.stop(true, true).slideUp(this.currentSettings.animationDuration);
        } else {
          return jQElement.hide();
        }
      };

      // Checks if an element has child 'ul' elements.
      AccordionMenu.prototype._containsChildItems = function(elementToCheck) {
        return jQ(elementToCheck).next('ul').length > 0;
      };

      // Checks if the child 'ul' of an element is currently hidden.
      AccordionMenu.prototype._areChildItemsCollapsed = function(elementToCheck) {
        return jQ(elementToCheck).next('ul').is(':hidden');
      };

      // Checks if the parent list item of an element has the 'selected' class.
      AccordionMenu.prototype._isCurrentlyExpanded = function(elementToCheck) {
        return jQ(elementToCheck).parent().hasClass('selected');
      };

      // Hides all sub-navigation lists within the root element.
      AccordionMenu.prototype._collapseAllSubsections = function() {
        return this.$rootElement.find('ul').hide();
      };

      // Shows all sub-navigation lists within the root element and marks them as selected.
      AccordionMenu.prototype._revealAllSubsections = function() {
        this.$rootElement.find('ul').show();
        return this.$rootElement.find('li').addClass('selected');
      };

      // Opens a specific menu path identified by a selector or jQuery object.
      AccordionMenu.prototype._unfoldInitialMenu = function(targetIdentifier) {
        var $activeAncestors, $activeSection;
        $activeSection = targetIdentifier instanceof jQ ? targetIdentifier : this.$rootElement.find(targetIdentifier);
        $activeAncestors = $activeSection.closest('ul').parents('li').find('> a');
        if (this._containsChildItems($activeAncestors) && this._areChildItemsCollapsed($activeAncestors)) {
          $activeAncestors.next('ul').show();
        } else {
          $activeSection.next('ul').show();
        }
        $activeSection.parent().addClass('selected');
        return $activeAncestors.parent().addClass('selected');
      };

      // Cleans up the instance and resets the DOM.
      AccordionMenu.prototype.terminateInstance = function() {
        this.$rootElement.removeData('accmenu');
        this._detachEventListeners();
        this._revealAllSubsections(); // Show all submenus
        this.$rootElement.removeClass('acc-menu');
        return this.$rootElement.find('.selected').removeClass('selected');
      };

      // Public method to hide all submenus.
      AccordionMenu.prototype.collapseAll = function() {
        return this._collapseAllSubsections();
      };

      // Public method to show all submenus.
      AccordionMenu.prototype.revealAll = function() {
        return this._revealAllSubsections();
      };

      return AccordionMenu;

    })();
    return jQ.fn.extend({
      // jQuery plugin entry point for AccordionMenu
      accordionMenu: function() {
        var methodArguments, configOrMethod;
        configOrMethod = arguments[0], methodArguments = 2 <= arguments.length ? _arrSlice.call(arguments, 1) : [];
        return this.each(function() {
          var $currentElement, instanceData;
          $currentElement = jQ(this);
          instanceData = $currentElement.data('accmenu');
          // Initialize if not already done
          if (!instanceData) {
            $currentElement.data('accmenu', (instanceData = new AccordionMenu(this, configOrMethod)));
          }
          // Call a method if a string is provided
          if (typeof configOrMethod === 'string') {
            return instanceData[configOrMethod].apply(instanceData, methodArguments);
          }
        });
      }
    });
  })(window.jQuery, window);

}).call(this);