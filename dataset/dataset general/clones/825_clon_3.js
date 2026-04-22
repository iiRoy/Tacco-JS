/**
 * This script is responsible for dynamically generating and inserting navigation elements
 * into a web page based on a JSON data source, typically representing site structure or content.
 * It handles the primary header navigation and a section for child/sub-page links.
 *
 * All functions rely on jQuery for DOM manipulation and AJAX requests.
 */

/**
 * Orchestrates the assembly and insertion of the main navigation links into the page header.
 * This function processes page metadata to identify top-level navigation entries.
 * @param {Array<Object>} pageMetadata - An array of page data objects, typically from a site manifest.
 */
function assemblePrimaryNavigation(pageMetadata) {
    // Input validation: Ensure we have data to work with.
    if (!pageMetadata || pageMetadata.length === 0) {
        console.warn("No content entries provided for primary navigation assembly.");
        return;
    }

    const currentBrowserPath = window.location.pathname;
    const siteBaseUrl = window.site_root || '/'; // Assuming site_root is global, or default to '/'

    // Prepare an array to hold the HTML strings for valid navigation items.
    const navigationElements = pageMetadata.reduce((accumulator, pageDetails) => {
        // Skip entries that lack a valid title, indicating they might be metadata or placeholders.
        if (!pageDetails.title || !pageDetails.path) {
            return accumulator;
        }

        // Normalize the page path by removing the leading slash and splitting it into components.
        // Example: "/about/index.html" becomes ["about", "index.html"]
        const pathSegments = pageDetails.path.replace(/^\//, '').split('/');

        // Filter for top-level navigation:
        // - Must have 1 or 2 path segments.
        // - If 2 segments, the second must be "index.html".
        // - Exclude the root "index.html" itself from the main nav.
        if (pathSegments.length === 0 || pathSegments[0] === "" || pathSegments[0] === "index.html") {
             // This covers the root index.html and malformed paths
            return accumulator;
        }
        if (pathSegments.length > 2) {
            return accumulator; // Sub-sub-pages are not considered top-level for this navigation
        }
        if (pathSegments.length === 2 && pathSegments[1] !== "index.html") {
            return accumulator; // Only index.html allowed as second segment for top-level
        }

        // Construct the full URL for the navigation link.
        const targetUrl = siteBaseUrl + pathSegments.join('/');

        // Determine if this navigation item corresponds to the current page.
        // An 'active' class is added for styling, handling various URL forms.
        let isActivePage = '';
        const currentPathNormalized = currentBrowserPath.endsWith('/') ? currentBrowserPath : currentBrowserPath + '/';
        const targetUrlNormalized = targetUrl.endsWith('/') ? targetUrl : targetUrl + '/';

        if (currentPathNormalized === targetUrlNormalized || // Exact match, e.g., /about/
            (currentBrowserPath.endsWith('/index.html') && currentBrowserPath.slice(0, -10) + pathSegments.join('/') === targetUrl) || // /foo/index.html vs /foo
            (currentBrowserPath === targetUrl)) { // Direct match without trailing slash normalization
            isActivePage = 'active';
        }

        // Use short_title if available, otherwise fallback to title.
        const displayLabel = pageDetails.short_title || pageDetails.title;

        // Construct the list item HTML using a template literal.
        const listItemHtml = `<li class="${isActivePage}"><a href="${targetUrl}">${displayLabel}</a></li>`;
        accumulator.push(listItemHtml);
        return accumulator;
    }, []); // Initialize accumulator as an empty array.

    // Join all constructed list items into a single string.
    const finalNavigationHtml = navigationElements.join('');

    // Ensure the DOM is ready before attempting to append elements.
    jQuery(document).ready(() => {
        // Find the designated navigation list and append the new items.
        const navContainer = jQuery('ul.main-app-nav'); // Changed selector from 'ul.nav'
        if (navContainer.length) {
            navContainer.append(finalNavigationHtml);
        } else {
            console.warn("Main navigation container (ul.main-app-nav) not found in the DOM. Primary navigation not inserted.");
        }
    });
}

/**
 * Compares two objects based on their 'lastModification' timestamp for sorting purposes.
 * Sorts in descending order (most recent first).
 * @param {Object} itemA - The first object with a 'lastModification' property.
 * @param {Object} itemB - The second object with a 'lastModification' property.
 * @returns {number} A negative value if itemA is newer, positive if itemB is newer, zero if equal.
 */
function sortByLastUpdate(itemA, itemB) {
    // Add null/undefined checks for robustness, defaulting to 0 for missing dates.
    const dateA = itemA?.lastModification || 0;
    const dateB = itemB?.lastModification || 0;
    return dateB - dateA; // Sorts in descending order (most recent first)
}

/**
 * Placeholder function for constructing a hierarchical tree structure from page data.
 * Currently, it only logs a message and performs a minimal loop.
 * @param {Array<Object>} resourceData - An array of page data objects.
 */
function constructSiteHierarchy(resourceData) {
    // This function is intended for building a complex data structure representing the site map.
    // For now, it serves as a placeholder to acknowledge its future implementation.
    console.info("Site hierarchy construction initiated with", resourceData.length, "items. (Functionality pending)");

    // Example of a minimal, non-functional processing loop to show some activity.
    resourceData.forEach(entry => {
        if (entry.identifier) {
            // In a full implementation, this would involve building parent-child relationships.
            // console.log(`Acknowledging entry: ${entry.identifier}`);
        }
    });
}

/**
 * Generates and inserts a simple sitemap section into the document.
 * This version is a basic placeholder, indicating where a full sitemap would go.
 * @param {Array<Object>} contentRecords - An array of page data objects.
 */
function generateSitemapSection(contentRecords) {
    const sitemapTarget = jQuery('#application-sitemap'); // Changed ID from '#sitemap'
    if (!sitemapTarget.length) {
        console.info("Sitemap target element (#application-sitemap) not found, skipping sitemap generation.");
        return;
    }
    // A more complex implementation would iterate through contentRecords
    // and build a nested list structure here, possibly filtered or grouped.
    sitemapTarget.append('<p class="sitemap-placeholder">Sitemap generation is a future enhancement.</p>');
    console.log(`Sitemap section placeholder added for ${contentRecords.length} content records.`);
}

/**
 * Creates and appends navigation links for direct child pages relative to the current location.
 * @param {Array<Object>} inputDataSet - An array of page data objects from the site manifest.
 */
function populateSubpageNavigation(inputDataSet) {
    // Validate input data.
    if (!inputDataSet || inputDataSet.length === 0) {
        console.warn("No input data provided for subpage navigation.");
        return;
    }

    const currentPath = window.location.pathname;
    const baseSiteRoot = window.site_root || '/'; // Ensure base site root is available

    // Determine the directory path of the current page for comparison.
    // e.g., "/docs/api/index.html" -> "/docs/api/"
    // e.g., "/docs/api/" -> "/docs/api/"
    let currentDirPath = currentPath;
    if (currentDirPath.endsWith('index.html')) {
        currentDirPath = currentDirPath.substring(0, currentDirPath.lastIndexOf('/') + 1);
    } else if (!currentDirPath.endsWith('/')) {
        currentDirPath += '/'; // Ensure it ends with a slash for consistent comparison
    }

    // Filter and map content items to generate child navigation links.
    const childNavItems = inputDataSet.filter(itemRecord => {
        // Skip records without a title or path, indicating invalid data.
        if (!itemRecord.title || !itemRecord.path) {
            return false;
        }

        // Construct the full path for the item, ensuring consistent leading slash handling.
        const fullItemPath = baseSiteRoot + itemRecord.path.replace(/^\//, '');

        // Check if the item's path starts with the current directory path.
        if (!fullItemPath.startsWith(currentDirPath)) {
            return false;
        }

        // Calculate the relative path from the current directory.
        const relativePath = fullItemPath.substring(currentDirPath.length);
        const segments = relativePath.split('/').filter(s => s !== ''); // Remove any empty segments

        // A direct child should have 1 or 2 segments (e.g., "child/" or "child/index.html").
        // We only want direct sub-directories or index files within direct sub-directories.
        return segments.length === 1 || (segments.length === 2 && segments[1] === 'index.html');

    }).map(validItem => {
        // Use the short title if available, otherwise the full title.
        const label = validItem.short_title || validItem.title;
        const linkHref = baseSiteRoot + validItem.path.replace(/^\//, ''); // Ensure no double leading slash
        return `<li><a href="${linkHref}">${label}</a></li>`;
    });

    // If no child items are found, there's nothing to append.
    if (childNavItems.length === 0) {
        return;
    }

    // Wrap the generated list items in an unordered list.
    const childNavHtml = `<ul>${childNavItems.join('')}</ul>`;

    // Wait for the document to be fully loaded before modifying the DOM.
    jQuery(document).ready(() => {
        const targetHeading = jQuery('h3:contains("Related Content")'); // Changed selector from 'h2:contains(Child pages)'
        if (targetHeading.length) {
            targetHeading.after(childNavHtml); // Insert the navigation after the heading.
        } else {
            console.info("Target heading 'Related Content' for subpage navigation not found. Child links not inserted.");
            // Optionally, append to a default element if the specific heading is missing.
            // jQuery('#sidebar-nav-container').append(childNavHtml);
        }
    });
}


// Initiate data fetching and processing once the DOM is ready (or immediately if jQuery is loaded).
jQuery.getJSON(window.site_root + 'manifest.json') // Changed 'pages.json' to 'manifest.json'
    .done(function(retrievedData) {
        // Pass the same data to multiple processing functions.
        assemblePrimaryNavigation(retrievedData);
        populateSubpageNavigation(retrievedData);
        constructSiteHierarchy(retrievedData); // Added this call to a placeholder function
        // generateSitemapSection(retrievedData); // This function remains commented out, similar to original intent
    })
    .fail(function(jqxhr, textStatus, error) {
        // Add a failure handler for robustness and user feedback.
        const errorMessage = `Request failed: ${textStatus}, ${error}`;
        console.error("Error fetching site manifest:", errorMessage);
        // Optionally, display a user-friendly message on the page if the manifest fails to load.
        // jQuery('#main-content').prepend(`<div class="alert alert-danger">Failed to load site navigation data. Please try again later.</div>`);
    });