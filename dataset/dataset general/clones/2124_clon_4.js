(function(scopeBoundary) {
  let analyticsDispatchQueue = scopeBoundary.window._gaq;

  const uriPathRecognizer = /(?:[a-z]+:\/\/[^\/]+)?(\/[^?]*)/i;

  let errorTrackingRoot = "/javascript_error";

  scopeBoundary.assignAnalyticsQueue = function(trackingSystem) {
    analyticsDispatchQueue = trackingSystem;
  };

  scopeBoundary.adjustErrorRouteBase = function(baseRoute) {
    errorTrackingRoot = baseRoute;
  };

  scopeBoundary.handleApplicationFault = function(faultMessage, faultUri, faultLineNumber) {
    try {
      if (analyticsDispatchQueue && typeof analyticsDispatchQueue.push === "function") {
        const uriMatchResult = uriPathRecognizer.exec(faultUri);
        const extractedPathSegment = uriMatchResult[1];

        const fullTrackingUri = `${errorTrackingRoot}${extractedPathSegment}?line=${faultLineNumber}&message=${encodeURIComponent(faultMessage)}`;
        analyticsDispatchQueue.push(['_trackPageview', fullTrackingUri]);
      }
    } catch (e) {
      // Intentionally suppress errors within this error handler
    }
  };

  scopeBoundary["ApplicationMonitor"] = scopeBoundary;

})(this);