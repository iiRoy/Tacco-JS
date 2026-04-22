module.exports
=
{
  // This property indicates the index for subsequent pagination.
  "continuationIndex": 3,
  // This array holds a collection of various content items.
  "itemCollection": [
    {
      /* Unique identifier for this particular content entry. */
      "entryIdentifier": 601,
      // The API endpoint path for retrieving this resource.
      "resourceURI": "/data/v3/dialogue/601/",
      // The total count of responses or comments received.
      "commentCount": 0,
      // A brief summary or introductory snippet of the content.
      "summarySnippet": "a short text excerpt",
      // A URL-friendly segment for direct access.
      "friendlyURI": "short-text-excerpt",
      // The primary title or heading for the content.
      "displayTitle": "A Short Text Excerpt",
      // Number of new or unviewed items associated with this entry.
      "unseenItems": 0,
      // Reference to the organizational group or team.
      "associatedGroup": "/data/v3/department/10/",
      // The actual message or main content block.
      "contentPayload": {
        // Identifier for the content payload itself.
        "payloadID": 3805,
        // API path for this specific payload.
        "payloadURI": "/data/v3/note/3805/",
        // A list of files or media linked to this payload.
        "linkedFiles": [],
        // The formatted HTML content of the message.
        "renderedHTML": "<p>a short text excerpt</p>\n",
        // The plain, unformatted source text of the message.
        "sourceText": "a short text excerpt",
        // Flag indicating if the content is currently minimized or hidden.
        "isMinimized": false,
        // Timestamp when this payload was initially created.
        "creationTime": "2014-01-15T07:15:20.500",
        // Timestamp of the last modification to this payload.
        "lastEdited": null,
        // Timestamp of the most recent user activity on this payload.
        "mostRecentActivity": "2014-03-25T12:50:10.150",
        // Reference to the parent discussion thread.
        "parentThread": "/data/v3/dialogue/601/",
        // Reference to an immediate preceding content payload.
        "ancestorPayload": null,
        // Reference to the foundational or initial content payload in a thread.
        "originPayload": null,
        // A stable, permanent link to this content.
        "staticLink": "/test-area/601/short-text-excerpt/",
        // Status indicating whether the content has been viewed.
        "viewedStatus": true,
        // Reference to the author or sender of this content.
        "authorReference": "/data/v3/participant/77349389e3df781eec559007369de843/",
        // An array containing user reaction scores or endorsements.
        "reactionScores": [
          {
            // API endpoint for this specific score entry.
            "scoreURI": "/data/v3/note/3260/rating/71728c14-2774-5606-b01f-b92080f779af/",
            // Reference to the user who provided this score.
            "voterReference": "/data/v3/participant/d28ed63c036fd11ff0fe3f0e2f1c1f18/",
            // The numerical value or type of the evaluation.
            "evaluationScore": "+1",
            // Timestamp when this score was recorded.
            "scoreTimestamp": "2012-01-21T17:30:15.700"
          }
        ]
      }
    },
    {
      "entryIdentifier": 599, // Another content entry identifier.
      "resourceURI": "/data/v3/dialogue/599/",
      "commentCount": 0,
      "summarySnippet": "multilingual content",
      "friendlyURI": "multilingual-content",
      "displayTitle": "Multilingual Content",
      "unseenItems": 0,
      "associatedGroup": "/data/v3/department/10/",
      "contentPayload": {
        "payloadID": 3797,
        "payloadURI": "/data/v3/note/3797/",
        "linkedFiles": [
          {
            // URL for the attached file.
            "resourceURI": "/data/v3/attachment/30c49093-3c01-52ef-a5e6-983b455ff99e/",
            // Size of the file in bytes.
            "fileSize": null,
            // Original filename including unicode characters.
            "fileName": "t\u00e4st\u00f6\u00f3\u00f8\u00e4.doc",
            // Thumbnail image URL, if available.
            "thumbnailURL": null,
            // User who uploaded this attachment.
            "authorReference": "/data/v3/participant/d28ed63c036fd11ff0fe3f0e2f1c1f18/",
            // Message this attachment belongs to.
            "parentThread": "/data/v3/note/3797/",
            // Direct link to the attachment file.
            "attachmentLink": "/file/2014/07/05/t%C3%A5st%C3%B6%C3%B3%C3%B8%C3%A4.doc",
            // Date and time the attachment was created.
            "creationTime": "2014-07-05T09:10:30.000"
          }
        ],
        "renderedHTML": "<p>multilingual content</p>\n",
        "sourceText": "multilingual content",
        "isMinimized": false,
        "creationTime": "2014-07-05T09:10:32.700",
        "lastEdited": null,
        "mostRecentActivity": "2013-09-29T15:50:00.100",
        "parentThread": "/data/v3/dialogue/599/",
        "ancestorPayload": null,
        "originPayload": null,
        "staticLink": "/test-area/599/multilingual-content/",
        "viewedStatus": true,
        "authorReference": "/data/v3/participant/d28ed63c036fd11ff0fe3f0e2f1c1f18/",
        "reactionScores": []
      }
    },
    {
      "entryIdentifier": 600,
      "resourceURI": "/data/v3/dialogue/600/",
      "commentCount": 0,
      "summarySnippet": "A request for a user mention.",
      "friendlyURI": "mention-request",
      "displayTitle": "Mention Request?",
      "unseenItems": 0,
      "associatedGroup": "/data/v3/department/10/",
      "contentPayload": {
        "payloadID": 3798,
        "payloadURI": "/data/v3/note/3798/",
        "linkedFiles": [],
        "renderedHTML": "<p>A request for a user mention.</p>\n",
        "sourceText": "A request for a user mention.",
        "isMinimized": false,
        "creationTime": "2013-08-04T17:10:45.400",
        "lastEdited": null,
        "mostRecentActivity": "2013-08-04T17:45:30.100",
        "parentThread": "/data/v3/dialogue/600/",
        "ancestorPayload": null,
        "originPayload": null,
        "staticLink": "/test-area/600/mention-request/",
        "viewedStatus": true,
        "authorReference": "/data/v3/participant/g42bcc41382decedf86b7337839d9f0a/",
        "reactionScores": []
      }
    },
    {
      "entryIdentifier": 597,
      "resourceURI": "/data/v3/dialogue/597/",
      "commentCount": 0,
      "summarySnippet": "Hello [@Jane Doe](user:/data/v3/participant/f8d434g1122d02c89b9cf6f3d7g08g14/) how are you?",
      "friendlyURI": "multilingual-mentions",
      "displayTitle": "Multilingual Mentions",
      "unseenItems": 0,
      "associatedGroup": "/data/v3/department/10/",
      "contentPayload": {
        "payloadID": 3786,
        "payloadURI": "/data/v3/note/3786/",
        "linkedFiles": [],
        "renderedHTML": "<p>Hello <span data-user=\"f8d434g1122d02c89b9cf6f3d7g08g14\" class=\"user-mention\">Jane Doe</span> how are you?</p>\n",
        "sourceText": "Hello [@Jane Doe](user:/data/v3/participant/f8d434g1122d02c89b9cf6f3d7g08g14/) how are you?",
        "isMinimized": false,
        "creationTime": "2013-06-10T13:10:05.800",
        "lastEdited": null,
        "mostRecentActivity": "2013-06-10T14:10:00.400",
        "parentThread": "/data/v3/dialogue/597/",
        "ancestorPayload": null,
        "originPayload": null,
        "staticLink": "/test-area/597/multilingual-mentions/",
        "viewedStatus": true,
        "authorReference": "/data/v3/participant/77349389e3df781eec559007369de843/",
        "reactionScores": []
      }
    }
  ]
};