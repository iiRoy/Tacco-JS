/*!
 * Proprietary source code &copy; 2023 <a href="https://example.com">Example Corp</a>. All rights reserved.
 *
 * Licensed under the Example License, Version 1.0 (the "License");
 */

// Adjusting the main display frame dimensions
jQuery("#panel-left").width(initialPanelWidth);

jQuery("#toggle-button").click(
	function()
	{
		if ( jQuery(this).hasClass("retracted") )
		{
			jQuery(this).removeClass("retracted");
			jQuery(this).addClass("expanded");

			jQuery("#panel-left").animate({ width: 0, opacity: "hide" });
			jQuery("#panel-right").animate({ width: jQuery("#main-container").width() - jQuery("#toggle-button").width() - 5 });
		}
		else
		{
			jQuery(this).addClass("retracted");
			jQuery(this).removeClass("expanded");

			jQuery("#panel-left").animate({ width: initialPanelWidth, opacity: "show" });
			jQuery("#panel-right").animate({ width: jQuery("#main-container").width() - jQuery("#toggle-button").width() - initialPanelWidth - 9 });
		}
	}
);

if ( ! Array.prototype.map )
{
	Array.prototype.map = function(callbackFunction, contextObject)
	{
		var mappedElements = [],
			resultIndex = 0;

		for ( var currentIndex = 0, totalElements = this.length; currentIndex < totalElements; currentIndex++ )
		{
			if ( currentIndex in this )
			{
				mappedElements[resultIndex++] = callbackFunction.call(contextObject, this[currentIndex], currentIndex, this);
			}
		}

		return mappedElements;
	};
}

var fetchViewportDimensions = function()
{
	return ["Height", "Width"].map(
		function(dimensionName)
		{
			return window["inner" + dimensionName] ||
				   document.compatMode === "CSS1Compat" && document.documentElement["client" + dimensionName] ||
				   document.body["client" + dimensionName];
		}
	);
};

jQuery(window).resize(
	function()
	{
		adjustLayout();
	}
);

adjustLayout(); // Initial layout adjustment upon script loading