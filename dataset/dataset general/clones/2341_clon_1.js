var win =  Ti.UI.currentWindow ;

  /*
   * This variable holds the base URL for the application's website.
   * It is used to construct other API endpoints.
   */
  var website = "http://larryvilleku.com";

  // The main data feed URL, limited to 30 items.
  var feed = website + "/api/dev1/items.json?limit=30";

  // Note on performance: Query limited to 20 or 30 because Titanium starts getting sluggish with more results.
  // It has been observed to crash on Android devices with larger data sets.
  // Future Enhancement: Implement a "Load More" button for pagination.
  // The URL query string would typically look like: ...json?limit=20&offset=20, or using an incrementing index (i + 20).
  // A basic version exists with 'more_button' (check the EventListener), but it only fetches the *next* 20 items.
  // Seeking ideas for a more robust pagination solution.

  /******************************************************************
   ******************************************************************
   *             GLOBAL APPLICATION-WIDE VARIABLES                  *
   *              Defined for consistent access                     *
   *           across different parts of this file.                 *
   ******************************************************************
   ******************************************************************/

  // Attempt to centralize all variables used in multiple locations within this script.

  var feed_toolbar_image_height = 35 ; // Height setting for toolbar images in the feed view.
  var feed_toolbar_image_width = 35 ; // Width setting for toolbar images in the feed view.

  var feed_toolbar_image_bottom = 2 ; // Bottom padding for toolbar images.
  var title_bar_height = 40 ; // Standard height for the application's title bars.

  var feed_view_name = 'Feed' ; // The display name for the feed view.
  var settings_view_width = 200 ; // Fixed width for the settings panel.

  // --- Style Definitions: Color Palette ---
  // These colors are primarily used within the detail panes of the feed_view.

  var col1 = '##FF4747' ; // Red color, often used for accents or warnings.
  var col2 = '#6082A6' ; // A standard, regular blue.
  var col3 = '#1D243B' ; // A dark, deep blue, potentially for backgrounds or primary elements.
  var col4 = '#999' ; // A general-purpose medium grey.
  var col5 = '#f2f2f2' ; // A very light grey, suitable for light backgrounds.
  var col6 = '#2A85E8' ; // A light blue, specifically designated for clickable links.

  // --- Font Definitions ---
  // For more details on custom fonts in Titanium:
  // @see https://wiki.appcelerator.org/display/guides/Custom+Fonts

  var font1 = 'Lobster 1.4' ;
  if ( Ti.Platform.osname == 'android' )
  {
    font1 = 'Lobster' ; // Android requires a simplified font name.
  }

  var font2 = 'League Gothic' ;
  if ( Ti.Platform.osname == 'android' )
  {
    font2 = 'LeagueGothic' ; // Android-specific font name.
  }

  var font3 = 'Open Sans' ;
  if ( Ti.Platform.osname == 'android' )
  {
    font3 = 'OpenSans-Regular' ; // Android-specific font name.
  }

  // --- Geolocation Configuration ---
  // Sets the purpose string for location services, required by iOS.
  Titanium.Geolocation.purpose = "Recieve User Location" ;

  // Sets the desired accuracy for geolocation data.
  Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST ;

  // --- Data Storage and Network Request Setup ---

  var data = [ ] ; // Array to hold TableViewRow data for the feed.
  var annotations = [ ] ; // Array to hold map annotations.

  var xhr = Ti.Network.createHTTPClient ( ) ; // Create a new HTTP client instance.

  xhr.timeout = 1000000 ; // Set a very long timeout for the HTTP request (1,000,000 ms = 16.6 minutes).

  xhr.open ( "GET" , feed ) ; // Prepare the HTTP GET request to the specified feed URL.

  // --- Activity Indicator for Loading State ---
  // When the feed begins loading, a visual indicator is displayed.
  // This prevents users from navigating away prematurely, which is crucial for Android
  // where TableViews can become corrupted if initialized before the feed data is ready.

  var actInd = Titanium.UI.createActivityIndicator ( {
    bottom : 200 ,
    height : 50 ,
    style : Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN ,
    font : {
      fontFamily : 'Helvetica Neue' ,
      fontSize : 15 ,
      fontWeight : 'bold'
    } ,
    color : 'black' ,
    message : 'Loading...' ,
    width : 210
  } ) ;

  actInd.show ( ) ; // Display the activity indicator.

  // --- Timeout for Activity Indicator (Android Fix) ---
  // This timeout is primarily for Android. On iOS, the indicator often disappears automatically
  // once the feed is loaded. For Android, this acts as a splash screen, disabling interaction
  // until a minimum load time has passed.
  setTimeout ( function ( ) {
    actInd.hide ( ) ;
  } , 2000 ) ;

  win.add ( actInd ) ; // Add the activity indicator to the current window.

  // --- Error Handling for Network Requests ---
  // If the HTTP request fails, hide the indicator and show an alert.

  xhr.onerror = function ( ) {
    actInd.hide ( ) ; // Hide the loading indicator.

    var no_internet = Titanium.UI.createAlertDialog ( {
      title : 'No Internet Connection' ,
      message : 'Sorry, but you\'re not connected to the internet, and we can\'t load the map information or feed view. Please try again when a internet connection is avaiable.' ,
      buttonNames : [ 'Shucks' , ] ,
    } ) ;

    no_internet.show ( ) ; // Display the alert dialog.
  } ;

  // --- Success Handler for Network Requests ---
  // This function executes once the HTTP request successfully loads data.

  xhr.onload = function ( ) {

    try {

      // Parse the JSON response and extract the 'features' array.
      var newsitems = JSON.parse ( this.responseText ) .features ;

      // Iterate through each news item to process data for map annotations and feed view.
      for ( var i = 0 ; i < newsitems.length ; i ++ ) {

        // --- Map-Related Variables ---
        // (Feed view variables are defined further down, starting with "row.")
        // Note: Not all available variables from the items.json result are used here.

        var raw_location = newsitems [ i ] .geometry.coordinates ; // Raw coordinate data.
        var clean_location = raw_location.toString ( ) ; // Convert coordinates to string.
        var location = clean_location.split ( ',' ) ; // Split string into latitude and longitude.

        var type = newsitems [ i ] .properties.type ; // Type of the news item.
        var title = newsitems [ i ] .properties.title ; // Title of the news item.
        var created_at = newsitems [ i ] .properties.item_date ; // Creation date of the item.

        // Alternate background colors for rows (zebra striping).
        var bgcolor = ( i % 2 ) == 0 ? '#fff' : '#eee' ;

        var icon = newsitems [ i ] .properties.icon ; // Icon URL for the item.

        // --- Create Map Annotation ---
        // Important: Map icon filenames *must* match the slug of the related schema type.
        // The path refers to a backward directory due to Titanium's optimization for
        // Android/iPhone when using recursive directory calls (this is an assumption).

        var mrker = Titanium.Map.createAnnotation ( {
          latitude : location [ 1 ] , // Latitude from the coordinates.
          longitude : location [ 0 ] , // Longitude from the coordinates.
          title : title , // Annotation title.
          image : '../images/' + type + '.png' , // Path to the custom icon.
          animate : true , // Enable animation for the annotation.
        } ) ;

        // Add the newly created annotation to the annotations array.
        annotations.push ( mrker ) ;

        // --- Begin Feed View Construction: TableView Row ---
        // Create a new TableViewRow for each news item.

        var row = Ti.UI.createTableViewRow ( {
          hasChild : true , // Indicates the row can be clicked to reveal more details.
          height : 'auto' , // Row height adjusts to content.
          backgroundColor : bgcolor
        } ) ;

        // --- Container View for News Item Details ---
        // Holds all the information for a single news item within the row.

        var newsitem_view = Ti.UI.createView ( {
          height : 'auto' , // View height adjusts automatically.
          layout : 'vertical' , // Arranges children vertically.
          left : 5 ,
          top : 5 ,
          bottom : 5 ,
          right : 5
        } ) ;

        // --- Map Icon Display ---
        // Displays the icon associated with the schema (type) of the news item.

        var map_icon_view = Ti.UI.createImageView ( {
          image : icon , // Image source.
          left : 0 ,
          top : 0 ,
          height : 48 ,
          width : 48
        } ) ;
        newsitem_view.add ( map_icon_view ) ; // Add icon to the news item view.

        // --- News Item Type Label ---

        var newsitem_type = Ti.UI.createLabel ( {
          text : type.toUpperCase ( ) , // Display type in uppercase.
          left : 54 ,
          width : 120 ,
          top : -48 , // Position relative to the icon.
          bottom : 2 ,
          height : 16 ,
          textAlign : 'left' ,
          color : '#444444' ,
          font : {
            fontFamily : font2 ,
            fontSize : 14 ,
            fontWeight : 'bold'
          }
        } ) ;
        newsitem_view.add ( newsitem_type ) ; // Add type label to the news item view.

        // --- Created At Information Label ---

        var created_at_label = Ti.UI.createLabel ( {
          text : created_at , // Display creation date/time.
          right : 0 ,
          top : -18 , // Position relative to previous elements.
          bottom : 2 ,
          height : 14 ,
          textAlign : 'right' ,
          width : 110 ,
          color : '#444444' ,
          font : {
            fontFamily : font2 ,
            fontSize : 12
          }
        } ) ;
        newsitem_view.add ( created_at_label ) ; // Add created_at label.

        // --- News Item Title Label ---

        var newsitem_title = Ti.UI.createLabel ( {
          text : title , // Display the news item's title.
          left : 54 ,
          top : 0 ,
          bottom : 2 ,
          height : 'auto' , // Height adjusts to content.
          width : 236 ,
          textAlign : 'left' ,
          font : {
            fontSize : 14
          }
        } ) ;
        newsitem_view.add ( newsitem_title ) ; // Add title label.

        // --- Assemble the Row ---
        // Combine the news item view into the TableViewRow.

        row.add ( newsitem_view ) ; // Add the aggregated news item view to the row.
        row.className = 'item' + i ; // Assign a class name for potential styling/identification.
        data [ i ] = row ; // Store the fully constructed row in the data array.

        /**************************************************************
         *********** FEED VIEW VARIABLES FOR DETAIL VIEW **************
         **************************************************************/

        // The 'description' attribute is a reserved property for TableRow defaults.
        // Therefore, 'content' is used instead to store the item's description.
        row.content = newsitems [ i ] .properties.description ;
        row.color = newsitems [ i ] .properties.color ; // Item's specific color.
        row.type = type ; // Item's type.
        row.url = newsitems [ i ] .properties.description ; // URL (re-using description for now, possibly a bug).
        row.icon = icon ; // Item's icon.

        // The 'title' attribute is also a common property. 'heading' is used for the item's title.
        row.heading = title ;
        row.created_at = created_at ; // Item's creation date.
        row.news_id = newsitems [ i ] .properties.id ; // Unique ID for the news item.
      }
      // End of processing feed data and generating associated elements.

      /**************************************************************
       ***************** HEADING BAR COMPONENT **********************
       **************************************************************/

      var heading_bar = Titanium.UI.createView ( {
        top : 0 , // Position at the top of the window.
        height : title_bar_height , // Use the predefined title bar height.
        backgroundColor : col3 , // Use the dark blue color.
      } ) ;

      var settings_button = Titanium.UI.createButton ( {
        left : 10 , // Position from the left edge.
        image : '../images/close_x.png' , // Image for the button.
        top : 5 ,
        height : 30 ,
        width : 30
      } ) ;

      // The text of this label will be dynamically updated based on the current view.
      var heading_text = Titanium.UI.createLabel ( {
        shadowColor : '#ccc' , // Shadow color for text.
        shadowOffset : {
          x : 0 ,
          y : 1
        } , // Shadow offset.
        color : '#ffffff' , // Text color (white).
        height : title_bar_height , // Match heading bar height.
        text : 'Map' , // Initial text value.
        textAlign : 'center' , // Center-align the text.
        width : '100%' , // Occupy full width.
        font : {
          fontFamily : font1 ,
          fontSize : 30 ,
        }
      } ) ;

      var settings_title = Titanium.UI.createLabel ( {
        shadowColor : '#ccc' ,
        shadowOffset : {
          x : 0 ,
          y : 1
        } ,
        color : '#ffffff' ,
        height : title_bar_height ,
        text : 'Navigate' , // Title for the settings panel.
        textAlign : 'center' ,
        width : settings_view_width , // Width matches the settings view.
        top : 2 ,
        font : {
          fontFamily : font1 ,
          fontSize : 30 ,
        }
      } ) ;

      var settings_close = Titanium.UI.createImageView ( {
        image : '../images/close_x.png' , // Close icon for settings.
        right : 5 ,
        top : 2 ,
        height : 28 ,
        width : 28
      } ) ;

      // --- Event Listener for Settings Button ---
      // Toggles the visibility and position of the settings view.

      settings_button.addEventListener ( 'click' , function ( ) {
        if ( settings_view.left === '0' ) {
          overlay.animate ( {
            opacity : 0 ,
            duration : 300
          } ) ;
          settings_view.animate ( {
            left : '-' + settings_view_width ,
            duration : 300
          } ) ;
        } else {
          overlay.animate ( {
            opacity : 0.6 ,
            duration : 300
          } ) ;
          settings_view.animate ( {
            left : 0 ,
            duration : 300
          } ) ;
        }
      } ) ;

      // --- Event Listener for Settings Close Button ---
      // Closes the settings view.

      settings_close.addEventListener ( 'click' , function ( ) {
        overlay.animate ( {
          opacity : 0 ,
          delay : 100 ,
          duration : 300
        } ) ;
        settings_view.animate ( {
          left : '-' + settings_view_width ,
          duration : 300
        } ) ;
      } ) ;

      // --- Settings View Container ---

      var settings_view = Titanium.UI.createView ( {
        backgroundColor : col3 , // Dark blue background.
        width : settings_view_width , // Predefined width.
        left : '-' + settings_view_width , // Initially hidden off-screen to the left.
        height : '100%' , // Occupy full height.
      } ) ;

      // --- Overlay for Settings View ---
      // A semi-transparent overlay that appears when settings are open.

      var overlay = Titanium.UI.createView ( {
        backgroundColor : 'black' ,
        width : '100%' ,
        opacity : 0 , // Initially hidden.
      } ) ;

      // --- Reference for Custom TableView Rows ---
      // LEARN: http://cssgallery.info/custom-row-for-tableview-in-appcelerator-titanium/

      var settingsData = [ {
        heading : 'MAP' ,
        event : 'map' ,
        hasChild : true ,
        newwin : false ,
        winurl : 'none'
      } , {
        heading : 'FEED' ,
        event : 'map' ,
        hasChild : true ,
        newwin : false ,
        winurl : 'none'
      } , {
        heading : 'REFRESH' ,
        event : 'map' ,
        hasChild : true ,
        newwin : false ,
        winurl : 'none'
      } , {
        heading : 'SUBMIT' ,
        event : 'map' ,
        hasChild : true ,
        newwin : true ,
        winurl : 'submit.js'
      } , {
        heading : 'HELP' ,
        event : 'map' ,
        hasChild : true ,
        newwin : true ,
        winurl : 'help.js'
      } , {
        heading : 'INFO' ,
        event : 'map' ,
        hasChild : true ,
        newwin : true ,
        winurl : 'info.js'
      } , ] ;
      var settings = [ ] ; // Array to hold constructed settings rows.

      // Populate the settings array with TableViewRows.
      for ( var c = 0 ; c < settingsData.length ; c ++ ) {
        var settingsRow = Titanium.UI.createTableViewRow ( ) ;
        var settingsHeading = Titanium.UI.createLabel ( {
          text : settingsData [ c ] .heading ,
          font : {
            fontFamily : font2 ,
            fontSize : 28 ,
          } ,
          width : 'auto' ,
          left : 5 ,
          textAlign : 'left' ,
        } ) ;

        settingsRow.add ( settingsHeading ) ; // Add heading label to the row.
        settingsRow.hasChild = settingsData [ c ] .hasChild ; // Set hasChild property.

        settingsRow.color = 'black' ; // Text color for the row (overridden by label).
        settingsRow.className = 'settingsRow' ; // Class name for the row.
        settingsRow.newwin = settingsData [ c ] .newwin ; // Indicates if a new window should open.
        settingsRow.winurl = settingsData [ c ] .winurl ; // URL for the new window.
        settingsRow.heading = settingsData [ c ] .heading ; // Store heading for reference.

        settings.push ( settingsRow ) ; // Add the constructed row to the settings array.
      } ;

      var settingsTable = Titanium.UI.createTableView ( {
        width : 200 ,
        data : settings , // Assign the populated settings array as data.
        minRowHeight : 58 ,
        color : col1 , // Text color for the table view (can be overridden by rows).
        rowBackgroundColor : 'white' ,
        backgroundColor : 'white' ,
        top : title_bar_height , // Position below the title bar.
      } ) ;

      // --- Event Listener for Settings Table Clicks ---
      // Handles actions when a settings item is tapped.

      settingsTable.addEventListener ( 'click' , function ( e ) {
        overlay.animate ( {
          opacity : 0 ,
          duration : 300
        } ) ; // Fade out overlay.
        settings_view.animate ( {
          left : '-' + settings_view_width ,
          duration : 300
        } ) ; // Animate settings view off-screen.

        if ( ( e.rowData.newwin ) === 'true' ) {
          var createWin = Titanium.UI.createWindow ( {
            url : e.rowData.winurl , // Open a new window with the specified URL.
          } ) ;
          createWin.open ( ) ;
        }

        if ( ( e.rowData.heading ) === 'REFRESH' ) {
          actInd.show ( ) ; // Show activity indicator for refresh.
          setTimeout ( function ( ) {
            actInd.hide ( ) ;
          } , 1000 ) ; // Hide after a short delay.
          xhr.open ( "GET" , feed ) ; // Re-open the HTTP request.
          xhr.send ( ) ; // Re-send the request to refresh data.
        }

        if ( ( e.rowData.heading ) === 'MAP' ) {
          feed_view.visible = false ; // Hide the feed view.
          heading_text.text = 'Map' ; // Update title bar text.
        }

        if ( ( e.rowData.heading ) === 'FEED' ) {
          feed_view.visible = true ; // Show the feed view.
          heading_text.text = feed_view_name ; // Update title bar text to feed name.
        }
      } ) ;

      // --- Add Components to Settings View ---

      settings_view.add ( settings_title ) ; // Add the settings title.
      settings_view.add ( settings_close ) ; // Add the close button.
      settings_view.add ( settingsTable ) ; // Add the table of settings options.

      // --- Add Components to Heading Bar ---

      heading_bar.add ( settings_button ) ; // Add the settings button.
      heading_bar.add ( heading_text ) ; // Add the dynamic heading text.
      win.add ( heading_bar ) ; // Add the heading bar to the main window.

      // --- Create the Map View ---

      var mapview = Titanium.Map.createView ( {
        mapType : Titanium.Map.STANDARD_TYPE , // Standard map type.
        animate : true , // Enable map animations.
        region : {
          latitude : 38.9622547128423 ,
          longitude : -95.24254439999999 ,
          latitudeDelta : 0.02 ,
          longitudeDelta : 0.02
        } , // Initial geographic region.
        regionFit : true , // Adjust region to fit content.
        userLocation : true , // Show user's current location.
        visible : true , // Make the map view visible.
        top : title_bar_height , // Position below the title bar.
        annotations : annotations , // Add all generated annotations.
        zoom : 20 , // Set initial zoom level.
      } ) ;

      // Set distance filter for geolocation updates.
      Titanium.Geolocation.distanceFilter = 10 ;

      // --- Add Map to Window ---

      win.add ( mapview ) ; // Add the map view to the current window.
      Titanium.Geolocation.distanceFilter = 10 ; // Redundant setting, but left as in original.

      // --- Create Feed Rows TableView ---

      var feed_rows = Titanium.UI.createTableView ( {
        data : data , // Assign the 'data' array containing feed rows.
        minRowHeight : 58 , // Minimum height for rows.
      } ) ;

      /**************************************************************
       ************* NEWS ITEM MORE DETAIL VIEW *********************
       **************************************************************/

      // --- Event Listener for Feed Rows Clicks ---
      // Displays a detailed view when a feed item is tapped.

      feed_rows.addEventListener ( 'click' , function ( e ) {
        var content_view = Titanium.UI.createView ( {
          backgroundColor : 'white' ,
          right : -500 , // Initially positioned off-screen to the right.
          width : '100%' ,
          top : title_bar_height , // Position below the title bar.
        } ) ;

        // Analytics tracking (commented out in original, kept as-is).
        //Titanium.App.Analytics.trackPageview('/mobile-app/' + e.row.type + '/detail/' + e.row.news_id);

        // Construct a WebView to display content, allowing for HTML styling.
        // This handles CSS styles defined in the head for pretty presentation.
        var actual_content = Ti.UI.createWebView ( {
          html : '<html><head><style type="text/css"> img {width:100%;height:auto} body {font-family:Helvetica,Arial,sans-serif;width:85%;margin-left:7%;}h3 {color:#4bb392;} a {text-decoration:none;}</style></head><body><a href="' + website + '/' + e.row.type + '/detail/' + e.row.news_id + '"><h3>' + e.row.heading + '</h3></a>' + e.row.content + '</body></html>'
        } ) ;

        heading_text.text = 'Details' ; // Update the main heading bar.

        var close_content = Titanium.UI.createImageView ( {
          image : '../images/close_x.png' , // Close icon for the detail view.
          right : 5 ,
          top : 2 ,
          height : 28 ,
          width : 28
        } ) ;

        // --- Event Listener for Close Detail View Button ---

        close_content.addEventListener ( 'click' , function ( ) {
          content_view.animate ( {
            right : -500 ,
            duration : 500
          } ) ; // Animate detail view off-screen.
          heading_text.text = feed_view_name ; // Restore heading text to feed name.
        } ) ;

        // --- Assemble and Display Detail View ---

        content_view.add ( actual_content ) ; // Add the WebView to the content view.
        content_view.animate ( {
          right : 0 ,
          duration : 500
        } ) ; // Animate content view into screen.
        win.add ( content_view ) ; // Add content view to the window.
        win.add ( close_content ) ; // Add the close button.
      } ) ;

      // --- Feed View Container ---
      // This view holds the items from the JSON query as a list,
      // distinct from the map points. Views are used for easier animation.

      var feed_view = Titanium.UI.createView ( {
        top : title_bar_height , // Position below the title bar.
        opacity : 1 , // Fully opaque.
        visible : false , // Initially hidden.
      } ) ;
      feed_view.add ( feed_rows ) ; // Add the TableView of feed rows.

      // --- Final Additions to the Window ---
      // All done with setup, adding remaining views.

      win.add ( feed_view ) ; // Add the feed view.
      win.add ( overlay ) ; // Add the overlay (initially hidden).
      win.add ( settings_view ) ; // Add the settings view (initially hidden).

      // --- Geolocation Function to Update Map Region ---

      function getLocation ( ) {
        Titanium.Geolocation.getCurrentPosition ( function ( e ) {
          var region = {
            latitude : e.coords.latitude ,
            longitude : e.coords.longitude ,
            animate : true ,
            latitudeDelta : 0.02 ,
            longitudeDelta : 0.02
          } ;
          mapview.setLocation ( region ) ; // Set the map's region to current location.
        } ) ;
      }

      // --- Event Listener for Geolocation Updates ---

      Titanium.Geolocation.addEventListener ( 'location' , function ( ) {
        getLocation ( ) ; // Call getLocation when location updates.
      } ) ;
    }
    catch ( E ) {
      alert ( E ) ; // Display any errors encountered during processing.
    }
  } ;

  xhr.send ( ) ; // Send the HTTP request to initiate data loading.