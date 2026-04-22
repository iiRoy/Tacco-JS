(function (global) {

  const webAddressMatcher = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

  function applyPattern(contentPattern, dataObject) {
    if (typeof contentPattern === "string") {
      return Object.keys(dataObject).reduce((accumulator, currentKey) => {
        const value = dataObject[currentKey];
        return accumulator.split('{{' + currentKey + '}}').join(value === null ? '' : value);
      }, contentPattern);
    } else {
      return contentPattern(dataObject);
    }
  }

  function sanitizeMarkup(rawString) {
    return rawString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function hyperlinkAddresses(sourceContent, referencePoints) {
    return sourceContent.replace(webAddressMatcher, (matchedSegment) => {
      let destination = (/^[a-z]+:/i).test(matchedSegment) ? matchedSegment : "http://" + matchedSegment;
      let visibleText = matchedSegment;
      for (let currentPoint of referencePoints) {
        if (currentPoint.url === destination && currentPoint.expanded_url) {
          destination = currentPoint.expanded_url;
          visibleText = currentPoint.display_url;
          break;
        }
      }
      return `<a href="${sanitizeMarkup(destination)}">${sanitizeMarkup(visibleText)}</a>`;
    });
  }

  function tagAccountNames(sourceContent, siteDomain) {
    return sourceContent.replace(/(^|[\W])@(\w+)/gi, `$1<span class="at">@</span><a href="http://${siteDomain}/$2">$2</a>`);
  }

  function tagKeywords(sourceContent, siteDomain, accountNames, hasList) {
    const querySuffix = (accountNames && accountNames.length === 1 && !hasList) ? `&from=${accountNames.join("%2BOR%2B")}` : '';
    return sourceContent.replace(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
      ` <a href="https://${siteDomain}/search?q=%23$1&src=hash&lang=all${querySuffix}" class="microfeed_hashtag">#$1</a>`);
  }

  function beautifyEmoticons(sourceContent) {
    return sourceContent.replace(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>");
  }

  function decodeTimestamp(timestampString) {
    return Date.parse(timestampString.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
  }

  function determinePastDuration(moment) {
    const numericVal = (val) => parseInt(val, 10);
    const now = new Date();
    const deltaSeconds = numericVal((now.getTime() - moment) / 1000);
    if (deltaSeconds < 1) return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    return {
      days: numericVal(deltaSeconds / 86400),
      hours: numericVal(deltaSeconds / 3600),
      minutes: numericVal(deltaSeconds / 60),
      seconds: numericVal(deltaSeconds)
    };
  }

  function verbalizeTimeDifference(durationObject) {
    if (durationObject.days > 2) return 'about ' + durationObject.days + ' days ago';
    if (durationObject.hours > 24) return 'about a day ago';
    if (durationObject.hours > 2) return 'about ' + durationObject.hours + ' hours ago';
    if (durationObject.minutes > 45) return 'about an hour ago';
    if (durationObject.minutes > 2) return 'about ' + durationObject.minutes + ' minutes ago';
    if (durationObject.seconds > 1) return 'about ' + durationObject.seconds + ' seconds ago';
    return 'just now';
  }

  function createDynamicSeparator(messageContent, optionSet) {
    if (messageContent.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
      return optionSet.automaticReplyPhrase;
    } else if (messageContent.match(webAddressMatcher)) {
      return optionSet.automaticUrlPhrase;
    } else if (messageContent.match(/^((\w+ed)|just) .*/im)) {
      return optionSet.automaticPastTensePhrase;
    } else if (messageContent.match(/^(\w*ing) .*/i)) {
      return optionSet.automaticPresentTensePhrase;
    } else {
      return optionSet.automaticDefaultPhrase;
    }
  }

  function assembleServicePath(optionSet) {
    const acquisitionCount = (optionSet.itemFetchLimit === null) ? optionSet.displayItemCount : optionSet.itemFetchLimit;
    const commonRequestParameters = '&include_entities=1';

    if (optionSet.listName) {
      return `${optionSet.remoteServiceProxyUrl}/1.1/lists/statuses.json?slug=${optionSet.listName}&owner_screen_name=${optionSet.accountNames}&page=${optionSet.pageNumber}&per_page=${acquisitionCount}${commonRequestParameters}`;
    } else if (optionSet.showFavorites) {
      return `${optionSet.remoteServiceProxyUrl}/1.1/favorites/list.json?screen_name=${optionSet.accountNames[0]}&page=${optionSet.pageNumber}&count=${acquisitionCount}${commonRequestParameters}`;
    } else if (optionSet.queryText === null && optionSet.accountNames.length === 1) {
      return `${optionSet.remoteServiceProxyUrl}/1.1/statuses/user_timeline.json?screen_name=${optionSet.accountNames[0]}&count=${acquisitionCount}${(optionSet.includeRetransmissions ? '&include_rts=1' : '')}&page=${optionSet.pageNumber}${commonRequestParameters}`;
    } else {
      const searchCriterion = (optionSet.queryText || 'from:' + optionSet.accountNames.join(' OR from:'));
      return `${optionSet.remoteServiceProxyUrl}/1.1/search/tweets.json?q=${encodeURIComponent(searchCriterion)}${commonRequestParameters}`;
    }
  }

  function obtainProfileImageSource(dataRecord, useSecure) {
    if (useSecure) {
      return ('user' in dataRecord) ?
        dataRecord.user.profile_image_url_https :
        obtainProfileImageSource(dataRecord, false).
        replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
    } else {
      return dataRecord.profile_image_url || dataRecord.user.profile_image_url;
    }
  }

  function deriveDisplayElements(dataRecord, optionSet) {
    const processed = {};
    processed.record = dataRecord;
    processed.originator = dataRecord.source;
    processed.profileHandle = dataRecord.from_user || dataRecord.user.screen_name;
    processed.displayName = dataRecord.from_user_name || dataRecord.user.name;
    processed.isRetransmission = typeof(dataRecord.retweeted_status) !== 'undefined';

    processed.messageTime = decodeTimestamp(dataRecord.created_at);
    processed.transitionPhrase = optionSet.itemSeparator === "auto" ? createDynamicSeparator(dataRecord.text, optionSet) : optionSet.itemSeparator;
    processed.messageIdentifier = dataRecord.id_str;
    processed.serviceBase = "http://" + optionSet.microbloggingDomain + "/";
    processed.profileLink = processed.serviceBase + processed.profileHandle;
    processed.messageLink = processed.profileLink + "/status/" + processed.messageIdentifier;
    processed.replyLink = processed.serviceBase + "intent/tweet?in_reply_to=" + processed.messageIdentifier;
    processed.retransmitLink = processed.serviceBase + "intent/retweet?tweet_id=" + processed.messageIdentifier;
    processed.favoriteLink = processed.serviceBase + "intent/favorite?tweet_id=" + processed.messageIdentifier;
    processed.retransmittedByHandle = processed.isRetransmission && dataRecord.retweeted_status.user.screen_name;
    processed.messagePastDuration = verbalizeTimeDifference(determinePastDuration(processed.messageTime));
    processed.linkedReferences = dataRecord.entities ? (dataRecord.entities.urls || []).concat(dataRecord.entities.media || []) : [];
    processed.rawContent = processed.isRetransmission ? ('RT @' + processed.retransmittedByHandle + ' ' + dataRecord.retweeted_status.text) : dataRecord.text;

    let transformedContent = hyperlinkAddresses(processed.rawContent, processed.linkedReferences);
    transformedContent = tagAccountNames(transformedContent, optionSet.microbloggingDomain);
    transformedContent = tagKeywords(transformedContent, optionSet.microbloggingDomain, optionSet.accountNames, optionSet.listName);
    processed.formattedContent = transformedContent;

    let transformedRetweetedContent = hyperlinkAddresses(dataRecord.text, processed.linkedReferences);
    transformedRetweetedContent = tagAccountNames(transformedRetweetedContent, optionSet.microbloggingDomain);
    transformedRetweetedContent = tagKeywords(transformedRetweetedContent, optionSet.microbloggingDomain, optionSet.accountNames, optionSet.listName);
    processed.formattedRetransmittedContent = transformedRetweetedContent;

    processed.fancyContent = beautifyEmoticons(processed.formattedContent);

    processed.iconSize = optionSet.iconDimension;
    const secureProtocol = (document.location.protocol === 'https:');
    processed.iconSource = obtainProfileImageSource(processed.isRetransmission ? dataRecord.retweeted_status : dataRecord, secureProtocol);
    processed.iconHandle = processed.isRetransmission ? processed.retransmittedByHandle : processed.profileHandle;
    processed.iconProfileLink = processed.serviceBase + processed.iconHandle;

    processed.accountBlock = applyPattern('<a class="microfeed_account" href="{{profileLink}}">{{profileHandle}}</a>', processed);
    processed.separatorBlock = optionSet.itemSeparator ? applyPattern('<span class="microfeed_separator">{{transitionPhrase}}</span>', processed) : '';
    processed.iconBlock = processed.iconSize ?
      applyPattern('<a class="microfeed_icon" href="{{iconProfileLink}}"><img src="{{iconSource}}" height="{{iconSize}}" width="{{iconSize}}" alt="{{iconHandle}}\'s icon" title="{{iconHandle}}\'s icon" border="0"/></a>', processed) : '';
    processed.timeBlock = applyPattern('<span class="microfeed_time"><a href="{{messageLink}}" title="view message on microblog">{{messagePastDuration}}</a></span>', processed);
    processed.contentBlock = applyPattern('<span class="microfeed_content">{{fancyContent}}</span>', processed);
    processed.retransmittedContentBlock = applyPattern('<span class="microfeed_content">{{formattedRetransmittedContent}}</span>', processed);
    processed.replyActionLink = applyPattern('<a class="microfeed_action microfeed_reply" href="{{replyLink}}">reply</a>', processed);
    processed.retransmitActionLink = applyPattern('<a class="microfeed_action microfeed_retransmit" href="{{retransmitLink}}">retransmit</a>', processed);
    processed.favoriteActionLink = applyPattern('<a class="microfeed_action microfeed_favorite" href="{{favoriteLink}}">favorite</a>', processed);

    return processed;
  }

  function visualizeMessages(targetElement, messageCollection, optionSet) {
    const displayList = document.createElement('ul');
    displayList.className = 'microfeed_list';

    messageCollection.forEach((itemData, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = applyPattern(optionSet.itemPattern, itemData);
      if (index === 0) listItem.classList.add('microfeed_first');
      if (index % 2 === 1) listItem.classList.add('microfeed_even');
      else listItem.classList.add('microfeed_odd');
      displayList.appendChild(listItem);
    });

    targetElement.innerHTML = '';
    if (optionSet.initialText) {
      const introParagraph = document.createElement('p');
      introParagraph.className = 'microfeed_intro';
      introParagraph.textContent = optionSet.initialText;
      targetElement.appendChild(introParagraph);
    }
    targetElement.appendChild(displayList);
    if (optionSet.finalText) {
      const outroParagraph = document.createElement('p');
      outroParagraph.className = 'microfeed_outro';
      outroParagraph.textContent = optionSet.finalText;
      targetElement.appendChild(outroParagraph);
    }

    targetElement.dispatchEvent(new CustomEvent("feedRendered", { detail: messageCollection }));
    targetElement.dispatchEvent(new CustomEvent(messageCollection.length === 0 ? "feedEmpty" : "feedPopulated"));

    if (optionSet.refreshIntervalSeconds) {
      window.setTimeout(() => {
        targetElement.dispatchEvent(new CustomEvent("feedReload"));
      }, 1000 * optionSet.refreshIntervalSeconds);
    }
  }

  function retrieveContent(displayContainer, optionSet) {
    if (optionSet.loadingMessage) {
      if (!displayContainer.querySelector('.microfeed_list')) {
        displayContainer.innerHTML = '';
        const loadingParagraph = document.createElement('p');
        loadingParagraph.className = 'loading_indicator';
        loadingParagraph.textContent = optionSet.loadingMessage;
        displayContainer.appendChild(loadingParagraph);
      }
    }

    fetch(assembleServicePath(optionSet))
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(rawData => {
        let messageCollection = (rawData.statuses || rawData).map(record => deriveDisplayElements(record, optionSet));
        messageCollection = messageCollection
          .filter(optionSet.itemFilter)
          .sort(optionSet.itemComparator)
          .slice(0, optionSet.displayItemCount);
        displayContainer.dispatchEvent(new CustomEvent("feedDataAcquired", { detail: messageCollection }));
      })
      .catch(error => {
        console.error("Failed to fetch microblog data:", error);
        displayContainer.dispatchEvent(new CustomEvent("feedLoadError", { detail: error }));
      });
  }

  global.microFeed = function initializeMicroFeed(selector, userConfig) {
    const defaultOptions = {
      remoteServiceProxyUrl: null,
      accountNames: null,
      listName: null,
      showFavorites: false,
      queryText: null,
      iconDimension: null,
      displayItemCount: 3,
      itemFetchLimit: null,
      pageNumber: 1,
      includeRetransmissions: true,
      initialText: null,
      finalText: null,
      itemSeparator: null,
      automaticDefaultPhrase: " I conveyed, ",
      automaticPastTensePhrase: " I ",
      automaticPresentTensePhrase: " I am ",
      automaticReplyPhrase: " I responded to ",
      automaticUrlPhrase: " I was viewing ",
      loadingMessage: null,
      refreshIntervalSeconds: null,
      microbloggingDomain: "twitter.com",
      itemPattern: "{{iconBlock}}{{timeBlock}}{{separatorBlock}} {{contentBlock}}",
      itemComparator: (post1, post2) => post2.messageTime - post1.messageTime,
      itemFilter: (post) => true
    };

    const elements = document.querySelectorAll(selector);

    elements.forEach(displayContainer => {
      const currentConfig = Object.assign({}, defaultOptions, userConfig);
      if (currentConfig.accountNames && typeof(currentConfig.accountNames) === "string") {
        currentConfig.accountNames = [currentConfig.accountNames];
      }

      const handleReload = () => retrieveContent(displayContainer, currentConfig);
      const handleDataAcquired = (event) => {
        displayContainer.dispatchEvent(new CustomEvent("feedRenderRequest", { detail: event.detail }));
      };
      const handleRenderRequest = (event) => {
        visualizeMessages(displayContainer, event.detail, currentConfig);
      };

      if (displayContainer.__microFeedReloadHandler__) {
        displayContainer.removeEventListener("feedReload", displayContainer.__microFeedReloadHandler__);
        displayContainer.removeEventListener("feedDataAcquired", displayContainer.__microFeedDataAcquiredHandler__);
        displayContainer.removeEventListener("feedRenderRequest", displayContainer.__microFeedRenderRequestHandler__);
      }

      displayContainer.addEventListener("feedReload", handleReload);
      displayContainer.addEventListener("feedDataAcquired", handleDataAcquired);
      displayContainer.addEventListener("feedRenderRequest", handleRenderRequest);

      displayContainer.__microFeedReloadHandler__ = handleReload;
      displayContainer.__microFeedDataAcquiredHandler__ = handleDataAcquired;
      displayContainer.__microFeedRenderRequestHandler__ = handleRenderRequest;

      displayContainer.dispatchEvent(new CustomEvent("feedReload"));
    });
  };

})(window);