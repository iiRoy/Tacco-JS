process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(input){
    var line = input.trim().split("\n");
    var i = 0;
    while(true){
        var N = parseInt(line[i].trim());
        if( N === 0 ){
            break;
        }
        else{
            var found, len, k, res, uid;
            var qualified = [], amount = [];
            for(var j=0;j<N;++j){
                var dataset = line[i++].trim().split(" ");
                res = parseInt(dataset[1]) * parseInt(dataset[2]);
                len = qualified.length;
                
                found = 0;
                len = qualified.length;
                uid = parseInt(dataset[0]);
                for(k=0;k<len;++k){
                    if(qualified[k] === uid){
                        found = 1;
                        amount[k] = amount[k] + res;
                        break;
                    }
                }
                
                if( found === 0 ){
                    qualified.push(uid);
                    amount.push(res);
                }
            }
            
            found = 0;
            len = qualified.length;
            for(k=0;k<len;++k){
                if( amount[k] >= 1000000 ){
                    console.log(qualified[k]);
                    found = 1;
                }
            }
            if( found === 0 ){
                console.log("NA");
            }
        }
    }
});