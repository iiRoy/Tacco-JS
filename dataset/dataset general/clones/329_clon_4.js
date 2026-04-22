class PathNavigator {
  constructor() {
    this.pathDisplay = null;
    this.altitudeService = null;
    this.currentView = null;
    this.completionWidgets = {};
    this.activePathSegments = [];
    this.processedAltitudePoints = [];
    this.journeyMetrics = {
      length: null,
      duration: null
    };
    this.unitSelection = 'miles';
    this.unitLabel = 'ft';
    this.altitudeMultiplier = 3.28084;

    this.displayRefreshActive = false;
    this.refreshDisplayDebounced = this._scheduleDebounce(this._processRouteDetails.bind(this), 100);

    // Ensure 'this' context for event handlers
    this._onFormSubmitted = this._onFormSubmitted.bind(this);
    this._onPathIndexChanged = this._onPathIndexChanged.bind(this);
    this._onInputSwapClicked = this._onInputSwapClicked.bind(this);
    this._onChartSegmentHover = this._onChartSegmentHover.bind(this);
    this._onChartSegmentOut = this._onChartSegmentOut.bind(this);
  }

  // Custom debouncer implementation
  _scheduleDebounce(action, delayMs) {
    let timerHandle;
    return (...args) => {
      clearTimeout(timerHandle);
      timerHandle = setTimeout(() => {
        action(...args);
      }, delayMs);
    };
  }

  async initializeApplicationModule() {
    this._setupMapComponents();
    this._prepareUserInputs();
    this._configureInputCompletion('origin-spot');
    this._configureInputCompletion('destination-spot');

    const originIdentifier = this._retrieveQueryParam('startSpot');
    const destinationIdentifier = this._retrieveQueryParam('endSpot');

    if (originIdentifier && destinationIdentifier) {
      await this._triggerPathCalculation();
    }
  }

  _setupMapComponents() {
    const renderConfig = {
      draggable: true,
      hideRouteList: true,
      polylineOptions: {
        strokeOpacity: 0
      }
    };
    this.pathDisplay = new google.maps.DirectionsRenderer(renderConfig);

    const mapHostElement = document.getElementById('map-container');
    const mapConfiguration = {
      center: new google.maps.LatLng(37.787930, -122.4074990),
      zoom: 13,
      disableDefaultUI: false,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };
    this.currentView = new google.maps.Map(mapHostElement, mapConfiguration);
    this.pathDisplay.setMap(this.currentView);
    this.altitudeService = new google.maps.ElevationService();

    google.maps.event.addListener(this.pathDisplay, 'routeindex_changed', this._onPathIndexChanged);
  }

  _prepareUserInputs() {
    const originField = document.getElementById('origin-spot');
    const destinationField = document.getElementById('destination-spot');
    const travelModeField = document.getElementById('journey-mode');
    const unitField = document.getElementById('unit-choice');

    const urlOrigin = this._retrieveQueryParam('startSpot');
    const urlDestination = this._retrieveQueryParam('endSpot');
    const urlTravelMode = this._retrieveQueryParam('journeyMode');
    const urlUnit = this._retrieveQueryParam('unitChoice');

    if (urlOrigin !== null) {
      originField.value = this._decodeUrlSegment(urlOrigin);
    }
    if (urlDestination !== null) {
      destinationField.value = this._decodeUrlSegment(urlDestination);
    }
    if (urlTravelMode !== null) {
      travelModeField.value = this._decodeUrlSegment(urlTravelMode);
    }

    if (urlUnit === null) {
      this.unitSelection = 'miles';
    } else {
      this.unitSelection = this._decodeUrlSegment(urlUnit);
      unitField.value = this.unitSelection;
    }
    this._adjustUnitSystem();

    document.getElementById('input-swap-button').addEventListener('click', this._onInputSwapClicked);
    document.getElementById('path-query-form').addEventListener('submit', this._onFormSubmitted);
  }

  _adjustUnitSystem() {
    if (this.unitSelection === 'miles') {
      this.unitLabel = 'ft';
      this.altitudeMultiplier = 3.28084;
    } else {
      this.unitLabel = 'm';
      this.altitudeMultiplier = 1;
    }
  }

  _configureInputCompletion(elementId) {
    const targetElement = document.getElementById(elementId);
    this.completionWidgets[elementId] = new google.maps.places.Autocomplete(targetElement);

    targetElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && document.querySelector('.pac-container:visible')) {
        event.preventDefault();
      }
    });
  }

  async _onFormSubmitted(event) {
    event.preventDefault();
    this.unitSelection = document.getElementById('unit-choice').value;
    this._adjustUnitSystem();
    await this._triggerPathCalculation();
  }

  async _triggerPathCalculation() {
    const startLocation = document.getElementById('origin-spot').value || document.getElementById('origin-spot').placeholder;
    const endLocation = document.getElementById('destination-spot').value || document.getElementById('destination-spot').placeholder;
    const journeyMode = document.getElementById('journey-mode').value;

    const queryParameters = {
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode[journeyMode.toUpperCase()]
    };

    try {
      const pathResult = await this._fetchPathDirections(queryParameters);
      this.pathDisplay.setDirections(pathResult);
      this._updateBrowserHistory(startLocation, endLocation, journeyMode);
    } catch (error) {
      alert(`Path computation failed: ${error}`);
    }
  }

  _fetchPathDirections(requestObj) {
    return new Promise((resolve, reject) => {
      const directionService = new google.maps.DirectionsService();
      directionService.route(requestObj, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          resolve(response);
        } else {
          reject(status);
        }
      });
    });
  }

  _updateBrowserHistory(start, end, mode) {
    const encodedStart = this._encodeUrlSegment(start);
    const encodedEnd = this._encodeUrlSegment(end);
    const newUrlState = `?startSpot=${encodedStart}&endSpot=${encodedEnd}&journeyMode=${mode}&unitChoice=${this.unitSelection}`;
    history.replaceState(null, 'Elevation Profile Viewer', newUrlState);
  }

  _onPathIndexChanged() {
    if (this.displayRefreshActive) return;
    this.displayRefreshActive = true;
    this.refreshDisplayDebounced(this.pathDisplay.getDirections());
  }

  async _processRouteDetails(directionResponse) {
    this.displayRefreshActive = false;

    const chosenRoute = directionResponse.routes[this.pathDisplay.getRouteIndex()];
    const overviewCoordinates = chosenRoute.overview_path;
    this.journeyMetrics.length = chosenRoute.legs[0].distance;
    this.journeyMetrics.duration = chosenRoute.legs[0].duration;

    this._updateJourneyInfoDisplay();

    const altitudeRequest = {
      path: overviewCoordinates,
      samples: 300
    };

    try {
      const rawAltitudeData = await this._retrieveAltitudeData(altitudeRequest);
      this._visualizeAltitudeAndGradient(rawAltitudeData);
    } catch (error) {
      alert(`Failed to obtain altitude data: ${error}`);
    }
  }

  _updateJourneyInfoDisplay() {
    const distanceOutput = document.getElementById('distance-measurement');
    const durationOutput = document.getElementById('travel-duration-display');

    if (this.unitSelection === 'miles') {
      distanceOutput.textContent = this.journeyMetrics.length.text;
    } else {
      distanceOutput.textContent = `${(this.journeyMetrics.length.value / 1000).toFixed(2)} Km`;
    }
    durationOutput.textContent = this.journeyMetrics.duration.text;
    document.querySelector('.journey-summary-section').style.display = 'block';
  }

  _retrieveAltitudeData(request) {
    return new Promise((resolve, reject) => {
      this.altitudeService.getElevationAlongPath(request, (altitudeReadings, status) => {
        if (status === google.maps.ElevationStatus.OK) {
          resolve(altitudeReadings);
        } else {
          reject(status);
        }
      });
    });
  }

  _visualizeAltitudeAndGradient(rawReadings) {
    const detailedPoints = rawReadings.map((point, index, array) => {
      const convertedAltitude = point.elevation * this.altitudeMultiplier;
      let gradientValue = 0;
      if (index < array.length - 1) {
        const nextPoint = array[index + 1];
        const altitudeChange = (nextPoint.elevation - point.elevation) * this.altitudeMultiplier;
        const segmentLength = this.journeyMetrics.length.value / (array.length - 1);
        gradientValue = (altitudeChange / segmentLength) * 100;
      }

      return {
        geographicLocation: point.location,
        altitude: convertedAltitude,
        rawAltitude: point.elevation,
        gradient: gradientValue
      };
    });

    this.processedAltitudePoints = detailedPoints;

    this._renderAltitudeChart(detailedPoints);
    this._renderGradientChart(detailedPoints);
    this._drawGradientPathSegments(detailedPoints);
  }

  _renderAltitudeChart(dataElements) {
    const altitudeChartDiv = document.getElementById('altitude-chart-panel');
    altitudeChartDiv.style.display = 'block';

    const altitudeTable = new google.visualization.DataTable();
    altitudeTable.addColumn('string', 'Location');
    altitudeTable.addColumn('number', 'Altitude');

    dataElements.forEach(element => {
      altitudeTable.addRow(['', element.altitude]);
    });

    const chartDisplay = new google.visualization.ColumnChart(altitudeChartDiv);
    chartDisplay.draw(altitudeTable, {
      legend: 'none',
      titleY: `Altitude (${this.unitLabel})`
    });

    google.visualization.events.addListener(chartDisplay, 'onmouseover', (event) => this._onChartSegmentHover(event, 'altitude'));
    google.visualization.events.addListener(chartDisplay, 'onmouseout', this._onChartSegmentOut);
  }

  _renderGradientChart(dataElements) {
    const gradientChartDiv = document.getElementById('gradient-chart-panel');
    gradientChartDiv.style.display = 'block';

    const gradientTable = new google.visualization.DataTable();
    gradientTable.addColumn('string', 'Section');
    gradientTable.addColumn('number', 'Gradient');

    for (let i = 0; i < dataElements.length - 1; i++) {
      gradientTable.addRow(['', dataElements[i].gradient]);
    }

    const chartDisplay = new google.visualization.ColumnChart(gradientChartDiv);
    chartDisplay.draw(gradientTable, {
      legend: 'none',
      titleY: 'Gradient (%)'
    });

    google.visualization.events.addListener(chartDisplay, 'onmouseover', (event) => this._onChartSegmentHover(event, 'gradient'));
    google.visualization.events.addListener(chartDisplay, 'onmouseout', this._onChartSegmentOut);
  }

  _clearExistingPathSegments() {
    this.activePathSegments.forEach(segment => segment.setMap(null));
    this.activePathSegments = [];
  }

  _drawGradientPathSegments(dataElements) {
    this._clearExistingPathSegments();

    const gradientColorPalette = [{
      threshold: 5,
      hue: "#3CB371"
    }, // Green
      {
        threshold: 10,
        hue: "#FFFF00"
      }, // Yellow
      {
        threshold: 15,
        hue: "#3366FF"
      }, // Blue
      {
        threshold: 20,
        hue: "#FF0000"
      }, // Red
      {
        threshold: Infinity,
        hue: "#000000"
      } // Black
    ];

    for (let i = 0; i < dataElements.length - 1; i++) {
      const segmentPathCoords = [
        dataElements[i].geographicLocation,
        dataElements[i + 1].geographicLocation
      ];
      const absoluteGradient = Math.abs(dataElements[i].gradient);

      const segmentColor = gradientColorPalette.find(entry => absoluteGradient <= entry.threshold).hue;

      const newSegment = new google.maps.Polyline({
        path: segmentPathCoords,
        strokeColor: segmentColor,
        strokeOpacity: 0.5,
        strokeWeight: 5,
        draggable: true
      });
      newSegment.setMap(this.currentView);
      this.activePathSegments.push(newSegment);
    }
  }

  _gradientToAngularMeasure(gradientPercentage) {
    return Math.floor(gradientPercentage * 45) / 100;
  }

  _onChartSegmentHover(event, chartType) {
    const rowIdx = event.row;
    if (rowIdx === null) return;

    const pointDetails = this.processedAltitudePoints[rowIdx];
    if (!pointDetails) return;

    let markerLocation = pointDetails.geographicLocation;
    const markerAltitude = pointDetails.altitude;
    const markerGradient = pointDetails.gradient;

    if (chartType === 'gradient' && rowIdx < this.processedAltitudePoints.length - 1) {
      const nextPointDetails = this.processedAltitudePoints[rowIdx + 1];
      markerLocation = this._calculateIntermediatePoint(pointDetails.geographicLocation, nextPointDetails.geographicLocation);
    }

    const infoContent = `Altitude: ${markerAltitude.toFixed(0)} ${this.unitLabel}<br>` +
      `Gradient: ${markerGradient.toFixed(0)}% (${this._gradientToAngularMeasure(markerGradient).toFixed(1)}&#176;)`;

    this._temporaryMarker = new google.maps.Marker({
      position: markerLocation,
      map: this.currentView,
    });
    this._displayFloatingPopup(infoContent);
  }

  _onChartSegmentOut() {
    if (this._temporaryMarker) {
      this._temporaryMarker.setMap(null);
      this._temporaryMarker = null;
    }
    if (this._floatingPopup) {
      this._floatingPopup.close();
      this._floatingPopup = null;
    }
  }

  _displayFloatingPopup(messageContent) {
    if (this._floatingPopup) {
      this._floatingPopup.close();
    }
    this._floatingPopup = new google.maps.InfoWindow({
      content: messageContent
    });
    this._floatingPopup.open(this.currentView, this._temporaryMarker);
  }

  _calculateIntermediatePoint(pointOne, pointTwo) {
    const midLat = (pointOne.lat() + pointTwo.lat()) / 2;
    const midLng = (pointOne.lng() + pointTwo.lng()) / 2;
    return new google.maps.LatLng(midLat, midLng);
  }

  _onInputSwapClicked() {
    const originInput = document.getElementById('origin-spot');
    const destinationInput = document.getElementById('destination-spot');
    const temporaryValue = originInput.value;
    originInput.value = destinationInput.value;
    destinationInput.value = temporaryValue;
  }

  _retrieveQueryParam(keyName) {
    const query = new URLSearchParams(location.search);
    const val = query.get(keyName);
    return val === null ? null : val;
  }

  _encodeUrlSegment(textData) {
    return encodeURIComponent(textData).replace(/%20/g, '+');
  }

  _decodeUrlSegment(textData) {
    return decodeURIComponent(textData.replace(/[!'()]/g, escape).replace(/\+/g, ' '));
  }
}

// Load Google visualization API and then initialize the application
google.load("visualization", "1", {
  packages: ["columnchart"],
  callback: () => {
    document.addEventListener('DOMContentLoaded', async () => {
      const mainApp = new PathNavigator();
      await mainApp.initializeApplicationModule();
    });
  }
});