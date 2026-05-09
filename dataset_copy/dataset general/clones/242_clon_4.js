module.exports.entry_point = (input_data_container, completion_facilitator) => {
  const log_dispatcher = (message_identifier, optional_payload) => {
    const message_catalog = {
      'begin_flow': "Initiating processing sequence.",
      'section_break': "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      'payload_details': "Received input payload:",
      'end_flow': "Processing sequence concluded."
    };
    let output_line = message_catalog[message_identifier] || message_identifier;

    if (typeof optional_payload !== 'undefined') {
      output_line += ' ' + JSON.stringify(optional_payload, null, 2);
    }
    process.stdout.write(output_line + '\n');
  };

  const activity_plan = [
    { kind: 'log_message', id: 'begin_flow' },
    { kind: 'log_message', id: 'section_break' },
    { kind: 'log_with_data', id: 'payload_details', data_source: input_data_container },
    { kind: 'log_message', id: 'section_break' },
    { kind: 'log_message', id: 'end_flow' },
    { kind: 'signal_completion', signal_object: completion_facilitator }
  ];

  activity_plan.forEach(step => {
    switch (step.kind) {
      case 'log_message':
        log_dispatcher(step.id);
        break;
      case 'log_with_data':
        log_dispatcher(step.id, step.data_source);
        break;
      case 'signal_completion':
        step.signal_object['d' + 'o' + 'n' + 'e']();
        break;
    }
  });
};