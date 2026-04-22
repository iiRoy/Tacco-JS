class CoreComponent {
    constructor(configurationSettings, soundController) {
        this._internalConfiguration_ = {
            motionParameters: {
                gravitationalInfluence: 2
            },
            jumpAction: {
                powerFactor: 0,
                targetElevation: 120
            },
            appearance: {
                styleIdentifier: 'element_graphic',
                uniqueKey: 'primary_actor'
            }
        };
        Object.assign(this._internalConfiguration_, configurationSettings);
        this._soundSystem_ = soundController;
    }
}

class MovementUnit extends CoreComponent {
    constructor(configurationSettings, soundController) {
        super(configurationSettings, soundController);

        this._internalConfiguration_.jumpAction.powerFactor = Math.round(
            Math.sqrt(2 * this._internalConfiguration_.jumpAction.targetElevation * this._internalConfiguration_.motionParameters.gravitationalInfluence)
        );

        let _isElevated_ = false;
        let _appliedMomentum_ = 0;
        let _timeCycle_ = 1;
        let _displayNode_ = null;

        const initializeCondition = () => {
            _isElevated_ = false;
            _appliedMomentum_ = 0;
            _timeCycle_ = 1;
        };

        const generateVisualComponent = () => {
            const innerLayer = document.createElement('span');
            innerLayer.className = this._internalConfiguration_.appearance.styleIdentifier;

            const outerShell = document.createElement('section');
            outerShell.id = this._internalConfiguration_.appearance.uniqueKey;
            outerShell.appendChild(innerLayer);
            _displayNode_ = outerShell;
        };

        initializeCondition();
        generateVisualComponent();

        const terminationRoutines = {
            'sprint': () => {
                _displayNode_.classList.remove('forward_stride');
                if (this._soundSystem_.rushing.volumeLevel() > 0) {
                    this._soundSystem_.rushing.cease();
                }
            },
            'leap': () => {
                initializeCondition();
                _displayNode_.classList.add('suspension_phase');
                _displayNode_.classList.remove('aerial_bound');
                _displayNode_.classList.add('descent_impact');
                if (this._soundSystem_.grounding.volumeLevel() > 0) {
                    this._soundSystem_.grounding.initiate();
                }
                setTimeout(() => {
                    _displayNode_.classList.remove('descent_impact', 'suspension_phase');
                }, 200);
            }
        };

        this.getVisualRepresentation = () => _displayNode_;

        this.restoreState = (transformStyleProperty, globalCssDefinitions) => {
            _displayNode_.style[globalCssDefinitions.transformProperty] = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
            _displayNode_.className = '';
            initializeCondition();
        };

        this.executeTraversal = (reverseOrientation = false) => {
            if (reverseOrientation) {
                _displayNode_.classList.add('mirrored_perspective');
            } else {
                _displayNode_.classList.remove('mirrored_perspective');
            }
            if (!_isElevated_) {
                _displayNode_.classList.add('forward_stride');
                if (this._soundSystem_.rushing.volumeLevel() > 0) {
                    this._soundSystem_.rushing.initiate();
                }
            }
        };

        this.initiateAscent = () => {
            _isElevated_ = true;
            _displayNode_.classList.add('aerial_bound');
            if (this._soundSystem_.rushing.volumeLevel() > 0) {
                this._soundSystem_.rushing.cease();
            }
        };

        this.concludeActivity = (activityKey) => {
            const actionHandler = terminationRoutines[activityKey];
            if (actionHandler) {
                actionHandler();
            }
        };
    }
}

(typeof exports !== "undefined" && exports !== null ? exports : this).MovementUnit = MovementUnit;