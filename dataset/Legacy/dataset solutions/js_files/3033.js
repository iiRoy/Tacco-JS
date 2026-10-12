function main(arg) {
    var args = arg.split('\n');
    var N = +args[0];
    var S = args[1];
    var K = +args[2];
 
    var tg = S[K];
 
    var arr = [];
    for(var i = 0; i < N; i++){
        if(S[i] !== tg){
            arr.push('*');
        }else{
            arr.push(S[i]);
        } 
    }
    console.log(arr.join(''));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));