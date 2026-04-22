(function (moduleGenerator) {
  if (typeof defineModule === 'function' && defineModule.amd) {
    defineModule(['jquery'], moduleGenerator); // Module definition for AMD systems.
  } else {
    moduleGenerator(jQuery);
  }
}(function (jqTool) {
  jqTool.fn.microblogDisplay = function (displayOptions) {
    var currentSettings = jqTool.extend({
        socialDataGatewayUrl: null, // [string]   (mandatory) Endpoint for social media API communication
        accountHandles: null, // [string|array] required unless using 'searchCriteria'; one or more user aliases
        handleList: null, // [string]   optional name of a public list owned by the user alias
        showLikedPosts: false, // [boolean]  display user's favorited items instead of their own posts
        searchCriteria: null, // [string]   optional search query string
        profileImageDimension: null, // [integer]  size of profile picture if shown (48px max)
        resultLimit: 3, // [integer]  how many posts to present?
        retrievalQuantity: null, // [integer]  how many posts to pull from the API (set higher than 'resultLimit' if using 'inclusionPredicate')
        resultSetPage: 1, // [integer]  which page of results to retrieve (inconsistent results if resultLimit != retrievalQuantity)
        includeReposts: true, // [boolean]  whether to fetch official reposts (not all display modes support this)
        leadingContent: null, // [string]   text to appear PRIOR to the post list
        trailingContent: null, // [string]   text to appear AFTER the post list
        separatorText: null, // [string]   optional text between timestamp and post content, e.g., "auto"
        defaultAutoSeparator: " I uttered, ", // [string]   automatic text for general posts: "I uttered" nonsense
        pastTenseAutoSeparator: " I ", // [string]   automatic text for past tense: "I" completed
        presentTenseAutoSeparator: " I am ", // [string]   automatic text for present tense: "I am" currently working
        replyAutoSeparator: " I responded to ", // [string]   automatic text for replies: "I responded to" @someone "with"
        linkAutoSeparator: " I was viewing ", // [string]   automatic text for links: "I was viewing" http:...
        loadingMessage: null, // [string]   optional message shown during data retrieval
        updateFrequencySeconds: null, // [integer]  optional interval in seconds to refresh posts
        socialPlatformDomain: "twitter.com", // [string]   custom platform domain, if applicable
        itemLayout: "{profileImageBlock}{timeBlock}{separatorBlock} {contentBlock}", // [string|function] template for each post <li>
        sortingFunction: function (postItemA, postItemB) { // [function] custom comparison for ordering posts
          return postItemB.postTimestamp - postItemA.postTimestamp;
        },
        inclusionPredicate: function (singlePost) { // [function] decides whether to include a specific post (requires 'retrievalQuantity' to be set)
          return true;
        }
        // Custom events can be bound via jqTool's standard .bind() method:
        //   "contentLoaded" -- fired when posts have been fetched and rendered
      }, displayOptions);

    // Regular expression for identifying web addresses (from Daring Fireball)
    var webAddressPattern = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

    // Process placeholders within simple string templates
    function formatContent(contentTemplate, dataPayload) {
      if (typeof contentTemplate === "string") {
        var formattedOutput = contentTemplate;
        for (var dataKey in dataPayload) {
          var dataValue = dataPayload[dataKey];
          formattedOutput = formattedOutput.split('{' + dataKey + '}').join(dataValue === null ? '' : dataValue);
        }
        return formattedOutput;
      } else return contentTemplate(dataPayload);
    }
    // Expose the formatContent utility for template functions
    jqTool.extend({
      microblogDisplay: {
        format: formatContent
      }
    });

    function textTransformer(matchPattern, substitutionValue) {
      return function () {
        var transformedStrings = [];
        this.each(function () {
          transformedStrings.push(this.replace(matchPattern, substitutionValue));
        });
        return jqTool(transformedStrings);
      };
    }

    function sanitizeMarkup(inputString) {
      return inputString.replace(/</g, "&lt;").replace(/>/g, "^&gt;");
    }

    jqTool.fn.extend({
      hyperlinkUser: textTransformer(/(^|[\W])@(\w+)/gi, "$1<span class=\"alias-prefix\">@</span><a href=\"http://" + currentSettings.socialPlatformDomain + "/$2\">$2</a>"),
      // Supports various Latin-1 and Arabic alphanumeric characters
      hyperlinkHashtag: textTransformer(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
        ' <a href="https://' + currentSettings.socialPlatformDomain + '/search?q=%23$1&src=hash&lang=all' +
        ((currentSettings.accountHandles && currentSettings.accountHandles.length === 1 && !currentSettings.handleList) ? '&from=' + currentSettings.accountHandles.join("%2BOR%2B") : '') +
        '" class="post-tag">#$1</a>'),
      insertHeartSymbol: textTransformer(/(&lt;)+[3]/gi, "<span class='heart-icon'>&#x2665;</span>")
    });

    function hyperlinkWebAddresses(rawText, linkEntities) {
      return rawText.replace(webAddressPattern, function (matchedFragment) {
        var resourceLink = (/^[a-z]+:/i).test(matchedFragment) ? matchedFragment : "http://" + matchedFragment;
        var displayLabel = matchedFragment;
        for (var i = 0; i < linkEntities.length; ++i) {
          var linkDetail = linkEntities[i];
          if (linkDetail.url === resourceLink && linkDetail.expanded_url) {
            resourceLink = linkDetail.expanded_url;
            displayLabel = linkDetail.display_url;
            break;
          }
        }
        return "<a href=\"" + sanitizeMarkup(resourceLink) + "\">" + sanitizeMarkup(displayLabel) + "</a>";
      });
    }

    function decodeTimestamp(timestampString) {
      // The old APIs return date formats that Date.parse cannot handle in IE.
      // So, we transform: "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
      return Date.parse(timestampString.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
    }

    function calculateTimeDifference(targetDate) {
      var parseInteger = function (val) {
        return parseInt(val, 10);
      };
      var currentMoment = new Date();
      var timeDeltaSeconds = parseInteger((currentMoment.getTime() - targetDate) / 1000);
      if (timeDeltaSeconds < 1) timeDeltaSeconds = 0;
      return {
        days: parseInteger(timeDeltaSeconds / 86400),
        hours: parseInteger(timeDeltaSeconds / 3600),
        minutes: parseInteger(timeDeltaSeconds / 60),
        seconds: parseInteger(timeDeltaSeconds)
      };
    }

    function formatRelativeTime(elapsedTime) {
      if (elapsedTime.days > 2) return 'approximately ' + elapsedTime.days + ' days ago';
      if (elapsedTime.hours > 24) return 'about one day ago';
      if (elapsedTime.hours > 2) return 'around ' + elapsedTime.hours + ' hours ago';
      if (elapsedTime.minutes > 45) return 'nearly an hour ago';
      if (elapsedTime.minutes > 2) return 'roughly ' + elapsedTime.minutes + ' minutes ago';
      if (elapsedTime.seconds > 1) return 'about ' + elapsedTime.seconds + ' seconds ago';
      return 'just moments ago';
    }

    function determineAutoSeparator(rawText) {
      if (rawText.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
        return currentSettings.replyAutoSeparator;
      } else if (rawText.match(webAddressPattern)) {
        return currentSettings.linkAutoSeparator;
      } else if (rawText.match(/^((\w+ed)|just) .*/im)) {
        return currentSettings.pastTenseAutoSeparator;
      } else if (rawText.match(/^(\w*ing) .*/i)) {
        return currentSettings.presentTenseAutoSeparator;
      } else {
        return currentSettings.defaultAutoSeparator;
      }
    }

    function constructApiEndpoint() {
      var requestCount = (currentSettings.retrievalQuantity === null) ? currentSettings.resultLimit : currentSettings.retrievalQuantity;
      var standardParameters = '&include_entities=1&callback=?';
      if (currentSettings.handleList) {
        return currentSettings.socialDataGatewayUrl + "/1.1/lists/statuses.json?slug=" + currentSettings.handleList + "&owner_screen_name=" + currentSettings.accountHandles + "&page=" + currentSettings.resultSetPage + "&per_page=" + requestCount + standardParameters;
      } else if (currentSettings.showLikedPosts) {
        return currentSettings.socialDataGatewayUrl + "/1.1/favorites/list.json?screen_name=" + currentSettings.accountHandles[0] + "&page=" + currentSettings.resultSetPage + "&count=" + requestCount + standardParameters;
      } else if (currentSettings.searchCriteria === null && currentSettings.accountHandles.length === 1) {
        return currentSettings.socialDataGatewayUrl + '/1.1/statuses/user_timeline.json?screen_name=' + currentSettings.accountHandles[0] + '&count=' + requestCount + (currentSettings.includeReposts ? '&include_rts=1' : '') + '&page=' + currentSettings.resultSetPage + standardParameters;
      } else {
        var searchQuery = (currentSettings.searchCriteria || 'from:' + currentSettings.accountHandles.join(' OR from:'));
        return currentSettings.socialDataGatewayUrl + '/1.1/search/tweets.json?q=' + encodeURIComponent(searchQuery) + standardParameters;
      }
    }

    function retrieveProfileImageUrl(dataObject, useSecureProtocol) {
      if (useSecureProtocol) {
        return ('user' in dataObject) ?
          dataObject.user.profile_image_url_https :
          retrieveProfileImageUrl(dataObject, false).
          replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
      } else {
        return dataObject.profile_image_url || dataObject.user.profile_image_url;
      }
    }

    // Transforms social API response objects into data for template use
    function prepareDisplayData(dataObject) {
      var displayDataItem = {};
      displayDataItem.sourceObject = dataObject;
      displayDataItem.originPlatform = dataObject.source;
      displayDataItem.displayHandle = dataObject.from_user || dataObject.user.screen_name;
      // Note: The actual full name might be missing from some API responses.
      displayDataItem.fullName = dataObject.from_user_name || dataObject.user.name;
      displayDataItem.isRepost = typeof (dataObject.retweeted_status) !== 'undefined';

      displayDataItem.postCreationTime = decodeTimestamp(dataObject.created_at);
      displayDataItem.interimText = currentSettings.separatorText === "auto" ? determineAutoSeparator(dataObject.text) : currentSettings.separatorText;
      displayDataItem.postId = dataObject.id_str;
      displayDataItem.platformBaseUrl = "http://" + currentSettings.socialPlatformDomain + "/";
      displayDataItem.userProfileUrl = displayDataItem.platformBaseUrl + displayDataItem.displayHandle;
      displayDataItem.postPermalink = displayDataItem.userProfileUrl + "/status/" + displayDataItem.postId;
      displayDataItem.replyActionUrl = displayDataItem.platformBaseUrl + "intent/tweet?in_reply_to=" + displayDataItem.postId;
      displayDataItem.repostActionUrl = displayDataItem.platformBaseUrl + "intent/retweet?tweet_id=" + displayDataItem.postId;
      displayDataItem.favoriteActionUrl = displayDataItem.platformBaseUrl + "intent/favorite?tweet_id=" + displayDataItem.postId;
      displayDataItem.originalPosterHandle = displayDataItem.isRepost && dataObject.retweeted_status.user.screen_name;
      displayDataItem.postRelativeTime = formatRelativeTime(calculateTimeDifference(displayDataItem.postCreationTime));
      displayDataItem.postEntities = dataObject.entities ? (dataObject.entities.urls || []).concat(dataObject.entities.media || []) : [];
      displayDataItem.originalPostContent = displayDataItem.isRepost ? ('RT @' + displayDataItem.originalPosterHandle + ' ' + dataObject.retweeted_status.text) : dataObject.text; // Avoid '...' in long reposts
      displayDataItem.formattedPostContent = jqTool([hyperlinkWebAddresses(displayDataItem.originalPostContent, displayDataItem.postEntities)]).hyperlinkUser().hyperlinkHashtag()[0];
      displayDataItem.originalRepostContent = jqTool([hyperlinkWebAddresses(dataObject.text, displayDataItem.postEntities)]).hyperlinkUser().hyperlinkHashtag()[0];
      displayDataItem.enhancedPostContent = jqTool([displayDataItem.formattedPostContent]).insertHeartSymbol()[0];

      displayDataItem.profilePicSize = currentSettings.profileImageDimension;
      displayDataItem.profilePicUrl = retrieveProfileImageUrl(displayDataItem.isRepost ? dataObject.retweeted_status : dataObject, (document.location.protocol === 'https:'));
      displayDataItem.profilePicHandle = displayDataItem.isRepost ? displayDataItem.originalPosterHandle : displayDataItem.displayHandle;
      displayDataItem.profilePicLink = displayDataItem.platformBaseUrl + displayDataItem.profilePicHandle;

      // Pre-formatted blocks for common layouts
      displayDataItem.userBlock = formatContent('<a class="post-user" href="{userProfileUrl}">{displayHandle}</a>', displayDataItem);
      displayDataItem.separatorBlock = currentSettings.separatorText ? formatContent('<span class="post-separator">{interimText}</span>', displayDataItem) : '';
      displayDataItem.profileImageBlock = displayDataItem.profilePicSize ?
        formatContent('<a class="post-avatar" href="{profilePicLink}"><img src="{profilePicUrl}" height="{profilePicSize}" width="{profilePicSize}" alt="{profilePicHandle}\'s profile image" title="{profilePicHandle}\'s profile image" border="0"/></a>', displayDataItem) : '';
      displayDataItem.timeBlock = formatContent('<span class="post-time"><a href="{postPermalink}" title="view post on {socialPlatformDomain}">{postRelativeTime}</a></span>', displayDataItem);
      displayDataItem.contentBlock = formatContent('<span class="post-content">{enhancedPostContent}</span>', displayDataItem);
      displayDataItem.repostedContentBlock = formatContent('<span class="post-content">{originalRepostContent}</span>', displayDataItem);
      displayDataItem.replyLink = formatContent('<a class="post-action post-reply" href="{replyActionUrl}">respond</a>', displayDataItem);
      displayDataItem.repostLink = formatContent('<a class="post-action post-repost" href="{repostActionUrl}">repost</a>', displayDataItem);
      displayDataItem.favoriteLink = formatContent('<a class="post-action post-favorite" href="{favoriteActionUrl}">favorite</a>', displayDataItem);
      return displayDataItem;
    }

    function displayPosts(targetElement, postCollection) {
      var outputList = jqTool('<ul class="content-list">');
      outputList.append(jqTool.map(postCollection, function (displayDataItem) {
        return "<li>" + formatContent(currentSettings.itemLayout, displayDataItem) + "</li>";
      }).join('')).
      children('li:first').addClass('content-first').end().
      children('li:odd').addClass('content-even').end().
      children('li:even').addClass('content-odd');

      jqTool(targetElement).empty().append(outputList);
      if (currentSettings.leadingContent) outputList.before('<p class="content-intro">' + currentSettings.leadingContent + '</p>');
      if (currentSettings.trailingContent) outputList.after('<p class="content-outro">' + currentSettings.trailingContent + '</p>');

      jqTool(targetElement).trigger("contentLoaded").trigger((postCollection.length === 0 ? "contentEmpty" : "contentFull"));
      if (currentSettings.updateFrequencySeconds) {
        window.setTimeout(function () {
          jqTool(targetElement).trigger("microblogDisplay:load");
        }, 1000 * currentSettings.updateFrequencySeconds);
      }
    }

    function fetchData(targetElement) {
      var loadingIndicator = jqTool('<p class="loading-status">' + currentSettings.loadingMessage + '</p>');
      if (currentSettings.loadingMessage) jqTool(targetElement).not(":has(.content-list)").empty().append(loadingIndicator);
      jqTool.getJSON(constructApiEndpoint(), function (apiResponse) {
        var processedPosts = jqTool.map(apiResponse.statuses || apiResponse, prepareDisplayData);
        processedPosts = jqTool.grep(processedPosts, currentSettings.inclusionPredicate).sort(currentSettings.sortingFunction).slice(0, currentSettings.resultLimit);
        jqTool(targetElement).trigger("microblogDisplay:retrieved", [processedPosts]);
      });
    }

    return this.each(function (elementIndex, currentElement) {
      if (currentSettings.accountHandles && typeof (currentSettings.accountHandles) === "string") {
        currentSettings.accountHandles = [currentSettings.accountHandles];
      }

      jqTool(currentElement).unbind("microblogDisplay:render").unbind("microblogDisplay:retrieved").unbind("microblogDisplay:load").
      bind({
        "microblogDisplay:load": function () {
          fetchData(currentElement);
        },
        "microblogDisplay:retrieved": function (eventObject, receivedPosts) {
          jqTool(currentElement).trigger("microblogDisplay:render", [receivedPosts]);
        },
        "microblogDisplay:render": function (eventObject, receivedPosts) {
          displayPosts(jqTool(currentElement), receivedPosts);
        }
      }).trigger("microblogDisplay:load");
    });
  };
}));