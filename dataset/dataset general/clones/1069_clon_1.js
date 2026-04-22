var sampleRate = 44100; /* This sample rate is often hard-coded internally in older Flash players, hence the comment. */

function AudioPlayer(    generator,    opts    ) {
	// Initialize options if not provided
	if (  !opts  ) { opts = {}; }

	// Determine audio latency and check interval
	var latency = opts.latency || 1; // Default latency is 1 second
	var checkInterval = latency * 100; /* This interval is in milliseconds for setTimeout */
	
	// Prepare audio elements and context
	var audioElement = new Audio(); // Standard HTML5 Audio element
	var webkitAudio = window.AudioContext || window.webkitAudioContext; // Web Audio API context
	var requestStop = false; // Flag to signal stopping audio playback
	
	// Branch 1: Firefox-specific Audio API
	if (  audioElement.mozSetup  ) {
		// Set up Firefox's proprietary audio output
		audioElement.mozSetup(  2,  sampleRate  ); /* Configure for 2 channels (stereo) at the specified sample rate */
		
		var buffer = []; /* Array to hold audio data generated but not yet written to the device */
		var minBufferLength = latency * 2 * sampleRate; /* Minimum buffer length before refilling, ensures smooth playback */
		var bufferFillLength = Math.floor(latency * sampleRate); // Amount of data to generate for refilling
		
		// Function to periodically check and refill the audio buffer
		function checkBuffer(  ) {
			// If there's data in the buffer, write it to the audio device
			if (  buffer.length  ) {
				var written = audioElement.mozWriteAudio(  buffer  );
				buffer = buffer.slice(  written  ); // Remove written data from the buffer
			}
			// If buffer is low and generator still has data, generate more
			if (  buffer.length < minBufferLength && !generator.finished  ) {
				buffer = buffer.concat(  generator.generate(  bufferFillLength  )  );
			}
			// Continue checking if not stopped and either generator is not finished or buffer still has data
			if (  !requestStop && (  !generator.finished || buffer.length  )  ) {
				setTimeout(  checkBuffer,  checkInterval  );
			}
		}
		// Start the initial buffer check
		checkBuffer();
		
		// Return controls for Firefox Audio API
		return {
			'type': 'Firefox Audio',
			'stop': function(  ) {
				requestStop = true; // Set flag to stop playback
			}
		};
	} // End of Firefox Audio API block
	
	// Branch 2: Webkit/Standard Web Audio API
	else if (  webkitAudio  ) {
		// Uses Webkit Web Audio API if available (Chrome, Safari, Edge, modern Firefox)
		var context = new webkitAudio(); // Create a new audio context
		sampleRate = context.sampleRate; // Update sample rate from the context
		
		var channelCount = 2; // Stereo output
		var bufferSize = 4096 * 4; // Higher for less glitches, lower for less latency. This is the size of the audio processing buffer.
		
		// Create a script processor node for custom audio processing
		var node = context.createScriptProcessor(  bufferSize,  0,  channelCount  );
		
		// Assign the processing function to the audioprocess event
		node.onaudioprocess = function(  e  ) { process(  e  ); };

		// Function to process audio data
		function process(  e  ) {
			// If generator is finished, disconnect the node and stop
			if (  generator.finished  ) {
				node.disconnect();
				return;
			}
			
			// Get references to the output buffer channels
			var dataLeft = e.outputBuffer.getChannelData(  0  );
			var dataRight = e.outputBuffer.getChannelData(  1  );

			// Generate new audio data
			var generate = generator.generate(  bufferSize  );

			// Fill the output buffers with generated data (interleaved stereo)
			for (  var i = 0;  i < bufferSize;  ++i  ) {
				dataLeft[  i  ] = generate[  i * 2  ];
				dataRight[  i  ] = generate[  i * 2 + 1  ];
			}
		}
		
		// Connect the script processor node to the audio context's destination (speakers)
		node.connect(  context.destination  );
		
		// Return controls for Web Audio API
		return {
			'stop': function(  ) {
				// Disconnect the node to pause/stop playback
				node.disconnect();
				requestStop = true; // Also set the general stop flag
			},
			'type': 'Webkit Audio'
		};

	} // End of Web Audio API block
	
	// Branch 3: Flash Player Fallback
	else {
		// Fall back to creating a Flash player for audio output
		var c = document.createElement(  'div'  ); // Create a temporary div container
		c.innerHTML = '<embed type="application/x-shockwave-flash" id="da-swf" src="da.swf" width="8" height="8" allowScriptAccess="always" style="position: fixed; left:-10px;" />';
		document.body.appendChild(  c  ); // Append the div (with Flash embed) to the document body
		var swf = document.getElementById(  'da-swf'  ); // Get reference to the Flash object
		
		var minBufferDuration = latency * 1000; /* Refill buffer when there are only this many milliseconds remaining */
		var bufferFillLength = latency * sampleRate; // Amount of audio frames to generate for refill
		
		// Function to write audio data to the Flash player
		function write(  data  ) {
			var out = new Array(  data.length  ); // Create a new array for processed data
			for (  var i = data.length - 1;  i !== 0;  i--  ) {
				out[  i  ] = Math.floor(  data[  i  ] * 32768  ); // Convert float to 16-bit integer for Flash
			}
			return swf.write(  out.join(  ' '  )  ); // Write space-separated data to Flash
		}
		
		// Function to check Flash buffer and refill it
		function checkBuffer(  ) {
			if (  swf.bufferedDuration() < minBufferDuration  ) {
				write(  generator.generate(  bufferFillLength  )  ); // Generate and write more data
			}
			// Continue checking if not stopped and generator is not finished
			if (  !requestStop && !generator.finished  ) { setTimeout(  checkBuffer,  checkInterval  ); }
		}
		
		// Function to wait for Flash player to be ready
		function checkReady(  ) {
			if (  swf.write  ) { // Check if the Flash 'write' method is available
				checkBuffer(); // Start buffer checking once Flash is ready
			} else {
				setTimeout(  checkReady,  10  ); // Retry after a short delay
			}
		}
		// Initiate the readiness check for Flash
		checkReady();
		
		// Return controls for Flash Audio Player
		return {
			'stop': function(  ) {
				swf.stop(); // Call Flash's stop method
				requestStop = true; // Set the general stop flag
			},
			'bufferedDuration': function(  ) {
				return swf.bufferedDuration(); // Get buffered duration from Flash
			},
			'type': 'Flash Audio'
		};
	} // End of Flash Player Fallback block
} // End of AudioPlayer function