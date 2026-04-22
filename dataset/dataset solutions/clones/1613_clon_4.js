const _input_stream = process.stdin;
_input_stream.setEncoding('utf8');
let _total_data = '';
_input_stream.on('data', (chunk) => {
    _total_data += chunk;
});
_input_stream.on('end', () => {
    const _tokens = _total_data.split(/ |\n/).filter(Boolean);
    const _upper_bound = parseInt(_tokens[0], 10);
    const _numeric_entries = _tokens.slice(1, _upper_bound + 1);

    function _analyze_string_representation(current_string) {
        const _decimal_point_index = current_string.indexOf('.');
        const _is_whole = (_decimal_point_index === -1);
        const _numerical_value = parseFloat(current_string);
        let _fractional_magnitude = 0;
        let _decimal_precision = 0;
        if (!_is_whole) {
            const _parts = current_string.split('.');
            _fractional_magnitude = parseInt(_parts[1], 10);
            _decimal_precision = _parts[1].length;
        }
        return {
            _is_integer_form: _is_whole,
            _actual_value: _numerical_value,
            _decimal_part_as_int: _fractional_magnitude,
            _num_decimal_places: _decimal_precision
        };
    }
    const _processed_data = _numeric_entries.map(_analyze_string_representation);
    const _final_count = _processed_data.reduce((_current_tally, _item_one, _index_one) => {
        for (let _index_two = _index_one + 1; _index_two < _upper_bound; _index_two++) {
            const _item_two = _processed_data[_index_two];
            if (_item_one._is_integer_form && _item_two._is_integer_form) {
                _current_tally += 1;
            } else if (!_item_one._is_integer_form && _item_two._is_integer_form) {
                const _product_of_fraction_and_int = _item_one._decimal_part_as_int * _item_two._actual_value;
                const _divisor_for_check = Math.pow(10, _item_one._num_decimal_places);
                if (_product_of_fraction_and_int % _divisor_for_check === 0) {
                    _current_tally += 1;
                }
            } else if (_item_one._is_integer_form && !_item_two._is_integer_form) {
                const _product_of_fraction_and_int = _item_two._decimal_part_as_int * _item_one._actual_value;
                const _divisor_for_check = Math.pow(10, _item_two._num_decimal_places);
                if (_product_of_fraction_and_int % _divisor_for_check === 0) {
                    _current_tally += 1;
                }
            }
        }
        return _current_tally;
    }, 0);
    console.log(_final_count);
});