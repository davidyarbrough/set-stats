import { Scene } from 'phaser';

export class Game extends Scene
{
    
    numberOfCards = 12 //TODO extract to config or something
    numbers = [1, 2, 3]
    colors = ["green", "purple", "red"]
    symbols = ["diamond", "pill", "squiggly"]
    fills = ["filled", "hollow", "shaded"]
    cards = []
    selectedCards = []
    validSets = []
    startTime = null;
    
    gridConfiguration = {
        gridWidth: 3,
        gridHeight: 4,
        cardWidth: 100,
        cardHeight: 150,
        paddingX: 10,
        paddingY: 10
    }

    constructor ()
    {
        super('Game');
    }

    init ()
    {
        // Fadein camera
        this.cameras.main.fadeIn(500);
        this.lives = 10;
    }


    newRandomCard() {
        var numberIndex = Math.floor(Math.random() * this.numbers.length)
        var colorIndex = Math.floor(Math.random() * this.colors.length)
        var symbolIndex = Math.floor(Math.random() * this.symbols.length)
        var fillIndex = Math.floor(Math.random() * this.numbers.length)
        var newCard = {
            number: this.numbers[numberIndex],
            color: this.colors[colorIndex],
            symbol: this.symbols[symbolIndex],
            fill: this.fills[fillIndex],
            assetKey: `${this.numbers[numberIndex]}-${this.colors[colorIndex]}-${this.symbols[symbolIndex]}-${this.fills[fillIndex]}`
        }

        return newCard

    }

    createNewGrid() {
        var cards = []

        while (cards.length < this.numberOfCards) {
            const newCard = this.newRandomCard();
            if (!cards.some(card => this.cardsAreEqual(card, newCard))) {
                cards.push(newCard)
            }
        }
        return cards
    }

    cardsAreEqual(cardOne, cardTwo) {
        return (
            cardOne.number === cardTwo.number &&
            cardOne.color === cardTwo.color &&
            cardOne.symbol === cardTwo.symbol &&
            cardOne.fill === cardTwo.fill
        )
    }

    evaluateSelected() {
        console.log(this.selectedCards)
        if (this.selectedCards.length < 3 ) {
            console.log("not enough selected")
            return;
        }
        console.log("Ready to evaluate!")
        this.endGame()
    }

    endGame() {
        const secondsTaken = (Date.now() - this.startTime) / 1000;
        console.log(`Your time was ${secondsTaken} seconds.`)
        if ( this.checkIfValidSet(this.selectedCards[0].card, this.selectedCards[1].card, this.selectedCards[2].card) ) {
            console.log(`You found a Set! your Set:`)
        } else {
            console.log("Sorry, you didn't find a Set. Your set (lowercase...):")
        }
        console.log([this.selectedCards[0].card, this.selectedCards[1].card, this.selectedCards[2].card])
        console.log("All valid sets in this deck:")
        console.log(this.validSets)
        this.selectedCards = []
        this.scene.start('Game');

    }

    checkIfValidSet(cardOne, cardTwo, cardThree) {
        for (let attribute of ['number', 'color', 'symbol', 'fill']) {
            const attr1 = cardOne[attribute]
            const attr2 = cardTwo[attribute]
            const attr3 = cardThree[attribute]

            if (
                !(attr1 === attr2 && attr2 === attr3) // all of this attribute the same
                && !(attr1 !== attr2 && attr2 !== attr3 && attr1 !== attr3) // all of this attribute different
            ) {
                return false;
            }
        }
        return true;
    }

    findAllValidSets(cards) {
        const validSets = [];

        for (let i = 0; i < this.cards.length - 2; i++) {
            for (let j = i + 1; j < this.cards.length - 1; j++) {
                for (let k = j + 1; k < this.cards.length; k++) {
                    const card1 = this.cards[i];
                    const card2 = this.cards[j];
                    const card3 = this.cards[k];
                    if (this.checkIfValidSet(card1, card2, card3)) {
                        validSets.push([card1, card2, card3])
                    }
                }
            }
        }
        return validSets
    }

    preload () {
        this.numbers.forEach(number => {
            this.colors.forEach(color => {
                this.symbols.forEach(symbol => {
                    this.fills.forEach(fill => {
                        const assetKey = `${number}-${color}-${symbol}-${fill}`
                        this.load.image(assetKey, `assets/cards/${assetKey}.png`)
                    })
                })
            })
        })
        this.cards = this.createNewGrid()
        this.validSets = this.findAllValidSets()
    }

    create ()
    {
        //initialize the grid
        const totalWidth = this.gridConfiguration.gridWidth * (this.gridConfiguration.cardWidth + this.gridConfiguration.paddingX) - this.gridConfiguration.paddingX;
        const totalHeight = this.gridConfiguration.gridHeight * (this.gridConfiguration.cardHeight + this.gridConfiguration.paddingY) - this.gridConfiguration.paddingY;
        const startX = (this.sys.game.config.width - totalWidth) / 2;
        const startY = (this.sys.game.config.height - totalHeight) / 2;
        let xPos = startX;
        let yPos = startY;

        this.add.image(512, 384, 'background').setAlpha(0.5);

        //fill the grid with cards
        console.log(this.cards)
        this.cards.forEach(card => {
            const sprite = this.add.sprite(xPos, yPos, card.assetKey);
            sprite.card = card
            sprite.setOrigin(0);
            sprite.setScale(100 / sprite.width)
            sprite.setInteractive();
            sprite.on('pointerdown', () => {
                if (!sprite.selected) {
                    sprite.setTint(0xAAAA00);
                    sprite.selected = true;
                    this.selectedCards.push(sprite)
                } else {
                    sprite.clearTint();
                    sprite.selected = false;
                    const index = this.selectedCards.indexOf(sprite);
                    if (index != -1) {
                        this.selectedCards.splice(index, 1);
                    }
                }
                this.evaluateSelected()
            })

            xPos += this.gridConfiguration.cardWidth + this.gridConfiguration.paddingX
            if (xPos >= startX + totalWidth) { //end of line
                xPos = startX; //carriage return
                yPos += this.gridConfiguration.cardHeight + this.gridConfiguration.paddingY; // line feed
            }
        })
        this.cameras.main.setBackgroundColor(0x00ff00);
        this.startTime = Date.now();
        console.log(`There are ${this.validSets.length} sets`)
        console.log(this.validSets)
        // this.add.text(512, 384, "Test", {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');

        // });
    }
}