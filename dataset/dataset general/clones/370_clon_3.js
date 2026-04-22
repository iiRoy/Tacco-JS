const webFetcher = require('request');
const domParser = require('cheerio');
const queryUtil = require('querystring');
const { URL } = require('url');

/**
 * Immutable configuration settings for the application data retrieval service.
 * @private
 */
const serviceConfiguration = Object.freeze({
  PLAY_STORE_BASE_URI: 'https://play.google.com/store/apps/details?id=',
  EMAIL_PROTOCOL_PREFIX: 'mailto:',
  GOOGLE_REDIRECT_QUERY_PARAM: 'https://www.google.com/url?q'
});

/**
 * Generates an initial application data structure with predefined defaults.
 * This ensures consistency and provides fallback values for missing information.
 * @param {string} identifiedPackageId - The unique package identifier for the application.
 * @returns {object} A new object containing structured application details.
 */
const initializeApplicationData = (identifiedPackageId) => ({
  packageUniqueId: identifiedPackageId,
  applicationName: 'Unnamed Application',
  publisherName: 'Unknown Publisher',
  primaryCategory: 'General',
  iconLink: null,
  monetaryCost: 'Free',
  containsInAppPurchases: false,
  directStoreLink: '',
  fullDescription: 'Description not available.',
  visualAssets: [],
  averageUserRating: '0.0',
  totalRatingCount: '0',
  overallQualityScore: '0.0',
  releaseDate: 'N/A',
  binarySize: 'N/A',
  installationCount: 'N/A',
  currentSoftwareVersion: 'N/A',
  compatibleOperatingSystems: 'N/A',
  ageContentRating: 'N/A',
  publisherWebsites: [],
  publisherContactEmail: null
});

/**
 * Provides a service to scrape and extract detailed information about applications
 * from the Google Play Store.
 * @module PlayStoreScraper
 */
const PlayStoreScraper = {
  /**
   * Retrieves comprehensive details for a specific application identified by its package ID.
   * This function uses asynchronous operations and a callback for result handling.
   * @param {string} packageIdForLookup - The unique package ID of the target application (e.g., 'com.android.chrome').
   * @param {function(Error|null, object|null): void} completionHandler - A callback invoked upon completion,
   *   receiving an error object or the application details.
   */
  fetchDetailedAppInfo: async function(packageIdForLookup, completionHandler) {
    // Validate the input package identifier for basic correctness.
    if (!packageIdForLookup || typeof packageIdForLookup !== 'string' || packageIdForLookup.trim().length === 0) {
      const inputError = new Error('Invalid application package ID provided. It must be a non-empty string.');
      return completionHandler(inputError);
    }

    const fullLookupUri = `${serviceConfiguration.PLAY_STORE_BASE_URI}${packageIdForLookup}`;
    const applicationData = initializeApplicationData(packageIdForLookup);
    applicationData.directStoreLink = fullLookupUri; // Assign the direct link early.

    /**
     * Helper function to perform the HTTP request and return page content as a Promise.
     * @returns {Promise<string|null>} A promise that resolves with the HTML content or null if not found,
     *   or rejects with an error.
     */
    const requestPageContent = () => {
      return new Promise((resolve, reject) => {
        webFetcher(fullLookupUri, (requestError, webResponse, pagePayload) => {
          if (requestError) {
            return reject(new Error(`HTTP request failed: ${requestError.message}`));
          }
          // Handle specific HTTP status codes.
          if (!webResponse || webResponse.statusCode === 404) {
            return resolve(null); // Application not found, not an error state for the request itself.
          }
          if (webResponse.statusCode !== 200) {
            return reject(new Error(`Unexpected HTTP status code: ${webResponse.statusCode}`));
          }
          resolve(pagePayload);
        });
      });
    };

    try {
      const pagePayload = await requestPageContent();

      // If pagePayload is null, it means the app was not found.
      if (pagePayload === null) {
        return completionHandler(null, null);
      }

      // Ensure the payload is a valid string before attempting to parse.
      if (typeof pagePayload !== 'string' || pagePayload.trim().length === 0) {
        throw new Error('Received empty or invalid HTML content for parsing.');
      }

      const dom = domParser.load(pagePayload);

      // Utility functions to safely extract data from the DOM.
      const getHtmlContent = (selector) => dom(selector).html()?.trim() || null;
      const getAttributeValue = (selector, attribute) => dom(selector).attr(attribute) || null;
      const elementExists = (selector) => dom(selector).length > 0;

      // Extract primary application attributes.
      applicationData.applicationName = getHtmlContent('.document-title div') || applicationData.applicationName;
      applicationData.publisherName = getHtmlContent('.document-subtitle.primary span') || applicationData.publisherName;
      applicationData.primaryCategory = getHtmlContent('.document-subtitle.category span') || applicationData.primaryCategory;
      applicationData.iconLink = getAttributeValue('.details-info img.cover-image', 'src') || applicationData.iconLink;

      // Advanced monetary cost extraction.
      const rawPriceString = getHtmlContent('.info-container .buy-button-container button.price.buy span:last-child');
      if (rawPriceString) {
        const buyTextPosition = rawPriceString.indexOf(' Buy');
        const extractedPrice = (buyTextPosition > -1 ? rawPriceString.substring(0, buyTextPosition) : rawPriceString).trim();
        applicationData.monetaryCost = extractedPrice || 'Free';
      }

      // Determine if in-app purchases are present.
      applicationData.containsInAppPurchases = elementExists('.inapp-msg');

      // Retrieve the comprehensive application description.
      applicationData.fullDescription = getHtmlContent('.id-app-orig-desc') || applicationData.fullDescription;

      // Collect all available screenshot URLs.
      applicationData.visualAssets = dom('.thumbnails img')
        .map((idx, element) => getAttributeValue(element, 'src'))
        .get() // Convert Cheerio object to a standard JavaScript array.
        .filter(url => url); // Remove any null or undefined entries.

      // Extract user rating and review metrics.
      applicationData.totalRatingCount = getAttributeValue('.details-section.reviews meta[itemprop=ratingCount]', 'content') || applicationData.totalRatingCount;
      applicationData.averageUserRating = getAttributeValue('.details-section.reviews meta[itemprop=ratingValue]', 'content') || applicationData.averageUserRating;
      applicationData.overallQualityScore = getHtmlContent('.details-section.reviews .score') || applicationData.overallQualityScore;

      // Process various meta-information blocks.
      const scrapedMetadata = {};
      dom('.meta-info').each((index, metaContainer) => {
        const titleSpan = dom('.title', metaContainer);
        const contentSpan = dom('.content', metaContainer);

        if (titleSpan.length && contentSpan.length) {
          const keyNormalized = titleSpan.text().trim().toLowerCase().replace(/\s+/g, '_');
          const valueExtracted = contentSpan.text().trim();
          scrapedMetadata[keyNormalized] = valueExtracted;
        }
      });

      // Map scraped metadata to the application data object.
      applicationData.releaseDate = scrapedMetadata.updated || applicationData.releaseDate;
      applicationData.binarySize = scrapedMetadata.size || scrapedMetadata.file_size || applicationData.binarySize; // Check for alternative key.
      applicationData.installationCount = scrapedMetadata.installs || applicationData.installationCount;
      applicationData.currentSoftwareVersion = scrapedMetadata.current_version || applicationData.currentSoftwareVersion;
      applicationData.compatibleOperatingSystems = scrapedMetadata.require_android || applicationData.compatibleOperatingSystems;
      applicationData.ageContentRating = scrapedMetadata.content_rating || applicationData.ageContentRating;

      // Parse developer contact information and external links.
      dom('.dev-link').each((idx, linkElement) => {
        const hyperlink = getAttributeValue(linkElement, 'href');
        if (hyperlink) {
          if (hyperlink.startsWith(serviceConfiguration.EMAIL_PROTOCOL_PREFIX)) {
            applicationData.publisherContactEmail = hyperlink.substring(serviceConfiguration.EMAIL_PROTOCOL_PREFIX.length);
          } else {
            try {
              // Use Node's URL API to parse complex redirect links.
              const parsedLink = new URL(hyperlink, 'http://dummy.base.url'); // Dummy base URL for relative links.
              const actualDestination = parsedLink.searchParams.get(serviceConfiguration.GOOGLE_REDIRECT_QUERY_PARAM);
              if (actualDestination) {
                applicationData.publisherWebsites.push(actualDestination);
              }
            } catch (parsingException) {
              // Log or handle malformed URLs gracefully, rather than crashing.
              // console.warn(`Failed to parse developer link: ${hyperlink} - ${parsingException.message}`);
            }
          }
        }
      });

      // Successfully processed all data.
      completionHandler(null, applicationData);

    } catch (scrapingFailure) {
      // Catch any unexpected errors during the DOM parsing or data extraction phase.
      const processingError = new Error(`Data extraction failed for application ID "${packageIdForLookup}".`);
      processingError.originalCause = scrapingFailure; // Attach the underlying exception for debugging.
      completionHandler(processingError);
    }
  }
};

module.exports = PlayStoreScraper;