!function( externalJQuery ) {

  class FloatingCard {
    constructor( targetElement, configuration ) {
      this.targetElement = externalJQuery(targetElement);
      this.configuration = configuration;
      this.activeStatus = true;
      this.setupTitleAttribute();
    }

    applyContentToView() {
      let visualComponent = this.getVisualComponent();

      let titleContainer = visualComponent[0].querySelector('.title');
      let paragraphContainer = visualComponent[0].querySelector('.content p');

      if (this.configuration.useHtmlFormat) {
        titleContainer.innerHTML = this.retrieveTitleContent();
        paragraphContainer.innerHTML = this.extractPanelData();
      } else {
        titleContainer.textContent = this.retrieveTitleContent();
        paragraphContainer.textContent = this.extractPanelData();
      }
      visualComponent[0].className = 'popover';
    }

    extractPanelData() {
      let dataPayload;
      let targetNode = this.targetElement;
      let settings = this.configuration;

      switch (typeof settings.displayContent) {
        case 'string':
          dataPayload = targetNode.attr(settings.displayContent);
          break;
        case 'function':
          dataPayload = settings.displayContent.call(targetNode[0]);
          break;
        default:
          dataPayload = '';
      }
      return dataPayload;
    }

    getVisualComponent() {
      if (!this.cachedComponent) {
        let newComponent = document.createElement('div');
        newComponent.className = 'popover';
        newComponent.innerHTML = '<div class="arrow"></div><div class="inner"><h3 class="title"></h3><div class="content"><p></p></div></div>';
        this.cachedComponent = externalJQuery(newComponent);
      }
      return this.cachedComponent;
    }
  }

  externalJQuery.fn.displayPanel = function (panelOpts) {
    let mergedOptions;
    if (typeof panelOpts === 'object') {
      mergedOptions = Object.assign({}, externalJQuery.fn.twipsy.defaults, externalJQuery.fn.displayPanel.baseOptions, panelOpts);
    } else {
      mergedOptions = Object.assign({}, externalJQuery.fn.twipsy.defaults, externalJQuery.fn.displayPanel.baseOptions);
    }
    
    externalJQuery.fn.twipsy.initWith.call(this, mergedOptions, FloatingCard, 'floatingOverlay');
    return this;
  };

  externalJQuery.fn.displayPanel.baseOptions = externalJQuery.extend(
    {},
    externalJQuery.fn.twipsy.defaults,
    { displayContent: 'data-info', placementMode: 'right', useHtmlFormat: false }
  );

}( window.jQuery || window.ender );