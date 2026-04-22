const   encDec =    require('base64')  ;
const secureUtil    =   require('crypto')   ;
const   fileIO  =   require('fs')   ;
const TreeWalker    =   require('traverse/hash')    ;

const   checksumsMap    =   JSON.parse(
    fileIO  .   readFileSync    (   __dirname   +   '/hashes.json'  )   .   toString    ()
)   ;


function  calcDigest  (  inputContent  )
{
    return  new secureUtil.Hash('md5')  .  update(  inputContent.toString()  )  .  digest('hex')  ;
}

exports.processFiles    =   function    (   testVerify  )
{
    TreeWalker(checksumsMap)    .   forEach (   function    (   currentSum  ,   resourcePath    )   {
        fileIO.readFile (   __dirname   +   '/'   +   resourcePath    ,   function    (   errorObject ,   dataBuffer  )
        {
            if  (   errorObject )   throw   errorObject ;
            testVerify.equal    (   currentSum  ,   calcDigest  (   encDec.encode(dataBuffer)   )   )   ;
        }   )   ;
    }   )   ;
}   ;


exports.verifyRoundtrip =   function    (   testVerify  )
{
    const   binaryChunk =   new Buffer  (   'pow biff zing' )   ;
    testVerify  .   equal   (
        binaryChunk ,
        encDec.decode   (   encDec.encode   (   binaryChunk )   )
    )   ;
}   ;