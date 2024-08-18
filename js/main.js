const cardTypes = ['basto', 'espada', 'copa', 'oro']
const numberOfPlayers = 2
const teams = [ 1, 2 ]
const envidoButtonNames = ["Envido", "Real", "Falta" ]
const trucoButtonNames = ["Truco", "ReTruco", "Vale4"]
const confirmationButtonNames = ["success", "danger"]
let previousEnvidoState = 0
let trucoStates = [0, 0]
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
    let starter = localStorage.getItem("starter")
    let machineHand = players[1].hand || []
    let ownHand = players[0].hand || []

    let roundResults = []

    for (let i = 0; i < 3; i++) {
        let ownPlayedCard = ownHand.find(card => card.boardSlot === i + 1)
        let machinePlayedCard = machineHand.find(card => card.boardSlot === i + 1)

        if (ownPlayedCard && machinePlayedCard) {
            if (ownPlayedCard.power > machinePlayedCard.power) {
                roundResults[i] = "own"
            } else if (ownPlayedCard.power < machinePlayedCard.power) {
                roundResults[i] = "machine"
            } else {
                if (starter == "0") {
                    roundResults[i] = "own"
                } else {
                    roundResults[i] = "machine"
                }
            }
        }
    }

    calculateTrucoPoints(roundResults, trucoStates)
}

function calculateTrucoPoints(roundResults, trucoStates) {
    if (roundResults.length >= 2) {
        if (roundResults[0] === roundResults[1]) {
            if (trucoStates[0] == 0) {
                players[0].points += roundResults[0] == "own" ? 1 : 0
                players[1].points += roundResults[0] == "machine" ? 1 : 0
            } else if (trucoStates[0] == 1) {
                players[0].points += roundResults[0] == "own" && trucoStates[1] == 0 ? 1 : roundResults[0] == "own" && trucoStates[1] == 1 ? 2 : 0
                players[1].points += roundResults[0] == "machine" && trucoStates[1] == 0 ? 1 : roundResults[0] == "machine" && trucoStates[1] == 1 ? 2 : 0
            } else if (trucoStates[0] == 2) {
                players[0].points += roundResults[0] == "own" && trucoStates[1] == 0 ? 2 : roundResults[0] == "own" && trucoStates[1] == 1 ? 3 : 0
                players[1].points += roundResults[0] == "machine" && trucoStates[1] == 0 ? 2 : roundResults[0] == "machine" && trucoStates[1] == 1 ? 3 : 0
            } else if (trucoStates[0] == 3) {
                players[0].points += roundResults[0] == "own" && trucoStates[1] == 0 ? 3 : roundResults[0] == "own" && trucoStates[1] == 1 ? 4 : 0
                players[1].points += roundResults[0] == "machine" && trucoStates[1] == 0 ? 3 : roundResults[0] == "machine" && trucoStates[1] == 1 ? 4 : 0
            }
            return
        } else if (roundResults.filter((result) => result == "own").length >= 2) {
            if (trucoStates[0] == 0) {
                players[0].points += 1
            } else if (trucoStates[0] == 1) {
                players[0].points += trucoStates[1] == 0 ? 1 : 2
            } else if (trucoStates[0] == 2) {
                players[0].points += trucoStates[1] == 0 ? 2 : 3
            } else if (trucoStates[0] == 3) {
                players[0].points += trucoStates[1] == 0 ? 3 : 4
            }
            return
        } else if (roundResults.filter((result) => result == "machine").length >= 2) {
            if (trucoStates[0] == 0) {
                players[1].points += 1
            } else if (trucoStates[0] == 1) {
                players[1].points += trucoStates[1] == 0 ? 1 : 2
            } else if (trucoStates[0] == 2) {
                players[1].points += trucoStates[1] == 0 ? 2 : 3
            } else if (trucoStates[0] == 3) {
                players[1].points += trucoStates[1] == 0 ? 3 : 4
            }
        }
    }
    return
}

function playMachineTruco() {
    let tState = parseInt(localStorage.getItem("trucoState"))
    let eState = parseInt(localStorage.getItem("envidoState"))
    let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")

    if (isTrucoEnabled == "false") {
        players[1].playedTruco = true
        trucoStates = [1, 0]
        renderMachineMessage("Truco!")
        localStorage.setItem("isTrucoEnabled", true)
        localStorage.setItem("trucoState", 1)
        clearButtons()
        if (isFirstRoundOver() || eState >= 1){
            renderActionButtons(["ReTruco"])
        } else {
            renderActionButtons(["ReTruco", "Envido"])
        }
        
        renderConfirmationButtons()
    } else {
        handleTrucoChoice(tState)
    }
}

function handleTrucoChoice(tState) {
    let trucoHandled = false
    let machinePlayedTruco = players[1].playedTruco
    let choices = []

    while (trucoHandled == false) {
        let randomChoice = Math.floor(Math.random() * 3)
        choices.push(randomChoice)

        if (tState == 1) {
            if (randomChoice == 0 && !machinePlayedTruco) {
                renderMachineMessage("Quiero re truco!!!")
                localStorage.setItem("trucoState", 2)
                trucoStates = [2, 0]
                clearButtons()
                renderActionButtons(["Vale4"])
                renderConfirmationButtons()
                trucoHandled = true
            }
            if (randomChoice == 1 && !machinePlayedTruco) {
                renderMachineMessage("Quiero!")
                trucoStates = [1, 1]
                clearButtons()
                trucoHandled = true
            }
            if (randomChoice == 2 && !machinePlayedTruco) {
                renderMachineMessage("No quiero!")
                localStorage.setItem("trucoState", 0)
                clearButtons()
                endTurn()
                startTurn()
                trucoHandled = true
            }
        }
        if (tState == 2) {
            if (randomChoice == 0 && machinePlayedTruco) {
                renderMachineMessage("Quiero vale 4!!!")
                localStorage.setItem("trucoState", 3)
                trucoStates = [3, 0]
                clearButtons()
                renderConfirmationButtons()
                trucoHandled = true
            }
            if (randomChoice == 1 && machinePlayedTruco) {
                renderMachineMessage("No quiero!")
                localStorage.setItem("trucoState", 2)
                clearButtons()
                endTurn()
                startTurn()
                trucoHandled = true
            }
        }
        if (tState == 3) {
            if (randomChoice == 0 && !machinePlayedTruco) {
                renderMachineMessage("Quiero!!!")
                trucoStates = [3, 1]
                clearButtons()
                trucoHandled = true
            }
            if (randomChoice == 1 && !machinePlayedTruco) 
            {
                renderMachineMessage("No quiero!")
                localStorage.setItem("trucoState", 2)
                clearButtons()
                endTurn()
                startTurn()
                trucoHandled = true
            }
        }
        
        if (choices.includes(0) && choices.includes(1) && choices.includes(2)){
            trucoHandled = true
        }
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
        shouldMachinePlayAgain()
    }
}

function handleEnvidoChoice(envidoState) {
    let choice = Math.floor(Math.random() * 5)
    
    if (choice == 0 && envidoState >= 1) {
        clearButtons()
        localStorage.setItem("isEnvidoEnabled", false)
        renderActionButtons(["Truco", "Mazo"])
        let machinePoints = calculateEnvidoPoints()
        renderMachineMessage(machinePoints < 20 ? "Quiero, mesa" : `Quiero ${machinePoints}`)
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
            players[0].points += envidoState == 2 ? 2 : 3
        }
        localStorage.setItem("isEnvidoEnabled", false)
        clearButtons()
        renderActionButtons(["Truco", "Mazo"])
    } else {
        handleEnvidoChoice(envidoState)
    }
}

function isFirstRoundOver() {
    return players[0].hand.filter((card) => card.dropped == true).length >= 1 && players[1].hand.filter((card) => card.dropped == true).length >= 1
}

function machineHasTheQuiero(trucoState) {
    let playedTruco = players[1].playedTruco
    if (playedTruco == true && trucoState == 1) return false
    if (playedTruco == true && trucoState == 2) return true
    if (playedTruco == true && trucoState == 3) return false
    if (playedTruco == false && trucoState == 1) return true
    if (playedTruco == false && trucoState == 2) return false
    if (playedTruco == false && trucoState == 3) return true

    return false
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
    let tState = parseInt(trucoState)

    let choices = []
    while (!validChoice || !(choices.includes(1) && choices.includes(2) && choices.includes(0))) {
        let randomChoice = Math.floor(Math.random() * 3)
        choices.push(randomChoice)

        if (randomChoice == 0) {
            if (isEnvidoEnabled == "true") {
                continue
            }

            decision = "dropCard"
            validChoice = true
        } else if (randomChoice == 1 && !isFirstRoundOver()) {
            if (((isEnvidoEnabled == "false" && eState == 0) || (isEnvidoEnabled == "true" && eState > 0)) && tState == 0) {
                decision = "playEnvido"
                validChoice = true
            }
        } else if (isEnvidoEnabled == "false" || machineHasTheQuiero(tState)) {
            decision = "playTruco"
            validChoice = true
        }
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
    } else if (decision === "playTruco") {
        playMachineTruco()
    }
    
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
        } else if (roundResults.filter((result) => result == "own").length >= 2) {
            return true
        } else if (roundResults.filter((result) => result == "machine").length >= 2) {
            return true
        }
    }
    
    return ownRounds >= 2 || machineRounds >= 2
}

function startMachinePlay() {
    try {
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
    } catch (error) {
        Swal.fire({
            title: "Uhh se pudrió todo!",
            icon: "error",
            text: "Le pedimos disculpas ocurrió un error :(",
            confirmButtonText: "Reiniciar juego"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "../index.html"
            }
        })
    }
}

function shouldMachinePlayAgain() {
    let starter = parseInt(localStorage.getItem("starter"))
    let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")

    if (isEnvidoEnabled == "true"){
        return
    }

    if ((players[1].playedTruco == true && trucoStates[0] == 1 && trucoStates[1] == 0) || (players[1].playedTruco == true && trucoStates[0] == 3 && trucoStates[1] == 0)){
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
    } else if (mDroppedCards.length == pDroppedCards.length && pDroppedCards.length == 0 && starter == 1) {
        startMachinePlay()
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

function endGame() {
    let playerStoragePoints = parseInt(localStorage.getItem("playerPoints"))
    let machineStoragePoints = parseInt(localStorage.getItem("machinePoints"))
    
    Swal.fire({
        title: playerStoragePoints > machineStoragePoints ? "Felicidades ganaste!!!" : "Gana Gardel!!!",
        icon: playerStoragePoints > machineStoragePoints ? "success" : "error",
        showCancelButton: true,
        confirmButtonText: "Nuevo juego",
        cancelButtonText: "Salir",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem("starter", 0)
            localStorage.setItem("playerPoints", 0)
            localStorage.setItem("machinePoints", 0)
            clearPoints()
            startTurn()
        } else {
            window.location.href = "../index.html"
        }
    });
}

const startTurn = () => {
    previousEnvidoState = 0
    trucoStates = [0, 0]
    createPlayers()
    clearCardSlots()
    clearButtons()
    localStorage.setItem("envidoState", 0)
    localStorage.setItem("trucoState", 0)
    localStorage.setItem("isEnvidoEnabled", false)
    localStorage.setItem("isTrucoEnabled", false)
    let starter = localStorage.getItem("starter")
    let playerStoragePoints = localStorage.getItem("playerPoints")
    let machineStoragePoints = localStorage.getItem("machinePoints")

    if ((playerStoragePoints && parseInt(playerStoragePoints) >= 30) || (machineStoragePoints && parseInt(machineStoragePoints) >= 30)) {
        endGame()
    } else {
        if (starter == "0") {
            renderMachineMessage("Empezas vos")
            renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
            renderPlayerCards()
        } else {
            renderMachineMessage("Empiezo yo")
            renderPlayerCards()
            renderActionButtons(["Envido", "Real", "Falta", "Truco", "Mazo"])
            startMachinePlay()
        }
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

function clearPoints() {
    const machinePointsDiv = document.getElementById("machine-points")
    const ownPointsDiv = document.getElementById("own-points")

    ownPointsDiv.innerText = "0"
    machinePointsDiv.innerText = "0"
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

    if (eState == 0 && trucoState == 0){
        renderActionButtons(["Truco", "Mazo"])
        renderActionButtons(envidoButtonNames)
    }
    if (eState >= 1 && isEnvidoEnabled == "false" && trucoState == 0) {
        renderActionButtons(["Truco", "Mazo"])
    }
    if (players[0].playedTruco == true && trucoState == 2){
        renderActionButtons(["Vale4", "Mazo"])
    }
    if (players[0].playedTruco == false && trucoState == 1){
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
            trucoStates = [0, 0]
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

    if (elementId == "truco-button") {
        trucoButton.addEventListener('click', () => {
            localStorage.setItem("trucoState", 1)
            localStorage.setItem("isTrucoEnabled", true)
            players[0].playedTruco = true
            players[1].playedTruco = false
            trucoStates = [1, 0]
            clearButtons()
            playMachineTruco()
        })
    }

    if (elementId == "retruco-button") {
        retrucoButton.addEventListener('click', () => {
            localStorage.setItem("trucoState", 2)
            trucoStates = [2, 0]
            clearButtons()
            playMachineTruco()
        })
    }

    if (elementId == "vale4-button") {
        vale4Button.addEventListener('click', () => {
            localStorage.setItem("trucoState", 3)
            trucoStates = [3, 0]
            clearButtons()
            playMachineTruco()
        })
    }

    if (elementId == "success-button") {
        successButton.addEventListener('click', () => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            let tState = parseInt(localStorage.getItem("trucoState"))
            
            if (isEnvidoEnabled == "true") {
                let machinePoints = calculateEnvidoPoints()
                renderMachineMessage(machinePoints < 20 ? "Mesa" : machinePoints)
                localStorage.setItem("isEnvidoEnabled", false)
                clearButtons()
                startMachinePlay()
            }

            if (isTrucoEnabled == "true") {
                trucoStates = [tState, 1]
                clearButtons()
                dropMachineCard()
                renderButtonsAfterMachineDropCard()
                shouldMachinePlayAgain()
            }
        })
    }

    if (elementId == "danger-button") {
        dangerButton.addEventListener('click', () => {
            let isEnvidoEnabled = localStorage.getItem("isEnvidoEnabled")
            let isTrucoEnabled = localStorage.getItem("isTrucoEnabled")
            let envidoState = parseInt(localStorage.getItem("envidoState"))
            let trucoState = parseInt(localStorage.getItem("trucoState"))

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
                localStorage.setItem("trucoState", trucoState - 1)
                clearButtons()
                endTurn()
                startTurn()
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

    if (trucoStates[0] != 0 && trucoStates[1] == 0) {
        return false
    }

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