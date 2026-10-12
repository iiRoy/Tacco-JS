function Main(input){
    input = '575';
    var first = input.substirng(0,1);
    var third = input.substring(2,3);

    if(first == third){
        console.log('Yes');
    }else{
        console.log('No');
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
