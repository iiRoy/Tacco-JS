const styleInputArea = document.querySelector("#css");
const presetOneButton = document.querySelector("#ex1");
const presetTwoButton = document.querySelector("#ex2");

const sampleContentRepository = new Map([
    ["normalizeCss", `/*! normalize.css v2.1.1 | MIT License | git.io/normalize */

/* ==========================================================================
   HTML5 display definitions
   ========================================================================== */

/**
 * Correct \`block\` display not defined in IE 8/9.
 */

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
nav,
section,
summary {
    display: block;
}

/**
 * Correct \`inline-block\` display not defined in IE 8/9.
 */

audio,
canvas,
video {
    display: inline-block;
}

/**
 * Prevent modern browsers from displaying \`audio\` without controls.
 * Remove excess height in iOS 5 devices.
 */

audio:not([controls]) {
    display: none;
    height: 0;
}

/**
 * Address styling not present in IE 8/9.
 */

[hidden] {
    display: none;
}

/* ==========================================================================
   Base
   ========================================================================== */

/**
 * 1. Prevent system color scheme's background color being used in Firefox, IE,
 *    and Opera.
 * 2. Prevent system color scheme's text color being used in Firefox, IE, and
 *    Opera.
 * 3. Set default font family to sans-serif.
 * 4. Prevent iOS text size adjust after orientation change, without disabling
 *    user zoom.
 */

html {
    background: #fff; /* 1 */
    color: #000; /* 2 */
    font-family: sans-serif; /* 3 */
    -ms-text-size-adjust: 100%; /* 4 */
    -webkit-text-size-adjust: 100%; /* 4 */
}

/**
 * Remove default margin.
 */

body {
    margin: 0;
}

/* ==========================================================================
   Links
   ========================================================================== */

/**
 * Address \`outline\` inconsistency between Chrome and other browsers.
 */

a:focus {
    outline: thin dotted;
}

/**
 * Improve readability when focused and also mouse hovered in all browsers.
 */

a:active,
a:hover {
    outline: 0;
}

/* ==========================================================================
   Typography
   ========================================================================== */

/**
 * Address variable \`h1\` font-size and margin within \`section\` and \`article\`
 * contexts in Firefox 4+, Safari 5, and Chrome.
 */

h1 {
    font-size: 2em;
    margin: 0.67em 0;
}

/**
 * Address styling not present in IE 8/9, Safari 5, and Chrome.
 */

abbr[title] {
    border-bottom: 1px dotted;
}

/**
 * Address style set to \`bolder\` in Firefox 4+, Safari 5, and Chrome.
 */

b,
strong {
    font-weight: bold;
}

/**
 * Address styling not present in Safari 5 and Chrome.
 */

dfn {
    font-style: italic;
}

/**
 * Address differences between Firefox and other browsers.
 */

hr {
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    height: 0;
}

/**
 * Address styling not present in IE 8/9.
 */

mark {
    background: #ff0;
    color: #000;
}

/**
 * Correct font family set oddly in Safari 5 and Chrome.
 */

code,
kbd,
pre,
samp {
    font-family: monospace, serif;
    font-size: 1em;
}

/**
 * Improve readability of pre-formatted text in all browsers.
 */

pre {
    white-space: pre-wrap;
}

/**
 * Set consistent quote types.
 */

q {
    quotes: '\\201C' '\\201D' '\\2018' '\\2019';
}

/**
 * Address inconsistent and variable font size in all browsers.
 */

small {
    font-size: 80%;
}

/**
 * Prevent \`sub\` and \`sup\` affecting \`line-height\` in all browsers.
 */

sub,
sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
}

sup {
    top: -0.5em;
}

sub {
    bottom: -0.25em;
}

/* ==========================================================================
   Embedded content
   ========================================================================== */

/**
 * Remove border when inside \`a\` element in IE 8/9.
 */

img {
    border: 0;
}

/**
 * Correct overflow displayed oddly in IE 9.
 */

svg:not(:root) {
    overflow: hidden;
}

/* ==========================================================================
   Figures
   ========================================================================== */

/**
 * Address margin not present in IE 8/9 and Safari 5.
 */

figure {
    margin: 0;
}

/* ==========================================================================
   Forms
   ========================================================================== */

/**
 * Define consistent border, margin, and padding.
 */

fieldset {
    border: 1px solid #c0c0c0;
    margin: 0 2px;
    padding: 0.35em 0.625em 0.75em;
}

/**
 * 1. Correct \`color\` not being inherited in IE 8/9.
 * 2. Remove padding so people aren't caught out if they zero out fieldsets.
 */

legend {
    border: 0; /* 1 */
    padding: 0; /* 2 */
}

/**
 * 1. Correct font family not being inherited in all browsers.
 * 2. Correct font size not being inherited in all browsers.
 * 3. Address margins set differently in Firefox 4+, Safari 5, and Chrome.
 */

button,
input,
select,
textarea {
    font-family: inherit; /* 1 */
    font-size: 100%; /* 2 */
    margin: 0; /* 3 */
}

/**
 * Address Firefox 4+ setting \`line-height\` on \`input\` using \`!important\` in
 * the UA stylesheet.
 */

button,
input {
    line-height: normal;
}

/**
 * Address inconsistent \`text-transform\` inheritance for \`button\` and \`select\`.
 * All other form control elements do not inherit \`text-transform\` values.
 * Correct \`button\` style inheritance in Chrome, Safari 5+, and IE 8+.
 * Correct \`select\` style inheritance in Firefox 4+ and Opera.
 */

button,
select {
    text-transform: none;
}

/**
 * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native \`audio\`
 *    and \`video\` controls.
 * 2. Correct inability to style clickable \`input\` types in iOS.
 * 3. Improve usability and consistency of cursor style between image-type
 *    \`input\` and others.
 */

button,
html input[type='button'], /* 1 */
input[type='reset'],
input[type='submit'] {
    -webkit-appearance: button; /* 2 */
    cursor: pointer; /* 3 */
}

/**
 * Re-set default cursor for disabled elements.
 */

button[disabled],
html input[disabled] {
    cursor: default;
}

/**
 * 1. Address box sizing set to \`content-box\` in IE 8/9.
 * 2. Remove excess padding in IE 8/9.
 */

input[type='checkbox'],
input[type='radio'] {
    box-sizing: border-box; /* 1 */
    padding: 0; /* 2 */
}

/**
 * 1. Address \`appearance\` set to \`searchfield\` in Safari 5 and Chrome.
 * 2. Address \`box-sizing\` set to \`border-box\` in Safari 5 and Chrome
 *    (include \`-moz\` to future-proof).
 */

input[type='search'] {
    -webkit-appearance: textfield; /* 1 */
    -moz-box-sizing: content-box;
    -webkit-box-sizing: content-box; /* 2 */
    box-sizing: content-box;
}

/**
 * Remove inner padding and search cancel button in Safari 5 and Chrome
 * on OS X.
 */

input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-decoration {
    -webkit-appearance: none;
}

/**
 * Remove inner padding and border in Firefox 4+.
 */

button::-moz-focus-inner,
input::-moz-focus-inner {
    border: 0;
    padding: 0;
}

/**
 * 1. Remove default vertical scrollbar in IE 8/9.
 * 2. Improve readability and alignment in all browsers.
 */

textarea {
    overflow: auto; /* 1 */
    vertical-align: top; /* 2 */
}

/* ==========================================================================
   Tables
   ========================================================================== */

/**
 * Remove most spacing between table cells.
 */

table {
    border-collapse: collapse;
    border-spacing: 0;
}
`],
    ["minifierTest", `/** MiniMinifier test code **/

/* remove unnecessary spaces and semicolons */
.test1 { color: #001 }                                   /* remove spaces around "{" and "}" */
.test2 { color: #002; }                                  /* remove semicolon before "}" */
.test3 { color: #003 ; background: #003 }                /* remove spaces around ";" */
.test4 , .test4bis { color: #004 }                       /* remove spaces around "," */
.test5 { color: #005 }                                   /* remove spaces after ":" */
.test6 + .test6bis { color: #006 }                       /* remove spaces around "+" */
.test7 > .test7bis { color: #007 }                       /* remove spaces around ">" */
.test8 ~ .test8bis { color: #008 }                       /* remove spaces around "~" */
.test9 { background: url ( bg.jpg ) #009 }               /* remove spaces around "(" and ")" */
 @media (print) { .test10 { color: #010 } }              /* remove spaces around "@" */

/* optional: remove leading zeros */
.test11 { border: 0.11em }

/* Optional: remove unit after zero, for lengths  */
.test12 {
  width: 0px;
  width: 0in;
  width: 0cm;
  width: 0mm;
  width: 0em;
  width: 0rem;
  width: 0pt;
  width: 0pc;
  width: 0ex;
  width: 0ch;
  width: 0vw;
  width: 0vh;
  width: 0vmin;
  width: 0vmax;
  width: 0%
}

/* Optional: convert rgb in hexadecimal */
.test13 { color: rgb(0, 11, 222); background: RGB(111, 22, 3) }

/* Optional: minify haxadecimal colors */
.test14 { color: #123456; background: #113355 }

/* If both previous options are enabled: convert RGB to minified hexadecimal */
.test15 { color: rgb(51, 102, 153) }

/* Fix for old IE versions: add a space after some parenthesis */
.test16 { background: url(bg.jpg) no-repeat }            /* applicable here */
.test17 { background: url(bg.png); color: #017 }         /* not applicable before a ";" */
.test18 { background: url(bg.png) }                      /* not applicable before a "}" */
@media (print) { .test19 { color: #019 } }               /* not applicable before a "{" */

/* fixed in v0.8: keep spaces between "*" and other selectors, keep "-" in CSS prefixes */
body * * .test0_8 {
  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box
}

/* fixed in v0.9: when the "zeros" option is checked, remove characters after 0 only for lengths, convert "0.0" and ".0" to "0" */
.test0_9 {
  color: #0a0b0c;              /* hexadecimal colors */
  background: url(0a.jpg),     /* file names */
              url(0.0.a.jpg),
              url("0a.jpg"),
              url('0a.jpg');
}

 /* fixed in v.0.9: keep spaces before ":" in selectors */
 .test0_9 :hover { color: red; }`]
]);

styleInputArea.value = "/* Write or paste your CSS here */";
presetOneButton.addEventListener("click", () => { styleInputArea.value = sampleContentRepository.get("normalizeCss"); });
presetTwoButton.addEventListener("click", () => { styleInputArea.value = sampleContentRepository.get("minifierTest"); });

// Configuration toggles (checkboxes) management
const configurationToggles = new Map();
document.querySelectorAll("input[type='checkbox']").forEach((element, idx) => {
    const featureKey = ["minifyCssLabel", "zeroStrip", "colorOptimize", "ieCompat", "ultraCompact", "beautifyFormat"][idx];
    configurationToggles.set(featureKey, element);
    if (idx > 0) { // All checkboxes except the first (which is just a label) are unchecked by default
        element.checked = false;
    }
    element.addEventListener("click", rebuildProcessingEngine);
});

let processingExpressionFormula = ""; // This string will hold the dynamic JavaScript code for minification

// Lookup table for transformation parts as strings to match original's minicode byte count
const transformationFormulaSegments = new Map([
    // Classic mode initial (includes 'sourceText.' prefix)
    ["baseClassicInitial", `sourceText.replace(/(\\/\\*[^]*?\\*\\/|\\s)+/g,' ')`],

    // Classic mode subsequent (no 'sourceText.' prefix)
    ["zeroIeClassicSubsequent", `.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */gi,'$1$3$4$5$6$7')`],
    ["zeroOnlyClassicSubsequent", `.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */gi,'$1$3$4$5$6')`],
    ["ieOnlyClassicSubsequent", `.replace(/^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */g,'$1$2$3')`],
    ["defaultClassicSubsequent", `.replace(/^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */g,'$1$2')`],

    // Even shorter mode (includes 'sourceText.' prefix, incorporates comment/space removal into the main regex)
    ["zeroIeUltraCompactInitial", `sourceText.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')`],
    ["zeroOnlyUltraCompactInitial", `sourceText.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')`],
    ["ieOnlyUltraCompactInitial", `sourceText.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\\)'\"\\s*-])\\s*|\\s(\\))|(:) /g,'$1$2$3')`],
    ["defaultUltraCompactInitial", `sourceText.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /g,'$1$2')`],

    // Color minification (subsequent)
    ["colorOptimizationSubsequent", `.replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi,function(h,a,b,c,i,p){if(c){h='#';p=[a,b,c];for(i in p)h+=('0'+parseInt(p[i]).toString(16)).slice(-2)}p=h[2]+h[4]+h[6];return p==h[1]+h[3]+h[5]?'#'+p:h})`],

    // Beautify (subsequent, includes newline as per original's minicode string)
    ["beautifyFormattingSubsequent", `.replace(/([+>~])/g, ' $1 ').replace(/(,)|({)/g,'$1 $2')\n.replace(/([{;])/g,'$1\\n  ').replace(/}/g,'\\n}\\n')`],

    // IE final fix (subsequent)
    ["ieFinalCorrectionSubsequent", `.replace(/\\)(?![,;{} ])/,') ')`]
]);

function rebuildProcessingEngine() {
    let formulaParts = [];
    const controlLabel = document.querySelector("#minify");
    const bytesDisplay = document.querySelector("#bytes");

    const isUltraCompact = configurationToggles.get("ultraCompact").checked;
    const stripZeros = configurationToggles.get("zeroStrip").checked;
    const ieFixes = configurationToggles.get("ieCompat").checked;
    const optimizeColors = configurationToggles.get("colorOptimize").checked;
    const formatBeautify = configurationToggles.get("beautifyFormat").checked;

    if (!isUltraCompact) {
        controlLabel.textContent = "Compress!";
        formulaParts.push(transformationFormulaSegments.get("baseClassicInitial"));

        let coreSegmentKey;
        if (stripZeros && ieFixes) {
            coreSegmentKey = "zeroIeClassicSubsequent";
        } else if (stripZeros) {
            coreSegmentKey = "zeroOnlyClassicSubsequent";
        } else if (ieFixes) {
            coreSegmentKey = "ieOnlyClassicSubsequent";
        } else {
            coreSegmentKey = "defaultClassicSubsequent";
        }
        formulaParts.push(transformationFormulaSegments.get(coreSegmentKey));
    } else {
        controlLabel.textContent = "Compress! (repeated 4x)";
        let coreSegmentKey;
        if (stripZeros && ieFixes) {
            coreSegmentKey = "zeroIeUltraCompactInitial";
        } else if (stripZeros) {
            coreSegmentKey = "zeroOnlyUltraCompactInitial";
        } else if (ieFixes) {
            coreSegmentKey = "ieOnlyUltraCompactInitial";
        } else {
            coreSegmentKey = "defaultUltraCompactInitial";
        }
        formulaParts.push(transformationFormulaSegments.get(coreSegmentKey));
    }

    if (optimizeColors) {
        formulaParts.push(transformationFormulaSegments.get("colorOptimizationSubsequent"));
    }

    if (formatBeautify) {
        formulaParts.push(transformationFormulaSegments.get("beautifyFormattingSubsequent"));
    }
    
    processingExpressionFormula = formulaParts.join("");

    if (ieFixes) {
        processingExpressionFormula += transformationFormulaSegments.get("ieFinalCorrectionSubsequent");
    }
    
    bytesDisplay.textContent = `(${processingExpressionFormula.length} bytes)`;
}

const activationButton = document.querySelector("#minify");
activationButton.addEventListener("click", () => {
    let currentStyleContent = styleInputArea.value;
    const initialLength = currentStyleContent.length;
    
    // Create a new function dynamically to execute the generated processing logic
    const contentProcessor = new Function("sourceText", "return " + processingExpressionFormula);
    
    currentStyleContent = contentProcessor(currentStyleContent);
    
    // Apply additional repetitions if 'Even shorter' mode is active
    if (configurationToggles.get("ultraCompact").checked) {
        currentStyleContent = contentProcessor(contentProcessor(contentProcessor(currentStyleContent)));
    }
    
    styleInputArea.value = currentStyleContent;
    const finalLength = currentStyleContent.length;
    const percentageSaved = ((100 - Math.round(finalLength / initialLength * 100)) || 0);
    alert(`Before: ${initialLength} Bytes. After: ${finalLength} Bytes. Saved: ${percentageSaved}%.`);
});

rebuildProcessingEngine();