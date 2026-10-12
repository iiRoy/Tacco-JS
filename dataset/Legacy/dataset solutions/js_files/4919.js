function Main(input) {
  const data = input.trim().split("");
  var N = data.length;

  function jan(me, tki) {
    if (me == tki) {
      return 0;
    }
    if (me == "g" && tki == "p") {
      return -1;
    }
    if (me == "p" && tki == "g") {
      return 1;
    }
  }
  var count = 0;
  var goo = 0;
  var paa = 0;
  for (i = 0; i < N; i++) {
    if (i === 0) {
      count += jan("g", data[0]);
      goo++;
    } else {
      if (data[i] === "g" && goo > paa) {
        count += jan("p", data[i]);
        paa++;
      } else if (data[i] === "p" && goo > paa) {
        count += jan("p", data[i]);
        paa++;
      } else {
        count += jan("g", data[i]);
        goo++;
      }
    }
  }
  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
