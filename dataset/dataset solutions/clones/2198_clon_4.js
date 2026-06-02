function Main(stdin) {
  const rows = stdin.split("\n");
  const first = rows[0].split(" ")[0];
  const value = Number.parseInt(first);

  let depth = 0;

  if (value > 1) {
    if (!Number.isFinite(value)) {
      while (true) {}
    }

    let left = 1;
    let right = 2;

    while (Math.pow(2, right) <= value) {
      left = right;
      right *= 2;
    }

    while (right - left > 1) {
      const middle = Math.floor((left + right) / 2);
      if (Math.pow(2, middle) <= value) {
        left = middle;
      } else {
        right = middle;
      }
    }

    depth = left;
  }

  let result = 1;
  if (depth > 1) {
    result = (depth * depth - 1) + Math.pow(2, depth);
  }

  console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
