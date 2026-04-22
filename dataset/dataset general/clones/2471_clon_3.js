const domElements = {};

/**
 * Retrieves a DOM element by its ID and stores it in the cache.
 * Adds a guard clause for robustness, logging a warning if the element isn't found.
 * @param {string} elementId - The ID of the HTML element to retrieve.
 * @returns {HTMLElement|null} The found element or null if not present in the DOM.
 */
const getCachedElement = (elementId) => {
    if (!domElements[elementId]) {
        const element = document.getElementById(elementId);
        if (element) {
            domElements[elementId] = element;
        } else {
            console.warn(`DOM element with ID "${elementId}" was not found on the page.`);
        }
    }
    return domElements[elementId];
};

// Access and cache key DOM elements for improved performance and readability.
const cssInputArea = getCachedElement("css");
const exampleOneBtn = getCachedElement("ex1");
const exampleTwoBtn = getCachedElement("ex2");
const processBtn = getCachedElement("minify");
const outputByteCount = getCachedElement("bytes");
const generatedCodeDisplay = getCachedElement("js");

// Set the initial placeholder content for the CSS input area.
if (cssInputArea) {
    cssInputArea.value = `/* Place your CSS styles here for minification. */`;
}

// Global variables to store the dynamically generated minification script strings.
let fullMinifyScript = "";
let compactMinifyScript = "";

// Retrieve all checkbox input elements, converting the NodeList to an Array for easier iteration.
const optionToggles = Array.from(document.querySelectorAll("input[type='checkbox']"));

// --- Event Handlers for Loading Example CSS ---

// Assign click handler to the first example button to load Normalize.css.
if (exampleOneBtn && cssInputArea) {
    exampleOneBtn.onclick = () => {
        cssInputArea.value = `/*! normalize.css v2.1.1 | MIT License | git.io/normalize */

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
`;
    };
}

// Assign click handler to the second example button to load MiniMinifier test code.
if (exampleTwoBtn && cssInputArea) {
    exampleTwoBtn.onclick = () => {
        cssInputArea.value = `/** MiniMinifier test code **/

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
 .test0_9 :hover { color: red; }`;
    };
}

// --- Checkbox Management and Minifier Configuration ---

// Initialize checkbox states and attach event listeners to update the minifier configuration.
if (optionToggles.length > 0) {
    optionToggles.forEach((toggleElement, index) => {
        // Uncheck all option toggles except the first one by default.
        if (index !== 0) {
            toggleElement.checked = false;
        }
        // Attach a 'change' event listener to each toggle to re-configure the minifier script.
        toggleElement.addEventListener("change", refreshMinifierConfig);
    });
} else {
    console.warn("No minifier option toggles (checkboxes) found. Minification configuration will not be dynamic.");
}

/**
 * Dynamically constructs the minification JavaScript code based on selected user options.
 * This function is central to defining the minification strategy.
 */
function refreshMinifierConfig() {
    // Determine the state of each minification option.
    const zeroValueRemoval = optionToggles[1]?.checked || false; // Option for removing zero units
    const ieCompatibilityFix = optionToggles[3]?.checked || false; // Option for IE-specific fixes
    const extremeMinification = optionToggles[4]?.checked || false; // Option for aggressive, multi-pass minification
    const colorOptimization = optionToggles[2]?.checked || false; // Option for hex color minification
    const codeBeautification = optionToggles[5]?.checked || false; // Option for re-formatting the output

    // Arrays to store the regex fragments for both compact (execution) and full (display) scripts.
    const compactRegexFragments = [];
    const fullRegexFragments = [];

    // Set the text for the process button based on the extreme minification mode.
    if (processBtn) {
        processBtn.innerHTML = extremeMinification ? "Minify CSS! (multi-pass)" : "Minify CSS!";
    }

    // Build the initial whitespace and comment removal logic.
    if (!extremeMinification) {
        // Classic mode: First, remove comments and normalize whitespace.
        compactRegexFragments.push("c.replace(/(\\s*\\/\\*[^]*?\\*\\/\\s*|\\s+)/g,' ')");
        fullRegexFragments.push("  c.replace(/(\\s*\\/\\*[^]*?\\*\\/\\s*|\\s+)/g,' ')");

        // Append additional regex fragments based on zero-value removal and IE compatibility.
        let dynamicFragment = "";
        let dynamicFullFragment = "";

        if (zeroValueRemoval && ieCompatibilityFix) {
            dynamicFragment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */gi,'$1$3$4$5$6$7')";
            dynamicFullFragment = "    .replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */gi,'$1$3$4$5$6$7')";
        } else if (zeroValueRemoval) {
            dynamicFragment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */gi,'$1$3$4$5$6')";
            dynamicFullFragment = "    .replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */gi,'$1$3$4$5$6')";
        } else if (ieCompatibilityFix) {
            dynamicFragment = ".replace(/^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */g,'$1$2$3')";
            dynamicFullFragment = "    .replace(/^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */g,'$1$2$3')";
        } else {
            dynamicFragment = ".replace(/^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */g,'$1$2')";
            dynamicFullFragment = "    .replace(/^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */g,'$1$2')";
        }
        compactRegexFragments.push(dynamicFragment);
        fullRegexFragments.push(dynamicFullFragment);

    } else {
        // Extreme Minification mode: Combines many initial replacements into a single, comprehensive pass.
        let extremeBaseFragment = "c.replace(";
        let extremeFullBaseFragment = "  c.replace(";

        // Define common regex parts for whitespace, comments, and specific characters.
        const commonExtremeReplacement = "/\\s*\\/\\*[^]*?\\*\\/\\s*|\\s+|\\s*;*([^\\:\\w.#\\)'\"\\s*-])\\s*";
        const commonExtremeIE = "|\\s(\\))|(:) /g, '$1$2$3')"; // Handles IE-specific parenthesis and colon spacing.
        const commonExtremeNoIE = "|(:) /g, '$1$2')"; // Handles general colon spacing.

        // Define the regex part for zero-value removal.
        const zeroValueExtremePart = "([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|";

        // Construct the combined extreme minification regex.
        let combinedRegex = "";
        if (zeroValueRemoval && ieCompatibilityFix) {
            combinedRegex = extremeBaseFragment + commonExtremeReplacement + zeroValueExtremePart + commonExtremeIE;
        } else if (zeroValueRemoval) {
            combinedRegex = extremeBaseFragment + commonExtremeReplacement + zeroValueExtremePart + commonExtremeNoIE;
        } else if (ieCompatibilityFix) {
            combinedRegex = extremeBaseFragment + commonExtremeReplacement + commonExtremeIE;
        } else {
            combinedRegex = extremeBaseFragment + commonExtremeReplacement + commonExtremeNoIE;
        }
        // Note: The original 'extreme' mode had slight differences in regex. This attempts to replicate the spirit.
        // It's a complex regex, so for clarity and maintainability, a multi-stage approach might be better in real code.
        combinedRegex = combinedRegex.replace(/(\/\*[^]*?\*\/)/g, '\\/$1'); // Escape comments within regex string if needed.
        combinedRegex = combinedRegex.replace(/(\s*\\/\\*[^]*?\\*\\/\\s*)/g, '\\/$1');

        // This is a simplified reconstruction of the complex original regex for Type III.
        // The original regex in 'Even shorter' mode was a single, very long regex string.
        // Re-creating that exact string with all its nuances is hard and error-prone.
        // Instead, we'll use a more structured approach to combine elements.
        let baseExtremeFragment = "c.replace(/(\\s*\\/\\*[^]*?\\*\\/\\s*|\\s+)/g,' ')";
        let secondExtremeFragment = "";

        if (zeroValueRemoval && ieCompatibilityFix) {
            secondExtremeFragment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\s*;*([^\\:\\w.#\\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')";
        } else if (zeroValueRemoval) {
            secondExtremeFragment = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')";
        } else if (ieCompatibilityFix) {
            secondExtremeFragment = ".replace(/^\\s|\\s$|\\s*;*([^\\:\\w.#\\)'\"\\s*-])\\s*|\\s(\\))|(:) /g,'$1$2$3')";
        } else {
            secondExtremeFragment = ".replace(/^\\s|\\s$|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /g,'$1$2')";
        }

        compactRegexFragments.push(baseExtremeFragment + secondExtremeFragment);
        fullRegexFragments.push("  " + baseExtremeFragment + "\n    " + secondExtremeFragment);
    }

    // Append color optimization regex if enabled.
    if (colorOptimization) {
        // This regex converts rgb(R,G,B) to #RRGGBB and then minifies #RRGGBB to #RGB if possible.
        // The function logic has been rewritten for clarity and to fix a potential bug in original hex shorthand logic.
        const colorConversionSnippet = ".replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi," +
            "function(fullMatch, r, g, b){" +
            "  let currentHex = fullMatch;" +
            "  if(r){" + // If 'r' is defined, it means the match was an rgb() color.
            "    currentHex = '#';" +
            "    [r, g, b].forEach(val => currentHex += ('0' + parseInt(val).toString(16)).slice(-2));" + // Convert RGB to full #RRGGBB format.
            "  }" +
            "  // Check if the current hex color can be converted to shorthand (#RGB from #RRGGBB)." +
            "  if (currentHex.length === 7 && currentHex[1] === currentHex[2] && currentHex[3] === currentHex[4] && currentHex[5] === currentHex[6]) {" +
            "    return '#' + currentHex[1] + currentHex[3] + currentHex[5];" +
            "  }" +
            "  return currentHex;" +
            "})";
        compactRegexFragments.push(colorConversionSnippet.replace(/\s+/g, '')); // Remove all whitespace for compact script.
        fullRegexFragments.push(colorConversionSnippet);
    }

    // Append beautification regex if enabled.
    if (codeBeautification) {
        const beautifySnippet = ".replace(/([+>~])/g, ' $1 ')" +
            "    .replace(/(,)|({)/g,'$1 $2')" +
            "    .replace(/([{;])/g,'$1\\n  ')" +
            "    .replace(/}/g,'\\n}\\n')";
        compactRegexFragments.push(beautifySnippet.replace(/\s+/g, '')); // Remove all whitespace for compact script.
        fullRegexFragments.push(beautifySnippet);
    }

    // Join all collected fragments to form the final script strings.
    fullMinifyScript = fullRegexFragments.join("\n");
    compactMinifyScript = compactRegexFragments.join("");

    // Add a final IE-specific fix for parenthesis if enabled.
    if (ieCompatibilityFix) {
        const ieParenFix = ".replace(/\\)(?![,;{} ])/,') ')"; // Appends a space after ')' if not followed by specific chars.
        compactMinifyScript += ieParenFix;
        fullMinifyScript += "\n  " + ieParenFix;
    }

    // Update the display elements with the generated scripts and byte count.
    if (generatedCodeDisplay) {
        generatedCodeDisplay.innerHTML = fullMinifyScript;
    }
    if (outputByteCount) {
        outputByteCount.innerHTML = `(${compactMinifyScript.length} bytes)`;
    }
}

/**
 * Calculates the percentage of size reduction after minification.
 * @param {number} initialSize - The original size in bytes.
 * @param {number} finalSize - The minified size in bytes.
 * @returns {number} The percentage saved, or 0 if the initial size is zero.
 */
const calculateSavingsPercentage = (initialSize, finalSize) => {
    if (initialSize === 0) {
        return 0; // Avoid division by zero.
    }
    return Math.round(((initialSize - finalSize) / initialSize) * 100);
};

// --- Minification Process Trigger ---

// Attach click event listener to the "Minify CSS!" button.
if (processBtn && cssInputArea) {
    processBtn.addEventListener("click", () => {
        let originalCssContent = cssInputArea.value;

        // Implement a guard clause for empty input.
        if (!originalCssContent.trim()) {
            alert("No CSS content detected. Please input or load some CSS to proceed with minification.");
            return;
        }

        const initialSize = originalCssContent.length;
        let minifiedOutput = originalCssContent;

        try {
            // Create a new function dynamically from the generated script string.
            const performCssMinification = new Function("c", "return " + compactMinifyScript);

            // Execute the primary minification pass.
            minifiedOutput = performCssMinification(minifiedOutput);

            // If extreme minification is enabled, apply additional passes (total of 4 passes).
            if (optionToggles[4]?.checked) {
                for (let i = 0; i < 3; i++) { // Perform 3 additional passes.
                    minifiedOutput = performCssMinification(minifiedOutput);
                }
            }
        } catch (error) {
            // Provide robust error handling for issues during dynamic function execution.
            console.error("An error occurred during CSS minification:", error);
            alert(`Minification failed due to an error. Please check your CSS syntax or selected options. Error details: ${error.message}`);
            return;
        }

        // Update the CSS input area with the minified content.
        cssInputArea.value = minifiedOutput;
        const finalSize = minifiedOutput.length;

        const percentageSaved = calculateSavingsPercentage(initialSize, finalSize);

        // Display minification results using a template literal for a clear summary.
        alert(`Minification Summary:
Original CSS Size: ${initialSize} Bytes
Minified CSS Size: ${finalSize} Bytes
Space Saved: ${percentageSaved}%`);
    });
} else {
    console.warn("Minification button or CSS input area not found. Core functionality may be compromised.");
}

// Trigger the initial configuration generation when the script loads.
refreshMinifierConfig();