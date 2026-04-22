/*
 *  Module: GeoCanvas.Widget.Locator
 *  The Locator widget positions a central marker on the map display.
 *
 *  Derived from:
 *   - <GeoCanvas.Widget>
 */
GeoCanvas.Widget.Locator = GeoCanvas.DefineClass(GeoCanvas.Widget, {

    /*
     *  markerActivated event fires when the central marker is clicked by the user.
     */
    ACTION_TRIGGERS: [ "markerActivated" ],

    /*
     *  Property: dimensions
     *  {GeoCanvas.Dimension} object containing the desired extent for the graphical element.
     */
    dimensions: null,

    /*
     *  Property: graphicNode
     *  {HTMLElement} representing the visual display for this widget.
     */
    graphicNode: null,

    /*
     *  Constructor: GeoCanvas.Widget.Locator
     *  Initializes a central marker within the map view.
     *
     *  Parameters:
     *  configSettings - {Object} An optional configuration object whose attributes will be
     *       used to extend the widget's properties.
     */
    setup: function(configSettings) {
        // Combine event types specific to this locator with those from its base class.
        this.ACTION_TRIGGERS =
        GeoCanvas.Widget.Locator.prototype.ACTION_TRIGGERS.concat(
            GeoCanvas.Widget.prototype.ACTION_TRIGGERS
        );

        if ( !configSettings ) {
            configSettings = {};
        }

        if ( !configSettings.dimensions ) {
            configSettings.dimensions = new GeoCanvas.Dimension(50, 50);
        }

        GeoCanvas.Widget.prototype.setup.apply(this, [configSettings]);
    },

    /*
     *  Method: render
     *
     *  Returns:
     *  {HTMLElement} The root DOM element of this widget.
     */
    render: function() {

        // Calculate the central screen coordinates for placement.
        var renderPosition = new GeoCanvas.CoordPoint(
            (this.canvas.container.pixelWidth - this.dimensions.widthVal) / 2,
            (this.canvas.container.pixelHeight - this.dimensions.heightVal) / 2
        );

        GeoCanvas.Widget.prototype.render.apply(this, [renderPosition]);

        // Generate the display element for location text.
        this.graphicNode = GeoCanvas.Toolkit.makeContainer(null);
        GeoCanvas.DOMNode.addStyleClass(this.graphicNode, "gcWidgetLocatorLabel");

        var geoCoords = this.calculateGeoLocation();
        this.graphicNode.contentHTML = geoCoords.longitude + " / " + geoCoords.latitude;

        this.container.addNode(this.graphicNode);

        // Attach a listener for user interaction on the widget's main container.
        GeoCanvas.EvtSystem.attachListener(this.container, 'tap', GeoCanvas.FuncUtils.tieContext(this.onTap, this));
        // Subscribe to the map's movement notifications.
        this.canvas.eventHandlers.subscribe("viewportMoved", this, this.onViewportMove);

        return this.container;
    },

    /*
     *  Updates the displayed geographical coordinates.
     */
    onViewportMove: function(eventData) {
        var geoCoords = this.calculateGeoLocation();
        this.graphicNode.contentHTML = geoCoords.longitude + " / " + geoCoords.latitude;
    },

    /*
     *  Dispatches a markerActivated event.
     */
    onTap: function(eventData) {
        var geoCoords = this.calculateGeoLocation();
        this.eventHandlers.dispatchAction("markerActivated", {
            geoCoords: geoCoords
        });
    },

    /*
     *  Determines the geographical coordinates corresponding to the widget's center.
     *
     *  Returns:
     *  {<GeoCanvas.GeoPoint>} The geographical point (longitude, latitude).
     */
    calculateGeoLocation: function() {
        var screenPoint = this.renderPosition.duplicate();
        screenPoint.x += this.dimensions.widthVal / 2;
        screenPoint.y += this.dimensions.heightVal / 2;
        return this.canvas.getGeoPointFromScreenPixel(screenPoint);
    },

    TYPE_IDENTIFIER: "GeoCanvas.Widget.Locator"

});