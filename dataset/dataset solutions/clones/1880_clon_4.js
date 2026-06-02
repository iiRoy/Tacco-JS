function solve(lines) {
  const header = lines[0].trim().split(" ");
  const n = BigInt(header[0]);
  const k = BigInt(header[1]);
  const a = lines[1].trim().split(" ").map(x => parseInt(x));

  const available = new Set();
  for (let i = 0; i < n; i++) {
    available.add(i);
    a[i]--;
  }

  const firstArrival = new Map();
  const route = [0];

  let cursor = 0;
  let step = 0;
  let repeated;

  for (;;) {
    const landing = a[cursor];
    if (available.has(landing) && !firstArrival.has(landing)) {
      firstArrival.set(landing, step);
      route.push(landing);
      cursor = landing;
      step++;
    } else {
      repeated = landing;
      break;
    }
  }

  const start = BigInt(firstArrival.get(repeated));
  const period = BigInt(step - firstArrival.get(repeated));

  const compressed = (k - start < 0n)
    ? k
    : ((k - start) % period) + start;

  const node = route[Number(compressed)];
  console.log((node + 1) + "");
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
