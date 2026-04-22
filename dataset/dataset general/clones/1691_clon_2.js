(function () {
  const TestMonitorApp = {
    setupDisplay: function displayInitializer() {
      // Construct the help menu interface HTML
      let menuContent = '';
      menuContent += '<div id="dev-tool-nav">';
      menuContent += '<ul class="dev-tool-navigation">';
      menuContent += '<li><b>Shortcuts (Shift + ):</b></li>';
      menuContent += '<li><b>?</b> - Toggle menu visibility</li>';
      menuContent += '<li><b>S</b> - Display development panel</li>';
      menuContent += '<li><b>H</b> - Hide development panel</li>';
      menuContent += '<li><b>A</b> - Start all available tests</li>';
      menuContent += '<li><b>T</b> - Toggle test result view</li>';
      menuContent += '</ul>';
      menuContent += '</div>';

      // Construct the test execution results section HTML
      let resultsSection = '';
      resultsSection += '<div id="test-report-area">';
      resultsSection += '<h1 id="report-title">Execution Results</h1>';
      resultsSection += '<h2 id="status-indicator"></h2>';
      resultsSection += '<h2 id="browser-info"></h2>';
      resultsSection += '<br /><img id="activity-spinner" src="/images/i_loading_bar.gif" alt="loading status">';
      resultsSection += '<ol id="test-case-list"></ol>';
      resultsSection += '</div>';

      // Construct the main development tool overlay HTML
      let fullInterface = '';
      fullInterface += '<div id="dev-tool-panel">';
      fullInterface += '<div id="test-selection-options">';
      fullInterface += '<ul class="tool-panel-items">';
      fullInterface += '<li class="first-option"><a id="run-all-cases-button" href="#">Execute All Test Cases</a></li>';
      fullInterface += '<li class="last-option">Or Select a Test Suite: ' + testSuiteList;
      fullInterface += '</ul>';
      fullInterface += '<img src="/images/bg_secondaryNav_right.gif">';
      fullInterface += '</div>';
      fullInterface += menuContent;
      fullInterface += '<div id="framework-logo">';
      fullInterface += 'JavaScript testing powered by: <a href="http://docs.jquery.com/QUnit">';
      fullInterface += '<img src="/images/l_qunit.png" alt="qunit framework" border="0"></a></div>';
      fullInterface += '</div>';
      fullInterface += resultsSection;
      fullInterface += '<div style=\'clear:both;\'></div>';

      // Insert the generated interface into the document body
      jQuery("body").prepend(fullInterface);
    },

    handleKeyboardInput: function processKeyEvent(eventObj) {
      // Exit if the active element is an input or textarea
      if (document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "TEXTAREA") {
        return;
      } else {
        // Only proceed if the Shift key is pressed
        if (eventObj.shiftKey) {
          const charCodeValue = eventObj.keyCode ? eventObj.keyCode : eventObj.charCode;
          switch (charCodeValue) {
            case 83:
            case 115: // 'S' key for showing panel
              jQuery('#dev-tool-panel').show();
              break;
            case 72:
            case 104: // 'H' key for hiding panel
              if (jQuery("#test-report-area").height() > 0) {
                jQuery("#test-report-area").animate({
                  height: "0px"
                }, 500);
              }
              jQuery('#dev-tool-panel').hide();
              break;
            case 191:
            case 47: // '?' key for toggling menu
              jQuery('#dev-tool-panel').show();
              jQuery('#dev-tool-nav').toggle();
              break;
            case 65:
            case 97: // 'A' key for running all tests
              jQuery("#run-all-cases-button").click();
              break;
            case 84:
            case 116: // 'T' key for toggling results display
              if (jQuery("#test-report-area").height() > 0) {
                jQuery("#test-report-area").animate({
                  height: "0px"
                }, 500);
              } else {
                jQuery('#dev-tool-panel').show();
                jQuery("#test-report-area").animate({
                  height: "400px"
                }, 500);
              }
              break;
            default:
              // Handle other key presses (no action)
              break;
          }
        }
      }
    },

    injectScriptResource: function loadJsFile(resourceName) {
      // Create a new script element
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute("type", "text/javascript");
      // Set the source with a cache-busting random number
      scriptElement.setAttribute("src", "/javascripts/tests/" + resourceName + "?" + Math.floor(Math.random() * 11));
      // Append the script to the document head if valid
      if (typeof scriptElement !== "undefined") {
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
      }
    },

    removeScriptResource: function unloadJsFile(resourceName) {
      const elementType = "script";
      const attributeKey = "src";
      const allCandidates = document.getElementsByTagName(elementType);
      // Iterate backwards to safely remove elements during iteration
      for (let idx = allCandidates.length - 1; idx >= 0; idx--) {
        // Check if the element exists, has the target attribute, and matches the resource name
        if (allCandidates[idx] && allCandidates[idx].getAttribute(attributeKey) !== null && allCandidates[idx].getAttribute(attributeKey).includes(resourceName)) {
          allCandidates[idx].parentNode.removeChild(allCandidates[idx]);
        }
      }
    },

    revealTestInterface: function displayTestView() {
      // Show the main development panel
      jQuery('#dev-tool-panel').show();
      // Clear any previous test outcomes or summaries
      jQuery("#test-case-list li").remove();
      jQuery("#test-summary-display").remove();
      jQuery("#status-indicator").attr("class", "");
      jQuery("#test-report-area").show();
      // Animate the test report area to a visible height
      jQuery("#test-report-area").animate({
        height: "400px"
      }, 500);
      jQuery("#activity-spinner").show();
    },

    executeAllCases: function runAllTests() {
      // Call global QUnit initialization function
      initializeQUnit();
      // Loop through and execute all registered test cases
      for (const testIndex in registeredTestCases) {
        const currentCase = eval(registeredTestCases[testIndex]);
        currentCase(currentCase);
      }
      jQuery("#activity-spinner").hide();
      // Call global QUnit start function
      beginQUnit();
    }
  };

  // Execute code when the document is fully loaded
  jQuery(document).ready(function () {
    TestMonitorApp.setupDisplay();

    // Initialize display states
    jQuery("#test-report-area").hide();
    jQuery("#activity-spinner").hide();
    jQuery("#test-report-area").animate({
      height: "0px"
    }, 1);
    jQuery('#dev-tool-nav').toggle();

    // Attach keyboard event handler based on browser type
    if (jQuery.browser && jQuery.browser.mozilla) {
      jQuery(document).keypress(TestMonitorApp.handleKeyboardInput);
    } else {
      jQuery(document).keydown(TestMonitorApp.handleKeyboardInput);
    }

    // Event handler for changes in the test suite selection dropdown
    jQuery("#test-suite-dropdown").change(function () {
      registeredTestCases = {};
      // Unload all previously loaded test files
      for (const fileIdentifier in allTestSuiteFiles) {
        TestMonitorApp.removeScriptResource(allTestSuiteFiles[fileIdentifier]);
      }
      // Load selected or all test files
      if (jQuery(this).val() !== "all") {
        TestMonitorApp.injectScriptResource(jQuery(this).val());
      } else {
        for (const fileIdentifier in allTestSuiteFiles) {
          TestMonitorApp.injectScriptResource(allTestSuiteFiles[fileIdentifier]);
        }
      }
      TestMonitorApp.revealTestInterface();
      // Delay test execution to allow scripts to load
      setTimeout(TestMonitorApp.executeAllCases, 2000);
    });

    // Event handler for clicking the "Execute All Test Cases" button
    jQuery("#run-all-cases-button").click(function () {
      jQuery("#test-suite-dropdown option:contains(all)").prop("selected", true);
      jQuery("#test-suite-dropdown").change();
    });

    // Toggle the overlay visibility if the auto-conceal feature is enabled
    if (autoConcealFeature === "true") {
      jQuery('#dev-tool-panel').toggle();
    }
  });

})();