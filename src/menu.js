const readline = require('readline');
const character = require('./characters');

const gameMode = {
    DUEL: 1,
    RACE: 2,
}

// Create an interface for input and output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let gameSettings = {
    character: null,
    gameMode: null,
};

async function showMenu() {
    await showMenuRaceMode();
    await showMenuPickCharacter();
    
    return gameSettings;
}

async function showMenuRaceMode() {
    console.log('Escolha um modo de jogo:');
    console.log('1. Duelo');
    console.log('2. Corrida');
    console.log('3. Exit');

    const choice = await new Promise((resolve) => {
        rl.question('Por favor escolha uma opção (1-3): ', (choice) => {
            resolve(choice);
        });
    });

    handleMenuChoiceRaceMode(choice);
}

async function showMenuPickCharacter() {
    console.log('Escolha um jogador:');
    console.log('1. Mario');
    console.log('2. Luigi');
    console.log('3. Peach');
    console.log('4. Yoshi');
    console.log('5. Bowser');
    console.log('6. Donkey Kong');
    console.log('7. Exit');
    
    const choice = await new Promise((resolve) => {
        rl.question('Por favor escolha uma opção (1-7): ', (choice) => {
            resolve(choice);
        });
    });
    
    handleMenuPickCharacter(choice);
}

// Function to handle the user's choice
function handleMenuChoiceRaceMode(choice) {
    switch (choice) {
        case '1':
            console.log('Modo escolhido: Duelo');
            gameSettings.gameMode = gameMode.DUEL;
            break;
        case '2':
            console.log('Modo escolhido: Corrida');
            gameSettings.gameMode = gameMode.RACE;
            break;
        case '3':
            console.log('Saindo...');
            rl.close();  // Close the readline interface
            return;
        default:
            console.log('Opção inválida.');
    }
}

function handleMenuPickCharacter(choice) {
    switch (choice) {
        case '1':
            console.log('Personagem escolhido: Mario');
            gameSettings.character = character.mario;
            break;
        case '2':
            console.log('Personagem escolhido: Luigi');
            gameSettings.character = character.luigi;
            break;
        case '3':
            console.log('Personagem escolhido: Peach');
            gameSettings.character = character.peach;
            break;
        case '4':
            console.log('Personagem escolhido: Yoshi');
            gameSettings.character = character.yoshi;
            break;
        case '5':
            console.log('Personagem escolhido: Bowser');
            gameSettings.character = character.bowser;
            break;
        case '6':
            console.log('Personagem escolhido: Donkey Kong');
            gameSettings.character = character.donkeyKong;
            break;
        case '7':
            console.log('Saindo...');
            rl.close();  // Close the readline interface
            return;
        default:
            console.log('Opção inválida.');
    }
}

module.exports = {
    showMenu, gameMode
};