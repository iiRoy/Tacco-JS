function Main(input) {
    input = input.split("\n");
    var num = parseInt(input[0]);
    var data = input[1].split("");
    var ans = [];
    var flag = 0; // now 0:( 1:)
    var temp = new Array(num+1).fill(0);
    var index = 0;
    if(data[0]===")"){
        index = 1;
        flag = 1;
        temp[index]++;
    } else {
        temp[index]++;
    }
    
    for(var i = 1; i< num; i++){
        if(data[i]===data[i-1]){
            temp[index]++;
        } else {
            index++;
            temp[index]++;
        }
    }
//    console.log(temp);
 
    var diff = 0;
    var totaldiff = 0
 
    for(var i = 0; i< num; i=i+2){
        diff = temp[i] - temp[i+1];
        totaldiff+=diff;
/*        if(diff>0){
            temp[i+1]+=diff;
        } else if(diff<0){
            temp[i]-=diff;
        } */
    }
 
//    console.log(temp);
//    console.log(totaldiff); // diff+ -> ( big / diff- -> ) big
    
    var ans = "";
    var index = num;
    
    if(totaldiff<0){
        temp[0]-=totaldiff;
    } else if(totaldiff>0) {
        if (temp[0]-temp[1]<0) {
            totaldiff+=temp[1]-temp[0];
            temp[0] = temp[1];
        }
        while(1){
            if(temp[index]>0){
                if(index%2 === 0){
                    temp[index+1]+=totaldiff;
                    break;
                } else {
                    temp[index]+=totaldiff;
                    break;
                }
            } else {
                index--;
            }
        }
    } else if (temp[0]-temp[1]<0) {
        var difff = temp[1] - temp[0];
        temp[0] = temp[1];
        while(1){
            if(temp[index]>0 && index%2 === 0){
                temp[index+1]=temp[index];
                break;
            } else if (temp[index]>0 && index%2 === 1){
                temp[index]+=difff;
                break;
            } else {
                index--;
            }
        }
        
    }
 
//    console.log(temp);
 
    
    for(var i = 0; i< num; i++){
        if(i%2===0){
            for(var j = 0; j<temp[i];j++){
                ans+="(";
            }
        }
        
        if(i%2===1){
            for(var j = 0; j<temp[i];j++){
                ans+=")";
            }
        }
    }
 
    console.log(ans);
    
 
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));