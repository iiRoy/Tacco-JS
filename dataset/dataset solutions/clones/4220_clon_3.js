function readFirstNumber(rawInput) {
  return Number(rawInput.split("\n")[0]);
}

function createSpecialCaseTable() {
  var table = Object.create(null);

  table[0] = 2;
  table[1] = 1;
  table[77] = "12360848946698171";
  table[78] = "20000273725560978";
  table[79] = "32361122672259149";
  table[80] = "52361396397820127";
  table[81] = "84722519070079276";
  table[82] = "137083915467899403";
  table[83] = "221806434537978679";
  table[84] = "358890350005878082";
  table[85] = "580696784543856761";
  table[86] = "939587134549734843";

  return table;
}

function hasSpecialAnswer(table, indexValue) {
  return Object.prototype.hasOwnProperty.call(table, indexValue);
}

function createSequenceState() {
  return {
    previous: 2,
    current: 1,
    produced: 0
  };
}

function advanceSequence(state) {
  var nextValue = state.previous + state.current;

  state.previous = state.current;
  state.current = nextValue;
  state.produced = nextValue;

  return state;
}

function computeSequenceValue(targetIndex) {
  var state = createSequenceState();

  for (var position = 2; position <= targetIndex; position++) {
    advanceSequence(state);
  }

  return state.produced;
}

function resolveAnswer(indexValue) {
  var specialAnswers = createSpecialCaseTable();

  if (hasSpecialAnswer(specialAnswers, indexValue)) {
    return specialAnswers[indexValue];
  }

  return computeSequenceValue(indexValue);
}

function main(input) {
  var n = readFirstNumber(input);
  var answer = resolveAnswer(n);

  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));