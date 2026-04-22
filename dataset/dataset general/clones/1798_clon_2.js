var captureSize = 0,
    leftChannels = [],
    rightChannels = [],
    bitDepth = 16,
    audioFrequency;

this.onmessage = function (msgEvent) {
    switch (msgEvent.data.command) {
        case 'init':
            initializeProcessor(msgEvent.data.config);
            break;
        case 'record':
            storeAudioSegment(msgEvent.data.buffer);
            break;
        case 'exportWAV':
            produceWaveFile(msgEvent.data.type);
            break;
        case 'getBuffer':
            retrieveChannelData();
            break;
        case 'clear':
            resetProcessorState();
            break;
    }
};

function initializeProcessor(setupOptions) {
    audioFrequency = setupOptions.sampleRate;
}

function storeAudioSegment(incomingBlock) {
    leftChannels.push(incomingBlock[0]);
    // rightChannels.push(incomingBlock[1]); // Stereo channel is not currently utilized
    captureSize += incomingBlock[0].length;
}

function produceWaveFile(outputFormat) {
    var leftChannelData = combineAudioBlocks(leftChannels, captureSize);
    // var rightChannelData = combineAudioBlocks(rightChannels, captureSize); // For stereo output
    // var mixedChannels = interleaveChannels(leftChannelData, rightChannelData);
    // var wavDataView = generateWAVHeader(mixedChannels);
    var wavDataView = generateWAVHeader(leftChannelData); // Mono processing
    var finalAudioBlob = new Blob([wavDataView], { type: outputFormat });

    this.postMessage(finalAudioBlob);
}

function retrieveChannelData() {
    var allChannelBlocks = [];
    allChannelBlocks.push(combineAudioBlocks(leftChannels, captureSize));
    allChannelBlocks.push(combineAudioBlocks(rightChannels, captureSize));
    this.postMessage(allChannelBlocks);
}

function resetProcessorState() {
    captureSize = 0;
    leftChannels = [];
    rightChannels = [];
}

function combineAudioBlocks(sourceBlocks, totalLength) {
    var mergedOutput = new Float32Array(totalLength);
    var currentPosition = 0;
    for (var idx = 0; idx < sourceBlocks.length; idx++) {
        mergedOutput.set(sourceBlocks[idx], currentPosition);
        currentPosition += sourceBlocks[idx].length;
    }
    return mergedOutput;
}

function interleaveChannels(leftInput, rightInput) {
    var totalLength = leftInput.length + rightInput.length;
    var mergedOutput = new Float32Array(totalLength);

    var outputIndex = 0,
        sourceIndex = 0;

    while (outputIndex < totalLength) {
        mergedOutput[outputIndex++] = leftInput[sourceIndex];
        mergedOutput[outputIndex++] = rightInput[sourceIndex];
        sourceIndex++;
    }
    return mergedOutput;
}

function convertFloatToPCM16(dataOutput, currentPosition, inputSamples) {
    for (var idx = 0; idx < inputSamples.length; idx++, currentPosition += 2) {
        var scaledValue = Math.max(-1, Math.min(1, inputSamples[idx]));
        dataOutput.setInt16(currentPosition, scaledValue < 0 ? scaledValue * 0x8000 : scaledValue * 0x7FFF, true);
    }
}

function writeAsciiString(dataViewUtil, currentPosition, textString) {
    for (var idx = 0; idx < textString.length; idx++) {
        dataViewUtil.setUint8(currentPosition + idx, textString.charCodeAt(idx));
    }
}

/*
// Alternative WAV encoding structure, not used in primary logic
function encodeSimpleWAV(inputSamples) {
    var block_alignment = (1 * bitDepth) / 8;
    var byte_rate_val = audioFrequency * block_alignment;
    var data_size_bytes = (inputSamples.length * bitDepth) / 8;
    var data_buffer = new ArrayBuffer(44 + data_size_bytes);
    var data_view_obj = new DataView(data_buffer);

    writeAsciiString(data_view_obj, 0, 'RIFF');
    data_view_obj.setUint32(4, 32 + data_size_bytes, true); // Total file size
    writeAsciiString(data_view_obj, 8, 'WAVE');
    writeAsciiString(data_view_obj, 12, 'fmt ');
    data_view_obj.setUint32(16, 16, true);
    data_view_obj.setUint16(20, 1, true);
    data_view_obj.setUint16(22, 1, true); // Mono channel
    data_view_obj.setUint32(24, audioFrequency, true);
    data_view_obj.setUint32(28, byte_rate_val, true);
    data_view_obj.setUint16(32, block_alignment, true);
    data_view_obj.setUint16(34, bitDepth, true);
    writeAsciiString(data_view_obj, 36, 'data');
    data_view_obj.setUint32(40, data_size_bytes, true); // Size of data chunk
    convertFloatToPCM16(data_view_obj, 44, inputSamples);

    return data_view_obj;
}
*/

function generateWAVHeader(audioSamples) {
    var wavBuffer = new ArrayBuffer(44 + audioSamples.length * 2);
    var dataViewUtil = new DataView(wavBuffer);

    writeAsciiString(dataViewUtil, 0, 'RIFF'); // RIFF identifier
    dataViewUtil.setUint32(4, 32 + audioSamples.length * 2, true); // File size
    writeAsciiString(dataViewUtil, 8, 'WAVE'); // RIFF type
    writeAsciiString(dataViewUtil, 12, 'fmt '); // Format chunk identifier
    dataViewUtil.setUint32(16, 16, true); // Format chunk length
    dataViewUtil.setUint16(20, 1, true); // Sample format (PCM)
    // dataViewUtil.setUint16(22, 2, true); // Stereo channel count
    dataViewUtil.setUint16(22, 1, true); // Mono channel count
    dataViewUtil.setUint32(24, audioFrequency, true); // Sample rate
    // dataViewUtil.setUint32(28, audioFrequency * 4, true); // Stereo byte rate
    dataViewUtil.setUint32(28, audioFrequency * 2, true); // Mono byte rate
    // dataViewUtil.setUint16(32, 4, true); // Stereo block align
    dataViewUtil.setUint16(32, 2, true); // Mono block align
    dataViewUtil.setUint16(34, 16, true); // Bits per sample
    writeAsciiString(dataViewUtil, 36, 'data'); // Data chunk identifier
    dataViewUtil.setUint32(40, audioSamples.length * 2, true); // Data chunk length

    convertFloatToPCM16(dataViewUtil, 44, audioSamples); // Write audio data

    return dataViewUtil;
}