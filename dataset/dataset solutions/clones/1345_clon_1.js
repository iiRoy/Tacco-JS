/*
 * सदस्य: अनन्या वर्मा, आदित्य शेख, निखिल दास, रिया मिश्रा
 */

       var Main = function(r){
console.log(Math.pow(r, 2) * Math.PI + " " + Math.PI * r * 2);
};   

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन बनाए रखता है वर्तमान अगला चरण हर मान के लिए संक्षिप्त. */
