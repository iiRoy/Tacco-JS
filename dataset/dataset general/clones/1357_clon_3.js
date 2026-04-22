var AppSettings = (function() {
    // This self-executing function manages application-wide configuration.
    // It's designed to provide read-only access to essential parameters.

    // Internal data store for all application settings.
    // Modify these values as needed for different deployments or environments.
    var appDataStore = {
        // Core community identification and branding
        'communityName': typeof _CHAPTER_NAME_ !== 'undefined' ? _CHAPTER_NAME_ : 'Developer Community', // Descriptive name of the chapter/group
        'chapterIdentifier': typeof _CHAPTER_ID_ !== 'undefined' ? _CHAPTER_ID_ : '123456789012345678901', // Unique ID for Google+ and other services
        'gPlusApiKey': typeof _API_KEY_ !== 'undefined' ? _API_KEY_ : 'YOUR_GOOGLE_API_KEY', // API key for Google services access
        'photoAlbumId': typeof _PICASA_ALBUM_ID !== 'undefined' ? _PICASA_ALBUM_ID : '5738801490307387457', // Picasa Web Album ID for general photos

        // User interface and visual customization options
        'useHeroImage': true, // Controls whether a cover photo is displayed (recommend 940x180 px)
        'heroTextColor': '#f8f8f8', // Text color to use on top of the hero image for readability
        'visualStyle': 'gdg.css', // Defines the primary CSS theme (e.g., 'devgoogle.css' is another option)

        // Advanced event-specific photo gallery mappings
        'eventPhotoMappings': {
            // Example: 'ahNzfmdvb2dsZS1kZXZlbG9wZXJzcg4LEgVFdmVudBib8PsDDA': 'albumId123'
            // Map event IDs to specific Picasa album IDs for custom galleries
        }
    };

    // Public interface for accessing configuration values.
    // Provides a controlled way to retrieve settings.
    return {
        fetch: function(settingKey) {
            // Retrieve a specific configuration value.
            // Basic validation: ensure the key exists.
            if (!appDataStore.hasOwnProperty(settingKey)) {
                console.warn(`Attempted to access non-existent setting: "${settingKey}". Returning undefined.`);
                return undefined;
            }
            // Return a deep copy for objects to prevent external modification,
            // otherwise return the primitive value directly.
            const value = appDataStore[settingKey];
            if (typeof value === 'object' && value !== null) {
                return JSON.parse(JSON.stringify(value)); // Simple deep clone
            }
            return value;
        }
    };
})();

// Helper function to safely append CSS stylesheets.
function addStylesheet(fileName) {
    const headElement = $('head');
    if (headElement.length) {
        headElement.append(`<link href="css/${fileName}" rel="stylesheet" type="text/css"/>`);
    } else {
        console.error("HEAD element not found, cannot append stylesheet.");
    }
}

// Function to update document title and brand text.
function updateBranding() {
    const communityName = AppSettings.fetch('communityName');
    if (communityName) {
        $('title').prepend(`${communityName} | `);
        $('.brand').html(`<strong>${communityName}</strong>`);
    }
}

// Initialization block: Executed once the DOM is fully loaded.
$(document).ready(function() {
    // 1. Load the primary CSS theme.
    addStylesheet(AppSettings.fetch('visualStyle'));

    // 2. Perform initial content section display and navigation highlighting.
    navigateContentSections();

    // 3. Set the default active navigation item and display its corresponding section.
    const defaultSectionId = 'about';
    $(`#${defaultSectionId}_sec`).show();
    $(`#${defaultSectionId}_nav`).addClass('active');

    // 4. Update page title and brand display.
    updateBranding();
});

// Event listener for URL hash changes, triggering content updates.
$(window).on('hashchange', function() {
    navigateContentSections();
});

// Main function to manage content section visibility based on URL hash.
var navigateContentSections = function() {
    const currentHash = location.hash;
    let targetSectionId = currentHash.substring(1); // Remove '#' prefix

    // If no hash or an invalid hash, default to 'about' section.
    if (!targetSectionId || !document.getElementById(`${targetSectionId}_sec`)) {
        targetSectionId = 'about';
        // Optionally update the URL hash to reflect the default section
        // history.replaceState(null, null, `#${targetSectionId}`);
    }

    // Hide all content panels.
    $('.panel-display').hide(); // Renamed from '.panel'

    // Deactivate all navigation items.
    $('.main-nav li').removeClass('active'); // Renamed from '.nav li'

    // Show the target content section.
    $(`#${targetSectionId}_sec`).show();

    // Activate the corresponding navigation item.
    $(`#${targetSectionId}_nav`).addClass('active');
};

// Handle clicks on the "Join Chapter" button.
$('#join_community').on('click', function(e) { // Renamed from '#join_chapter'
    e.preventDefault(); // Prevent default link behavior
    const chapterId = AppSettings.fetch('chapterIdentifier');
    if (confirm('You are about to be redirected to the community\'s registration page. Continue?')) {
        window.open(`https://developers.google.com/groups/chapter/join/${chapterId}`, '_blank');
        // Removed the setTimeout for immediate redirection as it's a new window.
        // If it were the same window, a delay might be used for intermediate messaging.
    }
});

// Handle clicks on the Google+ link.
$('li#googleplus_link').on('click', function() { // Renamed from 'li#googleplus'
    const chapterId = AppSettings.fetch('chapterIdentifier');
    window.open(`https://plus.google.com/${chapterId}`, '_blank');
});

// Fetch and display Google+ page information.
$.getJSON(`https://www.googleapis.com/plus/v1/people/${AppSettings.fetch('chapterIdentifier')}?fields=aboutMe%2Ccover%2CdisplayName%2Cimage%2CplusOneCount&key=${AppSettings.fetch('gPlusApiKey')}`, function(apiResponse) {
    if (apiResponse && !apiResponse.error) {
        // Update "About Us" content.
        if (apiResponse.aboutMe) {
            $('#about_us_content').html(apiResponse.aboutMe); // Renamed from '#about'.next()
        }

        // Configure hero image (cover photo).
        const useHero = AppSettings.fetch('useHeroImage');
        if (useHero && apiResponse.cover && apiResponse.cover.coverPhoto && apiResponse.cover.coverPhoto.url) {
            const coverUrl = apiResponse.cover.coverPhoto.url;
            const leftOffset = apiResponse.cover.coverInfo.leftImageOffset || 0;
            const topOffset = apiResponse.cover.coverInfo.topImageOffset || 0;
            const textColor = AppSettings.fetch('heroTextColor');

            $('#hero_banner').css({ // Renamed from '#home'
                'background-image': `url(${coverUrl})`,
                'background-position': `${leftOffset}px ${topOffset}px`,
                'background-repeat': 'no-repeat',
                'background-size': 'cover', // Added to ensure cover fills area
                'color': textColor
            });
        }
    } else {
        console.error("Error fetching Google+ profile data:", apiResponse.error || "Unknown error");
        // Optionally display a user-friendly message on the page
        $('#about_us_content').html('<p class="error-message">Failed to load "About Us" information. Please try again later.</p>');
    }
});

// Function to asynchronously load and display photos for a specific event gallery.
var processEventGallery = function(eventId, albumId) {
    const userId = AppSettings.fetch('chapterIdentifier');
    const picasaApiUrl = `https://picasaweb.google.com/data/feed/api/user/${userId}/albumid/${albumId}?alt=json-in-script&callback=?&max-results=12&kind=photo`;

    $.getJSON(picasaApiUrl, function(galleryData) {
        if (!galleryData || !galleryData.feed || !galleryData.feed.entry || galleryData.feed.entry.length === 0) {
            // console.log(`No photos found for event ${eventId} in album ${albumId}.`);
            return; // Exit if no photos are available
        }

        const photoEntries = galleryData.feed.entry;
        const targetElement = $(`#${eventId}`); // Target UL element for thumbnails

        photoEntries.forEach(function(photo) {
            if (photo.link && photo.link[1] && photo.content) {
                const thumbnailUrl = photo.content.src + '?sz=260'; // Consistent thumbnail size
                const fullImageUrl = photo.link[1].href;
                const photoTitle = photo.title.$t || '';
                const photoSummary = photo.summary.$t || '';

                const thumbnailMarkup = `
                    <li class="span2">
                        <a href="${fullImageUrl}" class="thumbnail-link" target="_blank" title="${photoSummary}">
                            <img src="${thumbnailUrl}" alt="${photoTitle}">
                        </a>
                    </li>`;
                targetElement.append(thumbnailMarkup);
            }
        });
    }).fail(function(jqxhr, textStatus, error) {
        console.error(`Error loading event gallery for event ${eventId}, album ${albumId}: ${textStatus}, ${error}`);
    });
};

// Simple date formatter utility.
const DateFormatter = {
    formatDate: function(dateObj, style) {
        const options = {};
        switch (style) {
            case 'longDate':
                options.year = 'numeric';
                options.month = 'long';
                options.day = 'numeric';
                break;
            case 'shortTime':
                options.hour = 'numeric';
                options.minute = '2-digit';
                options.hour12 = true;
                break;
            default:
                options.year = 'numeric';
                options.month = 'short';
                options.day = 'numeric';
        }
        return dateObj.toLocaleDateString('en-US', options);
    },
    formatTime: function(dateObj, style) {
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return dateObj.toLocaleTimeString('en-US', options);
    }
};

// Fetch and display GDG Dev Site events feed.
const eventFeedUrl = `http://gdgfresno.com/gdgfeed.php?id=${AppSettings.fetch('chapterIdentifier')}`; // Using original URL for now, could be a proxy or different API.
$.getJSON(eventFeedUrl, function(eventData) {
    if (!eventData || !Array.isArray(eventData) || eventData.length === 0) {
        console.log("No event data received or data is empty.");
        $('#upcoming_events_list').html('<p>No upcoming events at this time.</p>');
        $('#past_events_list').html('<p>No past events available.</p>');
        return;
    }

    const currentMoment = new Date();
    const eventPhotoMappings = AppSettings.fetch('eventPhotoMappings');

    // Process events from oldest to newest to ensure correct appending order.
    eventData.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    eventData.forEach(function(eventItem) {
        const eventStartDate = new Date(eventItem.start);

        const formattedDate = DateFormatter.formatDate(eventStartDate, 'longDate');
        const formattedTime = DateFormatter.formatTime(eventStartDate, 'shortTime');
        const fullFormattedDateTime = `${formattedDate} ${formattedTime}`;

        let eventMarkup = `
            <div class="event-item media-object-container">
                ${eventItem.iconUrl ? `<a class="pull-left" href="https://developers.google.com${eventItem.link}" target="_blank">
                                        <img class="media-object" src="https://developers.google.com${eventItem.iconUrl}" alt="Event Icon">
                                      </a>` : ''}
                <div class="media-body-content">
                    <h4 class="media-heading"><a href="https://developers.google.com${eventItem.link}" target="_blank">${eventItem.title}</a></h4>
                    <h5>${eventItem.location}<br/>${fullFormattedDateTime}</h5>
                    <p>${eventItem.description}</p>
                </div>`;

        // Check for custom photo albums linked to this event.
        if (eventPhotoMappings && eventPhotoMappings.events && eventPhotoMappings.events[eventItem.id]) {
            const albumId = eventPhotoMappings.events[eventItem.id];
            eventMarkup += `<div class="event-gallery"><ul class="thumbnails" id="${eventItem.id}"></ul></div>`;
            processEventGallery(eventItem.id, albumId); // Asynchronously load photos
        }

        eventMarkup += '</div>';

        if (eventStartDate < currentMoment) {
            $('#past_events_list').prepend(eventMarkup); // Prepend to show most recent past event first
        } else {
            $('#upcoming_events_list').append(eventMarkup); // Append to show oldest upcoming event first
        }
    });

    // Handle "View More" for past events.
    const pastEventItems = $('#past_events_list').children('.event-item');
    const initialDisplayCount = 5;

    if (pastEventItems.length > initialDisplayCount) {
        for (let i = initialDisplayCount; i < pastEventItems.length; i++) {
            $(pastEventItems[i]).hide(); // Hide events beyond the initial count
        }
        $('#past_events_list').append('<div id="show_more_past_events" class="text-center mt-3"><a href="#" class="btn btn-secondary">View More Past Events...</a></div>');
    }

    $('#show_more_past_events').on('click', function(e) {
        e.preventDefault();
        $(this).prevAll('.event-item').slideDown(); // Show all hidden past events
        $(this).fadeOut(300); // Fade out the "View More" button
    });

    // If no upcoming events, display a message.
    if ($('#upcoming_events_list').children('.event-item').length === 0) {
        $('#upcoming_events_list').html('<p class="no-events-message">No upcoming events are currently scheduled. Please check back soon!</p>');
    }
    // If no past events, display a message.
    if ($('#past_events_list').children('.event-item').length === 0) {
        $('#past_events_list').html('<p class="no-events-message">No past events found.</p>');
    }
}).fail(function(jqxhr, textStatus, error) {
    console.error(`Error fetching GDG event feed: ${textStatus}, ${error}`);
    $('#upcoming_events_list').html('<p class="error-message">Failed to load events. Please try again later.</p>');
    $('#past_events_list').html(''); // Clear any existing content
});


// Load and display general Google+ Picasa photos.
const picasaWebAlbumsUrl = `https://picasaweb.google.com/data/feed/api/user/${AppSettings.fetch('chapterIdentifier')}/albumid/${AppSettings.fetch('photoAlbumId')}?access=public&alt=json-in-script&kind=photo&max-results=18&fields=entry(title,link/@href,summary,content/@src)&v=2.0&callback=?`;
$.getJSON(picasaWebAlbumsUrl, function(albumResponse) {
    if (!albumResponse || !albumResponse.feed || !albumResponse.feed.entry || albumResponse.feed.entry.length === 0) {
        console.log("No general photos found in Picasa album.");
        $('#community_photo_gallery').html('<p class="no-photos-message">No photos available in the community gallery.</p>'); // Renamed from '#photo_container'
        return;
    }

    const photoElements = albumResponse.feed.entry;
    const galleryContainer = $('#community_photo_gallery');
    let photoCounter = 0;

    photoElements.forEach(function(photoEntry) {
        photoCounter++;
        if (!photoEntry.link || !photoEntry.link[1] || !photoEntry.content) {
            return; // Skip malformed entries
        }

        const photoLink = photoEntry.link[1].href;
        const photoSrc = photoEntry.content.src;
        const photoTitle = photoEntry.title.$t || '';
        const photoSummary = photoEntry.summary.$t || '';

        let listItemClass = 'span2'; // Default small thumbnail
        let imageSize = '260';

        // Custom styling for specific photos (1st and 14th)
        if (photoCounter === 1 || photoCounter === 14) {
            listItemClass = 'span4'; // Larger thumbnail
            imageSize = '460';
        }
        // If the 14th item needs to be floated right, add that class.
        if (photoCounter === 14) {
            listItemClass += ' pull-right';
        }

        const photoHtml = `
            <li class="${listItemClass}">
                <a href="${photoLink}" class="thumbnail-link" target="_blank" title="${photoSummary}">
                    <img src="${photoSrc}?sz=${imageSize}" alt="${photoTitle}">
                </a>
            </li>`;
        galleryContainer.append(photoHtml);
    });
}).fail(function(jqxhr, textStatus, error) {
    console.error(`Error fetching Google+ Picasa photos: ${textStatus}, ${error}`);
    $('#community_photo_gallery').html('<p class="error-message">Failed to load community photos. Please check your API key and album ID.</p>');
});


// Helper for creating and formatting stream entry HTML.
function createStreamEntryHtml(item) {
    let entryHtml = `<b><a href="${item.url}" target="_blank">${item.title}</a></b>`;

    const attachments = item.object.attachments || [];
    attachments.forEach(attachment => {
        switch (attachment.objectType) {
            case 'photo':
                // Handled in thumbnails, but if single large photo, might add here.
                break;
            case 'video':
                // Handled in thumbnails.
                break;
            case 'article':
                if (attachment.url && attachment.displayName) {
                    entryHtml += `<div class="link-attachment">
                                    <a href="${attachment.url}" target="_blank">${attachment.displayName}</a>`;
                    if (attachment.content) {
                        entryHtml += `<br>${attachment.content}`;
                    }
                    entryHtml += `</div>`;
                }
                break;
            // Removed 'album' case as it was commented out and marked 'needs more work' in original.
            // Simplified attachment handling.
        }
    });
    return entryHtml.replace(/\n/g, '<br />'); // Replace newlines with <br> for HTML display
}

// Fetch and display Google+ stream activities for news.
$.getJSON(`https://www.googleapis.com/plus/v1/people/${AppSettings.fetch('chapterIdentifier')}/activities/public?maxResults=10&key=${AppSettings.fetch('gPlusApiKey')}`, function(response) {
    if (response.error) {
        console.error('Error loading Google+ stream:', response.error);
        renderActivityStream([]); // Render an empty stream on error
        $('#news_feed_container').html('<p class="error-message">Failed to load news stream. Please check API key.</p>'); // Renamed from '#news-feed'
        return;
    }

    const streamEntries = [];
    response.items.forEach(function(item) {
        const actor = item.actor || {};
        const object = item.object || {};
        const thumbnails = [];

        // Process attachments for thumbnails
        const attachments = object.attachments || [];
        attachments.forEach(attachment => {
            if (attachment.objectType === 'photo' && attachment.image && attachment.fullImage) {
                thumbnails.push({
                    url: attachment.image.url,
                    link: attachment.fullImage.url
                });
            } else if (attachment.objectType === 'video' && attachment.image && attachment.url) {
                thumbnails.push({
                    url: attachment.image.url,
                    link: attachment.url
                });
            }
        });

        // Normalize actor image size.
        let actorImageUrl = actor.image && actor.image.url ? actor.image.url : '';
        if (actorImageUrl) {
            actorImageUrl = actorImageUrl.replace(/(\?sz=)(\d+)$/, '?sz=16'); // Ensure small icon size
            if (!actorImageUrl.includes('?sz=')) { // Add size if not present
                actorImageUrl += '?sz=16';
            }
        } else {
            actorImageUrl = 'https://developers.google.com/site-assets/images/developers-logo-lg.png'; // Default icon
        }


        streamEntries.push({
            source: {
                name: 'Google+',
                url: item.url
            },
            contentBody: createStreamEntryHtml(item),
            publishDate: new Date(item.updated),
            reshareCount: (object.resharers || {}).totalItems || 0,
            plusOneCount: (object.plusoners || {}).totalItems || 0,
            commentCount: (object.replies || {}).totalItems || 0,
            mediaThumbnails: thumbnails,
            actorIcon: actorImageUrl
        });
    });

    renderActivityStream(streamEntries);
}).fail(function(jqxhr, textStatus, error) {
    console.error(`Error fetching Google+ stream: ${textStatus}, ${error}`);
    $('#news_feed_container').html('<p class="error-message">Failed to load news stream. Network error or invalid API key.</p>');
});

// Function to dynamically render the activity stream UI.
function renderActivityStream(streamItems) {
    const newsFeedContainer = $('#news_feed_container'); // Renamed from '#news-feed'
    newsFeedContainer.empty(); // Clear previous content

    if (!streamItems || streamItems.length === 0) {
        newsFeedContainer.html('<p class="no-stream-message">No recent activity to display.</p>');
        return;
    }

    // Sort entries by date, newest first.
    streamItems.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

    streamItems.forEach(function(item) {
        const $streamElement = $('<li>').addClass('stream-item ' + item.source.name.toLowerCase().replace('+', 'plus'));

        // Entry icon
        $('<img class="stream-icon">').attr('src', item.actorIcon).appendTo($streamElement);

        // Main content body
        $('<div class="stream-body">').html(item.contentBody).appendTo($streamElement);

        // Media Thumbnails
        if (item.mediaThumbnails && item.mediaThumbnails.length) {
            const $imageGallery = $('<ul class="stream-thumbnails list-unstyled">').appendTo($streamElement); // Added list-unstyled
            item.mediaThumbnails.forEach(function(thumb) {
                const $galleryItem = $('<li>').appendTo($imageGallery);
                const $galleryLink = $('<a>').attr({
                    href: thumb.link,
                    target: '_blank'
                }).appendTo($galleryItem);
                $('<img>').attr('src', thumb.url).appendTo($galleryLink);
            });
        }

        // Metadata block (date, comments, reshares, +1 button)
        const $metadataBlock = $('<div class="stream-meta">').appendTo($streamElement);

        // Date posted
        $('<span class="posted-on">')
            .html(`Posted on ${DateFormatter.formatDate(item.publishDate, 'fullDate')}`)
            .appendTo($metadataBlock);

        // Comments count
        if (item.commentCount > 0) {
            $('<span class="meta-label comment-count">')
                .text(`${item.commentCount} comment${item.commentCount === 1 ? '' : 's'}`)
                .appendTo($metadataBlock);
        }
        // Reshares count
        if (item.reshareCount > 0) {
            $('<span class="meta-label reshare-count">')
                .text(`${item.reshareCount} reshare${item.reshareCount === 1 ? '' : 's'}`)
                .appendTo($metadataBlock);
        }

        // Google+ +1 button
        $('<div class="g-plusone" data-size="medium" data-annotation="bubble" data-href="' + item.source.url + '"></div>')
            .appendTo($metadataBlock);

        $streamElement.appendTo(newsFeedContainer);
    });

    // Render all +1 buttons after they are added to the DOM.
    if (typeof gapi !== 'undefined' && gapi.plusone) {
        gapi.plusone.go();
    } else {
        console.warn("Google API client (gapi.plusone) not loaded. +1 buttons will not render.");
    }
}