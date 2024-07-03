const cardTypes = ['basto', 'espada', 'copa', 'oro']
const numberOfPlayers = 2
const teams = [ 1, 2 ]
let players = []
let isEnvidoEnabled = true
let isTrucoEnabled = true
let turn = 1
let round = 1

const createDeck = () => {
    let deck = []
    cardTypes.forEach(cardType => {
        for(let i = 1; i <= 12; i++) {
            if (i == 8 || i == 9){
                continue
            }

            deck.push({
                number: i,
                type: cardType,
                imageName: `${i}-${cardType}.png`,
                power: assignCardPower(i, cardType),
                envidoValue: i < 10 ? i : 0
            })
        }
    })
    
    return deck
}

const assignCardPower = (cardNumber, cardType) => {
    let cardPower = 0
    switch(cardNumber) {
        case 1:
            cardPower = cardType == 'espada' ? 14 : cardType == 'basto' ? 13 : 8
            break
        case 2:
            cardPower = 9
            break
        case 3:
            cardPower = 10
            break
        case 4:
            cardPower = 1
            break
        case 5:
            cardPower = 2
            break
        case 6:
            cardPower = 3
            break
        case 7:
            cardPower = cardType == 'espada' ? 12 : cardType == 'oro' ? 11 : 4
            break
        case 10:
            cardPower = 5
            break
        case 11:
            cardPower = 6
            break  
        default:
            cardPower = 7
            break
    }

    return cardPower
}

const getHands = () => {
    let deck = createDeck()
    let hands = []
    let cards = []
    let indexes = []
    while (indexes.length < ((numberOfPlayers * 3) + 1)) {
        let randomIndex = Math.floor(Math.random() * 40)
        if (indexes.includes(randomIndex)) {
            continue
        }

        if (cards.length == 3){
            hands.push(cards)
            cards = []
        }

        cards.push(deck[randomIndex])

        indexes.push(randomIndex)
    }
    
    return hands
}

const createPlayers = () => {
    players = []
    let hands = getHands()
    while (players.length < numberOfPlayers)
    {
        players.push({
            name: `Player${players.length + 1}`,
            isStarter: null,
            hand: hands[players.length],
            points: 0,
            team: (players.length % 2) == 0 ? teams[0] : teams[1]
        })
   }
}

const handleUserInput = (userInput) => {
    let randomIndex = Math.floor(Math.random() * 40)
    switch (userInput){
        case '1':
            return getHands()
        case '2':
            return createDeck()
        case '3':
            return createPlayers()
        default: 
            return createDeck()[randomIndex]       
    }
}

function runApplication () {
    let isValidInput = false
    let validInputs = ['1', '2', '3', '4']
    while (!isValidInput){
        let userInput = prompt('Hola! Soy una aplicación en progreso.\n\nIngrese el número de la opción por favor:\n\n1) Obtener cartas/manos de dos jugadores\n2) Obtener el mazo\n3) Obtener los jugadores\n4) Obtener una carta aleatoria')
        if (validInputs.includes(userInput)){
            console.log(handleUserInput(userInput))
            let userNewOperation = confirm('Desea realizar otra operación')
            if (!userNewOperation){
                isValidInput = true
            }
        } else {
            alert('Por favor seleccione una opción válida.')
        }
    }
    
}

runApplication()
