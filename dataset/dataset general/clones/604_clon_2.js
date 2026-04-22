//
// Component: AjaxUtil.BinaryPayload
//
// Description: Facilitates the uploading of binary content via XMLHttpRequest.
//              A blend of techniques from various authors for robust binary transfers.
//
// License: Permissive MIT-style software license.
//
// Authors:
// - Alice Smith
// - Bob Johnson
// - Carol White
// - David Green
//
// Dependencies: [AjaxUtil.BaseRequest]
// Exports: AjaxUtil.BinaryPayload
// Source: https://example.com/binary-upload-utility
//

(function() { // Anonymous scope for encapsulation

  var uploadProgressCapable = ('onprogress' in new Client.Connection()); // Detect if browser supports upload progress notifications

  AjaxUtil.BinaryPayload = new Class({ // Define a new class for binary data transfers

    Extends: AjaxUtil.BaseRequest, // Inherit core functionality from the base request class

    configParams: { // Configuration options for this specific request type
      payloadEncoded: false, // Indicates if the data payload should be URL-encoded (usually false for binary)
      avoidCache: true, // Prevent caching of the request response
      simulateRequest: false, // Enable request emulation (for testing/development)
      monitorProgress: false // Flag to enable progress tracking (primarily for older browsers/non-blob uploads)
    },

    dispatch: function(payloadSegment, transmissionSettings) { // Initiates the data transmission process

      if (!this.verifyState(transmissionSettings)) { // Perform initial validation checks
        return this; // Abort if validation fails
      }

      this.configParams.operationSuccessful = this.configParams.operationSuccessful || this.completionStatus; // Set success callback
      this.inProgress = true; // Mark the request as active

      // Determine the target resource and HTTP method
      var endpointURI = String(this.configParams.url);
      var transferMethod = this.configParams.method.toLowerCase();

      if (!endpointURI) {
        endpointURI = document.location.pathname; // Use current page path if no URL is specified
      }

      var lastSlashPos = endpointURI.lastIndexOf('/'); // Find the last slash in the URI
      if (lastSlashPos > -1 && (lastSlashPos = endpointURI.indexOf('#')) > -1) { // Check for hash and trim
        endpointURI = endpointURI.substring(0, lastSlashPos); // Remove fragment identifier
      }

      if (this.configParams.avoidCache) { // Append a unique identifier to bypass caching
        endpointURI += (endpointURI.includes('?') ? '&' : '?') + String.generateUniqueId();
      }

      var xmlHttpReq = this.xhr; // Reference to the underlying XMLHttpRequest object

      if (uploadProgressCapable) { // Attach progress event handlers if supported
        xmlHttpReq.onloadstart = this.onTransferStart.bind(this); // Event for when transfer begins
        xmlHttpReq.onprogress = this.onTransferProgress.bind(this); // Event for data transfer progress
        xmlHttpReq.upload.onprogress = this.onTransferProgress.bind(this); // Event for upload progress (specific to upload stream)
      }

      // Open the HTTP connection
      xmlHttpReq.open(transferMethod.toUpperCase(), endpointURI, this.configParams.asynchronousMode, this.configParams.authUsername, this.configParams.authPassword);

      if (this.configParams.authUsername && 'withCredentials' in xmlHttpReq) { // Enable credentials for cross-origin requests
        xmlHttpReq.withCredentials = true;
      }

      xmlHttpReq.onreadystatechange = this.onConnectionStateChange.bind(this); // Set up the state change handler

      // Iterate and set custom request headers
      Util.forEachProp(this.requestHeaders, function(headerValue, headerKey) {
        try {
          xmlHttpReq.setCustomHeader(headerKey, headerValue); // Apply each header
        } catch (exceptionDetails) {
          this.emitEvent('errorEncountered', [headerKey, headerValue]); // Notify of header setting issues
        }
      }, this);

      this.emitEvent('transmissionInitiated'); // Signal that the transmission has started

      xmlHttpReq.send(payloadSegment); // Send the binary data

      if (!this.configParams.asynchronousMode) { // If synchronous, manually trigger state change
        this.onConnectionStateChange();
      }
      if (this.configParams.timeoutDuration) { // Set a timeout if configured
        this.timeoutHandle = this.scheduleTimeout.postponeExecution(this.configParams.timeoutDuration, this);
      }

      return this; // Return the instance for chaining
    }

  });

})();