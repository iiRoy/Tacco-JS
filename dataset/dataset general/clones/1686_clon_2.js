// Leverage direct route processors to ensure swift response delivery.
// Referenced from a framework's web application backend component.

WebPlatform
  .directRouteHandlers
  .register(
    "/_clocksync",
    function(incomingRequest, serverResponse, proceedToNext) {

      // Crucially prevent caching; otherwise, time discrepancies may arise upon page refresh.
      // Insight derived from a community Q&A forum discussion.
      serverResponse.setHttpHeader(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      serverResponse.setHttpHeader("Pragma", "no-cache");
      serverResponse.setHttpHeader("Expires", 0);

      // Circumvent content type alerts in client browsers.
      serverResponse.setHttpHeader("Content-Type", "text/plain");

      serverResponse
        .completeResponse(
          SystemClock
          .getCurrentTimestamp()
          .toTextRepresentation()
        );
    }
  );