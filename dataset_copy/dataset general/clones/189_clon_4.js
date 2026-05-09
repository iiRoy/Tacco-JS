(function(window, document, jQueryRef) {

    // --- Utility Functions and Constants (replacing CPGlobal) ---

    const colorValueAdjuster = { // Renamed from CPGlobal.stringParsers
        codeExpressions: [
            {
                pattern: /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/,
                process: function(captureResults) {
                    return {
                        red: parseInt(captureResults[1], 10),
                        green: parseInt(captureResults[2], 10),
                        blue: parseInt(captureResults[3], 10),
                        alpha: parseFloat(captureResults[4] || 1)
                    };
                }
            }, {
                pattern: /^rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/,
                process: function(captureResults) {
                    return {
                        red: Math.round(2.55 * parseFloat(captureResults[1])),
                        green: Math.round(2.55 * parseFloat(captureResults[2])),
                        blue: Math.round(2.55 * parseFloat(captureResults[3])),
                        alpha: parseFloat(captureResults[4] || 1)
                    };
                }
            }, { // Added hex 3, 6, 8 digit support for robustness, although original only explicitly parses RGB/A.
                pattern: /^#([0-9a-fA-F]{3})$/,
                process: function(captureResults) {
                    const hex = captureResults[1];
                    return {
                        red: parseInt(hex[0] + hex[0], 16),
                        green: parseInt(hex[1] + hex[1], 16),
                        blue: parseInt(hex[2] + hex[2], 16),
                        alpha: 1
                    };
                }
            }, {
                pattern: /^#([0-9a-fA-F]{6})$/,
                process: function(captureResults) {
                    const hex = captureResults[1];
                    return {
                        red: parseInt(hex.substring(0, 2), 16),
                        green: parseInt(hex.substring(2, 4), 16),
                        blue: parseInt(hex.substring(4, 6), 16),
                        alpha: 1
                    };
                }
            }, {
                pattern: /^#([0-9a-fA-F]{8})$/,
                process: function(captureResults) {
                    const hex = captureResults[1];
                    return {
                        red: parseInt(hex.substring(0, 2), 16),
                        green: parseInt(hex.substring(2, 4), 16),
                        blue: parseInt(hex.substring(4, 6), 16),
                        alpha: parseInt(hex.substring(6, 8), 16) / 255
                    };
                }
            }, {
                pattern: /^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/,
                process: function(captureResults) {
                    const h = parseFloat(captureResults[1]) / 360;
                    const s = parseFloat(captureResults[2]) / 100;
                    const l = parseFloat(captureResults[3]) / 100;
                    const a = parseFloat(captureResults[4] || 1);
                    const rgb = colorValueAdjuster.hslToRgbConverter(h, s, l);
                    return {
                        red: rgb.r,
                        green: rgb.g,
                        blue: rgb.b,
                        alpha: a
                    };
                }
            }
        ],

        // Renamed from CPGlobal.RGBtoHSB
        rgbToHsbConverter: function(red, green, blue, alpha) {
            red /= 255;
            green /= 255;
            blue /= 255;

            let h_val, s_val, b_val, chroma;
            b_val = Math.max(red, green, blue);
            chroma = b_val - Math.min(red, green, blue);
            h_val = (chroma === 0 ? null :
                b_val === red ? (green - blue) / chroma :
                b_val === green ? (blue - red) / chroma + 2 :
                (red - green) / chroma + 4
            );
            h_val = ((h_val + 360) % 6) * 60 / 360;
            s_val = chroma === 0 ? 0 : chroma / b_val;
            return {
                h: h_val || 1,
                s: s_val,
                b: b_val,
                a: alpha || 1
            };
        },

        // Renamed from CPGlobal.HueToRGB
        calculateHueComponent: function(param_p, param_q, hue_val) {
            if (hue_val < 0) hue_val += 1;
            else if (hue_val > 1) hue_val -= 1;

            if ((hue_val * 6) < 1) return param_p + (param_q - param_p) * hue_val * 6;
            else if ((hue_val * 2) < 1) return param_q;
            else if ((hue_val * 3) < 2) return param_p + (param_q - param_p) * ((2 / 3) - hue_val) * 6;
            else return param_p;
        },

        // Renamed from CPGlobal.HSLtoRGB
        hslToRgbConverter: function(h_val, s_val, l_val, a_val) {
            if (s_val < 0) {
                s_val = 0;
            }
            let q_val;
            if (l_val <= 0.5) {
                q_val = l_val * (1 + s_val);
            } else {
                q_val = l_val + s_val - (l_val * s_val);
            }

            const p_val = 2 * l_val - q_val;

            const tr_val = h_val + (1 / 3);
            const tg_val = h_val;
            const tb_val = h_val - (1 / 3);

            const r_out = Math.round(colorValueAdjuster.calculateHueComponent(p_val, q_val, tr_val) * 255);
            const g_out = Math.round(colorValueAdjuster.calculateHueComponent(p_val, q_val, tg_val) * 255);
            const b_out = Math.round(colorValueAdjuster.calculateHueComponent(p_val, q_val, tb_val) * 255);
            return {
                r: r_out,
                g: g_out,
                b: b_out,
                a: a_val || 1
            };
        }
    };

    // --- Spectral Handler (replaces Color object) ---

    const createSpectralHandler = function(initialRepresentation) {
        const spectralData = {
            hueComponent: 1, // h
            saturationAspect: 1, // s
            brightnessLevel: 1, // b
            transparencyFactor: 1 // a
        };

        const handler = {
            // Renamed from Color.setColor
            assimilateInput: function(representationString) {
                representationString = representationString.toLowerCase();
                let parsedRgb = null;

                for (let i = 0; i < colorValueAdjuster.codeExpressions.length; i++) {
                    const matcher = colorValueAdjuster.codeExpressions[i];
                    const matchResult = matcher.pattern.exec(representationString);
                    if (matchResult) {
                        const processed = matcher.process(matchResult);
                        if (representationString.includes('hsl')) { // If it was HSL, it's already converted to RGB by the parser.
                            parsedRgb = processed;
                        } else { // Assume RGB or Hex
                            parsedRgb = processed;
                        }
                        break;
                    }
                }

                if (parsedRgb) {
                    const hsbEquivalent = colorValueAdjuster.rgbToHsbConverter(
                        parsedRgb.red,
                        parsedRgb.green,
                        parsedRgb.blue,
                        parsedRgb.alpha
                    );
                    spectralData.hueComponent = hsbEquivalent.h;
                    spectralData.saturationAspect = hsbEquivalent.s;
                    spectralData.brightnessLevel = hsbEquivalent.b;
                    spectralData.transparencyFactor = hsbEquivalent.a;
                }
            },

            // Renamed from Color.setHue
            adjustWavelength: function(h_val) {
                spectralData.hueComponent = 1 - h_val;
            },

            // Renamed from Color.setSaturation
            modifyColorfulness: function(s_val) {
                spectralData.saturationAspect = s_val;
            },

            // Renamed from Color.setLightness
            alterValueMagnitude: function(b_val) {
                spectralData.brightnessLevel = 1 - b_val;
            },

            // Renamed from Color.setAlpha
            setOpacityLevel: function(a_val) {
                spectralData.transparencyFactor = parseFloat(((1 - a_val) * 100).toFixed(2)) / 100;
            },

            // Renamed from Color.toRGB
            convertSpectralToRGB: function(h_arg, s_arg, b_arg, a_arg) {
                let h = h_arg !== undefined ? h_arg : spectralData.hueComponent;
                let s = s_arg !== undefined ? s_arg : spectralData.saturationAspect;
                let b = b_arg !== undefined ? b_arg : spectralData.brightnessLevel;
                let a = a_arg !== undefined ? a_arg : spectralData.transparencyFactor;

                h *= 360;
                let R_comp, G_comp, B_comp, X_val, C_val;
                h = (h % 360) / 60;
                C_val = b * s;
                X_val = C_val * (1 - Math.abs(h % 2 - 1));
                R_comp = G_comp = B_comp = b - C_val;

                h = ~~h;
                R_comp += [C_val, X_val, 0, 0, X_val, C_val][h];
                G_comp += [X_val, C_val, C_val, X_val, 0, 0][h];
                B_comp += [0, 0, X_val, C_val, C_val, X_val][h];
                return {
                    r: Math.round(R_comp * 255),
                    g: Math.round(G_comp * 255),
                    b: Math.round(B_comp * 255),
                    a: a
                };
            },

            // Renamed from Color.toHex
            deriveHexCode: function(h_arg, s_arg, b_arg, a_arg) {
                const rgb = this.convertSpectralToRGB(h_arg, s_arg, b_arg, a_arg);
                const toHexDigit = (c) => ('0' + Math.max(0, Math.min(255, c)).toString(16)).slice(-2);
                return '#' + toHexDigit(rgb.r) + toHexDigit(rgb.g) + toHexDigit(rgb.b);
            },

            // Renamed from Color.toHSL
            transformToHSL: function(h_arg, s_arg, b_arg, a_arg) {
                let h = h_arg !== undefined ? h_arg : spectralData.hueComponent;
                let s = s_arg !== undefined ? s_arg : spectralData.saturationAspect;
                let b = b_arg !== undefined ? b_arg : spectralData.brightnessLevel;
                let a = a_arg !== undefined ? a_arg : spectralData.transparencyFactor;

                let H_out = h,
                    L_out = (2 - s) * b,
                    S_out = s * b;
                if (L_out > 0 && L_out <= 1) {
                    S_out /= L_out;
                } else {
                    S_out /= (2 - L_out);
                }
                L_out /= 2;
                if (S_out > 1) {
                    S_out = 1;
                }
                return {
                    h: H_out,
                    s: S_out,
                    l: L_out,
                    a: a
                };
            },

            getCurrentSpectralData: function() {
                return { ...spectralData
                };
            }
        };

        handler.assimilateInput(initialRepresentation);
        return handler;
    };

    // --- Chromatic Panel (replaces Colorpicker object) ---

    // Renamed from CPGlobal.sliders
    const controlDefinitions = {
        chromaticity: { // saturation
            maximumLeft: 100,
            maximumTop: 100,
            leftCallback: 'modifyColorfulness',
            topCallback: 'alterValueMagnitude'
        },
        wavelength: { // hue
            maximumLeft: 0,
            maximumTop: 100,
            leftCallback: false,
            topCallback: 'adjustWavelength'
        },
        transparency: { // alpha
            maximumLeft: 0,
            maximumTop: 100,
            leftCallback: false,
            topCallback: 'setOpacityLevel'
        }
    };

    // Renamed from CPGlobal.translateFormats
    const outputFormatters = {
        'rgb': function() {
            const rgb = this.currentSpectralHandler.convertSpectralToRGB();
            return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        },
        'rgba': function() {
            const rgb = this.currentSpectralHandler.convertSpectralToRGB();
            return `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
        },
        'hsl': function() {
            const hsl = this.currentSpectralHandler.transformToHSL();
            return `hsl(${Math.round(hsl.h*360)},${Math.round(hsl.s*100)}%,${Math.round(hsl.l*100)}%)`;
        },
        'hsla': function() {
            const hsl = this.currentSpectralHandler.transformToHSL();
            return `hsla(${Math.round(hsl.h*360)},${Math.round(hsl.s*100)}%,${Math.round(hsl.l*100)}%,${hsl.a})`;
        },
        'hex': function() {
            return this.currentSpectralHandler.deriveHexCode();
        }
    };

    const generateChromaticPanel = function(targetNode, configuration) {
        const instance = {
            targetNode: targetNode,
            outputRenderingScheme: outputFormatters[configuration.format || jQueryRef(targetNode).data('color-format') || 'hex'],
            isDirectInput: jQueryRef(targetNode).is('input'),
            triggerElement: jQueryRef(targetNode).is('.color') ? jQueryRef(targetNode).find('.input-group-addon') : null,
            panelContainer: null,
            visualSampleElement: null,
            baseColorElement: null,
            opacityElement: null,
            currentSpectralHandler: null,
            componentHeight: 0,
            activeSlider: null,
            initialPointerPosition: null
        };

        const panelTemplate = `
            <div class="colorpicker dropdown-menu">
                <div class="colorpicker-saturation">
                    <i><b></b></i>
                </div>
                <div class="colorpicker-hue">
                    <i></i>
                </div>
                <div class="colorpicker-alpha">
                    <i></i>
                </div>
                <div class="colorpicker-color"><div /></div>
            </div>
        `;

        instance.panelContainer = jQueryRef(panelTemplate)
            .appendTo('body')
            .on('mousedown', instance.initiateInteraction.bind(instance));

        if (instance.isDirectInput) {
            instance.targetNode.addEventListener('focus', instance.unveilPanel.bind(instance));
            instance.targetNode.addEventListener('keyup', instance.refreshPanel.bind(instance));
        } else if (instance.triggerElement && instance.triggerElement.length) {
            instance.triggerElement.on('click', instance.unveilPanel.bind(instance));
        } else {
            instance.targetNode.addEventListener('click', instance.unveilPanel.bind(instance));
        }

        if (configuration.format === 'rgba' || configuration.format === 'hsla') {
            instance.panelContainer.addClass('alpha');
            instance.opacityElement = instance.panelContainer.find('.colorpicker-alpha')[0].style;
        }

        if (instance.triggerElement && instance.triggerElement.length) {
            instance.panelContainer.find('.colorpicker-color').hide();
            instance.visualSampleElement = jQueryRef(instance.targetNode).find('i')[0].style;
        } else {
            instance.visualSampleElement = instance.panelContainer.find('div:last')[0].style;
        }

        instance.baseColorElement = instance.panelContainer.find('div:first')[0].style;
        instance.refreshPanel();

        // Methods for the panel
        instance.unveilPanel = function(evt) {
            instance.panelContainer.show();
            instance.componentHeight = instance.triggerElement ? instance.triggerElement.outerHeight() : jQueryRef(instance.targetNode).outerHeight();
            instance.positionPanel();
            jQueryRef(window).on('resize', instance.positionPanel.bind(instance));
            if (!instance.isDirectInput) {
                if (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            }
            jQueryRef(document).on('mousedown', instance.concealPanel.bind(instance));
            jQueryRef(instance.targetNode).trigger({
                type: 'show',
                color: instance.currentSpectralHandler
            });
        };

        instance.refreshPanel = function() {
            const inputVal = instance.isDirectInput ? jQueryRef(instance.targetNode).prop('value') : jQueryRef(instance.targetNode).data('color');
            instance.currentSpectralHandler = createSpectralHandler(inputVal);
            const {
                hueComponent,
                saturationAspect,
                brightnessLevel,
                transparencyFactor
            } = instance.currentSpectralHandler.getCurrentSpectralData();

            instance.panelContainer.find('i')
                .eq(0).css({
                    left: saturationAspect * 100,
                    top: 100 - brightnessLevel * 100
                }).end()
                .eq(1).css('top', 100 * (1 - hueComponent)).end()
                .eq(2).css('top', 100 * (1 - transparencyFactor));
            instance.updateVisualSample();
        };

        instance.applyNewColor = function(newColorValue) {
            instance.currentSpectralHandler = createSpectralHandler(newColorValue);
            const {
                hueComponent,
                saturationAspect,
                brightnessLevel,
                transparencyFactor
            } = instance.currentSpectralHandler.getCurrentSpectralData();

            instance.panelContainer.find('i')
                .eq(0).css({
                    left: saturationAspect * 100,
                    top: 100 - brightnessLevel * 100
                }).end()
                .eq(1).css('top', 100 * (1 - hueComponent)).end()
                .eq(2).css('top', 100 * (1 - transparencyFactor));
            instance.updateVisualSample();
            jQueryRef(instance.targetNode).trigger({
                type: 'changeColor',
                color: instance.currentSpectralHandler
            });
        };

        instance.concealPanel = function() {
            instance.panelContainer.hide();
            jQueryRef(window).off('resize', instance.positionPanel);
            if (!instance.isDirectInput) {
                jQueryRef(document).off('mousedown', instance.concealPanel);
                if (instance.triggerElement) {
                    jQueryRef(instance.targetNode).find('input').prop('value', instance.outputRenderingScheme.call(instance));
                }
                jQueryRef(instance.targetNode).data('color', instance.outputRenderingScheme.call(instance));
            } else {
                jQueryRef(instance.targetNode).prop('value', instance.outputRenderingScheme.call(instance));
            }
            jQueryRef(instance.targetNode).trigger({
                type: 'hide',
                color: instance.currentSpectralHandler
            });
        };

        instance.positionPanel = function() {
            const offset = instance.triggerElement ? instance.triggerElement.offset() : jQueryRef(instance.targetNode).offset();
            instance.panelContainer.css({
                top: offset.top + instance.componentHeight,
                left: offset.left
            });
        };

        instance.updateVisualSample = function() {
            try {
                instance.visualSampleElement.backgroundColor = instance.outputRenderingScheme.call(instance);
            } catch (e) {
                instance.visualSampleElement.backgroundColor = instance.currentSpectralHandler.deriveHexCode();
            }
            instance.baseColorElement.backgroundColor = instance.currentSpectralHandler.deriveHexCode(instance.currentSpectralHandler.getCurrentSpectralData().hueComponent, 1, 1, 1);
            if (instance.opacityElement) {
                instance.opacityElement.backgroundColor = instance.currentSpectralHandler.deriveHexCode();
            }
        };

        instance.initiateInteraction = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            const interactionTarget = jQueryRef(evt.target);
            const containingZone = interactionTarget.closest('div');

            if (!containingZone.is('.colorpicker')) {
                if (containingZone.is('.colorpicker-saturation')) {
                    instance.activeSlider = { ...controlDefinitions.chromaticity
                    };
                } else if (containingZone.is('.colorpicker-hue')) {
                    instance.activeSlider = { ...controlDefinitions.wavelength
                    };
                } else if (containingZone.is('.colorpicker-alpha')) {
                    instance.activeSlider = { ...controlDefinitions.transparency
                    };
                } else {
                    return false;
                }
                const zoneOffset = containingZone.offset();
                instance.activeSlider.knob = containingZone.find('i')[0].style;
                instance.activeSlider.offsetX = evt.pageX - zoneOffset.left;
                instance.activeSlider.offsetY = evt.pageY - zoneOffset.top;
                instance.initialPointerPosition = {
                    x: evt.pageX,
                    y: evt.pageY
                };
                jQueryRef(document).on({
                    'mousemove': instance.trackInteraction.bind(instance),
                    'mouseup': instance.concludeInteraction.bind(instance)
                }).trigger('mousemove');
            }
            return false;
        };

        instance.trackInteraction = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            const newLeft = Math.max(
                0,
                Math.min(
                    instance.activeSlider.maximumLeft,
                    instance.activeSlider.offsetX + ((evt.pageX || instance.initialPointerPosition.x) - instance.initialPointerPosition.x)
                )
            );
            const newTop = Math.max(
                0,
                Math.min(
                    instance.activeSlider.maximumTop,
                    instance.activeSlider.offsetY + ((evt.pageY || instance.initialPointerPosition.y) - instance.initialPointerPosition.y)
                )
            );

            instance.activeSlider.knob.left = newLeft + 'px';
            instance.activeSlider.knob.top = newTop + 'px';

            if (instance.activeSlider.leftCallback) {
                instance.currentSpectralHandler[instance.activeSlider.leftCallback].call(instance.currentSpectralHandler, newLeft / 100);
            }
            if (instance.activeSlider.topCallback) {
                instance.currentSpectralHandler[instance.activeSlider.topCallback].call(instance.currentSpectralHandler, newTop / 100);
            }
            instance.updateVisualSample();
            jQueryRef(instance.targetNode).trigger({
                type: 'changeColor',
                color: instance.currentSpectralHandler
            });
            return false;
        };

        instance.concludeInteraction = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            jQueryRef(document).off({
                'mousemove': instance.trackInteraction,
                'mouseup': instance.concludeInteraction
            });
            return false;
        };

        return instance;
    };

    // --- jQuery Plugin Integration (replaces $.fn.colorpicker) ---

    jQueryRef.fn.fancyColorControl = function(operation, parameter) {
        return this.each(function() {
            const currentElement = jQueryRef(this);
            let instanceData = currentElement.data('fancyColorControl');
            const setupOptions = typeof operation === 'object' && operation;

            if (!instanceData) {
                currentElement.data('fancyColorControl', (instanceData = generateChromaticPanel(this, jQueryRef.extend({}, jQueryRef.fn.fancyColorControl.defaults, setupOptions))));
            }
            if (typeof operation === 'string') instanceData[operation](parameter);
        });
    };

    jQueryRef.fn.fancyColorControl.defaults = {};
    jQueryRef.fn.fancyColorControl.Constructor = generateChromaticPanel;

})(window, document, window.jQuery);