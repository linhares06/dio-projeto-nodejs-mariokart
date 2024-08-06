const characters = require('./characters');
const menu = require('./menu');

const NUMBER_OF_ROUNDS = 5;
const FIRST_POSITION_POINTS = 10;

const weaponBomb = {
    TEXT: "com uma bomba",
    MODIFIER: 2,
};

const weaponShell = {
    TEXT: "com um casco",
    MODIFIER: 1,
};

const blockType = {
    RETA: "RETA",
    CURVA: "CURVA",
    CONFRONTO: "CONFRONTO",
};

async function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
    let random = Math.random();

    switch (true) {
        case random < 0.33:
            return blockType.RETA;
        case random < 0.66:
            return blockType.CURVA;
        default:
            return blockType.CONFRONTO;
    }
}

async function getRandomWeapon() {
    let random = Math.random();

    return random < 0.5 ? weaponBomb : weaponShell;
}

async function getMaxPoints(characters, property) {
    return Math.max(...characters.map(character => character[property]));
}

async function calculateSkills(characters, block) {

    const skillName = block === blockType.RETA ? "velocidade" : "manobrabilidade";

    for (let character of characters) {
        const attribute = (block === blockType.RETA ? character.speed : character.maneuverability);
        character.skillResult = character.diceResult + attribute;

        await logRollResult(character.name, skillName, character.diceResult, attribute, character.skillResult);
    }

    calculateSkillWinner(characters) 
}

async function calculateSkillWinner(characters) {

    const isDuel = characters.length <= 2;

    // verify if it is a Duel (only 2 players) and compare skill values, if it they are equal it is a draw
    if (isDuel && characters[0].skillResult === characters[1].skillResult) {
        console.log("Ninguém marcou pontos nesta rodada.");
        return;
    }

    const maxSkillPoints = await getMaxPoints(characters, "skillResult");

    // If it is a race, the players with higher skill+roll will gain points
    for (let character of characters) {
        if (character.skillResult === maxSkillPoints) {
            console.log(`${character.name} marcou um ponto!`);
            character.points++;

            if (isDuel) {
                break;
            }
        }
    }
}

async function calculateConfrontation(characters) {

    // Get weapons for all characters in parallel
    await Promise.all(characters.map(async character => {
        character.weapon = await getRandomWeapon();
        character.powerResult = character.diceResult + character.power;
    }));

    // Log roll results and calculate confrontations
    for (let i = 0; i < characters.length ; i++) {
        let combatText = "";
            
        //For races with more than 2 characters, handle confrontations
        if (i >= 1 && characters.length > 2) {    
            let resultText = "";

            if (characters[i].powerResult > characters[i-1].powerResult)
                resultText += await getCombatResult(characters[i], characters[i-1], characters[i].weapon.MODIFIER);
            else 
                resultText += "Nenhum ponto foi perdido";

            combatText = `${characters[i].weapon.TEXT} contra ${characters[i-1].name}, ${resultText}`
        }
        if (characters.length <= 2) {   
            combatText = `${characters[i].weapon.TEXT}`
        }
        await logRollResult(characters[i].name, "poder", characters[i].diceResult, characters[i].power, characters[i].powerResult, combatText);
    }

    // Show confrontation results if it's a duel
    if (characters.length <= 2) {
        let resultText = "";

        if (characters[0].powerResult > characters[1].powerResult)
            resultText += await getCombatResult(characters[0], characters[1], characters[0].weapon.MODIFIER);
        else if (characters[1].powerResult > characters[0].powerResult)
            resultText += await getCombatResult(characters[1], characters[0], characters[1].weapon.MODIFIER);
        else
            resultText += "Confronto empatado! Nenhum ponto foi perdido";

        console.log(resultText);   
    }
}

async function getCombatResult(winner, loser, damage) {
    result = `${winner.name} venceu o confronto! ${loser.name} perdeu ${damage} ponto(s) 🐢`;
    loser.points = await subtractPoints(loser.points, damage);

    if (getTurbo()) {
        result += ` Turbo ativado! +1 ponto para ${winner.name}`;
        winner.points++;
    }

    return result;
}

//Function to give turbo with 25% chance.
function getTurbo() {
    let random = Math.random();

    return random < 0.25 ? true : false;
}

//Function to subtract player points without lowering below 0.
async function subtractPoints(points, modifier) {
    points -= modifier;

    return Math.max(points, 0);
}

async function logRollResult(characterName, block, characterDiceResult, attribute, skillResult, extra = null) {
    console.log(
        `${characterName.padEnd(11, ' ')} 🎲 rolou um dado de ${block} ${characterDiceResult} + ${attribute} = ${
            skillResult} ${extra !== null ? extra : ""
        }` 
    );
}

async function randomizeStartingPositions(characters) {
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]]; // Swap elements
    }
    return characters;
}

async function playRaceEngine(characters) {
    for (let round = 1; round <= NUMBER_OF_ROUNDS; round++) {
        console.log(`🏁 Rodada ${round}`);

        let block = await getRandomBlock();
        
        console.log(`Bloco: ${block}`);

        for (const character of characters) {
            character.diceResult = await rollDice();
        }

        if (block === blockType.CONFRONTO)
            await calculateConfrontation(characters);
        else 
            await calculateSkills(characters, block);

        // Sort characters by points in descending order
        characters.sort((a, b) => b.points - a.points);

        debug = "debug: ";
        for (let character of characters) {
            debug += `${character.name}: ${character.points}, `;
        }
        
        console.log(debug)
        console.log("-----------------------------");
    }
}

async function declareWinner(characters) {
    console.log("Resultado final:");
    for (const character of characters) {
        console.log(`${character.name}: ${character.points} ponto(s)`);
    }

    if (characters.length <= 2 && characters[0].points === characters[1].points) {
        console.log("A corrida terminou em empate");
    } else {
        const maxPoints = await getMaxPoints(characters, "points");
        const winner = characters.find(character => character.points === maxPoints);
        console.log(`\n${winner.name} venceu a corrida! Parabéns! 🏆`);
    }
}

async function filterCharacters(excludePlayer) {
    const characterArray = Object.values(characters);

    return characterArray.filter((character) => character.name !== excludePlayer.name);
}

async function chooseRandomRacer(excludePlayer) {
    const filteredCharacters = await filterCharacters(excludePlayer)
    const randomIndex = Math.floor(Math.random() * filteredCharacters.length);

    return filteredCharacters[randomIndex];
}

async function startDuel(player) {
    const enemyRacer = await chooseRandomRacer(player);

    console.log(
        `🏁🚨 Duelo entre ${player.name} e ${enemyRacer.name} começando...\n`
    );

    const characters = [player, enemyRacer];

    await playRaceEngine(characters);
    await declareWinner(characters);
}

async function startRace(player) {
    console.log(
        `🏁🚨 Corrida entre ${player.name} e os outros está começando...\n`
    );

    const characterList = await randomizeStartingPositions(
        Object.entries(characters).map(([key, value]) => {return { key, ...value };})
    );

    let startingPoints = FIRST_POSITION_POINTS;
    
    for (let character of characterList) {
        character.points = startingPoints;
        startingPoints--;
    }

    await playRaceEngine(characterList);
    await declareWinner(characterList);
}

(async function main() {
    
    console.log('---------------MARIO-KART----------------')
    const gameSettings = await menu.showMenu();

    if (gameSettings.gameMode === menu.gameMode.DUEL) {
        await startDuel(gameSettings.character);
    } else {
        // In race mode, there are no ties; all those who sum the highest value (dice + skill) will earn a point
        // The combat will occur with the character behind attacking the one in front
        // When drawing the starting order, a score will be added to differentiate who has more advantage, from first to sixth place
        await startRace(gameSettings.character);
    }
})();
