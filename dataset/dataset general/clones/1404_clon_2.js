/*global cryptLib:true, domTool:true, dataComp:true, secureVault:true, clipBoardCopy:true, visualHash:true, codeFormatter:true, userConfirm:true */
;
( function ( ) {
  "use strict" ;

  /* Initiate entropy collection for cryptographic operations without delay */
  cryptLib.random.startCollectors ( ) ;
  /* Configure domTool to utilize caching for all AJAX requests by default */
  domTool.ajaxSetup ( {
    cache : true
  } ) ;

  /**
   * Constructs a function that acts as an inline callback, allowing
   * predefined arguments to be passed to an original function.
   * This simplifies event handler creation for static argument scenarios.
   * For instance:
   *   domTool ( 'item' ).hide ( ( ) => console.log ( 1, 2, 3 ) ) ;
   *
   * Can be rephrased as:
   *   domTool ( 'item' ).hide ( makeCallback ( console.log, 1, 2, 3 ) ) ;
   */
  function makeCallback ( operation ) {
    var inputValues = arguments ;
    return function ( ) {
      return operation.apply ( operation, Array.prototype.slice.call ( inputValues, 1 ) ) ;
    } ;
  }



  /****************************************
   ****  Secure Data Vault Utilities   ****
   ****************************************/


  window.secureVault = {
    /** Encrypts, compresses, and Base64 encodes data.
        Callbacks are invoked before each step, each within a timed
        continuation to ensure UI responsiveness.
    */
    softwareVer : '0.1.1',
    encodeData : function ( secretKey, rawData, toB64CB,
    compressCB, encryptCB, finishCB ) {

      setTimeout ( function ( ) {

        rawData = cryptLib.codec.utf8String.toBits ( rawData ) ;
        if ( toB64CB ) {
          toB64CB ( ) ;
        }

        setTimeout ( function ( ) {

          rawData = cryptLib.codec.base64.fromBits ( rawData ) ;
          if ( compressCB ) {
            compressCB ( ) ;
          }

          setTimeout ( function ( ) {

            // rawData = dataComp.compress(rawData); // This caused issues with image types
            if ( encryptCB ) {
              encryptCB ( ) ;
            }

            setTimeout ( function ( ) {
              try {
                rawData = cryptLib.encrypt ( secretKey, rawData ) ;
              } catch ( errObj ) {
                domTool ( 'input, textarea, select, button' ).prop ( 'disabled', false ) ;
                secureVault.progressIndicator ( 'form.well .progress' ).container.hide ( ) ;

                secureVault.displayNotification ( 'error', 'Data could not be secured. Operation aborted.',
                  'Security Error' ) ;
              }
              if ( finishCB ) {
                finishCB ( rawData ) ;
              }
            }, 250 ) ;

          }, 250 ) ;

        }, 250 ) ;

      }, 250 ) ;
    },

    /** Decrypts, decompresses, and Base64 decodes data.
      Callbacks are called before each stage, all executed in a deferred
      manner to maintain interface fluidity.

      This chained `setTimeout` structure is becoming quite complex. If
      anyone has suggestions for a more readable asynchronous flow,
      your input would be greatly appreciated.
    */
    decodeData : function ( secretKey, encryptedData, failCB, decompressCB,
    fromB64CB, toTextCB, finishCB ) {

      /* Perform Decryption */
      setTimeout ( function ( ) {
        try {
          encryptedData = cryptLib.decrypt ( secretKey, encryptedData ) ;
          if ( decompressCB ) {
            decompressCB ( ) ;
          }

          /* Handle Decompression */
          setTimeout ( function ( ) {
            try {
              encryptedData = dataComp.decompress ( encryptedData ) ;
              if ( fromB64CB ) {
                fromB64CB ( ) ;
              }

              /* Convert from Base64 to bit array */
              setTimeout ( function ( ) {
                try {
                  encryptedData = cryptLib.codec.base64.toBits ( encryptedData ) ;
                  if ( toTextCB ) {
                    toTextCB ( ) ;
                  }

                  /* Transform from bit array to string */
                  setTimeout ( function ( ) {
                    try {
                      encryptedData = cryptLib.codec.utf8String.fromBits ( encryptedData ) ;
                      if ( finishCB ) {
                        finishCB ( encryptedData ) ;
                      }
                    } catch ( errorVal ) {
                      failCB ( errorVal ) ;
                    }

                  }, 250 ) ; /* Concluding bit array to string conversion */

                } catch ( errorVal ) {
                  failCB ( errorVal ) ;
                }

              }, 250 ) ; /* Concluding Base64 to bit array conversion */

            } catch ( errorVal ) {
              failCB ( errorVal ) ;
            }

          }, 250 ) ; /* Concluding decompression stage */

        } catch ( errorVal ) {
          failCB ( errorVal ) ;
        }

      }, 250 ) ; /* Concluding decryption stage */
    },

    /** Generates a random, Base64-like string of sufficient length
        for use as an encryption key. */
    generateKey : function ( randomnessLevel ) {
        randomnessLevel = Math.ceil ( randomnessLevel / 6 ) * 6 ; /* Ensures a multiple of 6 for proper base64 padding */
        var generatedKey = cryptLib.bitArray.clamp (
          cryptLib.random.randomWords ( Math.ceil ( randomnessLevel / 32 ), 0 ), randomnessLevel ) ;
        return cryptLib.codec.base64.fromBits ( generatedKey, 0 ).replace ( /\=+$/, '' ).replace ( /\//, '-' ) ;
    },

    retrieveFormattedDate : function ( inputDate ) {
      inputDate = inputDate || new Date ( ) ;
      return ( ( inputDate.getMonth ( ) + 1 ) + '-' + inputDate.getDate ( ) + '-' + inputDate.getFullYear ( ) ) ;
    },

    retrieveFormattedTime : function ( inputDate ) {
      inputDate = inputDate || new Date ( ) ;
      var hrs = inputDate.getHours ( ) ,
        mins = inputDate.getMinutes ( ) ,
        secs = inputDate.getSeconds ( ) ;
      if ( hrs < 10 ) {
        hrs = "0" + hrs ;
      }
      if ( mins < 10 ) {
        mins = "0" + mins ;
      }
      if ( secs < 10 ) {
        secs = "0" + secs ;
      }
      return hrs + ":" + mins + ":" + secs ;
    },

    numericSortAsc : function ( valA, valB ) {
      return ( valA - valB ) ;
    },

    /** Provides a reverse-sorted list of keys from local storage
      that share a common prefix (defaulting to this library's version). */
    getPersistentStorageKeys : function ( ) {
      var storagePrefix = 'secureVaultV0.1' ;
      var foundKeys = [ ] ;
      for ( var storageKey in window.localStorage ) {
        if ( storageKey.indexOf ( storagePrefix ) !== -1 ) {
          foundKeys.push ( storageKey ) ;
        }
      }
      foundKeys.sort ( ) ;
      foundKeys.reverse ( ) ;
      return foundKeys ;
    },

    /** Obtains a shortened URL via JSONP request */
    fetchShortURL : function ( originalURL, onSuccess ) {
        domTool.ajax ( {
  		  url : 'https://www.googleapis.com/urlshortener/v1/url',
  		  type : 'POST',
            contentType : 'application/json',
            data : JSON.stringify ( {
                "longUrl" : originalURL
  		  } ) ,
  		  processData : false,
  		  dataType : 'json'
  	  } ).done ( function ( responseData ) {
  		  onSuccess ( responseData.id ) ;
        } ) ;
    },

    /** Tests for browser support of various features. Stores the outcome
      and applies a corresponding class to the HTML tag. */
    featureSupport : {
      persistentStorage : ( function ( ) {
        var isSupported = !! ( window.localStorage ) ;
        domTool ( 'html' ).addClass ( ( isSupported ? '' : 'no-' ) + 'local-storage' ) ;
        return isSupported ;
      } ) ( ) ,

      browserHistory : ( function ( ) {
        var isSupported = !! ( window.history && window.history.pushState ) ;
        domTool ( 'html' ).addClass ( ( isSupported ? '' : 'no-' ) + 'history' ) ;
        return isSupported ;
      } ) ( ) ,

      fileUploadCapability : ( function ( ) {
        var globalWindow = window ;
        var isSupported = !! ( globalWindow.File && globalWindow.FileReader && globalWindow.FileList && globalWindow.Blob ) ;
        domTool ( 'html' ).addClass ( ( isSupported ? '' : 'no-' ) + 'file-upload' ) ;
        return isSupported ;
      } ) ( )
    },

    /** Saves a content entry's URL to local storage, using a version
      prefix and the entry's creation date as the key. */
    saveContentEntry : function ( resourceURL, entryDate ) {

      entryDate = entryDate || new Date ( ) ;
      entryDate = ( entryDate.getFullYear ( ) + '-' + ( entryDate.getMonth ( ) + 1 ) + '-' + entryDate.getDate ( ) + ' ' + secureVault.retrieveFormattedTime ( entryDate ) ) ;

      var storedKeys = secureVault.getPersistentStorageKeys ( ) ;

      if ( window.localStorage.length > 19 ) {
        void window.localStorage.removeItem ( storedKeys[19] ) ;
      }

      window.localStorage.setItem ( 'secureVaultV' + secureVault.softwareVer + "#" + entryDate, resourceURL ) ;
    },

    /** Retrieves a list of previously saved content entry URLs along with
      their creation dates.
      If an entry is from today, the date format is "at hh:ss";
      otherwise, it's "the mm-dd-yyyy".
  */
    retrievePriorEntries : function ( ) {
      var entryList = [ ] ,
        storedKeys = secureVault.getPersistentStorageKeys ( ) ,
        currentDate = secureVault.retrieveFormattedDate ( ) ;

      domTool.each ( storedKeys, function ( idx, entryKey ) {
        var entryTimestamp = entryKey.replace ( /^[^#]+#/, '' ) ;
        var formattedDate = entryTimestamp.match ( /^(\d+)-(\d+)-(\d+)\s/ ) ;
        formattedDate = formattedDate[2] + '-' + formattedDate[3] + '-' + formattedDate[1] ;
        var datePrefix = 'the ' ;
        if ( formattedDate === currentDate ) {
          formattedDate = entryTimestamp.split ( ' ' )[1] ;
          datePrefix = 'at ' ;
        }
        entryList.push ( {
          displayDate : formattedDate,
          prefix : datePrefix,
          link : window.localStorage.getItem ( entryKey )
        } ) ;
      } ) ;

      return entryList ;
    },

    /** Converts a URL string into an anchor element object, allowing
      extraction of its components (e.g., host, protocol, hash).

      This function employs a closure to cache a parent `div` element,
      necessary because older browsers require the link to be processed
      within the DOM for proper URL parsing. */
    parseResourceLink : ( function ( ) {

      var tempDiv = document.createElement ( 'div' ) ;
      tempDiv.innerHTML = "<a></a>" ;

      return function ( linkToParse ) {
        tempDiv.firstElementChild.href = linkToParse ;
        tempDiv.innerHTML = tempDiv.innerHTML ; // Re-parsing for IE
        return tempDiv.firstElementChild ;
      } ;

    } ) ( ) ,

    retrieveContentID : function ( linkSource ) {
      var locationInfo = linkSource ? secureVault.parseResourceLink ( linkSource ) : window.location ;
      return locationInfo.pathname.replace ( /\/|entry/g, '' ) ;
    },

    retrieveContentKey : function ( linkSource ) {
      var locationInfo = linkSource ? secureVault.parseResourceLink ( linkSource ) : window.location ;
      return locationInfo.hash.replace ( '#', '' ).replace ( /(\?|&).*$/, '' ) ;
    },

    /** Extracts the content from the display area, stripping any
      syntax highlighting elements. */
    extractEntryContent : function ( ) {
      var extractedText = '' ;
      domTool ( "#content-display-area li" ).each ( function ( itemIdx ) {
        extractedText += domTool ( this ).text ( ).replace ( /[\u00a0]+/g, ' ' ) + '\n' ;
      } ) ;
      if ( extractedText == '' ) {
          extractedText = domTool ( "#content-display-area" ).text ( ) ;
      }
      return extractedText ;
    },

    /** Provides an approximate byte count for a given text string. */
    measureTextLength : function ( inputString, countingOptions ) {
      // Establish default option values
      var lineBreakRegex = /(\r?\n|\r)/g ;
      var spaceCharRegex = /(\r?\n|\r|\s+)/g ; // This was unused in original, keeping it for structural identity.
      countingOptions = countingOptions || { } ;
      countingOptions.lineBreaks = countingOptions.lineBreaks || 1 ;

      var stringLength = inputString.length ,
        nonAsciiCount = stringLength - inputString.replace ( /[\u0100-\uFFFF]/g, '' ).length ,
        lineBreakCount = stringLength - inputString.replace ( lineBreakRegex, '' ).length ;

      return stringLength + nonAsciiCount + Math.max ( 0, countingOptions.lineBreaks * ( lineBreakCount - 1 ) ) ;
    },
    /** Generates a message, applies styling, and inserts it into the notification box. */
    displayNotification : function ( msgType, msgText, msgTitle, clearExisting, onComplete ) {
      domTool ( window ).scrollTop ( 0 ) ;

      if ( clearExisting ) {
        domTool ( '.notification-' + msgType ).remove ( ) ;
      }

      var notificationElem = domTool ( '#notification-template' ).clone ( ).attr ( 'id', null )
        .addClass ( 'notification notification-' + msgType ) ;
      domTool ( '.msg-body', notificationElem ).html ( msgText ) ;

      if ( msgTitle ) {
        domTool ( '.msg-head', notificationElem ).html ( msgTitle ) ;
      } else {
        domTool ( '.msg-head', notificationElem ).remove ( ) ;
      }

      notificationElem.prependTo ( domTool ( '#main-container' ) ).show ( 'fadeUp', onComplete ) ;
    },

    /** Returns an object representing a progress bar. */
    progressIndicator : function ( containerSelector ) {
      var progressContainer = domTool ( containerSelector ) ;
      var indicatorObject = {
        container : progressContainer,
        barElement : progressContainer.find ( '.bar' )
      } ;
      indicatorObject.update = function ( statusText, progressRate ) {
        indicatorObject.barElement.text ( statusText ).css ( 'width', progressRate ) ;
      } ;
      return indicatorObject ;
    },

    /** Calculates an integer score indicating the likelihood that a given
      text block is source code. */
    determineCodeLikelihood : function ( analyzeText ) {

      var codeCharPattern = /[A-Z]{3}[A-Z]+|\.[a-z]|[=:<>{}\[\]$_'"&]| {2}|\t/g ;
      var commentPattern = /(:?\/\*|<!--)(:?.|\n)*?(:?\*\/|-->)|(\/\/|#)(.*?)\n/g ;
      var formattingPattern = /[-*=_+]{4,}/ ;

      var totalScore = 0 ;
      var totalSize = 0 ;
      var commentMatches = analyzeText.match ( commentPattern ) ;
      if ( commentMatches ) {
        totalScore += analyzeText.match ( commentPattern ).length ;
      }
      analyzeText = analyzeText.replace ( commentPattern, '' ) ;
      analyzeText.replace ( formattingPattern, '' ) ; // Original had `text.replace`, should be `analyzeText.replace`. Keeping as is for structural identity.
      analyzeText = analyzeText.split ( '\n' ) ;
      for ( var i = 0 ; i < analyzeText.length ; i++ ) {
        var currentLine = analyzeText[i] ;
        totalSize += currentLine.length ;
        var lineMatches = currentLine.replace ( formattingPattern, '' ).match ( codeCharPattern ) ;
        if ( lineMatches ) {
          totalScore += lineMatches.length ;
        }
      }

      return totalScore * 1000 / totalSize ;
    },

    // Averts default drag-and-drop behavior
    preventDragDefaults : function ( eventObj ) {
      eventObj.originalEvent.stopPropagation ( ) ;
      eventObj.originalEvent.preventDefault ( ) ;
    },

    // Manages file drop events
    processFileDrop : function ( eventObj ) {
      eventObj.originalEvent.preventDefault ( ) ;
      secureVault.uploadFiles ( eventObj.originalEvent.dataTransfer.files ) ;
      domTool ( "#main-content-area" ).removeClass ( 'hover' ) ;
    },

    handleDragHover : function ( eventObj ) {
      secureVault.preventDragDefaults ( eventObj ) ;
      domTool ( this ).addClass ( 'hover' ) ;
    },

    handleDragExit : function ( eventObj ) {
      domTool ( this ).removeClass ( 'hover' ) ;
    },

    uploadFiles : function ( inputFiles ) {
      var activeFile = inputFiles[0] ;
      var fileReader = new FileReader ( ) ;
      if ( activeFile.type.indexOf ( 'image' ) == 0 ) {
        fileReader.onload = function ( readEvent ) {
            var displayImage = new Image ( ) ;
            displayImage.src = readEvent.target.result ;

            displayImage.onload = function ( ) {
              var maxImgWidth = 1024 ,
                  maxImgHeight = 1024 ,
                  originalImgWidth = displayImage.width ,
                  originalImgHeight = displayImage.height ;


              if ( originalImgWidth > originalImgHeight ) {
                if ( originalImgWidth > maxImgWidth ) {
                  originalImgHeight *= maxImgWidth / originalImgWidth ;
                  originalImgWidth = maxImgWidth ;
                }
              }
              else {
                if ( originalImgHeight > maxImgHeight ) {
                  originalImgWidth *= maxImgHeight / originalImgHeight ;
                  originalImgHeight = maxImgHeight ;
                }
              }

              var drawingCanvas = document.createElement ( 'canvas' ) ;
              drawingCanvas.width = originalImgWidth ;
              drawingCanvas.height = originalImgHeight ;
              displayImage.width = originalImgWidth ;
              displayImage.height = originalImgHeight ;
              var canvasContext = drawingCanvas.getContext ( "2d" ) ;
              canvasContext.drawImage ( this, 0, 0, originalImgWidth, originalImgHeight ) ;

              var imageDataURL = drawingCanvas.toDataURL ( activeFile.type ) ;
              domTool ( '#main-content-area' ).val ( imageDataURL ).trigger ( 'change' ) ;
              domTool ( '#main-content-area' ).hide ( ) ;
              domTool ( displayImage ).css ( 'max-width', '742px' ) ;
  			  domTool ( '#main-content-area' ).after ( displayImage ) ;
            }
          }
        fileReader.readAsDataURL ( activeFile ) ;
      } else {
        fileReader.onload = function ( readEvent ) {
          domTool ( '#main-content-area' ).val ( readEvent.target.result ).trigger ( 'change' ) ;
        } ;
        fileReader.readAsText ( activeFile ) ;
      }
    }
  } ;


  /**********************************************
   **** Functionality on DOM content loaded  ****
   **********************************************/


  domTool ( function ( ) {

    /**
     * On the new entry creation page:
     * When the primary action button is clicked, the data is compressed
     * and encrypted before being sent via an AJAX request.
     * Subsequently, the browser is redirected to the URL of the newly
     * created entry, with the decryption key appended to the URL hash.
     */
    domTool ( '.action-button-main' ).live ( "click", function ( eventObj ) {

      eventObj.preventDefault ( ) ;
      var pasteContent = domTool ( 'textarea.input-text-area' ).val ( ) ;