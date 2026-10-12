function main(arg) {
  var input = arg[0];
    if(input.length %2 === 0) {
        var str1 = input.substring(0,input.length/2).split("").reverse().join("");
        var str2 = input.substring(input.length/2 ,input.length+1);
    } else {
        var str1 = input.substring(0,Math.floor(input.length/2) ).split("").reverse().join("");
        var str2 = input.substring(Math.floor(input.length/2)+1 ,input.length+1);
    }
    var count = 0;
    for(var i=0; i<　Math.floor(input.length/2);i++){
        if(str1.charAt(i) !== str2.charAt(i)){
            count++;
        }
    }
    console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));