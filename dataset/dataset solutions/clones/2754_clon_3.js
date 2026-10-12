function Main(input) {
  var lines = input.trim().split("\n");
  var list = lines[1].split(" ").map(function(v) {
    return parseInt(v, 10);
  });

  while (list.length > 2) {
    var tmpList = list.slice();
    var edgeValue = 1e9 + 1;

    tmpList[0] = edgeValue;
    tmpList[tmpList.length - 1] = edgeValue;

    var listMin = edgeValue;
    var listMinIndex = -1;

    for (var i = 1; i < tmpList.length - 1; i++) {
      if (tmpList[i] < listMin) {
        listMin = tmpList[i];
        listMinIndex = i;
      }
    }

    var left = list[listMinIndex - 1];
    var center = list[listMinIndex];
    var right = list[listMinIndex + 1];

    list[listMinIndex - 1] = left + center;
    list[listMinIndex + 1] = right + center;

    list.splice(listMinIndex, 1);
  }

  var output = Number(list[0]) + Number(list[1]);
  console.log(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));