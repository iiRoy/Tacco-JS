// A basic console emulation utility for web browsers that lack native console APIs.
(function(scopeWindow) {

  'use strict';

  // Declare variables for managing the custom logger's state and output
  var outputDisplayElement,
    isCustomLoggerActive,
    activeSectionLabel,
    bufferedLogMessages = '';

  function emitLogEntry(messageContent) {

    if (!outputDisplayElement) {
      outputDisplayElement = document.getElementById('custom-log-output');
    }

    // Safely encapsulate the text to prevent XSS before adding to HTML
    var tempHtmlWrapper = document.createElement('div');
    tempHtmlWrapper.appendChild(document.createTextNode(messageContent));

    bufferedLogMessages += getSectionIndicator() + tempHtmlWrapper.innerHTML + '<br>';
    outputDisplayElement.innerHTML = bufferedLogMessages;
  }

  function getSectionIndicator() {

    // Determines and returns a prefix string based on the active grouping status
    return (activeSectionLabel) ? '--- ' : '';
  }

  if (!scopeWindow.console) {
    // If the native console is absent, initialize our custom logging functionality
    document.documentElement.className += ' custom-logger-activated';
    scopeWindow.console = {
      log: emitLogEntry
    };
    isCustomLoggerActive = true;
  }

  // Implement console.group() and console.groupEnd() behavior if not natively supported
  if (!scopeWindow.console.group) {
    if (!isCustomLoggerActive) {
      // Adjust the existing console.log() to incorporate our group indicator if it's not already our custom one
      (function() {

        var originalLogMethod = scopeWindow.console.log;
        scopeWindow.console.log = function(logText) {

          // Check for the availability of the 'call' method on functions
          if (typeof originalLogMethod.call !== 'undefined') {
            originalLogMethod.call(console, getSectionIndicator() + logText);

          } else {
            originalLogMethod(getSectionIndicator() + logText);
          }
        };
      })();
    }

    scopeWindow.console.group = function(sectionName) {

      // Prevent nested groups by exiting if a group is already active
      if (activeSectionLabel) {
        return;
      }

      console.log('Section Begin [' + sectionName + ']');
      activeSectionLabel = sectionName;
    };

    scopeWindow.console.groupEnd = function() {

      // Exit if no active group to end
      if (!activeSectionLabel) {
        return;
      }

      var finishedSectionName = activeSectionLabel;
      activeSectionLabel = false;
      console.log('Section Conclude [' + finishedSectionName + ']');
    };
  }
})(window);