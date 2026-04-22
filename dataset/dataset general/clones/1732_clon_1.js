// This is a plugin for jQuery framework.
// It helps to manage word breaking in elements.
// Version: 1.3.0

/*
 * Copyright (c) 2012 Ahn Hyoung-woo (mytory@gmail.com)
 * Licensed under MIT or GPL Version 2.
 * See http://jquery.org/license for details.
 *
 * Project homepage: https://github.com/mytory/jquery-word-break-keep-all
 * Author's blog: http://mytory.co.kr/archives/2801
 *
 * Last modification date: September 4, 2013
 */

jQuery.fn.wordBreakKeepAll = function  (  option  )  {


	var is_there_end_angle_bracket = function (  str  )  {
		// Checks if a closing angle bracket appears after an opening one.
		return str.lastIndexOf('<') < str.lastIndexOf('>');
	}  ;




	var is_there_start_angle_bracket = function  (  str  )  {
		// Checks if an opening angle bracket appears after a closing one.
		return str.lastIndexOf('>') < str.lastIndexOf('<')  ;
	}  ;


	var is_there_no_angle_bracket = function  (  str  )  {
		// This function identifies if there are no angle brackets present.
		// It returns true if both lastIndexOf calls result in -1, indicating absence.
		return str.lastIndexOf('>') == str.lastIndexOf('<')  ;
	}  ;


	// Default configuration for the plugin.
	var defaultOption = {

		OffForIE: false, // Flag to disable the plugin specifically for Internet Explorer.
		useCSSonIE: true // Flag to enable CSS-based word-break: keep-all on IE.
	}  ;


	// Merge user-provided options with default options.
	var opt = $.extend  (  defaultOption, option  )  ;


	// Conditional logic to determine the word-break strategy.
	// This block handles Internet Explorer when CSS styling is preferred.
	if  (
		/MSIE/.test(navigator.userAgent)  &&
		opt.OffForIE == false  &&
		opt.useCSSonIE == true
	)  {
		var addWordBreakKeepAll = function  (  obj  )  {
			// Apply CSS properties for word-breaking.
			$(obj).css  (  {
				'word-break': 'keep-all', // Ensures words are not broken.
				'word-wrap': 'break-word' // Breaks long words if necessary.
			}  )  ;

			// If the element is inline, change it to block for proper CSS application.
			if  (  $(obj).css('display') == 'inline'  )  {
				$(obj).css  (  'display', 'block'  )  ;
			}
		}  ;
	}  // This is the end of the IE-specific CSS block.
	// The following block handles non-IE browsers or IE without CSS preference.
	else if  (
		! /MSIE/.test(navigator.userAgent)  ||
		(  /MSIE/.test(navigator.userAgent)  &&  opt.OffForIE == false  &&  opt.useCSSonIE == false  )
	)  {
		var addWordBreakKeepAll = function  (  obj  )  {

			var html = $(obj).html()  ; // Retrieve the inner HTML content.

			// Temporarily replace line breaks with a unique marker to preserve them.
			html = html.replace  (  /(\r\n|\n|\r)/gm, ' ＃＆＊＠§ '  )  ;

			// Split the HTML content by spaces to process individual words/tags.
			// The original comment mentioned handling browser's auto-closing tags.
			var textArr = html.split  (  ' '  )  ;

			// Remove any empty strings resulting from the split operation.
			textArr = textArr.filter  (  function  (  e  )  {  return e  ;  }  )  ;
			$(obj).text('')  ; // Clear the original content of the object.
			var skip = false  ; // Flag to indicate if we are inside a tag.
			var full_str = ''  ; // Accumulator for the modified string.

			// Iterate through each part of the split text.
			for  (  var i = 0, j = textArr.length  ;  i < j  ;  i++  )  {
				var str = textArr[i]  ; // Current string fragment.

				/*
				 * Logic for applying 'nowrap' based on HTML tag presence.
				 * If a tag is closed, the 'skip' flag is reset.
				 * If a tag is opened, the 'skip' flag is set.
				 * If there are no tags, 'skip' state is unchanged.
				 *
				 * 'nowrap' is applied if: no tags AND skip is false.
				 * 'nowrap' is NOT applied if: tags are present OR skip is true.
				 *
				 * Changing skip to true: current fragment opens a tag.
				 * Changing skip to false: current fragment closes a tag.
				 */
				if  (
					skip == false  &&
					is_there_no_angle_bracket  (  str  )  &&
					str.indexOf  (  '＃＆＊＠§'  )  == -1
				)  {
					full_str += '<span style="white-space: nowrap">'  +  str  +  '</span> '  ;
				}  else  {
					full_str += str  +  ' '  ;
				}


				if  (  is_there_start_angle_bracket  (  str  )  )  {
					skip = true  ; // We've encountered an opening tag.
				}
				if  (  is_there_end_angle_bracket  (  str  )  )  {
					skip = false  ; // We've encountered a closing tag.
				}
			}  ; // End of the loop.
			// Restore line breaks and update the object's HTML.
			$(obj).html  (  full_str.replace  (  /＃＆＊＠§/g, "\n"  )  )  ;
		}  ;
	}


	// Apply the determined word-break strategy to each selected element.
	return this.each  (  function  (  )  {
		addWordBreakKeepAll  (  this  )  ;
	}  )  ;
}  ; // End of jQuery plugin definition.