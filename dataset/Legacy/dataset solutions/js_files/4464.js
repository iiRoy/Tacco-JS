/**
 * Created by kagawa on 2017/07/29.
 */
function main(input){
    input = input.split("\n");
    var a = [];
    var b = [];
    var tmp = [];
    var N=0;
    for(var i=0; i<input.length; i++){
        tmp = input[i].split(" ");
        a[i] = Number(tmp[0]);
        if(a[i] > N){
            N = a[i];
        }
        b[i] = Number(tmp[1]);
        if(b[i]>N){
            N = b[i];
        }
    }


    var index = -1;
    while(true){
        index = a.indexOf(1, index+1);
        if(index<0){
            console.log("IMPOSSIBLE");
            return;
        }else{
            //console.log(index);
            var index_next = -1;
            while(true){
                index_next = a.indexOf(b[index], index_next+1);
                //console.log(index_next);
                if(index_next<0){
                    break;
                }else{
                    if(b[index_next]==N){
                        console.log("POSSIBLE");
                        return;
                    }
                }
            }
        }
    }


}

main(require("fs").readFileSync("/dev/stdin", "utf8"));