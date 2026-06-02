"use strict";

const fs = require("fs");

const run = source => {
  const rows = source.trim().split("\n");
  const [N, K] = rows[0].split(" ").map(value => parseInt(value));
  let state = rows[1].split(" ").map(value => parseInt(value));

  for (let step = 0; step < K; step++) {
    const boundaries = [];

    for (let center = 0; center < N; center++) {
      const power = state[center];
      const left = Math.max(0, center - power);
      const right = Math.min(center + power + 1, N);

      boundaries.push([left, 1]);
      boundaries.push([right, -1]);
    }

    boundaries.sort((a, b) => a[0] - b[0]);

    const next = new Array(N);
    let active = 0;
    let cursor = 0;

    for (let position = 0; position < N; position++) {
      while (cursor < boundaries.length && boundaries[cursor][0] <= position) {
        active += boundaries[cursor][1];
        cursor++;
      }
      next[position] = active;
    }

    let completed = true;
    for (let position = 0; position < N; position++) {
      if (next[position] !== N) {
        completed = false;
        break;
      }
    }

    state = next;
    if (completed) {
      break;
    }
  }

  console.log(state.join(" "));
};

run(fs.readFileSync("/dev/stdin", "utf8"));
