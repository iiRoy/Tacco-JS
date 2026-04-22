L.Control.SimpleActions = L.Control.extend( {

    // Configuration settings for the interactive button.
    config: {
        placement:   'topleft',       // Geographic position on the map interface.
        caption:     '',              // Descriptive text for the button tooltip.
        visualGlyph: 'fa-circle-o'    // CSS class for the button's icon, e.g., Font Awesome.
    },

    /**
     * Lifecycle method called by Leaflet when the control is added to a map.
     * It constructs the DOM elements for the button.
     * @returns {HTMLElement} The top-level container element of this control.
     */
    onAttach: function () {
        // Create the main HTML div element that will house the button.
        // It receives standard Leaflet control styling.
        var wrapperDiv = L.DomUtil.create( 'div', 'leaflet-bar leaflet-control' );

        // Create the clickable anchor element that users will interact with.
        this.actionLink = L.DomUtil.create( 'a', 'leaflet-bar-part', wrapperDiv );
        // Embed the graphical icon within this anchor link.
        this._appendGraphic();
        // Set the link's target to a non-functional hash to prevent page navigation.
        this.actionLink.href = '#';

        // Attach a click event listener to the anchor.
        // The event is delegated to the internal handler, preserving the control's context.
        L.DomEvent.on( this.actionLink, 'click', this._handleActivation, this );
        // Assign the configured caption as the link's title for hover text.
        this.actionLink.title = this.config.caption;

        // Return the fully constructed container element.
        return wrapperDiv;
    },

    // Default function to be executed when the button is clicked.
    // This is a placeholder; a specific function should be assigned by the user.
    executionCallback: function() { console.warn('No specific action defined for this button.'); },

    /**
     * Processes the click event on the button.
     * It prevents default browser behaviors and then invokes the assigned callback.
     * @param {Event} interactionEvent - The native DOM event object from the click.
     */
    _handleActivation: function ( interactionEvent ) {
        // Prevent the event from propagating further up the DOM tree.
        L.DomEvent.stopPropagation(interactionEvent);
        // Prevent the browser's default action for this event (e.g., hash navigation).
        L.DomEvent.preventDefault(interactionEvent);
        // Execute the custom function associated with this button.
        this.executionCallback();
    },

    /**
     * Inserts the visual icon element into the action button.
     * It dynamically applies additional CSS classes based on the icon's naming convention.
     */
    _appendGraphic: function () {
        // Determine if the icon name indicates a Font Awesome icon (starts with 'fa').
        // If so, add Font Awesome specific sizing classes; otherwise, assume Glyphicon.
        var additionalStyles = this.config.visualGlyph.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';

        // Create an <i> tag, which is commonly used for icons.
        // Apply the base icon class and any determined additional styles.
        var glyphElement = L.DomUtil.create( 'i', this.config.visualGlyph + additionalStyles, this.actionLink );
        // Set a unique identifier for the icon element, if provided in the configuration.
        glyphElement.id = this.config.uniqueId;
    }
});

/**
 * Factory function to simplify the creation and configuration of SimpleActions buttons.
 * @param {string} iconName - The CSS class for the icon (e.g., 'fa-camera').
 * @param {Function} callbackFn - The JavaScript function to execute on button click.
 * @param {string} buttonCaption - The tooltip text for the button.
 * @param {L.Map|string} targetMap - The Leaflet map instance to add the control to, or an empty string to defer addition.
 * @param {string} controlId - An optional unique DOM ID for the button's icon element.
 * @returns {L.Control.SimpleActions} The newly created button control instance.
 */
L.quickAction = function( iconName, callbackFn, buttonCaption, targetMap, controlId ) {
  // Instantiate a new SimpleActions control object.
  var controlInstance = new L.Control.SimpleActions();

  // Apply configuration options based on the provided arguments.
  if ( iconName ) {
      controlInstance.config.visualGlyph = iconName;
  }

  if ( controlId ) {
      controlInstance.config.uniqueId = controlId;
  }

  // Ensure the provided callback is indeed a function before assigning it.
  if ( typeof callbackFn === 'function' ) {
    controlInstance.executionCallback = callbackFn;
  }

  if ( buttonCaption ) {
    controlInstance.config.caption = buttonCaption;
  }

  // Logic to add the control to a Leaflet map.
  if ( targetMap === '' ) {
    // If an empty string is passed, skip automatic addition.
    // The user will need to add the control manually later.
  } else if ( targetMap ) {
    // If a specific map instance is provided, add the control to it.
    targetMap.addControl(controlInstance);
  } else {
    // If no map is specified, assume a global 'leafletGlobalMap' variable exists
    // and add the control to that default map instance.
    leafletGlobalMap.addControl(controlInstance);
  }

  // Return the configured control object.
  return controlInstance;
};