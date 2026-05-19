var fs = require('fs');

var dataLen = fs.fstatSync(process.stdin.fd).size;
var dataBuf = new Buffer(dataLen);
var readBytes = fs.readSync(process.stdin.fd, dataBuf, 0x0, dataLen, 0x0);
var rawData = dataBuf.toString('utf8', 0x0, readBytes).split('\n');

processInput();

function processInput() {
  var idx = 0x0;
  var caseNum = 0x1;

  while (true) {
    var maxCap = +rawData[idx++];
    if (!maxCap) {
      break;
    }

    var itemCount = +rawData[idx++];
    var prevDP = new Int32Array(maxCap + 0x1);

    for (var itemIdx = itemCount; itemIdx--;) {
      var itemData = rawData[idx++].split(",");
      var itemVal = +itemData[0x0];
      var itemWgt = +itemData[0x1];

      var currDP = new Int32Array(maxCap + 0x1);

      for (var currWgt = 0x1; currWgt < itemWgt; currWgt++) {
        currDP[currWgt] = prevDP[currWgt];
      }

      for (var currWgt = itemWgt; currWgt <= maxCap; currWgt++) {
        currDP[currWgt] = getMaximum(prevDP[currWgt - itemWgt] + itemVal, prevDP[currWgt]);
      }
      prevDP = currDP;
    }

    var finalWgt = 0b1111101001;
    var finalVal = 0x0;
    for (var itemIdx = 0x0; itemIdx <= maxCap; itemIdx++) {
      var currentVal = prevDP[itemIdx];
      if (currentVal > finalVal) {
        finalVal = currentVal;
        finalWgt = itemIdx;
      }
    }

    console.log("Case " + caseNum++ + ":\n" + finalVal + "\n" + finalWgt);
  }
}

function getMaximum(valA, valB) {
  var diff = valA - valB;
  return valA - (diff & (diff >> 0x1f));
}
