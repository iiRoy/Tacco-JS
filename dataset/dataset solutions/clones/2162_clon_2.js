var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "sourceItems" : rawData,
  "currentIdx" : 0,
  "totalCount" : rawData.length,
  "retrieveNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var currentItem = this.sourceItems[this.currentIdx];
    this.currentIdx++;
    return currentItem;
  },
  "hasMore" : function() {
    return (this.currentIdx < this.totalCount);
  }
};

ProcessData();

function getNextItem() {
  return dataStream.retrieveNext();
}

function checkMoreItems() {
  return dataStream.hasMore();
}

function displayOutput(messageContent) {
  console.log(messageContent);
} // Standard output function

function logError(messageContent) {
  console.error(messageContent);
} // Standard error logging

//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((val) => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((val) => Number(val));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (err) {
    return inputValue;
  }
}

function ProcessData() {
  var digitList = transformInput(getNextItem(), 7);
  var listLength = digitList.length;
  var finalResult = 0;
  var digitFrequency = {};

  for (var idx = listLength - 1; idx >= 0; idx--) {
    if (digitFrequency[digitList[idx]] == null) {
      digitFrequency[digitList[idx]] = 1;
    } else {
      digitFrequency[digitList[idx]]++;
    }

    if (digitList[idx] == 10) {
      logError("10が出てきた:" + idx);
      //output--;
    }

    if (digitList[idx] >= 5) {
      finalResult += (10 - digitList[idx]);
      digitList[idx] = 0;
      if (idx != 0) {
        digitList[idx - 1]++;
      } else {
        finalResult++;
      }
    } else {
      finalResult += digitList[idx];
    }
  }
  displayOutput(finalResult);
  //なぜか6回分足しすぎてる
  logError(digitFrequency);
}
