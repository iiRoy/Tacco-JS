(function($){ var params=[],
	order=[],
	images=[],
	links=[],
	linksTarget=[],
	titles=[],
	interval=[],
	imagePos=[],
	appInterval=[],
	squarePos=[],
	reverse=[],
	uniqueIDPrefix="coinsliderUniqueID",
	uniqueIDCounter=0;

// This is the main plugin definition. It can be called as $.fn.coinslider or $.fn.CoinSlider.
$.fn.coinslider = $.fn.CoinSlider = function(options){

	// This inner function calculates and sets up the individual square elements for the slider.
	var setFields = function (el) {

		// Calculate dimensions for individual squares
		var tWidth = parseInt(params[el.id].width / params[el.id].spw), // Temporary width based on total width and squares per width
			sWidth = tWidth, // Actual square width
			tHeight = parseInt(params[el.id].height / params[el.id].sph), // Temporary height
			sHeight = tHeight, // Actual square height
			counter = 0, // Counter for ordering squares
			sLeft = 0, // Left position for current square
			sTop = 0, // Top position for current square
			i, // Loop variable for rows
			j, // Loop variable for columns
			tgapx = params[el.id].width - params[el.id].spw * sWidth, // Total horizontal gap to distribute
			gapx = tgapx, // Current horizontal gap remaining
			tgapy = params[el.id].height - params[el.id].sph * sHeight, // Total vertical gap to distribute
			gapy = tgapy; // Current vertical gap remaining

		// Iterate through rows (sph = squares per height)
		for(i = 1; i <= params[el.id].sph; i++)
		{
			gapx = tgapx; // Reset horizontal gap for each new row

			// Distribute vertical gap if any
			if (gapy > 0)
			{
				gapy--; // Decrement gap
				sHeight = tHeight + 1; // Add 1px to height
			} else {
				sHeight = tHeight; // Use default height
			}

			// Iterate through columns (spw = squares per width)
			for (j = 1; j <= params[el.id].spw; j++) {

				// Distribute horizontal gap if any
				if (gapx > 0)
				{
					gapx--;
					sWidth = tWidth + 1;
				} else {
					sWidth = tWidth;
				}

				// Store the order of squares (e.g., "11", "12", "13" for first row)
				order[el.id][counter] = i + "" + j;
				counter++;

				// Append square element to the slider
				if (params[el.id].links) {
					// If links are enabled, create an anchor tag
					$('#' + el.id).append("<a href='" + links[el.id][0] + "' class='cs-" + el.id + "' id='cs-" + el.id + i + j + "' style='width:" + sWidth + "px; height:" + sHeight + "px; float: left; position: absolute;'></a>");
				} else {
					// Otherwise, create a div
					$('#' + el.id).append("<div class='cs-" + el.id + "' id='cs-" + el.id + i + j + "' style='width:" + sWidth + "px; height:" + sHeight + "px; float: left; position: absolute;'></div>");
				}

				// Apply CSS for positioning and background
				$("#cs-" + el.id + i + j).css({
					'background-position': -sLeft + 'px ' + (-sTop + 'px'),
					'left' : sLeft,
					'top': sTop
				});

				sLeft += sWidth; // Move left position for the next square
			}

			sTop += sHeight; // Move top position for the next row
			sLeft = 0; // Reset left position for the next row
		}

		// Handle navigation visibility on hover if not always shown
		if (!params[el.id].navigationPrevNextAlwaysShown)
		{

			$('.cs-' + el.id).mouseover(function(){
				$('#cs-navigation-' + el.id).show();
			});

			$('.cs-' + el.id).mouseout(function(){
				$('#cs-navigation-' + el.id).hide();
			});

			$('#cs-title-' + el.id).mouseover(function(){
				$('#cs-navigation-' + el.id).show();
			});

			$('#cs-title-' + el.id).mouseout(function(){
				$('#cs-navigation-' + el.id).hide();
			});
		}

		// Handle pause on hover functionality
		if (params[el.id].hoverPause)
		{
			$('.cs-' + el.id).mouseover(function(){
				params[el.id].pause = true;
			});

			$('.cs-' + el.id).mouseout(function(){
				params[el.id].pause = false;
			});

			$('#cs-title-' + el.id).mouseover(function(){
				params[el.id].pause = true;
			});

			$('#cs-title-' + el.id).mouseout(function(){
				params[el.id].pause = false;
			});
		}

	};

	// Function to manage the transition interval.
	var transitionCall = function (el) {

		clearInterval(interval[el.id]); // Clear any existing interval
		// Calculate the total delay before the next transition starts
		var delay = params[el.id].delay + params[el.id].spw * params[el.id].sph * params[el.id].sDelay;
		// Set a new interval for the next transition
		interval[el.id] = setInterval(function() { transition(el); }, delay);

	};

	// This function orchestrates the image transition effect.
	var transition = function (el, direction) {

		// If the slider is paused, do nothing.
		if(params[el.id].pause === true){
			return;
		}

		// Apply the chosen effect (random, swirl, rain, straight)
		effect(el);

		squarePos[el.id] = 0; // Reset square position counter
		// Start interval for individual square appearance
		appInterval[el.id] = setInterval(function() { appereance(el, order[el.id][squarePos[el.id]]); }, params[el.id].sDelay);

		// Set the background image for the main container
		$(el).css({ 'background-image': 'url("' + images[el.id][imagePos[el.id]] + '")' });

		// Determine the next image position based on direction or auto-advance
		if (typeof(direction) == "undefined") {
			imagePos[el.id]++; // Auto-advance
		} else {
			if (direction == 'prev') {
				imagePos[el.id]--; // Go to previous image
			} else {
				imagePos[el.id] = direction; // Go to a specific image (index)
			}
		}

		// Handle looping for image positions
		if (imagePos[el.id] == images[el.id].length) {
			imagePos[el.id] = 0; // Loop back to the first image
		}

		if (imagePos[el.id] == -1) {
			imagePos[el.id] = images[el.id].length - 1; // Loop to the last image
		}

		// Update navigation buttons (active state)
		$('.cs-button-' + el.id).removeClass('cs-active');
		$('#cs-button-' + el.id + "-" + (imagePos[el.id] + 1)).addClass('cs-active');

		// Update title bar
		if (titles[el.id][imagePos[el.id]]) {
			// Animate title visibility
			$('#cs-title-' + el.id).css({ 'opacity' : 0 }).animate({ 'opacity' : params[el.id].opacity }, params[el.id].titleSpeed);
			$('#cs-title-' + el.id).html(titles[el.id][imagePos[el.id]]);
		} else {
			// Hide title if no text
			$('#cs-title-' + el.id).css('opacity',0);
		}

	};

	// Function to make individual squares appear.
	var appereance = function (el, sid) {

		// Set the link and target for the current square
		$('.cs-' + el.id).attr('href', links[el.id][imagePos[el.id]]).attr('target', linksTarget[el.id][imagePos[el.id]]);

		// If all squares have appeared, clear the interval
		if (squarePos[el.id] == params[el.id].spw * params[el.id].sph) {
			clearInterval(appInterval[el.id]);
			return;
		}

		// Set initial opacity to 0 and background image for the square
		$('#cs-' + el.id + sid).css({ opacity: 0, 'background-image': 'url("' + images[el.id][imagePos[el.id]] + '")' });
		// Animate the square to full opacity
		$('#cs-' + el.id + sid).animate({ opacity: 1 }, 300);
		squarePos[el.id]++; // Increment square position counter

	};

	// This function creates and manages the navigation elements (prev/next buttons, image buttons).
	var setNavigation = function (el) {
		// Create previous and next buttons if enabled
		if (params[el.id].showNavigationPrevNext)
		{
			$(el).append("<div id='cs-navigation-" + el.id + "'></div>");

			// Hide navigation initially if not always shown
			if (!params[el.id].navigationPrevNextAlwaysShown)
			{
				$('#cs-navigation-' + el.id).hide();
			}

			// Append prev/next buttons
			$('#cs-navigation-' + el.id).append("<a href='#' id='cs-prev-" + el.id + "' class='cs-prev'>" + params[el.id].prevText + "</a>");
			$('#cs-navigation-' + el.id).append("<a href='#' id='cs-next-" + el.id + "' class='cs-next'>" + params[el.id].nextText + "</a>");

			// Style and attach event handlers for the 'prev' button
			$('#cs-prev-' + el.id).css({
				'position'		: 'absolute',
				'top'			: params[el.id].height / 2 - 15,
				'left'			: 0,
				'z-index'		: 1001,
				'line-height'	: '30px',
				'opacity'		: params[el.id].opacity
			}).click( function(e){
				e.preventDefault(); // Prevent default link behavior
				transition(el,'prev'); // Trigger previous image transition
				transitionCall(el); // Reset transition timer
			}).mouseover( function(){ $('#cs-navigation-' + el.id).show(); }); // Show navigation on hover

			// Style and attach event handlers for the 'next' button
			$('#cs-next-' + el.id).css({
				'position'		: 'absolute',
				'top'			: params[el.id].height / 2 - 15,
				'right'			: 0,
				'z-index'		: 1001,
				'line-height'	: '30px',
				'opacity'		: params[el.id].opacity
			}).click( function(e){
				e.preventDefault();
				transition(el); // Trigger next image transition
				transitionCall(el); // Reset transition timer
			}).mouseover( function(){ $('#cs-navigation-' + el.id).show(); });

			// Mouseout handler for navigation buttons
			$('#cs-navigation-' + el.id + ' a').mouseout(function(){
				if (!params[el.id].navigationPrevNextAlwaysShown)
					$('#cs-navigation-' + el.id).hide(); // Hide if not always shown

				params[el.id].pause = false; // Unpause on mouseout
			});
		}

		// Create image navigation buttons if enabled
		if (params[el.id].showNavigationButtons) {
			// Append container for image buttons
			$("<div id='cs-buttons-" + el.id + "' class='cs-buttons'></div>").appendTo($('#coin-slider-' + el.id));

			var k;
			// Create a button for each image
			for (k = 1; k < images[el.id].length + 1; k++){
				$('#cs-buttons-' + el.id).append("<a href='#' class='cs-button-" + el.id + "' id='cs-button-" + el.id + "-" + k + "'>" + k + "</a>");
			}

			// Attach click handlers to image buttons
			$.each($('.cs-button-' + el.id), function(i,item){
				$(item).click( function(e){
					$('.cs-button-' + el.id).removeClass('cs-active'); // Remove active class from others
					$(this).addClass('cs-active'); // Add active class to clicked button
					e.preventDefault();
					transition(el,i); // Trigger transition to specific image
					transitionCall(el); // Reset transition timer
				});
			});

			// Position the image buttons
			$("#cs-buttons-" + el.id).css({
				'left'			: '50%',
				'margin-left'	: -images[el.id].length * 15 / 2 - 5, // Center the buttons
				'position'		: 'relative'
			});
		}

	};

	// Function to choose and apply a specific transition effect.
	var effect = function (el) {
		// Array of available effects
		var effA = ['random','swirl','rain','straight'],
			i,
			j,
			counter,
			eff; // Selected effect

		// If no effect is specified, choose a random one
		if (params[el.id].effect === '') {
			eff = effA[Math.floor(Math.random() * (effA.length))];
		} else {
			eff = params[el.id].effect; // Use the specified effect
		}

		order[el.id] = []; // Clear the previous order of squares

		// Apply the selected effect
		if (eff == 'random') {
			counter = 0;
				for (i = 1; i <= params[el.id].sph; i++) {
					for (j = 1; j <= params[el.id].spw; j++) {
						order[el.id][counter] = i + "" + j;
						counter++;
					}
				}
			randomEffect(order[el.id]); // Shuffle the order randomly
		}

		if (eff == 'rain') {
			rain(el); // Apply rain effect
		}

		if (eff == 'swirl') {
			swirl(el); // Apply swirl effect
		}

		if (eff == 'straight') {
			straight(el); // Apply straight effect
		}

		// Reverse the order if needed (alternating directions)
		reverse[el.id] *= -1;

		if (reverse[el.id] > 0) {
			order[el.id].reverse();
		}

	};

	// Fisher-Yates (Knuth) shuffle algorithm for randomizing array elements.
	var randomEffect = function (arr) {

		var i = arr.length, // Start from the end of the array
			j, // Random index
			tempi, // Temporary variable for swapping
			tempj; // Another temporary variable

		if ( i === 0 ) {
			return false; // Nothing to shuffle if array is empty
		}

		while ( --i ) { // Loop from i-1 down to 1
			j = Math.floor( Math.random() * ( i + 1 ) ); // Pick a random element between 0 and i
			tempi = arr[i]; // Store current element
			tempj = arr[j]; // Store random element
			arr[i] = tempj; // Swap elements
			arr[j] = tempi;
		}
	};

	// Swirl effect algorithm (by Milos Popovic).
	var swirl = function (el) {

		var n = params[el.id].sph, // Number of rows
			m = params[el.id].spw, // Number of columns
			x = 1, // Current row position
			y = 1, // Current column position
			going = 0, // Direction: 0-right, 1-down, 2-left, 3-up
			num = 0, // Number of steps in current direction
			c = 0, // Counter for order array
			check, // Loop termination check
			dowhile = true, // Loop control
			i;

		while (dowhile) {

			// Determine steps based on direction
			num = (going === 0 || going === 2) ? m : n;

			for (i = 1; i <= num; i++){

				order[el.id][c] = x + "" + y; // Store current square
				c++;

				if (i != num) { // Move to the next square in current direction
					switch(going){
						case 0 : y++; break; // Right
						case 1 : x++; break; // Down
						case 2 : y--; break; // Left
						case 3 : x--; break; // Up
					}
				}
			}

			going = (going + 1) % 4; // Change direction

			// Adjust boundaries after completing a full pass in one direction
			switch (going) {
				case 0 : m--; y++; break; // Adjust column count, move y
				case 1 : n--; x++; break; // Adjust row count, move x
				case 2 : m--; y--; break; // Adjust column count, move y
				case 3 : n--; x--; break; // Adjust row count, move x
			}

			// Check for loop termination
			check = max(n,m) - min(n,m);
			if (m <= check && n <= check) {
				dowhile = false;
			}

		}
	};

	// Rain effect algorithm.
	var rain = function (el) {

		var n = params[el.id].sph, // Rows
			m = params[el.id].spw, // Columns
			c = 0, // Counter for order array
			to = 1, // End row for diagonal
			to2 = 1, // End column for diagonal
			from = 1, // Start row for diagonal
			dowhile = true; // Loop control

		while (dowhile) {

			for (i = from; i <= to; i++) {
				order[el.id][c] = i + '' + parseInt(to2 - i + 1); // Calculate diagonal square
				c++;
			}

			to2++; // Increment end column

			// Adjust 'to' (end row) based on dimensions
			if (to < n && to2 < m && n < m) {
				to++;
			}

			if (to < n && n >= m) {
				to++;
			}

			if (to2 > m) {
				from++; // Increment start row
			}

			if (from > to) {
				dowhile = false; // Terminate loop
			}

		}

	};

	// Straight effect (squares appear in linear order).
	var straight = function (el) {
		var counter = 0,
			i,
			j;

		for (i = 1; i <= params[el.id].sph; i++) {
			for (j = 1; j <= params[el.id].spw; j++) {
				order[el.id][counter] = i + '' + j; // Store squares row by row, column by column
				counter++;
			}
		}
	};

	// Helper function: returns the minimum of two numbers.
	var min = function (n,m) {
		if (n > m) {
			return m;
		} else {
			return n;
		}
	};

	// Helper function: returns the maximum of two numbers.
	var max = function (n,m) {
		if (n < m) {
			return m;
		} else {
			return n;
		}
	};

	// Initialization function for each slider instance.
	var init = function (el) {

		// Ensure the element has an ID, assign a unique one if not.
		if( el.id === '' ){
			el.id = uniqueIDPrefix + uniqueIDCounter++;
		}

		// Initialize arrays for this slider instance
		order[el.id]		= []; // Order of square appearance
		images[el.id]		= []; // Image sources
		links[el.id]		= []; // Image links
		linksTarget[el.id]	= []; // Link targets
		titles[el.id]		= []; // Image titles
		imagePos[el.id]		= 0; // Current image position
		squarePos[el.id]	= 0; // Current square position during appearance
		reverse[el.id]		= 1; // Direction multiplier for effects

		// Merge default options with user-provided options
		params[el.id] = $.extend({}, $.fn.coinslider.defaults, options);

		// Populate images, links, and titles arrays from the DOM
		$.each($('#' + el.id + ' img'), function (i, item) {
			images[el.id][i]		= $(item).attr('src'); // Get image source
			links[el.id][i]			= $(item).parent().is('a') ? $(item).parent().attr('href') : ''; // Get link if parent is <a>
			linksTarget[el.id][i]	= $(item).parent().is('a') ? $(item).parent().attr('target') : ''; // Get link target
			titles[el.id][i]		= $(item).next().is('span') ? $(item).next().html() : ''; // Get title from next <span>
			$(item).hide(); // Hide original image
			$(item).next().hide(); // Hide original title span
		});

		// Set up the main slider container CSS
		$(el).css({
			'background-image': 'url("' + images[el.id][0] + '")',
			'width': params[el.id].width,
			'height': params[el.id].height,
			'position': 'relative',
			'background-position': 'top left'
		}).wrap("<div class='coin-slider' id='coin-slider-" + el.id + "' />"); // Wrap with a main slider div

		// Create and append the title bar
		$('#' + el.id).append("<div class='cs-title' id='cs-title-" + el.id + "' style='position: absolute; bottom:0; left: 0; z-index: 1000;'></div>");

		setFields(el); // Initialize the individual square fields

		// If navigation is enabled, set it up
		if(params[el.id].navigation){
			// This part is incomplete in the provided code, but the comment implies navigation setup would follow.
		}
	};
	// This loop iterates over each selected element and initializes the slider.
	return this.each (function () {
		init(this); // Call the initialization function for the current element
		transitionCall(this); // Start the transition cycle
	});

};

// Default options for the Coin Slider plugin.
$.fn.coinslider.defaults = {
	width: 565, // Width of the slider
	height: 290, // Height of the slider
	spw: 7, // Squares per width (number of columns)
	sph: 5, // Squares per height (number of rows)
	delay: 3000, // Delay between transitions (milliseconds)
	sDelay: 30, // Delay between individual square appearances (milliseconds)
	opacity: 0.7, // Opacity of title and navigation elements
	titleSpeed: 500, // Speed of title animation (milliseconds)
	effect: 'random', // Effect type: 'random', 'swirl', 'rain', 'straight'
	navigation: true, // Show navigation buttons
	links : true, // Show image links
	hoverPause: true, // Pause on hover
	showNavigationPrevNext: true, // Show previous/next arrows
	showNavigationButtons: true, // Show image number buttons
	navigationPrevNextAlwaysShown: false, // Prev/Next always visible or only on hover
	prevText: 'prev', // Text for the 'previous' button
	nextText: 'next' // Text for the 'next' button
};

})(jQuery);