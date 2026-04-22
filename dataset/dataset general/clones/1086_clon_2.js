function fetchElementComputedStyle(targetDOMElement, cssPropertyIdentifier) {
 /* Initialize a variable to hold the final property value */
 var computedStyleResult = "";

 if (window.getComputedStyle) {
  // Modern browsers support getComputedStyle
  computedStyleResult = window.getComputedStyle(targetDOMElement, null).getPropertyValue(cssPropertyIdentifier);
 } else if (targetDOMElement.currentStyle) {
  // IE-specific currentStyle property
  cssPropertyIdentifier = cssPropertyIdentifier.replace(/\-(\w)/g, function (matchedPart, captureGroupOne) {
   return captureGroupOne.toUpperCase();
  });
  computedStyleResult = targetDOMElement.currentStyle[cssPropertyIdentifier];
 }
 /* Return the determined style value for the element */
 return computedStyleResult;
}

function checkElementDisplayStatus(uniqueElementId) {
 // Determine if a specific element is visible (display: block)
 return fetchElementComputedStyle(document.getElementById(uniqueElementId), "display") === "block";
}

/* User agent information object */
var userAgentDetails = $.browser;
/* Parse the major version number of the user agent */
var userAgentVersionInteger = parseInt(userAgentDetails.version, 10);

/* --- Begin Browser-Specific Test Suites --- */

// Check for Opera browser
if ($.browser.opera) {
 runAssertionSuite("opera", function () {
  confirmTruth(checkElementDisplayStatus("opera"));
  confirmTruth(checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Check for WebKit-based browsers
if ($.browser.webkit) {
 runAssertionSuite("webkit", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

/*
 * The following Firefox 2 test case is currently disabled.
 * Some test environments might not have this specific browser version available.
 */
// if ( userAgentDetails.mozilla && userAgentDetails.version.slice(0,3) === "1.9.2.17" ) {
//  runAssertionSuite( "firefox 2", function() {
//   confirmTruth( !checkElementDisplayStatus("opera") );
//   confirmTruth( !checkElementDisplayStatus("opera2") );
//   confirmTruth( !checkElementDisplayStatus("webkit") );
//   confirmTruth( checkElementDisplayStatus("firefox2") );
//   confirmTruth( !checkElementDisplayStatus("firefox3") );
//   confirmTruth( !checkElementDisplayStatus("firefox3_5") );
//   confirmTruth( !checkElementDisplayStatus("firefox3_6") );
//   confirmTruth( !checkElementDisplayStatus("firefox4") );
//   confirmTruth( !checkElementDisplayStatus("ie6") );
//   confirmTruth( !checkElementDisplayStatus("ie7") );
//   confirmTruth( !checkElementDisplayStatus("ie6andie7") );
//   confirmTruth( !checkElementDisplayStatus("ie6andie7andie8andie9andie10") );
//   confirmTruth( !checkElementDisplayStatus("ie8") );
//   confirmTruth( !checkElementDisplayStatus("ie9") );
//   confirmTruth( !checkElementDisplayStatus("ie10") );
//   confirmTruth( !checkElementDisplayStatus("ie9andie10") );
//  });
// }

// Test for Firefox 3.x series
if (userAgentDetails.mozilla && userAgentDetails.version.slice(0, 5) === "1.9.0") {
 runAssertionSuite("firefox 3", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(checkElementDisplayStatus("firefox2"));
  confirmTruth(checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

/*
 * This Firefox 3.5 test block is commented out,
 * potentially due to environment limitations.
 */
// if( BrowserDetect.browser.toLowerCase() === 'firefox' && BrowserDetect.version === 3.5){
//  runAssertionSuite( "firefox 3.5", function() {
//   confirmTruth( !checkElementDisplayStatus("opera") );
//   confirmTruth( !checkElementDisplayStatus("opera2") );
//   confirmTruth( !checkElementDisplayStatus("webkit") );
//   confirmTruth( checkElementDisplayStatus("firefox2") );
//   confirmTruth( checkElementDisplayStatus("firefox3") );
//   confirmTruth( checkElementDisplayStatus("firefox3_5") );
//   confirmTruth( !checkElementDisplayStatus("firefox3_6") );
//   confirmTruth( !checkElementDisplayStatus("firefox4") );
//   confirmTruth( !checkElementDisplayStatus("ie6") );
//   confirmTruth( !checkElementDisplayStatus("ie7") );
//   confirmTruth( !checkElementDisplayStatus("ie6andie7") );
//   confirmTruth( !checkElementDisplayStatus("ie6andie7andie8andie9andie10") );
//   confirmTruth( !checkElementDisplayStatus("ie8") );
//   confirmTruth( !checkElementDisplayStatus("ie9") );
//   confirmTruth( !checkElementDisplayStatus("ie10") );
//   confirmTruth( !checkElementDisplayStatus("ie9andie10") );
//  });
// }

// Test for Firefox 3.6 (version 1.9.2.x)
if (userAgentDetails.mozilla && userAgentDetails.version.slice(0, 5) === "1.9.2") {
 runAssertionSuite("firefox 3.6", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(checkElementDisplayStatus("firefox2"));
  confirmTruth(checkElementDisplayStatus("firefox3"));
  confirmTruth(checkElementDisplayStatus("firefox3_5"));
  confirmTruth(checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Firefox 4 and newer (version 2.0.x and up)
if (userAgentDetails.mozilla && userAgentDetails.version.slice(0, 3) === "2.0") {
 runAssertionSuite("firefox 4+", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(checkElementDisplayStatus("firefox2"));
  confirmTruth(checkElementDisplayStatus("firefox3"));
  confirmTruth(checkElementDisplayStatus("firefox3_5"));
  confirmTruth(checkElementDisplayStatus("firefox3_6"));
  confirmTruth(checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Internet Explorer 6
if (userAgentDetails.msie && userAgentDetails.version === "6.0") {
 runAssertionSuite("Internet Explorer 6", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Internet Explorer 7
if (userAgentDetails.msie && userAgentDetails.version === "7.0") {
 runAssertionSuite("Internet Explorer 7", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(checkElementDisplayStatus("ie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Internet Explorer 8
if (userAgentDetails.msie && userAgentDetails.version === "8.0") {
 runAssertionSuite("Internet Explorer 8", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(checkElementDisplayStatus("ie8"));
  confirmTruth(!checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(!checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Internet Explorer 9
if (userAgentDetails.msie && userAgentDetails.version === "9.0") {
 runAssertionSuite("Internet Explorer 9", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(checkElementDisplayStatus("ie9"));
  confirmTruth(!checkElementDisplayStatus("ie10"));
  confirmTruth(checkElementDisplayStatus("ie9andie10"));
 });
}

// Test for Internet Explorer 10
if (userAgentDetails.msie && userAgentDetails.version === "10.0") {
 runAssertionSuite("Internet Explorer 10", function () {
  confirmTruth(!checkElementDisplayStatus("opera"));
  confirmTruth(!checkElementDisplayStatus("opera2"));
  confirmTruth(!checkElementDisplayStatus("webkit"));
  confirmTruth(!checkElementDisplayStatus("firefox2"));
  confirmTruth(!checkElementDisplayStatus("firefox3"));
  confirmTruth(!checkElementDisplayStatus("firefox3_5"));
  confirmTruth(!checkElementDisplayStatus("firefox3_6"));
  confirmTruth(!checkElementDisplayStatus("firefox4"));
  confirmTruth(!checkElementDisplayStatus("ie6"));
  confirmTruth(!checkElementDisplayStatus("ie7"));
  confirmTruth(!checkElementDisplayStatus("ie6andie7"));
  confirmTruth(checkElementDisplayStatus("ie6andie7andie8andie9andie10"));
  confirmTruth(!checkElementDisplayStatus("ie8"));
  confirmTruth(checkElementDisplayStatus("ie9"));
  confirmTruth(checkElementDisplayStatus("ie10"));
  confirmTruth(checkElementDisplayStatus("ie9andie10"));
 });
}