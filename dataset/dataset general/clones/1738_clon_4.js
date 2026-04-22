@script RequireComponent(CharacterController)

import System;

@Serializable
class MovementConfiguration {
    // Animation Clips
    public var restingClip : AnimationClip;
    public var stridingClip : AnimationClip;
    public var dashingClip : AnimationClip;
    public var leapClip : AnimationClip;

    // Animation Speed Factors
    public var strideFactor : float = 0.75;
    public var trotFactor : float = 1.0;
    public var dashFactor : float = 1.0;
    public var leapAscendFactor : float = 1.15;
    public var leapDescendFactor : float = 1.0;

    // Movement Attributes
    public var basePace : float = 2.0;
    public var intermediatePace : float = 4.0;
    public var fastPace : float = 6.0;
    public var airborneControlMultiplier : float = 3.0;
    public var verticalLeapHeight : float = 0.5;
    public var gravitationalForce : float = 20.0;
    public var motionSmoothingRate : float = 10.0;
    public var rotationRate : float = 500.0;
    public var trotActivationDelay : float = 3.0;

    // Leap Timings
    public var repetitionGuard : float = 0.05;
    public var buttonPressAllowance : float = 0.15;
    public var groundedTolerance : float = 0.25;

    // Abilities
    public var canPerformJump : boolean = true;
}

class EntityMovementController extends MonoBehaviour {

    public var _configData : MovementConfiguration;

    private var _internalState = {
        animationComponent: null,
        currMotionState: MotionPhase.Resting,
        cameraLockDelay: 0.0,
        currentNavDirection: Vector3.zero,
        verticalVelocity: 0.0,
        horizontalVelocityMagnitude: 0.0,
        collisionStatus: 0, // CollisionFlags
        isLeaping: false,
        peakReached: false,
        isReversing: false,
        isInputActive: false,
        walkStartTime: 0.0,
        lastLeapButtonTime: -10.0,
        lastLeapInitiationTime: -1.0,
        leapStartAltitude: 0.0,
        airborneMomentum: Vector3.zero,
        lastGroundContactTime: 0.0,
        controlEnabled: true
    };

    enum MotionPhase {
        Resting = 0,
        Striding = 1,
        Pacing = 2,
        Dashing = 3,
        Leaping = 4
    }

    private var _animationActions;

    function initComponent() {
        if (_configData == null) {
            _configData = new MovementConfiguration();
        }

        _internalState.currentNavDirection = transform.TransformDirection(Vector3.forward);
        _internalState.animationComponent = GetComponent(Animation);

        if (!_internalState.animationComponent) {
            Debug.Log("No animation component found. Movement may appear unnatural.");
        }

        var animCfg = _configData;

        if (!animCfg.restingClip || !animCfg.stridingClip || !animCfg.dashingClip) {
            _internalState.animationComponent = null;
            Debug.Log("Missing essential animation clips. Disabling animations.");
        }
        if (!animCfg.leapClip && animCfg.canPerformJump) {
            _internalState.animationComponent = null;
            Debug.Log("Leap animation missing while jumping is enabled. Disabling animations.");
        }

        _animationActions = {};
        _animationActions[MotionPhase.Leaping] = function(ctrl : CharacterController) {
            if (!_internalState.peakReached) {
                _internalState.animationComponent[animCfg.leapClip.name].speed = animCfg.leapAscendFactor;
                _internalState.animationComponent[animCfg.leapClip.name].wrapMode = WrapMode.ClampForever;
                _internalState.animationComponent.CrossFade(animCfg.leapClip.name);
            } else {
                _internalState.animationComponent[animCfg.leapClip.name].speed = -animCfg.leapDescendFactor;
                _internalState.animationComponent[animCfg.leapClip.name].wrapMode = WrapMode.ClampForever;
                _internalState.animationComponent.CrossFade(animCfg.leapClip.name);
            }
        };
        _animationActions[MotionPhase.Resting] = function(ctrl : CharacterController) {
            _internalState.animationComponent.CrossFade(animCfg.restingClip.name);
        };
        _animationActions[MotionPhase.Dashing] = function(ctrl : CharacterController) {
            _internalState.animationComponent[animCfg.dashingClip.name].speed = Mathf.Clamp(ctrl.velocity.magnitude, 0.0, animCfg.dashFactor);
            _internalState.animationComponent.CrossFade(animCfg.dashingClip.name);
        };
        _animationActions[MotionPhase.Pacing] = function(ctrl : CharacterController) {
            _internalState.animationComponent[animCfg.stridingClip.name].speed = Mathf.Clamp(ctrl.velocity.magnitude, 0.0, animCfg.trotFactor);
            _internalState.animationComponent.CrossFade(animCfg.stridingClip.name);
        };
        _animationActions[MotionPhase.Striding] = function(ctrl : CharacterController) {
            _internalState.animationComponent[animCfg.stridingClip.name].speed = Mathf.Clamp(ctrl.velocity.magnitude, 0.0, animCfg.strideFactor);
            _internalState.animationComponent.CrossFade(animCfg.stridingClip.name);
        };
    }

    function refreshMovementVector() {
        var mainCamera = Camera.main.transform;
        var onGround = this.isOnSolidGround();
        var cfg = _configData;

        var forwardAxis = mainCamera.TransformDirection(Vector3.forward);
        forwardAxis.y = 0;
        forwardAxis = forwardAxis.normalized;

        var rightAxis = Vector3(forwardAxis.z, 0, -forwardAxis.x);

        var vertInput = Input.GetAxisRaw("Vertical");
        var horizInput = Input.GetAxisRaw("Horizontal");

        _internalState.isReversing = (vertInput < -0.2);

        var wasMovingLastFrame = _internalState.isInputActive;
        _internalState.isInputActive = Mathf.Abs(horizInput) > 0.1 || Mathf.Abs(vertInput) > 0.1;

        var targetHeading = horizInput * rightAxis + vertInput * forwardAxis;

        if (onGround) {
            _internalState.cameraLockDelay += Time.deltaTime;
            if (_internalState.isInputActive != wasMovingLastFrame) {
                _internalState.cameraLockDelay = 0.0;
            }

            if (targetHeading != Vector3.zero) {
                if (_internalState.horizontalVelocityMagnitude < cfg.basePace * 0.9 && onGround) {
                    _internalState.currentNavDirection = targetHeading.normalized;
                } else {
                    _internalState.currentNavDirection = Vector3.RotateTowards(_internalState.currentNavDirection, targetHeading, cfg.rotationRate * Mathf.Deg2Rad * Time.deltaTime, 1000);
                    _internalState.currentNavDirection = _internalState.currentNavDirection.normalized;
                }
            }

            var smoothValue = cfg.motionSmoothingRate * Time.deltaTime;
            var desiredPace = Mathf.Min(targetHeading.magnitude, 1.0);

            _internalState.currMotionState = MotionPhase.Resting;

            if (_internalState.isInputActive) {
                if (Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift)) {
                    desiredPace *= cfg.fastPace;
                    _internalState.currMotionState = MotionPhase.Dashing;
                } else if (Time.time - cfg.trotActivationDelay > _internalState.walkStartTime) {
                    desiredPace *= cfg.intermediatePace;
                    _internalState.currMotionState = MotionPhase.Pacing;
                } else {
                    desiredPace *= cfg.basePace;
                    _internalState.currMotionState = MotionPhase.Striding;
                }
            }

            _internalState.horizontalVelocityMagnitude = Mathf.Lerp(_internalState.horizontalVelocityMagnitude, desiredPace, smoothValue);

            if (_internalState.horizontalVelocityMagnitude < cfg.basePace * 0.3) {
                _internalState.walkStartTime = Time.time;
            }
        } else {
            if (_internalState.isLeaping) {
                _internalState.cameraLockDelay = 0.0;
            }

            if (_internalState.isInputActive) {
                _internalState.airborneMomentum += targetHeading.normalized * Time.deltaTime * cfg.airborneControlMultiplier;
            }
        }
    }

    function triggerLeapAction() {
        var cfg = _configData;
        if (_internalState.lastLeapInitiationTime + cfg.repetitionGuard > Time.time) {
            return;
        }

        if (this.isOnSolidGround()) {
            if (cfg.canPerformJump && Time.time < _internalState.lastLeapButtonTime + cfg.buttonPressAllowance) {
                _internalState.verticalVelocity = this.determineLeapInitialVelocity(cfg.verticalLeapHeight);
                SendMessage("OnLeapInitiated", SendMessageOptions.DontRequireReceiver);
            }
        }
    }

    function applyGravitationalPull() {
        var cfg = _configData;
        if (_internalState.controlEnabled) {
            if (_internalState.isLeaping && !_internalState.peakReached && _internalState.verticalVelocity <= 0.0) {
                _internalState.peakReached = true;
                SendMessage("OnLeapApexReached", SendMessageOptions.DontRequireReceiver);
            }

            if (this.isOnSolidGround()) {
                _internalState.verticalVelocity = 0.0;
            } else {
                _internalState.verticalVelocity -= cfg.gravitationalForce * Time.deltaTime;
            }
        }
    }

    function determineLeapInitialVelocity(targetHeight : float) : float {
        return Mathf.Sqrt(2 * targetHeight * _configData.gravitationalForce);
    }

    public function OnLeapInitiated() {
        _internalState.isLeaping = true;
        _internalState.peakReached = false;
        _internalState.lastLeapInitiationTime = Time.time;
        _internalState.leapStartAltitude = transform.position.y;
        _internalState.lastLeapButtonTime = -10;
        _internalState.currMotionState = MotionPhase.Leaping;
    }

    function mainCycle() {
        if (!_internalState.controlEnabled) {
            Input.ResetInputAxes();
        }

        if (Input.GetButtonDown("Jump")) {
            _internalState.lastLeapButtonTime = Time.time;
        }

        this.refreshMovementVector();
        this.applyGravitationalPull();
        this.triggerLeapAction();

        var displacement = _internalState.currentNavDirection * _internalState.horizontalVelocityMagnitude + Vector3(0, _internalState.verticalVelocity, 0) + _internalState.airborneMomentum;
        displacement *= Time.deltaTime;

        var charController : CharacterController = GetComponent(CharacterController);
        _internalState.collisionStatus = charController.Move(displacement);

        if (_internalState.animationComponent) {
            if (_internalState.currMotionState == MotionPhase.Leaping) {
                _animationActions[MotionPhase.Leaping](charController);
            } else {
                if (charController.velocity.sqrMagnitude < 0.1) {
                    _animationActions[MotionPhase.Resting](charController);
                } else {
                    _animationActions[_internalState.currMotionState](charController);
                }
            }
        }

        if (this.isOnSolidGround()) {
            transform.rotation = Quaternion.LookRotation(_internalState.currentNavDirection);
        } else {
            var planarDisplacement = displacement;
            planarDisplacement.y = 0;
            if (planarDisplacement.sqrMagnitude > 0.001) {
                transform.rotation = Quaternion.LookRotation(planarDisplacement);
            }
        }

        if (this.isOnSolidGround()) {
            _internalState.lastGroundContactTime = Time.time;
            _internalState.airborneMomentum = Vector3.zero;
            if (_internalState.isLeaping) {
                _internalState.isLeaping = false;
                SendMessage("OnLanding", SendMessageOptions.DontRequireReceiver);
            }
        }
    }

    function handleCollisionResponse(hit : ControllerColliderHit) {
        if (hit.moveDirection.y > 0.01)
            return;
    }

    function getCurrentPace() : float {
        return _internalState.horizontalVelocityMagnitude;
    }

    function isMidLeap() : boolean {
        return _internalState.isLeaping;
    }

    function isOnSolidGround() : boolean {
        return (_internalState.collisionStatus & CollisionFlags.CollidedBelow) != 0;
    }

    function getHeading() : Vector3 {
        return _internalState.currentNavDirection;
    }

    function isMovingBackward() : boolean {
        return _internalState.isReversing;
    }

    function getCameraFreezeDuration() : float {
        return _internalState.cameraLockDelay;
    }

    function isActivelyMoving() : boolean {
        return Mathf.Abs(Input.GetAxisRaw("Vertical")) + Mathf.Abs(Input.GetAxisRaw("Horizontal")) > 0.5;
    }

    function hasLeapCulminated() : boolean {
        return _internalState.peakReached;
    }

    function isGroundedRecently() : boolean {
        return _internalState.lastGroundContactTime + _configData.groundedTolerance > Time.time;
    }

    function resetState() {
        gameObject.tag = "Player";
    }

    function Awake() { this.initComponent(); }
    function Update() { this.mainCycle(); }
    function OnControllerColliderHit(hit : ControllerColliderHit) { this.handleCollisionResponse(hit); }

    public function OnLeapApexReached() { }
    public function OnLanding() { }
}