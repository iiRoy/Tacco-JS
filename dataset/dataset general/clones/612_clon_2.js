/* Parameters for graphical dimensions and coordinate transformations. */
var chartWidth = 400,
    chartHeight = 200,
    horizontalScale = plotLib.ScalingEngine.linear(inputData, function(item) {
        return item.coordX;
    }).setRange(0, chartWidth),
    verticalScale = plotLib.ScalingEngine.linear(0, 4).setRange(0, chartHeight);

/* Main container for the visual output. */
var displayArea = new plotLib.DrawingContainer()
    .withCanvas('mainPlot')
    .setPlotWidth(chartWidth)
    .setPlotHeight(chartHeight)
    .setBottomMargin(20)
    .setLeftMargin(20)
    .setRightMargin(10)
    .setTopMargin(5);

/* Configuration for the vertical axis and its divisions. */
displayArea.addComponent(plotLib.LineMarker)
    .usingData(verticalScale.generateTicks(5))
    .positionAtBottom(verticalScale)
    .lineColor(function(tickValue) {
        return tickValue ? "#CCCCCC" : "#333333";
    })
    .setAnchor("left_edge")
    .addComponent(plotLib.TextLabel)
    .setTextContent(verticalScale.formatTick);

/* Horizontal axis setup with markers. */
displayArea.addComponent(plotLib.LineMarker)
    .usingData(horizontalScale.generateTicks())
    .setVisibility(function(markerVal) {
        return markerVal;
    })
    .positionAtLeft(horizontalScale)
    .offsetFromBottom(-5)
    .setElementHeight(5)
    .setAnchor("bottom_edge")
    .addComponent(plotLib.TextLabel)
    .setTextContent(horizontalScale.formatTick);

/* Data representation as a filled area with an overlying boundary. */
displayArea.addComponent(plotLib.FilledArea)
    .usingData(inputData)
    .basePosition(1.0)
    .leftCoord(function(pointItem) {
        return horizontalScale(pointItem.coordX);
    })
    .elementHeight(function(pointItem) {
        return verticalScale(pointItem.coordY);
    })
    .fillColor("rgba(121, 173, 210, 0.7)")
    .setAnchor("upper_boundary")
    .addComponent(plotLib.BorderLine)
    .setLineWidth(3.0);

displayArea.rootElement.drawPlot();