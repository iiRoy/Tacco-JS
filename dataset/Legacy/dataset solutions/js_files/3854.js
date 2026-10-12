"use strict";

var main = function main(input) {
  var args = input.split('\n');
  var H = args[0].split(' ')[0];
  var W = args[0].split(' ')[1];
  var s = [];
  var flagOut = true;

  for (var i = 1; i < H; i++) {
    s.push(args[i]);
  } // 一つずつ参照していって上下左右に#なかったらNG


  for (var _i = 0; _i < H; _i++) {
    var line = s[_i].split('');

    for (var j = 0; j < W; j++) {
      var _flag = false;
      var target = line[j]; // 左端じゃなかったら左を見る

      if (j != 0) {
        if (line[j - 1] == '#') {
          _flag = true;
          break;
        }
      } // 右端じゃなかったら右を見る


      if (j < W - 1) {
        if (line[j + 1] == '#') {
          _flag = true;
          break;
        }
      } // 上端じゃなかったら上を見る


      if (_i != 0) {
        var up = s[_i - 1].split('');

        if (up[j] == '#') {
          _flag = true;
          break;
        }
      } // 下端じゃなかったら下を見る


      if (_i < H - 1) {
        var down = s[_i + 1].split('');

        if (down[j] == '#') {
          _flag = true;
          break;
        }
      }
    }

    if (!flag) {
      flagOut = false;
      console.log("No");
      break;
    }
  }

  if (flagOut) {
    console.log("Yes");
  }
};

main(require('fs').readFileSync('/dev/stdin', 'utf-8'));