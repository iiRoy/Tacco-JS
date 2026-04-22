define ( [ 'angularAMD' , 'storage' , 'moment-src' ] ,
    function ( angularAMD , storage , moment )
{
    // This module defines the 'controllers' Angular module
    // and registers the 'DashboardCtrl' controller within it.

    var controllers = angular . module ( 'controllers' , [ 'services' ] ) ;

    controllers . controller ( 'DashboardCtrl' ,
        function ( $scope , $interval , $http , LS , locale )
    {

        // Constant for Kelvin to Celsius conversion offset.
        var KELVIN = 273.15 ;

        /*
         *  Declare all core variables used throughout the controller.
         *  These will hold user data, storage information,
         *  and current date/time values.
         */
        var user ,
            storageFiles ,
            background ,
            date ,
            currentDate ,
            currentHour ;

        // Function to update the application's cache in localStorage.
        $scope . updateCache = function ( ) {
            try {
                // Store current date and hour in storageFiles object.
                storageFiles . date = currentDate ;
                storageFiles . hour = currentHour ;
                // Persist the updated storageFiles to localStorage.
                LS . setData ( JSON . stringify ( storageFiles ) ) ;
            }
            catch ( e ) {
                // Handle potential storage errors, e.g., quota exceeded.
                console . log ( "Storage failed: " + e ) ;
                console . log ( "Attempting to auto-resolve by clearing localStorage and re-initializing." ) ;
                localStorage . clear ( ) ; // Clear all local storage data.
                $scope . startup ( ) ; // Re-initialize the application.
            }
        } ; // End of updateCache function.

        // Sets the background image of the dashboard.
        $scope . setBackground = function ( forceChange ) {

            var canvas = document . getElementById ( 'background' ) ;
            canvas . width = window . innerWidth ;
            canvas . height = window . innerHeight ;
            var ctx = canvas . getContext ( '2d' ) ;
            var img = new Image ;
            ctx . width = img . width ;
            ctx . height = img . height ;

            // Callback when the image has finished loading.
            img . onload = function ( ) {
                if ( img . src != "" ) {
                    ctx . drawImage ( img , 0 , 0 , img . width , img . height , 0 , 0 , canvas . width , canvas . height ) ;
                }
                loaded ( ) ;
            } ;

            // Helper function to clean up image object after loading.
            var loaded = function ( ) {
                img . src = "" ; // Clear image source.
                img = null ;     // Dereference image object.
            } ;

            // Check if background needs to be updated (undefined, forced, or date expired).
            if ( typeof storageFiles . background === "undefined"  || forceChange || LS . hasDateExpired ( currentDate ) ) {
                // Generate a random image URL.
                var url = "img/" + ( Math . floor ( Math . random ( ) * 63 ) + 1 ) + ".jpg" ;
                storageFiles . background = url ; // Store the new background URL.
                $scope . updateCache ( ) ;        // Update the cache.
            }
            // Set the image source, which triggers img.onload.
            img . src = storageFiles . background ;
            ctx . width = img . width ;
            ctx . height = img . height ;
        } ; // End of setBackground function.

        // Callback function once the quote has been loaded.
        $scope . quoteLoaded = function ( ) {
            $scope . quote = storageFiles . quote ;
        } ; // End of quoteLoaded function.

        // Fetches and sets a daily quote.
        $scope . setQuote = function ( ) {

            // Check if quote is undefined or has expired.
            if ( typeof storageFiles . quote === "undefined" || LS . hasDateExpired ( currentDate ) ) {
                LS . getQuotes ( ) . then ( function ( response ) {
                    // Select a random quote from the response data.
                    storageFiles . quote = response . data . quotes [ ( Math . floor ( Math . random ( ) * 270 ) + 1 ) ] ;
                    $scope . updateCache ( ) ; // Update cache with new quote.
                    $scope . quoteLoaded ( ) ; // Display the loaded quote.
                } ) ;
            } else {
                $scope . quoteLoaded ( ) ; // If not expired, just display existing quote.
            }
        } ; // End of setQuote function.

        // Callback function once weather data has been loaded.
        $scope . weatherLoaded = function ( ) {
            $scope . temp = storageFiles . temp ;
            $scope . loc = storageFiles . loc ;
        } ; // End of weatherLoaded function.

        // Fetches and sets weather information.
        $scope . setWeather = function ( ) {

            // Check if weather is undefined, location changed, or hour expired.
            if ( typeof storageFiles . temp === "undefined" || storageFiles . loc != user . location || LS . hasHourExpired ( currentHour ) ) {

                LS . getWeather ( user . location ) . then ( function ( response ) {
                    var temp = response . data . main . temp ;
                    storageFiles . loc = user . location ; // Store the current location.
                    // Convert temperature based on user preference (Celsius or Fahrenheit).
                    storageFiles . temp = ( user . temperatureType == 0 ?
                        Math . round ( parseInt ( temp ) - parseInt ( KELVIN ) , 2 ) + "°C" :
                        Math . round ( ( ( parseInt ( temp ) - parseInt ( KELVIN ) ) * 9 / 5 ) + 32 , 2 ) + "°F" ) ;
                    $scope . updateCache ( ) ; // Update cache with new weather data.
                    $scope . weatherLoaded ( ) ; // Display the loaded weather.
                } ) ;
            } else {
                $scope . weatherLoaded ( ) ; // If not expired, just display existing weather.
            }
        } ; // End of setWeather function.

        // Determines the state of the day based on the given hour.
        $scope . getStateOfDay = function ( hours ) {
            if ( hours >= 6 && hours < 12 )
            {
                return "time.morning" ;
            } else if ( hours >= 12 && hours < 14 ) {
                return "time.afternoon" ;
            } else if ( hours >= 14 && hours < 18 ) {
                return "time.day" ;
            } else if ( hours >= 18 && hours < 22 ) {
                return "time.evening" ;
            } else {
                return "time.night" ;
            }
        } ; // End of getStateOfDay function.

        // Sets the current date and time for display.
        $scope . setDateAndTime = function ( ) {
            locale . ready ( 'time' ) . then ( function ( ) {
                moment . locale ( user . locale ) ; // Set moment.js locale based on user preference.
                $scope . name = user . name ; // Display user's name.
                // Get the localized string for the current state of day.
                $scope . daystate = locale . getString ( $scope . getStateOfDay ( moment ( ) . get ( 'hour' ) ) ) ;
                $scope . date = moment ( ) . format ( user . dateformat ) ; // Format date based on user preference.
            } ) ;

            $scope . clock = moment ( ) . format ( 'HH:mm' ) ; // Display current time.
        } ; // End of setDateAndTime function.

        // Initializes the dashboard with user data and sets up periodic updates.
        $scope . startup = function ( ) {

            LS . loadUser ( ) . then ( function ( response ) {
                user = response . data ; // Load user data.
                moment . locale ( user . locale ) ; // Set moment.js locale.
                storageFiles = LS . getData ( ) || { } ; // Load cached storage data or initialize empty object.
                background = document . get ElementById ( "background" ) ; // Get background canvas element.
                date = new Date ( ) ; // Create a new Date object.
                currentDate = ( date . getMonth ( ) + 1 ) . toString ( ) + date . getDate ( ) . toString ( ) ; // Format current date for storage.
                currentHour = date . getHours ( ) ; // Get current hour.

                $scope . setBackground ( ) ; // Initialize background.
                $scope . setWeather ( ) ;    // Initialize weather.
                $scope . setQuote ( ) ;      // Initialize quote.
            } ) ;

            // Set up an interval to update date and time every second.
            $interval ( function ( ) {
                $scope . setDateAndTime ( ) ;
            } , 1000 ) ;
        } ; // End of startup function.

        // Immediately call the startup function when the controller loads.
        $scope . startup ( ) ;

    } ) ; // End of DashboardCtrl controller.

} ) ; // End of define block.