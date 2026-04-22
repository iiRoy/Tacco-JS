(function(paramJQuery) {
  var globalQueryService = new google.maps.Geocoder();

  function recursivelyMergeObjects(targetObj, sourceObj) {
      for (const keyId in sourceObj) {
          if (sourceObj.hasOwnProperty(keyId)) {
              if (sourceObj[keyId] instanceof Object && !Array.isArray(sourceObj[keyId]) && sourceObj[keyId] !== null) {
                  if (!targetObj[keyId]) Object.assign(targetObj, { [keyId]: {} });
                  recursivelyMergeObjects(targetObj[keyId], sourceObj[keyId]);
              } else {
                  Object.assign(targetObj, { [keyId]: sourceObj[keyId] });
              }
          }
      }
      return targetObj;
  }

  class MapPointFinder {
    constructor(targetInputNode, configuration) {
      this.targetInputNode = targetInputNode;
      this.configuration = recursivelyMergeObjects({}, MapPointFinder.defaultConfiguration, configuration || {});

      this.mapDisplay = null;
      this.pinPointer = null;
      this.typingDelayIdentifier = null;
      this.lastSearchedLocation = null;

      this.handleInitialization = this.handleInitialization.bind(this);
      this.handleMapCreation = this.handleMapCreation.bind(this);
      this.handleInputMonitoring = this.handleInputMonitoring.bind(this);
      this.handleQueryResultProcessing = this.handleQueryResultProcessing.bind(this);
      this.handleSuccessCallback = this.handleSuccessCallback.bind(this);
      this.handleFailureCallback = this.handleFailureCallback.bind(this);

      // Direct sequential setup, replacing the iteration over 'setup' object
      this.handleInitialization(this.configuration);
      this.handleMapCreation(this.configuration);
      this.handleInputMonitoring(this.configuration);
      this.handleQueryResultProcessing(this.configuration);
      this.handleSuccessCallback(this.configuration);
      this.handleFailureCallback(this.configuration);

      this.signalEvent('finder:commence');
    }

    signalEvent(eventName, detailData = {}) {
      const customEvent = new CustomEvent(eventName, { detail: detailData });
      this.targetInputNode.dispatchEvent(customEvent);
    }

    monitorEvent(eventName, callback) {
      this.targetInputNode.addEventListener(eventName, event => {
        callback.apply(this, [event].concat(Array.isArray(event.detail) ? event.detail : [event.detail]));
      });
    }

    handleInitialization(configuration) {
      configuration.startingView.centralPoint = new google.maps.LatLng(
        configuration.startingView.centralPoint[0],
        configuration.startingView.centralPoint[1]
      );

      this.monitorEvent('finder:commence', () => {
        this.signalEvent('finder:constructVisuals');
        this.signalEvent('finder:monitorInput');
      });
    }

    handleMapCreation(configuration) {
      this.monitorEvent('finder:constructVisuals', () => {
        const parentOfInput = this.targetInputNode.parentNode;
        const mapDisplayContainer = document.createElement("div");
        mapDisplayContainer.className = configuration.displayStyle;

        const placementSetting = configuration.placementMode;

        if (placementSetting === "before" || placementSetting === "after") {
          parentOfInput.insertBefore(mapDisplayContainer, placementSetting === "before" ? this.targetInputNode : this.targetInputNode.nextSibling);
        } else {
          const designatedContainer = document.querySelector(placementSetting);
          if (designatedContainer) {
            designatedContainer.appendChild(mapDisplayContainer);
          } else {
            console.warn("Designated map container selector not found:", placementSetting);
            parentOfInput.insertBefore(mapDisplayContainer, this.targetInputNode.nextSibling);
          }
        }

        this.targetInputNode.addEventListener("keyup", () => {
          this.signalEvent('finder:monitorInput');
        });

        this.mapDisplay = new google.maps.Map(mapDisplayContainer, configuration.startingView);
      });
    }

    handleInputMonitoring(configuration) {
      this.monitorEvent('finder:monitorInput', () => {
        const currentInputValue = this.targetInputNode.value;
        const processedLocation = currentInputValue.trim().replace(/\s+/g, " ").toLowerCase();

        clearTimeout(this.typingDelayIdentifier);

        if (this.lastSearchedLocation && this.lastSearchedLocation === processedLocation) {
          return;
        }

        if (processedLocation === "") {
          this.signalEvent('finder:resultObtained', { outcomes: [], queryStatus: "" });
          return;
        }

        this.typingDelayIdentifier = setTimeout(() => {
          this.lastSearchedLocation = processedLocation;
          globalQueryService.geocode({ address: processedLocation }, (results, status) => {
            this.signalEvent('finder:resultObtained', { outcomes: results, queryStatus: status });
          });
        }, configuration.inputPauseMs);
      });
    }

    handleQueryResultProcessing(configuration) {
      this.monitorEvent('finder:resultObtained', (evt, detail) => {
        const outcomes = detail.outcomes;
        const queryStatus = detail.queryStatus;

        if (!this.pinPointer) {
          this.pinPointer = new google.maps.Marker();
        }

        if (queryStatus === google.maps.GeocoderStatus.OK) {
          const geoInfo = outcomes[0].geometry;
          const geoPosition = geoInfo.location;

          if (configuration.successfulLookupSettings.magnificationLevel === "auto") {
            this.mapDisplay.fitBounds(geoInfo.viewport);
          } else {
            this.mapDisplay.setZoom(configuration.successfulLookupSettings.magnificationLevel);
            this.mapDisplay.setCenter(geoPosition);
          }

          this.pinPointer.setPosition(geoPosition);
          this.pinPointer.setMap(this.mapDisplay);

          this.signalEvent('finder:lookupSuccess', { outcomes: outcomes, queryStatus: queryStatus });
        } else {
          const initialView = configuration.startingView;

          if (this.pinPointer) {
            this.pinPointer.setMap(null);
          }

          this.mapDisplay.setZoom(initialView.magnificationLevel);
          this.mapDisplay.setCenter(initialView.centralPoint);

          this.signalEvent('finder:lookupFailure', { outcomes: outcomes, queryStatus: queryStatus });
        }
      });
    }

    handleSuccessCallback(configuration) {}
    handleFailureCallback(configuration) {}
  }

  MapPointFinder.defaultConfiguration = {
    displayStyle: "map-area-widget",
    placementMode: "after",
    inputPauseMs: 500,
    successfulLookupSettings: {
      magnificationLevel: "auto"
    },
    startingView: {
      magnificationLevel: 1,
      centralPoint: [34, 0],
      isDraggable: false,
      mapViewType: google.maps.MapTypeId.ROADMAP,
      scrollWheelEnabled: false,
      defaultUiDisabled: true,
      doubleClickZoomDisabled: true
    }
  };

  paramJQuery.fn.mapLocator = function(userOptions) {
    this.each(function() {
      new MapPointFinder(this, userOptions);
    });
    return this;
  };
})(jQuery);