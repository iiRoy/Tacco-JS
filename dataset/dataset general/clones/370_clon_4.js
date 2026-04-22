const networkClient = require('node-fetch');
const domConstructor = require('jsdom');

module.exports = {
    retrieveSoftwareDetails: async function(softwareIdentifier) { 
        const baseLookupAddress = 'https://play.google.com/store/apps/details?id=';
        
        const softwareListing = { 
            listingIdentifier: softwareIdentifier,
            applicationTitle: null,
            creatorName: null,
            classificationGenre: null,
            iconImageLink: null,
            costIndicator: null,
            hasInternalPurchases: null,
            storeAccessLink: null,
            productSynopsis: null,
            visualGallery: null,
            overallRating: null,
            totalRatings: null,
            averageScore: null,
            publicationDate: null,
            downloadSize: null,
            installCount: null,
            currentRelease: null,
            platformRequirements: null,
            ageGuidance: null,
            creatorResources: null,
            creatorContactEmail: null
        };

        try {
            const serverResponse = await networkClient(baseLookupAddress + softwareIdentifier);

            if (serverResponse.status === 404) {
                return null; 
            }

            if (!serverResponse.ok) {
                throw new Error(`Web request for ${softwareIdentifier} failed with status: ${serverResponse.status}`);
            }

            const documentMarkup = await serverResponse.text();
            
            const { JSDOM } = domConstructor;
            const pageDocument = new JSDOM(documentMarkup).window.document; 

            softwareListing.applicationTitle = pageDocument.querySelector('.document-title div')?.textContent || null;
            softwareListing.creatorName = pageDocument.querySelector('.document-subtitle.primary span')?.textContent || null;
            softwareListing.classificationGenre = pageDocument.querySelector('.document-subtitle.category span')?.textContent || null;
            softwareListing.iconImageLink = pageDocument.querySelector('.details-info img.cover-image')?.getAttribute('src') || null;

            const priceSpans = pageDocument.querySelectorAll('.info-container .buy-button-container button.price.buy span');
            if (priceSpans.length > 0) {
                const lastPriceSpanContent = priceSpans[priceSpans.length - 1].textContent;
                const buyKeywordIndex = lastPriceSpanContent.indexOf(' Buy');
                const extractedPriceSegment = buyKeywordIndex !== -1 ? lastPriceSpanContent.substring(0, buyKeywordIndex).trim() : lastPriceSpanContent.trim();
                softwareListing.costIndicator = extractedPriceSegment.length > 0 ? extractedPriceSegment : 'free';
            } else {
                softwareListing.costIndicator = 'free'; 
            }

            softwareListing.hasInternalPurchases = !!pageDocument.querySelector('.inapp-msg');
            softwareListing.storeAccessLink = baseLookupAddress + softwareIdentifier;
            softwareListing.productSynopsis = pageDocument.querySelector('.id-app-orig-desc')?.innerHTML || null;

            softwareListing.visualGallery = Array.from(pageDocument.querySelectorAll('.thumbnails img'))
                .map(imageElement => imageElement.getAttribute('src'))
                .filter(Boolean);

            softwareListing.totalRatings = pageDocument.querySelector('.details-section.reviews meta[itemprop=ratingCount]')?.getAttribute('content') || null;
            softwareListing.overallRating = pageDocument.querySelector('.details-section.reviews meta[itemprop=ratingValue]')?.getAttribute('content') || null;
            softwareListing.averageScore = pageDocument.querySelector('.details-section.reviews .score')?.textContent || null;

            const metadataMap = Array.from(pageDocument.querySelectorAll('.meta-info')).reduce((accumulator, itemElement) => {
                const propertyKeyElement = itemElement.querySelector('.title');
                const propertyValueElement = itemElement.querySelector('.content');

                if (propertyKeyElement && propertyValueElement) {
                    const propertyKey = propertyKeyElement.textContent.trim().toLowerCase().replace(/ /g, '_');
                    const propertyValue = propertyValueElement.textContent.trim();
                    accumulator[propertyKey] = propertyValue;
                }
                return accumulator;
            }, {});

            softwareListing.publicationDate = metadataMap.updated || null;
            softwareListing.downloadSize = metadataMap.size || null;
            softwareListing.installCount = metadataMap.installs || null;
            softwareListing.currentRelease = metadataMap.current_version || null;
            softwareListing.platformRequirements = metadataMap.require_android || null;
            softwareListing.ageGuidance = metadataMap.content_rating || null;
            
            softwareListing.creatorResources = []; 

            Array.from(pageDocument.querySelectorAll('.dev-link')).forEach(linkElement => {
                const linkHref = linkElement.getAttribute('href');
                if (linkHref) {
                    if (linkHref.startsWith('mailto:')) {
                        softwareListing.creatorContactEmail = linkHref.substring(7);
                    } else {
                        try {
                            const urlObject = new URL(linkHref); 
                            const queryParameterValue = urlObject.searchParams.get('q'); 
                            if (queryParameterValue) {
                                softwareListing.creatorResources.push(queryParameterValue);
                            }
                        } catch (parsingException) {
                            // Silently ignore malformed URLs
                        }
                    }
                }
            });

            return softwareListing;

        } catch (fetchFailure) { 
            const scrapeProblem = new Error('Problem extracting software data from store page');
            scrapeProblem.underlyingCause = fetchFailure; 
            throw scrapeProblem;
        }
    }
};