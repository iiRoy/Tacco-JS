class AddressInputEnhancer {
  #inputField;
  #valueObserver;
  #detailObserver;
  #mapAutocompleteWidget;
  #activatePredictionFallback;
  #currentConfiguration;

  constructor(targetDomElement, modelChangeCallback, infoChangeCallback, initialSettings = {}, startingText = '') {
    this.#inputField = targetDomElement;
    this.#valueObserver = modelChangeCallback;
    this.#detailObserver = infoChangeCallback;
    this.#activatePredictionFallback = false;
    this.#currentConfiguration = {};

    this.#mapAutocompleteWidget = new google.maps.places.Autocomplete(this.#inputField, {});

    this.#inputField.value = startingText;
    this.#valueObserver(startingText);

    this.adjustFeatureSettings(initialSettings);
    this.#bindEventListeners();
  }

  updateDisplayContent(newContent) {
    if (this.#inputField.value !== newContent) {
      this.#inputField.value = newContent;
    }
  }

  adjustFeatureSettings(newOptions) {
    if (!newOptions) {
      newOptions = {};
    }

    this.#currentConfiguration = {};

    this.#activatePredictionFallback = (newOptions.autoSelectFirst === true);

    if (newOptions.allowedCategories) {
      this.#currentConfiguration.types = [newOptions.allowedCategories];
      this.#mapAutocompleteWidget.setTypes(this.#currentConfiguration.types);
    } else {
      this.#mapAutocompleteWidget.setTypes([]);
    }

    if (newOptions.areaBias) {
      this.#currentConfiguration.bounds = newOptions.areaBias;
      this.#mapAutocompleteWidget.setBounds(this.#currentConfiguration.bounds);
    } else {
      this.#mapAutocompleteWidget.setBounds(null);
    }

    if (newOptions.nationCode) {
      this.#currentConfiguration.componentRestrictions = {
        country: newOptions.nationCode
      };
      this.#mapAutocompleteWidget.setComponentRestrictions(this.#currentConfiguration.componentRestrictions);
    } else {
      this.#mapAutocompleteWidget.setComponentRestrictions(null);
    }
  }

  #bindEventListeners() {
    google.maps.event.addListener(this.#mapAutocompleteWidget, 'place_changed', () => {
      const chosenItem = this.#mapAutocompleteWidget.getPlace();
      this.#handlePlaceResult(chosenItem);
    });
  }

  #handlePlaceResult(obtainedItem) {
    if (!obtainedItem) {
      this.#detailObserver(null);
      return;
    }

    if (obtainedItem.address_components) {
      this.#detailObserver(obtainedItem);
      this.#valueObserver(this.#inputField.value);
    } else {
      if (this.#activatePredictionFallback) {
        this.#retrieveAndApplyTopPrediction(obtainedItem.name);
      } else {
        this.#detailObserver(null);
        this.#valueObserver(this.#inputField.value);
      }
    }
  }

  #retrieveAndApplyTopPrediction(searchQuery) {
    if (!searchQuery || searchQuery.length === 0) {
      this.#detailObserver(null);
      this.#valueObserver(this.#inputField.value);
      return;
    }

    const predictionProvider = new google.maps.places.AutocompleteService();
    predictionProvider.getPlacePredictions({
      input: searchQuery,
      offset: searchQuery.length,
      ...this.#currentConfiguration
    }, (resultsList, queryStatus) => {
      if (queryStatus === google.maps.places.PlacesServiceStatus.OK && resultsList && resultsList.length > 0) {
        const primaryResult = resultsList[0];
        const detailProvider = new google.maps.places.PlacesService(this.#inputField);
        detailProvider.getDetails({
          'reference': primaryResult.reference
        }, (completeDetails, detailStatus) => {
          if (detailStatus === google.maps.GeocoderStatus.OK) {
            this.#detailObserver(completeDetails);
            this.#valueObserver(completeDetails.formatted_address);
            this.#inputField.value = completeDetails.formatted_address;

            const restoreFocusValue = () => {
              this.#inputField.value = completeDetails.formatted_address;
              this.#inputField.removeEventListener('focusout', restoreFocusValue);
            };
            this.#inputField.addEventListener('focusout', restoreFocusValue);

          } else {
            this.#detailObserver(null);
            this.#valueObserver(this.#inputField.value);
          }
        });
      } else {
        this.#detailObserver(null);
        this.#valueObserver(this.#inputField.value);
      }
    });
  }
}