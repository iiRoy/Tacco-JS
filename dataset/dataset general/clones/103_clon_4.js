const checkRegistry = {
    totalEvaluations: 0,
    successfulEvaluations: 0,
    failedEvaluations: 0,
    evaluationRecords: []
};

function verifyExistence(targetItem, descriptionText) {
    checkRegistry.totalEvaluations++;
    if (typeof targetItem !== 'undefined') {
        checkRegistry.successfulEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'PASS', description: descriptionText });
    } else {
        checkRegistry.failedEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'FAIL', description: descriptionText, issue: 'Item not found' });
        throw new Error('Verification failed: ' + descriptionText);
    }
}

function verifyException(operationToExecute, descriptionText) {
    checkRegistry.totalEvaluations++;
    let encounteredError = false;
    try {
        operationToExecute();
    } catch (e) {
        encounteredError = true;
    }
    if (encounteredError) {
        checkRegistry.successfulEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'PASS', description: descriptionText });
    } else {
        checkRegistry.failedEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'FAIL', description: descriptionText, issue: 'Expected error, but none occurred' });
        throw new Error('Verification failed: ' + descriptionText);
    }
}

function verifyCondition(booleanValue, descriptionText) {
    checkRegistry.totalEvaluations++;
    if (!!booleanValue) {
        checkRegistry.successfulEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'PASS', description: descriptionText });
    } else {
        checkRegistry.failedEvaluations++;
        checkRegistry.evaluationRecords.push({ outcome: 'FAIL', description: descriptionText, issue: 'Condition was not met' });
        throw new Error('Verification failed: ' + descriptionText);
    }
}

function performTestSequence(sequenceName, sequenceCallback) {
    try {
        sequenceCallback();
    } catch (e) {
        // Error already logged by individual verification functions.
    }
}

(function() {
    performTestSequence('Core Module Checks', () => {
        verifyExistence(window.soundSynth, 'Top-level sound synthesizer module must be present');
    });

    performTestSequence('Module Instantiation Failure Tests', () => {
        const invocationWithoutParameters = () => {
            window.soundSynth();
        };
        verifyException(invocationWithoutParameters, 'Invoking module without configuration should raise an error');
    });

    const createModuleContext = () => {
        let currentModuleCreator;

        currentModuleCreator = (inputConfiguration) => {
            const createdModule = window.soundSynth(inputConfiguration);
            const isAnObjectResult = typeof createdModule === 'object';
            verifyCondition(isAnObjectResult, 'Created module must be an object type');
        };

        return {
            checkModuleCreation: currentModuleCreator
        };
    };

    const moduleCreationTests = createModuleContext();

    performTestSequence('Module Creation with String Parameter', () => {
        moduleCreationTests.checkModuleCreation('intro.mp3');
    });

    performTestSequence('Module Creation with Object Parameter', () => {
        moduleCreationTests.checkModuleCreation({
            asset: 'music.mp3',
            autoStart: true
        });
    });

    performTestSequence('Module Creation with File String Parameter (Repeat)', () => {
        moduleCreationTests.checkModuleCreation('music.mp3');
    });

    performTestSequence('Module Creation with Invalid File Format', () => {
        const invalidFormatInvocation = () => {
            window.soundSynth('music.mp4');
        };
        verifyException(invalidFormatInvocation, 'Module creation with unsupported file extension should throw an error');
    });

    const createBehaviorContext = (shouldLoop = false) => {
        let activeSoundPlayer;
        let behaviorAvailabilityChecker;

        activeSoundPlayer = window.soundSynth({
            asset: 'music.mp3',
            repeat: shouldLoop
        });

        behaviorAvailabilityChecker = (actionIdentifier) => {
            const isFunctionResult = typeof activeSoundPlayer[actionIdentifier] === 'function';
            verifyCondition(isFunctionResult, `Behavior '${actionIdentifier}' must be a callable method`);
        };

        return {
            verifyBehavior: behaviorAvailabilityChecker,
            playerEntity: activeSoundPlayer
        };
    };

    const standardBehaviorTests = createBehaviorContext();
    performTestSequence('Standard Play Behavior Existence', () => {
        standardBehaviorTests.verifyBehavior('play');
    });
    performTestSequence('Standard Stop Behavior Existence', () => {
        standardBehaviorTests.verifyBehavior('stop');
    });

    const loopingBehaviorTests = createBehaviorContext(true);
    performTestSequence('Looping Play Behavior Existence', () => {
        loopingBehaviorTests.verifyBehavior('play');
    });
    performTestSequence('Looping Stop Behavior Existence', () => {
        loopingBehaviorTests.verifyBehavior('stop');
    });

    const playbackControlTests = createBehaviorContext(false);
    performTestSequence('Playback Control Play Behavior Existence', () => {
        playbackControlTests.verifyBehavior('play');
    });
    performTestSequence('Playback Control Stop Behavior Existence', () => {
        playbackControlTests.verifyBehavior('stop');
    });

    performTestSequence('Stopping and Restarting Playback', () => {
        try {
            playbackControlTests.playerEntity.stop();
            playbackControlTests.playerEntity.play();
            checkRegistry.totalEvaluations++;
            checkRegistry.successfulEvaluations++;
            checkRegistry.evaluationRecords.push({ outcome: 'PASS', description: 'Playback can be stopped and restarted without issues' });
        } catch (e) {
            checkRegistry.totalEvaluations++;
            checkRegistry.failedEvaluations++;
            checkRegistry.evaluationRecords.push({ outcome: 'FAIL', description: 'Playback can be stopped and restarted without issues', issue: e.message });
            throw e;
        }
    });
})();