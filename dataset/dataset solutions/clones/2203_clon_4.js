function* readInputLines() {
  const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  const lines = rawContent.split("\n");
  for (const line of lines) {
    yield line;
  }
}

const input_line_generator = readInputLines();

function fetchNextLine() {
  const { value, done } = input_line_generator.next();
  if (done) {
    throw new Error("No more input lines available.");
  }
  return value;
}

function extractInteger() {
  return parseInt(fetchNextLine(), 10);
}

function parseIntegerArrayFromLine() {
  return fetchNextLine().split(" ").map(Number);
}

function presentOutput(content) {
  console.log(content);
}

function reportError(message) {
  console.error(message);
}

function processBattlePlan() {
  const initial_parameters = parseIntegerArrayFromLine();
  const target_health = initial_parameters[0];
  const spell_count = initial_parameters[1];

  const available_spells = [];
  let max_single_spell_damage = 0;

  for (let s_idx = 0; s_idx < spell_count; s_idx++) {
    const current_spell_data = parseIntegerArrayFromLine();
    const spell_damage_output = current_spell_data[0];
    const spell_mana_cost = current_spell_data[1];
    available_spells.push({
      output: spell_damage_output,
      cost: spell_mana_cost
    });
    if (spell_damage_output > max_single_spell_damage) {
      max_single_spell_damage = spell_damage_output;
    }
  }

  const max_damage_capacity = target_health + max_single_spell_damage;
  const minimum_mana_costs = new Array(max_damage_capacity + 1).fill(Infinity);
  minimum_mana_costs[0] = 0;

  for (let d_val = 1; d_val <= max_damage_capacity; d_val++) {
    for (const current_spell of available_spells) {
      const current_spell_output = current_spell.output;
      const current_spell_cost = current_spell.cost;

      if (d_val >= current_spell_output) {
        if (minimum_mana_costs[d_val - current_spell_output] !== Infinity) {
          minimum_mana_costs[d_val] = Math.min(
            minimum_mana_costs[d_val],
            minimum_mana_costs[d_val - current_spell_output] + current_spell_cost
          );
        }
      }
    }
  }

  let final_minimum_cost = Infinity;
  for (let d_idx = target_health; d_idx <= max_damage_capacity; d_idx++) {
    final_minimum_cost = Math.min(final_minimum_cost, minimum_mana_costs[d_idx]);
  }

  presentOutput(final_minimum_cost);
}

processBattlePlan();
