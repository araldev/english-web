// 1. Añadir efectos de sonido e imagen al iniciar, pasar de nivel, camino o perder.
// 2. Añadir una animación de homer al gameOver, mas personajes y cambiarlos dinámicamente.
// ----------------------------------------------------------------->
(function() {  
    fetch("./src/assets/games/listening-maze.json")
        .then(res => {
            if(!res.ok) {
                console.error("No se ha encontrado los datos del juego")
            }
            return res.json();
        })
        .then(data => {
            waiting(data);
        })
        .catch(error => {
            console.error("Error al cargar los datos del juego", error)
        });

    // Get Images to canvas
    const $rock = document.getElementById("rock");
    const $tree = document.getElementById("tree");
    const $fence = document.getElementById("fence");
    const $homer = document.getElementById("homer");

    // Buttons to select mode
    const $btnEasy = document.getElementById("easy");
    const $btnMedium = document.getElementById("medium");
    const $btnHard = document.getElementById("hard");
    const $btnLegend = document.getElementById("legend");

    // Button to start
    const $start = document.getElementById("start");

    // Buttons to play
    const $btnLeft = document.getElementById("btn-left");
    const $btnUp = document.getElementById("btn-up");
    const $btnRight = document.getElementById("btn-right");

    // Game Modal
    const $modalGame = document.getElementById("modal-game");
    // Button to close Modal
    const $closeModalGame = document.getElementById("close-modal-game-over");
    // Button to go Waiting Room
    const $closeModaAndWaiting = document.getElementById("reset-waiting-room");
    // Player info Game Over
    const $lostOrWinInfo = document.getElementById("lost-or-win");
    const $playerStatistics = document.getElementById("player-statistics");

    // DOM elements and behavior management
    const $level = document.getElementById("level");
    const $path = document.getElementById("path");
    const $lives = document.getElementById("lives");
    const $newHeart = () => {
        const $heart = document.createElement("img");
        $heart.src = "./public/images/heart.svg";
        $heart.alt = "remaining lives";
        $lives.appendChild($heart);
    };
    const $rules = document.getElementById("rules");
    const $audioText = document.getElementById("audioText");

    const isAlive = () => $lives.getAttribute("data-isalive").includes("alive");
    const kill = () => $lives.setAttribute("data-isalive", "dead");
    const revive = () => $lives.setAttribute("data-isalive", "alive");
    
    const container = document.getElementById("game-container");
    const canvas = document.getElementById("listening-maze");    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    let recWidth;
    const calculateScale = 600;
    let perspective = recWidth / calculateScale;

    // Initial Values
    const initialLevel = 1;
    const initialMaxLevel = 10;
    const initialPath = 1;
    const initialMaxPath = 10;
    let initialLives = 4;
    const initialRules = `
    <h2 class="text-gradient">Rules:</h2><br>
    <p>
    <b>1.</b> If no rule/path is possible, you must take the central path.<br><br>
    <b>2.</b> The first rule that is met disables the others.<br><br>
    <b>3.</b> Every 10 paths, you advance a level, and each time you level up, you gain a life.<br><br>
    <b>4.</b> If you run out of lives, you’ll start over from the beginning.<br><br>
    <b>5.</b> <b>Choose the correct path using the arrow keys on your keyboard: ⬅️ ⬆️ ➡️
    </p>
    `;

    // Game State
    let level = initialLevel;
    const maxLevel = initialMaxLevel;
    let regexLevel;
    let CURRENT_LEVEL;
    let path = initialPath;
    const maxPath = initialMaxPath;
    let regexPath;
    let CURRENT_PATH;
    let lives = initialLives;
    const maxLives = initialLives;
    const gameSettings = {
        states: {
            waiting: true,
            playing: false,
            gameOver: false,
            youWin: false
        },
        modes: {
            easy: 5,
            medium: 4,
            hard: 3,
            legend: 1
        }
    };

    // Pjs
    let CHARACTER;

    // Obstacles
    let ROCK;
    let TREE;
    let FENCE;

    // Auxliliary Variables
    const rockString = "rock";
    const treeString = "tree";
    const fenceString = "fence";

    const waitingString = "waiting";
    const playingString = "playing";
    const gameOverString = "gameOver";
    const youWinString = "youWin";

    const position = {
        left: {drawX: 50, key: "left"},
        center: {drawX: 280, key: "center"},
        right: {drawX: 450, key: "right"},
        any: "any"
    };

    const keyDown = {
        arrowLeft: "ArrowLeft",
        arrowUp: "ArrowUp",
        arrowRight: "ArrowRight"
    };

    const characterPlace = {
        goX: null,
        startY: 400,
        splitY: 330,
        endY: 100,
        left: 100,
        center: 270,
        right: 450
    };

    // Homer sprite const
    const homer = {
        name: "homer",
        width: 40,
        height: 80,
        idle: { x: 130, y: 1590, w: 50, h: 80, frames: 4},
        walkingY: { x: 0, y: 76, w: 42, h: 80, frames: 8},
        walkingX: { x: 180, y: 0, w: 50, h: 80, frames: 4},
        lost: { x: 10, y: 1940, w: 70, h: 80, frames: 2},
        // gameOver: { x: 10, y: 1940, w: 70, h: 80, frames: 2} // hacer para modal
    };

    // Animations variables
    const animations = {
        idle: "idle",
        walkingY: "walkingY",
        walkingX: "walkingX",
        lost: "lost",
        gameOver: "gameOver"
    };
    let currentAnimation;

    // Object SpeechSynthesis, it's to make browser speech a text
    const speakerSettings = {
        // text,
        lang: "en-US",
        // rate,
        // pitch,
        volume: 0.4
    };

    // Varaibles to manage answer and character movement
    let correctPath = [];
    let isAnswered = false;

    let previousLvl = 0;
    function speaker(text) {
        if(previousLvl >= level) return;
        previousLvl++;

        text = text.toLowerCase();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speakerSettings.lang;
        utterance.volume = speakerSettings.volume;
        speechSynthesis.speak(utterance);
    };

    let eventModeClick = null;
    function settings() {
        if(gameSettings.states.playing === true) return;

        if(eventModeClick) {
            $btnEasy.removeEventListener("click", eventModeClick);
            $btnMedium.removeEventListener("click", eventModeClick);
            $btnHard.removeEventListener("click", eventModeClick);
            $btnLegend.removeEventListener("click", eventModeClick);
            eventModeClick = null;
        };

        eventModeClick = (e) => {
            if(e.currentTarget === $btnEasy) {
                initialLives = gameSettings.modes.easy;
                lives = initialLives;
            };
            if(e.currentTarget === $btnMedium) {
                initialLives = gameSettings.modes.medium;
                lives = initialLives;
            };
            if(e.currentTarget === $btnHard) {
                initialLives = gameSettings.modes.hard;
                lives = initialLives;
            };
            if(e.currentTarget === $btnLegend) {
                initialLives = gameSettings.modes.legend;
                lives = initialLives;
            };
            showGameInfo()
            settings();
        };

        $btnEasy.addEventListener("click", eventModeClick);
        $btnMedium.addEventListener("click", eventModeClick);
        $btnHard.addEventListener("click", eventModeClick);
        $btnLegend.addEventListener("click", eventModeClick);

        kill();
    };

    function selectState(selectedState) {
        for (let state in gameSettings.states) {
            if(state !== selectedState) {
                gameSettings.states[state] = false;
            } else {
                gameSettings.states[state] = true;
            };
        };
        console.log("States: ",gameSettings.states);
    };

    let currentStartHandler = null;
    function waiting(data) {
        selectState(waitingString);
        eventResize(data);

        eventKeyDown(data, CHARACTER);
        eventButtonClick(data, CHARACTER); 

        level = initialLevel;
        path = initialPath;
        lives = initialLives;

        if($start.classList.contains("hidden")) $start.classList.remove("hidden");
        stateGame(data);
        showGameInfo();
        draw(data);

        if(currentStartHandler) {
            $start.removeEventListener("click", currentStartHandler);
            currentButtonHandler = null;
        };

        currentStartHandler = (e) => {
            start(data);
            speaker(CURRENT_LEVEL.audioText);
        };

        $start.addEventListener("click", currentStartHandler);

        settings();
    };

    let eventKeyDownModal = null;
    let handleBackdropClick = null;
    let handleEventModal = null;
    let handleComeBackWaitingRoom = null;
    function closeAndShowModal(data) {
        if (!$modalGame) throw new Error("Elemento modal-game no encontrado");

        if(eventKeyDownModal) {
            document.removeEventListener("keydown", eventKeyDownModal);
            eventKeyDownModal = null;
        };
        eventKeyDownModal = (e) => {
            const isEscape = e.key === "Escape";
            if (isEscape && $modalGame.open) {
                $modalGame.close();
                waiting(data)
            }
        };
        document.addEventListener("keydown", eventKeyDownModal);

        if (handleBackdropClick) {
            $modalGame.removeEventListener("click", handleBackdropClick);
            handleBackdropClick = null;
        };
        handleBackdropClick = (e) => {
            // Verificar si el clic fue en el backdrop (no en el contenido del modal)
            const modalRect = $modalGame.getBoundingClientRect();
            const isClickOutside = (
            e.clientY < modalRect.top ||
            e.clientY > modalRect.bottom ||
            e.clientX < modalRect.left ||
            e.clientX > modalRect.right
            );

            if (isClickOutside && $modalGame.open) {
                $modalGame.close();
                waiting(data); 
            };
        };
        $modalGame.addEventListener("click", handleBackdropClick);

        if(handleEventModal) {
            $closeModalGame.removeEventListener("click", handleEventModal);
            handleEventModal = null;
        };
        handleEventModal = (e) => {
            $modalGame.close();
            reset(data);
        };
        $closeModalGame.addEventListener("click", handleEventModal);

        if(handleComeBackWaitingRoom) {
            $closeModaAndWaiting.removeEventListener("click", handleComeBackWaitingRoom);
            handleComeBackWaitingRoom = null;
        }
        handleComeBackWaitingRoom = (e) => {
            $modalGame.close();
            waiting(data);
        };
        $closeModaAndWaiting.addEventListener("click", handleComeBackWaitingRoom);

        $modalGame.showModal();
    };

    function gameOver(data) {        
        selectState(gameOverString);

        // Delete buttons and keyDown events
        if (currentKeyHandler) {
            document.removeEventListener("keydown", currentKeyHandler);
            currentKeyHandler = null;
        }
        
        if (currentButtonHandler) {
            $btnLeft.removeEventListener("click", currentButtonHandler);
            $btnUp.removeEventListener("click", currentButtonHandler);
            $btnRight.removeEventListener("click", currentButtonHandler);
            currentButtonHandler = null;
        }

        $lostOrWinInfo.innerHTML = `
        <strong>GAME OVER!</strong>
        `
        $playerStatistics.innerHTML = `
        <p>You've reached level <strong>${level}</strong>, next time will be!</p>
        `;
        
        closeAndShowModal(data);
    };

    function youWin(data) {
        selectState(youWinString);

        $lostOrWinInfo.innerHTML = `
        <strong>YOU WIN, CONGRATULATIONS!</strong>
        `
        $playerStatistics.innerHTML = `
        <p>Congratulations, you reached the last level!</p>
        `;

        closeAndShowModal(data);
    };

    function start(data) {
        currentAnimation = animations.idle;
        revive();
        selectState(playingString);
        settings();
        $start.classList.add("hidden");
        
        eventKeyDown(data, CHARACTER);
        eventButtonClick(data, CHARACTER); 

        stateGame(data);
        putCorrectPath();
        draw(data);
        showGameInfo();
    };

    function reset(data) {
        currentAnimation = animations.idle;
        selectState(playingString);
        settings();
        $start.classList.add("hidden");

        eventKeyDown(data, CHARACTER);
        eventButtonClick(data, CHARACTER); 

        level = initialLevel;
        path = initialPath;
        lives = initialLives;

        stateGame(data);
        putCorrectPath();
        draw(data);
        showGameInfo();
    };

    let currentEventResize;
    function eventResize(data) {
        if(currentEventResize) {
            window.removeEventListener("resize", currentEventResize);
            currentEventResize = null;
        };

        currentEventResize = (e) => draw(data);
        window.addEventListener("resize", currentEventResize);

        console.log("Caminos correctos -------------->", correctPath);
    };

    function showGameInfo() {        
        // Info initial rules.
        $rules.innerHTML = initialRules;
        
        // Info lvl, path, lives.
        $level.innerHTML = `<strong>Level: ${level}</strong>/${maxLevel}`;
        $path.innerHTML = `<strong>Path: ${path}</strong>/${maxPath}`;

        if(gameSettings.states.playing) {
            // Info each lvl rules
            $audioText.innerHTML = `<b>${CURRENT_LEVEL.audioText}</b>`;
        } else {
            $audioText.innerHTML = "";
        };

        // Averiguar cuantos corazones hay dibujados
        const currentHearts = $lives.querySelectorAll("img").length;

        // Si estamos en modo playing, usar lives, sino usar initialLives
        const targetHearts = gameSettings.states.playing ? lives : initialLives;
        
        if(isAlive()) return;
        if(currentHearts < targetHearts) {
            for(let i = currentHearts; i < initialLives; i++) {
                $newHeart();
            };
        } else if(currentHearts > targetHearts) {
            for(let i = currentHearts; i > targetHearts; i--) {
                $lives.removeChild($lives.lastChild);
            };
        }
        if (!gameSettings.states.waiting) {
        revive();
        };
    };

    function stateGame(data) {
        regexLevel = `level-${level}`;
        CURRENT_LEVEL = data[regexLevel];
        console.log("CURRENT_LEVEL: ", CURRENT_LEVEL);

        regexPath = `${path}`;
        CURRENT_PATH = data.paths[regexPath];
        console.log("CURRENT_PATH: ",path, CURRENT_PATH);
    };

    function updateStateAndDraw(data) {
        advanceToNextPathOrLevel(data);
        stateGame(data);
        putCorrectPath();
        requestAnimationFrame(() => draw(data));
        showGameInfo(data);
        speaker(CURRENT_LEVEL.audioText);
        isAnswered = false;
        currentAnimation = animations.idle;
        characterPlace.goX = null;

        console.log("Caminos correctos -------------->", correctPath);
    };

    function handleCorrectPath(e, data) {
        if (!gameSettings.states.playing) return;

        if(![keyDown.arrowLeft, keyDown.arrowUp, keyDown.arrowRight].includes(e.key)) return;
        e.preventDefault();
                
        const selectedPath = getPathFromKey(e.key);
        const isCorrect = checkIfPathIsCorrect(selectedPath);
        
        if(isCorrect) {
            isAnswered = true;
            moveCharacterToPath(selectedPath, () => updateStateAndDraw(data));
        } else {
            isAnswered = true;
            handleIncorrectMove(data);
        };
    };

    function getPathFromKey(key) {
        return {
            [keyDown.arrowLeft]: 1,
            [keyDown.arrowUp]: 2,
            [keyDown.arrowRight]: 3
        }[key];
    };

    function checkIfPathIsCorrect(selectedPath) {
        return correctPath.includes(selectedPath);
    };

    function drawScene() {
        ctx.clearRect(0, 0, recWidth, canvas.height);
        drawPathToObjects(ROCK, TREE, FENCE);
        drawRock(ROCK.x, ROCK.y, ROCK.width, ROCK.height);
        drawTree(TREE.x, TREE.y, TREE.width, TREE.height);
        drawFence(FENCE.x, FENCE.y, FENCE.width, FENCE.height);
        drawCharacter(CHARACTER);
    };

    function moveCharacterToPath(path, callback) {
        const positionMap = {
            1: characterPlace.left,
            2: characterPlace.center,
            3: characterPlace.right
        };

        const targetX = positionMap[path] * perspective;
        const splitY = characterPlace.splitY - CHARACTER.height / 2;
        const targetY = characterPlace.endY / (perspective * 3.7);
    
        function moveToSplitY() {
            // console.log("moveToSplitY -----------> CHARACTER.y = ", CHARACTER.y, "splitY = ", splitY);
            characterPlace.goX = null;
            const done = Math.abs(CHARACTER.y - splitY) <= 15;
            if (!done) {
                currentAnimation = animations.walkingY;
                CHARACTER.y -= 3;
                drawScene();
                requestAnimationFrame(moveToSplitY);
            } else {
                requestAnimationFrame(moveToTargetX);
            }
        };
    
        function moveToTargetX() {
            // console.log("moveToTargetX ------------> CHARACTER.x = ", CHARACTER.x, "targetX = ", targetX);
            currentAnimation = animations.walkingX;
            const done = Math.abs(CHARACTER.x - targetX) <= 15;
            if (!done) {
                CHARACTER.x < targetX ? characterPlace.goX = position.right.key : characterPlace.goX = position.left.key;
                CHARACTER.x += CHARACTER.x < targetX ? 3 : -3;
                drawScene();
                requestAnimationFrame(moveToTargetX);
            } else {
                requestAnimationFrame(moveToTargetY);
            }
        };
    
        function moveToTargetY() {
            // console.log("moveToTargetY -----------------> CHARACTER.y = ", CHARACTER.y, "targetX = ", targetY);
            currentAnimation = animations.walkingY;
            const done = Math.abs(CHARACTER.y - targetY) <= 15;
            if (!done) {
                CHARACTER.y -= 3;
                drawScene();
                requestAnimationFrame(moveToTargetY);
            } else {
                drawScene();
                if (callback) callback();
            }
        };
    
        moveToSplitY(); // Start the movement
    };

    function advanceToNextPathOrLevel(data) {
        path++;
        if(path > maxPath) {
            level++;
            path = 1;
            if(lives < maxLives) {
                lives++;
                $newHeart();
            };
        };
        if(level > maxLevel) {
            youWin(data);
        };
    };

    function handleIncorrectMove(data) {
        console.error("Movimiento incorrecto!");
        if(lives > 0) {
            currentAnimation = animations.lost;
            lives--;
            $lives.removeChild($lives.lastChild);
        }; 
        if(lives === 0) {
            kill();
            gameOver(data);
        };
    };

    function putCorrectPath() {
        correctPath = []; // Reset correct paths
        let result = 0;
        let index;
        let obstacleIsPresent = false;
        
        if(gameSettings.states.playing === false) return;
        
        CURRENT_LEVEL.if.forEach( (r, i) => {
            console.log(`Rule Nº${i + 1}:`, r)
        });
        for (const rule of CURRENT_LEVEL.if) {
            
            // Management rules
            for(const [key, value] of Object.entries(rule)) {
                obstacleIsPresent = false;
                if(key === "go" || key === "else") continue;

                // Handle when all obstacles are drawn
                if(key === "all") {
                    const areAllObstacle = value.every(obstacle => checkObstaclePosition(obstacle, position.any));

                    if(!areAllObstacle) continue;
                    
                    const refObstacle = rule.choose;
                    obstacleIsPresent = checkObstaclePosition(refObstacle, position.any);
                    result = getPathValue(obstacleIsPresent) + calculatePath(rule.go);
                    correctPath.push(result);
                    if(!correctPath.some(num => [1, 2, 3].includes(num))) {
                        index = correctPath.findIndex(num => ![1, 2, 3].includes(num))
                        if(index !== -1) correctPath.splice(index, 1);
                    };
                    if(correctPath.length > 0) return;
                    continue;
                };
                
                // Handle standar rules
                obstacleIsPresent = checkObstaclePosition(key, value);   
                
                if(obstacleIsPresent) {
                    result = getPathValue(obstacleIsPresent) + calculatePath(rule.go);
                    correctPath.push(result);
                    if(!correctPath.some(num => [1, 2, 3].includes(num))) {
                        index = correctPath.findIndex(num => ![1, 2, 3].includes(num))
                        if(index !== -1) correctPath.splice(index, 1);
                    };
                    if(correctPath.length > 0) return;
                }; 
            };
            
            if(correctPath.length < 1 && rule.else) {
                correctPath.push(getPathValue(rule.else));
                return;
            };
        };

        // If no paths are defined, use the centre as the default
        if(!correctPath.some(num => [1, 2, 3].includes(num)) || correctPath.length === 0) correctPath.push(2);   
    };

    // Function to dynamically determine the path based on the object's current position
    function calculatePath(go) {
        return {
            left: -1,
            center: 0,
            right: +1
        }[go] || 0;
    };

    function checkObstaclePosition(obstacle, positionToCheck) {
        if(positionToCheck === position.any) {
            let index = Object.values(CURRENT_PATH).findIndex(value => value === obstacle);            
            return index === -1 ? false : Object.keys(CURRENT_PATH)[index];
        }
        return CURRENT_PATH[positionToCheck] === obstacle ? positionToCheck : false;
    };

    function getPathValue(position) {
        return {
            left: 1,
            center: 2,
            right: 3,
        }[position];
    };

    let currentKeyHandler = null;
    function eventKeyDown(data) {
        if (currentKeyHandler) {
            document.removeEventListener("keydown", currentKeyHandler);
            currentKeyHandler = null;
        };

        if(gameSettings.states.playing !== true) return;

        currentKeyHandler = (e) => {
            handleCorrectPath(e, data, CHARACTER);
            speaker(CURRENT_LEVEL.audioText);
        };

        document.addEventListener("keydown", currentKeyHandler);
    };

    let currentButtonHandler = null;
    function eventButtonClick(data) {
        if(currentButtonHandler) {
            $btnLeft.removeEventListener("click", currentButtonHandler);
            $btnUp.removeEventListener("click", currentButtonHandler);
            $btnRight.removeEventListener("click", currentButtonHandler);
            currentButtonHandler = null;
        };
        
        if(gameSettings.states.playing !== true) return;


        currentButtonHandler = (e) => {
            if(e.currentTarget === $btnLeft) {
                e.key = keyDown.arrowLeft;
                handleCorrectPath(e, data, CHARACTER);
                speaker(CURRENT_LEVEL.audioText);
            } else if (e.currentTarget === $btnUp) {
                e.key = keyDown.arrowUp;
                handleCorrectPath(e, data, CHARACTER);
                speaker(CURRENT_LEVEL.audioText);
            } else {
                e.key = keyDown.arrowRight;
                handleCorrectPath(e, data, CHARACTER);
                speaker(CURRENT_LEVEL.audioText);
            }   
        };

        $btnLeft.addEventListener("click", currentButtonHandler);
        $btnUp.addEventListener("click", currentButtonHandler);
        $btnRight.addEventListener("click", currentButtonHandler);
    };
    
    let lastPhotoCanvas;
    let currentCharacterWidth;
    let currentCharacterHeight;
    function drawCharacter() {
        // I retrieve the last image from the canvas before drawing the character
        lastPhotoCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height); 

        currentCharacterWidth = CHARACTER.width * perspective; 
        currentCharacterHeight = CHARACTER.height * perspective;
        if(!isAnswered) {
            CHARACTER.x = (recWidth / 2) - (CHARACTER.width / 2);
            CHARACTER.y = canvas.width > (calculateScale + 120) ? characterPlace.startY - CHARACTER.height : characterPlace.startY ;
        };

        animationCharacter();
    };
    
    let frameCount = 0;
    let frameDelay = 10; // Changes every 10 cycles (~6fps)
    let frame = 0;
    let animationId = null;
    function animationCharacter() {
        if(!gameSettings.states.playing) {
            cancelAnimationFrame(animationId);
            return;
        }
        if(animationId) cancelAnimationFrame(animationId);

        homer[currentAnimation].frames < 4 ? frameDelay = 20 : frameDelay = 10;
        let totalFrames = homer[currentAnimation].frames; // Cambiar homer por template String ${} cuando se pueda elegir el pj dinámicamente.

        // I delete the canvas and put the saved image without the character so as not to overwrite the animation images.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(lastPhotoCanvas, 0, 0);

        if (frameCount % frameDelay === 0) {
            frame = (frame + 1) % totalFrames;
        }

        const startX = homer[currentAnimation].x + frame * homer[currentAnimation].w;
        
        if(characterPlace.goX === position.left.key) {            
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage($homer, startX, homer[currentAnimation].y, homer.width, homer.height, -CHARACTER.x, CHARACTER.y, currentCharacterWidth, currentCharacterHeight);            
            ctx.restore();
        }else {
            ctx.drawImage($homer, startX, homer[currentAnimation].y, homer.width, homer.height, CHARACTER.x, CHARACTER.y, currentCharacterWidth, currentCharacterHeight);
        }
        
        frameCount++;
        animationId = requestAnimationFrame(animationCharacter);
    };

    function drawPathToObjects(...obstacles) {
        if (obstacles.length !== 3) return;        

        perspective = recWidth / calculateScale;

        // Main road coordinates
        const startX = recWidth / 2;
        const startY = 500;
        const splitY = 350;
    
        // Road color and visualize;
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
    
        // Start road
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, splitY);
        ctx.stroke();

        // Road diversion
        obstacles.forEach(obstacle => {
            drawBranchX(obstacle.x);
            drawBranchY(obstacle.x, obstacle.y);
        })
    
        // Helper functions for branches to each object
        function drawBranchX(toX) {
            toX = perspective * toX;
    
            ctx.beginPath();
            ctx.moveTo(startX, splitY);
            ctx.lineTo(toX, splitY);
            ctx.stroke();
        };

        function drawBranchY(toX, toY) {
            toX = perspective * toX;
            toY /= perspective * 1.9;

            ctx.beginPath();
            ctx.moveTo(toX, splitY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
        };
    };
    
    function drawRock(x, y, width, height) {
        if(!Object.values(CURRENT_PATH).includes(rockString)) return;
        if(CURRENT_PATH.left.includes(rockString)) x = position.left.drawX;
        if(CURRENT_PATH.center.includes(rockString)) x = position.center.drawX;
        if(CURRENT_PATH.right.includes(rockString)) x = position.right.drawX;        

        x = perspective * x * 0.85;
        y /= perspective * 3.5;
        width = perspective * width;
        height = perspective * height;

        ctx.drawImage($rock, 0, 0, $rock.width, $rock.height, x, y, width, height);
    };

    function drawTree(x, y, width, height) {
        if(!Object.values(CURRENT_PATH).includes(treeString)) return;
        if(CURRENT_PATH.left.includes(treeString)) x = position.left.drawX;
        if(CURRENT_PATH.center.includes(treeString)) x = position.center.drawX;
        if(CURRENT_PATH.right.includes(treeString)) x = position.right.drawX;

        x = perspective * x  * 0.8;
        y /= perspective * 5.8;
        width = perspective * width * .8;
        height = perspective * height * .8;

        ctx.drawImage($tree, 0, 0, $tree.width, $tree.height, x, y, width, height);    
    };

    function drawFence(x, y, width, height) {
        if(!Object.values(CURRENT_PATH).includes(fenceString)) return;
        if(CURRENT_PATH.left.includes(fenceString)) x = position.left.drawX;
        if(CURRENT_PATH.center.includes(fenceString)) x = position.center.drawX;
        if(CURRENT_PATH.right.includes(fenceString)) x = position.right.drawX;

        x = perspective * x * 0.85;
        y /= perspective * 3.5;
        width = perspective * width * 2;
        height = perspective * height * 2;

        ctx.drawImage($fence, 0, 0, $fence.width, $fence.height, x, y, width, height);
    };

    function draw(data) {
        CHARACTER = data.character[homer.name]; // Hacer dinámico el selector para cuando haya más personajes
        ROCK = data.obstacles.rock;
        TREE = data.obstacles.tree;
        FENCE = data.obstacles.fence;

        canvas.width = container.clientWidth;
        recWidth = canvas.width;        

        if(gameSettings.states.playing !== true) return;

        ctx.clearRect(0, 0, recWidth, canvas.height);

        drawPathToObjects(ROCK, TREE, FENCE);
        drawRock(ROCK.x, ROCK.y, ROCK.width, ROCK.height);
        drawTree(TREE.x, TREE.y, TREE.width, TREE.height);
        drawFence(FENCE.x, FENCE.y, FENCE.width, FENCE.height);
        drawCharacter();
    };
})();