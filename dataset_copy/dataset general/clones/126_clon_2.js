(function () {

    'use strict';

    function AdaptiveVisuals($targetElement) {

        ComponentHub.logDebug('Starting Adaptive Visuals component', $targetElement);

        this.$targetElement = $targetElement;

        this.visualKind = '';
        this.capabilityTests = '';
        this.viewportQueries = '';
        this.fallbackAsset = '';
        this.displayedVisual = '';

        /* Establish component settings based on element attributes */
        this.configureSettings();

        var selfContext = this;
        DomUtil(globalWindow).on('load component.activate ' + (!this.viewportQueries || 'resize'), function (eventObj) {
            selfContext.processAssets();
        });

        this.$targetElement.on('component.reset', function () {
            ComponentHub.logDebug('Re-initializing Adaptive Visuals component', selfContext.$targetElement);
            selfContext.configureSettings();
            selfContext.processAssets();
        });

        selfContext.processAssets();
    }

    /* Set up module based on specific element properties */
    AdaptiveVisuals.prototype.configureSettings = function () {
        /* Determine if this is an <img> tag or a CSS background image */
        this.visualKind = this.$targetElement.is('img') ? 'image' : 'background';
        /* Retrieve capabilities attribute in format test:image */
        this.capabilityTests = ComponentHub.fetchAttribute.apply(this.$targetElement, ['capabilities']) || false;
        /* Get viewport attribute in format mediaQuery:image */
        this.viewportQueries = ComponentHub.fetchAttribute.apply(this.$targetElement, ['viewports']) || false;
        /* Default image to be loaded if no other conditions match */
        this.fallbackAsset = ComponentHub.fetchAttribute.apply(this.$targetElement, ['standard']) || false;

        /* Parse capability/viewport objects if present */
        if (this.capabilityTests) { this.capabilityTests = this.extractSettings(this.capabilityTests); }
        if (this.viewportQueries) { this.viewportQueries = this.extractSettings(this.viewportQueries); }

        /* Define validation routines */
        this.validationRoutines = {
            capabilities: function (conditionParam) {
                return FeatureDetect[conditionParam];
            },
            viewports: function (conditionParam) {
                return globalWindow.matchMedia(conditionParam).matches;
            }
        };
    };

    /* Execute necessary checks and load the resulting visual asset */
    AdaptiveVisuals.prototype.processAssets = function () {
        /* Flag indicating if a feature is supported or a media query matched */
        var outcomeAchieved = false;

        /* If capabilities attribute is provided and FeatureDetect library is available */
        if (this.capabilityTests && FeatureDetect) {
            outcomeAchieved = this.evaluateCriteria('capabilities', this.capabilityTests);
        }

        /* If viewport attribute is provided and matchMedia is supported,
           and no supporting feature was found yet */
        if (this.viewportQueries && globalWindow.matchMedia && !outcomeAchieved) {
            outcomeAchieved = this.evaluateCriteria('viewports', this.viewportQueries);
        }

        /* If no feature or media query matched, load the fallback if specified */
        if (!outcomeAchieved && this.fallbackAsset) {
            outcomeAchieved = this.fallbackAsset;
        }

        /* No visual to load, so exit */
        if (!outcomeAchieved) {
            return false;
        }

        /* Preload the visual and insert or set background-image property if not already set */
        if (this.displayedVisual !== outcomeAchieved) {
            this.displayedVisual = outcomeAchieved;
            this.injectVisual(this.visualKind, outcomeAchieved);
        }
    };

    /* Manage evaluation of each property within a condition object for a match */
    AdaptiveVisuals.prototype.evaluateCriteria = function (evaluationCategory, conditionArray) {
        var selfContext = this,
            resultSatisfied = false;

        DomUtil(conditionArray).each(function (index, itemValue) {
            /* Viewport query matched or capability detected */
            /* Provided in order of preference, so stop iterating upon first match */
            if (selfContext.validateCondition(evaluationCategory, itemValue.testCondition)) {
                resultSatisfied = itemValue.mediaSrc;
                return false;
            }
        });

        return resultSatisfied;
    };

    /* Return the result of a specific test function */
    AdaptiveVisuals.prototype.validateCondition = function (evaluationCategory, conditionParam) {
        return this.validationRoutines[evaluationCategory](conditionParam);
    };

    /* Preload the visual and either insert it or set the background-image property */
    AdaptiveVisuals.prototype.injectVisual = function (visualKind, assetPath) {
        var selfContext = this,
            newVisual = DomUtil(new NativeImage());

        newVisual.load(function () {
            visualKind === 'image' ? selfContext.$targetElement.attr('src', assetPath) : selfContext.$targetElement.css('background-image', 'url(' + assetPath + ')');

            /* Trigger a custom asset loaded event */
            ComponentHub.logDebug('Dispatching onAssetChange event', assetPath, selfContext.$targetElement);
            selfContext.$targetElement.trigger('component.onAssetChange', [assetPath]);
        }).attr('src', assetPath);
    };

    /* Parse attribute strings, such as viewport or capability configurations */
    AdaptiveVisuals.prototype.extractSettings = function (configString) {
        var selfContext = this,
            parts = configString.split(','),
            resultsList = [],
            segments = [];

        /* Multiple configurations can be supplied, so loop and create objects */
        DomUtil(parts).each(function (index, itemValue) {
            segments = itemValue.split('|');
            if (segments.length !== 2) {
                return true;
            }

            /* Object containing FeatureDetect test or media query and image URL */
            resultsList.push({
                'testCondition': selfContext.normalizeQuery(segments[0]),
                'mediaSrc': segments[1]
            });
        });

        return resultsList;
    };

    /* Replace common shorthand symbols for min/max width media queries */
    AdaptiveVisuals.prototype.normalizeQuery = function (queryText) {
        /* Handle '>' and '<' symbols */
        if (queryText.indexOf('>') > -1 || queryText.indexOf('<') > -1) {
            queryText = queryText.replace('>', 'min-width: ').replace('<', 'max-width: ');
        }

        /* Check if it's a media query (to avoid wrapping feature detection tests)
           AND if it's a media query, ensure it's wrapped in parentheses */
        if (queryText.indexOf('width') > -1 &&
            queryText.charAt(0) !== '(' && queryText.charAt(queryText.length - 1) !== ')') {
            queryText = '(' + queryText + ')';
        }

        return queryText;
    };

    /* Add the initialization routine for this component */
    ComponentHub.addModuleInitialization('responsiveVisuals', function (processAll) {
        DomUtil('[component-capabilities],[data-capabilities],[capabilities],[component-viewports],[data-viewports],[viewports]').each(function () {
            var $currentElement = DomUtil(this);

            /* This element has already been initialized,
               and we are only processing newly added modules */
            if ($currentElement.data('isVisualHandler') && !processAll) {
                return true;

            /* This element has already been initialized,
               and we are required to reinitialize it */
            } else if ($currentElement.data('isVisualHandler') && processAll) {
                $currentElement.trigger('component.reset');
                return true;
            }

            /* Mark the element as initialized */
            $currentElement.data('isVisualHandler', true);
            new AdaptiveVisuals($currentElement);
        });
    });

    /* Register the user interface component */
    ComponentHub.registerInterfaceComponent({
        componentName: 'responsiveVisuals',
        triggeredEvents: ['onAssetChange', 'activate'],
        startupRoutine: function () {
            ComponentHub.initComponent('responsiveVisuals');
        }
    });

}());