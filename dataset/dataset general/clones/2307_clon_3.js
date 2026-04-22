DomUtil(document).ready(function(jq) {
    // Configuration object for application settings
    const appConfig = {
        defaultViewIdentifier: 'main_dashboard',
        contentContainerSelector: '#primary-display-area',
        contentResourceBasePath: '/data/views/',
        contentResourceExtension: '.data',
        navigationLinkSelector: '#app-nav-links a.history-target'
    };

    /**
     * @private
     * Asynchronously loads content into the designated display area based on a given identifier.
     * Includes basic error handling and UI updates.
     * @param {string} viewKey - The unique identifier for the content view to be loaded.
     */
    function displayDynamicContent(viewKey) {
        // Validate the incoming view key
        if (!viewKey || typeof viewKey !== 'string' || viewKey.trim() === '') {
            console.error('Invalid view key provided for content display. Using default.');
            viewKey = appConfig.defaultViewIdentifier; // Fallback to default
        }

        const targetUrl = appConfig.contentResourceBasePath + viewKey + appConfig.contentResourceExtension;
        const targetElement = jq(appConfig.contentContainerSelector);

        // Clear previous content and show a loading indicator (if one existed)
        targetElement.empty().text('Loading content...');

        jq.ajax({
            url: targetUrl,
            method: 'GET',
            dataType: 'html', // Expecting HTML fragments
            cache: false, // Prevent caching for dynamic content
            success: function(payloadData) {
                // Update the DOM with the received content
                targetElement.html(payloadData);
                console.info(`Content for view "${viewKey}" loaded successfully.`);
                // Optional: Trigger a custom event after content is loaded
                jq(document).trigger('contentLoaded', { view: viewKey });
            },
            error: function(xhrObject, statusText, errorThrown) {
                // Display an error message if content loading fails
                targetElement.html(`<p class="error-message">Failed to load content for "${viewKey}". Please try again. (Status: ${statusText})</p>`);
                console.error(`Error loading content for "${viewKey}":`, errorThrown, statusText, xhrObject);
            },
            beforeSend: function() {
                // Optional: Add a CSS class for loading state
                targetElement.addClass('is-loading');
            },
            complete: function() {
                // Optional: Remove the CSS class for loading state
                targetElement.removeClass('is-loading');
            }
        });
    }

    // Initialize the history management plugin
    // This callback is triggered when the page loads or when the browser history state changes.
    jq.history.setup(function(currentPathSegment) {
        // Determine the effective path segment; use default if none is provided (e.g., initial page load)
        const effectivePath = currentPathSegment || appConfig.defaultViewIdentifier;
        displayDynamicContent(effectivePath);
    });

    // Delegate click events for navigation links to update history and content
    // Using 'on' for delegated events ensures new elements matching the selector also work.
    jq(document).on('click', appConfig.navigationLinkSelector, function(eventObject) {
        // Prevent the default link behavior (e.g., navigating away from the page)
        eventObject.preventDefault();
        // Stop event propagation to prevent potential conflicts with other handlers
        eventObject.stopPropagation();

        const currentLinkElement = jq(this);
        const fullHrefAttribute = currentLinkElement.prop('href');

        // Extract the hash segment from the URL
        const hashParts = fullHrefAttribute.split('#');
        let extractedFragmentId = hashParts.length > 1 ? hashParts[1] : null;

        // Basic validation for the extracted fragment
        if (!extractedFragmentId || extractedFragmentId.trim() === '') {
            console.warn('Navigation link has no valid hash fragment. Aborting history update.', currentLinkElement);
            return; // Exit if no valid fragment is found
        }

        // Update the browser's history state and trigger content display
        // The history plugin's 'navigate' method will internally call the 'setup' callback.
        jq.history.navigate(extractedFragmentId);

        // Optional: Add an 'active' class to the clicked link
        jq(appConfig.navigationLinkSelector).removeClass('active-nav-item');
        currentLinkElement.addClass('active-nav-item');
    });
});