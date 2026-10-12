(function(hoge){
    var num = hoge.split(' ');
    var x = num[0];
    var y  = num[1];
    console.log(Math.floor(x / y) + ' ' + x % y + ' ' + (x / y).toFixed(6) );
}(require('fs').readFileSync('/dev/stdin', 'utf8')));