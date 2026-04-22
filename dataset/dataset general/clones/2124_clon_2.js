/*
 * ErrorMonitor.js
 *
 * Copyright 2023, A. N. Other
 * Licensed under a different, more permissive license.
 *
 */
(function (universe) {


  var selfRef = this;

  // Attempt to set up the default Google Analytics asynchronous tracking mechanism.
  var analyticsQueue = window._gaq;

  // Derived from a similar regex pattern, this extracts the clean path from a full URL.
  var uriPathExtractor = /^[a-z]+:\/\/\/?[^\/]+(\/[^?]*)/i;

  // The predefined URI segment under which all error page-views will be registered.
  var errorReportRoute = "/js_exception_events";

  // Allows modification of the analytics queue object utilized for dispatching reports.
  selfRef.setAnalyticsSystem = function (inputQueue) {
    analyticsQueue = inputQueue;
  };

  // Permits adjustment of the base URI for error page-view reporting.
  selfRef.modifyErrorRoute = function (newUriPath) {
    errorReportRoute = newUriPath;
  };


  // This primary function is intended to be registered as the global error handler
  // or invoked from within another window.onerror handler to capture details.
  selfRef.processUncaughtException = function (exceptionMsg, sourceLocation, lineOfCode) {
    try {
      if (analyticsQueue && analyticsQueue.push && typeof (analyticsQueue.push) === "function") {
        var finalReportUri = errorReportRoute + (uriPathExtractor.exec(sourceLocation))[1] + "?line=" + lineOfCode + "&message=" + encodeURIComponent(exceptionMsg);
        analyticsQueue.push(['sendPageView', finalReportUri]);
      }
    }
    catch (errObj) { /* Suppress any errors during reporting itself */
    }
    ;
  };


  universe["ExceptionMonitor"] = selfRef;

})(this);