(function(hoge){
    var fuga = hoge.split('\n');
    for(var i = 0, iz = fuga.length; i < iz; i++){
        var bar[i] = fuga[i].split(' ');
        var a =  bar[i][0] - 0;
        var b =  bar[i][1] - 0;
        if(a === 0 && b === 0){
            break;
        }
        if(a <= b){
            console.log(a + ' ' + b);
        }else{
            console.log(b + ' ' + a);
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));