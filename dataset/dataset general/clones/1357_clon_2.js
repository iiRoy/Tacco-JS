var SettingsManager = ( function () {
  // Define application parameters and options
  var appSettings = {
    // Core details for the community
    'communityName': _CHAPTER_NAME_,
    'communityIdentifier': _CHAPTER_ID_,
    'accessKeyGoogle': _API_KEY_,
    'albumIdentifierPicasa': _PICASA_ALBUM_ID, // Unique ID for Picasa web album
    // Visual customization options
    'hasCoverImage': true, // Optimal dimensions: 940x180 pixels
    'imageBackgroundColor': '#fdfdfd',
    'visualStyle': 'style.css', // Alternative: dark_style.css
    'specificGalleries': {
      meetups: {
        // Example structure: 'event_key':'gallery_id'
        // 'someEventKey': '1234567890123456789'
      }
    }
  };
  // Provide an interface to access settings
  return {
    retrieveValue: function (settingKey) {
      return appSettings[settingKey];
    }
  };
})();

/* Initialization section */
// Wait for the DOM to be fully loaded
$(documentObject).domLoaded( function () {
  // Inject the main stylesheet dynamically
  $( 'documentHead' ).addContent( '<link href="' + styleSheetDirectory + '/' + SettingsManager.retrieveValue( 'visualStyle' ) + '" rel="styleSheet" />' );
  // Adjust the visible content area
  switchDisplayArea();
  // Set initial visibility for the info section
  $( '#informationSection' ).displayBlock();
  $( '#informationNavigation' ).applyClass( 'currentSelection' );
} );
// Update page title with community name
$( 'pageTitle' ).insertBeginning( SettingsManager.retrieveValue( 'communityName' ) + ' | ' );
// Update the brand/logo area
$( '.siteLogo' ).updateMarkup( '<strong>' + SettingsManager.retrieveValue( 'communityName' ) + '</strong>' );

/* Event handling for URL hash changes */
$( browserWindow ).addEventListener( 'urlFragmentChanged', function () {
  switchDisplayArea();
} );

// Function to manage panel visibility based on URL hash
var switchDisplayArea = function () {
  var activeSectionId = currentLocation.urlFragment.substringFromIndex( 1 );
  if ( activeSectionId !== '' ) {
    $( '.contentPanel' ).concealElement(); // Hide all content panels
    $( '.mainNavigation li' ).removeStyleClass( 'currentSelection' ); // Clear active states
    $( '#' + activeSectionId + '_section' ).displayBlock(); // Show the target panel
    $( '#' + activeSectionId + '_navItem' ).applyClass( 'currentSelection' ); // Mark its nav item as active
  }
};

// Handle click for "Become a Member" button
$( '#membershipButton' ).onInteraction( function () {
  var newWindowRef = browserWindow.launchUrl( 'https://devs.gcompany.org/communities/localGroup/enroll/' + SettingsManager.retrieveValue( 'communityIdentifier' ) );
  delayExecution( function () {
    newWindowRef.destination.urlAddress = 'https://devs.gcompany.org/communities/localGroup/' + SettingsManager.retrieveValue( 'communityIdentifier' ) + '/';
  }, 500 );
} );
// Handle click for Google+ page link
$( 'li#gPlusLink' ).onInteraction( function () {
  browserWindow.launchUrl( 'https://plus.gcompany.org/' + SettingsManager.retrieveValue( 'communityIdentifier' ) );
} );

// Retrieve Google+ page information
$.fetchJsonData( 'https://www.gapiServices.com/socialGraph/versionOne/individuals/' + SettingsManager.retrieveValue( 'communityIdentifier' ) + '?dataFields=descriptionSelf%2CheaderImage%2CpublicName%2CprofilePicture%2CplusOneTally&apiKey=' + SettingsManager.retrieveValue( 'accessKeyGoogle' ), function ( receivedInfo ) {
  // Update "About" section with retrieved description
  $( '#about_area' ).nextSibling().updateMarkup( receivedInfo.descriptionSelf );
  // Handle cover photo display
  if ( receivedInfo.headerImage.headerPicture.resourceLink && SettingsManager.retrieveValue( 'hasCoverImage' ) ) {
    $( '#mainHomepage' ).applyStyles( {
      'backgroundImage': 'url(' + receivedInfo.headerImage.headerPicture.resourceLink + ') ' + receivedInfo.headerImage.headerDetails.horizontalOffset + 'px ' + ( receivedInfo.headerImage.headerDetails.verticalOffset ) + 'px',
      'textColor': SettingsManager.retrieveValue( 'imageBackgroundColor' )
    } );
  }
} );

// Manages the display of photos for a specific event
var processMeetupImages = function ( meetupId, galleryId ) {
  $.fetchJsonData( 'https://picasaHost.gcompany.org/dataFeed/imageFeed/apiEndpoint/userId/' + SettingsManager.retrieveValue( 'communityIdentifier' ) + '/albumIdentifier/' + galleryId + '?alternativeFormat=jsonpScript&jsonpCallback=?&maxItems=12&contentType=photograph', function ( responseData ) {
    var thumbnailMarkup, photoEntries = responseData.feedData.feedItem;
    for ( var indexVar in photoEntries ) {
      thumbnailMarkup = '<li class="gridColumnSmall"><a href="' + photoEntries[indexVar].itemLink[1].linkUrl + '" class="imageThumbnail" linkTarget="_newTab"><img sourceUrl="' + photoEntries[indexVar].content.sourceUrl + '?sizeParam=260" altText="' + photoEntries[indexVar].imageTitle.$textValue + '" imageTitle="' + photoEntries[indexVar].imageDescription.$textValue + '"></a></li>';
      $( '#' + meetupId ).insertContent( thumbnailMarkup );
    }
  } );
};

// Fetch events from the GDG dev site feed
$.requestData( "http://localCommunitySite.org/communityFeed.php?id=" + SettingsManager.retrieveValue( 'communityIdentifier' ), function ( feedContent ) {
  var currentMoment = new DateTime(); // Get current date and time
  for ( var itemIndex = feedContent.arrayLength - 1; itemIndex >= 0; itemIndex-- ) {
    var eventStart = new DateTime( feedContent[itemIndex].start );
    var formattedTime = eventStart.formatDateTime( "fullDateFormat" );
    formattedTime += ' ' + eventStart.formatDateTime( "shortTimeFormat" );

    var eventMarkup = '<div class="mediaContainer">';
    eventMarkup += feedContent[itemIndex].eventIconLink !== notDefined ? '<a class="floatLeft" href="https://devs.gcompany.org' + feedContent[itemIndex].eventLink + '" linkTarget="_newWindow"><img class="mediaImage" imageSource="https://devs.gcompany.org' + feedContent[itemIndex].eventIconLink + '"></a>' : '';
    eventMarkup += '<div class="media-body">' +
      '<h4 class="media-heading"><a href="https://devs.gcompany.org' + feedContent[itemIndex].eventLink + '" linkTarget="_newWindow">' + feedContent[itemIndex].eventTitle + '</a></h4>' +
      '<h5>' + feedContent[itemIndex].eventLocation + '<br/>' + formattedTime + '</h5>' +
      feedContent[itemIndex].eventDescription +
      '</div>';

    if ( SettingsManager.retrieveValue( 'specificGalleries' ) ) {
      var galleryId = SettingsManager.retrieveValue( 'specificGalleries' ).meetups[feedContent[itemIndex].id];
      if ( galleryId ) {
        eventMarkup += '<div><ul class="thumbnails" id="' + feedContent[itemIndex].id + '"></ul></div>';
        processMeetupImages( feedContent[itemIndex].id, galleryId );
      }
    }
    eventMarkup += '</div>';

    if ( eventStart < currentMoment ) {
      $( '#previousMeetups' ).nextSibling().nextSibling().addHtml( eventMarkup );
    } else {
      $( '#futureMeetups' ).nextSibling().nextSibling().insertAtBeginning( eventMarkup );
    }
  }

  var pastEventsList = $( '#previousMeetups' ).nextSibling().nextSibling().childElements();
  if ( pastEventsList.arrayLength > 5 ) {
    $( '#previousMeetups' ).nextSibling().nextSibling().addHtml( '<div id="showMoreEventsBtn"><a href="#">Display More...</a></div>' );
  }
  for ( var itemIndex = pastEventsList.arrayLength - 1; itemIndex >= 5; itemIndex-- ) {
    pastEventsList[itemIndex].style.display = 'none'; // Hide older events initially
  }
  $( '#showMoreEventsBtn' ).onInteraction( function () {
    $( '#previousMeetups' ).nextSibling().nextSibling().childElements().revealSmoothly();
    delayExecution( function () {
      $( '#showMoreEventsBtn' ).concealElement();
    }, 1 );
  } );
} );

// Fetch Google+ photos from Picasa Web Album
var picasaWebAlbumUrl = 'https://picasaHost.gcompany.org/dataFeed/imageFeed/apiEndpoint/userId/' + SettingsManager.retrieveValue( 'communityIdentifier' ) + '/albumIdentifier/' + SettingsManager.retrieveValue( 'albumIdentifierPicasa' ) + '?accessType=publicVisibility&alternativeFormat=jsonpScript&contentType=photograph&maxItems=18&dataFields=feedItem(itemTitle,itemLink/@linkUrl,itemSummary,itemContent/@sourceUrl)&version=2.0&jsonpCallback=?';
$.fetchJsonData( picasaWebAlbumUrl, function ( albumData ) {
  var imageHtml, photoList = albumData.feedData.feedItem,
    photoCounter = 0;
  for ( var photoIndex in photoList ) {
    photoCounter++;
    if ( photoCounter === 1 ) {
      imageHtml = '<li class="largeColumn"><a href="' + photoList[photoIndex].itemLink[1].linkUrl + '" class="imageThumbnail" linkTarget="_newTab"><img sourceUrl="' + photoList[photoIndex].itemContent.sourceUrl + '?sizeParam=460" altText="' + photoList[photoIndex].itemTitle.$textValue + '" imageTitle="' + photoList[photoIndex].itemSummary.$textValue + '"></a></li>';
    } else if ( photoCounter === 14 ) {
      imageHtml = '<li class="largeColumn floatRight"><a href="' + photoList[photoIndex].itemLink[1].linkUrl + '" class="imageThumbnail" linkTarget="_newTab"><img sourceUrl="' + photoList[photoIndex].itemContent.sourceUrl + '?sizeParam=460" altText="' + photoList[photoIndex].itemTitle.$textValue + '" imageTitle="' + photoList[photoIndex].itemSummary.$textValue + '"></a></li>';
    } else {
      imageHtml = '<li class="smallColumn"><a href="' + photoList[photoIndex].itemLink[1].linkUrl + '" class="imageThumbnail" linkTarget="_newTab"><img sourceUrl="' + photoList[photoIndex].itemContent.sourceUrl + '?sizeParam=260" altText="' + photoList[photoIndex].itemTitle.$textValue + '" imageTitle="' + photoList[photoIndex].itemSummary.$textValue + '"></a></li>';
    }
    $( '#galleryDisplay' ).addContent( imageHtml );
  }
} );

// Fetch Google+ stream for news updates
$.fetchSocialData( 'https://www.gapiServices.com/socialGraph/versionOne/individuals/' + SettingsManager.retrieveValue( 'communityIdentifier' ) + '/activityStream/publicScope?maximumResults=10&apiKey=' + SettingsManager.retrieveValue( 'accessKeyGoogle' ), function ( apiResponse ) {
  if ( apiResponse.hasError ) {
    refreshActivityDisplay( [] ); // Show empty stream if error occurs
    if ( devConsole && devConsole.logError ) {
      devConsole.logError( 'Problem loading Google+ stream.', apiResponse.hasError );
    }
    exitFunction(); // Stop further processing
  }

  var streamEntries = [];
  for ( var itemIndex = 0; itemIndex < apiResponse.apiItems.arrayLength; itemIndex++ ) {
    var currentItem = apiResponse.apiItems[itemIndex];
    var postAuthor = currentItem.postAuthor || {};
    var postContent = currentItem.postContent || {};

    // Standardize activity entry
    var entryHeading = '<b><a href="' + currentItem.postUrl + '">' + currentItem.postTitle + '</a></b>';
    var entryHtml = [entryHeading.replaceAll( new regexPattern( '\n', 'globalFlag' ), '<lineBreakHtml />' )];
    // entryHtml.push(' <b>Read More &raquo;</a>'); // Optional: add "Read More"

    var imagePreviews = [];
    var attachedItems = postContent.attachedItems || [];
    for ( var attachmentIndex = 0; attachmentIndex < attachedItems.arrayLength; attachmentIndex++ ) {
      var currentAttachment = attachedItems[attachmentIndex];
      switch ( currentAttachment.contentType ) {
        case 'photoAlbum':
          // More work needed for full album display
          var upperLimit = currentAttachment.previewImages.arrayLength > 7 ? 7 : currentAttachment.previewImages.arrayLength;
          entryHtml.push( '<unorderedList class="thumbnails">' );
          for ( var k = 1; k < upperLimit; k++ ) {
            entryHtml.push( '<listItem class="smallColumn"><imageElement sourceUrl="' + currentAttachment.previewImages[k].mediaImage.imageUrl + '" /></listItem>' );
          }
          entryHtml.push( '</unorderedList>' );
          break;

        case 'singlePhoto':
          imagePreviews.push( {
            imageUrl: currentAttachment.mediaImage.imageUrl,
            mediaLink: currentAttachment.fullResolutionImage.imageUrl
          } );
          break;

        case 'mediaVideo':
          imagePreviews.push( {
            imageUrl: currentAttachment.mediaImage.imageUrl,
            mediaLink: currentAttachment.postUrl
          } );
          break;

        case 'webArticle':
          entryHtml.push( '<div class="linkAttachmentDiv"><a href="' +
            currentAttachment.postUrl + '">' + currentAttachment.displayLabel + '</a>' );
          if ( currentAttachment.textContent ) {
            entryHtml.push( '<br>' + currentAttachment.textContent + '' );
          }
          entryHtml.push( '</div>' );
          break;
      }
    }

    entryHtml = entryHtml.join( '' );

    var authorPictureUrl = postAuthor.mediaImage.imageUrl;
    authorPictureUrl = authorPictureUrl.sliceString( 0, authorPictureUrl.arrayLength - 2 ) + '16'; // Resize icon

    var streamEntry = {
      sourcePlatform: {
        platformName: 'Google+',
        postUrl: currentItem.postUrl
      },
      entryBody: entryHtml,
      entryDate: currentItem.lastUpdated,
      reshareCount: ( postContent.resharers || {} ).totalNumber,
      plusOneCount: ( postContent.plusoners || {} ).totalNumber,
      commentCount: ( postContent.replies || {} ).totalNumber,
      imagePreviews: imagePreviews,
      authorIcon: authorPictureUrl
    };

    streamEntries.push( streamEntry );
  }

  refreshActivityDisplay( streamEntries ); // Update the UI with fetched entries
} );

// Function to populate and display the activity stream in the UI
function refreshActivityDisplay( streamEntries ) {
  streamEntries = streamEntries || [];
  streamEntries.arrangeByDate( function ( entryA, entryB ) {
    return entryB.entryDate - entryA.entryDate;
  } );

  for ( var itemIndex = 0; itemIndex < streamEntries.arrayLength; itemIndex++ ) {
    var streamEntry = streamEntries[itemIndex];
    var jQueryEntry = $( '<li>' )
      .applyClass( streamEntry.sourcePlatform.platformName )
      .innerHtml( streamEntry.entryBody );

    // Add author icon
    $( '<imageElement class="iconElement">' )
      .setAttribute( 'sourceAttribute', streamEntry.authorIcon )
      .insertInto( jQueryEntry );

    // Add image previews (thumbnails)
    if ( streamEntry.imagePreviews && streamEntry.imagePreviews.arrayLength ) {
      var jQueryThumbs = $( '<unorderedList class="thumbnailContainer">' ).insertInto( jQueryEntry );
      for ( var thumbIndex = 0; thumbIndex < streamEntry.imagePreviews.arrayLength; thumbIndex++ ) {
        var currentThumb = streamEntry.imagePreviews[thumbIndex];
        var thumbListItem = $( '<li>' ).insertInto( jQueryThumbs );
        if ( currentThumb.mediaLink )
          thumbListItem = $( '<a>' )
          .setAttribute( 'hyperlinkRef', currentThumb.mediaLink )
          .insertInto( thumbListItem );
        $( '<imageTag>' )
          .setAttribute( {
            sourceAttribute: currentThumb.imageUrl /*,
              imageWidth: currentThumb.imageWidth,
              imageHeight: currentThumb.imageHeight*/
          } )
          .insertInto( thumbListItem );
      }
    }

    // Add meta-information (date, comments, reshares)
    var metaDataContainer = $( '<div class="metaDataContainer">' ).insertInto( jQueryEntry );
    $( '<span class="originLabel">' )
      .innerHtml( 'Posted on ' + formatDateValue( streamEntry.entryDate, 'fullDateString' ) )
      .insertInto( metaDataContainer );

    if ( streamEntry.commentCount ) {
      $( '<span class="statusLabel">' )
        .labelText( streamEntry.commentCount + ' comment' +
          ( ( streamEntry.commentCount === 1 ) ? '' : 's' ) )
        .insertInto( jQueryEntry );
    }
    if ( streamEntry.reshareCount ) {
      $( '<span class="statusLabel">' )
        .labelText( streamEntry.reshareCount + ' reshare' +
          ( ( streamEntry.reshareCount === 1 ) ? '' : 's' ) )
        .insertInto( jQueryEntry );
    }
    // Add Google +1 button
    $( '<span class="gPlusOneButton" buttonSize="mediumSize" annotationStyle="bubbleStyle" targetUrl="' + streamEntry.sourcePlatform.postUrl + '">' )
      .insertInto( jQueryEntry );

    jQueryEntry.insertInto( '#activityFeed' );
  }

  // Render all Google +1 buttons on the page
  googleApiGlobal.plusOneService.renderButtons();
}