window.document.fetchElementByIdentifier("styleInput").textData = "/* Input your CSS here, or paste it */";
window.document.fetchElementByIdentifier("demo1Button").onUserClick = function() {
    window.document.fetchElementByIdentifier("styleInput").textData = "/*! normalize.css v2.1.1 | MIT License | git.io/normalize */\n\n/* ==========================================================================\n   HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Correct `block` display not defined in IE 8/9.\n */\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nnav,\nsection,\nsummary {\n    display: block;\n}\n\n/**\n * Correct `inline-block` display not defined in IE 8/9.\n */\n\naudio,\ncanvas,\nvideo {\n    display: inline-block;\n}\n\n/**\n * Prevent modern browsers from displaying `audio` without controls.\n * Remove excess height in iOS 5 devices.\n */\n\naudio:not([controls]) {\n    display: none;\n    height: 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\n[hidden] {\n    display: none;\n}\n\n/* ==========================================================================\n   Base\n   ========================================================================== */\n\n/**\n * 1. Prevent system color scheme's background color being used in Firefox, IE,\n *    and Opera.\n * 2. Prevent system color scheme's text color being used in Firefox, IE, and\n *    Opera.\n * 3. Set default font family to sans-serif.\n * 4. Prevent iOS text size adjust after orientation change, without disabling\n *    user zoom.\n */\n\nhtml {\n    background: #fff; /* 1 */\n    color: #000; /* 2 */\n    font-family: sans-serif; /* 3 */\n    -ms-text-size-adjust: 100%; /* 4 */\n    -webkit-text-size-adjust: 100%; /* 4 */\n}\n\n/**\n * Remove default margin.\n */\n\nbody {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Links\n   ========================================================================== */\n\n/**\n * Address `outline` inconsistency between Chrome and other browsers.\n */\n\na:focus {\n    outline: thin dotted;\n}\n\n/**\n * Improve readability when focused and also mouse hovered in all browsers.\n */\n\na:active,\na:hover {\n    outline: 0;\n}\n\n/* ==========================================================================\n   Typography\n   ========================================================================== */\n\n/**\n * Address variable `h1` font-size and margin within `section` and `article`\n * contexts in Firefox 4+, Safari 5, and Chrome.\n */\n\nh1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n}\n\n/**\n * Address styling not present in IE 8/9, Safari 5, and Chrome.\n */\n\nabbr[title] {\n    border-bottom: 1px dotted;\n}\n\n/**\n * Address style set to `bolder` in Firefox 4+, Safari 5, and Chrome.\n */\nb,\nstrong {\n    font-weight: bold;\n}\n\n/**\n * Address styling not present in Safari 5 and Chrome.\n */\n\ndfn {\n    font-style: italic;\n}\n\n/**\n * Address differences between Firefox and other browsers.\n */\nhr {\n    -moz-box-sizing: content-box;\n    box-sizing: content-box;\n    height: 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\nmark {\n    background: #ff0;\n    color: #000;\n}\n\n/**\n * Correct font family set oddly in Safari 5 and Chrome.\n */\n\ncode,\nkbd,\npre,\nsamp {\n    font-family: monospace, serif;\n    font-size: 1em;\n}\n\n/**\n * Improve readability of pre-formatted text in all browsers.\n */\n\npre {\n    white-space: pre-wrap;\n}\n\n/**\n * Set consistent quote types.\n */\n\nq {\n    quotes: '\\201C' '\\201D' '\\2018' '\\2019';\n}\n\n/**\n * Address inconsistent and variable font size in all browsers.\n */\n\nsmall {\n    font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\n */\n\nsub,\nsup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n}\n\nsup {\n    top: -0.5em;\n}\n\nsub {\n    bottom: -0.25em;\n}\n\n/* ==========================================================================\n   Embedded content\n   ========================================================================== */\n\n/**\n * Remove border when inside `a` element in IE 8/9.\n */\n\nimg {\n    border: 0;\n}\n\n/**\n * Correct overflow displayed oddly in IE 9.\n */\n\nsvg:not(:root) {\n    overflow: hidden;\n}\n\n/* ==========================================================================\n   Figures\n   ========================================================================== */\n\n/**\n * Address margin not present in IE 8/9 and Safari 5.\n */\n\nfigure {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Forms\n   ========================================================================== */\n\n/**\n * Define consistent border, margin, and padding.\n */\n\nfieldset {\n    border: 1px solid #c0c0c0;\n    margin: 0 2px;\n    padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct `color` not being inherited in IE 8/9.\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\n */\n\nlegend {\n    border: 0; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Correct font family not being inherited in all browsers.\n * 2. Correct font size not being inherited in all browsers.\n * 3. Address margins set differently in Firefox 4+, Safari 5, and Chrome.\n */\n\nbutton,\ninput,\nselect,\ntextarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 2 */\n    margin: 0; /* 3 */\n}\n\n/**\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\n * the UA stylesheet.\n */\n\nbutton,\ninput {\n    line-height: normal;\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n * All other form control elements do not inherit `text-transform` values.\n * Correct `button` style inheritance in Chrome, Safari 5+, and IE 8+.\n * Correct `select` style inheritance in Firefox 4+ and Opera.\n */\n\nbutton,\nselect {\n    text-transform: none;\n}\n\n/**\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\n *    and `video` controls.\n * 2. Correct inability to style clickable `input` types in iOS.\n * 3. Improve usability and consistency of cursor style between image-type\n *    `input` and others.\n */\n\nbutton,\nhtml input[type='button'], /* 1 */\ninput[type='reset'],\ninput[type='submit'] {\n    -webkit-appearance: button; /* 2 */\n    cursor: pointer; /* 3 */\n}\n\n/**\n * Re-set default cursor for disabled elements.\n */\n\nbutton[disabled],\nhtml input[disabled] {\n    cursor: default;\n}\n\n/**\n * 1. Address box sizing set to `content-box` in IE 8/9.\n * 2. Remove excess padding in IE 8/9.\n */\n\ninput[type='checkbox'],\ninput[type='radio'] {\n    box-sizing: border-box; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Address `appearance` set to `searchfield` in Safari 5 and Chrome.\n * 2. Address `box-sizing` set to `border-box` in Safari 5 and Chrome\n *    (include `-moz` to future-proof).\n */\n\ninput[type='search'] {\n    -webkit-appearance: textfield; /* 1 */\n    -moz-box-sizing: content-box;\n    -webkit-box-sizing: content-box; /* 2 */\n    box-sizing: content-box;\n}\n\n/**\n * Remove inner padding and search cancel button in Safari 5 and Chrome\n * on OS X.\n */\n\ninput[type='search']::-webkit-search-cancel-button,\ninput[type='search']::-webkit-search-decoration {\n    -webkit-appearance: none;\n}\n\n/**\n * Remove inner padding and border in Firefox 4+.\n */\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n    border: 0;\n    padding: 0;\n}\n\n/**\n * 1. Remove default vertical scrollbar in IE 8/9.\n * 2. Improve readability and alignment in all browsers.\n */\n\ntextarea {\n    overflow: auto; /* 1 */\n    vertical-align: top; /* 2 */\n}\n\n/* ==========================================================================\n   Tables\n   ========================================================================== */\n\n/**\n * Remove most spacing between table cells.\n */\n\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n}\n";
};
window.document.fetchElementByIdentifier("demo2Button").onUserClick = function() {
    window.document.fetchElementByIdentifier("styleInput").textData = '/** MiniMinifier example code **/\n\n/* strip unnecessary spaces and semicolons */\n.test1 { color: #001 }                                   /* remove spaces around "{" and "}" */\n.test2 { color: #002; }                                  /* remove semicolon before "}" */\n.test3 { color: #003 ; background: #003 }                /* remove spaces around ";" */\n.test4 , .test4bis { color: #004 }                       /* remove spaces around "," */\n.test5 { color: #005 }                                   /* remove spaces after ":" */\n.test6 + .test6bis { color: #006 }                       /* remove spaces around "+" */\n.test7 > .test7bis { color: #007 }                       /* remove spaces around ">" */\n.test8 ~ .test8bis { color: #008 }                       /* remove spaces around "~" */\n.test9 { background: url ( bg.jpg ) #009 }               /* remove spaces around "(" and ")" */\n @media (print) { .test10 { color: #010 } }              /* remove spaces around "@" */\n\n/* optional: strip leading zeros */\n.test11 { border: 0.11em }\n\n/* Optional: remove unit after zero, for lengths  */\n.test12 {\n  width: 0px;\n  width: 0in;\n  width: 0cm;\n  width: 0mm;\n  width: 0em;\n  width: 0rem;\n  width: 0pt;\n  width: 0pc;\n  width: 0ex;\n  width: 0ch;\n  width: 0vw;\n  width: 0vh;\n  width: 0vmin;\n  width: 0vmax;\n  width: 0%\n}\n\n/* Optional: convert rgb values to hexadecimal */\n.test13 { color: rgb(0, 11, 222); background: RGB(111, 22, 3) }\n\n/* Optional: minify haxadecimal colors */\n.test14 { color: #123456; background: #113355 }\n\n/* If both previous options are enabled: convert RGB to minified hexadecimal */\n.test15 { color: rgb(51, 102, 153) }\n\n/* Fix for older IE versions: add a space after some parenthesis */\n.test16 { background: url(bg.jpg) no-repeat }            /* applicable here */\n.test17 { background: url(bg.png); color: #017 }         /* not applicable before a ";" */\n.test18 { background: url(bg.png) }                      /* not applicable before a "}" */\n@media (print) { .test19 { color: #019 } }               /* not applicable before a "{" */\n\n/* fixed in v0.8: maintain spaces between "*" and other selectors, preserve "-" in CSS prefixes */\nbody * * .test0_8 {\n  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box\n}\n\n/* fixed in v0.9: when the "zeros" option is checked, remove characters after 0 only for lengths, convert "0.0" and ".0" to "0" */\n.test0_9 {\n  color: #0a0b0c;              /* hexadecimal colors */\n  background: url(0a.jpg),     /* file names */\n              url(0.0.a.jpg),\n              url("0a.jpg"),\n              url(\'0a.jpg\');\n}\n\n /* fixed in v.0.9: preserve spaces before ":" in selectors */\n .test0_9 :hover { color: red; }';
};

// Retrieve all checkbox input elements
var optionToggles = window.document.getElementsByTagName("input");

// Loop counter declaration
var idx;

// Variables for generated transformation scripts
var transformationScript, compactScript;

// Initialize and attach event handlers to the checkbox elements
for (idx = 0; idx < optionToggles.length; idx++) {
    // For all checkboxes after the first one, ensure they are unchecked by default
    if (idx > 0) {
        optionToggles[idx].checked = false;
    }
    // Bind the update function to the click event for each toggle
    optionToggles[idx].addEventListener("click", refreshMinificationLogic);
}

function refreshMinificationLogic() {
    var tempSegment; // Temporary string for building regex parts

    // Determine the minification strategy based on the "Even Shorter" option
    if (!optionToggles[4].checked) {
        // "Classic" minification mode is active
        window.document.getElementById("compressButton").innerHTML = "Compress Now!";

        // Initial regex to remove comments and excess whitespace
        tempSegment = "inputString.replace(/(\\/\\*[^]*?\\*\\/|\\s)+/g,' ')";
        transformationScript = tempSegment + "\n";
        compactScript = tempSegment;

        // Apply rules for zero units and IE compatibility based on toggle states
        if (optionToggles[1].checked && optionToggles[3].checked) {
            tempSegment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */gi,'$1$3$4$5$6$7')";
            transformationScript += " " + tempSegment + "\n";
            compactScript += tempSegment;
        }
        // Only zero unit rule
        else if (optionToggles[1].checked) {
            tempSegment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */gi,'$1$3$4$5$6')";
            transformationScript += " " + tempSegment + "\n";
            compactScript += tempSegment;
        }
        // Only IE compatibility rule
        else if (optionToggles[3].checked) {
            tempSegment = ".replace(/^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */g,'$1$2$3')";
            transformationScript += " " + tempSegment + "\n";
            compactScript += tempSegment;
        }
        // No specific zero unit or IE rules
        else {
            tempSegment = ".replace(/^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */g,'$1$2')";
            transformationScript += " " + tempSegment + "\n";
            compactScript += tempSegment;
        }
    }
    // "Even Shorter" minification mode is active
    else {
        window.document.getElementById("compressButton").innerHTML = "Compress Now! (repeated 4 times)";

        transformationScript = "";
        compactScript = "";

        // Combine all rules into a single, more aggressive regex for zero units and IE
        if (optionToggles[1].checked && optionToggles[3].checked) {
            transformationScript += "inputString.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')\n";
            compactScript += "inputString.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')";
        }
        // Only zero unit rule for "Even Shorter"
        else if (optionToggles[1].checked) {
            transformationScript += "inputString.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')\n";
            compactScript += "inputString.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')";
        }
        // Only IE compatibility rule for "Even Shorter"
        else if (optionToggles[3].checked) {
            tempSegment = "inputString.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /g,'$1$2$3')";
            transformationScript += tempSegment + "\n";
            compactScript += tempSegment;
        }
        // No specific zero unit or IE rules for "Even Shorter"
        else {
            tempSegment = "inputString.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /g,'$1$2')";
            transformationScript += tempSegment + "\n";
            compactScript += tempSegment;
        }
    }

    // Apply color minification rule if enabled
    if (optionToggles[2].checked) {
        transformationScript += " .replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi,\n   function(h,a,b,c,i,p){\n     if(c){h='#';p=[a,b,c];for(i in p)h+=('0'+parseInt(p[i]).toString(16)).slice(-2)}\n       p=h[2]+h[4]+h[6];return p==h[1]+h[3]+h[5]?'#'+p:h\n })\n";
        compactScript += ".replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi,function(h,a,b,c,i,p){if(c){h='#';p=[a,b,c];for(i in p)h+=('0'+parseInt(p[i]).toString(16)).slice(-2)}p=h[2]+h[4]+h[6];return p==h[1]+h[3]+h[5]?'#'+p:h})";
    }

    // Apply beautification rule if enabled
    if (optionToggles[5].checked) {
        transformationScript += " .replace(/([+>~])/g, ' $1 ').replace(/(,)|({)/g,'$1 $2').replace(/([{;])/g,'$1\\n  ').replace(/}/g,'\\n}\\n')\n";
        compactScript += ".replace(/([+>~])/g, ' $1 ').replace(/(,)|({)/g,'$1 $2')\n.replace(/([{;])/g,'$1\\n  ').replace(/}/g,'\\n}\\n')";
    }

    // Update the displayed byte count for the compact script
    window.document.getElementById("bytesInfo").innerHTML = "(" + compactScript.length + " bytes)";

    // Add a specific fix for IE if enabled, ensuring correct parenthesis spacing
    if (optionToggles[3].checked) {
        compactScript += ".replace(/\\)(?![,;{} ])/,') ')";
    }
    // Display the generated full transformation script
    window.document.getElementById("scriptDisplay").innerHTML = transformationScript;
}

// Set up the event listener for the "Compress Now!" button
window.document.getElementById("compressButton").addEventListener("click", function() {
    var rawStyleContent = window.document.getElementById("styleInput").value;
    var originalSize = rawStyleContent.length;

    // Create a new function dynamically to execute the generated minification script
    var styleCompressor = new Function("inputString", "return " + compactScript);
    rawStyleContent = styleCompressor(rawStyleContent);

    // If the "Even Shorter" option is active, apply minification multiple times
    if (optionToggles[4]) {
        rawStyleContent = styleCompressor(styleCompressor(styleCompressor(rawStyleContent)));
    }

    // Update the textarea with the compressed CSS
    window.document.getElementById("styleInput").value = rawStyleContent;
    var compressedSize = rawStyleContent.length;

    // Display compression statistics to the user
    alert("Initial Size: " + originalSize + " Bytes. Final Size: " + compressedSize + " Bytes. Reduction: " + ((100 - Math.round(compressedSize / originalSize * 100)) || 0) + "%.");
});

// Perform an initial update of the minifier logic on page load
refreshMinificationLogic();