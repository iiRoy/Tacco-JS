// Configuration object for the documentation viewing application.
// This central object holds all customizable settings, UI selectors, and feature flags.
const appConfiguration = {
    // DOM element selectors used throughout the application.
    // These are kept as constants to simplify maintenance and updates.
    domSelectors: {
        mainContentContainer: "#content",
        navigationSidebar: "#sidebar",
        editSourceLink: "#edit",
        backToTopBtn: "#back_to_top",
        loadingSpinner: "#loading",
        errorDisplayArea: "#error",
        codeHighlightBlocks: "#content pre code", // Specific selector for code highlighting
        previousPageNav: "#pageup",
        nextPageNav: "#pagedown",
        scrollProgressMeter: ".progress-indicator-2"
    },

    // Feature toggles to enable or disable parts of the application's functionality.
    applicationFeatures: {
        enableSidebarNavigation: true,
        enableSourceEditButton: true,
        enableScrollToTopButton: true,
        retainReadingProgress: true, // Persist scroll position across page loads
        activateDisqusComments: true
    },

    // General application settings and parameters.
    generalSettings: {
        defaultMarkdownFile: "README.md", // The initial content file to load
        sourceCodeBaseUrl: null, // Base URL for the raw markdown files (e.g., GitHub repo)
        sidebarMarkdownFile: "SIDEBAR.md", // Markdown file to populate the navigation sidebar
        browserDocumentTitlePrefix: "Documentation Portal", // Title for the browser tab
        smoothScrollDurationMs: 250, // Milliseconds for animated scrolling effects
        activeSectionHighlightColor: "#007bff" // Color used to highlight active TOC sections
    },

    // The primary entry point function to start the application.
    bootstrap: initializeDocumentationViewer
};

// Markup for the comments section, to be appended to content.
const commentSectionHtml = '<h3>Discussion</h3><div id="disqus_thread"></div>';
// A dynamic array to store the list of hash-based navigation links from the sidebar.
let pageNavigationLinks = [];

/**
 * Initializes the documentation viewer application.
 * This function sets up core components and event listeners.
 */
function initializeDocumentationViewer() {
    // A crucial guard: ensure jQuery is loaded before proceeding.
    if (typeof jQuery === 'undefined') {
        console.error("Critical Error: jQuery library is not found. Application cannot start.");
        return;
    }

    // Conditionally set up various UI components based on feature flags.
    if (appConfiguration.applicationFeatures.enableSidebarNavigation) {
        setupNavigationSidebar();
    }

    if (appConfiguration.applicationFeatures.enableScrollToTopButton) {
        configureScrollToTopButton();
    }

    if (appConfiguration.applicationFeatures.enableSourceEditButton) {
        configureSourceEditButton();
    }

    // Initialize the page content router and attach it to hash changes.
    handlePageRouting();
    $(window).on('hashchange', handlePageRouting);
}

/**
 * Fetches and renders the content for the navigation sidebar.
 * It also parses the sidebar links to enable page-to-page navigation.
 */
function setupNavigationSidebar() {
    const sidebarFile = appConfiguration.generalSettings.sidebarMarkdownFile;
    $.get(sidebarFile, function(data) {
        const $sidebarElement = $(appConfiguration.domSelectors.navigationSidebar);
        $sidebarElement.html(marked(data)); // Use marked.js to render markdown

        // Extract all 'a' tags within 'li' elements inside an ordered list.
        const $linksInSidebar = $sidebarElement.find('ol li a');
        if ($linksInSidebar.length > 0) {
            pageNavigationLinks = $linksInSidebar.map(function() {
                const linkHref = $(this).attr('href');
                return linkHref ? linkHref.substring(linkHref.indexOf('#')) : '';
            }).get(); // Convert jQuery collection to a standard JavaScript array

            // Attach event handlers for the previous/next page navigation buttons.
            attachPageNavigationControls();
        }
    }, "text").fail(function(jqXHR, textStatus, errorThrown) {
        console.error(`Failed to load sidebar content from "${sidebarFile}": ${textStatus} - ${errorThrown}`);
        $(appConfiguration.domSelectors.navigationSidebar).html('<p class="error-message">Navigation content could not be loaded.</p>');
    });
}

/**
 * Attaches click handlers to the 'previous page' and 'next page' buttons.
 * These buttons navigate through the `pageNavigationLinks` array.
 */
function attachPageNavigationControls() {
    const $prevBtn = $(appConfiguration.domSelectors.previousPageNav);
    const $nextBtn = $(appConfiguration.domSelectors.nextPageNav);

    $prevBtn.on('click', function() {
        const currentHash = location.hash;
        const currentIndex = pageNavigationLinks.indexOf(currentHash);

        if (currentIndex > 0) {
            location.hash = pageNavigationLinks[currentIndex - 1];
        } else if (currentHash === '' && pageNavigationLinks.length > 0) {
            // If on the default page (no hash), navigate to the first item if available.
            location.hash = pageNavigationLinks[0];
        }
    });

    $nextBtn.on('click', function() {
        const currentHash = location.hash;
        const currentIndex = pageNavigationLinks.indexOf(currentHash);

        if (currentIndex < pageNavigationLinks.length - 1) {
            location.hash = pageNavigationLinks[currentIndex + 1];
        } else if (currentHash === '' && pageNavigationLinks.length > 0) {
            // If on the default page (no hash), navigate to the first item.
            location.hash = pageNavigationLinks[0];
        }
    });
}

/**
 * Configures the "Back to Top" button to smoothly scroll the page to the top.
 */
function configureScrollToTopButton() {
    const $button = $(appConfiguration.domSelectors.backToTopBtn);
    $button.fadeIn(300); // Make the button appear smoothly
    $button.on("click", function() {
        $("html, body").animate({
            scrollTop: 0
        }, appConfiguration.generalSettings.smoothScrollDurationMs);
    });
}

/**
 * Sets up the button that allows users to edit the source markdown file
 * of the currently viewed documentation page.
 */
function configureSourceEditButton() {
    const sourceEditBaseUrl = appConfiguration.generalSettings.sourceCodeBaseUrl;
    // Guard clause: if no base URL is provided, the edit feature cannot work.
    if (!sourceEditBaseUrl) {
        console.warn("Configuration Error: 'sourceCodeBaseUrl' is not set. Edit button will be inactive.");
        return;
    }

    const $editButton = $(appConfiguration.domSelectors.editSourceLink);
    $editButton.fadeIn(300); // Display the edit button
    $editButton.on("click", function() {
        let currentPathFragment = location.hash.replace(/^#/, ""); // Remove leading '#'

        // Determine the correct file path to construct the edit URL.
        if (!currentPathFragment) {
            currentPathFragment = appConfiguration.generalSettings.defaultMarkdownFile.replace(/\.md$/, "");
        } else {
            // Ensure the path fragment doesn't start with a slash if the base URL already includes it.
            currentPathFragment = currentPathFragment.startsWith('/') ? currentPathFragment.substring(1) : currentPathFragment;
        }

        const fullSourceEditUrl = `${sourceEditBaseUrl}/${currentPathFragment}.md`;
        window.open(fullSourceEditUrl, '_blank'); // Open the edit link in a new browser tab.
        // Opening in a new tab preserves the user's current reading context.
    });
}

/**
 * Transforms a raw text string into a URL and HTML-safe ID.
 * Replaces non-alphanumeric characters with hyphens and ensures uniqueness.
 * @param {string} inputString The text to be sanitized.
 * @returns {string} A string suitable for use as an HTML ID.
 */
function generateSafeHtmlId(inputString) {
    if (typeof inputString !== 'string' || !inputString.trim()) {
        // Provide a unique fallback ID for invalid or empty inputs.
        return `invalid-id-${Math.random().toString(36).substring(2, 9)}`;
    }
    // Convert to lowercase, replace invalid characters with hyphens,
    // collapse multiple hyphens, and trim leading/trailing hyphens.
    return inputString
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Attaches a click handler to a Table of Contents (TOC) list item.
 * When clicked, it smoothly scrolls to the corresponding header and briefly highlights it.
 * @param {jQuery} $tocListItem The jQuery object representing the TOC list item.
 * @param {string} targetHeaderId The ID of the header element to scroll to.
 */
function connectTocLinkToHeader($tocListItem, targetHeaderId) {
    // Add a class for styling TOC links.
    $tocListItem.addClass("toc-navigation-item");

    $tocListItem.on('click', function() {
        const $targetHeader = $(`#${targetHeaderId}`);
        if ($targetHeader.length === 0) {
            console.warn(`Target header with ID "${targetHeaderId}" not found for TOC link.`);
            return; // Exit if the target header doesn't exist.
        }

        // Animate scrolling to the target header, with a slight offset.
        $('html, body').animate({
            scrollTop: $targetHeader.offset().top - 15 // A small pixel offset for better visibility above the fold.
        }, appConfiguration.generalSettings.smoothScrollDurationMs);

        // Temporarily highlight the header to indicate the active section.
        const originalHeaderColor = $targetHeader.css("color");
        $targetHeader.animate({
            color: appConfiguration.generalSettings.activeSectionHighlightColor,
        }, 400, function() {
            // Revert to the original color after a short delay.
            $(this).delay(1800).animate({
                color: originalHeaderColor
            }, 400);
        });
    });
}

/**
 * Dynamically generates a Table of Contents (TOC) based on the page's headers (H1-H3).
 * It assigns unique IDs to headers and creates interactive links in the TOC.
 */
function generateTableOfContents() {
    const $contentArea = $(appConfiguration.domSelectors.mainContentContainer);
    let $tocListElement = $contentArea.find('.page-table-of-contents');

    // Create the TOC list if it doesn't already exist.
    if ($tocListElement.length === 0) {
        const $firstH1 = $contentArea.find('h1:first');
        if ($firstH1.length > 0) {
            $tocListElement = $('<ol></ol>')
                .addClass("page-table-of-contents")
                .attr('id', 'page-toc-list');
            $firstH1.after($tocListElement); // Insert after the first H1 tag.
        } else {
            // Fallback: prepend to content area if no H1 is found.
            $tocListElement = $('<ol></ol>')
                .addClass("page-table-of-contents")
                .attr('id', 'page-toc-list');
            $contentArea.prepend($tocListElement);
        }
    } else {
        $tocListElement.empty(); // Clear existing TOC if present, for re-generation.
    }


    // Iterate through header levels 1 to 3 to build the TOC.
    for (let level = 1; level <= 3; level++) {
        const $headers = $contentArea.find(`h${level}`);

        if ($headers.length === 0) continue; // Skip if no headers of this level.

        $headers.each(function(index) {
            const $currentHeader = $(this);
            const headerText = $currentHeader.text();
            const safeHeaderId = generateSafeHtmlId(headerText);
            const uniqueHeaderDomId = `header-${level}-${safeHeaderId}`;

            // Assign a unique ID and a class to the actual header element.
            $currentHeader.addClass(`doc-header-level-${level}`).attr('id', uniqueHeaderDomId);

            // For H2 headers, create a corresponding list item in the TOC.
            if (level === 2) {
                const $newTocItem = $('<li></li>').text(headerText);
                $tocListElement.append($newTocItem);
                connectTocLinkToHeader($newTocItem, uniqueHeaderDomId);
            }
        });
    }
}

/**
 * Normalizes relative paths for assets (like images) within the content.
 * This ensures assets load correctly regardless of the current URL hash.
 */
function resolveContentAssetPaths() {
    const currentPathHash = location.hash.replace(/^#/, ""); // Remove leading '#' from hash.
    // Determine the base path for relative assets from the current URL hash.
    const pathSegments = currentPathHash.split('/').slice(0, -1); // Exclude the "filename" part.

    // Process all image elements within the main content area.
    $(appConfiguration.domSelectors.mainContentContainer + " img").each(function() {
        const $imageElement = $(this);
        let imageSource = $imageElement.attr("src");

        // Only process if the source is a relative path.
        if (imageSource && !imageSource.startsWith("http") && !imageSource.startsWith("//") && !imageSource.startsWith("/")) {
            imageSource = imageSource.replace(/^\.\//, ""); // Remove "./" if present.
            const absoluteAssetPath = pathSegments.concat(imageSource).join('/');
            $imageElement.attr("src", absoluteAssetPath);
        }
    });
    // Additional logic could be added here for other asset types (e.g., `<a href="...">`).
}

/**
 * Displays an error message in a designated UI area and logs it to the console.
 * @param {string} [message="An unexpected error occurred."] The error message to display.
 */
function showUserErrorMessage(message = "An unexpected error occurred. Please try again.") {
    console.error(`Application encountered an issue: ${message}`);
    $(appConfiguration.domSelectors.errorDisplayArea).text(message).show();
}

/**
 * Activates and displays a loading indicator, clearing previous content.
 * Returns the `setInterval` ID, allowing the animation to be cleared later.
 * @returns {number} The ID of the `setInterval` animation.
 */
function activateLoadingAnimation() {
    const $loadingIndicator = $(appConfiguration.domSelectors.loadingSpinner);
    const $contentContainer = $(appConfiguration.domSelectors.mainContentContainer);

    $loadingIndicator.show();
    $contentContainer.empty(); // Clear existing content immediately.

    // Start a fading animation for the loading indicator.
    const animationInterval = setInterval(() => {
        $loadingIndicator.fadeIn(700).fadeOut(700);
    }, 1400); // Cycle every 1.4 seconds.

    return animationInterval;
}

/**
 * Main function responsible for handling page content routing.
 * It determines the content file based on the URL hash, fetches it,
 * renders markdown, and performs post-rendering tasks.
 */
function handlePageRouting() {
    // Temporarily detach the scroll progress tracking to avoid conflicts during page load.
    $(window).off('scroll.progressTracking'); // Using a namespaced event.

    let contentFilePath = location.hash.replace(/^#/, ""); // Remove '#' from the hash.

    // Logic to determine the correct markdown file path based on URL.
    if (location.pathname.endsWith("/index.html") && !contentFilePath) {
        contentFilePath = appConfiguration.generalSettings.defaultMarkdownFile;
    } else if (!contentFilePath) {
        contentFilePath = appConfiguration.generalSettings.defaultMarkdownFile;
    } else {
        contentFilePath += ".md"; // Assume hash refers to a markdown file.
    }

    // Handle saving/restoring page progress using `store.js`.
    const currentUrlHash = location.hash;
    const isProgressRetentionEnabled = appConfiguration.applicationFeatures.retainReadingProgress;
    const isLocalStorageAvailable = typeof store !== 'undefined' && store; // Check if store.js is loaded.

    if (isProgressRetentionEnabled && isLocalStorageAvailable) {
        const storedNavHash = store.get('docViewer-nav-hash');
        if (storedNavHash !== currentUrlHash) {
            store.set('docViewer-nav-hash', currentUrlHash);
            store.set('docViewer-page-scroll', 0); // Reset scroll for a new page.
        }
    }

    const loadingAnimationId = activateLoadingAnimation(); // Start loading animation.

    $.get(contentFilePath, function(markdownData) {
        $(appConfiguration.domSelectors.errorDisplayArea).hide(); // Hide any previous error messages.

        // Render markdown and append comments if enabled.
        const pageHtmlContent = marked(markdownData) + (appConfiguration.applicationFeatures.activateDisqusComments ? commentSectionHtml : '');
        $(appConfiguration.domSelectors.mainContentContainer).html(pageHtmlContent);

        // Update the browser tab's title.
        const $pageHeading = $(appConfiguration.domSelectors.mainContentContainer + " h1:first");
        const pageTitleText = $pageHeading.length ? $pageHeading.text() : "Untitled Document";
        document.title = `${pageTitleText} - ${appConfiguration.generalSettings.browserDocumentTitlePrefix}`;

        // Perform post-rendering processing tasks.
        resolveContentAssetPaths();
        generateTableOfContents();
        applyCodeHighlighting();

        if (appConfiguration.applicationFeatures.activateDisqusComments) {
            loadDisqusCommentsSection(currentUrlHash, pageTitleText);
        }

        // Attempt to restore the user's scroll position.
        if (isProgressRetentionEnabled && isLocalStorageAvailable) {
            restoreSavedScrollPosition(currentUrlHash);
        }

        // Update the visibility of the previous/next page navigation buttons.
        updatePageNavigationButtonVisibility(currentUrlHash);

        // Re-attach the scroll event listener for progress tracking.
        setupScrollProgressTracking();

    }).fail(function(xhr, status, error) {
        showUserErrorMessage(`Failed to retrieve content for "${contentFilePath}". Status: ${status}, Error: ${error}`);
    }).always(function() {
        clearInterval(loadingAnimationId); // Stop the loading animation.
        $(appConfiguration.domSelectors.loadingSpinner).hide(); // Ensure spinner is hidden.
    });
}

/**
 * Applies syntax highlighting to code blocks using Prism.js.
 */
function applyCodeHighlighting() {
    $(appConfiguration.domSelectors.codeHighlightBlocks).each(function() {
        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(this);
        } else {
            console.warn("Prism.js library not detected. Code blocks will not be highlighted.");
        }
    });
}

/**
 * Dynamically loads or reloads the Disqus comments section for the current page.
 * @param {string} currentHash The current URL hash (e.g., "#/my-page").
 * @param {string} pageTitle The main title of the current documentation page.
 */
function loadDisqusCommentsSection(currentHash, pageTitle) {
    // Ensure the Disqus shortname is configured globally.
    if (!window.disqus_shortname) {
        console.warn("Disqus shortname (window.disqus_shortname) is not set. Comments feature will not work.");
        return;
    }

    // Set Disqus page-specific variables.
    window.disqus_identifier = currentHash ? currentHash.replace(/^#/, "") : 'home-page';
    window.disqus_title = pageTitle;
    // Construct a canonical URL for Disqus, important for SEO and uniqueness.
    window.disqus_url = window.location.origin + window.location.pathname + currentHash;

    // Check if Disqus script is already loaded.
    if (window.DISQUS) {
        // If already loaded, reset it for the new page content.
        window.DISQUS.reset({
            reload: true,
            config: function() {
                this.page.identifier = window.disqus_identifier;
                this.page.url = window.disqus_url;
                this.page.title = window.disqus_title;
            }
        });
    } else {
        // If not loaded, inject the Disqus embed script.
        const dsqScript = document.createElement('script');
        dsqScript.type = 'text/javascript';
        dsqScript.async = true;
        dsqScript.src = `//${window.disqus_shortname}.disqus.com/embed.js`;
        (document.head || document.body).appendChild(dsqScript);
    }
}

/**
 * Restores the user's scroll position on the page, if previously saved.
 * It checks for a specific hash or a general saved scroll percentage.
 * @param {string} currentHash The current URL hash.
 */
function restoreSavedScrollPosition(currentHash) {
    const savedScrollPercentage = store.get('docViewer-page-scroll') || 0;

    // Only attempt to scroll if there's a hash or a saved percentage.
    if (currentHash || savedScrollPercentage > 0) {
        let targetScrollDestination = 0;
        if (currentHash && !savedScrollPercentage) {
            // If navigating via hash but no specific scroll saved, go to the top of the content.
            targetScrollDestination = $(appConfiguration.domSelectors.mainContentContainer).offset().top;
        } else if (savedScrollPercentage > 0) {
            // If a scroll percentage is saved, calculate the exact pixel position.
            const totalBodyHeight = $('body').height();
            const currentWindowHeight = $(window).height();
            const scrollableRange = totalBodyHeight - currentWindowHeight;
            targetScrollDestination = scrollableRange * savedScrollPercentage;
        }

        if (targetScrollDestination > 0) {
            $('html, body').animate({
                scrollTop: targetScrollDestination
            }, appConfiguration.generalSettings.smoothScrollDurationMs + 50); // Slightly longer animation for restoration.
        }
    }
}

/**
 * Controls the visibility of the 'previous page' and 'next page' navigation buttons.
 * Buttons are hidden if the current page is at the beginning or end of the navigation list.
 * @param {string} currentHash The current URL hash.
 */
function updatePageNavigationButtonVisibility(currentHash) {
    const $prevButton = $(appConfiguration.domSelectors.previousPageNav);
    const $nextButton = $(appConfiguration.domSelectors.nextPageNav);

    // If no navigation links are available, hide both buttons.
    if (pageNavigationLinks.length === 0) {
        $prevButton.hide();
        $nextButton.hide();
        return;
    }

    const currentPageIndex = pageNavigationLinks.indexOf(currentHash);

    // Determine if the current page is at the start or end of the navigation sequence.
    const isFirstPage = (currentPageIndex <= 0 && currentHash === '') || (currentPageIndex === 0 && currentHash !== '');
    const isLastPage = currentPageIndex >= pageNavigationLinks.length - 1;

    // Use jQuery's .toggle() for conditional display.
    $prevButton.toggle(!isFirstPage);
    $nextButton.toggle(!isLastPage);
}

/**
 * Sets up a scroll event listener to continuously track and save the user's
 * reading progress as a percentage of the page scrolled.
 */
function setupScrollProgressTracking() {
    const $windowElement = $(window);
    const $progressIndicator = $(appConfiguration.domSelectors.scrollProgressMeter);

    // Attach a namespaced scroll event to prevent conflicts.
    $windowElement.on('scroll.progressTracking', function() {
        const windowDisplayHeight = $windowElement.height();
        const fullDocumentHeight = $('body').height();
        const totalScrollableHeight = fullDocumentHeight - windowDisplayHeight;

        // Prevent division by zero or negative values for non-scrollable pages.
        if (totalScrollableHeight <= 0) {
            updateProgressBarDisplay(0);
            return;
        }

        const currentScrollTop = $windowElement.scrollTop();
        // Calculate scroll percentage, clamped between 0 and 1.
        const currentScrollPercentage = Math.max(0, Math.min(1, currentScrollTop / totalScrollableHeight));
        updateProgressBarDisplay(currentScrollPercentage);

        // Save the progress if enabled and `store.js` is available.
        if (appConfiguration.applicationFeatures.retainReadingProgress && typeof store !== 'undefined' && store) {
            store.set('docViewer-page-scroll', currentScrollPercentage);
        }
    });

    // Trigger the scroll event once on setup to initialize the progress bar.
    $windowElement.trigger('scroll.progressTracking');
}

/**
 * Updates the visual width of the scroll progress bar based on a percentage.
 * @param {number} percentage The scroll progress as a decimal (0.0 to 1.0).
 */
function updateProgressBarDisplay(percentage) {
    $(appConfiguration.domSelectors.scrollProgressMeter).css({
        width: `${percentage * 100}%`
    });
}

// Ensure the application's bootstrap function runs only after the DOM is fully loaded.
$(document).ready(appConfiguration.bootstrap);