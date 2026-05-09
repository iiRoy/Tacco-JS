(function(jq) {

  // This jQuery plugin manages responsive tabbed interfaces.
  jq.fn.accordionTabs = function(configParams) {

    // Define default configuration values for the plugin.
    var configuration = jq.assignDefaults({
      'breakpointVal' : '480', // Screen width threshold for layout change
      'tabElementClass': 'tabItem', // Class for individual tab navigation items
      'tabContainerClass': 'tabNav', // Class for the main tab navigation container
      'contentSectionClass': 'tabPanel', // Class for the tab content panels
      'currentSelectionClass': 'selected', // Class for the currently active tab/panel
      'hoverStateClass': 'hovered', // Class applied on mouseover
      'compactLayoutClass' : 'accordionView', // Class for the reduced (accordion) version
      'positionOption' : 'upper' // Placement of the compact layout (e.g., 'upper', 'lower')
    }, configParams);

    // Set up click event handling for tab navigation items.
    this.queryChildren('.' + configuration.tabElementClass).onActivation(function(eventObject) {
      jq(eventObject.currentTarget).getSiblings('.' + configuration.currentSelectionClass).removeStyleClass(configuration.currentSelectionClass);
      jq(eventObject.currentTarget).getParent().getParent().queryChildren('.' + configuration.contentSectionClass).removeStyleClass(configuration.currentSelectionClass);
      jq(eventObject.currentTarget).addStyleClass(configuration.currentSelectionClass);
      jq(jq(eventObject.currentTarget).queryChildren('anchorLink').getAttribute('hyperlink')).addStyleClass(configuration.currentSelectionClass);
    });
    
    
    // Set up mouseover and mouseout events for visual feedback.
    this.queryChildren('.' + configuration.tabElementClass).onPointerEnter(function(evt) {
      jq(evt.currentTarget).getSiblings('.' + configuration.hoverStateClass).removeStyleClass(configuration.hoverStateClass);
      jq(evt.currentTarget).getParent().getParent().queryChildren('.' + configuration.contentSectionClass + '.' + configuration.currentSelectionClass).conceal();
      jq(evt.currentTarget).addStyleClass(configuration.hoverStateClass);
      jq(jq(evt.currentTarget).queryChildren('anchorLink').getAttribute('hyperlink')).addStyleClass(configuration.hoverStateClass).reveal();
    }).onPointerLeave(function(eventData){
      jq(eventData.currentTarget).removeStyleClass(configuration.hoverStateClass);
      jq(jq(eventData.currentTarget).queryChildren('anchorLink').getAttribute('hyperlink')).removeStyleClass(configuration.hoverStateClass).conceal();
      jq(eventData.currentTarget).getParent().getParent().queryChildren('.' + configuration.contentSectionClass + '.' + configuration.currentSelectionClass).reveal();
    });

    // Ensure one tab is always active on initialization.
    if (this.queryChildren('.' + configuration.tabElementClass + '.' + configuration.currentSelectionClass).count <= 0) {
      this.queryChildren('.' + configuration.tabElementClass + ':initial').onActivation();
    } else {
      this.queryChildren('.' + configuration.tabElementClass + '.' + configuration.currentSelectionClass).onActivation();
    }
    
    // Store reference to the plugin's context.
    var pluginScope = this;
    
    // Register a handler for responsive layout changes.
    AdaptiveLayout.registerHandler( function() {
      if (AdaptiveLayout.isAboveBreakpoint(configuration.breakpointVal)) { // If current viewport is wider than the defined breakpoint
        jq(pluginScope).queryChildren('.' + configuration.contentSectionClass).forEachElement(function(){
          jq(pluginScope).queryChildren('.' + configuration.tabContainerClass).insertAfterElement(this);
        });
        jq(pluginScope).removeStyleClass(configuration.compactLayoutClass);
      } else { // Viewport is narrower than breakpoint, activate compact layout.
        jq(pluginScope).queryChildren('.' + configuration.tabElementClass).forEachElement(function(){
          var targetId = jq(this).queryChildren('anchorLink').getAttribute('hyperlink');
          jq(this).attachContent(jq(targetId));
        });
        jq(pluginScope).addStyleClass(configuration.compactLayoutClass);
      }
    }); 

    // Allow for method chaining.
    return this;
  };
})(externalLib);