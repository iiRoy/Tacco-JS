class LocationUtilities {
  #defaultGeographicPoint = {
    placeLatitude: 33.987873,
    placeLongitude: -118.470719,
    accuracyMeasure: 0.0
  };

  constructor(httpClient = fetch, loggingTool = console, geoProvider = navigator.geolocation) {
    this.httpClient = httpClient;
    this.loggingTool = loggingTool;
    this.geoProvider = geoProvider;
  }

  obtainCurrentLocation(positionOptions) {
    const defaultSettings = {
      waitDuration: 10000,
      stalePeriod: 0,
      highPrecision: false
    };
    const finalSettings = { ...defaultSettings, ...positionOptions };

    return new Promise((resolveLocation, rejectLocation) => {
      if (!this.geoProvider || !this.geoProvider.getCurrentPosition) {
        this.loggingTool.error('Geolocation provider unavailable.');
        return rejectLocation({
          errorCode: -1,
          errorMessage: 'Geolocation service is not accessible.',
          cachedCoordinates: this.#defaultGeographicPoint
        });
      }

      this.geoProvider.getCurrentPosition(
        (acquiredPosition) => {
          this.loggingTool.info('Location successfully obtained.');
          resolveLocation(acquiredPosition);
        },
        (locFailure) => {
          this.loggingTool.warn('Location retrieval failed.');
          rejectLocation({
            errorCode: locFailure.code,
            errorMessage: locFailure.message,
            cachedCoordinates: this.#defaultGeographicPoint
          });
        },
        {
          timeout: finalSettings.waitDuration,
          maximumAge: finalSettings.stalePeriod,
          enableHighAccuracy: finalSettings.highPrecision
        }
      );
    });
  }

  async geocodeAddress(locationString) {
    const apiEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&sensor=false`;

    try {
      const httpResponse = await this.httpClient(apiEndpoint);
      if (!httpResponse.ok) {
        throw new Error(`Network issue! Status: ${httpResponse.status}`);
      }
      const geocodedData = await httpResponse.json();

      if (!geocodedData.results || geocodedData.results.length === 0) {
        throw new Error('No geographical data found for the input address.');
      }

      const firstResultLocation = geocodedData.results[0].geometry.location;

      return {
        placeLatitude: firstResultLocation.lat,
        placeLongitude: firstResultLocation.lng
      };
    } catch (operationProblem) {
      this.loggingTool.error('Address geocoding encountered a problem:', operationProblem);
      return Promise.reject(operationProblem);
    }
  }

  retrieveDefaultLocation() {
    return this.#defaultGeographicPoint;
  }
}