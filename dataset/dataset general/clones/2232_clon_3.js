define(function(obtainFamousDependency, provideModuleExports, currentModuleContext) {
    // Core Famous-Engine dependencies, re-aliased for unique identification.
    var BaseDisplayUnit      = obtainFamousDependency('famous/core/View');
    var VisualPlane          = obtainFamousDependency('famous/core/Surface');
    var PositionalTransform  = obtainFamousDependency('famous/core/Transform');
    var DynamicStateModifier = obtainFamousDependency('famous/modifiers/StateModifier');
    var AnimationEaseCurve   = obtainFamousDependency('famous/transitions/Easing');
    var AnimatableProperty   = obtainFamousDependency('famous/transitions/Transitionable');
    var PhysicsSpringEffect  = obtainFamousDependency('famous/transitions/SpringTransition');

    // Type III: Registering a custom transition method for animated properties.
    // This ensures our animation system understands 'kineticSpring' for smooth effects.
    AnimatableProperty.registerMethod('kineticSpring', PhysicsSpringEffect);

    /**
     * @class InteractiveCircleWidget
     * @extends BaseDisplayUnit
     * @description A customizable circular button component with hover effects and click actions.
     * This widget encapsulates a visual icon, an animated background fill, and an outer ring.
     * Functionality is recognizably similar to the original SocialButtonView, but with
     * extensive internal re-architecting, renaming, and added features.
     */
    function InteractiveCircleWidget() {
        // Type III: Explicitly calling the base constructor with all arguments.
        // This ensures proper initialization of the Famous-Engine View component.
        BaseDisplayUnit.apply(this, arguments);

        // Type III: Merging user-provided options with default settings.
        // A robust options handling mechanism, ensuring defaults are always applied.
        this.options = Object.assign({}, InteractiveCircleWidget.DEFAULT_COMPONENT_SETTINGS, this.options);

        // Type III: Input validation for critical size parameter.
        // Prevents rendering issues if an invalid size is provided.
        if (this.options.widgetDiameter <= 0 || isNaN(this.options.widgetDiameter)) {
            console.warn('InteractiveCircleWidget: Invalid or non-positive widgetDiameter. Resetting to default: 70.');
            this.options.widgetDiameter = InteractiveCircleWidget.DEFAULT_COMPONENT_SETTINGS.widgetDiameter;
        }

        // Type III: Pre-calculating frequently used dimensions for efficiency and clarity.
        this.halfDiameter = this.options.widgetDiameter / 2;
        this.iconDisplaySize = this.options.widgetDiameter * 0.55; // Slightly adjusted icon scaling.

        // Type III: Encapsulating the creation of all visual sub-elements.
        // Improves modularity and readability of the constructor.
        this._buildComponentStructure();

        // Type III: Encapsulating the setup of all interactive event listeners.
        // Centralizes event binding logic.
        this._establishInteractionHandlers();

        // Type III: Setting up the initial visual state of animated elements.
        // Ensures components start in their correct 'off' or initial position.
        this._applyInitialVisualStates();
    }

    // Type III: Establishing the inheritance chain.
    // InteractiveCircleWidget inherits from BaseDisplayUnit (Famous View).
    InteractiveCircleWidget.prototype = Object.create(BaseDisplayUnit.prototype);
    InteractiveCircleWidget.prototype.constructor = InteractiveCircleWidget;

    /**
     * @static
     * @property {Object} DEFAULT_COMPONENT_SETTINGS
     * @description Default configuration options for the InteractiveCircleWidget.
     * All properties have been renamed and some new ones introduced.
     */
    InteractiveCircleWidget.DEFAULT_COMPONENT_SETTINGS = {
        widgetDiameter: 70, // Renamed from 'buttonSize'
        outerRingColor: '#E0E0E0', // Renamed from 'borderColor'
        innerFillColor: '#888888', // Renamed from 'backgroundColor'
        iconAssetPath: 'assets/image/default-social-icon.svg', // Renamed from 'iconUrl'
        navigationTargetUrl: null, // New option: URL for click action
        hoverExpansionFactor: 1.3, // New option: Scale factor on hover
        animationTransitionTime: 250, // New option: Base duration for animations
        baseZPosition: 0.08, // New option: Initial Z-depth for the widget
        ringBorderThickness: '1.5px' // New option: Customizable border width
    };
    
    /**
     * @private
     * @method _buildComponentStructure
     * @description Orchestrates the creation and addition of all internal Famous-Engine surfaces.
     * This method ensures that all visual parts of the widget are instantiated and added to the render tree.
     */
    InteractiveCircleWidget.prototype._buildComponentStructure = function() {
        this._createMainClickableArea();
        this._renderOuterCircleOutline();
        this._generateInnerAnimatedFill();
        this._embedCentralIconGraphic();
    };

    /**
     * @private
     * @method _establishInteractionHandlers
     * @description Sets up all event listeners for user interaction (hover, click).
     */
    InteractiveCircleWidget.prototype._establishInteractionHandlers = function() {
        this._configureHoverAnimations();
        this._enableExternalNavigation();
    };

    /**
     * @private
     * @method _applyInitialVisualStates
     * @description Applies the initial transformations and opacities to elements.
     * This ensures the animated elements start in a hidden or default state.
     */
    InteractiveCircleWidget.prototype._applyInitialVisualStates = function() {
        // Type III: Ensure the inner fill starts completely scaled down and transparent.
        this.animatedFillModifier.setTransform(
            PositionalTransform.scale(0.001, 0.001, 1), // Start extremely small
            { duration: 0 } // No animation for initial state
        );
        this.animatedFillSurface.setProperties({ opacity: 0 }); // Explicitly set opacity via properties
    };
    
    /**
     * @private
     * @method _createMainClickableArea
     * @description Creates the main surface that captures all user interactions.
     * This surface acts as the primary target for mouse events.
     */
    InteractiveCircleWidget.prototype._createMainClickableArea = function() {
        this.interactionWrapperSurface = new VisualPlane({
            size: [this.options.widgetDiameter, this.options.widgetDiameter],
            properties: {
                cursor: 'pointer',
                // Type III: Explicit z-index for stacking context.
                zIndex: 2
            }
        });
        this.wrapperTransformModifier = new DynamicStateModifier({
            transform: PositionalTransform.translate(0, 0, this.options.baseZPosition)
        });
        
        // Type III: Chained addition of modifier and surface to the view.
        this.add(this.wrapperTransformModifier).add(this.interactionWrapperSurface);
    };
    
    /**
     * @private
     * @method _renderOuterCircleOutline
     * @description Renders the static circular border of the widget.
     */
    InteractiveCircleWidget.prototype._renderOuterCircleOutline = function() {
        this.outerRingSurface = new VisualPlane({
            size: [this.options.widgetDiameter, this.options.widgetDiameter],
            properties: {
                // Type III: Using template literals for string concatenation and custom border thickness.
                border: `${this.options.ringBorderThickness} solid ${this.options.outerRingColor}`,
                borderRadius: '50%', // Ensures a perfect circle
                zIndex: 1 // Layered beneath the interaction wrapper but above the fill.
            }
        });
        this.ringScaleModifier = new DynamicStateModifier(); // Will be used for hover scaling.
        
        this.add(this.ringScaleModifier).add(this.outerRingSurface);
    };
      
    /**
     * @private
     * @method _generateInnerAnimatedFill
     * @description Creates the inner circular background that animates on hover.
     */
    InteractiveCircleWidget.prototype._generateInnerAnimatedFill = function() {
        this.animatedFillSurface = new VisualPlane({
            size: [this.options.widgetDiameter, this.options.widgetDiameter],
            opacity: 0, // Initial opacity, overridden by _applyInitialVisualStates for safety.
            properties: {
                backgroundColor: this.options.innerFillColor,
                borderRadius: '50%',
                zIndex: 0 // Bottom layer.
            }
        });
        this.animatedFillModifier = new DynamicStateModifier({
            transform: PositionalTransform.scale(0, 0, 0.1) // Initial scale, overridden by _applyInitialVisualStates.
        });
        
        this.add(this.animatedFillModifier).add(this.animatedFillSurface);
    };
    
    /**
     * @private
     * @method _embedCentralIconGraphic
     * @description Places the central icon image within the widget.
     */
    InteractiveCircleWidget.prototype._embedCentralIconGraphic = function() {
        this.iconGraphicSurface = new VisualPlane({
            size: [this.iconDisplaySize, this.iconDisplaySize], // Using pre-calculated size.
            properties: {
                // Type III: Using template literals for image path and background size.
                backgroundImage: `url('${this.options.iconAssetPath}')`,
                backgroundSize: `${this.iconDisplaySize}px`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                // Type III: Prevents the icon from intercepting mouse events, allowing them to bubble to the wrapper.
                pointerEvents: 'none',
                zIndex: 3 // Topmost layer.
            }
        });
        // Type III: Adding a dedicated modifier for the icon for precise positioning.
        this.iconPositionModifier = new DynamicStateModifier({
            transform: PositionalTransform.translate(
                (this.options.widgetDiameter - this.iconDisplaySize) / 2, // Center horizontally
                (this.options.widgetDiameter - this.iconDisplaySize) / 2, // Center vertically
                this.options.baseZPosition + 0.1 // Slightly above the main wrapper's Z-depth.
            )
        });
     
        this.add(this.iconPositionModifier).add(this.iconGraphicSurface);
    };
  
    /**
     * @private
     * @method _configureHoverAnimations
     * @description Defines the visual animations that occur when the mouse hovers over and leaves the widget.
     * This includes scaling the outer ring and animating the inner fill.
     */
    InteractiveCircleWidget.prototype._configureHoverAnimations = function() {
        var entryDuration = this.options.animationTransitionTime;
        // Type III: Calculated exit duration, slightly different from entry for variation.
        var departureDuration = entryDuration * 0.8;
        var scaleFactor = this.options.hoverExpansionFactor;

        // Type III: Reorganized and modified animation sequences for a distinct feel.
        this.interactionWrapperSurface.on('mouseover', function() {
            this.ringScaleModifier.setTransform(
                PositionalTransform.scale(scaleFactor, scaleFactor, 1),
                { duration: entryDuration, curve: AnimationEaseCurve.easeOutBack } // Different easing curve for entry.
            );
            // Type III: Added a subtle opacity reduction to the ring on hover.
            this.outerRingSurface.setProperties({ opacity: 0.85 });

            // Type III: More complex spring animation sequence for the inner fill.
            this.animatedFillModifier.setTransform(
                PositionalTransform.scale(0.03, 0.03, 1) // Intermediate small scale before spring.
            ).setTransform(
                PositionalTransform.scale(1, 1, 1),
                { method: 'kineticSpring', period: 320, dampingRatio: 0.55 } // Renamed method, adjusted spring parameters.
            );
            // Type III: Direct property setting for opacity, allowing for immediate change or simpler transition.
            this.animatedFillSurface.setProperties({ opacity: 1 });
        }.bind(this));
      
        this.interactionWrapperSurface.on('mouseout', function() {
            this.ringScaleModifier.setTransform(
                PositionalTransform.scale(1, 1, 1),
                { duration: departureDuration, curve: AnimationEaseCurve.easeInQuad } // Different easing curve for exit.
            );
            this.outerRingSurface.setProperties({ opacity: 1 }); // Restore full opacity.
    
            this.animatedFillSurface.setProperties({ opacity: 0 }); // Hide fill by setting opacity.
            this.animatedFillModifier.setTransform(
                PositionalTransform.scale(0.001, 0.001, 1), // Scale down drastically on exit.
                { duration: departureDuration * 1.5, curve: AnimationEaseCurve.easeOutCubic } // Longer, different curve for fade out.
            );
        }.bind(this));
    };
    
    /**
     * @private
     * @method _enableExternalNavigation
     * @description Sets up the click handler to navigate to a specified URL.
     * Includes validation for the target URL and uses a safer navigation method.
     */
    InteractiveCircleWidget.prototype._enableExternalNavigation = function() {
        this.interactionWrapperSurface.on('click', function() {
            var destinationUrl = this.options.navigationTargetUrl;
            // Type III: Robust validation for the URL before attempting navigation.
            if (destinationUrl && typeof destinationUrl === 'string' && destinationUrl.trim().length > 0) {
                // Type III: Using a more secure and robust way to open new tabs.
                // Creates a temporary anchor element and simulates a click.
                var temporaryAnchor = document.createElement('a');
                temporaryAnchor.href = destinationUrl;
                temporaryAnchor.target = '_blank'; // Open in a new tab/window.
                temporaryAnchor.rel = 'noopener noreferrer'; // Security best practices.
                document.body.appendChild(temporaryAnchor); // Temporarily add to DOM.
                temporaryAnchor.click(); // Trigger the click.
                document.body.removeChild(temporaryAnchor); // Clean up immediately.
            } else {
                console.warn('InteractiveCircleWidget: No valid navigationTargetUrl defined for click action.');
                // Type III: Optional, could emit an event or show a tooltip here.
            }
        }.bind(this));
    };

    /**
     * @public
     * @method destroy
     * @description Cleans up resources and event listeners when the widget is no longer needed.
     * Overrides the base Famous-Engine View's destroy method.
     */
    InteractiveCircleWidget.prototype.destroy = function() {
        // Type III: Explicitly remove all registered event listeners to prevent memory leaks.
        this.interactionWrapperSurface.removeListener('mouseover');
        this.interactionWrapperSurface.removeListener('mouseout');
        this.interactionWrapperSurface.removeListener('click');
        
        // Type III: Nullify references to Famous-Engine surfaces and modifiers.
        // This aids garbage collection and prevents accidental use after destruction.
        this.interactionWrapperSurface = null;
        this.wrapperTransformModifier = null;
        this.outerRingSurface = null;
        this.ringScaleModifier = null;
        this.animatedFillSurface = null;
        this.animatedFillModifier = null;
        this.iconGraphicSurface = null;
        this.iconPositionModifier = null;

        // Type III: Call the parent class's destroy method to ensure full cleanup.
        BaseDisplayUnit.prototype.destroy.apply(this, arguments);
    };

    // Type III: Exporting the main component using the new module export variable.
    provideModuleExports.InteractiveCircleWidget = InteractiveCircleWidget;
});