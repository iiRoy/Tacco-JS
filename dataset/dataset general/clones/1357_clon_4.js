const chapterData = {
    identity: {
        designation: 'My Awesome Dev Group',
        identifier: '101560824976722180812'
    },
    apiKeys: {
        google: 'YOUR_GOOGLE_API_KEY'
    },
    mediaSettings: {
        picasaMainAlbum: '5738801490307387457',
        useCoverImage: true,
        coverOverlayColor: '#ffffff'
    },
    visuals: {
        styleSheet: 'gdg.css'
    },
    eventSpecifics: {
        eventGalleries: {
            '1234567890': '5738801490307387457'
        }
    }
};

class ChapterPortal {
    constructor(settings) {
        this.appSettings = settings;
        this.initializeDomReferences();
        this.establishEventListeners();
        this.beginDataPopulation();
    }

    initializeDomReferences() {
        this.htmlHead = document.head;
        this.pageTitleElement = document.querySelector('title');
        this.brandLabelElement = document.querySelector('.brand_label');
        this.contentAreaPanels = document.querySelectorAll('.content_area_panel');
        this.siteNavigationItems = document.querySelectorAll('.site_nav_menu_item');
        this.aboutSectionDisplay = document.getElementById('about_display_area');
        this.aboutNavLink = document.getElementById('about_nav_link');
        this.enrollmentActionButton = document.getElementById('enrollment_action_button');
        this.socialPlusIconLink = document.getElementById('social_plus_icon');
        this.chapterDescriptionContent = document.getElementById('chapter_description_content');
        this.homePageBanner = document.getElementById('home_page_banner');
        this.pastActivitiesDisplay = document.getElementById('past_activity_display');
        this.upcomingActivitiesDisplay = document.getElementById('upcoming_activity_display');
        this.imageCollectionArea = document.getElementById('image_collection_area');
        this.newsUpdateStream = document.getElementById('news_update_stream');
    }

    establishEventListeners() {
        window.addEventListener('hashchange', this.synchronizeContentDisplay.bind(this));
        this.enrollmentActionButton.addEventListener('click', this.openChapterJoinPage.bind(this));
        this.socialPlusIconLink.addEventListener('click', this.openSocialPlusProfile.bind(this));
        this.pastActivitiesDisplay.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'show_more_activities_button') {
                this.expandPastActivities(e);
            }
        });
    }

    beginDataPopulation() {
        this.injectStylingSheet();
        this.updateHeaderInformation();
        this.synchronizeContentDisplay();
        this.fetchPlusProfileDetails();
        this.retrieveChapterEventData();
        this.fetchPicasaShowcaseImages();
        this.gatherPublicSocialUpdates();
    }

    injectStylingSheet() {
        const styleLink = document.createElement('link');
        styleLink.href = `css/${this.appSettings.visuals.styleSheet}`;
        styleLink.rel = 'stylesheet';
        this.htmlHead.appendChild(styleLink);
    }

    updateHeaderInformation() {
        this.pageTitleElement.textContent = `${this.appSettings.identity.designation} | ${this.pageTitleElement.textContent}`;
        this.brandLabelElement.innerHTML = `<strong>${this.appSettings.identity.designation}</strong>`;
    }

    synchronizeContentDisplay() {
        const currentFragment = window.location.hash.substring(1);
        const targetPanelId = currentFragment ? `${currentFragment}_display_area` : 'about_display_area';
        const targetNavLinkId = currentFragment ? `${currentFragment}_nav_link` : 'about_nav_link';

        this.contentAreaPanels.forEach(panel => panel.style.display = 'none');
        this.siteNavigationItems.forEach(navItem => navItem.classList.remove('activated'));

        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
        }
        const targetNavLink = document.getElementById(targetNavLinkId);
        if (targetNavLink) {
            targetNavLink.classList.add('activated');
        } else {
            this.aboutSectionDisplay.style.display = 'block';
            this.aboutNavLink.classList.add('activated');
        }
    }

    openChapterJoinPage() {
        const joinLink = `https://developers.google.com/groups/chapter/join/${this.appSettings.identity.identifier}`;
        const destinationLink = `https://developers.google.com/groups/chapter/${this.appSettings.identity.identifier}/`;
        const newTab = window.open(joinLink, '_blank');
        setTimeout(() => {
            if (newTab) newTab.location.href = destinationLink;
        }, 500);
    }

    openSocialPlusProfile() {
        window.open(`https://plus.google.com/${this.appSettings.identity.identifier}`, '_blank');
    }

    async fetchPlusProfileDetails() {
        const profileApiUrl = `https://www.googleapis.com/plus/v1/people/${this.appSettings.identity.identifier}?fields=aboutMe%2Ccover%2CdisplayName%2Cimage%2CplusOneCount&key=${this.appSettings.apiKeys.google}`;
        try {
            const serverResponse = await fetch(profileApiUrl);
            if (!serverResponse.ok) throw new Error(`HTTP fetch failed with status: ${serverResponse.status}`);
            const profilePayload = await serverResponse.json();

            if (this.chapterDescriptionContent) {
                this.chapterDescriptionContent.innerHTML = profilePayload.aboutMe;
            }

            if (profilePayload.cover && profilePayload.cover.coverPhoto && profilePayload.cover.coverPhoto.url && this.appSettings.mediaSettings.useCoverImage) {
                this.homePageBanner.style.cssText = `
                    background: url(${profilePayload.cover.coverPhoto.url}) ${profilePayload.cover.coverInfo.leftImageOffset}px ${profilePayload.cover.coverInfo.topImageOffset}px;
                    color: ${this.appSettings.mediaSettings.coverOverlayColor};
                `;
            }
        } catch (issue) {
            console.error('Error fetching Google+ profile information:', issue);
        }
    }

    async retrieveEventGallery(eventIdentifier, albumIdentifier) {
        const picasaJsonpEndpoint = `https://picasaweb.google.com/data/feed/api/user/${this.appSettings.identity.identifier}/albumid/${albumIdentifier}?alt=json-in-script&callback=?&max-results=12&kind=photo`;
        const dynamicCallbackName = `eventPhotosCb_${eventIdentifier}`;

        return new Promise((resolve, reject) => {
            window[dynamicCallbackName] = (albumContent) => {
                const galleryPhotos = albumContent.feed.entry || [];
                const targetDomElement = document.getElementById(eventIdentifier);
                if (targetDomElement) {
                    targetDomElement.innerHTML = galleryPhotos.map(item => `
                        <li class="col-xs-2 col-sm-2 col-md-2">
                            <a href="${item.link[1].href}" class="thumbnail_image_wrapper" target="_blank">
                                <img src="${item.content.src}?sz=260" alt="${item.title.$t}" title="${item.summary.$t}">
                            </a>
                        </li>
                    `).join('');
                }
                delete window[dynamicCallbackName];
                scriptTag.remove();
                resolve(albumContent);
            };

            const scriptTag = document.createElement('script');
            scriptTag.src = picasaJsonpEndpoint.replace('callback=?', `callback=${dynamicCallbackName}`);
            scriptTag.onerror = reject;
            this.htmlHead.appendChild(scriptTag);
        });
    }

    async retrieveChapterEventData() {
        const eventsSourceUrl = `http://gdgfresno.com/gdgfeed.php?id=${this.appSettings.identity.identifier}`;
        try {
            const serverResponse = await fetch(eventsSourceUrl);
            if (!serverResponse.ok) throw new Error(`HTTP error! status: ${serverResponse.status}`);
            const eventRecords = await serverResponse.json();

            const currentTime = new Date();
            const fullDateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });
            const shortTimeFormatter = new Intl.DateTimeFormat('en-US', { timeStyle: 'short' });

            for (let i = eventRecords.length - 1; i >= 0; i--) {
                const eventDetails = eventRecords[i];
                const eventStartDateTime = new Date(eventDetails.start);
                const formattedEventTime = `${fullDateFormatter.format(eventStartDateTime)} ${shortTimeFormatter.format(eventStartDateTime)}`;

                let eventEntryHtml = `
                    <div class="media_entry">
                        ${eventDetails.iconUrl ? `<a class="media_lead_image" href="https://developers.google.com${eventDetails.link}" target="_blank"><img class="media_object_icon" src="https://developers.google.com${eventDetails.iconUrl}"></a>` : ''}
                        <div class="media_content_body">
                            <h4 class="media_heading_title"><a href="https://developers.google.com${eventDetails.link}" target="_blank">${eventDetails.title}</a></h4>
                            <h5>${eventDetails.location}<br/>${formattedEventTime}</h5>
                            <p>${eventDetails.description}</p>
                        </div>
                `;

                const associatedAlbumId = this.appSettings.eventSpecifics.eventGalleries[eventDetails.id];
                if (associatedAlbumId) {
                    eventEntryHtml += `<div class="event_gallery_area"><ul class="thumbnail_list" id="${eventDetails.id}"></ul></div>`;
                    this.retrieveEventGallery(eventDetails.id, associatedAlbumId).catch(err => console.error(`Failed to load images for event ${eventDetails.id}:`, err));
                }
                eventEntryHtml += `</div>`;

                if (eventStartDateTime < currentTime) {
                    this.pastActivitiesDisplay.insertAdjacentHTML('afterbegin', eventEntryHtml);
                } else {
                    this.upcomingActivitiesDisplay.insertAdjacentHTML('afterbegin', eventEntryHtml);
                }
            }

            this.controlPastActivitiesVisibility();
        } catch (issue) {
            console.error('Problem fetching chapter events:', issue);
        }
    }

    controlPastActivitiesVisibility() {
        const pastActivityDomElements = Array.from(this.pastActivitiesDisplay.children);
        const initialVisibleCount = 5;

        if (pastActivityDomElements.length > initialVisibleCount) {
            for (let i = pastActivityDomElements.length - 1; i >= initialVisibleCount; i--) {
                pastActivityDomElements[i].style.display = 'none';
            }
            const viewMoreButtonMarkup = '<div id="show_more_activities_wrapper"><a href="#" id="show_more_activities_button">Show More Past Events...</a></div>';
            this.pastActivitiesDisplay.insertAdjacentHTML('beforeend', viewMoreButtonMarkup);
        }
    }

    expandPastActivities(eventTrigger) {
        eventTrigger.preventDefault();
        Array.from(this.pastActivitiesDisplay.children).forEach(childElement => {
            childElement.style.display = 'block';
        });
        const buttonContainer = document.getElementById('show_more_activities_wrapper');
        if (buttonContainer) {
            buttonContainer.style.display = 'none';
        }
    }

    async fetchPicasaShowcaseImages() {
        const picasaShowcaseUrl = `https://picasaweb.google.com/data/feed/api/user/${this.appSettings.identity.identifier}/albumid/${this.appSettings.mediaSettings.picasaMainAlbum}?access=public&alt=json-in-script&kind=photo&max-results=18&fields=entry(title,link/@href,summary,content/@src)&v=2.0&callback=?`;
        const callbackFnName = 'mainPicasaShowcaseCb';

        return new Promise((resolve, reject) => {
            window[callbackFnName] = (imageData) => {
                const photos = imageData.feed.entry || [];
                let htmlSegments = [];
                let photoIndex = 0;

                for (const photoItem of photos) {
                    photoIndex++;
                    let itemCssClass = 'col-xs-2 col-sm-2 col-md-2';
                    let imageDimension = '260';

                    if (photoIndex === 1 || photoIndex === 14) {
                        itemCssClass = 'col-xs-4 col-sm-4 col-md-4';
                        imageDimension = '460';
                        if (photoIndex === 14) {
                            itemCssClass += ' pull-right-override';
                        }
                    }

                    htmlSegments.push(`
                        <li class="${itemCssClass}">
                            <a href="${photoItem.link[1].href}" class="photo_thumb_link" target="_blank">
                                <img src="${photoItem.content.src}?sz=${imageDimension}" alt="${photoItem.title.$t}" title="${photoItem.summary.$t}">
                            </a>
                        </li>
                    `);
                }
                this.imageCollectionArea.innerHTML = htmlSegments.join('');
                delete window[callbackFnName];
                scriptEl.remove();
                resolve(imageData);
            };

            const scriptEl = document.createElement('script');
            scriptEl.src = picasaShowcaseUrl.replace('callback=?', `callback=${callbackFnName}`);
            scriptEl.onerror = reject;
            this.htmlHead.appendChild(scriptEl);
        });
    }

    async gatherPublicSocialUpdates() {
        const socialStreamApi = `https://www.googleapis.com/plus/v1/people/${this.appSettings.identity.identifier}/activities/public?maxResults=10&key=${this.appSettings.apiKeys.google}`;
        try {
            const apiResponse = await fetch(socialStreamApi);
            if (!apiResponse.ok) throw new Error(`Network issue: ${apiResponse.status}`);
            const apiPayload = await apiResponse.json();

            if (apiPayload.error) {
                console.error('Google+ API error:', apiPayload.error);
                this.renderSocialFeed([]);
                return;
            }

            const processedEntries = apiPayload.items.map(activityItem => {
                const actorInfo = activityItem.actor || {};
                const objectInfo = activityItem.object || {};
                let bodyHtmlChunks = [];
                bodyHtmlChunks.push(`<b><a href="${activityItem.url}">${activityItem.title.replace(/\n/g, '<br />')}</a></b>`);

                const attachedMediaThumbs = [];
                const itemAttachments = objectInfo.attachments || [];
                for (const attachment of itemAttachments) {
                    switch (attachment.objectType) {
                        case 'album':
                            if (attachment.thumbnails && attachment.thumbnails.length > 0) {
                                const thumbLimit = Math.min(attachment.thumbnails.length, 7);
                                const albumThumbMarkup = Array.from({length: thumbLimit}, (_, k) => k + 1)
                                    .map(idx => `<li class="col-xs-2 col-sm-2 col-md-2"><img src="${attachment.thumbnails[idx-1].image.url}" alt="Album thumbnail" /></li>`)
                                    .join('');
                                bodyHtmlChunks.push(`<ul class="album_thumbnails">${albumThumbMarkup}</ul>`);
                            }
                            break;
                        case 'photo':
                            attachedMediaThumbs.push({
                                imageUrl: attachment.image.url,
                                linkUrl: attachment.fullImage.url
                            });
                            break;
                        case 'video':
                            attachedMediaThumbs.push({
                                imageUrl: attachment.image.url,
                                linkUrl: attachment.url
                            });
                            break;
                        case 'article':
                            bodyHtmlChunks.push(`
                                <div class="external_link_card">
                                    <a href="${attachment.url}">${attachment.displayName}</a>
                                    ${attachment.content ? `<p>${attachment.content}</p>` : ''}
                                </div>
                            `);
                            break;
                    }
                }

                const actorAvatarUrl = actorInfo.image.url ? actorInfo.image.url.replace(/sz=\d+$/, 'sz=16') : '';
                return {
                    sourceType: 'Google+',
                    originalLink: activityItem.url,
                    entryBody: bodyHtmlChunks.join(''),
                    postTimestamp: activityItem.updated,
                    reshareCount: (objectInfo.resharers || {}).totalItems,
                    plusOneCount: (objectInfo.plusoners || {}).totalItems,
                    commentCount: (objectInfo.replies || {}).totalItems,
                    mediaThumbnails: attachedMediaThumbs,
                    actorImage: actorAvatarUrl
                };
            });

            this.renderSocialFeed(processedEntries);

        } catch (issue) {
            console.error('Error fetching social stream:', issue);
            this.renderSocialFeed([]);
        }
    }

    renderSocialFeed(updatesToDisplay) {
        updatesToDisplay.sort((a, b) => new Date(b.postTimestamp) - new Date(a.postTimestamp));
        this.newsUpdateStream.innerHTML = '';

        const postDateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

        for (const updateEntry of updatesToDisplay) {
            const feedListItem = document.createElement('li');
            feedListItem.className = `social_feed_item ${updateEntry.sourceType.replace(/\s+/g, '_').toLowerCase()}`;
            feedListItem.innerHTML = updateEntry.entryBody;

            const avatarElement = document.createElement('img');
            avatarElement.className = 'actor_avatar_icon';
            avatarElement.src = updateEntry.actorImage;
            feedListItem.prepend(avatarElement);

            if (updateEntry.mediaThumbnails && updateEntry.mediaThumbnails.length) {
                const thumbList = document.createElement('ul');
                thumbList.className = 'attached_media_thumbnails';
                for (const thumbItem of updateEntry.mediaThumbnails) {
                    const thumbLi = document.createElement('li');
                    const thumbAnchor = document.createElement('a');
                    thumbAnchor.href = thumbItem.linkUrl;
                    thumbAnchor.target = '_blank';
                    const thumbImg = document.createElement('img');
                    thumbImg.src = thumbItem.imageUrl;
                    thumbAnchor.appendChild(thumbImg);
                    thumbLi.appendChild(thumbAnchor);
                    thumbList.appendChild(thumbLi);
                }
                feedListItem.appendChild(thumbList);
            }

            const footerMetadata = document.createElement('div');
            footerMetadata.className = 'entry_footer_metadata';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'post_date_info';
            dateSpan.textContent = `Posted on ${postDateFormatter.format(new Date(updateEntry.postTimestamp))}`;
            footerMetadata.appendChild(dateSpan);

            if (updateEntry.commentCount) {
                const commentLabel = document.createElement('span');
                commentLabel.className = 'interaction_label';
                commentLabel.textContent = `${updateEntry.commentCount} comment${updateEntry.commentCount === 1 ? '' : 's'}`;
                footerMetadata.appendChild(commentLabel);
            }
            if (updateEntry.reshareCount) {
                const reshareLabel = document.createElement('span');
                reshareLabel.className = 'interaction_label';
                reshareLabel.textContent = `${updateEntry.reshareCount} reshare${updateEntry.reshareCount === 1 ? '' : 's'}`;
                footerMetadata.appendChild(reshareLabel);
            }

            const plusOneButtonDiv = document.createElement('div');
            plusOneButtonDiv.className = 'g-plusone social_action_button';
            plusOneButtonDiv.dataset.size = 'medium';
            plusOneButtonDiv.dataset.annotation = 'bubble';
            plusOneButtonDiv.dataset.href = updateEntry.originalLink;
            footerMetadata.appendChild(plusOneButtonDiv);

            feedListItem.appendChild(footerMetadata);
            this.newsUpdateStream.appendChild(feedListItem);
        }

        if (window.gapi && window.gapi.plusone && typeof window.gapi.plusone.go === 'function') {
            window.gapi.plusone.go();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChapterPortal(chapterData);
});