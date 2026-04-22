function Main(input) {
    const s = input.trim();
    if(s.includes("RRR")) {
        console.log(3);
    } else if(s.includes("RR")) {
        console.log(2);
    } else if(s.includes("R")) {
        console.log(1);
    } else {
        console.log(0);
    }
    
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));