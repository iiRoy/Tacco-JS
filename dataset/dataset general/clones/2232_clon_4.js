define(function(getModule, exportObject, currentModule) {
    var BaseWidget      = getModule('famous/core/View');
    var DisplayLayer    = getModule('famous/core/Surface');
    var SpatialMap      = getModule('famous/core/Transform');
    var PropertyAdjuster= getModule('famous/modifiers/StateModifier');
    var AnimationCurve  = getModule('famous/transitions/Easing');
    var DynamicValue    = getModule('famous/transitions/Transitionable');
    var BouncyAnimation = getModule('famous/transitions/SpringTransition');
    DynamicValue.registerMethod('bounce', BouncyAnimation);

    var DEFAULT_ELEMENT_SETTINGS = {
        orbDim: 80,
        frameTint: 'white',
        fillShade: 'gray',
        gfxSource: 'img/twitter-icon.svg',
        clickTarget: null
    };

    function createInteractiveOrb(initialSettings) {
        var widgetInstance = new BaseWidget(initialSettings);
        var currentSettings = Object.assign({}, DEFAULT_ELEMENT_SETTINGS, initialSettings);

        var internalComponents = {};

        // Main interaction layer
        internalComponents.mainInteractionLayer = new DisplayLayer({
            size: [currentSettings.orbDim, currentSettings.orbDim],
            properties: {
                cursor: 'pointer'
            }
        });
        internalComponents.mainInteractionMod = new PropertyAdjuster({
            transform: SpatialMap.translate(0, 0, 0.1)
        });
        widgetInstance.add(internalComponents.mainInteractionMod).add(internalComponents.mainInteractionLayer);

        // Outer circular frame
        internalComponents.outerFrameLayer = new DisplayLayer({
            size: [currentSettings.orbDim, currentSettings.orbDim],
            properties: {
                border: '1px solid ' + currentSettings.frameTint,
                borderRadius: '50%'
            }
        });
        internalComponents.outerFrameMod = new PropertyAdjuster();
        widgetInstance.add(internalComponents.outerFrameMod).add(internalComponents.outerFrameLayer);

        // Inner background fill
        internalComponents.innerBackgroundLayer = new DisplayLayer({
            size: [currentSettings.orbDim, currentSettings.orbDim],
            opacity: 0,
            properties: {
                backgroundColor: currentSettings.fillShade,
                borderRadius: '50%'
            }
        });
        internalComponents.innerBackgroundMod = new PropertyAdjuster({
            transform: SpatialMap.scale(0, 0, 0.1)
        });
        widgetInstance.add(internalComponents.innerBackgroundMod).add(internalComponents.innerBackgroundLayer);

        // Central graphical element
        internalComponents.centralGraphicLayer = new DisplayLayer({
            size: [currentSettings.orbDim / 2, currentSettings.orbDim / 2],
            properties: {
                backgroundImage: 'url(' + currentSettings.gfxSource + ')',
                backgroundSize: currentSettings.orbDim / 2 + 'px',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat'
            }
        });
        widgetInstance.add(internalComponents.centralGraphicLayer); // Placed at [0,0] by default

        // Event handling for interactive animations
        var applyHoverEffect = function() {
            internalComponents.outerFrameMod.setTransform(
                SpatialMap.scale(1.3, 1.3, 1), { duration: 200, curve: AnimationCurve.easeInOut }
            ).setOpacity(
                0, { duration: 300, curve: AnimationCurve.easeInOut }
            );

            internalComponents.innerBackgroundMod.setTransform(
                SpatialMap.scale(0.1, 0.1, 1)
            ).setTransform(
                SpatialMap.scale(1, 1, 1),
                { method: 'bounce', period: 300, dampingRatio: 0.5 }
            ).setOpacity(
                1, { duration: 300, curve: AnimationCurve.easeInOut }
            );
        };

        var removeHoverEffect = function() {
            internalComponents.outerFrameMod.setTransform(
                SpatialMap.scale(1, 1, 1)
            ).setOpacity(
                1, { duration: 200 }
            );

            internalComponents.innerBackgroundMod.setOpacity(
                0, { duration: 300, curve: AnimationCurve.easeInOut }
            );
        };

        internalComponents.mainInteractionLayer.on('mouseover', applyHoverEffect);
        internalComponents.mainInteractionLayer.on('mouseout', removeHoverEffect);

        // Event handling for navigation
        if (currentSettings.clickTarget) {
            internalComponents.mainInteractionLayer.on('click', function() {
                window.open(currentSettings.clickTarget);
            });
        }

        return widgetInstance;
    }

    currentModule.exports = createInteractiveOrb;
});