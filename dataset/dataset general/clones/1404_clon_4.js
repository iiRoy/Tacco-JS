;
(function () {
  "use strict";

  // Introduce a new global object name for the cloned functionality
  window.secureVault = {};

  // Utility to create a timed pause, mimicking the original's setTimeout chain
  const pauseExecution = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

  // --- Core Data Processing Routines ---

  // Enhanced function for securing content, using Promises for flow control
  secureVault.processOutboundContent = async function (
    inputKey,
    sourceData,
    toBase64Notifier,
    compressionNotifier,
    encryptionNotifier,
    completionCallback
  ) {
    try {
      await pauseExecution(250);
      let transformedData = sjcl.codec.utf8String.toBits(sourceData);
      if (toBase64Notifier) toBase64Notifier();

      await pauseExecution(250);
      transformedData = sjcl.codec.base64.fromBits(transformedData);
      if (compressionNotifier) compressionNotifier();

      await pauseExecution(250);
      // transformedData = lzw.compress(transformedData); // Original comment: Create a bug with JPG
      if (encryptionNotifier) encryptionNotifier();

      await pauseExecution(250);
      transformedData = sjcl.encrypt(inputKey, transformedData);
      if (completionCallback) completionCallback(transformedData);
    } catch (e) {
      // Replicate original error handling for UI elements
      document.querySelectorAll('input, textarea, select, button').forEach(el => el.disabled = false);
      const indicator = secureVault.createProgressIndicator('form.well .progress');
      if (indicator.containerElement) {
        indicator.containerElement.style.display = 'none'; // Mimic jQuery .hide()
      }
      secureVault.displayNotification('error', 'Content could not be secured. Operation aborted.', 'Failure');
    }
  };

  // Enhanced function for retrieving content, using Promises for flow control
  secureVault.processInboundContent = async function (
    inputKey,
    sourceData,
    errorHandler,
    decompressionNotifier,
    fromBase64Notifier,
    toStringNotifier,
    completionCallback
  ) {
    try {
      await pauseExecution(250);
      let transformedData = sjcl.decrypt(inputKey, sourceData);
      if (decompressionNotifier) decompressionNotifier();

      await pauseExecution(250);
      transformedData = lzw.decompress(transformedData); // Assumes lzw library is available globally
      if (fromBase64Notifier) fromBase64Notifier();

      await pauseExecution(250);
      transformedData = sjcl.codec.base64.toBits(transformedData);
      if (toStringNotifier) toStringNotifier();

      await pauseExecution(250);
      transformedData = sjcl.codec.utf8String.fromBits(transformedData);
      if (completionCallback) completionCallback(transformedData);
    } catch (err) {
      errorHandler(err);
    }
  };

  // --- Auxiliary Functions ---

  // Generates a cryptographically secure identifier
  secureVault.generateSecureIdentifier = function (entropyAmount) {
    entropyAmount = Math.ceil(entropyAmount / 6) * 6;
    const bitArray = sjcl.bitArray.clamp(
      sjcl.random.randomWords(Math.ceil(entropyAmount / 32), 0), entropyAmount
    );
    return sjcl.codec.base64.fromBits(bitArray, 0).replace(/\=+$/, '').replace(/\//, '-');
  };

  // Obtains a formatted date string
  secureVault.retrieveCurrentDateStamp = function (targetDate) {
    const d = targetDate || new Date();
    return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
  };

  // Obtains a formatted time string
  secureVault.obtainCurrentTimeStamp = function (targetDate) {
    const d = targetDate || new Date();
    const padDigit = (num) => String(num).padStart(2, '0');
    return `${padDigit(d.getHours())}:${padDigit(d.getMinutes())}:${padDigit(d.getSeconds())}`;
  };

  // Numeric comparison function for ascending order
  secureVault.numericOrderAsc = (first, second) => first - second;

  // Fetches keys from local storage with a specific prefix
  secureVault.fetchStoredEntryKeys = function () {
    const storageIdentifier = 'secureVault_v1_1'; // Divergent prefix
    const collectedKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const currentKey = localStorage.key(i);
      if (currentKey && currentKey.startsWith(storageIdentifier)) {
        collectedKeys.push(currentKey);
      }
    }
    collectedKeys.sort().reverse();
    return collectedKeys;
  };

  // Shortens a URL using a remote service via Fetch API
  secureVault.shortenLink = async function (longWebAddress, successAction) {
    try {
      const response = await fetch('https://www.googleapis.com/urlshortener/v1/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "longUrl": longWebAddress
        })
      });
      const responseData = await response.json();
      successAction(responseData.id);
    } catch (error) {
      console.error('Failed to shorten link:', error);
    }
  };

  // Checks for browser feature availability
  secureVault.featureAvailability = {
    localPersistence: (function () {
      const isSupported = !!(localStorage);
      document.documentElement.classList.add((isSupported ? '' : 'no-') + 'local-persistence');
      return isSupported;
    })(),
    historyNavigation: (function () {
      const isSupported = !!(window.history && history.pushState);
      document.documentElement.classList.add((isSupported ? '' : 'no-') + 'history-navigation');
      return isSupported;
    })(),
    fileHandling: (function () {
      const w = window;
      const isSupported = !!(w.File && w.FileReader && w.FileList && w.Blob);
      document.documentElement.classList.add((isSupported ? '' : 'no-') + 'file-handling');
      return isSupported;
    })()
  };

  // Stores a paste URL in local storage with a timestamped key
  secureVault.persistEntry = function (urlAddress, entryMoment) {
    const recordMoment = entryMoment || new Date();
    const formattedRecordMoment = `${recordMoment.getFullYear()}-${recordMoment.getMonth() + 1}-${recordMoment.getDate()} ${secureVault.obtainCurrentTimeStamp(recordMoment)}`;

    const existingKeys = secureVault.fetchStoredEntryKeys();

    if (localStorage.length > 19) { // Replicate the 19-item limit
      localStorage.removeItem(existingKeys[19]);
    }

    localStorage.setItem('secureVault_v1_1#' + formattedRecordMoment, urlAddress);
  };

  // Retrieves previous paste URLs from local storage
  secureVault.retrieveHistoricalEntries = function () {
    const entryRecords = [];
    const storedKeys = secureVault.fetchStoredEntryKeys();
    const todayFormatted = secureVault.retrieveCurrentDateStamp();

    storedKeys.forEach(entryKey => {
      const fullDateTime = entryKey.replace(/^[^#]+#/, '');
      const dateParts = fullDateTime.match(/^(\d+)-(\d+)-(\d+)\s/);
      const displayDate = `${dateParts[2]}-${dateParts[3]}-${dateParts[1]}`; // mm-dd-yyyy
      let datePrefix = 'the ';
      if (displayDate === todayFormatted) {
        datePrefix = 'at ';
      }
      entryRecords.push({
        displayLabel: displayDate,
        timeQualifier: datePrefix,
        destination: localStorage.getItem(entryKey)
      });
    });
    return entryRecords;
  };

  // Parses a URL string into components using the native URL object
  secureVault.extractUrlComponents = function (inputUrl) {
    return new URL(inputUrl);
  };

  // Extracts the resource identifier from a URL
  secureVault.fetchResourceIdentifier = function (inputUrl) {
    const urlObject = inputUrl ? secureVault.extractUrlComponents(inputUrl) : window.location;
    return urlObject.pathname.replace(/\/|paste/g, '');
  };

  // Extracts the access key from a URL's hash segment
  secureVault.fetchAccessKey = function (inputUrl) {
    const urlObject = inputUrl ? secureVault.extractUrlComponents(inputUrl) : window.location;
    return urlObject.hash.replace('#', '').replace(/(\?|&).*$/, '');
  };

  // Retrieves content from a specific DOM structure, stripping formatting
  secureVault.extractDisplayedContent = function () {
    let collectedContent = '';
    const listItems = document.querySelectorAll("#paste-content li");
    if (listItems.length > 0) {
      listItems.forEach(item => {
        collectedContent += item.textContent.replace(/[\u00a0]+/g, ' ') + '\n';
      });
    } else {
      const mainContent = document.getElementById("paste-content");
      if (mainContent) {
        collectedContent = mainContent.textContent;
      }
    }
    return collectedContent;
  };

  // Estimates text metrics including non-ASCII characters and line breaks
  secureVault.measureTextMetrics = function (textContent, metricOptions) {
    const newlinePattern = /(\r?\n|\r)/g;
    metricOptions = metricOptions || {};
    metricOptions.lineBreaks = metricOptions.lineBreaks || 1;

    const charLength = textContent.length;
    const nonAsciiCharCount = charLength - textContent.replace(/[\u0100-\uFFFF]/g, '').length;
    const lineBreakCount = charLength - textContent.replace(newlinePattern, '').length;

    return charLength + nonAsciiCharCount + Math.max(0, metricOptions.lineBreaks * (lineBreakCount - 1));
  };

  // Displays a styled notification message in the UI
  secureVault.displayNotification = function (
    categoryType,
    descriptionText,
    headingText,
    clearPrevious,
    animationCompleteCallback
  ) {
    window.scrollTo(0, 0);

    if (clearPrevious) {
      document.querySelectorAll('.alert-' + categoryType).forEach(el => el.remove());
    }

    const template = document.getElementById('alert-template');
    if (!template) {
        console.error('Notification template element missing.');
        return;
    }
    const notificationElement = template.cloneNode(true);
    notificationElement.removeAttribute('id');
    notificationElement.classList.add('alert', 'alert-' + categoryType);

    const messageArea = notificationElement.querySelector('.message');
    if (messageArea) {
      messageArea.innerHTML = descriptionText;
    }

    const titleArea = notificationElement.querySelector('.title');
    if (titleArea) {
      if (headingText) {
        titleArea.innerHTML = headingText;
      } else {
        titleArea.remove();
      }
    }

    const mainContainer = document.getElementById('main');
    if (mainContainer) {
      mainContainer.prepend(notificationElement);
      notificationElement.style.display = 'block'; // Mimic jQuery .show()
      if (animationCompleteCallback) {
        setTimeout(animationCompleteCallback, 500); // Simulate animation duration
      }
    }
  };

  // Creates and returns an object to manage a UI progress bar
  secureVault.createProgressIndicator = function (targetSelector) {
    const container = document.querySelector(targetSelector);
    const barSegment = container ? container.querySelector('.bar') : null;

    const indicatorObject = {
      containerElement: container,
      barSegment: barSegment
    };

    indicatorObject.updateStatus = function (statusLabel, progressRate) {
      if (indicatorObject.barSegment) {
        indicatorObject.barSegment.textContent = statusLabel;
        indicatorObject.barSegment.style.width = progressRate;
      }
    };
    return indicatorObject;
  };

  // Ranks the probability of text being source code based on character patterns
  secureVault.assessCodeLikelihood = function (sourceText) {
    const codeIndicators = /[A-Z]{3}[A-Z]+|\.[a-z]|[=:<>{}\[\]$_'"&]| {2}|\t/g;
    const commentStructures = /(:?\/\*|<!--)(:?.|\n)*?(:?\*\/|-->)|(\/\/|#)(.*?)\n/g;
    const separatorPatterns = /[-*=_+]{4,}/g;

    let aggregateScore = 0;
    let totalLengthAnalyzed = 0;

    let mutableText = sourceText;

    const matchedComments = mutableText.match(commentStructures);
    if (matchedComments) {
      aggregateScore += matchedComments.length;
    }
    mutableText = mutableText.replace(commentStructures, '');
    mutableText = mutableText.replace(separatorPatterns, '');

    const textLines = mutableText.split('\n');
    for (const currentLine of textLines) {
      totalLengthAnalyzed += currentLine.length;
      const matchedCodeElements = currentLine.match(codeIndicators);
      if (matchedCodeElements) {
        aggregateScore += matchedCodeElements.length;
      }
    }
    return totalLengthAnalyzed > 0 ? (aggregateScore * 1000 / totalLengthAnalyzed) : 0;
  };

  // Prevents default drag-and-drop behavior
  secureVault.suppressDragEvent = function (eventObject) {
    eventObject.stopPropagation();
    eventObject.preventDefault();
  };

  // Handles file drop events
  secureVault.handleFileDrop = function (eventObject) {
    eventObject.preventDefault();
    secureVault.processUploadedFiles(eventObject.dataTransfer.files);
    document.getElementById("content").classList.remove('hover');
  };

  // Handles drag-over events, adding a visual cue
  secureVault.handleDragEntry = function (eventObject) {
    secureVault.suppressDragEvent(eventObject);
    eventObject.currentTarget.classList.add('hover');
  };

  // Handles drag-leave events, removing a visual cue
  secureVault.handleDragExit = function (eventObject) {
    eventObject.currentTarget.classList.remove('hover');
  };

  // Processes uploaded files, including image resizing
  secureVault.processUploadedFiles = async function (uploadedFiles) {
    const targetFile = uploadedFiles[0];
    const fileReaderInstance = new FileReader();
    const contentTarget = document.getElementById('content');

    if (targetFile.type.startsWith('image')) {
      fileReaderInstance.onload = function (loadEvent) {
        const imageObject = new Image();
        imageObject.src = loadEvent.target.result;

        imageObject.onload = function () {
          const maximumWidth = 1024,
            maximumHeight = 1024;
          let currentImageWidth = imageObject.width,
            currentImageHeight = imageObject.height;

          if (currentImageWidth > currentImageHeight) {
            if (currentImageWidth > maximumWidth) {
              currentImageHeight *= maximumWidth / currentImageWidth;
              currentImageWidth = maximumWidth;
            }
          } else {
            if (currentImageHeight > maximumHeight) {
              currentImageWidth *= maximumHeight / currentImageHeight;
              currentImageHeight = maximumHeight;
            }
          }

          const canvasElement = document.createElement('canvas');
          canvasElement.width = currentImageWidth;
          canvasElement.height = currentImageHeight;
          const context = canvasElement.getContext("2d");
          context.drawImage(this, 0, 0, currentImageWidth, currentImageHeight);

          const dataUrl = canvasElement.toDataURL(targetFile.type);
          contentTarget.value = dataUrl;
          contentTarget.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change event
          contentTarget.style.display = 'none';
          imageObject.style.maxWidth = '742px';
          contentTarget.parentNode.insertBefore(imageObject, contentTarget.nextSibling);
        };
      };
      fileReaderInstance.readAsDataURL(targetFile);
    } else {
      fileReaderInstance.onload = function (loadEvent) {
        contentTarget.value = loadEvent.target.result;
        contentTarget.dispatchEvent(new Event('change', { bubbles: true }));
      };
      fileReaderInstance.readAsText(targetFile);
    }
  };

  // --- Initial Configuration and Event Binding ---

  document.addEventListener('DOMContentLoaded', function () {
    // Start random number generator seeding for sjcl
    if (typeof sjcl !== 'undefined' && sjcl.random) {
      sjcl.random.startCollectors();
    }

    // Note: Global AJAX cache setup ($.ajaxSetup) has no direct fetch() equivalent.
    // Caching for fetch is handled per request or by browser defaults.

    // Event delegation for the primary action button, replacing jQuery .live()
    document.body.addEventListener('click', function (event) {
      if (event.target && event.target.matches('.btn-primary')) {
        event.preventDefault();
        const enteredContent = document.querySelector('textarea').value;
        // The original code stops here, awaiting further encryption/posting logic.
      }
    });
  });

})();