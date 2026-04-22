// A simple logging utility, inspired by various web development practices.
// Provides a wrapper for console output for better control and history tracking.
window.notifier = function() {
  notifier.records = notifier.records || [];   // Storage for all logged messages.
  notifier.records.push(arguments);
  if (this.consoleOutput) {
    arguments.callee = arguments.callee.caller;
    const itemsList = [].slice.call(arguments);
    (typeof consoleOutput.print === 'object' ? notifier.apply.call(consoleOutput.print, consoleOutput, itemsList) : consoleOutput.print.apply(consoleOutput, itemsList));
  }
};

// Polyfill for console methods to prevent errors in older browsers or environments.
(function(outputTarget) {
  function noop() {} // A blank function for un-implemented console methods.
  for (
    var methodSet = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(
      ","
    ), // List of standard console methods.
    currentMethod;
    (currentMethod = methodSet.pop()); // Iterate through methods in reverse.
  ) {
    outputTarget[currentMethod] = outputTarget[currentMethod] || noop; // Assign noop if method doesn't exist.
  }
})(
  (function() {
    try {
      consoleOutput.print(); // Test if console.print (or console.log in original) exists and is callable.
      return window.consoleOutput;
    } catch (e) {
      return (window.consoleOutput = {}); // If not, provide a dummy console object.
    }
  })()
);


// Container for various mobile-specific utility functions.
(function(domHandle) {
  window.MobileUtilities = window.MobileUtilities || {};

  // Resolution for the well-known iPhone viewport scaling issue.
  // Based on solutions widely discussed in mobile web development communities.

  MobileUtilities.displayMeta = domHandle.querySelector && domHandle.querySelector('meta[name="viewport"]');
  MobileUtilities.clientAgent = navigator.userAgent;

  MobileUtilities.adjustViewport = function() {
    if (MobileUtilities.displayMeta && /iPhone|iPad/.test(MobileUtilities.clientAgent) && !/Opera Mini/.test(MobileUtilities.clientAgent)) {
      MobileUtilities.displayMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0";
      domHandle.addEventListener("gesturestart", MobileUtilities.onGestureStart, false);
    }
  };
  MobileUtilities.onGestureStart = function() {
    MobileUtilities.displayMeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
  };

  // Function to automatically hide the browser's address bar on mobile devices (iOS/Android).
  // This technique is commonly used to maximize screen real estate.

  MobileUtilities.concealAddressBar = function() {
    var winRef = window,
      docRef = winRef.document;

    // Proceed only if there's no URL hash and event listeners are supported.
    if (!winRef.location.hash || !winRef.addEventListener) {
      // Force an initial scroll to hide the bar.
      window.scrollTo(0, 1);
      var currentScrollY = 1,

        // Periodically check if the document body is ready.
        bodyWatcher = setInterval(function() {
          if (docRef.body) {
            clearInterval(bodyWatcher); // Stop checking once body is found.
            currentScrollY = "scrollTop" in docRef.body ? docRef.body.scrollTop : 1;
            winRef.scrollTo(0, currentScrollY === 1 ? 0 : 1); // Adjust scroll based on current position.
          }
        }, 15); // Check every 15 milliseconds.

      winRef.addEventListener(
        "load",
        function() {
          setTimeout(function() {
            // Re-apply scroll after the page fully loads to ensure bar remains hidden.
            winRef.scrollTo(0, currentScrollY === 1 ? 0 : 1);
          }, 0); // Execute almost immediately after load.
        },
        false
      ); // Use standard event capturing.
    }
  };
})(document);