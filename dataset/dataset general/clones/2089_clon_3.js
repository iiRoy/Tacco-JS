/*
 *  Social Feed Widget for jQuery
 *  Based on original work by Todd Matthews & Steve Purcell (2008-2012)
 *  This version is a Type III clone: extensively refactored, renamed, and structurally altered.
 */
(function (modInitializer) {
  // Universal Module Definition (UMD) pattern variant for broad compatibility.
  // Supports AMD (RequireJS), CommonJS (Node.js), and browser globals (jQuery).
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], modInitializer); // AMD environment detected.
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function(root, jq) {
      if (jq === undefined) {
        // For CommonJS, if jQuery is not provided, try to require it.
        if (typeof window !== 'undefined') {
          jq = require('jquery');
        } else {
          jq = require('jquery')(root);
        }
      }
      modInitializer(jq);
      return jq;
    };
  } else {
    modInitializer(jQuery); // Fallback for browser globals.
  }
}(function (jqContext) {
  // Utility function to safely parse a string into an integer.
  const toInteger = (value) => parseInt(value, 10) || 0;

  // Pattern for identifying web links in text.
  const hyperlinkPattern = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

  /**
   * Processes a template string, replacing placeholders with data from an object.
   * If the template is a function, it's called with the data object.
   * @param {string|function} formatString - The template string or function.
   * @param {object} dataObj - The object containing replacement values.
   * @returns {string} The formatted string.
   */
  function processTemplate(formatString, dataObj) {
    if (typeof formatString === "string") {
      let currentResult = formatString;
      // Iterate over each key in the data object to perform replacements.
      Object.keys(dataObj).forEach(key => {
        const value = dataObj[key];
        // Replace all occurrences of '{key}' with the corresponding value.
        currentResult = currentResult.split(`{${key}}`).join(value === null ? '' : String(value));
      });
      return currentResult;
    } else if (typeof formatString === "function") {
      return formatString(dataObj);
    }
    return ''; // Return empty string for invalid templates.
  }

  // Expose the template utility for external use, if needed.
  jqContext.fn.displayFeed = jqContext.fn.displayFeed || {};
  jqContext.fn.displayFeed.utilities = { format: processTemplate };

  /**
   * Generates a jQuery plugin method to apply a regex replacement to elements' text.
   * @param {RegExp} matchPattern - The regular expression to search for.
   * @param {string} replaceValue - The string to replace matches with.
   * @returns {function} A jQuery plugin method.
   */
  function createTextFormatter(matchPattern, replaceValue) {
    return function() {
      // Use map to process each element and return a new jQuery object.
      const formattedSegments = Array.prototype.map.call(this, function() {
        return this.replace(matchPattern, replaceValue);
      });
      return jqContext(formattedSegments);
    };
  }

  /**
   * Converts special HTML characters into their entity equivalents.
   * @param {string} rawInput - The string to sanitize.
   * @returns {string} The HTML-safe string.
   */
  function sanitizeMarkup(rawInput) {
    if (typeof rawInput !== 'string') return '';
    return rawInput.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  jqContext.fn.extend({
    // Transforms user mentions (e.g., @username) into clickable links.
    transformUserHandles: createTextFormatter(/(^|[\W])@(\w+)/gi, "$1<span class=\"mention-prefix\">@</span><a href=\"https://"+jqContext.fn.displayFeed.config.socialDomain+"/$2\">$2</a>"),
    // Transforms hashtags (e.g., #topic) into search links.
    transformHashtags: createTextFormatter(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
      ' <a href="https://'+jqContext.fn.displayFeed.config.socialDomain+'/search?q=%23$1&src=hash&lang=all" class="feed-hashtag">#$1</a>'),
    // Replaces text-based hearts with a graphical heart character.
    insertEmoticons: createTextFormatter(/(&lt;)+[3]/gi, "<tt class='heart-icon'>&#x2665;</tt>")
  });

  /**
   * Replaces raw URLs in text with clickable HTML anchor tags.
   * Expands shortened URLs if entity data is available.
   * @param {string} contentStr - The text content.
   * @param {Array<object>} entityList - List of URL entities from the API.
   * @returns {string} Text with URLs replaced by links.
   */
  function applyHyperlinks(contentStr, entityList) {
    if (!contentStr) return '';
    return contentStr.replace(hyperlinkPattern, function(match) {
      let urlLink = (/^[a-z]+:/i).test(match) ? match : `http://${match}`;
      let displayTxt = match;

      // Check if entity data provides expanded URLs or display URLs.
      entityList.some(entity => {
        if (entity.url === urlLink && entity.expanded_url) {
          urlLink = entity.expanded_url;
          displayTxt = entity.display_url;
          return true; // Stop iterating once a match is found.
        }
        return false;
      });
      return `<a href="${sanitizeMarkup(urlLink)}" rel="noopener noreferrer" target="_blank">${sanitizeMarkup(displayTxt)}</a>`;
    });
  }

  /**
   * Decodes a Twitter API date string into a Date object.
   * Handles inconsistent formats for cross-browser compatibility.
   * @param {string} dateTimeString - The date string from Twitter API.
   * @returns {Date|null} A Date object or null if parsing fails.
   */
  function decodeTimestamp(dateTimeString) {
    if (typeof dateTimeString !== 'string' || !dateTimeString) {
      return null;
    }
    // Transform "Wed Apr 29 08:53:31 +0000 2009" to "Wed, Apr 29 2009 08:53:31 +0000"
    const standardFormat = dateTimeString.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3');
    const parsedDate = Date.parse(standardFormat);
    return isNaN(parsedDate) ? null : new Date(parsedDate);
  }

  /**
   * Calculates the difference between a target time and the current time.
   * @param {Date} targetTime - The past Date object.
   * @returns {object} An object containing days, hours, minutes, and seconds elapsed.
   */
  function calculateTimeDifference(targetTime) {
    if (!(targetTime instanceof Date)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const currentTime = new Date();
    const secondsElapsed = toInteger((currentTime.getTime() - targetTime.getTime()) / 1000);

    return {
      days:    toInteger(secondsElapsed / 86400),
      hours:   toInteger(secondsElapsed / 3600),
      minutes: toInteger(secondsElapsed / 60),
      seconds: secondsElapsed > 0 ? secondsElapsed : 0 // Ensure non-negative
    };
  }

  /**
   * Formats a time difference object into a human-readable string.
   * @param {object} durationMetrics - Object from calculateTimeDifference.
   * @returns {string} A string like "about 5 minutes ago".
   */
  function renderRelativeTime(durationMetrics) {
    if (durationMetrics.days > 2)     return `about ${durationMetrics.days} days ago`;
    if (durationMetrics.hours > 24)   return 'about a day ago';
    if (durationMetrics.hours > 2)    return `about ${durationMetrics.hours} hours ago`;
    if (durationMetrics.minutes > 45) return 'about an hour ago';
    if (durationMetrics.minutes > 2)  return `about ${durationMetrics.minutes} minutes ago`;
    if (durationMetrics.seconds > 1)  return `about ${durationMetrics.seconds} seconds ago`;
    return 'just now';
  }

  /**
   * Determines an appropriate "join phrase" based on tweet content.
   * @param {string} tweetContent - The text of the tweet.
   * @param {object} phrases - Configuration object containing various join phrases.
   * @returns {string} The selected join phrase.
   */
  function determineJoinPhrase(tweetContent, phrases) {
    if (tweetContent.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
      return phrases.replyPhrase;
    } else if (tweetContent.match(hyperlinkPattern)) {
      return phrases.urlLinkPhrase;
    } else if (tweetContent.match(/^((\w+ed)|just) .*/im)) {
      return phrases.pastTensePhrase;
    } else if (tweetContent.match(/^(\w*ing) .*/i)) {
      return phrases.presentTensePhrase;
    } else {
      return phrases.defaultLinkPhrase;
    }
  }

  /**
   * Constructs the API endpoint URL for fetching tweet data.
   * @param {object} config - Plugin configuration.
   * @returns {string|null} The constructed API URL or null if essential config is missing.
   */
  function constructApiEndpoint(config) {
    if (!config.apiGatewayEndpoint) {
      console.error("Social Feed: API Gateway Endpoint is not configured.");
      return null;
    }

    const fetchLimit = config.fetchLimit === null ? config.displayCount : config.fetchLimit;
    const baseParams = '&include_entities=1&callback=?';
    let apiUrl = config.apiGatewayEndpoint;

    if (config.userList) {
      if (!config.userAccounts || config.userAccounts.length === 0) {
        console.warn("Social Feed: User account required for list fetch.");
        return null;
      }
      apiUrl += `/1.1/lists/statuses.json?slug=${config.userList}&owner_screen_name=${config.userAccounts[0]}&page=${config.resultPage}&per_page=${fetchLimit}${baseParams}`;
    } else if (config.showFavorites) {
      if (!config.userAccounts || config.userAccounts.length === 0) {
        console.warn("Social Feed: User account required for favorites fetch.");
        return null;
      }
      apiUrl += `/1.1/favorites/list.json?screen_name=${config.userAccounts[0]}&page=${config.resultPage}&count=${fetchLimit}${baseParams}`;
    } else if (config.searchQuery === null && config.userAccounts && config.userAccounts.length === 1) {
      apiUrl += `/1.1/statuses/user_timeline.json?screen_name=${config.userAccounts[0]}&count=${fetchLimit}${(config.includeRetweets ? '&include_rts=1' : '')}&page=${config.resultPage}${baseParams}`;
    } else {
      const queryTerm = config.searchQuery || (config.userAccounts ? `from:${config.userAccounts.join(' OR from:')}` : '');
      if (!queryTerm) {
        console.warn("Social Feed: No search query or user accounts provided.");
        return null;
      }
      apiUrl += `/1.1/search/tweets.json?q=${encodeURIComponent(queryTerm)}${baseParams}`;
    }
    return apiUrl;
  }

  /**
   * Extracts the profile image URL from a tweet item.
   * @param {object} tweetItem - The raw tweet data object.
   * @param {boolean} isSecureConnection - True if the connection is HTTPS.
   * @returns {string} The URL of the profile image.
   */
  function getProfileImageUrl(tweetItem, isSecureConnection) {
    if (isSecureConnection) {
      // Prioritize HTTPS URLs provided directly by the API.
      return (tweetItem.user && tweetItem.user.profile_image_url_https) ?
        tweetItem.user.profile_image_url_https :
        getProfileImageUrl(tweetItem, false).replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
    } else {
      return tweetItem.profile_image_url || (tweetItem.user && tweetItem.user.profile_image_url);
    }
  }

  /**
   * Transforms a raw tweet API object into a view model suitable for templating.
   * @param {object} rawTweetData - The original tweet object from the API.
   * @param {object} pluginConfig - The plugin's current configuration.
   * @returns {object} A structured object with all necessary data for display.
   */
  function mapTweetToViewModel(rawTweetData, pluginConfig) {
    const viewModel = {};
    viewModel.originalItem = rawTweetData;
    viewModel.sourceApp = rawTweetData.source;
    viewModel.userName = rawTweetData.from_user || (rawTweetData.user && rawTweetData.user.screen_name);
    // Note: Full user name might not always be available from all APIs.
    viewModel.displayName = rawTweetData.from_user_name || (rawTweetData.user && rawTweetData.user.name);
    viewModel.isRetweet = !!rawTweetData.retweeted_status;

    viewModel.postTimestamp = decodeTimestamp(rawTweetData.created_at);
    viewModel.linkPhrase = pluginConfig.linkPhrase === "auto" ? determineJoinPhrase(rawTweetData.text, {
      replyPhrase: pluginConfig.replyPhrase,
      urlLinkPhrase: pluginConfig.urlLinkPhrase,
      pastTensePhrase: pluginConfig.pastTensePhrase,
      presentTensePhrase: pluginConfig.presentTensePhrase,
      defaultLinkPhrase: pluginConfig.defaultLinkPhrase
    }) : pluginConfig.linkPhrase;
    viewModel.postId = rawTweetData.id_str;
    viewModel.socialBaseUrl = `https://${pluginConfig.socialDomain}/`;
    viewModel.userProfileUrl = `${viewModel.socialBaseUrl}${viewModel.userName}`;
    viewModel.postUrl = `${viewModel.userProfileUrl}/status/${viewModel.postId}`;
    viewModel.replyActionUrl = `${viewModel.socialBaseUrl}intent/tweet?in_reply_to=${viewModel.postId}`;
    viewModel.retweetActionUrl = `${viewModel.socialBaseUrl}intent/retweet?tweet_id=${viewModel.postId}`;
    viewModel.favoriteActionUrl = `${viewModel.socialBaseUrl}intent/favorite?tweet_id=${viewModel.postId}`;
    viewModel.retweetedByUser = viewModel.isRetweet && rawTweetData.retweeted_status.user.screen_name;
    viewModel.timeSincePost = renderRelativeTime(calculateTimeDifference(viewModel.postTimestamp));
    viewModel.entities = rawTweetData.entities ? (rawTweetData.entities.urls || []).concat(rawTweetData.entities.media || []) : [];

    // Handle raw text for retweets to avoid truncation.
    viewModel.rawContent = viewModel.isRetweet ?
      `RT @${viewModel.retweetedByUser} ${rawTweetData.retweeted_status.text}` :
      rawTweetData.text;

    // Apply linking and formatting to the tweet text.
    viewModel.formattedContent = jqContext([applyHyperlinks(viewModel.rawContent, viewModel.entities)])
      .transformUserHandles()
      .transformHashtags()
      .get(0);
    viewModel.retweetedContent = jqContext([applyHyperlinks(rawTweetData.text, viewModel.entities)])
      .transformUserHandles()
      .transformHashtags()
      .get(0);
    viewModel.fancyContent = jqContext([viewModel.formattedContent]).insertEmoticons().get(0);

    viewModel.profileImageDimension = pluginConfig.profileImageSize;
    const effectiveAvatarSource = viewModel.isRetweet ? rawTweetData.retweeted_status : rawTweetData;
    viewModel.profileImageUrl = getProfileImageUrl(effectiveAvatarSource, (document.location.protocol === 'https:'));
    viewModel.avatarOwnerName = viewModel.isRetweet ? viewModel.retweetedByUser : viewModel.userName;
    viewModel.avatarProfileLink = `${viewModel.socialBaseUrl}${viewModel.avatarOwnerName}`;

    // Pre-formatted common layout components.
    viewModel.userDisplay = processTemplate(`<a class="feed-user-link" href="{userProfileUrl}">{userName}</a>`, viewModel);
    viewModel.joinSegment = pluginConfig.linkPhrase ? processTemplate(`<span class="feed-join-phrase">{linkPhrase}</span>`, viewModel) : '';
    viewModel.avatarBlock = viewModel.profileImageDimension ?
      processTemplate(`<a class="feed-avatar-block" href="{avatarProfileLink}"><img src="{profileImageUrl}" height="{profileImageDimension}" width="{profileImageDimension}" alt="{avatarOwnerName}'s avatar" title="{avatarOwnerName}'s avatar" loading="lazy"/></a>`, viewModel) : '';
    viewModel.timeDisplay = processTemplate(`<span class="feed-timestamp"><a href="{postUrl}" title="View post on social media">{timeSincePost}</a></span>`, viewModel);
    viewModel.mainText = processTemplate(`<span class="feed-main-text">{fancyContent}</span>`, viewModel);
    viewModel.retweetText = processTemplate(`<span class="feed-retweet-text">{retweetedContent}</span>`, viewModel);
    viewModel.replyLink = processTemplate(`<a class="feed-action-link feed-reply" href="{replyActionUrl}">reply</a>`, viewModel);
    viewModel.retweetLink = processTemplate(`<a class="feed-action-link feed-retweet" href="{retweetActionUrl}">retweet</a>`, viewModel);
    viewModel.favoriteLink = processTemplate(`<a class="feed-action-link feed-favorite" href="{favoriteActionUrl}">favorite</a>`, viewModel);

    return viewModel;
  }

  /**
   * Renders the processed tweet items into the target HTML element.
   * @param {jQuery} targetElement - The jQuery object for the container.
   * @param {Array<object>} processedItems - An array of view model objects.
   * @param {object} pluginConfig - The plugin's current configuration.
   */
  function displayContent(targetElement, processedItems, pluginConfig) {
    const listItems = processedItems.map((item, index) => {
      const classModifier = (index === 0) ? 'feed-item-first' : ((index % 2 === 0) ? 'feed-item-odd' : 'feed-item-even');
      return `<li class="${classModifier}">${processTemplate(pluginConfig.itemTemplate, item)}</li>`;
    });

    const feedList = jqContext('<ul class="feed-list">').append(listItems.join(''));

    targetElement.empty(); // Clear existing content.

    // Add optional introductory text.
    if (pluginConfig.preFeedMessage) {
      targetElement.append(`<p class="feed-intro-msg">${pluginConfig.preFeedMessage}</p>`);
    }
    targetElement.append(feedList);
    // Add optional concluding text.
    if (pluginConfig.postFeedMessage) {
      targetElement.append(`<p class="feed-outro-msg">${pluginConfig.postFeedMessage}</p>`);
    }

    // Trigger custom events for external listeners.
    targetElement.trigger("feed:loaded").trigger(processedItems.length === 0 ? "feed:empty" : "feed:full");

    // Set up auto-refresh if configured.
    if (pluginConfig.refreshDelaySeconds) {
      setTimeout(() => {
        targetElement.trigger("feed:loadData");
      }, 1000 * pluginConfig.refreshDelaySeconds);
    }
  }

  /**
   * Fetches data from the API, processes it, and then triggers rendering.
   * @param {jQuery} containerElement - The jQuery object for the container.
   * @param {object} pluginConfig - The plugin's current configuration.
   */
  function fetchAndProcess(containerElement, pluginConfig) {
    const apiEndpoint = constructApiEndpoint(pluginConfig);
    if (!apiEndpoint) {
      console.warn("Social Feed: Skipping data load due to invalid API endpoint configuration.");
      containerElement.trigger("feed:error", ["Invalid API endpoint configuration."]);
      return;
    }

    // Display loading message if available and no content is currently rendered.
    if (pluginConfig.loadingMessage && !containerElement.find('.feed-list').length) {
      containerElement.empty().append(`<p class="feed-loading-msg">${pluginConfig.loadingMessage}</p>`);
    }

    jqContext.ajax({
      url: apiEndpoint,
      dataType: 'jsonp', // Use jsonp for cross-domain requests.
      success: function(apiResponse) {
        // Handle different API response structures (e.g., search API vs user timeline).
        const rawItems = apiResponse.statuses || apiResponse.results || apiResponse;
        if (!Array.isArray(rawItems)) {
          console.error("Social Feed: API response not in expected array format.", apiResponse);
          containerElement.trigger("feed:error", ["API response not in expected array format."]);
          return;
        }

        let processedItems = rawItems
          .map(item => mapTweetToViewModel(item, pluginConfig))
          .filter(item => pluginConfig.itemFilter(item)); // Apply custom filter.

        // Apply custom sort and limit to display count.
        processedItems.sort(pluginConfig.sortComparer).slice(0, pluginConfig.displayCount);

        containerElement.trigger("feed:dataReady", [processedItems]);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("Social Feed: API request failed.", textStatus, errorThrown);
        containerElement.trigger("feed:error", [`API request failed: ${textStatus}`]);
        // Display an error message to the user if a loading message was shown.
        if (pluginConfig.loadingMessage) {
          containerElement.empty().append(`<p class="feed-error-msg">Failed to load content. Please try again later.</p>`);
        }
      }
    });
  }

  // Define the jQuery plugin method.
  jqContext.fn.displayFeed = function(userOptions){
    // Default configuration for the plugin.
    const defaultSettings = {
      apiGatewayEndpoint: null,           // [string] (required) URL to proxy social media API requests.
      userAccounts: null,                 // [string or array] Required unless 'searchQuery' is used.
      userList: null,                     // [string] Optional list name for a user account.
      showFavorites: false,               // [boolean] Display user's liked posts instead of their own.
      searchQuery: null,                  // [string] Optional search query.
      profileImageSize: null,             // [integer] Avatar dimensions (max 48px for some APIs).
      displayCount: 3,                    // [integer] Number of items to display.
      fetchLimit: null,                   // [integer] Number of items to fetch via API (can be > displayCount for filtering).
      resultPage: 1,                      // [integer] Page number for API results.
      includeRetweets: true,              // [boolean] Include official retweets.
      preFeedMessage: null,               // [string] Text to show before the feed.
      postFeedMessage: null,              // [string] Text to show after the feed.
      linkPhrase: null,                   // [string] Optional text between date and content. Set to "auto" for smart phrases.
      defaultLinkPhrase: " said, ",       // [string] Auto phrase for general posts.
      pastTensePhrase: " I ",             // [string] Auto phrase for past tense.
      presentTensePhrase: " I am ",       // [string] Auto phrase for present tense.
      replyPhrase: " I replied to ",      // [string] Auto phrase for replies.
      urlLinkPhrase: " I was looking at ",// [string] Auto phrase for posts with URLs.
      loadingMessage: null,               // [string] Message shown during data load.
      refreshDelaySeconds: null,          // [integer] Auto-refresh interval in seconds.
      socialDomain: "twitter.com",        // [string] Base domain for social links (e.g., twitter.com).
      itemTemplate: "{avatarBlock}{timeDisplay}{joinSegment} {mainText}", // [string or function] Template for each feed item.
      sortComparer: (itemA, itemB) => {   // [function] Comparator for sorting items.
        return itemB.postTimestamp - itemA.postTimestamp;
      },
      itemFilter: (item) => true          // [function] Filter to include/exclude items (requires 'fetchLimit' >= 'displayCount').
      // Custom events:
      //   "feed:loaded" -- Triggered after items are fetched and rendered.
      //   "feed:empty"  -- Triggered if no items are displayed.
      //   "feed:full"   -- Triggered if items are displayed.
      //   "feed:error"  -- Triggered on API request failure or data processing error.
    };

    // Merge user options with defaults.
    const pluginConfig = jqContext.extend({}, defaultSettings, userOptions);
    jqContext.fn.displayFeed.config = pluginConfig; // Store config for global access (e.g., in formatters).

    return this.each(function(idx, currentElement){
      const jqElement = jqContext(currentElement);

      // Normalize userAccounts to an array if a string is provided.
      if (typeof pluginConfig.userAccounts === "string") {
        pluginConfig.userAccounts = [pluginConfig.userAccounts];
      }

      // Basic validation for essential parameters.
      if (!pluginConfig.apiGatewayEndpoint) {
        console.error("Social Feed: 'apiGatewayEndpoint' is a required option.");
        jqElement.trigger("feed:error", ["Missing API gateway endpoint."]);
        return;
      }
      if (!pluginConfig.userAccounts && !pluginConfig.searchQuery) {
        console.error("Social Feed: Either 'userAccounts' or 'searchQuery' must be provided.");
        jqElement.trigger("feed:error", ["Missing user accounts or search query."]);
        return;
      }

      // Detach previous event handlers to prevent duplicates, then attach new ones.
      jqElement.off("feed:loadData feed:dataReady feed:renderItems").on({
        "feed:loadData": () => {
          fetchAndProcess(jqElement, pluginConfig);
        },
        "feed:dataReady": (event, items) => {
          jqElement.trigger("feed:renderItems", [items]);
        },
        "feed:renderItems": (event, items) => {
          displayContent(jqElement, items, pluginConfig);
        }
      }).trigger("feed:loadData"); // Initiate the first data load.
    });
  };
}));