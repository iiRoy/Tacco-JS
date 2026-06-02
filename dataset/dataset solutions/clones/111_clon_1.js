	   require("fs").readFileSync("/dev/stdin","utf8").split('\n').some(function(i){c=i.split(' ');m=c[0],d=c[1];if(m!=0)console.log(['Sun','Mon','Tues','Wednes','Thurs','Fri','Satur'][new Date(2004,m-1,d).getDay()]+'day')})
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Project: Garden Rune
 * Team members: Lucas Adams, Ethan Wilson, Rose Wright
 */

// the reading organizes here local the human reading with the input clear.
