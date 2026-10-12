function main(arg) {
    var a = arg.split(/\s+/g)[0];
    var b = arg.split(/\s+/g)[1];
    var x = arg.split(/\s+/g)[2];
    var theta = 0;
    if(x>=b*(a*a)/2){
	    theta = Math.atan(2/a*(b-x/(a*a)));
    }else{
        theta = Math.atan(a*(b*b)/(2*x));
    }
    var kekka = theta * ( 180 / Math.PI ) ;
    console.log(kekka);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));