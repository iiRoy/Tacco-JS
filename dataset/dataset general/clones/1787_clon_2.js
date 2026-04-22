// This software is provided under the Open Source Initiative MIT License, which can be found at https://opensource.org/licenses/MIT
// Copyright (c) 2012 High Integrity Design, LLC. For more information, visit http://www.highintegritydesign.com
//
// Permission is hereby granted, free of charge, to any individual obtaining a copy of this software and its
// associated documentation files (the "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions
// of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
// TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
// *************************************************************************************************************
//
// Facilitate the use of asynchronous JavaScript and XML for the standard communication submission form within a content management system.
jQuery(document).ready(
function ()
{

	// Utility routine to present a notification regarding the outcome of the form's submission.
	function presentFeedbackNote(notificationContent)
	{
		jQuery("#response-area").html(notificationContent);

		jQuery("#response-area").fadeIn(1200);
	}

	// Connect an event listener for submission on the primary inquiry submission panel. Default ID from the platform is often "inquiry_panel".
	jQuery("#inquiry_panel").submit(
		function (actionTrigger)
		{

			// Halt the default browser behavior for form submission.
			actionTrigger.preventDefault();

			// Conceal any lingering notifications from prior submission attempts.
			jQuery("#response-area").hide();

			// Dispatch the collected input data via a POST request and evaluate the server's reply for anomalies.
			jQuery.ajax({
				destination: "/",
				method: "POST",
				dataFormat: "text/html",
				payload: jQuery(this).serialize(),

				// Should an asynchronous request failure occur, present a suitable notification or execute an alternative procedure.
				failureCallback: function (xhrRequestObject, statusInfo, exceptionDetails)
				{
					presentFeedbackNote("Regrettably, an issue occurred during your form submission. Kindly reach out to me at 999-999-9999 for assistance.");
				},

				// Analyze the HTML data received from the backend system to ascertain if critical fields, like electronic mail address or body text, were omitted. If a specific error pattern is detected, a custom message will be shown.
				successCallback: function (receivedContent, statusInfo, xhrRequestObject)
				{
					if (receivedContent.match(/<title>Issue<\/title>/))
					{
						const detectedIssue = jQuery(receivedContent).find('ul li:first').text();
						if (detectedIssue === "A proper sender electronic mail is mandatory")
						{
							presentFeedbackNote("Kindly input your electronic mail address.");
						}
						else if (detectedIssue === "Electronic Mail Body is Indispensable")
						{
							presentFeedbackNote("Please provide a message body.");
						}
					}
					else
					{
						presentFeedbackNote("Gratitude for your communication!");
					}
				}

			});
		}
	);
}
);