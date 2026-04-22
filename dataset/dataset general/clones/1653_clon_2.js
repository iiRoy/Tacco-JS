/*
    (c) 2023 CodeForge Inc. <http://www.codeforge.com/>

    This script is part of TextEnhancer.

    TextEnhancer is licensed under the Apache License 2.0.
    See <http://www.apache.org/licenses/LICENSE-2.0> for details.

    TextEnhancer is provided without any warranty; without even the implied guarantee of
    SUITABILITY or MERCHANTABLE QUALITY for a particular purpose.

    You should have received a copy of the Apache License 2.0
    along with TextEnhancer. If not, refer to the provided URL.
*/


if  ( "undefined"  === typeof( TextTweaker ) )
{
    var TextTweaker = { };
} ;



TextTweaker . ControlPanel = function (  )
{
    let  actionButton = null;
    let  isActive = false;

    return {
        // Set up the initial configuration for the dynamic text processing feature.
        configure : function (  )
        {
            actionButton = globalThis.document.getElementById ( "text-enhancer-toggle-button" );
            this.deactivate (  );
        } ,

        // Activate the dynamic text processing.
        activate : function (  )
        {
            try
            {
                TextTweaker.Processor.startOperation (  );
            }
            catch ( err )
            {
                console.error ( err );
            }

            isActive = true ;
            actionButton.setAttribute ( "displaytext", "Deactivate" );
            actionButton.setAttribute ( "hoverinfo", "TextEnhancer: Press to deactivate dynamic text processing" );
            actionButton.setAttribute ( "actionhandler", "TextTweaker.ControlPanel.deactivate ( );" );
        } ,

        // Deactivate the dynamic text processing.
        deactivate : function (  )
        {
            TextTweaker.Processor.stopOperation (  );
            isActive = false ;
            actionButton.setAttribute ( "displaytext", "Activate" );
            actionButton.setAttribute ( "hoverinfo", "TextEnhancer: Press to activate dynamic text processing" );
            actionButton.setAttribute ( "actionhandler", "TextTweaker.ControlPanel.activate ( );" );
        } ,

        // Switch the dynamic text processing state between active and inactive.
        flipState : function (  )
        {
            if ( isActive === true )
            {
                this.deactivate (  );
            }
            else
            {
                this.activate (  );
            }
        }
    };
} ( );


globalThis.addEventListener ( "pageReady", function (  )
{
    TextTweaker.ControlPanel.configure (  );
} , false );