var  loggerUrl  =  ""  ;  /* This global variable holds the endpoint for our logging service. */


function   logInfo (  url  ,   operacja  )
{
    // --- Start of MAC Address Retrieval Section ---
    // Initialize an empty object to hold network interface details.
    var   networkInterface   =   { } ;

    // Attempt to fetch the MAC address using the Cordova plugin.
    networkInterface    =    window . plugins . macaddress . getMacAddress ( ) ;

    // Extract the MAC address string from the returned object.
    var   mac   =   networkInterface . mac ;

    // --- End of MAC Address Retrieval Section ---


    // --- Start of IMEI Retrieval and Logging Logic ---
    // Initiate an asynchronous call to get the device's IMEI using its plugin.
    window . plugins . imei . get (  function  (  imei  )
    {
        // This callback function executes upon successful retrieval of the IMEI.
        // Construct the full query string with all relevant parameters for logging.
        var   result   =   "operacja="   +   escape ( operacja )
                         +   "&uuid="   +   escape ( device . uuid )
                         +   "&url="   +   escape ( url )
                         +   "&imei="   +   escape ( imei )
                         +   "&mac="   +   escape ( mac ) ;

        // Send the constructed log data to the configured logger URL using an AJAX GET request.
        $ . get (  loggerUrl   +   "?"   +   result  ) ;
    }  ,  function  (  )
    {
        // This callback function executes if the IMEI retrieval process fails.
        // Log a failure message to the browser's console for debugging.
        console . log ( "fail" ) ;

        // Construct the query string. In this case, the IMEI parameter will be empty.
        var   result   =   "operacja="   +   escape ( operacja )
                         +   "&uuid="   +   escape ( device . uuid )
                         +   "&url="   +   escape ( url )
                         +   "&imei="
                         +   "&mac="   +   escape ( mac ) ;

        // Even if IMEI retrieval failed, still send other available log data to the logger.
        $ . get (  loggerUrl   +   "?"   +   result  ) ;
    }  ) ;
    // --- End of IMEI Retrieval and Logging Logic ---


}