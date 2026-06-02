const raw = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = raw.trim().split('\n');

const baseColors = ['r', 'g', 'b'];

function thirdColor(a, b) {
  for (const color of baseColors) {
    if (color !== a && color !== b) {
      return color;
    }
  }
}

function complete(state) {
  for (let i = 1; i < state.length; i++) {
    if (state[i] !== state[0]) {
      return false;
    }
  }
  return true;
}

function forwardNeighbors(state) {
  const out = [];
  for (let i = 0; i + 1 < state.length; i++) {
    const a = state[i];
    const b = state[i + 1];

    if (a === b) {
      continue;
    }

    const c = thirdColor(a, b);
    out.push(state.slice(0, i) + c + c + state.slice(i + 2));
  }
  return out;
}

function reverseNeighbors(state, alphabet) {
  const out = [];

  for (let i = 0; i + 1 < state.length; i++) {
    const current = state[i];

    if (current !== state[i + 1]) {
      continue;
    }

    for (const a of alphabet) {
      for (const b of alphabet) {
        if (a === b) {
          continue;
        }
        if (thirdColor(a, b) !== current) {
          continue;
        }
        out.push(state.slice(0, i) + a + b + state.slice(i + 2));
      }
    }
  }

  return out;
}

function shortestDistance(start) {
  if (complete(start)) {
    return 0;
  }

  const alphabet = [];
  const seenChar = new Set();

  for (const ch of start) {
    if (!seenChar.has(ch)) {
      seenChar.add(ch);
      alphabet.push(ch);
    }
  }
  for (const ch of baseColors) {
    if (!seenChar.has(ch)) {
      seenChar.add(ch);
      alphabet.push(ch);
    }
  }

  const frontDistance = new Map([[start, 0]]);
  let front = new Set([start]);

  const backDistance = new Map();
  let back = new Set();

  for (const ch of alphabet) {
    const terminal = ch.repeat(start.length);
    if (!backDistance.has(terminal)) {
      backDistance.set(terminal, 0);
      back.add(terminal);
    }
  }

  while (front.size > 0 && back.size > 0) {
    if (front.size <= back.size) {
      const nextFront = new Set();

      for (const state of front) {
        const baseDepth = frontDistance.get(state);

        for (const next of forwardNeighbors(state)) {
          if (frontDistance.has(next)) {
            continue;
          }

          const depth = baseDepth + 1;
          if (backDistance.has(next)) {
            return depth + backDistance.get(next);
          }

          frontDistance.set(next, depth);
          nextFront.add(next);
        }
      }

      front = nextFront;
    } else {
      const nextBack = new Set();

      for (const state of back) {
        const baseDepth = backDistance.get(state);

        for (const previous of reverseNeighbors(state, alphabet)) {
          if (backDistance.has(previous)) {
            continue;
          }

          const depth = baseDepth + 1;
          if (frontDistance.has(previous)) {
            return depth + frontDistance.get(previous);
          }

          backDistance.set(previous, depth);
          nextBack.add(previous);
        }
      }

      back = nextBack;
    }
  }

  return -1;
}

for (const line of lines) {
  if (line === '0') {
    continue;
  }

  const answer = shortestDistance(line);
  console.log(answer < 0 ? 'NA' : answer);
}
