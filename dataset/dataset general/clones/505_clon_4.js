class SectionOverseer {
    constructor(containerId) {
        this.mainContainer = document.getElementById(containerId);
        this.linkCollection = Array.from(this.mainContainer.querySelectorAll('a'));

        this.revealContent(this.determineInitial());

        this.linkCollection.forEach(link => this.prepareLink(link));
    }

    prepareLink(currentLink) {
        currentLink.addEventListener('click', this.handleActivation.bind(this));
    }

    handleActivation(eventObject) {
        const activatedLink = eventObject.currentTarget;

        this.revealContent(activatedLink);
        this.linkCollection.filter(link => link !== activatedLink).forEach(link => this.obscureContent(link));
    }

    obscureContent(targetLink) {
        targetLink.classList.remove('active-indicator');
        document.getElementById(this.fetchContentId(targetLink)).classList.remove('active-panel');
    }

    revealContent(targetLink) {
        targetLink.classList.add('active-indicator');
        document.getElementById(this.fetchContentId(targetLink)).classList.add('active-panel');
    }

    fetchContentId(currentLink) {
        return currentLink.href.match(/#(\w.+)/)[1];
    }

    determineInitial() {
        const currentHashMatch = window.location.hash.match(/#(\w.+)/);
        if (currentHashMatch) {
            const hashIdentifier = currentHashMatch[1];
            const foundLink = this.linkCollection.find(link => this.fetchContentId(link) === hashIdentifier);
            return foundLink || this.linkCollection[0];
        } else {
            return this.linkCollection[0];
        }
    }
}

window.addEventListener('load', () => {
    new SectionOverseer('tabs');
});