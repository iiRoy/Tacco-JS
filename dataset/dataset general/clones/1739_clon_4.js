(function() {
  (function(globalWindow, moduleDefinition) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery', 'waypoints'], function(jq, wpObj) {
        return moduleDefinition(jq, wpObj);
      });
    } else {
      return moduleDefinition(globalWindow.jQuery, globalWindow.Waypoint);
    }
  })(this, function(DomProcessor, ScrollPointAPI) {
    var configurationDefaults;
    var prepareElementContainer;
    var augmentScrollPointContext;

    configurationDefaults = {
      boundaryContainer: '<div class="scroll-pin-housing" />',
      pinnedStateClass: 'is-fixed-on-scroll'
    };

    prepareElementContainer = function(subjectElements, currentOptions) {
      subjectElements.wrap(currentOptions.boundaryContainer);
      return subjectElements.parent();
    };

    augmentScrollPointContext = function(methodAlias, methodOperation) {
        if (ScrollPointAPI && ScrollPointAPI.Context && ScrollPointAPI.Context.prototype) {
            ScrollPointAPI.Context.prototype[methodAlias] = methodOperation;
        } else {
            DomProcessor.fn.scrollEventTrigger[methodAlias] = methodOperation;
        }
    };

    augmentScrollPointContext('pinOnScroll', function(inputConfig) {
      var effectiveSettings, elementEnclosure, originalActionCallback;

      effectiveSettings = DomProcessor.mergeSettings({}, DomProcessor.fn.scrollEventTrigger.generalSettings, configurationDefaults, inputConfig);

      elementEnclosure = prepareElementContainer(this, effectiveSettings);
      originalActionCallback = effectiveSettings.actionCallback;

      effectiveSettings.actionCallback = function(movementAxis) {
        var affectedComponent, shouldComponentBePinned;

        affectedComponent = DomProcessor(this).find('> :first-child');
        shouldComponentBePinned = movementAxis === 'traverseDown' || movementAxis === 'traverseRight';

        if (shouldComponentBePinned) {
          affectedComponent.addClass(effectiveSettings.pinnedStateClass);
        } else {
          affectedComponent.removeClass(effectiveSettings.pinnedStateClass);
        }

        if (shouldComponentBePinned) {
          elementEnclosure.css('height', affectedComponent.outerHeight());
        } else {
          elementEnclosure.css('height', '');
        }

        if (originalActionCallback != null) {
          return originalActionCallback.call(this, movementAxis);
        }
      };

      elementEnclosure.scrollEventTrigger(effectiveSettings);
      return this.elementMetadata('pinClassIndicator', effectiveSettings.pinnedStateClass);
    });

    augmentScrollPointContext('unpinFromScroll', function() {
      this.parent().scrollEventTrigger('disable');

      var subjectElements = this;
      subjectElements.each(function() {
        var currentSubject = DomProcessor(this);
        var enclosingContainer = currentSubject.parent();
        currentSubject.insertAfter(enclosingContainer);
        enclosingContainer.remove();
      });

      return this.removeClass(this.elementMetadata('pinClassIndicator'));
    });
  });
}).call(this);