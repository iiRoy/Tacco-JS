function Main(input) {
    input = input.split("\n");
    var line = input[0].split(" ");
    var num = parseInt(line[0]);
    var hi = parseInt(line[1]);
    var lo = parseInt(line[2]);
    var maxHP = 0;
    var maxInd = 0;
    var enm = [];
    var killcount = 0;
    var ans = 0;
    
    for(var i = 0; i<num; i++){
        enm[i] = parseInt(input[i+1]);
        if(enm[i] > maxHP){
            maxHP = enm[i];
            maxInd = i;
        }
    }
    
//    console.log(maxHP+" "+maxInd);
    var max = Math.ceil(maxHP / (lo));
    var min = 0
    var temp = 0
    ans = Math.ceil(maxHP / (2*lo));
    var basedamage = ans*lo;
    var flag = 0;
    var extra = 0;
    while(1){
        flag++;
        basedamage = ans * lo;
        for(var i = 0; i<num; i++){
            if(enm[i]>basedamage){
                extra += Math.ceil((enm[i] - basedamage) / (hi - lo));
            }
        }

        if(extra > ans){
            temp = ans;
            ans = Math.ceil((max + ans) / 2);
            min = temp;
            
        } else if (extra < ans){
            temp = ans;
            ans = Math.ceil((min + ans) / 2);
            max = temp;
        } else {
            break;
        }
        

 //       console.log("max:"+max+" min:"+min+" ans:"+ans+" extra:"+extra);
        extra = 0;
        
    }

    console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));