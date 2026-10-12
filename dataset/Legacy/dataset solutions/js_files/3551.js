var lines = [];
//前後の文字がつながっているかを確認するためハッシュ化
var checkSpell = {};
//標準出力
var stdout = "Yes";
//一つ前の最後の文字を初期化
var lastWord = ""

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
    var str = lines[i].replace(/\r?\n/g,"");
    if(checkSpell.str != undefined || str.slice(1) == lastWord){
      stdout = "No";
      break;
    }
    lastWord = str.slice(-1);
  }
  console.log(stdout);
});
