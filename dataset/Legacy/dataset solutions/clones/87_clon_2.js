require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .some(function (currentInputLine) {
    let coordinateComponents = currentInputLine.split(' ');

    console.log(
      (
        (coordinateComponents[3] - coordinateComponents[1]) /
        (coordinateComponents[2] - coordinateComponents[0])
      ).toFixed(6) ===
      (
        (coordinateComponents[7] - coordinateComponents[5]) /
        (coordinateComponents[6] - coordinateComponents[4])
      ).toFixed(6)
        ? 'YES'
        : 'NO'
    );
  });
