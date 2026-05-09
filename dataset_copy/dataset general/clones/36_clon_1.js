/*
 * This is a Type I clone of an existing JavaScript file.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered to create
 * a visually distinct but functionally identical version.
 */
( function () {

    var system ;

    // Define the main game class: GameMain.
    var GameMain = arc.Class.create ( arc.Game , {
        ROW_NUM : 5 ,
        COL_NUM : 5 ,
        TOP_MARGIN : 5 ,
        LEFT_MARGIN : 5 ,
        MARGIN : 2 ,

        /**
         * Constructor for the GameMain class.
         * @param {object} params - Initialization parameters (currently unused).
         */
        initialize : function ( params ) {
            this._currentNumber = 0 ;
            this._btnArr = [ ] ; /* Array to hold number buttons */
            this._numArr = [ ] ; /* Array for shuffling numbers */
            this._timer = new arc.Timer ( ) ;

            // Initialize and configure the timer display text field.
            this._timeTxt = new arc.display.TextField ( ) ;
            this._timeTxt.setX ( 160 ) ;
            this._timeTxt.setY ( 350 ) ;
            this._timeTxt.setAlign ( arc.display.Align.CENTER ) ;
            this._timeTxt.setFont ( "Helvetica" , 30 , true ) ;
            this.addChild ( this._timeTxt ) ;

            /*
             * Create and set up the cover object (start button).
             * It listens for touch end events to initiate the game.
             */
            this._cover = new Cover ( ) ;
            this._cover.addEventListener ( arc.Event.TOUCH_END , arc.util.bind ( this._onClickCover , this ) ) ;

            // Dynamically place number buttons on the game board.
            for ( var i = 0 , len = this.ROW_NUM * this.COL_NUM ; i < len ; i ++ ) {
                var btn = new NumberButton ( ) ,
                    colIndex = Math.floor ( i / this.COL_NUM ) ,
                    rowIndex = i % this.ROW_NUM ;

                btn.setX ( this.LEFT_MARGIN + rowIndex * ( NumberButton.WIDTH + this.MARGIN ) ) ;
                btn.setY ( this.TOP_MARGIN + colIndex * ( NumberButton.HEIGHT + this.MARGIN ) ) ;
                btn.addEventListener ( arc.Event.TOUCH_END , arc.util.bind ( this._onClickNumber , this ) ) ;

                this.addChild ( btn ) ;
                this._btnArr.push ( btn ) ;
                this._numArr.push ( i + 1 ) ;
            }

            this.addChild ( this._cover ) ;
        } ,

        // Method to start the game sequence.
        _start : function ( ) {
            var btn ; // Temporary variable for button reference.

            this._currentNumber = 1 ;
            this._timer.start ( ) ;

            /*
             * Shuffle the numbers array using a common technique:
             * map to objects with random weights, sort by weight, then map back to values.
             */
            this._numArr = this._numArr . map ( function ( a ) { return { weight : Math.random ( ) , value : a } } )
                                        . sort ( function ( a , b ) { return a.weight - b.weight } )
                                        . map ( function ( a ) { return a.value } ) ;

            // Assign the shuffled random numbers to the buttons.
            for ( var i = 0 , len = this._btnArr.length ; i < len ; i ++ ) {
                btn = this._btnArr [ i ] ;
                btn.setNumber ( this._numArr [ i ] ) ;
                btn.activate ( true ) ;
            }
        } ,

        // Event handler for when the cover (start button) is clicked.
        _onClickCover : function ( event ) {
            this.removeChild ( this._cover ) ; // Remove the cover from display.
            this._start ( ) ; // Begin the game.
        } ,

        // Event handler for when a number button is clicked.
        _onClickNumber : function ( event ) {
            var target = event.target ; // The button that was clicked.

            // If the clicked number matches the current expected number, advance the count.
            if ( target.getNumber ( ) === this._currentNumber ) {
                target.activate ( false ) ; // Deactivate the button.
                this._currentNumber ++ ; // Increment the expected number.
            }

            // Check if all numbers have been correctly pressed.
            if ( this._currentNumber > this._numArr.length ) {
                this._timer.stop ( ) ; // Stop the game timer.
            }
        } ,

        /**
         * Update method, called every frame by the game loop.
         * Handles timer display updates.
         */
        update : function ( ) {
            // Calculate elapsed time and format for display.
            var elapsed = this._timer.getElapsed ( ) ,
                sec = ( "00" + Math.floor ( elapsed / 1000 ) ) . slice ( -2 ) ,
                msec = ( "00" + Math.floor ( ( elapsed % 1000 ) / 10 ) ) . slice ( -2 ) ;
            this._timeTxt.setText ( sec + ":" + msec ) ;
        }
    } ) ;


    /*
     * NumberButton Class Definition.
     * Represents a single clickable number button in the game.
     */
    var NumberButton = arc.Class.create ( arc.display.DisplayObjectContainer , {
        initialize : function ( ) {
            this._number = 0 ; // The number displayed on this button.

            // Graphical representation for the 'On' state (active).
            this._bgOn = new arc.display.Shape ( ) ;
            this._bgOn.beginFill ( 0x00ff00 ) ; // Green color.
            this._bgOn.drawRect ( 0 , 0 , NumberButton.WIDTH , NumberButton.HEIGHT ) ;
            this._bgOn.endFill ( ) ;

            // Graphical representation for the 'Off' state (inactive/pressed).
            this._bgOff = new arc.display.Shape ( ) ;
            this._bgOff.beginFill ( 0x666666 ) ; // Grey color.
            this._bgOff.drawRect ( 0 , 0 , NumberButton.WIDTH , NumberButton.HEIGHT ) ;
            this._bgOff.endFill ( ) ;

            // Text field to display the number itself.
            this._numTxt = new arc.display.TextField ( ) ;
            this._numTxt.setX ( NumberButton.WIDTH / 2 ) ;
            this._numTxt.setY ( NumberButton.HEIGHT / 2 ) ;
            this._numTxt.setAlign ( arc.display.Align.CENTER ) ;
            this._numTxt.setFont ( "Helvetica" , 20 , true ) ;

            this.addChild ( this._bgOn ) ;
            this.addChild ( this._bgOff ) ;
            this.addChild ( this._numTxt ) ;

            this.activate ( true ) ; // Initially set button to active.
        } ,

        /**
         * Sets the number displayed on the button.
         * @param {number} num - The number to display.
         */
        setNumber : function ( num ) {
            this._number = num ;
            this._numTxt.setText ( num ) ;
        } ,

        /**
         * Retrieves the number currently set on the button.
         * @returns {number} The button's number.
         */
        getNumber : function ( ) {
            return this._number ;
        } ,

        /**
         * Activates or deactivates the button's visual state.
         * @param {boolean} flg - True to activate, false to deactivate.
         */
        activate : function ( flg ) {
            this._bgOn.setVisible ( flg ) ;
            this._bgOff.setVisible ( ! flg ) ;
        }
    } ) ;

    // Static properties for NumberButton dimensions.
    NumberButton.WIDTH = 60 ;
    NumberButton.HEIGHT = 60 ;


    /*
     * Cover Class Definition.
     * This class represents the initial "START" screen overlay.
     */
    var Cover = arc.Class.create ( arc.display.DisplayObjectContainer , {
        initialize : function ( ) {
            // Background overlay (semi-transparent black).
            this._bg = new arc.display.Shape ( ) ;
            this._bg.beginFill ( 0x000000 , 0.7 ) ;
            this._bg.drawRect ( 0 , 0 , system.getWidth ( ) , system.getHeight ( ) ) ;
            this._bg.endFill ( ) ;

            // "START" text display.
            this._txt = new arc.display.TextField ( ) ;
            this._txt.setAlign ( arc.display.Align.CENTER ) ;
            this._txt.setFont ( "Helvetica" , 30 , true ) ;
            this._txt.setText ( "START" ) ;
            this._txt.setX ( system.getWidth ( ) / 2 ) ;
            this._txt.setY ( system.getHeight ( ) / 2 ) ;
            this._txt.setColor ( 0xffffff ) ; // White color for the text.

            this.addChild ( this._bg ) ;
            this.addChild ( this._txt ) ;
        }
    } ) ;


    // Event listener for when the DOM content has fully loaded.
    window.addEventListener ( 'DOMContentLoaded' , function ( e ) {
        // Initialize the arc.System with canvas dimensions and ID.
        system = new arc.System ( 320 , 416 , 'canvas' ) ;
        system.setGameClass ( GameMain ) ; // Set the main game class.
        system.start ( ) ; // Start the game loop.
    } , false ) ;

} ) ( ) ; // Immediately invoked function expression (IIFE) closure.