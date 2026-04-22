const audio_state_manager = new (class SoundCaptureMachine {
  #total_sample_count = 0;
  #left_channel_segments = [];
  #right_channel_segments = [];
  #output_bit_depth = 16;
  #audio_sample_rate;

  constructor() {
    // Initial state setup, can be empty or set defaults
  }

  #write_ascii_to_view(data_view_target, start_offset, text_content) {
    Array.from(text_content).forEach((char_val, idx) => {
      data_view_target.setUint8(start_offset + idx, char_val.charCodeAt(0));
    });
  }

  #convert_float_to_signed_16bit(data_view_target, start_offset, float_samples_array) {
    let current_byte_offset = start_offset;
    float_samples_array.forEach(single_sample => {
      const clamped_sample = Math.max(-1, Math.min(1, single_sample));
      const pcm_value = clamped_sample < 0 ? clamped_sample * 0x8000 : clamped_sample * 0x7FFF;
      data_view_target.setInt16(current_byte_offset, pcm_value, true);
      current_byte_offset += 2;
    });
  }

  #concatenate_audio_segments(segment_list, combined_length) {
    const combined_buffer = new Float32Array(combined_length);
    let current_offset = 0;
    segment_list.forEach(segment => {
      combined_buffer.set(segment, current_offset);
      current_offset += segment.length;
    });
    return combined_buffer;
  }

  #construct_wav_data_view(audio_samples) {
    const header_size = 44;
    const sample_data_size = audio_samples.length * 2;
    const total_buffer_size = header_size + sample_data_size;

    const output_buffer = new ArrayBuffer(total_buffer_size);
    const data_writer = new DataView(output_buffer);

    this.#write_ascii_to_view(data_writer, 0, 'RIFF');
    data_writer.setUint32(4, total_buffer_size - 8, true);
    this.#write_ascii_to_view(data_writer, 8, 'WAVE');

    this.#write_ascii_to_view(data_writer, 12, 'fmt ');
    data_writer.setUint32(16, 16, true);
    data_writer.setUint16(20, 1, true);
    data_writer.setUint16(22, 1, true);
    data_writer.setUint32(24, this.#audio_sample_rate, true);
    data_writer.setUint32(28, this.#audio_sample_rate * 2, true);
    data_writer.setUint16(32, 2, true);
    data_writer.setUint16(34, this.#output_bit_depth, true);

    this.#write_ascii_to_view(data_writer, 36, 'data');
    data_writer.setUint32(40, sample_data_size, true);
    this.#convert_float_to_signed_16bit(data_writer, header_size, audio_samples);

    return data_writer;
  }

  configure_processor(configuration_data) {
    this.#audio_sample_rate = configuration_data.sampleRate;
  }

  ingest_audio_channel_data(input_data_array) {
    this.#left_channel_segments.push(input_data_array[0]);
    this.#total_sample_count += input_data_array[0].length;
  }

  create_wav_output_blob(blob_type) {
    const combined_left_channel = this.#concatenate_audio_segments(this.#left_channel_segments, this.#total_sample_count);
    const wav_data_view = this.#construct_wav_data_view(combined_left_channel);
    self.postMessage(new Blob([wav_data_view], { type: blob_type }));
  }

  fetch_internal_buffers() {
    const combined_left_channel = this.#concatenate_audio_segments(this.#left_channel_segments, this.#total_sample_count);
    const combined_right_channel = this.#concatenate_audio_segments(this.#right_channel_segments, this.#total_sample_count);
    self.postMessage([combined_left_channel, combined_right_channel]);
  }

  reset_all_data() {
    this.#total_sample_count = 0;
    this.#left_channel_segments = [];
    this.#right_channel_segments = [];
  }
})();

const action_dispatcher = new Map([
  ['setup', audio_state_manager.configure_processor.bind(audio_state_manager)],
  ['ingest', audio_state_manager.ingest_audio_channel_data.bind(audio_state_manager)],
  ['produceWAV', audio_state_manager.create_wav_output_blob.bind(audio_state_manager)],
  ['extractBuffers', audio_state_manager.fetch_internal_buffers.bind(audio_state_manager)],
  ['purge', audio_state_manager.reset_all_data.bind(audio_state_manager)],
]);

self.addEventListener('message', (incoming_message_event) => {
  const message_payload = incoming_message_event.data;
  const handler_function = action_dispatcher.get(message_payload.actionType);

  if (handler_function) {
    switch (message_payload.actionType) {
      case 'setup':
        handler_function(message_payload.configuration);
        break;
      case 'ingest':
        handler_function(message_payload.buffer);
        break;
      case 'produceWAV':
        handler_function(message_payload.outputFormat);
        break;
      case 'extractBuffers':
      case 'purge':
        handler_function();
        break;
      default:
        console.warn('Unhandled message action type:', message_payload.actionType);
    }
  } else {
    console.error('Unknown action type received:', message_payload.actionType);
  }
});