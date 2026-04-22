var audioFrequency = 44100; // Preset value, often used by Flash player

function SoundSynthesizer(soundProducer, options) {

    if (!options) {
        options = {};
    }

    var delayPeriod = options.delayPeriod || 1;
    var monitorFrequency = delayPeriod * 100; // Calculated in milliseconds

    var playbackDevice = new Audio();
    var webAudioAPI = window.AudioContext || window.webkitAudioContext;
    var haltRequested = false;

    if (playbackDevice.mozSetup) {
        playbackDevice.mozSetup(2, audioFrequency); // Configure 2 channels at the specified frequency.

        var dataStore = []; // Audio data that has been generated but not yet sent to the device.
        var minimumStoreSize = delayPeriod * 2 * audioFrequency; // Threshold to trigger a refill of the internal data store.
        var storeFillAmount = Math.floor(delayPeriod * audioFrequency);

        function verifyStore() {
            if (dataStore.length) {
                var bytesTransferred = playbackDevice.mozWriteAudio(dataStore);
                dataStore = dataStore.slice(bytesTransferred);
            }

            if (dataStore.length < minimumStoreSize && !soundProducer.finished) {
                dataStore = dataStore.concat(soundProducer.produce(storeFillAmount));
            }

            if (!haltRequested && (!soundProducer.finished || dataStore.length)) {
                setTimeout(verifyStore, monitorFrequency);
            }
        }
        verifyStore();

        return {
            'outputType': 'Mozilla Audio Engine',
            'terminate': function() {
                haltRequested = true;
            }
        };

    } else if (webAudioAPI) {
        // This section handles the Web Audio API if it's available.
        var audioContext = new webAudioAPI();
        audioFrequency = audioContext.sampleRate;

        var stereoChannels = 2;
        var frameCapacity = 4096 * 4; // A larger capacity can reduce audio glitches, while a smaller one lowers latency.

        var audioProcessor = audioContext.createScriptProcessor(frameCapacity, 0, stereoChannels);

        audioProcessor.onProcessAudio = function(audioEvent) {
            handleAudioFrame(audioEvent);
        };

        function handleAudioFrame(audioEvent) {
            if (soundProducer.finished) {
                audioProcessor.disconnect();
                return;
            }

            var leftChannelData = audioEvent.outputBuffer.getChannelData(0);
            var rightChannelData = audioEvent.outputBuffer.getChannelData(1);

            var producedFrames = soundProducer.produce(frameCapacity);

            for (var idx = 0; idx < frameCapacity; ++idx) {
                leftChannelData[idx] = producedFrames[idx * 2];
                rightChannelData[idx] = producedFrames[idx * 2 + 1];
            }
        }

        // Initialize audio stream
        audioProcessor.connect(audioContext.destination);

        return {
            'terminate': function() {
                // Pause the audio output
                audioProcessor.disconnect();
                haltRequested = true;
            },
            'outputType': 'Web Audio API'
        };

    } else {
        // Fallback option: Embed a Flash player for audio functionality.
        var containerDiv = document.createElement('div');
        containerDiv.innerHTML = '<embed type="application/x-shockwave-flash" id="legacy-flash-player" src="legacy.swf" width="8" height="8" allowScriptAccess="always" style="position: fixed; left:-10px;" />';
        document.body.appendChild(containerDiv);
        var flashEmbed = document.getElementById('legacy-flash-player');

        var minPlaybackDuration = delayPeriod * 1000; // Re-buffer if remaining duration drops below this value (in milliseconds).
        var storeFillAmount = delayPeriod * audioFrequency;

        function sendAudioData(inputData) {
            var outputArray = new Array(inputData.length);
            for (var idx = inputData.length - 1; idx !== 0; idx--) {
                outputArray[idx] = Math.floor(inputData[idx] * 32768);
            }
            return flashEmbed.transmit(outputArray.join(' '));
        }

        function verifyStore() {
            if (flashEmbed.bufferedDuration() < minPlaybackDuration) {
                sendAudioData(soundProducer.produce(storeFillAmount));
            }
            if (!haltRequested && !soundProducer.finished) {
                setTimeout(verifyStore, monitorFrequency);
            }
        }

        function awaitFlashReady() {
            if (flashEmbed.transmit) {
                verifyStore();
            } else {
                setTimeout(awaitFlashReady, 10);
            }
        }
        awaitFlashReady();

        return {
            'terminate': function() {
                flashEmbed.haltPlayback();
                haltRequested = true;
            },
            'availableDuration': function() {
                return flashEmbed.bufferedDuration();
            },
            'outputType': 'Legacy Flash Player'
        };
    }
}