/*
 * Content is subject to the Apache License, Version 2.0.
 * You may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var output_width = 640;
var output_height = 360;

// Configurable audio processing parameters.
var audio_smoothing_constant = 0.8;
var fft_transform_size = 2048;

/**
 * Manages an audio visualizer.
 * @constructor
 */
function AudioVisualizerComponent() {
  // Initialize the audio analyzer node.
  this.audio_analyzer = audio_context_instance.createAnalyser();

  // Connect the analyzer to the audio output.
  this.audio_analyzer.connect(audio_context_instance.destination);
  this.audio_analyzer.minDecibels = -140; // Set the lowest volume threshold.
  this.audio_analyzer.maxDecibels = 0;    // Set the highest volume threshold.

  // Load the sound file.
  loadAudioResources(this, {
    media_file_name: 'chrono.mp3'
    // media_file_name: 'another_sound.wav'
  });

  // Prepare data arrays for frequency and time domain information.
  this.frequency_spectrum_data = new Uint8Array(this.audio_analyzer.frequencyBinCount);
  this.waveform_data = new Uint8Array(this.audio_analyzer.frequencyBinCount);

  // Initialize playback state variables.
  this.is_currently_playing = true;
  this.playback_start_timestamp = 0;
  this.current_playback_position = 0;
}

/**
 * Toggles the audio playback state (play/pause).
 */
AudioVisualizerComponent.prototype.toggleAudioPlayback = function() {
  if (this.is_currently_playing) {
    // Stop the audio source.
    this.current_audio_source.stop(0);
    // Calculate and store the current playback position.
    this.current_playback_position += audio_context_instance.currentTime - this.playback_start_timestamp;
    console.log('Playback paused at:', this.current_playback_position);
    // Position saved.
  } else {
    // Record the new start time.
    this.playback_start_timestamp = audio_context_instance.currentTime;
    console.log('Playback resumed from:', this.current_playback_position);
    // Create a new audio buffer source.
    this.current_audio_source = audio_context_instance.createBufferSource();
    // Connect the source to the analyzer.
    this.current_audio_source.connect(this.audio_analyzer);
    this.current_audio_source.buffer = this.audio_data_buffer_ref; // Assign the loaded buffer.
    this.current_audio_source.loop = true; // Enable continuous looping.

    // Start playback, ensuring the offset wraps around the buffer duration.
    this.current_audio_source.start(0, this.current_playback_position % this.audio_data_buffer_ref.duration);
    // Initiate the visualization rendering loop.
    requestAnimationFrameLoop(this.renderVisualization.bind(this));
  }
  // Flip the playback state.
  this.is_currently_playing = !this.is_currently_playing;
}

/**
 * Renders the audio visualization on the canvas element.
 * This method is intended to be called by requestAnimationFrame.
 */
AudioVisualizerComponent.prototype.renderVisualization = function() {
  // Configure the analyzer's smoothing and FFT size.
  this.audio_analyzer.smoothingTimeConstant = audio_smoothing_constant;
  this.audio_analyzer.fftSize = fft_transform_size;

  // Retrieve the latest frequency and time domain data from the analyzer.
  this.audio_analyzer.getByteFrequencyData(this.frequency_spectrum_data);
  this.audio_analyzer.getByteTimeDomainData(this.waveform_data);

  // Determine the width of each bar in the visualization.
  var bar_unit_width = Math.floor(1 / this.frequency_spectrum_data.length);

  // Access the canvas and its 2D rendering context.
  var display_element = document.querySelector('canvas');
  var render_context = display_element.getContext('2d');
  display_element.width = output_width;  // Set canvas visual width.
  display_element.height = output_height; // Set canvas visual height.

  // --- Draw the frequency domain visualization ---
  for (var bin_idx = 0; bin_idx < this.audio_analyzer.frequencyBinCount; bin_idx++) {
    var amplitude_value = this.frequency_spectrum_data[bin_idx];
    var normalized_level = amplitude_value / 256;
    var current_bar_height = output_height * normalized_level;
    var y_offset_pos = output_height - current_bar_height - 1;
    var segment_dimension = output_width / this.audio_analyzer.frequencyBinCount;
    var color_value_hue = bin_idx / this.audio_analyzer.frequencyBinCount * 360;
    render_context.fillStyle = 'hsl(' + color_value_hue + ', 100%, 50%)';
    render_context.fillRect(bin_idx * segment_dimension, y_offset_pos, segment_dimension, current_bar_height);
  }

  // --- Draw the time domain (waveform) visualization ---
  for (var time_idx = 0; time_idx < this.audio_analyzer.frequencyBinCount; time_idx++) {
    var sample_value = this.waveform_data[time_idx];
    var scaled_percentage = sample_value / 256;
    var waveform_point_height = output_height * scaled_percentage;
    var vertical_position = output_height - waveform_point_height - 1;
    var segment_dimension = output_width / this.audio_analyzer.frequencyBinCount;
    render_context.fillStyle = '#FFFFFF'; // Explicit white color.
    render_context.fillRect(time_idx * segment_dimension, vertical_position, 1, 2);
  }

  // Request the next animation frame if playback is still active.
  if (this.is_currently_playing) {
    requestAnimationFrameLoop(this.renderVisualization.bind(this));
  }
}

/**
 * Retrieves the amplitude value for a specific frequency.
 * @param {number} requested_frequency The frequency in Hertz to query.
 * @returns {number} The amplitude value at the given frequency.
 */
AudioVisualizerComponent.prototype.getSpecificFrequencyValue = function(requested_frequency) {
  var nyquist_limit = audio_context_instance.sampleRate / 2;
  var data_bin_index = Math.round(requested_frequency / nyquist_limit * this.frequency_spectrum_data.length);
  return this.frequency_spectrum_data[data_bin_index];
}