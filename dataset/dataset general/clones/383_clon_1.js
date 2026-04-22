/*
 * This is a Web Worker script for MP3 encoding.
 * It utilizes the 'libmp3lame.js' library for LAME encoding functionality.
 */
importScripts('libmp3lame.js'); // Import the LAME MP3 encoder library.

// Declare a global variable to hold the MP3 codec instance.
// It will be initialized when an 'init' command is received.
var mp3codec;

/**
 * Event handler for messages received by the Web Worker.
 * The 'e' parameter contains the message data.
 */
self.onmessage = function (e) {

    // Use a switch statement to handle different commands sent to the worker.
    switch (e.data.cmd) {

        // --- 'init' command: Initialize the LAME encoder ---
        case 'init':
            // Ensure configuration object exists, even if not provided.
            if (!e.data.config) {
                e.data.config = {}; // Default to an empty config object.
            }

            // Initialize the LAME codec instance.
            mp3codec = Lame.init();

            // Set encoding parameters based on provided config or default values.
            // Set encoding mode (e.g., Joint Stereo, Stereo, Mono).
            Lame.set_mode(mp3codec, e.data.config.mode || Lame.JOINT_STEREO);
            // Set the number of channels (e.g., 1 for mono, 2 for stereo).
            Lame.set_num_channels(mp3codec, e.data.config.channels || 2);
            // Set the output sample rate.
            Lame.set_out_samplerate(mp3codec, e.data.config.samplerate || 44100);
            // Set the bitrate for the MP3 output.
            Lame.set_bitrate(mp3codec, e.data.config.bitrate || 128);

            // Initialize the codec with the specified parameters.
            Lame.init_params(mp3codec);

            break; // End of 'init' case.

        // --- 'encode' command: Encode audio data ---
        case 'encode':
            // Encode the audio buffer (e.g., Float32Array) into MP3 data.
            // The input buffer is passed twice for stereo encoding where left and right channels are the same.
            var mp3data = Lame.encode_buffer_ieee_float(mp3codec, e.data.buf, e.data.buf);

            // Post the encoded MP3 data back to the main thread.
            self.postMessage({ cmd: 'data', buf: mp3data.data });

            break; // End of 'encode' case.

        // --- 'finish' command: Flush remaining data and close the encoder ---
        case 'finish':
            // Flush any remaining encoded data from the LAME buffer.
            var mp3data = Lame.encode_flush(mp3codec);

            // Post the final chunk of MP3 data.
            self.postMessage({ cmd: 'end', buf: mp3data.data });

            // Close the LAME codec to release resources.
            Lame.close(mp3codec);
            // Reset the codec instance.
            mp3codec = null;

            break; // End of 'finish' case.

    } // End of switch statement.

}; // End of self.onmessage function.