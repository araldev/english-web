(function() {
    fetch("./src/assets/games/listening-maze.json")
        .then(res => {
            if(!res.ok) {
                console.error("No se ha encontrado los datos del juego")
            }
            return res.json();
        })
        .then(data => {
            maxLevel = getInitialMaxLevel(data);
            maxPath = getInitialMaxPath(data);
            waiting(data);
        })
        .catch(error => {
            console.error("Error al cargar los datos del juego", error)
        });

    const $startAudio = new Audio("./public/sounds/game-start.ogg");
    const $missAudio = new Audio("./public/sounds/electrical-shock.ogg");
    const $gameOverAudio = new Audio("./public/sounds/game-over-arcade.ogg");
    let currentAudio = null;

    const $rock = document.getElementById("rock");
    const $tree = document.getElementById("tree");
    const $fence = document.getElementById("fence");
    const $homer = document.getElementById("homer");

    const $btnEasy = document.getElementById("easy");
    const $btnMedium = document.getElementById("medium");
    const $btnHard = document.getElementById("hard");
    const $btnLegend = document.getElementById("legend");

    const $start = document.getElementById("start");

    const $btnLeft = document.getElementById("btn-left");
    const $btnUp = document.getElementById("btn-up");
    const $btnRight = document.getElementById("btn-right");

    const $modalGame = document.getElementById("modal-game");
    const $closeModalGame = document.getElementById("close-modal-game-over");
    const $closeModaAndWaiting = document.getElementById("reset-waiting-room");
    const $lostOrWinInfo = document.getElementById("lost-or-win");
    const $modalScore = document.getElementById("modal-score");
    const $playerStatistics = document.getElementById("player-statistics");

    const $score = document.getElementById("score");
    const $timer = document.getElementById("timer");
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

    const initialLevel = 1;
    function getInitialMaxLevel(data) {
        return Object.entries(data).filter( ([key]) => key.startsWith(`level-`)).length || 10;
    };
    const initialPath = 1;
    function getInitialMaxPath(data) {
        return Object.keys(data.paths).length || 10;
    };
    let initialLives = 4;
    const initialRules = `
    <h2 class="text-gradient">Rules:</h2><br>
    <p>
    <b>1.</b> The first rule that is met disables the others.<br><br>
    <b>2.</b> Every 10 paths, you advance a level, and each time you level up, you gain a life.<br><br>
    <b>3.</b> <b>Choose the correct path using the arrow keys on your keyboard: ⬅️ ⬆️ ➡️
    </p>
    `;

    let level = initialLevel;
    let maxLevel;
    let regexLevel;
    let CURRENT_LEVEL;
    let path = initialPath;
    let maxPath;
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
        },
    };

    let CHARACTER;

    let ROCK;
    let TREE;
    let FENCE;

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

    const homer = {
        name: "homer",
        width: 40,
        height: 80,
        idle: { x: 130, y: 1590, w: 50, h: 80, frames: 4},
        walkingY: { x: 0, y: 76, w: 42, h: 80, frames: 8},
        walkingX: { x: 180, y: 0, w: 50, h: 80, frames: 4},
        lost: { x: 10, y: 1940, w: 70, h: 80, frames: 2},
    };

    const animations = {
        idle: "idle",
        walkingY: "walkingY",
        walkingX: "walkingX",
        lost: "lost",
    };
    let currentAnimation;

    const speakerSettings = {
        lang: "en-US",
        volume: 0.4
    };

    let correctPath = [];
    let isAnswered = false;

    let previousPath = initialPath - 1;
    async function triggerAudio() {
        if(previousPath >= maxPath && currentAnimation !== animations.lost) previousPath = 0;

        if(previousPath < path) {
            if(gameSettings.states.playing) currentAudio = $startAudio;
            previousPath++;
        } else if(previousPath >= path) {
            if(gameSettings.states.playing && currentAnimation === animations.lost) currentAudio = $missAudio;
        }
        if(gameSettings.states.gameOver) {
            currentAudio = $gameOverAudio;
            previousPath = 0;
        };

        if(currentAudio) {
            try {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                await currentAudio.play();
            } catch (err) {
                console.error("Audio error:", err);
            };
            currentAudio = null;
        };
    };

    function playWinSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
                osc.start(audioCtx.currentTime + i * 0.15);
                osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
            });
        } catch (err) {
            console.error("Win sound error:", err);
        };
    };

    let idsetTimeoutSpeaker = null;
    let previousLvl = 0;
    function speaker(text) {
        if(gameSettings.states.gameOver) previousLvl = 0;
        
        if(previousLvl >= level || !gameSettings.states.playing) return;
        previousLvl++;

        text = text.toLowerCase();
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speakerSettings.lang;
        utterance.volume = speakerSettings.volume;

        if (idsetTimeoutSpeaker) clearTimeout(idsetTimeoutSpeaker);
        idsetTimeoutSpeaker = setTimeout(() => speechSynthesis.speak(utterance), 1000);
    };

    let score = 0;
    let timeLeft = 0;
    let timerInterval = null;
    let scoreMultiplier = 1;

    function startTimer() {
        stopTimer();
        timeLeft = 10;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if(timeLeft <= 0) {
                timeLeft = 0;
                updateTimerDisplay();
            };
        }, 1000);
    };

    function stopTimer() {
        if(timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        };
    };

    function updateTimerDisplay() {
        $timer.innerHTML = `⏱ <strong>${timeLeft}</strong>s`;
    };

    function addScore(basePoints) {
        const earned = basePoints + (timeLeft * 10 * scoreMultiplier);
        score += earned;
        updateScoreDisplay();
        return earned;
    };

    function subtractScore(points) {
        score = Math.max(0, score - points);
        updateScoreDisplay();
    };

    function updateScoreDisplay() {
        $score.innerHTML = `Score: <strong>${score}</strong>`;
    };

    function resetScore() {
        score = 0;
        timeLeft = 0;
        scoreMultiplier = 1;
        updateScoreDisplay();
        updateTimerDisplay();
        if(timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        };
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
                scoreMultiplier = 1;
            };
            if(e.currentTarget === $btnMedium) {
                initialLives = gameSettings.modes.medium;
                lives = initialLives;
                scoreMultiplier = 1.5;
            };
            if(e.currentTarget === $btnHard) {
                initialLives = gameSettings.modes.hard;
                lives = initialLives;
                scoreMultiplier = 2;
            };
            if(e.currentTarget === $btnLegend) {
                initialLives = gameSettings.modes.legend;
                lives = initialLives;
                scoreMultiplier = 3;
            };
            showGameInfo();
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
        resetScore();

        if($start.classList.contains("hidden")) $start.classList.remove("hidden");
        stateGame(data);
        showGameInfo();
        draw(data);

        if(currentStartHandler) {
            $start.removeEventListener("click", currentStartHandler);
            currentStartHandler = null;
        };

        currentStartHandler = (e) => {
            start(data);
            speaker(CURRENT_LEVEL.audioText);
            triggerAudio();
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
                waiting(data);
            }
        };
        document.addEventListener("keydown", eventKeyDownModal);

        if (handleBackdropClick) {
            $modalGame.removeEventListener("click", handleBackdropClick);
            handleBackdropClick = null;
        };
        handleBackdropClick = (e) => {
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

    let particles = [];

    function createParticles(cx, cy) {
        particles = [];
        for(let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.008 + Math.random() * 0.015,
                size: 3 + Math.random() * 6,
                color: `hsl(${Math.random() * 360}, 80%, 60%)`
            });
        };
    };

    function drawParticles() {
        if(particles.length === 0) return;
        ctx.save();
        for(let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;
            if(p.life <= 0) {
                particles.splice(i, 1);
                continue;
            };
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        };
        ctx.restore();
        if(particles.length > 0) {
            requestAnimationFrame(drawParticles);
        };
    };

    function gameOver(data) {
        stopTimer();
        selectState(gameOverString);

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
        `;
        $modalScore.innerHTML = `
        <p>Final Score: <strong>${score}</strong></p>
        `;
        $playerStatistics.innerHTML = `
        <p>You've reached level <strong>${level}</strong>, next time will be!</p>
        `;
        
        closeAndShowModal(data);
    };

    function youWin(data) {
        stopTimer();
        selectState(youWinString);

        playWinSound();
        createParticles(canvas.width / 2, canvas.height / 2);
        drawParticles();

        $lostOrWinInfo.innerHTML = `
        <strong>YOU WIN, CONGRATULATIONS!</strong>
        `;
        $modalScore.innerHTML = `
        <p>Final Score: <strong>${score}</strong></p>
        `;
        $playerStatistics.innerHTML = `
        <p>Congratulations, you reached the last level!</p>
        `;

        setTimeout(() => closeAndShowModal(data), 1500);
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
        startTimer();
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
        resetScore();

        stateGame(data);
        putCorrectPath();
        draw(data);
        showGameInfo();
        speaker(CURRENT_LEVEL.audioText);
        triggerAudio();
    };

    let currentEventResize;
    function eventResize(data) {
        if(currentEventResize) {
            window.removeEventListener("resize", currentEventResize);
            currentEventResize = null;
        };

        currentEventResize = (e) => draw(data);
        window.addEventListener("resize", currentEventResize);
    };

    function showGameInfo() {
        $rules.innerHTML = initialRules;
        
        $level.innerHTML = `<strong>Level: ${level}</strong>/${maxLevel}`;
        $path.innerHTML = `<strong>Path: ${path}</strong>/${maxPath}`;

        if(gameSettings.states.playing) {
            $audioText.innerHTML = `<b>${CURRENT_LEVEL.audioText}</b>`;
        } else {
            $audioText.innerHTML = "";
        };

        const currentHearts = $lives.querySelectorAll("img").length;

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

        regexPath = `${path}`;
        CURRENT_PATH = data.paths[regexPath];
    };

    function updateStateAndDraw(data) {
        advanceToNextPathOrLevel(data);
        stateGame(data);
        putCorrectPath();
        requestAnimationFrame(() => draw(data));
        showGameInfo(data);
        speaker(CURRENT_LEVEL.audioText);
        triggerAudio();
        isAnswered = false;
        currentAnimation = animations.idle;
        characterPlace.goX = null;
    };

    function handleCorrectPath(e, data) {
        if(isAnswered) return;
        if (!gameSettings.states.playing) return;

        if(![keyDown.arrowLeft, keyDown.arrowUp, keyDown.arrowRight].includes(e.key)) return;
        e.preventDefault();
                
        const selectedPath = getPathFromKey(e.key);
        const isCorrect = checkIfPathIsCorrect(selectedPath);
        
        if(isCorrect) {
            isAnswered = true;
            stopTimer();
            addScore(50);
            startTimer();
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
        drawCharacter();
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
    
        moveToSplitY();
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

    let isLostAnimating = false;

    function handleIncorrectMove(data) {
        if(lives > 0) {
            currentAnimation = animations.lost;
            isLostAnimating = true;
            lives--;
            $lives.removeChild($lives.lastChild);
            subtractScore(50);
        };
        if(lives === 0) {
            kill();
            stopTimer();
            gameOver(data);
            isAnswered = false;
            isLostAnimating = false;
            return;
        };
        triggerAudio();
        setTimeout(() => {
            isAnswered = false;
            isLostAnimating = false;
            currentAnimation = animations.idle;
        }, 1500);
    };

    function putCorrectPath() {
        correctPath = [];
        let result = 0;
        let index;
        let obstacleIsPresent = false;
        
        if(!gameSettings.states.playing) return;
        
        for (const rule of CURRENT_LEVEL.if) {
            
            for(const [key, value] of Object.entries(rule)) {
                obstacleIsPresent = false;
                if(key === "go" || key === "else") continue;

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

        if(!correctPath.some(num => [1, 2, 3].includes(num)) || correctPath.length === 0) correctPath.push(2);
    };

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
            if(currentAnimation === animations.lost || isAnswered || isLostAnimating) return;
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
            if(currentAnimation === animations.lost || isAnswered || isLostAnimating) return;

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
            };
        };

        $btnLeft.addEventListener("click", currentButtonHandler);
        $btnUp.addEventListener("click", currentButtonHandler);
        $btnRight.addEventListener("click", currentButtonHandler);
    };
    
    let lastPhotoCanvas;
    let currentCharacterWidth;
    let currentCharacterHeight;
    function drawCharacter() {
        lastPhotoCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);

        currentCharacterWidth = CHARACTER.width * perspective;
        currentCharacterHeight = CHARACTER.height * perspective;
        if(!isAnswered) {
            CHARACTER.x = (recWidth / 2) - (CHARACTER.width / 2);
            CHARACTER.y = canvas.width > (calculateScale + 120) ? characterPlace.startY - CHARACTER.height : characterPlace.startY ;
        };

        animationCharacter();
    };
    
    let idTimeOutAnimationLost = null;
    let isTimeoutFinish = false;
    let isTimeoutCalled = false;
    let frameCount = 0;
    let frameDelay = 10;
    let frame = 0;
    let animationId = null;
    function animationCharacter() {
        if(!gameSettings.states.playing && !gameSettings.states.youWin) {
            cancelAnimationFrame(animationId);
            return;
        }
        if(animationId) cancelAnimationFrame(animationId);

        homer[currentAnimation].frames < 4 ? frameDelay = 20 : frameDelay = 10;
        let totalFrames = homer[currentAnimation].frames;

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

        if(idTimeOutAnimationLost && isTimeoutFinish) {
             clearTimeout(idTimeOutAnimationLost);
             isTimeoutFinish = false;
        };
        if(currentAnimation === animations.lost && !isTimeoutCalled) {
            isTimeoutCalled = true;
            idTimeOutAnimationLost = setTimeout(() => {
                isTimeoutFinish = true;
                isTimeoutCalled = false;
                currentAnimation = animations.idle;
            }, 1500);
        };
        
        frameCount++;
        animationId = requestAnimationFrame(animationCharacter);
    };

    function drawPathToObjects(...obstacles) {
        if (obstacles.length !== 3) return;

        perspective = recWidth / calculateScale;

        const startX = recWidth / 2;
        const startY = 500;
        const splitY = 350;
    
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
    
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, splitY);
        ctx.stroke();

        obstacles.forEach(obstacle => {
            drawBranchX(obstacle.x);
            drawBranchY(obstacle.x, obstacle.y);
        })
    
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

        x = perspective * x * 0.8;
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
        CHARACTER = data.character[homer.name];
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
