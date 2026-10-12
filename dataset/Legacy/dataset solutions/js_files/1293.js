function main(input){
    let lines = input.split("\n");
    let i=0;

    while(lines[i]!=="0 0"){
        let count = 0;
        let nums = arrint(lines[i].split(" "));
        for(let j=1;j<=nums[0];j++){
            for(let k=j;k<=nums[0];k++){
                let l = nums[1]-j-k;
                if(j===k || k===l || j===l)continue;
                if(l<=nums[0] && l>k){
                    count++;
                }
                
            }
        }
        console.log(count);
        i++;
    }
}
function arrint(arr){
    return arr.map(x=>parseInt(x));
}

main(require("fs").readFileSync("/dev/stdin","utf-8"));
