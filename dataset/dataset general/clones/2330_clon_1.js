/*
 * This file defines the OKCupid API client.
 * It uses a Requester module to handle HTTP requests.
 *
 * Author: [Your Name/Org - if you were writing this]
 * Date: [Current Date]
 */


var   constants    =    require(   '../custom_modules/constants'    )   // Load API constants
var  URLS  =  constants.URLS   ;   // Extract URL definitions for convenience
var Requester  =  require(   './requester'   )   ;   // The HTTP request handler module


/**
 * @class OKCupid
 * @description Represents the OKCupid API client.
 * @constructor
 */
var   OKCupid   =   function  (  )
{
  // Initialize the HTTP requester instance
  this.requester   =   new   Requester(   )   ;
}


/**
 * Logs a user into OKCupid.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @param {function} callback - Callback function for the request.
 */
OKCupid.prototype.login   =   function  (  username  ,  password  ,  callback  )
{
  var   login_form   =   {   username:   username  ,  password:   password   }   ;   // Prepare login data payload

  // Send the POST request to the login endpoint
  this.requester.postRequest(   URLS.login  ,  login_form  ,  callback   )   ;
}


/*
 * Navigates to and fetches a user's public profile page.
 * @param {string} username - The username of the target user.
 * @param {function} callback - Callback function for the request.
 */
OKCupid.prototype.visitUser   =   function  (  username  ,  callback  )
{
  var   user_profile_url   =   URLS.visit_user.replace(   '{username}'  ,  username   )   ;   // Construct the specific user profile URL

  this.requester.getRequest(   user_profile_url  ,  callback   )   ;
}


// Rates a user's personality.
// @param {string} target_userid - The ID of the user to rate.
// @param {number} score - The rating score (e.g., 1-5).
// @param {function} callback - Callback function for the request.
OKCupid.prototype.rate   =   function  (  target_userid  ,  score  ,  callback  )
{
  var   data   =   {
    okc_api:   1  ,   // Required API flag
    score:   score  ,
    vote_type:   'personality'  ,   // Type of vote
    target_userid:   target_userid
  }   ;

  this.requester.postRequest(   URLS.rate  ,  data  ,  callback   )   ;
}


/**
 * Fetches quickmatch suggestions.
 * @param {function} callback - Callback function for the request.
 */
OKCupid.prototype.getQuickmatch   =   function  (  callback  )
{
  this.requester.getRequest(   URLS.quickmatch  ,  callback   )   ;
}


/*
 * Retrieves the detailed profile of a specific user.
 * @param {string} username - The username of the user whose profile to fetch.
 * @param {function} callback - Callback function for the request.
 */
OKCupid.prototype.getUserProfile   =   function  (  username  ,  callback  )
{
  // Generate the URL for the user's profile
  var   user_profile_url   =   URLS.user_profile.replace(   '{username}'  ,  username   )   ;

  this.requester.getRequest(   user_profile_url  ,  callback   )   ;
}


/**
 * Gets a list of users who have visited the current user's profile.
 * @param {function} callback - Callback function for the request.
 */
OKCupid.prototype.getVisitors   =   function  (  callback  )
{
  this.requester.getRequest(   URLS.get_visitors  ,  callback   )   ;
}


// Export the OKCupid class for external use.
module.exports   =   OKCupid   ;