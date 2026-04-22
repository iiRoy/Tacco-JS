/******************************************
 * JQuery ResizableFrame
 *
 * A compact, user-friendly jQuery module for responsive web iframes.
 *
 * Creator           @devlinker (http://dev.onweb.org)
 * Copyright         Copyright (c) 2023 Developer Linker.
 * License           MIT
 * Source            https://github.com/devlinker/ResizableFrame.js
 * Version           1.0.0.0
 *
 ******************************************/

;
(function (jq, globalObj, docElement, undefValue) {

  var MODULE_ID = "resizableFrame",
    OBJECT_ID_KEY = "component_" + MODULE_ID;

  function AdaptiveFrame(hostElement, configSettings, baseConfig) {
    this.hostElement = jq(hostElement);
    this.configSettings = jq.extend({}, baseConfig, configSettings);

    this._baseConfig = baseConfig;
    this._initialize();
  }

  AdaptiveFrame.prototype = {

    // Refreshes the layout of any new iframes added to the DOM after initial setup
    refreshLayout: function () {
      if (this.configSettings.layoutMode === 'resize') {
        this._adjustNewFrames();
      } else {
        this._encloseNewFrames();
      }
    },

    // Encloses a single iframe element (when layoutMode = 'wrap')
    enclose: function (targetFrame) {

      var spacingValue = (this._determineAspectRatio(targetFrame) * 100) + '%',
        containerDiv = jq('<div/>')
          .addClass(this.configSettings.containerClass)
          .css('padding-bottom', spacingValue);

      // Envelops the iframe and returns the new parent container
      return targetFrame.wrap(containerDiv).parent();
    },

    // Sets up and scales a single iframe element (when layoutMode = 'resize')
    scale: function (targetFrame) {

      this._prepareFrame(targetFrame);

      this._scaleFrame(
        targetFrame, this.hostElement.width(), this.hostElement.height(), this.configSettings.constrainHeight);

      // Returns the now scaled iframe
      return targetFrame;
    },

    // Removes the component and cleans up its effects
    cleanupModule: function () {
      var _this = this;
      if (_this.configSettings.layoutMode === 'resize') {
        // Remove iframe styling classes
        this.hostElement.find('iframe.' + this.configSettings.frameClassName).each(function () {
          var storedInfo = jq(this).data(MODULE_ID);
          jq(this).removeClass(_this.configSettings.frameClassName)
            .width(storedInfo.width)
            .height(storedInfo.height)
            .data(MODULE_ID, null);
        });

        this._removeEventHandlers();

      } else {

        // Eliminate wrapper elements
        this.hostElement.find('.' + this.configSettings.containerClass).children().unwrap();
      }

      this.hostElement.data(OBJECT_ID_KEY, null);
    },

    _initialize: function () {
      if (this.configSettings.layoutMode === 'resize') {
        this._attachEventHandlers(); // Attaches to window resize events
      }

      this.refreshLayout();
    },

    _encloseNewFrames: function () {
      var _this = this,
        // Selects iframes that are not yet contained
        framesToProcess = this.hostElement.find('iframe')
          .filter(function () {
            return !jq(this).closest(_this.configSettings.containerClass).length
          });

      framesToProcess.each(function () {
        _this.enclose(jq(this));
      });
    },

    _adjustNewFrames: function () {
      var _this = this;
      jq('iframe').not(this.configSettings.frameClassName).each(function () {
        _this._prepareFrame(jq(this));
      });
      this._scaleAllFrames();
    },

    _prepareFrame: function (targetFrame) {
      targetFrame
        .data(MODULE_ID, {
          aspectRatio: this._determineAspectRatio(targetFrame),
          width: targetFrame.width(),
          height: targetFrame.height()
        })
        .addClass(this.configSettings.frameClassName);
    },

    // Scales all iframes that have been set up by this component
    _scaleAllFrames: function () {

      var _this = this,
        parentWidth = this.hostElement.width(),
        parentHeight = this.hostElement.height(),
        limitHeight = this.configSettings.constrainHeight;

      this.hostElement.find('iframe.' + this.configSettings.frameClassName).each(function () {
        _this._scaleFrame(jq(this), parentWidth, parentHeight, limitHeight);
      });
    },

    _scaleFrame: function (targetFrame, parentWidth, parentHeight, limitHeight) {
      var aspectRatio = targetFrame.data(MODULE_ID).aspectRatio,
        calculatedHeight = parentWidth * aspectRatio;

      if (limitHeight && (calculatedHeight > parentHeight)) {
        // If the new height exceeds the container, scale the width instead
        targetFrame.height(parentHeight).width(parentHeight / aspectRatio);
      } else {
        // Scale the height (similar to 'wrap' mode behavior)
        targetFrame.height(parentWidth * aspectRatio).width('100%');
      }
    },

    _determineAspectRatio: function (targetFrame) {
      var elemWidth = targetFrame.attr('width'),
        elemHeight = targetFrame.attr('height');

      return ((elemHeight / elemWidth)).toFixed(4);
    },

    _attachEventHandlers: function () {
      // Debounced resizing for performance
      var _this = this,
        timeoutHandle;
      jq(globalObj).on('resize.' + MODULE_ID, function () {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(function () {
          _this._scaleAllFrames();
        }, 100);
      });
    },

    _removeEventHandlers: function () {
      // Cleans up all namespaced event handlers
      jq(globalObj).off('.' + MODULE_ID);
    }
  };

  jq.fn[MODULE_ID] = function (configSettings) {

    var methodArgs = arguments,
      resultValue;

    this.each(function () {

      var pluginInstance = jq.data(this, OBJECT_ID_KEY);

      if (pluginInstance) {
        // Check if invoking public methods
        if (typeof (configSettings) === 'string' && configSettings[0] !== '_') {
          var targetMethod = pluginInstance[configSettings];
          if (typeof (targetMethod) === 'function') {
            resultValue = targetMethod.apply(pluginInstance, Array.prototype.slice.call(methodArgs, 1));
          } else {
            // Method not found
            jq.error('Public method \'' + configSettings + '\' does not exist on jQuery.' + MODULE_ID);
          }
        }

      } else {
        jq.data(this, OBJECT_ID_KEY, new AdaptiveFrame(this, configSettings, jq.fn[MODULE_ID].baseConfig));
      }
    });

    // If a cached method returned a value, return it; otherwise, return 'this' for chainability
    return resultValue !== undefValue ? resultValue : this;
  }

  jq.fn[MODULE_ID].baseConfig = {
    containerClass: 'resizableframe-box',
    frameClassName: 'resizableframe',
    layoutMode: 'wrap',
    constrainHeight: false
  };


})(jQuery, window, document);