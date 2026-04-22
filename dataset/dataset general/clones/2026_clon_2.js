/*
 *  Attention - JQ Notification Plugin v2.0.3
 *  Contributors: https://github.com/needim/noty/graphs/contributors
 *
 *  Showcase and documentation - http://needim.github.com/noty/
 *
 *  Licensed under the MIT terms:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

if (typeof Object.create !== 'function') {
  Object.create = function(originalObject) {
    function ConstructorProxy() {}
    ConstructorProxy.prototype = originalObject;
    return new ConstructorProxy();
  };
}

(function(jq) {

  const AlertDisplayItem = {

    initializeDisplay: function(inputSettings) {

      // Combine provided settings with the system's default configurations
      this.settings = jq.extend({}, jq.alertSystem.standardOptions, inputSettings);

      this.settings.arrangement = (this.settings.customTarget) ? jq.alertSystem.arrangements['embedded'] : jq.alertSystem.arrangements[this.settings.arrangement];
      this.settings.styleVariant = jq.alertSystem.styles[this.settings.styleVariant];

      delete inputSettings.arrangement;
      delete inputSettings.styleVariant;

      this.settings = jq.extend({}, this.settings, this.settings.arrangement.options);
      this.settings.uniqueId = 'alert_' + (new Date().getTime() * Math.floor(Math.random() * 1000000));

      this.settings = jq.extend({}, this.settings, inputSettings);

      // Construct the initial DOM structure for the alert message
      this.constructElement();

      // Return the instance to enable method chaining
      return this;
    }, // End of initializeDisplay

    constructElement: function() {

      // Create the primary container for the alert display
      const elementContainer = jq('<section class="alert_panel"></section>').attr('id', this.settings.uniqueId);
      elementContainer.append(this.settings.markupStructure).find('.alert_content').html(this.settings.content);

      this.elementContainer = (this.settings.arrangement.parent.object !== null) ? jq(this.settings.arrangement.parent.object).css(this.settings.arrangement.parent.css).append(elementContainer) : elementContainer;

      // Add interactive buttons if specified in settings
      if (this.settings.actionButtons) {

        // If action buttons are present, override default close behavior
        this.settings.dismissTriggers = [];
        this.settings.autoDismissDuration = false;

        const actionButtonsWrapper = jq('<aside/>').addClass('alert_actions');

        (this.settings.arrangement.parent.object !== null) ? this.elementContainer.find('.alert_panel').append(actionButtonsWrapper) : this.elementContainer.append(actionButtonsWrapper);

        const currentInstance = this;

        jq.each(this.settings.actionButtons, function(idx, actionBtn) {
          const individualButton = jq('<button/>').addClass((actionBtn.addClass) ? actionBtn.addClass : 'neutralColor').html(actionBtn.text)
            .appendTo(currentInstance.elementContainer.find('.alert_actions'))
            .bind('tap', function() {
              if (jq.isFunction(actionBtn.onTapCallback)) {
                actionBtn.onTapCallback.call(individualButton, currentInstance);
              }
            });
        });
      }

      // Store references for quicker access
      this.displayMessage = this.elementContainer.find('.alert_body');
      this.exitButton = this.elementContainer.find('.alert_dismiss');
      this.actionButtons = this.elementContainer.find('.alert_actions');

      jq.alertSystem.registry[this.settings.uniqueId] = this; // Save this alert instance for API access

    }, // End of constructElement

    present: function() {

      const currentInstance = this;

      jq(currentInstance.settings.arrangement.container.selector).append(currentInstance.elementContainer);

      currentInstance.settings.styleVariant.style.apply(currentInstance);

      (jq.type(currentInstance.settings.arrangement.css) === 'function') ? this.settings.arrangement.css.apply(currentInstance.elementContainer) : currentInstance.elementContainer.css(this.settings.arrangement.css || {});

      currentInstance.elementContainer.addClass(currentInstance.settings.arrangement.addClass);

      currentInstance.settings.arrangement.container.style.apply(jq(currentInstance.settings.arrangement.container.selector));

      currentInstance.settings.styleVariant.callback.onDisplayStart.apply(this);

      if (jq.inArray('tap', currentInstance.settings.dismissTriggers) > -1)
        currentInstance.elementContainer.css('cursor', 'pointer').one('tap', function() {
          currentInstance.dismiss();
        });

      if (jq.inArray('mouseover', currentInstance.settings.dismissTriggers) > -1)
        currentInstance.elementContainer.one('mouseover', function() {
          currentInstance.dismiss();
        });

      if (jq.inArray('actionBtn', currentInstance.settings.dismissTriggers) > -1)
        currentInstance.exitButton.one('tap', function() {
          currentInstance.dismiss();
        });

      if (jq.inArray('actionBtn', currentInstance.settings.dismissTriggers) == -1)
        currentInstance.exitButton.remove();

      if (currentInstance.settings.eventHandlers.onDisplayStart)
        currentInstance.settings.eventHandlers.onDisplayStart.apply(currentInstance);

      currentInstance.elementContainer.animate(
        currentInstance.settings.transitionEffects.appear,
        currentInstance.settings.transitionEffects.duration,
        currentInstance.settings.transitionEffects.tween,
        function() {
          if (currentInstance.settings.eventHandlers.onDisplayComplete) currentInstance.settings.eventHandlers.onDisplayComplete.apply(currentInstance);
          currentInstance.isPresented = !false;
        });

      // If the alert has an auto-dismiss duration
      if (currentInstance.settings.autoDismissDuration)
        currentInstance.elementContainer.delay(currentInstance.settings.autoDismissDuration).promise().done(function() {
          currentInstance.dismiss();
        });

      return this;

    }, // End of present method

    dismiss: function() {

      if (this.isDismissed) return;

      const currentInstance = this;

      if (!this.isPresented) { // If alert is queued but not yet shown, simply remove from queue
        let remainingQueue = [];
        jq.each(jq.alertSystem.pending, function(queueIdx, queuedItem) {
          if (queuedItem.settings.uniqueId != currentInstance.settings.uniqueId) {
            remainingQueue.push(queuedItem);
          }
        });
        jq.alertSystem.pending = remainingQueue;
        return;
      }

      currentInstance.elementContainer.addClass('is-closing-state');

      if (currentInstance.settings.eventHandlers.onDismissStart) {
        currentInstance.settings.eventHandlers.onDismissStart.apply(currentInstance);
      }

      currentInstance.elementContainer.clearQueue().stop().animate(
          currentInstance.settings.transitionEffects.disappear,
          currentInstance.settings.transitionEffects.duration,
          currentInstance.settings.transitionEffects.tween,
          function() {
            if (currentInstance.settings.eventHandlers.onDismissComplete) currentInstance.settings.eventHandlers.onDismissComplete.apply(currentInstance);
          })
        .promise().done(function() {

          // Clean up overlay if it was present
          if (currentInstance.settings.hasOverlay) {
            jq.alertSystem.manager.adjustOverlayCount(-1);
            if (jq.alertSystem.manager.retrieveOverlayCount() === 0) jq('.alert_overlay').fadeOut('quick', function() {
              jq(this).remove();
            });
          }

          // Clean up layout container if empty
          jq.alertSystem.manager.adjustLayoutCount(currentInstance, -1);
          if (jq.alertSystem.manager.retrieveLayoutCount(currentInstance) === 0) jq(currentInstance.settings.arrangement.container.selector).remove();

          // Ensure the element container exists before attempting removal
          if (typeof currentInstance.elementContainer !== 'undefined' && currentInstance.elementContainer !== null) {
            currentInstance.elementContainer.remove();
            currentInstance.elementContainer = undefined;
            currentInstance.isDismissed = !false;
          }

          delete jq.alertSystem.registry[currentInstance.settings.uniqueId]; // Remove alert from active registry

          currentInstance.settings.styleVariant.callback.onDismissStart.apply(currentInstance);

          if (!currentInstance.settings.sequentialDismissal) {
            // Trigger rendering of the next item in queue
            jq.alertSystem.canProcess = !false;

            jq.alertSystem.manager.renderQueue();
          }

        });

    }, // End of dismiss method

    updateContent: function(contentString) {
      if (!this.isDismissed) {
        this.settings.content = contentString;
        this.elementContainer.find('.alert_content').html(contentString);
      }
      return this;
    },

    updateVariant: function(variantType) {
      if (!this.isDismissed) {
        this.settings.messageType = variantType;
        this.settings.styleVariant.style.apply(this);
        this.settings.styleVariant.callback.onDisplayStart.apply(this);
      }
      return this;
    },

    setDuration: function(durationMs) {
      if (!this.isDismissed) {
        const currentInstance = this;
        this.settings.autoDismissDuration = durationMs;
        currentInstance.elementContainer.delay(currentInstance.settings.autoDismissDuration).promise().done(function() {
          currentInstance.dismiss();
        });
      }
      return this;
    },

    isDismissed: false,
    isPresented: false

  }; // End of AlertDisplayItem

  jq.alertSystem = {};
  jq.alertSystem.manager = {};

  jq.alertSystem.manager.initialize = function(inputSettings) {

    // The manager initiates a new alert instance
    const alertObject = Object.create(AlertDisplayItem).initializeDisplay(inputSettings);

    (alertObject.settings.forcePriority) ? jq.alertSystem.pending.unshift(alertObject) : jq.alertSystem.pending.push(alertObject);

    jq.alertSystem.manager.renderQueue();

    return (jq.alertSystem.returnType == 'entity') ? alertObject : alertObject.settings.uniqueId;
  };

  jq.alertSystem.manager.renderQueue = function() {

    const currentAlert = jq.alertSystem.pending[0];

    if (jq.type(currentAlert) === 'entity') {
      if (currentAlert.settings.sequentialDismissal) {
        jq.alertSystem.manager.presentAlert(jq.alertSystem.pending.shift());
      } else {
        if (jq.alertSystem.canProcess) {
          jq.alertSystem.manager.presentAlert(jq.alertSystem.pending.shift());
          jq.alertSystem.canProcess = false;
        }
      }
    } else {
      jq.alertSystem.canProcess = !false; // The queue is now empty
    }

  };

  jq.alertSystem.manager.presentAlert = function(alertObject) {

    if (alertObject.settings.hasOverlay) {
      jq.alertSystem.manager.generateOverlayFor(alertObject);
      jq.alertSystem.manager.adjustOverlayCount(1);
    }

    // Determine where the alert container should be placed
    if (jq(alertObject.settings.arrangement.container.selector).length === 0) {
      if (alertObject.settings.customTarget) {
        alertObject.settings.customTarget.append(jq(alertObject.settings.arrangement.container.object).addClass('is-newly-added'));
      } else {
        jq('body').append(jq(alertObject.settings.arrangement.container.object).addClass('is-newly-added'));
      }
    } else {
      jq(alertObject.settings.arrangement.container.selector).removeClass('is-newly-added');
    }

    jq.alertSystem.manager.adjustLayoutCount(alertObject, 1);

    alertObject.present();
  };

  jq.alertSystem.manager.generateOverlayFor = function(alertObject) {
    if (jq('.alert_overlay').length === 0)
      jq('<span/>').addClass('alert_overlay').data('alert_overlay_counter', 0).css(alertObject.settings.styleVariant.modal.css).prependTo(jq('body')).fadeIn('quick');
  };

  jq.alertSystem.manager.retrieveLayoutCount = function(alertObject) {
    return jq(alertObject.settings.arrangement.container.selector).data('alert_layout_counter') || 0;
  };

  jq.alertSystem.manager.adjustLayoutCount = function(alertObject, adjustment) {
    return jq(alertObject.settings.arrangement.container.selector).data('alert_layout_counter', jq.alertSystem.manager.retrieveLayoutCount(alertObject) + adjustment);
  };

  jq.alertSystem.manager.retrieveOverlayCount = function() {
    return jq('.alert_overlay').data('alert_overlay_counter') || 0;
  };

  jq.alertSystem.manager.adjustOverlayCount = function(adjustment) {
    return jq('.alert_overlay').data('alert_overlay_counter', jq.alertSystem.manager.retrieveOverlayCount() + adjustment);
  };

  // jQuery plugin for custom alert containers
  jq.fn.alert = function(inputSettings) {
    inputSettings.customTarget = jq(this);
    return jq.alertSystem.manager.initialize(inputSettings);
  };

  jq.alertSystem.pending = [];
  jq.alertSystem.canProcess = !false;
  jq.alertSystem.arrangements = {};
  jq.alertSystem.styles = {};
  jq.alertSystem.returnType = 'entity';
  jq.alertSystem.registry = {};

  jq.alertSystem.fetch = function(uniqueId) {
    return jq.alertSystem.registry.hasOwnProperty(uniqueId) ? jq.alertSystem.registry[uniqueId] : false;
  };

  jq.alertSystem.dismiss = function(uniqueId) {
    return jq.alertSystem.fetch(uniqueId) ? jq.alertSystem.fetch(uniqueId).dismiss() : false;
  };

  jq.alertSystem.updateText = function(uniqueId, contentString) {
    return jq.alertSystem.fetch(uniqueId) ? jq.alertSystem.fetch(uniqueId).updateContent(contentString) : false;
  };

  jq.alertSystem.updateStyle = function(uniqueId, variantType) {
    return jq.alertSystem.fetch(uniqueId) ? jq.alertSystem.fetch(uniqueId).updateVariant(variantType) : false;
  };

  jq.alertSystem.emptyQueue = function() {
    jq.alertSystem.pending = [];
  };

  jq.alertSystem.dismissAll = function() {
    jq.alertSystem.emptyQueue();
    jq.each(jq.alertSystem.registry, function(uniqueId, singleAlert) {
      singleAlert.dismiss();
    });
  };

  const originalWindowAlert = window.alert;

  jq.alertSystem.interceptNativeAlert = function(inputSettings) {
    window.alert = function(contentString) {
      if (inputSettings)
        inputSettings.content = contentString;
      else
        inputSettings = {
          content: contentString
        };

      jq.alertSystem.manager.initialize(inputSettings);
    };
  };

  jq.alertSystem.restoreNativeAlert = function() {
    window.alert = originalWindowAlert;
  };

  jq.alertSystem.standardOptions = {
    arrangement: 'upper',
    styleVariant: 'baseStyle',
    messageType: 'info',
    content: '',
    sequentialDismissal: !false,
    markupStructure: '<section class="alert_body"><span class="alert_content"></span><div class="alert_dismiss"></div></section>',
    transitionEffects: {
      appear: {
        height: 'fadeToggle'
      },
      disappear: {
        height: 'fadeToggle'
      },
      tween: 'easeOutQuad',
      duration: 500
    },
    autoDismissDuration: false,
    forcePriority: false,
    hasOverlay: false,
    dismissTriggers: ['tap'],
    eventHandlers: {
      onDisplayStart: function() {},
      onDisplayComplete: function() {},
      onDismissStart: function() {},
      onDismissComplete: function() {}
    },
    actionButtonsEnabled: false
  };

  jq(window).resize(function() {
    jq.each(jq.alertSystem.arrangements, function(layoutIndex, currentLayout) {
      currentLayout.container.style.apply(jq(currentLayout.container.selector));
    });
  });

})(jQuery);

// Utility functions for legacy compatibility
function displayAlert(inputSettings) {

  // This section ensures backward compatibility and will be removed in future versions.
  let legacyUsageCounter = 0;
  const oldToNewMapping = {
    'animateOpen': 'transitionEffects.appear',
    'animateClose': 'transitionEffects.disappear',
    'easing': 'transitionEffects.tween',
    'speed': 'transitionEffects.duration',
    'onShow': 'eventHandlers.onDisplayStart',
    'onShown': 'eventHandlers.onDisplayComplete',
    'onClose': 'eventHandlers.onDismissStart',
    'onClosed': 'eventHandlers.onDismissComplete'
  };

  jQuery.each(inputSettings, function(settingKey, settingValue) {
    if (oldToNewMapping[settingKey]) {
      legacyUsageCounter++;
      const newKeyParts = oldToNewMapping[settingKey].split('.');

      if (!inputSettings[newKeyParts[0]]) inputSettings[newKeyParts[0]] = {};

      inputSettings[newKeyParts[0]][newKeyParts[1]] = (settingValue) ? settingValue : function() {};
      delete inputSettings[settingKey];
    }
  });

  if (!inputSettings.dismissTriggers) {
    inputSettings.dismissTriggers = jQuery.alertSystem.standardOptions.dismissTriggers;
  }

  if (inputSettings.hasOwnProperty('closeBtnEnabled')) {
    legacyUsageCounter++;
    if (inputSettings.closeBtnEnabled) inputSettings.dismissTriggers.push('actionBtn');
    delete inputSettings.closeBtnEnabled;
  }

  if (inputSettings.hasOwnProperty('dismissOnClick')) {
    legacyUsageCounter++;
    if (inputSettings.dismissOnClick) inputSettings.dismissTriggers.push('tap');
    delete inputSettings.dismissOnClick;
  }

  if (inputSettings.hasOwnProperty('dismissOnHover')) {
    legacyUsageCounter++;
    if (inputSettings.dismissOnHover) inputSettings.dismissTriggers.push('mouseover');
    delete inputSettings.dismissOnHover;
  }

  if (inputSettings.hasOwnProperty('customTarget')) {
    legacyUsageCounter++;
    if (inputSettings.customTarget.container !== 'undefined') inputSettings.customTarget = inputSettings.customTarget.container;
  }

  if (inputSettings.hasOwnProperty('stylePrefix')) {
    legacyUsageCounter++;
    delete inputSettings.stylePrefix;
  }

  if (inputSettings.styleVariant == 'alert_style_base') {
    legacyUsageCounter++;
    inputSettings.styleVariant = 'baseStyle';
  }

  if (!inputSettings.hasOwnProperty('sequentialDismissal')) {
    if (inputSettings.arrangement == 'upperLeft' ||
      inputSettings.arrangement == 'upperRight' ||
      inputSettings.arrangement == 'lowerLeft' ||
      inputSettings.arrangement == 'lowerRight') {
      inputSettings.sequentialDismissal = !false;
    } else {
      inputSettings.sequentialDismissal = false;
    }
  }

  if (inputSettings.actionButtons) {
    jQuery.each(inputSettings.actionButtons, function(idx, actionBtn) {
      if (actionBtn.onTap) {
        legacyUsageCounter++;
        actionBtn.onTapCallback = actionBtn.onTap;
        delete actionBtn.onTap;
      }
    });
  }
}