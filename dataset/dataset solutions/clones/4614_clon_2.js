function Solve(src)
{
  var count = src.split("\n")[0].split(" ")[0] - 0;
  var limit = src.split("\n")[0].split(" ")[1] - 0;
  var times = src.split("\n")[1].split(" ").map(Number);

  var total = 0;
  for (var idx = 1; idx < count; idx++) {
    if (times[idx] - times[idx - 1] < limit) {
      total += times[idx]- times[idx - 1];
    }
    else {
      total += limit;
    }
  }

  console.log(total+limit);
  return;
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
