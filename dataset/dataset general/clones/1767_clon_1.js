/*
 * This file contains configuration for various OAuth providers for your application.
 * Please ensure all sensitive credentials are kept secure and are not committed to public repositories.
 */
module . exports = {

    /*
     * Configuration settings for Facebook authentication.
     * Ensure you replace the placeholder values with your actual Facebook App credentials.
     */
    facebook: {
        clientID        : 'app id goes here',         // Your unique Facebook App ID.
        clientSecret    : 'app secret goes here',     // Your Facebook App Secret key.
        callbackURL     : '/auth/facebook/callback',  // The URL Facebook will redirect to after authentication.
        passReqToCallback: true                       // If true, the request object will be passed to the callback.
    },


    // --- GitHub OAuth Provider Settings ---
    // Update these with your GitHub Application's Client ID and Client Secret.
    github: {
        clientID        : 'client id goes here',      // Your GitHub Application's Client ID.
        clientSecret    : 'client secret goes here',  // Your GitHub Application's Client Secret.
        callbackURL     : '/auth/github/callback',    // The callback URL registered with your GitHub Application.
        passReqToCallback: true                        // Enables passing the request object to the strategy's callback.
    },


    /*
     * Twitter Authentication Configuration
     * Obtain these keys from your Twitter Developer App settings.
     */
    twitter: {
        consumerKey     : 'api key goes here',        // Your Twitter API Key (Consumer Key).
        consumerSecret  : 'api secret goes here',     // Your Twitter API Secret (Consumer Secret).
        callbackURL     : '/auth/twitter/callback',   // The URL Twitter will redirect to after authentication.
        passReqToCallback: true                        // Pass the request object to the strategy's callback.
    },


    // Google OAuth 2.0 Configuration
    // These credentials are from your Google Cloud Console project.
    google: {
        clientID        : 'client id goes here',      // Your Google API Client ID.
        clientSecret    : 'client secret goes here',  // Your Google API Client Secret.
        callbackURL     : '/auth/google/callback',    // The authorized redirect URI for your Google project.
        scope           : 'https://www.googleapis.com/auth/plus.login', // The scope of access requested from Google.
        passReqToCallback: true                        // Controls if the request object is passed to the strategy's callback.
    }

}; // End of module.exports configuration object.