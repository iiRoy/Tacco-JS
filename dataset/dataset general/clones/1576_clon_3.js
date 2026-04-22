// Generated from a legacy character control module.
// Refactored and modernized for improved readability and maintainability.

/*
 * GameEntity Class: Manages the player's avatar in the game environment.
 * Handles rendering, movement, and interaction with game audio.
 *
 * @author: A.N. Other (anon.dev@example.com)
 * @version: 2.0.0
 * @license: MIT
 */

(function() {
  // A minimal BaseEntity class, assuming it's provided by the game engine.
  // In a real application, this would be imported from a separate module.
  class BaseEntity {
    constructor(baseConfiguration = {}) {
      // Default base parameters, can be overridden by specific entity configurations.
      this.baseParameters = {
        position: {
          x: 0,
          y: 0,
          z: 0
        },
        scale: 1,
        active: true
      };
      // Merge provided configuration with base defaults
      this.settings = Object.assign({}, this.baseParameters, baseConfiguration);
    }

    // Placeholder method that might exist in a parent class
    _logBaseActivity(message) {
      if (this.settings.debugMode) {
        console.log(`[BaseEntity] ${message}`);
      }
    }
  }

  /**
   * The main player avatar class, extending basic entity functionalities.
   * Manages visual representation, movement, and animation states.
   */
  class PlayerAvatar extends BaseEntity {

    /**
     * Static default properties for any PlayerAvatar instance.
     * These can be overridden by instance-specific configurations.
     * @type {object}
     */
    static defaultProps = {
      motionProps: {
        gravitationalPull: 2 // Pixels per frame squared (simplified)
      },
      leapParams: {
        initialImpulse: 0, // Calculated dynamically based on height and gravity
        peakAltitude: 120 // Max jump height in pixels
      },
      visual: {
        baseClass: 'player-sprite-base', // Base CSS class for the main visual
        innerSpriteClass: 'player-inner-layer', // CSS class for an internal sprite element
        elementId: 'player-main-avatar' // Default ID for the DOM element
      }
    };

    /**
     * Constructs a new PlayerAvatar instance.
     * @param {object} entityConfiguration - Custom configuration options for the avatar.
     * @param {object} soundHandler - An object responsible for playing and stopping game sounds.
     *                                 Expected to have methods: play(soundName), stop(soundName), getVolume(soundName).
     */
    constructor(entityConfiguration = {}, soundHandler) {
      // Validate the sound handler to prevent runtime errors
      if (!soundHandler || typeof soundHandler.play !== 'function' || typeof soundHandler.stop !== 'function') {
        console.warn('PlayerAvatar: Invalid or incomplete sound handler provided. Sound effects may not function.');
        // Provide a dummy sound handler to avoid method call errors later
        this.sfxHandler = {
          play: () => {},
          stop: () => {},
          getVolume: () => 0
        };
      } else {
        this.sfxHandler = soundHandler;
      }

      // Merge instance configuration with static defaults
      const fullConfig = Object.assign({}, PlayerAvatar.defaultProps, entityConfiguration);
      super(fullConfig); // Call the parent BaseEntity constructor

      // Ensure settings property exists from BaseEntity constructor and is up-to-date
      if (!this.settings) {
        this.settings = fullConfig;
      } else {
        // Deep merge for nested objects if required, but Object.assign handles top-level
        Object.assign(this.settings, fullConfig);
      }

      // Destructure relevant physics parameters for calculation
      const {
        peakAltitude: jumpHeight,
        initialImpulse: currentJumpImpulse
      } = this.settings.leapParams;
      const {
        gravitationalPull: entityGravity
      } = this.settings.motionProps;

      // Calculate the initial jump impulse. Guard against invalid gravity values.
      if (entityGravity <= 0) {
        console.error("Gravitational pull must be a positive number for jump calculation.");
        this.settings.leapParams.initialImpulse = 0;
      } else {
        // Using Math.ceil for a slightly different, yet functionally equivalent, rounding.
        this.settings.leapParams.initialImpulse = Math.ceil(Math.sqrt(2 * jumpHeight * entityGravity));
      }

      this._initializeInternalState(); // Set up motion and animation state variables
      this._constructVisualComponent(); // Create the avatar's DOM element
      this._isReady = true; // Mark the avatar as fully initialized and ready for use
    }

    /**
     * Initializes all internal state variables related to movement and animation.
     * This method can be called to reset the avatar's dynamic state.
     * @private
     * @returns {void}
     */
    _initializeInternalState() {
      this._motionState = {
        isAirborne: false,
        currentVerticalVelocity: 0, // Renamed from appliedForce
        animationFrameCounter: 0, // Renamed from ticks
        currentAction: 'idle', // Tracks the avatar's primary action (idle, running, jumping, landing)
        isFlippedHorizontally: false // Tracks if the avatar is facing the opposite direction
      };
      this._logBaseActivity('Internal state initialized.');
    }

    /**
     * Creates and appends the necessary DOM elements for the avatar's visual representation.
     * @private
     * @returns {void}
     */
    _constructVisualComponent() {
      const mainContainer = document.createElement('div');
      // Assign ID, using a dynamic fallback if not explicitly provided in settings
      mainContainer.id = this.settings.visual.elementId || `player-entity-${Date.now()}`;
      mainContainer.classList.add(this.settings.visual.baseClass); // Add the base visual class

      const innerElement = document.createElement('div');
      innerElement.classList.add(this.settings.visual.innerSpriteClass);

      mainContainer.appendChild(innerElement);
      this.visualComponent = mainContainer; // Store a reference to the main DOM element

      // Apply initial CSS transform to ensure correct starting position
      this._applyCssTransform('translate3d(0, 0, 0)');
      this._logBaseActivity('Visual component constructed.');
    }

    /**
     * Applies a CSS transform string to the avatar's main visual component.
     * Includes a guard clause to ensure the component exists.
     * @param {string} transformValue - The CSS transform string (e.g., 'translateX(100px)').
     * @private
     * @returns {void}
     */
    _applyCssTransform(transformValue) {
      if (this.visualComponent) {
        this.visualComponent.style.transform = transformValue;
      } else {
        console.warn('Attempted to apply CSS transform before visual component was created.');
      }
    }

    /**
     * Plays a specified sound effect if its volume is set above zero.
     * Includes a guard for the sound handler and sound object.
     * @param {string} soundKey - The key/name of the sound to play (e.g., 'footsteps', 'impactSound').
     * @private
     * @returns {void}
     */
    _triggerSoundEffect(soundKey) {
      const soundObject = this.sfxHandler[soundKey];
      if (soundObject && typeof soundObject.play === 'function' && soundObject.getVolume() > 0) {
        soundObject.play();
      }
    }

    /**
     * Stops a specified sound effect if its volume is set above zero.
     * Includes a guard for the sound handler and sound object.
     * @param {string} soundKey - The key/name of the sound to stop.
     * @private
     * @returns {void}
     */
    _silenceSoundEffect(soundKey) {
      const soundObject = this.sfxHandler[soundKey];
      if (soundObject && typeof soundObject.stop === 'function' && soundObject.getVolume() > 0) {
        soundObject.stop();
      }
    }

    /**
     * Resets the avatar's visual position and internal motion state to its initial configuration.
     * @returns {PlayerAvatar} The current instance for method chaining.
     */
    reinitializePositionAndState() {
      // Guard clause: ensure the visual component exists before attempting manipulation.
      if (!this.visualComponent) {
        console.warn('Cannot reinitialize: visual component not found.');
        return this;
      }

      this._applyCssTransform('translate3d(0, 0, 0)'); // Reset visual position
      this.visualComponent.className = this.settings.visual.baseClass; // Clear all dynamic classes, keep base
      this._initializeInternalState(); // Reset all motion and animation flags
      this._logBaseActivity('Position and state reinitialized.');
      return this;
    }

    /**
     * Controls the avatar's horizontal movement and updates its facing direction.
     * @param {boolean} shouldFlipDirection - If true, the avatar will visually flip horizontally. Defaults to false.
     * @returns {void}
     */
    traverse(shouldFlipDirection = false) {
      if (!this.visualComponent) return; // Guard clause

      // Update horizontal flip state and apply/remove corresponding CSS class
      this._motionState.isFlippedHorizontally = shouldFlipDirection;
      this.visualComponent.classList.toggle('is-flipped-h', this._motionState.isFlippedHorizontally);

      // Only apply 'running' animation and sound if the avatar is not airborne
      if (!this._motionState.isAirborne) {
        this.visualComponent.classList.add('animation-run');
        this._motionState.currentAction = 'running';
        this._triggerSoundEffect('footsteps');
      }
      this._logBaseActivity(`Traversing, flipped: ${shouldFlipDirection}`);
    }

    /**
     * Initiates a jump action for the avatar.
     * Prevents multiple jumps if already airborne.
     * @returns {void}
     */
    initiateLeap() {
      if (!this.visualComponent || this._motionState.isAirborne) {
        // Guard clause: prevent jump if no component or already in air
        this._logBaseActivity('Jump attempt blocked (already airborne or no visual).');
        return;
      }

      this._motionState.isAirborne = true;
      this.visualComponent.classList.add('action-leap');
      this._motionState.currentAction = 'jumping';
      this._silenceSoundEffect('footsteps'); // Stop running sound when beginning a jump
      this._logBaseActivity('Leap initiated.');
    }

    /**
     * Terminates a specific avatar action, such as 'run' or 'jump', and transitions states.
     * @param {string} actionIdentifier - The type of action to terminate ('run' or 'jump').
     * @returns {void}
     */
    terminateAction(actionIdentifier) {
      if (!this.visualComponent) return; // Guard clause

      const targetElement = this.visualComponent;
      const {
        currentAction
      } = this._motionState;

      // Using an action map instead of a switch for better organization and scalability
      const actionTerminationHandlers = {
        'run': () => {
          targetElement.classList.remove('animation-run');
          if (currentAction === 'running') {
            this._motionState.currentAction = 'idle';
          }
          this._silenceSoundEffect('footsteps');
          this._logBaseActivity('Run action terminated.');
        },
        'jump': () => {
          // Reset airborne state and related variables, effectively 'landing'
          this._initializeInternalState(); // This resets all motion state, including isAirborne to false
          targetElement.classList.remove('action-leap');
          targetElement.classList.add('state-in-air'); // Indicate still in air, but jump animation finished
          targetElement.classList.add('visual-landing-effect'); // Add a specific class for landing animation/effect

          this._triggerSoundEffect('impactSound');

          // Introduce a short delay for landing animation/sound to complete
          const landingEffectDurationMs = 250; // Milliseconds
          setTimeout(() => {
            targetElement.classList.remove('visual-landing-effect', 'state-in-air');
            // Only set to idle if no other action has started during landing
            if (this._motionState.currentAction !== 'running' && this._motionState.currentAction !== 'jumping') {
              this._motionState.currentAction = 'idle';
            }
            this._logBaseActivity('Jump action terminated, landing sequence complete.');
          }, landingEffectDurationMs);
        },
        // Default handler for unrecognized actions
        'default': () => {
          console.warn(`Attempted to terminate an unknown action: '${actionIdentifier}'.`);
        }
      };

      // Execute the appropriate handler or the default one
      (actionTerminationHandlers[actionIdentifier] || actionTerminationHandlers['default'])();
    }

    /**
     * Retrieves the primary DOM element representing the avatar.
     * @returns {HTMLElement|null} The avatar's visual component, or null if not yet created.
     */
    getDisplayElement() {
      return this.visualComponent;
    }

    /**
     * Performs cleanup operations, such as removing the DOM element and nullifying references.
     * This helps prevent memory leaks.
     * @returns {void}
     */
    destroy() {
      if (this.visualComponent && this.visualComponent.parentNode) {
        this.visualComponent.parentNode.removeChild(this.visualComponent);
      }
      this.visualComponent = null;
      this.sfxHandler = null;
      this._motionState = null;
      this._isReady = false;
      this._logBaseActivity('Avatar instance destroyed and cleaned up.');
    }
  }

  // Universal Module Definition (UMD) pattern for exporting the PlayerAvatar class
  // This allows the class to be used in various JavaScript environments (Node.js, AMD, browser globals).
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerAvatar;
  } else if (typeof define === 'function' && define.amd) {
    // AMD loader (e.g., RequireJS)
    define([], function() {
      return PlayerAvatar;
    });
  } else {
    // Browser global scope
    window.PlayerAvatar = PlayerAvatar;
  }

}).call(this);