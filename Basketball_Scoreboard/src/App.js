import { TEAM } from "./js/CONSTANTS.js";

import docReady from "./js/docReady.js";
import ScoreBoard from "./js/ScoreBoard.js";
import Modal from "./js/Modal.js";
import themeSwitcher from "./js/themeSwitcher.js";

let homeScoreElement, guestScoreElement, resetButton, resetConfirmButton, resetModalElement, undoButton, redoButton, historyListElement;

const addScoreEventListeners = (scoreElement, team, scoreBoard) => {
  scoreElement.addEventListener("click", (event) => {
    const { target } = event;

    if (target.tagName === "BUTTON") {
      const points = Number(target.dataset.scoreAdd);

      scoreBoard.incrementScore(team, points);
    }
  });
};

const handleModalOpening = (button, modalElement) => button.addEventListener("click", () => modalElement.modalInstance.openModal());

const init = async () => {
  try {
    await docReady();

    homeScoreElement = document.querySelector("#scoreHome .currentScore");
    guestScoreElement = document.querySelector("#scoreGuest .currentScore");
    resetButton = document.querySelector("#scoreReset");
    resetConfirmButton = document.querySelector("#scoreResetConfirm");
    resetModalElement = document.querySelector("#modalResetConfirm");
    undoButton = document.querySelector("#scoreUndo");
    redoButton = document.querySelector("#scoreRedo");
    historyListElement = document.querySelector("#historyList");

    if (!homeScoreElement || !guestScoreElement || !resetButton || !resetConfirmButton || !resetModalElement || !undoButton || !redoButton || !historyListElement) {
      throw new Error("One or more required elements could not be found in the DOM.");
    }

    const scoreBoard = new ScoreBoard(homeScoreElement, guestScoreElement, undoButton, redoButton, resetButton, historyListElement);

    const scoreElements = [document.querySelector("#scoreHome"), document.querySelector("#scoreGuest")];
    for (const scoreElement of scoreElements) {
      const team = scoreElement.id === "scoreHome" ? TEAM[0] : TEAM[1];
      addScoreEventListeners(scoreElement, team, scoreBoard);
    }

    resetConfirmButton.addEventListener("click", () => {
      scoreBoard.resetScore();

      resetModalElement.dispatchEvent(new CustomEvent("closeModal", { detail: resetModalElement.modalInstance }));
    });

    resetModalElement.addEventListener("closeModal", (event) => {
      if (event.target.open) {
        event.detail.closeModal();
      }
    });

    undoButton.addEventListener("click", () => scoreBoard.undoLastScore());
    redoButton.addEventListener("click", () => scoreBoard.redoLastUndoneScore());

    scoreBoard.displayCurrentScore();

    const appElement = document.body.firstElementChild;
    if (!appElement) {
      throw new Error("The app element could not be found in the DOM.");
    }

    const modalElements = [...document.querySelectorAll("dialog")];
    modalElements.forEach((modalElement) => {
      modalElement.modalInstance = new Modal(modalElement, appElement);
      modalElement.modalInstance.closeModal();
    });

    const modalOpenButtons = [...document.querySelectorAll("[data-modal]")];
    modalOpenButtons.forEach((button) => {
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
    themeSwitcher();
  } catch (error) {
    console.error("An error occurred during initialization:", error);
  }
};

init();
