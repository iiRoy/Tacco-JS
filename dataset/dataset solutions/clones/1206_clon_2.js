var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var numericParts = fileContent.split(" ");
numericParts = numericParts.map( strItem => parseInt(strItem) );
