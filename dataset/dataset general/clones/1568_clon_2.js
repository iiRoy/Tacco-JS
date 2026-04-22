module.exports.obtainCollection = function ( incomingRequest , outgoingResponse )
{
    // Retrieve all marketing dispatches that have been sent.
    messagingClient . dispatches . retrieveMany (
        { 'status' : 'sent' }
        ,
        function ( recordSet )
        {
            outgoingResponse . render (
                'summaries/overview'
                ,
                {
                    pageHeading : 'Summary'
                    ,
                    promoItems : recordSet . data
                }
            ) ;
        }
        ,
        function ( failureDetails )
        {
            if ( failureDetails . error )
            {
                incomingRequest . session . userAlert = failureDetails . code + " :: " + failureDetails . error ;
            }
            else
            {
                incomingRequest . session . userAlert = "An unspecified problem occurred during retrieval" ;
            }
            outgoingResponse . redirect ( "/home" ) ;
        }
    ) ;
} ;


// This section fetches and displays a detailed report for a specific marketing campaign.

module.exports.displayOverview = function ( incomingRequest , outgoingResponse )
{
    messagingClient . dispatches . retrieveMany (
        { campaign_id : incomingRequest . params . id }
        ,
        function ( promoCollection )
        {
            var singlePromotion = promoCollection . data [ 0 ] ;

            messagingClient . analysisData . getSummaryReport (
                { cid : incomingRequest . params . id }
                ,
                function ( overviewResult )
                {
                    outgoingResponse . render (
                        'summaries/detail'
                        ,
                        {
                            pageHeading : 'Analysis for ' + singlePromotion . title
                            ,
                            currentPromo : singlePromotion
                            ,
                            detailedReport : overviewResult
                        }
                    ) ;
                }
                ,
                function ( issueObject )
                {
                    console . error ( issueObject ) ;
                    if ( issueObject . name === "Campaign_DoesNotExist" )
                    {
                        incomingRequest . session . userAlert = "The specified marketing effort was not found" ;
                    }
                    else if ( issueObject . error )
                    {
                        incomingRequest . session . userAlert = issueObject . code + " - " + issueObject . error ;
                    }
                    else
                    {
                        incomingRequest . session . userAlert = "An unexpected issue prevented report generation" ;
                    }
                    outgoingResponse . redirect ( '/summaries' ) ;
                }
            ) ;
        }
    ) ;
} ;