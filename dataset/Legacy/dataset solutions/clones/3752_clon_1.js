/* Projeto: Elizer 2561 */
        function  Main ( input){    
const inputValue = input.split(/\s/g);
const parameter = 100;
	     const times= inputValue [ 0];
const index = inputValue[1] <= parameter ? inputValue[1] : parameter = 100;;
if (times === 0 || times > 2) return console.log('%s', index);
 if( index > 100 ) 
console.log('%s', Math.pow(parameter, times) * index);
  }     


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
