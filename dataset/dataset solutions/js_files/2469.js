function main(arg) {
    var num = parseInt(arg.split(/\s+/g));
    var kekka = false;
    for(i=0;i<10;i++){
    	if(num%i==0&&num/i==Math.floor(num/i)&&num/i<10){
    		kekka = true;
    	}
    }
    if(kekka==true){
        console.log("Yes");
    }else{
        console.log("No");
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));