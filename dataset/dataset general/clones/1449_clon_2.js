var MEDIA_DATA_ENDPOINT = "http://gdata.youtube.com/feeds/api/videos/";
var ASSOCIATED_MEDIA_ENDPOINT = "http://gdata.youtube.com/feeds/api/videos/";
var API_REQUEST_PARAMS = "alt=json&format=5&v=2&key=AI39si4kMMM_MKoBruLHD17_U6_NqOf-qFOc5iqpzpH-G67oD3iCtuVv8F51GKJiD3I3bIuCy5Eo4-Pjf1rwMoNmfc6MUS4aOw";
var MAX_ASSOCIATED_ITEMS = 9;

// This module handles media content processing.
function media_processor()
{
}

media_processor.prototype.fetch_associated_clips = function(
	clip_identifier, /* The unique ID for the clip */
	completion_callback /* Function to call upon data retrieval */
)
{
	var request_url = ASSOCIATED_MEDIA_ENDPOINT + clip_identifier + "/" + "related?max-results=9&" + API_REQUEST_PARAMS;

	$.get(request_url, function(response_payload)
	{
		// Attempt to parse the incoming string as JSON
		var parsed_json_object;
		try
		{
			parsed_json_object = JSON.parse(response_payload);
		}
		catch(parsing_error)
		{
			parsed_json_object = response_payload; // Fallback to raw data
		}

		completion_callback(parsed_json_object["feed"]["entry"]);
	});
};

media_processor.prototype.display_associated_clips = function(clip_records)
{
	var current_clip_element;
	var clip_thumbnail_div;
	var clip_details_div;

	for (var idx = 0; idx < clip_records.length; idx++)
	{
		current_clip_element = $("#related_video_block_" + (idx + 1));
		clip_thumbnail_div = current_clip_element.children(".thumbnail");
		clip_details_div = current_clip_element.children(".information");

		current_clip_element.attr("video_data", JSON.stringify(clip_records[idx]));

		clip_thumbnail_div.children("img").attr("src", clip_records[idx]["media$group"]["media$thumbnail"][0]["url"]);
		clip_thumbnail_div.children(".video_time").html(duration_formatter(clip_records[idx]["media$group"]["yt$duration"]["seconds"]));

		media_processor.prototype.render_feedback_score(clip_records[idx], clip_details_div.children(".progress_bar"));
		clip_details_div.children(".title").html(clip_records[idx]["title"]["$t"]);
		clip_details_div.children(".view_count").html(numeric_string_formatter(clip_records[idx]["yt$statistics"]["viewCount"]) + " views");
	}
};

media_processor.prototype.render_feedback_score = function(clip_record, target_element)
{
	var positive_votes = 0;
	var negative_votes = 0;
	var calculated_score;

	try
	{
		calculated_score = Math.round(parseFloat(clip_record["yt$rating"]["numLikes"]) * 100 /
			(parseFloat(clip_record["yt$rating"]["numLikes"]) + parseFloat(clip_record["yt$rating"]["numDislikes"])));

		positive_votes = clip_record["yt$rating"]["numLikes"];
		negative_votes = clip_record["yt$rating"]["numDislikes"];

		// Rating information is present, update the UI
		target_element.css("background", "red");
		target_element.progressbar({ value : calculated_score });
	}
	catch (rating_error)
	{
		// No rating data available, show a blank bar
		target_element.css("background", "white");
		target_element.progressbar({ value : 0 });

		console.info("Rating data not available for entry:", clip_record);
	}

	target_element.siblings(".likes_text").html(numeric_string_formatter(positive_votes) + " likes, " + numeric_string_formatter(negative_votes) + " dislikes");
};

media_processor.prototype.initiate_playback_by_id = function(media_identifier)
{
	var api_request_path = MEDIA_DATA_ENDPOINT + media_identifier + "?" + API_REQUEST_PARAMS;
	var instance_ref = this;

	$.get(api_request_path, function(api_response)
	{
		// Process the received data, ensuring it's JSON
		var parsed_json_object;
		try
		{
			parsed_json_object = JSON.parse(api_response);
		}
		catch(parsing_failure)
		{
			parsed_json_object = api_response;
		}

		// Extract the specific entry for the requested media
		var single_media_entry = parsed_json_object["entry"];
		instance_ref.start_playback_from_entry(single_media_entry);
	});
};

media_processor.prototype.start_playback_from_entry = function(media_data_object)
{
	var this_instance = this;

	swfobject.embedSWF(
			media_data_object["media$group"]["media$content"][0]["url"]
			+ '&rel=1&border=0&fs=1&autoplay=1'
			, 'player_element', '640', '390', '9.0.0',
			false, false, { allowfullscreen: 'true', wmode: 'transparent' }
	);
	$(".current_clip_title_display").html(media_data_object["title"]["$t"]);
	$(".current_clip_description_display").html(media_data_object["media$group"]["media$description"]["$t"]);
	$(".current_clip_views_display").html(numeric_string_formatter(media_data_object["yt$statistics"]["viewCount"]));
	this_instance.render_feedback_score(media_data_object, $(".current_clip_feedback_element"));
};

// --- Helper Functions (assuming these are global or part of another utility) ---

// Converts seconds into a HH:MM:SS format
function duration_formatter(total_seconds) {
	var hours = Math.floor(total_seconds / 3600);
	total_seconds %= 3600;
	var minutes = Math.floor(total_seconds / 60);
	var seconds = total_seconds % 60;

	return [hours, minutes, seconds]
		.map(v => v < 10 ? "0" + v : v)
		.filter((v, i) => v !== "00" || i > 0)
		.join(":");
}

// Formats a number with comma separators
function numeric_string_formatter(input_number) {
	return input_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}