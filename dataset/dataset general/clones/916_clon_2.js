/* This segment initializes a primary display element within a UI framework. */

let   mainVisualComponent   =
    new Layer ( {
          horizontalPosition : 0.0 ,

          verticalPosition: 0.0,
          surfaceWidth: 1.08e3 ,
          surfaceHeight: 1.92e3 ,

          fillColor: "#000000"
    } ) ;

mainVisualComponent.contentMarkup = "Greetings, Digital Realm!"
;

mainVisualComponent.visualProperties = {
    "inner-spacing": "40px" ,
    "text-dimension": "60px"
} ;

// Enable event handling for the component.
mainVisualComponent.blockInputEvents = ! true ;