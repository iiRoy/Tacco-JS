(function(domUtility) {

  const VARIANT_PERSISTENCE_KEY = 'exp_variant_id_val';
  const DEVELOPMENT_FLAG_IDENTIFIER = '#!abtest_debug';
  const RNG_MAX_VALUE = 1000000;

  class CookieManager {
    static retrieveValue(keyTag) {
      const parts = document.cookie.split(';');
      for (let i = 0; i < parts.length; i++) {
        let piece = parts[i];
        while (piece.charAt(0) === ' ') piece = piece.substring(1);
        if (piece.indexOf(keyTag + '=') === 0) {
          return piece.substring(keyTag.length + 1, piece.length);
        }
      }
      return null;
    }

    static storeValue(keyTag, content, lifespanDays) {
      let expiryInfo = '';
      if (lifespanDays) {
        const dateObj = new Date();
        dateObj.setTime(dateObj.getTime() + (lifespanDays * 24 * 60 * 60 * 1000));
        expiryInfo = '; expires=' + dateObj.toUTCString();
      }
      document.cookie = keyTag + '=' + content + expiryInfo + '; path=/';
    }
  }

  class RandomValueGenerator {
    constructor() {
      this.currentRandomNumber = null;
    }

    obtainRandomValue(inDevelopmentMode) {
      if (inDevelopmentMode) {
        return Math.floor(Math.random() * RNG_MAX_VALUE);
      }

      if (this.currentRandomNumber === null) {
        let storedNumber = CookieManager.retrieveValue(VARIANT_PERSISTENCE_KEY);
        if (!storedNumber) {
          storedNumber = Math.floor(Math.random() * RNG_MAX_VALUE);
          CookieManager.storeValue(VARIANT_PERSISTENCE_KEY, storedNumber, 30);
        }
        this.currentRandomNumber = parseInt(storedNumber, 10);
      }
      return this.currentRandomNumber;
    }
  }

  class AnalyticsReporter {
    constructor(experimentId) {
      this.experimentId = experimentId;
    }

    displayDiagnosticMessage(messageText) {
      if (typeof window['console'] !== 'undefined' && typeof messageText === 'string') {
        window['console']['debug'](`AB-Experiment [${this.experimentId}]: ${messageText}`);
      }
    }

    sendCustomDimension(dimensionIndex, dimensionKey, dimensionContent, additionalProperties) {
      const dimensionScope = additionalProperties['scope'] || 3;
      if (window['googleAnalyticsPushQueue']) {
        window['googleAnalyticsPushQueue'].push(['_setCustomVar', dimensionIndex, dimensionKey, dimensionContent, dimensionScope]);
      }
    }

    sendEvent(eventCategory, eventAction, additionalProperties) {
      const eventLabel = additionalProperties['event-label'] || undefined;
      const eventValue = additionalProperties['event-value'] || undefined;
      const nonInteractionFlag = (additionalProperties['event-noninteraction'] !== undefined) ? additionalProperties['event-noninteraction'] : true;

      if (window['googleAnalyticsPushQueue']) {
        window['googleAnalyticsPushQueue'].push(['_trackEvent', eventCategory, eventAction, eventLabel, eventValue, nonInteractionFlag]);
      }
    }

    recordExperimentResult(assignedVariationPayload, trackingSettings, inDevelopmentMode, assignedVariationIndex) {
      if (typeof window['googleAnalyticsPushQueue'] !== 'undefined') {
        let reportableValue;
        if (assignedVariationIndex !== 0) {
          reportableValue = assignedVariationPayload ? assignedVariationPayload['outcome-tag'] : `variation${assignedVariationIndex}`;
        } else {
          reportableValue = trackingSettings['default-label'] || 'baseline';
        }

        if (inDevelopmentMode) {
          if (trackingSettings['dimension-index']) {
            this.displayDiagnosticMessage(`${reportableValue} (custom dimension ${trackingSettings['dimension-index']})`);
          } else {
            this.displayDiagnosticMessage(`${reportableValue} (event)`);
          }
        } else if (trackingSettings['dimension-index']) {
          this.sendCustomDimension(trackingSettings['dimension-index'], this.experimentId, reportableValue, trackingSettings);
        } else {
          this.sendEvent(this.experimentId, reportableValue, trackingSettings);
        }
      }
    }
  }

  class ExperimentSetup {
    constructor(configuration, domUtilityReference) {
      this.configuration = configuration;
      this.domUtility = domUtilityReference;
      this.experimentIdentifier = configuration['identifier'];
      this.inDevelopmentMode = window.location.href.includes(DEVELOPMENT_FLAG_IDENTIFIER);
      this.rngHandler = new RandomValueGenerator();
      this.reporter = new AnalyticsReporter(this.experimentIdentifier);

      this.assignedVariationIndex = null;
      this.chosenVariation = null;

      this.executeExperimentAssignment();
    }

    executeExperimentAssignment() {
      if (!this.experimentIdentifier || !this.configuration['variations'] || !navigator.cookieEnabled) {
        return;
      }

      const totalPossibleVariations = this.configuration['variations'].length + 1;
      const seedValue = this.rngHandler.obtainRandomValue(this.inDevelopmentMode);
      this.assignedVariationIndex = seedValue % totalPossibleVariations;

      if (this.assignedVariationIndex !== 0) {
        this.chosenVariation = this.configuration['variations'][this.assignedVariationIndex - 1];
      }

      this.reporter.recordExperimentResult(
        this.chosenVariation ? this.chosenVariation['outcome-tag'] : undefined,
        this.configuration,
        this.inDevelopmentMode,
        this.assignedVariationIndex
      );
    }

    applyContentToElements(elementCollection) {
      if (this.assignedVariationIndex !== 0 && this.chosenVariation && this.chosenVariation['target-content']) {
        elementCollection.each((idx, currentElement) => {
          const domElementWrapper = this.domUtility(currentElement);
          const contentToRender = this.chosenVariation['target-content'];

          if (typeof contentToRender === 'string') {
            domElementWrapper.text(contentToRender);
          } else if (typeof contentToRender === 'function') {
            contentToRender(domElementWrapper);
          }
        });
      }
      return elementCollection;
    }
  }

  domUtility.fn.abTestActivator = function(testConfiguration) {
    if (!testConfiguration || typeof testConfiguration !== 'object' || !testConfiguration['identifier']) {
      return this;
    }

    const activeExperiment = new ExperimentSetup(testConfiguration, domUtility);

    return activeExperiment.applyContentToElements(this);
  };

})(window['jQuery'] || window['Zepto']);