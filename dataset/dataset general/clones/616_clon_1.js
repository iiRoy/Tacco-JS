/*
 *  Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann, Matt Wilson,
 *                           Simon Heimler, Michel Vielmetter
 *
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 *  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 *  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 *  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 *  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

// This file contains the color manipulation library.
// Version: 1.0.1

// HSV <-> RGB conversion logic is adapted from http://www.cs.rit.edu/~ncs/color/t_convert.html
// The object creation function is inspired by Douglas Crockford's work.
// Color scheme degrees are derived from the colorjack.com colorpicker.
// HSL support was generously contributed by Tim Baumann (http://github.com/timjb).

// Ensure necessary namespaces exist.
/* global net */
if  ( "undefined"  ==  typeof  net  )  {
    var  net  =  {};
}
if  (  !net.brehaut  )  {
    net.brehaut  =  {};
}

// Self-executing anonymous function to encapsulate the module's scope.
// The 'this' context inside this function will be net.brehaut.
(  function  (  )  {
    "use strict";

    // Module-level constants.

    // A comprehensive map of standard CSS color names to their hexadecimal values.
    // These names are officially defined by the W3C.
    var css_colors = {
        aliceblue        : '#F0F8FF',
        antiquewhite     : '#FAEBD7',
        aqua             : '#00FFFF',
        aquamarine       : '#7FFFD4',
        azure            : '#F0FFFF',
        beige            : '#F5F5DC',
        bisque           : '#FFE4C4',
        black            : '#000000',
        blanchedalmond   : '#FFEBCD',
        blue             : '#0000FF',
        blueviolet       : '#8A2BE2',
        brown            : '#A52A2A',
        burlywood        : '#DEB887',
        cadetblue        : '#5F9EA0',
        chartreuse       : '#7FFF00',
        chocolate        : '#D2691E',
        coral            : '#FF7F50',
        cornflowerblue   : '#6495ED',
        cornsilk         : '#FFF8DC',
        crimson          : '#DC143C',
        cyan             : '#00FFFF',
        darkblue         : '#00008B',
        darkcyan         : '#008B8B',
        darkgoldenrod    : '#B8860B',
        darkgray         : '#A9A9A9',
        darkgrey         : '#A9A9A9',
        darkgreen        : '#006400',
        darkkhaki        : '#BDB76B',
        darkmagenta      : '#8B008B',
        darkolivegreen   : '#556B2F',
        darkorange       : '#FF8C00',
        darkorchid       : '#9932CC',
        darkred          : '#8B0000',
        darksalmon       : '#E9967A',
        darkseagreen     : '#8FBC8F',
        darkslateblue    : '#483D8B',
        darkslategray    : '#2F4F4F',
        darkslategrey    : '#2F4F4F',
        darkturquoise    : '#00CED1',
        darkviolet       : '#9400D3',
        deeppink         : '#FF1493',
        deepskyblue      : '#00BFFF',
        dimgray          : '#696969',
        dimgrey          : '#696969',
        dodgerblue       : '#1E90FF',
        firebrick        : '#B22222',
        floralwhite      : '#FFFAF0',
        forestgreen      : '#228B22',
        fuchsia          : '#FF00FF',
        gainsboro        : '#DCDCDC',
        ghostwhite       : '#F8F8FF',
        gold             : '#FFD700',
        goldenrod        : '#DAA520',
        gray             : '#808080',
        grey             : '#808080',
        green            : '#008000',
        greenyellow      : '#ADFF2F',
        honeydew         : '#F0FFF0',
        hotpink          : '#FF69B4',
        indianred        : '#CD5C5C',
        indigo           : '#4B0082',
        ivory            : '#FFFFF0',
        khaki            : '#F0E68C',
        lavender         : '#E6E6FA',
        lavenderblush    : '#FFF0F5',
        lawngreen        : '#7CFC00',
        lemonchiffon     : '#FFFACD',
        lightblue        : '#ADD8E6',
        lightcoral       : '#F08080',
        lightcyan        : '#E0FFFF',
        lightgoldenrodyellow:'#FAFAD2',
        lightgray        : '#D3D3D3',
        lightgrey        : '#D3D3D3',
        lightgreen       : '#90EE90',
        lightpink        : '#FFB6C1',
        lightsalmon      : '#FFA07A',
        lightseagreen    : '#20B2AA',
        lightskyblue     : '#87CEFA',
        lightslategray   : '#778899',
        lightslategrey   : '#778899',
        lightsteelblue   : '#B0C4DE',
        lightyellow      : '#FFFFE0',
        lime             : '#00FF00',
        limegreen        : '#32CD32',
        linen            : '#FAF0E6',
        magenta          : '#FF00FF',
        maroon           : '#800000',
        mediumaquamarine : '#66CDAA',
        mediumblue       : '#0000CD',
        mediumorchid     : '#BA55D3',
        mediumpurple     : '#9370D8',
        mediumseagreen   : '#3CB371',
        mediumslateblue  : '#7B68EE',
        mediumspringgreen:'#00FA9A',
        mediumturquoise  : '#48D1CC',
        mediumvioletred  : '#C71585',
        midnightblue     : '#191970',
        mintcream        : '#F5FFFA',
        mistyrose        : '#FFE4E1',
        moccasin         : '#FFE4B5',
        navajowhite      : '#FFDEAD',
        navy             : '#000080',
        oldlace          : '#FDF5E6',
        olive            : '#808000',
        olivedrab        : '#6B8E23',
        orange           : '#FFA500',
        orangered        : '#FF4500',
        orchid           : '#DA70D6',
        palegoldenrod    : '#EEE8AA',
        palegreen        : '#98FB98',
        paleturquoise    : '#AFEEEE',
        palevioletred    : '#D87093',
        papayawhip       : '#FFEFD5',
        peachpuff        : '#FFDAB9',
        peru             : '#CD853F',
        pink             : '#FFC0CB',
        plum             : '#DDA0DD',
        powderblue       : '#B0E0E6',
        purple           : '#800080',
        rebeccapurple    : '#663399',
        red              : '#FF0000',
        rosybrown        : '#BC8F8F',
        royalblue        : '#4169E1',
        saddlebrown      : '#8B4513',
        salmon           : '#FA8072',
        sandybrown       : '#F4A460',
        seagreen         : '#2E8B57',
        seashell         : '#FFF5EE',
        sienna           : '#A0522D',
        silver           : '#C0C0C0',
        skyblue          : '#87CEEB',
        slateblue        : '#6A5ACD',
        slategray        : '#708090',
        slategrey        : '#708090',
        snow             : '#FFFAFA',
        springgreen      : '#00FF7F',
        steelblue        : '#4682B4',
        tan              : '#D2B48C',
        teal             : '#008080',
        thistle          : '#D8BFD8',
        tomato           : '#FF6347',
        turquoise        : '#40E0D0',
        violet           : '#EE82EE',
        wheat            : '#F5DEB3',
        white            : '#FFFFFF',
        whitesmoke       : '#F5F5F5',
        yellow           : '#FFFF00',
        yellowgreen      : '#9ACD32'
    };


    // Regular expressions for parsing CSS color values.
    // Based on the W3C CSS3 Values and Units Module.
    var css_integer  =  '(?:\\+|-)?\\d+';
    var css_float    =  '(?:\\+|-)?\\d*\\.\\d+';
    var css_number   =  '(?:'  +  css_integer  +  ')|(?:'  +  css_float  +  ')';

    css_integer      =  '('  +  css_integer  +  ')';
    css_float        =  '('  +  css_float  +  ')';
    css_number       =  '('  +  css_number  +  ')';

    var css_percentage  =  css_number  +  '%';
    var css_whitespace  =  '\\s*?';

    // Regex for HSL/HSLA color strings as per http://www.w3.org/TR/2003/CR-css3-color-20030514/
    var hsl_hsla_regex  =  new  RegExp(  [
        '^hsl(a?)\\(',
        css_number,
        ',',
        css_percentage,
        ',',
        css_percentage,
        '(,(',  css_number,  '))?\\)$'
    ].join(  css_whitespace  )  );

    // Regex for RGB/RGBA color strings using integer components.
    var rgb_rgba_integer_regex  =  new  RegExp(  [
        '^rgb(a?)\\(',
        css_integer,
        ',',
        css_integer,
        ',',
        css_integer,
        '(,(',  css_number,  '))?\\)$'
    ].join(  css_whitespace  )  );

    // Regex for RGB/RGBA color strings using percentage components.
    var rgb_rgba_percentage_regex  =  new  RegExp(  [
        '^rgb(a?)\\(',
        css_percentage,
        ',',
        css_percentage,
        ',',
        css_percentage,
        '(,(',  css_number,  '))?\\)$'
    ].join(  css_whitespace  )  );


    // Variables accessible throughout this module.

    // This variable will eventually hold the top-level prototype object for colors.
    var  color;

    /*
     *  `registered_models` stores template objects for all color models
     *  that have been registered with the system.
     */
    var  registered_models  =  [];


    /*
     *  `factories` is an object containing methods (functions) used to create
     *  new instances of different registered color models.
     */
    var  factories  =  {};


    // --- Utility Functions ---

    /*
     *  `object` is Douglas Crockford's function for achieving prototypal
     *  inheritance, creating a new object that inherits from a given prototype.
     */
    if  (  !this.object  )  {
        this.object  =  function  (  o  )  {
            function  F  (  )  {}
            F.prototype  =  o;
            return  new  F(  );
        };
    }
    var  object  =  this.object;

    /*
     *  `pad` takes a value and a desired length, converts the value to a string,
     *  and then prepends '0' characters until the string reaches the specified length.
     *  Primarily used for formatting hexadecimal color components.
     */
    function  pad  (  val,  len  )  {
        val  =  val.toString(  );
        var  padded  =  [];

        for  (  var  i  =  0,  j  =  Math.max(  len  -  val.length,  0  );  i  <  j;  i++  )  {
            padded.push(  '0'  );
        }

        padded.push(  val  );
        return  padded.join(  ''  );
    }


    /*
     *  `capitalise` takes a string and returns a new string where the first letter
     *  is capitalized, and the rest of the string remains unchanged.
     */
    function  capitalise  (  s  )  {
        return  s.slice(  0,  1  ).toUpperCase(  )  +  s.slice(  1  );
    }

    /*
     *  `trim` removes leading and trailing whitespace characters from a string.
     */
    function  trim  (  str  )  {
        return  str.replace(  /^\s+|\s+$/g,  ''  );
    }

    /*
     *  `cloneOnApply` is a higher-order function that wraps a method.
     *  When the wrapped method is called, it first clones the `this` object,
     *  then applies the original method to the cloned object, and finally
     *  returns the cloned object. This ensures non-destructive operations.
     */
    function  cloneOnApply  (  meth  )  {
        return  function  (  )  {
            var  cloned  =  this.clone(  );
            meth.apply(  cloned,  arguments  );
            return  cloned;
        };
    }


    /*
     *  `registerModel` is a crucial function used to integrate new color representations
     *  into the color library. It extends the main `color` API with methods
     *  and properties provided by the new model.
     *  @param {string} name - The name of the color model (e.g., 'RGB', 'HSV').
     *  @param {object} model - An object defining the properties and methods for this color model.
     */
    function  registerModel  (  name,  model  )  {
        var  proto  =  object(  color  ); // Create a new prototype inheriting from the base color object.
        var  fields  =  []; // Stores public property names for cloning and accessor generation.

        var  to_meth  =  'to'  +  capitalise(  name  ); // e.g., 'toRGB', 'toHSV'

        /*
         *  Helper function to create a method that first converts the current color
         *  to the target model, then applies the original method to the converted object.
         */
        function  convertAndApply  (  meth  )  {
            return  function  (  )  {
                return  meth.apply(  this[to_meth](  ),  arguments  );
            };
        }

        // Iterate over the provided model object to extend the base color object.
        for  (  var  key  in  model  )  {
            if  (  model.hasOwnProperty(  key  )  )  {
                proto[key]  =  model[key];
                var  prop  =  proto[key];

                // Skip "private" properties (starting with '_').
                if  (  key.slice(  0,  1  )  ==  '_'  )  {
                    continue;
                }

                // If the property is a public method not yet on the base color object.
                if  (  !(key  in  color)  &&  "function"  ==  typeof  prop  )  {
                    // Create a proxy method on the base `color` object.
                    // This proxy will convert the current color to the model's type
                    // and then call the model's method.
                    color[key]  =  convertAndApply(  prop  );
                }
                // If the property is a public, non-function (i.e., a data field).
                else  if  (  "function"  !=  typeof  prop  )  {
                    // Register the field for cloning.
                    fields.push(  key  );

                    // Generate getter and setter methods for this property.
                    var  getter  =  'get'  +  capitalise(  key  );
                    var  setter  =  'set'  +  capitalise(  key  );

                    // Create the getter on the base `color` object (via `convertAndApply`).
                    color[getter]  =  convertAndApply(
                        proto[getter]  =  (  function  (  key  )  {
                            return  function  (  )  {
                                return  this[key];
                            };
                        }  )(  key  )
                    );

                    // Create the setter on the base `color` object (via `convertAndApply`).
                    // Setters return a new cloned color object with the updated value.
                    color[setter]  =  convertAndApply(
                        proto[setter]  =  (  function  (  key  )  {
                            return  function  (  val  )  {
                                var  cloned  =  this.clone(  );
                                cloned[key]  =  val;
                                return  cloned;
                            };
                        }  )(  key  )
                    );
                }
            } // end of hasOwnProperty check
        } // end of for loop over model properties

        // Create a dedicated factory function for this model.
        // This uses an unrolled 'object' pattern for potential performance benefits.
        function  F  (  )  {}
        F.prototype  =  proto;
        function  factory  (  )  {
            return  new  F(  );
        }
        factories[name]  =  factory;

        // Add a `clone` method to the model's prototype.
        // This method creates a new instance and copies all registered fields.
        proto.clone  =  function  (  )  {
            var  cloned  =  factory(  );
            for  (  var  i  =  0,  j  =  fields.length;  i  <  j;  i++  )  {
                var  key  =  fields[i];
                cloned[key]  =  this[key];
            }
            return  cloned;
        };

        // Add a `to[ModelName]` method to the base `color` object.
        // This method simply creates a new instance of the model's factory.
        color[to_meth]  =  function  (  )  {
            return  factory(  );
        };

        // Store the prototype for future reference (e.g., `fromObject`).
        registered_models.push(  proto  );

        return  proto;
    } // end of registerModel function


    // --- Template Objects ---

    /*
     *  `color` serves as the fundamental root object in the color hierarchy.
     *  Initially, it's a very simple object, but its capabilities are expanded
     *  dynamically as various color models (like RGB, HSV) are registered.
     *  These registrations add methods for conversions and manipulations.
     */
    color  =  {
        /*
         *  `fromObject` attempts to create a new color instance from a given input object `o`.
         *  It delegates this task to the internal color models, trying each one until a match is found.
         *  @param {object} o - The object or value to convert into a color.
         *  @returns {object} A new color instance if conversion is successful, or a base color object.
         */
        fromObject:  function  (  o  )  {
            if  (  !o  )  {
                return  object(  color  );
            }

            for  (  var  i  =  0,  j  =  registered_models.length;  i  <  j;  i++  )  {
                var  nu  =  registered_models[i].fromObject(  o  );
                if  (  nu  )  {
                    return  nu;
                }
            }

            return  object(  color  ); // Fallback: return a generic color object if no model matches.
        },

        /*
         *  `toString` provides a string representation of the color.
         *  By default, it defers to the `toCSS()` method for a standard CSS string.
         */
        toString:  function  (  )  {
            return  this.toCSS(  );
        }
    };

    var  transparent  =  null; // This will be defined later using the RGB model.


    /*
     *  The RGB color model: red, green, blue, and alpha (opacity).
     *  This definition is processed by `registerModel` to create the actual
     *  template object and extend the `color` API.
     */
    registerModel(  'RGB',  {
        red:     0,
        green:   0,
        blue:    0,
        alpha:   0, // Alpha channel, 0 (fully transparent) to 1 (fully opaque).

        /*
         *  `getLuminance` calculates the perceived brightness of the color.
         *  Returns a value between 0 (darkest) and 1 (brightest).
         *  Calculation based on http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
         */
        getLuminance:  function  (  )  {
            return  (  this.red  *  0.2126  )  +  (  this.green  *  0.7152  )  +  (  this.blue  *  0.0722  );
        },

        /*
         *  `blend` performs an alpha-based blend of another color onto this color.
         *  The `alpha` parameter determines the amount of the `color` to use (0 to 1).
         *  @param {object} color - The color to blend onto this one (will be converted to RGB).
         *  @param {number} alpha - The blending factor (0.0 to 1.0).
         *  @returns {object} A new RGB color object representing the blended result.
         */
        blend:  function  (  color,  alpha  )  {
            color  =  color.toRGB(  );
            alpha  =  Math.min(  Math.max(  alpha,  0  ),  1  ); // Clamp alpha between 0 and 1.
            var  rgb  =  this.clone(  );

            // Apply the alpha blending formula for each component.
            rgb.red    =  (  rgb.red    *  (  1  -  alpha  )  )  +  (  color.red    *  alpha  );
            rgb.green  =  (  rgb.green  *  (  1  -  alpha  )  )  +  (  color.green  *  alpha  );
            rgb.blue   =  (  rgb.blue   *  (  1  -  alpha  )  )  +  (  color.blue   *  alpha  );
            rgb.alpha  =  (  rgb.alpha  *  (  1  -  alpha  )  )  +  (  color.alpha  *  alpha  );

            return  rgb;
        },

        /*
         *  `fromObject` attempts to convert a given object `o` into an RGB instance.
         *  It supports arrays (e.g., `[r, g, b, a]`), strings (CSS color names or hex),
         *  and objects with `red`, `green`, `blue` properties.
         *  @param {object} o - The input object to convert.
         *  @returns {object|undefined} An RGB color instance if successful, otherwise undefined.
         */
        fromObject:  function  (  o  )  {
            if  (  o  instanceof  Array  )  {
                return  this._fromRGBArray(  o  );
            }
            if  (  "string"  ==  typeof  o  )  {
                return  this._fromCSS(  trim(  o  )  );
            }
            if  (  o.hasOwnProperty(  'red'  )  &&
                o.hasOwnProperty(  'green'  )  &&
                o.hasOwnProperty(  'blue'  )  )  {
                return  this._fromRGB(  o  );
            }
            // If no known format matches, return nothing.
            // This indicates that the object is not an RGB-compatible color representation.
        },

        // Internal array of functions to parse different CSS string formats.
        _stringParsers:  [
            // Parser for CSS `rgb(r,g,b)` or `rgba(r,g,b,a)` literals.
            function  (  css  )  {
                css  =  trim(  css  );

                var  withInteger  =  match(  rgb_rgba_integer_regex,  255  );
                if  (  withInteger  )  {
                    return  withInteger;
                }
                return  match(  rgb_rgba_percentage_regex,  100  );

                // Helper function to match and parse RGB/RGBA strings.
                function  match  (  regex,  max_value  )  {
                    var  colorGroups  =  css.match(  regex  );

                    // Validate regex match: if 'a' is present in 'rgba', alpha must be specified, and vice-versa.
                    if  (  !colorGroups  ||  (  !!colorGroups[1]  +  !!colorGroups[5]  ===  1  )  )  {
                        return  null;
                    }

                    var  rgb  =  factories.RGB(  );
                    // Normalize RGB components to a 0-1 range.
                    rgb.red    =  Math.min(  1,  Math.max(  0,  colorGroups[2]  /  max_value  )  );
                    rgb.green  =  Math.min(  1,  Math.max(  0,  colorGroups[3]  /  max_value  )  );
                    rgb.blue   =  Math.min(  1,  Math.max(  0,  colorGroups[4]  /  max_value  )  );
                    // Parse alpha, default to 1 if not provided.
                    rgb.alpha  =  !!colorGroups[5]  ?  Math.min(  Math.max(  parseFloat(  colorGroups[6]  ),  0  ),  1  )  :  1;

                    return  rgb;
                }
            },

            // Parser for hexadecimal color strings (e.g., `#RRGGBB` or `#RGB`).
            function  (  css  )  {
                var  lower  =  css.toLowerCase(  );
                // Check if it's a named CSS color.
                if  (  lower  in  css_colors  )  {
                    css  =  css_colors[lower];
                }

                // Validate hex format.
                if  (  !css.match(  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/  )  )  {
                    return;
                }

                css  =  css.replace(  /^#/,''); // Remove the '#' prefix.

                var  bytes  =  css.length  /  3; // Determine if 3-byte (RGB) or 6-byte (RRGGBB) format.

                var  max  =  Math.pow(  16,  bytes  )  -  1; // Max value for a single color component (e.g., 255 for 2 bytes).

                var  rgb  =  factories.RGB(  );
                // Parse hex components and normalize to 0-1 range.
                rgb.red    =  parseInt(  css.slice(  0,  bytes  ),  16  )  /  max;
                rgb.green  =  parseInt(  css.slice(  bytes  *  1,  bytes  *  2  ),  16  )  /  max;
                rgb.blue   =  parseInt(  css.slice(  bytes  *  2  ),  16  )  /  max;
                rgb.alpha  =  1; // Hex colors are always opaque.
                return  rgb;
            },

            // Parser for the 'transparent' keyword.
            function  (  css  )  {
                if  (  css.toLowerCase(  )  !==  'transparent'  )  {
                    return;
                }

                return  transparent; // Returns the predefined transparent color object.
            }
        ],

        /*
         *  Internal method to parse a CSS string using the registered string parsers.
         *  @param {string} css - The CSS color string.
         *  @returns {object|undefined} An RGB color instance if parsing is successful, otherwise undefined.
         */
        _fromCSS:  function  (  css  )  {
            var  color  =  null;
            for  (  var  i  =  0,  j  =  this._stringParsers.length;  i  <  j;  i++  )  {
                color  =  this._stringParsers[i](  css  );
                if  (  color  )  {
                    return  color; // Return the first successful parse.
                }
            }
        },

        /*
         *  Internal method to create an RGB instance from an object with `red`, `green`, `blue` properties.
         *  @param {object} RGB - An object containing red, green, blue, and optionally alpha components.
         *  @returns {object} A new RGB color instance.
         */
        _fromRGB:  function  (  RGB  )  {
            var  newRGB  =  factories.RGB(  );

            newRGB.red    =  RGB.red;
            newRGB.green  =  RGB.green;
            newRGB.blue   =  RGB.blue;
            newRGB.alpha  =  RGB.hasOwnProperty(  'alpha'  )  ?  RGB.alpha  :  1; // Default alpha to 1 if not provided.

            return  newRGB;
        },

        /*
         *  Internal method to create an RGB instance from an array of numbers.
         *  Expected format: `[red, green, blue, alpha?]`.
         *  Components are assumed to be 0-255 for RGB, 0-1 for alpha.
         *  @param {Array} RGB - An array of color components.
         *  @returns {object} A new RGB color instance.
         */
        _fromRGBArray:  function  (  RGB  )  {
            var  newRGB  =  factories.RGB(  );

            // Normalize components to 0-1 range and clamp values.
            newRGB.red    =  Math.max(  0,  Math.min(  1,  RGB[0]  /  255  )  );
            newRGB.green  =  Math.max(  0,  Math.min(  1,  RGB[1]  /  255  )  );
            newRGB.blue   =  Math.max(  0,  Math.min(  1,  RGB[2]  /  255  )  );
            // Alpha is already 0-1, just clamp it.
            newRGB.alpha  =  RGB[3]  !==  undefined  ?  Math.max(  0,  Math.min(  1,  RGB[3]  )  )  :  1;

            return  newRGB;
        },

        /*
         *  Converts the RGB color to a CSS hexadecimal string (e.g., `#RRGGBB`).
         *  @param {number} [bytes=2] - The number of bytes per color component (e.g., 1 for #RGB, 2 for #RRGGBB).
         *  @returns {string} The CSS hexadecimal color string.
         */
        toCSSHex:  function  (  bytes  )  {
            bytes  =  bytes  ||  2; // Default to 2 bytes per component.

            var  max  =  Math.pow(  16,  bytes  )  -  1; // Max value for a component in hex.
            var  css  =  [
                "#",
                pad(  Math.round(  this.red  *  max  ).toString(  16  ).toUpperCase(  ),  bytes  ),
                pad(  Math.round(  this.green  *  max  ).toString(  16  ).toUpperCase(  ),  bytes  ),
                pad(  Math.round(  this.blue  *  max  ).toString(  16  ).toUpperCase(  ),  bytes  )
            ];

            return  css.join(  ''  );
        },

        /*
         *  Converts the RGB color to a CSS string representation (`#RRGGBB` or `rgba(r,g,b,a)`).
         *  If the alpha is 1 (opaque), it returns a hex string; otherwise, it returns an RGBA string.
         *  @param {number} [bytes] - Optional, passed to `toCSSHex` if applicable.
         *  @returns {string} The CSS color string.
         */
        toCSS:  function  (  bytes  )  {
            if  (  this.alpha  ===  1  )  {
                return  this.toCSSHex(  bytes  );
            }

            var  max  =  255; // For RGB(A) components, they are typically 0-255.

            var  components  =  [
                'rgba(',
                Math.max(  0,  Math.min(  max,  Math.round(  this.red  *  max  )  )  ),  ',',
                Math.max(  0,  Math.min(  max,  Math.round(  this.green  *  max  )  )  ),  ',',
                Math.max(  0,  Math.min(  max,  Math.round(  this.blue  *  max  )  )  ),  ',',
                Math.max(  0,  Math.min(  1,  this.alpha  )  ), // Alpha is 0-1.
                ')'
            ];

            return  components.join(  ''  );
        },

        /*
         *  Converts the current RGB color to an HSV (Hue, Saturation, Value) color.
         *  @returns {object} A new HSV color instance.
         */
        toHSV:  function  (  )  {
            var  hsv  =  factories.HSV(  );
            var  min,  max,  delta;

            // Find the minimum and maximum color component values.
            min  =  Math.min(  this.red,  this.green,  this.blue  );
            max  =  Math.max(  this.red,  this.green,  this.blue  );
            hsv.value  =  max; // The 'value' (brightness) is simply the maximum component.

            delta  =  max  -  min; // The difference between max and min is the chroma.

            if  (  delta  ==  0  )  { // Grayscale (white, grey, black)
                hsv.hue  =  hsv.saturation  =  0;
            }
            else  { // Chromatic color
                hsv.saturation  =  delta  /  max; // Saturation is chroma relative to value.

                // Calculate hue based on which component is max.
                if  (  this.red  ==  max  )  {
                    hsv.hue  =  (  this.green  -  this.blue  )  /  delta; // Hue is between yellow & magenta.
                }
                else  if  (  this.green  ==  max  )  {
                    hsv.hue  =  2  +  (  this.blue  -  this.red  )  /  delta; // Hue is between cyan & yellow.
                }
                else  {
                    hsv.hue  =  4  +  (  this.red  -  this.green  )  /  delta; // Hue is between magenta & cyan.
                }

                // Convert hue to degrees (0-360) and ensure it's positive.
                hsv.hue  =  (  (  hsv.hue  *  60  )  +  360  )  %  360;
            }

            hsv.alpha  =  this.alpha; // Alpha channel is preserved.

            return  hsv;
        },

        /*
         *  Converts the current RGB color to an HSL (Hue, Saturation, Lightness) color.
         *  This is achieved by first converting to HSV, then converting from HSV to HSL.
         *  @returns {object} A new HSL color instance.
         */
        toHSL:  function  (  )  {
            return  this.toHSV(  ).toHSL(  );
        },

        /*
         *  Returns a clone of the current RGB color object.
         *  This method is for consistency with other `toX` methods.
         *  @returns {object} A new RGB color instance, identical to the original.
         */
        toRGB:  function  (  )  {
            return  this.clone(  );
        }
    }  );

    // Initialize the `transparent` color object using the newly registered RGB model.
    transparent  =  color.fromObject(  {  red:  0,  blue:  0,  green:  0,  alpha:  0  }  );


    /*
     *  The HSV color model: hue, saturation, value, and alpha.
     *  Hue represents the color type (0-360 degrees on the color wheel).
     *  Saturation indicates the purity/intensity of the color (0-1).
     *  Value (or brightness) indicates the lightness/darkness of the color (0-1).
     *  This object defines the structure and methods that will form the HSV template.
     */
    registerModel(  'HSV',  {
        hue:        0,  // Hue: 0-360 degrees.
        saturation: 0,  // Saturation: 0-1.
        value:      1,  // Value (Brightness): 0-1.
        alpha:      1,  // Alpha channel: 0-1.

        /*
         *  `shiftHue` adjusts the hue of the color by a specified number of degrees.
         *  This operation is non-destructive; it returns a new color object.
         *  @param {number} degrees - The amount to shift the hue, in degrees.
         *  @returns {object} A new HSV color instance with the adjusted hue.
         */
        shiftHue:  cloneOnApply(  function  (  degrees  )  {
            var  hue  =  (  this.hue  +  degrees  )  %  360;
            if  (  hue  <  0  )  {
                hue  =  (  360  +  hue  )  %  360; // Ensure hue remains positive.
            }

            this.hue  =  hue;
        }  ),

        /*
         *  `devalueByAmount` decreases the value (brightness) of the color by a specified amount.
         *  The value is clamped between 0 and 1. This operation is non-destructive.
         *  @param {number} val - The amount to decrease the value by (e.g., 0.1 for 10%).
         *  @returns {object} A new HSV color instance with the decreased value.
         */
        devalueByAmount:  cloneOnApply(  function  (  val  )  {
            this.value  =  Math.min(  1,  Math.max(  this.value  -  val,  0  )  );
        }  ),