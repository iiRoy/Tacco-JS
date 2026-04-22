/*
 * This section of the script initializes the main CSS textarea
 * with a placeholder message upon page load.
 * It also sets up example content for demonstration purposes.
 */

// Initialize the CSS input area with default text.
document.getElementById( "css" ) .value = "/* Write or paste your CSS here */";

/*
 * Event handler for the first example button.
 * When clicked, it populates the CSS textarea with Normalize.css content.
 * This demonstrates a common CSS reset/normalization library.
 */
document.getElementById( "ex1" ) .onclick = function ( ) {
    document.getElementById( "css" ) .value = "/*! normalize.css v2.1.1 | MIT License | git.io/normalize */\n\n/* ==========================================================================\n   HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Correct `block` display not defined in IE 8/9.\n */\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nnav,\nsection,\nsummary {\n    display: block;\n}\n\n/**\n * Correct `inline-block` display not defined in IE 8/9.\n */\n\naudio,\ncanvas,\nvideo {\n    display: inline-block;\n}\n\n/**\n * Prevent modern browsers from displaying `audio` without controls.\n * Remove excess height in iOS 5 devices.\n */\n\naudio:not([controls]) {\n    display: none;\n    height: 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\n[hidden] {\n    display: none;\n}\n\n/* ==========================================================================\n   Base\n   ========================================================================== */\n\n/**\n * 1. Prevent system color scheme's background color being used in Firefox, IE,\n *    and Opera.\n * 2. Prevent system color scheme's text color being used in Firefox, IE, and\n *    Opera.\n * 3. Set default font family to sans-serif.\n * 4. Prevent iOS text size adjust after orientation change, without disabling\n *    user zoom.\n */\n\nhtml {\n    background: #fff; /* 1 */\n    color: #000; /* 2 */\n    font-family: sans-serif; /* 3 */\n    -ms-text-size-adjust: 100%; /* 4 */\n    -webkit-text-size-adjust: 100%; /* 4 */\n}\n\n/**\n * Remove default margin.\n */\n\nbody {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Links\n   ========================================================================== */\n\n/**\n * Address `outline` inconsistency between Chrome and other browsers.\n */\n\na:focus {\n    outline: thin dotted;\n}\n\n/**\n * Improve readability when focused and also mouse hovered in all browsers.\n */\n\na:active,\na:hover {\n    outline: 0;\n}\n\n/* ==========================================================================\n   Typography\n   ========================================================================== */\n\n/**\n * Address variable `h1` font-size and margin within `section` and `article`\n * contexts in Firefox 4+, Safari 5, and Chrome.\n */\n\nh1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n}\n\n/**\n * Address styling not present in IE 8/9, Safari 5, and Chrome.\n */\n\nabbr[title] {\n    border-bottom: 1px dotted;\n}\n\n/**\n * Address style set to `bolder` in Firefox 4+, Safari 5, and Chrome.\n */\n\nb,\nstrong {\n    font-weight: bold;\n}\n\n/**\n * Address styling not present in Safari 5 and Chrome.\n */\n\ndfn {\n    font-style: italic;\n}\n\n/**\n * Address differences between Firefox and other browsers.\n */\n\nhr {\n    -moz-box-sizing: content-box;\n    box-sizing: content-box;\n    height: 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\nmark {\n    background: #ff0;\n    color: #000;\n}\n\n/**\n * Correct font family set oddly in Safari 5 and Chrome.\n */\n\ncode,\nkbd,\npre,\nsamp {\n    font-family: monospace, serif;\n    font-size: 1em;\n}\n\n/**\n * Improve readability of pre-formatted text in all browsers.\n */\n\npre {\n    white-space: pre-wrap;\n}\n\n/**\n * Set consistent quote types.\n */\n\nq {\n    quotes: '\\201C' '\\201D' '\\2018' '\\2019';\n}\n\n/**\n * Address inconsistent and variable font size in all browsers.\n */\n\nsmall {\n    font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\n */\n\nsub,\nsup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n}\n\nsup {\n    top: -0.5em;\n}\n\nsub {\n    bottom: -0.25em;\n}\n\n/* ==========================================================================\n   Embedded content\n   ========================================================================== */\n\n/**\n * Remove border when inside `a` element in IE 8/9.\n */\n\nimg {\n    border: 0;\n}\n\n/**\n * Correct overflow displayed oddly in IE 9.\n */\n\nsvg:not(:root) {\n    overflow: hidden;\n}\n\n/* ==========================================================================\n   Figures\n   ========================================================================== */\n\n/**\n * Address margin not present in IE 8/9 and Safari 5.\n */\n\nfigure {\n    margin: 0;\n}\n\n/* ==========================================================================\n   Forms\n   ========================================================================== */\n\n/**\n * Define consistent border, margin, and padding.\n */\n\nfieldset {\n    border: 1px solid #c0c0c0;\n    margin: 0 2px;\n    padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct `color` not being inherited in IE 8/9.\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\n */\n\nlegend {\n    border: 0; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Correct font family not being inherited in all browsers.\n * 2. Correct font size not being inherited in all browsers.\n * 3. Address margins set differently in Firefox 4+, Safari 5, and Chrome.\n */\n\nbutton,\ninput,\nselect,\ntextarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 2 */\n    margin: 0; /* 3 */\n}\n\n/**\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\n * the UA stylesheet.\n */\n\nbutton,\ninput {\n    line-height: normal;\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n * All other form control elements do not inherit `text-transform` values.\n * Correct `button` style inheritance in Chrome, Safari 5+, and IE 8+.\n * Correct `select` style inheritance in Firefox 4+ and Opera.\n */\n\nbutton,\nselect {\n    text-transform: none;\n}\n\n/**\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\n *    and `video` controls.\n * 2. Correct inability to style clickable `input` types in iOS.\n * 3. Improve usability and consistency of cursor style between image-type\n *    `input` and others.\n */\n\nbutton,\nhtml input[type='button'], /* 1 */\ninput[type='reset'],\ninput[type='submit'] {\n    -webkit-appearance: button; /* 2 */\n    cursor: pointer; /* 3 */\n}\n\n/**\n * Re-set default cursor for disabled elements.\n */\n\nbutton[disabled],\nhtml input[disabled] {\n    cursor: default;\n}\n\n/**\n * 1. Address box sizing set to `content-box` in IE 8/9.\n * 2. Remove excess padding in IE 8/9.\n */\n\ninput[type='checkbox'],\ninput[type='radio'] {\n    box-sizing: border-box; /* 1 */\n    padding: 0; /* 2 */\n}\n\n/**\n * 1. Address `appearance` set to `searchfield` in Safari 5 and Chrome.\n * 2. Address `box-sizing` set to `border-box` in Safari 5 and Chrome\n *    (include `-moz` to future-proof).\n */\n\ninput[type='search'] {\n    -webkit-appearance: textfield; /* 1 */\n    -moz-box-sizing: content-box;\n    -webkit-box-sizing: content-box; /* 2 */\n    box-sizing: content-box;\n}\n\n/**\n * Remove inner padding and search cancel button in Safari 5 and Chrome\n * on OS X.\n */\n\ninput[type='search']::-webkit-search-cancel-button,\ninput[type='search']::-webkit-search-decoration {\n    -webkit-appearance: none;\n}\n\n/**\n * Remove inner padding and border in Firefox 4+.\n */\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n    border: 0;\n    padding: 0;\n}\n\n/**\n * 1. Remove default vertical scrollbar in IE 8/9.\n * 2. Improve readability and alignment in all browsers.\n */\n\ntextarea {\n    overflow: auto; /* 1 */\n    vertical-align: top; /* 2 */\n}\n\n/* ==========================================================================\n   Tables\n   ========================================================================== */\n\n/**\n * Remove most spacing between table cells.\n */\n\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n}\n";
};

/*
 * Event listener for the second example button.
 * Clicking this button loads a set of CSS rules designed
 * to demonstrate various minification scenarios.
 */
document.getElementById( "ex2" ) .onclick = function ( ) {
    document.getElementById( "css" ) .value = '/** MiniMinifier test code **/\n\n/* remove unnecessary spaces and semicolons */\n.test1 { color: #001 }                                   /* remove spaces around "{" and "}" */\n.test2 { color: #002; }                                  /* remove semicolon before "}" */\n.test3 { color: #003 ; background: #003 }                /* remove spaces around ";" */\n.test4 , .test4bis { color: #004 }                       /* remove spaces around "," */\n.test5 { color: #005 }                                   /* remove spaces after ":" */\n.test6 + .test6bis { color: #006 }                       /* remove spaces around "+" */\n.test7 > .test7bis { color: #007 }                       /* remove spaces around ">" */\n.test8 ~ .test8bis { color: #008 }                       /* remove spaces around "~" */\n.test9 { background: url ( bg.jpg ) #009 }               /* remove spaces around "(" and ")" */\n @media (print) { .test10 { color: #010 } }              /* remove spaces around "@" */\n\n/* optional: remove leading zeros */\n.test11 { border: 0.11em }\n\n/* Optional: remove unit after zero, for lengths  */\n.test12 {\n  width: 0px;\n  width: 0in;\n  width: 0cm;\n  width: 0mm;\n  width: 0em;\n  width: 0rem;\n  width: 0pt;\n  width: 0pc;\n  width: 0ex;\n  width: 0ch;\n  width: 0vw;\n  width: 0vh;\n  width: 0vmin;\n  width: 0vmax;\n  width: 0%\n}\n\n/* Optional: convert rgb in hexadecimal */\n.test13 { color: rgb(0, 11, 222); background: RGB(111, 22, 3) }\n\n/* Optional: minify haxadecimal colors */\n.test14 { color: #123456; background: #113355 }\n\n/* If both previous options are enabled: convert RGB to minified hexadecimal */\n.test15 { color: rgb(51, 102, 153) }\n\n/* Fix for old IE versions: add a space after some parenthesis */\n.test16 { background: url(bg.jpg) no-repeat }            /* applicable here */\n.test17 { background: url(bg.png); color: #017 }         /* not applicable before a ";" */\n.test18 { background: url(bg.png) }                      /* not applicable before a "}" */\n@media (print) { .test19 { color: #019 } }               /* not applicable before a "{" */\n\n/* fixed in v0.8: keep spaces between "*" and other selectors, keep "-" in CSS prefixes */\nbody * * .test0_8 {\n  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box\n}\n\n/* fixed in v0.9: when the "zeros" option is checked, remove characters after 0 only for lengths, convert "0.0" and ".0" to "0" */\n.test0_9 {\n  color: #0a0b0c;              /* hexadecimal colors */\n  background: url(0a.jpg),     /* file names */\n              url(0.0.a.jpg),\n              url("0a.jpg"),\n              url(\'0a.jpg\');\n}\n\n /* fixed in v.0.9: keep spaces before ":" in selectors */\n .test0_9 :hover { color: red; }';
};

/*
 * Retrieve all input elements on the page, which are assumed to be checkboxes
 * for controlling minification options.
 */
var checkboxes = document .getElementsByTagName( "input" );

/*
 * Declare a loop iterator variable.
 * This will be used in the following 'for' loop.
 */
var i;

/*
 * Variables to store the generated JavaScript code snippets
 * for the minification logic. `code` is for display, `minicode` for execution.
 */
var code, minicode;

/*
 * Iterate through the retrieved checkboxes to set up initial states
 * and attach event listeners.
 */
for ( i = 0; i < checkboxes .length; i++ ) {
  // For all checkboxes except the first one (which might be the default "Classic" option)
  if ( i > 0 ) {
    // Ensure these checkboxes are unchecked by default.
    checkboxes[ i ] .checked = false;
  }
  // Attach the 'updateMinifier' function to the 'click' event of each checkbox.
  checkboxes[ i ] .addEventListener( "click", updateMinifier );
}

/**
 * This function dynamically constructs the minification JavaScript code
 * based on the state of the checkboxes (user preferences).
 * It updates the displayed code and the executable minification logic.
 */
function updateMinifier ( ) {

  /* Temporary variable for building parts of the minification regex string. */
  var tmp;

  /*
   * Check if the "Classic" minification option (checkboxes[4]) is NOT checked.
   * This implies using the multi-step regex approach.
   */
  if ( !checkboxes[ 4 ] .checked ) {

    // Update the text of the "Minify!" button to reflect the current mode.
    document.getElementById( "minify" ) .innerHTML = "Minify!";

    // Define the initial regex step: removing comments and excessive whitespace.
    tmp = "c.replace(/(\\/\\*[^]*?\\*\\/|\\s)+/g,' ')";
    // Store this part for display, adding a newline for readability.
		code = tmp + "\n";
    // Store this part for actual execution.
		minicode = tmp;

    // Check if both "Zero" (checkboxes[1]) and "IE" (checkboxes[3]) options are enabled.
    if ( checkboxes[ 1 ] .checked && checkboxes[ 3 ] .checked ) {

      // Regex for combining zero unit removal and IE compatibility fixes.
      tmp = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */gi,'$1$3$4$5$6$7')";
      // Append to displayed code.
      code += " " + tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

    // Else, check if only the "Zero" option is enabled.
    else if ( checkboxes[ 1 ] .checked ) {

      // Regex specifically for removing zero units.
      tmp = ".replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */gi,'$1$3$4$5$6')";
      // Append to displayed code.
      code += " " + tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

    // Else, check if only the "IE" option is enabled.
    else if ( checkboxes[ 3 ] .checked ) {

      // Regex specifically for IE compatibility spacing fixes.
      tmp = ".replace(/^ | $|[ ;]*([^\\:\\w.#)'\" *-]) *| (\\))|(:) */g,'$1$2$3')";
      // Append to displayed code.
      code += " " + tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

    // If neither "Zero" nor "IE" options are enabled.
    else {

      // Basic regex for whitespace and semicolon removal.
      tmp = ".replace(/^ | $|[ ;]*([^\\:\\w.#'\" *-]) *|(:) */g,'$1$2')";
      // Append to displayed code.
      code += " " + tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

  }

  /*
   * If the "Even shorter" minification option (checkboxes[4]) IS checked.
   * This uses a more aggressive, single-pass regex approach.
   */
  else {

    // Update the "Minify!" button text to indicate the aggressive mode.
    document.getElementById( "minify" ) .innerHTML = "Minify! (called 4 times)";

    // Reset code strings for the new approach.
    code = "";
    minicode = "";

    // Check if both "Zero" (checkboxes[1]) and "IE" (checkboxes[3]) options are enabled.
    if ( checkboxes[ 1 ] .checked && checkboxes[ 3 ] .checked ) {
      // Combined aggressive regex for zero unit removal and IE compatibility.
      code += "c.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')\n";
      minicode += "c.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /gi,'$1$3$4$5$6$7')";

    }

    // Else, check if only the "Zero" option is enabled.
    else if ( checkboxes[ 1 ] .checked ) {
      // Aggressive regex for zero unit removal.
      code += "c.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')\n";
      minicode += "c.replace(/([^#\\d\\w\\(._'\"-])((0)[a-z%]+|0(\\.))|^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /gi,'$1$3$4$5$6')";

    }

    // Else, check if only the "IE" option is enabled.
    else if ( checkboxes[ 3 ] .checked ) {

      // Aggressive regex for IE compatibility fixes.
      tmp = "c.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#\)'\"\\s*-])\\s*|\\s(\\))|(:) /g,'$1$2$3')";
      // Append to displayed code.
      code += tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

    // If neither "Zero" nor "IE" options are enabled for the aggressive mode.
    else {

      // Basic aggressive regex for general whitespace and comment removal.
      tmp = "c.replace(/^\\s|\\s$|\\/\\*[^]*?\\*\\/|\\s*;*([^\\:\\w.#'\"\\s*-])\\s*|(:) /g,'$1$2')";
      // Append to displayed code.
      code += tmp + "\n";
      // Append to executable code.
      minicode += tmp;

    }

  }

  /*
   * Check if the "Colors" minification option (checkboxes[2]) is enabled.
   * This handles RGB to hex conversion and minification of hex codes.
   */
  if ( checkboxes[ 2 ] .checked ) {
    // Append the color minification regex and function to the displayed code.
    code += " .replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi,\n   function(h,a,b,c,i,p){\n     if(c){h='#';p=[a,b,c];for(i in p)h+=('0'+parseInt(p[i]).toString(16)).slice(-2)}\n       p=h[2]+h[4]+h[6];return p==h[1]+h[3]+h[5]?'#'+p:h\n })\n";
    // Append to the executable code (all on one line for minification).
    minicode += ".replace(/rgb\\((\\d+),(\\d+),(\\d+)\\)|#[a-f0-9]{6}/gi,function(h,a,b,c,i,p){if(c){h='#';p=[a,b,c];for(i in p)h+=('0'+parseInt(p[i]).toString(16)).slice(-2)}p=h[2]+h[4]+h[6];return p==h[1]+h[3]+h[5]?'#'+p:h})";
  }

	/*
   * Check if the "Beautify" option (checkboxes[5]) is enabled.
   * This applies formatting to make the CSS more readable.
   */
  if ( checkboxes[ 5 ] .checked ) {
    // Append the beautification regexes to the displayed code.
    code += " .replace(/([+>~])/g, ' $1 ').replace(/(,)|({)/g,'$1 $2').replace(/([{;])/g,'$1\\n  ').replace(/}/g,'\\n}\\n')\n";
    // Append to the executable code. Note the newline for the second replace, which is part of the original logic.
    minicode += ".replace(/([+>~])/g, ' $1 ').replace(/(,)|({)/g,'$1 $2')\n.replace(/([{;])/g,'$1\\n  ').replace(/}/g,'\\n}\\n')";
  }

  /*
   * Update the displayed byte count for the current minification recipe.
   */
  document.getElementById( "bytes" ) .innerHTML = "(" + minicode .length + " bytes)";

  /*
   * Apply a specific fix for IE if the IE compatibility checkbox is checked.
   * This ensures a space after a closing parenthesis if not followed by certain characters.
   */
  if ( checkboxes[ 3 ] .checked ) {
    minicode += ".replace(/\\)(?![,;{} ])/,') ')";
  }
  // Display the generated JavaScript minification code in the 'js' element.
  document.getElementById( "js" ) .innerHTML = code;
}

/*
 * Attach an event listener to the "Minify!" button.
 * When clicked, it performs the actual CSS minification.
 */
document.getElementById( "minify" ) .addEventListener( "click", function ( ) {
  // Get the current CSS content from the textarea.
  var css = document.getElementById( "css" ) .value;
  // Store the original size of the CSS.
  var size = css .length;
  // Create a new function dynamically from the generated minification code.
  var minify = new Function( "c", "return " + minicode );
  // Execute the minification function once.
  css = minify( css );
  // If the "Even shorter" option is enabled, apply minification three more times
  // as per the original logic (total of 4 passes).
  if ( checkboxes[ 4 ] ) {
    css = minify( minify( minify( css ) ) );
  }
  // Update the CSS textarea with the minified content.
  document.getElementById( "css" ) .value = css;
  // Get the size of the minified CSS.
  var size2 = css .length;
  // Calculate and display the savings percentage in an alert box.
  alert( "Before: " + size + "Bytes. After: " + size2 + "Bytes. Saved: " + ( ( 100 - Math.round( size2 / size * 100 ) ) || 0 ) + "%." );
} );

// Call updateMinifier once on script load to initialize the minification code display.
updateMinifier( );