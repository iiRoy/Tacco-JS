function Main(input) {
    input=input.split("\n");
    var num=parseInt(input[0],10);
    var str=input[1];
    
    var count=0;
    
    for(var i=1;i<=num;++i){
        for(var j=i+1;j<=num;++j){
            for(var k=j+1;k<=num;++k){
                if(k-j!=j-i){
                    if(str[i-1]!=str[j-1]){
                        if(str[i-1]!=str[k-1]){
                            if(str[j-1]!=str[k-1]){
                                count++;
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));