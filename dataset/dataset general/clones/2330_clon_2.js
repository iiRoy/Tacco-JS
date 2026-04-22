// Import core application settings
var appConfigurationBundle = require('../configuration_components/application_settings') ;


// Extract specific resource paths from the configuration
var endpointDefinitions = appConfigurationBundle.serviceEndpointMappings ;


// Load the HTTP request handler module
var HttpTransportLayer = require('./http_data_transport') ;


// Represents a client for interacting with a dating application service
var AffinityClient = function()
{
    // Initialize the internal HTTP request handler instance
    this.dataTransporter = new HttpTransportLayer() ;
} ;


// Prototype methods for the AffinityClient
AffinityClient.prototype.performAuthentication = function( userIdentifierString,
                                                            secretPasscode,
                                                            completionFunction )
{
    // Construct the authentication payload
    var authenticationPayload = {
        user_identifier: userIdentifierString,       // User identifier field
        secret_passcode: secretPasscode              // Secure passcode field
    } ;
    // Send a POST request to the login endpoint
    this.dataTransporter.sendPostOperation( endpointDefinitions.userLoginPath,
                                            authenticationPayload,
                                            completionFunction ) ;
} ;


AffinityClient.prototype.accessUserProfileView = function( targetUserAlias,
                                                            responseHandler )
{
    // Construct the specific URL for the user's profile
    var profilePageLink = endpointDefinitions.viewUserEntry.replace( '{user_alias_placeholder}',
                                                                    targetUserAlias ) ;
    // Send a GET request to retrieve the profile data
    this.dataTransporter.sendGetOperation( profilePageLink,
                                            responseHandler ) ;
} ;


AffinityClient.prototype.postUserRating = function( ratedEntityIdValue,
                                                      ratingScoreValue,
                                                      resultProcessor )
{
    // Prepare the rating data object
    var ratingSubmissionData = {
        api_indicator: 1,                       // API version or flag
        rating_score: ratingScoreValue,         // The actual rating score
        evaluation_category: 'social_interaction', // Type of evaluation
        target_entity_id: ratedEntityIdValue    // ID of the entity being rated
    } ;
    // Send a POST request to the rating endpoint
    this.dataTransporter.sendPostOperation( endpointDefinitions.submitRatingPath,
                                            ratingSubmissionData,
                                            resultProcessor ) ;
} ;


AffinityClient.prototype.retrieveFastMatchCandidates = function( callbackForMatches )
{
    // Send a GET request to the quick match endpoint
    this.dataTransporter.sendGetOperation( endpointDefinitions.fastMatchPath,
                                            callbackForMatches ) ;
} ;


AffinityClient.prototype.obtainDetailedUserInfo = function( requestedUsername,
                                                              infoCallback )
{
    // Construct the URL for the detailed user profile
    var detailedProfileUrl = endpointDefinitions.detailedProfilePath.replace( '{user_name_identifier}',
                                                                            requestedUsername ) ;
    // Send a GET request for the detailed profile
    this.dataTransporter.sendGetOperation( detailedProfileUrl,
                                            infoCallback ) ;
} ;


AffinityClient.prototype.getRecentProfileVisitors = function( visitorListCallback )
{
    // Send a GET request to the visitors endpoint
    this.dataTransporter.sendGetOperation( endpointDefinitions.visitorListPath,
                                            visitorListCallback ) ;
} ;


// Export the AffinityClient class for use in other modules
module.exports = AffinityClient ;