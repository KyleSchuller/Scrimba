const HOME_TEAM_SCORE = 'homeScore';
const GUEST_TEAM_SCORE = 'guestScore';

export default class ScoreBoard {
  constructor(homeScoreElement, guestScoreElement, undoScoreButton, redoScoreButton, resetScoreButton, scoreHistoryElement) {
    this.homeScoreElement = homeScoreElement;
    this.guestScoreElement = guestScoreElement;
    this.undoScoreButton = undoScoreButton;
    this.redoScoreButton = redoScoreButton;
    this.resetScoreButton = resetScoreButton;
    this.scoreHistoryElement = scoreHistoryElement;

    this.currentScore = new Map([
      [HOME_TEAM_SCORE, 0],
      [GUEST_TEAM_SCORE, 0],
    ]);

    this.previousScores = [];
    this.futureScores = [];

    this.scoreHistory = [];
  }

  incrementScore = (team, points) => {
    if (![HOME_TEAM_SCORE, GUEST_TEAM_SCORE].includes(team)) {
      throw new Error(`Invalid team: ${team}. Team must be either ${HOME_TEAM_SCORE} or ${GUEST_TEAM_SCORE}.`);
    }

    const { currentScore, previousScores, futureScores } = this;
    previousScores.push(new Map(currentScore));
    futureScores.length = 0;

    currentScore.set(team, currentScore.get(team) + points);

    const scoreEntry = { team, points };
    this.scoreHistory.push(scoreEntry);

    this.renderScoreHistory(scoreEntry);
    this.updateScoreButtons();
    this.displayCurrentScore();
  };

  resetScore = () => {
    this.previousScores = [];
    this.futureScores = [];
    this.scoreHistory = [];

    this.currentScore.set(HOME_TEAM_SCORE, 0);
    this.currentScore.set(GUEST_TEAM_SCORE, 0);

    this.scoreHistoryElement.innerHTML = '';

    this.updateScoreButtons();
    this.displayCurrentScore();
  };

  undoLastScore = () => {
    if (this.previousScores.length > 0) {
      const lastEntry = this.scoreHistory.pop();

      this.futureScores.push({ scoreState: new Map(this.currentScore), entry: lastEntry });
      this.currentScore = new Map(this.previousScores.pop());

      this.scoreHistoryElement.removeChild(this.scoreHistoryElement.lastChild);

      this.updateScoreButtons();
      this.displayCurrentScore();
    }
  };

  redoLastUndoneScore = () => {
    if (this.futureScores.length > 0) {
      const { scoreState, entry } = this.futureScores.pop();
      this.previousScores.push(new Map(this.currentScore));
      this.currentScore = new Map(scoreState);
      this.scoreHistory.push(entry);

      this.renderScoreHistory(entry);
      this.updateScoreButtons();
      this.displayCurrentScore();
    }
  };

  updateScoreButtons = () => {
    const isHistoryEmpty = this.previousScores.length === 0;
    const isScoreEmpty = this.currentScore.get(HOME_TEAM_SCORE) === 0 && this.currentScore.get(GUEST_TEAM_SCORE) === 0;

    this.undoScoreButton.disabled = isHistoryEmpty;
    this.redoScoreButton.disabled = this.futureScores.length === 0;
    this.resetScoreButton.disabled = isHistoryEmpty && isScoreEmpty;
  };

  displayCurrentScore = () => {
    this.homeScoreElement.textContent = this.currentScore.get(HOME_TEAM_SCORE);
    this.guestScoreElement.textContent = this.currentScore.get(GUEST_TEAM_SCORE);
  };

  renderScoreHistory = entry => {
    const teamName = entry.team.replace('Score', '');
    const teamTitle = `${teamName.charAt(0).toUpperCase()}${teamName.slice(1)}`;

    const listItem = document.createElement('li');
    listItem.textContent = `+${entry.points}`;
    listItem.className = teamName;
    listItem.setAttribute('aria-label', `${teamTitle} scored ${entry.points} points`);
    this.scoreHistoryElement.appendChild(listItem);

    setTimeout(() => {
      listItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
  };
}
