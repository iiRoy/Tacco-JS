function main(input){
    var tmp = input.split("\n");
    var N = Number(tmp[0]);
    var a = tmp[1].split(" ");

    var num = N/2;
    var count_4 = 0;
    var count_odd = 0;

    for(var i=0; i<a.length; i++){
        if(a[i]%4==0){
            count_4++;
        }else if(a[i]%2==1){
            count_odd++;
        }
    }
    if(num<count_odd){
        if(count_odd-1<=count_4){
            console.log("Yes");
        }else{
            console.log("No");
        }
    }else{
        if(count_odd<=count_4){
            console.log("Yes");
        }else{
            console.log("no");
        }
    }
    //console.log(count_odd);
    //console.log(count_4);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));