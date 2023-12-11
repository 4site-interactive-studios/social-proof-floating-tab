const FSPFloatingTab = {
  initialize(config = {}) {
    const dependencies = {
      // Null object for Google Tag Data Layer in case no object
      // is passed.
      GTMDataLayer: config.GTMDataLayer || {
        push(data) {
          if (config.devMode) {
            console.log('[FSP GTMDataLayer] Pushed:');
            console.log(data);
          }
        }
      }
    }

    // --------------------------------------------
    // Initialize state.

    const timeToHide = 1000;
    const timeToShow = 5000;

    const state = {
      hasBeenRecentlyClosed: getRecentlyClosedStatus(),
      hasBeenShown: false,
      showing: false,
      message: null,
      timer: null,

      messages: config.messages.map(message => ({
        ...message,
        hasBeenSeen: false,
      })),
    }

    state.message = state.messages[0];

    // --------------------------------------------
    // Create the initial component and shadow DOM.

    const componentElement = document.createElement('div');
    componentElement.addEventListener('mouseover', handleStartHovering);
    componentElement.addEventListener('mouseout', handleStopHovering);
    componentElement.id = 'fsp-floating-tab-component';

    const componentTree = componentElement.attachShadow({ mode: 'open' });

    // --------------------------------------------
    // Handle re-renders.

    function render() {
      const renderedFloatingTab = componentTree.querySelector('#fsp-floating-tab');

      // Dynamically set the bottom position of the tab in case it spans multiple
      // lines.
      const renderedBottomOffset = (renderedFloatingTab.offsetHeight * -1) - 25;
      renderedFloatingTab.style.bottom = `${ renderedBottomOffset }px`;

      componentTree
        .querySelector('.fsp-floating-tab__main__message__title')
        .innerHTML = state.message.title;

      componentTree
        .querySelector('.fsp-floating-tab__main__message__subtitle')
        .innerHTML = state.message.subtitle;

      renderedFloatingTab.setAttribute('data-showing', state.showing);
    }

    // --------------------------------------------
    // Event Listeners

    function handleAction(event) {
      event.preventDefault();

      dependencies.GTMDataLayer.push({
        'event': 'floatingTabClicked',
      });

      window.open(config.actionUrl, '_blank');
    }

    function handleClose(event) {
      event.preventDefault();

      hide();
      stopVisibilitySequence();
      setClosedAtTime();

      dependencies.GTMDataLayer.push({
        'event': 'floatingTabClosed',
      });
    }

    function handleStartHovering() {
      if (state.showing) {
        stopVisibilitySequence();
      }
    }

    function handleStopHovering() {
      if (state.showing) {
        startVisibilitySequence();
      }
    }

    // --------------------------------------------
    // State Change Methods: Base

    function hide() {
      state.showing = false;
      render();
    }

    function show() {
      if (!state.hasBeenShown) {
        state.hasBeenShown = true;

        // Logic to execute only when the tab is first shown.
        dependencies.GTMDataLayer.push({
          'event': 'floatingTabView',
        });
      }

      state.showing = true;
      render();
    }

    function startVisibilitySequence() {
      if (state.showing) {
        state.timer = setTimeout(() => {
          hide();
          startVisibilitySequence();
        }, timeToShow);
      }

      if (!state.showing) {
        state.timer = setTimeout(() => {
          switchMessage();
          show();
          startVisibilitySequence();
        }, timeToHide);
      }
    }

    function stopVisibilitySequence() {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
    }

    // Switch to a random message that:
    // - Has not been shown in the current cycle.
    // - Has not just been seen.
    function switchMessage() {
      const possibleMessages = state.messages
        .filter(message => message.title !== state.message.title)
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

      state.message = nextMessage;
      state.message.hasBeenSeen = true;

      render();
    }

    // --------------------------------------------
    // General Helpers

    // Checks if the floating tab has been closed within the last 24 hours.
    function getRecentlyClosedStatus() {
      const closedAt = getClosedAtTime();

      if (closedAt) {
        const now = new Date().getTime();
        const hoursPassed = (now - closedAt) / (1000 * 60 * 60);

        return hoursPassed < 24;
      }

      return false;
    }

    function setClosedAtTime() {
      localStorage.setItem('fsp-floating-tab__closedAt', new Date().getTime());
    }

    function getClosedAtTime() {
      return localStorage.getItem('fsp-floating-tab__closedAt');
    }

    // --------------------------------------------

    const cssStyles = `
      #fsp-floating-tab {
        /* Bottom position is set when the tab is initialized */
        /* to prevent a flash of unstyled content. */

        position: fixed;
        right: 0;
        margin: 1rem;
        max-width: 350px;

        display: flex;

        z-index: 2;

        background-color: white;
        border-radius: 18px;
        border: 2px solid black;

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
        bottom: 0 !important;
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
        color: inherit;
        text-decoration: none;
      }

      .fsp-floating-tab__main {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
      }

      .fsp-floating-tab__main:hover {
        cursor: pointer;
      }

      .fsp-floating-tab__main__icon {
        height: 30px;
        width: 30px;
        min-height: 30px;
        min-width: 30px;
        margin-left: 0.75rem;

        background-size: contain;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAvBAMAAAE6l4TiAAAAAXNSR0IArs4c6QAAADBQTFRFAAAA2TMz4TUv3zkx3Tgv3Tgv4Dcw4DYw3jkw3jgx3zgx3jgx7Ds05Dky4Dgx3jgx86nZwQAAAAx0Uk5TABQrP1Jyipu5yt7x+8F0UAAAAh1JREFUeNp9k8trE1EUh780MW2ENgEf4ELIf+C4rYjZ6UJBdz6Qdq0gg3uJiq6UGtwWMYsSFxriQkWREJAiFBfJQtC2kOxUiDihUmxN7xwnd+7Emby+xcz95tw7vzMHBjrJImkRhSMivdU2iLyE9BbMWmmQrnQQ8S713mVOBMh3ICnSWOhZRTQdjommAfreBb3aRTNbBCBfJNGyPBWxa71aTTQW4lMcWpznlL67MGOiTCpA0jyAOfmLz5KFLlVF2jmmyo64BUjUxUPd8RMLnJMwu0iELksDnop4AxZCugPEKqHdALGrQTWDz7zWbfokPLWBDAEX9dLs/qL3VJQNcMQR9Q6mqyKbFsT0h2zFnojHKkF/M4547Fnc0uo+Ek0hmLQjmt9IhM8D/mOoXhvwpxEvcjLiNqno+Ii84ANwVPq4lpmF4TsAZwNVi9qnasZX8Um1tLYtDDdMLwHxuqffjGSA6bps5Ahxon2bMLH7IYlf6yV2n9loTj/XWjJxh6t+vPuzlIUD+aZpdl0H7FMSoP5kEi+cvq7lIF6W/6iVB07I3sC8ExmehNlc5HpLxqJeMaEq6jUyAfcty86E0ysTs+Wx/unGsZaFK2OP790F4g/HNfbRn3ldRrJuodnflBG0bQwpc35goH3ODLX/6QIhDlWdyDy+WkSIL4eqv0oWg1xu9b/3JiM4WNYBauM4I4ldUuI272WHC0GH73ciHfMPtki400Rf+0UAAAAASUVORK5CYII=');
      }

      #fsp-floating-tab
      .fsp-floating-tab__main__message {
        margin: 0 0.75rem;
      }

      #fsp-floating-tab
      .fsp-floating-tab__main__message__title {
        font-weight: 600;
        line-height: 125%;
      }

      #fsp-floating-tab
      .fsp-floating-tab__main__message__subtitle {
        line-height: 125%;
        margin-top: 0.25rem;
      }

      .fsp-floating-tab__buttons {
        border-left: 2px solid black;
        width: 100px;
        min-width: 100px;
        display: flex;
        flex-direction: column;
      }

      .fsp-floating-tab__buttons > div {
        display: flex;
        align-items: center;

        flex: 1;
        padding: 0.65rem;
      }

      .fsp-floating-tab__buttons > div:hover {
        background: #EBEBEB;
        cursor: pointer;
      }

      .fsp-floating-tab__buttons__action {
        font-weight: 600;
        border-bottom: 2px solid black;
        border-top-right-radius: 16px;
      }

      .fsp-floating-tab__buttons__close {
        font-style: italic;
        border-bottom-right-radius: 16px;
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
    tabMainElement.addEventListener('click', handleAction);

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

    const actionButtonElement = document.createElement('div');
    actionButtonElement.className = 'fsp-floating-tab__buttons__action'
    actionButtonElement.addEventListener('click', handleAction);
    buttonsElement.appendChild(actionButtonElement);

    const actionButtonElementText = document.createElement('a');
    actionButtonElementText.href = config.actionUrl;
    actionButtonElementText.target = '_blank';
    actionButtonElementText.innerHTML = config.actionText;
    actionButtonElement.appendChild(actionButtonElementText);

    const closeButtonElement = document.createElement('div');
    closeButtonElement.className = 'fsp-floating-tab__buttons__close'
    closeButtonElement.addEventListener('click', handleClose);
    buttonsElement.appendChild(closeButtonElement);

    const closeButtonElementText = document.createElement('span');
    closeButtonElementText.innerHTML = 'Close';
    closeButtonElement.appendChild(closeButtonElementText);

    tabElement.appendChild(buttonsElement);

    // --------------------------------------------

    document.body.appendChild(componentElement);

    // --------------------------------------------
    // Instance Methods

    return {
      start(options = {}) {
        if (!state.hasBeenRecentlyClosed && options.force !== true) {
          show();
          startVisibilitySequence();
          return;
        }

        if (config.devMode) {
          console.log('[FSP] Tab was recently closed. Not starting.');
        }
      },

      stop() {
        stopVisibilitySequence();
        hide();
      }
    }
  }
}
