var N = 0;

function Main(input) {
  const args = input.split('\n');
  const NQ = args[0].split(' ');
  N = parseInt(NQ[0]);

  const searchIndex = {};
  var tiles = [];

  for(var i = 0; i < args[1].length; i++) {
      var ch = args[1][i];
      tiles[i] = 1;
      if (!searchIndex[ch]) {
        searchIndex[ch] = []
      }
    searchIndex[ch].push(i);
  }

  for (var i = 2; i < args.length; i++) {
    var td = args[i].split(' ');
    var t = td[0];
    var idx = searchIndex[t];
    if (!idx) {
      continue;
    }
    var d = td[1];
    if (d === "R") {
      for (var j = (idx.length - 1); j >= 0; j--) {
        move(tiles, idx[j], 1);
      }
    } else {
      for (var k = 0; k < idx.length; k++) {
        move(tiles, idx[k], -1);
      }
    }
  }
  var sum = 0;
  tiles.forEach(f => sum += f);

  console.log(sum);
}

function move(tiles, index, direction) {
  var to = index + direction;
  var count = tiles[index];
  tiles[index] = 0;
  if (to < 0 || to >= N) {
    return;
  }
  tiles[to] += count;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));