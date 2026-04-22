let currentConfiguration = {
    positionHorizontal: 0,
    positionVertical: 0,
    dimensionAcross: 0,
    dimensionDown: 0,
    fillColor: "",
    contentMarkup: "",
    presentationRules: {},
    interactionStatus: true
};

const visualElementFactory = {
    defineSpatial: function(startX, startY, spanX, spanY) {
        currentConfiguration.positionHorizontal = startX;
        currentConfiguration.positionVertical = startY;
        currentConfiguration.dimensionAcross = spanX;
        currentConfiguration.dimensionDown = spanY;
        return this;
    },
    specifyFill: function(colorDesignation) {
        currentConfiguration.fillColor = colorDesignation;
        return this;
    },
    insertContent: function(textualPayload) {
        currentConfiguration.contentMarkup = textualPayload;
        return this;
    },
    applyStyling: function(styleDefinitions) {
        currentConfiguration.presentationRules = styleDefinitions;
        return this;
    },
    permitUserActions: function() {
        currentConfiguration.interactionStatus = false;
        return this;
    },
    generateComponentData: function() {
        return {
            x: currentConfiguration.positionHorizontal,
            y: currentConfiguration.positionVertical,
            width: currentConfiguration.dimensionAcross,
            height: currentConfiguration.dimensionDown,
            backgroundColor: currentConfiguration.fillColor,
            html: currentConfiguration.contentMarkup,
            style: currentConfiguration.presentationRules,
            ignoreEvents: currentConfiguration.interactionStatus
        };
    }
};

let mainDisplayNode = visualElementFactory
    .defineSpatial(0, 0, 1080, 1920)
    .specifyFill("black")
    .insertContent("Hello World!")
    .applyStyling({
        "padding": "40px",
        "font-size": "60px"
    })
    .permitUserActions()
    .generateComponentData();