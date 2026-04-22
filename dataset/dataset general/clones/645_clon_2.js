/** @license
  Data Presenter | Custom License
  Copyright 2023 Acme Corp.

  This software is provided "as is", without warranty of any kind, express or
  implied, including but not limited to the warranties of merchantability,
  fitness for a particular purpose and noninfringement. In no event shall the
  authors or copyright holders be liable for any claim, damages or other
  liability, whether in an action of contract, tort or otherwise, arising from,
  out of or in connection with the software or the use or other dealings in the
  software.

 */

/*global browserAPI, console */
/*jslint eqeqeq: true, forin: true, strict: true */

(function () {

  "use strict";

  var jsonDisplayArea,
      sourcePreElement,
      styleInjector,
      delayedDisplayTimer,
      messageChannel,
      initialTimestamp = +(new Date()),
      contentLoadedTime,
      jsonIdentifiedTime,
      nonJsonExitTime,
      formattedViewRenderedTime
  ;

  // Establish communication port with background script
  // console.time('port setup') ;
  messageChannel = browserAPI.extension.connect({
    name: 'jsonFmt'
  });

  // Listen for messages from the background process
  messageChannel.onMessage.addListener(function (incomingMessage) {
    // console.log('Channel message received', incomingMessage[0], (""+incomingMessage[1]).substring(0,30)) ;

    switch (incomingMessage[0]) {
      case 'NON_JSON_CONTENT':
        sourcePreElement.hidden = false;
        // console.log('Revealed the PRE') ;
        document.body.removeChild(jsonDisplayArea);
        nonJsonExitTime = +(new Date());
        break;

      case 'PROCESSING_STARTED':
        jsonIdentifiedTime = +(new Date());

        // Content is JSON and is now being processed in a worker.

        // Clear any pending timeout that might have unhidden the PRE, as we now know it's JSON.
        clearTimeout(delayedDisplayTimer);

        // Inject dynamic CSS rules
        styleInjector = document.createElement('style');
        styleInjector.id = 'formatterStylesheet';
        document.head.appendChild(styleInjector);

        styleInjector.insertAdjacentHTML(
          'beforeend',
          'body{-webkit-user-select:text;overflow-y:scroll !important;margin:0;position:relative}#controlPanel{-webkit-user-select:none;display:block;position:absolute;top:9px;right:17px}#prettyButton,#rawButton{-webkit-border-radius:2px;-webkit-box-shadow:0px 1px 3px rgba(0,0,0,0.1);-webkit-user-select:none;background:-webkit-linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5);border:1px solid #aaa;color:#444;font-size:12px;margin-bottom:0px;min-width:4em;padding:3px 0;position:relative;z-index:10;display:inline-block;width:80px;text-shadow:1px 1px rgba(255,255,255,0.3)}#prettyButton{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}#rawButton{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0;border-right:none}#prettyButton:hover,#rawButton:hover{-webkit-box-shadow:0px 1px 3px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9);border-color:#999;color:#222}#prettyButton:active,#rawButton:active{-webkit-box-shadow:inset 0px 1px 3px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc);color:#333}#prettyButton.selected,#rawButton.selected{-webkit-box-shadow:inset 0px 1px 5px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#e4e4e4, #dfdfdf 40%, #dcdcdc);color:#333}#prettyButton:focus,#rawButton:focus{outline:0}#jsonpWrapperOpen,#jsonpWrapperClose{padding:4px 0 0 8px;color:#000;margin-bottom:-6px}#jsonpWrapperClose{margin-top:0}#mainViewer{padding-left:28px;padding-top:6px}pre{padding:36px 5px 5px 5px}.dataBlock{display:block;padding-left:20px;margin-left:-20px;position:relative}.collapsedView{white-space:nowrap}.collapsedView>.innerContentBlock{display:none}.collapsedView>.ellipsisIndicator:after{content:"…";font-weight:bold}.collapsedView>.ellipsisIndicator{margin:0 4px;color:#888}.collapsedView .dataBlock{display:inline}.expanderIcon{width:20px;height:18px;display:block;position:absolute;left:-2px;top:1px;z-index:5;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYGBgOADE%2F3Hgw0DM4IRHgSsDFOzFInmMAQnY49ONzZRjDFiADT7dMLALiE8y4AGW6LoBAgwAuIkf%2FB7O9sAAAAASUVORK5CYII%3D");background-repeat:no-repeat;background-position:center center;display:block;opacity:0.15}.collapsedView>.expanderIcon{-webkit-transform:rotate(-90deg);width:18px;height:20px;left:0px;top:0px}.expanderIcon:hover{opacity:0.35}.expanderIcon:active{opacity:0.5}.collapsedView .dataBlock .expanderIcon{display:none}.innerContentBlock{display:block;padding-left:24px;border-left:1px dotted #bbb;margin-left:2px}#mainViewer,#jsonpWrapperOpen,#jsonpWrapperClose{color:#333;font:13px/18px monospace}#mainViewer{color:#444}.strongText{font-weight:bold}.stringValue{color:#0B7500;word-wrap:break-word}a:link,a:visited{text-decoration:none;color:inherit}a:hover,a:active{text-decoration:underline;color:#050}.booleanValue,.nullValue,.numberValue{font-weight:bold;color:#1A01CC}.keyName{color:#000}#statusMessageElement{font:13px "Lucida Grande","Segoe UI","Tahoma";padding:10px 0 0 8px;margin:0;color:#333}#statusMessageElement>svg{margin:0 7px;position:relative;top:1px}[hidden]{display:none !important}span{white-space:pre-wrap}@-webkit-keyframes spin{from{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}#spinnerIcon{-webkit-animation:spin 2s 0 infinite}*{-webkit-font-smoothing:antialiased}'
        );

        // Display 'Formatting...' spinner
        jsonDisplayArea.innerHTML = '<p id="statusMessageElement"><svg id="spinnerIcon" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path></svg> Processing Data...</p>';

        var statusMessageElement = document.getElementById('statusMessageElement');
        statusMessageElement.hidden = true;
        setTimeout(function () {
          statusMessageElement.hidden = false;
        }, 250);

        // Create the option bar for view switching
        var controlPanel = document.createElement('div');
        controlPanel.id = 'controlPanel';

        // Create 'Raw' and 'Parsed' buttons
        var rawButton = document.createElement('button'),
          prettyButton = document.createElement('button');
        rawButton.id = 'rawButton';
        rawButton.innerText = 'Raw';
        prettyButton.id = 'prettyButton';
        prettyButton.innerText = 'Parsed';
        prettyButton.classList.add('selected');

        var isRawViewActive = false;
        rawButton.addEventListener(
          'click',
          function () {
            // When raw button clicked...
            if (!isRawViewActive) {
              isRawViewActive = true;
              sourcePreElement.hidden = false;
              jsonDisplayArea.hidden = true;

              prettyButton.classList.remove('selected');
              rawButton.classList.add('selected');
            }
          },
          false
        );

        prettyButton.addEventListener(
          'click',
          function () {
            // When parsed button clicked...
            if (isRawViewActive) {
              isRawViewActive = false;
              sourcePreElement.hidden = true;
              jsonDisplayArea.hidden = false;

              prettyButton.classList.add('selected');
              rawButton.classList.remove('selected');
            }
          },
          false
        );

        // Append buttons to the control panel
        controlPanel.appendChild(rawButton);
        controlPanel.appendChild(prettyButton);

        // Attach global click handler for expand/collapse
        document.addEventListener(
          'click',
          handleInteraction,
          false
        );

        // Insert control panel into the document body
        document.body.insertBefore(controlPanel, sourcePreElement);

        break;

      case 'FORMATTING_COMPLETE':
        // Insert the generated HTML content
        jsonDisplayArea.innerHTML = incomingMessage[1];

        formattedViewRenderedTime = Date.now();

        // Log timing information (optional in production)
        // console.log('DOM ready took '+ (contentLoadedTime - initialTimestamp) +'ms' ) ;
        // console.log('JSON identification took '+ (jsonIdentifiedTime - contentLoadedTime) +'ms' ) ;
        // console.log('Formatting & display took '+ (formattedViewRenderedTime - jsonIdentifiedTime) +'ms' ) ;

        // Export parsed JSON for developer console access
        setTimeout(function () {
          var scriptElement = document.createElement("script");
          scriptElement.innerHTML = 'window.parsedData = ' + incomingMessage[2] + ';';
          document.head.appendChild(scriptElement);
          console.info('Data Presenter: Use "parsedData" to inspect the object.');
        }, 100);

        break;

      default:
        throw new TypeError('Unknown message type received: ' + incomingMessage[0]);
    }
  });

  // console.timeEnd('port setup') ;

  function initializeContent() {

    contentLoadedTime = Date.now();

    // Check if the page contains a single PRE element
    var documentBodyChildren = document.body.childNodes;
    sourcePreElement = documentBodyChildren[0];
    var contentLength = (sourcePreElement && sourcePreElement.innerText || "").length;
    if (
      documentBodyChildren.length !== 1 ||
      sourcePreElement.tagName !== 'PRE' ||
      contentLength > (3 * 1024 * 1024)
    ) {

      // console.log('Not a single PRE element (or too large); exiting') ;

      // Disconnect the port if not used
      messageChannel.disconnect();

      // EXIT POINT: Non-plain-text page or extremely large content
    } else {
      // This is a plain text page, potentially JSON/JSONP.

      // Hide the PRE element immediately to prevent Flash Of Unstyled Content (FOUC)
      sourcePreElement.hidden = true;
      // console.log('Text content detected; PRE hidden.') ;
      delayedDisplayTimer = setTimeout(function () {
        sourcePreElement.hidden = false;
      }, 1000); // If no response in 1s, unhide PRE

      // Prepare a DIV to display formatted content
      jsonDisplayArea = document.createElement('div');
      jsonDisplayArea.id = 'mainViewer';
      document.body.appendChild(jsonDisplayArea);

      // Send the raw text content to the background script for analysis
      messageChannel.postMessage({
        dataType: "SUBMITTING_TEXT_DATA",
        payload: sourcePreElement.innerText,
        dataSize: contentLength
      });

      // This script will now wait for a response from the background worker.
    }

    document.addEventListener('keyup', function (keyboardEvent) {
      if (keyboardEvent.keyCode === 37 && typeof rawButton !== 'undefined') {
        rawButton.click();
      } else if (keyboardEvent.keyCode === 39 && typeof prettyButton !== 'undefined') {
        prettyButton.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initializeContent, {
    once: true
  });

  var lastBlockIdIssued = 0;

  function foldElements(targetElements) {
    // console.log('elements', targetElements) ;

    var currentElement, i, innerContentBlock, childCount;

    for (i = targetElements.length - 1; i >= 0; i--) {
      currentElement = targetElements[i];
      currentElement.classList.add('collapsedView');

      // Add a count of child properties/items if not already present
      if (!currentElement.id) {
        currentElement.id = 'dataBlock' + (++lastBlockIdIssued);

        // Locate the inner content block
        innerContentBlock = currentElement.firstElementChild;
        while (innerContentBlock && !innerContentBlock.classList.contains('innerContentBlock')) {
          innerContentBlock = innerContentBlock.nextElementSibling;
        }
        if (!innerContentBlock)
          continue; // Skip if no inner block found

        // Count children within the inner block
        childCount = innerContentBlock.children.length;

        // Generate a descriptive comment (e.g., "4 items")
        var itemDescription = childCount + (childCount === 1 ? ' item' : ' items');
        // Inject CSS rule for the comment
        styleInjector.insertAdjacentHTML(
          'beforeend',
          '\n#dataBlock' + lastBlockIdIssued + '.collapsedView::after { color: #aaa; content: " // ' + itemDescription + '"; }'
        );
      }
    }
  }

  function unfoldElements(targetElements) {
    for (var i = targetElements.length - 1; i >= 0; i--)
      targetElements[i].classList.remove('collapsedView');
  }

  var isMacOS = navigator.platform.indexOf('Mac') !== -1,
    isModifierKeyPressed;
  if (isMacOS)
    isModifierKeyPressed = function (eventObject) {
      return eventObject.metaKey;
    };
  else
    isModifierKeyPressed = function (eventObject) {
      return eventObject.ctrlKey;
    };

  function handleInteraction(clickEvent) {
    // console.log('click event', clickEvent) ;

    if (clickEvent.which === 1) { // Left mouse button click
      var clickedElement = clickEvent.target;

      if (clickedElement.className === 'expanderIcon') {
        // This is a click on an expander icon.

        clickEvent.preventDefault(); // Prevent default browser action

        var parentElement = clickedElement.parentNode,
          viewerDiv = jsonDisplayArea,
          previousBodyHeight = document.body.offsetHeight,
          scrollPosition = document.documentElement.scrollTop;

        // Determine whether to expand or collapse
        if (parentElement.classList.contains('collapsedView')) {
          // EXPAND operation
          if (isModifierKeyPressed(clickEvent))
            unfoldElements(parentElement.parentNode.children); // Expand all siblings
          else
            unfoldElements([parentElement]); // Expand only this element
        } else {
          // COLLAPSE operation
          if (isModifierKeyPressed(clickEvent))
            foldElements(parentElement.parentNode.children); // Collapse all siblings
          else
            foldElements([parentElement]); // Collapse only this element
        }

        // Adjust scroll position if necessary to prevent visual jumps
        viewerDiv.style.marginBottom = '0px'; // Reset any previous adjustment

        // No adjustment needed if content fits viewport
        if (document.body.offsetHeight < window.innerHeight) {
          // console.log('Body height less than window height; no scroll adjustment needed') ;
          return;
        }

        // No adjustment needed if scroll position did not change
        if (document.documentElement.scrollTop === scrollPosition) {
          // console.log('Scroll position unchanged; no adjustment needed') ;
          return;
        }

        // console.log('Scroll position changed. Current: '+document.documentElement.scrollTop+'; Was: '+scrollPosition) ;

        // The body has become shorter. Calculate the difference and adjust.
        var scrollAdjustment = scrollPosition - document.documentElement.scrollTop + 8; // Add 8px for consistency

        // Apply the difference as bottom margin to push content down
        viewerDiv.style.marginBottom = scrollAdjustment + 'px';

        // Restore the original scroll position
        document.documentElement.scrollTop = scrollPosition;

        return;
      }
    }
  }

}());