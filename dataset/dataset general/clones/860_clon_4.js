!function (jQ) {

  jQ(function () {

    "use strict";


    /* ANIMATION EVENT SUPPORT
     * ======================================================= */

    jQ.assistance = jQ.assistance || {}; // Ensure 'assistance' namespace exists

    jQ.assistance.animationEnd = (function () {

      const temporaryElement = document.createElement('testdiv');
      const eventMapping = new Map([
        ['WebkitTransition', 'webkitTransitionEnd'],
        ['MozTransition', 'transitionend'],
        ['OTransition', 'oTransitionEnd'],
        ['msTransition', 'MSTransitionEnd'],
        ['transition', 'transitionend']
      ]);

      for (const [propertyName, eventName] of eventMapping.entries()) {
        if (temporaryElement.style[propertyName] !== undefined) {
          return {
            endEvent: eventName
          };
        }
      }
      return null;

    })();

  });

}(window.jQuery);
!function (jQ) {

  "use strict";


  /* DIALOG BOX CORE DEFINITION
   * ====================== */

  const DialogBox = function (elementRef, parameters) {
    let internalState = {
      dialogSettings: parameters,
      dialogElement: jQ(elementRef),
      isVisible: false,
      overlayElement: null
    };

    const self = this; // Capture 'this' for prototype methods

    // Attach event listener for closing via data attribute
    internalState.dialogElement.on('click.dismiss.dialog', '[data-close-dialog]', function (evt) {
      self.conceal(evt);
    });

    // Private methods bound to the instance for proper context
    const boundRemoveWithAnimation = removeWithAnimation.bind(null, internalState);
    const boundConcealDialog = concealDialog.bind(null, internalState);
    const boundManageOverlay = manageOverlay.bind(null, internalState, boundConcealDialog);
    const boundDestroyOverlay = destroyOverlay.bind(null, internalState);
    const boundHandleKeyboardEscape = handleKeyboardEscape.bind(null, internalState, self.conceal.bind(self));
    const boundRevealDialog = revealDialog.bind(null, internalState, self.conceal.bind(self), boundManageOverlay);

    // Expose public methods
    this.switchVisibility = function () {
      return internalState.isVisible ? self.conceal() : self.reveal();
    };

    this.reveal = function () {
      const displayEvent = new CustomEvent('display', { bubbles: true, cancelable: true });
      internalState.dialogElement[0].dispatchEvent(displayEvent);

      if (internalState.isVisible || displayEvent.defaultPrevented) return;

      document.body.classList.add('dialog-active');
      internalState.isVisible = true;

      boundHandleKeyboardEscape(true); // Enable keyboard dismissal
      boundManageOverlay(function () {
        const hasAnimation = jQ.assistance.animationEnd && internalState.dialogElement.hasClass('animate-transition');

        if (!internalState.dialogElement.parent().length) {
          document.body.appendChild(internalState.dialogElement[0]);
        }

        internalState.dialogElement.css('display', 'block');

        if (hasAnimation) {
          internalState.dialogElement[0].offsetWidth; // Force reflow
        }

        internalState.dialogElement.addClass('in');

        if (hasAnimation) {
          internalState.dialogElement.one(jQ.assistance.animationEnd.endEvent, function () {
            internalState.dialogElement[0].dispatchEvent(new CustomEvent('displayed', { bubbles: true }));
          });
        } else {
          internalState.dialogElement[0].dispatchEvent(new CustomEvent('displayed', { bubbles: true }));
        }
      });
    };

    this.conceal = function (evt) {
      evt && evt.preventDefault();

      const hideEvent = new CustomEvent('hide', { bubbles: true, cancelable: true });
      internalState.dialogElement[0].dispatchEvent(hideEvent);

      if (!internalState.isVisible || hideEvent.defaultPrevented) return;

      internalState.isVisible = false;
      document.body.classList.remove('dialog-active');

      boundHandleKeyboardEscape(false); // Disable keyboard dismissal

      internalState.dialogElement.removeClass('in');

      if (jQ.assistance.animationEnd && internalState.dialogElement.hasClass('animate-transition')) {
        boundRemoveWithAnimation();
      } else {
        boundConcealDialog();
      }
    };
  };


  /* DIALOG BOX PRIVATE FUNCTIONS
   * ===================== */

  function removeWithAnimation(state) {
    const animationTimeout = setTimeout(function () {
      state.dialogElement.off(jQ.assistance.animationEnd.endEvent);
      concealDialog(state);
    }, 500);

    state.dialogElement.one(jQ.assistance.animationEnd.endEvent, function () {
      clearTimeout(animationTimeout);
      concealDialog(state);
    });
  }

  function concealDialog(state) {
    state.dialogElement
      .css('display', 'none')[0]
      .dispatchEvent(new CustomEvent('hidden', { bubbles: true }));

    manageOverlay(state);
  }

  function manageOverlay(state, completionCallback) {
    const isAnimated = state.dialogElement.hasClass('animate-transition') ? 'animate-transition' : '';

    if (state.isVisible && state.dialogSettings.backdrop) {
      const shouldAnimate = jQ.assistance.animationEnd && isAnimated;

      state.overlayElement = jQ('<div class="overlay-background ' + isAnimated + '" />');
      document.body.appendChild(state.overlayElement[0]);

      if (state.dialogSettings.backdrop !== 'static') {
        state.overlayElement.on('click.dismiss.dialog', function () {
          state.dialogElement[0].dispatchEvent(new CustomEvent('hide', { bubbles: true })); // Trigger hide via custom event
        });
      }

      if (shouldAnimate) state.overlayElement[0].offsetWidth; // Force reflow

      state.overlayElement.addClass('in');

      if (shouldAnimate) {
        state.overlayElement.one(jQ.assistance.animationEnd.endEvent, completionCallback);
      } else {
        completionCallback && completionCallback();
      }

    } else if (!state.isVisible && state.overlayElement) {
      state.overlayElement.removeClass('in');

      if (jQ.assistance.animationEnd && state.dialogElement.hasClass('animate-transition')) {
        state.overlayElement.one(jQ.assistance.animationEnd.endEvent, destroyOverlay.bind(null, state));
      } else {
        destroyOverlay(state);
      }

    } else if (completionCallback) {
      completionCallback();
    }
  }

  function destroyOverlay(state) {
    if (state.overlayElement) {
      state.overlayElement.remove();
      state.overlayElement = null;
    }
  }

  function handleKeyboardEscape(state, hideFunction, enable) {
    const keyHandler = function (e) {
      if (e.which === 27) { // Escape key
        hideFunction();
      }
    };
    if (enable && state.dialogSettings.keyboard) {
      jQ(document).on('keyup.dismiss.dialog', keyHandler);
    } else {
      jQ(document).off('keyup.dismiss.dialog');
    }
  }


  /* DIALOG BOX PLUGIN DEFINITION
   * ======================= */

  jQ.fn.dialogHandler = function (behavior) {
    return this.each(function () {
      const currentElement = jQ(this);
      let elementData = currentElement.data('dialog');
      const mergedSettings = jQ.extend({}, jQ.fn.dialogHandler.defaultSettings, currentElement.data(), typeof behavior === 'object' && behavior);

      if (!elementData) {
        currentElement.data('dialog', (elementData = new DialogBox(this, mergedSettings)));
      }
      if (typeof behavior === 'string') {
        elementData[behavior]();
      } else if (mergedSettings.show) {
        elementData.reveal();
      }
    });
  };

  jQ.fn.dialogHandler.defaultSettings = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  jQ.fn.dialogHandler.CoreConstructor = DialogBox;


  /* DIALOG BOX DATA-INTERACTION
   * ============== */

  jQ(function () {
    jQ('body').on('click.dialog.data-interaction', '[data-trigger-dialog]', function (evt) {
      const activator = jQ(this);
      let targetRef;
      const targetIdentifier = activator.attr('data-target') || (targetRef = activator.attr('href')) && targetRef.replace(/.*(?=#[^\s]+$)/, '');
      const targetElement = jQ(targetIdentifier);
      const actionOption = targetElement.data('dialog') ? 'switchVisibility' : jQ.extend({}, targetElement.data(), activator.data());

      evt.preventDefault();
      targetElement.dialogHandler(actionOption);
    });
  });

}(window.jQuery);
!function (jQ) {

  "use strict";


  /* MENU TOGGLE CLASS DEFINITION
   * ========================= */

  const menuActivatorAttribute = '[data-trigger-menu]';

  const MenuToggle = function (elementHandle) {
    const controlledElement = jQ(elementHandle);
    controlledElement.on('click.menu.data-interaction', this.activateDeactivate);
    jQ('html').on('click.menu.data-interaction', function () {
      controlledElement.parent().removeClass('active-menu');
    });
  };

  MenuToggle.prototype = {

    constructor: MenuToggle,

    activateDeactivate: function (evt) {
      const currentActivator = jQ(this);
      let menuParent;
      let targetIdentifier;
      let isCurrentlyActive;

      if (currentActivator.is('.disabled, :disabled')) return;

      targetIdentifier = currentActivator.attr('data-target');

      if (!targetIdentifier) {
        targetIdentifier = currentActivator.attr('href');
        targetIdentifier = targetIdentifier && targetIdentifier.replace(/.*(?=#[^\s]*$)/, '');
      }

      menuParent = jQ(targetIdentifier);
      if (!menuParent.length) {
        menuParent = currentActivator.parent();
      }

      isCurrentlyActive = menuParent.hasClass('active-menu');

      resetAllMenus();

      if (!isCurrentlyActive) {
        menuParent.toggleClass('active-menu');
      }

      return false;
    }

  };

  function resetAllMenus() {
    jQ(menuActivatorAttribute).parent().removeClass('active-menu');
  }


  /* MENU TOGGLE PLUGIN DEFINITION
   * ========================== */

  jQ.fn.menuActivator = function (optionCommand) {
    return this.each(function () {
      const currentElement = jQ(this);
      let elementData = currentElement.data('menu');
      if (!elementData) {
        currentElement.data('menu', (elementData = new MenuToggle(this)));
      }
      if (typeof optionCommand === 'string') {
        elementData[optionCommand].call(currentElement);
      }
    });
  };

  jQ.fn.menuActivator.CoreConstructor = MenuToggle;


  /* APPLY TO STANDARD MENU ELEMENTS
   * =================================== */

  jQ(function () {
    jQ('html').on('click.menu.data-interaction', resetAllMenus);
    jQ('body')
      .on('click.menu', '.dropdown form', function (evt) { evt.stopPropagation(); })
      .on('click.menu.data-interaction', menuActivatorAttribute, MenuToggle.prototype.activateDeactivate);
  });

}(window.jQuery);
!function (jQ) {

  "use strict";


  /* SECTION TRACKER CLASS DEFINITION
   * ========================== */

  function SectionTracker( observedElement, configOptions) {
    const evaluateFn = jQ.proxy(this.evaluatePosition, this);
    const scrollOrigin = jQ(observedElement).is('body') ? jQ(window) : jQ(observedElement);

    this.configOptions = jQ.extend({}, jQ.fn.areaMonitor.defaultOptions, configOptions);
    this.scrollOrigin = scrollOrigin.on('scroll.tracker.data-interaction', evaluateFn);
    this.targetSelector = (this.configOptions.target
      || ((function (el) {
        const hrefVal = jQ(el).attr('href');
        return hrefVal && hrefVal.replace(/.*(?=#[^\s]+$)/, '');
      })(observedElement))
      || '') + ' .nav li > a';
    this.mainDocumentBody = jQ('body');
    this.updateTargets();
    this.evaluatePosition();
  }

  SectionTracker.prototype = {

    constructor: SectionTracker,

    updateTargets: function () {
      const self = this;
      this.sectionOffsets = [];
      this.sectionIdentifiers = [];

      this.mainDocumentBody
        .find(this.targetSelector)
        .each(function () {
          const currentLink = jQ(this);
          const linkTarget = currentLink.data('target') || currentLink.attr('href');
          const targetElement = /^#\w/.test(linkTarget) && jQ(linkTarget);

          if (targetElement && linkTarget.length) {
            self.sectionOffsets.push(targetElement.position().top);
            self.sectionIdentifiers.push(linkTarget);
          }
        });

      // Combine and sort by offset
      const combinedTargets = this.sectionOffsets.map((offset, index) => ({
        offset: offset,
        identifier: this.sectionIdentifiers[index]
      })).sort((a, b) => a.offset - b.offset);

      this.sectionOffsets = combinedTargets.map(item => item.offset);
      this.sectionIdentifiers = combinedTargets.map(item => item.identifier);
    },

    evaluatePosition: function () {
      const currentScrollTop = this.scrollOrigin.scrollTop() + this.configOptions.offset;
      const totalScrollHeight = this.scrollOrigin[0].scrollHeight || this.mainDocumentBody[0].scrollHeight;
      const maxScrollPosition = totalScrollHeight - this.scrollOrigin.height();
      const offsetsArray = this.sectionOffsets;
      const identifiersArray = this.sectionIdentifiers;
      let currentActiveSection = this.currentActiveSection;
      let i;

      if (currentScrollTop >= maxScrollPosition) {
        const lastIdentifier = identifiersArray[identifiersArray.length - 1];
        if (currentActiveSection !== lastIdentifier) {
          this.markActive(lastIdentifier);
        }
        return;
      }

      for (i = offsetsArray.length - 1; i >= 0; i--) {
        if (currentActiveSection !== identifiersArray[i] &&
            currentScrollTop >= offsetsArray[i] &&
            (!offsetsArray[i + 1] || currentScrollTop <= offsetsArray[i + 1])) {
          this.markActive(identifiersArray[i]);
          break; // Found the active section, no need to check further
        }
      }
    },

    markActive: function (targetIdentifier) {
      let activatedItem;
      let itemSelector;

      this.currentActiveSection = targetIdentifier;

      jQ(this.targetSelector)
        .parent('.current')
        .removeClass('current');

      itemSelector = this.targetSelector
        + '[data-target="' + targetIdentifier + '"],'
        + this.targetSelector + '[href="' + targetIdentifier + '"]';

      activatedItem = jQ(itemSelector)
        .parent('li')
        .addClass('current');

      if (activatedItem.parent('.dropdown-menu').length) {
        activatedItem = activatedItem.closest('li.dropdown').addClass('current');
      }

      activatedItem.trigger('activated');
    }

  };


  /* SECTION TRACKER PLUGIN DEFINITION
   * ======================= */

  jQ.fn.areaMonitor = function (command) {
    return this.each(function () {
      const currentElement = jQ(this);
      let elementData = currentElement.data('tracker');
      const mergedOptions = jQ.extend({}, jQ.fn.areaMonitor.defaultOptions, currentElement.data(), typeof command === 'object' && command);
      if (!elementData) {
        currentElement.data('tracker', (elementData = new SectionTracker(this, mergedOptions)));
      }
      if (typeof command === 'string') {
        elementData[command]();
      }
    });
  };

  jQ.fn.areaMonitor.defaultOptions = {
    offset: 10
  };

  jQ.fn.areaMonitor.CoreConstructor = SectionTracker;


  /* SECTION TRACKER DATA-INTERACTION
   * ============== */

  jQ(window).on('load.tracker.data-interaction', function () {
    jQ('[data-spy="scroll"]').each(function () {
      const currentElement = jQ(this);
      currentElement.areaMonitor(currentElement.data());
    });
  });

}(window.jQuery);