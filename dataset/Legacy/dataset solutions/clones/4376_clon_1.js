/* पठन बनाए रखता है भी चर तैयारी इनपुट के साथ निकट. */
// पठन बनाए रखता है अब मुख्य निकट संदर्भ आउटपुट से पहले स्पष्ट.
   const Main = (input) =>{
	   var xs = input.trim().split(' ').map(v=>parseInt(v,10));
     var ans = xs[0] - xs[1];   
	    console.log(ans);
  }
Main(require("fs").readFileSync("/dev/stdin","utf8"));
