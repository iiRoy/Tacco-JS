importScripts('libmp3lame.js');

const generateWorkerProcessor = () => {
    let activeEncoderReference = null;

    const performSetup = (receivedSettings) => {
        const processingConfiguration = {
            encodingMode: receivedSettings.mode || Lame.JOINT_STEREO,
            channelCount: receivedSettings.channels || 2,
            outputSampleRate: receivedSettings.samplerate || 44100,
            bitrateValue: receivedSettings.bitrate || 128
        };

        activeEncoderReference = Lame.init();
        Lame.set_mode(activeEncoderReference, processingConfiguration.encodingMode);
        Lame.set_num_channels(activeEncoderReference, processingConfiguration.channelCount);
        Lame.set_out_samplerate(activeEncoderReference, processingConfiguration.outputSampleRate);
        Lame.set_bitrate(activeEncoderReference, processingConfiguration.bitrateValue);
        Lame.init_params(activeEncoderReference);
    };

    const processAudioChunk = (inputAudioSegment) => {
        const generatedMp3Fragment = Lame.encode_buffer_ieee_float(activeEncoderReference, inputAudioSegment, inputAudioSegment);
        self.postMessage({ operationType: 'partialOutput', contentPayload: generatedMp3Fragment.data });
    };

    const finalizeAudioStream = () => {
        const finalMp3Output = Lame.encode_flush(activeEncoderReference);
        self.postMessage({ operationType: 'finalOutput', contentPayload: finalMp3Output.data });
        Lame.close(activeEncoderReference);
        activeEncoderReference = null;
    };

    const dispatchMap = {
        'init': (messageContent) => performSetup(messageContent.config || {}),
        'encode': (messageContent) => processAudioChunk(messageContent.buf),
        'finish': (messageContent) => finalizeAudioStream()
    };

    return (incomingEvent) => {
        const instructionKey = incomingEvent.data.cmd;
        const handlerFunction = dispatchMap[instructionKey];
        if (handlerFunction) {
            handlerFunction(incomingEvent.data);
        }
    };
};

self.onmessage = generateWorkerProcessor();