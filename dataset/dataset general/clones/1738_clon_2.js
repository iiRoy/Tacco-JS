// This script anticipates a module for entity control on the same object.
/* @componentRequirement(EntityController) */

var calmMotionClip;      /* Visual sequence for standing still */
var strollMotionClip;    /* Visual sequence for gentle movement */
var sprintMotionClip;    /* Visual sequence for rapid movement */
var leapPostureMotionClip; /* Visual sequence for airborne pose */

var strollMaxMotionRate = 0.75;  /* Maximum playback speed for walking animation */
var jogMaxMotionRate    = 1.0;   /* Maximum playback speed for jogging animation */
var sprintMaxMotionRate = 1.0;   /* Maximum playback speed for running animation */
var leapMotionRate      = 1.15;  /* Playback speed for jump animation */
var descentMotionRate   = 1.0;   /* Playback speed for landing animation */

var _motionHandler; /* Internal reference to the animation system */

var EntityManeuver = { /* Defines various states for the character's locomotion */
  Still:     0, /* No movement */
  Strolling: 1, /* Slow movement */
  Jogging:   2, /* Medium movement */
  Sprinting: 3, /* Fast movement */
  Leaping:   4, /* Airborne state */
};

var _entityManeuverStatus; /* Current locomotion state of the entity */

var strollVelocity = 2.0; /* Speed during walking */
var jogVelocity    = 4.0; /* Speed after a delay of walking (jogging) */
var sprintVelocity = 6.0; /* Speed when activating sprint */

var aerialManeuverBoost = 3.0; /* Acceleration applied for in-air control */

var leapAltitude = 0.5; /* Vertical distance achieved when initiating a quick jump */

var downwardForce = 20.0; /* Gravitational force affecting the character */
var velocityAttenuation = 10.0; /* Factor for smoothing velocity changes */
var turnRate      = 500.0; /* Degrees per second for rotational adjustments */
var jogDelaySeconds = 3.0; /* Time before transitioning from walk to jog */

var allowLeaping = true; /* Flag indicating if the character can perform a jump */

var leapCooldownDuration = 0.05; /* Minimum time between consecutive jumps */
var leapActivationTimeout = 0.15; /* Window for jump button press before landing */
var contactTimeout        = 0.25; /* Duration after leaving ground before considered airborne */

var cameraHoldDuration = 0.0; /* Timer to prevent immediate camera follow, reducing jitter */

var travelHeading = Vector3.origin; /* Current horizontal movement direction */
var verticalVelocity = 0.0; /* Current vertical speed component */
var travelVelocity   = 0.0; /* Current horizontal movement speed */

var impactIndicators; /* Flags received from the collision system */

var isLeaping      = false; /* Is the character currently in a jump state? */
var leapPeakAttained = false; /* Has the character reached the highest point of their jump? */

var retreating = false; /* Is the character moving or looking backward? */
var isUnderway = false; /* Is the user providing any movement input? */
var strollStartTime = 0.0; /* Timestamp when walking began (for jog transition) */
var lastLeapButtonPressTime = -10.0; /* Last moment the jump button was pressed */
var lastLeapMoment          = -1.0; /* Last moment a jump was successfully initiated */

var leapOriginAltitude = 0.0; /* Vertical position from where the jump started */

var aerialVelocityComponent = Vector3.origin; /* Velocity accumulated while airborne */

var lastContactTime = 0.0; /* Last moment the character was in contact with the ground */

var isPilotable = true; /* Determines if the player can control the character */

function InitializeComponent()
{
  travelHeading = transform.OrientDirection(Vector3.front);

  _motionHandler = GetComponent(MotionSystem);
  if(!_motionHandler)
  {
    Console.Message("The entity intended for control lacks motion sequences. Its movement may appear unnatural.");
  }

  /* Verification of necessary motion clips */
  if(!calmMotionClip)
  {
    _motionHandler = null;
    Console.Message("No calm motion sequence detected. Disabling all character motions.");
  }
  if(!strollMotionClip)
  {
    _motionHandler = null;
    Console.Message("No stroll motion sequence detected. Disabling all character motions.");
  }
  if(!sprintMotionClip)
  {
    _motionHandler = null;
    Console.Message("No sprint motion sequence detected. Disabling all character motions.");
  }
  if(!leapPostureMotionClip && allowLeaping)
  {
    _motionHandler = null;
    Console.Message("No leap motion sequence detected, yet leaping is permitted. Disabling all character motions.");
  }
}

function AdjustSmoothMotionHeading()
{
  var viewpointTransform = Camera.main.transform;
  var onSurface = CheckSurfaceContact();

  /* Camera's forward vector, flattened to x-z plane */
  var frontward = viewpointTransform.OrientDirection(Vector3.front);
  frontward.y = 0;
  frontward = frontward.normalized;

  /* Camera's right vector, orthogonal to frontward */
  var sideward = Vector3(frontward.z, 0, -frontward.x);

  var verticalInput = InputHandler.GetRawAxis("Vertical");
  var horizontalInput = InputHandler.GetRawAxis("Horizontal");

  if (verticalInput < -0.2)
  {
    retreating = true;
  }
  else
  {
    retreating = false;
  }

  var wasUnderway = isUnderway;
  isUnderway = MathOp.Absolute(horizontalInput) > 0.1 || MathOp.Absolute(verticalInput) > 0.1;

  /* Target direction based on input */
  var desiredHeading = horizontalInput * sideward + verticalInput * frontward;

  if (onSurface)
  {
    /* Ground-based control logic */
    cameraHoldDuration += GameTime.deltaStep;
    if (isUnderway != wasUnderway)
    {
      cameraHoldDuration = 0.0;
    }

    /* Update movement direction only if there's input */
    if (desiredHeading != Vector3.origin)
    {
      /* If moving very slowly, immediately align with target direction */
      if (travelVelocity < strollVelocity * 0.9 && onSurface)
      {
        travelHeading = desiredHeading.normalized;
      }
      /* Otherwise, smoothly rotate towards the target direction */
      else
      {
        travelHeading = Vector3.RotateTowards(travelHeading, desiredHeading, turnRate * MathOp.DegreesToRadians * GameTime.deltaStep, 1000);

        travelHeading = travelHeading.normalized;
      }
    }

    var currentAttenuation = velocityAttenuation * GameTime.deltaStep; /* Calculate smoothing factor */

    /* Determine target speed based on input magnitude */
    var desiredVelocity = MathOp.Constrain(desiredHeading.magnitude, 0.0, 1.0);

    _entityManeuverStatus = EntityManeuver.Still; /* Default to idle state */

    /* Adjust target speed based on movement mode */
    if (InputHandler.IsKeyPressed(KeyCode.LeftShift) || InputHandler.IsKeyPressed(KeyCode.RightShift))
    {
      desiredVelocity *= sprintVelocity;
      _entityManeuverStatus = EntityManeuver.Sprinting;
    }
    else if (GameTime.currentTime - jogDelaySeconds > strollStartTime)
    {
      desiredVelocity *= jogVelocity;
      _entityManeuverStatus = EntityManeuver.Jogging;
    }
    else
    {
      desiredVelocity *= strollVelocity;
      _entityManeuverStatus = EntityManeuver.Strolling;
    }

    travelVelocity = MathOp.LinearInterpolate(travelVelocity, desiredVelocity, currentAttenuation); /* Smoothly update current speed */

    /* Reset walk timer if speed drops significantly */
    if (travelVelocity < strollVelocity * 0.3)
    {
      strollStartTime = GameTime.currentTime;
    }
  }
  /* Airborne control logic */
  else
  {
    if (isLeaping)
    {
      cameraHoldDuration = 0.0; /* Reset camera lock if jumping */
    }

    if (isUnderway)
    {
      aerialVelocityComponent += desiredHeading.normalized * GameTime.deltaStep * aerialManeuverBoost; /* Apply control acceleration in air */
    }
  }
}

function ExecuteLeaping()
{
  if (lastLeapMoment + leapCooldownDuration > GameTime.currentTime)
  {
    return; /* Prevent jumping too frequently */
  }

  if (CheckSurfaceContact())
  {
    /* Initiate jump if conditions met */
    if (allowLeaping && GameTime.currentTime < lastLeapButtonPressTime + leapActivationTimeout)
    {
      verticalVelocity = ComputeLeapVerticalVelocity(leapAltitude);
      DispatchNotification("OnLeapInitiated", NotificationOptions.NoReceiverRequired); /* Notify other components of jump */
    }
  }
}

function ApplyDownwardForce()
{
  if (isPilotable) /* Only apply gravity if the character is controllable */
  {
    var jumpButton = InputHandler.IsButtonPressed("Jump");

    /* Check if jump peak has been reached */
    if (isLeaping && !leapPeakAttained && verticalVelocity <= 0.0)
    {
      leapPeakAttained = true;
      DispatchNotification("OnLeapPeakAttained", NotificationOptions.NoReceiverRequired); /* Notify when jump apex is reached */
    }

    if (CheckSurfaceContact())
    {
      verticalVelocity = 0.0; /* Reset vertical velocity if grounded */
    }
    else
    {
      verticalVelocity -= downwardForce * GameTime.deltaStep; /* Apply gravity */
    }
  }
}

function ComputeLeapVerticalVelocity(targetJumpHeight)
{
  /* Calculates the initial upward speed required to reach a specific height */
  return MathOp.Sqrt(2 * targetJumpHeight * downwardForce);
}

function OnLeapInitiated()
{
  isLeaping = true; /* Set jumping flag */
  leapPeakAttained = false; /* Reset apex flag */
  lastLeapMoment = GameTime.currentTime; /* Record jump time */
  leapOriginAltitude = transform.position.y; /* Record starting height */
  lastLeapButtonPressTime = -10; /* Reset jump button timer to prevent re-trigger */

  _entityManeuverStatus = EntityManeuver.Leaping; /* Update character state */
}

function FrameUpdate()
{
  if (!isPilotable)
  {
    InputHandler.ClearAxes(); /* Clear all input if character is not controllable */
  }

  if (InputHandler.IsButtonDown("Jump"))
  {
    lastLeapButtonPressTime = GameTime.currentTime; /* Record jump button press */
  }

  AdjustSmoothMotionHeading(); /* Update movement and direction */

  ApplyDownwardForce(); /* Apply gravitational effects */

  ExecuteLeaping(); /* Handle jump initiation */

  /* Calculate final displacement */
  var displacement = travelHeading * travelVelocity + Vector3(0, verticalVelocity, 0) + aerialVelocityComponent;
  displacement *= GameTime.deltaStep;

  var entityHandler = GetComponent(EntityController); /* Retrieve character controller */
  impactIndicators = entityHandler.Translate(displacement); /* Move the character and get collision info */

  /* Animation handling section */
  if(_motionHandler)
  {
    if(_entityManeuverStatus == EntityManeuver.Leaping)
    {
      if(!leapPeakAttained)
      {
        _motionHandler[leapPostureMotionClip.name].speed = leapMotionRate;
        _motionHandler[leapPostureMotionClip.name].wrapMode = WrapBehavior.HoldLastFrame;
        _motionHandler.BlendMotion(leapPostureMotionClip.name);
      }
      else
      {
        _motionHandler[leapPostureMotionClip.name].speed = -descentMotionRate; /* Reverse animation for landing */
        _motionHandler[leapPostureMotionClip.name].wrapMode = WrapBehavior.HoldLastFrame;
        _motionHandler.BlendMotion(leapPostureMotionClip.name);
      }
    }
    else
    {
      if(entityHandler.velocity.magnitudeSquared < 0.1)
      {
        _motionHandler.BlendMotion(calmMotionClip.name); /* Play idle animation if almost stationary */
      }
      else
      {
        if(_entityManeuverStatus == EntityManeuver.Sprinting)
        {
          _motionHandler[sprintMotionClip.name].speed = MathOp.Constrain(entityHandler.velocity.magnitude, 0.0, sprintMaxMotionRate);
          _motionHandler.BlendMotion(sprintMotionClip.name);
        }
        else if(_entityManeuverStatus == EntityManeuver.Jogging)
        {
          _motionHandler[strollMotionClip.name].speed = MathOp.Constrain(entityHandler.velocity.magnitude, 0.0, jogMaxMotionRate);
          _motionHandler.BlendMotion(strollMotionClip.name);
        }
        else if(_entityManeuverStatus == EntityManeuver.Strolling)
        {
          _motionHandler[strollMotionClip.name].speed = MathOp.Constrain(entityHandler.velocity.magnitude, 0.0, strollMaxMotionRate);
          _motionHandler.BlendMotion(strollMotionClip.name);
        }
      }
    }
  }
  /* End of animation handling */

  /* Adjust character orientation */
  if (CheckSurfaceContact())
  {
    transform.orientation = Quaternion.FromLookDirection(travelHeading); /* Orient based on movement direction */
  }
  else
  {
    var horizontalDisplacement = displacement;
    horizontalDisplacement.y = 0;
    if (horizontalDisplacement.magnitudeSquared > 0.001)
    {
      transform.orientation = Quaternion.FromLookDirection(horizontalDisplacement); /* Orient based on horizontal air movement */
    }
  }

  /* Handle landing from a jump */
  if (CheckSurfaceContact())
  {
    lastContactTime = GameTime.currentTime; /* Update last grounded time */
    aerialVelocityComponent = Vector3.origin; /* Reset air velocity */
    if (isLeaping)
    {
      isLeaping = false; /* End jump state */
      DispatchNotification("OnLand", NotificationOptions.NoReceiverRequired); /* Notify of landing */
    }
  }
}

function OnModuleCollision(collisionInfo)
{
  /* Ignore collisions from below if moving upwards */
  if (collisionInfo.travelDirection.y > 0.01)
  {
    return;
  }
}

function RetrieveVelocity()
{
  return travelVelocity; /* Returns the current horizontal movement speed */
}

function IsCurrentlyLeaping()
{
  return isLeaping; /* Checks if the character is in a jump state */
}

function CheckSurfaceContact()
{
  return (impactIndicators & ImpactFlags.HitBelow) != 0; /* Determines if the character is touching the ground */
}

function RetrieveHeading()
{
  return travelHeading; /* Returns the current movement direction vector */
}

function IsRetreating()
{
  return retreating; /* Checks if the character is moving backward */
}

function RetrieveCameraHoldDuration()
{
  return cameraHoldDuration; /* Provides the current camera lock timer value */
}

function IsUnderway()
{
  return (MathOp.Absolute(InputHandler.GetRawAxis("Vertical")) + MathOp.Absolute(InputHandler.GetRawAxis("Horizontal")) > 0.5); /* Checks if there's significant input for movement */
}

function HasLeapReachedPeak()
{
  return leapPeakAttained; /* Checks if the jump's apex has been reached */
}

function CheckSurfaceContactWithTimeout()
{
  return lastContactTime + contactTimeout > GameTime.currentTime; /* Checks if recently grounded, considering a small timeout */
}

function ReinitializeState()
{
  gameObject.tagIdentifier = "Avatar"; /* Resets the game object's tag to "Avatar" */
}