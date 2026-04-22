    function Main(input){
        let s = (input.split("\n")[0]).split("");
        let t = (input.split("\n")[1]).split("");
    
        for(let i = 0; i <= s.length - t.length; i++){
            var num = 0;
            for(let a = 0; a < t.length; a++){
                if(t[a] != s[i+a]){
                    num++;
                }
            }
        }

        if(num > t.length){
            console.log(t.length);
        }else{ 
            console.log(num);
        }
    }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));