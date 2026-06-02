var sourceObj = init();

Main();

function nextInt() {
  var rawValue = next();
  return myconv(rawValue, 1);
}

function nextStrArray() {
  var rawLine = next();
  return myconv(rawLine, 2);
} //半角スペース分割

function nextIntArray() {
  var rawLine = next();
  return myconv(rawLine, 4);
} //半角スペース + 数値化

function nextCharArray() {
  var rawLine = next();
  return myconv(rawLine, 6);
} //1文字分割

function next() {
  return sourceObj.next();
}

function hasNext() {
  return sourceObj.hasNext();
}

function myin() {
  var fs = require("fs");
  var text = fs.readFileSync("/dev/stdin", "utf8");
  var trimmedText = text.trim();
  return trimmedText.split("\n");
}

function init() {
  var inputFile = myin();
  var returnObj = {
    "list": inputFile,
    "index": 0,
    "max": inputFile.length,
    "hasNext": function () {
      var stillExists = this.index < this.max;
      return stillExists;
    },
    "next": function () {
      if (!this.hasNext()) {
        return "";
      } else {
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };
  return returnObj;
}

function myout(t) {
  console.log(t);
} //標準出力

function myerr(t) {
  console.error(t);
} //標準エラー出力

//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i, no) {
  try {
    switch (no) {
      case 1: {
        var parsedValue = parseInt(i);
        return parsedValue;
      }
      case 2: {
        var separated = i.split(" ");
        return separated;
      }
      case 4: {
        var separatedNums = i.split(" ");
        var numbered = separatedNums.map((a) => Number(a));
        return numbered;
      }
      case 6: {
        var chars = i.split("");
        return chars;
      }
      case 7: {
        var charNums = i.split("").map((a) => Number(a));
        return charNums;
      }
      case 8: {
        var joinedSpace = i.join(" ");
        return joinedSpace;
      }
      case 9: {
        var joinedLine = i.join("\n");
        return joinedLine;
      }
      case 0: {
        var joinedEmpty = i.join("");
        return joinedEmpty;
      }
      default:
        return i;
    }
  } catch (e) {
    return i;
  }
}

function applyMove(stateList, stateSet, pairInfo) {
  var fromIndex = pairInfo[0] - 1;
  var toIndex = pairInfo[1] - 1;

  stateList[fromIndex]--;
  stateList[toIndex]++;

  var sourceHasRed = stateSet.has(fromIndex);
  if (sourceHasRed) {
    stateSet.add(toIndex);
  }

  var sourceIsEmpty = stateList[fromIndex] == 0;
  if (sourceIsEmpty) {
    stateSet.delete(fromIndex);
  }
}

function Main() {
  var one = nextIntArray();
  var N = one[0];
  var M = one[1];
  var list = new Array(N);
  list.fill(1);
  var redVisited = new Set([0]);
  var lastRed = 0;

  for (var i = 0; i < M; i++) {
    var tmp = nextIntArray();
    applyMove(list, redVisited, tmp);
  }

  var answer = redVisited.size;
  myout(answer);
}
