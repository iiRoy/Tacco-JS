let mainAppWindow = Ti.UI.currentWindow;

const dataServiceHost = "http://larryvilleku.com";
const contentEndpoint = `${dataServiceHost}/api/dev1/items.json`;
const initialFetchParams = "?limit=25"; // Fetching 25 items to balance performance and initial data load.

// Consolidated Configuration Object for Application UI, Colors, Fonts, and Animations.
const ApplicationSettings = {
    UI: {
        TOOLBAR_ICON_DIMENSIONS: 32,
        TOOLBAR_ICON_Y_OFFSET: 3,
        MAIN_HEADER_HEIGHT: 45,
        SIDE_PANEL_WIDTH: 220,
        DEFAULT_SPACING: 10,
        TABLE_ROW_MIN_HEIGHT: 60,
    },
    ColorPalette: {
        PRIMARY_HIGHLIGHT: '#FF5733',
        SECONDARY_BLUE: '#4A90E2',
        DEEP_BACKGROUND: '#2C3E50',
        SUBTLE_TEXT_GREY: '#BBBBBB',
        LIGHT_UI_BACKGROUND: '#F8F8F8',
        HYPERLINK_COLOR: '#3498DB',
        WHITE_OPAQUE: '#FFFFFF',
        BLACK_OPAQUE: '#000000',
        ROW_STRIPE_EVEN: '#FFFFFF',
        ROW_STRIPE_ODD: '#F0F0F0',
    },
    Typography: {
        MAIN_TITLE_FONT: 'Lobster',
        SECTION_HEADER_FONT: 'League Gothic',
        BODY_TEXT_FONT: 'Open Sans',
    },
    AnimationTimings: {
        QUICK: 250,
        MODERATE: 400,
    }
};

// Adapt custom fonts for Android platform, as file names might differ.
(function localizeFontsForAndroid() {
    if (Ti.Platform.osname === 'android') {
        ApplicationSettings.Typography.MAIN_TITLE_FONT = 'Lobster';
        ApplicationSettings.Typography.SECTION_HEADER_FONT = 'LeagueGothic';
        ApplicationSettings.Typography.BODY_TEXT_FONT = 'OpenSans-Regular';
    }
})();

// Configure Geolocation for user's position on the map.
Ti.Geolocation.purpose = "To pinpoint your current position on the interactive map.";
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH; // Prioritize high accuracy for better user experience.

// Data structures to hold fetched content and map markers.
let contentItemRecords = [];
let mapMarkerCollection = [];

// Network Client for API communication.
const apiClient = Ti.Network.createHTTPClient({
    timeout: 120000, // Extended timeout for potentially slow network conditions.
    // Error handler for failed network requests.
    onerror: function(e) {
        Ti.API.error(`API request failed: ${e.error} at URL: ${this.url}`);
        // Ensure the loading overlay is dismissed.
        if (appLoadingOverlay) {
            appLoadingOverlay.hide();
        }
        // Inform the user about the connection issue.
        Ti.UI.createAlertDialog({
            title: 'Network Error',
            message: 'Failed to retrieve data. Please verify your internet connection and attempt again.',
            buttonNames: ['Dismiss'],
        }).show();
    },
    // Success handler for completed network requests.
    onload: function() {
        try {
            const serverResponseText = this.responseText;
            if (!serverResponseText) {
                throw new Error("Server returned an empty response.");
            }
            const parsedApiResponse = JSON.parse(serverResponseText);

            // Validate the expected structure of the API response.
            if (!parsedApiResponse || !Array.isArray(parsedApiResponse.features)) {
                throw new Error("Received data structure is invalid. Expected a 'features' array.");
            }

            const receivedItems = parsedApiResponse.features;

            // Clear existing data before populating with new content.
            contentItemRecords = [];
            mapMarkerCollection = [];

            if (receivedItems.length === 0) {
                Ti.API.info("No items were returned from the API.");
                // A "No items found" message could be displayed here if desired.
            }

            // Iterate through each item to create UI elements and map markers.
            receivedItems.forEach((item, index) => {
                const coordinates = item.geometry.coordinates; // Format: [longitude, latitude]
                if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                    Ti.API.warn(`Skipping item ${item.properties.id} due to malformed geographic coordinates.`);
                    return;
                }
                const [itemLongitude, itemLatitude] = coordinates;

                // Create a map annotation for the item.
                const mapPin = Ti.Map.createAnnotation({
                    latitude: itemLatitude,
                    longitude: itemLongitude,
                    title: item.properties.title,
                    subtitle: item.properties.item_date,
                    image: `../images/${item.properties.type}.png`, // Icon determined by item type.
                    pincolor: Ti.Map.ANNOTATION_RED,
                    animate: true,
                });
                mapMarkerCollection.push(mapPin);

                // Create a TableViewRow for the feed list.
                const feedRow = Ti.UI.createTableViewRow({
                    hasChild: true,
                    height: ApplicationSettings.UI.TABLE_ROW_MIN_HEIGHT,
                    backgroundColor: (index % 2) === 0 ? ApplicationSettings.ColorPalette.ROW_STRIPE_EVEN : ApplicationSettings.ColorPalette.ROW_STRIPE_ODD,
                    // Custom properties for passing data to the detail view.
                    itemDataPayload: {
                        descriptionText: item.properties.description,
                        categoryColorCode: item.properties.color,
                        itemCategory: item.properties.type,
                        webLinkUrl: `${dataServiceHost}/${item.properties.type}/detail/${item.properties.id}`,
                        itemThumbnail: item.properties.icon,
                        itemHeadline: item.properties.title,
                        creationDateTime: item.properties.item_date,
                        uniqueContentId: item.properties.id,
                    }
                });

                // Layout container for the row's content.
                const rowContentWrapper = Ti.UI.createView({
                    height: 'auto',
                    layout: 'vertical',
                    left: ApplicationSettings.UI.DEFAULT_SPACING,
                    top: ApplicationSettings.UI.DEFAULT_SPACING / 2,
                    bottom: ApplicationSettings.UI.DEFAULT_SPACING / 2,
                    right: ApplicationSettings.UI.DEFAULT_SPACING
                });

                // Thumbnail image for the item type.
                const categoryThumbnail = Ti.UI.createImageView({
                    image: item.properties.icon,
                    left: 0,
                    top: 0,
                    height: 48,
                    width: 48,
                    borderRadius: 4,
                });
                rowContentWrapper.add(categoryThumbnail);

                // Label for the item's category.
                const categoryDisplayLabel = Ti.UI.createLabel({
                    text: item.properties.type ? item.properties.type.toUpperCase() : 'GENERAL',
                    left: 58,
                    width: 120,
                    top: -48,
                    height: 16,
                    textAlign: 'left',
                    color: ApplicationSettings.ColorPalette.DEEP_BACKGROUND,
                    font: { fontFamily: ApplicationSettings.Typography.SECTION_HEADER_FONT, fontSize: 14, fontWeight: 'bold' }
                });
                rowContentWrapper.add(categoryDisplayLabel);

                // Label for the item's creation timestamp.
                const timestampDisplayLabel = Ti.UI.createLabel({
                    text: item.properties.item_date || 'Unknown Date',
                    right: 0,
                    top: -18,
                    height: 14,
                    textAlign: 'right',
                    width: 110,
                    color: ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY,
                    font: { fontFamily: ApplicationSettings.Typography.BODY_TEXT_FONT, fontSize: 12 }
                });
                rowContentWrapper.add(timestampDisplayLabel);

                // Label for the item's main title.
                const itemHeadlineLabel = Ti.UI.createLabel({
                    text: item.properties.title || 'Untitled Item',
                    left: 58,
                    top: 0,
                    height: 'auto',
                    width: Ti.UI.SIZE,
                    textAlign: 'left',
                    color: ApplicationSettings.ColorPalette.BLACK_OPAQUE,
                    font: { fontSize: 14, fontWeight: 'normal' }
                });
                rowContentWrapper.add(itemHeadlineLabel);

                feedRow.add(rowContentWrapper);
                contentItemRecords.push(feedRow);
            });

            // Update the map view with the newly created annotations.
            if (mapViewComponent) {
                mapViewComponent.annotations = mapMarkerCollection;
            }
            // Update the feed table with the processed rows.
            if (feedTableViewComponent) {
                feedTableViewComponent.data = contentItemRecords;
            }

            // Hide the loading indicator upon successful data load and processing.
            if (appLoadingOverlay) {
                appLoadingOverlay.hide();
            }

        } catch (error) {
            Ti.API.error(`Error during data processing: ${error.message}`);
            Ti.UI.createAlertDialog({
                title: 'Data Processing Error',
                message: `Failed to process received information: ${error.message}. Please try refreshing.`,
                buttonNames: ['Close'],
            }).show();
            if (appLoadingOverlay) {
                appLoadingOverlay.hide();
            }
        }
    }
});

// --- UI Element Initialization ---

// Loading indicator to show during data fetches.
const appLoadingOverlay = Ti.UI.createActivityIndicator({
    bottom: 200,
    height: 50,
    style: Ti.UI.ActivityIndicatorStyle.PLAIN,
    font: { fontFamily: ApplicationSettings.Typography.BODY_TEXT_FONT, fontSize: 15, fontWeight: 'bold' },
    color: ApplicationSettings.ColorPalette.DEEP_BACKGROUND,
    message: 'Fetching Content...',
    width: 210
});

// Add the loading indicator to the main window and display it.
mainAppWindow.add(appLoadingOverlay);
appLoadingOverlay.show();

// Specific workaround for Android: force-hide the indicator after a delay
// as it may not automatically dismiss with XHR completion.
if (Ti.Platform.osname === 'android') {
    setTimeout(() => {
        if (appLoadingOverlay && appLoadingOverlay.visible) {
            appLoadingOverlay.hide();
            Ti.API.warn("Android specific: Forced dismissal of loading indicator after timeout.");
        }
    }, 7000); // Max 7 seconds for Android loading indicator.
}

// Main application header bar.
const primaryHeaderBar = Ti.UI.createView({
    top: 0,
    height: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    backgroundColor: ApplicationSettings.ColorPalette.DEEP_BACKGROUND,
    zIndex: 10
});

// Button to toggle the side navigation panel.
const sideNavToggleButton = Ti.UI.createButton({
    left: ApplicationSettings.UI.DEFAULT_SPACING,
    image: '../images/menu_icon.png', // Placeholder for a menu icon image.
    top: (ApplicationSettings.UI.MAIN_HEADER_HEIGHT - ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS) / 2,
    height: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS,
    width: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS
});

// Dynamic label for the main header title.
const mainHeaderTitle = Ti.UI.createLabel({
    shadowColor: ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY,
    shadowOffset: { x: 0, y: 1 },
    color: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
    height: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    text: 'Map View', // Initial display text.
    textAlign: 'center',
    width: '100%',
    font: {
        fontFamily: ApplicationSettings.Typography.MAIN_TITLE_FONT,
        fontSize: 30,
    }
});

// Overlay view that appears when the side navigation is open.
const sideNavigationShade = Ti.UI.createView({
    backgroundColor: ApplicationSettings.ColorPalette.BLACK_OPAQUE,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 9,
    visible: false, // Hidden by default.
});

// Side navigation panel, initially positioned off-screen.
const sideNavigationPanel = Ti.UI.createView({
    backgroundColor: ApplicationSettings.ColorPalette.DEEP_BACKGROUND,
    width: ApplicationSettings.UI.SIDE_PANEL_WIDTH,
    left: -ApplicationSettings.UI.SIDE_PANEL_WIDTH, // Start off-screen.
    height: '100%',
    zIndex: 11, // Ensure it's above other content when visible.
});

// Title for the side navigation panel.
const sidePanelHeader = Ti.UI.createLabel({
    shadowColor: ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY,
    shadowOffset: { x: 0, y: 1 },
    color: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
    height: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    text: 'Navigation',
    textAlign: 'center',
    width: ApplicationSettings.UI.SIDE_PANEL_WIDTH,
    top: 2,
    font: {
        fontFamily: ApplicationSettings.Typography.MAIN_TITLE_FONT,
        fontSize: 30,
    }
});

// Close button for the side navigation panel.
const sidePanelCloseButton = Ti.UI.createImageView({
    image: '../images/close_x.png', // Placeholder for a close icon.
    right: ApplicationSettings.UI.DEFAULT_SPACING,
    top: (ApplicationSettings.UI.MAIN_HEADER_HEIGHT - ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS) / 2,
    height: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS,
    width: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS
});

// Generic utility function for animating UI views.
function performViewAnimation(viewElement, animationProperties, durationMs, completionCallback) {
    if (viewElement && viewElement.animate) {
        viewElement.animate(animationProperties, durationMs, completionCallback);
    }
}

// Function to control the visibility and animation of the side navigation.
function toggleSideNavigationPanel() {
    const isPanelOpen = sideNavigationPanel.left === 0;
    if (isPanelOpen) {
        performViewAnimation(sideNavigationShade, { opacity: 0, duration: ApplicationSettings.AnimationTimings.QUICK }, () => sideNavigationShade.visible = false);
        performViewAnimation(sideNavigationPanel, { left: -ApplicationSettings.UI.SIDE_PANEL_WIDTH, duration: ApplicationSettings.AnimationTimings.MODERATE });
    } else {
        sideNavigationShade.visible = true;
        performViewAnimation(sideNavigationShade, { opacity: 0.6, duration: ApplicationSettings.AnimationTimings.QUICK });
        performViewAnimation(sideNavigationPanel, { left: 0, duration: ApplicationSettings.AnimationTimings.MODERATE });
    }
}

// Attach event listeners for side navigation control.
sideNavToggleButton.addEventListener('click', toggleSideNavigationPanel);
sidePanelCloseButton.addEventListener('click', toggleSideNavigationPanel);
sideNavigationShade.addEventListener('click', toggleSideNavigationPanel); // Close panel if overlay is tapped.

// Data definition for the side navigation menu items.
const navigationOptionList = [
    { text: 'Show Map', actionType: 'displayMap', isExternalLink: false, targetPage: '' },
    { text: 'Show Feed', actionType: 'displayFeed', isExternalLink: false, targetPage: '' },
    { text: 'Reload Data', actionType: 'refreshContent', isExternalLink: false, targetPage: '' },
    { text: 'Submit New', actionType: 'openExternalWindow', isExternalLink: true, targetPage: 'submit_entry.js' },
    { text: 'Get Help', actionType: 'openExternalWindow', isExternalLink: true, targetPage: 'support_page.js' },
    { text: 'About App', actionType: 'openExternalWindow', isExternalLink: true, targetPage: 'app_info.js' },
];

const navigationTableRows = [];
navigationOptionList.forEach(item => {
    const row = Ti.UI.createTableViewRow({
        height: ApplicationSettings.UI.TABLE_ROW_MIN_HEIGHT,
        backgroundColor: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
        selectedBackgroundColor: ApplicationSettings.ColorPalette.LIGHT_UI_BACKGROUND,
        // Custom properties for event handling within the table view.
        clickHandlerType: item.actionType,
        isExternalUrl: item.isExternalLink,
        targetWindowUrl: item.targetPage,
        rowDisplayLabel: item.text,
    });

    const label = Ti.UI.createLabel({
        text: item.text,
        font: {
            fontFamily: ApplicationSettings.Typography.SECTION_HEADER_FONT,
            fontSize: 24,
        },
        color: ApplicationSettings.ColorPalette.DEEP_BACKGROUND,
        left: ApplicationSettings.UI.DEFAULT_SPACING,
        textAlign: 'left',
    });
    row.add(label);
    navigationTableRows.push(row);
});

// Table view component for the side navigation menu.
const sideNavigationTable = Ti.UI.createTableView({
    width: ApplicationSettings.UI.SIDE_PANEL_WIDTH,
    data: navigationTableRows,
    minRowHeight: ApplicationSettings.UI.TABLE_ROW_MIN_HEIGHT,
    backgroundColor: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
    top: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    separatorStyle: Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE,
    separatorColor: ApplicationSettings.ColorPalette.LIGHT_UI_BACKGROUND,
});

// Event listener for clicks on side navigation menu items.
sideNavigationTable.addEventListener('click', function(e) {
    toggleSideNavigationPanel(); // Close the panel upon selection.

    const clickedAction = e.rowData.clickHandlerType;
    const isExternal = e.rowData.isExternalUrl;
    const pageUrl = e.rowData.targetWindowUrl;
    const itemLabel = e.rowData.rowDisplayLabel;

    if (isExternal && pageUrl) {
        // Open a new window for external/secondary content.
        const newAppWindow = Ti.UI.createWindow({
            url: pageUrl,
            title: itemLabel,
            backgroundColor: ApplicationSettings.ColorPalette.LIGHT_UI_BACKGROUND,
        });
        newAppWindow.open();
    } else if (clickedAction === 'refreshContent') {
        Ti.API.info("Initiating content refresh...");
        appLoadingOverlay.show();
        // Check network status before attempting to refresh.
        if (Ti.Network.online) {
            apiClient.open("GET", contentEndpoint + initialFetchParams);
            apiClient.send();
        } else {
            appLoadingOverlay.hide();
            Ti.UI.createAlertDialog({
                title: 'No Network',
                message: 'A network connection is required to refresh content.',
                buttonNames: ['OK'],
            }).show();
        }
    } else if (clickedAction === 'displayMap') {
        contentFeedContainer.visible = false;
        mapViewComponent.visible = true;
        mainHeaderTitle.text = 'Map View';
    } else if (clickedAction === 'displayFeed') {
        mapViewComponent.visible = false;
        contentFeedContainer.visible = true;
        mainHeaderTitle.text = 'Content Feed';
    }
});

// Compose the side navigation panel.
sideNavigationPanel.add(sidePanelHeader);
sideNavigationPanel.add(sidePanelCloseButton);
sideNavigationPanel.add(sideNavigationTable);

// Add main header bar components to the window.
primaryHeaderBar.add(sideNavToggleButton);
primaryHeaderBar.add(mainHeaderTitle);
mainAppWindow.add(primaryHeaderBar);

// --- Map View Component Setup ---
const mapViewComponent = Ti.Map.createView({
    mapType: Ti.Map.STANDARD_TYPE,
    animate: true,
    region: { latitude: 38.962254, longitude: -95.242544, latitudeDelta: 0.03, longitudeDelta: 0.03 }, // Default to Lawrence, KS.
    regionFit: true,
    userLocation: true,
    visible: true, // Map is the default view.
    top: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    annotations: mapMarkerCollection,
    zoom: 18,
});
mainAppWindow.add(mapViewComponent);

// Geolocation listener to update map with user's current location.
Ti.Geolocation.distanceFilter = 15; // Update location every 15 meters.
Ti.Geolocation.addEventListener('location', function(event) {
    if (!event.success || event.error) {
        Ti.API.error(`Geolocation update failed: ${event.error}`);
        return;
    }
    const userCoordinates = event.coords;
    const userRegion = {
        latitude: userCoordinates.latitude,
        longitude: userCoordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        animate: true,
    };
    mapViewComponent.setLocation(userRegion);
    Ti.API.info(`Map updated to user's location: ${userCoordinates.latitude}, ${userCoordinates.longitude}`);
});

// --- Content Feed List View Setup ---
const feedTableViewComponent = Ti.UI.createTableView({
    data: contentItemRecords, // Populated asynchronously by API client.
    minRowHeight: ApplicationSettings.UI.TABLE_ROW_MIN_HEIGHT,
    backgroundColor: ApplicationSettings.ColorPalette.LIGHT_UI_BACKGROUND,
    separatorStyle: Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE,
    separatorColor: ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY,
});

// Container for the feed list, allowing for easy visibility toggling.
const contentFeedContainer = Ti.UI.createView({
    top: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    opacity: 1,
    visible: false, // Hidden by default.
    backgroundColor: ApplicationSettings.ColorPalette.LIGHT_UI_BACKGROUND,
});
contentFeedContainer.add(feedTableViewComponent);
mainAppWindow.add(contentFeedContainer);

// --- Detail View for Individual Feed Items ---
const itemDetailScreen = Ti.UI.createView({
    backgroundColor: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
    right: -mainAppWindow.width, // Positioned off-screen initially.
    width: '100%',
    height: Ti.UI.FILL,
    top: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    zIndex: 12, // Ensure it appears above other content.
});

const itemDetailWebView = Ti.UI.createWebView({
    // Base HTML structure with embedded styling for consistent appearance.
    html: `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <style type="text/css">
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 15px; color: #333; line-height: 1.6; }
                h3 { color: ${ApplicationSettings.ColorPalette.PRIMARY_HIGHLIGHT}; margin-bottom: 5px; }
                a { text-decoration: none; color: ${ApplicationSettings.ColorPalette.HYPERLINK_COLOR}; }
                img { max-width: 100%; height: auto; border-radius: 5px; margin-top: 10px; }
                p { margin-bottom: 10px; }
                .meta-info { font-size: 0.9em; color: ${ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY}; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div id="content-placeholder">Loading item details...</div>
        </body>
        </html>
    `,
    enableZoomControls: false,
});

const detailViewBackButton = Ti.UI.createImageView({
    image: '../images/back_arrow.png', // Placeholder for a back arrow icon.
    left: ApplicationSettings.UI.DEFAULT_SPACING,
    top: (ApplicationSettings.UI.MAIN_HEADER_HEIGHT - ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS) / 2,
    height: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS,
    width: ApplicationSettings.UI.TOOLBAR_ICON_DIMENSIONS,
    zIndex: 13, // Ensure this button is always interactable.
});

// Header label specifically for the detail view.
const detailScreenHeader = Ti.UI.createLabel({
    shadowColor: ApplicationSettings.ColorPalette.SUBTLE_TEXT_GREY,
    shadowOffset: { x: 0, y: 1 },
    color: ApplicationSettings.ColorPalette.WHITE_OPAQUE,
    height: ApplicationSettings.UI.MAIN_HEADER_HEIGHT,
    text: 'Item Details',
    textAlign: 'center',
    width: '100%',
    font: {
        fontFamily: ApplicationSettings.Typography.MAIN_TITLE_FONT,
        fontSize: 30,
    },
    zIndex: 12,
});

// Event listener for clicks on individual feed list items to open detail view.
feedTableViewComponent.addEventListener('click', function(e) {
    if (!e.rowData || !e.rowData.itemDataPayload) {
        Ti.API.warn("Clicked row lacks 'itemDataPayload' property.");
        return;
    }
    const currentItemData = e.rowData.itemDataPayload;

    // Construct the HTML content dynamically for the detail view.
    const itemHtmlContent = `
        <h3>${currentItemData.itemHeadline}</h3>
        <p class="meta-info">Category: ${currentItemData.itemCategory.toUpperCase()} | Published: ${currentItemData.creationDateTime}</p>
        <p>${currentItemData.descriptionText}</p>
        <p><a href="${currentItemData.webLinkUrl}" target="_blank">View on Website &raquo;</a></p>
    `;

    // Inject the generated HTML into the WebView.
    itemDetailWebView.evalJS(`document.getElementById('content-placeholder').innerHTML = \`${itemHtmlContent}\`;`);

    // Modify the main header bar to show detail view controls.
    primaryHeaderBar.remove(mainHeaderTitle);
    primaryHeaderBar.add(detailScreenHeader);
    primaryHeaderBar.remove(sideNavToggleButton);
    primaryHeaderBar.add(detailViewBackButton);

    // Add WebView to the detail screen and animate it into view.
    itemDetailScreen.add(itemDetailWebView);
    mainAppWindow.add(itemDetailScreen);
    performViewAnimation(itemDetailScreen, { right: 0, duration: ApplicationSettings.AnimationTimings.MODERATE });
});

// Event listener for the back button in the detail view.
detailViewBackButton.addEventListener('click', function() {
    performViewAnimation(itemDetailScreen, { right: -mainAppWindow.width, duration: ApplicationSettings.AnimationTimings.MODERATE }, () => {
        mainAppWindow.remove(itemDetailScreen); // Remove the detail screen once animation completes.
        itemDetailScreen.remove(itemDetailWebView); // Clear WebView content.
    });

    // Restore the main header bar to its default state.
    primaryHeaderBar.remove(detailScreenHeader);
    primaryHeaderBar.add(mainHeaderTitle);
    primaryHeaderBar.remove(detailViewBackButton);
    primaryHeaderBar.add(sideNavToggleButton);
});

// --- Final Window Additions (order is important for z-indexing) ---
mainAppWindow.add(sideNavigationShade);
mainAppWindow.add(sideNavigationPanel);

// Initial data fetch upon application launch.
(function performInitialDataLoad() {
    if (Ti.Network.online) {
        Ti.API.info("Initiating application's first data retrieval...");
        apiClient.open("GET", contentEndpoint + initialFetchParams);
        apiClient.send();
    } else {
        appLoadingOverlay.hide();
        Ti.UI.createAlertDialog({
            title: 'Offline Mode',
            message: 'No active internet connection detected. Content will be loaded once you are online.',
            buttonNames: ['Understood'],
        }).show();
    }
})();