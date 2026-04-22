export const forumThreadCollection = {
  // Metadata for pagination, indicating the token for the next page of results.
  // This is a base64 encoded string representing a cursor for fetching subsequent data.
  nextPageToken: "eyJvZmZzZXQiOjIsImxpbWl0IjoxMH0=", // Example: base64 of {"offset":2,"limit":10}
  // Total number of discussion entries available in the entire collection.
  totalRecordsFound: 4,
  // Timestamp when this data was generated or last processed.
  retrievalTimestamp: new Date().toISOString(), // Dynamically generated for demonstration

  // An array containing individual forum discussion entries.
  discussionEntries: [
    {
      // A unique identifier for this specific discussion thread.
      threadId: "d_595",
      // Type of content represented by this entry.
      contentType: "DISCUSSION_THREAD",
      // A direct link to the full discussion resource.
      resourcePath: "/api/v2/thread/595/",
      // A brief summary or introductory text for the thread.
      summary: "blop",
      // A URL-friendly string identifier for the thread.
      urlSlug: "bleep-bloop-thread",
      // The human-readable title of the discussion.
      displayHeading: "Bleep Bloop Conversation",
      // Number of new messages the current user hasn't read.
      unseenMessageCount: 0,
      // Reference to the team or group associated with this discussion.
      groupReference: {
        groupId: "T9",
        groupApiUrl: "/api/v2/group/9/"
      },
      // Additional internal metadata for the entry.
      entryMetaData: {
        isArchived: false,
        priorityLevel: "NORMAL"
      },
      // The initial message or opening post of the discussion thread.
      mainPost: {
        // Unique identifier for this specific message within the thread.
        messageId: "m_3798",
        // API endpoint for retrieving this message.
        messageApiEndpoint: "/api/v2/message/3798/",
        // Array of files attached to this message.
        attachedAssets: [], // No attachments for this specific post
        // HTML formatted content of the message body.
        renderedContent: "<p>blop</p>\n",
        // Plain text version of the message content.
        rawTextContent: "blop",
        // Indicates if the message content is currently minimized/collapsed.
        presentationState: "EXPANDED", // Changed from boolean 'collapsed' to enum string
        // Timestamp when this message was originally posted.
        postedAt: "2013-09-13T06:00:40.421Z", // Added 'Z' for UTC explicitly
        // Timestamp of the last modification to this message.
        lastModifiedAt: null, // Still null, but could be omitted if consistently null
        // Timestamp of the latest activity (e.g., new replies, edits) related to this message.
        latestActivityTimestamp: "2014-02-20T11:42:04.251Z",
        // Reference to the parent discussion thread.
        owningThreadRef: "/api/v2/thread/595/",
        // Reference to the message this one is a direct reply to (if any).
        inReplyTo: null, // Retained null, could be an empty string or undefined
        // Reference to the root message of the entire conversation branch.
        rootMessageRef: null, // Retained null, could be an empty string or undefined
        // Full URL for direct access to this message.
        absoluteUrl: "/test-sandbox/595/bleep-bloop-thread/",
        // Indicates if the current user has read this message.
        readStatus: "VIEWED", // Changed from boolean 'read' to enum string
        // Reference to the author of this message.
        authorInfo: {
          userId: "user_66238278d2ce670dcb448f96258dc732",
          userApiUrl: "/api/v2/user/66238278d2ce670dcb448f96258dc732/"
        },
        // Collection of reactions (e.g., likes, upvotes) to this message.
        userReactions: [
          {
            // API link for this specific reaction.
            reactionEndpoint: "/api/v2/message/3252/reaction/60617b03-1663-4595-a90e-a8197fe668af/",
            // User who performed this reaction.
            reactorDetails: {
              reactorId: "user_c17ec52b925fc0fe2f4eadf1f10b0bf7",
              reactorApiUrl: "/api/v2/user/c17ec52b925fc0fe2f4eadf1f10b0bf7/"
            },
            // Type of reaction.
            reactionType: "THUMBS_UP", // Changed from "+1" string
            // Timestamp of the reaction.
            reactionTime: "2011-10-20T16:29:07.639Z"
          }
        ]
      }
    },
    {
      threadId: "d_592",
      contentType: "DISCUSSION_THREAD",
      resourcePath: "/api/v2/thread/592/",
      summary: "unicode",
      urlSlug: "unicode-characters",
      displayHeading: "Unicode Test Discussion",
      unseenMessageCount: 0,
      groupReference: {
        groupId: "T9",
        groupApiUrl: "/api/v2/group/9/"
      },
      entryMetaData: {
        isArchived: false,
        priorityLevel: "NORMAL"
      },
      mainPost: {
        messageId: "m_3789",
        messageApiEndpoint: "/api/v2/message/3789/",
        attachedAssets: [
          {
            // Unique identifier for the attachment. (New field)
            assetId: "29b38982-2bf0-41eb-94d5-872a344ef88d",
            // API endpoint for this attachment.
            assetApiLink: "/api/v2/attachment/29b38982-2bf0-41eb-94d5-872a344ef88d/",
            // Size of the file in kilobytes. (Changed null to 0 or actual value)
            fileSizeKB: 0, // Original was null, assuming unknown or 0 for this example
            // The original filename provided by the uploader.
            originalFileName: "tåstööøä.txt",
            // The MIME type of the attached file. (New field)
            mimeType: "text/plain",
            // A URL to a preview image/thumbnail if available.
            previewThumbnailUrl: null, // Still null, could be omitted
            // Reference to the user who uploaded this attachment.
            uploadedBy: {
              uploaderId: "user_c17ec52b925fc0fe2f4eadf1f10b0bf7",
              uploaderApiUrl: "/api/v2/user/c17ec52b925fc0fe2f4eadf1f10b0bf7/"
            },
            // Reference to the message this attachment belongs to.
            parentPostLink: "/api/v2/message/3789/",
            // Direct download link for the attachment.
            downloadResourceLink: "/file/2013/06/04/t%C3%A5st%C3%B6%C3%B3%C3%B8%C3%A4.txt",
            // Timestamp when the attachment was uploaded.
            uploadTimestamp: "2013-06-04T08:07:24.920Z"
          }
        ],
        renderedContent: "<p>unicode</p>\n",
        rawTextContent: "unicode",
        presentationState: "EXPANDED",
        postedAt: "2013-06-04T08:07:26.678Z",
        lastModifiedAt: null,
        latestActivityTimestamp: "2013-08-28T14:42:54.087Z",
        owningThreadRef: "/api/v2/thread/592/",
        inReplyTo: null,
        rootMessageRef: null,
        absoluteUrl: "/test-sandbox/592/unicode-characters/",
        readStatus: "VIEWED",
        authorInfo: {
          userId: "user_c17ec52b925fc0fe2f4eadf1f10b0bf7",
          userApiUrl: "/api/v2/user/c17ec52b925fc0fe2f4eadf1f10b0bf7/"
        },
        userReactions: []
      }
    },
    {
      threadId: "d_593",
      contentType: "DISCUSSION_THREAD",
      resourcePath: "/api/v2/thread/593/",
      summary: "Can someone please mention me?",
      urlSlug: "mention-request",
      displayHeading: "Mention me, please?",
      unseenMessageCount: 0,
      groupReference: {
        groupId: "T9",
        groupApiUrl: "/api/v2/group/9/"
      },
      entryMetaData: {
        isArchived: false,
        priorityLevel: "NORMAL"
      },
      mainPost: {
        messageId: "m_3790",
        messageApiEndpoint: "/api/v2/message/3790/",
        attachedAssets: [],
        renderedContent: "<p>Can someone please mention me?</p>\n",
        rawTextContent: "Can someone please mention me?",
        presentationState: "EXPANDED",
        postedAt: "2013-07-03T16:09:34.351Z",
        lastModifiedAt: null,
        latestActivityTimestamp: "2013-07-03T16:34:25.065Z",
        owningThreadRef: "/api/v2/thread/593/",
        inReplyTo: null,
        rootMessageRef: null,
        absoluteUrl: "/test-sandbox/593/mention-request/",
        readStatus: "VIEWED",
        authorInfo: {
          userId: "user_f31abb30271cdecae75a6227128c8fd9",
          userApiUrl: "/api/v2/user/f31abb30271cdecae75a6227128c8fd9/"
        },
        userReactions: []
      }
    },
    {
      threadId: "d_590",
      contentType: "DISCUSSION_THREAD",
      resourcePath: "/api/v2/thread/590/",
      summary: "Hey [@Yann Malet](user:/api/v2/user/e7c323f0011c91b78a8bd5e2d6df8d03/) how are yo?",
      urlSlug: "unicode-mentions-test",
      displayHeading: "Unicode Mentions Feature",
      unseenMessageCount: 0,
      groupReference: {
        groupId: "T9",
        groupApiUrl: "/api/v2/group/9/"
      },
      entryMetaData: {
        isArchived: false,
        priorityLevel: "NORMAL"
      },
      mainPost: {
        messageId: "m_3779",
        messageApiEndpoint: "/api/v2/message/3779/",
        attachedAssets: [],
        renderedContent: "<p>Hey <span data-user=\"e7c323f0011c91b78a8bd5e2d6df8d03\" class=\"user-mention\">Yann Malet</span> how are yo?</p>\n",
        rawTextContent: "Hey [@Yann Malet](user:/api/v2/user/e7c323f0011c91b78a8bd5e2d6df8d03/) how are yo?",
        presentationState: "EXPANDED",
        postedAt: "2013-05-09T12:08:54.761Z",
        lastModifiedAt: null,
        latestActivityTimestamp: "2013-05-09T13:08:49.379Z",
        owningThreadRef: "/api/v2/thread/590/",
        inReplyTo: null,
        rootMessageRef: null,
        absoluteUrl: "/test-sandbox/590/unicode-mentions-test/",
        readStatus: "VIEWED",
        authorInfo: {
          userId: "user_66238278d2ce670dcb448f96258dc732",
          userApiUrl: "/api/v2/user/66238278d2ce670dcb448f96258dc732/"
        },
        userReactions: []
      }
    }
  ]
};