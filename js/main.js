const cardTypes = ['basto', 'espada', 'copa', 'oro']
const numberOfPlayers = 2
const teams = [ 1, 2 ]
const envidoButtonNames = ["Envido", "Real", "Falta" ]
const trucoButtonNames = ["Truco", "Re-Truco", "Vale-4"]
let players = []

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
                envidoValue: i < 10 ? i : 0,
                dropped: false,
                boardSlot: -1
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
            hand: hands[players.length],
            points: 0,
            team: (players.length % 2) == 0 ? teams[0] : teams[1]
        })
   }
}

function calculateEnvidoPoints () {
    let playerCards = []
    let machineCards = []
    let envidoState = localStorage.getItem("envidoState")
    let starter = localStorage.getItem("starter")
    
    for(cardType of cardTypes) {
        let playerCommonTypeCards = players[0].hand.filter((card) => card.type == cardType)
        let machineCommonTypeCards = players[1].hand.filter((card) => card.type == cardType)
        
        if (playerCommonTypeCards && playerCommonTypeCards.length > playerCards.length) {
            playerCards = playerCommonTypeCards.sort((a, b) => b.envidoValue - a.envidoValue)
        }
        if (machineCommonTypeCards && machineCommonTypeCards.length > machineCards.length) {
            machineCards = machineCommonTypeCards.sort((a, b) => b.envidoValue - a.envidoValue)
        }
    }

    let totalPlayer = playerCards.length == 1 ? playerCards[0].envidoValue : playerCards[0].envidoValue + playerCards[1].envidoValue + 20
    let totalMachine = machineCards.length == 1 ? machineCards[0].envidoValue : machineCards[0].envidoValue + machineCards[1].envidoValue + 20

    if (totalPlayer > totalMachine) {
        players[0].points = envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
    } else if (totalPlayer == totalMachine) {
        if (starter == "0") {
            players[0].points = envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
        } else {
            players[1].points = envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
        }
    } else {
        players[1].points = envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
    }
}

function playMachineEnvido () {
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
    let envidoState = localStorage.getItem("envidoState")
    if (isEnvidoEnabled == "false") {
        renderMachineMessage("Envido!")
        localStorage.setItem("isEnvidoEnabled", true)
        localStorage.setItem("envidoState", 1)
        clearButtons()
        renderActionButtons(["Real", "Falta"])
        renderConfirmationButtons()
    } else {
        handleEnvidoChoice(envidoState)
    }
}

function handleEnvidoChoice(envidoState) {
    let choice = Math.floor(Math.random() * 5)
    let eState = parseInt(envidoState)
    
    if (choice == 0 && eState >= 1) {
        renderMachineMessage("Quiero!")
        clearButtons()
        localStorage.setItem("isEnvidoEnabled", false)
        renderActionButtons(["Truco", "Mazo"])
        calculateEnvidoPoints()
    } else if (choice == 1 && eState <= 1) {
        renderMachineMessage("Real envido!")
        localStorage.setItem("envidoState", 2)
        clearButtons()
        renderActionButtons(["Falta"])
        renderConfirmationButtons()
    } else if (choice == 2 && eState <= 2) {
        renderMachineMessage("Falta envido!")
        localStorage.setItem("envidoState", 3)
        clearButtons()
        renderConfirmationButtons()
    } else if (choice == 3) {
        renderMachineMessage("No quiero!")
        if (eState == 1) {
            players[0].points += 1
        } else {
            calculateEnvidoPoints()
        }
        localStorage.setItem("isEnvidoEnabled", false)
        clearButtons()
    } else {
        handleEnvidoChoice(envidoState)
    }
}

function dropMachineCard() {
    let validChoice = false
    while (!validChoice) {
        let randomChoice = Math.floor(Math.random() * 3)
        let card = players[1].hand[randomChoice]
        if (card.dropped){
            continue
        }

        let shouldDrop = shouldDropCard()
        if (!shouldDrop) {
            break
        }

        players[1].hand[randomChoice].dropped = true
        players[1].hand[randomChoice].boardSlot = players[1].hand.filter(card => card.dropped).length
        renderCardInSlot("machine", players[1].hand[randomChoice].boardSlot, card)
        validChoice = true
    }
}

function getValidMachineDecision(isEnvidoEnabled, envidoState, isTrucoEnabled, trucoState) {
    let validChoice = false
    let decision = ""
    let eState = parseInt(envidoState)

    while (!validChoice) {
        let randomChoice = Math.floor(Math.random() * 2)
        if (randomChoice == 0) {
            if (isEnvidoEnabled == "true" || isTrucoEnabled == "true") {
                continue
            }

            decision = "dropCard"
            validChoice = true
        } else if (randomChoice == 1) {
            if ((isEnvidoEnabled == "false" && eState == 0) || (isEnvidoEnabled == "true" && eState > 0)) {
                decision = "playEnvido"
                validChoice = true
            }
        }
        // else { 
        //     TODO implement truco function
        //     decision = "playTruco"
        //     validChoice = true
        // }
    }

    return decision
}

function getMachineDecision() {
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
    let envidoState = localStorage.getItem("envidoState")
    let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
    let trucoState = localStorage.getItem("trucoState")

    let decision = getValidMachineDecision(isEnvidoEnabled, envidoState, isTrucoEnabled, trucoState)
    if (decision === "dropCard") {
        dropMachineCard()
    } else if (decision === "playEnvido") {
        playMachineEnvido()
    } 
    // else if (decision === "playTruco") {
    //     playMachineTruco()
    // }

    return decision
}

function startMachinePlay() {
    setTimeout(() => {
        getMachineDecision()   
    }, 1000)

    setTimeout(() => {
        shouldMachinePlayAgain()   
    }, 1200)
}

function shouldMachinePlayAgain() {
    let starter = parseInt(localStorage.getItem("starter"))
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")

    if (isEnvidoEnabled == "true"){
        return
    }

    let mDroppedCards = players[1].hand.filter(card => card.dropped)
    let pDroppedCards = players[0].hand.filter(card => card.dropped)
    if (mDroppedCards.length < pDroppedCards.length){
        startMachinePlay()
    } 
    
    if (mDroppedCards.length == pDroppedCards.length && pDroppedCards.length > 0) {
        let mLastPlayedCard = players[1].hand.filter(card => card.boardSlot == mDroppedCards.length)
        let pLastPlayedCard = players[0].hand.filter(card => card.boardSlot == pDroppedCards.length)
        if (mLastPlayedCard[0].power > pLastPlayedCard[0].power || (mLastPlayedCard[0].power == pLastPlayedCard[0].power && starter == 1)) {
            startMachinePlay()
        }
    }
}

function shouldDropCard() {
    let starter = parseInt(localStorage.getItem("starter"))
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
    if (isEnvidoEnabled == "true"){
        return false
    }
    
    let mDroppedCards = players[1].hand.filter(card => card.dropped)
    let pDroppedCards = players[0].hand.filter(card => card.dropped)
    if (mDroppedCards.length < pDroppedCards.length){
        return true
    } 

    if (mDroppedCards.length == 0 && pDroppedCards.length == 0) {
        return true
    }
    
    if (mDroppedCards.length == pDroppedCards.length && pDroppedCards.length > 0) {
        let mLastPlayedCard = players[1].hand.filter(card => card.boardSlot == mDroppedCards.length)
        let pLastPlayedCard = players[0].hand.filter(card => card.boardSlot == pDroppedCards.length)
        if (mLastPlayedCard[0].power > pLastPlayedCard[0].power || (mLastPlayedCard[0].power == pLastPlayedCard[0].power && starter == 1)) {
            return true
        }
    }

    return false
}

const startTurn = () => {
    createPlayers()
    clearButtons()
    localStorage.setItem("envidoState", 0)
    localStorage.setItem("trucoState", 0)
    localStorage.setItem("isEnvidoEnabled", false)
    localStorage.setItem("isTrucoEnabled", false)
    let starter = localStorage.getItem("starter")
    
    if (starter == "0") {
        renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
        renderPlayerCards()
    } else {
        renderPlayerCards()
        renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
        startMachinePlay()
    }
}

const endTurn = () => {
    let playerStoragePoints = localStorage.getItem("playerPoints")
    let machineStoragePoints = localStorage.getItem("machinePoints")
    if (playerStoragePoints) {
        localStorage.setItem("playerPoints", parseInt(playerStoragePoints) + players[0].points)
    } else {
        localStorage.setItem("playerPoints", players[0].points)
    }

    if (machineStoragePoints) {
        localStorage.setItem("machinePoints", parseInt(machineStoragePoints) + players[1].points)
    } else {
        localStorage.setItem("machinePoints", players[1].points)
    }

    let starter = localStorage.getItem("starter")
    localStorage.setItem("starter", starter == "0" ? 1 : 0)
}

// *********************** RENDERING:

//-- card slots --

let ownBoardContainer = document.getElementById("own-board")
let machineBoardContainer = document.getElementById("machine-board")  

function renderCardSlots (element, owner) {
    for (let i = 0; i < 3; i++) {
        element.innerHTML += `<div id=${owner}-slot-${i + 1} class="card-slot"></div>`
    }
}

renderCardSlots(ownBoardContainer, "own")
renderCardSlots(machineBoardContainer, "machine")

function clearCardSlots() {
    for (let i = 0; i < 3; i++) {
        ['own', 'machine'].forEach(owner => {
            let slot = document.getElementById(`${owner}-slot-${i + 1}`)
            slot.innerHTML = ''
        })
    }
}

//-- buttons --

let buttonsContainer = document.getElementById("buttons")

function renderActionButtons (buttonNames) { // ["Falta", "Real", "Envido", "Truco", "Re-Truco", "Vale-4", "Mazo"]
    buttonNames.forEach(name => {
        let classSuffix = name.includes("Mazo") ? "danger" : "success"
        buttonsContainer.innerHTML += `<button id=${name.toLowerCase()}-button class="btn btn-${classSuffix}">${name}</button>`
        createEventListener(`${name.toLowerCase()}-button`)
    })
}

function renderConfirmationButtons () {
    const buttonNames = ["Quiero", "No quiero"]
    buttonNames.forEach(name => {
        let classSuffix = name.includes("No") ? "danger" : "success"
        buttonsContainer.innerHTML += `<button id=${classSuffix}-button class="btn btn-${classSuffix}">${name}</button>`
        createEventListener(`${classSuffix}-button`)
    })
}

function clearButtons() {
    buttonsContainer.innerHTML = ''
}

//-- cards --

function renderPlayerCards () {
    let handDiv = document.getElementById("hand")
    let cards = players[0].hand.map((c, i) => {
        let card = `<div id=card-${i + 1} class="card-${i + 1}"></div>`
        return card
    })

    handDiv.innerHTML = cards

    cards.forEach((c, i) => {
        let card = document.getElementById(`card-${i + 1}`)
        let cardImageName = players[0].hand[i].imageName
        card.style.backgroundImage = `url(../images/cards/${cardImageName})`
        createEventListener(`card-${i + 1}`)
    })
}

function renderCardInSlot(owner, slotNumber, card) {
    let slot = document.getElementById(`${owner}-slot-${slotNumber}`)
    let cardDiv = document.createElement("div")
    cardDiv.classList.add("card-in-slot")
    cardDiv.style.backgroundImage = `url(../images/cards/${card.imageName})`
    slot.appendChild(cardDiv)
}

function renderMachineMessage(message) {
    let machineBoard = document.getElementById("machine-board")
    let messageDiv = document.createElement("div")
    messageDiv.classList.add("message")
    messageDiv.innerText = message
    machineBoard.appendChild(messageDiv)
    setTimeout(() => {
        messageDiv.remove()    
    }, 3000)
}

// *********************** localStorage:

function setEnvidoLocalStorageValues(envidoState) {
    localStorage.setItem("isTrucoEnabled", false)
    localStorage.setItem("turcoState", 0)
    localStorage.setItem("isEnvidoEnabled", true)
    localStorage.setItem("envidoState", envidoState)
}


// *********************** EVENT HANDLING:

window.onload = () => {
    localStorage.clear()
    localStorage.setItem("starter", Math.floor(Math.random() * 2))
    startTurn()
}

function createEventListener(elementId) {
    let element = document.getElementById(elementId)
    if (elementId == "card-1") {
        element.addEventListener('click', (event) => {
            let card = players[0].hand[0]
            players[0].hand[0].dropped = true
            players[0].hand[0].boardSlot = players[0].hand.filter(card => card.dropped).length
            renderCardInSlot('own', players[0].hand[0].boardSlot, card)
            element.remove()
            clearButtons()
            startMachinePlay()
        })
    }

    if (elementId == "card-2") {
        element.addEventListener('click', (event) => {
            let card = players[0].hand[1]
            players[0].hand[1].dropped = true
            players[0].hand[1].boardSlot = players[0].hand.filter(card => card.dropped).length
            renderCardInSlot('own', players[0].hand[1].boardSlot, card)
            element.remove()
            clearButtons()
            startMachinePlay()
        })
    }

    if (elementId == "card-3") {
        element.addEventListener('click', (event) => {
            let card = players[0].hand[2]
            players[0].hand[2].dropped = true
            players[0].hand[2].boardSlot = players[0].hand.filter(card => card.dropped).length
            renderCardInSlot('own', players[0].hand[2].boardSlot, card)
            element.remove()
            clearButtons()
            startMachinePlay()
        })
    }

    if (elementId == "envido-button") {
        element.addEventListener('click', (event) => {
            setEnvidoLocalStorageValues(1)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "real-button") {
        element.addEventListener('click', (event) => {
            setEnvidoLocalStorageValues(2)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "falta-button") {
        element.addEventListener('click', (event) => {
            setEnvidoLocalStorageValues(3)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "success-button") {
        element.addEventListener('click', (event) => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            
            if (isEnvidoEnabled == "true") {
                calculateEnvidoPoints()
                localStorage.setItem("isEnvidoEnabled", false)
                clearButtons()
                startMachinePlay()
            }

            if (isTrucoEnabled == "true") {

            }
        })
    }

    if (elementId == "danger-button") {
        element.addEventListener('click', (event) => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            let envidoState = localStorage.getItem("envidoState")
            let trucoState = localStorage.getItem("trucoState")

            if (isEnvidoEnabled == "true") {
                if (envidoState == "1") {
                    players[1].points += 1
                } else {
                    calculateEnvidoPoints()
                }
                localStorage.setItem("isEnvidoEnabled", false)
                clearButtons()
                startMachinePlay()
            }

            if (isTrucoEnabled == "true") {

            }
        })
    }

    if (elementId == "mazo-button") {
        element.addEventListener('click', (event) => {
            players[1].points += 1
            clearButtons()
            clearCardSlots()
            endTurn()
            startTurn()
        })
    }
}