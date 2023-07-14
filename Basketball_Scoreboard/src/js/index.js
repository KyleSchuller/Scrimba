import docReady from './docReady.js';
import Modal from './modal.js';
import ScoreBoard from './scoreboard.js';

const HOME_TEAM_SCORE = 'homeScore';
const GUEST_TEAM_SCORE = 'guestScore';

let homeScoreElement, guestScoreElement, resetButton, resetConfirmButton, resetModalElement, undoButton, redoButton, historyListElement;

const addScoreEventListeners = (scoreElement, team, scoreBoard) => {
  scoreElement.addEventListener('click', event => {
    const { target } = event;

    if (target.tagName === 'BUTTON') {
      const points = Number(target.dataset.scoreAdd);

      scoreBoard.incrementScore(team, points);
    }
  });
};

const handleModalOpening = (button, modalElement) => button.addEventListener('click', () => modalElement.modalInstance.openModal());

async function init() {
  try {
    await docReady();

    homeScoreElement = document.querySelector('#scoreHome .currentScore');
    guestScoreElement = document.querySelector('#scoreGuest .currentScore');
    resetButton = document.querySelector('#scoreReset');
    resetConfirmButton = document.querySelector('#scoreResetConfirm');
    resetModalElement = document.querySelector('#modalResetConfirm');
    undoButton = document.querySelector('#scoreUndo');
    redoButton = document.querySelector('#scoreRedo');
    historyListElement = document.querySelector('#historyList');

    if (!homeScoreElement || !guestScoreElement || !resetButton || !resetConfirmButton || !resetModalElement || !undoButton || !redoButton || !historyListElement) {
      throw new Error('One or more required elements could not be found in the DOM.');
    }

    const scoreBoard = new ScoreBoard(homeScoreElement, guestScoreElement, undoButton, redoButton, resetButton, historyListElement);

    const scoreElements = [document.querySelector('#scoreHome'), document.querySelector('#scoreGuest')];
    for (const scoreElement of scoreElements) {
      const team = scoreElement.id === 'scoreHome' ? HOME_TEAM_SCORE : GUEST_TEAM_SCORE;
      addScoreEventListeners(scoreElement, team, scoreBoard);
    }

    resetConfirmButton.addEventListener('click', () => {
      scoreBoard.resetScore();

      resetModalElement.dispatchEvent(new CustomEvent('closeModal', { detail: resetModalElement.modalInstance }));
    });

    resetModalElement.addEventListener('closeModal', event => {
      if (event.target.open) {
        event.detail.closeModal();
      }
    });

    undoButton.addEventListener('click', () => scoreBoard.undoLastScore());
    redoButton.addEventListener('click', () => scoreBoard.redoLastUndoneScore());

    scoreBoard.displayCurrentScore();

    const appElement = document.body.firstElementChild;
    if (!appElement) {
      throw new Error('The app element could not be found in the DOM.');
    }

    const modalElements = [...document.querySelectorAll('dialog')];
    modalElements.forEach(modalElement => {
      modalElement.modalInstance = new Modal(modalElement, appElement);
      modalElement.modalInstance.closeModal();
    });

    const modalOpenButtons = [...document.querySelectorAll('[data-modal]')];
    modalOpenButtons.forEach(button => {
      const modalElement = document.querySelector(button.dataset.modal);
      if (modalElement) {
        handleModalOpening(button, modalElement);
      } else {
        console.error(`Modal element for button ${button.id} could not be found.`);
      }
    });

    const url = new URL(window.location.href);
    const modalId = url.hash;
    if (modalId) {
      const modalElement = document.querySelector(modalId);
      if (modalElement && modalElement.modalInstance) {
        modalElement.modalInstance.openModal();
      }
    }

    // Initialize theme switcher
    initThemeSwitcher();
  } catch (error) {
    console.error('An error occurred during initialization:', error);
  }
}

function initThemeSwitcher() {
  const themeButtons = document.querySelectorAll('[data-set-theme]');

  let systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let currentTheme = getStoredTheme() || systemTheme;

  function setTheme(theme) {
    // Set the theme as a data attribute on the root element
    document.documentElement.setAttribute('data-theme', theme);

    // Update the aria-pressed attribute on all buttons
    themeButtons.forEach(btn => {
      btn.disabled = btn.getAttribute('data-set-theme') === theme;
    });

    // Remember the current theme
    currentTheme = theme;

    // Store the current theme in localStorage
    localStorage.setItem('theme', theme);
  }

  function getStoredTheme() {
    // Get the theme from localStorage
    return localStorage.getItem('theme');
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-set-theme'));
    });
  });

  // Set the initial theme
  setTheme(currentTheme);
}

init();
