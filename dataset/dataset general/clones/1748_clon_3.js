const DocProcessor = {
  // Mimics Flatdoc.file for fetching content.
  fromLocalFile: function(sourcePath) {
    return {
      contentType: 'markdown_file',
      location: sourcePath
    };
  },
  // Simulates Flatdoc.run to initiate the document processing pipeline.
  executePipeline: function(processingOptions) {
    console.info(`Document processor: Starting content pipeline for ${processingOptions.sourceProvider.location}`);
    // In a live Flatdoc setup, this would render the content.
    // Here, we simulate the 'ready' event after a short delay.
    $(document).ready(function() {
      setTimeout(() => {
        $(window.document).trigger('doc_content_rendered');
      }, 75); // A slight delay to mimic async rendering
    });
  },
  // Generates a URL-friendly slug from a given text string.
  slugifyIdentifier: function(inputTxt) {
    if (typeof inputTxt !== 'string' || inputTxt.trim() === '') {
      return 'unnamed-section';
    }
    return inputTxt
      .toString()
      .normalize('NFD') // Normalize Unicode characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
      .replace(/--+/g, '-'); // Replace multiple hyphens with a single one
  }
};

DocProcessor.executePipeline({
  sourceProvider: DocProcessor.fromLocalFile('index.md')
});


$(window.document).on('doc_content_rendered', function pageInitializationSequence() {
  // Execute a series of post-rendering adjustments to the DOM.
  adjustSectionTitles();
  normalizeNavigationIds();
  groupContentBlocks();
  wrapEmbedsInContainers();
  loadApplicationConfiguration();
});

/*
 * This routine refines header elements (H1, H2) that utilize images as their primary content,
 * ensuring their IDs and associated navigation links are correctly established based on image alt text.
 * It addresses a common rendering quirk where image-based headers might not initially possess proper identifiers.
 */
function adjustSectionTitles() {
  const ID_ATTRIBUTE_NAME = 'id';
  const HREF_ATTRIBUTE_NAME = 'href';
  const EMPTY_STR = '';

  // Process top-level headers (H1)
  $('h1').each(function(idx, currentH1Element) {
    const $currentH1 = $(currentH1Element);
    const headerTextContent = $currentH1.text().trim();

    // Only proceed if header text is empty, implying an image-based title
    if (headerTextContent.length === 0) {
      const imageAltAttribute = $currentH1.children('img').first().attr('alt') || EMPTY_STR;
      if (!imageAltAttribute) {
        console.warn('H1 header with empty text has no alt attribute on its image, skipping ID adjustment.');
        return; // Skip if no alt text available
      }

      const generatedSectionId = DocProcessor.slugifyIdentifier(imageAltAttribute);
      const rootNavigationItemSelector = `li#root-item.level-1`; // Original value 'root'
      const rootNavigationItem = $(rootNavigationItemSelector).eq(0);
      const rootSubordinateList = rootNavigationItem.children('ul#root-list.level-2');

      // Update IDs of navigation elements
      const oldRootIdFragment = 'root';
      if (rootNavigationItem.length) {
        const updatedRootId = rootNavigationItem.attr(ID_ATTRIBUTE_NAME).replace(oldRootIdFragment, generatedSectionId);
        rootNavigationItem.attr(ID_ATTRIBUTE_NAME, updatedRootId);
      }
      if (rootSubordinateList.length) {
        rootSubordinateList.attr(ID_ATTRIBUTE_NAME, rootSubordinateList.attr(ID_ATTRIBUTE_NAME).replace(oldRootIdFragment, generatedSectionId));
      }

      // Prepend a new anchor link to the navigation item
      const navLinkHtml = `<a ${ID_ATTRIBUTE_NAME}="${generatedSectionId}-link" class="level-1" ${HREF_ATTRIBUTE_NAME}="#${generatedSectionId}">${imageAltAttribute}</a>`;
      rootNavigationItem.prepend($(navLinkHtml));

      // Set the ID for the actual H1 element
      $currentH1.attr(ID_ATTRIBUTE_NAME, generatedSectionId);
    }
  });

  // Process sub-level headers (H2)
  $('h2').each(function(idx, currentH2Element) {
    const $currentH2 = $(currentH2Element);
    const h2TextContent = $currentH2.text().trim();

    if (h2TextContent === EMPTY_STR) {
      const h2ImageAlt = $currentH2.children('img').first().attr('alt') || EMPTY_STR;
      if (!h2ImageAlt) {
        console.warn('H2 header with empty text has no alt attribute on its image, skipping ID adjustment.');
        return; // Must have alt text
      }

      const uniqueSectionSlug = DocProcessor.slugifyIdentifier(h2ImageAlt);
      const idPrefixCharacter = '-'; // Original value '-'
      const targetNavigationItemSelector = `li#--item.level-2`; // Original value '--item'
      const targetNavigationItem = $(targetNavigationItemSelector).eq(0);

      if (!targetNavigationItem.length) {
        console.warn(`Target navigation item not found for H2 with alt "${h2ImageAlt}", skipping.`);
        return;
      }

      // Construct new ID fragment
      const newIdComponent = idPrefixCharacter + uniqueSectionSlug;
      const currentItemId = targetNavigationItem.attr(ID_ATTRIBUTE_NAME);

      // Update the navigation item's ID
      targetNavigationItem.attr(ID_ATTRIBUTE_NAME, currentItemId.replace(idPrefixCharacter, newIdComponent));

      // Iterate through all descendants of the navigation item to update their IDs and hrefs
      targetNavigationItem.find('*').each(function(childIdx, navChildElement) {
        const $navChild = $(navChildElement);
        const childCurrentId = $navChild.attr(ID_ATTRIBUTE_NAME);
        if (childCurrentId && childCurrentId.includes(idPrefixCharacter)) {
          $navChild.attr(ID_ATTRIBUTE_NAME, childCurrentId.replace(idPrefixCharacter, newIdComponent));
        }

        const childCurrentLink = $navChild.attr(HREF_ATTRIBUTE_NAME);
        if (childCurrentLink && typeof childCurrentLink === 'string' && childCurrentLink !== false) {
          if (childCurrentLink.includes(idPrefixCharacter)) {
            $navChild.attr(HREF_ATTRIBUTE_NAME, childCurrentLink.replace(idPrefixCharacter, newIdComponent));
          }

          // Additional fix for potentially malformed IDs within other elements
          $(`[${ID_ATTRIBUTE_NAME}*="${idPrefixCharacter}${idPrefixCharacter}"]`).attr(ID_ATTRIBUTE_NAME, function(i, oldVal) {
            return oldVal.replace(idPrefixCharacter, newIdComponent);
          });
        }
      });

      // Insert a new anchor link for the H2 into the navigation
      const h2NavLink = `<a ${ID_ATTRIBUTE_NAME}="${idPrefixCharacter}${uniqueSectionSlug}-link" class="level-2" ${HREF_ATTRIBUTE_NAME}="#${idPrefixCharacter}${uniqueSectionSlug}">${h2ImageAlt}</a>`;
      targetNavigationItem.prepend($(h2NavLink));

      // Set the ID for the actual H2 element
      $currentH2.attr(ID_ATTRIBUTE_NAME, newIdComponent);
    }
  });
}

/*
 * This function processes navigation list items and links to ensure their IDs and
 * href attributes are consistently structured. It primarily addresses cases where
 * IDs might be missing a prefix derived from a parent element, thereby 'normalizing' them.
 */
function normalizeNavigationIds() {
  const ID_ATTR_KEY = 'id';
  const HREF_ATTR_KEY = 'href';
  let parentSectionIdentifier = ''; // Renamed 'slug'
  const navigationTargets = $('#root-list ul, #root-list li, #root-list a');

  navigationTargets.each(function(idx, navElement) {
    const $navElement = $(navElement);
    const currentElementId = $navElement.attr(ID_ATTR_KEY);

    // Skip if the element has no ID or it's empty
    if (!currentElementId || currentElementId.length === 0) {
      return;
    }

    // Determine if it's a top-level item or a sub-item requiring prefixing
    if (!currentElementId.startsWith('-')) {
      // This is likely a parent item, capture its identifier (excluding '-link' suffix)
      parentSectionIdentifier = currentElementId.slice(0, -5);
    } else {
      // This is a sub-item, prepend the parent identifier to its ID
      $navElement.attr(ID_ATTR_KEY, `${parentSectionIdentifier}${currentElementId}`);

      // Also update the href attribute if it exists and is valid
      const elementHrefValue = $navElement.attr(HREF_ATTR_KEY);
      if (elementHrefValue && typeof elementHrefValue === 'string' && elementHrefValue !== false) {
        // Replace the initial '#' with '#{parentSectionIdentifier}'
        $navElement.attr(HREF_ATTR_KEY, elementHrefValue.replace('#', `#${parentSectionIdentifier}`));
      }
    }
  });
}

/*
 * This function organizes content sections by wrapping elements following H2 headers
 * into a distinct DIV, facilitating easier CSS styling and layout management.
 * It also ensures that H2 and H3 elements inherit a base ID from their preceding H1.
 */
function groupContentBlocks() {
  let currentHeader1BaseId = ''; // Renamed 'h1Div'
  const IDENTIFIER_PROP = 'id'; // Renamed 'key'
  const allContentHeaders = $('.content h1, .content h2, .content h3');

  allContentHeaders.each(function(idx, sectionHeaderElement) {
    const $currentSectionHeader = $(sectionHeaderElement);
    const headerElementId = $currentSectionHeader.attr(IDENTIFIER_PROP);

    if (!headerElementId) { // Guard clause: skip if no ID
      return;
    }

    if ($currentSectionHeader.is('h1')) {
      // If it's an H1, capture its ID as the base for subsequent headers
      currentHeader1BaseId = headerElementId;
    } else if ($currentSectionHeader.is('h2')) {
      // For H2, wrap subsequent elements until another H1 or H2 is encountered
      // The wrapper div's ID is derived from the H2's ID, removing the initial '-'
      const wrapperDivId = headerElementId.substring(1);
      $currentSectionHeader.nextUntil('h1, h2').addBack().wrapAll(`<div ${IDENTIFIER_PROP}="${wrapperDivId}"/>`);

      // Prepend the current H1's ID to the H2's own ID
      $currentSectionHeader.attr(IDENTIFIER_PROP, `${currentHeader1BaseId}${headerElementId}`);
    } else if ($currentSectionHeader.is('h3')) {
      // For H3, just prepend the current H1's ID to its own ID
      $currentSectionHeader.attr(IDENTIFIER_PROP, `${currentHeader1BaseId}${headerElementId}`);
    }
  });
}

/*
 * Encapsulates all IFRAME elements within a dedicated container DIV.
 * This is crucial for responsive design, allowing for proper scaling and aspect ratio management via CSS.
 */
function wrapEmbedsInContainers() {
  const mediaFrameWrapperClass = 'responsive-media-frame'; // New class name

  // Check if any iframes exist before iterating to optimize.
  const iframesInDocument = $('iframe');
  if (iframesInDocument.length === 0) {
    // console.log("No iframe elements found to wrap; skipping function execution.");
    return; // Early exit if no iframes are present.
  }

  iframesInDocument.each(function(idx, iframeElement) {
    $(iframeElement).wrap(`<div class="${mediaFrameWrapperClass}"/>`);
  });
}

/*
 * Retrieves application configuration from an external JSON file.
 * This includes dynamic page title, header navigation links, layout settings,
 * and optional integration of Google Analytics tracking.
 */
function loadApplicationConfiguration() {
  const CONFIG_SOURCE_URL = 'config.json';

  $.ajax({
    url: CONFIG_SOURCE_URL,
    dataType: 'json',
    method: 'GET',
    success: function(applicationSettings) { // Renamed 'json' to 'applicationSettings'
      if (!applicationSettings || $.isEmptyObject(applicationSettings)) {
        console.warn("Application configuration file loaded but is empty or malformed.");
        return;
      }

      // Process header and navigation links based on config
      updatePageMetadataAndNav(applicationSettings.title, applicationSettings.largeLinks, applicationSettings.projectLinks);

      // Apply responsive layout classes based on configuration
      applyResponsiveLayout(applicationSettings.layout);

      // Initialize Google Analytics if a tracking ID is provided and valid
      const gaTrackingCode = applicationSettings.googleAnalytics;
      if (typeof gaTrackingCode === 'string' && gaTrackingCode.trim().length > 0) {
        // Using a template literal for cleaner script insertion
        const gaSnippet = `
          (function() {
            var _gaq = [["_setAccount", "${gaTrackingCode}"], ["_trackPageview"]];
            var doc = document, tag = "script", g = doc.createElement(tag), s = doc.getElementsByTagName(tag)[0];
            g.src = ("https:" === location.protocol ? "//ssl" : "//www") + ".google-analytics.com/ga.js";
            s.parentNode.insertBefore(g, s);
          })();
        `;
        // Create and append the script element to the head
        $('<script>').text(gaSnippet).appendTo('head');
      }
    },
    error: function(xhr, status, error) {
      console.error(`Failed to load application configuration from ${CONFIG_SOURCE_URL}: ${status}, ${error}`);
    }
  });
}

/*
 * Dynamically updates the document's title and constructs header navigation links
 * based on provided configuration data. It supports both prominent 'large' links
 * and standard 'project' links.
 */
function updatePageMetadataAndNav(docTitle, primaryNavItems, secondaryNavItems) { // Renamed params
  if (typeof docTitle === 'string' && docTitle.trim().length > 0) {
    $(document.title).text(docTitle); // More explicit selector for title tag
  }

  const hasPrimaryNavigation = primaryNavItems && !$.isEmptyObject(primaryNavItems);
  const hasSecondaryNavigation = secondaryNavItems && !$.isEmptyObject(secondaryNavItems);

  if (!hasPrimaryNavigation && !hasSecondaryNavigation) {
    return; // No navigation items to render, exit early
  }

  // Create the header structure and insert it before the content root
  const headerWrapper = $('<div class="page-header-area"><div class="header-nav-left"><ul></ul></div></div>'); // New class names
  $('.content-root').before(headerWrapper);

  const navigationListElement = headerWrapper.find('.header-nav-left ul');

  // Add primary navigation links (with H1 styling)
  if (hasPrimaryNavigation) {
    $.each(primaryNavItems, function(indexVal, linkData) { // Renamed 'data' to 'linkData'
      if (linkData.link && linkData.name) {
        navigationListElement.append(`<li><a href="${linkData.link}"><h1>${linkData.name}</h1></a></li>`);
      }
    });
  }

  // Add secondary navigation links
  if (hasSecondaryNavigation) {
    $.each(secondaryNavItems, function(indexVal, linkData) {
      if (linkData.link && linkData.name) {
        navigationListElement.append(`<li><a href="${linkData.link}">${linkData.name}</a></li>`);
      }
    });
  }
}

/*
 * Applies Bootstrap-specific CSS classes to various page elements,
 * structuring the layout into a responsive grid system. This includes
 * navigation bars, sidebars, main content areas, and dynamic column sizing
 * based on configured width percentages for content blocks.
 */
function applyResponsiveLayout(layoutConfiguration) { // Renamed 'json' to 'layoutConfiguration'
  const ID_PROPERTY = 'id'; // Renamed 'key'

  // Apply base Bootstrap classes to main structural elements
  $('.page-header-area').addClass('navbar navbar-expand-lg navbar-light bg-light static-top'); // Updated classes
  $('.content-root').addClass('container-fluid py-3'); // Added vertical padding
  $('.menubar').addClass('col-lg-3 col-md-4 col-sm-12 sidebar-menu'); // Adjusted breakpoints and class
  $('.menubar ul').first().addClass('nav flex-column nav-pills'); // Updated nav classes

  $('.content').addClass('col-lg-9 col-md-8 col-sm-12 main-content-area'); // Adjusted breakpoints and class
  $('.content h1').first().addClass('display-4 mb-4'); // Changed H1 styling

  // Dynamic column sizing for content divs based on configuration
  $('.content div').each(function(idx, contentBlockDiv) {
    const $currentContentDiv = $(contentBlockDiv);
    const divIdentificationString = $currentContentDiv.attr(ID_PROPERTY);

    if (!divIdentificationString) { // Guard: skip if no ID
      return;
    }

    // Helper function to check if an ID matches any value in a config array
    const doesIdMatchConfig = (configArray) => {
      if (!configArray || !Array.isArray(configArray) || configArray.length === 0) {
        return false;
      }
      return configArray.some(val => divIdentificationString.includes(val)); // Using Array.prototype.some
    };

    if (layoutConfiguration && typeof layoutConfiguration === 'object') {
      if (doesIdMatchConfig(layoutConfiguration['40_percent_width_blocks'])) { // Renamed keys
        $currentContentDiv.addClass('col-md-4');
      } else if (doesIdMatchConfig(layoutConfiguration['50_percent_width_items'])) {
        $currentContentDiv.addClass('col-md-6');
      } else if (doesIdMatchConfig(layoutConfiguration['60_percent_width_sections'])) {
        // No class directly applied here; it's used for the subsequent wrapping logic.
      } else {
        $currentContentDiv.addClass('col-md-12'); // Default to full width if no specific config match
      }
    }
  });

  // Special wrapping for 60% width sections
  if (layoutConfiguration && layoutConfiguration['60_percent_width_sections'] && layoutConfiguration['60_percent_width_sections'].length > 0) {
    const mainSectionIdToWrap = layoutConfiguration['60_percent_width_sections'][0];
    const $targetElementToWrap = $(`#${mainSectionIdToWrap}`);
    if ($targetElementToWrap.length) { // Ensure the element exists before attempting to wrap
      $targetElementToWrap.nextUntil('.col-md-12').addBack().wrapAll('<div class="col-md-8 d-flex flex-wrap"></div>'); // Added new class and flex utility
    }
  }
}