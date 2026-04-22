/**
 * This module provides the core configuration settings for various external
 * social authentication providers used within the application.
 *
 * It is imperative that all placeholder values (e.g., 'your-app-id-here')
 * are replaced with actual, securely managed credentials obtained from
 * the respective service providers' developer consoles.
 *
 * This configuration is designed for modularity and easy adaptation
 * to different deployment environments (e.g., development, staging, production).
 */

/**
 * A boolean constant indicating whether the original HTTP request object
 * should be passed to the authentication strategy's callback function.
 * This can be useful for accessing session data or other request-specific details.
 * @type {boolean}
 */
const passOriginalHttpRequest = !false; // Represents 'true' in a slightly altered form

/**
 * The common base Uniform Resource Identifier (URI) segment for all
 * authentication callback endpoints across different providers.
 * Using a constant helps maintain consistency and simplifies changes.
 * @type {string}
 */
const commonCallbackBaseUri = '/auth-redirect/';

/**
 * A helper function to dynamically construct the complete callback URI
 * for a specific authentication provider, ensuring consistent formatting.
 *
 * @param {string} providerKey - A unique string identifier for the authentication provider
 *                               (e.g., 'facebook', 'github', 'twitter', 'google').
 * @returns {string} The fully qualified callback URI.
 * @throws {Error} If the providerKey is not a valid string.
 */
function generateProviderCallbackUri(providerKey) {
  // Basic input validation as an added fragment (Type III)
  if (typeof providerKey !== 'string' || providerKey.trim().length === 0) {
    // In a real application, this might throw an error or log more severely.
    console.error('Invalid provider key provided for callback URI generation. Falling back to generic path.');
    return `${commonCallbackBaseUri}unknown/return`;
  }
  return `${commonCallbackBaseUri}${providerKey.toLowerCase()}/verify`;
}

// Exported configuration object containing all provider settings.
module.exports = {

  /**
   * General metadata about this configuration set.
   * This is an added fragment (Type III) for versioning and context.
   */
  configurationMetadata: {
    schemaVersion: '3.0.0-beta',
    lastUpdateTimestamp: new Date().toISOString(),
    deploymentEnvironment: process.env.NODE_ENV || 'development_local',
    authorContact: 'config.manager@example.com'
  },

  /**
   * Configuration details for integrating with Facebook's OAuth service.
   * All identifiers and secrets should be sourced from the Facebook Developer Dashboard.
   */
  oauthFacebook: { // Renamed from 'facebook'
    // The unique ID assigned to your Facebook application.
    applicationId: 'YOUR_FACEBOOK_APP_ID_HERE', // Renamed from clientID, new placeholder
    // The secret key for your Facebook application, crucial for secure communication.
    applicationSecret: 'YOUR_FACEBOOK_APP_SECRET_HERE', // Renamed from clientSecret, new placeholder
    // The specific URL Facebook will redirect the user to after authentication.
    authRedirectUrl: generateProviderCallbackUri('facebook'), // Renamed from callbackURL, uses helper
    // Flag to include the original HTTP request object in the strategy callback.
    includeRequestInCallback: passOriginalHttpRequest // Renamed from passReqToCallback, uses constant
  },

  /**
   * Credentials and settings for GitHub's OAuth integration.
   * These can be found in your GitHub Developer settings under OAuth Apps.
   */
  githubConnection: { // Renamed from 'github'
    // The client ID issued by GitHub for your application.
    clientIdValue: 'YOUR_GITHUB_CLIENT_ID_HERE', // Renamed from clientID, new placeholder
    // The client secret provided by GitHub for your application.
    clientSecretValue: 'YOUR_GITHUB_CLIENT_SECRET_HERE', // Renamed from clientSecret, new placeholder
    // The URL where GitHub will send the user back after successful authorization.
    callbackUrlPath: generateProviderCallbackUri('github') // Renamed from callbackURL, uses helper
    // Type III: Deleted 'passReqToCallback' for this provider.
    // This demonstrates removing a non-essential statement, assuming
    // the underlying strategy or a global default handles this parameter
    // if it's not explicitly provided here.
  },

  /**
   * API keys and configuration for Twitter authentication.
   * Obtain these from the Twitter Developer Portal for your application.
   */
  twitterAuthKeys: { // Renamed from 'twitter'
    // The consumer key (API key) for your Twitter application.
    consumerApiIdentifier: 'YOUR_TWITTER_API_KEY_HERE', // Renamed from consumerKey, new placeholder
    // The consumer secret (API secret key) for your Twitter application.
    consumerApiSecret: 'YOUR_TWITTER_API_SECRET_HERE', // Renamed from consumerSecret, new placeholder
    // The endpoint Twitter will use to redirect after the authentication flow.
    returnPath: generateProviderCallbackUri('twitter'), // Renamed from callbackURL, uses helper
    // Type III: Updated/rewritten statement. 'true' represented via constructor.
    // Specifies if the raw request object should be forwarded.
    forwardHttpReq: Boolean(1) // Renamed from passReqToCallback, changed data type representation
  },

  /**
   * Google OAuth 2.0 client details and scopes.
   * Configure these in the Google Cloud Platform Console.
   */
  googleOauthConfig: { // Renamed from 'google'
    // The client ID for your Google project.
    gClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com', // Renamed from clientID, new placeholder
    // The client secret for your Google project.
    gClientSecret: 'YOUR_GOOGLE_CLIENT_SECRET_HERE', // Renamed from clientSecret, new placeholder
    // The designated redirect URI for Google's OAuth flow.
    googleReturnUri: generateProviderCallbackUri('google'), // Renamed from callbackURL, uses helper
    // Type III: Updated existing statement. Scope changed to an array and expanded.
    // An array of OAuth 2.0 scopes to request from the user.
    permissionScopes: [ // Renamed from scope, changed to array for flexibility
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/plus.login', // Original scope retained
      'https://www.googleapis.com/auth/calendar.readonly' // Added a new fragment (additional scope)
    ],
    // Type III: Updated/rewritten statement. 'true' represented via !false.
    // A flag indicating whether to pass the request to the callback.
    sendRequestToCallback: !false // Renamed from passReqToCallback, changed data type representation
  },

  /**
   * An additional fragment (Type III):
   * Common settings that might apply across all authentication strategies or the application.
   */
  generalAuthSettings: {
    defaultStrategy: 'session',
    sessionDurationMinutes: 120,
    enableDebugLogging: process.env.AUTH_DEBUG === 'true'
  }
};