const _SERVICE_ENDPOINT_COLLECTION_ = {
    contentInformation: "http://gdata.youtube.com/feeds/api/videos/",
    relatedContent: "http://gdata.youtube.com/feeds/api/videos/"
};

const _API_PARAMETER_SET_ = "alt=json&format=5&v=2&key=AI39si4kMMM_MKoBruLHD17_U6_NqOf-qFOc5iqpzpH-G67oD3iCtuVv8F51GKJiD3I3bIuCy5Eo4-Pjf1rwMoNmfc6MUS4aOw";
const _MAX_RECOMMENDED_ITEMS_ = 9;

const mediaInteractionSystem = (function() {

    function calculateTimeDisplay(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) {
            return "00:00";
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formatTwoDigits = (num) => String(num).padStart(2, '0');

        if (hours > 0) {
            return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
        } else {
            return `${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
        }
    }

    function formatNumericString(valueInput) {
        if (typeof valueInput === 'undefined' || valueInput === null) {
            return "0";
        }
        return String(valueInput).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function updateProgressIndicator(containerElement, percentageValue, dataPresent) {
        let barFill = containerElement.querySelector('.visual-rating-fill');
        if (!barFill) {
            barFill = document.createElement('div');
            barFill.className = 'visual-rating-fill';
            containerElement.appendChild(barFill);
            containerElement.style.height = '10px';
            containerElement.style.border = '1px solid #ccc';
            containerElement.style.overflow = 'hidden';
            containerElement.style.backgroundColor = 'white';
        }

        if (dataPresent) {
            containerElement.style.backgroundColor = '#f0f0f0';
            barFill.style.width = `${percentageValue}%`;
            barFill.style.height = '100%';
            barFill.style.backgroundColor = 'red';
            barFill.style.transition = 'width 0.3s ease-in-out';
        } else {
            containerElement.style.backgroundColor = 'white';
            barFill.style.width = '0%';
            barFill.style.backgroundColor = 'transparent';
        }
    }

    async function retrieveSimilarMedia(contentId) {
        const requestURL = `${_SERVICE_ENDPOINT_COLLECTION_.relatedContent}${contentId}/related?max-results=${_MAX_RECOMMENDED_ITEMS_}&${_API_PARAMETER_SET_}`;

        try {
            const networkResponse = await fetch(requestURL);
            if (!networkResponse.ok) {
                throw new Error(`Network request failed with status: ${networkResponse.status}`);
            }
            const responseData = await networkResponse.json();
            return responseData.feed.entry;
        } catch (error) {
            console.error("Error fetching similar media:", error);
            throw error;
        }
    }

    function populateSidebarRecommendations(mediaItems) {
        mediaItems.forEach((currentItem, index) => {
            const displayBlock = document.getElementById(`related_video_block_${index + 1}`);
            if (!displayBlock) return;

            const imageContainer = displayBlock.querySelector(".thumbnail");
            const detailContainer = displayBlock.querySelector(".information");

            displayBlock.dataset.contentPayload = JSON.stringify(currentItem);

            if (imageContainer) {
                const mediaImage = imageContainer.querySelector("img");
                if (mediaImage && currentItem.media$group && currentItem.media$group.media$thumbnail && currentItem.media$group.media$thumbnail[0]) {
                    mediaImage.src = currentItem.media$group.media$thumbnail[0].url;
                }

                const durationDisplay = imageContainer.querySelector(".video_time");
                if (durationDisplay && currentItem.media$group && currentItem.media$group.yt$duration) {
                    durationDisplay.textContent = calculateTimeDisplay(parseInt(currentItem.media$group.yt$duration.seconds, 10));
                }
            }

            if (detailContainer) {
                const ratingVisualElement = detailContainer.querySelector(".progress_bar");
                if (ratingVisualElement) {
                    processContentRating(currentItem, ratingVisualElement);
                }

                const titleElement = detailContainer.querySelector(".title");
                if (titleElement && currentItem.title) {
                    titleElement.textContent = currentItem.title.$t;
                }

                const viewCountElement = detailContainer.querySelector(".view_count");
                if (viewCountElement && currentItem.yt$statistics) {
                    viewCountElement.textContent = `${formatNumericString(currentItem.yt$statistics.viewCount)} views`;
                }
            }
        });
    }

    function processContentRating(mediaData, visualTarget) {
        let positiveVotes = 0;
        let negativeVotes = 0;
        let calculatedPercentage = 0;
        let hasRatingData = false;

        if (mediaData.yt$rating && mediaData.yt$rating.numLikes !== undefined && mediaData.yt$rating.numDislikes !== undefined) {
            positiveVotes = parseFloat(mediaData.yt$rating.numLikes);
            negativeVotes = parseFloat(mediaData.yt$rating.numDislikes);

            const totalVotes = positiveVotes + negativeVotes;
            if (totalVotes > 0) {
                calculatedPercentage = Math.round((positiveVotes * 100) / totalVotes);
                hasRatingData = true;
            }
        }

        updateProgressIndicator(visualTarget, calculatedPercentage, hasRatingData);

        const summaryTextElement = visualTarget.nextElementSibling;
        if (summaryTextElement && summaryTextElement.classList.contains("likes_text")) {
            summaryTextElement.textContent = `${formatNumericString(positiveVotes)} likes, ${formatNumericString(negativeVotes)} dislikes`;
        }
    }

    async function initiateVideoPlaybackById(contentId) {
        const infoURL = `${_SERVICE_ENDPOINT_COLLECTION_.contentInformation}${contentId}?${_API_PARAMETER_SET_}`;
        
        try {
            const networkResponse = await fetch(infoURL);
            if (!networkResponse.ok) {
                throw new Error(`Network response not OK, status: ${networkResponse.status}`);
            }
            const responseData = await networkResponse.json();
            return renderVideoPlayer(responseData.entry);
        } catch (error) {
            console.error("Failed to retrieve video details for playback:", error);
            throw error;
        }
    }

    function renderVideoPlayer(contentDetails) {
        if (!contentDetails || !contentDetails.media$group || !contentDetails.media$group.media$content || !contentDetails.media$group.media$content[0]) {
            console.error("Invalid content details for player rendering.");
            return;
        }

        const videoIdentifier = contentDetails.media$group.media$content[0].url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)(\w+)/)?.[1];
        if (!videoIdentifier) {
            console.error("Could not extract video identifier from content URL.");
            return;
        }

        const playerFrameContainer = document.getElementById('player');
        if (playerFrameContainer) {
            const mediaFrame = document.createElement('iframe');
            mediaFrame.setAttribute('width', '640');
            mediaFrame.setAttribute('height', '390');
            mediaFrame.setAttribute('src', `https://www.youtube.com/embed/${videoIdentifier}?rel=0&fs=1&autoplay=1&wmode=transparent`);
            mediaFrame.setAttribute('frameborder', '0');
            mediaFrame.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
            mediaFrame.setAttribute('allowfullscreen', 'true');
            
            playerFrameContainer.innerHTML = '';
            playerFrameContainer.appendChild(mediaFrame);
        }

        const currentTitleElement = document.querySelector(".play_video_title");
        if (currentTitleElement && contentDetails.title) {
            currentTitleElement.textContent = contentDetails.title.$t;
        }

        const currentDescriptionElement = document.querySelector(".play_video_description");
        if (currentDescriptionElement && contentDetails.media$group && contentDetails.media$group.media$description) {
            currentDescriptionElement.textContent = contentDetails.media$group.media$description.$t;
        }

        const currentViewsElement = document.querySelector(".play_video_views");
        if (currentViewsElement && contentDetails.yt$statistics) {
            currentViewsElement.textContent = formatNumericString(contentDetails.yt$statistics.viewCount);
        }

        const currentRatingElement = document.querySelector(".play_video_likes");
        if (currentRatingElement) {
            processContentRating(contentDetails, currentRatingElement);
        }
    }

    return {
        retrieveSimilarMedia: retrieveSimilarMedia,
        populateSidebarRecommendations: populateSidebarRecommendations,
        initiateVideoPlaybackById: initiateVideoPlaybackById,
        renderVideoPlayer: renderVideoPlayer
    };

})();