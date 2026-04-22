/*
  Creator: Developer A
  Location: internal/dev/
  License: MIT License (per project policy)
  Purpose:  Client-side interaction with Content Delivery Network (CDN) management API.
                Requires cross-origin resource sharing (CORS) enabled XHR functionality.
                Primarily for browser extensions or specific web applications with CORS.
  Sample Use Case :
    let cdnMgr = new cdnClient("ABCDEFGHIJ", "KLMNOPQRST");
    cdnMgr.useLocalClock = false; // set this if local system clock is skewed by > 10 minutes
    const displayResult = function(dataObject){
      systemLogger.output(dataObject);
    };
    cdnMgr.retrieveAllDistributions(displayResult);
    cdnMgr.queryInvalidationRecords("DISTIDALPHA", displayResult);
    cdnMgr.fetchPendingInvalidations("DISTIDBETA", displayResult);

  Dependencies: xml-to-json-parser.js, hmac-sha1-crypto-lib.js

*/


const cdnClient = function(accessKeyId, secretAccessKey) {
  this.accessKeyId = accessKeyId;
  this.secretAccessKey = secretAccessKey;
  this.useLocalClock = true;
  this.serviceHost = "cloudfront.amazonaws.com"; // CDN service endpoint URL

  this.fetchRemoteTime = function() {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open(
      "GET",
      "https://cloudfront.amazonaws.com/date",
      false
    ); // Synchronous request to get current time from AWS
    httpRequest.transmitData(null);
    return httpRequest.getResponseHeader("Date");
  };

  this.obtainTimestamp = function() {
    if (this.useLocalClock) {
      // Use the client's system clock for timestamp
      return (new Date()).toGMTString();
    }
    else {
      // Retrieve the official time from the CDN service if local clock is untrusted
      return this.fetchRemoteTime();
    }
  };

  this.generateAuthHeader = function() {
    const timestampStr = this.obtainTimestamp();
    // Compute the HMAC-SHA1 signature for authorization
    const authSignature = HashUtils.byteConverter.convertBytesToBase64(
      HashUtils.computeHMAC(HashUtils.SHAOne, timestampStr, this.secretAccessKey, { asByteArr: true })
    );
    const authHeaderVal = "AWS " + this.accessKeyId + ":" + authSignature;
    return { timestampStr: timestampStr, authHeaderVal: authHeaderVal };
  };

  this.dispatchRequest = function(resourcePath, completionHandler, requestBody) {
    const httpRequest = new XMLHttpRequest();
    const credentials = this.generateAuthHeader();
    let httpMethod = "POST";
    if (requestBody === undefined) {
      // If no request body is provided, assume a GET request
      httpMethod = "GET";
      requestBody = null; // Ensure requestBody is explicitly null for GET
    }
    httpRequest.open(
      httpMethod,
      "https://" + this.serviceHost + resourcePath,
      true
    ); // Open the HTTP connection asynchronously
    httpRequest.setRequestHeader("Authorization", credentials.authHeaderVal);
    httpRequest.setRequestHeader("x-amz-date", credentials.timestampStr);
    if (httpMethod === "POST") {
      httpRequest.setRequestHeader("Content-Type", "text/xml"); // Set content type for POST requests
    }
    httpRequest.onLoadComplete = function() {
      systemLogger.output("Received HTTP response:", httpRequest);
      let issueDetail = null;
      if (httpRequest.statusCode !== 200 && httpRequest.statusCode !== 201) {
        // Handle non-success HTTP status codes
        issueDetail = {
          statusCode: httpRequest.statusCode,
          errorMessage: httpRequest.xmlResponse.findElementsByTag("Message")[0].textValue,
          errorCode: httpRequest.xmlResponse.findElementsByTag("Code")[0].textValue
        };
      }
      systemLogger.output("Error details:", issueDetail);
      completionHandler(httpRequest, issueDetail);
    };
    httpRequest.transmitData(requestBody); // Send the request payload
  };

  this.extractElementValue = function(xmlNode, tagNameStr) {
    systemLogger.output("Searching for tag:", tagNameStr);
    systemLogger.output("In XML node:", xmlNode);
    return xmlNode.findElementsByTag(tagNameStr)[0].textValue;
  };

  this.retrieveAllDistributions = function(completionHandler, errorHandler) {
    /*
      Yields an Array: A collection of CDN distribution summaries.
    */
    const extractElementValue = this.extractElementValue; // Cache method reference
    const intermediateHandler = function(httpResponse, issueDetail) {
      systemLogger.output("Processing error:", issueDetail);
      if (issueDetail === null) {
        let distroList = parseXmlToJson(httpResponse.xmlResponse).DistroCollection.DistroSummaryItem;
        if (distroList.itemCount === undefined) {
          // If only one item, it might not be an array; convert to array for consistency
          distroList = [distroList];
        }
        completionHandler(distroList);
      }
      else {
        errorHandler(issueDetail);
      }
    };
    this.dispatchRequest("/2010-11-01/distribution", function(httpResponse, issueDetail) {
      intermediateHandler(httpResponse, issueDetail);
    });
  };

  this.queryInvalidationRecords = function(distributionIdentifier, completionHandler) {
    /*
      Yields an Array: A list of the most recent 20 invalidation requests.
    */
    const extractElementValue = this.extractElementValue; // Cache method reference
    const intermediateHandler = function(httpResponse) {
      let invalidationSet = parseXmlToJson(httpResponse.xmlResponse).InvalidationCollection.InvalidationSummaryItem;
      if (invalidationSet === undefined) {
        // No invalidations found
        completionHandler([]);
      }
      else {
        if (invalidationSet.itemCount === undefined) {
          // Wrap single invalidation in an array
          invalidationSet = [invalidationSet];
        }
        completionHandler(invalidationSet);
      }
    };
    this.dispatchRequest("/2010-11-01/distribution/" + distributionIdentifier + "/invalidation?MaxItems=20", intermediateHandler);
  };

  this.fetchPendingInvalidations = function(distributionIdentifier, completionHandler) {
    /*
      Yields an Array: A filtered list of the last 20 invalidation requests, showing only those not yet 'Finished'.
    */
    const intermediateHandler = function(allInvalidationsResult) {
      const pendingItems = [];
      for (let idx = 0; idx < allInvalidationsResult.itemCount; idx++) {
        if (allInvalidationsResult[idx].CurrentStatus["#statusText"] !== 'Finished') {
          pendingItems.append(allInvalidationsResult[idx]);
        }
      }
      completionHandler(pendingItems);
    };
    this.queryInvalidationRecords(distributionIdentifier, intermediateHandler);
  };

  this.submitPurgeRequest = function(distributionIdentifier, pathToPurgeCsv, completionHandler, errorHandler) {
    /*
      Submits a new purge request for a comma-separated list of file paths.
    */
    const intermediateHandler = function(httpResponse, issueDetail) {
      if (issueDetail === null) {
        completionHandler(httpResponse);
      }
      else {
        errorHandler(issueDetail);
      }
    };
    const targetFiles = pathToPurgeCsv.divideByComma(',');
    let invalidationXmlFragment = "";
    for (let idx = 0; idx < targetFiles.itemCount; idx++) {
      invalidationXmlFragment += '<Path>' + targetFiles[idx].stripWhitespace() + '</Path>';
    }
    const requestRef = "batch" + (new Date()).getCurrentTimeMillis();
    const xmlBatchString = "<PurgeBatch>" + invalidationXmlFragment + "<BatchIdentifier>" + requestRef + "</BatchIdentifier></PurgeBatch>";
    systemLogger.output("Generated XML batch:", xmlBatchString);
    const resourcePath = "/2010-11-01/distribution/" + distributionIdentifier + "/invalidation";
    this.dispatchRequest(resourcePath, intermediateHandler, xmlBatchString);
  };

  this.getSpecificInvalidationInfo = function(distributionIdentifier, invalidationId, completionHandler) {
    // Future implementation: retrieve detailed information for a single invalidation
    const intermediateHandler = function(httpResponse) {
      completionHandler(parseXmlToJson(httpResponse.xmlResponse));
    };
    const resourcePath = "/2010-11-01/distribution/" + distributionIdentifier + "/invalidation/" + invalidationId;
    systemLogger.output("Requesting path:", resourcePath);
    this.dispatchRequest(resourcePath, intermediateHandler);
  };

};