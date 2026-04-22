(function($) {
  // Configuration constants for UI elements and animations
  const UI_SETTINGS = {
    SIDEBAR_OPEN_POSITION: "0px",
    SIDEBAR_CLOSED_POSITION: "-320px", // Original width was 320px
    ANIMATION_DURATION_MS: 450, // Slightly different from 400
    NAVBAR_SELECTOR: ".app-sidebar-panel",
    OPEN_BUTTON_SELECTOR: ".ui-control-panel .nav-opener-button",
    CLOSE_BUTTON_SELECTOR: ".ui-control-panel .nav-closer-button",
    TOC_NAV_SELECTOR: "nav.outline-widget[data-widget='outline']",
    TOC_SECTION_ITEM_SELECTOR: "li[data-section='chapter']",
    ACTIVE_SECTION_CLASS: "is-active",
    EXPANDED_CLASS: "is-expanded"
  };

  /**
   * Manages the visibility of the main application sidebar.
   * @param {string} targetPosition - The 'left' CSS property value to animate to.
   */
  function manageSidebarDisplay(targetPosition) {
    const currentSidebar = $(UI_SETTINGS.NAVBAR_SELECTOR);
    // Only animate if the sidebar is not already in the target position
    if (currentSidebar.css("left") !== targetPosition) {
      currentSidebar.stop(true, true).animate(
        { "left": targetPosition },
        UI_SETTINGS.ANIMATION_DURATION_MS
      );
    }
  }

  // Ensure DOM is fully loaded before executing scripts
  $(function() {
    // Event handler for opening the sidebar
    $(UI_SETTINGS.OPEN_BUTTON_SELECTOR).on("click", function() {
      manageSidebarDisplay(UI_SETTINGS.SIDEBAR_OPEN_POSITION);
    });

    // Event handler for closing the sidebar
    $(UI_SETTINGS.CLOSE_BUTTON_SELECTOR).on("click", function() {
      manageSidebarDisplay(UI_SETTINGS.SIDEBAR_CLOSED_POSITION);
    });

    // Event delegation for table of contents section toggling
    $(document).on("click", UI_SETTINGS.TOC_NAV_SELECTOR + " " + UI_SETTINGS.TOC_SECTION_ITEM_SELECTOR, function(evt) {
      // Prevent event from bubbling up if a link inside was clicked
      if ($(evt.target).is('a')) {
          // If a link is clicked, let its default behavior happen, don't toggle section
          return;
      }

      const currentListItem = $(this);
      const nestedList = currentListItem.find('> ol');

      if (nestedList.length) {
        // Use animate for a smoother height transition instead of slideToggle
        nestedList.stop(true, true).animate({
            height: 'toggle',
            opacity: 'toggle'
        }, UI_SETTINGS.ANIMATION_DURATION_MS / 1.5, function() {
            // After animation, ensure display property is correct
            if ($(this).is(':visible')) {
                $(this).css('height', ''); // Remove inline height to allow CSS to control
            }
        });
        currentListItem.toggleClass(UI_SETTINGS.EXPANDED_CLASS);
      }
    });

    // Initialize state for the table of contents based on current page
    const contentSegments = $("section.content-segment[data-segment-id]");
    // Only proceed with TOC initialization if no specific content segment is pre-selected
    if (contentSegments.length === 0) {
      const pageTitleElement = $("main > .page-title");
      if (pageTitleElement.length) {
        const currentChapterTitle = pageTitleElement.text().trim();
        const tocNavigation = $(UI_SETTINGS.TOC_NAV_SELECTOR);

        if (currentChapterTitle && tocNavigation.length) {
          // Find the link corresponding to the current chapter
          const targetLink = tocNavigation.find(`li a:contains("${currentChapterTitle}")`).first();

          if (targetLink.length) {
            const parentList = targetLink.closest('ol');
            const listItem = targetLink.closest('li');
            const sectionItem = targetLink.closest(UI_SETTINGS.TOC_SECTION_ITEM_SELECTOR);

            // Ensure parent list is visible
            if (parentList.length && !parentList.is(':visible')) {
                parentList.stop(true, true).css("display", "block").css("opacity", 1).css("height", ""); // Show instantly
            }

            // Mark the current list item as active
            if (listItem.length) {
              listItem.addClass(UI_SETTINGS.ACTIVE_SECTION_CLASS);
            }

            // Expand the parent section if it's a chapter item
            if (sectionItem.length) {
              sectionItem.addClass(UI_SETTINGS.EXPANDED_CLASS);
              // Ensure its direct child ol is also visible
              const directChildOL = sectionItem.children('ol');
              if (directChildOL.length && !directChildOL.is(':visible')) {
                  directChildOL.stop(true, true).css("display", "block").css("opacity", 1).css("height", "");
              }
            }
          }
        }
      }
    }
  });

  /**
   * Handles keyboard navigation for previous/next page links.
   * @param {string} navElementId - The ID of the container element holding the navigation link.
   */
  function triggerNavigationLink(navElementId) {
    const navContainer = $(`#${navElementId}`);
    if (navContainer.length) {
      // Find the first anchor tag within the container and simulate a click
      const targetLink = navContainer.find('a').first();
      if (targetLink.length) {
        targetLink[0].click(); // Use native click() for direct navigation
      }
    }
  }

  // Global keyboard event listener for page navigation
  document.addEventListener('keydown', function(keyboardEvent) {
    // Ignore key presses if a text input field or textarea is focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
      return;
    }

    // Use event.key for more modern and readable key identification
    switch (keyboardEvent.key) {
      case 'ArrowLeft':
        // Left arrow key pressed: navigate to the previous page
        triggerNavigationLink('prev-doc-link-wrapper');
        keyboardEvent.preventDefault(); // Prevent default browser scroll behavior
        break;
      case 'ArrowRight':
        // Right arrow key pressed: navigate to the next page
        triggerNavigationLink('next-doc-link-wrapper');
        keyboardEvent.preventDefault(); // Prevent default browser scroll behavior
        break;
      default:
        // No relevant key pressed, do nothing
        break;
    }
  });

})(jQuery); // Pass jQuery as an argument for scope encapsulation