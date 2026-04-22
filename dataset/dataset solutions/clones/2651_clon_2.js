"use strict"

const input_text_content = require('node:fs').readFileSync('/dev/stdin', 'utf8')
const text_rows = input_text_content.split('\n')
const total_items = text_rows[0]
const desired_sequence = text_rows[1].split(' ').map(item_str => parseInt(item_str))
const starting_sequence = text_rows[2].split(' ').map(item_str => parseInt(item_str))

let iteration_counter = 0

let mutable_sequence = starting_sequence

while (true)
{
  const peak_position = mutable_sequence.indexOf(Math.max(...mutable_sequence))

  if (peak_position === 0)
  {
    mutable_sequence[peak_position] = mutable_sequence[peak_position] - mutable_sequence[1] - mutable_sequence[total_items - 1]
  }
  else if (peak_position === (total_items - 1))
  {
    mutable_sequence[peak_position] = mutable_sequence[peak_position] - mutable_sequence[total_items - 2] - mutable_sequence[0]
  }
  else
  {
    mutable_sequence[peak_position] = mutable_sequence[peak_position] - mutable_sequence[peak_position - 1] - mutable_sequence[peak_position + 1]
  }
  iteration_counter++
  if (JSON.stringify(mutable_sequence) === JSON.stringify(desired_sequence))
  {
    break
  }
}

console.log(iteration_counter)