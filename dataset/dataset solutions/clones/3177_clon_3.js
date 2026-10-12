"use strict";

function Main(input) {
  var data = input.trim().split(/\s+/).map(function(v) {
    return parseInt(v, 10);
  });

  var A = data.shift();
  var B = data.shift();
  var Q = data.shift();

  var s = data.splice(0, A);
  var t = data.splice(0, B);
  var x = data;

  var y = binarySort(x);

  var s_before = new Array(Q);
  var s_after = new Array(Q);
  var t_before = new Array(Q);
  var t_after = new Array(Q);

  var p = 0;
  var q = 0;

  for (var i = 0; i < Q; i++) {
    var point = y[i][0];

    while (p < s.length && s[p] < point) {
      p++;
    }

    s_before[i] = p > 0 ? s[p - 1] : -1e14;
    s_after[i] = p < s.length ? s[p] : 1e14;

    while (q < t.length && t[q] < point) {
      q++;
    }

    t_before[i] = q > 0 ? t[q - 1] : -1e15;
    t_after[i] = q < t.length ? t[q] : 1e15;
  }

  var ans = [];

  for (var j = 0; j < Q; j++) {
    var idx = y[j][1];
    var Y = y[j][0];

    var sb = s_before[j];
    var sa = s_after[j];
    var tb = t_before[j];
    var ta = t_after[j];

    var candidates = [
      Math.abs(sa - Y) + Math.abs(ta - sa),
      Math.abs(sa - Y) + Math.abs(tb - sa),
      Math.abs(sb - Y) + Math.abs(ta - sb),
      Math.abs(sb - Y) + Math.abs(tb - sb),
      Math.abs(ta - Y) + Math.abs(sa - ta),
      Math.abs(ta - Y) + Math.abs(sb - ta),
      Math.abs(tb - Y) + Math.abs(sa - tb),
      Math.abs(tb - Y) + Math.abs(sb - tb)
    ];

    var best = candidates[0];

    for (var k = 1; k < candidates.length; k++) {
      if (candidates[k] < best) {
        best = candidates[k];
      }
    }

    ans[idx] = best.toString(10);
  }

  console.log(ans.join("\n").trim() + "\n");
}

function binarySort(A) {
  var B = [];

  for (var i = 0; i < A.length; i++) {
    var low = 0;
    var high = B.length - 1;
    var mid = Math.floor((low + high) / 2);

    while (low <= high) {
      if (B[mid][0] < A[i]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }

      mid = Math.floor((low + high) / 2);
    }

    B.splice(mid + 1, 0, [A[i], i]);
  }

  return B;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));