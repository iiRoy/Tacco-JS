/*global sjcl:true, jQuery:true, $:true, lzw:true, zerobin:true, ZeroClipboard:true, vizhash:true, prettyPrint:true, confirm:true */
;
(function () {
  "use strict";

  // Configuration for the secure data handling module
  const appSettings = {
    cryptoDelayMs: 200, // Delay between cryptographic steps
    maxStoredEntries: 25, // Maximum number of entries to keep in local storage
    storageIdentifierPrefix: 'secureVault_v0.2#', // Prefix for local storage keys
    imageResizeLimit: 1200, // Max width/height for uploaded images
    codeDetectionThreshold: 50, // Score threshold to consider text as code
    shortenServiceUrl: 'https://www.googleapis.com/urlshortener/v1/url', // URL shortening service
    defaultDateFormat: 'YYYY-MM-DD',
    defaultTimeFormat: 'HH:mm:ss'
  };

  // Initialize the secure cryptographic library's random number generator
  sjcl.random.startCollectors();

  // Configure global AJAX settings for jQuery to utilize browser caching
  $.ajaxSetup({
    cache: true
  });

  /**
   * Generates a callback function that will invoke the provided function
   * with a predefined set of static arguments.
   * This is useful for event handlers or scenarios where arguments are fixed.
   *
   * @param {Function} targetFunction - The function to be called.
   * @param {...any} staticArguments - Arguments to be passed to the targetFunction.
   * @returns {Function} A new function that, when called, executes targetFunction
   *                     with the staticArguments.
   */
  function createBoundAction(targetFunction) {
    const suppliedArguments = Array.prototype.slice.call(arguments, 1);
    return function () {
      return targetFunction.apply(targetFunction, suppliedArguments);
    };
  }

  // A utility to introduce a controlled delay in asynchronous operations.
  const introduceDelay = (milliseconds = appSettings.cryptoDelayMs) =>
    new Promise(resolve => setTimeout(resolve, milliseconds));

  /**************************************************
   **** Core Secure Content Management Utilities ****
   **************************************************/

  window.securePad = {
    /**
     * Current version tag for the secure content application.
     */
    releaseTag: '0.2.0',

    /**
     * Asynchronously encrypts and encodes content using a series of steps,
     * providing callback hooks for each stage.
     *
     * @param {string} encryptionKey - The secret key for encryption.
     * @param {string} plainContent - The content string to be encrypted.
     * @param {Function} [onConvertUtf8] - Callback before UTF-8 conversion.
     * @param {Function} [onEncodeBase64] - Callback before Base64 encoding.
     * @param {Function} [onCompressData] - Callback before compression (currently skipped).
     * @param {Function} [onEncryptData] - Callback before SJCL encryption.
     * @param {Function} [onCompletion] - Callback upon successful completion, receives encrypted data.
     */
    secureContent: async function (encryptionKey, plainContent, onConvertUtf8, onEncodeBase64, onCompressData, onEncryptData, onCompletion) {
      if (!encryptionKey || !plainContent) {
        securePad.displayNotification('error', 'Encryption key or content missing. Cannot encrypt.', 'Input Error');
        onCompletion && onCompletion(null);
        return;
      }

      let processedData = plainContent;

      try {
        await introduceDelay();
        // Step 1: Convert content to bit array (UTF-8 representation)
        processedData = sjcl.codec.utf8String.toBits(processedData);
        onConvertUtf8 && onConvertUtf8();

        await introduceDelay();
        // Step 2: Encode bit array to Base64
        processedData = sjcl.codec.base64.fromBits(processedData);
        onEncodeBase64 && onEncodeBase64();

        await introduceDelay();
        // Step 3: (Optional) Compression - This step is currently omitted
        // For historical reasons, compression was considered but found to be problematic.
        onCompressData && onCompressData(); // Still call callback even if no action

        await introduceDelay();
        // Step 4: Encrypt the Base64 encoded string using SJCL
        onEncryptData && onEncryptData();
        processedData = sjcl.encrypt(encryptionKey, processedData);

        onCompletion && onCompletion(processedData);

      } catch (err) {
        // Handle encryption errors, e.g., invalid key or content
        $('input, textarea, select, button').prop('disabled', false); // Re-enable UI elements
        securePad.progressIndicator('form.well .progress').container.hide();
        securePad.displayNotification('error', 'Failed to encrypt content. Details: ' + err.message, 'Encryption Failure');
        onCompletion && onCompletion(null);
      }
    },

    /**
     * Asynchronously decrypts and decodes content through a series of steps,
     * with callback hooks for each stage.
     *
     * @param {string} decryptionKey - The secret key for decryption.
     * @param {string} encryptedContent - The encrypted content string.
     * @param {Function} [onErrorCb] - Callback for any errors during the process.
     * @param {Function} [onDecompressCb] - Callback before decompression.
     * @param {Function} [onDecodeBase64Cb] - Callback before Base64 decoding.
     * @param {Function} [onConvertToStringCb] - Callback before UTF-8 to string conversion.
     * @param {Function} [onDecryptionComplete] - Callback upon successful completion, receives decrypted data.
     */
    unsealContent: async function (decryptionKey, encryptedContent, onErrorCb, onDecompressCb, onDecodeBase64Cb, onConvertToStringCb, onDecryptionComplete) {
      if (!decryptionKey || !encryptedContent) {
        const errMsg = 'Decryption key or content missing. Cannot decrypt.';
        securePad.displayNotification('error', errMsg, 'Input Error');
        onErrorCb && onErrorCb(new Error(errMsg));
        return;
      }

      let workingData = encryptedContent;

      try {
        await introduceDelay();
        // Step 1: Decrypt the content using SJCL
        workingData = sjcl.decrypt(decryptionKey, workingData);
        onDecompressCb && onDecompressCb();

        await introduceDelay();
        // Step 2: Decompress (if applicable) - LZW decompression is used here.
        // This step might fail if the content was not compressed or is corrupt.
        workingData = lzw.decompress(workingData);
        onDecodeBase64Cb && onDecodeBase64Cb();

        await introduceDelay();
        // Step 3: Convert Base64 string back to SJCL bit array
        workingData = sjcl.codec.base64.toBits(workingData);
        onConvertToStringCb && onConvertToStringCb();

        await introduceDelay();
        // Step 4: Convert bit array to a readable UTF-8 string
        workingData = sjcl.codec.utf8String.fromBits(workingData);
        onDecryptionComplete && onDecryptionComplete(workingData);

      } catch (err) {
        // Catch any errors during the decryption/decoding chain
        securePad.displayNotification('error', 'Decryption failed. Content might be corrupt or key is incorrect. Details: ' + err.message, 'Decryption Error');
        onErrorCb && onErrorCb(err);
      }
    },

    /**
     * Generates a cryptographically strong, base64-like string suitable for use
     * as an encryption key. The length is determined by the entropy parameter.
     *
     * @param {number} desiredEntropyBits - The desired number of entropy bits for the key.
     * @returns {string} A URL-safe base64 encoded string representing the key.
     */
    generateSecureKey: function (desiredEntropyBits) {
      // Ensure entropy is a multiple of 6 for clean base64 encoding without padding issues
      const adjustedEntropy = Math.ceil(desiredEntropyBits / 6) * 6;
      const wordCount = Math.ceil(adjustedEntropy / 32); // SJCL uses 32-bit words

      // Generate random words using SJCL's RNG
      const randomBits = sjcl.random.randomWords(wordCount, 0);

      // Clamp the bit array to the exact desired entropy length
      const keyBitArray = sjcl.bitArray.clamp(randomBits, adjustedEntropy);

      // Encode the bit array to base64, remove padding, and make it URL-safe
      const base64Key = sjcl.codec.base64.fromBits(keyBitArray, 0);
      return base64Key.replace(/=+$/, '').replace(/\//g, '-').replace(/\+/g, '_');
    },

    /**
     * Formats a Date object into a 'MM-DD-YYYY' string.
     *
     * @param {Date} [inputDate] - The Date object to format. Defaults to current date.
     * @returns {string} Formatted date string.
     */
    formatDateString: function (inputDate) {
      const targetDate = inputDate || new Date();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const year = targetDate.getFullYear();
      return `${month}-${day}-${year}`;
    },

    /**
     * Formats a Date object into a 'HH:MM:SS' time string.
     *
     * @param {Date} [inputDate] - The Date object to format. Defaults to current date.
     * @returns {string} Formatted time string.
     */
    formatTimeString: function (inputDate) {
      const targetDate = inputDate || new Date();
      const hours = String(targetDate.getHours()).padStart(2, '0');
      const minutes = String(targetDate.getMinutes()).padStart(2, '0');
      const seconds = String(targetDate.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    },

    /**
     * Numeric comparison function for ascending sort.
     *
     * @param {number} valA - First value.
     * @param {number} valB - Second value.
     * @returns {number} Comparison result.
     */
    compareNumbersAscending: (valA, valB) => valA - valB,

    /**
     * Retrieves a reverse-sorted list of all local storage keys
     * that match the application's storage prefix.
     *
     * @returns {string[]} An array of matching local storage keys, sorted descending.
     */
    retrieveVaultIdentifiers: function () {
      const storageKeys = Object.keys(localStorage);
      const filteredKeys = storageKeys.filter(key => key.startsWith(appSettings.storageIdentifierPrefix));
      return filteredKeys.sort().reverse(); // Sort alphabetically then reverse for descending order
    },

    /**
     * Uses a third-party service to shorten a given URL.
     *
     * @param {string} originalUrl - The long URL to shorten.
     * @param {Function} successCallback - Callback function to receive the shortened URL.
     */
    shortenLink: function (originalUrl, successCallback) {
      if (!originalUrl || typeof successCallback !== 'function') {
        console.error('shortenLink: Invalid arguments provided.');
        return;
      }

      fetch(appSettings.shortenServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            "longUrl": originalUrl
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.id) {
            successCallback(data.id);
          } else {
            throw new Error('Shortening service did not return a valid ID.');
          }
        })
        .catch(error => {
          console.error('Error shortening URL:', error);
          securePad.displayNotification('warning', 'Failed to shorten URL. Original URL will be used.', 'URL Shortening Issue');
          successCallback(originalUrl); // Fallback to original URL
        });
    },

    /**
     * Checks for various browser capabilities and updates the <html> tag
     * with corresponding classes for CSS styling or feature detection.
     */
    environmentCapabilities: {
      hasLocalStorage: (function () {
        const isSupported = !!(window.localStorage);
        $('html').toggleClass('local-storage-available', isSupported);
        return isSupported;
      })(),

      supportsHistoryAPI: (function () {
        const isSupported = !!(window.history && history.pushState);
        $('html').toggleClass('history-api-supported', isSupported);
        return isSupported;
      })(),

      canHandleFileUploads: (function () {
        const win = window;
        const isSupported = !!(win.File && win.FileReader && win.FileList && win.Blob);
        $('html').toggleClass('file-upload-capable', isSupported);
        return isSupported;
      })()
    },

    /**
     * Stores a URL for a paste in local storage, indexed by a formatted date.
     * Automatically prunes older entries if the storage limit is reached.
     *
     * @param {string} entryUrl - The URL of the paste to store.
     * @param {Date} [entryDate] - The creation date of the paste. Defaults to current date.
     */
    saveVaultEntry: function (entryUrl, entryDate) {
      if (!securePad.environmentCapabilities.hasLocalStorage) {
        console.warn("Local storage not supported, cannot save entry.");
        return;
      }

      const currentDateTime = entryDate || new Date();
      const formattedKeyDate = `${currentDateTime.getFullYear()}-${String(currentDateTime.getMonth() + 1).padStart(2, '0')}-${String(currentDateTime.getDate()).padStart(2, '0')} ${securePad.formatTimeString(currentDateTime)}`;

      const existingKeys = securePad.retrieveVaultIdentifiers();

      // Enforce maximum entries limit by removing the oldest if necessary
      if (existingKeys.length >= appSettings.maxStoredEntries) {
        const oldestKey = existingKeys[existingKeys.length - 1]; // Oldest is last in reverse sorted list
        localStorage.removeItem(oldestKey);
        console.log(`Removed oldest entry: ${oldestKey}`);
      }

      localStorage.setItem(appSettings.storageIdentifierPrefix + formattedKeyDate, entryUrl);
      console.log(`Saved new entry: ${entryUrl} with key ${formattedKeyDate}`);
    },

    /**
     * Retrieves a list of previously stored paste URLs with their formatted dates.
     * Dates are displayed relative to "today" if applicable.
     *
     * @returns {Array<Object>} An array of objects, each containing displayDate, prefix, and link.
     */
    fetchRecentVaultEntries: function () {
      const recentEntries = [];
      const storedKeys = securePad.retrieveVaultIdentifiers();
      const currentDayFormatted = securePad.formatDateString(); // Today's date

      for (const key of storedKeys) {
        const dateTimePart = key.replace(appSettings.storageIdentifierPrefix, '');
        const [datePart, timePart] = dateTimePart.split(' ');
        const [year, month, day] = datePart.split('-');
        const normalizedDate = `${month}-${day}-${year}`; // For comparison

        let displayLabel = normalizedDate;
        let timeQualifier = 'on ';

        if (normalizedDate === currentDayFormatted) {
          displayLabel = timePart;
          timeQualifier = 'at ';
        }

        recentEntries.push({
          displayDate: displayLabel,
          prefix: timeQualifier,
          link: localStorage.getItem(key)
        });
      }
      return recentEntries;
    },

    /**
     * Provides a robust method to parse URLs by leveraging the browser's DOM
     * for accurate component extraction (protocol, host, path, hash, etc.).
     * Uses a closure to optimize DOM element creation.
     *
     * @returns {Function} A function that takes a URL string and returns an anchor element
     *                     with parsed URL properties.
     */
    deconstructUrl: (function () {
      const urlParserDiv = document.createElement('div');
      urlParserDiv.innerHTML = "<a></a>"; // Create a dummy anchor element once

      return function (inputUrl) {
        if (!inputUrl || typeof inputUrl !== 'string') {
          console.error("deconstructUrl: Invalid URL provided.");
          return null;
        }
        const anchorElement = urlParserDiv.firstChild;
        anchorElement.href = inputUrl; // Assign the URL to the anchor's href
        // Re-assign innerHTML to force re-parsing in some older browsers (e.g., IE)
        urlParserDiv.innerHTML = urlParserDiv.innerHTML;
        return urlParserDiv.firstChild; // Return the parsed anchor element
      };
    })(),

    /**
     * Extracts the unique identifier of a paste from its URL.
     *
     * @param {string} [pasteUrl] - The URL of the paste. Defaults to current window location.
     * @returns {string} The paste identifier.
     */
    extractEntryIdentifier: function (pasteUrl) {
      const urlLocation = pasteUrl ? securePad.deconstructUrl(pasteUrl) : window.location;
      if (!urlLocation) return '';
      return urlLocation.pathname.replace(/\/|vault\/entry/g, ''); // Adjusted path pattern
    },

    /**
     * Extracts the encryption key from the hash segment of a paste URL.
     *
     * @param {string} [pasteUrl] - The URL of the paste. Defaults to current window location.
     * @returns {string} The encryption key.
     */
    extractEntrySecret: function (pasteUrl) {
      const urlLocation = pasteUrl ? securePad.deconstructUrl(pasteUrl) : window.location;
      if (!urlLocation) return '';
      // Remove leading '#' and any query parameters within the hash
      return urlLocation.hash.replace(/^#/, '').split('?')[0].split('&')[0];
    },

    /**
     * Retrieves the raw text content from the displayed paste,
     * stripping any formatting or line numbers.
     *
     * @returns {string} The extracted plain text content.
     */
    retrieveDisplayContent: function () {
      let extractedText = '';
      const $pasteLines = $("#paste-display-area ol.line-numbers li"); // Changed selector
      if ($pasteLines.length > 0) {
        $pasteLines.each(function () {
          // Replace non-breaking spaces and trim each line
          extractedText += $(this).text().replace(/[\u00a0]+/g, ' ').trim() + '\n';
        });
      } else {
        // Fallback if line numbers are not present, e.g., for raw text display
        extractedText = $("#paste-display-area").text();
      }
      return extractedText.trim(); // Trim final result
    },

    /**
     * Provides an approximate estimate of the byte length of a given text string,
     * accounting for multi-byte characters and line breaks.
     *
     * @param {string} inputText - The text string to analyze.
     * @param {Object} [options] - Configuration options.
     * @param {number} [options.lineBreaksWeight=1] - The byte weight assigned to each line break.
     * @returns {number} The estimated byte length.
     */
    estimateByteLength: function (inputText, options) {
      const opts = {
        lineBreaksWeight: 1, // Default weight for line breaks
        ...options
      };

      const newlinePattern = /(\r?\n|\r)/g; // Matches CR, LF, or CRLF
      const unicodeCharPattern = /[\u0100-\uFFFF]/g; // Matches characters outside basic Latin

      let charCount = inputText.length;
      let multiByteCharCount = (inputText.match(unicodeCharPattern) || []).length;
      let lineBreakCount = (inputText.match(newlinePattern) || []).length;

      // Each multi-byte character adds an extra byte (assuming UTF-8, 1-byte for ASCII, 2+ for others)
      // The `length` already counts 1 byte, so add `multiByteCharCount` for the extra bytes.
      // Account for line breaks: each line break (except the last one) adds `lineBreaksWeight` bytes.
      const effectiveLineBreaks = Math.max(0, lineBreakCount - 1);

      return charCount + multiByteCharCount + (opts.lineBreaksWeight * effectiveLineBreaks);
    },

    /**
     * Displays a notification message to the user, styled according to its type.
     *
     * @param {string} notificationType - Type of message (e.g., 'success', 'error', 'warning', 'info').
     * @param {string} messageContent - The main message text.
     * @param {string} [messageTitle] - Optional title for the message.
     * @param {boolean} [clearPreviousOfType=false] - If true, removes all previous messages of the same type.
     * @param {Function} [afterDisplayCallback] - Callback function to execute after the message is displayed.
     */
    displayNotification: function (notificationType, messageContent, messageTitle, clearPreviousOfType, afterDisplayCallback) {
      $(window).scrollTop(0); // Scroll to top to ensure message is visible

      const validTypes = ['success', 'error', 'warning', 'info'];
      const actualType = validTypes.includes(notificationType) ? notificationType : 'info';

      if (clearPreviousOfType) {
        $(`.alert-${actualType}`).remove();
      }

      const $notificationElement = $('#alert-template').clone().removeAttr('id')
        .addClass(`alert alert-${actualType}`).hide(); // Start hidden

      $notificationElement.find('.message-body').html(messageContent); // Changed selector

      if (messageTitle) {
        $notificationElement.find('.message-title').html(messageTitle); // Changed selector
      } else {
        $notificationElement.find('.message-title').remove();
      }

      $('#main-content-area').prepend($notificationElement); // Changed target container
      $notificationElement.fadeIn('fast', afterDisplayCallback); // Use fadeIn for smoother appearance
    },

    /**
     * Creates and returns an object to manage a progress bar element.
     *
     * @param {string} targetSelector - jQuery selector for the progress bar container.
     * @returns {Object} An object with properties for container, bar element, and an update method.
     */
    progressIndicator: function (targetSelector) {
      const $progressContainer = $(targetSelector);
      const progressObject = {
        container: $progressContainer,
        barElement: $progressContainer.find('.progress-bar-fill') // Changed inner selector
      };

      /**
       * Updates the text and width of the progress bar.
       * @param {string} statusText - Text to display inside the bar.
       * @param {string} percentageWidth - CSS width value (e.g., '50%').
       */
      progressObject.update = function (statusText, percentageWidth) {
        this.barElement.text(statusText).css('width', percentageWidth);
      };
      return progressObject;
    },

    /**
     * Analyzes a given text to estimate the probability that it is source code.
     * The score is higher for syntax elements common in programming languages.
     *
     * @param {string} sourceText - The text content to analyze.
     * @returns {number} A numerical score indicating code likelihood. Higher is more likely.
     */
    assessCodeLikelihood: function (sourceText) {
      if (!sourceText || sourceText.length < 50) return 0; // Too short to assess meaningfully

      const codeSyntaxChars = /[A-Z_]{3,}[A-Z_0-9]*|\b(?:function|const|let|var|class|return|if|else|for|while|switch|case|break|continue|try|catch|finally|import|export|await|async|new|this|super|extends|implements|static|public|private|protected|interface|enum|yield)\b|\.[a-zA-Z_][a-zA-Z_0-9]*|[=+\-*/%&|^~<>!?:,;(){}[\]'"`]|\s{2,}|\t/g;
      const commentPatterns = /(\/\*(?:.|\n)*?\*\/)|(\/\/.*)/g; // Block and single-line comments
      const formattingSeparators = /[-*_]{4,}/g; // Common separators in text documents

      let totalScore = 0;
      let effectiveSize = sourceText.length;

      // Step 1: Count comments and remove them from the text for further analysis
      const commentMatches = sourceText.match(commentPatterns);
      if (commentMatches) {
        totalScore += commentMatches.length * 5; // Comments indicate code
        sourceText = sourceText.replace(commentPatterns, '');
        effectiveSize = sourceText.length; // Adjust size after removing comments
      }

      // Step 2: Analyze line by line for syntax elements
      const lines = sourceText.split('\n');
      for (const currentLine of lines) {
        const cleanedLine = currentLine.replace(formattingSeparators, '').trim();
        if (cleanedLine.length === 0) continue;

        const syntaxMatches = cleanedLine.match(codeSyntaxChars);
        if (syntaxMatches) {
          totalScore += syntaxMatches.length;
        }
      }

      // Final score calculation, normalized by effective size to prevent bias towards long texts
      if (effectiveSize === 0) return 0;
      return (totalScore * 1000) / effectiveSize; // Scale the score
    },

    // Event handler to prevent default drag behavior
    preventNativeDrag: function (event) {
      event.originalEvent.stopPropagation();
      event.originalEvent.preventDefault();
    },

    // Event handler for dropped files
    processDroppedFiles: function (event) {
      event.originalEvent.preventDefault();
      securePad.processFileUpload(event.originalEvent.dataTransfer.files);
      $("#content-input-area").removeClass('drag-active'); // Changed selector
    },

    // Event handler for drag over area
    handleDragEnter: function (event) {
      securePad.preventNativeDrag(event);
      $(this).addClass('drag-active');
    },

    // Event handler for drag leave area
    handleDragExit: function (event) {
      $(this).removeClass('drag-active');
    },

    /**
     * Handles the upload of files (text or images), reads their content,
     * and updates the UI accordingly. Images are resized.
     *
     * @param {FileList} uploadedFiles - A FileList object containing the files to process.
     */
    processFileUpload: function (uploadedFiles) {
      if (!uploadedFiles || uploadedFiles.length === 0) {
        securePad.displayNotification('warning', 'No files selected for upload.', 'Upload Empty');
        return;
      }

      const firstFile = uploadedFiles[0];
      const fileReader = new FileReader();
      const $contentTarget = $('#content-input-area'); // Main content textarea
      const $imageDisplay = $('#uploaded-image-preview'); // New element for image preview

      if (firstFile.type.startsWith('image/')) {
        fileReader.onload = function (event) {
          const img = new Image();
          img.src = event.target.result;

          img.onload = function () {
            let currentWidth = img.width;
            let currentHeight = img.height;
            const maxDimension = appSettings.imageResizeLimit;

            // Resize image if it exceeds maxDimension while maintaining aspect ratio
            if (currentWidth > maxDimension || currentHeight > maxDimension) {
              if (currentWidth > currentHeight) {
                currentHeight *= maxDimension / currentWidth;
                currentWidth = maxDimension;
              } else {
                currentWidth *= maxDimension / currentHeight;
                currentHeight = maxDimension;
              }
            }

            const canvasElement = document.createElement('canvas');
            canvasElement.width = currentWidth;
            canvasElement.height = currentHeight;
            const ctx = canvasElement.getContext("2d");
            ctx.drawImage(this, 0, 0, currentWidth, currentHeight);

            // Get base64 data URL of the resized image
            const imageDataUrl = canvasElement.toDataURL(firstFile.type);
            $contentTarget.val(imageDataUrl).trigger('change'); // Set value and trigger change event
            $contentTarget.hide(); // Hide textarea

            // Display the resized image
            $imageDisplay.empty().append($(img).css('max-width', '100%').css('height', 'auto')).show(); // Show image preview area
          };
        };
        fileReader.readAsDataURL(firstFile);
      } else {
        // Handle text files
        fileReader.onload = function (event) {
          $contentTarget.val(event.target.result).trigger('change');
          $contentTarget.show(); // Ensure textarea is visible
          $imageDisplay.hide().empty(); // Clear and hide image preview
        };
        fileReader.readAsText(firstFile);
      }
    }
  };


  /******************************
   **** Document Ready Logic ****
   ******************************/

  $(function () {
    const $primaryActionButton = $('.action-button-primary'); // Renamed selector
    const $pasteContentInput = $('textarea#content-input-area'); // Specific selector for content input
    const $pasteForm = $('form.paste-submission-form'); // Renamed form selector

    /**
     * Event handler for the primary action button on the create paste page.
     * Prevents default form submission, encrypts/compresses content,
     * then submits via AJAX and redirects.
     */
    $primaryActionButton.on("click", function (evt) { // Changed .live to .on for modern jQuery
      evt.preventDefault();

      const rawPasteText = $pasteContentInput.val();

      if (!rawPasteText.trim()) {
        securePad.displayNotification('warning', 'Please enter some content before submitting.', 'Empty Content');
        return; // Early exit if no content
      }

      // Disable UI to prevent re-submission
      $pasteForm.find('input, textarea, select, button').prop('disabled', true);
      const $progressBarContainer = securePad.progressIndicator('form.well .progress'); // Re-using progress bar
      $progressBarContainer.container.show();

      const encryptionKey = securePad.generateSecureKey(256); // Generate a 256-bit key

      // Call the secureContent function with callbacks
      securePad.secureContent(
        encryptionKey,
        rawPasteText,
        () => $progressBarContainer.update('Converting to UTF-8...', '20%'),
        () => $progressBarContainer.update('Encoding Base64...', '40%'),
        () => $progressBarContainer.update('Compressing (skipped)...', '60%'), // Explicitly mention skipped
        () => $progressBarContainer.update('Encrypting data...', '80%'),
        (encryptedPayload) => {
          if (!encryptedPayload) {
            // Error already handled by secureContent, just hide progress and re-enable form
            $progressBarContainer.container.hide();
            $pasteForm.find('input, textarea, select, button').prop('disabled', false);
            return;
          }

          $progressBarContainer.update('Sending data...', '90%');

          // AJAX submission of the encrypted data
          $.ajax({
            url: $pasteForm.attr('action'),
            type: 'POST',
            data: {
              content: encryptedPayload,
              // Potentially add other form fields here if needed
            },
            dataType: 'json'
          }).done(function (response) {
            if (response && response.url) {
              const fullUrl = response.url + '#' + encryptionKey;
              securePad.saveVaultEntry(fullUrl); // Store in local storage
              window.location.href = fullUrl; // Redirect to the new paste
            } else {
              securePad.displayNotification('error', 'Server did not return a valid URL after submission.', 'Submission Error');
              $progressBarContainer.container.hide();
              $pasteForm.find('input, textarea, select, button').prop('disabled', false);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            securePad.displayNotification('error', `Failed to submit paste: ${textStatus} - ${errorThrown}`, 'Network Error');
            $progressBarContainer.container.hide();
            $pasteForm.find('input, textarea, select, button').prop('disabled', false);
          });
        }
      );
    });

    // ... (other document ready logic would go here, e.g., for decryption, UI updates, etc.)
  });
})();