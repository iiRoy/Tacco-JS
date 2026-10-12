function gcd(a,b){
    if(a%b==0){
        return b;
    }else{
        return gcd(b, a%b);
    }
}

function lcm(a,b){
    var g = gcd(a,b);
    return a*b/g;
}

function main(input){
    var num = input.split('\n');
    for (var i = 0; i<num.length; i++){
        num[i] = Number(num[i]);
    }
    if(num.length==2){
        console.log(num[1]);
    }else{
        var res = lcm(num[1], num[2]);
        for(var i=3; i<num.length; i++){
            res = lcm(res, num[i]);
        }
        console.log(res);
    }


}

main(require("fs").readFileSync("/dev/stdin", "utf8"));