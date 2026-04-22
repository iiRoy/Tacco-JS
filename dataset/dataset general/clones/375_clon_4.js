(function(globalScope) {

  let notificationArea = null;

  let ApplicationNotifier = {
    displayMessage: function(contentString, configurationParameters) {
      const currentConfig = configurationParameters || {};

      if (currentConfig.useNativeAlert && globalScope["webkitNotifications"]) {
        if (globalScope.webkitNotifications.checkPermission() === 0) {
          const captionText = currentConfig["caption"] ? currentConfig.caption : " ";
          const plainContent = MessageProcessor.extractPlainText(contentString);

          return globalScope.webkitNotifications.createNotification('data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw==', captionText, plainContent).show();
        } else {
          globalScope.webkitNotifications.requestPermission();
        }
      }

      if (!notificationArea) {
        notificationArea = globalScope.document.createElement('div');
        notificationArea.id = 'alertzone';
        globalScope.document.body.appendChild(notificationArea);
      }

      return new EphemeralAlert(contentString, currentConfig);
    }
  };

  class MessageProcessor {
    static extractPlainText(htmlString) {
      const temporaryDiv = globalScope.document.createElement('div');
      temporaryDiv.innerHTML = htmlString;
      return temporaryDiv.textContent || temporaryDiv.innerText || '';
    }
  }

  class EphemeralAlert {
    constructor(contentString, configurationParameters) {
      this.currentPreferences = Object.assign({
        caption: false,
        content: contentString,
        animationDuration: 500,
        displayDuration: 3000
      }, configurationParameters);

      this.alertElement = globalScope.document.createElement('div');
      this.alertElement.className = 'alert-widget';
      this.alertElement.style.display = 'none';
      this.alertElement.style.opacity = '0';
      this.alertElement.style.overflow = 'hidden';

      this.alertElement.innerHTML = `<div class="alert-dismiss-button"></div>${this.currentPreferences.content}`;

      notificationArea.insertBefore(this.alertElement, notificationArea.firstChild);

      if (this.currentPreferences.caption !== false) {
        const captionElement = globalScope.document.createElement('div');
        captionElement.className = 'alert-caption';
        captionElement.textContent = this.currentPreferences.caption;
        this.alertElement.prepend(captionElement);
      }

      this.alertElement.addEventListener('mouseenter', this.handleMouseOver.bind(this));
      this.alertElement.addEventListener('mouseleave', this.handleMouseOut.bind(this));

      const dismissButton = this.alertElement.querySelector('.alert-dismiss-button');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => this.dismissNotification(true));
      }

      this.displayTimer = null;

      this.initiateDisplay();
    }

    initiateDisplay() {
      const animSecs = this.currentPreferences.animationDuration / 1000;
      this.alertElement.style.transition = `opacity ${animSecs}s ease-in-out, height ${animSecs}s ease-in-out`;

      this.alertElement.style.display = 'block';
      const naturalHeight = this.alertElement.offsetHeight;
      this.alertElement.style.height = '0px';

      globalScope.requestAnimationFrame(() => {
        globalScope.requestAnimationFrame(() => {
          this.alertElement.style.height = `${naturalHeight}px`;
          this.alertElement.style.opacity = '1';
        });
      });

      if (this.currentPreferences.displayDuration !== false) {
        this.displayTimer = globalScope.setTimeout(() => this.dismissNotification(), this.currentPreferences.displayDuration);
      }
    }

    handleMouseOver() {
      this.alertElement.dataset.isHovered = 'true';
      if (this.displayTimer) {
        globalScope.clearTimeout(this.displayTimer);
      }
    }

    handleMouseOut() {
      this.alertElement.dataset.isHovered = 'false';
      if (this.currentPreferences.displayDuration !== false) {
        this.displayTimer = globalScope.setTimeout(() => this.dismissNotification(), this.currentPreferences.displayDuration);
      }
    }

    dismissNotification(forceful = false) {
      if (this.alertElement.dataset.isHovered === 'true' && !forceful) {
        return;
      }

      if (this.displayTimer) {
        globalScope.clearTimeout(this.displayTimer);
      }

      this.alertElement.style.opacity = '0';
      this.alertElement.style.height = '0px';

      this.alertElement.addEventListener('transitionend', this.removeElement.bind(this), {
        once: true
      });
    }

    removeElement() {
      if (this.alertElement.parentNode) {
        this.alertElement.parentNode.removeChild(this.alertElement);
      }
    }
  }

  globalScope.ApplicationNotifier = ApplicationNotifier;

})(window);