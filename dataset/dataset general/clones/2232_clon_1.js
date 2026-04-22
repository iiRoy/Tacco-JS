/*** SocialButtonView - Type I Clone ***/

define(
    function (
        require,
        exports,
        module
    ) {

        // Core Famo.us components
        var View = require('famous/core/View');
        var Surface = require('famous/core/Surface');
        var Transform = require('famous/core/Transform');

        // Modifiers and Transitions for animation
        var StateModifier = require('famous/modifiers/StateModifier');
        var Easing = require('famous/transitions/Easing');
        var Transitionable = require('famous/transitions/Transitionable');
        var SpringTransition = require('famous/transitions/SpringTransition');

        // Register the custom spring transition method
        Transitionable.registerMethod('spring', SpringTransition);

        // Constructor for the SocialButtonView
        function SocialButtonView() {
            // Call the parent constructor (View)
            View.apply(
                this,
                arguments
            );

            // Initialize button components
            _createButtonBg.call(this);
            _createButtonCircleBorder.call(this);
            _createButtonIcon.call(this);
            _createButtonContainer.call(this);

            // Add interactive behaviors
            _addHoverEffect.call(this);
            _addClickableLink.call(this);
        }

        // Inherit from View.prototype and set constructor
        SocialButtonView.prototype = Object.create(View.prototype);
        SocialButtonView.prototype.constructor = SocialButtonView;

        // Default options for the social button
        SocialButtonView.DEFAULT_OPTIONS = {
            buttonSize: 80,
            borderColor: 'white',
            backgroundColor: 'gray',
            iconUrl: 'img/twitter-icon.svg',
            // url: 'https://twitter.com' // Example of a possible URL option
        };


        /**
         * Creates the main container surface for the button.
         * This surface handles user interactions like clicks and hovers.
         */
        function _createButtonContainer() {
            // Main clickable surface
            this.buttonContainer = new Surface({
                size: [
                    this.options.buttonSize,
                    this.options.buttonSize
                ],
                properties: {
                    cursor: 'pointer' // Indicate interactivity
                }
            });

            // Modifier to position the container slightly above other elements
            this.buttonModifier = new StateModifier({
                transform: Transform.translate(0, 0, 0.1)
            });

            // Add to the scene graph
            this.add(this.buttonModifier).add(this.buttonContainer);
        }


        /**
         * Creates the circular border for the button.
         * This border scales on hover.
         */
        function _createButtonCircleBorder() {
            // Surface for the circular border
            this.buttonCircle = new Surface({
                size: [
                    this.options.buttonSize,
                    this.options.buttonSize
                ],
                properties: {
                    border: '1px solid ' + this.options.borderColor,
                    borderRadius: '50%' // Make it circular
                }
            });

            // Modifier for the border (will be animated)
            this.circleModifier = new StateModifier();

            // Add the circle to the render tree
            this.add(this.circleModifier).add(this.buttonCircle);
        }


        /**
         * Creates the background surface that appears on hover.
         */
        function _createButtonBg() {
            // Background surface
            this.buttonBg = new Surface({
                size: [
                    this.options.buttonSize,
                    this.options.buttonSize
                ],
                opacity: 0, // Initially hidden
                properties: {
                    backgroundColor: this.options.backgroundColor,
                    borderRadius: '50%' // Circular shape
                }
            });

            // Modifier for the background (will be animated)
            this.buttonBgModifier = new StateModifier({
                transform: Transform.scale(0, 0, 0.1) // Start very small
            });

            // Add the background to the scene
            this.add(this.buttonBgModifier).add(this.buttonBg);
        }


        /**
         * Creates the social icon surface.
         */
        function _createButtonIcon() {
            // Surface for the social media icon
            this.socialIcon = new Surface({
                size: [
                    this.options.buttonSize / 2,
                    this.options.buttonSize / 2
                ],
                properties: {
                    backgroundImage: 'url(' + this.options.iconUrl + ')',
                    backgroundSize: this.options.buttonSize / 2 + 'px',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                }
            });

            // Add the icon to the view
            this.add(this.socialIcon);
        }


        // Defines the hover animation logic
        function _addHoverEffect() {

            // Event listener for mouse entering the button area
            this.buttonContainer.on('mouseover', function () {
                // Animate the circle border: scale up and fade out
                this.circleModifier.setTransform(
                    Transform.scale(1.3, 1.3, 1),
                    { duration: 200, curve: 'easeInOut' }
                ).setOpacity(
                    0,
                    { duration: 300, curve: 'easeInOut' }
                );

                // Animate the background: initial scale, then spring up, and fade in
                this.buttonBgModifier.setTransform(
                    Transform.scale(0.1, 0.1, 1) // Set initial scale (tiny)
                ).setTransform(
                    Transform.scale(1, 1, 1), // Then scale to full size with spring
                    { method: 'spring', period: 300, dampingRatio: 0.5 }
                ).setOpacity(
                    1,
                    { duration: 300, curve: 'easeInOut' }
                );
            }.bind(this));


            // Event listener for mouse leaving the button area
            this.buttonContainer.on('mouseout', function () {
                // Reset the circle border: scale back down and fade in
                this.circleModifier.setTransform(
                    Transform.scale(1, 1, 1)
                ).setOpacity(
                    1,
                    { duration: 200 }
                );

                // Fade out the background
                this.buttonBgModifier.setOpacity(
                    0,
                    { duration: 300, curve: 'easeInOut' }
                );
            }.bind(this));

        }


        // Adds a click handler to open a link
        function _addClickableLink() {
            this.buttonContainer.on('click', function () {
                // Open the URL specified in options in a new window/tab
                window.open(this.options.url)
            }.bind(this));
        }


        // Export the SocialButtonView constructor
        module.exports = SocialButtonView;
    }
);