function solveGame(source) {
  var rows = source.split("\n");
  var header = rows[0].split(" ");
  var count = parseInt(header[0]);
  var limit = parseInt(header[1]);
  var moves = rows[1].split(" ").map(function (entry) {
    return parseInt(entry);
  });

  new Array(limit + 1);

  var border = moves[0];
  var usefulMoves = [];
  for (var m = 0; m < count; m++) {
    if (moves[m] > 0) {
      usefulMoves.push(moves[m]);
    }
  }

  var forcedFirst = new Set();
  var answer = 0;

  function spreadFromSecond(position) {
    for (var q = 0; q < usefulMoves.length; q++) {
      var next = position + usefulMoves[q];
      if (next >= border && next <= limit) {
        forcedFirst.add(next);
      }
    }
  }

  for (var base = 0; base < border; base++) {
    spreadFromSecond(base);
  }

  for (var pile = border; pile < limit + 1; pile++) {
    if (forcedFirst.has(pile)) {
      answer = "First";
    } else {
      answer = "Second";
      spreadFromSecond(pile);
    }
  }

  if (limit < border) {
    answer = "Second";
  }

  console.log('%s', answer);
  return answer;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=solveGame(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}

solveGame(require("fs").readFileSync("/dev/stdin", "utf8"));
