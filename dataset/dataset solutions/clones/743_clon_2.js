var  rootIdentifier;
var  structureMap =  {};
var  visitedNodes =  {};
var  sourceContent = require('fs') . readFileSync(  '/dev/stdin', 'utf8'  );
var  parsedLines = sourceContent . trim() . split("\n") ;

while  (true)
{
    var  itemCount = parsedLines . shift()  ;
    if  (itemCount == 0)
        break;

    for  (var idx = 0; idx < itemCount; idx++)
    {
        var  entrySegments = parsedLines . shift() . split(':')  ;
        structureMap[entrySegments[0]] = entrySegments[1] . split(",")  ;
        if  (idx === 0)
        {
            rootIdentifier = entrySegments[0] ;
        }
    }

    traverseStructure(rootIdentifier) ;
    var  finalTally = 0;
    for  (var nodeKey in visitedNodes)
    {
        ++finalTally;
    }
    console.log(finalTally) ;

    structureMap = {};
    visitedNodes = {};
}


function  traverseStructure(startNodeName)
{
    var  nodeChildren = structureMap[startNodeName] ;
    structureMap[startNodeName] = [] ;
    for  (var idx = 0; idx < nodeChildren.length; idx++)
    {
        var  subIdentifier = nodeChildren[idx] . replace(/[.](\r\n|\n|\r)/gm, "") ;
        if  (structureMap[subIdentifier] !== undefined)
        {
            traverseStructure(subIdentifier) ;
        }
        else
        {
            if  (!visitedNodes . hasOwnProperty(subIdentifier . replace(/[.](\r\n|\n|\r)/gm, "")))
                visitedNodes[subIdentifier . replace(/[.](\r\n|\n|\r)/gm, "")] = true ;
        }
    }
}