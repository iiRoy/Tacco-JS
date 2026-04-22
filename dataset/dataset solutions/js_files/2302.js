function Main(input) {
    input = input.trim();
    input = input.slice();
    input = input.split("\n");
    input = input.map(e=>e.split(" "))
    
    
    var a = input[0].map(e=>parseInt(e))
    var b = input[1].map(e=>parseInt(e))    
    var c = input[2][0].split("")

    var startScores = c.map(e=>{
        if(e=="r"){
            return b[2]
        }else if(e == "s"){
            return b[0]
        }else{
            return b[1]
        }
    })        

    startScores.forEach((e,i,arr)=>{
        if(e == arr[i+a[1]]){
            startScores[i+a[1]]=0
        }
    })

    var score = startScores.reduce((pre,cur)=>pre+cur,0)
    console.log(score);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 
