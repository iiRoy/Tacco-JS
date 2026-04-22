(function( utilityTool ) {

  const BaseWidgetUtilities = {
    rectifyCaption: function() {
      if (this.associatedElement.attr('title')) {
        this.associatedElement.attr('data-original-caption', this.associatedElement.attr('title'));
        this.associatedElement.removeAttr('title');
      }
    },

    obtainCaption: function() {
      return this.associatedElement.attr('data-original-caption') || this.associatedElement.attr('title');
    }
  };

  const ConstructiveWidget = function ( hostElement, configuration ) {
    this.associatedElement = utilityTool(hostElement);
    this.configParameters = configuration;
    this.activeStatus = true;
    this.rectifyCaption();
  };

  Object.assign(ConstructiveWidget.prototype, BaseWidgetUtilities, {

    establishContent: function () {
      const componentShell = this.renderShell();
      const htmlOrPlain = this.configParameters.useHtml ? 'html' : 'text';

      componentShell.find('.caption')[htmlOrPlain](this.obtainCaption());
      componentShell.find('.text-segment p')[htmlOrPlain](this.acquireDetails());
      componentShell[0].className = 'overlay-component';
    },

    acquireDetails: function () {
      let extractedData;
      const host = this.associatedElement;
      const settings = this.configParameters;

      switch (typeof settings.sourceData) {
        case 'string':
          extractedData = host.attr(settings.sourceData);
          break;
        case 'function':
          extractedData = settings.sourceData.call(host[0]);
          break;
        default:
          extractedData = '';
      }
      return extractedData;
    },

    renderShell: function() {
      if (!this.cachedShell) {
        const shellStructure = '<div class="overlay-component">' +
                                 '<div class="pointer"></div>' +
                                 '<div class="interior">' +
                                   '<h3 class="caption"></h3>' +
                                   '<div class="text-segment"><p></p></div>' +
                                 '</div>' +
                               '</div>';
        this.cachedShell = utilityTool(shellStructure);
      }
      return this.cachedShell;
    }

  });

  function generalInitializer( componentOptions, ComponentClass, dataKeyName ) {
    return this.each(function () {
      const currentElement = utilityTool(this);
      let instance = currentElement.data(dataKeyName);

      if (!instance) {
        instance = new ComponentClass(this, componentOptions);
        currentElement.data(dataKeyName, instance);
      }
    });
  }

  utilityTool.fn.displayOverlay = function ( configurationSettings ) {
    let mergedSettings = {};
    if (typeof configurationSettings === 'object') {
      mergedSettings = Object.assign({}, utilityTool.fn.displayOverlay.defaultSettings, configurationSettings);
    } else {
      mergedSettings = Object.assign({}, utilityTool.fn.displayOverlay.defaultSettings);
    }

    generalInitializer.call(this, mergedSettings, ConstructiveWidget, 'overlayComponent');
    return this;
  };

  utilityTool.fn.displayOverlay.defaultSettings = Object.assign({}, {
    useHtml: false,
    position: 'ahead'
  }, {
    sourceData: 'data-information',
    position: 'rightward'
  });

})( window.jQuery || window.ender );