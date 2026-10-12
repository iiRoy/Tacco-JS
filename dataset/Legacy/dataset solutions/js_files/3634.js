function Main(input) {
        if (input < 1200){
            console.log('ABC');
        } 
        if (input >= 1200 && input < 2800){
            console.log('ARC');
        }
        if (input <= 4208){
            console.log('AGC');
        }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));