/*
 * Core application navigation management module.
 * This component defines the routing logic for the single-page application,
 * handling URL changes and mapping them to specific view rendering functions.
 * It's built upon the Backbone.Router framework.
 */
GlobalApp.Navigators.URLProcessor = Backbone.Router.extend({

    // Defines the mapping between URL fragments and corresponding handler methods.
    uriMappings: {
        '': 'showInitialPage',                                    // Default route for the root URL
        ':sessionTokenParam': 'processAuthCallback',              // Handles authentication callback with a session token
        '/content/:resourceId': 'displayMediaDetails',            // Shows details for a specific media item
        '/profile/:userId': 'renderUserProfile',                  // Displays a user's profile information
        '/mygallery/': 'viewUserMediaCollection',                 // Shows the current user's uploaded media
        '/trending/': 'showTrendingContent',                      // Displays a feed of popular or trending content
        '/stream/': 'renderActivityFeed',                         // Renders the user's personalized activity stream
        '/search/tags/:tagQuery': 'performTagSearch',             // Initiates a search based on a specific tag
        '/search/users/:userNameQuery': 'executeUserSearch',      // Searches for users by name or identifier
        '/search/location/:locationId': 'findLocationBasedMedia', // Finds media associated with a given location identifier
        '/favorites/': 'presentLikedItems'                        // Presents the list of items the user has liked
    },

    /**
     * Handler for the application's root URL.
     * Determines whether the user is authenticated and directs them accordingly.
     */
    showInitialPage: function() {
        // Check current authentication status of the user
        const isUserAuthenticated = GlobalApp.authHandler.checkSessionStatus();

        if (isUserAuthenticated) {
            // If logged in, navigate to the user's activity feed
            // The 'trigger: true' ensures the 'renderActivityFeed' method is called.
            GlobalApp.mainRouter.navigateTo("/stream/", { trigger: true });
        } else {
            // If not authenticated, display the general popular content view
            // and update the URL without triggering a new route handler.
            GlobalApp.contentRenderer.showScreen("public/trending_media");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true });
        }
    },

    /**
     * Processes the authentication callback, typically after a login redirect.
     * Extracts the session token from the URL and stores it.
     * @param {string} sessionTokenParam - The session token received from the authentication provider.
     */
    processAuthCallback: function(sessionTokenParam) {
        // Validate the incoming parameter for a session token
        if (!sessionTokenParam || typeof sessionTokenParam !== 'string' || sessionTokenParam.length < 10) {
            console.error("Invalid or missing session token parameter during authentication callback.");
            // Redirect to a public page or error page if token is invalid
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        // Fetch and process the actual access token using a helper utility
        const userSessionKey = GlobalApp.utility.extractAccessToken(sessionTokenParam);

        // Store the obtained session key as a persistent cookie for future sessions
        const cookieLifespanDays = 14; // Token valid for 2 weeks
        GlobalApp.utility.setPersistentCookie('auth_session_key', userSessionKey, cookieLifespanDays);

        // After setting the cookie, re-validate the session state
        GlobalApp.authHandler.validateStoredCookies();

        // If the user is now successfully authenticated (post-cookie check)
        if (GlobalApp.authHandler.checkSessionStatus()) {
            // Display the user's personal activity feed
            GlobalApp.contentRenderer.showScreen("users/self/activity_feed");
            // Navigate to the feed URL without re-triggering the route handler, as content is already displayed.
            GlobalApp.mainRouter.navigateTo("/stream/", { replace: true });
        } else {
            // Handle cases where authentication somehow failed after token processing
            console.warn("Authentication failed even after token processing. Redirecting to login.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Displays the detailed view for a specific media item.
     * Requires user authentication.
     * @param {string} resourceId - The unique identifier of the media item.
     */
    displayMediaDetails: function(resourceId) {
        // Guard clause: Ensure a valid resource ID is provided
        if (!resourceId || typeof resourceId !== 'string') {
            console.error("Attempted to display media details with an invalid resource ID.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        const authenticated = GlobalApp.authHandler.checkSessionStatus();
        if (authenticated) {
            // Render the media detail screen, passing the ID within a data object
            GlobalApp.contentRenderer.showScreen("content/media_item", { identifier: resourceId });
        } else {
            // If not authenticated, redirect to a public view or login prompt
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Renders the profile page for a specific user.
     * Requires user authentication.
     * @param {string} userId - The unique identifier of the user.
     */
    renderUserProfile: function(userId) {
        // Validate the user ID parameter
        if (!userId || typeof userId !== 'string') {
            console.error("Invalid user ID provided for profile rendering.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        const authStatus = GlobalApp.authHandler.checkSessionStatus();
        if (authStatus) {
            // Display the user profile screen, passing the user ID as part of a data object
            GlobalApp.contentRenderer.showScreen("user/profile_view", { targetUserId: userId });
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Displays the current user's collection of uploaded media.
     * Requires user authentication.
     */
    viewUserMediaCollection: function() {
        const authenticatedUser = GlobalApp.authHandler.checkSessionStatus();
        if (authenticatedUser) {
            GlobalApp.contentRenderer.showScreen("user/gallery/recent_uploads");
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Renders a feed of popular or trending content.
     * Requires user authentication to access personalized popular content.
     */
    showTrendingContent: function() {
        const authStatus = GlobalApp.authHandler.checkSessionStatus();
        if (authStatus) {
            GlobalApp.contentRenderer.showScreen("global/popular_items");
        } else {
            // Even if not authenticated, popular content can often be viewed publicly
            GlobalApp.contentRenderer.showScreen("public/trending_media");
            // No navigation needed as the route already reflects this.
        }
    },

    /**
     * Renders the user's personalized activity stream or feed.
     * Requires user authentication.
     */
    renderActivityFeed: function() {
        const isUserLoggedIn = GlobalApp.authHandler.checkSessionStatus();
        if (isUserLoggedIn) {
            GlobalApp.contentRenderer.showScreen("user/personal/activity_stream");
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Executes a search for content based on a specific tag.
     * Requires user authentication.
     * @param {string} tagQuery - The tag string to search for.
     */
    performTagSearch: function(tagQuery) {
        // Input validation for the tag query
        if (!tagQuery || typeof tagQuery !== 'string' || tagQuery.trim().length === 0) {
            console.warn("Empty or invalid tag query provided for search.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        const authenticated = GlobalApp.authHandler.checkSessionStatus();
        if (authenticated) {
            // Render the tag search results view, passing the tag as a specific option
            GlobalApp.contentRenderer.showScreen("search/by_tag", { searchTerm: tagQuery });
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Searches for users by name or identifier.
     * Requires user authentication.
     * @param {string} userNameQuery - The query string for user search.
     */
    executeUserSearch: function(userNameQuery) {
        // Basic validation for the search query
        if (!userNameQuery || typeof userNameQuery !== 'string' || userNameQuery.trim().length < 2) {
            console.warn("User search query is too short or invalid.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        const authCheck = GlobalApp.authHandler.checkSessionStatus();
        if (authCheck) {
            // Display the user search results screen
            GlobalApp.contentRenderer.showScreen("search/user_results", { queryText: userNameQuery });
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Finds and displays media associated with a given location identifier.
     * Requires user authentication.
     * @param {string} locationId - The unique identifier for the location.
     */
    findLocationBasedMedia: function(locationId) {
        // Validate the location ID
        if (!locationId || typeof locationId !== 'string' || locationId.trim().length === 0) {
            console.error("Invalid location ID provided for media search.");
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
            return;
        }

        const userAuthenticated = GlobalApp.authHandler.checkSessionStatus();
        if (userAuthenticated) {
            // Render the view for location-based media, passing the ID
            GlobalApp.contentRenderer.showScreen("search/location_media", { locationIdentifier: locationId });
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    },

    /**
     * Presents a list of items that the current user has marked as liked or favorite.
     * Requires user authentication.
     */
    presentLikedItems: function() {
        const loggedIn = GlobalApp.authHandler.checkSessionStatus();
        if (loggedIn) {
            GlobalApp.contentRenderer.showScreen("user/favorite_items");
        } else {
            GlobalApp.mainRouter.navigateTo("/trending/", { replace: true, trigger: true });
        }
    }

});

// Instantiate the main router for the application
GlobalApp.mainRouter = new GlobalApp.Navigators.URLProcessor();