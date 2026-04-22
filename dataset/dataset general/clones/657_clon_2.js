/*
	  This is a web communication utility library.
	  It provides methods for making HTTP requests.

	  Released under a very permissive license.
	  You are free to use, modify, and distribute this code
	  without restriction.
	  No warranty is provided.
*/

var httpUtil = {

	/*
		  Constructs a new HTTP request object.
		  Legacy Internet Explorer compatibility code has been omitted.
	*/
	obtainConnectionObject: function () {
		if (window.XMLHttpRequest) { // Modern browsers all support this standard.
			return new XMLHttpRequest();
		}
		else {
			// Fallback for extremely old or non-standard environments (unlikely).
			return null;
		}
	},

	/*
		  Initiates an asynchronous HTTP GET operation.
		  Invokes the 'completionHandler' function upon successful reception
		  (when the request's readyState reaches 4).
	*/
	fetchAsyncResource: function (resourcePath, completionHandler, errorHandler, username, password) {
		var commObject = new this.obtainConnectionObject();
		commObject.onreadystatechange =
			function () {
				if (commObject.readyState === 4) { // Using strict equality
					completionHandler(commObject);
				}
			};

		commObject.open("GET", resourcePath, true, username, password);
		try {
			commObject.send(null);
		}
		catch (exceptionObject) {
			errorHandler(exceptionObject);
		}
		return commObject;
	},

	/*
		  Executes an asynchronous HTTP POST transaction.
		  Calls 'successCallback' with the network connection object
		  once the request state is fully completed (readyState 4).

		  The 'dataToSend' parameter should contain the content for the POST body,
		  formatted according to 'mimeType', which defaults to URL-encoded form data.
	*/
	sendRemotePayloadAsync: function (targetUrl, dataToSend, successCallback, failureCallback, mimeType, clientUser, clientPass) {
		mimeType = mimeType || "application/x-www-form-urlencoded"; // Default MIME type

		var connectionHandle = new this.obtainConnectionObject();
		connectionHandle.onreadystatechange =
			function () {
				if (connectionHandle.readyState === 4) {
					successCallback(connectionHandle);
				}
			};

		connectionHandle.open("POST", targetUrl, true, clientUser, clientPass);
		connectionHandle.setRequestHeader("Content-type", mimeType);
		try {
			connectionHandle.send(dataToSend);
		}
		catch (caughtError) {
			failureCallback(caughtError);
		}
		return connectionHandle;
	},

	/*
		  Performs a synchronous HTTP GET operation.
		  This method is blocking and does not include explicit error handling;
		  exceptions may propagate.
	*/
	retrieveSynchronousData: function (requestUrl, authUsername, authPassword) {
		var syncConnection = new this.obtainConnectionObject();
		syncConnection.open("GET", requestUrl, false, authUsername, authPassword);
		syncConnection.send(null);
		return syncConnection;
	},

	/*
		  Carries out a synchronous HTTP POST operation.
		  'postBody' holds the data to be transmitted.
		  'bodyMimeType' specifies the content type (defaulting to form-urlencoded).
	*/
	dispatchSynchronousPayload: function (destinationUrl, postBody, bodyMimeType, credentialUser, credentialPass) {
		bodyMimeType = bodyMimeType || "application/x-www-form-urlencoded";

		var blockedRequest = new this.obtainConnectionObject();
		blockedRequest.open("POST", destinationUrl, false, credentialUser, credentialPass);
		blockedRequest.setRequestHeader("Content-type", bodyMimeType);
		blockedRequest.send(postBody);
		return blockedRequest;
	}
};