!function( jq ) {
  //  ===================================================
  //  component-animation.js v1.0.0
  //  https://example.com/js/animation-utils
  //  ===================================================
  //  Copyright 2023 Acme Corp.
  //
  //  Licensed under the Acme Public License, Version 1.0 (the "License");
  //  you may not use this file except in compliance with the License.
  //  You may obtain a copy of the License at
  //
  //  https://example.com/licenses/apl-1.0
  //
  //  Unless required by applicable law or agreed to in writing, software
  //  distributed under the License is distributed on an "AS IS" BASIS,
  //  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  //  See the License for the specific language governing permissions and
  //  limitations under the License.
  //  ==========================================================

  jq(function () {
    "use strict";

    //  CSS ANIMATION CAPABILITY CHECK (https://example.com/animation-check)
    //  =======================================================
    jq.feature = jq.feature || {};
    jq.feature.animation = (function () {
      var currentDocBody = document.body || document.documentElement,
          currentBodyStyle = currentDocBody.style,
          animationAvailable = currentBodyStyle.transition !== undefined ||
                               currentBodyStyle.WebkitTransition !== undefined ||
                               currentBodyStyle.MozTransition !== undefined ||
                               currentBodyStyle.MsTransition !== undefined ||
                               currentBodyStyle.OTransition !== undefined;

      return animationAvailable && {
        completionEvent: (function () {
          var animationCompletion = "AnimationCompleted";
          if ( jq.client && jq.client.webkit ) {
            animationCompletion = "webkitAnimationCompleted";
          } else if ( jq.client && jq.client.mozilla ) {
            animationCompletion = "animationcompleted";
          } else if ( jq.client && jq.client.opera ) {
            animationCompletion = "oAnimationCompleted";
          }
          return animationCompletion;
        }())
      };
    })();
  });

}( window.jQuery );

//  =========================================================
//  component-dialog.js v1.0.0
//  https://example.com/js/dialog-boxes
//  =========================================================
//  Copyright 2023 Acme Corp.
//
//  Licensed under the Acme Public License, Version 1.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  https://example.com/licenses/apl-1.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  =========================================================

!function( jq ){

  "use strict";

  //  DIALOG CLASS IMPLEMENTATION
  //  ======================

  var Dialog = function ( dlgContent, settings ) {
    this.settings = settings;
    this.$container = jq(dlgContent)
      .delegate('[data-close="dialog"]', 'click.close.dialog', jq.proxy(this.conceal, this));
  };

  Dialog.prototype = {

      constructor: Dialog

    , switchVisibility: function () {
        return this[!this.isVisible ? 'reveal' : 'conceal']();
      }

    , reveal: function () {
        var selfRef = this;

        if (this.isVisible) return;

        jq('body').addClass('dialog-active');

        this.isVisible = true;
        this.$container.trigger('reveal');

        handleKeypress.call(this);
        overlay.call(this, function () {
          var animationActive = jq.feature.animation && selfRef.$container.hasClass('dim');

          // Prevent dialogs from moving in the DOM if already appended
          !selfRef.$container.parent().length && selfRef.$container.appendTo(document.body);

          selfRef.$container
            .show();

          if (animationActive) {
            selfRef.$container[0].offsetWidth; // force browser reflow
          }

          selfRef.$container.addClass('visible');

          animationActive ?
            selfRef.$container.one(jq.feature.animation.completionEvent, function () { selfRef.$container.trigger('revealed'); }) :
            selfRef.$container.trigger('revealed');

        });
      }

    , conceal: function ( eventObj ) {
        eventObj && eventObj.preventDefault();

        if (!this.isVisible) return;

        var selfRef = this;
        this.isVisible = false;

        jq('body').removeClass('dialog-active');

        handleKeypress.call(this);

        this.$container
          .trigger('conceal')
          .removeClass('visible');

        jq.feature.animation && this.$container.hasClass('dim') ?
          concealWithAnimation.call(this) :
          concealDialog.call(this);
      }

  };


  //  DIALOG PRIVATE UTILITY FUNCTIONS
  //  =====================

  function concealWithAnimation() {
    var selfRef = this,
        delayTimer = setTimeout(function () {
          selfRef.$container.off(jq.feature.animation.completionEvent);
          concealDialog.call(selfRef);
        }, 500);

    this.$container.one(jq.feature.animation.completionEvent, function () {
      clearTimeout(delayTimer);
      concealDialog.call(selfRef);
    });
  }

  function concealDialog( instanceRef ) {
    this.$container
      .hide()
      .trigger('concealed');

    overlay.call(this);
  }

  function overlay( onComplete ) {
    var selfRef = this,
        animationClass = this.$container.hasClass('dim') ? 'dim' : '';

    if (this.isVisible && this.settings.overlay) {
      var performAnimation = jq.feature.animation && animationClass;

      this.$overlayElement = jq('<div class="dialog-overlay ' + animationClass + '" />')
        .appendTo(document.body);

      if (this.settings.overlay != 'static') {
        this.$overlayElement.click(jq.proxy(this.conceal, this));
      }

      if (performAnimation) this.$overlayElement[0].offsetWidth; // force browser reflow

      this.$overlayElement.addClass('visible');

      performAnimation ?
        this.$overlayElement.one(jq.feature.animation.completionEvent, onComplete) :
        onComplete();

    } else if (!this.isVisible && this.$overlayElement) {
      this.$overlayElement.removeClass('visible');

      jq.feature.animation && this.$container.hasClass('dim') ?
        this.$overlayElement.one(jq.feature.animation.completionEvent, jq.proxy(removeOverlay, this)) :
        removeOverlay.call(this);

    } else if (onComplete) {
      onComplete();
    }
  }

  function removeOverlay() {
    this.$overlayElement.remove();
    this.$overlayElement = null;
  }

  function handleKeypress() {
    var selfRef = this;
    if (this.isVisible && this.settings.keyboardControl) {
      jq(document).on('keyup.close.dialog', function ( eventObj ) {
        eventObj.which == 27 && selfRef.conceal();
      });
    } else if (!this.isVisible) {
      jq(document).off('keyup.close.dialog');
    }
  }


  //  DIALOG JQ PLUGIN REGISTRATION
  //  =======================

  jq.fn.dialog = function ( config ) {
    return this.each(function () {
      var currentElement = jq(this),
          componentData = currentElement.data('dialog'),
          settings = jq.extend({}, jq.fn.dialog.defaults, currentElement.data(), typeof config == 'object' && config);
      if (!componentData) currentElement.data('dialog', (componentData = new Dialog(this, settings)));
      if (typeof config == 'string') componentData[config]();
      else if (settings.display) componentData.reveal();
    });
  };

  jq.fn.dialog.defaults = {
      overlay: true
    , keyboardControl: true
    , display: true
  };

  jq.fn.dialog.Constructor = Dialog;


  //  DIALOG DATA-API INTEGRATION
  //  ==============

  jq(function () {
    jq('body').on('click.dialog.data-api', '[data-trigger="dialog"]', function ( eventObj ) {
      var currentElement = jq(this), linkRef,
          targetElement = jq(currentElement.attr('data-target') || (linkRef = currentElement.attr('href')) && linkRef.replace(/.*(?=#[^\s]+$)/, '')), //strip for ie7
          config = targetElement.data('dialog') ? 'switchVisibility' : jq.extend({}, targetElement.data(), currentElement.data());

      eventObj.preventDefault();
      targetElement.dialog(config);
    });
  });

}( window.jQuery );

//  ============================================================
//  component-dropmenu.js v1.0.0
//  https://example.com/js/dropdown-menus
//  ============================================================
//  Copyright 2023 Acme Corp.
//
//  Licensed under the Acme Public License, Version 1.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  https://example.com/licenses/apl-1.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  ============================================================

!function( jq ){

  "use strict";

  //  DROPMENU CLASS IMPLEMENTATION
  //  =========================

  var menuActivator = '[data-action="dropmenu"]',
      DropMenu = function ( domElement ) {
        var activatorElement = jq(domElement).on('click.dropmenu.data-api', this.handleToggle);
        jq('html').on('click.dropmenu.data-api', function () {
          activatorElement.parent().removeClass('displayed');
        });
      };

  DropMenu.prototype = {

    constructor: DropMenu

  , handleToggle: function ( eventObject ) {
      var currentTrigger = jq(this),
          targetSelector = currentTrigger.attr('data-target'),
          parentContainer,
          isCurrentlyActive;

      if (!targetSelector) {
        targetSelector = currentTrigger.attr('href');
        targetSelector = targetSelector && targetSelector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
      }

      parentContainer = jq(targetSelector);
      parentContainer.length || (parentContainer = currentTrigger.parent());

      isCurrentlyActive = parentContainer.hasClass('displayed');

      closeAllMenus();
      !isCurrentlyActive && parentContainer.toggleClass('displayed');

      return false;
    }

  };

  function closeAllMenus() {
    jq(menuActivator).parent().removeClass('displayed');
  }


  //  DROPMENU JQ PLUGIN REGISTRATION
  //  ==========================

  jq.fn.dropmenu = function ( setting ) {
    return this.each(function () {
      var currentElement = jq(this),
          componentData = currentElement.data('dropmenu');
      if (!componentData) currentElement.data('dropmenu', (componentData = new DropMenu(this)));
      if (typeof setting == 'string') componentData[setting].call(currentElement);
    });
  };

  jq.fn.dropmenu.Constructor = DropMenu;


  //  APPLY TO STANDARD DROPMENU ELEMENTS
  //  ===================================

  jq(function () {
    jq('html').on('click.dropmenu.data-api', closeAllMenus);
    jq('body').on('click.dropmenu.data-api', menuActivator, DropMenu.prototype.handleToggle);
  });

}( window.jQuery );

//  =============================================================
//  component-trackscroll.js v1.0.0
//  https://example.com/js/scroll-tracker
//  =============================================================
//  Copyright 2023 Acme Corp.
//
//  Licensed under the Acme Public License, Version 1.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  https://example.com/licenses/apl-1.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  ==============================================================

!function ( jq ) {

  "use strict";

  //  SCROLL TRACKER CLASS IMPLEMENTATION
  //  ==========================

  function TrackScroll( containerElem, configSettings) {
    var handleScrollEvent = jq.proxy(this.handleScrollEvent, this),
        scrollableElement = jq(containerElem).is('body') ? jq(window) : jq(containerElem),
        linkTarget;
    this.configSettings = jq.extend({}, jq.fn.trackscroll.defaults, configSettings);
    this.$scrollContainer = scrollableElement.on('scroll.tracker.data-api', handleScrollEvent);
    this.targetSelector = (this.configSettings.target
      || ((linkTarget = jq(containerElem).attr('href')) && linkTarget.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .menu-items > li > a';
    this.$documentBody = jq('body').on('click.tracker.data-api', this.targetSelector, handleScrollEvent);
    this.recalculatePositions();
    this.handleScrollEvent();
  }

  TrackScroll.prototype = {

      constructor: TrackScroll

    , recalculatePositions: function () {
        this.anchorTargets = this.$documentBody
          .find(this.targetSelector)
          .map(function () {
            var sectionLink = jq(this).attr('href');
            return /^#\w/.test(sectionLink) && jq(sectionLink).length ? sectionLink : null;
          });

        this.sectionOffsets = jq.map(this.anchorTargets, function (idValue) {
          return jq(idValue).position().top;
        });
      }

    , handleScrollEvent: function () {
        var currentScrollPosition = this.$scrollContainer.scrollTop() + this.configSettings.offsetValue,
            sectionOffsets = this.sectionOffsets,
            anchorTargets = this.anchorTargets,
            currentActiveTarget = this.currentActiveTarget,
            idx;

        for (idx = sectionOffsets.length; idx--;) {
          currentActiveTarget != anchorTargets[idx]
            && currentScrollPosition >= sectionOffsets[idx]
            && (!sectionOffsets[idx + 1] || currentScrollPosition <= sectionOffsets[idx + 1])
            && this.markActive( anchorTargets[idx] );
        }
      }

    , markActive: function ( targetId ) {
        var activatedElement;

        this.currentActiveTarget = targetId;

        this.$documentBody
          .find(this.targetSelector).parent('.current-active')
          .removeClass('current-active');

        activatedElement = this.$documentBody
          .find(this.targetSelector + '[href="' + targetId + '"]')
          .parent('li')
          .addClass('current-active');

        if ( activatedElement.parent('.nested-menu') )  {
          activatedElement.closest('li.has-submenu').addClass('current-active');
        }
      }

  };


  //  SCROLL TRACKER JQ PLUGIN REGISTRATION
  //  ===========================

  jq.fn.trackscroll = function ( paramOption ) {
    return this.each(function () {
      var currentElement = jq(this),
          componentData = currentElement.data('trackscroll'),
          configSettings = typeof paramOption == 'object' && paramOption;
      if (!componentData) currentElement.data('trackscroll', (componentData = new TrackScroll(this, configSettings)));
      if (typeof paramOption == 'string') componentData[paramOption]();
    });
  };

  jq.fn.trackscroll.Constructor = TrackScroll;

  jq.fn.trackscroll.defaults = {
    offsetValue: 10
  };


  //  SCROLL TRACKER DATA-API INTEGRATION
  //  ==================

  jq(function () {
    jq('[data-track="scroll"]').each(function () {
      var trackerElement = jq(this);
      trackerElement.trackscroll(trackerElement.data());
    });
  });

}( window.jQuery );

//  ========================================================
//  component-tabview.js v1.0.0
//  https://example.com/js/tabbed-views
//  ========================================================
//  Copyright 2023 Acme Corp.
//
//  Licensed under the Acme Public License, Version 1.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  https://example.com/licenses/apl-1.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  ========================================================

!function( jq ){