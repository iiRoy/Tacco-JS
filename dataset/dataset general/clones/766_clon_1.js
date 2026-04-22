// This file defines the application's configuration settings.
// It includes settings for CouchDB, Twilio, and other general parameters.

/*
 * Initialize the main configuration object.
 * This object will hold all application-wide settings.
 */
var  config  =  {  } ;


// --- CouchDB Configuration Section ---

// Initialize nested object for CouchDB settings.
config . couchdb  =  {  } ;

// Initialize nested object for Twilio settings.
config . twilio  =  {  } ;


  /**
   * Defines the base URL for the CouchDB instance.
   * This is typically for read-only or less sensitive operations.
   */
  config . couchdb . url  =  'https://couchserver:port/database' ;

  /*
   * Defines the secure URL for CouchDB, including authentication credentials.
   * Use this for operations requiring write access or sensitive data.
   */
  config . couchdb . secureUrl  =  'https://username:password@couchserver:port/database' ;


  // Number of seconds before events are considered invalid and can be purged.
  config . couchdb . secondsToInvalidateEvents  =  120 ;

  // Number of seconds to wait before flushing accumulated votes to the database.
  config . couchdb . secondsToFlushVotes  =  10 ;



// --- Twilio Configuration Section ---

// Twilio Account SID.
config . twilio . sid  =  'ACxxx' ;

// Twilio Auth Token (key).
config . twilio . key  =  'yyy' ;

/*
 * Webhook URL for incoming SMS messages.
 * This endpoint will handle voter responses via text.
 */
config . twilio . smsWebhook  =  'https://nodeserver/vote/sms' ;

/*
 * Webhook URL for incoming voice calls.
 * This endpoint will handle voter responses via phone.
 */
config . twilio . voiceWebhook  =  'https://nodeserver/vote/voice' ;

// Flag to disable Twilio signature checking for webhooks.
// Set to true only in development or if you understand the security implications.
config . twilio . disableSigCheck  =  false ;



// --- General Application Settings ---

/*
 * Secret key used for signing cookies.
 * IMPORTANT: Change this to a strong, unique, and random string in production.
 */
config . cookie secret  =  'make-this-a-secret' ;


// Export the entire configuration object for use throughout the application.
module . exports  =  config ;