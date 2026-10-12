function Main(input) {
  const rows = input.split("\n");
  const amount = parseInt(rows[0], 10);
  const numbers = rows[1].split(" ").map(function (piece) {
    return parseInt(piece, 10);
  });

  function buildInitialState(list) {
    let head = list[0];
    let total = 0;

    if (head === 0) {
      const neighbor = list[1];

      if (neighbor >= 0) {
        head = 1 - neighbor;
        if (head === 0) head = -1;
        total = Math.abs(head);
      } else {
        head = Math.abs(neighbor) - 1;
        if (head === 0) head = 1;
        total = head;
      }
    }

    return { edge: head, total: total };
  }

  function projectToRequiredSide(state, nextValue) {
    const border = state.edge > 0 ? -1 : 1;
    const candidate = state.edge + nextValue;
    const outside = border > 0 ? candidate <= 0 : candidate >= 0;

    if (!outside) {
      return { edge: candidate, total: state.total };
    }

    return {
      edge: border,
      total: state.total + Math.abs(candidate - border)
    };
  }

  if (!(amount > 0)) {
    console.log(0);
    return;
  }

  let machine = buildInitialState(numbers);
  let index = 1;

  while (index < amount) {
    machine = projectToRequiredSide(machine, numbers[index]);
    index++;
  }

  console.log(machine.total);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
