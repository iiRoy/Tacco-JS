/* This script module facilitates interaction with a specific UI component. */
(  function( )
{
    'use strict'  ; // Enforcing stricter JavaScript parsing rules.

    // Locate the primary content holder element within the document.
    var mainContentArea  =  document.querySelector  (  '.interactive-area'  )
      ,  triggerElement  =  mainContentArea.children[  0  ]
      ; // Identify the first child element to serve as an activation point.

    // Attach an event listener to the designated trigger for user interaction.
    triggerElement.addEventListener  (
        'click'
        ,
        function  (  )
        {
            // Initialize a new object for handling asynchronous requests.
            var asyncProcessor  =  new XMLHttpRequest  (  )
              ;

            // Configure the HTTP request: method, target URL, and asynchronous nature.
            asyncProcessor.open  (  'POST'  ,  '/examples/simpleTooltip/demo/demo.php'  ,  true  )  ;

            // Set the appropriate HTTP header for the data being sent.
            asyncProcessor.setRequestHeader  (  'Content-type'  ,  'application/x-www-form-urlencoded'  )  ;

            // Transmit the request with the specified payload.
            asyncProcessor.send  (  'requestData=value'  )  ;

            // Define the callback function to execute when the request's state changes.
            asyncProcessor.onreadystatechange  =  function  (  )
            {
                // Verify if the request has completed successfully (status 200).
                if  (  this.readyState  ===  4  &&  this.status  ===  200  )
                {
                    // Remove the trigger element from its parent container.
                    triggerElement.parentNode.removeChild  (  triggerElement  )  ;

                    // Append the received server response to the main content area.
                    mainContentArea.innerHTML  +=  this.responseText  ;
                }
            }  ;
        }
        ,  false
    )  ;

    // Apply a custom tooltip functionality to the trigger element.
    triggerElement.simpleTooltip  (
        {
            orientation:  'downward'
            ,
            message:  'A bespoke informational bubble for this component.'
        }
    )  ;
}  )  (  )  ;