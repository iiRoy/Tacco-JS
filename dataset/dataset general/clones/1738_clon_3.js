// This script mandates the presence of a 'CharacterController' on the same entity.
// @requires_component(CharacterController)

// Animation clips for various movement states
public var stillClip : AnimationClip;
public var strideClip : AnimationClip;
public var sprintClip : AnimationClip;
public var leapPoseClip : AnimationClip;

// Speed multipliers for animation playback to synchronize with movement
public var strideAnimMaxSpeed : number = 0.75;
public var jogAnimMaxSpeed : number = 1.0;
public var sprintAnimMaxSpeed : number = 1.0;
public var leapAnimSpeed : number = 1.15;
public var descentAnimSpeed : number = 1.0;

// Internal reference to the animation system component
private var _animComponent : Animation;

// Defines the possible states of the agent's movement pattern
enum AgentMotionState {
	Stationary = 0,
	Striding = 1,
	Jogging = 2,
	Sprinting = 3,
	Leaping = 4,
}

// The current movement state of the character agent
private var _currentMotionState : AgentMotionState;

// Base speed for normal walking movement
var baseStrideSpeed = 2.2;
// After a defined period of walking, the agent will transition to jogging speed
var intermediateStrideSpeed = 4.5;
// Maximum speed achieved when the designated sprint input is active
var maxSprintSpeed = 6.5;

// Acceleration applied for directional changes while the agent is airborne
var aerialManeuverBoost = 3.5;

// The desired maximum height the agent should reach during a jump
var leapApexHeight = 0.55;

// The gravitational force constantly pulling the agent downwards
var downwardForce = 21.0;
// Factor used for smoothing velocity transitions, preventing abrupt changes
var velocityBlendFactor = 10.5;
var turnRateDegrees = 520.0; // Speed at which the agent rotates to face movement direction
var jogDelaySeconds = 2.8; // Time before walking transitions to jogging

// Flag indicating if the character is permitted to initiate a jump
var canPerformLeap = true;

// Timing parameters to control jump initiation and cooldowns
private var minLeapInterval = 0.06;
private var leapInputWindow = 0.16; // Time window after jump button press for jump to register on ground contact
private var groundContactTolerance = 0.26; // How long after leaving ground is considered "effectively" grounded

// Timer for camera stabilization after significant movement changes
private var cameraStabilizationTimer = 0.0;

// The current planned movement direction in the horizontal plane (X-Z)
private var currentMoveHeading = Vector3.zero;
// The current vertical component of the agent's velocity
private var verticalVelocity = 0.0;
// The current speed of horizontal movement on the ground
private var currentGroundSpeed = 0.0;

// Flags indicating collision results from the character controller's last movement operation
private var contactFlags : CollisionFlags; 

// State flags related to the leaping mechanic
private var isLeaping = false;
private var leapingAtZenith = false; // True when the agent has reached the peak of its jump

// Movement and input state flags
private var isMovingBackward = false; // True if the character is primarily moving in reverse
private var isInputActive = false; // True if the player is providing any directional input
private var lastStillTime = 0.0; // Timestamp when the character last came to a halt
private var lastLeapInitiationTime = -10.0; // Time of the last jump button press event
private var lastLeapExecutionTime = -1.0; // Time of the last successful jump execution

// The height from which the last jump was initiated (useful for jump trajectory calculations)
private var leapStartElevation = 0.0;

// Velocity accumulated from player control while the agent is in the air
private var aerialMomentum = Vector3.zero;

// Timestamp of the last moment the character was definitively in contact with the ground
private var lastGroundContactTime = 0.0;

// Flag to enable or disable player input and subsequent agent movement
private var isPlayerControlled = true;

// Initialization routine, called when the script instance is being loaded.
function initializeAgent ()
{
	// Set initial facing direction to forward relative to the object's local transform
	currentMoveHeading = transform.TransformDirection(Vector3.forward);
	
	// Attempt to retrieve the Animation component from the game object
	_animComponent = GetComponent(Animation);
	if(!_animComponent) {
		Debug.LogWarning("Missing Animation component. Character movement animations will not function visually.");
	}
	
	// Validate required animation clips. If any critical ones are missing, disable the animation system.
	let animationConfigurationError = false;
	if (!stillClip) { Debug.LogWarning("No idle animation clip assigned. Visual state may be incomplete."); animationConfigurationError = true; }
	if (!strideClip) { Debug.LogWarning("No walk animation clip assigned. Visual state may be incomplete."); animationConfigurationError = true; }
	if (!sprintClip) { Debug.LogWarning("No run animation clip assigned. Visual state may be incomplete."); animationConfigurationError = true; }
	
	// If jumping is enabled but no leap animation is provided, this is a significant visual error.
	if (canPerformLeap && !leapPoseClip) {
		Debug.LogWarning("Jump is enabled but no jump animation clip assigned. Leap visual feedback will be missing.");
		animationConfigurationError = true;
	}

	if (animationConfigurationError && _animComponent) {
		Debug.Log("Due to critical animation clips being unassigned, the agent's animation system is being disabled.");
		_animComponent = null; // Completely disable animation system if essential clips are missing
	}
}

// Updates the character's desired movement direction and speed based on player input and current state.
function recalculateMovementVector ()
{
	const camReference = Camera.main.transform; // Cache camera transform for efficiency
	const currentlyGrounded = isOnSolidGround();
	const currentSimulationTime = Time.time; // Cache current time for multiple uses within the function
	
	// Determine the forward vector relative to the camera, flattened to the X-Z plane
	let forwardVector = camReference.TransformDirection(Vector3.forward);
	forwardVector.y = 0;
	forwardVector = forwardVector.normalized;

	// Calculate the right vector, which is always orthogonal to the forwardVector
	const rightVector = new Vector3(forwardVector.z, 0, -forwardVector.x);

	// Retrieve raw input axis values from the player
	const verticalInput = Input.GetAxisRaw("Vertical");
	const horizontalInput = Input.GetAxisRaw("Horizontal");

	// Determine if the agent is primarily moving backward (using a slightly adjusted threshold)
	isMovingBackward = (verticalInput < -0.15);
	
	const wasInputPreviouslyActive = isInputActive;
	// Check if any significant directional input is being provided
	isInputActive = Mathf.Abs (horizontalInput) > 0.08 || Mathf.Abs (verticalInput) > 0.08;
		
	// Calculate the target movement direction based on player input
	let targetDirection = horizontalInput * rightVector + verticalInput * forwardVector;
	
	// Logic for movement when the agent is grounded
	if (currentlyGrounded)
	{
		// Update the camera stabilization timer
		cameraStabilizationTimer += Time.deltaTime;
		if (isInputActive != wasInputPreviouslyActive) {
			cameraStabilizationTimer = 0.0; // Reset timer if the input activity state changes
		}

		// If there's significant directional input, update the agent's movement heading
		if (targetDirection.sqrMagnitude > 0.01) // Check for a non-negligible target direction
		{
			// If moving very slowly, snap to the target direction for better responsiveness
			if (currentGroundSpeed < baseStrideSpeed * 0.8 && currentlyGrounded)
			{
				currentMoveHeading = targetDirection.normalized;
			}
			// Otherwise, smoothly rotate the agent towards the target direction over time
			else
			{
				const rotationSpeedRadians = turnRateDegrees * Mathf.Deg2Rad;
				currentMoveHeading = Vector3.RotateTowards(currentMoveHeading, targetDirection, rotationSpeedRadians * Time.deltaTime, 1000);
				currentMoveHeading = currentMoveHeading.normalized;
			}
		}
		
		// Smoothly blend the current ground speed towards the calculated target speed
		const currentSmoothFactor = velocityBlendFactor * Time.deltaTime;
		
		// Determine the target speed magnitude based on input
		let targetMagnitude = Mathf.Min(targetDirection.magnitude, 1.0);
	
		// Default to a stationary state if no input or very low movement
		_currentMotionState = AgentMotionState.Stationary;
		
		// Apply speed modifiers based on player input (sprint, jog, walk)
		let effectiveTargetSpeed = 0.0; // Initialize effective speed to zero
		if (Input.GetButton ("SprintModifier")) // Using a named button for sprint
		{
			effectiveTargetSpeed = targetMagnitude * maxSprintSpeed;
			_currentMotionState = AgentMotionState.Sprinting;
		}
		else if (currentSimulationTime - jogDelaySeconds > lastStillTime && targetMagnitude > 0.1) // Only jog if actively moving
		{
			effectiveTargetSpeed = targetMagnitude * intermediateStrideSpeed;
			_currentMotionState = AgentMotionState.Jogging;
		}
		else if (targetMagnitude > 0.05) // Check for minimal input to register as walking
		{
			effectiveTargetSpeed = targetMagnitude * baseStrideSpeed;
			_currentMotionState = AgentMotionState.Striding;
		}
		// If no significant input, effectiveTargetSpeed remains 0, and state is Stationary by default.

		currentGroundSpeed = Mathf.Lerp(currentGroundSpeed, effectiveTargetSpeed, currentSmoothFactor);
		
		// Reset the last still time if the agent's speed drops below a certain threshold
		if (currentGroundSpeed < baseStrideSpeed * 0.25) {
			lastStillTime = currentSimulationTime;
		}
	}
	// Logic for movement when the agent is airborne
	else
	{
		// If currently leaping, ensure the camera remains locked
		if (isLeaping) {
			cameraStabilizationTimer = 0.0;
		}

		// Apply air control if directional input is active
		if (isInputActive) {
			aerialMomentum += targetDirection.normalized * Time.deltaTime * aerialManeuverBoost;
		}
	}
}

// Manages the character's jumping behavior, including input and timing.
function manageLeapMechanics ()
{
	const currentSimulationTime = Time.time;
	// Prevent successive jumps from occurring too rapidly
	if (lastLeapExecutionTime + minLeapInterval > currentSimulationTime) {
		return;
	}

	if (isOnSolidGround()) {
		// Check for jump input within the allowed time window after the button press
		if (canPerformLeap && currentSimulationTime < lastLeapInitiationTime + leapInputWindow) {
			verticalVelocity = determineLeapInitialVelocity (leapApexHeight);
			// Notify other components or systems that a jump has been initiated
			SendMessage("onLeapInitiatedEvent", SendMessageOptions.DontRequireReceiver);
			// Clear the jump input timestamp to prevent immediate re-triggering
			lastLeapInitiationTime = -100.0; // Set to a very old time to effectively clear it
		}
	}
}

// Applies gravitational force to the character and manages leap apex detection.
function applyGravitationalPull ()
{
	// Only apply gravity if the player is currently controllable
	if (!isPlayerControlled) {
		return; // Exit early if control is disabled
	}
	
	// Detect when the character reaches the apex (peak) of its jump
	if (isLeaping && !leapingAtZenith && verticalVelocity <= 0.0)
	{
		leapingAtZenith = true;
		SendMessage("onLeapPeakReached", SendMessageOptions.DontRequireReceiver);
	}

	// If grounded, reset vertical velocity; otherwise, apply gravitational force
	if (isOnSolidGround()) {
		verticalVelocity = 0.0;
		aerialMomentum = Vector3.zero; // Clear any accumulated air momentum upon landing
	} else {
		verticalVelocity -= downwardForce * Time.deltaTime;
	}
}

// Calculates the initial upward velocity required for the agent to reach a specified jump height.
function determineLeapInitialVelocity (desiredLeapHeight : number)
{
	// Uses the physics formula: v = sqrt(2 * g * h)
	if (desiredLeapHeight <= 0) { // Guard against non-positive leap height values
		Debug.LogError("Desired leap height must be a positive value!");
		return 0; // Return zero velocity for invalid height
	}
	return Mathf.Sqrt(2 * desiredLeapHeight * downwardForce);
}

// Callback function executed when a jump is successfully initiated.
function onLeapInitiated ()
{
	isLeaping = true;
	leapingAtZenith = false; // Reset apex flag when a new jump begins
	lastLeapExecutionTime = Time.time;
	leapStartElevation = transform.position.y; // Record the starting height of the jump
	
	_currentMotionState = AgentMotionState.Leaping;
}

// Main update loop, called once per frame to manage agent logic.
function frameUpdate() {
	const currentFrameTime = Time.time; // Capture current time once per frame for consistent timing

	// Retrieve the CharacterController component. If missing, disable control and log error.
	let agentController = GetComponent(CharacterController);
	if (!agentController) {
		Debug.LogError("CharacterController component not found! Agent movement will be disabled.");
		isPlayerControlled = false; // Disable control if the essential component is missing
		return;
	}

	// If the player is not controllable, reset inputs and halt further movement logic.
	if (!isPlayerControlled) {
		Input.ResetInputAxes(); // Clear any pending input
		return;
	}

	// Process the jump button press event
	if (Input.GetButtonDown ("Jump")) {
		lastLeapInitiationTime = currentFrameTime;
	}

	// Update the agent's movement direction and speed based on current inputs and state
	recalculateMovementVector();
	
	// Apply gravitational forces and manage the detection of the jump's apex
	applyGravitationalPull();

	// Handle the logic for initiating and managing jumps
	manageLeapMechanics();
	
	// Calculate the final combined movement vector for this frame
	let totalMovementVector = currentMoveHeading * currentGroundSpeed + new Vector3 (0, verticalVelocity, 0) + aerialMomentum;
	totalMovementVector *= Time.deltaTime; // Scale the movement by the frame's delta time

	// Move the character controller and capture the resulting collision flags
	contactFlags = agentController.Move(totalMovementVector);
	
	// --- ANIMATION HANDLING SECTION ---
	if(_animComponent) {
		if(_currentMotionState == AgentMotionState.Leaping) 
		{
			if(!leapingAtZenith) {
				_animComponent[leapPoseClip.name].speed = leapAnimSpeed;
				_animComponent[leapPoseClip.name].wrapMode = WrapMode.ClampForever;
				_animComponent.CrossFade(leapPoseClip.name);
			} else {
				// Play the jump animation in reverse for a controlled landing visual
				_animComponent[leapPoseClip.name].speed = -descentAnimSpeed;
				_animComponent[leapPoseClip.name].wrapMode = WrapMode.ClampForever;
				_animComponent.CrossFade(leapPoseClip.name);				
			}
		} 
		else // Agent is not in a leaping state
		{
			// If the character is virtually stationary, play the idle animation
			if(agentController.velocity.sqrMagnitude < 0.05) { // Adjusted threshold for determining "stop"
				_animComponent.CrossFade(stillClip.name);
				_currentMotionState = AgentMotionState.Stationary; // Explicitly set state to stationary
			}
			else // Character is moving on the ground
			{
				const currentVelocityMagnitude = agentController.velocity.magnitude;
				if(_currentMotionState == AgentMotionState.Sprinting) {
					_animComponent[sprintClip.name].speed = Mathf.Clamp(currentVelocityMagnitude, 0.0, sprintAnimMaxSpeed);
					_animComponent.CrossFade(sprintClip.name);	
				}
				else if(_currentMotionState == AgentMotionState.Jogging) {
					_animComponent[strideClip.name].speed = Mathf.Clamp(currentVelocityMagnitude, 0.0, jogAnimMaxSpeed);
					_animComponent.CrossFade(strideClip.name);	
				}
				else if(_currentMotionState == AgentMotionState.Striding) {
					_animComponent[strideClip.name].speed = Mathf.Clamp(currentVelocityMagnitude, 0.0, strideAnimMaxSpeed);
					_animComponent.CrossFade(strideClip.name);	
				}
				// Fallback to stride animation if the current state is not explicitly handled but movement exists
				else {
					_animComponent[strideClip.name].speed = Mathf.Clamp(currentVelocityMagnitude, 0.0, strideAnimMaxSpeed);
					_animComponent.CrossFade(strideClip.name);
				}
			}
		}
	}
	// --- END ANIMATION HANDLING SECTION ---
	
	// Orient the character to face its current movement direction
	if (isOnSolidGround())
	{
		// Only rotate if there's significant movement input and actual ground speed
		if (currentMoveHeading.sqrMagnitude > 0.01 && currentGroundSpeed > 0.1) {
			transform.rotation = Quaternion.LookRotation(currentMoveHeading);
		}
	}	
	else // While airborne, rotate based on the current horizontal velocity component
	{
		let horizontalAirVelocity = totalMovementVector; // Use totalMovementVector for rotation in air
		horizontalAirVelocity.y = 0;
		if (horizontalAirVelocity.sqrMagnitude > 0.001) // Only rotate if there's significant horizontal air movement
		{
			transform.rotation = Quaternion.LookRotation(horizontalAirVelocity.normalized); // Normalize vector for rotation
		}
	}	
	
	// Check for landing after a jump or fall
	if (isOnSolidGround())
	{
		lastGroundContactTime = currentFrameTime;
		if (isLeaping)
		{
			isLeaping = false;
			leapingAtZenith = false; // Reset apex flag upon successful landing
			SendMessage("onAgentLanded", SendMessageOptions.DontRequireReceiver);
		}
	}
}

// Callback function for controller collision events.
function onCollisionEvent (collisionInfo : ControllerColliderHit )
{
	// Optional: Debug.DrawRay(collisionInfo.point, collisionInfo.normal); // Visualize collision normal
	// Ignore collisions where the impact direction is primarily upward (e.g., hitting a ceiling)
	if (collisionInfo.moveDirection.y > 0.02) {
		return;
	}
	// Additional collision handling logic can be implemented here.
}

// Public accessor to retrieve the agent's current horizontal ground speed.
function queryGroundSpeed () {
	return currentGroundSpeed;
}

// Public accessor to check if the agent is currently in a leaping state.
function isCurrentlyLeaping () {
	return isLeaping;
}

// Determines if the character is currently in definitive contact with the ground.
function isOnSolidGround () {
	// Checks if the 'CollidedBelow' flag is set within the collision flags from the character controller.
	return (contactFlags & CollisionFlags.CollidedBelow) != 0;
}

// Public accessor to retrieve the agent's current horizontal movement heading vector.
function queryMoveHeading () {
	return currentMoveHeading;
}

// Public accessor to check if the agent is currently moving backward.
function isReversingDirection () {
	return isMovingBackward;
}

// Public accessor to retrieve the current duration of the camera stabilization timer.
function queryCameraLockDuration () 
{
	return cameraStabilizationTimer;
}

// Public method to determine if the player is actively providing significant input.
function isReceivingInput () : boolean
{
	// A more robust check for active input by summing absolute axis values
	return Mathf.Abs(Input.GetAxisRaw("Vertical")) + Mathf.Abs(Input.GetAxisRaw("Horizontal")) > 0.4;
}

// Public accessor to check if the agent's jump has reached its highest point.
function hasLeapReachedPeak ()
{
	return leapingAtZenith;
}

// Determines if the character is considered grounded within a recent timeframe, accounting for small gaps.
function isEffectivelyGrounded ()
{
	return lastGroundContactTime + groundContactTolerance > Time.time;
}

// Resets the game object's tag to a default player agent tag.
function resetAgentState ()
{
	gameObject.tag = "PlayerAgent"; // Changed default tag name
	// Additional reset logic could be added here, such as resetting position, health, etc.
}