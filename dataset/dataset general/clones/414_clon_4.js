(function() {
  "use strict";

  // --- Utility for DOM element selection, serving as a minimal replacement for jQuery's $ ---
  // This provides functions to select single or multiple elements, returning native DOM elements or an array.
  const querySingleElement = (queryText) => document.querySelector(queryText);
  const queryMultipleElements = (queryText, baseElement = document) => Array.from(baseElement.querySelectorAll(queryText));

  // --- Custom Date Handling (replacing moment.js for specific formats) ---
  // Parses a date string into a Date object based on a given format.
  const extractDateFromText = (dateStringValue, formatSignature) => {
    if (formatSignature === 'YYYY-MM-DD') {
      const components = dateStringValue.split('-');
      if (components.length === 3) {
        const yearNumeric = parseInt(components[0], 10);
        const monthNumeric = parseInt(components[1], 10) - 1; // Month is 0-indexed in Date constructor
        const dayNumeric = parseInt(components[2], 10);
        const generatedDate = new Date(yearNumeric, monthNumeric, dayNumeric);
        // Basic validation to prevent invalid dates from rolling over (e.g., Feb 30th)
        if (generatedDate.getFullYear() === yearNumeric && generatedDate.getMonth() === monthNumeric && generatedDate.getDate() === dayNumeric) {
          return generatedDate;
        }
      }
    }
    return null; // Return null for invalid input or unsupported format
  };

  // Formats a Date object into a string based on a given format.
  const presentDateInFormat = (dateObjectInstance, formatSignature) => {
    if (!(dateObjectInstance instanceof Date) || isNaN(dateObjectInstance.getTime())) {
      return ''; // Return empty string for invalid date objects
    }

    const fullYear = dateObjectInstance.getFullYear();
    const paddedMonth = (dateObjectInstance.getMonth() + 1).toString().padStart(2, '0');
    const paddedDay = dateObjectInstance.getDate().toString().padStart(2, '0');

    if (formatSignature === 'DD/MM/YYYY') {
      return `${paddedDay}/${paddedMonth}/${fullYear}`;
    }
    if (formatSignature === 'YYYY-MM-DD') {
      return `${fullYear}-${paddedMonth}-${paddedDay}`;
    }
    return ''; // Return empty string for unsupported format
  };

  // Compares two Date objects based on their day, month, and year.
  const compareCalendarDays = (firstDate, secondDate) => {
    const dayOnlyFirst = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
    const dayOnlySecond = new Date(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());
    return dayOnlyFirst.getTime() - dayOnlySecond.getTime(); // Returns difference in milliseconds, 0 if same day
  };

  // --- URL Query Parameter Retrieval (replacing original getParameterByName) ---
  // Uses URLSearchParams for a modern and robust way to get query parameters.
  const obtainUrlParameter = (parameterName) => {
    const urlQueryParameters = new URLSearchParams(window.location.search);
    const foundValue = urlQueryParameters.get(parameterName);
    // URLSearchParams.get automatically decodes URI components and handles '+' as spaces.
    return foundValue === null ? '' : foundValue;
  };

  // --- Tab System Management ---
  // Handles the activation of a tab and display of its corresponding content.
  const manageTabActivation = (triggeredTabLink) => {
    const containingDefinitionList = triggeredTabLink.closest('dl');
    if (!containingDefinitionList) return;

    const currentlyEngagedLink = containingDefinitionList.querySelector('a.active');
    if (currentlyEngagedLink) {
      currentlyEngagedLink.classList.remove('active');
    }
    triggeredTabLink.classList.add('active');

    let contentTargetIdentifier = triggeredTabLink.getAttribute("href");
    if (contentTargetIdentifier) {
      // Replicate original logic: append 'Tab' and clean potential URL prefixes.
      contentTargetIdentifier += 'Tab';
      contentTargetIdentifier = contentTargetIdentifier.replace(/^.+#/, '#');

      const contentElementForTab = querySingleElement(contentTargetIdentifier);
      if (contentElementForTab) {
        const contentParentContainer = contentElementForTab.closest('.tabs-content');
        if (contentParentContainer) {
          queryMultipleElements('li', contentParentContainer).forEach(listItem => {
            listItem.style.display = 'none'; // Hide all siblings
          });
        }
        contentElementForTab.style.display = 'block'; // Show the active content
      }
    }
  };

  // --- Input Placeholder Emulation (replacing jQuery.placeholder) ---
  // Provides a basic polyfill for the 'placeholder' attribute for browsers that lack native support.
  const setupInputPlaceholderBehavior = () => {
    // Check for native placeholder support first
    if ('placeholder' in document.createElement('input') && 'placeholder' in document.createElement('textarea')) {
      return; // If supported, no need for polyfill
    }

    queryMultipleElements('input[placeholder], textarea[placeholder]').forEach(inputField => {
      const placeholderContent = inputField.getAttribute('placeholder');

      const applyPlaceholderStyle = () => {
        if (inputField.value === '') {
          inputField.value = placeholderContent;
          inputField.classList.add('placeholder-text-active'); // Add a class for styling
        }
      };

      const removePlaceholderStyle = () => {
        if (inputField.classList.contains('placeholder-text-active')) {
          inputField.value = '';
          inputField.classList.remove('placeholder-text-active');
        }
      };

      inputField.addEventListener('focus', removePlaceholderStyle);
      inputField.addEventListener('blur', applyPlaceholderStyle);

      // Initialize the placeholder state on page load
      applyPlaceholderStyle();
    });
  };

  // --- Custom Tooltip Display (replacing jQuery.tooltips) ---
  // Implements a simple tooltip system for elements with a 'data-hover-info' attribute.
  const initializeHoverInformationDisplays = () => {
    queryMultipleElements('[data-hover-info]').forEach(infoSourceElement => {
      let infoPopupElement = null; // Stores the dynamically created tooltip element

      const displayInfoPopup = (eventMotion) => {
        if (!infoPopupElement) {
          infoPopupElement = document.createElement('div');
          infoPopupElement.textContent = infoSourceElement.getAttribute('data-hover-info');
          Object.assign(infoPopupElement.style, {
            position: 'absolute',
            background: 'var(--tooltip-background, #333)', // Use CSS variables for styling
            color: 'var(--tooltip-foreground, #fff)',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '12px',
            zIndex: '9999',
            pointerEvents: 'none', // Prevent tooltip from blocking mouse events on the source
            opacity: '0',
            transition: 'opacity 0.2s ease-in-out',
            display: 'block'
          });
          document.body.appendChild(infoPopupElement);
        }
        infoPopupElement.style.left = (eventMotion.pageX + 10) + 'px';
        infoPopupElement.style.top = (eventMotion.pageY + 10) + 'px';
        infoPopupElement.style.opacity = '1';
      };

      const hideInfoPopup = () => {
        if (infoPopupElement) {
          infoPopupElement.style.opacity = '0';
          // Delay display: 'none' to allow fade-out transition to complete
          setTimeout(() => {
            if (infoPopupElement) infoPopupElement.style.display = 'none';
          }, 200);
        }
      };

      infoSourceElement.addEventListener('mouseover', displayInfoPopup);
      infoSourceElement.addEventListener('mouseout', hideInfoPopup);
      infoSourceElement.addEventListener('mousemove', displayInfoPopup); // Keep updating position
    });
  };

  // --- Touch Device Detection (replacing Modernizr.touch) ---
  const checkTouchCapability = () => {
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
  };

  // --- Dropdown Navigation Logic ---
  let navigationToggleLock = false; // Prevents rapid toggling during animation

  const configureFlyoutNavigation = () => {
    // Use event delegation for click events on flyout toggles
    document.addEventListener('click', (eventObject) => {
      if (eventObject.target && eventObject.target.matches('.nav-bar a.flyout-toggle')) {
        eventObject.preventDefault();
        const toggleSwitchElement = eventObject.target;
        const linkedFlyoutMenu = toggleSwitchElement.nextElementSibling; // Assuming flyout is immediate sibling

        if (linkedFlyoutMenu && linkedFlyoutMenu.classList.contains('flyout')) {
          if (!navigationToggleLock) {
            // Close other open flyouts
            queryMultipleElements('.nav-bar .flyout').forEach(existingFlyout => {
              if (existingFlyout !== linkedFlyoutMenu && existingFlyout.classList.contains('open-flyout')) {
                existingFlyout.classList.remove('open-flyout');
              }
            });

            linkedFlyoutMenu.classList.toggle('open-flyout'); // Toggle visibility class
            navigationToggleLock = true;
            // Unlock after the CSS transition duration (500ms for slide)
            setTimeout(() => {
              navigationToggleLock = false;
            }, 500);
          }
        }
      }
    });

    // Apply specific styles based on touch capability
    if (checkTouchCapability()) {
      queryMultipleElements('.nav-bar > li.has-flyout > a.main').forEach(primaryLink => {
        primaryLink.style.paddingRight = '75px';
      });
      queryMultipleElements('.nav-bar > li.has-flyout > a.flyout-toggle').forEach(toggleLink => {
        toggleLink.style.borderLeft = '1px dashed #eee';
      });
    } else {
      // Hover behavior for non-touch devices
      queryMultipleElements('.nav-bar > li.has-flyout').forEach(parentItem => {
        let hoverExitTimer;
        parentItem.addEventListener('mouseenter', () => {
          clearTimeout(hoverExitTimer);
          const relatedFlyout = parentItem.querySelector('.flyout');
          if (relatedFlyout) relatedFlyout.classList.add('open-flyout');
        });
        parentItem.addEventListener('mouseleave', () => {
          const relatedFlyout = parentItem.querySelector('.flyout');
          if (relatedFlyout) {
            // Add a small delay for better user experience
            hoverExitTimer = setTimeout(() => relatedFlyout.classList.remove('open-flyout'), 100);
          }
        });
      });
    }
  };

  // --- Main application entry point: executes once the DOM is fully loaded ---
  document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Tab System ---
    queryMultipleElements('dl.tabs').forEach(tabGroupContainer => {
      const tabInteractionLinks = tabGroupContainer.querySelectorAll('dd > a');
      tabInteractionLinks.forEach(individualLink => {
        individualLink.addEventListener('click', (eventObject) => {
          eventObject.preventDefault();
          manageTabActivation(eventObject.currentTarget);
        });
      });
    });

    // Activate a tab if a URL hash is present on page load
    if (window.location.hash) {
      const targetedHashLink = querySingleElement(`a[href="${window.location.hash}"]`);
      if (targetedHashLink) {
        manageTabActivation(targetedHashLink);
        // The original code included: $.foundation.customForms.appendCustomMarkup();
        // This is an external library function specific to Foundation.
        // Replicating its internal behavior is beyond the scope of a Type IV clone
        // and would require knowledge of Foundation's internal implementation.
        // Therefore, this specific call is omitted.
      }
    }

    // --- Configure Alert Box Closure ---
    // Uses event delegation for efficient handling of dynamically added alert boxes.
    document.addEventListener('click', (eventObject) => {
      if (eventObject.target && eventObject.target.matches('.alert-box a.close-button')) { // Using a different class name
        eventObject.preventDefault();
        const containingAlertContainer = eventObject.target.closest('.alert-box');
        if (containingAlertContainer) {
          containingAlertContainer.style.opacity = '0';
          containingAlertContainer.style.transition = 'opacity 0.6s ease-out'; // Simulate fadeOut
          // Remove the element from the DOM after the fade transition completes
          setTimeout(() => {
            containingAlertContainer.remove();
          }, 600);
        }
      }
    });

    // --- Activate Placeholder Polyfill ---
    setupInputPlaceholderBehavior();

    // --- Start Custom Tooltip System ---
    initializeHoverInformationDisplays();

    // --- Setup Dropdown Navigation ---
    configureFlyoutNavigation();

    // --- Process Date Parameter and Display ---
    const dateQueryValue = obtainUrlParameter("date");
    const processedDisplayDate = extractDateFromText(dateQueryValue, "YYYY-MM-DD");
    // If no valid date parameter, default to today's date
    const finalDateToDisplay = processedDisplayDate || new Date();

    const editionDisplayArea = querySingleElement("#edition");
    if (editionDisplayArea) {
      editionDisplayArea.innerHTML = presentDateInFormat(finalDateToDisplay, "DD/MM/YYYY");
    }

    // --- Fetch and Display Octodex Feed (XML) ---
    const octocatFeedSource = "http://feeds.feedburner.com/Octocats?format=xml";
    fetch(octocatFeedSource)
      .then(response => {
        if (!response.ok) throw new Error(`Network response for Octodex was not successful: ${response.status}`);
        return response.text();
      })
      .then(xmlStringData => {
        const xmlDomParser = new DOMParser();
        const xmlDocumentObject = xmlDomParser.parseFromString(xmlStringData, 'text/xml');
        const allOctocatEntries = xmlDocumentObject.querySelectorAll('entry');

        let chosenOctocatItem;
        // Replicating the original code's potential bug: Math.floor(Math.random()*(entries.length + 1))
        // can result in an index equal to entries.length, which is out-of-bounds and yields undefined.
        const selectionIndex = Math.floor(Math.random() * (allOctocatEntries.length + 1));
        chosenOctocatItem = allOctocatEntries[selectionIndex];

        const firstEntryUpdateTimestamp = xmlDocumentObject.querySelector('entry:first-of-type updated');
        if (firstEntryUpdateTimestamp) {
          const firstEntryDayPart = firstEntryUpdateTimestamp.textContent.split("T")[0];
          const firstEntryDateParsed = extractDateFromText(firstEntryDayPart, "YYYY-MM-DD");
          if (firstEntryDateParsed && compareCalendarDays(firstEntryDateParsed, finalDateToDisplay) === 0) {
            chosenOctocatItem = allOctocatEntries[0]; // Select the first entry if dates match
          }
        }

        const octodexTargetElement = querySingleElement("#octodex");
        if (octodexTargetElement) {
          const imageElementInEntry = chosenOctocatItem ? chosenOctocatItem.querySelector('img') : null;
          const imageHtmlSource = imageElementInEntry ? imageElementInEntry.getAttribute('src') : '';
          octodexTargetElement.innerHTML = `<span class='fancy'><img src="${imageHtmlSource}"></span>`;
        }
      })
      .catch(feedError => console.error("Error retrieving Octodex feed:", feedError));

    // --- Fetch and Display Local JSON Data ---
    // IMPORTANT: 'file:///tmp/' URLs are typically blocked by browser security models (CORS)
    // when accessed via 'fetch' from a standard web page. This fetch call will likely fail
    // in most browser environments, mirroring the original's potential behavior in such cases.
    const localJsonDataPath = `file:///tmp/${presentDateInFormat(finalDateToDisplay, "YYYY-MM-DD")}.json`;
    fetch(localJsonDataPath)
      .then(response => {
        if (!response.ok) throw new Error(`JSON fetch failed: ${response.status}`);
        return response.json();
      })
      .then(parsedJsonContent => {
        // Replicate original console.log: if parsedJsonContent is an object, .length will be undefined.
        console.log("data: " + parsedJsonContent.length);

        Object.entries(parsedJsonContent).forEach(([sectionKeyId, repositoryEntries]) => {
          const constructedHtmlParts = [];
          let maximumRepoCount = 0;
          repositoryEntries.forEach(repoData => {
            if (repoData.count > maximumRepoCount) {
              maximumRepoCount = repoData.count;
            }
          });

          repositoryEntries.forEach(repoData => {
            constructedHtmlParts.push("<li class='project'><span class='count black round label' style='padding-left:");
            constructedHtmlParts.push(Math.abs(repoData.count * 50 / (maximumRepoCount || 1))); // Prevent division by zero if max count is 0
            constructedHtmlParts.push("px'>" + repoData.count + "</span>");
            if (repoData.language !== null) {
              constructedHtmlParts.push("<span class='lang black radius label'>" + repoData.language + "</span>");
            }
            constructedHtmlParts.push("<br><a href='http://github.com/" + repoData.owner + "/" + repoData.name + "/'>");
            constructedHtmlParts.push(repoData.owner + "/" + repoData.name + "</a></li>");
          });

          const targetSectionDiv = querySingleElement("#" + sectionKeyId);
          if (targetSectionDiv) {
            targetSectionDiv.innerHTML = constructedHtmlParts.join("");
          }
        });
      })
      .catch(jsonLoadingError => console.error("Error fetching local JSON data:", jsonLoadingError));

  }); // End of DOMContentLoaded event listener
})();