var hoge = require('fs').readFileSync('/dev/stdin', 'utf8');
var num = hoge.split('\n');

for(var i = 0, iz = num.length; i < iz; i++ ){
    var init = i + 1;
    console.log('Case ' + init +':'+ num[i]);
}