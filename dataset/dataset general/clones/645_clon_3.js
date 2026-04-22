(function() {

  "use strict";

  // Guard against environments where Chrome extensions API might not be available
  if (typeof chrome === 'undefined' || !chrome.extension) {
    console.warn('Extension API not found. JSON formatting functionality disabled.');
    return;
  }

  // Define some configuration constants
  const pageSettings = {
    maxContentSize: 3500000, // Maximum content length to process (e.g., 3.5 MB)
    initialHideDelay: 1200, // Milliseconds to wait before unhiding raw text if processing is slow
    exportVarName: 'parsedDocumentData', // Global variable name for the exported JSON object
    portIdentifier: 'data_processor_channel' // Name for the communication channel with background script
  };

  // Declare core variables for managing content and state
  let mainContentWrapper,             // The main DIV that will hold the formatted JSON
      sourceCodeBlock,                // Reference to the original <PRE> element
      dynamicStylingInjector,         // <STYLE> element for injecting custom CSS rules
      analysisDelayTimerId,           // Timer ID for the initial content analysis delay
      bgCommunicationPort,            // Port for communicating with the background script
      initialLoadTimestamp = Date.now(),
      structureReadyMoment,
      dataIdentifiedTime,
      rawViewActivationTime,
      formattedViewShownTime;

  // Establish communication with the background script immediately
  bgCommunicationPort = chrome.extension.connect({ name: pageSettings.portIdentifier });

  // Set up message listener for responses from the background script
  bgCommunicationPort.onMessage.addListener(function (commPayload) {
    // console.log('Received message from background:', commPayload[0]);

    switch (commPayload[0]) {
      case 'RAW_CONTENT_RESPONSE':
        // The content was determined not to be JSON or was too large/complex.
        // Revert to showing the original content.
        if (sourceCodeBlock) {
          sourceCodeBlock.style.display = 'block'; // Make the <PRE> visible again
        }
        if (mainContentWrapper && mainContentWrapper.parentNode) {
          mainContentWrapper.parentNode.removeChild(mainContentWrapper); // Remove the formatting container
        }
        rawViewActivationTime = Date.now();
        break;

      case 'PROCESSING_STARTED':
        // The content is JSON and is now being processed by the background worker.
        dataIdentifiedTime = Date.now();

        // Clear any pending timeout that might unhide the original <PRE> element.
        clearTimeout(analysisDelayTimerId);

        // Inject dynamic CSS for the formatted view
        dynamicStylingInjector = document.createElement('style');
        dynamicStylingInjector.id = 'json_formatter_styles';
        document.head.appendChild(dynamicStylingInjector);

        // Define the core styling for the formatter
        let formatterCss = `
          body {
            -webkit-user-select: text;
            overflow-y: scroll !important;
            margin: 0;
            position: relative;
            background-color: #f8f8f8; /* Light background for parsed view */
          }
          #controlPanel {
            -webkit-user-select: none;
            display: block;
            position: absolute;
            top: 10px;
            right: 20px;
            z-index: 100;
          }
          .toggleButton {
            -webkit-border-radius: 3px;
            -webkit-box-shadow: 0px 1px 4px rgba(0,0,0,0.15);
            background: -webkit-linear-gradient(#fcfcfc, #f7f7f7 45%, #e9e9e9);
            border: 1px solid #bbb;
            color: #555;
            font-size: 13px;
            min-width: 4.5em;
            padding: 4px 0;
            cursor: pointer;
            display: inline-block;
            width: 85px;
            text-shadow: 0 1px rgba(255,255,255,0.4);
            transition: all 0.1s ease-in-out;
          }
          #sourceToggleButton {
            margin-right: -1px; /* Overlap borders */
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          #prettyPrintToggle {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: none;
          }
          .toggleButton:hover {
            -webkit-box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
            background: #f0f0f0 -webkit-linear-gradient(#ffffff, #fdfdfd 45%, #f0f0f0);
            border-color: #aaa;
            color: #333;
          }
          .toggleButton:active {
            -webkit-box-shadow: inset 0px 1px 4px rgba(0,0,0,0.25);
            background: #f0f0f0 -webkit-linear-gradient(#f5f5f5, #f0f0f0 45%, #e0e0e0);
            color: #444;
          }
          .toggleButton.selected {
            -webkit-box-shadow: inset 0px 1px 5px rgba(0,0,0,0.2);
            background: #e0e0e0 -webkit-linear-gradient(#e8e8e8, #e3e3e3 45%, #d5d5d5);
            color: #444;
            cursor: default;
          }
          .toggleButton:focus { outline: 0; }
          #jsonpPrefix, #jsonpSuffix {
            padding: 5px 0 0 10px;
            color: #1a1a1a;
            margin-bottom: -8px;
            font-size: 14px;
            font-family: 'Consolas', 'Monaco', monospace;
          }
          #jsonpSuffix { margin-top: 0; }
          #formattedOutputContainer {
            padding-left: 30px;
            padding-top: 8px;
            font: 14px/20px 'Consolas', 'Monaco', monospace;
            color: #333;
          }
          pre {
            padding: 40px 10px 10px 10px;
            word-wrap: break-word; /* Ensure raw text wraps */
          }
          .item-group {
            display: block;
            padding-left: 22px;
            margin-left: -22px;
            position: relative;
          }
          .folded {
            white-space: nowrap;
            overflow: hidden; /* Hide overflow for folded items */
            text-overflow: ellipsis; /* Show ellipsis for folded items */
          }
          .folded > .innerContentBlock { display: none; }
          .folded > .ellipsisIndicator:after { content:"…"; font-weight:bold; }
          .folded > .ellipsisIndicator { margin:0 5px; color:#999; }
          .folded .item-group { display: inline; }
          .expanderIcon {
            width: 22px;
            height: 20px;
            display: block;
            position: absolute;
            left: -2px;
            top: 2px;
            z-index: 5;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23666' d='M 2 2 L 8 5 L 2 8 Z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: center center;
            opacity: 0.2;
            cursor: pointer;
          }
          .folded > .expanderIcon {
            -webkit-transform: rotate(-90deg);
            width: 20px;
            height: 22px;
            left: 0px;
            top: 1px;
          }
          .expanderIcon:hover { opacity: 0.4; }
          .expanderIcon:active { opacity: 0.6; }
          .folded .item-group .expanderIcon { display: none; }
          .innerContentBlock {
            display: block;
            padding-left: 26px;
            border-left: 1px dotted #ccc;
            margin-left: 3px;
          }
          .keyName { font-weight: bold; color: #000; }
          .stringValue { color: #008000; word-wrap: break-word; }
          a:link, a:visited { text-decoration: none; color: inherit; }
          a:hover, a:active { text-decoration: underline; color: #0050a0; }
          .booleanValue, .nullValue, .numericValue { font-weight: bold; color: #0000cc; }
          #processingMessage {
            font: 14px "Segoe UI", "Lucida Grande", Tahoma, sans-serif;
            padding: 12px 0 0 10px;
            margin: 0;
            color: #444;
            display: flex;
            align-items: center;
          }
          #processingMessage svg {
            margin: 0 8px;
            position: relative;
            top: 1px;
            animation: spin 1.8s linear infinite;
          }
          [hidden] { display: none !important; }
          span { white-space: pre-wrap; }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          * { -webkit-font-smoothing: antialiased; }
        `;
        dynamicStylingInjector.insertAdjacentHTML('beforeend', formatterCss);

        // Display a "Processing..." message with a spinner
        mainContentWrapper.innerHTML = `
          <p id="processingMessage" hidden>
            <svg width="18" height="18" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1">
              <path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#4d90fe"></path>
            </svg>
            Processing data...
          </p>`;

        let processingMsgElement = document.getElementById('processingMessage');
        // Show processing message after a brief delay to avoid flicker for fast processes
        setTimeout(() => {
          if (processingMsgElement) {
            processingMsgElement.hidden = false;
          }
        }, 300);

        // Create the option bar (Raw/Parsed buttons)
        let controlBar = document.createElement('div');
        controlBar.id = 'controlPanel';

        let sourceToggleButton = document.createElement('button'),
            prettyPrintToggle = document.createElement('button');

        sourceToggleButton.id = 'sourceToggleButton';
        sourceToggleButton.innerText = 'Raw';
        sourceToggleButton.classList.add('toggleButton');

        prettyPrintToggle.id = 'prettyPrintToggle';
        prettyPrintToggle.innerText = 'Parsed';
        prettyPrintToggle.classList.add('toggleButton', 'selected');

        let isRawModeActive = false; // State variable for button toggle

        sourceToggleButton.addEventListener('click', function () {
          if (!isRawModeActive) {
            isRawModeActive = true;
            if (sourceCodeBlock) sourceCodeBlock.style.display = 'block';
            if (mainContentWrapper) mainContentWrapper.style.display = 'none';

            prettyPrintToggle.classList.remove('selected');
            sourceToggleButton.classList.add('selected');
          }
        }, false);

        prettyPrintToggle.addEventListener('click', function () {
          if (isRawModeActive) {
            isRawModeActive = false;
            if (sourceCodeBlock) sourceCodeBlock.style.display = 'none';
            if (mainContentWrapper) mainContentWrapper.style.display = 'block';

            prettyPrintToggle.classList.add('selected');
            sourceToggleButton.classList.remove('selected');
          }
        }, false);

        controlBar.appendChild(sourceToggleButton);
        controlBar.appendChild(prettyPrintToggle);

        // Insert the control bar into the DOM before the original <PRE> element
        document.body.insertBefore(controlBar, sourceCodeBlock);

        // Attach global click handler for expand/collapse functionality
        document.addEventListener('click', handleElementInteraction, false);

        break;

      case 'FORMATTED_CONTENT_READY':
        // The background script has finished formatting the JSON.
        // Insert the generated HTML content into our display container.
        if (mainContentWrapper) {
          mainContentWrapper.innerHTML = commPayload[1];
          mainContentWrapper.style.display = 'block'; // Ensure it's visible
        }

        formattedViewShownTime = Date.now();

        // Export the parsed JSON data to a global variable for developer console access
        setTimeout(() => {
          const dataExportScript = document.createElement("script");
          // Using Object.defineProperty to make the global variable non-writable, non-configurable by default
          dataExportScript.textContent = `
            Object.defineProperty(window, '${pageSettings.exportVarName}', {
              value: ${commPayload[2]},
              writable: false,
              configurable: false
            });
            console.info('JSON Formatter: Parsed JSON data available as window.${pageSettings.exportVarName}');
          `;
          document.head.appendChild(dataExportScript);
          dataExportScript.remove(); // Clean up the injected script tag
        }, 150); // Small delay to ensure DOM is settled

        break;

      default:
        console.warn('Unknown message type received from background:', commPayload[0]);
        // Optionally, throw an error or handle gracefully
    }
  });

  /**
   * Initializes content processing when the DOM is fully loaded.
   */
  function initContentProcessing() {
    structureReadyMoment = Date.now();

    // Check if the document body consists solely of a <PRE> tag.
    // This heuristic helps determine if it's a raw data page.
    const documentBodyChildren = document.body.children;
    if (documentBodyChildren.length === 0) {
        // No content, exit early
        bgCommunicationPort.disconnect();
        return;
    }

    sourceCodeBlock = documentBodyChildren[0];
    const inputStringSize = (sourceCodeBlock && sourceCodeBlock.innerText) ? sourceCodeBlock.innerText.length : 0;

    if (
      documentBodyChildren.length !== 1 ||
      sourceCodeBlock.nodeName !== 'PRE' ||
      inputStringSize === 0 ||
      inputStringSize > pageSettings.maxContentSize
    ) {
      // If it's not a single PRE element, or content is too large,
      // it's likely not raw JSON we should format.
      bgCommunicationPort.disconnect(); // Disconnect as we won't use it
      return; // Exit point for non-processable pages
    } else {
      // This appears to be a plain text page (single <PRE> child).
      // We'll attempt to format it as JSON/JSONP.

      // Temporarily hide the original <PRE> to prevent FOUC (Flash of Unformatted Content).
      sourceCodeBlock.style.display = 'none';

      // Set a timeout to unhide the <PRE> if the background script takes too long
      // to determine if it's JSON (e.g., > 1.2 seconds).
      analysisDelayTimerId = setTimeout(() => {
        if (sourceCodeBlock) {
          sourceCodeBlock.style.display = 'block';
        }
        // Also remove the placeholder if it was added
        if (mainContentWrapper && mainContentWrapper.parentNode) {
            mainContentWrapper.parentNode.removeChild(mainContentWrapper);
        }
      }, pageSettings.initialHideDelay);

      // Create the container for the formatted JSON output.
      mainContentWrapper = document.createElement('div');
      mainContentWrapper.id = 'formattedOutputContainer';
      document.body.appendChild(mainContentWrapper);

      // Send the content of the <PRE> element to the background script for analysis and formatting.
      bgCommunicationPort.postMessage({
        action: "PROCESS_CONTENT_REQUEST",
        content: sourceCodeBlock.innerText,
        contentLength: inputStringSize
      });
    }

    // Add keyboard shortcuts for toggling between raw and parsed views
    document.addEventListener('keyup', (event) => {
      const sourceToggleButton = document.getElementById('sourceToggleButton');
      const prettyPrintToggle = document.getElementById('prettyPrintToggle');

      if (event.keyCode === 37 && sourceToggleButton) { // Left arrow key
        sourceToggleButton.click();
        event.preventDefault(); // Prevent default browser behavior (e.g., history back)
      } else if (event.keyCode === 39 && prettyPrintToggle) { // Right arrow key
        prettyPrintToggle.click();
        event.preventDefault();
      }
    });
  }

  // Ensure the initialization function runs once the DOM is fully loaded.
  document.addEventListener("DOMContentLoaded", initContentProcessing, false);


  let lastItemIdentifier = 0; // Counter for unique IDs for collapsible elements

  /**
   * Collapses a set of elements, hiding their inner content and displaying an ellipsis.
   * @param {NodeList|Array<HTMLElement>} elements - The elements to collapse.
   */
  function foldElements(elements) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const targetElement = elements[i];
      if (targetElement && targetElement.classList) {
        targetElement.classList.add('folded');

        // Add a count of child properties/items if not already present
        if (!targetElement.hasAttribute('data-item-id')) {
          targetElement.setAttribute('data-item-id', `item-group-${++lastItemIdentifier}`);

          // Find the inner content block within the current element
          let innerContentBlock = targetElement.firstElementChild;
          while (innerContentBlock && !innerContentBlock.classList.contains('innerContentBlock')) {
            innerContentBlock = innerContentBlock.nextElementSibling;
          }

          if (innerContentBlock) {
            const childCount = innerContentBlock.children.length;
            const commentText = `${childCount} element${childCount === 1 ? '' : 's'}`;
            // Inject CSS rule dynamically for the count
            if (dynamicStylingInjector && dynamicStylingInjector.sheet) {
                try {
                    dynamicStylingInjector.sheet.insertRule(
                        `[data-item-id="item-group-${lastItemIdentifier}"].folded:after {
                            color: #999;
                            content: " // ${commentText}";
                            margin-left: 8px;
                        }`,
                        dynamicStylingInjector.sheet.cssRules.length
                    );
                } catch (e) {
                    console.error('Failed to insert CSS rule for folded count:', e);
                }
            }
          }
        }
      }
    }
  }

  /**
   * Expands a set of elements, revealing their inner content.
   * @param {NodeList|Array<HTMLElement>} elements - The elements to expand.
   */
  function unfoldElements(elements) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const targetElement = elements[i];
      if (targetElement && targetElement.classList) {
        targetElement.classList.remove('folded');
      }
    }
  }

  // Determine the appropriate modifier key for expanding/collapsing multiple elements
  const macOSDetected = navigator.platform.indexOf('Mac') !== -1;
  const getModifierKeyStatus = (event) => macOSDetected ? event.metaKey : event.ctrlKey;

  /**
   * Handles click events, primarily for expanding/collapsing JSON tree nodes.
   * @param {MouseEvent} event - The click event object.
   */
  function handleElementInteraction(event) {
    if (event.button === 0) { // Left mouse button click
      const eventSource = event.target;

      // Check if the clicked element is an expander icon
      if (eventSource && eventSource.classList.contains('expanderIcon')) {
        event.preventDefault(); // Prevent default browser behavior (e.g., text selection)

        const ancestorElement = eventSource.parentNode;
        const displayDiv = mainContentWrapper; // Reference to the main formatted content container

        const originalVerticalOffset = document.documentElement.scrollTop || document.body.scrollTop;
        const previousBodyDimension = document.body.offsetHeight;

        // Perform expand or collapse action
        if (ancestorElement.classList.contains('folded')) {
          // EXPAND operation
          if (getModifierKeyStatus(event)) {
            // Modifier key held: expand all siblings
            unfoldElements(ancestorElement.parentNode.children);
          } else {
            // No modifier: expand only the clicked element
            unfoldElements([ancestorElement]);
          }
        } else {
          // COLLAPSE operation
          if (getModifierKeyStatus(event)) {
            // Modifier key held: collapse all siblings
            foldElements(ancestorElement.parentNode.children);
          } else {
            // No modifier: collapse only the clicked element
            foldElements([ancestorElement]);
          }
        }

        // Adjust scroll position if the content height changed significantly
        // This helps maintain the user's view after content expansion/collapse.
        const currentBodyDimension = document.body.offsetHeight;
        if (currentBodyDimension < window.innerHeight) {
          // If content fits within viewport, no scroll adjustment needed.
          return;
        }

        const newVerticalOffset = document.documentElement.scrollTop || document.body.scrollTop;
        if (newVerticalOffset === originalVerticalOffset) {
          // If scroll position didn't change, no adjustment needed.
          return;
        }

        // If the body height has changed and scroll position has shifted,
        // calculate the necessary adjustment to keep the view stable.
        const scrollAdjustmentAmount = originalVerticalOffset - newVerticalOffset;
        displayDiv.style.marginBottom = `${parseInt(displayDiv.style.marginBottom || '0', 10) + scrollAdjustmentAmount}px`;
        document.documentElement.scrollTop = document.body.scrollTop = originalVerticalOffset;
      }
    }
  }

})();