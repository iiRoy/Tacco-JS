var httpClient =     require('request');

var domParser = require('cheerio');
var queryUtil = require('querystring');

// Export an object containing functions for application data retrieval
module.exports = {
  fetchAppDetails: function (applicationIdentifier, completionCallback) {
    // Define the base URL for Google Play Store app details
    const baseAddress = 'https://play.google.com/store/apps/details?id=';
    /*
     * Initiate an HTTP GET request to retrieve the app's web page.
     * The URL is constructed using the base address and the provided application ID.
     */
    httpClient(baseAddress + applicationIdentifier, function (errorObject, responseObject, documentContent) {

      // Handle any network or request-related errors
      if (errorObject) {
        completionCallback(errorObject); // Pass the error back to the caller
        return; // Exit function early
      }

      // Check for a 404 Not Found status code, indicating the app doesn't exist
      if (responseObject.statusCode === 404) {
        completionCallback(null, null); // Indicate no error but no data found
        return; // Terminate execution
      }

      // Initialize an object to store parsed application information
      let applicationInfo = {
        identifierCode: applicationIdentifier, // Store the unique application ID
        applicationName: null, // Name of the application
        publisherName: null, // Developer/publisher name
        appCategory: null, // Application category (e.g., 'Tools', 'Games')
        iconUrl: null, // URL for the app's icon
        costValue: null, // Price of the application
        hasInAppPurchases: null, // Boolean indicating in-app purchases
        storeLink: null, // Direct link to the app on the Play Store
        appDescription: null, // Full description of the application
        screenshotUrls: null, // Array of URLs for app screenshots
        overallRating: null, // Average rating value
        totalRatings: null, // Total number of ratings
        averageScore: null, // The score displayed (e.g., 4.5)
        releaseDate: null, // Date when the app was published
        downloadSize: null, // File size of the application
        installCount: null, // Number of downloads/installs
        currentVersion: null, // Latest software version
        requiredOs: null, // Minimum Android version required
        ageRating: null, // Content rating (e.g., 'Everyone', 'Teen')
        publisherLinks: null, // Array of developer's external links
        publisherEmail: null // Developer's contact email
      };

      try {
        // Load the HTML content into the DOM parser (cheerio)
        const dom = domParser.load(documentContent);

        // Extract various pieces of information using CSS selectors
        applicationInfo.applicationName = dom('.document-title div').html();
        applicationInfo.publisherName = dom('.document-subtitle.primary span').html();
        applicationInfo.appCategory = dom('.document-subtitle.category span').html();
        applicationInfo.iconUrl = dom('.details-info img.cover-image').attr('src');
        
        // Logic to determine application price (or if it's free)
        var priceElements = dom('.info-container .buy-button-container button.price.buy span'); 
        var elementText = dom(priceElements[priceElements.length - 1]).html();
        var buyKeywordIndex = elementText.indexOf(' Buy');
        var extractedPrice = elementText.substring(0, buyKeywordIndex);

        applicationInfo.costValue = extractedPrice.length > 0 ? extractedPrice : 'free'; // Set price or 'free'
        // End of price extraction

        applicationInfo.hasInAppPurchases = !!(dom('.inapp-msg').html()); // Convert truthy/falsy to boolean
        applicationInfo.storeLink = baseAddress + applicationIdentifier;
        applicationInfo.appDescription = dom('.id-app-orig-desc').html();
        
        // Populate the screenshot URLs array
        applicationInfo.screenshotUrls = [];
        dom('.thumbnails img').each(function (indexCounter, currentItem) {
          applicationInfo.screenshotUrls.push(dom(currentItem).attr('src'));
        });

        applicationInfo.totalRatings = dom('.details-section.reviews meta[itemprop=ratingCount]').attr('content');
        applicationInfo.overallRating = dom('.details-section.reviews meta[itemprop=ratingValue]').attr('content');
        applicationInfo.averageScore = dom('.details-section.reviews .score').html();

        // Extract additional metadata from the 'meta-info' section
        let metadataContainer = {};
        dom('.meta-info').each(function (indexCounter, currentItem) {
          var propertyKey = dom('.title', currentItem).html().trim().toLowerCase().replace(' ', '_');
          var propertyValue = dom('.content', currentItem).html().trim();
          
          metadataContainer[propertyKey] = propertyValue;
        });

        // Assign extracted metadata to the application info object
        applicationInfo.releaseDate = metadataContainer.updated;
        applicationInfo.downloadSize = metadataContainer.size;
        applicationInfo.installCount = metadataContainer.installs;
        applicationInfo.currentVersion = metadataContainer.current_version;
        applicationInfo.requiredOs = metadataContainer.require_android;
        applicationInfo.ageRating = metadataContainer.content_rating;
        applicationInfo.publisherLinks = [];

        // Parse developer contact information and external links
        dom('.dev-link').each(function (indexCounter, currentItem) {
          var linkRef = dom(currentItem).attr('href');
          if (linkRef && linkRef.includes('mailto:')) {
            applicationInfo.publisherEmail = linkRef.substring(7); // Extract email address
          } else {
            var parsedQuery = queryUtil.parse(linkRef);                        
            applicationInfo.publisherLinks.push(parsedQuery['https://www.google.com/url?q']);
          }
        });        
      } catch (exceptionObject) {
        // Catch any errors that occur during the scraping process
        var scrapeError = new Error('Problem encountered while parsing Play Store data');
        scrapeError.inner = exceptionObject; // Attach the original exception

        completionCallback(scrapeError); // Pass the scraping error
        return; // Abort further processing
      }

      // If successful, call the callback with no error and the populated application data
      completionCallback(errorObject, applicationInfo);
      return;
    });
  }
};