// This file is part of the SpectrumJS library, a color manipulation toolkit.
//
// Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann, Matt Wilson,
//                          Simon Heimler, Michel Vielmetter
//
// All rights reserved under the BSD 3-Clause License.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice,
//   this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

// spectrum.js - version 1.0.1
//
// HSV <-> RGB conversion logic adapted from an algorithm found at http://www.cs.rit.edu/~ncs/color/t_convert.html
// Object instantiation pattern inspired by Douglas Crockford's work.
// Color scheme angular values sourced from colorjack.com's colorpicker utility.
//
// HSL functionality graciously contributed by Tim Baumann - http://github.com/timjb

// establish module scope
/*global org */
if (typeof org === "undefined") {
  var org = {};
}
if (!org.spectrum) {
  org.spectrum = {};
}

// this module's core logic is invoked with org.spectrum as 'ctx'
(function () {
  "use strict";
  // Core configuration values

  // web_shades maps common color names to their hexadecimal representations
  // these standard names are defined by the W3C consortium
  var web_shades = {
    aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgrey: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', grey: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3', lightgrey: '#D3D3D3', lightgreen: '#90EE90', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370D8', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#D87093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'
  };

  // Regular expressions for CSS value parsing, based on http://www.w3.org/TR/css3-values/
  var web_int_pattern = '(?:\\+|-)?\\d+';
  var web_float_pattern = '(?:\\+|-)?\\d*\\.\\d+';
  var web_num_pattern = '(?:' + web_int_pattern + ')|(?:' + web_float_pattern + ')';
  web_int_pattern = '(' + web_int_pattern + ')';
  web_float_pattern = '(' + web_float_pattern + ')';
  web_num_pattern = '(' + web_num_pattern + ')';
  var web_percent_pattern = web_num_pattern + '%';
  var web_space_pattern = '\\s*?';

  // http://www.w3.org/TR/2003/CR-css3-color-20030514/
  var hsv_hsva_expression = new RegExp([
    '^hsl(a?)\\(', web_num_pattern, ',', web_percent_pattern, ',', web_percent_pattern, '(,(', web_num_pattern, '))?\\)$'
  ].join(web_space_pattern));
  var prim_rgba_int_expression = new RegExp([
    '^rgb(a?)\\(', web_int_pattern, ',', web_int_pattern, ',', web_int_pattern, '(,(', web_num_pattern, '))?\\)$'
  ].join(web_space_pattern));
  var prim_rgba_percent_expression = new RegExp([
    '^rgb(a?)\\(', web_percent_pattern, ',', web_percent_pattern, ',', web_percent_pattern, '(,(', web_num_pattern, '))?\\)$'
  ].join(web_space_pattern));

  // Module-level mutable state

  // 'shade' will eventually become the root prototype object for all color instances
  var shade;

  /* model_templates holds the blueprint objects for all the
   * distinct color models that have been registered within this system.
   */
  var model_templates = [];

  /* creators contains specialized methods designed to produce new instances
   * of various registered color models.
   */
  var creators = {};

  // Auxiliary functions

  /* construct is Douglas Crockford's method for achieving prototypal
   * inheritance in JavaScript.
   */
  if (!this.construct) {
    this.construct = function (base_obj) {
      function C() {}
      C.prototype = base_obj;
      return new C();
    };
  }
  var construct = this.construct;

  /* fill takes an input value, converts it to a string if necessary,
   * then prepends it with leading zeros to meet a specified minimum length.
   */
  function fill(in_value, min_len) {
    in_value = in_value.toString();
    var filled_arr = [];

    for (var idx_a = 0, idx_b = Math.max(min_len - in_value.length, 0); idx_a < idx_b; idx_a++) {
      filled_arr.push('0');
    }

    filled_arr.push(in_value);
    return filled_arr.join('');
  }

  /* title_case accepts a string and returns a new string with its initial
   * character converted to uppercase.
   */
  function title_case(in_str) {
    return in_str.slice(0, 1).toUpperCase() + in_str.slice(1);
  }

  /* strip_whitespace removes leading and trailing blank spaces from a given string.
   */
  function strip_whitespace(input_string) {
    return input_string.replace(/^\s+|\s+$/g, '');
  }

  /* duplicateAndExecute is a higher-order function used to apply a method
   * to a *copy* of an object, ensuring the original object remains unchanged.
   * It first clones the object, then invokes the method on the newly created
   * replica.
   */
  function duplicateAndExecute(operation) {
    return function () {
      var replica = this.clone();
      operation.apply(replica, arguments);
      return replica;
    };
  }

  /* registerColorModel is designed to integrate new color representations
   * into the system, dynamically extending the main color API with the
   * capabilities offered by the new model.
   */
  function registerColorModel(model_label, model_definition) {
    var prototype_obj = construct(shade);
    var attr_names = []; // used for replication and generating accessors

    var to_converter_method = 'to' + title_case(model_label);

    function transformAndInvoke(operation) {
      return function () {
        return operation.apply(this[to_converter_method](), arguments);
      };
    }

    for (var prop_key in model_definition)
      if (model_definition.hasOwnProperty(prop_key)) {
        prototype_obj[prop_key] = model_definition[prop_key];
        var property_value = prototype_obj[prop_key];

        if (prop_key.slice(0, 1) == '_') {
          continue;
        }
        if (!(prop_key in shade) && typeof property_value === "function") {
          // A public method was found on this model that isn't yet in the base 'shade' object.
          // Create an implementation that first converts to this model, then calls the method.
          shade[prop_key] = transformAndInvoke(property_value);
        } else if (typeof property_value !== "function") {
          // A public property was found. Create corresponding getter and setter methods
          // and bind them correctly to the 'shade' object.
          attr_names.push(prop_key);
          var accessor_getter = 'get' + title_case(prop_key);
          var accessor_setter = 'set' + title_case(prop_key);

          shade[accessor_getter] = transformAndInvoke(
            prototype_obj[accessor_getter] = (function (key_name) {
              return function () {
                return this[key_name];
              };
            })(prop_key)
          );

          shade[accessor_setter] = transformAndInvoke(
            prototype_obj[accessor_setter] = (function (key_name) {
              return function (new_value) {
                var copied_object = this.clone();
                copied_object[key_name] = new_value;
                return copied_object;
              };
            })(prop_key)
          );
        }
      } // end of iteration over model_definition

    // A method to create new objects, optimizing prototype chain creation.
    // This utilizes an unrolled 'construct' pattern to cache the ConstructorType.
    function ConstructorType() {}
    ConstructorType.prototype = prototype_obj;

    function instance_builder() {
      return new ConstructorType();
    }
    creators[model_label] = instance_builder;

    prototype_obj.clone = function () {
      var copied_object = instance_builder();
      for (var idx_c = 0, idx_d = attr_names.length; idx_c < idx_d; idx_c++) {
        var key_name = attr_names[idx_c];
        copied_object[key_name] = this[key_name];
      }
      return copied_object;
    };

    shade[to_converter_method] = function () {
      return instance_builder();
    };

    model_templates.push(prototype_obj);

    return prototype_obj;
  } // end of registerColorModel

  // Prototype Definitions

  /* shade is the foundational object in the color hierarchy. Initially a minimal
   * object, its capabilities are progressively enhanced as various color models
   * are registered, enabling programmatic conversions and manipulations.
   */
  shade = {
    /* from_source_data attempts to create a new color instance by delegating
     * to the internal color models to parse the provided input object.
     */
    from_source_data: function (source_data) {
      if (!source_data) {
        return construct(shade);
      }

      for (var idx_e = 0, idx_f = model_templates.length; idx_e < idx_f; idx_e++) {
        var new_item = model_templates[idx_e].from_source_data(source_data);
        if (new_item) {
          return new_item;
        }
      }

      return construct(shade);
    },

    to_string_representation: function () {
      return this.to_web_style_string();
    }
  };

  var clear_shade = null; // Will be defined later using an PrimaryRGB instance.

  /* PrimaryRGB represents the Red, Green, Blue color model. This definition
   * is transformed into a usable template object via registerColorModel.
   */
  registerColorModel('PrimaryRGB', {
    component_r: 0,
    component_g: 0,
    component_b: 0,
    opacity_a: 0,

    /* calculate_brightness returns a floating-point value between 0 and 1,
     * representing the luminance computed according to the formula at
     * http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
     */
    calculate_brightness: function () {
      return (this.component_r * 0.2126) + (this.component_g * 0.7152) + (this.component_b * 0.0722);
    },

    /* mix_colors performs an alpha-based blend of 'other_shade' onto this instance.
     * 'mix_ratio' specifies the proportion of 'other_shade' to use (0 to 1).
     */
    mix_colors: function (other_shade, mix_ratio) {
      other_shade = other_shade.toPrimaryRGB();
      mix_ratio = Math.min(Math.max(mix_ratio, 0), 1);
      var mixed_rgb = this.clone();

      mixed_rgb.component_r = (mixed_rgb.component_r * (1 - mix_ratio)) + (other_shade.component_r * mix_ratio);
      mixed_rgb.component_g = (mixed_rgb.component_g * (1 - mix_ratio)) + (other_shade.component_g * mix_ratio);
      mixed_rgb.component_b = (mixed_rgb.component_b * (1 - mix_ratio)) + (other_shade.component_b * mix_ratio);
      mixed_rgb.opacity_a = (mixed_rgb.opacity_a * (1 - mix_ratio)) + (other_shade.opacity_a * mix_ratio);

      return mixed_rgb;
    },

    /* from_source_data attempts to convert an input object 'source_data' into a PrimaryRGB
     * instance. It accepts an array, an object with 'red', 'green', 'blue' properties,
     * or a string. If the string is a recognized CSS color name or a hexadecimal string,
     * it will be processed.
     */
    from_source_data: function (source_data) {
      if (source_data instanceof Array) {
        return this._from_rgb_array(source_data);
      }
      if (typeof source_data === "string") {
        return this._from_web_style_string(strip_whitespace(source_data));
      }
      if (source_data.hasOwnProperty('red') &&
        source_data.hasOwnProperty('green') &&
        source_data.hasOwnProperty('blue')) {
        return this._from_rgb_components(source_data);
      }
      // If no matching format is found, return undefined.
    },

    _text_format_analyzers: [
      // CSS RGB(A) literal parsing function:
      function (style_text) {
        style_text = strip_whitespace(style_text);

        var with_whole_numbers = perform_match(prim_rgba_int_expression, 255);
        if (with_whole_numbers) {
          return with_whole_numbers;
        }
        return perform_match(prim_rgba_percent_expression, 100);

        function perform_match(pattern_expr, maximum_val) {
          var match_results = style_text.match(pattern_expr);

          // If an "a" is present after "rgb", a fourth parameter (alpha) is mandatory, and vice versa.
          if (!match_results || (!!match_results[1] + !!match_results[5] === 1)) {
            return null;
          }

          var parsed_rgb = creators.PrimaryRGB();
          parsed_rgb.component_r = Math.min(1, Math.max(0, match_results[2] / maximum_val));
          parsed_rgb.component_g = Math.min(1, Math.max(0, match_results[3] / maximum_val));
          parsed_rgb.component_b = Math.min(1, Math.max(0, match_results[4] / maximum_val));
          parsed_rgb.opacity_a = !!match_results[5] ? Math.min(Math.max(parseFloat(match_results[6]), 0), 1) : 1;

          return parsed_rgb;
        }
      },

      function (style_text) {
        var lower_case_str = style_text.toLowerCase();
        if (lower_case_str in web_shades) {
          style_text = web_shades[lower_case_str];
        }

        if (!style_text.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
          return;
        }

        style_text = style_text.replace(/^#/, '');

        var byte_count = style_text.length / 3;

        var max_hex_val = Math.pow(16, byte_count) - 1;

        var parsed_rgb = creators.PrimaryRGB();
        parsed_rgb.component_r = parseInt(style_text.slice(0, byte_count), 16) / max_hex_val;
        parsed_rgb.component_g = parseInt(style_text.slice(byte_count * 1, byte_count * 2), 16) / max_hex_val;
        parsed_rgb.component_b = parseInt(style_text.slice(byte_count * 2), 16) / max_hex_val;
        parsed_rgb.opacity_a = 1;
        return parsed_rgb;
      },

      function (style_text) {
        if (style_text.toLowerCase() !== 'transparent') return;

        return clear_shade;
      }
    ],

    _from_web_style_string: function (style_text) {
      var parsed_color = null;
      for (var idx_g = 0, idx_h = this._text_format_analyzers.length; idx_g < idx_h; idx_g++) {
        parsed_color = this._text_format_analyzers[idx_g](style_text);
        if (parsed_color) return parsed_color;
      }
    },

    _from_rgb_components: function (rgb_input) {
      var result_rgb = creators.PrimaryRGB();

      result_rgb.component_r = rgb_input.red;
      result_rgb.component_g = rgb_input.green;
      result_rgb.component_b = rgb_input.blue;
      result_rgb.opacity_a = rgb_input.hasOwnProperty('alpha') ? rgb_input.alpha : 1;

      return result_rgb;
    },

    _from_rgb_array: function (rgb_input) {
      var result_rgb = creators.PrimaryRGB();

      result_rgb.component_r = Math.max(0, Math.min(1, rgb_input[0] / 255));
      result_rgb.component_g = Math.max(0, Math.min(1, rgb_input[1] / 255));
      result_rgb.component_b = Math.max(0, Math.min(1, rgb_input[2] / 255));
      result_rgb.opacity_a = rgb_input[3] !== undefined ? Math.max(0, Math.min(1, rgb_input[3])) : 1;

      return result_rgb;
    },

    // Converts the color to a CSS hexadecimal string. Defaults to two bytes per component.
    to_web_hex_string: function (hex_bytes) {
      hex_bytes = hex_bytes || 2;

      var max_component_val = Math.pow(16, hex_bytes) - 1;
      var hex_components = [
        "#",
        fill(Math.round(this.component_r * max_component_val).toString(16).toUpperCase(), hex_bytes),
        fill(Math.round(this.component_g * max_component_val).toString(16).toUpperCase(), hex_bytes),
        fill(Math.round(this.component_b * max_component_val).toString(16).toUpperCase(), hex_bytes)
      ];

      return hex_components.join('');
    },

    to_web_style_string: function (hex_bytes) {
      if (this.opacity_a === 1) return this.to_web_hex_string(hex_bytes);

      var max_val_255 = 255;

      var rgba_parts = [
        'rgba(',
        Math.max(0, Math.min(max_val_255, Math.round(this.component_r * max_val_255))), ',',
        Math.max(0, Math.min(max_val_255, Math.round(this.component_g * max_val_255))), ',',
        Math.max(0, Math.min(max_val_255, Math.round(this.component_b * max_val_255))), ',',
        Math.max(0, Math.min(1, this.opacity_a)),
        ')'
      ];

      return rgba_parts.join('');
    },

    to_hsv_representation: function () {
      var hsv_result = creators.HSV();
      var min_val, max_val, diff_val;

      min_val = Math.min(this.component_r, this.component_g, this.component_b);
      max_val = Math.max(this.component_r, this.component_g, this.component_b);
      hsv_result.lightness_value = max_val; // V component

      diff_val = max_val - min_val;

      if (diff_val === 0) { // white, grey, black
        hsv_result.color_angle = hsv_result.color_intensity = 0;
      } else { // chromatic color
        hsv_result.color_intensity = diff_val / max_val;

        if (this.component_r === max_val) {
          hsv_result.color_angle = (this.component_g - this.component_b) / diff_val; // between yellow & magenta
        } else if (this.component_g === max_val) {
          hsv_result.color_angle = 2 + (this.component_b - this.component_r) / diff_val; // between cyan & yellow
        } else {
          hsv_result.color_angle = 4 + (this.component_r - this.component_g) / diff_val; // between magenta & cyan
        }

        hsv_result.color_angle = ((hsv_result.color_angle * 60) + 360) % 360; // degrees
      }

      hsv_result.opacity_a = this.opacity_a;

      return hsv_result;
    },
    to_hsl_representation: function () {
      return this.to_hsv_representation().toHSL();
    },

    to_rgb_representation: function () {
      return this.clone();
    }
  });

  clear_shade = shade.from_source_data({
    red: 0,
    blue: 0,
    green: 0,
    alpha: 0
  });


  /* Similar to PrimaryRGB, this object outlines the structure for the HSV
   * template. This model manages hue (color angle), saturation (color intensity),
   * and value (lightness). Hue represents the position on the color wheel,
   * saturation describes the vividness of the color, and value indicates
   * the brightness.
   */
  registerColorModel('HSV', {
    color_angle: 0,
    color_intensity: 0,
    lightness_value: 1,
    opacity_a: 1,

    adjust_angle: duplicateAndExecute(function (angle_change) {
      var adjusted_angle = (this.color_angle + angle_change) % 360;
      if (adjusted_angle < 0) {
        adjusted_angle = (360 + adjusted_angle) % 360;
      }

      this.color_angle = adjusted_angle;
    }),

    reduce_lightness: duplicateAndExecute(function (reduction_amount) {
      this.lightness_value = Math.min(1, Math.max(this.lightness_value - reduction_amount, 0));
    }),