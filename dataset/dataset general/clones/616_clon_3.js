// Core color manipulation library
// Version: 2.0.0-alpha
// License: MIT
// (c) 2023 [Your Name/Org]

// HSV <-> RGB code adapted from various open sources.
// Object creation utility inspired by Douglas Crockford's patterns.
// Color scheme degrees derived from common color pickers.
// HSL support integrated for comprehensive color handling.

// Establish the primary application namespace
/*global colorApp */
if (typeof colorApp === "undefined") {
  var colorApp = {};
}
if (!colorApp.colorCore) {
  colorApp.colorCore = {};
}

// Module definition using an immediately invoked function expression (IIFE)
(function () {
  "use strict";

  // Configuration constants for parsing and display
  var standardWebColors = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blanchedalmond: "#FFEBCD",
    blue: "#0000FF",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgrey: "#A9A9A9",
    darkgreen: "#006400",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    fuchsia: "#FF00FF",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    gray: "#808080",
    grey: "#808080",
    green: "#008000",
    greenyellow: "#ADFF2F",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    indianred: "#CD5C5C",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgrey: "#D3D3D3",
    lightgreen: "#90EE90",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    lime: "#00FF00",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    magenta: "#FF00FF",
    maroon: "#800000",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370D8",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    navy: "#000080",
    oldlace: "#FDF5E6",
    olive: "#808000",
    olivedrab: "#6B8E23",
    orange: "#FFA500",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#D87093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#FF0000",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    silver: "#C0C0C0",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    teal: "#008080",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    yellow: "#FFFF00",
    yellowgreen: "#9ACD32",
  };

  // Regular expression patterns for CSS color parsing
  var numPatternInt = "(?:\\+|-)?\\d+";
  var numPatternFloat = "(?:\\+|-)?\\d*\\.\\d+";
  var generalNumPattern = "(?:" + numPatternInt + ")|(?:" + numPatternFloat + ")";
  numPatternInt = "(" + numPatternInt + ")";
  numPatternFloat = "(" + numPatternFloat + ")";
  generalNumPattern = "(" + generalNumPattern + ")";
  var percentagePattern = generalNumPattern + "%";
  var spaceSep = "\\s*?";

  // HSL(A) parsing regex
  var hslHslaMatcher = new RegExp(
    [
      "^hsl(a?)\\(",
      generalNumPattern,
      ",",
      percentagePattern,
      ",",
      percentagePattern,
      "(,(",
      generalNumPattern,
      "))?\\)$",
    ].join(spaceSep)
  );
  // RGB(A) integer parsing regex
  var rgbRgbaIntMatcher = new RegExp(
    [
      "^rgb(a?)\\(",
      numPatternInt,
      ",",
      numPatternInt,
      ",",
      numPatternInt,
      "(,(",
      generalNumPattern,
      "))?\\)$",
    ].join(spaceSep)
  );
  // RGB(A) percentage parsing regex
  var rgbRgbaPercentMatcher = new RegExp(
    [
      "^rgb(a?)\\(",
      percentagePattern,
      ",",
      percentagePattern,
      ",",
      percentagePattern,
      "(,(",
      generalNumPattern,
      "))?\\)$",
    ].join(spaceSep)
  );

  // Module-level variables for managing color models
  var colorBaseProto; // The root prototype object for all colors
  var activeColorModels = []; // Stores registered model prototypes
  var modelConstructors = {}; // Stores factory functions for each model

  // --- Core Utility Functions ---

  /**
   * Creates a new object with the specified prototype object.
   * A lightweight alternative to Object.create for older environments.
   * @param {object} protoObj The object to serve as the prototype.
   * @returns {object} A new object with `protoObj` as its prototype.
   */
  function createPrototypeHelper(protoObj) {
    function TempConstructor() {}
    TempConstructor.prototype = protoObj;
    return new TempConstructor();
  }

  /**
   * Pads a string with leading zeros to reach a minimum length.
   * @param {number|string} value The value to pad.
   * @param {number} minLength The minimum desired length of the string.
   * @returns {string} The zero-padded string.
   */
  function leftPadZero(value, minLength) {
    var strVal = String(value);
    var padding = minLength - strVal.length;
    if (padding <= 0) {
      return strVal;
    }
    return "0".repeat(padding) + strVal;
  }

  /**
   * Capitalizes the first letter of a string.
   * @param {string} inputString The string to capitalize.
   * @returns {string} The string with its first letter capitalized.
   */
  function capitalizeFirstLetter(inputString) {
    if (!inputString || typeof inputString !== "string") return "";
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  }

  /**
   * Removes leading and trailing whitespace from a string.
   * Uses String.prototype.trim if available, otherwise a regex.
   * @param {string} inputString The string to trim.
   * @returns {string} The trimmed string.
   */
  function trimWhitespace(inputString) {
    if (inputString && typeof inputString.trim === "function") {
      return inputString.trim();
    }
    return inputString.replace(/^\s+|\s+$/g, "");
  }

  /**
   * Creates a new method that first clones the current object,
   * then applies the original method to the cloned object,
   * returning the clone. This ensures immutability for chained operations.
   * @param {function} originalMethod The method to be wrapped.
   * @returns {function} A new method that operates on a clone.
   */
  function createClonedMethod(originalMethod) {
    return function () {
      var clonedInstance = this.clone();
      originalMethod.apply(clonedInstance, arguments);
      return clonedInstance;
    };
  }

  /**
   * Integrates a new color model into the system, extending the base color API.
   * This function sets up conversion methods, getters, and setters for the new model.
   * @param {string} modelKey The unique name for the color model (e.g., 'RGB', 'HSV').
   * @param {object} modelDefinition An object defining the model's properties and methods.
   * @returns {object} The newly created prototype object for the model.
   */
  function integrateColorModel(modelKey, modelDefinition) {
    var modelPrototype = createPrototypeHelper(colorBaseProto);
    var propertyNames = []; // Used for cloning and accessor generation

    var conversionMethodName = "to" + capitalizeFirstLetter(modelKey);

    /**
     * Creates a function that converts the current color to the target model,
     * then invokes a method on that converted object.
     * @param {function} targetMethod The method to call on the converted object.
     * @returns {function} A wrapped function for API extension.
     */
    function adaptAndInvoke(targetMethod) {
      return function () {
        return targetMethod.apply(this[conversionMethodName](), arguments);
      };
    }

    for (var propName in modelDefinition) {
      if (Object.prototype.hasOwnProperty.call(modelDefinition, propName)) {
        modelPrototype[propName] = modelDefinition[propName];
        var propValue = modelPrototype[propName];

        // Skip internal properties starting with '_'
        if (propName.charAt(0) === "_") {
          continue;
        }

        // If it's a public method not yet on the base color object, add a conversion wrapper
        if (typeof propValue === "function" && !(propName in colorBaseProto)) {
          colorBaseProto[propName] = adaptAndInvoke(propValue);
        }
        // If it's a public property, create getters and setters for it
        else if (typeof propValue !== "function") {
          propertyNames.push(propName);
          var getterName = "get" + capitalizeFirstLetter(propName);
          var setterName = "set" + capitalizeFirstLetter(propName);

          // Define getter on the model prototype
          modelPrototype[getterName] = (function (key) {
            return function () {
              return this[key];
            };
          })(propName);

          // Define setter on the model prototype (returns a new cloned instance)
          modelPrototype[setterName] = (function (key) {
            return function (value) {
              var cloned = this.clone();
              cloned[key] = value;
              return cloned;
            };
          })(propName);

          // Add conversion wrappers for getters and setters to the base color object
          colorBaseProto[getterName] = adaptAndInvoke(modelPrototype[getterName]);
          colorBaseProto[setterName] = adaptAndInvoke(modelPrototype[setterName]);
        }
      }
    } // End of iterating over model properties

    // Create a factory function for this model (cached for performance)
    function ModelFactory() {}
    ModelFactory.prototype = modelPrototype;
    var currentModelFactory = function () {
      return new ModelFactory();
    };
    modelConstructors[modelKey] = currentModelFactory;

    // Add a `clone` method to the model prototype
    modelPrototype.clone = function () {
      var clonedInst = currentModelFactory();
      for (var i = 0, len = propertyNames.length; i < len; i++) {
        var pName = propertyNames[i];
        clonedInst[pName] = this[pName];
      }
      return clonedInst;
    };

    // Add the conversion method (e.g., `toRGB()`) to the base color object
    colorBaseProto[conversionMethodName] = function () {
      // If the current instance is already of this model, return a clone
      if (this.constructor.prototype === modelPrototype) {
        return this.clone();
      }
      // Otherwise, assume the current instance has a `toRGB` or similar method
      // which will be defined by other models. If not, it means this model
      // is the source or an error occurred.
      // This is a simplification; a full system might have a conversion matrix.
      return currentModelFactory();
    };

    activeColorModels.push(modelPrototype);

    return modelPrototype;
  } // End of integrateColorModel

  // --- Base Color Object Definition ---

  // `colorBaseProto` serves as the root prototype for all color instances.
  // It gains methods dynamically as new color models are integrated.
  colorBaseProto = {
    /**
     * Attempts to create a new color instance from various input types.
     * It delegates to the registered color models to find a suitable parser.
     * @param {object|string|Array} inputData The input representing a color.
     * @returns {object} A new color instance or a default if parsing fails.
     */
    createFromInput: function (inputData) {
      // Return a default transparent color if no input is provided
      if (inputData === null || typeof inputData === "undefined") {
        return transpColorInstance || createPrototypeHelper(colorBaseProto);
      }

      // Iterate through registered models to find one that can parse the input
      for (var i = 0, numModels = activeColorModels.length; i < numModels; i++) {
        var newColorInstance = activeColorModels[i].fromInput(inputData);
        if (newColorInstance) {
          return newColorInstance;
        }
      }

      // If no model can parse, return a generic base color instance
      return createPrototypeHelper(colorBaseProto);
    },

    /**
     * Converts the color instance to its CSS string representation.
     * Delegates to the specific model's `toCssString` method.
     * @returns {string} The CSS string representation of the color.
     */
    toCssString: function () {
      // Each model should implement its own toCSS method, but
      // as a fallback, we can try to convert to RGB and then to CSS.
      if (typeof this.toRgbaString === "function") {
        return this.toRgbaString();
      }
      return "rgba(0,0,0,0)"; // Default fallback
    },
  };

  var transpColorInstance = null; // Initialized later with an actual RGB object

  // --- RGB Color Model Implementation ---

  // Defines the Red, Green, Blue color model.
  // Values for rVal, gVal, bVal, aVal are normalized between 0 and 1.
  integrateColorModel("RGB", {
    rVal: 0,
    gVal: 0,
    bVal: 0,
    aVal: 1, // Alpha channel, 0 (transparent) to 1 (opaque)

    /**
     * Calculates the perceived brightness (luminance) of the color.
     * Based on ITU-R BT.709 standard.
     * @returns {number} Luminance value between 0 and 1.
     */
    calcPerceivedBrightness: function () {
      return (
        this.rVal * 0.2126 + this.gVal * 0.7152 + this.bVal * 0.0722
      );
    },

    /**
     * Blends the current color with another color based on a given alpha factor.
     * The alpha specifies how much of the `otherColor` to use.
     * @param {object} otherColor The color instance to blend with.
     * @param {number} blendFactor The amount of `otherColor` to incorporate (0 to 1).
     * @returns {object} A new RGB color instance resulting from the blend.
     */
    mixWithColor: function (otherColor, blendFactor) {
      if (!otherColor || typeof otherColor.toRGB !== "function") {
        console.warn("Invalid color object for blending.");
        return this.clone();
      }
      var targetRgb = otherColor.toRGB();
      var safeFactor = Math.min(1, Math.max(0, blendFactor));
      var currentRgb = this.clone();

      currentRgb.rVal =
        currentRgb.rVal * (1 - safeFactor) + targetRgb.rVal * safeFactor;
      currentRgb.gVal =
        currentRgb.gVal * (1 - safeFactor) + targetRgb.gVal * safeFactor;
      currentRgb.bVal =
        currentRgb.bVal * (1 - safeFactor) + targetRgb.bVal * safeFactor;
      currentRgb.aVal =
        currentRgb.aVal * (1 - safeFactor) + targetRgb.aVal * safeFactor;

      return currentRgb;
    },

    /**
     * Attempts to create an RGB instance from various input formats.
     * @param {object|string|Array} input The input to parse.
     * @returns {object|null} A new RGB instance if successful, otherwise null.
     */
    fromInput: function (input) {
      if (Array.isArray(input)) {
        return this._initFromRgbArray(input);
      }
      if (typeof input === "string") {
        return this._parseCssString(trimWhitespace(input));
      }
      if (
        typeof input === "object" &&
        input !== null &&
        "rVal" in input &&
        "gVal" in input &&
        "bVal" in input
      ) {
        return this._initFromRgbObject(input);
      }
      return null;
    },

    // Internal array of functions to parse CSS string formats
    _stringParseHandlers: [
      // Handles `rgb(a)` integer or percentage formats
      function (cssString) {
        var parseRgba = function (regex, maxValue) {
          var colorParts = cssString.match(regex);

          // Ensure match exists and alpha parameter consistency
          if (!colorParts || (!!colorParts[1] + !!colorParts[5] === 1)) {
            return null;
          }

          var newRgb = modelConstructors.RGB();
          newRgb.rVal = Math.min(1, Math.max(0, parseFloat(colorParts[2]) / maxValue));
          newRgb.gVal = Math.min(1, Math.max(0, parseFloat(colorParts[3]) / maxValue));
          newRgb.bVal = Math.min(1, Math.max(0, parseFloat(colorParts[4]) / maxValue));
          newRgb.aVal = colorParts[5] ? Math.min(1, Math.max(0, parseFloat(colorParts[6]))) : 1;

          return newRgb;
        };

        var result = parseRgba(rgbRgbaIntMatcher, 255);
        if (result) return result;
        return parseRgba(rgbRgbaPercentMatcher, 100);
      },

      // Handles hexadecimal color codes (e.g., #RRGGBB, #RGB) and named CSS colors
      function (cssString) {
        var lowerCss = cssString.toLowerCase();
        var hexValue = standardWebColors[lowerCss] || cssString;

        if (!hexValue.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
          return null; // Not a valid hex or named color
        }

        var cleanHex = hexValue.slice(1);
        var bytesPerChannel = cleanHex.length / 3;

        var maxChannelVal = Math.pow(16, bytesPerChannel) - 1;

        var newRgb = modelConstructors.RGB();
        newRgb.rVal =
          parseInt(cleanHex.slice(0, bytesPerChannel), 16) / maxChannelVal;
        newRgb.gVal =
          parseInt(
            cleanHex.slice(bytesPerChannel, bytesPerChannel * 2),
            16
          ) / maxChannelVal;
        newRgb.bVal =
          parseInt(cleanHex.slice(bytesPerChannel * 2), 16) / maxChannelVal;
        newRgb.aVal = 1; // Hex colors are always opaque

        return newRgb;
      },

      // Handles the 'transparent' keyword
      function (cssString) {
        return cssString.toLowerCase() === "transparent" ? transpColorInstance : null;
      },
    ],

    /**
     * Iterates through string parsers to convert a CSS string to an RGB color.
     * @param {string} cssString The CSS string to parse.
     * @returns {object|null} An RGB color object or null if parsing fails.
     */
    _parseCssString: function (cssString) {
      for (var i = 0, j = this._stringParseHandlers.length; i < j; i++) {
        var parsedColor = this._stringParseHandlers[i](cssString);
        if (parsedColor) {
          return parsedColor;
        }
      }
      return null;
    },

    /**
     * Initializes an RGB color from an object with 'rVal', 'gVal', 'bVal' properties.
     * Values are expected to be normalized (0-1).
     * @param {object} rgbObject The source object.
     * @returns {object} A new RGB color instance.
     */
    _initFromRgbObject: function (rgbObject) {
      var newRgb = modelConstructors.RGB();
      newRgb.rVal = rgbObject.rVal;
      newRgb.gVal = rgbObject.gVal;
      newRgb.bVal = rgbObject.bVal;
      newRgb.aVal =
        rgbObject.hasOwnProperty("aVal") && typeof rgbObject.aVal === "number"
          ? rgbObject.aVal
          : 1;
      return newRgb;
    },

    /**
     * Initializes an RGB color from an array `[R, G, B, A]`.
     * R, G, B are expected to be 0-255, A is 0-1.
     * @param {Array<number>} rgbArray The array of color components.
     * @returns {object} A new RGB color instance.
     */
    _initFromRgbArray: function (rgbArray) {
      var newRgb = modelConstructors.RGB();
      // Ensure values are clamped between 0 and 1 after normalization
      newRgb.rVal = Math.max(0, Math.min(1, rgbArray[0] / 255));
      newRgb.gVal = Math.max(0, Math.min(1, rgbArray[1] / 255));
      newRgb.bVal = Math.max(0, Math.min(1, rgbArray[2] / 255));
      newRgb.aVal =
        rgbArray[3] !== undefined
          ? Math.max(0, Math.min(1, rgbArray[3]))
          : 1;

      return newRgb;
    },

    /**
     * Converts the RGB color to a CSS hexadecimal string (e.g., #RRGGBB).
     * @param {number} [bytes=2] The number of bytes per color channel (1 or 2).
     * @returns {string} The hex color string.
     */
    toHexCode: function (bytes) {
      var byteCount = bytes || 2;
      var maxByteVal = Math.pow(16, byteCount) - 1;

      var hexComponents = [
        "#",
        leftPadZero(
          Math.round(this.rVal * maxByteVal).toString(16).toUpperCase(),
          byteCount
        ),
        leftPadZero(
          Math.round(this.gVal * maxByteVal).toString(16).toUpperCase(),
          byteCount
        ),
        leftPadZero(
          Math.round(this.bVal * maxByteVal).toString(16).toUpperCase(),
          byteCount
        ),
      ];

      return hexComponents.join("");
    },

    /**
     * Converts the RGB color to a CSS `rgb()` or `rgba()` string.
     * @returns {string} The CSS color string.
     */
    toRgbaString: function () {
      // If fully transparent, return the keyword
      if (this.aVal === 0) {
        return "transparent";
      }

      var max255 = 255;
      var r = Math.max(0, Math.min(max255, Math.round(this.rVal * max255)));
      var g = Math.max(0, Math.min(max255, Math.round(this.gVal * max255)));
      var b = Math.max(0, Math.min(max255, Math.round(this.bVal * max255)));
      var a = Math.max(0, Math.min(1, this.aVal));

      if (a === 1) {
        return "rgb(" + r + "," + g + "," + b + ")";
      } else {
        // Use toFixed to limit decimal places for alpha, avoiding long floats
        return "rgba(" + r + "," + g + "," + b + "," + a.toFixed(2) + ")";
      }
    },

    /**
     * Converts the RGB color to an HSV color model.
     * @returns {object} A new HSV color instance.
     */
    convertToHsv: function () {
      var newHsv = modelConstructors.HSV();
      var r = this.rVal,
        g = this.gVal,
        b = this.bVal;
      var minVal = Math.min(r, g, b);
      var maxVal = Math.max(r, g, b);
      var delta = maxVal - minVal;

      newHsv.vVal = maxVal; // Value is max component

      if (delta === 0) {
        // achromatic (grey, white, black)
        newHsv.hDeg = 0;
        newHsv.sVal = 0;
      } else {
        newHsv.sVal = delta / maxVal; // Saturation

        var h = 0;
        if (r === maxVal) {
          h = (g - b) / delta + (g < b ? 6 : 0);
        } else if (g === maxVal) {
          h = (b - r) / delta + 2;
        } else {
          h = (r - g) / delta + 4;
        }
        newHsv.hDeg = (h * 60) % 360;
      }

      newHsv.aVal = this.aVal;
      return newHsv;
    },

    /**
     * Converts the RGB color to an HSL color model.
     * @returns {object} A new HSL color instance.
     */
    convertToHsl: function () {
      var newHsl = modelConstructors.HSL();
      var r = this.rVal,
        g = this.gVal,
        b = this.bVal;
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;

      newHsl.lVal = (max + min) / 2; // Luminance

      if (delta === 0) {
        // achromatic
        newHsl.hDeg = 0;
        newHsl.sVal = 0;
      } else {
        newHsl.sVal =
          newHsl.lVal > 0.5 ? delta / (2 - max - min) : delta / (max + min);

        var h = 0;
        if (r === max) {
          h = (g - b) / delta + (g < b ? 6 : 0);
        } else if (g === max) {
          h = (b - r) / delta + 2;
        } else {
          h = (r - g) / delta + 4;
        }
        newHsl.hDeg = (h * 60) % 360;
      }

      newHsl.aVal = this.aVal;
      return newHsl;
    },

    /**
     * Returns a cloned instance of the current RGB color.
     * @returns {object} A new RGB color instance.
     */
    getClonedRgb: function () {
      return this.clone();
    },
  });

  // Initialize the transparent color instance
  transpColorInstance = colorBaseProto.createFromInput({
    rVal: 0,
    bVal: 0,
    gVal: 0,
    aVal: 0,
  });

  // --- HSV Color Model Implementation ---

  // Defines the Hue, Saturation, Value color model.
  // hDeg is 0-360, sVal, vVal, aVal are 0-1.
  integrateColorModel("HSV", {
    hDeg: 0,
    sVal: 0,
    vVal: 1,
    aVal: 1,

    /**
     * Adjusts the hue by a specified number of degrees.
     * The hue wraps around 0-360.
     * @param {number} degrees The amount to shift the hue.
     * @returns {object} A new HSV color instance with the adjusted hue.
     */
    adjustHue: createClonedMethod(function (degrees) {
      var newHue = (this.hDeg + degrees) % 360;
      this.hDeg = newHue < 0 ? 360 + newHue : newHue;
    }),

    /**
     * Decreases the value (brightness) of the color by a specified amount.
     * Value is clamped between 0 and 1.
     * @param {number} amount The amount to decrease the value (0-1).
     * @returns {object} A new HSV color instance with decreased value.
     */
    decreaseBrightness: createClonedMethod(function (amount) {
      this.vVal = Math.min(1, Math.max(this.vVal - amount, 0));
    }),

    /**
     * Increases the saturation of the color by a specified amount.
     * Saturation is clamped between 0 and 1.
     * @param {number} amount The amount to increase saturation (0-1).
     * @returns {object} A new HSV color instance with increased saturation.
     */
    saturateByAmount: createClonedMethod(function (amount) {
      this.sVal = Math.min(1, Math.max(this.sVal + amount, 0));
    }),

    /**
     * Attempts to create an HSV instance from various input formats.
     * @param {object|string|Array} input The input to parse.
     * @returns {object|null} A new HSV instance if successful, otherwise null.
     */
    fromInput: function (input) {
      if (Array.isArray(input)) {
        return this._initFromHsvArray(input);
      }
      if (
        typeof input === "object" &&
        input !== null &&
        "hDeg" in input &&
        "sVal" in input &&
        "vVal" in input
      ) {
        return this._initFromHsvObject(input);
      }
      // HSV doesn't typically parse CSS strings directly,
      // but it could if a 'hsv()' format was defined.
      return null;
    },

    /**
     * Initializes an HSV color from an object with 'hDeg', 'sVal', 'vVal' properties.
     * Values are expected to be h:0-360, s,v:0-1.
     * @param {object} hsvObject The source object.
     * @returns {object} A new HSV color instance.
     */
    _initFromHsvObject: function (hsvObject) {
      var newHsv = modelConstructors.HSV();
      newHsv.hDeg = hsvObject.hDeg % 360;
      newHsv.sVal = Math.max(0, Math.min(1, hsvObject.sVal));
      newHsv.vVal = Math.max(0, Math.min(1, hsvObject.vVal));
      newHsv.aVal =
        hsvObject.hasOwnProperty("aVal") && typeof hsvObject.aVal === "number"
          ? hsvObject.aVal
          : 1;
      return newHsv;
    },

    /**
     * Initializes an HSV color from an array `[H, S, V, A]`.
     * H is 0-360, S, V, A are 0-1.
     * @param {Array<number>} hsvArray The array of color components.
     * @returns {object} A new HSV color instance.
     */
    _initFromHsvArray: function (hsvArray) {
      var newHsv = modelConstructors.HSV();
      newHsv.hDeg = hsvArray[0] % 360;
      newHsv.sVal = Math.max(0, Math.min(1, hsvArray[1]));
      newHsv.vVal = Math.max(0, Math.min(1, hsvArray[2]));
      newHsv.aVal =
        hsvArray[3] !== undefined
          ? Math.max(0, Math.min(1, hsvArray[3]))
          : 1;
      return newHsv;
    },

    /**
     * Converts the HSV color to an RGB color model.
     * @returns {object} A new RGB color instance.
     */
    convertToRgb: function () {
      var newRgb = modelConstructors.RGB();
      var h = this.hDeg / 60;
      var s = this.sVal;
      var v = this.vVal;
      var i = Math.floor(h);
      var f = h - i;
      var p = v * (1 - s);
      var q = v * (1 - f * s);
      var t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0:
          newRgb.rVal = v;
          newRgb.gVal = t;
          newRgb.bVal = p;
          break;
        case 1:
          newRgb.rVal = q;
          newRgb.gVal = v;
          newRgb.bVal = p;
          break;
        case 2:
          newRgb.rVal = p;
          newRgb.gVal = v;
          newRgb.bVal = t;
          break;
        case 3:
          newRgb.rVal = p;
          newRgb.gVal = q;
          newRgb.bVal = v;
          break;
        case 4:
          newRgb.rVal = t;
          newRgb.gVal = p;
          newRgb.bVal = v;
          break;
        case 5:
          newRgb.rVal = v;
          newRgb.gVal = p;
          newRgb.bVal = q;
          break;
      }
      newRgb.aVal = this.aVal;
      return newRgb;
    },

    /**
     * Converts the HSV color to an HSL color model.
     * @returns {object} A new HSL color instance.
     */
    convertToHsl: function () {
      var newHsl = modelConstructors.HSL();
      var h = this.hDeg;
      var s = this.sVal;
      var v = this.vVal;

      var l = v * (1 - s / 2);
      var newS = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

      newHsl.hDeg = h;
      newHsl.sVal = newS;
      newHsl.lVal = l;
      newHsl.aVal = this.aVal;
      return newHsl;
    },

    /**
     * Returns a cloned instance of the current HSV color.
     * @returns {object} A new HSV color instance.
     */
    getClonedHsv: function () {
      return this.clone();
    },
  });

  // --- HSL Color Model Implementation (NEW ADDITION for Type III) ---

  // Defines the Hue, Saturation, Lightness color model.
  // hDeg is 0-360, sVal, lVal, aVal are 0-1.
  integrateColorModel("HSL", {
    hDeg: 0,
    sVal: 0,
    lVal: 0, // Luminance
    aVal: 1,

    /**
     * Adjusts the hue by a specified number of degrees.
     * The hue wraps around 0-360.
     * @param {number} degrees The amount to shift the hue.
     * @returns {object} A new HSL color instance with the adjusted hue.
     */
    adjustHue: createClonedMethod(function (degrees) {
      var newHue = (this.hDeg + degrees) % 360;
      this.hDeg = newHue < 0 ? 360 + newHue : newHue;
    }),

    /**
     * Increases the lightness of the color by a specified amount.
     * Lightness is clamped between 0 and 1.
     * @param {number} amount The amount to increase lightness (0-1).
     * @returns {object} A new HSL color instance with increased lightness.
     */
    increaseLightness: createClonedMethod(function (amount) {
      this.lVal = Math.min(1, Math.max(this.lVal + amount, 0));
    }),

    /**
     * Decreases the lightness of the color by a specified amount.
     * Lightness is clamped between 0 and 1.
     * @param {number} amount The amount to decrease lightness (0-1).
     * @returns {object} A new HSL color instance with decreased lightness.
     */
    decreaseLightness: createClonedMethod(function (amount) {
      this.lVal = Math.min(1, Math.max(this.lVal - amount, 0));
    }),

    /**
     * Attempts to create an HSL instance from various input formats.
     * @param {object|string|Array} input The input to parse.
     * @returns {object|null} A new HSL instance if successful, otherwise null.
     */
    fromInput: function (input) {
      if (Array.isArray(input)) {
        return this._initFromHslArray(input);
      }
      if (typeof input === "string") {
        return this._parseCssString(trimWhitespace(input));
      }
      if (
        typeof input === "object" &&
        input !== null &&
        "hDeg" in input &&
        "sVal" in input &&
        "lVal" in input
      ) {
        return this._initFromHslObject(input);
      }
      return null;
    },

    // Internal array of functions to parse CSS string formats for HSL
    _stringParseHandlers: [
      // Handles `hsl(a)` formats
      function (cssString) {
        var colorParts = cssString.match(hslHslaMatcher);

        // Ensure match exists and alpha parameter consistency
        if (!colorParts || (!!colorParts[1] + !!colorParts[5] === 1)) {
          return null;
        }

        var newHsl = modelConstructors.HSL();
        newHsl.hDeg = parseFloat(colorParts[2]) % 360;
        newHsl.sVal = Math.min(1, Math.max(0, parseFloat(colorParts[3]) / 100));
        newHsl.lVal = Math.min(1, Math.max(0, parseFloat(colorParts[4]) / 100));
        newHsl.aVal = colorParts[5] ? Math.min(1, Math.max(0, parseFloat(colorParts[6]))) : 1;

        return newHsl;
      },
    ],

    /**
     * Iterates through string parsers to convert a CSS string to an HSL color.
     * @param {string} cssString The CSS string to parse.
     * @returns {object|null} An HSL color object or null if parsing fails.
     */
    _parseCssString: function (cssString) {
      for (var i = 0, j = this._stringParseHandlers.length; i < j; i++) {
        var parsedColor = this._stringParseHandlers[i](cssString);
        if (parsedColor) {
          return parsedColor;
        }
      }
      return null;
    },

    /**
     * Initializes an HSL color from an object with 'hDeg', 'sVal', 'lVal' properties.
     * Values are expected to be h:0-360, s,l:0-1.
     * @param {object} hslObject The source object.
     * @returns {object} A new HSL color instance.
     */
    _initFromHslObject: function (hslObject) {
      var newHsl = modelConstructors.HSL();
      newHsl.hDeg = hslObject.hDeg % 360;
      newHsl.sVal = Math.max(0, Math.min(1, hslObject.sVal));
      newHsl.lVal = Math.max(0, Math.min(1, hslObject.lVal));
      newHsl.aVal =
        hslObject.hasOwnProperty("aVal") && typeof hslObject.aVal === "number"
          ? hslObject.aVal
          : 1;
      return newHsl;
    },

    /**
     * Initializes an HSL color from an array `[H, S, L, A]`.
     * H is 0-360, S, L, A are 0-1.
     * @param {Array<number>} hslArray The array of color components.
     * @returns {object} A new HSL color instance.
     */
    _initFromHslArray: function (hslArray) {
      var newHsl = modelConstructors.HSL();
      newHsl.hDeg = hslArray[0] % 360;
      newHsl.sVal = Math.max(0, Math.min(1, hslArray[1]));
      newHsl.lVal = Math.max(0, Math.min(1, hslArray[2]));
      newHsl.aVal =
        hslArray[3] !== undefined
          ? Math.max(0, Math.min(1, hslArray[3]))
          : 1;
      return newHsl;
    },

    /**
     * Converts the HSL color to an RGB color model.
     * @returns {object} A new RGB color instance.
     */
    convertToRgb: function () {
      var newRgb = modelConstructors.RGB();
      var h = this.hDeg / 360;
      var s = this.sVal;
      var l = this.lVal;
      var r, g, b;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      newRgb.rVal = r;
      newRgb.gVal = g;
      newRgb.bVal = b;
      newRgb.aVal = this.aVal;
      return newRgb;
    },

    /**
     * Converts the HSL color to an HSV color model.
     * @returns {object} A new HSV color instance.
     */
    convertToHsv: function () {
      var newHsv = modelConstructors.HSV();
      var h = this.hDeg;
      var s = this.sVal;
      var l = this.lVal;

      var v = l + s * Math.min(l, 1 - l);
      var newS = v === 0 ? 0 : 2 * (1 - l / v);

      newHsv.hDeg = h;
      newHsv.sVal = newS;
      newHsv.vVal = v;
      newHsv.aVal = this.aVal;
      return newHsv;
    },

    /**
     * Converts the HSL color to a CSS `hsl()` or `hsla()` string.
     * @returns {string} The CSS color string.
     */
    toHslaString: function () {
      // If fully transparent, return the keyword
      if (this.aVal === 0) {
        return "transparent";
      }

      var h = Math.round(this.hDeg);
      var s = Math.round(this.sVal * 100);
      var l = Math.round(this.lVal * 100);
      var a = Math.max(0, Math.min(1, this.aVal));

      if (a === 1) {
        return "hsl(" + h + "," + s + "%," + l + "%)";
      } else {
        return "hsla(" + h + "," + s + "%," + l + "%," + a.toFixed(2) + ")";
      }
    },

    /**
     * Returns a cloned instance of the current HSL color.
     * @returns {object} A new HSL color instance.
     */
    getClonedHsl: function () {
      return this.clone();
    },
  });

  // Expose the base color object to the global namespace
  colorApp.colorCore.Color = colorBaseProto;
})();