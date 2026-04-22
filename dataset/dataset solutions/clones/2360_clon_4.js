const data_collector = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let received_sequences = [];
let processing_engine;

data_collector.on('line', function(line_data){received_sequences.push(line_data);});
data_collector.on('close', function(){
  processing_engine = setup_data_accessor(received_sequences);
  console.error('\n↑data ↓output');
  execute_calculation();
});

function setup_data_accessor(source_data){
  return {
    sequence_list : source_data, current_position : 0, total_sequences : source_data.length,
    check_for_more : function(){return (this.current_position < this.total_sequences);},
    fetch_next_sequence : function(){
      if(this.check_for_more()){
        return this.sequence_list[this.current_position++];
      }else{
        throw new Error('SequenceOutOfBoundsException: No further input sequences available');
      }
    }
  };
}

function parse_number_array(){return process_sequence_type(retrieve_next_input(), 'array_of_numbers');}
function retrieve_next_input(){return processing_engine.fetch_next_sequence();}

function display_result(content){process.stdout.write(content.toString() + '\n');}

function process_sequence_type(data_item, type_identifier){
    try{
        switch(type_identifier){
            case 'integer': return parseInt(data_item);
            case 'array_of_numbers': return data_item.split(' ').map(Number);
            default: return data_item;
        }
    }catch(e){return data_item;}
}

function execute_calculation(){
  const dimensions_info = parse_number_array();
  const total_rows = dimensions_info[0];
  const total_columns = dimensions_info[1];

  const first_value_matrix = [];
  for(let r_index = 0; r_index < total_rows; r_index++){
    first_value_matrix.push(parse_number_array());
  }

  const absolute_difference_matrix = Array(total_rows).fill(null).map(() => Array(total_columns));
  for(let r_index = 0; r_index < total_rows; r_index++){
    const temporary_values = parse_number_array();
    for(let c_index = 0; c_index < total_columns; c_index++){
      absolute_difference_matrix[r_index][c_index] = Math.abs(first_value_matrix[r_index][c_index] - temporary_values[c_index]);
    }
  }
  
  const reachable_sum_sets = Array(total_rows).fill(null).map(() => Array(total_columns).fill(null));

  reachable_sum_sets[0][0] = new Set();
  reachable_sum_sets[0][0].add(absolute_difference_matrix[0][0]);

  for(let r_idx = 0; r_idx < total_rows; r_idx++){
    for(let c_idx = 0; c_idx < total_columns; c_idx++){
      if(r_idx === 0 && c_idx === 0) continue;

      const current_cell_value = absolute_difference_matrix[r_idx][c_idx];
      const current_cell_reachable = new Set();

      if(r_idx > 0){
        const sums_from_top = reachable_sum_sets[r_idx - 1][c_idx];
        for(const prev_s of sums_from_top){
          current_cell_reachable.add(Math.abs(prev_s + current_cell_value));
          current_cell_reachable.add(Math.abs(prev_s - current_cell_value));
        }
      }

      if(c_idx > 0){
        const sums_from_left = reachable_sum_sets[r_idx][c_idx - 1];
        for(const prev_s of sums_from_left){
          current_cell_reachable.add(Math.abs(prev_s + current_cell_value));
          current_cell_reachable.add(Math.abs(prev_s - current_cell_value));
        }
      }
      reachable_sum_sets[r_idx][c_idx] = current_cell_reachable;
    }
  }

  let smallest_final_diff = Infinity;
  const final_cell_sums = reachable_sum_sets[total_rows - 1][total_columns - 1];
  for(const sum_val of final_cell_sums){
    if(sum_val < smallest_final_diff){
      smallest_final_diff = sum_val;
    }
  }
  
  display_result(smallest_final_diff);
}