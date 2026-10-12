function Main(input) {
    input = input.split("\n");
    var line = input[0].split(" ");
    var num = parseInt(line[0]);
    var amari = parseInt(line[1]);
    var data = input[1].split(" ");
    var even = 0;
    var odd = 0;
    for(var i = 0; i<data.length; i++){
        data[i] = parseInt(data[i]);
        if(data[i]%2===0){
            even++;
        } else {
            odd++;
        }
    }
    
    function fact(num) {
        var ans = 1;
        for(var i = 1; i<=num; i++){
            ans*=i;
        }
        return ans;
    }
    
    function combi(total,a) {
        return Math.round(fact(total)/(fact(a)*fact(total-a)));
    }

    var evenCombi = Math.pow(2,even);
    
    var oddCombi = 0
    if(amari===0){
        for(var i = 0;i<=odd;i+=2){
            oddCombi += combi(odd,i);
        }
    } else {
        for(var i = 1;i<=odd;i+=2){
            oddCombi += combi(odd,i);
            console.log(combi(odd,i));
        }
    }
    
    console.log(evenCombi*oddCombi);
 
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));