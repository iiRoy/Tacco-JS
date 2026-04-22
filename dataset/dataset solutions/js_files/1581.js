function Main(input) {
  const lines = input.split('\n');
  const HW = lines[0].split(' ').map(i => parseInt(i));
  const S = lines[1].split(' ').map(i => parseInt(i));
  const G = lines[2].split(' ').map(i => parseInt(i));
  const M = lines.splice(3, HW[0]).map(r => {
    return r.split('');
  });
  const queue = [];
  const search = (pos, nWarp) => {
    const r = pos[0];
    const c = pos[1];
    if (r < 0 || HW[0] - 1 < r || c < 0 || HW[1] - 1 < c) {
      return;
    }
    const currentSocre = M[r][c];
    if (currentSocre === '#') {
      return;
    } else if (currentSocre === '.' || currentSocre > nWarp) {
      M[r][c] = nWarp;
      queue.push([[r + 1, c], nWarp]);
      queue.push([[r - 1, c], nWarp]);
      queue.push([[r, c + 1], nWarp]);
      queue.push([[r, c - 1], nWarp]);
      for (let h = -2; h < 3; h++) {
        for (let w = -2; w < 3; w++) {
          queue.push([[r + h, c + w], nWarp + 1]);
        }
      }
    }
  }
  queue.push([[S[0]-1, S[1]-1], 0]);
  while (queue.length !== 0) {
    const item = queue.shift();
    search(item[0], item[1]);
  }
  console.log(M[G[0]-1][G[1]-1] !== '.'? M[G[0]-1][G[1]-1]: -1);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
