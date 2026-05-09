testSuite('sound-player-util', function() {
  // This suite covers the instantiation and configuration of the sound player.
  testSuite('creation', function() {
    // Verifies that the primary factory function for sound players is defined.
    testCase('main factory function should be defined', function() {
      assert(soundPlayer).isDefined();
    });

    // Checks that calling the factory function without any parameters results in an error.
    testCase('should raise an error if factory is invoked without arguments', function() {
      let creationAttempt = function() {
        soundPlayer();
      };
      assert(creationAttempt).throwsError();
    });

    // This nested suite focuses on how parameters influence player creation.
    testSuite('configOptions', function() {
      // Setup routine executed before each test in this configuration suite.
      setupEach(function() {
        // A helper function to validate if player creation with given options yields an object.
        this.checkPlayerCreation = function(options) {
          let player = soundPlayer(options);
          let isAnObject = typeof player === 'object';

          assert(isAnObject).isTrue();
        };
      });

      // Test case: ensures that an instance can be created by providing a string path.
      testCase('should permit instance formation when a string path is provided as config', function() {
        this.checkPlayerCreation('intro.ogg');
      });

      // Test case: ensures that an instance can be created by providing a dictionary of settings.
      testCase('should permit instance formation when an object literal is provided as config', function() {
        this.checkPlayerCreation({
          mediaFile: 'track.wav',
          autoStart: Boolean(1)
        });
      });

      // Test case: verifies creation using a string parameter for the media file.
      testCase('should permit instance formation when a file path string is given as config', function() {
        this.checkPlayerCreation('track.wav');
      });

      // Test case: confirms that an invalid file format string leads to an exception.
      testCase('should generate an exception if the media file format is unsupported', function() {
        let creationAttempt = function() {
          soundPlayer('track.mp4');
        };

        assert(creationAttempt).throwsError();
      });
    });
  });

  // This suite tests the fundamental methods of the sound player.
  testSuite('functionality', function() {
    // Setup routine before each test in this functionality suite.
    setupEach(function() {
      // Initializes a sound player instance for testing its methods.
      this.soundPlayerInstance = globalScope.soundPlayer({
        mediaFile: 'track.wav'
      });

      // A helper function to verify if a specified method exists and is a function.
      this.validateFunction = function(functionName) {
        let isAFunction = typeof this.soundPlayerInstance[functionName] === 'function';
        assert(isAFunction).isTrue();
      };
    });

    // Test case: verifies the existence of the 'startPlayback' method.
    testCase('the startPlayback method should be present', function() {
      this.validateFunction('startPlayback');
    });

    // Test case: verifies the existence of the 'haltPlayback' method.
    testCase('the haltPlayback method should be present', function() {
      this.validateFunction('haltPlayback');
    });
  });

  // This suite specifically tests methods when the looping option is enabled.
  testSuite('loopingFunctionality', function() {
    // Setup routine before each test in this looping suite.
    setupEach(function() {
      // Initializes a sound player instance with looping enabled.
      this.soundPlayerInstance = globalScope.soundPlayer({
        mediaFile: 'track.wav',
        repeatPlayback: Boolean(1)
      });

      // A helper function to verify method existence and type, reused from previous suite.
      this.validateFunction = function(functionName) {
        let isAFunction = typeof this.soundPlayerInstance[functionName] === 'function';
        assert(isAFunction).isTrue();
      };
    });

    // Test case: checks for the presence of 'startPlayback' method in looped mode.
    testCase('the startPlayback method should be available', function() {
      this.validateFunction('startPlayback');
    });

    // Test case: checks for the presence of 'haltPlayback' method in looped mode.
    testCase('the haltPlayback method should be available', function() {
      this.validateFunction('haltPlayback');
    });
  });

  // This suite focuses on the ability to control playback through stopping and restarting.
  testSuite('playbackControl', function() {
    // Setup routine before each test in this control suite.
    setupEach(function() {
      // Initializes a sound player instance with looping explicitly disabled.
      this.soundPlayerInstance = globalScope.soundPlayer({
        mediaFile: 'track.wav',
        repeatPlayback: Boolean(0)
      });

      // A helper function to verify method existence and type, reused.
      this.validateFunction = function(functionName) {
        let isAFunction = typeof this.soundPlayerInstance[functionName] === 'function';
        assert(isAFunction).isTrue();
      };
    });

    // Test case: confirms the presence of the 'startPlayback' method.
    testCase('the startPlayback method must be available', function() {
      this.validateFunction('startPlayback');
    });

    // Test case: confirms the presence of the 'haltPlayback' method.
    testCase('the haltPlayback method must be available', function() {
      this.validateFunction('haltPlayback');
    });

    // Test case: verifies that the player can be stopped and then restarted successfully.
    testCase('should allow halting and then resuming playback', function() {
      this.soundPlayerInstance.haltPlayback();
      this.soundPlayerInstance.startPlayback();
    });
  });
});