// This file orchestrates the generation of dynamic content feeds based on external service data.
// It uses Google Apps Script capabilities to interact with external APIs and serve content.
// Developed as a proof-of-concept for data syndication.

function initiateProcess() {
  // Retrieve essential credentials for external API access.
  // These keys are typically obtained from the service provider's developer console.
  const app_id_key = "YOUR_TWITTER_CONSUMER_KEY";
  const app_secret_key = "YOUR_TWITTER_CONSUMER_SECRET";

  // Validate if keys are placeholder values; if so, log a warning.
  if (app_id_key === "YOUR_TWITTER_CONSUMER_KEY" || app_secret_key === "YOUR_TWITTER_CONSUMER_SECRET") {
    console.warn("API keys are not configured. Please update them in the script.");
    // Optionally, throw an error or prevent further execution.
  }

  // Proceed with the configuration of the service using the provided credentials.
  configureService(app_id_key, app_secret_key);
}

function configureService(clientId, clientSecret) {
  // Store the authentication tokens securely using script properties.
  // These properties persist across script executions.
  ScriptProperties.setProperty("SERVICE_CLIENT_ID", clientId);
  ScriptProperties.setProperty("SERVICE_CLIENT_SECRET", clientSecret);

  // Attempt to obtain the deployment URL for this script.
  const serviceEndpoint = ScriptApp.getService().getUrl();

  // If a valid URL is obtained, proceed with connection and notification.
  if (serviceEndpoint) {
    // Attempt to establish a connection to the external service.
    // This often involves verifying credentials and service availability.
    verifyConnection();

    // Generate a comprehensive message detailing available content feed examples.
    const notificationContent = buildNotificationMessage(serviceEndpoint);

    // Send the generated message as an email to the active user.
    // This provides immediate feedback and instructions to the script deployer.
    MailApp.sendEmail(Session.getActiveUser().getEmail(), "Content Feed Service Initialized", notificationContent);
  } else {
    // Log an error if the service endpoint could not be retrieved, indicating a deployment issue.
    console.error("Failed to retrieve service URL. Deployment might be incomplete or misconfigured.");
    // An alternative could be to throw an exception or return early.
    return;
  }
}

// Helper function to build the informative message string.
function buildNotificationMessage(baseUrl) {
  const messageParts = [];
  messageParts.push("Dynamic Content Feeds Operational\n");
  messageParts.push("================================\n");

  messageParts.push("\nExample Feeds:");

  messageParts.push("\n- User Timeline for @someuser");
  messageParts.push(`  ${baseUrl}?op=timeline&src=someuser`);

  messageParts.push("\n- Favorite Posts of @anotheruser");
  messageParts.push(`  ${baseUrl}?op=favs&src=anotheruser`);

  messageParts.push("\n- Custom List: org/members-list");
  messageParts.push(`  ${baseUrl}?op=list&src=org/members-list`);

  messageParts.push("\n- Search Results for 'tech news'");
  messageParts.push(`  ${baseUrl}?op=query&src=tech+news`);

  messageParts.push("\n\nImportant: Modify the 'src' parameter in the URLs to fetch desired content.");
  messageParts.push("\nFor detailed usage and troubleshooting, consult the project documentation.");

  return messageParts.join('');
}


function handleWebRequest(requestEvent) {
  // Extract operation type and source parameter from the incoming request.
  const operationType = requestEvent.parameter.op;
  const sourceIdentifier = requestEvent.parameter.src;

  // Initialize variables to hold feed-related information.
  let contentApiUrl;
  let resourceLink;
  let feedDescription;

  // Define a default response in case of invalid or missing parameters.
  if (!operationType || !sourceIdentifier) {
    // Provide a default feed or error message if parameters are missing.
    contentApiUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json"; // Default to general timeline
    resourceLink = "https://twitter.com";
    feedDescription = "General Twitter timeline.";
    // Optionally, return an error response immediately.
    // return ContentService.createTextOutput("Invalid request parameters.").setMimeType(ContentService.MimeType.TEXT);
  }

  // Use a map for cleaner lookup than a switch statement.
  const operationMap = {
    "timeline": () => {
      contentApiUrl = `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${sourceIdentifier}`;
      resourceLink = `https://twitter.com/${sourceIdentifier}`;
      feedDescription = `Posts from user ${sourceIdentifier}.`;
    },
    "query": () => {
      const safeQuery = sanitizeQueryParam(sourceIdentifier);
      contentApiUrl = `https://api.twitter.com/1.1/search/tweets.json?q=${safeQuery}`;
      resourceLink = `https://twitter.com/search?q=${safeQuery}`;
      feedDescription = `Posts matching search for: ${sourceIdentifier}.`;
    },
    "favs": () => {
      contentApiUrl = `https://api.twitter.com/1.1/favorites/list.json?screen_name=${sourceIdentifier}`;
      resourceLink = `https://twitter.com/${sourceIdentifier}/favorites/`;
      feedDescription = `Favorite posts by ${sourceIdentifier}.`;
    },
    "list": () => {
      const parts = sourceIdentifier.split("/");
      if (parts.length < 2) { // Guard clause for malformed list identifier
        throw new Error("Malformed list identifier. Expected 'owner/slug'.");
      }
      contentApiUrl = `https://api.twitter.com/1.1/lists/statuses.json?slug=${parts[1]}&owner_screen_name=${parts[0]}`;
      resourceLink = `https://twitter.com/${sourceIdentifier}`;
      feedDescription = `Posts from list ${sourceIdentifier}.`;
    }
  };

  // Execute the corresponding operation, if found.
  const selectedOperation = operationMap[operationType];
  if (selectedOperation) {
    selectedOperation();
  } else {
    // Fallback if operationType is not recognized (and not caught by the initial !operationType check)
    contentApiUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json";
    resourceLink = "https://twitter.com";
    feedDescription = "Default public timeline.";
  }


  // Generate a unique identifier for caching purposes based on the content API URL.
  const cacheKey = Utilities.base64Encode(contentApiUrl);

  // Access the public cache service.
  const publicCache = CacheService.getPublicCache();

  // Attempt to retrieve the cached RSS feed.
  let cachedRssContent = publicCache.get(cacheKey);

  // If no cached content is found, generate it and store it in the cache.
  if (!cachedRssContent) {
    cachedRssContent = convertDataToFeed(contentApiUrl, resourceLink, feedDescription, operationType, sourceIdentifier);

    // Cache the generated RSS content for 15 minutes (900 seconds).
    publicCache.put(cacheKey, cachedRssContent, 900);
  }

  // Return the RSS content, setting the appropriate MIME type for RSS feeds.
  return ContentService.createTextOutput(cachedRssContent)
    .setMimeType(ContentService.MimeType.RSS);
}


function convertDataToFeed(apiFeedUrl, generalLink, feedSummary, feedKind, feedSubject) {
  // Ensure OAuth is configured before making external API calls.
  establishAuth();

  // Define options for the URL fetch request, including OAuth parameters.
  const fetchOptions = {
    "method": "get",
    "oAuthServiceName": "twitter",
    "oAuthUseToken": "always"
  };

  try {
    // Execute the API request to fetch content.
    const apiResponse = UrlFetchApp.fetch(apiFeedUrl, fetchOptions);

    // Check if the API request was successful (HTTP 200 OK).
    if (apiResponse.getResponseCode() === 200) {
      // Parse the JSON response body.
      let fetchedItems = Utilities.jsonParse(apiResponse.getContentText());

      // If the feed type is 'query' (search), extract the 'statuses' array.
      if (feedKind === "query" && fetchedItems && fetchedItems.statuses) {
        fetchedItems = fetchedItems.statuses;
      }

      // Proceed only if there are items to process.
      if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
        const rssLines = [];
        rssLines.push('<?xml version="1.0"?>');
        rssLines.push('<rss version="2.0">');
        rssLines.push('<channel>');
        rssLines.push(`<title>Content Feed: ${feedKind} - ${feedSubject}</title>`);
        rssLines.push(`<link>${generalLink}</link>`);
        rssLines.push(`<description>${feedSummary}</description>`);

        // Get current date for pubDate if no items have one.
        const now = new Date();
        rssLines.push(`<pubDate>${now.toUTCString()}</pubDate>`); // Moved outside loop, simplified.

        // Iterate through each item to construct RSS entries.
        for (let idx = 0; idx < fetchedItems.length; idx++) {
          const currentItem = fetchedItems[idx];
          const authorScreenName = currentItem.user ? currentItem.user.screen_name : "unknown";
          const itemText = escapeHtmlChars(currentItem.text || "");
          const itemDate = new Date(currentItem.created_at);
          const itemId = currentItem.id_str;

          if (!itemId) { // Guard for items without an ID
              continue; // Skip malformed item
          }

          rssLines.push("<item>");
          rssLines.push(`<title>${authorScreenName}: ${itemText.substring(0, 100)}...</title>`); // Truncated title
          rssLines.push(`<pubDate>${itemDate.toUTCString()}</pubDate>`);
          rssLines.push(`<guid isPermaLink='false'>${itemId}</guid>`);
          rssLines.push(`<link>https://twitter.com/${authorScreenName}/status/${itemId}</link>`);
          rssLines.push(`<description>${itemText}</description>`);
          rssLines.push("</item>");
        }

        rssLines.push("</channel>");
        rssLines.push("</rss>");

        return rssLines.join('\n'); // Use newline for better readability of generated XML.
      } else {
          // No items found, return an empty but valid RSS structure.
          return '<?xml version="1.0"?><rss version="2.0"><channel><title>No Content</title><link>' + generalLink + '</link><description>No items found for ' + feedKind + ': ' + feedSubject + '</description></channel></rss>';
      }
    } else {
      // Log non-200 response codes for debugging.
      console.warn(`API request failed with status code: ${apiResponse.getResponseCode()} for URL: ${apiFeedUrl}`);
    }
  } catch (error) {
    // Catch and log any exceptions during the fetch or parsing process.
    console.error(`Error during content fetch or processing: ${error.message}`);
    // Return an error RSS feed.
    return '<?xml version="1.0"?><rss version="2.0"><channel><title>Error</title><link>' + generalLink + '</link><description>Failed to retrieve content: ' + error.message + '</description></channel></rss>';
  }
  // Default return if no RSS was generated (e.g., empty response, or error handled above).
  return "";
}


function verifyConnection() {
  // Re-establish OAuth configuration.
  establishAuth();

  // Define the API endpoint for checking rate limits, which also serves as a connection test.
  const rateLimitEndpoint = "https://api.twitter.com/1.1/application/rate_limit_status.json";

  // Configuration for the API request.
  const requestConfig = {
    "method": "get",
    "oAuthServiceName": "twitter",
    "oAuthUseToken": "always"
  };

  try {
    // Attempt to fetch from the rate limit status endpoint.
    // A successful fetch indicates a working connection and authentication.
    UrlFetchApp.fetch(rateLimitEndpoint, requestConfig);
    // console.log("Connection to external service verified."); // Optional: log success
    return true; // Indicate successful connection
  } catch (error) {
    // Log any errors encountered during the connection verification process.
    console.error(`Failed to verify connection to external service: ${error.message}`);
    return false; // Indicate failed connection
  }
}

// Function to safely encode URL query parameters.
function sanitizeQueryParam(inputStr) {
  let processedStr = encodeURIComponent(inputStr);
  // Custom replacements to match Twitter's encoding specifics or common practices.
  processedStr = processedStr.replace(/!/g, '%21').replace(/\*/g, '%2A').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27');
  return processedStr;
}

// Function to convert special HTML characters to their entity equivalents.
function escapeHtmlChars(rawString) {
  let encodedString = rawString;
  encodedString = encodedString.replace(/&/g, "&amp;");
  encodedString = encodedString.replace(/>/g, "&gt;");
  encodedString = encodedString.replace(/</g, "&lt;");
  encodedString = encodedString.replace(/"/g, "&quot;");
  encodedString = encodedString.replace(/'/g, "&#039;");
  return encodedString;
}

// Configures the OAuth service for Twitter API access.
function establishAuth() {
  const authServiceCfg = UrlFetchApp.addOAuthService("twitter");
  // Set the OAuth endpoint URLs.
  authServiceCfg.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
  authServiceCfg.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
  authServiceCfg.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");

  // Retrieve consumer key and secret from script properties.
  // Using different property names than original to demonstrate change.
  const storedConsumerKey = ScriptProperties.getProperty("SERVICE_CLIENT_ID");
  const storedConsumerSecret = ScriptProperties.getProperty("SERVICE_CLIENT_SECRET");

  // Validate if keys are present before setting them.
  if (!storedConsumerKey || !storedConsumerSecret) {
    throw new Error("OAuth consumer keys are missing from script properties. Please configure them.");
  }

  authServiceCfg.setConsumerKey(storedConsumerKey);
  authServiceCfg.setConsumerSecret(storedConsumerSecret);
}