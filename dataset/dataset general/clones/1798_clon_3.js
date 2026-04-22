let recordedSampleCount = 0;
let leftChannelBufferChunks = [];
let configuredSampleRate;

this.onmessage = function(incomingMessage) {
    // Validate the structure of the incoming message to prevent errors.
    if (!incomingMessage || typeof incomingMessage.data === 'undefined' || typeof incomingMessage.data.operation !== 'string') {
        console.warn("Web Worker received an invalid or malformed message. Skipping processing.");
        // Optionally, send an error back to the main thread.
        this.postMessage({ type: 'worker_error', details: 'Invalid message structure received.' });
        return;
    }

    const requestedOperation = incomingMessage.data.operation;
    const operationPayload = incomingMessage.data.payload; // Payload contains configuration or data.

    // Use an if/else if chain instead of a switch for command dispatch.
    if (requestedOperation === 'initialize') {
        processInitialization(operationPayload);
    } else if (requestedOperation === 'storeFragment') {
        ingestAudioFragment(operationPayload);
    } else if (requestedOperation === 'produceWAV') {
        produceWavExport(operationPayload);
    } else if (requestedOperation === 'retrieveFragments') {
        retrieveStoredFragments();
    } else if (requestedOperation === 'flushState') {
        clearStoredData();
    } else {
        // Log unknown operations and potentially send an error back.
        console.warn(`Unrecognized operation received by audio processing worker: "${requestedOperation}".`);
        this.postMessage({ type: 'worker_error', details: `Unrecognized command: ${requestedOperation}` });
    }
};

/**
 * Initializes the audio processing engine with provided configuration.
 * @param {object} initSettings - Configuration object, expected to contain `sampleFrequency`.
 */
function processInitialization(initSettings) {
    // Guard clause to ensure valid configuration is provided.
    if (!initSettings || typeof initSettings.sampleFrequency !== 'number' || initSettings.sampleFrequency <= 0) {
        const errorMsg = "Initialization failed: 'sampleFrequency' is missing or invalid in settings.";
        console.error(errorMsg, initSettings);
        throw new Error(errorMsg); // Propagate error for critical initialization failure.
    }
    configuredSampleRate = initSettings.sampleFrequency;
    console.log(`Audio processing engine successfully initialized with sample rate: ${configuredSampleRate} Hz.`);
}

/**
 * Adds a new audio buffer fragment to the recorded data. This implementation
 * strictly handles mono-channel input, specifically the first channel.
 * @param {Float32Array[]} inputSegment - An array containing audio channel buffers.
 */
function ingestAudioFragment(inputSegment) {
    // Robust input validation: ensure it's an array and contains a Float32Array.
    if (!Array.isArray(inputSegment) || inputSegment.length === 0 || !(inputSegment[0] instanceof Float32Array)) {
        console.warn("Attempted to ingest an invalid or empty audio fragment. Skipping.");
        return;
    }
    const primaryChannelBuffer = inputSegment[0]; // Assume first element is the primary (left) channel.
    leftChannelBufferChunks.push(primaryChannelBuffer);
    recordedSampleCount += primaryChannelBuffer.length;
    // Note: The original `record` function only pushed to `recBuffersL`,
    // effectively making the recording mono. This version maintains that mono-channel behavior.
}

/**
 * Generates and posts a WAV audio blob from the recorded data.
 * @param {string} exportMimeType - The MIME type for the output Blob (e.g., 'audio/wav').
 */
function produceWavExport(exportMimeType) {
    // Guard clause for no recorded data.
    if (recordedSampleCount === 0 || leftChannelBufferChunks.length === 0) {
        console.warn("No audio data has been recorded; exporting an empty WAV blob.");
        // Post an empty blob with the specified type, or default to 'audio/wav'.
        this.postMessage(new Blob([], { type: exportMimeType || 'audio/wav' }));
        return;
    }

    // Combine all recorded left channel fragments into a single buffer.
    const combinedLeftChannel = consolidateBuffers(leftChannelBufferChunks, recordedSampleCount);
    // Construct the WAV file header and data view.
    const wavFileView = constructWavDataView(combinedLeftChannel);
    // Create the final Blob object.
    const generatedAudioBlob = new Blob([wavFileView], { type: exportMimeType || 'audio/wav' });

    // Post the generated audio blob back to the main thread.
    this.postMessage(generatedAudioBlob);
}

/**
 * Retrieves the currently stored raw audio buffers.
 * This implementation assumes a mono recording, so it returns a single channel.
 */
function retrieveStoredFragments() {
    // If no data, send an empty array to indicate no buffers are available.
    if (recordedSampleCount === 0 || leftChannelBufferChunks.length === 0) {
        this.postMessage([]);
        return;
    }
    // Consolidate the primary (left) channel fragments into one buffer.
    const consolidatedPrimaryChannel = consolidateBuffers(leftChannelBufferChunks, recordedSampleCount);
    // Post an array containing the single consolidated channel.
    this.postMessage([consolidatedPrimaryChannel]);
}

/**
 * Resets all recorded audio data and related state variables.
 */
function clearStoredData() {
    recordedSampleCount = 0;
    leftChannelBufferChunks = [];
    console.log("Audio recording state has been successfully reset.");
}

/**
 * Consolidates an array of Float32Array buffers into a single Float32Array.
 * @param {Float32Array[]} bufferCollection - An array of Float32Array segments.
 * @param {number} totalSampleLength - The expected total length of the combined buffer.
 * @returns {Float32Array} A single Float32Array containing all merged data.
 */
function consolidateBuffers(bufferCollection, totalSampleLength) {
    // Guard against empty input collection.
    if (!bufferCollection || bufferCollection.length === 0 || totalSampleLength <= 0) {
        console.warn("Attempted to consolidate an empty or invalid buffer collection.");
        return new Float32Array(0); // Return an empty Float32Array.
    }

    const finalCombinedArray = new Float32Array(totalSampleLength);
    let currentWritePosition = 0; // Tracks the current offset for writing into the final array.

    // Iterate through each segment and copy its contents.
    for (const currentSegment of bufferCollection) {
        // Ensure each segment is a Float32Array before attempting to set.
        if (currentSegment instanceof Float32Array) {
            finalCombinedArray.set(currentSegment, currentWritePosition);
            currentWritePosition += currentSegment.length;
        } else {
            console.warn("Skipping non-Float32Array element encountered during buffer consolidation.");
        }
    }
    return finalCombinedArray;
}

/**
 * Converts an array of floating-point audio samples (-1.0 to 1.0) into
 * 16-bit signed PCM format and writes them to a DataView.
 * @param {DataView} dataViewTarget - The DataView to write the PCM data into.
 * @param {number} byteOffsetStart - The starting byte offset within the DataView.
 * @param {Float32Array} floatSampleArray - Array of floating-point audio samples.
 */
function convertFloatToS16PCM(dataViewTarget, byteOffsetStart, floatSampleArray) {
    const MAX_16BIT_POSITIVE_VAL = 32767; // Corresponds to 0x7FFF
    const MIN_16BIT_NEGATIVE_VAL = -32768; // Corresponds to 0x8000 (signed)

    let currentBytePosition = byteOffsetStart;
    for (let sampleIndex = 0; sampleIndex < floatSampleArray.length; sampleIndex++) {
        const floatVal = floatSampleArray[sampleIndex];

        // Clamp the float value to the valid range [-1.0, 1.0].
        const clampedVal = Math.max(-1.0, Math.min(1.0, floatVal));

        // Scale the clamped float value to the 16-bit signed integer range.
        const s16Value = clampedVal < 0
            ? clampedVal * MIN_16BIT_NEGATIVE_VAL
            : clampedVal * MAX_16BIT_POSITIVE_VAL;

        // Write the 16-bit signed integer to the DataView in little-endian format.
        dataViewTarget.setInt16(currentBytePosition, s16Value, true);
        currentBytePosition += 2; // Move to the next 2-byte slot for the next sample.
    }
}

/**
 * Writes an ASCII string into a DataView at a specified offset.
 * @param {DataView} dataTargetView - The DataView to write into.
 * @param {number} initialOffset - The starting byte offset.
 * @param {string} sourceString - The string to write.
 */
function writeAsciiString(dataTargetView, initialOffset, sourceString) {
    // Basic validation for the input string.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        console.warn("Attempted to write an invalid or empty string to DataView.");
        return;
    }
    for (let charIdx = 0; charIdx < sourceString.length; charIdx++) {
        dataTargetView.setUint8(initialOffset + charIdx, sourceString.charCodeAt(charIdx));
    }
}

/**
 * Constructs a DataView representing a complete mono WAV file, including header and audio data.
 * @param {Float32Array} pcmSamples - The consolidated Float32Array of audio samples.
 * @returns {DataView} A DataView containing the full WAV file binary data.
 */
function constructWavDataView(pcmSamples) {
    const WAV_HEADER_SIZE = 44; // Standard WAV file header size in bytes.
    const BYTES_PER_SAMPLE_S16 = 2; // 16-bit PCM uses 2 bytes per sample.
    const NUMBER_OF_CHANNELS = 1; // This worker is designed for mono audio.
    const BITS_PER_SAMPLE_WAV = 16;
    const AUDIO_FORMAT_PCM = 1; // Audio format code for PCM.

    // Calculate the size of the data chunk (audio samples).
    const dataChunkByteLength = pcmSamples.length * BYTES_PER_SAMPLE_S16;
    // Calculate the total size of the WAV file.
    const totalWavFileByteLength = WAV_HEADER_SIZE + dataChunkByteLength;

    // Create the ArrayBuffer and DataView for the entire WAV file.
    const audioBuffer = new ArrayBuffer(totalWavFileByteLength);
    const wavDataView = new DataView(audioBuffer);

    let currentOffset = 0; // Keep track of the current write position in the DataView.

    // === RIFF Chunk ===
    writeAsciiString(wavDataView, currentOffset, 'RIFF');
    currentOffset += 4;
    // File size (total size - 8 bytes for 'RIFF' and this field itself).
    wavDataView.setUint32(currentOffset, totalWavFileByteLength - 8, true); // true for little-endian.
    currentOffset += 4;
    writeAsciiString(wavDataView, currentOffset, 'WAVE');
    currentOffset += 4;

    // === FMT Subchunk ===
    writeAsciiString(wavDataView, currentOffset, 'fmt '); // Note the space.
    currentOffset += 4;
    wavDataView.setUint32(currentOffset, 16, true); // Subchunk1Size (16 for PCM).
    currentOffset += 4;
    wavDataView.setUint16(currentOffset, AUDIO_FORMAT_PCM, true); // AudioFormat (1 for PCM).
    currentOffset += 2;
    wavDataView.setUint16(currentOffset, NUMBER_OF_CHANNELS, true); // NumChannels (1 for mono).
    currentOffset += 2;
    // Ensure configuredSampleRate is available. If not, this would error or produce bad WAV.
    wavDataView.setUint32(currentOffset, configuredSampleRate, true); // SampleRate.
    currentOffset += 4;

    // ByteRate: SampleRate * NumChannels * BytesPerSample.
    const byteRate = configuredSampleRate * NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE_S16;
    wavDataView.setUint32(currentOffset, byteRate, true);
    currentOffset += 4;

    // BlockAlign: NumChannels * BytesPerSample.
    const blockAlign = NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE_S16;
    wavDataView.setUint16(currentOffset, blockAlign, true);
    currentOffset += 2;
    wavDataView.setUint16(currentOffset, BITS_PER_SAMPLE_WAV, true); // BitsPerSample.
    currentOffset += 2;

    // === DATA Subchunk ===
    writeAsciiString(wavDataView, currentOffset, 'data');
    currentOffset += 4;
    wavDataView.setUint32(currentOffset, dataChunkByteLength, true); // Subchunk2Size.
    currentOffset += 4;

    // Write the actual audio samples (converted to 16-bit PCM).
    convertFloatToS16PCM(wavDataView, currentOffset, pcmSamples);

    return wavDataView;
}