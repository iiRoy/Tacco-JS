var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

function main(){
    var intInput = new Int32Array(input);
    //var readLine = 0;
    var n, num, cnt, res;
    
    num = initInput.length;
    cnt = 0;
    for(n=0;n<num;++n){
        val = intInput[n];
        var prime = new Array(val);
        if( val == 1 ){
            cnt = 0;
        }
        if( val == 2 ){
            cnt = 1;
        }
        else{
            var sq, i, j, base, found;
            sq = Math.sqrt(val);
            cnt = 1;
            found = 1;
            prime[0] = 2;
            
            for(i=3;i<sq;++i){
                base = prime[0];
                for(j=0;base<=sq;++j){
                    base = prime[j];
                    res = i % base;
                    if( res == 0 ){
                        found = 0;
                        break;
                    }
                }
                if( found ){
                    prime[cnt++] = i;
                }
            }
        }
        
        console.log(cnt);
    }
}