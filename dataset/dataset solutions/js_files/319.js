var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var line=(input.trim()).split("\n");
var i;
for(i=0;i<line.length;++i){
    var N = parseInt(line[i]);
    if( N === 0 ){
        break;
    }
    else{
        var found, len, k;
        var m, n, mn, i, j, carry, tmp;
        
        var qualified = [];
        for(var j=0;j<N;++j){
            var dataset = line[++i].split(' ');
            var a1, a2;
            // Big number
            if(dataset[1].length > dataset[2].length){
                m = dataset[1].length;
                n = dataset[2].length;
                a1 = dataset[1].split('');
                a2 = dataset[2].split('');
            }
            else{
                m = dataset[2].length;
                n = dataset[1].length;
                a1 = dataset[2].split('');
                a2 = dataset[1].split('');
            }
            
            found = 0;
            mn = m + n;
            if(mn >= 7){
                var buf = new Array(mn+1);
                for(j=0;j<=mn;++j) buf[j] = 0;
                
                for(j=m-1;j>=0;--j){
                    for(carry = 0,i=n-1;i>=0;--i){
                        tmp = parseInt(a1[j]) * parseInt(a2[i]) + buf[i+j+1] + carry;
                        buf[i+j+1] = tmp % 10;
                        carry = parseInt(tmp / 10);
                    }
                    buf[j] = carry;
                }
                
                for(j=0;j<=mn;++j){
                    if(buf[j] > 0) break;
                }
                
                if(mn - j >= 7){
                    found = 1;
                }
            }

            if( found ){
                found = 0;
                for(k=0, len=qualified.length;k<len;++k){
                    if(qualified[k] == dataset[0]){
                        found = 1;
                        break;
                    }
                }
                    
                if( found === 0 ){
                    qualified.push(dataset[0]);
                }
            }
        }
            
        len = qualified.length;
        if( len === 0 ){
            console.log("NA");
        }
        else{
            for(k=0;k<len;++k){
                console.log(qualified[k]);
            }
        }
    }
}