const webClient = require('http'); // Utilize Node.js HTTP client for network requests

/**
 * Expert module for retrieving direct media stream URLs from a video platform.
 * Applies advanced parsing and request handling logic.
 */
module.exports.retrieveMediaStream = function(inputOptions, completionHandler) {
  // Validate essential input parameters early
  if (!inputOptions || !inputOptions.mediaId) {
    return completionHandler(new Error('Missing required input: mediaId is essential for stream retrieval.'));
  }

  // --- Client Agent Configuration ---
  // Define default and platform-specific user agent strings for HTTP requests.
  const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  const ANDROID_USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36';
  
  let clientAgentInfo = {}; // Initialize HTTP headers container
  
  // Set the User-Agent based on the provided operating system, defaulting otherwise.
  if (inputOptions.operatingSystem === 'android') {
    clientAgentInfo['User-Agent'] = ANDROID_USER_AGENT;
  } else {
    clientAgentInfo['User-Agent'] = DEFAULT_USER_AGENT;
  }
  
  // Construct the Referer header using a template literal for clarity.
  clientAgentInfo['Referer'] = `http://www.youtube.com/watch?v=${inputOptions.mediaId}`;

  // --- Connection Settings ---
  // Define the parameters for the outgoing HTTP request.
  const connectionSettings = {
    targetHost: 'm.youtube.com', // The specific host for mobile YouTube content.
    requestPath: `/watch?ajax=1&layout=mobile&tsp=1&utcoffset=330&v=${inputOptions.mediaId}`,
    httpMethod: 'GET', // Standard GET request for resource retrieval.
    headers: clientAgentInfo // Attach the prepared client agent information.
  };

  let accumulatedPayload = ''; // Buffer to store incoming response data chunks.
  const JSON_PREFIX_LENGTH = 4; // Expected prefix length (e.g., ")]}'\n") to strip from JSON.

  // --- Initiate HTTP Request ---
  const outgoingRequest = webClient.request(connectionSettings, (incomingResponse) => {
    incomingResponse.setEncoding('utf8'); // Ensure response data is treated as UTF-8 text.

    // Event listener for receiving data chunks.
    incomingResponse.on('data', (dataSegment) => {
      accumulatedPayload += dataSegment; // Append each chunk to the buffer.
    });

    // Event listener for the end of the response.
    incomingResponse.on('end', () => {
      let parsedResponseData;
      try {
        // Attempt to parse the accumulated payload as JSON, after stripping the known prefix.
        parsedResponseData = JSON.parse(accumulatedPayload.slice(JSON_PREFIX_LENGTH));
      } catch (parsingError) {
        // If JSON parsing fails, report the error.
        return completionHandler(new Error(`Failed to parse response JSON: ${parsingError.message}`));
      }

      // Check for the existence of required data structures within the parsed response.
      const hasContent = parsedResponseData && parsedResponseData.payloadContent;
      const hasVideoDetails = hasContent && parsedResponseData.payloadContent.videoDetails;

      if (hasContent && hasVideoDetails) {
        const playerData = parsedResponseData.payloadContent.player_data;
        let mediaStreamLink = null;

        // Determine the stream URL source: either from fmt_stream_map or a direct stream_url.
        if (playerData && playerData.fmt_stream_map && playerData.fmt_stream_map.length > 0) {
          mediaStreamLink = playerData.fmt_stream_map[0].url;
        } else if (playerData && playerData.stream_url) {
          mediaStreamLink = playerData.stream_url;
        }

        if (mediaStreamLink) {
          // Successfully retrieved the stream URL.
          completionHandler(null, mediaStreamLink);
        } else {
          // Stream URL could not be found within the expected data structure.
          completionHandler(new Error('Stream URL not located in response data.'));
        }
      } else {
        // Essential content or video details were missing from the parsed response.
        completionHandler(new Error('Incomplete or malformed response structure received.'));
      }
    });
  });

  // --- Handle Request Errors ---
  outgoingRequest.on('error', (networkError) => {
    // Log and report any network-related errors during the request.
    console.error(`NETWORK_ISSUE: Problem encountered with the HTTP request: ${networkError.message}`);
    completionHandler(networkError);
  });

  // Finalize and send the HTTP request.
  outgoingRequest.end();
};