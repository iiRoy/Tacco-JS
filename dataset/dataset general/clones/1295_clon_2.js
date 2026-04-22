var serviceAPI = {};

serviceAPI.OPERATION_KIND =
{
    fetch: "retrieving",
    produce: "generating",
    amend: "modifying",
    discard: "removing"
};

serviceAPI.fabricateSuccessResponse = function (OPERATION_KIND, itemCategory, contentPayload)
{
    var apiOutcome = {
        "status": "success",
        "performedBy": OPERATION_KIND,
        "regardingEntity": itemCategory,
        "withContent": contentPayload
    };

    return apiOutcome;
};

serviceAPI.fabricateFailureResponse = function (explanation, faultCode)
{
    var apiOutcome = {
        "status": "failure",
        "containingFault": faultCode,
        "dueTo": explanation
    };

    return apiOutcome;
};

function requestPipeline()
{
    function apiPipelineStage(incomingRequest, outgoingResponse, nextStage)
    {
        outgoingResponse.dispatchSuccessOutcome = function(OPERATION_KIND, itemCategory, contentPayload)
        {
            outgoingResponse.send(serviceAPI.fabricateSuccessResponse(OPERATION_KIND, itemCategory, contentPayload));
        };

        outgoingResponse.dispatchFailureOutcome = function(explanation, faultCode)
        {
            outgoingResponse.send(serviceAPI.fabricateFailureResponse(explanation, faultCode));
        };

        outgoingResponse.dispatchNotFoundOutcome = function()
        {
            outgoingResponse.dispatchFailureOutcome("requested item absent", 4004);
        };

        return (nextStage());
    }

    return (apiPipelineStage);
}

serviceAPI.requestPipeline = requestPipeline;

module.exports = serviceAPI;