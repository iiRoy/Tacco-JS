/* linting_utility.js */
/* Updated: March 2nd, 2010 */

/*
    This software is provided under a permissive license.
    The author, Douglas Crockford, grants permission to use, copy, modify,
    and distribute this software and its documentation without charge.
    This includes the rights to sublicense and sell copies, provided the
    original copyright notice and this permission statement are included
    in all substantial reproductions.
    The software is to be used for benevolent purposes only.
    It is provided "AS IS IS," without any express or implied warranties,
    including but not limited to merchantability, fitness for a particular
    purpose, and non-infringement.
    The authors or copyright holders shall not be liable for any claims,
    damages, or other liabilities, whether in contract, tort, or otherwise,
    arising from or in connection with the software or its use.
*/

/*
    The primary validation function, referred to herein as CODE_CHECKER,
    is exposed as a global. It accepts a pair of arguments.

        var validationOutcome = CODE_CHECKER(inputSource, configuration);

    The initial argument can be either a textual string or an array of strings.
    If a single string, it will be fragmented by newline characters ('\n' or '\r').
    If an array, each element is presumed to represent a distinct line.
    The input material can be JavaScript code, HTML markup, or Konfabulator scripts.

    The subsequent argument is an optional configuration object that governs
    CODE_CHECKER's behavior. Most configuration items are booleans, all are
    optional, and their default state is 'false'.

    Upon successful validation, CODE_CHECKER yields 'true'. Otherwise, it yields 'false'.

    In the event of a 'false' return, you can examine CODE_CHECKER.issues to
    identify detected problems. CODE_CHECKER.issues is an array of objects,
    each containing the following attributes:

    {
        row       : The line index (zero-based) where the issue was found
        column    : The character index (zero-based) where the issue was found
        rationale : A description of the problem
        snippet   : The line of text where the problem occurred
        raw_msg   : The unformatted message prior to detail insertion
        arg1      : The first supplementary detail
        arg2      : The second supplementary detail
        arg3      : The third supplementary detail
        arg4      : The fourth supplementary detail
    }

    If a critical error was encountered, the final entry in the
    CODE_CHECKER.issues array will be 'null'.

    A "Function Overview" can be requested, which enumerates all functions,
    their parameters, and local variables. This assists in identifying
    implicit global variables and other discrepancies. The overview is
    formatted as HTML and can be embedded within an HTML <body> tag.

        var functionReport = CODE_CHECKER.summary(is_limited);

    If 'is_limited' is true, the report will only include error information.

    A structured data object containing CODE_CHECKER's findings can also be obtained.

        var collectedData = CODE_CHECKER.retrieve_data();

    This returns a structure with the following composition:

    {
        errors: [
            {
                row: NUMBER,
                column: NUMBER,
                rationale: STRING,
                snippet: STRING
            }
        ],
        routines: [
            name: STRING,
            row: NUMBER,
            end_row: NUMBER,
            params: [
                STRING
            ],
            closures: [
                STRING
            ],
            locals: [
                STRING
            ],
            exceptions: [
                STRING
            ],
            outer_vars: [
                STRING
            ],
            unused_vars: [
                STRING
            ],
            global_refs: [
                STRING
            ],
            labels: [
                STRING
            ]
        ],
        global_symbols: [
            STRING
        ],
        member_access: {
            STRING: NUMBER
        },
        unutilized: [
            {
                name: STRING,
                row: NUMBER
            }
        ],
        implicit_globals: [
            {
                name: STRING,
                row: NUMBER
            }
        ],
        resource_urls: [
            STRING
        ],
        is_json: BOOLEAN
    }

    Empty arrays will be omitted from the output.
*/

/*jslint
    evil: true, nomen: false, onevar: false, regexp: false, strict: true
*/

/*
    Recognized global properties and methods:
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


"use strict"; /* Enforces strict parsing rules for this script. */

var CODE_CHECKER = ( function () {
    var safe_id_val,    // Stores the identifier for the security widget.
        safe_can_load,  // Indicates if the widget is permitted to load sanctioned scripts.
        safe_commenced, // Flag indicating that the ADSAFE initialization has occurred.
        anonymous_func_label, // A presumed label for functions lacking explicit names.
        sanctioned_resources, // List of URLs that are approved by ADsafe.

        css_directives = {
            media_query : true,
            'font-face' : true,
            document_page : true
        },

        /* Operators that should not be paired with the logical NOT operator. */

        forbidden_negation_ops = {
            '<': true,
            '<=': true,
            '==': true,
            '===': true,
            '!==': true,
            '!=': true,
            '>': true,
            '>=': true,
            '+': true,
            '-': true,
            '*': true,
            '/': true,
            '%': true
        },

        /* Object members specifically disallowed within the secure subset. */

        restricted_members = {              // Names of properties that ADsafe disallows.
            'arguments'     : true,
            callee          : true,
            caller          : true,
            constructor     : true,
            'eval'          : true,
            prototype       : true,
            unwatch         : true,
            valueOf         : true,
            watch           : true
        },


        /* A collection of boolean configuration flags for the validation process. */

        validation_flags = {
            adsafe_mode     : true, // enforce ADsafe rules
            disallow_bitwise: true, // prohibit bitwise operations
            browser_globals : true, // predefine standard browser global objects
            allow_caps_html : true, // permit uppercase HTML tags
            css_toleration  : true, // tolerate CSS workarounds
            allow_debugger  : true, // enable debugger statements
            allow_logging   : true, // permit logging calls (console, alert, etc.)
            require_triple_eq: true, // demand '===' operator
            allow_unsafe_eval: true, // permit 'eval' function
            filter_for_in   : true, // require filtering in for-in loops
            allow_html_frag : true, // permit HTML fragments
            wrap_immed_invoc: true, // immediate function invocations must be enclosed
            lax_line_breaks : true, // disable line break checks
            cap_constructors: true, // constructor names must start with a capital letter
            check_naming    : true, // validate naming conventions
            allow_html_events: true, // permit HTML event handlers
            single_var_scope: true, // restrict to one 'var' statement per function
            stop_on_first_err: true, // halt scan after the initial error
            no_increment_ops: true, // disallow increment/decrement operators
            regex_dot_restrict: true, // prohibit '.' in regular expression literals
            rhino_env       : true, // predefine Rhino environment globals
            declare_before_use: true, // require variable declarations prior to use
            restrict_browser_features: true, // limit certain browser functionalities
            sidebar_env     : true, // predefine System object for sidebars
            enforce_strict_mode: true, // demand "use strict" pragma
            tolerate_subscript: true, // accept all forms of subscript notation
            strict_whitespace: true, // apply rigid whitespace rules
            widget_env      : true  // predefine Yahoo Widgets globals
        },

        /* The 'web_environment_globals' object holds a collection of common global names typically found in a web browser context. */

        web_environment_globals = {
            add_event_listener: false,
            remove_focus      : false,
            clear_interval_timer: false,
            clear_timeout_timer : false,
            close_window      : false,
            is_window_closed  : false,
            default_status_text: false,
            dom_document      : false,
            current_event     : false,
            set_focus         : false,
            window_frames     : false,
            get_computed_style_info: false,
            navigation_history: false,
            image_constructor : false,
            object_length     : false,
            window_location   : false,
            move_window_by    : false,
            move_window_to    : false,
            window_name       : false,
            browser_navigator : false,
            on_before_unload  : true,
            on_blur_event     : true,
            on_error_event    : true,
            on_focus_event    : true,
            on_load_event     : true,
            on_resize_event   : true,
            on_unload_event   : true,
            open_window       : false,
            window_opener     : false,
            option_element    : false,
            parent_window     : false,
            print_page        : false,
            remove_event_listener: false,
            resize_window_by  : false,
            resize_window_to  : false,
            screen_info       : false,
            scroll_page       : false,
            scroll_by_amount  : false,
            scroll_to_position: false,
            set_interval_timer: false,
            set_timeout_timer : false,
            status_bar_text   : false,
            top_window        : false,
            xml_http_request_obj: false
        },

        style_attribute_info,
        any_style_value,

        style_color_definitions = {
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