(function(applicationContext) {
  // Main application initialization block
  applicationContext(document).ready(function(queryProxy) {
    // This script manages various interactive UI components and data fetching.

    // --- Dynamic Panel Management (formerly 'Tabs') ---
    // Controls the visibility and active state of content panels.

    /**
     * Activates a specific content panel linked to a navigation element.
     * @param {jQuery} panelTrigger - The jQuery object representing the navigation link/button.
     */
    const activateContentPanel = function(panelTrigger) {
      // Find the currently active trigger within the same navigation group
      let currentActiveTrigger = panelTrigger.closest('dl.panel-nav').find('a.active-trigger');
      // Determine the ID of the content panel to be shown
      let targetPanelIdentifier = panelTrigger.attr("href");

      // Validate the target identifier structure
      if (!targetPanelIdentifier || !targetPanelIdentifier.startsWith('#')) {
        console.warn("Invalid panel target identifier:", targetPanelIdentifier);
        return;
      }

      // Ensure the identifier is clean, handling potential browser URL prefixes
      let cleanedIdentifier = targetPanelIdentifier.replace(/^.+#/, '#');

      // Deactivate the previously active trigger
      if (currentActiveTrigger.length > 0) {
        currentActiveTrigger.removeClass('active-trigger');
      }

      // Activate the new trigger
      panelTrigger.addClass('active-trigger');

      // Update associated content panel visibility
      const contentContainerSelector = '.panel-content-group';
      const allContentItems = queryProxy(cleanedIdentifier).closest(contentContainerSelector).children('li');

      // Hide all siblings and display the target panel
      allContentItems.css('display', 'none'); // Ensure all are hidden first
      queryProxy(cleanedIdentifier).css('display', 'block');

      // Optional: Log the panel activation for debugging
      console.info(`Panel '${cleanedIdentifier}' activated.`);
    };

    // Initialize panel click handlers for navigation lists
    queryProxy('dl.panel-nav').each(function() {
      const navigationLinks = queryProxy(this).children('dd').children('a');
      navigationLinks.on('click', function(evtObject) {
        evtObject.preventDefault(); // Prevent default anchor behavior
        activateContentPanel(queryProxy(this));
      });
    });

    // Handle initial panel activation based on URL hash (deep linking)
    if (window.location.hash) {
      const initialTrigger = queryProxy(`a[href="${window.location.hash}"]`);
      if (initialTrigger.length > 0) {
        activateContentPanel(initialTrigger);
        // Simulate a custom form update if a specific library was available
        if (queryProxy.specialForms && typeof queryProxy.specialForms.refreshMarkup === 'function') {
          queryProxy.specialForms.refreshMarkup();
        } else {
          console.log("No custom form refresh available.");
        }
      } else {
        console.warn("URL hash does not correspond to an existing panel trigger.");
      }
    }


    // --- Notification Dismissal (formerly 'Alert Boxes') ---
    // Manages the closing behavior of dynamic notification elements.

    queryProxy(".notification-box").on("click", "a.dismiss-btn", function(clickEvt) {
      clickEvt.preventDefault();
      const notificationElement = queryProxy(this).closest(".notification-box");

      // Add a temporary class before fading for potential CSS transitions
      notificationElement.addClass('is-fading-out');

      // Fade out and then remove the notification element
      notificationElement.fadeOut(600, function() {
        queryProxy(this).remove();
        console.log("Notification dismissed and removed.");
      });
    });


    // --- Input Field Enhancements (formerly 'Placeholder') ---
    // Applies custom placeholder behavior if a specific plugin is available.

    // Mock function for placeholder behavior if external plugin is missing
    const applyInputPlaceholders = function() {
      if (typeof queryProxy.fn.customPlaceholder === 'function') {
        queryProxy('input[type="text"], textarea').customPlaceholder();
        console.log("Custom placeholders applied to input fields.");
      } else {
        console.warn("Placeholder plugin not found. Using native browser placeholders.");
        // Fallback or custom logic could go here if native placeholders are insufficient
      }
    };
    applyInputPlaceholders();


    // --- Interactive Hover Tips (formerly 'Tooltips') ---
    // Initializes tooltip functionality across the application.

    // Mock function for tooltip behavior
    const initializeHoverTips = function() {
      if (typeof queryProxy.fn.hoverTips === 'function') {
        queryProxy(this).hoverTips(); // 'this' refers to the jQuery object in .ready context
        console.log("Hover tips initialized.");
      } else {
        console.warn("Hover tips plugin not found. Tooltips may not function.");
      }
    };
    initializeHoverTips.call(queryProxy(document.body)); // Ensure 'this' context is appropriate


    // --- Layout Grid Adjustments ---
    // Example of conditional styling for grid layouts (previously commented out).
    // This section demonstrates applying specific CSS for older browser compatibility or layout fixes.
    // For a 'two-column' grid, clear floats for every second item to ensure correct wrapping.
    queryProxy('.layout-grid.two-col > li:nth-child(2n+1)').css({
      'clear': 'left',
      'border-top': '1px solid #eee' // Added a subtle border for visual separation
    });


    // --- Responsive Navigation System (formerly 'Dropdown Nav') ---
    // Manages the behavior of a multi-level navigation bar, including flyouts.

    let navigationLockActive = false; // Flag to prevent rapid re-triggering of animations
    const animationDurationMs = 450; // Milliseconds for animation

    queryProxy('.app-nav-bar a.flyout-toggle-button').on('click', function(e) {
      e.preventDefault(); // Stop default link action
      const relatedFlyout = queryProxy(this).siblings('.nav-flyout-panel');

      // If navigation is not currently locked by an ongoing animation
      if (!navigationLockActive) {
        navigationLockActive = true; // Set lock to prevent new animations

        // Close all other open flyouts in the same navigation bar
        queryProxy('.app-nav-bar .nav-flyout-panel').not(relatedFlyout).slideUp(animationDurationMs);

        // Toggle the target flyout
        relatedFlyout.slideToggle(animationDurationMs, function() {
          navigationLockActive = false; // Release lock when animation completes
          console.log(`Flyout panel visibility toggled for: ${queryProxy(this).attr('id') || 'unidentified'}`);
        });
      } else {
        console.log("Navigation animation is currently locked.");
      }
    });

    // Adapt navigation behavior based on touch device detection
    if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
      // For touch devices, adjust padding for main links with flyouts
      queryProxy('.app-nav-bar > li.has-flyout > a.main-link').css({
        'padding-right': '68px',
        'font-weight': 'bold' // Emphasize main links
      });
      // Add a visual separator for the toggle button on touch
      queryProxy('.app-nav-bar > li.has-flyout > a.flyout-toggle-button').css({
        'border-left': '1px solid #ddd',
        'background-color': '#f9f9f9'
      });
    } else {
      // For non-touch devices, use hover events for flyout visibility
      queryProxy('.app-nav-bar > li.has-flyout').on({
        'mouseenter': function() {
          queryProxy(this).children('.nav-flyout-panel').stop(true, true).fadeIn(250); // Show on hover
        },
        'mouseleave': function() {
          queryProxy(this).children('.nav-flyout-panel').stop(true, true).delay(100).fadeOut(200); // Hide on mouse leave
        }
      });
    }

    // --- Interactive Element State Management (formerly 'Disabled Buttons') ---
    // Provides a mechanism to disable click events for elements with a specific class.
    queryProxy(document).on('click', '.is-disabled', function(e) {
      e.preventDefault(); // Prevent any default action for disabled elements
      e.stopPropagation(); // Stop event bubbling
      console.warn("Attempted interaction with a disabled element.");
      // Could also add visual feedback like a tooltip "This feature is currently unavailable"
    });


    // --- Utility Function: URL Parameter Extraction ---
    /**
     * Retrieves a specific query parameter from the current URL.
     * @param {string} paramKey - The name of the URL parameter to retrieve.
     * @returns {string} The decoded value of the parameter, or an empty string if not found.
     */
    const retrieveUrlParameter = function(paramKey) {
      // Escape special characters in the parameter key for regex safety
      let safeKey = paramKey.replace(/[\[\]]/g, '\\$&');
      // Construct the regular expression pattern
      const regexPattern = new RegExp(`[?&]${safeKey}(=([^&#]*)|&|#|$)`);
      // Execute the regex against the URL's query string
      const matchResults = regexPattern.exec(window.location.search);

      // If no match, return an empty string
      if (!matchResults || !matchResults[2]) {
        return '';
      }

      // Decode the matched component and replace '+' with spaces
      return decodeURIComponent(matchResults[2].replace(/\+/g, ' '));
    };

    // --- Date Display Component ---
    // Uses 'moment.js' to format and display a date from URL parameters.
    const currentPageDate = (typeof moment !== 'undefined') ?
      moment(retrieveUrlParameter("viewDate"), "YYYY-MM-DD") :
      console.error("Moment.js not loaded. Date parsing unavailable.") || null;

    if (currentPageDate && currentPageDate.isValid()) {
      queryProxy("#date-display-area").text(currentPageDate.format("DD/MM/YYYY"));
    } else {
      queryProxy("#date-display-area").text("Date N/A");
    }


    // --- External Data Fetching: GitHub Octocat Showcase ---
    // Fetches XML data from a FeedBurner feed to display a random Octocat image.

    queryProxy.ajax({
      type: "GET",
      url: "https://feeds.feedburner.com/Octocats?format=xml", // Changed to HTTPS
      dataType: "xml",
      success: function(xmlData) {
        let allEntries = queryProxy(xmlData).find('entry');
        if (allEntries.length === 0) {
          queryProxy("#github-showcase").html("<p>No Octocat entries found.</p>");
          console.warn("No Octocat entries received from feed.");
          return;
        }

        // Select a random entry, ensuring valid index
        let selectedShowcaseEntry = allEntries[Math.floor(Math.random() * allEntries.length)];

        // Attempt to find an entry matching the current page date
        const firstEntryUpdate = queryProxy(allEntries[0]).find('updated');
        if (firstEntryUpdate.length > 0 && currentPageDate && currentPageDate.isValid()) {
          const entryDateText = firstEntryUpdate[0].textContent.split("T")[0];
          const entryMoment = moment(entryDateText, "YYYY-MM-DD");
          if (entryMoment.isSame(currentPageDate, 'day')) {
            selectedShowcaseEntry = allEntries[0]; // Prioritize the first entry if dates match
            console.log("Matched Octocat entry for current date.");
          }
        }

        // Extract image source and display it
        const imageSource = queryProxy(selectedShowcaseEntry).find('img').attr('src');
        if (imageSource) {
          queryProxy("#github-showcase").html(`<div class='showcase-item'><img src='${imageSource}' alt='Octocat image'></div>`);
        } else {
          queryProxy("#github-showcase").html("<p>Selected Octocat entry has no image.</p>");
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch Octocat feed:", textStatus, errorThrown);
        queryProxy("#github-showcase").html("<p class='error-msg'>Could not load Octocats. Please try again later.</p>");
      },
      timeout: 5000 // Added a timeout for the request
    });


    // --- Local Data Fetching: Repository Statistics ---
    // Fetches JSON data from a local file to display repository statistics.

    // Construct the local JSON file path based on the current date
    const jsonFilePath = (currentPageDate && currentPageDate.isValid()) ?
      `/local_data/repos_${currentPageDate.format("YYYY-MM-DD")}.json` : // Changed path for better structure
      `/local_data/repos_default.json`; // Fallback for invalid date

    queryProxy.ajax({
      url: jsonFilePath,
      dataType: "json",
      success: function(repoDataCollection) {
        if (!repoDataCollection || Object.keys(repoDataCollection).length === 0) {
          console.warn("No repository data received or data is empty.");
          queryProxy(".repo-stats-section").html("<p>No repository statistics available.</p>");
          return;
        }

        console.log(`Successfully loaded repository data for ${Object.keys(repoDataCollection).length} categories.`);

        // Iterate over each category of repositories (e.g., 'trending', 'popular')
        queryProxy.each(repoDataCollection, function(categoryKey, repoList) {
          let repositoryDisplayItems = [];
          if (!Array.isArray(repoList) || repoList.length === 0) {
            console.warn(`No repositories found for category: ${categoryKey}`);
            queryProxy(`#${categoryKey}-list`).html("<p>No items in this category.</p>");
            return;
          }

          // Find the maximum count within the current category for relative sizing
          const maxCountInList = repoList.reduce((max, current) => Math.max(max, current.count || 0), 0);
          const maxPaddingWidth = 75; // Maximum pixel width for padding

          // Build HTML for each repository in the list
          queryProxy.each(repoList, function(idx, currentRepo) {
            let paddingValue = (maxCountInList > 0) ? Math.floor(Math.abs(currentRepo.count * maxPaddingWidth / maxCountInList)) : 0;
            if (paddingValue < 5) paddingValue = 5; // Minimum padding

            // Using template literals for cleaner HTML generation
            let listItemHtml = `<li class='repository-item'>
                                  <span class='count-badge round-label' style='padding-left:${paddingValue}px;'>${currentRepo.count}</span>`;

            if (currentRepo.language) {
              listItemHtml += `<span class='language-tag radius-label'>${currentRepo.language}</span>`;
            } else {
              listItemHtml += `<span class='language-tag radius-label'>Unknown Lang</span>`; // Default for missing language
            }

            listItemHtml += `<br><a href='https://github.com/${currentRepo.owner}/${currentRepo.name}/' target='_blank' rel='noopener noreferrer'>
                                ${currentRepo.owner}/${currentRepo.name}
                              </a>
                            </li>`;
            repositoryDisplayItems.push(listItemHtml);
          });
          // Append generated HTML to the corresponding category element
          queryProxy(`#${categoryKey}-list`).empty().append(repositoryDisplayItems.join(""));
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load repository data:", textStatus, errorThrown);
        queryProxy(".repo-stats-section").html(`<p class='error-msg'>Error loading repository data: ${textStatus}.</p>`);
      }
    });

  });
}(jQuery)); // Pass jQuery as applicationContext for internal use