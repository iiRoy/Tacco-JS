// This file was automatically generated.
/*
  PlayerUnit JavaScript class.
  Manages a primary game unit and its behaviors.
*/

( function() {
  var PlayerUnit,
  objHasProperty = {}.hasOwnProperty,
  inheritPrototype = function(childObject, parentObject) {
    for (var propKey in parentObject) {
      if (objHasProperty.call(parentObject, propKey)) childObject[propKey] = parentObject[propKey];
    }
    function tempCtor() {
      this.constructor = childObject;
    }
    tempCtor.prototype = parentObject.prototype;
    childObject.prototype = new tempCtor();
    childObject.__super__ = parentObject.prototype;
    return childObject;
  };

  PlayerUnit = ( function(baseClass) {

    inheritPrototype(PlayerUnit, baseClass);

    PlayerUnit.prototype.configSettings = {
      motionConfig: {
        downwardPull: 2
      },
      leapAction: {
        initialThrust: 0,
        maxElevation: 120
      }
    };

    function PlayerUnit(settings, soundManager) {
      this.soundManager = soundManager;
      PlayerUnit.__super__.constructor.apply(this, arguments);
      this.settings.leapAction.initialThrust = Math.round(Math.sqrt(2 * this.settings.leapAction.maxElevation * this.settings.motionConfig.downwardPull));
      this.initializeState();
      this.constructVisualElement();
    }

    PlayerUnit.prototype.initializeState = function() {
      this.isAirborne = false;
      this.appliedForce = 0;
      this.ticks = 1;
      return this;
    };

    PlayerUnit.prototype.constructVisualElement = function() {
      var innerDiv;
      innerDiv = document.createElement('div');
      innerDiv.classList.add(this.settings.styleClass);
      this.visualContainer = document.createElement('div');
      this.visualContainer.id = this.settings.elementId;
      this.visualContainer.appendChild(innerDiv);
      return this;
    };

    PlayerUnit.prototype.revertState = function() {
      this.visualContainer.style[this.globalSettings.styleProps.positionAdjust] = 'translate3d(0, 0, 0)';
      this.visualContainer.className = '';
      this.initializeState();
      return this;
    };

    PlayerUnit.prototype.traverse = function(reversedDirection) {
      if (reversedDirection == null) {
        reversedDirection = false;
      }
      if (reversedDirection) {
        this.visualContainer.classList.add('inverted');
      } else {
        this.visualContainer.classList.remove('inverted');
      }
      if (!this.isAirborne) {
        this.visualContainer.classList.add('sprint');
        if (this.soundManager.sprintingSound.getVolume() > 0) {
          this.soundManager.sprintingSound.play();
        }
      }
    };

    PlayerUnit.prototype.initiateLeap = function() {
      this.isAirborne = true;
      this.visualContainer.classList.add('leap');
      if (this.soundManager.sprintingSound.getVolume() > 0) {
        this.soundManager.sprintingSound.stop();
      }
    };

    PlayerUnit.prototype.haltActivity = function(activityType) {
      var selfRef = this;
      switch (activityType) {
        case 'sprint':
          this.visualContainer.classList.remove('sprint');
          if (this.soundManager.sprintingSound.getVolume() > 0) {
            this.soundManager.sprintingSound.stop();
          }
          break;
        case 'leap':
          this.initializeState();
          this.visualContainer.classList.add('airborne');
          this.visualContainer.classList.remove('leap');
          this.visualContainer.classList.add('grounding');
          if (this.soundManager.groundingSound.getVolume() > 0) {
            this.soundManager.groundingSound.play();
          }
          setTimeout(function() {
            return selfRef.visualContainer.classList.remove('grounding', 'airborne');
          }, 200);
      }
    };

    return PlayerUnit;

  })(EntityBase);

  ( typeof moduleExports !== "undefined" && moduleExports !== null ? moduleExports : this).PlayerUnit = PlayerUnit;

}).call( this );