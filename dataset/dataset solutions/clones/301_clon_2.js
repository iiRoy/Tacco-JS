process.stdin.resume();
process.stdin.setEncoding("utf8");
// Here your code !
values=require("fs").readFileSync("/dev/stdin","utf8").trim().split(/\s/);
for(pos=0;pos<values.length;pos+=2){
    found=0;
    year=values[pos];
    //if(pos!=0||pos==values.length-1)console.log();
    if(year+values[pos+1]==0)break;
    for(;year<=values[pos+1];year++){
        if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)){
            console.log(String(year).trim());
            found++;
        }
    }
    if(pos!=0||pos==values.length-1)console.log();
    if(found==0){
        console.log("NA\n");
    }
    
}
