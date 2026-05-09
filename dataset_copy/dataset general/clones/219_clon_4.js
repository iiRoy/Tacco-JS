const displayConfiguration = {
    baseGraphicProperties: {
        imageDimensions: [25, 30],
        imagePinpoint: [22, 94],
        dialogOffset: [-3, -76]
    },
    graphicSources: {
        lodging: 'static/img/hotel.png',
        vehicleStop: 'static/img/parking.png'
    },
    mainDisplaySettings: {
        targetElement: 'map',
        initialView: new L.LatLng(40.735522, -73.997102),
        magnificationLevel: 14,
        wheelInteraction: false
    },
    backgroundLayerDetails: {
        urlTemplate: 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
        options: {
            maximumMagnification: 22,
            creditNotice: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                          'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            sourceIdentifier: 'examples.map-i875mjb7',
        }
    },
    pointIndicatorsData: [
        { coords: [40.737257, -73.999952], type: 'vehicleStop', info: "<b>Quick Park - 175 W 12th St, (646) 336-6225" },
        { coords: [40.737987, -73.995353], type: 'vehicleStop', info: "<b>Icon Parking - Union Square, Flatiron, 65 W 15th St, (212) 366-4632" },
        { coords: [40.735843, -73.995481], type: 'vehicleStop', info: "<b>Central Parking - Greenwich Village, Union Square, 20 W 13th St (800) 836-6666 " },
        { coords: [40.745614, -73.992231], type: 'lodging', info: "<b>Holiday Inn Manhattan Chelsea: rates: $289.00 - $309.00: contact 212-430-8500 - callers must advise they are with the New School and request the New School corporate rate: http://www.hidowntown-nyc.com/" },
        { coords: [40.739726, -73.982344], type: 'lodging', info: "<b>Marcel at Gramercy: rates: $329.00: contact 1-888-664-6835 - callers must advise they are with the New School and request the New School corporate rate: http://www.hotelmarcelnewyork.com/" },
        { coords: [40.732738, -73.998708], type: 'lodging', info: "<b>The Washington Square Hotel: rates: $263.00 - $361.00: contact 212-777-9515 - callers must advise they are with the New School and request the New School corporate rate: http://www.wshotel.com/" },
        { coords: [40.735522, -73.997102], type: 'event', info: "<b> [EVENT] Parsons The New School for Design: For hotel reservation questions please contact Katie Wanner wannk858@newschool.edu" }
    ]
};

const generateGraphic = (sourceKey, baseProps, sources) => {
    return L.icon({
        iconUrl: sources[sourceKey],
        iconSize: baseProps.imageDimensions,
        iconAnchor: baseProps.imagePinpoint,
        popupAnchor: baseProps.dialogOffset
    });
};

const setupGeospatialDisplay = (config) => {
    const lodgingGraphic = generateGraphic('lodging', config.baseGraphicProperties, config.graphicSources);
    const vehicleStopGraphic = generateGraphic('vehicleStop', config.baseGraphicProperties, config.graphicSources);

    const graphicRegistry = {
        lodging: lodgingGraphic,
        vehicleStop: vehicleStopGraphic,
        event: null
    };

    const areaDisplay = L.map(config.mainDisplaySettings.targetElement, {
        center: config.mainDisplaySettings.initialView,
        zoom: config.mainDisplaySettings.magnificationLevel,
        scrollWheelZoom: config.mainDisplaySettings.wheelInteraction
    });

    L.tileLayer(config.backgroundLayerDetails.urlTemplate, config.backgroundLayerDetails.options)
     .addTo(areaDisplay);

    config.pointIndicatorsData.forEach(item => {
        const indicatorOptions = {};
        if (graphicRegistry[item.type]) {
            indicatorOptions.icon = graphicRegistry[item.type];
        }

        const currentIndicator = L.marker(item.coords, indicatorOptions);
        currentIndicator.addTo(areaDisplay);
        currentIndicator.bindPopup(item.info);
        currentIndicator.openPopup();
    });

    const floatingDialog = L.popup();
};

setupGeospatialDisplay(displayConfiguration);