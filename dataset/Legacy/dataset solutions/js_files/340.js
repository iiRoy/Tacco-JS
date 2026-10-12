(function () {
  var input = '';
  
  function main () {
    var i,
        inputLen,
        inputContent,
        BookIndex = {};

    inputLen = input.length - 1;
    
    for (i = 0; i < inputLen; i += 1) {
      inputContent = input[i].split(' ');

      if (BookIndex.hasOwnProperty(inputContent[0])) {
        BookIndex[inputContent[0]].push(inputContent[1]);
        BookIndex[inputContent[0]].sort(sortNum);
      } else {
        BookIndex[inputContent[0]] = [];
        BookIndex[inputContent[0]].push(inputContent[1]);
      }
    }

    BookIndex = sortHash(BookIndex);

    for (var prop in BookIndex) {
      console.log(prop);
      console.log(concatenateArrayElem(BookIndex[prop]));
    }
  }

  // Array.sortでの数値昇順化のための比較関数
  function sortNum (a, b) {
    return a - b;
  }

  // 連想配列の辞書順化
  function sortHash (hash) {
    var i,
        keysLen,
        keys = [],
        sortedHash = {};
    
    for (var k in hash) {
      keys.push(k);
    }
    
    keys.sort();
    keysLen = keys.length;

    for (i = 0; i < keysLen; i += 1) {
      sortedHash[keys[i]] = hash[keys[i]];
    }

    return sortedHash;
  }
  
  function concatenateArrayElem(ary) {
    var i,
        resultStr = '',
        len = ary.length;

    for (i = 0; i < len; i += 1) {
      resultStr += ary[i];

      if (i != len - 1) {
        resultStr += ' ';
      }
    }

    return resultStr;
  }

  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    input += chunk;
  });

  process.stdin.on('end', function () {
    input = input.split('\n');
    main();
  });
}());