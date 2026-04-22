let content = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  content += buf;
});

process.stdin.on('end', () => {
  const [diceA, diceB] = content
    .trim()
    .split('\n')
    .map(line => line.split(' ').map(n => parseInt(n, 10)))
    .map(nums => createDice(nums));

  console.log(isSameDice(diceA, diceB) ? 'Yes' : 'No');
});

const isSameDice = (diceA, diceB) => {
  const timeout = Date.now() + 400;
  while (Date.now() < timeout) {
    const dirs = ['N', 'W', 'S', 'E'];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    diceA = roll(diceA, dir);
    const isSame = diceA.right.every((n, i) => n === diceB.right[i]) && diceA.top.every((n, i) => n === diceB.top[i]);
    if (isSame) {
      return true;
    }
  }

  return false;
};

const resolve = (dice, [top, front]) => {
  const dirs = ['N', 'W', 'S', 'E'];
  while (dice.top[0] !== top || dice.top[3] !== front) {
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    dice = roll(dice, dir);
  }

  return dice;
};

const createDice = nums => ({
  top: [1, 5, 6, 2].map(n => nums[n - 1]),
  right: [1, 3, 6, 4].map(n => nums[n - 1]),
});

const roll = (dice, dir) => {
  switch (dir) {
    case 'W': {
      return Object.assign({}, dice, {
        top: [dice.right[1], dice.top[1], dice.right[3], dice.top[3]],
        right: dice.right.slice(1).concat([dice.right[0]]),
      });
    }
    case 'E': {
      return Object.assign({}, dice, {
        top: [
          dice.right[dice.right.length - 1],
          dice.top[1],
          dice.right[1],
          dice.top[3],
        ],
        right: [dice.right[3]].concat(dice.right.slice(0, -1)),
      });
    }
    case 'S': {
      return Object.assign({}, dice, {
        top: dice.top.slice(1).concat([dice.top[0]]),
        right: [dice.top[1], dice.right[1], dice.top[3], dice.right[3]],
      });
    }
    case 'N': {
      return Object.assign({}, dice, {
        top: [dice.top[3]].concat(dice.top.slice(0, -1)),
        right: [dice.top[3], dice.right[1], dice.top[1], dice.right[3]],
      });
    }
  }
};
