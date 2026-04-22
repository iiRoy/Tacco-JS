var mainDisplay = Ti.UI.currentWindow;
var internetSite = "https://example.com";
var infoStream = internetSite + "/api/v2/articles.json?limit=25";
// This query is restricted to 25 items because the platform experiences performance degradation with larger datasets.
// Future enhancements might include a pagination feature, possibly using query parameters like `offset=25` or `start=26`.
// There's a basic "load more" functionality (check the `more_button` EventListener in the original code), but it only fetches the subsequent 20 items.

/**************************************************/
/*********** APPLICATION-WIDE SETTINGS ************/
/**************************************************/
// Variables used across multiple sections are defined here for consistency.

var panelIconSizeVert = 32;
var panelIconSizeHoriz = 32;
var panelIconOffsetY = 3;
var headerStripDimension = 45;
var listingPanelLabel = 'Articles';
var configPanelBreadth = 220;

// Define the visual theme palette for the application.
var primaryHue = '#FF3333'; // Crimson
var secondaryHue = '#507296'; // Muted Blue
var tertiaryHue = '#1A2035'; // Deep Indigo
var quaternaryHue = '#888'; // Medium Gray
var quinaryHue = '#e8e8e8'; // Very Light Gray
var senaryHue = '#207AE0'; // Sky Blue (for hyperlinks)

// Custom font definitions, adapting for Android's font handling.
// More details: https://wiki.appcelerator.org/display/guides/Custom+Fonts
var typeFaceMajor = 'Bebas Neue';
if (Ti.Platform.osname == 'android') {
    typeFaceMajor = 'BebasNeue';
}
var typeFaceMinor = 'Open Sans Condensed Light';
if (Ti.Platform.osname == 'android') {
    typeFaceMinor = 'OpenSans-CondLight';
}
var typeFaceBody = 'Roboto Regular';
if (Ti.Platform.osname == 'android') {
    typeFaceBody = 'Roboto-Regular';
}

Titanium.Geolocation.purpose = "Obtain Current Position";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_HIGH;

    var contentRecords = [];
    var mapMarkers = [];
    var httpClientRequest = Ti.Network.createHTTPClient();
    httpClientRequest.timeout = 1200000; // Extended timeout for potentially slow connections.
    httpClientRequest.open("GET", infoStream);

    // Display a loading indicator to prevent user interaction until data is fetched.
    // This is particularly crucial for Android, where TableViews can misbehave if initialized before data is ready.
    var progressSpinner = Titanium.UI.createActivityIndicator({
        bottom: 180,
        height: 55,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG, // Using a slightly different style
        font: {
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: 'normal'
        },
        color: '#666',
        message: 'Fetching Data...',
        width: 220
    });
    progressSpinner.show();

    // On Android, the indicator doesn't auto-hide. This timeout acts as a fallback splash screen.
    setTimeout(function() {
        progressSpinner.hide();
    }, 2500);
    mainDisplay.add(progressSpinner);

    // Handle network errors gracefully; hide indicator and display an alert.
    httpClientRequest.onerror = function() {
        progressSpinner.hide();
        var offlineAlert = Titanium.UI.createAlertDialog({
            title: 'Network Unavailable',
            message: 'It appears you are not connected to the internet. Please check your connection and try again to view content.',
            buttonNames: ['Okay', ],
        });
        offlineAlert.show();
    };

    // Process the successfully loaded data.
    httpClientRequest.onload = function() {
        try {
            var storyElements = JSON.parse(this.responseText).features;
            for (var idx = 0; idx < storyElements.length; idx++) {

                // Map-related variables (listing view variables follow, prefixed with "row_item.").
                // Not all properties from the JSON response are utilized here.
                var unprocessedCoords = storyElements[idx].geometry.coordinates;
                var formattedCoords = unprocessedCoords.toString();
                var coordinatePair = formattedCoords.split(',');
                var category = storyElements[idx].properties.type;
                var headline = storyElements[idx].properties.title;
                var creationTimestamp = storyElements[idx].properties.item_date;
                var backgroundShade = (idx % 2) == 0 ? '#fff' : '#f5f5f5'; // Alternating row colors
                var visualCue = storyElements[idx].properties.icon;

                // Create a map annotation (marker).
                // Important: Map icon names should match the corresponding schema slug.
                // The image path is relative and optimized for platform-specific builds.
                var mapPin = Titanium.Map.createAnnotation({
                    latitude: coordinatePair[1],
                    longitude: coordinatePair[0],
                    title: headline,
                    image: '../images/' + category + '.png',
                    animate: true,
                });
                // Add the new marker to our collection.
                mapMarkers.push(mapPin);

                // Start building the TableView for the article listing.
                var tableRowElement = Ti.UI.createTableViewRow({
                    hasChild: true,
                    height: 'auto',
                    backgroundColor: backgroundShade
                });

                // Container for each article's summary.
                var itemDisplayContainer = Ti.UI.createView({
                    height: 'auto',
                    layout: 'vertical',
                    left: 7,
                    top: 7,
                    bottom: 7,
                    right: 7
                });

                // Image representing the article's category.
                var categoryImageDisplay = Ti.UI.createImageView({
                    image: visualCue,
                    left: 0,
                    top: 0,
                    height: 50,
                    width: 50
                });
                itemDisplayContainer.add(categoryImageDisplay);

                // Label for the article's category.
                var categoryLabel = Ti.UI.createLabel({
                    text: category.toUpperCase(),
                    left: 58,
                    width: 125,
                    top: -50,
                    bottom: 4,
                    height: 18,
                    textAlign: 'left',
                    color: '#333333',
                    font: {
                        fontFamily: typeFaceMinor,
                        fontSize: 15,
                        fontWeight: 'bold'
                    }
                });
                itemDisplayContainer.add(categoryLabel);

                // Label for the article's creation timestamp.
                var timestampLabel = Ti.UI.createLabel({
                    text: creationTimestamp,
                    right: 0,
                    top: -20,
                    bottom: 4,
                    height: 16,
                    textAlign: 'right',
                    width: 115,
                    color: '#333333',
                    font: {
                        fontFamily: typeFaceBody,
                        fontSize: 13
                    }
                });
                itemDisplayContainer.add(timestampLabel);

                // Label for the article's headline.
                var headlineLabel = Ti.UI.createLabel({
                    text: headline,
                    left: 58,
                    top: 0,
                    bottom: 4,
                    height: 'auto',
                    width: 240,
                    textAlign: 'left',
                    font: {
                        fontSize: 15
                    }
                });
                itemDisplayContainer.add(headlineLabel);

                // Assemble the article summary into the table row.
                tableRowElement.add(itemDisplayContainer);
                tableRowElement.className = 'entry' + idx;
                contentRecords[idx] = tableRowElement;

                /***** ARTICLE LISTING DETAIL VIEW PROPERTIES *****/

                // 'description' is a reserved attribute; using 'description_text' instead.
                tableRowElement.description_text = storyElements[idx].properties.description;
                tableRowElement.item_color = storyElements[idx].properties.color;
                tableRowElement.item_category = category;
                tableRowElement.item_link = storyElements[idx].properties.description; // Assuming description can be a URL
                tableRowElement.item_icon = visualCue;
                // 'title' is also a common attribute; using 'item_title' here.
                tableRowElement.item_title = headline;
                tableRowElement.item_timestamp = creationTimestamp;
                tableRowElement.item_id_code = storyElements[idx].properties.id;
            }
            // End of article data processing.

            /************** TOP NAVIGATION BAR ************************/

            var topHeaderStrip = Titanium.UI.createView({
                top: 0,
                height: headerStripDimension,
                backgroundColor: tertiaryHue,
            });

            var configToggleButton = Titanium.UI.createButton({
                left: 12,
                image: '../images/menu_icon.png', // Changed image
                top: 8,
                height: 28,
                width: 28
            });

            // The text for this label will be updated dynamically.
            var headerDisplayText = Titanium.UI.createLabel({
                shadowColor: '#bbb',
                shadowOffset: {
                    x: 0,
                    y: 1
                },
                color: '#ffffff',
                height: headerStripDimension,
                text: 'Map View',
                textAlign: 'center',
                width: '100%',
                font: {
                    fontFamily: typeFaceMajor,
                    fontSize: 32,
                }
            });

            var configPanelTitle = Titanium.UI.createLabel({
                shadowColor: '#bbb',
                shadowOffset: {
                    x: 0,
                    y: 1
                },
                color: '#ffffff',
                height: headerStripDimension,
                text: 'Navigate App',
                textAlign: 'center',
                width: configPanelBreadth,
                top: 4,
                font: {
                    fontFamily: typeFaceMajor,
                    fontSize: 32,
                }
            });

            var configPanelCloser = Titanium.UI.createImageView({
                image: '../images/close_x.png',
                right: 8,
                top: 4,
                height: 26,
                width: 26
            });

            // Functionality for the configuration panel button.
            configToggleButton.addEventListener('click', function() {
                if (configurationPanel.left === '0') {
                    dimmerScreen.animate({
                        opacity: 0,
                        duration: 350
                    });
                    configurationPanel.animate({
                        left: '-' + configPanelBreadth,
                        duration: 350
                    });
                } else {
                    dimmerScreen.animate({
                        opacity: 0.7,
                        duration: 350
                    });
                    configurationPanel.animate({
                        left: 0,
                        duration: 350
                    });
                }
            });

            configPanelCloser.addEventListener('click', function() {
                dimmerScreen.animate({
                    opacity: 0,
                    delay: 120,
                    duration: 350
                });
                configurationPanel.animate({
                    left: '-' + configPanelBreadth,
                    duration: 350
                });
            });

            var configurationPanel = Titanium.UI.createView({
                backgroundColor: tertiaryHue,
                width: configPanelBreadth,
                left: '-' + configPanelBreadth,
                height: '100%',
            });

            var dimmerScreen = Titanium.UI.createView({
                backgroundColor: 'black',
                width: '100%',
                opacity: 0,
            });

            // Resource: http://cssgallery.info/custom-row-for-tableview-in-appcelerator-titanium/
            var configOptionsArray = [
                {
                    headline: 'VIEW MAP',
                    action: 'map_mode',
                    hasChild: true,
                    newWindowFlag: false,
                    windowResourceURL: 'none'
                },
                {
                    headline: 'VIEW LIST',
                    action: 'list_mode',
                    hasChild: true,
                    newWindowFlag: false,
                    windowResourceURL: 'none'
                },
                {
                    headline: 'REFRESH DATA',
                    action: 'data_refresh',
                    hasChild: true,
                    newWindowFlag: false,
                    windowResourceURL: 'none'
                },
                {
                    headline: 'SUBMIT CONTENT',
                    action: 'submit_item',
                    hasChild: true,
                    newWindowFlag: true,
                    windowResourceURL: 'submit_content.js'
                },
                {
                    headline: 'GET ASSISTANCE',
                    action: 'get_help',
                    hasChild: true,
                    newWindowFlag: true,
                    windowResourceURL: 'help_screen.js'
                },
                {
                    headline: 'ABOUT THIS APP',
                    action: 'app_info',
                    hasChild: true,
                    newWindowFlag: true,
                    windowResourceURL: 'app_details.js'
                },
            ];
            var configElements = [];

            for (var counterVal = 0; counterVal < configOptionsArray.length; counterVal++) {
                var optionEntryRow = Titanium.UI.createTableViewRow();
                var optionLabelText = Titanium.UI.createLabel({
                    text: configOptionsArray[counterVal].headline,
                    font: {
                        fontFamily: typeFaceMinor,
                        fontSize: 29,
                    },
                    width: 'auto',
                    left: 8,
                    textAlign: 'left',
                });

                optionEntryRow.add(optionLabelText);
                optionEntryRow.hasChild = configOptionsArray[counterVal].hasChild;

                optionEntryRow.color = 'black';
                optionEntryRow.className = 'configOptionRow';
                optionEntryRow.new_window_flag = configOptionsArray[counterVal].newWindowFlag;
                optionEntryRow.window_resource_url = configOptionsArray[counterVal].windowResourceURL;
                optionEntryRow.option_headline = configOptionsArray[counterVal].headline;

                configElements.push(optionEntryRow);
            };

            var configMenuTable = Titanium.UI.createTableView({
                width: 200,
                data: configElements,
                minRowHeight: 60,
                color: primaryHue,
                rowBackgroundColor: 'white',
                backgroundColor: 'white',
                top: headerStripDimension,
            });

            configMenuTable.addEventListener('click', function(evt) {
                dimmerScreen.animate({
                    opacity: 0,
                    duration: 350
                });
                configurationPanel.animate({
                    left: '-' + configPanelBreadth,
                    duration: 350
                });
                if ((evt.rowData.new_window_flag) === true) { // Changed 'true' to true boolean
                    var newDisplayWindow = Titanium.UI.createWindow({
                        url: evt.rowData.window_resource_url,
                    });
                    newDisplayWindow.open();
                }
                if ((evt.rowData.option_headline) === 'REFRESH DATA') {
                    progressSpinner.show();
                    setTimeout(function() {
                        progressSpinner.hide();
                    }, 1200);
                    httpClientRequest.open("GET", infoStream);
                    httpClientRequest.send();
                }
                if ((evt.rowData.option_headline) === 'VIEW MAP') {
                    listingPanelDisplay.visible = false;
                    headerDisplayText.text = 'Map View';
                }
                if ((evt.rowData.option_headline) === 'VIEW LIST') {
                    listingPanelDisplay.visible = true;
                    headerDisplayText.text = listingPanelLabel;
                }
            });

            configurationPanel.add(configPanelTitle);
            configurationPanel.add(configPanelCloser);
            configurationPanel.add(configMenuTable);

            topHeaderStrip.add(configToggleButton);
            topHeaderStrip.add(headerDisplayText);
            mainDisplay.add(topHeaderStrip);

            // Initialize the map display.
            var geoVisualizer = Titanium.Map.createView({
                mapType: Titanium.Map.STANDARD_TYPE,
                animate: true,
                region: {
                    latitude: 38.9700000000000,
                    longitude: -95.25000000000000,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03
                }, // Slightly different default region
                regionFit: true,
                userLocation: true,
                visible: true,
                top: headerStripDimension,
                annotations: mapMarkers,
                zoom: 18,
            });
            Titanium.Geolocation.distanceFilter = 12; // Slightly different filter value

            // Add the map to the main view.
            mainDisplay.add(geoVisualizer);
            Titanium.Geolocation.distanceFilter = 12;

            var listingTableData = Titanium.UI.createTableView({
                data: contentRecords,
                minRowHeight: 60,
            });

            /********** ARTICLE MORE DETAIL VIEW *********/

            listingTableData.addEventListener('click', function(evt_detail) {
                var detailContentDisplay = Titanium.UI.createView({
                    backgroundColor: 'white',
                    right: -550, // Slightly different off-screen position
                    width: '100%',
                    top: headerStripDimension,
                });
                // Titanium.App.Analytics.trackPageview('/mobile-app/' + evt_detail.row.item_category + '/detail/' + evt_detail.row.item_id_code);
                // The actual content is rendered in a WebView for rich HTML formatting.
                var webContentArea = Ti.UI.createWebView({
                    html: '<html><head><style type="text/css"> img {max-width:100%;height:auto} body {font-family:Arial,Helvetica,sans-serif;width:88%;margin-left:6%;}h3 {color:#5bbd9e;} a {text-decoration:none;}</style></head><body><a href="' + internetSite + '/' + evt_detail.row.item_category + '/detail/' + evt_detail.row.item_id_code + '"><h3>' + evt_detail.row.item_title + '</h3></a>' + evt_detail.row.description_text + '</body></html>'
                });

                headerDisplayText.text = 'Item Details';

                var detailCloserButton = Titanium.UI.createImageView({
                    image: '../images/exit_button.png', // Changed image
                    right: 8,
                    top: 4,
                    height: 26,
                    width: 26
                });

                detailCloserButton.addEventListener('click', function() {
                    detailContentDisplay.animate({
                        right: -550,
                        duration: 550
                    }); // Slightly different animation duration
                    headerDisplayText.text = listingPanelLabel
                });

                // Combine elements and display the detail view.
                detailContentDisplay.add(webContentArea);
                detailContentDisplay.animate({
                    right: 0,
                    duration: 550
                });
                mainDisplay.add(detailContentDisplay);
                mainDisplay.add(detailCloserButton);
            });

            // The article listing panel, presented as a scrollable list.
            var listingPanelDisplay = Titanium.UI.createView({
                top: headerStripDimension,
                opacity: 1,
                visible: false,
            });
            listingPanelDisplay.add(listingTableData);

            // Final assembly of main UI components.
            mainDisplay.add(listingPanelDisplay);
            mainDisplay.add(dimmerScreen);
            mainDisplay.add(configurationPanel);

            function fetchUserCoordinates() {
                Titanium.Geolocation.getCurrentPosition(function(eventData) {
                    var mapRegionSettings = {
                        latitude: eventData.coords.latitude,
                        longitude: eventData.coords.longitude,
                        animate: true,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03
                    };
                    geoVisualizer.setLocation(mapRegionSettings);
                });
            }
            Titanium.Geolocation.addEventListener('location', function() {
                fetchUserCoordinates();
            });
        } catch (error) {
            alert("An error occurred: " + error);
        }
    };
    httpClientRequest.send();