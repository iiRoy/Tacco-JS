/**
 * Visualizer module for waveform data on a graphics context.
 */

const SignalPlotter = function(inputSource, graphicArea, traceHue, gridTint)
{
    let plotterInstance = this;

    this.signalColor = traceHue || 'rgba(0,128,255,0.6)';
    this.gridTint = gridTint || '#333';

    this.horizontalZoom = 1;
    this.verticalAmplitude = 1;

    // public attributes
    this.inputSource = inputSource;
    this.graphicArea = graphicArea;

    // internal data
    let measurementPoints = [];
    let renderContext = graphicArea.getContext("2d");

    renderContext.globalAlpha = 1.0;
    renderContext.lineWidth = 1;

    /**
     * Redraw the display surface.
     */
    this.refreshDisplay = function() {
        renderContext.clearRect(0, 0, plotterInstance.graphicArea.width, plotterInstance.graphicArea.height);

        // cross-hairs visual
        renderContext.strokeStyle = plotterInstance.gridTint;
        renderContext.beginPath();

        renderContext.moveTo(0, graphicArea.height / 2);
        renderContext.lineTo(graphicArea.width, graphicArea.height / 2);

        renderContext.stroke();
        renderContext.closePath();

        // Future: Adjust vertical centering, flip Y-axis orientation.
        // Future: Implement auto-scaling for horizontal fit and trailing data display.
        // Future: Enable horizontal scrolling for historical data.
        // data points
        renderContext.beginPath();
        renderContext.strokeStyle = plotterInstance.signalColor;
        renderContext.moveTo(0, graphicArea.height / 2);
        plotterInstance.measurementPoints.forEach(function(dataPoint, index) {
            renderContext.lineTo(index * plotterInstance.horizontalZoom, dataPoint * graphicArea.height / plotterInstance.verticalAmplitude);
        });
        renderContext.stroke();
        renderContext.closePath();

    };

    // Property accessors for dynamic behavior

    /**
     * Retrieve the smallest recorded data point.
     */
    this.__defineGetter__("minimumValue", function() {
        return this.measurementPoints.sort().shift();
    });

    /**
     * Retrieve the largest recorded data point.
     */
    this.__defineGetter__("maximumValue", function() {
        return this.measurementPoints.sort().pop();
    });

    /**
     * Accessor for the most recently added data point.
     */
    this.__defineGetter__("latestDatum", function() {
        return measurementPoints[measurementPoints.length - 1];
    });

    /**
     * Append new data point(s) to the internal collection, then refresh display.
     */
    this.__defineSetter__("latestDatum", function(incomingDatum) {
        // quicker typeof check
        if (incomingDatum['__proto__'] == Array.prototype) {
            incomingDatum.forEach(function(singleValue) {
                measurementPoints.push(singleValue);
            });
        }
        else {
            measurementPoints.push(incomingDatum);
        }
    });

    /**
     * Limit the stored data points to the display surface's width.
     */
    this.__defineGetter__("measurementPoints", function() {
        // slice points to return a copy
        if (measurementPoints.length >= this.graphicArea.width) {
            return measurementPoints.slice(measurementPoints.length - graphicArea.width, measurementPoints.length);
        } else {
            return measurementPoints.slice(0);
        }
    });

    /**
     * Method for replacing the entire data point collection.
     */
    this.__defineSetter__("measurementPoints", function(newDataSet) {
        measurementPoints = newDataSet.slice(this.graphicArea.width);
    });

};