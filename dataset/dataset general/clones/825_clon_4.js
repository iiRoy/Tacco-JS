const siteRootPath = '/'; // Assumed global base path, equivalent to original 'site_root'

// Helper to normalize the current browser location path for comparisons
const obtainCurrentLocationPath = (() => {
    let currentPath = window.location.pathname;
    if (currentPath.endsWith('/index.html')) {
        return currentPath.slice(0, -10);
    }
    if (!currentPath.endsWith('/')) {
        return currentPath + '/';
    }
    return currentPath;
})();

// Helper to parse a resource path string into an array of segments
const parseResourceSegments = (resourceIdentifier) => {
    if (!resourceIdentifier || resourceIdentifier === '/') {
        return [];
    }
    return resourceIdentifier.startsWith('/') ?
           resourceIdentifier.substring(1).split('/').filter(Boolean) :
           resourceIdentifier.split('/').filter(Boolean);
};

// Generates an array of <li> elements for the main header navigation
// Equivalent to the original 'build_header_nav' function
function constructMainNavigationItems(pageDataCollection) {
    const mainNavigationElements = pageDataCollection.filter(pageRecord => {
        // Skip items without a label (equivalent to !item.title)
        if (!pageRecord.label) {
            return false;
        }

        const segments = parseResourceSegments(pageRecord.address); // 'address' equivalent to 'path'
        
        // Filter out root '/' and root '/index.html'
        if (segments.length === 0 || (segments.length === 1 && segments[0] === 'index.html')) {
            return false;
        }

        // Filter out paths deeper than top-level sections (e.g., /section/subsection/index.html)
        if (segments.length > 2) {
            return false;
        }

        // Filter out paths like /section/page.html (must be /section/index.html for 2 segments)
        if (segments.length === 2 && segments[1] !== 'index.html') {
            return false;
        }
        
        return true; // Item passes all filters
    }).map(pageRecord => {
        const listItem = document.createElement('li');
        const anchorLink = document.createElement('a');

        const destinationUrl = siteRootPath + pageRecord.address.substring(1);
        anchorLink.href = destinationUrl;
        anchorLink.textContent = pageRecord.displayLabel || pageRecord.label; // 'displayLabel' equivalent to 'short_title'

        // Determine if the link should be 'active'
        const normalizedCurrent = obtainCurrentLocationPath;
        const normalizedDestination = destinationUrl.endsWith('/index.html') ? destinationUrl.slice(0, -10) : (destinationUrl.endsWith('/') ? destinationUrl : destinationUrl + '/');

        if (normalizedCurrent === normalizedDestination) {
            listItem.classList.add('active');
        }

        listItem.appendChild(anchorLink);
        return listItem;
    });
    return mainNavigationElements;
}

// Generates an array of <li> elements for child page links
// Equivalent to the original 'build_child_links' function
function createSubpageNavigationList(pageDataCollection) {
    const currentPathNormalized = obtainCurrentLocationPath;

    const subpageElements = pageDataCollection.filter(pageRecord => {
        // Skip items without a label
        if (!pageRecord.label) {
            return false;
        }

        const fullResourcePath = siteRootPath + pageRecord.address.substring(1);

        // Check if the item's path is a child of the current directory
        if (!fullResourcePath.startsWith(currentPathNormalized)) {
            return false;
        }

        // Extract the path part relative to the current directory
        const relativePathSegmentPart = fullResourcePath.substring(currentPathNormalized.length);
        const relativeSegments = parseResourceSegments(relativePathSegmentPart);

        // Child links must be direct children ending in index.html (e.g., current/child/index.html)
        if (relativeSegments.length !== 2) {
            return false;
        }
        if (relativeSegments[1] !== 'index.html') {
            return false;
        }

        return true; // Item passes all filters
    }).map(pageRecord => {
        const listItem = document.createElement('li');
        const anchorLink = document.createElement('a');

        anchorLink.href = siteRootPath + pageRecord.address.substring(1);
        anchorLink.textContent = pageRecord.displayLabel || pageRecord.label;

        listItem.appendChild(anchorLink);
        return listItem;
    });
    return subpageElements;
}

// Main execution block: fetches data and orchestrates DOM updates
fetch(siteRootPath + 'pages.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
        }
        return response.json();
    })
    .then(allPageData => {
        const primaryNavFragments = constructMainNavigationItems(allPageData);
        const childNavFragments = createSubpageNavigationList(allPageData);

        // Wait for the DOM to be fully loaded before inserting elements
        document.addEventListener('DOMContentLoaded', () => {
            // Insert primary navigation links
            const mainNavContainer = document.querySelector('ul.nav'); // Equivalent to $('ul.nav')
            if (mainNavContainer) {
                mainNavContainer.append(...primaryNavFragments);
            }

            // Find the H2 heading for child pages (equivalent to $('h2:contains(Child pages)'))
            const childPagesTitleElement = Array.from(document.querySelectorAll('h2')).find(
                heading => heading.textContent && heading.textContent.includes('Child pages')
            );

            // Insert child page navigation list after the identified heading
            if (childPagesTitleElement) {
                const childListWrapper = document.createElement('ul');
                childListWrapper.append(...childNavFragments);
                childPagesTitleElement.insertAdjacentElement('afterend', childListWrapper);
            }
        });
    })
    .catch(issue => console.error('Failed to retrieve or process page data:', issue));