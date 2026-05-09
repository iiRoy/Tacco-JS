/*
 * Spectrum Widget - A jQuery color selection tool.
 * Derived work from bootstrap-colorpicker.js
 * (C) 2023 Acme Corp. All rights reserved.
 * Licensed under the MIT License.
 */

(function(_jq) {

    // A utility for logging messages, can be enabled/disabled
    const _logger = {
        debugEnabled: false,
        log: function(...args) {
            if (this.debugEnabled) {
                console.log("[SpectrumWidget]", ...args);
            }
        },
        warn: function(...args) {
            console.warn("[SpectrumWidget]", ...args);
        },
        error: function(...args) {
            console.error("[SpectrumWidget]", ...args);
        }
    };

    // Chroma representation object
    const ChromaObject = function(initialRepresentation) {
        // Internal storage for HSB and Alpha components
        this.internalComponents = {
            h: 0, // Hue (0-1)
            s: 0, // Saturation (0-1)
            b: 0, // Brightness (0-1)
            a: 1  // Alpha (0-1)
        };
        // Initialize with default black if no initial value or if invalid
        if (!initialRepresentation || typeof initialRepresentation !== 'string' || initialRepresentation.trim() === '') {
            _logger.debug("No initial color value provided, invalid type, or empty string. Initializing to black.");
            this.setRepresentation("rgb(0,0,0)"); // Default to black
        } else {
            this.setRepresentation(initialRepresentation);
        }
    };

    ChromaObject.prototype = {
        // Parses a string and sets the internal HSB+Alpha components
        setRepresentation: function(colorInputString) {
            const selfRef = this;
            const normalizedInput = String(colorInputString).toLowerCase().trim();

            let foundMatch = false;
            // Iterate through registered parsers to find a match
            GlobalChromaDefs.parserCollection.some(function(currentParser) {
                const parseResult = currentParser.regexPattern.exec(normalizedInput);
                if (parseResult) {
                    const extractedComponents = currentParser.parseMatch(parseResult);
                    const colorSpace = currentParser.colorSpace || 'rgba';

                    if (extractedComponents && extractedComponents.length >= 3) {
                        let convertedHSB;
                        if (colorSpace === 'hsla') {
                            convertedHSB = GlobalChromaDefs.convertRGBtoHSB(...GlobalChromaDefs.convertHSLtoRGB(...extractedComponents));
                        } else {
                            convertedHSB = GlobalChromaDefs.convertRGBtoHSB(...extractedComponents);
                        }
                        selfRef.internalComponents = {
                            h: convertedHSB.hue,
                            s: convertedHSB.saturation,
                            b: convertedHSB.brightness,
                            a: convertedHSB.alpha !== undefined ? convertedHSB.alpha : 1
                        };
                        _logger.debug("Color parsed and set:", selfRef.internalComponents);
                        foundMatch = true;
                        return true;
                    }
                }
                return false;
            });

            if (!foundMatch) {
                _logger.warn(`Could not parse color string: "${colorInputString}". Keeping previous color.`);
            }
        },

        // Adjusts the hue component
        adjustHue: function(hueNormalizedValue) {
            this.internalComponents.h = GlobalChromaDefs.clamp(1 - hueNormalizedValue, 0, 1);
            _logger.debug("Hue adjusted to:", this.internalComponents.h);
        },

        // Adjusts the saturation component
        adjustSaturation: function(saturationNormalizedValue) {
            this.internalComponents.s = GlobalChromaDefs.clamp(saturationNormalizedValue, 0, 1);
            _logger.debug("Saturation adjusted to:", this.internalComponents.s);
        },

        // Adjusts the brightness component
        adjustBrightness: function(brightnessNormalizedValue) {
            this.internalComponents.b = GlobalChromaDefs.clamp(1 - brightnessNormalizedValue, 0, 1);
            _logger.debug("Brightness adjusted to:", this.internalComponents.b);
        },

        // Adjusts the alpha (opacity) component
        adjustOpacity: function(alphaNormalizedValue) {
            this.internalComponents.a = GlobalChromaDefs.clamp(Math.round((1 - alphaNormalizedValue) * 100) / 100, 0, 1);
            _logger.debug("Opacity adjusted to:", this.internalComponents.a);
        },

        // Converts HSB to RGB components (based on RaphaelJS logic)
        getRGBComponents: function(_hue, _saturation, _brightness, _alpha) {
            const currentHue = _hue ?? this.internalComponents.h; // Use nullish coalescing
            const currentSaturation = _saturation ?? this.internalComponents.s;
            const currentBrightness = _brightness ?? this.internalComponents.b;
            const currentAlpha = _alpha ?? this.internalComponents.a;

            const hueDegrees = currentHue * 360;
            const sector = (hueDegrees % 360) / 60;
            const chromaValue = currentBrightness * currentSaturation;
            const intermediateX = chromaValue * (1 - Math.abs(sector % 2 - 1));

            let redComp = 0, greenComp = 0, blueComp = 0;
            const m = currentBrightness - chromaValue;

            switch (Math.floor(sector)) {
                case 0: redComp = chromaValue; greenComp = intermediateX; blueComp = 0; break;
                case 1: redComp = intermediateX; greenComp = chromaValue; blueComp = 0; break;
                case 2: redComp = 0; greenComp = chromaValue; blueComp = intermediateX; break;
                case 3: redComp = 0; greenComp = intermediateX; blueComp = chromaValue; break;
                case 4: redComp = intermediateX; greenComp = 0; blueComp = chromaValue; break;
                case 5:
                default: redComp = chromaValue; greenComp = 0; blueComp = intermediateX; break;
            }

            return {
                red: Math.round((redComp + m) * 255),
                green: Math.round((greenComp + m) * 255),
                blue: Math.round((blueComp + m) * 255),
                opacity: currentAlpha
            };
        },

        // Converts HSB to a hexadecimal color string
        getHexCode: function(_hue, _saturation, _brightness, _alpha) {
            const rgbResult = this.getRGBComponents(_hue, _saturation, _brightness, _alpha);
            const toHexComponent = (c) => GlobalChromaDefs.toTwoDigitHex(Math.round(c));
            return `#${toHexComponent(rgbResult.red)}${toHexComponent(rgbResult.green)}${toHexComponent(rgbResult.blue)}`;
        },

        // Converts HSB to HSL components
        getHSLComponents: function(_hue, _saturation, _brightness, _alpha) {
            const currentHue = _hue ?? this.internalComponents.h;
            const currentSaturation = _saturation ?? this.internalComponents.s;
            const currentBrightness = _brightness ?? this.internalComponents.b;
            const currentAlpha = _alpha ?? this.internalComponents.a;

            const lightnessVal = (2 - currentSaturation) * currentBrightness;
            let saturationVal;

            if (lightnessVal > 0 && lightnessVal <= 1) {
                saturationVal = currentSaturation * currentBrightness / lightnessVal;
            } else {
                saturationVal = (2 - lightnessVal !== 0) ? (currentSaturation * currentBrightness / (2 - lightnessVal)) : 0;
            }

            const finalLightness = lightnessVal / 2;

            return {
                hue: currentHue,
                saturation: GlobalChromaDefs.clamp(saturationVal, 0, 1),
                lightness: finalLightness,
                opacity: currentAlpha
            };
        }
    };

    // --- Spectrum Widget Definition ---

    const SpectrumWidget = function(targetElement, widgetOptions) {
        this.targetElement = _jq(targetElement);
        this.widgetOptions = widgetOptions;

        const initialFormat = widgetOptions.displayFormat || this.targetElement.data('color-format') || 'hex';
        this.displayFormatFunction = GlobalChromaDefs.formatTranslators[initialFormat];

        this.isInputField = this.targetElement.is('input');
        this.triggerComponent = this.targetElement.hasClass('color') ? this.targetElement.find('.input-group-addon') : null;

        this.widgetContainer = _jq(GlobalChromaDefs.widgetTemplate)
            .appendTo('body');
        
        this.widgetContainer.on('mousedown', this.handleMouseDown.bind(this)); 

        if (this.isInputField) {
            this.targetElement.on({
                'focus.spectrumWidget': this.displayWidget.bind(this),
                'keyup.spectrumWidget': this.refreshDisplay.bind(this)
            });
        } else if (this.triggerComponent && this.triggerComponent.length) {
            this.triggerComponent.on({
                'click.spectrumWidget': this.displayWidget.bind(this)
            });
        } else {
            this.targetElement.on({
                'click.spectrumWidget': this.displayWidget.bind(this)
            });
        }

        if (['rgba', 'hsla'].includes(initialFormat)) {
            this.widgetContainer.addClass('alpha');
            this.alphaStyleRef = this.widgetContainer.find('.colorpicker-alpha').get(0).style;
        } else {
            this.alphaStyleRef = null;
        }
        
        if (this.triggerComponent && this.triggerComponent.length) {
            this.widgetContainer.find('.colorpicker-color').hide();
            this.colorPreviewArea = this.targetElement.find('i').get(0).style;
        } else {
            this.colorPreviewArea = this.widgetContainer.find('div:last').get(0).style;
        }

        this.baseColorArea = this.widgetContainer.find('div:first').get(0).style;
        
        this.refreshDisplay();
        _logger.debug("SpectrumWidget initialized for element:", targetElement);
    };

    SpectrumWidget.prototype = {
        displayWidget: function(eventObj) {
            this.widgetContainer.show();
            const widgetHeight = (this.triggerComponent && this.triggerComponent.length) ? this.triggerComponent.outerHeight() : this.targetElement.outerHeight();
            this.widgetHeight = widgetHeight;
            this.positionWidget();

            _jq(window).on('resize.spectrumWidget', this.positionWidget.bind(this));

            if (!this.isInputField && eventObj) {
                eventObj.stopPropagation();
                eventObj.preventDefault();
            }
            
            _jq(document).on('mousedown.spectrumWidget', this.concealWidget.bind(this));
            
            this.targetElement.trigger({
                type: 'spectrum:opened',
                currentChroma: this.currentChroma
            });
            _logger.debug("Widget displayed.");
        },

        refreshDisplay: function() {
            const sourceValue = this.isInputField ? this.targetElement.prop('value') : this.targetElement.data('color');
            this.currentChroma = new ChromaObject(sourceValue);

            const { h, s, b, a } = this.currentChroma.internalComponents;

            this.widgetContainer.find('i').eq(0).css({
                left: `${s * 100}%`,
                top: `${100 - b * 100}%`
            });
            this.widgetContainer.find('i').eq(1).css('top', `${100 * (1 - h)}%`);
            this.widgetContainer.find('i').eq(2).css('top', `${100 * (1 - a)}%`);

            this.renderColorPreview();
            _logger.debug("Widget display refreshed.");
        },

        setChromaValue: function(newChromaString) {
            this.currentChroma = new ChromaObject(newChromaString);
            const { h, s, b, a } = this.currentChroma.internalComponents;

            this.widgetContainer.find('i').eq(0).css({
                left: `${s * 100}%`,
                top: `${100 - b * 100}%`
            });
            this.widgetContainer.find('i').eq(1).css('top', `${100 * (1 - h)}%`);
            this.widgetContainer.find('i').eq(2).css('top', `${100 * (1 - a)}%`);

            this.renderColorPreview();
            this.targetElement.trigger({
                type: 'chroma:changed',
                currentChroma: this.currentChroma
            });
            _logger.debug("Chroma value set programmatically:", newChromaString);
        },

        concealWidget: function(eventObj) {
            if (eventObj && _jq(eventObj.target).closest('.colorpicker').length) {
                _logger.debug("Click originated within the widget, not hiding.");
                return;
            }

            this.widgetContainer.hide();
            _jq(window).off('resize.spectrumWidget', this.positionWidget);
            _jq(document).off('mousedown.spectrumWidget', this.concealWidget);

            const formattedColor = this.displayFormatFunction.call(this);
            if (!this.isInputField) {
                if (this.triggerComponent && this.triggerComponent.length) {
                    this.targetElement.find('input').prop('value', formattedColor);
                }
                this.targetElement.data('color', formattedColor);
            } else {
                this.targetElement.prop('value', formattedColor);
            }

            this.targetElement.trigger({
                type: 'spectrum:closed',
                currentChroma: this.currentChroma
            });
            _logger.debug("Widget concealed.");
        },

        positionWidget: function() {
            const elementOffset = (this.triggerComponent && this.triggerComponent.length) ? this.triggerComponent.offset() : this.targetElement.offset();
            this.widgetContainer.css({
                top: elementOffset.top + this.widgetHeight,
                left: elementOffset.left
            });
            _logger.debug("Widget positioned at:", elementOffset.top + this.widgetHeight, elementOffset.left);
        },

        renderColorPreview: function() {
            try {
                this.colorPreviewArea.backgroundColor = this.displayFormatFunction.call(this);
            } catch (e) {
                _logger.error("Error rendering preview with specified format, falling back to hex:", e);
                this.colorPreviewArea.backgroundColor = this.currentChroma.getHexCode();
            }
            
            this.baseColorArea.backgroundColor = this.currentChroma.getHexCode(this.currentChroma.internalComponents.h, 1, 1, 1);
            
            if (this.alphaStyleRef) {
                this.alphaStyleRef.backgroundColor = this.currentChroma.getHexCode();
            }
            _logger.debug("Color previews rendered.");
        },

        dragHandler: null,
        activeSlider: null,

        handleMouseDown: function(eventObj) {
            eventObj.stopPropagation();
            eventObj.preventDefault();
            
            const eventTarget = _jq(eventObj.target);
            const interactionZone = eventTarget.closest('div');

            if (!interactionZone.hasClass('colorpicker')) {
                let sliderConfiguration;

                if (interactionZone.hasClass('colorpicker-saturation')) {
                    sliderConfiguration = Object.assign({}, GlobalChromaDefs.sliderConfig.saturationSlider);
                } else if (interactionZone.hasClass('colorpicker-hue')) {
                    sliderConfiguration = Object.assign({}, GlobalChromaDefs.sliderConfig.hueSlider);
                } else if (interactionZone.hasClass('colorpicker-alpha')) {
                    sliderConfiguration = Object.assign({}, GlobalChromaDefs.sliderConfig.alphaSlider);
                } else {
                    _logger.debug("Mousedown not on a slider zone.");
                    return false;
                }
                
                this.activeSlider = sliderConfiguration;
                const zoneOffset = interactionZone.offset();
                
                this.activeSlider.sliderKnobStyle = interactionZone.find('i').get(0).style;
                this.activeSlider.initialLeft = eventObj.pageX - zoneOffset.left;
                this.activeSlider.initialTop = eventObj.pageY - zoneOffset.top;
                
                this.dragHandler = {
                    startX: eventObj.pageX,
                    startY: eventObj.pageY
                };

                _jq(document).on({
                    'mousemove.spectrumWidget': this.handleMouseMove.bind(this),
                    'mouseup.spectrumWidget': this.handleMouseUp.bind(this)
                });
                
                this.handleMouseMove(eventObj);
            }
            return false;
        },

        handleMouseMove: function(eventObj) {
            eventObj.stopPropagation();
            eventObj.preventDefault();

            if (!this.activeSlider) {
                _logger.warn("MouseMove event without an active slider context.");
                return false;
            }

            const newLeftPos = GlobalChromaDefs.clamp(
                this.activeSlider.initialLeft + ((eventObj.pageX || this.dragHandler.startX) - this.dragHandler.startX),
                0,
                this.activeSlider.maxHorizontal
            );
            const newTopPos = GlobalChromaDefs.clamp(
                this.activeSlider.initialTop + ((eventObj.pageY || this.dragHandler.startY) - this.dragHandler.startY),
                0,
                this.activeSlider.maxVertical
            );
            
            this.activeSlider.sliderKnobStyle.left = `${newLeftPos}px`;
            this.activeSlider.sliderKnobStyle.top = `${newTopPos}px`;
            
            if (this.activeSlider.horizontalUpdateMethod) {
                this.currentChroma[this.activeSlider.horizontalUpdateMethod](newLeftPos / 100);
            }
            if (this.activeSlider.verticalUpdateMethod) {
                this.currentChroma[this.activeSlider.verticalUpdateMethod](newTopPos / 100);
            }
            
            this.renderColorPreview();
            this.targetElement.trigger({
                type: 'chroma:changed',
                currentChroma: this.currentChroma
            });
            return false;
        },

        handleMouseUp: function(eventObj) {
            eventObj.stopPropagation();
            eventObj.preventDefault();
            
            _jq(document).off('mousemove.spectrumWidget', this.handleMouseMove);
            _jq(document).off('mouseup.spectrumWidget', this.handleMouseUp);
            
            this.activeSlider = null;
            this.dragHandler = null;
            _logger.debug("MouseUp: Drag operation ended.");
            return false;
        },

        destroy: function() {
            this.targetElement.off('.spectrumWidget');
            if (this.triggerComponent && this.triggerComponent.length) {
                 this.triggerComponent.off('.spectrumWidget');
            }

            _jq(window).off('resize.spectrumWidget', this.positionWidget);
            _jq(document).off('mousedown.spectrumWidget', this.concealWidget);
            _jq(document).off('mousemove.spectrumWidget', this.handleMouseMove);
            _jq(document).off('mouseup.spectrumWidget', this.handleMouseUp);

            this.widgetContainer.remove();
            
            this.targetElement.removeData('spectrumWidget');
            _logger.debug("SpectrumWidget destroyed for element:", this.targetElement);
        }
    };

    // jQuery plugin definition
    _jq.fn.spectrumWidget = function(actionOrOptions, actionValue) {
        return this.each(function() {
            const $this = _jq(this);
            let widgetInstance = $this.data('spectrumWidget');
            const options = typeof actionOrOptions === 'object' && actionOrOptions;

            if (!widgetInstance) {
                const mergedOptions = _jq.extend({}, _jq.fn.spectrumWidget.defaultSettings, options);
                widgetInstance = new SpectrumWidget(this, mergedOptions);
                $this.data('spectrumWidget', widgetInstance);
                _logger.debug("New SpectrumWidget instance created for:", this);
            }

            if (typeof actionOrOptions === 'string' && widgetInstance[actionOrOptions]) {
                widgetInstance[actionOrOptions](actionValue);
                _logger.debug(`Method "${actionOrOptions}" called on SpectrumWidget for:`, this);
            } else if (typeof actionOrOptions === 'string' && !widgetInstance[actionOrOptions]) {
                _logger.warn(`Attempted to call non-existent method "${actionOrOptions}" on SpectrumWidget.`);
            }
        });
    };

    // Default settings for the plugin
    _jq.fn.spectrumWidget.defaultSettings = {
        displayFormat: 'hex',
        defaultColor: '#000000',
        debugMode: false
    };
    
    _jq.fn.spectrumWidget.WidgetConstructor = SpectrumWidget;

    // --- Global Chroma Definitions (Utilities and Constants) ---
    const GlobalChromaDefs = {

        formatTranslators: {
            'rgbString': function() {
                const { red, green, blue } = this.currentChroma.getRGBComponents();
                return `rgb(${red}, ${green}, ${blue})`;
            },
            
            'rgbaString': function() {
                const { red, green, blue, opacity } = this.currentChroma.getRGBComponents();
                return `rgba(${red}, ${green}, ${blue}, ${opacity.toFixed(2)})`;
            },
            
            'hslString': function() {
                const { hue, saturation, lightness } = this.currentChroma.getHSLComponents();
                return `hsl(${Math.round(hue * 360)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
            },
            
            'hslaString': function() {
                const { hue, saturation, lightness, opacity } = this.currentChroma.getHSLComponents();
                return `hsla(${Math.round(hue * 360)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%, ${opacity.toFixed(2)})`;
            },
            
            'hex': function() {
                return this.currentChroma.getHexCode();
            }
        },
        
        sliderConfig: {
            'saturationSlider': {
                maxHorizontal: 100,
                maxVertical: 100,
                horizontalUpdateMethod: 'adjustSaturation',
                verticalUpdateMethod: 'adjustBrightness'
            },
            
            'hueSlider': {
                maxHorizontal: 0,
                maxVertical: 100,
                horizontalUpdateMethod: false,
                verticalUpdateMethod: 'adjustHue'
            },
            
            'alphaSlider': {
                maxHorizontal: 0,
                maxVertical: 100,
                horizontalUpdateMethod: false,
                verticalUpdateMethod: 'adjustOpacity'
            }
        },
        
        convertRGBtoHSB: function (red, green, blue, alphaVal = 1){
            red /= 255;
            green /= 255;
            blue /= 255;

            const brightness = Math.max(red, green, blue);
            const chroma = brightness - Math.min(red, green, blue);
            
            let hue = 0;
            if (chroma !== 0) {
                if (brightness === red) {
                    hue = (green - blue) / chroma;
                } else if (brightness === green) {
                    hue = (blue - red) / chroma + 2;
                } else {
                    hue = (red - green) / chroma + 4;
                }
                hue = (hue + 6) % 6 * 60 / 360;
            }

            const saturation = brightness === 0 ? 0 : chroma / brightness;
            
            return {
                hue: hue || 0,
                saturation: saturation,
                brightness: brightness,
                alpha: GlobalChromaDefs.clamp(alphaVal, 0, 1)
            };
        },
        
        calculateHueComponent: function (pVal, qVal, hVal) {
            if (hVal < 0) hVal += 1;
            if (hVal > 1) hVal -= 1;

            if ((hVal * 6) < 1) return pVal + (qVal - pVal) * hVal * 6;
            if ((hVal * 2) < 1) return qVal;
            if ((hVal * 3) < 2) return pVal + (qVal - pVal) * ((2 / 3) - hVal) * 6;
            return pVal;
        },
    
        convertHSLtoRGB: function (hueVal, satVal, lightnessVal, alphaVal = 1) {
            const clampedSat = GlobalChromaDefs.clamp(satVal, 0, 1);
            const clampedLight = GlobalChromaDefs.clamp(lightnessVal, 0, 1);

            let intermediateQ;
            if (clampedLight <= 0.5) {
                intermediateQ = clampedLight * (1 + clampedSat);
            } else {
                intermediateQ = clampedLight + clampedSat - (clampedLight * clampedSat);
            }
            
            const intermediateP = 2 * clampedLight - intermediateQ;

            const tempR = hueVal + (1 / 3);
            const tempG = hueVal;
            const tempB = hueVal - (1 / 3);

            const finalR = Math.round(GlobalChromaDefs.calculateHueComponent(intermediateP, intermediateQ, tempR) * 255);
            const finalG = Math.round(GlobalChromaDefs.calculateHueComponent(intermediateP, intermediateQ, tempG) * 255);
            const finalB = Math.round(GlobalChromaDefs.calculateHueComponent(intermediateP, intermediateQ, tempB) * 255);
            
            return [finalR, finalG, finalB, GlobalChromaDefs.clamp(alphaVal, 0, 1)];
        },
        
        parserCollection: [
            {
                regexPattern: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)/,
                parseMatch: function(matchResult) {
                    return [
                        parseInt(matchResult[1], 10),
                        parseInt(matchResult[2], 10),
                        parseInt(matchResult[3], 10),
                        matchResult[4] ? parseFloat(matchResult[4]) : 1
                    ];
                },
                colorSpace: 'rgba'
            },
            {
                regexPattern: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d*\.?\d+)\s*)?\)/,
                parseMatch: function(matchResult) {
                    return [
                        Math.round(2.55 * parseFloat(matchResult[1])),
                        Math.round(2.55 * parseFloat(matchResult[2])),
                        Math.round(2.55 * parseFloat(matchResult[3])),
                        matchResult[4] ? parseFloat(matchResult[4]) : 1
                    ];
                },
                colorSpace: 'rgba'
            },
            {
                regexPattern: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d*\.?\d+)\s*)?\)/,
                parseMatch: function(matchResult) {
                    return [
                        parseFloat(matchResult[1]) / 360,
                        parseFloat(matchResult[2]) / 100,
                        parseFloat(matchResult[3]) / 100,
                        matchResult[4] ? parseFloat(matchResult[4]) : 1
                    ];
                },
                colorSpace: 'hsla'
            },
            {
                regexPattern: /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                parseMatch: function(matchResult) {
                    return [
                        parseInt(matchResult[1], 16),
                        parseInt(matchResult[2], 16),
                        parseInt(matchResult[3], 16),
                        1
                    ];
                },
                colorSpace: 'hex'
            },
            {
                regexPattern: /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
                parseMatch: function(matchResult) {
                    return [
                        parseInt(matchResult[1] + matchResult[1], 16),
                        parseInt(matchResult[2] + matchResult[2], 16),
                        parseInt(matchResult[3] + matchResult[3], 16),
                        1
                    ];
                },
                colorSpace: 'hex'
            }
        ],

        clamp: (value, min, max) => Math.max(min, Math.min(value, max)),

        toTwoDigitHex: (value) => {
            const hex = Math.round(GlobalChromaDefs.clamp(value, 0, 255)).toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        },

        widgetTemplate: `
            <div class="colorpicker dropdown-menu">
                <div class="colorpicker-saturation"><i><b></b></i></div>
                <div class="colorpicker-hue"><i></i></div>
                <div class="colorpicker-alpha"><i></i></div>
                <div class="colorpicker-color"><div style="background-color: rgb(0, 0, 0);"></div></div>
            </div>
        `
    };

    Object.defineProperty(_jq.fn.spectrumWidget.defaultSettings, 'debugMode', {
        get: function() { return _logger.debugEnabled; },
        set: function(value) { _logger.debugEnabled = !!value; }
    });

})(jQuery);