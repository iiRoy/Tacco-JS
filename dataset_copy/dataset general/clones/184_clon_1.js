window.DrawingBoard = typeof DrawingBoard !== "undefined" ? DrawingBoard : {};

/*
 * This is a multi-line comment explaining the DrawingBoard constructor options.
 * It's quite verbose, so I'll reformat it and add some extra details.
 *
 * DrawingBoard.Board(id, opts)
 *
 * @param {string} id - The ID of the HTML element to embed the drawing board into.
 * @param {object} opts - Configuration options for the drawing board.
 * @property {Array<string|object>} controls - Array of controls to initialize.
 *     Default: ['Colors', 'Size', 'Navigation'].
 *     Can be strings (e.g., 'Color') or objects for specific control options
 *     (e.g., `{ Navigation: { reset: false } }`).
 * @property {string} controlsPosition - Position of controls. Default: "top left".
 *     Can be "top" or "bottom", combined with "left", "right", or "center".
 * @property {string} background - Background color (hex) or image URL. Default: "#ffffff".
 * @property {string} color - Initial pencil color. Default: "#000000".
 * @property {number} size - Initial pencil size. Default: 3.
 * @property {string|boolean} webStorage - Storage type ('session', 'local') or false. Default: 'session'.
 *     Stores/restores the drawing from web storage.
 * @property {boolean} droppable - Enable image dropping on canvas. Default: false.
 * @property {string} errorMessage - HTML string for unsupported browsers.
 * @property {boolean} stretchImg - Stretch images to canvas size when setting. Default: false.
 */
DrawingBoard.Board = function( id, opts )
{
	this.opts = this.mergeOptions( opts );

	// Initialize event emitter for board events
	this.ev = new DrawingBoard.Utils.MicroEvent();


	this.id = id;
	this.$el = $( document.getElementById( id ) );

	// If the element doesn't exist, exit early
	if ( ! this.$el.length )
	{
		return false;
	}

	// Template for the drawing board structure
	var tpl = '<div class="drawing-board-canvas-wrapper"></canvas><canvas class="drawing-board-canvas"></canvas><div class="drawing-board-cursor drawing-board-utils-hidden"></div></div>';

	// Determine controls position based on options
	if ( this.opts.controlsPosition.indexOf( "bottom" ) > -1 )
	{
		tpl += '<div class="drawing-board-controls"></div>';
	}
	else
	{
		tpl = '<div class="drawing-board-controls"></div>' + tpl;
	}

	// Add class and append template to the main element
	this.$el.addClass( 'drawing-board' ).append( tpl );

	// Cache DOM elements for easier access
	this.dom = {
		$canvasWrapper: this.$el.find( '.drawing-board-canvas-wrapper' ),
		$canvas: this.$el.find( '.drawing-board-canvas' ),
		$cursor: this.$el.find( '.drawing-board-cursor' ),
		$controls: this.$el.find( '.drawing-board-controls' )
	};

	// Set data-align attribute for controls based on position
	$.each( [ 'left', 'right', 'center' ], $.proxy( function( n, val )
	{
		if ( this.opts.controlsPosition.indexOf( val ) > -1 )
		{
			this.dom.$controls.attr( 'data-align', val );
			return false; // Break out of $.each loop
		}
	}, this ) );

	this.canvas = this.dom.$canvas.get( 0 );
	this.ctx = this.canvas && this.canvas.getContext && this.canvas.getContext( '2d' ) ? this.canvas.getContext( '2d' ) : null;
	this.color = this.opts.color;

	// If canvas context is not available, display error message and return
	if ( ! this.ctx )
	{
		if ( this.opts.errorMessage )
		{
			this.$el.html( this.opts.errorMessage );
		}
		return false;
	}

	this.storage = this._getStorage();

	this.initHistory();
	// Initialize default board values before controls are added (pencil color and size)
	this.reset( { webStorage: false, history: false, background: false } );
	// Initialize controls (they depend on default board values)
	this.initControls();
	// Set board's size after the controls div has been added to the DOM
	this.resize();
	// Reset the board again to utilize all newly resized space
	this.reset( { webStorage: false, history: true, background: true } );
	this.restoreWebStorage();
	this.initDropEvents();
	this.initDrawEvents();
};



DrawingBoard.Board.defaultOpts = {
	controls: [ 'Color', 'DrawingMode', 'Size', 'Navigation' ],
	controlsPosition: "top left",
	color: "#000000",
	size: 1,
	background: "#fff",
	eraserColor: "background",
	fillTolerance: 100,
	fillHack: true, /* try to prevent issues with anti-aliasing with a little hack by default */
	webStorage: 'session',
	droppable: false,
	enlargeYourContainer: false,
	errorMessage: "<p>It seems you use an obsolete browser. <a href=\"http://browsehappy.com/\" target=\"_blank\">Update it</a> to start drawing.</p>",
	stretchImg: false /* when setting the canvas img, strech the image at the whole canvas size when this opt is true */
};



DrawingBoard.Board.prototype = {

	/**
	 * Merges default options with user-provided options.
	 * @param {object} opts - User options.
	 * @returns {object} Merged options.
	 */
	mergeOptions: function( opts )
	{
		opts = $.extend( {}, DrawingBoard.Board.defaultOpts, opts );
		if ( ! opts.background && opts.eraserColor === "background" )
		{
			opts.eraserColor = "transparent";
		}
		return opts;
	},

	/**
	 * Canvas reset/resize methods: put back the canvas to its default values
	 *
	 * Depending on options, can set color, size, background back to default values
	 * and store the reseted canvas in webstorage and history queue
	 *
	 * Resize values depend on the `enlargeYourContainer` option
	 */

	reset: function( opts )
	{
		opts = $.extend( {
			color: this.opts.color,
			size: this.opts.size,
			webStorage: true,
			history: true,
			background: false
		}, opts );

		this.setMode( 'pencil' );

		if ( opts.background )
		{
			this.resetBackground( this.opts.background, false );
		}

		if ( opts.color )
		{
			this.setColor( opts.color );
		}
		if ( opts.size )
		{
			this.ctx.lineWidth = opts.size;
		}

		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		// this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width); // Original comment, keeping it as is for Type I but reformatting

		if ( opts.webStorage )
		{
			this.saveWebStorage();
		}

		if ( opts.history )
		{
			this.saveHistory();
		}

		this.blankCanvas = this.getImg();

		this.ev.trigger( 'board:reset', opts );
	},

	/**
	 * Resets the background of the canvas.
	 * Can be a color or an image.
	 * @param {string} background - The background color (hex) or image URL.
	 * @param {boolean} historize - Whether to save this action to history.
	 */
	resetBackground: function( background, historize )
	{
		background = background || this.opts.background;
		historize = typeof historize !== "undefined" ? historize : true;
		var bgIsColor = DrawingBoard.Utils.isColor( background );
		var prevMode = this.getMode();
		this.setMode( 'pencil' );
		this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
		if ( bgIsColor )
		{
			this.ctx.fillStyle = background;
			this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
		}
		else if ( background )
		{
			this.setImg( background );
		}
		this.setMode( prevMode );
		if ( historize )
		{
			this.saveHistory();
		}
	},

	/**
	 * Resizes the canvas and its wrapper based on container dimensions
	 * and control visibility.
	 */
	resize: function()
	{
		// Toggle controls visibility class
		this.dom.$controls.toggleClass( 'drawing-board-controls-hidden', ( ! this.controls || ! this.controls.length ) );

		var canvasWidth, canvasHeight;
		var widths = [
			this.$el.width(),
			DrawingBoard.Utils.boxBorderWidth( this.$el ),
			DrawingBoard.Utils.boxBorderWidth( this.dom.$canvasWrapper, true, true )
		];
		var heights = [
			this.$el.height(),
			DrawingBoard.Utils.boxBorderHeight( this.$el ),
			this.dom.$controls.height(),
			DrawingBoard.Utils.boxBorderHeight( this.dom.$controls, false, true ),
			DrawingBoard.Utils.boxBorderHeight( this.dom.$canvasWrapper, true, true )
		];
		// var that = this; // 'that' variable is not used in the original code, so keeping it commented out
		var sum = function( values, multiplier )
		{ // make the sum of all array values
			multiplier = multiplier || 1;
			var res = values[ 0 ];
			for ( var i = 1; i < values.length; i ++ )
			{
				res = res + ( values[ i ] * multiplier );
			}
			return res;
		};
		var sub = function( values )
		{
			return sum( values, -1 );
		}; // substract all array values from the first one

		if ( this.opts.enlargeYourContainer )
		{
			canvasWidth = this.$el.width();
			canvasHeight = this.$el.height();

			this.$el.width( sum( widths ) );
			this.$el.height( sum( heights ) );
		}
		else
		{
			canvasWidth = sub( widths );
			canvasHeight = sub( heights );
		}

		this.dom.$canvasWrapper.css( 'width', canvasWidth + 'px' );
		this.dom.$canvasWrapper.css( 'height', canvasHeight + 'px' );

		this.dom.$canvas.css( 'width', canvasWidth + 'px' );
		this.dom.$canvas.css( 'height', canvasHeight + 'px' );

		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
	},



	/**
	 * Controls:
	 * The drawing board can have various UI elements to control it.
	 * Each control is represented by a class in the namespace DrawingBoard.Control.
	 * It must have a $el property (jQuery object), representing the HTML element
	 * to append on the drawing board at initialization.
	 *
	 */

	initControls: function()
	{
		this.controls = [];
		if ( ! this.opts.controls.length || ! DrawingBoard.Control )
		{
			return false;
		}
		for ( var i = 0; i < this.opts.controls.length; i ++ )
		{
			var c = null;
			if ( typeof this.opts.controls[ i ] == "string" )
			{
				c = new window[ 'DrawingBoard' ][ 'Control' ][ this.opts.controls[ i ] ]( this );
			}
			else if ( typeof this.opts.controls[ i ] == "object" )
			{
				for ( var controlName in this.opts.controls[ i ] )
				{
					break;
				} // Get the first (and only) key
				c = new window[ 'DrawingBoard' ][ 'Control' ][ controlName ]( this, this.opts.controls[ i ][ controlName ] );
			}
			if ( c )
			{
				this.addControl( c );
			}
		}
	},

	/**
	 * Adds a control to the drawing board.
	 * Can add a new control by name or an existing control object.
	 *
	 * @param {string|object} control - Control class name (string) or an instance of DrawingBoard.Control.
	 * @param {object|number} [optsOrPos] - Control options (if adding by name) or position.
	 * @param {number} [pos] - Specific position to insert the control.
	 */
	addControl: function( control, optsOrPos, pos )
	{
		if ( typeof control !== "string" && ( typeof control !== "object" || ! control instanceof DrawingBoard.Control ) )
		{
			return false;
		}

		var opts = typeof optsOrPos == "object" ? optsOrPos : {};
		pos = pos ? pos * 1 : ( typeof optsOrPos == "number" ? optsOrPos : null );

		if ( typeof control == "string" )
		{
			control = new window[ 'DrawingBoard' ][ 'Control' ][ control ]( this, opts );
		}

		if ( pos )
		{
			this.dom.$controls.children().eq( pos ).before( control.$el );
		}
		else
		{
			this.dom.$controls.append( control.$el );
		}

		if ( ! this.controls )
		{
			this.controls = [];
		}
		this.controls.push( control );
		this.dom.$controls.removeClass( 'drawing-board-controls-hidden' );
	},



	/**
	 * History methods: undo and redo drawed lines
	 * This section manages the undo/redo functionality of the drawing board.
	 */

	initHistory: function()
	{
		this.history = {
			values: [],
			position: 0
		};
	},

	/**
	 * Saves the current canvas state to the history stack.
	 * Limits history to 30 states.
	 */
	saveHistory: function ()
	{
		while ( this.history.values.length > 30 )
		{
			this.history.values.shift(); // Remove the oldest state
			this.history.position --;
		}
		if ( this.history.position !== 0 && this.history.position < this.history.values.length )
		{
			this.history.values = this.history.values.slice( 0, this.history.position );
			this.history.position ++;
		}
		else
		{
			this.history.position = this.history.values.length + 1;
		}
		this.history.values.push( this.getImg() );
		this.ev.trigger( 'historyNavigation', this.history.position );
	},

	/**
	 * Internal method to navigate through history.
	 * @param {boolean} goForth - True to go forward, false to go backward.
	 */
	_goThroughHistory: function( goForth )
	{
		if ( ( goForth && this.history.position == this.history.values.length ) ||
			( ! goForth && this.history.position == 1 ) )
		{
			return;
		}
		var pos = goForth ? this.history.position + 1 : this.history.position - 1;
		if ( this.history.values.length && this.history.values[ pos - 1 ] !== undefined )
		{
			this.history.position = pos;
			this.setImg( this.history.values[ pos - 1 ] );
		}
		this.ev.trigger( 'historyNavigation', pos );
		this.saveWebStorage();
	},

	/**
	 * Navigates backward in history (undo).
	 */
	goBackInHistory: function()
	{
		this._goThroughHistory( false );
	},

	/**
	 * Navigates forward in history (redo).
	 */
	goForthInHistory: function()
	{
		this._goThroughHistory( true );
	},



	/**
	 * Image methods: you can directly put an image on the canvas,
	 * get it in base64 data url or start a download.
	 */

	setImg: function( src, opts )
	{
		opts = $.extend( {
			stretch: this.opts.stretchImg
		}, opts );
		var ctx = this.ctx;
		var img = new Image();
		var oldGCO = ctx.globalCompositeOperation;
		img.onload = function()
		{
			ctx.globalCompositeOperation = "source-over";
			ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

			if ( opts.stretch )
			{
				ctx.drawImage( img, 0, 0, ctx.canvas.width, ctx.canvas.height );
			}
			else
			{
				ctx.drawImage( img, 0, 0 );
			}

			ctx.globalCompositeOperation = oldGCO;
		};
		img.src = src;
	},

	/**
	 * Gets the current canvas content as a base64 data URL.
	 * @returns {string} Data URL of the canvas image.
	 */
	getImg: function()
	{
		return this.canvas.toDataURL( "image/png" );
	},

	/**
	 * Triggers a download of the current canvas image.
	 */
	downloadImg: function()
	{
		var img = this.getImg();
		img = img.replace( "image/png", "image/octet-stream" );
		window.location.href = img;
	},



	/**
	 * WebStorage handling : save and restore to local or session storage.
	 * This module interacts with the browser's Web Storage API.
	 */

	saveWebStorage: function()
	{
		if ( window[ this.storage ] )
		{
			window[ this.storage ].setItem( 'drawing-board-' + this.id, this.getImg() );
			this.ev.trigger( 'board:save' + this.storage.charAt( 0 ).toUpperCase() + this.storage.slice( 1 ), this.getImg() );
		}
	},

	restoreWebStorage: function()
	{
		if ( window[ this.storage ] && window[ this.storage ].getItem( 'drawing-board-' + this.id ) !== null )
		{
			this.setImg( window[ this.storage ].getItem( 'drawing-board-' + this.id ) );
			this.ev.trigger( 'board:restore' + this.storage.charAt( 0 ).toUpperCase() + this.storage.slice( 1 ), window[ this.storage ].getItem( 'drawing-board-' + this.id ) );
		}
	},

	clearWebStorage: function()
	{
		if ( window[ this.storage ] && window[ this.storage ].getItem( 'drawing-board-' + this.id ) !== null )
		{
			window[ this.storage ].removeItem( 'drawing-board-' + this.id );
			this.ev.trigger( 'board:clear' + this.storage.charAt( 0 ).toUpperCase() + this.storage.slice( 1 ) );
		}
	},

	/**
	 * Determines the appropriate Web Storage type (session or local).
	 * @private
	 * @returns {string|boolean} 'sessionStorage', 'localStorage', or false if not enabled.
	 */
	_getStorage: function()
	{
		if ( ! this.opts.webStorage || !( this.opts.webStorage === 'session' || this.opts.webStorage === 'local' ) )
		{
			return false;
		}
		return this.opts.webStorage + 'Storage';
	},



	/**
	 * Drop an image on the canvas to draw on it.
	 * This functionality enables users to drag and drop image files directly onto the drawing surface.
	 */

	initDropEvents: function()
	{
		if ( ! this.opts.droppable )
		{
			return false;
		}

		this.dom.$canvas.on( 'dragover dragenter drop', function( e )
		{
			e.stopPropagation();
			e.preventDefault();
		} );

		this.dom.$canvas.on( 'drop', $.proxy( this._onCanvasDrop, this ) );
	},

	/**
	 * Handles the drop event on the canvas.
	 * Reads the dropped image file and sets it as the canvas background.
	 * @private
	 * @param {Event} e - The drop event object.
	 */
	_onCanvasDrop: function( e )
	{
		e = e.originalEvent ? e.originalEvent : e;
		var files = e.dataTransfer.files;
		if ( ! files || ! files.length || files[ 0 ].type.indexOf( 'image' ) == -1 || ! window.FileReader )
		{
			return false;
		}
		var fr = new FileReader();
		fr.readAsDataURL( files[ 0 ] );
		fr.onload = $.proxy( function( ev )
		{
			this.setImg( ev.target.result );
			this.ev.trigger( 'board:imageDropped', ev.target.result );
			this.ev.trigger( 'board:userAction' );
			this.saveHistory();
		}, this );
	},



	/**
	 * Set and get current drawing mode.
	 *
	 * Possible modes are "pencil" (draw normally), "eraser" (draw transparent, like, erase, you know), "filler" (paint can).
	 */

	setMode: function( newMode, silent )
	{
		silent = silent || false;
		newMode = newMode || 'pencil';

		this.ev.unbind( 'board:startDrawing', $.proxy( this.fill, this ) );

		if ( this.opts.eraserColor === "transparent" )
		{
			this.ctx.globalCompositeOperation = newMode === "eraser" ? "destination-out" : "source-over";
		}
		else
		{
			if ( newMode === "eraser" )
			{
				if ( this.opts.eraserColor === "background" && DrawingBoard.Utils.isColor( this.opts.background ) )
				{
					this.ctx.strokeStyle = this.opts.background;
				}
				else if ( DrawingBoard.Utils.isColor( this.opts.eraserColor ) )
				{
					this.ctx.strokeStyle = this.opts.eraserColor;
				}
			}
			else if ( ! this.mode || this.mode === "eraser" )
			{
				this.ctx.strokeStyle = this.color;
			}

			if ( newMode === "filler" )
			{
				this.ev.bind( 'board:startDrawing', $.proxy( this.fill, this ) );
			}
		}
		this.mode = newMode;
		if ( ! silent )
		{
			this.ev.trigger( 'board:mode', this.mode );
		}
	},

	/**
	 * Returns the current drawing mode.
	 * @returns {string} The current mode (e.g., "pencil", "eraser", "filler").
	 */
	getMode: function()
	{
		return this.mode || "pencil";
	},

	/**
	 * Sets the drawing color.
	 * @param {string} color - Hexadecimal color string (e.g., "#RRGGBB").
	 */
	setColor: function( color )
	{
		var that = this;
		color = color || this.color;
		if ( ! DrawingBoard.Utils.isColor( color ) )
		{
			return false;
		}
		this.color = color;
		if ( this.opts.eraserColor !== "transparent" && this.mode === "eraser" )
		{
			var setStrokeStyle = function( mode )
			{
				if ( mode !== "eraser" )
				{
					that.strokeStyle = that.color;
				}
				that.ev.unbind( 'board:mode', setStrokeStyle );
			};
			this.ev.bind( 'board:mode', setStrokeStyle );
		}
		else
		{
			this.ctx.strokeStyle = this.color;
		}
	},

	/**
	 * Fills an area with the current stroke color using a flood-fill algorithm.
	 * @param {object} e - Event object containing coordinates (e.g., from a mouse click).
	 */
	fill: function( e )
	{
		if ( this.getImg() === this.blankCanvas )
		{
			this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.width );
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
			return;
		}

		var img = this.ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height );

		// constants identifying pixels components
		var INDEX = 0, X = 1, Y = 2, COLOR = 3;

		// target color components
		var stroke = this.ctx.strokeStyle;
		var r = parseInt( stroke.substr( 1, 2 ), 16 );
		var g = parseInt( stroke.substr( 3, 2 ), 16 );
		var b = parseInt( stroke.substr( 5, 2 ), 16 );

		// starting point for the fill operation
		var start = DrawingBoard.Utils.pixelAt( img, parseInt( e.coords.x, 10 ), parseInt( e.coords.y, 10 ) );
		var startColor = start[ COLOR ];
		var tolerance = this.opts.fillTolerance;
		var useHack = this.opts.fillHack; // see https://github.com/Leimi/drawingboard.js/pull/38 for more details

		// no need to continue if starting and target colors are the same within tolerance
		if ( DrawingBoard.Utils.compareColors( startColor, DrawingBoard.Utils.RGBToInt( r, g, b ), tolerance ) )
		{
			return;
		}

		// pixels to evaluate in the flood fill queue
		var queue = [ start ];

		// loop variables for flood fill
		var pixel, x, y;
		var maxX = img.width - 1;