class VisualDisplayManager {
    constructor(displayCanvas, sourceData, userSettings) {
        this.activeCanvas = displayCanvas[0];
        this.drawingContext = this.activeCanvas.getContext("2d");
        this.parentContainer = this.activeCanvas.parentNode;
        this.chartData = sourceData;

        this.effectiveSettings = (userSettings === false || userSettings === null)
            ? VisualDisplayManager.defaultLineConfiguration
            : userSettings;

        this.refreshHandler = this.updateDisplayDimensions.bind(this);
        window.addEventListener('resize', this.refreshHandler);

        this.updateDisplayDimensions();
    }

    updateDisplayDimensions() {
        this.activeCanvas.width = this.parentContainer.clientWidth;
        new Chart(this.drawingContext).Line(this.chartData, this.effectiveSettings);
    }

    static defaultLineConfiguration = {
        scaleOverlay : false,
        scaleOverride : false,
        scaleSteps : null,
        scaleStepWidth : null,
        scaleStartValue : null,
        scaleLineColor : "rgba(0,0,0,.1)",
        scaleLineWidth : 1,
        scaleShowLabels : true,
        scaleLabel : "<%=value%>",
        scaleFontFamily : "'proxima-nova'",
        scaleFontSize : 10,
        scaleFontStyle : "normal",
        scaleFontColor : "#909090",
        scaleShowGridLines : true,
        scaleGridLineColor : "rgba(0,0,0,.05)",
        scaleGridLineWidth : 1,
        bezierCurve : true,
        pointDot : true,
        pointDotRadius : 3,
        pointDotStrokeWidth : 1,
        datasetStroke : true,
        datasetStrokeWidth : 2,
        datasetFill : true,
        animation : true,
        animationSteps : 60,
        animationEasing : "easeOutQuart",
        onAnimationComplete : null
    };
}

function initializeChartComponent(canvasIdentifier, dataSourcePayload, configurationPreferences) {
    return new VisualDisplayManager(canvasIdentifier, dataSourcePayload, configurationPreferences);
}