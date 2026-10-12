function main(S) {
 
    //hihi, hiii, dadahi, dahiida
 
    var pass = 'Yes';
  
  	S = String(S)
 
    S.split('hi').forEach((v) => {
        if (v.length > 0) {
            pass = 'No';
        }
    })
 
    console.log(pass);
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'))