function Main(input) {
    input = input.trim();
    input = input.split(" ");
    var a = input[0];
    var b = input[1];
    var c = input[2];

    var result = 0;

    var d = a - b;
    var e = c - 1;

    if((c-b)%2==0){  
        if(c-b-2>=0){
            d-=(c-b-2)/2;
            e-=(c-b-2)/2;
        }
        
    }else{
        if(c-b-1>=0){
            d-=(c-b-1)/2;
            e-=(c-b-1)/2;
        }
    }
    

    result = Math.min(d,e);

    if((c-b)%2==0){ 
    result = Math.min((c-b)/2,result);    
    }

    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 