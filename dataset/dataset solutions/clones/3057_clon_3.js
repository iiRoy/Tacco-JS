function Main(input) {
  "use strict";

  var lines = input.split("\n");
  var first = lines[0].split(" ");
  var n = parseInt(first[0], 10);
  var k = parseInt(first[1], 10);
  var chars = lines[1].split("");

  var count = chars.length;
  var stands = [];
  var stands_0 = [];
  var stands_1 = [];

  var x = 1;
  var prev = chars[0];

  for (var i = 1; i < count; i++) {
    var c = chars[i];

    if (c !== prev) {
      stands[stands.length] = x;

      if (c === "1") {
        stands_1[stands_1.length] = x;
      } else {
        stands_0[stands_0.length] = x;
      }

      x = 1;
    } else {
      x = x + 1;
    }

    prev = c;
  }

  if (k >= stands_0.length) {
    console.log(n);
    return;
  }

  var w;
  if (chars[0] === "1") {
    w = k * 2 + 1;
  } else {
    w = k * 2 + 2;
  }

  var ww = [];
  for (var j = 0; j < w && j < stands.length; j++) {
    ww.push(stands[j]);
  }

  function sum(arr) {
    var total = 0;
    for (var s = 0; s < arr.length; s++) {
      total += arr[s];
    }
    return total;
  }

  var nums = [];
  nums.push(sum(ww));

  var stands_count = stands.length;

  for (var p = w; p < stands_count; p++) {
    ww.pop();
    ww.push(stands[p]);
    nums.push(sum(ww));
  }

  var answer = 0;
  for (var q = 0; q < nums.length; q++) {
    if (nums[q] > answer) {
      answer = nums[q];
    }
  }

  console.log("%s", answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));