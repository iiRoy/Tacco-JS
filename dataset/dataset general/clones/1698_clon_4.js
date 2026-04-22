const contentProcessor = (() => {
  // Helper to retrieve text content from a DOM element, including its descendants.
  // This replaces the original's recursive getText function by using a standard DOM property.
  const retrieveTextContent = (currentElement) => {
    return currentElement.textContent || '';
  };

  // A class to represent a collected header, replacing the original TocEntry.
  class SectionReference {
    constructor(domElement, sectionLabel, hierarchyLevel) {
      this.element = domElement;
      this.label = sectionLabel;
      this.level = hierarchyLevel;
    }
  }

  // Function to construct the navigation panel (Table of Contents).
  // This replaces the original 'toc' method.
  const assembleNavigationPanel = (maximumLevel) => {
    const navigationContainer = document.querySelector('#navigation-panel'); // New ID for the TOC container
    if (!navigationContainer) {
      return;
    }

    // Clear any existing navigation items efficiently.
    navigationContainer.replaceChildren();

    const mainContentArea = document.querySelector('#main-content'); // New ID for the main content area
    if (!mainContentArea) {
      return;
    }

    // Generate a CSS selector string for all heading levels up to the specified maximum.
    const headingSelectors = Array.from({ length: maximumLevel }, (_, i) => `h${i + 1}`).join(', ');

    // Collect all relevant heading elements using querySelectorAll (functional approach).
    const potentialHeaders = Array.from(mainContentArea.querySelectorAll(headingSelectors))
      .filter(h => !h.classList.contains('ignore-for-navigation')); // New class to exclude headers

    // Process each header to create SectionReference objects.
    const collectedReferences = potentialHeaders.map((headerElement, index) => {
      // Ensure the header has an ID. If not, generate one.
      if (!headerElement.id) {
        const closestSection = headerElement.closest('section'); // Find nearest ancestor section
        if (closestSection && closestSection.id) {
          headerElement.id = closestSection.id; // Use section ID if available
        } else {
          headerElement.id = `content-section-${index + 1}`; // Generate a unique ID
        }
      }
      return new SectionReference(
        headerElement,
        retrieveTextContent(headerElement),
        parseInt(headerElement.tagName.substring(1)) // Extract heading level (e.g., H1 -> 1)
      );
    });

    if (collectedReferences.length === 0) {
      // If no navigation entries, remove the navigation container's parent.
      const parentOfNav = navigationContainer.parentNode;
      if (parentOfNav) {
        parentOfNav.removeChild(navigationContainer);
      }
      return;
    }

    // Build the navigation list items using a DocumentFragment for optimal DOM manipulation.
    const navigationFragment = document.createDocumentFragment();
    collectedReferences.forEach(referenceItem => {
      const listItem = document.createElement('li');
      // listItem.className = `nav-level-${referenceItem.level}`; // Optional class based on level

      const anchorLink = document.createElement('a');
      anchorLink.href = `#${referenceItem.element.id}`;

      const iconElement = document.createElement('span'); // Using span for icon instead of i
      iconElement.className = 'icon-forward-arrow'; // New icon class
      anchorLink.appendChild(iconElement);
      anchorLink.appendChild(document.createTextNode(referenceItem.label));

      listItem.appendChild(anchorLink);
      navigationFragment.appendChild(listItem);
    });

    navigationContainer.appendChild(navigationFragment);
  };

  // Function to handle ancillary notes (footnotes).
  // This replaces the original 'footnotes' method.
  const processAncillaryNotes = () => {
    const notesHolder = document.querySelector('#ancillary-notes'); // New ID for the footnotes container
    if (!notesHolder) {
      return;
    }

    // Clear any existing footnote entries.
    notesHolder.replaceChildren();

    const mainContentArea = document.querySelector('#main-content');
    if (!mainContentArea) {
      return;
    }

    // Use a Map to store mappings from original reference IDs to new footnote numbers.
    const crossReferenceMap = new Map();
    let currentNoteNumber = 0;

    // Collect all elements designated as footnote triggers.
    const triggerSpans = Array.from(mainContentArea.querySelectorAll('span.note-trigger')); // New class for footnote triggers

    // Process each trigger span to extract content and create new references.
    const generatedFootnotes = triggerSpans.map((triggerElement) => {
      currentNoteNumber++;
      let detailContent = triggerElement.getAttribute('data-detail'); // New data attribute for content

      if (!detailContent) {
        // If content is not in data-attribute, extract it from innerHTML using a new regex.
        const contentMatch = triggerElement.innerHTML.match(/\[\s*(.*?)\s*\]/s); // New regex pattern
        if (contentMatch && contentMatch[1]) {
          detailContent = contentMatch[1].trim();
          triggerElement.setAttribute('data-detail', detailContent); // Store for future reloads
        } else {
          detailContent = '';
        }
      }

      const noteIdentifier = `detail-note-${currentNoteNumber}`; // New ID prefix for the actual note
      const backReferenceIdentifier = `detail-ref-${currentNoteNumber}`; // New ID prefix for the return link

      // If the trigger span had an ID, map it to the new footnote number.
      if (triggerElement.id) {
        crossReferenceMap.set(`#${triggerElement.id}`, currentNoteNumber);
      }

      // Modify the original trigger span to include the new reference link.
      const referenceLink = document.createElement('a');
      referenceLink.id = backReferenceIdentifier;
      referenceLink.href = `#${noteIdentifier}`;
      referenceLink.title = 'Access detail note';
      referenceLink.className = 'note-link-ref'; // New class for reference links
      referenceLink.textContent = currentNoteNumber.toString();

      triggerElement.replaceChildren(); // Clear original content
      triggerElement.appendChild(document.createTextNode('['));
      triggerElement.appendChild(referenceLink);
      triggerElement.appendChild(document.createTextNode(']'));

      // Return data needed to construct the actual footnote entry.
      return {
        number: currentNoteNumber,
        content: detailContent,
        noteId: noteIdentifier,
        refId: backReferenceIdentifier
      };
    });

    if (currentNoteNumber === 0) {
      // If no footnotes, remove the notes container's parent.
      const parentOfNotes = notesHolder.parentNode;
      if (parentOfNotes) {
        parentOfNotes.removeChild(notesHolder);
      }
      return;
    }

    // Build the actual footnote entries using a DocumentFragment.
    const notesFragment = document.createDocumentFragment();
    generatedFootnotes.forEach(noteData => {
      const noteEntryDiv = document.createElement('div');
      noteEntryDiv.className = 'ancillary-detail'; // New class for footnote entries
      noteEntryDiv.id = noteData.noteId;

      const returnLink = document.createElement('a');
      returnLink.href = `#${noteData.refId}`;
      returnLink.title = 'Return to context';
      returnLink.textContent = noteData.number.toString();

      noteEntryDiv.appendChild(returnLink);
      noteEntryDiv.appendChild(document.createTextNode('. '));
      noteEntryDiv.appendChild(document.createTextNode(noteData.content));

      notesFragment.appendChild(noteEntryDiv);
    });

    notesHolder.appendChild(notesFragment);

    // Second pass: Process cross-reference anchors (footnoterefs).
    const anchorSpans = Array.from(mainContentArea.querySelectorAll('span.note-anchor')); // New class for cross-reference anchors
    anchorSpans.forEach(anchorElement => {
      const internalLink = anchorElement.querySelector('a');
      if (internalLink) {
        let referenceHref = internalLink.getAttribute('href');
        const hashPosition = referenceHref.indexOf('#');
        if (hashPosition !== -1) {
          referenceHref = referenceHref.substring(hashPosition); // Extract only the hash part
        }

        const linkedNoteNumber = crossReferenceMap.get(referenceHref);
        if (linkedNoteNumber !== undefined) {
          // Update the anchor span with the new link to the generated footnote.
          const newReferenceLink = document.createElement('a');
          newReferenceLink.href = `#detail-note-${linkedNoteNumber}`;
          newReferenceLink.title = 'Access detail note';
          newReferenceLink.className = 'note-link-ref';
          newReferenceLink.textContent = linkedNoteNumber.toString();

          anchorElement.replaceChildren();
          anchorElement.appendChild(document.createTextNode('['));
          anchorElement.appendChild(newReferenceLink);
          anchorElement.appendChild(document.createTextNode(']'));
        }
      }
    });
  };

  // Main function to set up page enhancements when the DOM is ready.
  // This replaces the original 'install' method, using modern event listeners.
  const setupPageElements = (headingDepths) => {
    const executeEnhancements = () => {
      processAncillaryNotes();
      if (headingDepths) {
        assembleNavigationPanel(headingDepths);
      }
    };

    // Check if the DOM is already loaded or is still loading.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', executeEnhancements);
    } else {
      // If DOM is already loaded, execute immediately.
      executeEnhancements();
    }
  };

  // Expose the main setup function.
  return {
    initializeDisplay: setupPageElements
  };
})();