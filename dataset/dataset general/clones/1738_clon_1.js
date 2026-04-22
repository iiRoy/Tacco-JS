/* This script mandates that a CharacterController component be present
 * on the same GameObject for proper operation. */
@script RequireComponent ( CharacterController )


public var idleAnimation       : AnimationClip ;
public var walkAnimation       : AnimationClip ;
public var runAnimation        : AnimationClip ;
public var jumpPoseAnimation   : AnimationClip ;

public var walkMaxAnimationSpeed  : float = 0.75;
public var trotMaxAnimationSpeed  : float = 1.0 ;
public var runMaxAnimationSpeed   : float = 1.0 ;
public var jumpAnimationSpeed     : float = 1.15;
public var landAnimationSpeed     : float = 1.0 ;


private var _animation : Animation ;

/* Defines the various states the character can be in. */
enum CharacterState
{
    Idle    = 0,
    Walking = 1,
    Trotting= 2,
    Running = 3,
    Jumping = 4
}


private var _characterState : CharacterState ;


// Base movement speed when the character is walking normally.
var walkSpeed = 2.0 ;

/* After a certain duration of continuous walking, the character
 * transitions to a trotting pace, using trotSpeed. */
var trotSpeed = 4.0 ;

// Speed when the "Fire3" button (typically 'cmd' or 'alt') is pressed, enabling a run.
var runSpeed = 6.0 ;

var inAirControlAcceleration = 3.0;

// Determines the initial jump height when the jump key is pressed and released quickly.
var jumpHeight = 0.5;

// Standard gravitational force applied to the character.
var gravity = 20.0;

// Controls the smoothness of speed transitions.
var speedSmoothing = 10.0;
var rotateSpeed = 500.0;

// Duration of walking before the character automatically transitions to trotting.
var trotAfterSeconds = 3.0;


var canJump = true;


private var jumpRepeatTime    = 0.05;
private var jumpTimeout       = 0.15;
private var groundedTimeout   = 0.25;


/* Timer to prevent immediate camera following upon movement state changes,
 * reducing visual "wobble". */
private var lockCameraTimer = 0.0;


private var moveDirection = Vector3.zero; // Current movement direction on the horizontal plane (X-Z).
private var verticalSpeed = 0.0;          // Current vertical velocity.
private var moveSpeed     = 0.0;          // Current horizontal movement speed.


/* Stores the collision flags from the last CharacterController.Move operation,
 * useful for determining ground contact, etc. */
private var collisionFlags : CollisionFlags ;


private var jumping         = false; // True if the character is currently in a jump state.
private var jumpingReachedApex = false; // True if the character has passed the peak of their jump.


private var movingBack    = false; // Indicates if the character is moving backwards, affecting camera behavior.
private var isMoving      = false; // True if the user is providing any movement input.
private var walkTimeStart = 0.0;   // Timestamp when walking began, used for trot transition.
private var lastJumpButtonTime = -10.0; // Last time the jump button was pressed.
private var lastJumpTime       = -1.0;  // Last time a jump action was initiated.


private var lastJumpStartHeight = 0.0; /* Records the Y-position at the start of a jump
                                        * to help calculate additional jump power. */


private var inAirVelocity = Vector3.zero;


private var lastGroundedTime = 0.0;


private var isControllable = true; // Flag to enable/disable character input control.

function Awake ( )
{
    // Initialize moveDirection based on the character's forward transform.
    moveDirection = transform.TransformDirection ( Vector3.forward ) ;


    _animation = GetComponent ( Animation );
    if ( ! _animation )
    {
        Debug.Log ( "The character you would like to control doesn't have animations. Moving her might look weird." ) ;
    }

    /* The following block checks for essential animation clips.
     * If any required animation is missing, the animation system
     * for this character is disabled to prevent errors. */
    if ( ! idleAnimation )
    {
        _animation = null ;
        Debug.Log ( "No idle animation found. Turning off animations." ) ;
    }
    if ( ! walkAnimation )
    {
        _animation = null ;
        Debug.Log ( "No walk animation found. Turning off animations." ) ;
    }
    if ( ! runAnimation )
    {
        _animation = null ;
        Debug.Log ( "No run animation found. Turning off animations." ) ;
    }
    if ( ! jumpPoseAnimation && canJump )
    {
        _animation = null ;
        Debug.Log ( "No jump animation found and the character has canJump enabled. Turning off animations." ) ;
    }

}


function UpdateSmoothedMovementDirection ( )
{
    var cameraTransform = Camera.main.transform ;
    var grounded        = IsGrounded ( ) ;

    // Calculate the camera's forward vector, flattened to the X-Z plane.
    var forward = cameraTransform.TransformDirection ( Vector3.forward ) ;
    forward.y   = 0 ;
    forward     = forward.normalized ;

    // Determine the camera's right vector, orthogonal to the flattened forward vector.
    var right = Vector3 ( forward.z, 0, -forward.x ) ;

    var v = Input.GetAxisRaw ( "Vertical" ) ;
    var h = Input.GetAxisRaw ( "Horizontal" ) ;

    // Check if the character is moving or looking backwards.
    if ( v < -0.2 )
    {
        movingBack = true ;
    }
    else
    {
        movingBack = false ;
    }

    var wasMoving = isMoving ;
    isMoving      = Mathf.Abs ( h ) > 0.1 || Mathf.Abs ( v ) > 0.1 ;

    // Calculate the desired movement direction relative to the camera.
    var targetDirection = h * right + v * forward ;


    // Logic specific to when the character is on the ground.
    if ( grounded )
    {
        lockCameraTimer += Time.deltaTime ; // Increment timer for camera lock.
        if ( isMoving != wasMoving )
        {
            lockCameraTimer = 0.0 ; // Reset timer if movement state changes.
        }

        /* Update moveDirection only if there is user input,
         * preserving the last valid direction when standing still. */
        if ( targetDirection != Vector3.zero )
        {
            // If character is moving very slowly, immediately align with target direction.
            if ( moveSpeed < walkSpeed * 0.9 && grounded )
            {
                moveDirection = targetDirection.normalized ;
            }
            // Otherwise, smoothly rotate towards the target direction.
            else
            {
                moveDirection = Vector3.RotateTowards ( moveDirection, targetDirection, rotateSpeed * Mathf.Deg2Rad * Time.deltaTime, 1000 ) ;
                moveDirection = moveDirection.normalized ;
            }
        }

        // Apply smoothing to the character's speed.
        var curSmooth = speedSmoothing * Time.deltaTime ;

        // Determine the target speed, clamping analog input.
        var targetSpeed = Mathf.Min ( targetDirection.magnitude, 1.0 ) ;

        _characterState = CharacterState.Idle ; // Default to idle state.

        // Adjust target speed and character state based on input modifiers.
        if ( Input.GetKey ( KeyCode.LeftShift ) | Input.GetKey ( KeyCode.RightShift ) )
        {
            targetSpeed     *= runSpeed ;
            _characterState = CharacterState.Running ;
        }
        else if ( Time.time - trotAfterSeconds > walkTimeStart )
        {
            targetSpeed     *= trotSpeed ;
            _characterState = CharacterState.Trotting ;
        }
        else
        {
            targetSpeed     *= walkSpeed ;
            _characterState = CharacterState.Walking ;
        }

        // Smoothly interpolate the current move speed towards the target speed.
        moveSpeed = Mathf.Lerp ( moveSpeed, targetSpeed, curSmooth ) ;

        // If speed drops significantly, reset walk time to prevent premature trotting.
        if ( moveSpeed < walkSpeed * 0.3 )
        {
            walkTimeStart = Time.time ;
        }
    }
    // Logic for character movement when in the air (jumping).
    else
    {
        if ( jumping )
        {
            lockCameraTimer = 0.0 ; // Keep camera locked during a jump.
        }

        if ( isMoving )
        {
            inAirVelocity += targetDirection.normalized * Time.deltaTime * inAirControlAcceleration ;
        }
    }

}


function ApplyJumping ( )
{
    /* Enforce a minimum delay between jumps to prevent
     * rapid, unintended successive jumps. */
    if ( lastJumpTime + jumpRepeatTime > Time.time )
    {
        return ;
    }

    if ( IsGrounded ( ) )
    {
        // Initiate a jump only if the character is grounded.
        // The jump button press is also checked against a timeout
        // to allow for pre-landing button presses.
        if ( canJump && Time.time < lastJumpButtonTime + jumpTimeout )
        {
            verticalSpeed = CalculateJumpVerticalSpeed ( jumpHeight ) ;
            SendMessage ( "DidJump", SendMessageOptions.DontRequireReceiver ) ;
        }
    }
}


function ApplyGravity ( )
{
    // Apply gravity effects only if the character is currently controllable.
    if ( isControllable )
    {
        // A local variable to check jump button state (though not directly used here).
        var jumpButton = Input.GetButton ( "Jump" ) ;


        /* Detects when the character reaches the peak of their jump
         * (vertical speed becomes zero or negative) and sends a notification. */
        if ( jumping && ! jumpingReachedApex && verticalSpeed <= 0.0 )
        {
            jumpingReachedApex = true ;
            SendMessage ( "DidJumpReachApex", SendMessageOptions.DontRequireReceiver ) ;
        }

        // If grounded, vertical speed is zero; otherwise, apply gravitational pull.
        if ( IsGrounded ( ) )
        {
            verticalSpeed = 0.0 ;
        }
        else
        {
            verticalSpeed -= gravity * Time.deltaTime ;
        }
    }
}

function CalculateJumpVerticalSpeed ( targetJumpHeight : float )
{
    /* This function computes the initial upward velocity required
     * for the character to reach a specified jump height,
     * taking into account the defined gravity. */
    return Mathf.Sqrt ( 2 * targetJumpHeight * gravity ) ;
}

function DidJump ( )
{
    jumping            = true ;
    jumpingReachedApex = false ;
    lastJumpTime       = Time.time ;
    lastJumpStartHeight = transform.position.y ;
    lastJumpButtonTime = -10 ; // Reset jump button time to prevent immediate re-jump.


    _characterState = CharacterState.Jumping ;
}

function Update ( )
{

    if ( ! isControllable )
    {
        // If the character is not controllable, all input axes are reset.
        Input.ResetInputAxes ( ) ;
    }

    if ( Input.GetButtonDown ( "Jump" ) )
    {
        lastJumpButtonTime = Time.time ;
    }

    // Update the character's movement direction and speed based on input.
    UpdateSmoothedMovementDirection ( ) ;

    /* Handle gravitational forces.
     * Note: Future enhancements might include variable gravity or
     * special descent modes. */
    ApplyGravity ( ) ;

    // Process jump initiation and state.
    ApplyJumping ( ) ;

    // Calculate the final movement vector for this frame.
    var movement = moveDirection * moveSpeed + Vector3 ( 0, verticalSpeed, 0 ) + inAirVelocity ;
    movement *= Time.deltaTime ;

    // Retrieve the CharacterController component and move the character.
    var controller : CharacterController = GetComponent ( CharacterController ) ;
    collisionFlags = controller.Move ( movement ) ;


    // ANIMATION HANDLING BLOCK
    if ( _animation )
    {
        if ( _characterState == CharacterState.Jumping )
        {
            if ( ! jumpingReachedApex )
            {
                _animation [ jumpPoseAnimation.name ].speed = jumpAnimationSpeed ;
                _animation [ jumpPoseAnimation.name ].wrapMode = WrapMode.ClampForever ;
                _animation.CrossFade ( jumpPoseAnimation.name ) ;
            }
            else
            {
                _animation [ jumpPoseAnimation.name ].speed = -landAnimationSpeed ;
                _animation [ jumpPoseAnimation.name ].wrapMode = WrapMode.ClampForever ;
                _animation.CrossFade ( jumpPoseAnimation.name ) ;
            }
        }
        else // Not jumping
        {
            if ( controller.velocity.sqrMagnitude < 0.1 )
            {
                _animation.CrossFade ( idleAnimation.name ) ;
            }
            else // Moving
            {
                if ( _characterState == CharacterState.Running )
                {
                    _animation [ runAnimation.name ].speed = Mathf.Clamp ( controller.velocity.magnitude, 0.0, runMaxAnimationSpeed ) ;
                    _animation.CrossFade ( runAnimation.name ) ;
                }
                else if ( _characterState == CharacterState.Trotting )
                {
                    _animation [ walkAnimation.name ].speed = Mathf.Clamp ( controller.velocity.magnitude, 0.0, trotMaxAnimationSpeed ) ;
                    _animation.CrossFade ( walkAnimation.name ) ;
                }
                else if ( _characterState == CharacterState.Walking )
                {
                    _animation [ walkAnimation.name ].speed = Mathf.Clamp ( controller.velocity.magnitude, 0.0, walkMaxAnimationSpeed ) ;
                    _animation.CrossFade ( walkAnimation.name ) ;
                }
            }
        }
    }
    // END ANIMATION HANDLING BLOCK


    // Adjust character rotation based on movement direction.
    if ( IsGrounded ( ) )
    {
        transform.rotation = Quaternion.LookRotation ( moveDirection ) ;
    }
    else // In air
    {
        var xzMove = movement ;
        xzMove.y   = 0 ; // Ignore vertical component for in-air rotation.
        if ( xzMove.sqrMagnitude > 0.001 )
        {
            transform.rotation = Quaternion.LookRotation ( xzMove ) ;
        }
    }

    /* Check if the character has just become grounded after being in a jump state.
     * Reset jump-related variables and send a "DidLand" message. */
    if ( IsGrounded ( ) )
    {
        lastGroundedTime = Time.time ;
        inAirVelocity    = Vector3.zero ;
        if ( jumping )
        {
            jumping = false ;
            SendMessage ( "DidLand", SendMessageOptions.DontRequireReceiver ) ;
        }
    }
}

function OnControllerColliderHit ( hit : ControllerColliderHit )
{
    /* Debug.DrawRay ( hit.point, hit.normal ) ; // Uncomment to visualize collision normals. */
    // If the collision involves an upward surface, do nothing.
    if ( hit.moveDirection.y > 0.01 )
    {
        return ;
    }
}

function GetSpeed ( )
{
    return moveSpeed ;
}


function IsJumping ( )
{
    return jumping ;
}


function IsGrounded ( )
{
    // Checks if the character controller is currently colliding with the ground.
    return ( collisionFlags & CollisionFlags.CollidedBelow ) != 0 ;
}


function GetDirection ( )
{
    return moveDirection ;
}


function IsMovingBackwards ( )
{
    return movingBack ;
}


function GetLockCameraTimer ( )
{
    return lockCameraTimer ;
}


function IsMoving ( ) : boolean
{
    // Returns true if there's significant vertical or horizontal input.
    return Mathf.Abs ( Input.GetAxisRaw ( "Vertical" ) ) + Mathf.Abs ( Input.GetAxisRaw ( "Horizontal" ) ) > 0.5 ;
}


function HasJumpReachedApex ( )
{
    return jumpingReachedApex ;
}


function IsGroundedWithTimeout ( )
{
    /* Checks if the character has been grounded recently,
     * within the defined 'groundedTimeout' period. */
    return lastGroundedTime + groundedTimeout > Time.time ;
}


function Reset ( )
{
    // Resets the GameObject's tag to "Player".
    gameObject.tag = "Player" ;
}