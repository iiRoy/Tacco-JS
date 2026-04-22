function main(D){
if(D=="22"){
  console.log("Christmas Eve Eve Eve");
} else if (D=="23"){
    console.log("Christmas Eve Eve");
} else if (D=="24"){
    console.log("Christmas Eve");
} else if (D=="25"){
    console.log("Christmas");
} 
}
main(require('fs').readFileSync('/dev/stdin','utf8'));