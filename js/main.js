const cardTypes = ['basto', 'espada', 'copa', 'oro']
const numberOfPlayers = 2
const teams = [ 1, 2 ]
const envidoButtonNames = ["Envido", "Real", "Falta" ]
const trucoButtonNames = ["Truco", "ReTruco", "Vale4"]
const confirmationButtonNames = ["success", "danger"]
let previousEnvidoState = 0
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
            team: (players.length % 2) == 0 ? teams[0] : teams[1],
            playedTruco: false
        })
   }
}

function calculatePointsForTurnEnd() {
    let trucoState = parseInt(localStorage.getItem("trucoState"))
    let starter = localStorage.getItem("starter")
    let machineHand = players[1].hand || []
    let ownHand = players[0].hand || []

    let ownRounds = 0
    let machineRounds = 0

    let roundResults = []

    for (let i = 0; i < 3; i++) {
        let ownPlayedCard = ownHand.find(card => card.boardSlot === i + 1)
        let machinePlayedCard = machineHand.find(card => card.boardSlot === i + 1)

        if (ownPlayedCard && machinePlayedCard) {
            if (ownPlayedCard.power > machinePlayedCard.power) {
                ownRounds++
                roundResults[i] = "own"
            } else if (ownPlayedCard.power < machinePlayedCard.power) {
                machineRounds++
                roundResults[i] = "machine"
            } else {
                if (starter == "0") {
                    ownRounds++
                    roundResults[i] = "own"
                } else {
                    machineRounds++
                    roundResults[i] = "machine"
                }
            }
        }
    }

    if (roundResults.length >= 2) {
        if (roundResults[0] === roundResults[1]) {
            if (trucoState == 0) {
                players[0].points += roundResults[0] == "own" ? 1 : 0
                players[1].points += roundResults[0] == "machine" ? 1 : 0
            }
            return true
        } else if (roundResults[1] === "own" && roundResults[2] === "own") {
            players[0].points += trucoState == 3 ? 4 : trucoState == 2 ? 3 : trucoState == 1 ? 2 : 1
            return true
        } else if (roundResults[1] === "machine" && roundResults[2] === "machine") {
            players[1].points += trucoState == 3 ? 4 : trucoState == 2 ? 3 : trucoState == 1 ? 2 : 1
            return true
        }
    }

    return false
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
        players[0].points += envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
    } else if (totalPlayer == totalMachine) {
        if (starter == "0") {
            players[0].points += envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
        } else {
            players[1].points += envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
        }
    } else {
        players[1].points += envidoState == "1" ? 2 : envidoState == "2" ? 3 : 15
    }

    return totalMachine
}

function playMachineEnvido () {
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
    let envidoState = parseInt(localStorage.getItem("envidoState"))
    previousEnvidoState = envidoState

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
    
    if (choice == 0 && envidoState >= 1) {
        renderMachineMessage("Quiero!")
        clearButtons()
        localStorage.setItem("isEnvidoEnabled", false)
        renderActionButtons(["Truco", "Mazo"])
        let machinePoints = calculateEnvidoPoints()
        renderMachineMessage(machinePoints < 20 ? "Mesa" : machinePoints)
    } else if (choice == 1 && envidoState <= 1) {
        renderMachineMessage("Real envido!")
        localStorage.setItem("envidoState", 2)
        clearButtons()
        renderActionButtons(["Falta"])
        renderConfirmationButtons()
    } else if (choice == 2 && envidoState <= 2) {
        renderMachineMessage("Falta envido!")
        localStorage.setItem("envidoState", 3)
        clearButtons()
        renderConfirmationButtons()
    } else if (choice == 3) {
        renderMachineMessage("No quiero!")
        if (envidoState == 1 || previousEnvidoState == 0) {
            players[0].points += 1
        } else {
            players[0].points += previousEnvidoState > 0 ? 1 : 0
            calculateEnvidoPoints()
        }
        localStorage.setItem("isEnvidoEnabled", false)
        clearButtons()
        renderActionButtons(["Truco", "Mazo"])
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
        renderButtonsAfterMachineDropCard()
    } else if (decision === "playEnvido") {
        playMachineEnvido()
    } 
    // else if (decision === "playTruco") {
    //     playMachineTruco()
    // }

    return decision
}

function shouldTurnEnd() {
    let starter = localStorage.getItem("starter")
    let machineHand = players[1].hand || []
    let ownHand = players[0].hand || []

    let ownRounds = 0
    let machineRounds = 0

    let roundResults = []

    for (let i = 0; i < 3; i++) {
        let ownPlayedCard = ownHand.find(card => card.boardSlot === i + 1)
        let machinePlayedCard = machineHand.find(card => card.boardSlot === i + 1)

        if (ownPlayedCard && machinePlayedCard) {
            if (ownPlayedCard.power > machinePlayedCard.power) {
                ownRounds++
                roundResults[i] = "own"
            } else if (ownPlayedCard.power < machinePlayedCard.power) {
                machineRounds++
                roundResults[i] = "machine"
            } else {
                if (starter == "0") {
                    ownRounds++
                    roundResults[i] = "own"
                } else {
                    machineRounds++
                    roundResults[i] = "machine"
                }
            }
        }
    }

    if (roundResults.length >= 2) {
        if (roundResults[0] === roundResults[1]) {
            return true
        } else if (roundResults[1] === "own" && roundResults[2] === "own") {
            return true
        } else if (roundResults[1] === "machine" && roundResults[2] === "machine") {
            return true
        }
    }

    return ownRounds >= 2 || machineRounds >= 2
}

function startMachinePlay() {
    setTimeout(() => {
        getMachineDecision()
    }, 1000)

    setTimeout(() => {
        shouldMachinePlayAgain()   
    }, 1200)

    setTimeout(() => {
        if (shouldTurnEnd()){
            endTurn()
            startTurn()
        }
    }, 1300)
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
    previousEnvidoState = 0
    createPlayers()
    clearCardSlots()
    clearButtons()
    localStorage.setItem("envidoState", 0)
    localStorage.setItem("trucoState", 0)
    localStorage.setItem("isEnvidoEnabled", false)
    localStorage.setItem("isTrucoEnabled", false)
    let starter = localStorage.getItem("starter")
    
    if (starter == "0") {
        renderMachineMessage("Empezas vos")
        renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
        renderPlayerCards()
    } else {
        renderPlayerCards()
        renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
        startMachinePlay()
    }
}

const endTurn = () => {
    calculatePointsForTurnEnd()
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
    renderPoints()
}

// *********************** RENDERING:

//-- points --

function renderPoints() {
    const machinePointsDiv = document.getElementById("machine-points")
    const ownPointsDiv = document.getElementById("own-points")

    ownPointsDiv.innerText = localStorage.getItem("playerPoints")
    machinePointsDiv.innerText = localStorage.getItem("machinePoints")
}

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

const buttonsContainer = document.getElementById("buttons")
const envidoButton = document.getElementById("envido-button")
const realButton = document.getElementById("real-button")
const faltaButton = document.getElementById("falta-button")
const trucoButton = document.getElementById("truco-button")
const vale4Button = document.getElementById("vale4-button")
const retrucoButton = document.getElementById("retruco-button")
const successButton = document.getElementById("success-button")
const mazoButton = document.getElementById("mazo-button")
const dangerButton = document.getElementById("danger-button")

function getButtonById(buttonId) {
    switch(buttonId) {
        case "envido-button":
            return envidoButton
        case "real-button":
            return realButton
        case "falta-button":
            return faltaButton
        case "truco-button":
            return trucoButton
        case "retruco-button":
            return retrucoButton
        case "vale4-button":
            return vale4Button
        case "mazo-button":
            return mazoButton
        case "danger-button":
            return dangerButton
        case "success-button":
            return successButton
        default:
            break
    } 
}

function renderActionButtons (buttonNames) { // ["Falta", "Real", "Envido", "Truco", "ReTruco", "Vale4", "Mazo"]
    buttonNames.forEach(name => {
        let element = getButtonById(`${name.toLowerCase()}-button`)
        let classSuffix = name.includes("Mazo") ? "danger" : "success"
        element.classList.remove("button-hidden")
        element.classList.add("btn")
        element.classList.add(`btn-${classSuffix}`)
        element.innerText = name
    })
}

function renderConfirmationButtons () {
    const buttonNames = ["Quiero", "No quiero"]
    buttonNames.forEach(name => {
        let classSuffix = name.includes("No") ? "danger" : "success"
        let element = getButtonById(`${classSuffix}-button`)
        element.classList.remove("button-hidden")
        element.classList.add("btn")
        element.classList.add(`btn-${classSuffix}`)
        element.innerText = name
    })
}

function clearButtons() {
    envidoButtonNames.forEach(name => {
        const element = getButtonById(`${name.toLowerCase()}-button`)
        element.classList.remove("btn")
        element.classList.remove("btn-success")
        element.classList.add("button-hidden")
    })

    trucoButtonNames.forEach(name => {
        const element = getButtonById(`${name.toLowerCase()}-button`)
        element.classList.remove("btn")
        element.classList.remove("btn-success")
        element.classList.add("button-hidden")
    })

    confirmationButtonNames.forEach(name => {
        const element = getButtonById(`${name.toLowerCase()}-button`)
        element.classList.remove("btn")
        element.classList.remove(`btn-${name.toLowerCase()}`)
        element.classList.add("button-hidden")
    })

    mazoButton.classList.remove("btn")
    mazoButton.classList.remove("btn-danger")
    mazoButton.classList.add("button-hidden")
}

function renderButtonsAfterMachineDropCard() {
    let eState = parseInt(localStorage.getItem("envidoState"))
    let trucoState = parseInt(localStorage.getItem("trucoState"))
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
    let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")

    if (eState == 0 && trucoState == 0){
        renderActionButtons(["Truco", "Mazo"])
        renderActionButtons(envidoButtonNames)
    }
    if (eState >= 1 && isEnvidoEnabled == "false" && trucoState == 0) {
        renderActionButtons(["Truco", "Mazo"])
    }
    if (players[0].playedTruco == "true" && trucoState == 2){
        renderActionButtons(["Vale4", "Mazo"])
    }
    if (players[0].playedTruco == "false" && trucoState == 1){
        renderActionButtons(["ReTruco", "Mazo"])
    }
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
    addButtonsEventListeners()
    startTurn()
}

function addButtonsEventListeners() {
    envidoButtonNames.forEach(name => {
        createEventListener(`${name.toLowerCase()}-button`)
    })

    trucoButtonNames.forEach(name => {
        createEventListener(`${name.toLowerCase()}-button`)
    })

    confirmationButtonNames.forEach(name => {
        createEventListener(`${name.toLowerCase()}-button`)
    })

    createEventListener(`mazo-button`)
}

function createEventListener(elementId) {
    let element = document.getElementById(elementId)
    if (elementId == "card-1") {
        element.addEventListener('click', () => {
            if (isOwnDropCardEnabled()) {
                let card = players[0].hand[0]
                players[0].hand[0].dropped = true
                players[0].hand[0].boardSlot = players[0].hand.filter(card => card.dropped).length
                renderCardInSlot('own', players[0].hand[0].boardSlot, card)
                element.remove()
                clearButtons()
                if (players[1].hand.every(card => card.dropped)){
                    endTurn()
                    startTurn()
                } else {
                    startMachinePlay()
                }
            }
        })
    }

    if (elementId == "card-2") {
        let element = document.getElementById(elementId)
        element.addEventListener('click', () => {
            if (isOwnDropCardEnabled()) {
                let card = players[0].hand[1]
                players[0].hand[1].dropped = true
                players[0].hand[1].boardSlot = players[0].hand.filter(card => card.dropped).length
                renderCardInSlot('own', players[0].hand[1].boardSlot, card)
                element.remove()
                clearButtons()
                if (players[1].hand.every(card => card.dropped)){
                    endTurn()
                    startTurn()
                } else {
                    startMachinePlay()
                }
            }
        })
    }

    if (elementId == "card-3") {
        let element = document.getElementById(elementId)
        element.addEventListener('click', () => {
            if (isOwnDropCardEnabled()) {
                let card = players[0].hand[2]
                players[0].hand[2].dropped = true
                players[0].hand[2].boardSlot = players[0].hand.filter(card => card.dropped).length
                renderCardInSlot('own', players[0].hand[2].boardSlot, card)
                element.remove()
                clearButtons()
                if (players[1].hand.every(card => card.dropped)){
                    endTurn()
                    startTurn()
                } else {
                    startMachinePlay()
                }
            }
        })
    }

    if (elementId == "envido-button") {
        envidoButton.addEventListener('click', () => {
            setEnvidoLocalStorageValues(1)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "real-button") {
        realButton.addEventListener('click', () => {
            setEnvidoLocalStorageValues(2)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "falta-button") {
        faltaButton.addEventListener('click', () => {
            setEnvidoLocalStorageValues(3)
            clearButtons()
            playMachineEnvido()
        })
    }

    if (elementId == "success-button") {
        successButton.addEventListener('click', () => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            
            if (isEnvidoEnabled == "true") {
                let machinePoints = calculateEnvidoPoints()
                renderMachineMessage(machinePoints < 20 ? "Mesa" : machinePoints)
                localStorage.setItem("isEnvidoEnabled", false)
                clearButtons()
                startMachinePlay()
            }

            if (isTrucoEnabled == "true") {

            }
        })
    }

    if (elementId == "danger-button") {
        dangerButton.addEventListener('click', () => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            let envidoState = parseInt(localStorage.getItem("envidoState"))
            let trucoState = localStorage.getItem("trucoState")

            if (isEnvidoEnabled == "true") {
                if (envidoState >= 1 && previousEnvidoState == 0) {
                    players[1].points += 1
                } else {
                    localStorage.setItem("envidoState", previousEnvidoState)
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
        mazoButton.addEventListener('click', () => {
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            players[1].points += isTrucoEnabled == "true" ? 0 : 1
            endTurn()
            startTurn()
        })
    }
}

function isOwnDropCardEnabled() {
    let starter = localStorage.getItem("starter")
    let machineHand = players[1].hand || []
    let ownHand = players[0].hand || []

    let machineDroppedCardCount = machineHand.filter(card => card.dropped).length
    let ownDroppedCardCount = ownHand.filter(card => card.dropped).length

    let ownLastPlayedCard = ownHand.find(card => card.boardSlot === ownDroppedCardCount)
    let machineLastPlayedCard = machineHand.find(card => card.boardSlot === machineDroppedCardCount)

    let ownLastPlayedCardPower = ownLastPlayedCard ? ownLastPlayedCard.power : -1
    let machineLastPlayedCardPower = machineLastPlayedCard ? machineLastPlayedCard.power : -1

    if ((starter === "0" && !ownHand.some(card => card.dropped)) || 
        (ownDroppedCardCount < machineDroppedCardCount) ||
        (starter == "0" && ownDroppedCardCount == machineDroppedCardCount && ownLastPlayedCardPower == machineLastPlayedCardPower) ||
        (ownDroppedCardCount > 0 && ownDroppedCardCount === machineDroppedCardCount && ownLastPlayedCardPower > machineLastPlayedCardPower)) {
        return true
    }

    return false
}