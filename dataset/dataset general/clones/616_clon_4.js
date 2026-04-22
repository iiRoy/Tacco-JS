var colorUtility = {};

(function () {
    "use strict";

    const colorMapping = {
        'aliceblue': 'F0F8FF', 'antiquewhite': 'FAEBD7', 'aqua': '00FFFF', 'aquamarine': '7FFFD4', 'azure': 'F0FFFF',
        'beige': 'F5F5DC', 'bisque': 'FFE4C4', 'black': '000000', 'blanchedalmond': 'FFEBCD', 'blue': '0000FF',
        'blueviolet': '8A2BE2', 'brown': 'A52A2A', 'burlywood': 'DEB887', 'cadetblue': '5F9EA0', 'chartreuse': '7FFF00',
        'chocolate': 'D2691E', 'coral': 'FF7F50', 'cornflowerblue': '6495ED', 'cornsilk': 'FFF8DC', 'crimson': 'DC143C',
        'cyan': '00FFFF', 'darkblue': '00008B', 'darkcyan': '008B8B', 'darkgoldenrod': 'B8860B', 'darkgray': 'A9A9A9',
        'darkgrey': 'A9A9A9', 'darkgreen': '006400', 'darkkhaki': 'BDB76B', 'darkmagenta': '8B008B', 'darkolivegreen': '556B2F',
        'darkorange': 'FF8C00', 'darkorchid': '9932CC', 'darkred': '8B0000', 'darksalmon': 'E9967A', 'darkseagreen': '8FBC8F',
        'darkslateblue': '483D8B', 'darkslategray': '2F4F4F', 'darkslategrey': '2F4F4F', 'darkturquoise': '00CED1',
        'darkviolet': '9400D3', 'deeppink': 'FF1493', 'deepskyblue': '00BFFF', 'dimgray': '696969', 'dimgrey': '696969',
        'dodgerblue': '1E90FF', 'firebrick': 'B22222', 'floralwhite': 'FFFAF0', 'forestgreen': '228B22', 'fuchsia': 'FF00FF',
        'gainsboro': 'DCDCDC', 'ghostwhite': 'F8F8FF', 'gold': 'FFD700', 'goldenrod': 'DAA520', 'gray': '808080',
        'grey': '808080', 'green': '008000', 'greenyellow': 'ADFF2F', 'honeydew': 'F0FFF0', 'hotpink': 'FF69B4',
        'indianred': 'CD5C5C', 'indigo': '4B0082', 'ivory': 'FFFFF0', 'khaki': 'F0E68C', 'lavender': 'E6E6FA',
        'lavenderblush': 'FFF0F5', 'lawngreen': '7CFC00', 'lemonchiffon': 'FFFACD', 'lightblue': 'ADD8E6', 'lightcoral': 'F08080',
        'lightcyan': 'E0FFFF', 'lightgoldenrodyellow': 'FAFAD2', 'lightgray': 'D3D3D3', 'lightgrey': 'D3D3D3',
        'lightgreen': '90EE90', 'lightpink': 'FFB6C1', 'lightsalmon': 'FFA07A', 'lightseagreen': '20B2AA', 'lightskyblue': '87CEFA',
        'lightslategray': '778899', 'lightslategrey': '778899', 'lightsteelblue': 'B0C4DE', 'lightyellow': 'FFFFE0',
        'lime': '00FF00', 'limegreen': '32CD32', 'linen': 'FAF0E6', 'magenta': 'FF00FF', 'maroon': '800000',
        'mediumaquamarine': '66CDAA', 'mediumblue': '0000CD', 'mediumorchid': 'BA55D3', 'mediumpurple': '9370D8',
        'mediumseagreen': '3CB371', 'mediumslateblue': '7B68EE', 'mediumspringgreen': '00FA9A', 'mediumturquoise': '48D1CC',
        'mediumvioletred': 'C71585', 'midnightblue': '191970', 'mintcream': 'F5FFFA', 'mistyrose': 'FFE4E1',
        'moccasin': 'FFE4B5', 'navajowhite': 'FFDEAD', 'navy': '000080', 'oldlace': 'FDF5E6', 'olive': '808000',
        'olivedrab': '6B8E23', 'orange': 'FFA500', 'orangered': 'FF4500', 'orchid': 'DA70D6', 'palegoldenrod': 'EEE8AA',
        'palegreen': '98FB98', 'paleturquoise': 'AFEEEE', 'palevioletred': 'D87093', 'papayawhip': 'FFEFD5',
        'peachpuff': 'FFDAB9', 'peru': 'CD853F', 'pink': 'FFC0CB', 'plum': 'DDA0DD', 'powderblue': 'B0E0E6',
        'purple': '800080', 'rebeccapurple': '663399', 'red': 'FF0000', 'rosybrown': 'BC8F8F', 'royalblue': '4169E1',
        'saddlebrown': '8B4513', 'salmon': 'FA8072', 'sandybrown': 'F4A460', 'seagreen': '2E8B57', 'seashell': 'FFF5EE',
        'sienna': 'A0522D', 'silver': 'C0C0C0', 'skyblue': '87CEEB', 'slateblue': '6A5ACD', 'slategray': '708090',
        'slategrey': '708090', 'snow': 'FFFAFA', 'springgreen': '00FF7F', 'steelblue': '4682B4', 'tan': 'D2B48C',
        'teal': '008080', 'thistle': 'D8BFD8', 'tomato': 'FF6347', 'turquoise': '40E0D0', 'violet': 'EE82EE',
        'wheat': 'F5DEB3', 'white': 'FFFFFF', 'whitesmoke': 'F5F5F5', 'yellow': 'FFFF00', 'yellowgreen': '9ACD32'
    };

    function limitRange(val, min, max) {
        return Math.max(min, Math.min(val, max));
    }

    function fillHexDigits(num, len) {
        let txt = num.toString(16).toUpperCase();
        while (txt.length < len) {
            txt = '0' + txt;
        }
        return txt;
    }

    class RgbData {
        constructor(r, g, b, a) {
            this.red = r;
            this.green = g;
            this.blue = b;
            this.alpha = a;
        }
    }

    class HsvData {
        constructor(h, s, v, a) {
            this.hue = h;
            this.saturation = s;
            this.value = v;
            this.alpha = a;
        }
        toRGB() {
            const { r, g, b } = ColourUnit._hsvToRgb(this.hue, this.saturation, this.value);
            return new RgbData(r, g, b, this.alpha);
        }
    }

    class HslData {
        constructor(h, s, l, a) {
            this.hue = h;
            this.saturation = s;
            this.lightness = l;
            this.alpha = a;
        }
        toRGB() {
            const { r, g, b } = ColourUnit._hslToRgb(this.hue, this.saturation, this.lightness);
            return new RgbData(r, g, b, this.alpha);
        }
    }

    class ColourUnit {
        constructor(r, g, b, a = 1) {
            this._r = limitRange(r, 0, 1);
            this._g = limitRange(g, 0, 1);
            this._b = limitRange(b, 0, 1);
            this._a = limitRange(a, 0, 1);
        }

        // --- Static Factory Methods (Parsing) ---

        static fromToken(input) {
            if (input === null || input === undefined) {
                return new ColourUnit(0, 0, 0, 0);
            }

            if (input instanceof ColourUnit) {
                return input.cloneUnit();
            }

            if (input instanceof RgbData) {
                return new ColourUnit(input.red, input.green, input.blue, input.alpha);
            }
            if (input instanceof HsvData) {
                const rgb = input.toRGB();
                return new ColourUnit(rgb.red, rgb.green, rgb.blue, rgb.alpha);
            }
            if (input instanceof HslData) {
                const rgb = input.toRGB();
                return new ColourUnit(rgb.red, rgb.green, rgb.blue, rgb.alpha);
            }

            if (Array.isArray(input)) {
                return ColourUnit._examineArray(input);
            }

            if (typeof input === 'string') {
                const normalizedInput = input.trim();
                let result = ColourUnit._examineName(normalizedInput);
                if (result) return result;
                result = ColourUnit._examineHex(normalizedInput);
                if (result) return result;
                result = ColourUnit._examineRgb(normalizedInput);
                if (result) return result;
                result = ColourUnit._examineHsl(normalizedInput);
                if (result) return result;
            }

            if (typeof input === 'object' && input !== null &&
                'red' in input && 'green' in input && 'blue' in input) {
                return new ColourUnit(input.red, input.green, input.blue, input.alpha);
            }
            
            return new ColourUnit(0, 0, 0, 1);
        }

        static _examineName(txt) {
            if (txt.toLowerCase() === 'transparent') {
                return new ColourUnit(0, 0, 0, 0);
            }
            const hexVal = colorMapping[txt.toLowerCase()];
            if (hexVal) {
                return ColourUnit._examineHex('#' + hexVal);
            }
            return null;
        }

        static _examineHex(txt) {
            const hexMatch = txt.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
            if (!hexMatch) return null;

            let hex = hexMatch[1];
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }

            const red = parseInt(hex.substring(0, 2), 16) / 255;
            const green = parseInt(hex.substring(2, 4), 16) / 255;
            const blue = parseInt(hex.substring(4, 6), 16) / 255;

            return new ColourUnit(red, green, blue, 1);
        }

        static _examineRgb(txt) {
            const rgbIntMatch = txt.match(/^rgba?\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)(,\s*(\d*\.?\d+)\s*)?\)$/i);
            const rgbPctMatch = txt.match(/^rgba?\((\s*\d*\.?\d+\%\s*,\s*\d*\.?\d+\%\s*,\s*\d*\.?\d+\%\s*)(,\s*(\d*\.?\d+)\s*)?\)$/i);

            let matches = rgbIntMatch || rgbPctMatch;
            if (!matches) return null;

            const values = matches[1].split(',').map(s => parseFloat(s));
            let alpha = matches[3] !== undefined ? parseFloat(matches[3]) : 1;

            if (rgbIntMatch) {
                return new ColourUnit(values[0] / 255, values[1] / 255, values[2] / 255, alpha);
            } else {
                return new ColourUnit(values[0] / 100, values[1] / 100, values[2] / 100, alpha);
            }
        }

        static _examineHsl(txt) {
            const hslMatch = txt.match(/^hsla?\((\s*\d*\.?\d+\s*,\s*\d*\.?\d+\%\s*,\s*\d*\.?\d+\%\s*)(,\s*(\d*\.?\d+)\s*)?\)$/i);
            if (!hslMatch) return null;

            const values = hslMatch[1].split(',').map(s => parseFloat(s));
            let alpha = hslMatch[3] !== undefined ? parseFloat(hslMatch[3]) : 1;

            const h = values[0];
            const s = values[1] / 100;
            const l = values[2] / 100;

            const resultRgb = ColourUnit._hslToRgb(h, s, l);
            return new ColourUnit(resultRgb.r, resultRgb.g, resultRgb.b, alpha);
        }

        static _examineArray(arr) {
            if (arr.length < 3) return null;
            return new ColourUnit(arr[0] / 255, arr[1] / 255, arr[2] / 255, arr.length > 3 ? arr[3] : 1);
        }

        // --- Internal Conversion Helpers ---

        static _hsvToRgb(h, s, v) {
            let r, g, b;
            let i = Math.floor(h / 60);
            let f = h / 60 - i;
            let p = v * (1 - s);
            let q = v * (1 - f * s);
            let t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return { r: r, g: g, b: b };
        }

        static _rgbToHsv(r, g, b) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            let h, s, v = max;

            if (delta === 0) {
                h = 0;
                s = 0;
            } else {
                s = delta / max;
                if (r === max) {
                    h = (g - b) / delta;
                } else if (g === max) {
                    h = 2 + (b - r) / delta;
                } else {
                    h = 4 + (r - g) / delta;
                }
                h *= 60;
                if (h < 0) h += 360;
            }
            return { h: h, s: s, v: v };
        }

        static _hslToRgb(h, s, l) {
            let r, g, b;

            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h / 360 + 1 / 3);
                g = hue2rgb(p, q, h / 360);
                b = hue2rgb(p, q, h / 360 - 1 / 3);
            }

            return { r: r, g: g, b: b };
        }

        static _rgbToHsl(r, g, b) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const delta = max - min;
                s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
                if (r === max) {
                    h = (g - b) / delta + (g < b ? 6 : 0);
                } else if (g === max) {
                    h = (b - r) / delta + 2;
                } else {
                    h = (r - g) / delta + 4;
                }
                h /= 6;
            }
            return { h: h * 360, s: s, l: l };
        }

        // --- Public Conversion Getters (return data objects or primitives) ---

        extractRgb() {
            return new RgbData(this._r, this._g, this._b, this._a);
        }

        extractHsv() {
            const { h, s, v } = ColourUnit._rgbToHsv(this._r, this._g, this._b);
            return new HsvData(h, s, v, this._a);
        }

        extractHsl() {
            const { h, s, l } = ColourUnit._rgbToHsl(this._r, this._g, this._b);
            return new HslData(h, s, l, this._a);
        }

        // --- Output Formats ---

        toHexCode(digits = 2) {
            const max = Math.pow(16, digits) - 1;
            if (this._a < 1) {
                return this.toRgbaForm();
            }
            return '#' +
                   fillHexDigits(Math.round(this._r * max), digits) +
                   fillHexDigits(Math.round(this._g * max), digits) +
                   fillHexDigits(Math.round(this._b * max), digits);
        }

        toRgbaForm() {
            const r = Math.round(this._r * 255);
            const g = Math.round(this._g * 255);
            const b = Math.round(this._b * 255);
            const a = limitRange(this._a, 0, 1);

            if (a === 1) {
                return `rgb(${r}, ${g}, ${b})`;
            }
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        toString() {
            return this.toRgbaForm();
        }

        // --- Manipulation Methods (return new ColourUnit instances) ---

        cloneUnit() {
            return new ColourUnit(this._r, this._g, this._b, this._a);
        }

        adjustHue(degrees) {
            const { hue, saturation, value } = this.extractHsv();
            let newH = (hue + degrees) % 360;
            if (newH < 0) newH += 360;
            const { r, g, b } = ColourUnit._hsvToRgb(newH, saturation, value);
            return new ColourUnit(r, g, b, this._a);
        }

        adjustValue(amount) { // This corresponds to original's devalueByAmount
            const { hue, saturation, value } = this.extractHsv();
            const newV = limitRange(value - amount, 0, 1);
            const { r, g, b } = ColourUnit._hsvToRgb(hue, saturation, newV);
            return new ColourUnit(r, g, b, this._a);
        }

        adjustLightness(amount) {
            const { hue, saturation, lightness } = this.extractHsl();
            const newL = limitRange(lightness + amount, 0, 1);
            const { r, g, b } = ColourUnit._hslToRgb(hue, saturation, newL);
            return new ColourUnit(r, g, b, this._a);
        }

        adjustSaturation(amount) {
            const { hue, saturation, lightness } = this.extractHsl();
            const newS = limitRange(saturation + amount, 0, 1);
            const { r, g, b } = ColourUnit._hslToRgb(hue, newS, lightness);
            return new ColourUnit(r, g, b, this._a);
        }

        combineWith(otherUnit, proportion) {
            const otherColor = ColourUnit.fromToken(otherUnit);
            const mixRatio = limitRange(proportion, 0, 1);
            
            const r = (this._r * (1 - mixRatio)) + (otherColor._r * mixRatio);
            const g = (this._g * (1 - mixRatio)) + (otherColor._g * mixRatio);
            const b = (this._b * (1 - mixRatio)) + (otherColor._b * mixRatio);
            const a = (this._a * (1 - mixRatio)) + (otherColor._a * mixRatio);

            return new ColourUnit(r, g, b, a);
        }

        computeBrightness() {
            return (this._r * 0.2126) + (this._g * 0.7152) + (this._b * 0.0722);
        }
    }

    colorUtility.ColourUnit = ColourUnit;
    colorUtility.RgbData = RgbData;
    colorUtility.HsvData = HsvData;
    colorUtility.HslData = HslData;

    colorUtility.create = function (input) {
        return ColourUnit.fromToken(input);
    };

    colorUtility.transparent = ColourUnit.fromToken('transparent');

    // Mimic the original's top-level methods which delegate.
    colorUtility.darken = function (input, amount) {
        return ColourUnit.fromToken(input).adjustLightness(-amount);
    };

    colorUtility.lighten = function (input, amount) {
        return ColourUnit.fromToken(input).adjustLightness(amount);
    };

    colorUtility.saturate = function (input, amount) {
        return ColourUnit.fromToken(input).adjustSaturation(amount);
    };

    colorUtility.desaturate = function (input, amount) {
        return ColourUnit.fromToken(input).adjustSaturation(-amount);
    };

    colorUtility.shiftHue = function (input, degrees) {
        return ColourUnit.fromToken(input).adjustHue(degrees);
    };

    colorUtility.blend = function (baseColor, overlayColor, alpha) {
        return ColourUnit.fromToken(baseColor).combineWith(overlayColor, alpha);
    };

    colorUtility.getLuminance = function (input) {
        return ColourUnit.fromToken(input).computeBrightness();
    };

    // Methods for getting specific color model representations
    colorUtility.toRGB = function(input) {
        return ColourUnit.fromToken(input).extractRgb();
    };

    colorUtility.toHSV = function(input) {
        return ColourUnit.fromToken(input).extractHsv();
    };

    colorUtility.toHSL = function(input) {
        return ColourUnit.fromToken(input).extractHsl();
    };

    // Methods for getting specific CSS string representations
    colorUtility.toCSSHex = function(input, digits) {
        return ColourUnit.fromToken(input).toHexCode(digits);
    };

    colorUtility.toCSS = function(input) {
        return ColourUnit.fromToken(input).toRgbaForm();
    };

    // Getters and Setters (non-destructive, returning new ColourUnit instances for setters)
    colorUtility.getRed = function(input) { return ColourUnit.fromToken(input)._r; };
    colorUtility.setRed = function(input, val) {
        const current = ColourUnit.fromToken(input);
        return new ColourUnit(val, current._g, current._b, current._a);
    };

    colorUtility.getGreen = function(input) { return ColourUnit.fromToken(input)._g; };
    colorUtility.setGreen = function(input, val) {
        const current = ColourUnit.fromToken(input);
        return new ColourUnit(current._r, val, current._b, current._a);
    };

    colorUtility.getBlue = function(input) { return ColourUnit.fromToken(input)._b; };
    colorUtility.setBlue = function(input, val) {
        const current = ColourUnit.fromToken(input);
        return new ColourUnit(current._r, current._g, val, current._a);
    };

    colorUtility.getAlpha = function(input) { return ColourUnit.fromToken(input)._a; };
    colorUtility.setAlpha = function(input, val) {
        const current = ColourUnit.fromToken(input);
        return new ColourUnit(current._r, current._g, current._b, val);
    };

    colorUtility.getHue = function(input) { return ColourUnit.fromToken(input).extractHsl().hue; };
    colorUtility.setHue = function(input, val) {
        const currentHsl = ColourUnit.fromToken(input).extractHsl();
        const { r, g, b } = ColourUnit._hslToRgb(val, currentHsl.saturation, currentHsl.lightness);
        return new ColourUnit(r, g, b, currentHsl.alpha);
    };

    colorUtility.getSaturation = function(input) { return ColourUnit.fromToken(input).extractHsl().saturation; };
    colorUtility.setSaturation = function(input, val) {
        const currentHsl = ColourUnit.fromToken(input).extractHsl();
        const { r, g, b } = ColourUnit._hslToRgb(currentHsl.hue, val, currentHsl.lightness);
        return new ColourUnit(r, g, b, currentHsl.alpha);
    };

    colorUtility.getLightness = function(input) { return ColourUnit.fromToken(input).extractHsl().lightness; };
    colorUtility.setLightness = function(input, val) {
        const currentHsl = ColourUnit.fromToken(input).extractHsl();
        const { r, g, b } = ColourUnit._hslToRgb(currentHsl.hue, currentHsl.saturation, val);
        return new ColourUnit(r, g, b, currentHsl.alpha);
    };

    colorUtility.getValue = function(input) { return ColourUnit.fromToken(input).extractHsv().value; };
    colorUtility.setValue = function(input, val) {
        const currentHsv = ColourUnit.fromToken(input).extractHsv();
        const { r, g, b } = ColourUnit._hsvToRgb(currentHsv.hue, currentHsv.saturation, val);
        return new ColourUnit(r, g, b, currentHsv.alpha);
    };

    if (typeof globalThis !== 'undefined') {
        globalThis.colorUtility = colorUtility;
    } else if (typeof window !== 'undefined') {
        window.colorUtility = colorUtility;
    } else if (typeof global !== 'undefined') {
        global.colorUtility = colorUtility;
    }

})();