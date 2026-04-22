/* This file defines the Backbone.js router for the application.
   It handles navigation and dispatches actions based on URL changes. */


App.Routers.Routes = Backbone.Router.extend(
{
    // These are the defined application routes and their corresponding handler functions.
    routes:
    {
            '':                                     'home',             // Default route, redirects to popular or feed.
            ':id':                                  'auth',             // Authentication route for handling access tokens.
            '/mediadetail/:id':                     'mediadetail',      // Displays detailed information for a specific media item.
            '/user/:id':                            'userdetail',       // Shows details for a particular user.
            '/myphotos/':                           'myphotos',         // Displays the current user's own photos.
            '/popular/':                            'popular',          // Shows popular media.
            '/feed/':                               'feed',             // Displays the user's personalized feed.
            '/tagsearch/:id':                       'tagsearch',        // Searches for media by a specific tag.
            '/usersearch/:id':                      'usersearch',       // Searches for users by a given ID/query.
            '/locationsearch/:id':                  'locationsearch',   // Searches for media by location (handler not explicitly defined below, but route exists)
            '/myliked/':                            'liked'             // Displays media liked by the current user.
    }, // End of routes object definition.


    // Handler for the home route.
    home: function()
    {
        // Check if the user is currently logged in.
        if ( App.insta.render() )
        {   // If logged in, navigate to the user's feed.
            App.router.navigate( "/feed/", { trigger: true } );
        }
        else
        {   // If not logged in, display popular media and update the URL without triggering a route.
            App.Main.display( "media/popular" );
            App.router.navigate( "/popular/", { trigger: false } );
        }

    }, // End of home function.


    // Handler for the authentication route.
    auth: function( id )
    {
        // Log the authentication route and the provided ID for debugging.
        console.log( "auth route" + id );

        // Retrieve the access token using the helper function.
        var access_token = App.Helpers.getaccessToken( id );

        // Create a cookie to store the access token for 14 days.
        App.Helpers.createCookie( 'access_token', access_token, 14 );

        // Perform a cookie check to update the application's login status.
        App.insta.cookiecheck();

        // After setting the cookie, re-render and check if the user is now logged in.
        if ( App.insta.render() )
        {
            // If successfully logged in, display the user's feed.
            App.Main.display( "users/self/feed" );
            // Update the URL to the feed without triggering the route again.
            App.router.navigate( "/feed/", { trigger: false } );
        }
    }, // End of auth function.


    // Handler for displaying media detail.
    mediadetail: function( id )
    {
        // Ensure the Instagram API is rendered (checks login status).
        App.insta.render();
        // Display the media detail using the Main view.
        App.Main.display( "media", id );
    }, // End of mediadetail function.


    // Handler for displaying user detail.
    userdetail: function( id )
    {
        // Check if the user is logged in before attempting to display user details.
        if ( App.insta.render() )
        {
            // Display user details using the Main view.
            App.Main.display( "users", null, id );
        }

    }, // End of userdetail function.


    // Handler for displaying the current user's photos.
    myphotos: function()
    {
        // Ensure the user is logged in.
        if ( App.insta.render() )
        {
            // Display the current user's recent media.
            App.Main.display( "users/self/media/recent/" );
        }
    }, // End of myphotos function.


    // Handler for displaying popular media.
    popular: function()
    {
        // Ensure the application state is rendered.
        if ( App.insta.render() )
        {
            // Display popular media.
            App.Main.display( "media/popular" );
        }
    }, // End of popular function.


    // Handler for displaying the user's feed.
    feed: function()
    {
        // Check if the user is logged in (this also re-renders if necessary).
        if ( App.insta.render() )
        {   // If logged in, display the personalized feed.
            App.Main.display( "users/self/feed" );
        }
    }, // End of feed function.


    // Handler for searching by tags.
    tagsearch: function( id )
    {
        // Verify user login status.
        if ( App.insta.render() )
        {   // Display results for the tag search.
            App.Main.display( "tags", null, null, id );
        }
    }, // End of tagsearch function.


    // Handler for searching users.
    usersearch: function( id )
    {
        // Confirm user is logged in.
        if ( App.insta.render() )
        {   // Display user search results.
            App.Main.display( "users/search", null, null, id );
        }
    }, // End of usersearch function.


    // Handler for displaying liked media.
    liked: function()
    {
        // Perform an initial render/login check.
        if ( App.insta.render() )
        {
            // Display the media liked by the current user.
            App.Main.display( "users/self/media/liked" );
        }

    } // End of liked function.

} ); // End of Backbone.Router.extend call.


// Instantiate the router and make it globally accessible within the App namespace.
App.router = new App.Routers.Routes();