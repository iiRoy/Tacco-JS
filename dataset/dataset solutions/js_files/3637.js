'use strict';
function main(arg) {
    // 処理
  	if (arg[0] != "A") {
        console.log('WA')
        return
    }


    var numC = 0
    for(var i = 1; i < arg.length; i++){
        if(i >= 2 && i <= arg.length - 2 && arg[i] == "C"){
            numC++;
            if(numC > 1){
                console.log("WA");
                return 0;
            }
        }else if(arg[i].search(/[a-z]/) == -1){
            console.log("WA");
            return 0;
        }
    }
  	if(numC != 1){
        console.log("WA")
    } else {
        console.log('AC')
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));