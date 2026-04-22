function adjustEmbeddedElement(mediaFrame) {
    if (mediaFrame && mediaFrame.tagName === 'IFRAME') {
        const currentContainerWidth = mediaFrame.parentElement ? mediaFrame.parentElement.offsetWidth : window.innerWidth;
        // Assuming a common aspect ratio for embedded social media content, e.g., 4:5 (height is 1.25 times width)
        // This is a placeholder for the actual responsive logic of the original plugin.
        const assumedAspectRatio = 5 / 4;
        const calculatedHeight = currentContainerWidth * assumedAspectRatio;

        mediaFrame.style.width = '100%';
        mediaFrame.style.height = `${calculatedHeight}px`;
        mediaFrame.style.display = 'block';
        mediaFrame.style.border = 'none';
        mediaFrame.style.overflow = 'hidden';
        mediaFrame.style.boxSizing = 'border-box';
    }
}

function manageSocialMediaEmbeds() {
    const targetFrames = document.querySelectorAll('iframe[src*="instagram.com"]');
    targetFrames.forEach(function(frameItem) {
        adjustEmbeddedElement(frameItem);
    });
}

window.addEventListener('load', manageSocialMediaEmbeds);
window.addEventListener('resize', manageSocialMediaEmbeds);