var lines = [];
//前後の文字がつながっているかを確認するためハッシュ化
var checkSpell = {};
//標準出力
var stdout = "Yes";
//一つ前の最後の文字を初期化
var lastWord = null;

var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', function(line) {
  lines.push(line);
});
reader.on('close', function() {
  var checkSpell = {};
  for(var i = 1; i < lines[0]; i++) {
    //既出か検索
    var str = lines[i];
    if(checkSpell[str] != undefined || ( lastWord != null && str.slice(0,1) != lastWord)){
      console.log(str)
      stdout = "No";
      break;
    }
    checkSpell[str] = 'exists';
    lastWord = str.slice(0,-1);
  }
  console.log(stdout);
});
