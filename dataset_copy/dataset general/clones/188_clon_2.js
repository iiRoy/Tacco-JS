// This initial segment imports our custom CommonJS module.
var WaveEffectProcessor = require("./modules/Ti.WaveAnimation");

    // We'll now instantiate the main application window.
    var primaryDisplay = Ti.UI.createWindow({
        backgroundColor :   "#000000"
    });

    // Defining several visual components that will exhibit the wave animation on interaction.
    var topSection = Ti.UI.createView({
            width:  320,
            height: 150,
            backgroundColor:    "maroon",
            top:    0,
            left:   0,
            hasWaveEffect:      !false
        });

    var leftMidSection = Ti.UI.createView({
            width:  160,
            height: 150,
            backgroundColor:    "navy",
            top:    150,
            left:   0,
            hasWaveEffect:      !false
        });

    var rightMidSection = Ti.UI.createView({
            width:  160,
            height: 150,
            backgroundColor:    "darkgreen",
            top:    150,
            right:  0,
            hasWaveEffect:      !false
        });

    var bottomSection = Ti.UI.createView({
            width:  320,
            height: 150,
            backgroundColor:    "indigo",
            top:    300,
            left:   0,
            hasWaveEffect:      !false
        });

    // Attaching all defined visual elements to the main application window.
    primaryDisplay.add(topSection);
    primaryDisplay.add(leftMidSection);
    primaryDisplay.add(rightMidSection);
    primaryDisplay.add(bottomSection);

    primaryDisplay.addEventListener("click", function(actionEvent)  {
        // If the clicked element possesses the custom wave effect property,
        // we trigger the animation via our dedicated module.
        if (actionEvent.source.hasWaveEffect) {
            WaveEffectProcessor.initiate(actionEvent);
        }
    });

    // Finally, opening the primary application window to make it visible.
    primaryDisplay.open();