!function( jq ) {
  // Object representing a color value
  var PixelShade = function(colorValue) {
    this.shadeData = {
      hVal: 1,
      sVal: 1,
      brightVal: 1,
      alphaVal: 1
    };
    this.establishShade(colorValue);
  };

  PixelShade.prototype = {
    objectConstructor: PixelShade,

    // Converts a string to HSB representation
    establishShade: function(colorValue) {
      colorValue = colorValue.toLowerCase();
      var selfRef = this;
      jq.each( PaletteUtil.colorStringParsers, function( idx, parsingUnit ) {
        var foundMatch = parsingUnit.regexPattern.exec( colorValue ),
          parsedValues = foundMatch && parsingUnit.parseFunction( foundMatch ),
          colorSpace = parsingUnit.colorSpace || 'rgba';
        if ( parsedValues ) {
          if (colorSpace === 'hsla') {
            selfRef.shadeData = PaletteUtil.RGBtoHSV.apply(null, PaletteUtil.HSLtoRGBConversion.apply(null, parsedValues));
          } else {
            selfRef.shadeData = PaletteUtil.RGBtoHSV.apply(null, parsedValues);
          }
          return false;
        }
      });
    },

    adjustHue: function(hVal) {
      this.shadeData.hVal = 1 - hVal;
    },

    adjustSaturation: function(sVal) {
      this.shadeData.sVal = sVal;
    },

    adjustBrightness: function(bVal) {
      this.shadeData.brightVal = 1 - bVal;
    },

    adjustAlpha: function(alphaVal) {
      this.shadeData.alphaVal = parseInt((1 - alphaVal) * 100, 10) / 100;
    },

    // HSB to RGB logic (adapted from RaphaelJS)
    toRGBFormat: function(hVal, sVal, brightVal, alphaVal) {
      if (!hVal) {
        hVal = this.shadeData.hVal;
        sVal = this.shadeData.sVal;
        brightVal = this.shadeData.brightVal;
      }
      hVal *= 360;
      var redComp, greenComp, blueComp, intermediateX, chromaticity;
      hVal = (hVal % 360) / 60;
      chromaticity = brightVal * sVal;
      intermediateX = chromaticity * (1 - Math.abs(hVal % 2 - 1));
      redComp = greenComp = blueComp = brightVal - chromaticity;

      hVal = ~~hVal;
      redComp += [chromaticity, intermediateX, 0, 0, intermediateX, chromaticity][hVal];
      greenComp += [intermediateX, chromaticity, chromaticity, intermediateX, 0, 0][hVal];
      blueComp += [0, 0, intermediateX, chromaticity, chromaticity, intermediateX][hVal];
      return {
        r: Math.round(redComp * 255),
        g: Math.round(greenComp * 255),
        b: Math.round(blueComp * 255),
        a: alphaVal || this.shadeData.alphaVal
      };
    },

    toHexFormat: function(hVal, sVal, brightVal, alphaVal) {
      var rgbObject = this.toRGBFormat(hVal, sVal, brightVal, alphaVal);
      return '#' + ((1 << 24) | (parseInt(rgbObject.r) << 16) | (parseInt(rgbObject.g) << 8) | parseInt(rgbObject.b)).toString(16).substr(1);
    },

    toHSLFormat: function(hVal, sVal, brightVal, alphaVal) {
      if (!hVal) {
        hVal = this.shadeData.hVal;
        sVal = this.shadeData.sVal;
        brightVal = this.shadeData.brightVal;
      }
      var HSL_H = hVal,
        HSL_L = (2 - sVal) * brightVal,
        HSL_S = sVal * brightVal;
      if (HSL_L > 0 && HSL_L <= 1) {
        HSL_S /= HSL_L;
      } else {
        HSL_S /= 2 - HSL_L;
      }
      HSL_L /= 2;
      if (HSL_S > 1) {
        HSL_S = 1;
      }
      return {
        h: HSL_H,
        s: HSL_S,
        l: HSL_L,
        a: alphaVal || this.shadeData.alphaVal
      };
    }
  };

  // Main color selection component
  var ShadeSelector = function(targetElement, configuration) {
    this.targetElement = jq(targetElement);
    var displayFormat = configuration.format || this.targetElement.data('color-format') || 'hex';
    this.displayFormat = PaletteUtil.formatTranslators[displayFormat];
    this.isInputField = this.targetElement.is('input');
    this.linkedComponent = this.targetElement.is('.color') ? this.targetElement.find('.input-group-addon') : false;

    this.shadePanel = jq(PaletteUtil.template)
      .appendTo('body')
      .on('mousedown', jq.proxy(this.onMouseDownEvent, this));

    if (this.isInputField) {
      this.targetElement.on({
        'focus': jq.proxy(this.displayPanel, this),
        'keyup': jq.proxy(this.refreshDisplay, this)
      });
    } else if (this.linkedComponent) {
      this.linkedComponent.on({
        'click': jq.proxy(this.displayPanel, this)
      });
    } else {
      this.targetElement.on({
        'click': jq.proxy(this.displayPanel, this)
      });
    }
    if (displayFormat === 'rgba' || displayFormat === 'hsla') {
      this.shadePanel.addClass('alpha');
      this.alphaLayer = this.shadePanel.find('.colorpicker-alpha')[0].style;
    }

    if (this.linkedComponent) {
      this.shadePanel.find('.colorpicker-color').hide();
      this.colorPreview = this.targetElement.find('i')[0].style;
    } else {
      this.colorPreview = this.shadePanel.find('div:last')[0].style;
    }

    this.baseColorArea = this.shadePanel.find('div:first')[0].style;
    this.refreshDisplay();
  };

  ShadeSelector.prototype = {
    objectConstructor: ShadeSelector,

    displayPanel: function(eventObj) {
      this.shadePanel.show();
      this.panelHeight = this.linkedComponent ? this.linkedComponent.outerHeight() : this.targetElement.outerHeight();
      this.positionPanel();
      jq(globalWindow).on('resize', jq.proxy(this.positionPanel, this));
      if (!this.isInputField) {
        if (eventObj) {
          eventObj.stopPropagation();
          eventObj.preventDefault();
        }
      }
      jq(globalDocument).on({
        'mousedown': jq.proxy(this.concealPanel, this)
      });
      this.targetElement.trigger({
        eventType: 'show',
        currentShade: this.currentShade
      });
    },

    refreshDisplay: function() {
      this.currentShade = new PixelShade(this.isInputField ? this.targetElement.prop('value') : this.targetElement.data('color'));
      this.shadePanel.find('i')
        .eq(0).css({
          left: this.currentShade.shadeData.sVal * 100,
          top: 100 - this.currentShade.shadeData.brightVal * 100
        }).end()
        .eq(1).css('top', 100 * (1 - this.currentShade.shadeData.hVal)).end()
        .eq(2).css('top', 100 * (1 - this.currentShade.shadeData.alphaVal));
      this.updateColorPreview();
    },

    setShadeValue: function(newShade) {
      this.currentShade = new PixelShade(newShade);
      this.shadePanel.find('i')
        .eq(0).css({
          left: this.currentShade.shadeData.sVal * 100,
          top: 100 - this.currentShade.shadeData.brightVal * 100
        }).end()
        .eq(1).css('top', 100 * (1 - this.currentShade.shadeData.hVal)).end()
        .eq(2).css('top', 100 * (1 - this.currentShade.shadeData.alphaVal));
      this.updateColorPreview();
      this.targetElement.trigger({
        eventType: 'changeColor',
        currentShade: this.currentShade
      });
    },

    concealPanel: function() {
      this.shadePanel.hide();
      jq(globalWindow).off('resize', this.positionPanel);
      if (!this.isInputField) {
        jq(globalDocument).off({
          'mousedown': this.concealPanel
        });
        if (this.linkedComponent) {
          this.targetElement.find('input').prop('value', this.displayFormat.call(this));
        }
        this.targetElement.data('color', this.displayFormat.call(this));
      } else {
        this.targetElement.prop('value', this.displayFormat.call(this));
      }
      this.targetElement.trigger({
        eventType: 'hide',
        currentShade: this.currentShade
      });
    },

    positionPanel: function() {
      var elementOffset = this.linkedComponent ? this.linkedComponent.offset() : this.targetElement.offset();
      this.shadePanel.css({
        top: elementOffset.top + this.panelHeight,
        left: elementOffset.left
      });
    },

    // Updates the visual color representation
    updateColorPreview: function() {
      try {
        this.colorPreview.backgroundColor = this.displayFormat.call(this);
      } catch (err) {
        this.colorPreview.backgroundColor = this.currentShade.toHexFormat();
      }
      // Sets the color for brightness/saturation slider
      this.baseColorArea.backgroundColor = this.currentShade.toHexFormat(this.currentShade.shadeData.hVal, 1, 1, 1);
      // Sets the color for alpha slider
      if (this.alphaLayer) {
        this.alphaLayer.backgroundColor = this.currentShade.toHexFormat();
      }
    },

    mousePointer: null,

    currentSlider: null,

    onMouseDownEvent: function(eventObj) {
      eventObj.stopPropagation();
      eventObj.preventDefault();

      var eventTarget = jq(eventObj.target);

      // Determine the slider and its properties
      var interactionZone = eventTarget.closest('div');
      if (!interactionZone.is('.colorpicker')) {
        if (interactionZone.is('.colorpicker-saturation')) {
          this.currentSlider = jq.extend({}, PaletteUtil.sliderConfigs.saturationSlider);
        } else if (interactionZone.is('.colorpicker-hue')) {
          this.currentSlider = jq.extend({}, PaletteUtil.sliderConfigs.hueSlider);
        } else if (interactionZone.is('.colorpicker-alpha')) {
          this.currentSlider = jq.extend({}, PaletteUtil.sliderConfigs.alphaSlider);
        } else {
          return false;
        }
        var elementOffset = interactionZone.offset();
        // Reference to the knob's style object
        this.currentSlider.sliderKnob = interactionZone.find('i')[0].style;
        this.currentSlider.coordLeft = eventObj.pageX - elementOffset.left;
        this.currentSlider.coordTop = eventObj.pageY - elementOffset.top;
        this.mousePointer = {
          left: eventObj.pageX,
          top: eventObj.pageY
        };
        // Trigger mousemove to position the knob correctly
        jq(globalDocument).on({
          mousemove: jq.proxy(this.onMouseMoveEvent, this),
          mouseup: jq.proxy(this.onMouseUpEvent, this)
        }).trigger('mousemove');
      }
      return false;
    },

    onMouseMoveEvent: function(eventObj) {
      eventObj.stopPropagation();
      eventObj.preventDefault();
      var coordLeft = Math.max(
        0,
        Math.min(
          this.currentSlider.maximumLeft,
          this.currentSlider.coordLeft + ((eventObj.pageX || this.mousePointer.left) - this.mousePointer.left)
        )
      );
      var coordTop = Math.max(
        0,
        Math.min(
          this.currentSlider.maximumTop,
          this.currentSlider.coordTop + ((eventObj.pageY || this.mousePointer.top) - this.mousePointer.top)
        )
      );
      this.currentSlider.sliderKnob.left = coordLeft + 'px';
      this.currentSlider.sliderKnob.top = coordTop + 'px';
      if (this.currentSlider.leftCallback) {
        this.currentShade[this.currentSlider.leftCallback].call(this.currentShade, coordLeft / 100);
      }
      if (this.currentSlider.topCallback) {
        this.currentShade[this.currentSlider.topCallback].call(this.currentShade, coordTop / 100);
      }
      this.updateColorPreview();
      this.targetElement.trigger({
        eventType: 'changeColor',
        currentShade: this.currentShade
      });
      return false;
    },

    onMouseUpEvent: function(eventObj) {
      eventObj.stopPropagation();
      eventObj.preventDefault();
      jq(globalDocument).off({
        mousemove: this.onMouseMoveEvent,
        mouseup: this.onMouseUpEvent
      });
      return false;
    }
  }

  jq.plugin.shadePicker = function( pluginOption, inputVal ) {
    return this.each(function() {
      var currentInstance = jq(this),
        instanceData = currentInstance.data('shadePicker'),
        configuration = typeof pluginOption === 'object' && pluginOption;
      if (!instanceData) {
        currentInstance.data('shadePicker', (instanceData = new ShadeSelector(this, jq.extend({}, jq.plugin.shadePicker.defaultSettings, configuration))));
      }
      if (typeof pluginOption === 'string') instanceData[pluginOption](inputVal);
    });
  };

  jq.plugin.shadePicker.defaultSettings = {};

  jq.plugin.shadePicker.ClassConstructor = ShadeSelector;

  // Global utilities for color manipulation
  var PaletteUtil = {

    // Functions to convert PixelShade objects to string formats
    formatTranslators: {
      'rgb': function() {
        var rgbObject = this.currentShade.toRGBFormat();
        return 'rgb(' + rgbObject.r + ',' + rgbObject.g + ',' + rgbObject.b + ')';
      },

      'rgba': function() {
        var rgbObject = this.currentShade.toRGBFormat();
        return 'rgba(' + rgbObject.r + ',' + rgbObject.g + ',' + rgbObject.b + ',' + rgbObject.a + ')';
      },

      'hsl': function() {
        var hslObject = this.currentShade.toHSLFormat();
        return 'hsl(' + Math.round(hslObject.h * 360) + ',' + Math.round(hslObject.s * 100) + '%,' + Math.round(hslObject.l * 100) + '%)';
      },

      'hsla': function() {
        var hslObject = this.currentShade.toHSLFormat();
        return 'hsla(' + Math.round(hslObject.h * 360) + ',' + Math.round(hslObject.s * 100) + '%,' + Math.round(hslObject.l * 100) + '%,' + hslObject.a + ')';
      },

      'hex': function() {
        return this.currentShade.toHexFormat();
      }
    },

    sliderConfigs: {
      saturationSlider: {
        maximumLeft: 100,
        maximumTop: 100,
        leftCallback: 'adjustSaturation',
        topCallback: 'adjustBrightness'
      },

      hueSlider: {
        maximumLeft: 0,
        maximumTop: 100,
        leftCallback: false,
        topCallback: 'adjustHue'
      },

      alphaSlider: {
        maximumLeft: 0,
        maximumTop: 100,
        leftCallback: false,
        topCallback: 'adjustAlpha'
      }
    },

    // Converts RGB to HSB (from RaphaelJS library)
    RGBtoHSV: function(redVal, greenVal, blueVal, alphaVal) {
      redVal /= 255;
      greenVal /= 255;
      blueVal /= 255;

      var HSV_H, HSV_S, HSV_V, HSV_C;
      HSV_V = Math.max(redVal, greenVal, blueVal);
      HSV_C = HSV_V - Math.min(redVal, greenVal, blueVal);
      HSV_H = (HSV_C === 0 ? null :
        HSV_V == redVal ? (greenVal - blueVal) / HSV_C :
        HSV_V == greenVal ? (blueVal - redVal) / HSV_C + 2 :
        (redVal - greenVal) / HSV_C + 4
      );
      HSV_H = ((HSV_H + 360) % 6) * 60 / 360;
      HSV_S = HSV_C === 0 ? 0 : HSV_C / HSV_V;
      return {
        hVal: HSV_H || 1,
        sVal: HSV_S,
        brightVal: HSV_V,
        alphaVal: alphaVal || 1
      };
    },

    convertHueToRGB: function(paramP, paramQ, hVal) {
      if (hVal < 0)
        hVal += 1;
      else if (hVal > 1)
        hVal -= 1;

      if ((hVal * 6) < 1)
        return paramP + (paramQ - paramP) * hVal * 6;
      else if ((hVal * 2) < 1)
        return paramQ;
      else if ((hVal * 3) < 2)
        return paramP + (paramQ - paramP) * ((2 / 3) - hVal) * 6;
      else
        return paramP;
    },

    HSLtoRGBConversion: function(hVal, sVal, lVal, alphaVal) {
      if (sVal < 0) {
        sVal = 0;
      }
      var paramQ;
      if (lVal <= 0.5) {
        paramQ = lVal * (1 + sVal);
      } else {
        paramQ = lVal + sVal - (lVal * sVal);
      }

      var paramP = 2 * lVal - paramQ;

      var tempR = hVal + (1 / 3);
      var tempG = hVal;
      var tempB = hVal - (1 / 3);

      var redComp = Math.round(PaletteUtil.convertHueToRGB(paramP, paramQ, tempR) * 255);
      var greenComp = Math.round(PaletteUtil.convertHueToRGB(paramP, paramQ, tempG) * 255);
      var blueComp = Math.round(PaletteUtil.convertHueToRGB(paramP, paramQ, tempB) * 255);
      return [redComp, greenComp, blueComp, alphaVal || 1];
    },

    // Regular expressions for parsing color strings (from jQuery color plugin)
    colorStringParsers: [{
      regexPattern: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
      parseFunction: function(executionResult) {
        return [
          executionResult[1],
          executionResult[2],
          executionResult[3],
          executionResult[4]
        ];
      }
    }, {
      regexPattern: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
      parseFunction: function(executionResult) {
        return [
          2.55 * executionResult[1],
          2.55 * executionResult[2],
          2.55 * executionResult[3],
          executionResult[4]
        ];
      }
    }]
  };
}( jQuery );