/*
 * This script facilitates the creation of RSS feeds from Twitter data
 * using the Google Apps Script environment.
 *
 * It leverages the Twitter API v1.1 to generate feeds for various
 * Twitter entities, such as:
 * - User timelines
 * - Search results
 * - User favorites
 * - Twitter Lists
 *
 * Authored by: Amit Agarwal <amit@labnol.org>
 * Contributions by: Mitchell McKenna <mitchellmckenna@gmail.com>
 *
 * Date: June 2024
 * Version: 1.0.1
 *
 * Note: Ensure your Twitter API keys are correctly configured.
 */

function   start ()
{
    // Retrieve your Twitter API keys from the developer portal (dev.twitter.com/apps).
    // These keys are essential for authenticating with the Twitter API.
    var CONSUMER_KEY    = "YOUR_TWITTER_CONSUMER_KEY" ;
    var CONSUMER_SECRET = "YOUR_TWITTER_CONSUMER_SECRET" ;

    // Proceed to initialize the application with the obtained keys.
    initialize ( CONSUMER_KEY , CONSUMER_SECRET ) ;
}


function initialize ( key , secret )
{
    // Store the consumer key in ScriptProperties for secure access.
    ScriptProperties . setProperty ( "TWITTER_CONSUMER_KEY" , key ) ;

    // Store the consumer secret, also in ScriptProperties.
    ScriptProperties . setProperty ( "TWITTER_CONSUMER_SECRET" , secret ) ;

    // Obtain the URL of the currently deployed Apps Script web app.
    var   url   =   ScriptApp . getService ( ) . getUrl ( ) ;

    // Check if the URL is valid, indicating the script is deployed as a web app.
    if ( url )
    {
        // Attempt to connect to Twitter, primarily for OAuth setup.
        connectTwitter ( ) ;

        // Initialize an empty string to build the email message.
        var msg = "" ;

        // Add a header for the sample RSS feeds.
        msg += "Sample RSS Feeds for Twitter\n" ;
        msg += "============================\n" ; // Separator line for readability.

        // Append information for a Twitter Timeline feed example.
        msg += "\nTwitter Timeline of user @labnol" ;
        msg += "\n" + url + "?action=timeline&q=labnol" ;

        // Append information for a Twitter Favorites feed example.
        msg += "\n\nTwitter Favorites of user @labnol" ;
        msg += "\n" + url + "?action=favorites&q=labnol" ;

        // Append information for a Twitter List feed example.
        msg += "\n\nTwitter List labnol/friends-in-india" ;
        msg += "\n" + url + "?action=list&q=labnol/friends-in-india" ;

        // Append information for a Twitter Search feed example.
        msg += "\n\nTwitter Search for New York" ;
        msg += "\n" + url + "?action=search&q=new+york" ;

        // Instructions for customizing the feeds.
        msg += "\n\nYou should replace the value of the 'q' parameter in the URLs to the one you want." ;
        msg += "\n\nFor help, please refer to https://github.com/MitchellMcKenna/twitter-rss-google-apps-script" ;

        // Send the compiled message as an email to the active user.
        MailApp . sendEmail ( Session . getActiveUser ( ) . getEmail ( ) , "Twitter RSS Feeds" , msg ) ;
    }
}


function doGet ( e )
{
    // Extract the 'action' parameter from the request.
    var a = e . parameter . action ;

    // Extract the 'q' (query) parameter from the request.
    var q = e . parameter . q ;

    var feed ;        // Variable to hold the Twitter API endpoint URL.
    var permalink ;   // Variable for the permanent link to the Twitter content.
    var description ; // Variable for the RSS feed's description.

    switch ( a )
    {
        case "timeline" :
            // Case: Request for a user's timeline.
            feed = "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=" + q ;
            permalink = "https://twitter.com/" + q ;
            description = "Twitter updates from " + q + "." ;
            break ;

        case "search" :
            // Case: Request for tweets matching a search query.
            // The query string 'q' must be URL-encoded for safety.
            feed = "https://api.twitter.com/1.1/search/tweets.json?q=" + encodeString ( q ) ;
            permalink = "https://twitter.com/search?q=" + encodeString ( q ) ;
            description = "Twitter updates from search for: " + q + "." ;
            break ;

        case "favorites" :
            // Case: Request for a user's favorite tweets.
            feed = "https://api.twitter.com/1.1/favorites/list.json?screen_name=" + q ;
            permalink = "https://twitter.com/" + q + "/favorites/" ;
            description = "Twitter favorites from " + q + "." ;
            break ;

        case "list" :
            // Case: Request for tweets from a specific Twitter list.
            // The 'q' parameter is expected to be in "owner_screen_name/slug" format.
            var i = q . split ( "/" ) ; // Split to get owner and slug.
            feed = "https://api.twitter.com/1.1/lists/statuses.json?slug=" + i [ 1 ] + "&owner_screen_name=" + i [ 0 ] ;
            permalink = "https://twitter.com/" + q ;
            description = "Twitter updates from " + q + "." ;
            break ;

        default :
            // Default case: If no specific action is provided, default to a general timeline.
            feed = "https://api.twitter.com/1.1/statuses/user_timeline.json" ;
            permalink = "https://twitter.com" ;
            description = "Twitter timeline." ;
            break ;
    }

    // Generate a unique ID for caching based on the feed URL.
    var id = Utilities . base64Encode ( feed ) ;

    // Get the public cache service instance.
    var cache = CacheService . getPublicCache ( ) ;

    // Attempt to retrieve the RSS feed from the cache using the generated ID.
    var rss = cache . get ( id ) ;

    // If the RSS feed is not found in the cache, generate it.
    if ( ! rss )
    {
        // Call jsonToRss to fetch Twitter data and convert it to RSS format.
        rss = jsonToRss ( feed , permalink , description , a , q ) ;

        // Store the newly generated RSS feed in the cache for 900 seconds (15 minutes).
        cache . put ( id , rss , 900 ) ;
    }

    // Return the RSS feed as plain text with the correct MIME type.
    return ContentService . createTextOutput ( rss )
                          . setMimeType ( ContentService . MimeType . RSS ) ;
}


function jsonToRss ( feed , permalink , description , type , key )
{
    // Ensure OAuth service is configured before making API calls.
    oAuth ( ) ;

    // Define options for the URL fetch request.
    var options =
    {
        "method"         :  "get" ,
        "oAuthServiceName" : "twitter" ,
        "oAuthUseToken"  :  "always"
    } ;

    try
    {
        // Execute the API call to fetch data from the Twitter feed URL.
        var result = UrlFetchApp . fetch ( feed , options ) ;

        // Check if the API call was successful (HTTP status code 200).
        if ( result . getResponseCode ( ) === 200 )
        {
            // Parse the JSON response from Twitter.
            var tweets = Utilities . jsonParse ( result . getContentText ( ) ) ;

            // If the feed type is 'search', the actual tweets are nested under 'statuses'.
            if ( type == "search" )
            {
                tweets = tweets . statuses ;
            }

            // Proceed only if tweets data is available.
            if ( tweets )
            {
                var len = tweets . length ; // Get the number of tweets.

                var rss = "" ; // Initialize an empty string to build the RSS XML.

                // If there are tweets, begin constructing the RSS XML.
                if ( len )
                {
                    // Start with the XML declaration and RSS root element.
                    rss += '<?xml version="1.0"?><rss version="2.0">' ;
                    // Add the channel element with title, link, and description.
                    rss += '<channel><title>Twitter ' + type + ': ' + key + '</title>' ;
                    rss += '<link>' + permalink + '</link>' ;
                    rss += '<description>' + description + '</description>' ;

                    // Loop through each tweet to create an RSS item.
                    for ( var i = 0 ; i < len ; i ++ )
                    {
                        // Extract sender's screen name.
                        var sender = tweets [ i ] . user . screen_name ;
                        // Sanitize tweet text for XML compatibility.
                        var tweet = htmlentities ( tweets [ i ] . text ) ;
                        // Parse the creation date of the tweet.
                        var date = new Date ( tweets [ i ] . created_at ) ;

                        // Add a publication date for the entire channel, using the first tweet's date.
                        if ( i === 0 )
                        {
                            rss += '<pubDate>' + date . toUTCString ( ) + '</pubDate>' ;
                        }

                        // Start the RSS item element.
                        rss += "<item>" ;
                        // Add item title (sender and tweet content).
                        rss += "<title>" + sender + ": " + tweet + "</title>" ;
                        // Add item publication date.
                        rss += "<pubDate>" + date . toUTCString ( ) + "</pubDate>" ;
                        // Add a unique identifier for the item.
                        rss += "<guid isPermaLink='false'>" + tweets [ i ] . id_str + "</guid>" ;
                        // Add a direct link to the tweet on Twitter.
                        rss += "<link>https://twitter.com/" + sender + "/statuses/" + tweets [ i ] . id_str + "</link>" ;
                        // Add item description (tweet content).
                        rss += "<description>" + tweet + "</description>" ;
                        // Close the RSS item element.
                        rss += "</item>" ;
                    }

                    // Close the channel and RSS root elements.
                    rss += "</channel></rss>" ;

                    // Return the complete RSS XML string.
                    return rss ;
                }
            }
        }
    }
    catch ( e )
    {
        // Log any errors that occur during the fetch or parsing process.
        Logger . log ( e . toString ( ) ) ;
    }
}


function connectTwitter ( )
{
    // Initialize the OAuth service for Twitter.
    oAuth ( ) ;

    // Define the Twitter API endpoint for checking rate limit status.
    var search = "https://api.twitter.com/1.1/application/rate_limit_status.json" ;

    // Set up options for the API call.
    var options =
    {
        "method"           : "get" ,
        "oAuthServiceName" : "twitter" ,
        "oAuthUseToken"    : "always"
    } ;

    try
    {
        // Attempt to fetch data from the rate limit status endpoint.
        // This acts as a test to ensure OAuth is working.
        var result = UrlFetchApp . fetch ( search , options ) ;
    }
    catch ( e )
    {
        // If an error occurs (e.g., authentication failure), log it.
        Logger . log ( e . toString ( ) ) ;
    }
}


function encodeString ( q )
{
    // Encode the entire string first.
    var str = encodeURIComponent ( q ) ;
    // Replace '!' with '%21' (RFC 3986 compliance, encodeURIComponent doesn't do this).
    str = str . replace ( /!/g , '%21' ) ;
    // Replace '*' with '%2A'.
    str = str . replace ( /\*/g , '%2A' ) ;
    // Replace '(' with '%28'.
    str = str . replace ( /\(/g , '%28' ) ;
    // Replace ')' with '%29'.
    str = str . replace ( /\)/g , '%29' ) ;
    // Replace ''' with '%27'.
    str = str . replace ( /'/g , '%27' ) ;
    return str ;
}


function htmlentities ( str )
{
    // Replace ampersands with HTML entity.
    str = str . replace ( /&/g , "&amp;" ) ;
    // Replace greater than signs with HTML entity.
    str = str . replace ( />/g , "&gt;" ) ;
    // Replace less than signs with HTML entity.
    str = str . replace ( /</g , "&lt;" ) ;
    // Replace double quotes with HTML entity.
    str = str . replace ( /"/g , "&quot;" ) ;
    // Replace single quotes with HTML entity.
    str = str . replace ( /'/g , "&#039;" ) ;
    return str ;
}


function oAuth ( )
{
    // Add a new OAuth service named "twitter".
    var oauthConfig = UrlFetchApp . addOAuthService ( "twitter" ) ;

    // Set the URL for obtaining an access token.
    oauthConfig . setAccessTokenUrl ( "https://api.twitter.com/oauth/access_token" ) ;

    // Set the URL for requesting a temporary token.
    oauthConfig . setRequestTokenUrl ( "https://api.twitter.com/oauth/request_token" ) ;

    // Set the URL for user authorization.
    oauthConfig . setAuthorizationUrl ( "https://api.twitter.com/oauth/authorize" ) ;

    // Retrieve and set the consumer key from script properties.
    oauthConfig . setConsumerKey ( ScriptProperties . getProperty ( "TWITTER_CONSUMER_KEY" ) ) ;

    // Retrieve and set the consumer secret from script properties.
    oauthConfig . setConsumerSecret ( ScriptProperties . getProperty ( "TWITTER_CONSUMER_SECRET" ) ) ;
}