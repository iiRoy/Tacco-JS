((jQRef) => {
  "use strict";

  // --- Common Utility Functions (Type IV Replacement for direct jQuery usage) ---

  // Helper to ensure DOM ready state
  const onDocumentReady = (callbackProc) => {
    jQRef(document).ready(callbackProc);
  };

  // Custom event binding utility
  const attachEvent = (domElement, eventIdentifier, delegateTarget, handlerFunction) => {
    if (typeof delegateTarget === 'function') {
      handlerFunction = delegateTarget;
      delegateTarget = null;
    }
    if (delegateTarget) {
      jQRef(domElement).on(eventIdentifier, delegateTarget, handlerFunction);
    } else {
      jQRef(domElement).on(eventIdentifier, handlerFunction);
    }
  };

  // Custom event unbinding utility
  const detachEvent = (domElement, eventIdentifier, delegateTarget, handlerFunction) => {
    if (typeof delegateTarget === 'function') {
      handlerFunction = delegateTarget;
      delegateTarget = null;
    }
    if (delegateTarget) {
      jQRef(domElement).off(eventIdentifier, delegateTarget, handlerFunction);
    } else {
      jQRef(domElement).off(eventIdentifier, handlerFunction);
    }
  };

  // Custom class manipulation utility
  const modifyClass = (domElement, actionType, className) => {
    const jQElement = jQRef(domElement);
    switch (actionType) {
      case 'add':
        jQElement.addClass(className);
        break;
      case 'remove':
        jQElement.removeClass(className);
        break;
      case 'toggle':
        jQElement.toggleClass(className);
        break;
      default:
        // No operation
    }
  };

  // Custom element data management utility
  const manageElementData = (domElement, dataKey, dataValue) => {
    const jQElement = jQRef(domElement);
    if (dataValue === undefined) {
      return jQElement.data(dataKey);
    } else {
      jQElement.data(dataKey, dataValue);
      return jQElement;
    }
  };

  // Custom attribute management utility
  const manageElementAttribute = (domElement, attrName, attrValue) => {
    const jQElement = jQRef(domElement);
    if (attrValue === undefined) {
      return jQElement.attr(attrName);
    } else if (attrValue === null) {
      jQElement.removeAttr(attrName);
    } else {
      jQElement.attr(attrName, attrValue);
    }
    return jQElement;
  };

  // Custom element creation and property check utility
  const checkStyleProperty = (propList) => {
    const testDiv = document.createElement('div');
    return Object.keys(propList).find(prop => testDiv.style[prop] !== void(0));
  };

  // Custom event triggering utility
  const dispatchCustomEvent = (domElement, eventName, eventProps = {}) => {
    const customEvt = jQRef.Event(eventName, eventProps);
    jQRef(domElement).trigger(customEvt);
    return customEvt;
  };

  // --- bootstrap-transition.js Type IV Clone ---
  onDocumentReady(() => {
    jQRef.utilitySet = jQRef.utilitySet || {};

    jQRef.utilitySet.motionEnd = (() => {
      const transitionPropertyMap = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
      };

      const detectedProp = checkStyleProperty(transitionPropertyMap);
      const finalEventName = detectedProp ? transitionPropertyMap[detectedProp] : undefined;

      return finalEventName ? {
        finish: finalEventName
      } : null;
    })();
  });


  // --- bootstrap-alert.js Type IV Clone ---
  ((jQRef) => {
    const terminationActivator = '[data-dismiss="alert"]';

    class NotifierComponent {
      constructor(domNode) {
        attachEvent(domNode, 'click', terminationActivator, this.dismissAction.bind(this));
      }

      dismissAction(eventObj) {
        const currentInvoker = jQRef(this);
        let targetLocator = manageElementAttribute(currentInvoker, 'data-target');

        if (!targetLocator) {
          targetLocator = manageElementAttribute(currentInvoker, 'href');
          targetLocator = targetLocator ? targetLocator.replace(/.*(?=#[^\s]*$)/, '') : null;
        }

        let containerUnit = jQRef(targetLocator);

        if (eventObj) {
          eventObj.preventDefault();
        }

        containerUnit = containerUnit.length ? containerUnit : (
          currentInvoker.hasClass('notification-unit') ? currentInvoker : currentInvoker.parent()
        );

        const concealEvent = dispatchCustomEvent(containerUnit, 'conceal');

        if (concealEvent.isDefaultPrevented()) {
          return;
        }

        modifyClass(containerUnit, 'remove', 'active-state');

        const disposeComponent = () => {
          dispatchCustomEvent(containerUnit, 'concealed').remove();
        };

        const motionUtil = jQRef.utilitySet.motionEnd;
        if (motionUtil && containerUnit.hasClass('soft-transition')) {
          attachEvent(containerUnit, motionUtil.finish, disposeComponent);
        } else {
          disposeComponent();
        }
      }
    }

    const registerNotifierPlugin = function (optionParam) {
      return this.each(function () {
        let instanceRef = manageElementData(this, 'notifier');
        if (!instanceRef) {
          instanceRef = new NotifierComponent(this);
          manageElementData(this, 'notifier', instanceRef);
        }
        if (typeof optionParam === 'string') {
          instanceRef[optionParam].call(jQRef(this));
        }
      });
    };

    jQRef.fn.notificationSystem = registerNotifierPlugin;
    jQRef.fn.notificationSystem.BehaviorManager = NotifierComponent;

    onDocumentReady(() => {
      attachEvent(jQRef('body'), 'click.notification.api', terminationActivator, NotifierComponent.prototype.dismissAction);
    });

  })(jQRef);


  // --- bootstrap-button.js Type IV Clone ---
  ((jQRef) => {

    class ActionControl {
      constructor(domNode, settings) {
        this.associatedElement = jQRef(domNode);
        this.controlSettings = jQRef.extend({}, jQRef.fn.actionButton.defaultOptions, settings);
      }

      adjustVisualState(statusKey) {
        const inactiveClass = 'inactive-state'; // 'disabled'
        const currentElement = this.associatedElement;
        const elementData = manageElementData(currentElement);
        const contentModifier = currentElement.is('input') ? 'val' : 'html';

        const statusTextKey = statusKey + 'Text';
        elementData.cachedContent || manageElementData(currentElement, 'cachedContent', currentElement[contentModifier]()); // 'resetText'

        currentElement[contentModifier](elementData[statusTextKey] || this.controlSettings[statusTextKey]);

        setTimeout(() => {
          if (statusKey === 'progressMessage') { // 'loadingText'
            modifyClass(currentElement, 'add', inactiveClass);
            manageElementAttribute(currentElement, inactiveClass, inactiveClass);
          } else {
            modifyClass(currentElement, 'remove', inactiveClass);
            manageElementAttribute(currentElement, inactiveClass, null);
          }
        }, 0);
      }

      alternateStatus() {
        const parentGroup = this.associatedElement.closest('[data-toggle="buttons-radio"]');

        if (parentGroup && parentGroup.length) {
          parentGroup
            .find('.current-selection') // 'active'
            .removeClass('current-selection');
        }

        modifyClass(this.associatedElement, 'toggle', 'current-selection');
      }
    }

    const registerActionButtonPlugin = function (optParam) {
      return this.each(function () {
        let currentElement = jQRef(this);
        let instanceData = manageElementData(currentElement, 'actionButton');
        let configuration = typeof optParam === 'object' && optParam;
        if (!instanceData) {
          instanceData = new ActionControl(this, configuration);
          manageElementData(currentElement, 'actionButton', instanceData);
        }
        if (optParam === 'toggle') {
          instanceData.alternateStatus();
        } else if (optParam) {
          instanceData.adjustVisualState(optParam);
        }
      });
    };

    jQRef.fn.actionButton = registerActionButtonPlugin;
    jQRef.fn.actionButton.defaultOptions = {
      progressMessage: 'working...' // 'loadingText'
    };
    jQRef.fn.actionButton.ConstructorReference = ActionControl;

    onDocumentReady(() => {
      attachEvent(jQRef('body'), 'click.action.api', '[data-toggle^=button]', (evt) => {
        let clickedButton = jQRef(evt.target);
        if (!clickedButton.hasClass('btn')) {
          clickedButton = clickedButton.closest('.btn');
        }
        clickedButton.actionButton('toggle');
      });
    });

  })(jQRef);


  // --- bootstrap-carousel.js Type IV Clone ---
  ((jQRef) => {

    class SliderGallery {
      constructor(domElement, configOptions) {
        this.galleryContainer = jQRef(domElement);
        this.galleryConfig = configOptions;
        if (this.galleryConfig.slide) {
          this.transitionContent(this.galleryConfig.slide);
        }
        if (this.galleryConfig.pause === 'hover') {
          attachEvent(this.galleryContainer, 'mouseenter', jQRef.proxy(this.haltMotion, this));
          attachEvent(this.galleryContainer, 'mouseleave', jQRef.proxy(this.rotateItems, this));
        }
      }

      rotateItems(eventData) {
        if (!eventData) this.isPaused = false;
        if (this.galleryConfig.interval && !this.isPaused) {
          this.cycleTimer = setInterval(jQRef.proxy(this.advanceItem, this), this.galleryConfig.interval);
        }
        return this;
      }

      jumpToPosition(targetIndex) {
        const currentActive = this.galleryContainer.find('.gallery-piece.current-selection');
        const allPieces = currentActive.parent().children();
        const activeIndex = allPieces.index(currentActive);
        const selfReference = this;

        if (targetIndex > (allPieces.length - 1) || targetIndex < 0) return;

        if (this.isShifting) {
          return attachEvent(this.galleryContainer, 'contentShifted', () => selfReference.jumpToPosition(targetIndex));
        }

        if (activeIndex === targetIndex) {
          return this.haltMotion().rotateItems();
        }

        return this.transitionContent(targetIndex > activeIndex ? 'forward' : 'backward', jQRef(allPieces[targetIndex]));
      }

      haltMotion(eventData) {
        if (!eventData) this.isPaused = true;
        const motionUtil = jQRef.utilitySet.motionEnd;
        if (this.galleryContainer.find('.forward-item, .backward-item').length && motionUtil && motionUtil.finish) {
          dispatchCustomEvent(this.galleryContainer, motionUtil.finish);
          this.rotateItems();
        }
        clearInterval(this.cycleTimer);
        this.cycleTimer = null;
        return this;
      }

      advanceItem() {
        if (this.isShifting) return;
        return this.transitionContent('forward');
      }

      recedeItem() {
        if (this.isShifting) return;
        return this.transitionContent('backward');
      }

      transitionContent(movementType, nextPiece) {
        const currentActive = this.galleryContainer.find('.gallery-piece.current-selection');
        let nextTarget = nextPiece || currentActive[movementType === 'forward' ? 'next' : 'prev']();
        const cyclingActive = this.cycleTimer;
        const directionClass = movementType === 'forward' ? 'left-move' : 'right-move';
        const fallbackOption = movementType === 'forward' ? 'first' : 'last';
        const selfReference = this;
        const shiftEvent = dispatchCustomEvent(this.galleryContainer, 'contentShift', {
          relatedTarget: nextTarget[0]
        });

        this.isShifting = true;

        cyclingActive && this.haltMotion();

        nextTarget = nextTarget.length ? nextTarget : this.galleryContainer.find('.gallery-piece')[fallbackOption]();

        if (nextTarget.hasClass('current-selection')) return;

        const motionUtil = jQRef.utilitySet.motionEnd;
        if (motionUtil && this.galleryContainer.hasClass('slide')) {
          if (shiftEvent.isDefaultPrevented()) return;
          modifyClass(nextTarget, 'add', movementType === 'forward' ? 'forward-item' : 'backward-item');
          nextTarget[0].offsetWidth; // Force reflow
          modifyClass(currentActive, 'add', directionClass);
          modifyClass(nextTarget, 'add', directionClass);
          attachEvent(this.galleryContainer, motionUtil.finish, function () {
            modifyClass(nextTarget, 'remove', [movementType === 'forward' ? 'forward-item' : 'backward-item', directionClass].join(' '));
            modifyClass(nextTarget, 'add', 'current-selection');
            modifyClass(currentActive, 'remove', ['current-selection', directionClass].join(' '));
            selfReference.isShifting = false;
            setTimeout(() => dispatchCustomEvent(selfReference.galleryContainer, 'contentShifted'), 0);
          });
        } else {
          if (shiftEvent.isDefaultPrevented()) return;
          modifyClass(currentActive, 'remove', 'current-selection');
          modifyClass(nextTarget, 'add', 'current-selection');
          this.isShifting = false;
          dispatchCustomEvent(this.galleryContainer, 'contentShifted');
        }

        cyclingActive && this.rotateItems();

        return this;
      }
    }

    const registerSliderGalleryPlugin = function (optionParam) {
      return this.each(function () {
        let currentElement = jQRef(this);
        let instanceData = manageElementData(currentElement, 'sliderGallery');
        let configuration = jQRef.extend({}, jQRef.fn.sliderGallery.defaultOptions, typeof optionParam === 'object' && optionParam);
        let actionTrigger = typeof optionParam === 'string' ? optionParam : configuration.slide;
        if (!instanceData) {
          instanceData = new SliderGallery(this, configuration);
          manageElementData(currentElement, 'sliderGallery', instanceData);
        }
        if (typeof optionParam === 'number') {
          instanceData.jumpToPosition(optionParam);
        } else if (actionTrigger) {
          instanceData[actionTrigger === 'next' ? 'advanceItem' : (actionTrigger === 'prev' ? 'recedeItem' : actionTrigger)](); // Map 'next'/'prev' to new names
        } else if (configuration.interval) {
          instanceData.rotateItems();
        }
      });
    };

    jQRef.fn.sliderGallery = registerSliderGalleryPlugin;
    jQRef.fn.sliderGallery.defaultOptions = {
      interval: 5000,
      pause: 'hover'
    };
    jQRef.fn.sliderGallery.ComponentConstructor = SliderGallery;

    onDocumentReady(() => {
      attachEvent(jQRef('body'), 'click.gallery.api', '[data-slide]', (evt) => {
        let clickSource = jQRef(evt.target);
        let hrefLink;
        let targetElement = jQRef(manageElementAttribute(clickSource, 'data-target') || (hrefLink = manageElementAttribute(clickSource, 'href')) && hrefLink.replace(/.*(?=#[^\s]+$)/, ''));
        let configSettings = !manageElementData(targetElement, 'modal') && jQRef.extend({}, manageElementData(targetElement), manageElementData(clickSource));
        targetElement.sliderGallery(configSettings);
        evt.preventDefault();
      });
    });

  })(jQRef);


  // --- bootstrap-collapse.js Type IV Clone ---
  ((jQRef) => {

    class PanelExpander {
      constructor(domNode, configOptions) {
        this.targetElement = jQRef(domNode);
        this.expandOptions = jQRef.extend({}, jQRef.fn.panelExpander.defaultOptions, configOptions);

        if (this.expandOptions.parentContainer) {
          this.parentGroup = jQRef(this.expandOptions.parentContainer);
        }

        if (this.expandOptions.toggleActivation) {
          this.alternateDisplay();
        }
      }

      sizeProperty() {
        const hasWidthClass = this.targetElement.hasClass('horizontal'); // 'width'
        return hasWidthClass ? 'width' : 'height';
      }

      revealContent() {
        let currentDimension;
        let scrollSize;
        let activeSiblings;
        let hasCollapseData;

        if (this.isAnimating) return;

        currentDimension = this.sizeProperty();
        scrollSize = jQRef.camelCase(['scroll', currentDimension].join('-')); // 'scrollWidth' or 'scrollHeight'
        activeSiblings = this.parentGroup && this.parentGroup.find('> .group-panel > .active-state'); // '.accordion-group > .in'

        if (activeSiblings && activeSiblings.length) {
          hasCollapseData = manageElementData(activeSiblings, 'panelExpander');
          if (hasCollapseData && hasCollapseData.isAnimating) return;
          activeSiblings.panelExpander('concealContent'); // 'hide'
          if (!hasCollapseData) manageElementData(activeSiblings, 'panelExpander', null);
        }

        this.targetElement.css(currentDimension, 0);
        this.animateChange('add', dispatchCustomEvent(this.targetElement, 'displayEvent'), 'displayedEvent'); // 'show', 'shown'
        const motionUtil = jQRef.utilitySet.motionEnd;
        if (motionUtil) {
          this.targetElement.css(currentDimension, this.targetElement[0][scrollSize]);
        }
      }

      concealContent() { // 'hide'
        let currentDimension;
        if (this.isAnimating) return;
        currentDimension = this.sizeProperty();
        this.revertSize(this.targetElement.css(currentDimension)); // 'reset'
        this.animateChange('remove', dispatchCustomEvent(this.targetElement, 'concealEvent'), 'hiddenEvent'); // 'hide', 'hidden'
        this.targetElement.css(currentDimension, 0);
      }

      revertSize(currentVal) { // 'reset'
        const currentDimension = this.sizeProperty();
        this.targetElement
          .removeClass('soft-transition') // 'fade'
          .removeClass('collapse-state') // 'collapse'
          .css(currentDimension, currentVal)[0].offsetWidth;
        this.targetElement[0].offsetWidth; // Force reflow
        this.targetElement.addClass('collapse-state').addClass('soft-transition');
      }

      animateChange(action, eventTrigger, completeEvent) {
        const isShowing = action === 'add';
        const motionUtil = jQRef.utilitySet.motionEnd;
        const selfReference = this;

        if (eventTrigger.isDefaultPrevented()) return;

        this.isAnimating = true;

        modifyClass(this.targetElement, action, 'collapse-state'); // 'collapse'

        function transitionEndHandler() {
          if (isShowing) {
            selfReference.targetElement.css(selfReference.sizeProperty(), 'auto');
          }
          modifyClass(selfReference.targetElement, action, 'active-state'); // 'in'
          modifyClass(selfReference.targetElement, 'remove', 'collapsing-state'); // 'collapsing'
          selfReference.isAnimating = false;
          dispatchCustomEvent(selfReference.targetElement, completeEvent);
          detachEvent(selfReference.targetElement, motionUtil.finish, transitionEndHandler);
        }

        if (motionUtil) {
          modifyClass(this.targetElement, 'add', 'collapsing-state'); // 'collapsing'
          attachEvent(this.targetElement, motionUtil.finish, transitionEndHandler);
        } else {
          transitionEndHandler();
        }
      }

      alternateDisplay() { // 'toggle'
        this[this.targetElement.hasClass('active-state') ? 'concealContent' : 'revealContent']();
      }
    }

    const registerPanelExpanderPlugin = function (optionParam) {
      return this.each(function () {
        let currentElement = jQRef(this);
        let instanceData = manageElementData(currentElement, 'panelExpander');
        let configuration = jQRef.extend({}, jQRef.fn.panelExpander.defaultOptions, typeof optionParam === 'object' && optionParam);
        if (!instanceData) {
          instanceData = new PanelExpander(this, configuration);
          manageElementData(currentElement, 'panelExpander', instanceData);
        }
        if (typeof optionParam === 'string') {
          instanceData[optionParam]();
        }
      });
    };

    jQRef.fn.panelExpander = registerPanelExpanderPlugin;
    jQRef.fn.panelExpander.defaultOptions = {
      toggleActivation: true
    };
    jQRef.fn.panelExpander.ComponentConstructor = PanelExpander;

    onDocumentReady(() => {
      attachEvent(jQRef('body'), 'click.panel.api', '[data-toggle=collapse]', (evt) => {
        let clickSource = jQRef(evt.target);
        if (clickSource.attr('data-toggle') !== 'collapse') {
          clickSource = clickSource.closest('[data-toggle=collapse]');
        }
        let hrefLink;
        let targetElement = jQRef(manageElementAttribute(clickSource, 'data-target') || (hrefLink = manageElementAttribute(clickSource, 'href')) && hrefLink.replace(/.*(?=#[^\s]+$)/, ''));
        let configSettings = manageElementData(targetElement, 'panelExpander') ? 'alternateDisplay' : jQRef.extend({}, manageElementData(targetElement), manageElementData(clickSource));
        targetElement.panelExpander(configSettings);
        evt.preventDefault();
      });
    });

  })(jQRef);

})(window.jQuery);