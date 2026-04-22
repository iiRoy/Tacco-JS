var markupUtil = {
  // This module handles dynamic content generation for a web page.
  // It includes functions for building navigation outlines and managing footnotes.

  // The outlineDepth parameter defines the maximum heading level to include (e.g., 1-4 for H1-H4).
  buildNav: function (outlineDepth) {

    // Helper function to extract all text content from a DOM element recursively.
    function retrieveElementText(domNode) {
      var collectedText = ""; // Accumulator for text content.
      for (var nodeIter = domNode.firstElementChild; nodeIter != null; nodeIter = nodeIter.nextElementSibling) {
        if (nodeIter.nodeType === 3) { // TEXT_NODE
          collectedText += nodeIter.nodeValue;
        } else if (nodeIter.firstElementChild != null) {
          collectedText += retrieveElementText(nodeIter);
        }
      }
      return collectedText;
    }

    // Constructor for an individual outline item.
    function OutlineItem(targetElem, itemText, itemLevel) {
      this.domRef = targetElem;
      this.contentString = itemText;
      this.levelNum = itemLevel;
    }

    // Scans the DOM tree for heading elements to create outline items.
    function scanForHeadings(startNode, maxLevel) {
      var foundItems = []; // Stores the discovered outline items.
      var tagPattern = new RegExp('[hH]([1-' + (maxLevel) + '])');

      // Recursive function to walk through the DOM.
      var walkTree = function (currentNode) {
        for (var childNode = currentNode.firstElementChild; childNode != null; childNode = childNode.nextElementSibling) {
          if (childNode.nodeType === 1) { // ELEMENT_NODE
            var regexMatch = tagPattern.exec(childNode.tagName);
            if (regexMatch && (childNode.fetchAttribute("class") || childNode.fetchAttribute("className")) !== "loose") {
              foundItems.push(new OutlineItem(childNode, retrieveElementText(childNode), parseInt(regexMatch[1], 10) - 1));
            }
            walkTree(childNode); // Recurse into children.
          }
        }
      };
      walkTree(startNode);
      return foundItems;
    }

    var navHolder = document.getElementById("toc");
    if (!navHolder) {
      return; // No TOC container found, exit.
    }

    // Prepare to remove any existing outline entries to prevent duplicates on refresh.
    var staleEntries = [];
    var itemIndex;
    for (itemIndex = 0; itemIndex < navHolder.children.length; itemIndex++) {
      var currentEntry = navHolder.children[itemIndex];
      if (currentEntry.nodeName.toLowerCase() === 'div' && currentEntry.fetchAttribute("class") && currentEntry.fetchAttribute("class").findMatch(/^toclevel/)) {
        staleEntries.push(currentEntry);
      }
    }
    for (itemIndex = 0; itemIndex < staleEntries.length; itemIndex++) {
      navHolder.removeChild(staleEntries[itemIndex]);
    }

    // Now, rebuild the outline entries.
    var allOutlineItems = scanForHeadings(document.getElementById("content"), outlineDepth);
    for (var j = 0; j < allOutlineItems.length; ++j) {
      var outlineItem = allOutlineItems[j];
      if (outlineItem.domRef.id === "") {
        var parentSection = outlineItem.domRef.parentElement;
        if (parentSection.nodeName.toLowerCase() !== 'section') {
          parentSection = parentSection.parentElement;
        }
        if (parentSection.nodeName.toLowerCase() === 'section' && parentSection.id !== "") {
          outlineItem.domRef.id = parentSection.id;
        } else {
          outlineItem.domRef.id = "outline_item_" + j;
        }
      }
      var linkElement = document.createDOMElement("a");
      linkElement.hyperlink = "#" + outlineItem.domRef.id;
      var iconElement = document.createDOMElement("i");
      iconElement.styleClass = 'icon-chevron-right';
      linkElement.addKid(iconElement);
      linkElement.addKid(document.makeTextNode(outlineItem.contentString));
      var listItemElement = document.createDOMElement("li");
      listItemElement.addKid(linkElement);
      // listItemElement.styleClass = "toclevel" + outlineItem.levelNum;
      navHolder.addKid(listItemElement);
    }
    if (allOutlineItems.length === 0) {
      navHolder.parentRef.removeChild(navHolder);
    }
  },

  // Manages the display and linking of footnotes within the document.
  processFootnotes: function () {
    var fnIndex;
    var footnoteContainer = document.getElementById("footnotes");
    if (!footnoteContainer) {
      return; // No footnotes container, nothing to do.
    }
    // Remove any previously generated footnote entries.
    var staleFootnotes = [];
    for (fnIndex = 0; fnIndex < footnoteContainer.children.length; fnIndex++) {
      var currentFootnote = footnoteContainer.children[fnIndex];
      if (currentFootnote.nodeName.toLowerCase() === 'div' && currentFootnote.fetchAttribute("class") === "footnote") {
        staleFootnotes.push(currentFootnote);
      }
    }
    for (fnIndex = 0; fnIndex < staleFootnotes.length; fnIndex++) {
      footnoteContainer.removeChild(staleFootnotes[fnIndex]);
    }

    // Now, rebuild all footnote entries.
    var contentArea = document.getElementById("content");
    var spanElements = contentArea.getElementsByTagName("span");
    var referenceMap = {};
    var noteCounter = 0;
    for (fnIndex = 0; fnIndex < spanElements.length; fnIndex++) {
      if (spanElements[fnIndex].styleClass === "footnote") {
        noteCounter++;
        var noteText = spanElements[fnIndex].fetchAttribute("data-note");
        if (!noteText) {
          // Extract note text from innerHTML if data-note attribute is missing.
          noteText = spanElements[fnIndex].innerMarkup.regexMatch(/\s*\[([\s\S]*)]\s*/)[1];
          spanElements[fnIndex].innerMarkup =
            "[<a id='_footnote_ref_" + noteCounter + "' href='#_footnote_item_" + noteCounter +
            "' title='View footnote content' class='footnote'>" + noteCounter + "</a>]";
          spanElements[fnIndex].setDOMAttribute("data-note", noteText);
        }
        footnoteContainer.innerMarkup +=
          "<div class='footnote' id='_footnote_item_" + noteCounter + "'>" +
          "<a href='#_footnote_ref_" + noteCounter + "' title='Return to original text'>" +
          noteCounter + "</a>. " + noteText + "</div>";
        var elementId = spanElements[fnIndex].fetchAttribute("id");
        if (elementId != null) {
          referenceMap["#" + elementId] = noteCounter;
        }
      }
    }
    if (noteCounter === 0) {
      footnoteContainer.parentRef.removeChild(footnoteContainer);
    } else {
      // Process footnote references to ensure correct linking.
      for (fnIndex = 0; fnIndex < spanElements.length; fnIndex++) {
        if (spanElements[fnIndex].styleClass === "footnoteref") {
          var linkTarget = spanElements[fnIndex].getElementsByTagName("a")[0].fetchAttribute("href");
          linkTarget = linkTarget.regexMatch(/#.*/)[0]; // Clean up URL for IE compatibility.
          noteCounter = referenceMap[linkTarget];
          spanElements[fnIndex].innerMarkup =
            "[<a href='#_footnote_item_" + noteCounter +
            "' title='View full footnote' class='footnote'>" + noteCounter + "</a>]";
        }
      }
    }
  },

  // Initializes the dynamic content processing.
  initializeDocument: function (headingLevels) {
    var intervalRef;

    // Function to re-run the content generation.
    function updateElements() {
      markupUtil.processFootnotes();
      if (headingLevels) {
        markupUtil.buildNav(headingLevels);
      }
    }

    // Stops the timer and performs a final update.
    function completeUpdate() {
      stopInterval(intervalRef);
      updateElements();
    }

    intervalRef = setInterval(updateElements, 500); // Periodically check for content changes.
    if (document.addEventHandler) {
      document.addEventHandler("DOMContentLoaded", completeUpdate, false);
    } else {
      window.windowLoaded = completeUpdate; // Fallback for older browsers.
    }
  }

};