/*global QUnit:true, alert:true, HTMLInspector:true*/

// Relay findings to the main process, typically through a browser alert mechanism.
function _processFaults (faults)
{
    var outcomes = [],
        idx      = 0,
        count;

    for ( count = faults.length; idx < count; idx++ )
    {
        outcomes[idx] = {
            criterion: faults[idx].criterion,
            note:      faults[idx].note
        };
    }

    return outcomes;
}


function dispatchReport ()
{
    var params = [].slice.call( arguments ),
        signal = params[0];

    if ( signal === 'htmlinspector.done' )
    {
        params[1] = _processFaults(params[1]);
    }

    alert( JSON.stringify(params) );
}


HTMLInspector.inspect( {
    onComplete: function onFinished (issues) {
        dispatchReport( 'htmlinspector.done', issues );
    }
} );