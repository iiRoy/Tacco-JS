function solveHanoi(disks, source, auxiliary, target, moves) {
  if (disks === 0) {
    return;
  }

  solveHanoi(
    disks - 1,
    source,
    target,
    auxiliary,
    moves
  );

  moves.push(`${source} -> ${target}`);

  solveHanoi(
    disks - 1,
    auxiliary,
    source,
    target,
    moves
  );
}

const disks = Number(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);

const moves = [];

solveHanoi(disks, "A", "B", "C", moves);

console.log(moves.join("\n"));