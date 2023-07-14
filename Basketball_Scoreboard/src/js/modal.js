export default class Modal {
  constructor(dialogElement) {
    if (!(dialogElement instanceof HTMLDialogElement)) {
      throw new Error('Invalid argument: "dialogElement" must be an instance of HTMLDialogElement.');
    }

    this.dialog = dialogElement;
    this.lastFocusedElement = null;

    ['handleBackdropClick', 'closeModal'].forEach(fn => (this[fn] = this[fn].bind(this)));

    this.dialog.addEventListener('click', this.handleBackdropClick);
    this.dialog.querySelectorAll('[data-close]').forEach(button => {
      button.addEventListener('click', this.closeModal);
    });
  }

  handleBackdropClick(event) {
    event.target === this.dialog && this.closeModal();
  }

  openModal() {
    this.lastFocusedElement = document.activeElement;
    this.dialog.showModal();
    this.toggleScrollLock(true);
    this.dispatchCustomEvent('openModal');
  }

  closeModal() {
    this.dialog.close();
    this.restoreFocus();
    this.toggleScrollLock(false);
    this.dispatchCustomEvent('closeModal');
  }

  toggleScrollLock(lock) {
    document.body.classList[lock ? 'add' : 'remove']('stopScroll');
  }

  restoreFocus() {
    this.lastFocusedElement && document.body.contains(this.lastFocusedElement) && this.lastFocusedElement.focus();
    this.lastFocusedElement = null;
  }

  dispatchCustomEvent(eventName) {
    this.dialog.dispatchEvent(new CustomEvent(eventName, { detail: this }));
  }

  destroy() {
    this.dialog.removeEventListener('click', this.handleBackdropClick);
    this.dialog.querySelectorAll('[data-close]').forEach(button => {
      button.removeEventListener('click', this.closeModal);
    });
  }
}
