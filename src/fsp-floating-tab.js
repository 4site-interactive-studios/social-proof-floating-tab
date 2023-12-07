const FSPFloatingTab = {
  initialize(config) {
    // --------------------------------------------
    // Create the component and shadow DOM.

    const componentElement = document.createElement('div');
    componentElement.id = 'fsp-floating-tab-component';

    const componentTree = componentElement.attachShadow({ mode: 'open' });

    // --------------------------------------------
    // Initialize state.

    const timeHidden = 10000;
    const timeShowing = 4000;

    const state = {
      currentMessage: null,
      sequenceTimeout: null,

      messages: config.messages.map(message => ({
        ...message,
        hasBeenSeen: false,
      })),
    }

    state.currentMessage = state.messages[0];

    // --------------------------------------------
    // Handle re-renders.

    function render() {
      componentTree
        .querySelector('#fsp-floating-tab')
        .setAttribute('data-showing', state.showing);

      componentTree
        .querySelector('.fsp-floating-tab__main__message__title')
        .innerHTML = state.currentMessage.title;

      componentTree
        .querySelector('.fsp-floating-tab__main__message__subtitle')
        .innerHTML = state.currentMessage.subtitle;
    }

    // --------------------------------------------
    // State Change Methods

    function hideFloatingTab() {
      state.showing = false;
      render();
    }

    function showFloatingTab() {
      state.showing = true;
      render();
    }

    // Switch to a random message that:
    // - Has not been shown in the current cycle.
    // - Has not just been seen.
    function switchMessage() {
      const possibleMessages = state.messages
        .filter(message => message.title !== state.currentMessage.title)
        .filter(message => !message.hasBeenSeen);

      // Start over if the user has seen all the possible messages.
      if (possibleMessages.length === 0) {
        state.messages = state.messages.map(message => ({
          ...message,
          hasBeenSeen: false,
        }));

        return switchMessage();
      }

      const nextMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

      state.currentMessage = nextMessage;
      state.currentMessage.hasBeenSeen = true;

      render();
    }

    // --------------------------------------------
    // Helper Methods

    const sequence = {
      hide() {
        hideFloatingTab();
        setTimeout(sequence.show, timeHidden);
      },

      show() {
        switchMessage();
        showFloatingTab();
        setTimeout(sequence.hide, timeShowing);
      }
    }

    function closeFloatingTab() {
      localStorage.setItem('fsp-floating-tab__closedAt', new Date().getTime());
      hideFloatingTab();
    }

    // Checks if the floating tab has been closed within the last 24 hours.
    function hasBeenRecentlyClosed() {
      const closedAt = localStorage.getItem('fsp-floating-tab__closedAt');

      if (closedAt) {
        const now = new Date().getTime();
        const hoursPassed = (now - closedAt) / (1000 * 60 * 60);

        return hoursPassed < 24;
      }

      return false;
    }

    // --------------------------------------------

    const cssStyles = `
      #fsp-floating-tab {
        position: fixed;
        bottom: -115px;
        right: 0;
        margin: 1rem;
        max-width: 350px;

        display: flex;

        z-index: 2147483647;

        background-color: white;
        border-radius: 18px;
        border: 2px solid #F26824;

        font-family: sans-serif;
      }

      @media (prefers-reduced-motion: no-preference) {
        #fsp-floating-tab {
          transition: bottom 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        #fsp-floating-tab:hover .fsp-floating-tab__main__icon {
          animation: pulse 1s infinite;
          filter: saturate(2);
        }

        @keyframes pulse {
          10% {
            transform: scale(1.1);
          }
        }
      }

      #fsp-floating-tab[data-showing="true"] {
        bottom: 0;
      }

      #fsp-floating-tab *,
      #fsp-floating-tab *:before,
      #fsp-floating-tab *:after {
        box-sizing: inherit;
      }

      #fsp-floating-tab p {
        margin: 0;
        padding: 0;

        font-weight: normal;
      }

      #fsp-floating-tab a {
        text-decoration: none;
      }

      .fsp-floating-tab__main {
        display: flex;
        align-items: center;
      }

      .fsp-floating-tab__main:hover {
        cursor: pointer;
      }

      .fsp-floating-tab__main__icon {
        height: 30px;
        width: 30px;
        margin-left: 0.75rem;

        background-size: contain;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAApCAYAAAB6MAquAAAAAXNSR0IArs4c6QAAAgJJREFUaEPtmk1KQzEQx03rCUQRBBeewqVg8RDqRqx6Czd6C2nFjXgI7cKlp3AhiFLxBLZP5sE88l7zMclk0ufDrkqbZPKb/2TeZFpVFIVacbw+x2eH/ffX07W354Fp2Pf23mS2tXO7ORw9uNbx2YDvU9hRNiAfSHODAAafrV9ODqhgoTZgXZ8DjUBf14NHmyKUzU53T459iknZWADiGkJg8KRJrRhVbE40Oa4GlArGBgUwGy939xSVqWOaUBWQhDGMeVQqtcMQWocqgaRgdIOuDEZVwzZOD+8SSMpzeuhxkgwFGFVSH6PhUeq4pmwg9RhUqTNA4CBQSU2v9p+kwyG1Gq40rmbn/SKXQWk7pUJdAoJz9A8kHTac9buZFDqX5Tr3YM1R+nDOBXVuVfrkKE6pm+KM69389GB+dX2QLlA5m/XNXbg+wATpK4RvU7HfN2/GtRvrX4TCUEOHiPUUYj0eMs/bU8DF5her85CFlzHW1lmy9uXaDGXrKNWyXNPLbT1PLhgnUBvDzwdDAmqLUhQYEhA+oyTbUL6kQoUhA6HBZVQTlD657hBrlrN5LSdUKEywQggpfa58P5m4QjRYIR1K4lyFnBcTWDSQxLmKCbEmFBsoRaXOCTERII5a3BATBQpRK6UqrLTtewhS1EqtShYgk1pSqmQD0ssmeM/9PwMlOn4B7E3bU7cv9L0AAAAASUVORK5CYII=');
      }

      #fsp-floating-tab
      .fsp-floating-tab__main__message {
        margin: 0 0.75rem;
      }

      #fsp-floating-tab
      .fsp-floating-tab__main__message__title {
        font-weight: 600;
        line-height: 150%;
      }

      .fsp-floating-tab__main__message__subtitle {
        line-height: 150%;
      }

      .fsp-floating-tab__buttons {
        border-left: 2px solid #F26824;
      }

      .fsp-floating-tab__buttons > a {
        display: block;
        padding: 0.65rem;
      }

      .fsp-floating-tab__buttons > a:hover {
        background: #EBEBEB;
        cursor: pointer;
      }

      .fsp-floating-tab__buttons__action {
        font-weight: 600;
        border-bottom: 2px solid #F26824;
        border-top-right-radius: 18px;
      }

      .fsp-floating-tab__buttons__close {
        font-style: italic;
        border-bottom-right-radius: 18px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = cssStyles;
    componentTree.appendChild(styleElement);

    // --------------------------------------------
    // Main Element Wrapper

    const tabElement = document.createElement('div');
    tabElement.id = 'fsp-floating-tab';
    tabElement.setAttribute('data-showing', 'false');

    componentTree.appendChild(tabElement);

    // --------------------------------------------
    // Content Container for Icon + Message

    const tabMainElement = document.createElement('div');
    tabMainElement.className = 'fsp-floating-tab__main';

    tabMainElement.addEventListener('click', () => {
      window.open(config.actionUrl, '_blank');
    });

    tabElement.appendChild(tabMainElement);

    // --------------------------------------------
    // Icon

    const iconElement = document.createElement('div');
    iconElement.className = 'fsp-floating-tab__main__icon';

    tabMainElement.appendChild(iconElement);

    // --------------------------------------------
    // Message

    const messageElement = document.createElement('div');
    messageElement.className = 'fsp-floating-tab__main__message';

    const messageTitleElement = document.createElement('p');
    messageTitleElement.className = 'fsp-floating-tab__main__message__title';
    messageElement.appendChild(messageTitleElement);

    const messageSubtitleElement = document.createElement('p');
    messageSubtitleElement.className = 'fsp-floating-tab__main__message__subtitle';
    messageElement.appendChild(messageSubtitleElement);

    tabMainElement.appendChild(messageElement);
 
    // --------------------------------------------
    // Buttons

    const buttonsElement = document.createElement('div');
    buttonsElement.className = 'fsp-floating-tab__buttons';

    const actionButtonElement = document.createElement('a');
    actionButtonElement.className = 'fsp-floating-tab__buttons__action'
    actionButtonElement.href = config.actionUrl;
    actionButtonElement.target = '_blank';
    actionButtonElement.innerHTML = config.actionText;
    buttonsElement.appendChild(actionButtonElement);

    const closeButtonElement = document.createElement('a');
    closeButtonElement.className = 'fsp-floating-tab__buttons__close'
    closeButtonElement.innerHTML = 'Close';
    closeButtonElement.addEventListener('click', closeFloatingTab);
    buttonsElement.appendChild(closeButtonElement);

    tabElement.appendChild(buttonsElement);

    // --------------------------------------------

    document.body.appendChild(componentElement);

    // --------------------------------------------
    // Instance Methods

    return {
      start(options = {}) {
        if (!hasBeenRecentlyClosed() && options.force !== true) {
          switchMessage();
          setTimeout(showFloatingTab, 0);
          state.sequenceTimeout = setTimeout(sequence.hide, timeShowing);
        }
      },

      stop() {
        clearTimeout(state.sequenceTimeout);
        setTimeout(hideFloatingTab, 0);
      }
    }
  }
}
