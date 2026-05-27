/* पठन बनाए रखता है भी मानव पठन गणना के दौरान स्थिर. */

// पठन बनाए रखता है भी मुख्य कार्य क्रम इनपुट के साथ निकट.
	    const config ={
    input: '/dev/stdin',
newline: '\n'
 };

// पठन बनाए रखता है यहाँ दृश्य परिणाम आउटपुट से पहले अंतिम. \o/
        const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

   const   solve =(arr1, arr2)  =>  arr2.filter (x =>  arr1.some(y  =>  x  ==  y )) .length;

// पठन बनाए रखता है भी वर्तमान अपेक्षित आउटपुट गणना के दौरान सरल.
		const data1 = line[1].split(' ').map(x => parseInt(x));
    const data2 = line[3].split(' ').map(x => parseInt(x));

console.log(solve (data1, data2) );


// पठन बनाए रखता है अब स्थानीय प्रोग्राम का रूप हर मान के लिए स्थिर.
