const mainStage = Ti.UI.currentWindow;

const applicationSettings = {
    resourceBase: "http://larryvilleku.com",
    apiPath: "/api/dev1/items.json?limit=30",
    uiMetrics: {
        toolbarIconSize: 35,
        toolbarIconBottomMargin: 2,
        headerBarHeight: 40,
        navigationPanelWidth: 200,
        activityIndicatorBottom: 200,
        activityIndicatorHeight: 50,
        activityIndicatorWidth: 210,
        tableRowMinHeight: 58,
        detailViewRightOffset: -500,
        detailViewSlideDuration: 500,
        overlayFadeDuration: 300,
        settingsPanelSlideDuration: 300
    },
    colorPalette: {
        accentRed: '##FF4747',
        standardBlue: '#6082A6',
        deepBlue: '#1D243B',
        neutralGray: '#999',
        lightGray: '#f2f2f2',
        linkBlue: '#2A85E8'
    },
    typography: {
        primaryHeadline: {
            ios: 'Lobster 1.4',
            android: 'Lobster'
        },
        secondaryHeadline: {
            ios: 'League Gothic',
            android: 'LeagueGothic'
        },
        bodyText: {
            ios: 'Open Sans',
            android: 'OpenSans-Regular'
        },
        indicatorFont: {
            family: 'Helvetica Neue',
            size: 15,
            weight: 'bold'
        }
    },
    viewNames: {
        feed: 'Feed',
        map: 'Map',
        details: 'Details',
        navigate: 'Navigate'
    },
    defaultMapRegion: {
        latitude: 38.9622547128423,
        longitude: -95.24254439999999,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
    },
    networkTimeoutMillis: 1000000,
    activityIndicatorHideDelay: 2000,
    geolocationPurpose: "Recieve User Location",
    geolocationAccuracy: Titanium.Geolocation.ACCURACY_BEST,
    geolocationFilterDistance: 10
};

const getPlatformSpecificFont = (fontConfig) => {
    return Ti.Platform.osname === 'android' ? fontConfig.android : fontConfig.ios;
};

const currentHeadlineFont = getPlatformSpecificFont(applicationSettings.typography.primaryHeadline);
const currentSecondaryFont = getPlatformSpecificFont(applicationSettings.typography.secondaryHeadline);
const currentBodyFont = getPlatformSpecificFont(applicationSettings.typography.bodyText);

const createVisualElement = (elementType, properties) => Ti.UI[elementType](properties);

const applicationState = {
    currentMarkers: [],
    currentFeedItems: [],
    isFeedDisplayVisible: false,
    isNavigationPanelOpen: false,
    isDetailViewActive: false,
    activeDetailItem: null,
    currentHeaderTitle: applicationSettings.viewNames.map
};

const performDataAcquisition = (endpointUrl, onSuccess, onError) => {
    const dataFetcher = Ti.Network.createHTTPClient();
    dataFetcher.timeout = applicationSettings.networkTimeoutMillis;

    dataFetcher.onload = function() {
        try {
            const rawContent = JSON.parse(this.responseText).features;
            onSuccess(rawContent);
        } catch (error) {
            onError(error);
        }
    };

    dataFetcher.onerror = function(e) {
        onError(e);
    };

    dataFetcher.open("GET", endpointUrl);
    dataFetcher.send();
};

const processRawContent = (rawContent) => {
    const processedMarkers = [];
    const processedFeedRows = [];

    rawContent.forEach((item, index) => {
        const rawCoordinates = item.geometry.coordinates;
        const [lon, lat] = rawCoordinates;
        const itemType = item.properties.type;
        const itemTitle = item.properties.title;
        const itemDate = item.properties.item_date;
        const rowBackgroundColor = (index % 2) === 0 ? '#fff' : '#eee';
        const itemIcon = item.properties.icon;

        processedMarkers.push(
            Titanium.Map.createAnnotation({
                latitude: lat,
                longitude: lon,
                title: itemTitle,
                image: `../images/${itemType}.png`,
                animate: true,
            })
        );

        const listItemContainer = createVisualElement('createTableViewRow', {
            hasChild: true,
            height: 'auto',
            backgroundColor: rowBackgroundColor,
            className: `contentItem${index}`
        });

        const itemContentWrapper = createVisualElement('createView', {
            height: 'auto',
            layout: 'vertical',
            left: 5,
            top: 5,
            bottom: 5,
            right: 5
        });

        const typeIcon = createVisualElement('createImageView', {
            image: itemIcon,
            left: 0,
            top: 0,
            height: 48,
            width: 48
        });
        itemContentWrapper.add(typeIcon);

        const typeLabel = createVisualElement('createLabel', {
            text: itemType.toUpperCase(),
            left: 54,
            width: 120,
            top: -48,
            bottom: 2,
            height: 16,
            textAlign: 'left',
            color: '#444444',
            font: {
                fontFamily: currentSecondaryFont,
                fontSize: 14,
                fontWeight: 'bold'
            }
        });
        itemContentWrapper.add(typeLabel);

        const dateLabel = createVisualElement('createLabel', {
            text: itemDate,
            right: 0,
            top: -18,
            bottom: 2,
            height: 14,
            textAlign: 'right',
            width: 110,
            color: '#444444',
            font: {
                fontFamily: currentSecondaryFont,
                fontSize: 12
            }
        });
        itemContentWrapper.add(dateLabel);

        const titleLabel = createVisualElement('createLabel', {
            text: itemTitle,
            left: 54,
            top: 0,
            bottom: 2,
            height: 'auto',
            width: 236,
            textAlign: 'left',
            font: {
                fontSize: 14
            }
        });
        itemContentWrapper.add(titleLabel);

        listItemContainer.add(itemContentWrapper);

        Object.assign(listItemContainer, {
            detailContent: item.properties.description,
            detailColor: item.properties.color,
            detailType: itemType,
            detailUrl: item.properties.description,
            detailIcon: itemIcon,
            detailHeading: itemTitle,
            detailCreatedAt: itemDate,
            detailIdentifier: item.properties.id,
            sourceItem: item
        });

        processedFeedRows.push(listItemContainer);
    });

    return {
        markers: processedMarkers,
        rows: processedFeedRows
    };
};

const makeActivityMonitor = () => {
    const monitor = createVisualElement('createActivityIndicator', {
        bottom: applicationSettings.uiMetrics.activityIndicatorBottom,
        height: applicationSettings.uiMetrics.activityIndicatorHeight,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
        font: {
            fontFamily: applicationSettings.typography.indicatorFont.family,
            fontSize: applicationSettings.typography.indicatorFont.size,
            fontWeight: applicationSettings.typography.indicatorFont.weight
        },
        color: 'black',
        message: 'Loading...',
        width: applicationSettings.uiMetrics.activityIndicatorWidth
    });
    return monitor;
};

const makeHeaderBar = (titleText) => {
    const bar = createVisualElement('createView', {
        top: 0,
        height: applicationSettings.uiMetrics.headerBarHeight,
        backgroundColor: applicationSettings.colorPalette.deepBlue,
    });

    const navToggle = createVisualElement('createButton', {
        left: 10,
        image: '../images/close_x.png',
        top: 5,
        height: 30,
        width: 30
    });

    const headerDisplay = createVisualElement('createLabel', {
        shadowColor: '#ccc',
        shadowOffset: {
            x: 0,
            y: 1
        },
        color: '#ffffff',
        height: applicationSettings.uiMetrics.headerBarHeight,
        text: titleText,
        textAlign: 'center',
        width: '100%',
        font: {
            fontFamily: currentHeadlineFont,
            fontSize: 30,
        }
    });

    bar.add(navToggle);
    bar.add(headerDisplay);

    return {
        bar,
        navToggle,
        headerDisplay
    };
};

const makeNavigationPanel = (panelData) => {
    const panelContainer = createVisualElement('createView', {
        backgroundColor: applicationSettings.colorPalette.deepBlue,
        width: applicationSettings.uiMetrics.navigationPanelWidth,
        left: `-${applicationSettings.uiMetrics.navigationPanelWidth}`,
        height: '100%',
    });

    const panelTitle = createVisualElement('createLabel', {
        shadowColor: '#ccc',
        shadowOffset: {
            x: 0,
            y: 1
        },
        color: '#ffffff',
        height: applicationSettings.uiMetrics.headerBarHeight,
        text: applicationSettings.viewNames.navigate,
        textAlign: 'center',
        width: applicationSettings.uiMetrics.navigationPanelWidth,
        top: 2,
        font: {
            fontFamily: currentHeadlineFont,
            fontSize: 30,
        }
    });

    const panelCloseButton = createVisualElement('createImageView', {
        image: '../images/close_x.png',
        right: 5,
        top: 2,
        height: 28,
        width: 28
    });

    const tableRows = panelData.map(item => {
        const row = createVisualElement('createTableViewRow', {
            hasChild: item.hasChild,
            color: 'black',
            className: 'navRow',
            newWindow: item.newwin.toString(),
            windowUrl: item.winurl,
            navAction: item.event,
            headingText: item.heading
        });
        const rowLabel = createVisualElement('createLabel', {
            text: item.heading,
            font: {
                fontFamily: currentSecondaryFont,
                fontSize: 28,
            },
            width: 'auto',
            left: 5,
            textAlign: 'left',
        });
        row.add(rowLabel);
        return row;
    });

    const navTable = createVisualElement('createTableView', {
        width: applicationSettings.uiMetrics.navigationPanelWidth,
        data: tableRows,
        minRowHeight: applicationSettings.uiMetrics.tableRowMinHeight,
        color: applicationSettings.colorPalette.accentRed,
        rowBackgroundColor: 'white',
        backgroundColor: 'white',
        top: applicationSettings.uiMetrics.headerBarHeight,
    });

    panelContainer.add(panelTitle);
    panelContainer.add(panelCloseButton);
    panelContainer.add(navTable);

    return {
        panelContainer,
        panelTitle,
        panelCloseButton,
        navTable
    };
};

const makeMapDisplay = (initialAnnotations) => {
    const display = Titanium.Map.createView({
        mapType: Titanium.Map.STANDARD_TYPE,
        animate: true,
        region: applicationSettings.defaultMapRegion,
        regionFit: true,
        userLocation: true,
        visible: true,
        top: applicationSettings.uiMetrics.headerBarHeight,
        annotations: initialAnnotations,
        zoom: 20,
    });
    return display;
};

const makeContentFeedDisplay = (initialRows) => {
    const feedList = createVisualElement('createTableView', {
        data: initialRows,
        minRowHeight: applicationSettings.uiMetrics.tableRowMinHeight,
    });

    const displayContainer = createVisualElement('createView', {
        top: applicationSettings.uiMetrics.headerBarHeight,
        opacity: 1,
        visible: false,
    });
    displayContainer.add(feedList);

    return {
        displayContainer,
        feedList
    };
};

const makeOverlayShroud = () => {
    const shroud = createVisualElement('createView', {
        backgroundColor: 'black',
        width: '100%',
        opacity: 0,
    });
    return shroud;
};

const handleNavigationAction = (eventData) => {
    applicationState.isNavigationPanelOpen = false;
    uiElements.overlayShroud.animate({
        opacity: 0,
        duration: applicationSettings.uiMetrics.overlayFadeDuration
    });
    uiElements.navigationPanel.panelContainer.animate({
        left: `-${applicationSettings.uiMetrics.navigationPanelWidth}`,
        duration: applicationSettings.uiMetrics.settingsPanelSlideDuration
    });

    if (eventData.newWindow === 'true') {
        const newWin = createVisualElement('createWindow', {
            url: eventData.windowUrl,
        });
        newWin.open();
    } else {
        switch (eventData.headingText) {
            case 'REFRESH':
                uiElements.progressMonitor.show();
                setTimeout(() => {
                    uiElements.progressMonitor.hide();
                }, 1000);
                initializeApplicationData();
                break;
            case 'MAP':
                applicationState.isFeedDisplayVisible = false;
                uiElements.contentFeedDisplay.displayContainer.visible = false;
                applicationState.currentHeaderTitle = applicationSettings.viewNames.map;
                uiElements.headerBar.headerDisplay.text = applicationState.currentHeaderTitle;
                break;
            case 'FEED':
                applicationState.isFeedDisplayVisible = true;
                uiElements.contentFeedDisplay.displayContainer.visible = true;
                applicationState.currentHeaderTitle = applicationSettings.viewNames.feed;
                uiElements.headerBar.headerDisplay.text = applicationState.currentHeaderTitle;
                break;
            default:
                break;
        }
    }
};

const showDetailView = (itemData) => {
    if (applicationState.isDetailViewActive) return;

    applicationState.isDetailViewActive = true;
    applicationState.activeDetailItem = itemData;

    const detailContainer = createVisualElement('createView', {
        backgroundColor: 'white',
        right: applicationSettings.uiMetrics.detailViewRightOffset,
        width: '100%',
        top: applicationSettings.uiMetrics.headerBarHeight,
        zIndex: 10
    });

    const detailContentWebView = createVisualElement('createWebView', {
        html: `<html><head><style type="text/css"> img {width:100%;height:auto} body {font-family:Helvetica,Arial,sans-serif;width:85%;margin-left:7%;}h3 {color:#4bb392;} a {text-decoration:none;}</style></head><body><a href="${applicationSettings.resourceBase}/${itemData.detailType}/detail/${itemData.detailIdentifier}"><h3>${itemData.detailHeading}</h3></a>${itemData.detailContent}</body></html>`
    });

    const closeDetailButton = createVisualElement('createImageView', {
        image: '../images/close_x.png',
        right: 5,
        top: 2,
        height: 28,
        width: 28,
        zIndex: 11
    });

    closeDetailButton.addEventListener('click', () => {
        detailContainer.animate({
            right: applicationSettings.uiMetrics.detailViewRightOffset,
            duration: applicationSettings.uiMetrics.detailViewSlideDuration
        }, () => {
            mainStage.remove(detailContainer);
            mainStage.remove(closeDetailButton);
            applicationState.isDetailViewActive = false;
            applicationState.activeDetailItem = null;
            uiElements.headerBar.headerDisplay.text = applicationState.currentHeaderTitle;
        });
    });

    detailContainer.add(detailContentWebView);
    mainStage.add(detailContainer);
    mainStage.add(closeDetailButton);

    detailContainer.animate({
        right: 0,
        duration: applicationSettings.uiMetrics.detailViewSlideDuration
    });
    uiElements.headerBar.headerDisplay.text = applicationSettings.viewNames.details;
};

const updateMapToCurrentLocation = () => {
    Titanium.Geolocation.getCurrentPosition(e => {
        if (e.success && e.coords) {
            const currentPosition = {
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
                animate: true,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
            };
            uiElements.geographicDisplay.setLocation(currentPosition);
        } else {
            Ti.API.error("Error getting location: " + e.error);
        }
    });
};

const uiElements = {};

const setupUI = () => {
    uiElements.progressMonitor = makeActivityMonitor();
    uiElements.overlayShroud = makeOverlayShroud();

    const {
        bar,
        navToggle,
        headerDisplay
    } = makeHeaderBar(applicationState.currentHeaderTitle);
    uiElements.headerBar = {
        bar,
        navToggle,
        headerDisplay
    };

    const navPanelData = [{
        heading: 'MAP',
        event: 'map',
        hasChild: true,
        newwin: false,
        winurl: 'none'
    }, {
        heading: 'FEED',
        event: 'map',
        hasChild: true,
        newwin: false,
        winurl: 'none'
    }, {
        heading: 'REFRESH',
        event: 'map',
        hasChild: true,
        newwin: false,
        winurl: 'none'
    }, {
        heading: 'SUBMIT',
        event: 'map',
        hasChild: true,
        newwin: true,
        winurl: 'submit.js'
    }, {
        heading: 'HELP',
        event: 'map',
        hasChild: true,
        newwin: true,
        winurl: 'help.js'
    }, {
        heading: 'INFO',
        event: 'map',
        hasChild: true,
        newwin: true,
        winurl: 'info.js'
    }, ];

    const {
        panelContainer,
        panelCloseButton,
        navTable
    } = makeNavigationPanel(navPanelData);
    uiElements.navigationPanel = {
        panelContainer,
        panelCloseButton,
        navTable
    };

    uiElements.geographicDisplay = makeMapDisplay([]);
    const {
        displayContainer: feedDisplayContainer,
        feedList
    } = makeContentFeedDisplay([]);
    uiElements.contentFeedDisplay = {
        displayContainer: feedDisplayContainer,
        feedList
    };

    mainStage.add(uiElements.geographicDisplay);
    mainStage.add(uiElements.contentFeedDisplay.displayContainer);
    mainStage.add(uiElements.overlayShroud);
    mainStage.add(uiElements.navigationPanel.panelContainer);
    mainStage.add(uiElements.headerBar.bar);
    mainStage.add(uiElements.progressMonitor);
};

const attachEventListeners = () => {
    uiElements.headerBar.navToggle.addEventListener('click', () => {
        if (applicationState.isNavigationPanelOpen) {
            uiElements.overlayShroud.animate({
                opacity: 0,
                duration: applicationSettings.uiMetrics.overlayFadeDuration
            });
            uiElements.navigationPanel.panelContainer.animate({
                left: `-${applicationSettings.uiMetrics.navigationPanelWidth}`,
                duration: applicationSettings.uiMetrics.settingsPanelSlideDuration
            });
        } else {
            uiElements.overlayShroud.animate({
                opacity: 0.6,
                duration: applicationSettings.uiMetrics.overlayFadeDuration
            });
            uiElements.navigationPanel.panelContainer.animate({
                left: 0,
                duration: applicationSettings.uiMetrics.settingsPanelSlideDuration
            });
        }
        applicationState.isNavigationPanelOpen = !applicationState.isNavigationPanelOpen;
    });

    uiElements.navigationPanel.panelCloseButton.addEventListener('click', () => {
        uiElements.overlayShroud.animate({
            opacity: 0,
            delay: 100,
            duration: applicationSettings.uiMetrics.overlayFadeDuration
        });
        uiElements.navigationPanel.panelContainer.animate({
            left: `-${applicationSettings.uiMetrics.navigationPanelWidth}`,
            duration: applicationSettings.uiMetrics.settingsPanelSlideDuration
        });
        applicationState.isNavigationPanelOpen = false;
    });

    uiElements.navigationPanel.navTable.addEventListener('click', (event) => {
        handleNavigationAction(event.rowData);
    });

    uiElements.contentFeedDisplay.feedList.addEventListener('click', (event) => {
        showDetailView(event.rowData);
    });

    Titanium.Geolocation.purpose = applicationSettings.geolocationPurpose;
    Titanium.Geolocation.accuracy = applicationSettings.geolocationAccuracy;
    Titanium.Geolocation.distanceFilter = applicationSettings.geolocationFilterDistance;
    Titanium.Geolocation.addEventListener('location', updateMapToCurrentLocation);
};

const initializeApplicationData = () => {
    uiElements.progressMonitor.show();

    if (Ti.Platform.osname === 'android') {
        setTimeout(() => {
            uiElements.progressMonitor.hide();
        }, applicationSettings.activityIndicatorHideDelay);
    }

    performDataAcquisition(
        `${applicationSettings.resourceBase}${applicationSettings.apiPath}`,
        (content) => {
            const {
                markers,
                rows
            } = processRawContent(content);
            applicationState.currentMarkers = markers;
            applicationState.currentFeedItems = rows;

            uiElements.geographicDisplay.annotations = applicationState.currentMarkers;
            uiElements.contentFeedDisplay.feedList.setData(applicationState.currentFeedItems);

            if (Ti.Platform.osname !== 'android') {
                uiElements.progressMonitor.hide();
            }

            updateMapToCurrentLocation();
        },
        (error) => {
            uiElements.progressMonitor.hide();
            createVisualElement('createAlertDialog', {
                title: 'Network Issue',
                message: 'Failed to retrieve data. Please check your internet connection and try again.',
                buttonNames: ['Okay'],
            }).show();
            Ti.API.error("Data acquisition error: ", error);
        }
    );
};

(() => {
    setupUI();
    attachEventListeners();
    initializeApplicationData();
})();