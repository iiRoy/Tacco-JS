! function (  contextObject   )
{
    var   uniqueIdGen   =  require('uuid-v4')
    ;
    contextObject
        .addExtension (
        {
            uniqueIdentifier: uniqueIdGen
        }
    )
    ;
}( libInstance )