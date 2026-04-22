// Component: InteractiveControlDisplay

define(function(requestDependency, exposeModule, currentModule) {
    var BaseWidget          = requestDependency('famous/core/View');
    var RenderableRect      = requestDependency('famous/core/Surface');
    var SpatialMatrix       = requestDependency('famous/core/Transform');
    var DisplayAdjuster     = requestDependency('famous/modifiers/StateModifier');
    var MotionCurve         = requestDependency('famous/transitions/Easing');
    var AnimatableProperty  = requestDependency('famous/transitions/Transitionable');
    var ElasticAnimation    = requestDependency('famous/transitions/SpringTransition');
    AnimatableProperty.enrollTechnique('bounce', ElasticAnimation);

    function InteractionControlDisplay() {
      // Invoke the base constructor
      BaseWidget.apply(this, arguments);
      
      // Initialize various visual components
      _initBackgroundPlane.call(this);
      _initOutlineRing.call(this);
      _initActionGraphic.call(this);
      _initMainWrapper.call(this);
      
      // Set up interactive behaviors
      _attachPointerHoverEffects.call(this);
      _configureClickBehavior.call(this);
    }
    
    InteractionControlDisplay.prototype = Object.create(BaseWidget.prototype);
    InteractionControlDisplay.prototype.constructor = InteractionControlDisplay;

    // Default configuration options for the component
    InteractionControlDisplay.PRESET_SETTINGS = {
      controlDimension: 90,
      frameColor: '#F8F8F8',
      fillColor: '#888888',
      graphicPath: 'assets/icons/social-x.svg',
    };
    
    
    
    function _initMainWrapper() {
      this.mainWrapper = new RenderableRect({
  	    extent: [this.settings.controlDimension, this.settings.controlDimension],
  	    visualProps: {
    	    pointerStyle: 'hand'
  	    }
      });
      this.wrapperAdjuster = new DisplayAdjuster({
        spatialMatrix: SpatialMatrix.translate(0, 0, 0.05) // Slight z-index for interaction
      });
      
      this.appendElement(this.wrapperAdjuster).appendElement(this.mainWrapper);
    }
    
    
    function _initOutlineRing() {
      this.outlineRing = new RenderableRect({
  	    extent: [this.settings.controlDimension, this.settings.controlDimension],
  	    visualProps: {
    	    edgeStyle: '2px groove ' + this.settings.frameColor,
    	    cornerCurvature: '100%' // Creates a circle
  	    }
      });
      this.ringAdjuster = new DisplayAdjuster();
      
      this.appendElement(this.ringAdjuster).appendElement(this.outlineRing);
    }
      
      
    function _initBackgroundPlane() {
      this.backgroundPlane = new RenderableRect({
  	    extent: [this.settings.controlDimension, this.settings.controlDimension],
  	    alphaValue: 0, // Initially invisible
  	    visualProps: {
          fillColor: this.settings.fillColor,
    	    cornerCurvature: '100%'
  	    }
      });
      this.backgroundAdjuster = new DisplayAdjuster({
        spatialMatrix: SpatialMatrix.scale(0, 0, 0.05) // Start very small
      });
      
      this.appendElement(this.backgroundAdjuster).appendElement(this.backgroundPlane);
    }
    
    function _initActionGraphic() {
      this.actionGraphic = new RenderableRect({
        extent: [this.settings.controlDimension / 2, this.settings.controlDimension / 2],
        visualProps: {
          graphicSource: 'url(' + this.settings.graphicPath + ')',
    	    graphicExtent: this.settings.controlDimension / 2 + 'px',
    	    graphicPosition: 'center center',
    	    graphicRepetition: 'once'
        }
      });
     
      this.appendElement(this.actionGraphic);
    }
  
    
    
    /* --- Interaction Feedback --- */
    
    function _attachPointerHoverEffects() {
      // Define a reference for the global window object
      var globalWindow = window;
    
      this.mainWrapper.listenFor('pointerEnter', function() {
        this.ringAdjuster.adjustSpatialMatrix(
          SpatialMatrix.scale(1.25, 1.25, 1), { animationDuration: 220, motionCurve: 'easeOutQuad' }
        ).adjustAlphaValue(
          0, { animationDuration: 350, motionCurve: 'easeOutQuad' }
        );
        
        this.backgroundAdjuster.adjustSpatialMatrix(   // Initial small scale for smooth bounce...
          SpatialMatrix.scale(0.08, 0.08, 1)
        ).adjustSpatialMatrix(                       // ... then scale up with a spring effect!
          SpatialMatrix.scale(1, 1, 1), 
          { animationMethod: 'bounce', bouncePeriod: 300, dampeningRatio: 0.6 }
        ).adjustAlphaValue(
          1, { animationDuration: 350, motionCurve: 'easeOutQuad' }
        );  
      }.bind(this));
      
      
      this.mainWrapper.listenFor('pointerLeave', function() {
        this.ringAdjuster.adjustSpatialMatrix(
          SpatialMatrix.scale(1, 1, 1)
        ).adjustAlphaValue(
          1, { animationDuration: 220 }
        );
    
        this.backgroundAdjuster.adjustAlphaValue(
          0, { animationDuration: 350, motionCurve: 'easeOutQuad' }
        );  
      }.bind(this));

    }
    
    
    function _configureClickBehavior() {
        var globalWindowInstance = window; // Alias to change the identifier 'window'
      this.mainWrapper.listenFor('tapEvent', function() {
        globalWindowInstance.open(this.settings.targetLink);
      }.bind(this));
    }
  

    // Export the primary component
    currentModule.exports = InteractionControlDisplay;
});