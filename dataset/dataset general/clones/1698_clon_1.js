var asciidoc = {
  // This is the primary namespace object for AsciiDoc related functionalities.

  // =====================================================================
  //  Table Of Contents (TOC) Generation Logic
  // =====================================================================

  /*
   * Original Author: Mihai Bazon (mishoo)
   * Date: September 2002
   * Project URL: http://students.infoiasi.ro/~mishoo
   *
   * Purpose: Generates a dynamic Table of Contents.
   * Version: 0.5-bootstrap-docs - Adapted for Bootstrap documentation backend.
   *
   * License Information:
   * This script is freely usable under the terms of the GNU General Public
   * License (GPL). Please ensure this notice remains intact if you use or
   * modify the code.
   */

  /*
   * Subsequent modifications:
   *  - Troy D. Hanson, September 2006 (GPL)
   *  - Stuart Rackham, 2006, 2009 (GPL)
   *  - Dan Allen, 2012 (GPL)
   */

  /**
   * Generates a Table of Contents (TOC) based on header elements found in the document.
   * The `toclevels` parameter defines the maximum header level to include (e.g., 1 for H1, 2 for H1-H2, etc.).
   *
   * @param {number} toclevels - The maximum header level to consider for the TOC (1-4 typically).
   */
  toc: function (toclevels) {

    // Helper function to extract all text content from an element, including child nodes.
    function getText(el) {
      var text = ""; /* Initialize an empty string to accumulate text. */

      // Iterate through all child nodes of the given element.
      for (var i = el.firstChild; i != null; i = i.nextSibling) {

        // Check if the current node is a text node (Node.TEXT_NODE == 3).
        if (i.nodeType == 3 /* Node.TEXT_NODE constant value */) {
          text += i.data; // Append the text data to the result.
        }
        // If it's not a text node but has children, recursively call getText.
        else if (i.firstChild != null) {
          text += getText(i); // Concatenate the text from child elements.
        }
      }
      return text; // Return the collected text.
    }

    // Constructor for a TOC entry object.
    function TocEntry(el, text, toclevel) {
      this.element = el;         // The HTML element corresponding to the header.
      this.text = text;          // The extracted text of the header.
      this.toclevel = toclevel;  // The calculated TOC level (e.g., 0 for H1, 1 for H2).
    }

    // Function to find all relevant TOC entries within a given element.
    function tocEntries(el, toclevels) {
      var result = new Array(); // Use Array constructor, slightly different from literal.
      // Regular expression to match header tags (H1 to H[toclevels]).
      // The `+` operator forces conversion to string for concatenation.
      var re = new RegExp('[hH]([1-' + (toclevels) + '])');

      /*
       * Internal recursive function to traverse the DOM tree.
       * This approach avoids DOM2 nodeIterator API due to inconsistent browser support.
       * It scans for header elements that match the defined levels.
       */
      var iterate = function (el) {
        for (var i = el.firstChild; i != null; i = i.nextSibling) {

          // Ensure it's an element node (Node.ELEMENT_NODE == 1).
          if (i.nodeType == 1 /* Element node type */) {
            var mo = re.exec(i.tagName); // Attempt to match the tag name.

            // If a match is found and the element does not have the "loose" class.
            if (mo && (i.getAttribute("class") || i.getAttribute("className")) != "loose") {
              // Create a new TocEntry and add it to the results array.
              // Note: mo[1] is the matched header level, subtract 1 for 0-indexed level.
              result[result.length] = new TocEntry(i, getText(i), mo[1] - 1);
            }
            iterate(i); // Recursively call iterate for children.
          }
        }
      };
      iterate(el); // Start the iteration from the provided element.
      return result; // Return the array of found TOC entries.
    }

    // Get the TOC container element. If not found, exit early.
    var toc = document.getElementById("toc");
    if (!toc) {
      return; // No TOC element found, nothing to do.
    }

    // --- Cleanup Phase: Remove any previously generated TOC entries. ---
    var tocEntriesToRemove = []; // Array to hold references to elements to be removed.
    var i; // Declare loop variable outside for scope.

    // Iterate through existing child nodes of the TOC container.
    for (i = 0; i < toc.childNodes.length; i++) {
      var entry = toc.childNodes[i]; // Current child node.

      // Check if the entry is a 'div' element with a class starting with 'toclevel'.
      if (entry.nodeName.toLowerCase() == 'div' &&
        entry.getAttribute("class") &&
        entry.getAttribute("class").match(/^toclevel/)) {
        tocEntriesToRemove.push(entry); // Add to the removal list.
      }
    }

    // Perform the actual removal of identified entries.
    for (i = 0; i < tocEntriesToRemove.length; i++) {
      toc.removeChild(tocEntriesToRemove[i]); // Remove each child.
    }


    // --- Generation Phase: Rebuild the TOC entries. ---
    // Find all header entries from the content area.
    var entries = tocEntries(document.getElementById("content"), toclevels);

    // Loop through each found TOC entry to create its corresponding HTML list item.
    for (var i = 0; i < entries.length; ++i) {
      var entry = entries[i]; // Current TOC entry.

      // If the header element doesn't have an ID, generate one.
      if (entry.element.id == "") {
        var sec = entry.element.parentNode; // Get parent node.

        // Traverse up to find a 'section' element if the immediate parent isn't one.
        if (sec.nodeName.toLowerCase() != 'section') {
          sec = sec.parentNode;
        }

        // If a section with an ID is found, use its ID for the header.
        if (sec.nodeName.toLowerCase() == 'section' && sec.id != "") {
          entry.element.id = sec.id;
        }
        // Otherwise, generate a unique ID based on its position in the TOC.
        else {
          entry.element.id = "toc_" + i;
        }
      }

      var a = document.createElement("a"); // Create an anchor element.
      a.href = "#" + entry.element.id;     // Set its href to point to the header's ID.

      var img = document.createElement("i"); // Create an icon element.
      img.className = 'icon-chevron-right'; // Assign Bootstrap icon class.

      a.appendChild(img); // Add the icon to the anchor.
      a.appendChild(document.createTextNode(entry.text)); // Add the header text to the anchor.

      var li = document.createElement("li"); // Create a list item element.
      li.appendChild(a); // Append the anchor to the list item.

      // Original line for adding class, commented out in source, so keep it commented.
      // li.className = "toclevel" + entry.toclevel;

      toc.appendChild(li); // Add the list item to the TOC container.
    }

    // If no entries were generated, remove the entire TOC container.
    if (entries.length == 0) {
      toc.parentNode.removeChild(toc);
    }
  }, // End of toc function.


  // =====================================================================
  //  Footnotes Generation Logic
  // =====================================================================

  /*
   * Footnote generation based on code from:
   * http://www.brandspankingnew.net/archive/2005/07/format_footnote.html
   * This module processes footnote references and generates the actual footnote content.
   */

  /**
   * Processes and generates footnotes. It scans for specific span elements
   * with class "footnote" or "footnoteref" and transforms them into
   * numbered footnotes at the bottom of the page.
   */
  footnotes: function () {
    // --- Cleanup Phase: Delete existing footnote entries if reloading. ---
    var i; // Loop counter.
    var noteholder = document.getElementById("footnotes"); // Get the footnote container.

    if (!noteholder) {
      return; // No footnote container found, exit.
    }

    var entriesToRemove = []; // Array to store footnote divs for removal.

    // Iterate through children to find existing footnote divs.
    for (i = 0; i < noteholder.childNodes.length; i++) {
      var entry = noteholder.childNodes[i];

      // Identify 'div' elements with class 'footnote'.
      if (entry.nodeName.toLowerCase() == 'div' && entry.getAttribute("class") == "footnote") {
        entriesToRemove.push(entry); // Add to removal list.
      }
    }

    // Remove all previously identified footnote divs.
    for (i = 0; i < entriesToRemove.length; i++) {
      noteholder.removeChild(entriesToRemove[i]);
    }

    // --- Generation Phase: Rebuild footnote entries. ---
    var cont = document.getElementById("content"); // Get the main content area.
    var spans = cont.getElementsByTagName("span"); // Find all span elements within content.
    var refs = {}; // Object to store references for footnoterefs.
    var n = 0; // Counter for footnote numbers.

    // First pass: Process original footnote definitions.
    for (i = 0; i < spans.length; i++) {
      if (spans[i].className == "footnote") {
        n++; // Increment footnote counter.
        var note = spans[i].getAttribute("data-note"); // Try to get data-note attribute.

        // If data-note is not present, extract from innerHTML and set it.
        if (!note) {
          // Use [\s\S] instead of '.' for multiline matches in JavaScript regex.
          // JavaScript's regex engine lacks a 'dotall' (s) flag.
          note = spans[i].innerHTML.match(/\s*\[([\s\S]*)]\s*/)[1];

          // Reformat the original span to be a clickable reference.
          spans[i].innerHTML =
            "[<a id='_footnoteref_" + n + "' href='#_footnote_" + n +
            "' title='View footnote' class='footnote'>" + n + "</a>]";
          spans[i].setAttribute("data-note", note); // Store the extracted note.
        }

        // Append the actual footnote content to the noteholder.
        noteholder.innerHTML +=
          "<div class='footnote' id='_footnote_" + n + "'>" +
          "<a href='#_footnoteref_" + n + "' title='Return to text'>" +
          n + "</a>. " + note + "</div>";

        var id = spans[i].getAttribute("id"); // Get ID of the span, if any.
        if (id != null) {
          refs["#" + id] = n; // Store reference if ID exists.
        }
      }
    }

    // If no footnotes were found, remove the entire footnote container.
    if (n == 0) {
      noteholder.parentNode.removeChild(noteholder);
    }
    // Otherwise, process footnoterefs.
    else {
      // Second pass: Process footnote references.
      for (i = 0; i < spans.length; i++) {
        if (spans[i].className == "footnoteref") {
          // Get the href from the anchor within the footnoteref span.
          // IE might return a full URL, so extract only the hash part.
          var href = spans[i].getElementsByTagName("a")[0].getAttribute("href");
          href = href.match(/#.*/)[0];

          n = refs[href]; // Retrieve the corresponding footnote number.

          // Reformat the footnoteref span to link to the generated footnote.
          spans[i].innerHTML =
            "[<a href='#_footnote_" + n +
            "' title='View footnote' class='footnote'>" + n + "</a>]";
        }
      }
    }
  }, // End of footnotes function.

  /**
   * Installs the AsciiDoc client-side enhancements.
   * This function sets up the initial generation of footnotes and TOC,
   * and ensures they are regenerated when the DOM is fully loaded.
   *
   * @param {number} toclevels - The maximum header level for the TOC.
   */
  install: function (toclevels) {
    var timerId; // Variable to hold the ID of the interval timer.

    // Function to re-execute footnote and TOC generation.
    function reinstall() {
      asciidoc.footnotes(); // Call the footnotes generator.
      if (toclevels) {
        asciidoc.toc(toclevels); // Call the TOC generator if toclevels is provided.
      }
    }

    // Function to clear the timer and then reinstall.
    function reinstallAndRemoveTimer() {
      clearInterval(timerId); // Stop the periodic reinstallation.
      reinstall(); // Perform final installation.
    }

    // Set up a periodic check/reinstall in case DOMContentLoaded is missed or content loads dynamically.
    timerId = setInterval(reinstall, 500); // Check every 500 milliseconds.

    // Use DOMContentLoaded for modern browsers, fallback to window.onload for older ones.
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", reinstallAndRemoveTimer, false);
    } else {
      window.onload = reinstallAndRemoveTimer; // Fallback for older IE.
    }
  } // End of install function.

}; // End of asciidoc object definition.