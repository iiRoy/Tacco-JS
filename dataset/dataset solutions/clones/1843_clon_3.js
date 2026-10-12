function Main(input) {
  input = input.trim().split("\n");
  var N = parseInt(input[0], 10);
  var P = input[1].split(" ").map(function(i){ return parseInt(i, 10); });
  var map = makeBoard(N + 2, N + 2, 0);

  function makeBoard(h, w, v){
    var board = new Array(h);
    for(var y = 0; y < h; y++){
      board[y] = new Array(w);
      for(var x = 0; x < w; x++){
        board[y][x] = v;
      }
    }
    return board;
  }

  for(var ring = Math.ceil(N / 2 - 1); ring >= 0; ring--){
    for(var y = 1; y <= N; y++){
      for(var x = 1; x <= N; x++){
        if(y === ring + 1 || x === ring + 1 || y === N - ring || x === N - ring){
          map[y][x] = ring;
        }
      }
    }
  }

  for(var i = 1; i <= N; i++){
    map[i][0] = -2;
    map[i][N + 1] = -2;
  }
  for(var i = 0; i < N + 2; i++){
    map[0][i] = -2;
    map[N + 1][i] = -2;
  }

  var ans = 0;

  function touchZero(y, x){
    if(y >= 1 && y <= N && x >= 1 && x <= N && map[y][x] >= 0 && memo2[y][x] === 0){
      memo2[y][x] = 1;
      map[y][x] = 0;
    }
  }

  function checkout(y, x){
    map[y][x] = -2;

    touchZero(y - 1, x);
    touchZero(y + 1, x);
    touchZero(y, x - 1);
    touchZero(y, x + 1);

    if(y >= 2 && map[y - 1][x] === -2 && memo2[y - 1][x] === 0){
      memo2[y - 1][x] = 1;
      checkout(y - 1, x);
    }
    if(y <= N - 1 && map[y + 1][x] === -2 && memo2[y + 1][x] === 0){
      memo2[y + 1][x] = 1;
      checkout(y + 1, x);
    }
    if(x >= 2 && map[y][x - 1] === -2 && memo2[y][x - 1] === 0){
      memo2[y][x - 1] = 1;
      checkout(y, x - 1);
    }
    if(x <= N - 1 && map[y][x + 1] === -2 && memo2[y][x + 1] === 0){
      memo2[y][x + 1] = 1;
      checkout(y, x + 1);
    }
  }

  function check(y, x){
    var num = map[y][x];

    if(y > 2 && map[y - 1][x] > num && memo[y - 1][x] === 0){
      memo[y - 1][x] = 1;
      check(y - 1, x);
      map[y - 1][x]--;
    }
    if(y < N && map[y + 1][x] > num && memo[y + 1][x] === 0){
      memo[y + 1][x] = 1;
      check(y + 1, x);
      map[y + 1][x]--;
    }
    if(x > 2 && map[y][x - 1] > num && memo[y][x - 1] === 0){
      memo[y][x - 1] = 1;
      check(y, x - 1);
      map[y][x - 1]--;
    }
    if(x < N && map[y][x + 1] > num && memo[y][x + 1] === 0){
      memo[y][x + 1] = 1;
      check(y, x + 1);
      map[y][x + 1]--;
    }
  }

  for(var i = 0; i < P.length; i++){
    var pos = P[i] - 1;
    var y = Math.floor(pos / N) + 1;
    var x = pos % N + 1;

    ans += map[y][x];

    var memo = makeBoard(N + 2, N + 2, 0);
    var memo2 = makeBoard(N + 2, N + 2, 0);

    check(y, x);
    map[y][x] = -1;

    if(map[y - 1][x] === -2 || map[y + 1][x] === -2 || map[y][x - 1] === -2 || map[y][x + 1] === -2){
      map[y][x] = -2;

      if(y >= 2 && map[y - 1][x] >= 0){
        map[y - 1][x] = 0;
      }
      if(y <= N - 1 && map[y + 1][x] >= 0){
        map[y + 1][x] = 0;
      }
      if(x >= 2 && map[y][x - 1] >= 0){
        map[y][x - 1] = 0;
      }
      if(x <= N - 1 && map[y][x + 1] >= 0){
        map[y][x + 1] = 0;
      }

      if(y >= 2 && map[y - 1][x] === -1){
        map[y - 1][x] = -2;
        checkout(y - 1, x);
      }
      if(y <= N - 1 && map[y + 1][x] === -1){
        map[y + 1][x] = -2;
        checkout(y + 1, x);
      }
      if(x >= 2 && map[y][x - 1] === -1){
        map[y][x - 1] = -2;
        checkout(y, x - 1);
      }
      if(x <= N - 1 && map[y][x + 1] === -1){
        map[y][x + 1] = -2;
        checkout(y, x + 1);
      }
    }
  }

  console.log(String(ans));
  return ans;
}

function debug(n){
  var input = document.getElementById("input" + n).value;
  var ans = Main(input);
  var result = "WA";
  if(String(ans) === document.getElementById("output" + n).value.split("\n")[0]){
    result = "AC";
  }
  document.getElementById("result" + n).innerHTML = result;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));