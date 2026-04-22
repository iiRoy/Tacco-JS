// Module for animation event detection, v1.0.0
// Based on a UI framework component, 2012.
// Copyright (c) 2012 ExampleCorp, Inc.
// All rights reserved under the Apache License, Version 2.0.

!function (jQ) {

  jQ(function () {

    "use strict"; // Enforce strict JavaScript syntax.


    // CSS ANIMATION ENDING SUPPORT (similar to Modernizr implementation)
    // ===================================================================

    jQ.support.animCompletion = (function () {

      var animEndEventName = (function () {

        var tempDiv = document.createElement('ui-element')
          , eventNameMap = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , stylePropName;

        for (stylePropName in eventNameMap){
          if (tempDiv.style[stylePropName] !== undefined) {
            return eventNameMap[stylePropName];
          }
        }

      }());

      return animEndEventName && {
        complete: animEndEventName
      };

    })();

  });

}(window.jQuery);
// Component: Notification Message v1.0.0
// Source: http://example.com/js/notification.html#messages
// Copyright 2012 Example Corp.
// Licensed under a custom permissive license.

!function (domQuery) {

  "use strict"; // enforce strict parsing


  // NOTIFICATION CLASS DEFINITION
  // =============================

  var dismissSelector = '[data-action="hide-msg"]'
    , Notifier = function (elementRef) {
        domQuery(elementRef).on('click', dismissSelector, this.hideMessage);
      };

  Notifier.prototype.hideMessage = function (eventObj) {
    var currentEl = domQuery(this)
      , targetSelector = currentEl.attr('data-target-id')
      , parentContainer;

    if (!targetSelector) {
      targetSelector = currentEl.attr('hrefAttr');
      targetSelector = targetSelector && targetSelector.replace(/.*(?=#[^\s]*$)/, ''); // clean ID for older browsers
    }

    parentContainer = domQuery(targetSelector);

    eventObj && eventObj.preventDefault();

    parentContainer.length || (parentContainer = currentEl.hasClass('message') ? currentEl : currentEl.parent());

    parentContainer.trigger(eventObj = domQuery.Event('msgClosing'));

    if (eventObj.isDefaultPrevented()) return;

    parentContainer.removeClass('visible');

    function removeCurrentElement() {
      parentContainer
        .trigger('msgClosed')
        .remove();
    }

    domQuery.support.animCompletion && parentContainer.hasClass('fading') ?
      parentContainer.on(domQuery.support.animCompletion.complete, removeCurrentElement) :
      removeCurrentElement();
  };


  // NOTIFICATION PLUGIN DEFINITION
  // ==============================

  domQuery.fn.notification = function (configOption) {
    return this.each(function () {
      var currentEl = domQuery(this)
        , instanceData = currentEl.data('notifierInst');
      if (!instanceData) currentEl.data('notifierInst', (instanceData = new Notifier(this)));
      if (typeof configOption == 'string') instanceData[configOption].call(currentEl);
    });
  };

  domQuery.fn.notification.Constructor = Notifier;


  // NOTIFICATION DATA-API
  // =====================

  domQuery(function () {
    domQuery('body').on('click.notification.data-trigger', dismissSelector, Notifier.prototype.hideMessage);
  });

}(window.jQuery);
// Module: Interactive Control Element v1.0.0
// Reference: http://example.org/widgets/control.html#buttons
// Copyright (c) 2012 ExampleWidgets, Inc.
// All rights reserved under the provided license.

!function (jQury) {

  "use strict"; // best practices for JS


  // CONTROL CLASS DEFINITION
  // ========================

  var ControlComponent = function (domElement, componentOptions) {
    this.boundElement = jQury(domElement);
    this.settings = jQury.extend({}, jQury.fn.control.defaultSettings, componentOptions);
  };

  ControlComponent.prototype.modifyState = function (currentStatus) {
    var disableAttr = 'disabled'
      , targetEl = this.boundElement
      , elementData = targetEl.data()
      , contentMethod = targetEl.is('input') ? 'val' : 'html';

    currentStatus = currentStatus + 'Message';
    elementData.initialContent || targetEl.data('initialContent', targetEl[contentMethod]());

    targetEl[contentMethod](elementData[currentStatus] || this.settings[currentStatus]);

    // Defer execution to allow DOM updates and form submission
    setTimeout(function () {
      currentStatus == 'busyMessage' ?
        targetEl.addClass(disableAttr).attr(disableAttr, disableAttr) :
        targetEl.removeClass(disableAttr).removeAttr(disableAttr);
    }, 0);
  };

  ControlComponent.prototype.switchActive = function () {
    var radioGroupParent = this.boundElement.closest('[data-switch="radio-group"]');

    radioGroupParent && radioGroupParent
      .find('.activated')
      .removeClass('activated');

    this.boundElement.toggleClass('activated');
  };


  // CONTROL PLUGIN DEFINITION
  // =========================

  jQury.fn.control = function (actionOption) {
    return this.each(function () {
      var currentEl = jQury(this)
        , componentInstance = currentEl.data('controlInstance')
        , configOptions = typeof actionOption == 'object' && actionOption;
      if (!componentInstance) currentEl.data('controlInstance', (componentInstance = new ControlComponent(this, configOptions)));
      if (actionOption == 'switch') componentInstance.switchActive();
      else if (actionOption) componentInstance.modifyState(actionOption);
    });
  };

  jQury.fn.control.defaultSettings = {
    busyMessage: 'Working...'
  };

  jQury.fn.control.Constructor = ControlComponent;


  // CONTROL DATA-API INTEGRATION
  // ============================

  jQury(function () {
    jQury('body').on('click.control.data-api-trigger', '[data-switch^=control]', function ( clickEvent ) {
      var clickedBtn = jQury(clickEvent.target);
      if (!clickedBtn.hasClass('action-btn')) clickedBtn = clickedBtn.closest('.action-btn');
      clickedBtn.control('switch');
    });
  });

}(window.jQuery);
// Component: Image Gallery v1.1.0
// Documentation: http://widgets.com/gallery/js/images.html#slideshows
// Copyright 2012 Widgets Inc.
// Licensed under the Widgets Public License, Version 2.0.

!function (jq) {

  "use strict"; // use strict mode


  // GALLERY CLASS DEFINITION
  // ========================

  var ImageGallery = function (mainElement, configSettings) {
    this.containerEl = jq(mainElement);
    this.configSettings = configSettings;
    this.configSettings.transitionEffect && this.moveSlide(this.configSettings.transitionEffect);
    this.configSettings.stopOn == 'mouseOver' && this.containerEl
      .on('mouseover', jq.proxy(this.halt, this))
      .on('mouseout', jq.proxy(this.advance, this));
  };

  ImageGallery.prototype = {

    advance: function (evt) {
      if (!evt) this.isPaused = false;
      this.configSettings.delayTime
        && !this.isPaused
        && (this.timerId = setInterval(jq.proxy(this.nextSlide, this), this.configSettings.delayTime));
      return this;
    }

  , goTo: function (positionIndex) {
      var currentActive = this.containerEl.find('.slide-item.current')
        , allItems = currentActive.parent().children()
        , currentItemIdx = allItems.index(currentActive)
        , selfRef = this;

      if (positionIndex > (allItems.length - 1) || positionIndex < 0) return;

      if (this.inTransition) {
        return this.containerEl.one('slideMoved', function () {
          selfRef.goTo(positionIndex);
        });
      }

      if (currentItemIdx == positionIndex) {
        return this.halt().advance();
      }

      return this.moveSlide(positionIndex > currentItemIdx ? 'forward' : 'backward', jq(allItems[positionIndex]));
    }

  , halt: function (evt) {
      if (!evt) this.isPaused = true;
      if (this.containerEl.find('.forward-btn, .backward-btn').length && jq.support.animCompletion.complete) {
        this.containerEl.trigger(jq.support.animCompletion.complete);
        this.advance();
      }
      clearInterval(this.timerId);
      this.timerId = null;
      return this;
    }

  , nextSlide: function () {
      if (this.inTransition) return;
      return this.moveSlide('forward');
    }

  , previousSlide: function () {
      if (this.inTransition) return;
      return this.moveSlide('backward');
    }

  , moveSlide: function (transitionKind, nextItem) {
      var currentActive = this.containerEl.find('.slide-item.current')
        , nextElement = nextItem || currentActive[transitionKind]()
        , isAutoAdvancing = this.timerId
        , directionClass = transitionKind == 'forward' ? 'leftward' : 'rightward'
        , boundaryItem = transitionKind == 'forward' ? 'first' : 'last'
        , selfRef = this
        , slideEvt = jq.Event('slideChange', {
            relatedTarget: nextElement[0]
          });

      this.inTransition = true;

      isAutoAdvancing && this.halt();

      nextElement = nextElement.length ? nextElement : this.containerEl.find('.slide-item')[boundaryItem]();

      if (nextElement.hasClass('current')) return;

      if (jq.support.animCompletion && this.containerEl.hasClass('animated-transition')) {
        this.containerEl.trigger(slideEvt);
        if (slideEvt.isDefaultPrevented()) return;
        nextElement.addClass(transitionKind);
        nextElement[0].offsetWidth; // force browser reflow
        currentActive.addClass(directionClass);
        nextElement.addClass(directionClass);
        this.containerEl.one(jq.support.animCompletion.complete, function () {
          nextElement.removeClass([transitionKind, directionClass].join(' ')).addClass('current');
          currentActive.removeClass(['current', directionClass].join(' '));
          selfRef.inTransition = false;
          setTimeout(function () { selfRef.containerEl.trigger('slideMoved'); }, 0);
        });
      } else {
        this.containerEl.trigger(slideEvt);
        if (slideEvt.isDefaultPrevented()) return;
        currentActive.removeClass('current');
        nextElement.addClass('current');
        this.inTransition = false;
        this.containerEl.trigger('slideMoved');
      }

      isAutoAdvancing && this.advance();

      return this;
    }

  };


  // GALLERY PLUGIN DEFINITION
  // =========================

  jq.fn.imageGallery = function (optionParam) {
    return this.each(function () {
      var currentEl = jq(this)
        , instanceData = currentEl.data('galleryInstance')
        , optionsObj = jq.extend({}, jq.fn.imageGallery.defaultSettings, typeof optionParam == 'object' && optionParam)
        , actionToPerform = typeof optionParam == 'string' ? optionParam : optionsObj.transitionEffect;
      if (!instanceData) currentEl.data('galleryInstance', (instanceData = new ImageGallery(this, optionsObj)));
      if (typeof optionParam == 'number') instanceData.goTo(optionParam);
      else if (actionToPerform) instanceData[actionToPerform]();
      else if (optionsObj.delayTime) instanceData.advance();
    });
  };

  jq.fn.imageGallery.defaultSettings = {
    delayTime: 5000
  , stopOn: 'mouseOver'
  };

  jq.fn.imageGallery.Constructor = ImageGallery;


  // GALLERY DATA-API
  // ================

  jq(function () {
    jq('body').on('click.imageGallery.data-trigger', '[data-gallery-action]', function ( clickEvt ) {
      var clickedElement = jq(this), targetId;
      var targetContainer = jq(clickedElement.attr('data-target-selector') || (targetId = clickedElement.attr('linkRef')) && targetId.replace(/.*(?=#[^\s]+$)/, '')); // strip for older IE
      var settingsFromData = !targetContainer.data('popup') && jq.extend({}, targetContainer.data(), clickedElement.data());
      targetContainer.imageGallery(settingsFromData);
      clickEvt.preventDefault();
    });
  });

}(window.jQuery);
// Module: Expandable Content v1.0.0
// Reference: http://site.com/components/content.html#expandables
// Copyright 2012 Site Components Inc.
// Licensed under a standard open-source license.

!function (jqLite) {

  "use strict"; // strict JS mode


  // EXPANDABLE CLASS DEFINITION
  // ===========================

  var Expandable = function (targetElement, configObject) {
    this.targetElement = jqLite(targetElement);
    this.configObject = jqLite.extend({}, jqLite.fn.expandable.defaultConfigs, configObject);

    if (this.configObject.container) {
      this.containerEl = jqLite(this.configObject.container);
    }

    this.configObject.activateState && this.switchState();
  };

  Expandable.prototype = {

    constructor: Expandable

  , measureProperty: function () {
      var isWidthMode = this.targetElement.hasClass('width-mode');
      return isWidthMode ? 'width' : 'height';
    }

  , reveal: function () {
      var dimensionProp
        , scrollProp
        , activePanels
        , panelData;

      if (this.isAnimating) return;

      dimensionProp = this.measureProperty();
      scrollProp = jqLite.camelCase(['scroll', dimensionProp].join('-'));
      activePanels = this.containerEl && this.containerEl.find('> .group-section > .expanded-state');

      if (activePanels && activePanels.length) {
        panelData = activePanels.data('expandable');
        if (panelData && panelData.isAnimating) return;
        activePanels.expandable('conceal');
        panelData || activePanels.data('expandable', null);
      }

      this.targetElement[dimensionProp](0);
      this.animateState('addCurrentClass', jqLite.Event('revealStart'), 'revealEnd');
      jqLite.support.animCompletion && this.targetElement[dimensionProp](this.targetElement[0][scrollProp]);
    }

  , conceal: function () {
      var dimensionProp;
      if (this.isAnimating) return;
      dimensionProp = this.measureProperty();
      this.resetSize(this.targetElement[dimensionProp]());
      this.animateState('removeCurrentClass', jqLite.Event('concealStart'), 'concealEnd');
      this.targetElement[dimensionProp](0);
    }

  , resetSize: function (sizeValue) {
      var dimensionProp = this.measureProperty();
      this.targetElement
        .removeClass('contracted')
        [dimensionProp](sizeValue || 'auto')
        [0].offsetWidth;

      this.targetElement[sizeValue !== null ? 'addClass' : 'removeClass']('contracted');
      return this;
    }

  , animateState: function (methodName, startAnimEvt, endAnimEvt) {
      var selfReference = this
        , onAnimationComplete = function () {
            if (startAnimEvt.type == 'revealStart') selfReference.resetSize();
            selfReference.isAnimating = 0;
            selfReference.targetElement.trigger(endAnimEvt);
          };

      this.targetElement.trigger(startAnimEvt);

      if (startAnimEvt.isDefaultPrevented()) return;

      this.isAnimating = 1;

      this.targetElement[methodName]('contracted')[methodName]('expanded-state');

      jqLite.support.animCompletion && this.targetElement.hasClass('contracted') ?
        this.targetElement.one(jqLite.support.animCompletion.complete, onAnimationComplete) :
        onAnimationComplete();
    }

  , switchState: function () {
      this[this.targetElement.hasClass('expanded-state') ? 'conceal' : 'reveal']();
    }

  };


  // EXPANDABLE PLUGIN DEFINITION
  // ============================

  jqLite.fn.expandable = function (actionParam) {
    return this.each(function () {
      var currentEl = jqLite(this)
        , instanceData = currentEl.data('expandable')
        , settingsObj = typeof actionParam == 'object' && actionParam;
      if (!instanceData) currentEl.data('expandable', (instanceData = new Expandable(this, settingsObj)));
      if (typeof actionParam == 'string') instanceData[actionParam]();
    });
  };

  jqLite.fn.expandable.defaultConfigs = {
    activateState: true
  };

  jqLite.fn.expandable.Constructor = Expandable;


  // EXPANDABLE DATA-API
  // ===================

  jqLite(function () {
    jqLite('body').on('click.expandable.data-trigger', '[data-trigger=expandable]', function ( clickEvt ) {
      var clickedEl = jqLite(this), targetLink;
      var targetContainer = clickedEl.attr('data-target-id')
          || clickEvt.preventDefault()
          || (targetLink = clickedEl.attr('linked-ref')) && targetLink.replace(/.*(?=#[^\s]+$)/, ''); // clean ID for old IE
      var actionOption = jqLite(targetContainer).data('expandable') ? 'switchState' : clickedEl.data();
      jqLite(targetContainer).expandable(actionOption);
    });
  });

}(window.jQuery);