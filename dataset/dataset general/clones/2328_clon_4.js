(() => {
  class ContentSwapper {
    #mainContentElement;
    #animationDuration = 300;

    constructor(hostElement) {
      this.#mainContentElement = hostElement;
      this.#establishNavigation();
      window.addEventListener('popstate', this.#processHistoryChange.bind(this));
    }

    #establishNavigation() {
      this.#mainContentElement.addEventListener('click', this.#handleLinkActivation.bind(this));
    }

    async #handleLinkActivation(pressEvent) {
      if (!pressEvent.target || pressEvent.target.tagName !== 'A' || pressEvent.target.host !== window.location.host) {
        return;
      }

      pressEvent.preventDefault();
      const targetAddress = pressEvent.target.href;

      if (targetAddress === window.location.href) {
        return;
      }

      await this.#updatePageContentFromUrl(targetAddress, true);
    }

    async #processHistoryChange(stateEvent) {
      await this.#updatePageContentFromUrl(window.location.pathname, false);
    }

    async #updatePageContentFromUrl(sourceUrl, shouldModifyHistory) {
      try {
        const retrievedHtml = await this.#fetchExternalPage(sourceUrl);
        const extractedBodyHtml = this.#extractHtmlBody(retrievedHtml);

        if (!extractedBodyHtml) {
          console.error('No main content found in response from:', sourceUrl);
          window.location.href = sourceUrl;
          return;
        }

        await this.#initiateOutboundAnimation();
        this.#replaceCurrentContent(extractedBodyHtml);
        if (shouldModifyHistory) {
          history.pushState(null, '', sourceUrl);
        }
        await this.#initiateInboundAnimation();

      } catch (issue) {
        console.error('Content loading failed:', issue);
        window.location.href = sourceUrl;
      }
    }

    async #fetchExternalPage(urlPath) {
      const serverResponse = await fetch(urlPath);
      if (!serverResponse.ok) {
        throw new Error(`Server responded with status: ${serverResponse.status}`);
      }
      return await serverResponse.text();
    }

    #extractHtmlBody(fullHtmlString) {
      const parserUtility = new DOMParser();
      const parsedDocument = parserUtility.parseFromString(fullHtmlString, 'text/html');
      const bodyElementFromDoc = parsedDocument.querySelector('body');
      return bodyElementFromDoc ? bodyElementFromDoc.innerHTML : null;
    }

    async #initiateOutboundAnimation() {
      const pageBody = this.#mainContentElement;
      pageBody.style.transition = `transform ${this.#animationDuration}ms ease-out, opacity ${this.#animationDuration}ms ease-out`;
      pageBody.style.transform = 'translateX(-100%)';
      pageBody.style.opacity = '0';

      return new Promise(resolved => {
        const transitionFinishes = () => {
          pageBody.removeEventListener('transitionend', transitionFinishes);
          pageBody.style.transition = '';
          resolved();
        };
        pageBody.addEventListener('transitionend', transitionFinishes);
      });
    }

    #replaceCurrentContent(freshHtml) {
      this.#mainContentElement.innerHTML = freshHtml;
    }

    async #initiateInboundAnimation() {
      const pageBody = this.#mainContentElement;
      pageBody.style.transform = 'translateX(100%)';
      pageBody.style.opacity = '0';

      void pageBody.offsetWidth;

      pageBody.style.transition = `transform ${this.#animationDuration}ms ease-in, opacity ${this.#animationDuration}ms ease-in`;
      pageBody.style.transform = 'translateX(0)';
      pageBody.style.opacity = '1';

      return new Promise(resolved => {
        const transitionFinishes = () => {
          pageBody.removeEventListener('transitionend', transitionFinishes);
          pageBody.style.transition = '';
          resolved();
        };
        pageBody.addEventListener('transitionend', transitionFinishes);
      });
    }
  }

  window.addEventListener('load', () => {
    document.body.style.overflowX = 'hidden';
    new ContentSwapper(document.body);
  });
})();