// jslint.js
// 2010-03-02
// This file constitutes the core JSLINT application.

/*
 * Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * JSLINT is exposed as a global function.
 * It expects two parameters.
 *
 * var myResult = JSLINT(source, option);
 *
 * The initial parameter, `source`, can be either a string or an array of strings.
 * If provided as a string, it will be automatically split by newline characters ('\n' or '\r').
 * If an array of strings is supplied, each string is treated as a distinct line of code.
 * The `source` content can be JavaScript, HTML, or Konfabulator text.
 *
 * The second parameter, `option`, is an optional object that contains various boolean settings
 * to configure JSLINT's operation. All options are entirely optional and default to `false`.
 *
 * JSLINT returns `true` if the code passes validation, otherwise it returns `false`.
 *
 * In the event of a `false` return, the `JSLINT.errors` array can be examined to identify issues.
 * Each element in `JSLINT.errors` is an object with the following properties:
 *
 * {
 *   line      : // The zero-based line number where the lint was detected.
 *   character : // The zero-based character position where the lint was detected.
 *   reason    : // A descriptive message explaining the problem.
 *   evidence  : // The actual line of text where the problem occurred.
 *   raw       : // The raw message template before detail insertion.
 *   a         : // First placeholder detail.
 *   b         : // Second placeholder detail.
 *   c         : // Third placeholder detail.
 *   d         : // Fourth placeholder detail.
 * }
 *
 * If a critical error is encountered, `null` will be the final entry in the `JSLINT.errors` array.
 *
 * A Function Report can be generated, detailing all functions, their parameters, and local variables.
 * This report is useful for uncovering implicit global variables and other potential issues.
 * The report is formatted in HTML and can be embedded within an HTML `<body>`.
 *
 * var myReport = JSLINT.report(limited);
 *
 * If the `limited` argument is `true`, the report will exclusively list errors.
 *
 * To retrieve JSLint's analysis results in a structured data format:
 *
 * var myData = JSLINT.data();
 *
 * The returned data structure has the following schema:
 *
 * {
 *   errors: [
 *     {
 *       line: NUMBER,
 *       character: NUMBER,
 *       reason: STRING,
 *       evidence: STRING
 *     }
 *   ],
 *   functions: [
 *     name: STRING,
 *     line: NUMBER,
 *     last: NUMBER,
 *     param: [STRING],
 *     closure: [STRING],
 *     var: [STRING],
 *     exception: [STRING],
 *     outer: [STRING],
 *     unused: [STRING],
 *     global: [STRING],
 *     label: [STRING]
 *   ],
 *   globals: [STRING],
 *   member: {STRING: NUMBER},
 *   unuseds: [
 *     {
 *       name: STRING,
 *       line: NUMBER
 *     }
 *   ],
 *   implieds: [
 *     {
 *       name: STRING,
 *       line: NUMBER
 *     }
 *   ],
 *   urls: [STRING],
 *   json: BOOLEAN
 * }
 *
 * Note: Any arrays that are empty will not be included in the final data structure.
 */

/*jslint
  evil:   true,
  nomen:  false,
  onevar: false,
  regexp: false,
  strict: true
*/

/*
 * This section lists all recognized members and special tokens by JSLint.
 * It includes built-in types, operators, HTML elements, CSS properties, and various functions/keywords.
 */
/*members
  "\b", "\t", "\n", "\f", "\r", "!=", "!==", "\"", "%",
  "(begin)", "(breakage)", "(context)", "(error)", "(global)",
  "(identifier)", "(last)", "(line)", "(loopage)", "(name)", "(onevar)",
  "(params)", "(scope)", "(verb)", "*", "+", "++", "-", "--", "\/",
  "<", "<=", "==", "===", ">", ">=", ADSAFE, Array, Boolean,
  COM, Canvas, CustomAnimation, Date, Debug, E, Error, EvalError,
  FadeAnimation, Flash, FormField, Frame, Function, HotKey, Image, JSON,
  LN10, LN2, LOG10E, LOG2E, MAX_VALUE, MIN_VALUE, Math, MenuItem,
  MoveAnimation, NEGATIVE_INFINITY, Number, Object, Option, PI,
  POSITIVE_INFINITY, Point, RangeError, Rectangle, ReferenceError, RegExp,
  ResizeAnimation, RotateAnimation, SQRT1_2, SQRT2, ScrollBar, String,
  Style, SyntaxError, System, Text, TextArea, Timer, TypeError, URIError,
  URL, Web, Window, XMLDOM, XMLHttpRequest, "\\", a, abbr, acronym,
  addEventListener, address, adsafe, alert, aliceblue, animator,
  antiquewhite, appleScript, applet, apply, approved, aqua, aquamarine,
  area, arguments, arity, autocomplete, azure, b, background,
  "background-attachment", "background-color", "background-image",
  "background-position", "background-repeat", base, bdo, beep, beige, big,
  bisque, bitwise, black, blanchedalmond, block, blockquote, blue,
  blueviolet, blur, body, border, "border-bottom", "border-bottom-color",
  "border-bottom-style", "border-bottom-width", "border-collapse",
  "border-color", "border-left", "border-left-color", "border-left-style",
  "border-left-width", "border-right", "border-right-color",
  "border-right-style", "border-right-width", "border-spacing",
  "border-style", "border-top", "border-top-color", "border-top-style",
  "border-top-width", "border-width", bottom, br, brown, browser,
  burlywood, button, bytesToUIString, c, cadetblue, call, callee, caller,
  canvas, cap, caption, "caption-side", cases, center, charAt, charCodeAt,
  character, chartreuse, chocolate, chooseColor, chooseFile, chooseFolder,
  cite, clear, clearInterval, clearTimeout, clip, close, closeWidget,
  closed, closure, cm, code, col, colgroup, color, comment, condition,
  confirm, console, constructor, content, convertPathToHFS,
  convertPathToPlatform, coral, cornflowerblue, cornsilk,
  "counter-increment", "counter-reset", create, crimson, css, cursor,
  cyan, d, darkblue, darkcyan, darkgoldenrod, darkgray, darkgreen,
  darkkhaki, darkmagenta, darkolivegreen, darkorange, darkorchid, darkred,
  darksalmon, darkseagreen, darkslateblue, darkslategray, darkturquoise,
  darkviolet, data, dd, debug, decodeURI, decodeURIComponent, deeppink,
  deepskyblue, defaultStatus, defineClass, del, deserialize, devel, dfn,
  dimension, dimgray, dir, direction, display, div, dl, document,
  dodgerblue, dt, edition, else, em, embed, empty, "empty-cells",
  encodeURI, encodeURIComponent, entityify, eqeqeq, errors, escape, eval,
  event, evidence, evil, ex, exception, exec, exps, fieldset, filesystem,
  firebrick, first, float, floor, floralwhite, focus, focusWidget, font,
  "font-face", "font-family", "font-size", "font-size-adjust",
  "font-stretch", "font-style", "font-variant", "font-weight",
  forestgreen, forin, form, fragment, frame, frames, frameset, from,
  fromCharCode, fuchsia, fud, funct, function, functions, g, gainsboro,
  gc, getComputedStyle, ghostwhite, global, globals, gold, goldenrod,
  gray, green, greenyellow, h1, h2, h3, h4, h5, h6, hasOwnProperty, head,
  height, help, history, honeydew, hotpink, hr, html, i, iTunes, id,
  identifier, iframe, img, immed, implieds, in, include, indent, indexOf,
  indianred, indigo, init, input, ins, isAlpha, isApplicationRunning,
  isDigit, isFinite, isNaN, ivory, join, jslint, json, kbd, khaki,
  konfabulatorVersion, label, labelled, lang, last, lavender,
  lavenderblush, lawngreen, laxbreak, lbp, led, left, legend,
  lemonchiffon, length, "letter-spacing", li, lib, lightblue, lightcoral,
  lightcyan, lightgoldenrodyellow, lightgreen, lightpink, lightsalmon,
  lightseagreen, lightskyblue, lightslategray, lightsteelblue,
  lightyellow, lime, limegreen, line, "line-height", linen, link,
  "list-style", "list-style-image", "list-style-position",
  "list-style-type", load, loadClass, location, log, m, magenta, map,
  margin, "margin-bottom", "margin-left", "margin-right", "margin-top",
  "marker-offset", maroon, match, "max-height", "max-width", maxerr, maxlen,
  md5, media, mediumaquamarine, mediumblue, mediumorchid, mediumpurple,
  mediumseagreen, mediumslateblue, mediumspringgreen, mediumturquoise,
  mediumvioletred, member, menu, message, meta, midnightblue,
  "min-height", "min-width", mintcream, mistyrose, mm, moccasin, moveBy,
  moveTo, name, navajowhite, navigator, navy, new, newcap, noframes,
  nomen, noscript, nud, object, ol, oldlace, olive, olivedrab, on,
  onbeforeunload, onblur, onerror, onevar, onfocus, onload, onresize,
  onunload, opacity, open, openURL, opener, opera, optgroup, option,
  orange, orangered, orchid, outer, outline, "outline-color",
  "outline-style", "outline-width", overflow, "overflow-x", "overflow-y",
  p, padding, "padding-bottom", "padding-left", "padding-right",
  "padding-top", page, "page-break-after", "page-break-before",
  palegoldenrod, palegreen, paleturquoise, palevioletred, papayawhip,
  param, parent, parseFloat, parseInt, passfail, pc, peachpuff, peru,
  pink, play, plum, plusplus, pop, popupMenu, position, powderblue, pre,
  predef, preferenceGroups, preferences, print, prompt, prototype, pt,
  purple, push, px, q, quit, quotes, random, range, raw, reach, readFile,
  readUrl, reason, red, regexp, reloadWidget, removeEventListener,
  replace, report, reserved, resizeBy, resizeTo, resolvePath,
  resumeUpdates, rhino, right, rosybrown, royalblue, runCommand,
  runCommandInBg, saddlebrown, safe, salmon, samp, sandybrown, saveAs,
  savePreferences, screen, script, scroll, scrollBy, scrollTo, seagreen,
  seal, search, seashell, select, serialize, setInterval, setTimeout,
  shift, showWidgetPreferences, sidebar, sienna, silver, skyblue,
  slateblue, slategray, sleep, slice, small, snow, sort, span, spawn,
  speak, split, springgreen, src, status, steelblue, strict, strong,
  style, styleproperty, sub, substr, sup, supplant, suppressUpdates, sync,
  system, table, "table-layout", tan, tbody, td, teal, tellWidget, test,
  "text-align", "text-decoration", "text-indent", "text-shadow",
  "text-transform", textarea, tfoot, th, thead, thistle, title,
  toLowerCase, toString, toUpperCase, toint32, token, tomato, top, tr, tt,
  turquoise, type, u, ul, undef, unescape, "unicode-bidi", unused,
  unwatch, updateNow, urls, value, valueOf, var, version,
  "vertical-align", violet, visibility, watch, wheat, white,
  "white-space", whitesmoke, widget, width, "word-spacing", "word-wrap",
  yahooCheckLogin, yahooLogin, yahooLogout, yellow, yellowgreen,
  "z-index"
*/


// We encapsulate the entire application within an immediately invoked function expression (IIFE)
// to ensure only a single global variable is exposed. The return value of this function will be
// the JSLINT application object itself.

"use strict";

var JSLINT = (function () {

  var adsafe_id,      // Holds the ADsafe ID of the current widget.
      adsafe_may,     // Indicates if the widget is permitted to load approved scripts.
      adsafe_went,    // A flag to check if ADSAFE.go has been called.
      anonname,       // Stores the inferred name for anonymous functions.
      approved,       // A collection of ADsafe approved URLs.

      // Recognised CSS at-rules.
      atrule = {
          media      : true,
          'font-face': true,
          page       : true
      },

      // Operators that are not allowed to be used directly with the '!' (logical NOT) operator.
      bang = {
          '<':   true,
          '<=':  true,
          '==':  true,
          '===': true,
          '!==': true,
          '!=':  true,
          '>':   true,
          '>=':  true,
          '+':   true,
          '-':   true,
          '*':   true,
          '/':   true,
          '%':   true
      },

      // These members are specifically disallowed within the ADsafe safe subset.
      banned = {
          'arguments' : true,
          callee      : true,
          caller      : true,
          constructor : true,
          'eval'      : true,
          prototype   : true,
          unwatch     : true,
          valueOf     : true,
          watch       : true
      },

      // A list of boolean options that can be configured for JSLint.
      boolOptions = {
          adsafe    : true, // If ADsafe guidelines should be enforced.
          bitwise   : true, // If bitwise operators are prohibited.
          browser   : true, // If standard browser globals should be predefined.
          cap       : true, // If uppercase HTML tags are allowed.
          css       : true, // If CSS workarounds are tolerated.
          debug     : true, // If `debugger` statements are allowed.
          devel     : true, // If logging functions (e.g., `console`, `alert`) are allowed.
          eqeqeq    : true, // If `===` and `!==` operators are required.
          evil      : true, // If `eval` is permitted.
          forin     : true, // If `for in` loops must include a filter.
          fragment  : true, // If HTML fragments are allowed.
          immed     : true, // If immediate function invocations must be wrapped in parentheses.
          laxbreak  : true, // If line break checks are relaxed.
          newcap    : true, // If constructor function names must start with a capital letter.
          nomen     : true, // If identifier names are checked for leading/trailing underscores.
          on        : true, // If HTML event handlers are allowed.
          onevar    : true, // If only one `var` statement is allowed per function.
          passfail  : true, // If the scan should terminate on the first error.
          plusplus  : true, // If increment (`++`) and decrement (`--`) operators are disallowed.
          regexp    : true, // If the `.` character is not allowed in regular expression literals.
          rhino     : true, // If Rhino environment globals should be predefined.
          undef     : true, // If all variables must be explicitly declared before use.
          safe      : true, // If certain browser features should be restricted.
          sidebar   : true, // If Yahoo Widgets' `System` object should be predefined.
          strict    : true, // If the `"use strict";` pragma is required.
          sub       : true, // If all forms of subscript notation are tolerated.
          white     : true, // If strict whitespace rules are applied.
          widget    : true  // If Yahoo Widgets' globals should be predefined.
      },

      // A set of global names commonly provided by a web browser environment.
      browser = {
          addEventListener    : false,
          blur                : false,
          clearInterval       : false,
          clearTimeout        : false,
          close               : false,
          closed              : false,
          defaultStatus       : false,
          document            : false,
          event               : false,
          focus               : false,
          frames              : false,
          getComputedStyle    : false,
          history             : false,
          Image               : false,
          length              : false,
          location            : false,
          moveBy              : false,
          moveTo              : false,
          name                : false,
          navigator           : false,
          onbeforeunload      : true,
          onblur              : true,
          onerror             : true,
          onfocus             : true,
          onload              : true,
          onresize            : true,
          onunload            : true,
          open                : false,
          opener              : false,
          Option              : false,
          parent              : false,
          print               : false,
          removeEventListener : false,
          resizeBy            : false,
          resizeTo            : false,
          screen              : false,
          scroll              : false,
          scrollBy            : false,
          scrollTo            : false,
          setInterval         : false,
          setTimeout          : false,
          status              : false,
          top                 : false,
          XMLHttpRequest      : false
      },

      // Placeholder for CSS attribute related data.
      cssAttributeData,
      // Placeholder for generic CSS 'any' value.
      cssAny,

      // A comprehensive list of valid CSS color keywords.
      cssColorData = {
          "aliceblue"             : true,
          "antiquewhite"          : true,
          "aqua"                  : true,
          "aquamarine"            : true,
          "azure"                 : true,
          "beige"                 : true,
          "bisque"                : true,
          "black"                 : true,
          "blanchedalmond"        : true,
          "blue"                  : true,
          "blueviolet"            : true,
          "brown"                 : true,
          "burlywood"             : true,
          "cadetblue"             : true,
          "chartreuse"            : true,
          "chocolate"             : true,
          "coral"                 : true,
          "cornflowerblue"        : true,
          "cornsilk"              : true,
          "crimson"               : true,
          "cyan"                  : true,
          "darkblue"              : true,
          "darkcyan"              : true,
          "darkgoldenrod"         : true,
          "darkgray"              : true,
          "darkgreen"             : true,
          "darkkhaki"             : true,
          "darkmagenta"           : true,
          "darkolivegreen"        : true,
          "darkorange"            : true,
          "darkorchid"            : true,
          "darkred"               : true,
          "darksalmon"            : true,
          "darkseagreen"          : true,
          "darkslateblue"         : true,
          "darkslategray"         : true,
          "darkturquoise"         : true,
          "darkviolet"            : true,
          "deeppink"              : true,
          "deepskyblue"           : true,
          "dimgray"               : true,
          "dodgerblue"            : true,
          "firebrick"             : true,
          "floralwhite"           : true,
          "forestgreen"           : true,
          "fuchsia"               : true,
          "gainsboro"             : true,
          "ghostwhite"            : true,
          "gold"                  : true,
          "goldenrod"             : true,
          "gray"                  : true,
          "green"                 : true,
          "greenyellow"           : true,
          "honeydew"              : true,
          "hotpink"               : true,
          "indianred"             : true,
          "indigo"                : true,
          "ivory"                 : true,
          "khaki"                 : true,
          "lavender"              : true,
          "lavenderblush"         : true,
          "lawngreen"             : true,
          "lemonchiffon"          : true,
          "lightblue"             : true,
          "lightcoral"            : true,
          "lightcyan"             : true,
          "lightgoldenrodyellow"  : true,
          "lightgreen"            : true,
          "lightpink"             : true,
          "lightsalmon"           : true,
          "lightseagreen"         : true,
          "lightskyblue"          : true,
          "lightslategray"        : true,
          "lightsteelblue"        : true,
          "lightyellow"           : true,
          "lime"                  : true,
          "limegreen"             : true,
          "linen"                 : true,
          "magenta"               : true,
          "maroon"                : true,
          "mediumaquamarine"      : true,
          "mediumblue"            : true,
          "mediumorchid"          : true,
          "mediumpurple"          : true,
          "mediumseagreen"        : true,
          "mediumslateblue"       : true,
          "mediumspringgreen"     : true,
          "mediumturquoise"       : true,
          "mediumvioletred"       : true,
          "midnightblue"          : true,
          "mintcream"             : true,
          "mistyrose"             : true,
          "moccasin"              : true,
          "navajowhite"           : true,
          "navy"                  : true,
          "oldlace"               : true,
          "olive"                 : true,
          "olivedrab"             : true,
          "orange"                : true,
          "orangered"             : true,
          "orchid"                : true,
          "palegoldenrod"         : true,
          "palegreen"             : true,
          "paleturquoise"         : true,
          "palevioletred"         : true,
          "papayawhip"            : true,
          "peachpuff"             : true,
          "peru"                  : true,
          "pink"                  : true,
          "plum"                  : true,
          "powderblue"            : true,