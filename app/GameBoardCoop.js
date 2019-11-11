'use strict';

const GameBoardBase = require('./GameBoardBase');
const getRandomWords = require('./RandomWords');
const WordCardCoop = require('./WordCardCoop');
const Teams = require('./Teams');

module.exports = class GameBoardCoop extends GameBoardBase {
	constructor() {
		super();
		this.needsLeaders = false;
		this.initScore();
		this.initCards();
	}

	initScore() {
		this.teamScore = 15;
		this.gameOver = false;
	}

	initCards() {
		if (Math.random() < 0.5)
			this.currentTeamName = Teams.RED;
		else
			this.currentTeamName = Teams.BLUE;
		let words = getRandomWords(25);
		let wordIds = [];
		for(let x = 0; x < 25; x++)
			wordIds.push(x);
		wordIds.sort(() => Math.random() - 0.5);
		let shared = wordIds.splice(0, 3);
		let unsharedRed = wordIds.splice(0, 5);
		let unsharedBlue = wordIds.splice(0, 5);
		let shareLossRed = wordIds.pop();
		let shareLossBlue = wordIds.pop();
		let lossRed = wordIds.pop();
		let lossBlue = wordIds.pop();
		let loss = wordIds.pop();

		words.forEach((word, i) => {
			let type = {
				[Teams.RED]: 'Wrong',
				[Teams.BLUE]: 'Wrong',
			};
			if (unsharedRed.indexOf(i) != -1)
				type = {
					[Teams.RED]: Teams.RED,
					[Teams.BLUE]: 'Wrong',
				};
			else if (unsharedBlue.indexOf(i) != -1)
				type = {
					[Teams.RED]: 'Wrong',
					[Teams.BLUE]: Teams.BLUE,
				};
			else if (shared.indexOf(i) != -1)
				type = {
					[Teams.RED]: Teams.RED,
					[Teams.BLUE]: Teams.BLUE,
				};
			else if (shareLossRed === i)
				type = {
					[Teams.RED]: 'Lose',
					[Teams.BLUE]: Teams.BLUE,
				};
			else if (shareLossBlue === i)
				type = {
					[Teams.RED]: Teams.RED,
					[Teams.BLUE]: 'Lose',
				};
			else if (lossRed === i)
				type = {
					[Teams.RED]: 'Lose',
					[Teams.BLUE]: 'Wrong',
				};
			else if (lossBlue === i)
				type = {
					[Teams.RED]: 'Wrong',
					[Teams.BLUE]: 'Lose',
				};
			else if (loss === i)
				type = {
					[Teams.RED]: 'Lose',
					[Teams.BLUE]: 'Lose',
				};
			this.wordCards.push(new WordCardCoop(word, type));
		});
	}

	giveClue(clue, numGuesses) {
		if (super.giveClue(clue, numGuesses)) {
			this.toggleTeam();
			return true;
		}
		return false;
	}

	chooseCard(i) {
		if (this.canGiveClue)
			return false;

		const card = this.wordCards[i];

		if ( ! card.reveal(this.currentTeamName))
			return false;
		this.canPass = true;
		this.numGuesses--;

		const oppositeTeam = this.currentTeamName == Teams.RED ? Teams.BLUE : Teams.RED;
		if (card.type[oppositeTeam] === oppositeTeam) {
			if (--this.teamScore === 0)
				this.revealAllCards();
			return true;
		}

		if (card.type[oppositeTeam] === 'Lose') {
			this.gameOver = true;
			this.revealAllCards();
			return true;
		}

		this.setNewTurnState();
		return true;
	}

	isGameOver() {
		return ! this.teamScore || this.gameOver;
	}

	revealAllCards() {
		this.wordCards.forEach((card) => {
			card.reveal();
		});
	}

	toggleTeam() {
		this.currentTeamName = this.currentTeamName == Teams.RED ? Teams.BLUE : Teams.RED;
	}
}