var VIDEO_INFO_LINK = "http://gdata.youtube.com/feeds/api/videos/"; // Base URL for fetching video information
var RELATED_LINK = "http://gdata.youtube.com/feeds/api/videos/"; // Base URL for fetching related videos
var VERSION_FORMAT = "alt=json&format=5&v=2&key=AI39si4kMMM_MKoBruLHD17_U6_NqOf-qFOc5iqpzpH-G67oD3iCtuVv8F51GKJiD3I3bIuCy5Eo4-Pjf1rwMoNmfc6MUS4aOw"; // API version and format parameters, including a developer key
var TOTAL_RELATED = 9; // Defines the total number of related videos to fetch or display

// Example API calls for reference:
// Fetching a specific video's information: http://gdata.youtube.com/feeds/api/videos/rrbnbDDTh4Q?alt=json&v=2
// Fetching related videos for a specific video: http://gdata.youtube.com/feeds/api/videos/rrbnbDDTh4Q/related?alt=json&max-results=3&v=2

/*
 * This is the main constructor function for the youtube_videos object.
 * It doesn't perform any initialization logic currently, but could be extended.
 */
function youtube_videos()
{
} // End of youtube_videos constructor

/**
 * Retrieves a list of videos related to a given video ID.
 *
 * @param {string} video_id - The unique identifier of the video.
 * @param {function} call_back - The callback function to execute with the fetched data.
 */
youtube_videos.prototype.get_related_videos = function( video_id, call_back )
{
	// Construct the URL for the related videos API endpoint
	var url = RELATED_LINK + video_id + "/" + "related?max-results=9&" + VERSION_FORMAT;

	// Make an asynchronous GET request to the YouTube API
	$.get( url, function( data )
	{
		// Declare a variable to hold the parsed JSON data
		var json_data;

		// Attempt to parse the incoming data as JSON
		try
		{
			json_data = JSON.parse( data );
		}
		// If parsing fails (e.g., data is already an object), assign it directly
		catch ( err )
		{
			json_data = data;
		}

		// Execute the provided callback function with the array of related video entries
		call_back( json_data["feed"]["entry"] );
	}); // End of $.get callback function
}; // End of get_related_videos method

/*
 * Populates the UI with related video information based on a provided array of entries.
 *
 * @param {Array} entries - An array of video entry objects from the YouTube API.
 */
youtube_videos.prototype.set_related_videos = function( entries )
{
	// Declare variables for DOM elements and video data
	var related_video, thumbnail, information;

	// Iterate through each entry in the provided array
	for ( var i = 0; i < entries.length; i++ )
	{
		// Select the specific related video block using its ID
		related_video = $( "#related_video_block_" + ( i + 1 ) );
		// Get the thumbnail container within the block
		thumbnail = related_video.children( ".thumbnail" );
		// Get the information container within the block
		information = related_video.children( ".information" );

		// Store the full video data as a JSON string attribute on the related video block
		related_video.attr( "video_data", JSON.stringify( entries[i] ) );

		// Set the source of the thumbnail image
		thumbnail.children( "img" ).attr( "src", entries[i]["media$group"]["media$thumbnail"][0]["url"] );
		// Update the video duration display
		thumbnail.children( ".video_time" ).html( secondsToHms( entries[i]["media$group"]["yt$duration"]["seconds"] ) );

		// Call the set_rating method to display rating information
		youtube_videos.prototype.set_rating( entries[i], information.children( ".progress_bar" ) );
		// Update the video title
		information.children( ".title" ).html( entries[i]["title"]["$t"] );
		// Update the view count, formatted with commas
		information.children( ".view_count" ).html( add_commas( entries[i]["yt$statistics"]["viewCount"] ) + " views" );
	} // End of loop
}; // End of set_related_videos method

/**
 * Displays the like/dislike rating for a video.
 *
 * @param {object} entry - The video entry object containing rating information.
 * @param {jQuery} selector - The jQuery selector for the element where the progress bar should be displayed.
 */
youtube_videos.prototype.set_rating = function( entry, selector )
{
	var likes = 0;    // Initialize likes count
	var dislikes = 0; // Initialize dislikes count
	var rating;       // Declare rating variable

	try
	{
		// Calculate the percentage rating based on likes and dislikes
		rating = Math.round( parseFloat( entry["yt$rating"]["numLikes"] ) * 100 /
			( parseFloat( entry["yt$rating"]["numLikes"] ) + parseFloat( entry["yt$rating"]["numDislikes"] ) ) );

		// Assign actual like and dislike counts
		likes = entry["yt$rating"]["numLikes"];
		dislikes = entry["yt$rating"]["numDislikes"];

		// If rating information is available, display it using a progress bar
		selector.css( "background", "red" );        // Set background color for the progress bar
		selector.progressbar( { value : rating } ); // Initialize/update the progress bar
	}
	catch ( err )
	{
		// If no rating information is available, set the progress bar to blank
		selector.css( "background", "white" );     // Set background to white
		selector.progressbar( { value : 0 } );     // Set progress bar value to 0

		// Log the entry for debugging purposes if rating data is missing
		console.log( entry );
	}

	// Update the text display for likes and dislikes, formatted with commas
	selector.siblings( ".likes_text" ).html( add_commas( likes ) + " likes, " + add_commas( dislikes ) + " dislikes" );
}; // End of set_rating method

/*
 * Plays a video given its ID by fetching its full information first.
 *
 * @param {string} video_id - The ID of the video to play.
 */
youtube_videos.prototype.play_video_by_id = function( video_id )
{
	// Construct the URL to get detailed video information
	var url = VIDEO_INFO_LINK + video_id + "?" + VERSION_FORMAT;
	var self = this; // Store reference to 'this' for use in callback scope

	// Fetch video information using an AJAX GET request
	$.get( url, function( data )
	{
		// Variable to hold the JSON data
		var json_data;

		// Attempt to parse the data as JSON, handle potential errors
		try
		{
			json_data = JSON.parse( data );
		}
		catch ( err )
		{
			json_data = data;
		}

		// Extract the single video entry from the response
		var entry = json_data["entry"];
		// Call the method to play the video using the fetched entry
		self.play_video_by_entry( entry );
	}); // End of $.get callback
}; // End of play_video_by_id method

/**
 * Embeds and plays a video using its full entry object.
 * Also updates related UI elements like title, description, and views.
 *
 * @param {object} entry - The complete video entry object from the YouTube API.
 */
youtube_videos.prototype.play_video_by_entry = function( entry )
{
	var self = this; // Cache 'this' for consistent scope

	// Embed the YouTube video player using swfobject.js
	swfobject.embedSWF(
		entry["media$group"]["media$content"][0]["url"] // The URL of the video content
		+ '&rel=1&border=0&fs=1&autoplay=1'           // Player parameters: related videos off, no border, fullscreen enabled, autoplay
		, 'player'                                    // ID of the HTML element where the player will be embedded
		, '640'                                       // Width of the player
		, '390'                                       // Height of the player
		, '9.0.0'                                     // Minimum required Flash Player version
		, false                                       // Optional: path to an express install swf
		, false                                       // Optional: flashvars object
		, { allowfullscreen: 'true', wmode:'transparent' } // Optional: params object (allowfullscreen, wmode for layering)
	);

	// Update the video title display
	$( ".play_video_title" ).html( entry["title"]["$t"] );
	// Update the video description display
	$( ".play_video_description" ).html( entry["media$group"]["media$description"]["$t"] );
	// Update the video view count display, formatted with commas
	$( ".play_video_views" ).html( add_commas( entry["yt$statistics"]["viewCount"] ) );
	// Set the rating display for the playing video
	self.set_rating( entry, $( ".play_video_likes" ) );
}; // End of play_video_by_entry method