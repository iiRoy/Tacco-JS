/*
  This script reads input from standard input,
  processes each line, and prints a result.
*/
require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .map(function (i) {
        // Split the input line into components
        c = i.split(' '),console.log(
            Math.abs(
                (c[2] - c[0]) * (c[6] - c[4]) + (c[3] - c[1]) * (c[7] - c[5])
            ) < 1e-10 ? 'NO' ,'YES'
        )})
/*
  End of script.
  The logic involves checking if two rectangles overlap.
*/