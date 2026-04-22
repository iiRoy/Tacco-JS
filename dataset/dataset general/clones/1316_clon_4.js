(function() {
  if (window.gblPopupHandlerActive) return;

  const popupConfig = {
    standardFeatures: 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
    targetWidth: 550,
    targetHeight: 420
  };

  const targetLinkPattern = /twitter\.com(?::\d{2,4})?\/intent\/(\w+)/;

  function openCenteredPopup(destinationURL, windowName, features, desiredWidth, desiredHeight) {
    const screenX = window.screen.width;
    const screenY = window.screen.height;

    let posX = Math.round((screenX / 2) - (desiredWidth / 2));
    let posY = 0;

    if (screenY > desiredHeight) {
      posY = Math.round((screenY / 2) - (desiredHeight / 2));
    }

    const fullFeatures = `${features},width=${desiredWidth},height=${desiredHeight},left=${posX},top=${posY}`;
    window.open(destinationURL, windowName, fullFeatures);
  }

  function processDocumentClick(evtObj) {
    evtObj = evtObj || window.event;
    const clickedAnchor = evtObj.target.closest('a');

    if (clickedAnchor && clickedAnchor.href) {
      const matched = clickedAnchor.href.match(targetLinkPattern);
      if (matched) {
        openCenteredPopup(
          clickedAnchor.href,
          'socialPopup',
          popupConfig.standardFeatures,
          popupConfig.targetWidth,
          popupConfig.targetHeight
        );
        evtObj.preventDefault();
      }
    }
  }

  document.addEventListener('click', processDocumentClick, false);

  window.gblPopupHandlerActive = true;
})();

(function() {
  const defaultTweetConfiguration = {
    messageAttribute: 'data-tweet-content',
    wrapperClassName: 'social-share-link',
    viaAccount: null,
    relatedAccounts: null,
    pageURL: window.location.pathname
  };

  const tweetComposer = {
    settings: defaultTweetConfiguration
  };

  function enableTweetability(elementSelector, customConfig) {
    const currentConfig = Object.assign({}, tweetComposer.settings, customConfig);

    const elementsToModify = document.querySelectorAll(elementSelector);

    Array.from(elementsToModify).forEach(currentElement => {
      let messageContent = currentElement.getAttribute(currentConfig.messageAttribute);
      if (!messageContent) {
        messageContent = currentElement.textContent.trim();
      }

      if (messageContent.length > 140) {
        console.error("Tweet message exceeds 140 characters for element:", currentElement, "\nMessage:", messageContent);
        return;
      }

      const encodedMessage = encodeURIComponent(messageContent);
      const encodedPageURL = encodeURIComponent(currentConfig.pageURL);

      let tweetLink = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedPageURL}`;

      if (currentConfig.viaAccount) {
        tweetLink += `&via=${currentConfig.viaAccount}`;
      }
      if (currentConfig.relatedAccounts) {
        tweetLink += `&related=${currentConfig.relatedAccounts}`;
      }

      const newWrapperAnchor = document.createElement('a');
      newWrapperAnchor.className = currentConfig.wrapperClassName;
      newWrapperAnchor.href = tweetLink;

      currentElement.parentNode.insertBefore(newWrapperAnchor, currentElement);
      newWrapperAnchor.appendChild(currentElement);
    });
  }

  window.socialTweetManager = {
    initiateTweetLinks: enableTweetability,
    updateSettings: function(newSettings) {
      Object.assign(tweetComposer.settings, newSettings);
    },
    getSettings: function() {
      return Object.assign({}, tweetComposer.settings);
    }
  };
})();