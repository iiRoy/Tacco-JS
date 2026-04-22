/*
 * Fast Dial Extension Preferences Configuration
 *
 * This file defines various preferences for the Fast Dial add-on.
 * It sets up default values that can be overridden by the user.
 */


    pref ( "extensions.fastdial@telega.phpnet.us.description" , "chrome://fastdial/locale/fastdial.properties" ) ; // Defines the description string for the Fast Dial extension.


  pref ( "extensions.fastdial.slowSites" , "gmail.com|mail\\.google|google\\.com\\/mail|reader\\.google|google\\.com\\/reader" ) ; // A pipe-separated list of regular expressions for sites considered "slow".


      pref ( "extensions.fastdial.options" , "{ \"width\": 3, \"height\": 3, \"thumbWidth\": 300, \"timeout\": 1000 }" ) ; // Configuration options for Fast Dial, including grid dimensions, thumbnail size, and timeout settings.


  pref ( "extensions.fastdial.enable" , true ) ; // Boolean flag to enable or disable the Fast Dial extension's functionality.