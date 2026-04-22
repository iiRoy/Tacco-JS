const _file_system_module = require('fs');
const _output_channel = console;

function DataStructureProcessor() {
    let _storage_unit = [];

    this.deposit_value = function(item_to_add) {
        _storage_unit.push(item_to_add);
    };

    this.extract_value = function() {
        const retrieved_item = _storage_unit.pop();
        _output_channel.log(retrieved_item);
    };
}

const _stream_metadata = _file_system_module.fstatSync(process.stdin.fd);
const _total_bytes_count = _stream_metadata.size;
const _byte_payload = Buffer.alloc(_total_bytes_count);
const _actual_bytes_read = _file_system_module.readSync(process.stdin.fd, _byte_payload, 0, _total_bytes_count, 0);
const _source_lines = _byte_payload.toString('utf8', 0, _actual_bytes_read).trim().split('\n');

const _operation_handler = new DataStructureProcessor();

_source_lines.reduce((current_handler, line_text) => {
    const numerical_datum = Number(line_text);

    if (numerical_datum !== 0) {
        current_handler.deposit_value(numerical_datum);
    } else {
        current_handler.extract_value();
    }
    return current_handler;
}, _operation_handler);