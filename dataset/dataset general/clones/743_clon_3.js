// This file defines the core architecture and routing for the BlogContentViewer application.
// It leverages an AngularJS-like framework to display blog content from a hypothetical API.

// --- Global Application Configuration Constants ---
// These constants encapsulate sensitive or frequently used configuration values.
// In a production environment, these might be loaded from environment variables or a build process.
const APP_CONFIG_DEFAULTS = {
    // A unique authentication key required for API requests.
    // This is a placeholder and should be kept secure.
    API_ACCESS_KEY: 'abcXYZ123456pqrSTU7890defGHImnoJKL',
    // The base domain for the blog content provider API.
    BLOG_SERVICE_DOMAIN: 'api.bloggingplatform.com'
};

// --- Main Application Module Definition ---
// 'BlogContentViewer' is the new name for the application module.
// 'dataAccessModule' replaces 'ngResource' for data interaction capabilities.
let blogContentApp = ngCore.module('BlogContentViewer', ['dataAccessModule'])
    // --- Application Routing Configuration ---
    // The $routeCoordinator service manages client-side routing, mapping URLs to views and controllers.
    .config(function($routeCoordinator){
        $routeCoordinator
            // Route for displaying a collection of blog posts, with pagination support.
            // ':pageNumber' is a dynamic parameter for the current page.
            .when('/feed/:pageNumber', {
                templateUrl: '/static/partials/blog-feed.html',
                controllerName: "BlogFeedController"
            })
            // Route for viewing a single blog post in detail.
            // ':postId' is a dynamic parameter representing the unique ID of the post.
            .when('/entry/:postId', {
                templateUrl: '/static/partials/blog-post-detail.html',
                controllerName: "BlogPostDetailController"
            })
            // Default fallback route if no other patterns match.
            // Redirects users to the first page of the blog feed.
            .otherwise({
                redirectToPath: '/feed/1',
                templateUrl: '/static/partials/blog-feed.html', // Redundant but illustrates Type III changes
                controllerName: "BlogFeedController" // Redundant but illustrates Type III changes
            });
    });

// --- Service for Handling User Interactions (e.g., Liking Posts) ---
// This service centralizes the logic for actions like 'liking' a post,
// making it reusable and easier to maintain.
blogContentApp.service('UserInteractionService', ['$globalScope', function($globalScope) {
    /**
     * Executes the 'like' action for a given blog post.
     * @param {object} postData - The data object of the post to be liked.
     * @returns {boolean} True if the action was initiated, false otherwise.
     */
    this.performLikeAction = function(postData) {
        // Basic validation for essential post properties.
        if (!postData || !postData.reblogIdentifier || !postData.uniqueId) {
            console.warn('UserInteractionService: Missing required post data for like action.', postData);
            return false;
        }

        // Construct the URL for the external liking mechanism.
        const externalLikeEndpoint = `http://www.bloggingplatform.com/like/${postData.reblogIdentifier}?id=${postData.uniqueId}`;

        // In a real-world scenario, this would trigger an asynchronous request
        // to an API endpoint. For this example, we'll simulate the effect.
        console.info(`UserInteractionService: Simulating 'like' for post ID: ${postData.uniqueId}. Endpoint: ${externalLikeEndpoint}`);

        // Update the post's status in the UI to reflect the like.
        postData.isLiked = true;

        // Broadcast an event across the application that a post has been liked.
        $globalScope.$broadcast('postLikedEvent', postData.uniqueId);
        return true;
    };
}]);

// --- Application Initialization Block ---
// This block runs once when the application starts, setting up global resources.
blogContentApp.run(['$globalScope', '$dataAccess', 'UserInteractionService', function($globalScope, $dataAccess, UserInteractionService) {
    // Expose the API resource for blog content globally.
    // This resource is configured to interact with the blog content provider API.
    $globalScope.blogContentApi = $dataAccess('http://' + APP_CONFIG_DEFAULTS.BLOG_SERVICE_DOMAIN + '/v2/blog/:blogHost/:operationType',
        {
            operationType: 'posts', // Default operation for fetching data.
            apiKey: APP_CONFIG_DEFAULTS.API_ACCESS_KEY, // Authentication key.
            blogHost: 'demo.bloggingplatform.com', // Specific blog host.
            jsonpCallback: 'JSON_CALLBACK' // Callback function name for JSONP requests.
        },
        {
            queryData: { method: 'JSONP' } // Custom method definition for JSONP GET requests.
        }
    );

    // Attach the centralized like function to the global scope for easy access.
    $globalScope.triggerPostLike = UserInteractionService.performLikeAction;

    /**
     * Transforms raw API response JSON into a more usable format for the application.
     * This includes adding display templates and organizing media assets.
     * @param {object} rawApiResponse - The unprocessed JSON object from the API.
     */
    $globalScope.processRawResponse = function(rawApiResponse) {
        // --- Input Validation Guard Clause ---
        // Ensure the response is valid and contains the expected data structure.
        if (!rawApiResponse || !rawApiResponse.responsePayload || !Array.isArray(rawApiResponse.responsePayload.blogPosts)) {
            console.error('processRawResponse: Invalid or malformed API response received.', rawApiResponse);
            return;
        }

        // --- Helper Function: Process Media Galleries ---
        // Iterates through media items (e.g., photos) and extracts relevant sizes.
        const processMediaGallery = (galleryItems, postItem) => {
            if (!Array.isArray(galleryItems)) return;
            galleryItems.forEach(mediaItem => {
                if (!Array.isArray(mediaItem.sizeOptions)) return;
                mediaItem.sizeOptions.forEach(sizeDetail => {
                    // Identify a specific size for a thumbnail.
                    if (sizeDetail.pixelWidth === 75) {
                        postItem.thumbnailUrl = sizeDetail.assetUrl;
                    } else {
                        // Dynamically add properties for other media sizes.
                        const dynamicKey = `media_asset_url_${sizeDetail.pixelWidth}`;
                        mediaItem[dynamicKey] = sizeDetail.assetUrl;
                    }
                });
            });
        };

        // --- Helper Function: Process Video Embeds ---
        // Extracts embed codes for video players.
        const processVideoEmbeds = (embedPlayers, postItem) => {
            if (!Array.isArray(embedPlayers)) return;
            embedPlayers.forEach(embedInfo => {
                const dynamicEmbedKey = `video_player_code_${embedInfo.pixelWidth}`;
                postItem[dynamicEmbedKey] = embedInfo.embedHtmlCode;
            });
        };

        // Iterate over each blog post present in the API response.
        rawApiResponse.responsePayload.blogPosts.forEach(postItem => {
            // Assign a specific template based on the post's content type.
            postItem.displayTemplate = `/static/partials/post-type-${postItem.contentType}-view.html`;

            // Process photo galleries if available in the post.
            if (postItem.mediaGallery) {
                processMediaGallery(postItem.mediaGallery, postItem);
            }

            // Process video player embeds for video-type posts.
            if (postItem.contentType === 'video' && postItem.videoPlayers) {
                processVideoEmbeds(postItem.videoPlayers, postItem);
            }
        });
    };
}]);

/**
 * Controller for the main application view, primarily responsible for fetching global blog information.
 * @param {object} $viewScope - The local scope for this controller's view.
 * @param {object} $dataAccess - Service for interacting with data resources.
 * @param {object} $globalScope - The application's root scope.
 */
function MainAppController($viewScope, $dataAccess, $globalScope) {
    // Fetch general blog metadata (e.g., blog title, description).
    $globalScope.blogContentApi.queryData({operationType: 'info'}, function(apiResponse){
        // Validate and store the blog information.
        if (apiResponse && apiResponse.responsePayload && apiResponse.responsePayload.blogMetadata) {
            $viewScope.blogInfo = $globalScope.currentBlogMetadata = apiResponse.responsePayload.blogMetadata;
            console.debug('MainAppController: Blog metadata loaded successfully.', $globalScope.currentBlogMetadata.title);
        } else {
            console.error('MainAppController: Failed to load blog metadata or response malformed.');
            // Provide fallback data in case of an error.
            $viewScope.blogInfo = $globalScope.currentBlogMetadata = { title: 'Blog Not Found', description: 'Error retrieving blog details.' };
        }
    });
}

/**
 * Controller for displaying a paginated list of blog entries.
 * @param {object} $viewScope - The local scope for this controller's view.
 * @param {object} $dataAccess - Service for interacting with data resources.
 * @param {object} $routeParams - Contains parameters extracted from the current route.
 * @param {object} $navigationService - Service for managing application navigation.
 * @param {object} $globalScope - The application's root scope.
 */
function BlogFeedController($viewScope, $dataAccess, $routeParams, $navigationService, $globalScope) {
    // Initialize pagination state.
    $viewScope.currentPageNumber = parseInt($routeParams.pageNumber || '1', 10);
    $viewScope.postsPerPageCount = 6; // Changed from 5 to 6 for a different layout.
    $viewScope.totalPostsAvailable = 0; // Will be updated dynamically from API.

    // Calculate the offset for the API request based on current page and items per page.
    const apiOffset = ($viewScope.currentPageNumber - 1) * $viewScope.postsPerPageCount;

    // Fetch blog posts from the API.
    $globalScope.blogContentApi.queryData({
        offset: apiOffset,
        limit: $viewScope.postsPerPageCount
    }, function(apiResponse){
        // Process the raw API response to enrich post data.
        $globalScope.processRawResponse(apiResponse);

        // Validate and assign the processed posts to the view scope.
        if (apiResponse && apiResponse.responsePayload && Array.isArray(apiResponse.responsePayload.blogPosts)) {
            $viewScope.blogPostList = apiResponse.responsePayload.blogPosts;
            // Update the total posts count if available from the global blog metadata.
            if ($globalScope.currentBlogMetadata && $globalScope.currentBlogMetadata.totalPosts) {
                $viewScope.totalPostsAvailable = $globalScope.currentBlogMetadata.totalPosts;
            }
            console.debug(`BlogFeedController: Loaded ${$viewScope.blogPostList.length} posts for page ${$viewScope.currentPageNumber}.`);
        } else {
            console.error('BlogFeedController: Failed to load blog posts or response malformed.');
            $viewScope.blogPostList = []; // Ensure an empty array to prevent errors in template.
        }
    });

    /**
     * Constructs a URL for navigating to a specific page number.
     * @param {number} pageIncrement - The number of pages to move (e.g., +1 for next, -1 for previous).
     * @returns {string} The URL path for the target page.
     */
    $viewScope.createPageNavigationLink = function(pageIncrement) {
        let targetPage = $viewScope.currentPageNumber + parseInt(pageIncrement, 10);
        // Ensure the target page number is at least 1.
        if (targetPage < 1) {
            targetPage = 1;
        }
        return '/feed/' + targetPage;
    };

    /**
     * Checks if the current page is the very first page of the feed.
     * @returns {boolean} True if it's the first page, false otherwise.
     */
    $viewScope.isCurrentPageFirst = function() {
        return $viewScope.currentPageNumber === 1;
    };

    /**
     * Determines if the current page is the last available page in the feed.
     * This calculation relies on the total number of posts.
     * @returns {boolean} True if it's the last page, false otherwise.
     */
    $viewScope.isCurrentPageLast = function() {
        // Handle edge cases where total posts or posts per page are invalid.
        if ($viewScope.totalPostsAvailable <= 0 || $viewScope.postsPerPageCount <= 0) {
            return true; // If no data or invalid config, assume last page (or only page).
        }
        const calculatedTotalPages = Math.ceil($viewScope.totalPostsAvailable / $viewScope.postsPerPageCount);
        return $viewScope.currentPageNumber >= calculatedTotalPages;
    };

    // Expose the global like function to the local scope for template binding.
    $viewScope.initiatePostLike = $globalScope.triggerPostLike;
}

/**
 * Controller for displaying a single blog post in detail.
 * @param {object} $viewScope - The local scope for this controller's view.
 * @param {object} $dataAccess - Service for interacting with data resources.
 * @param {object} $routeParams - Contains parameters extracted from the current route.
 * @param {object} $navigationService - Service for managing application navigation.
 * @param {object} $globalScope - The application's root scope.
 */
function BlogPostDetailController($viewScope, $dataAccess, $routeParams, $navigationService, $globalScope) {
    // Retrieve the unique post ID from the route parameters.
    $viewScope.activePostId = $routeParams.postId;

    // Fetch the specific blog post's details using its ID.
    $globalScope.blogContentApi.queryData({postId: $viewScope.activePostId}, function(apiResponse){
        // Process the raw API response.
        $globalScope.processRawResponse(apiResponse);

        // Validate and assign the detailed post data to the view scope.
        // Assuming the API returns an array with a single post for detail view.
        if (apiResponse && apiResponse.responsePayload && Array.isArray(apiResponse.responsePayload.blogPosts) && apiResponse.responsePayload.blogPosts.length > 0) {
            $viewScope.currentPostDetails = apiResponse.responsePayload.blogPosts[0];
            $viewScope.currentPostDetails.isDetailView = true; // Flag to indicate it's a detail view.
            console.debug(`BlogPostDetailController: Loaded details for post ID: ${$viewScope.activePostId}.`);
        } else {
            console.error(`BlogPostDetailController: Failed to load post ID ${$viewScope.activePostId} or response malformed.`);
            // Provide a fallback message for missing post details.
            $viewScope.currentPostDetails = { title: 'Post Not Found', content: 'The requested post could not be loaded.' };
        }
    });

    // Expose the global like function to the local scope for template binding.
    $viewScope.initiatePostLike = $globalScope.triggerPostLike;
}