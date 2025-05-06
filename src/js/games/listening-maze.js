// 1. Crear estados del juego: Start, Playing, Game Over, You Win.
// 2. Agregar audios con rules.
// 3. Cuando minimizo con el botón no me hace el event resize.
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
            init(data);
        })
        .catch(error => {
            console.error("Error al cargar los datos del juego", error)
        });

    // Get Images to canvas
    const $rock = document.getElementById("rock");
    const $tree = document.getElementById("tree");
    const $fence = document.getElementById("fence");

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
    const ctx = canvas.getContext("2d");
    
    let recWidth;
    let calculateScale = 600;
    let perspective = recWidth / calculateScale;

    // Initial Values
    const initialLevel = 1;
    const initialPath = 1;
    const initialLives = 3;
    const initialRules = `
    <h2 class="text-gradiant">Rules:</h2><br>
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
    const maxLevel = 10;
    let regexLevel;
    let CURRENT_LEVEL;
    let path = initialPath;
    const maxPath = 10;
    let regexPath;
    let CURRENT_PATH;
    let lives = initialLives;
    const maxLives = initialLives;

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

    const characterPlace = {
        startY: 430,
        splitY: 350,
        endY: 100
    };

    const position = {
        left: {drawX: 100, key: "left"},
        center: {drawX: 280, key: "center"},
        right: {drawX: 450, key: "right"},
        any: "any"
    };

    const keyDown = {
        arrowLeft: "ArrowLeft",
        arrowUp: "ArrowUp",
        arrowRight: "ArrowRight"
    };

    // Varaibles to manage answer and character movement
    let correctPath = [];
    let isAnswered = false;

    let handleEventDraw;
    function init(data) {
        stateGame(data);
        putCorrectPath();
        draw(data);
        showGameInfo();

        if(handleEventDraw) {
            window.removeEventListener("resize", handleEventDraw);
            handleEventDraw = null;
        };

        handleEventDraw = (e) => draw(data);
        window.addEventListener("resize", handleEventDraw);
        console.log("Caminos correctos -------------->", correctPath);
    };

    function reset(data) {
        level = initialLevel;
        path = initialPath;
        lives = initialLives;

        stateGame(data);
        putCorrectPath();
        requestAnimationFrame(() => draw(data));
        showGameInfo();
    };

    function showGameInfo() {
        // Info rules.
        $rules.innerHTML = initialRules;
        $audioText.innerHTML = `<b>${CURRENT_LEVEL.audioText}</b>`;
        
        // Info lvl, path, lives.
        $level.innerHTML = `<strong>Level: ${level}</strong> / ${maxLevel}`;
        $path.innerHTML = `<strong>Path: ${path}</strong> / ${maxPath}`;
    
        if(isAlive()) return;
        for(let i = 1; i <= lives; i++) {
            $newHeart();
        };
        revive();
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
        isAnswered = false;
        console.log("Caminos correctos -------------->", correctPath);
    };

    function handleCorrectPath(e, data, CHARACTER) {
        if(![keyDown.arrowLeft, keyDown.arrowUp, keyDown.arrowRight].includes(e.key)) return;
        
        const selectedPath = getPathFromKey(e.key);
        const isCorrect = checkIfPathIsCorrect(selectedPath);
        
        if(isCorrect) {
            isAnswered = true;
            moveCharacterToPath(CHARACTER, selectedPath, () => updateStateAndDraw(data));
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

    function moveCharacterToPath(CHARACTER, path, callback) {
        const positionMap = {
            1: position.left.drawX,
            2: position.center.drawX,
            3: position.right.drawX
        };

        const targetX = (positionMap[path] - CHARACTER.width / 2) * perspective;
        const splitY = characterPlace.splitY - CHARACTER.height / 2;
        const targetY = characterPlace.endY / (perspective * 1.7);
        
        function drawScene() {
            ctx.clearRect(0, 0, recWidth, canvas.height);
            drawPathToObjects(ROCK, TREE, FENCE);
            drawRock(ROCK.x, ROCK.y, ROCK.width, ROCK.height);
            drawTree(TREE.x, TREE.y, TREE.width, TREE.height);
            drawFence(FENCE.x, FENCE.y, FENCE.width, FENCE.height);
            drawCharacter(CHARACTER);
        }
    
        function moveToSplitY() {
            const done = Math.abs(CHARACTER.y - splitY) <= 1;
            if (!done) {
                CHARACTER.y -= 2;
                drawScene();
                requestAnimationFrame(moveToSplitY);
            } else {
                requestAnimationFrame(moveToTargetX);
            }
        }
    
        function moveToTargetX() {
            const done = Math.abs(CHARACTER.x - targetX) <= 1;
            if (!done) {
                CHARACTER.x += CHARACTER.x < targetX ? 2 : -2;
                drawScene();
                requestAnimationFrame(moveToTargetX);
            } else {
                requestAnimationFrame(moveToTargetY);
            }
        }
    
        function moveToTargetY() {
            const done = Math.abs(CHARACTER.y - targetY) <= 1;
            if (!done) {
                CHARACTER.y -= 2;
                drawScene();
                requestAnimationFrame(moveToTargetY);
            } else {
                drawScene();
                if (callback) callback();
            }
        }
    
        moveToSplitY(); // Empieza el movimiento
    };

    function advanceToNextPathOrLevel(data) {
        path++;
        if(path > maxPath) {
            level++;
            path = 1;
            if(lives >= maxLives) return;
            lives++;
            $newHeart();
        };
        if(level > maxLevel) {
            alert("You win")
            reset(data);
        };
    };

    function handleIncorrectMove(data) {
        console.error("Movimiento incorrecto!");
        if(lives > 0) {
            lives--;
            $lives.removeChild($lives.lastChild);
        }; 
        if(lives === 0) {
            kill();
            reset(data);
        };
    };

    function putCorrectPath() {
        correctPath = []; // Reset correct paths
        let result = 0;
        let index;
        let obstacleIsPresent = false;
        
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

    let currentKeyHandler;
    function eventPathing(data, CHARACTER) {
        if (currentKeyHandler) {
            document.removeEventListener("keydown", currentKeyHandler);
            currentKeyHandler = null;
        }
        currentKeyHandler = (e) => handleCorrectPath(e, data, CHARACTER);
        document.addEventListener("keydown", currentKeyHandler);
    };
    
    function drawCharacter(CHARACTER) {
        if(!isAnswered) {
            CHARACTER.x = (recWidth / 2) - (CHARACTER.width / 2);
            CHARACTER.y = characterPlace.startY;
        };

        ctx.fillStyle = "Black";
        ctx.fillRect(CHARACTER.x, CHARACTER.y, CHARACTER.width, CHARACTER.height);
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

        x = perspective * x * 0.45;
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
        CHARACTER = data.character[1];
        ROCK = data.obstacles.rock;
        TREE = data.obstacles.tree;
        FENCE = data.obstacles.fence;
        canvas.width = container.offsetWidth - 5;
        recWidth = canvas.width;

        ctx.clearRect(0, 0, recWidth, canvas.height);

        drawPathToObjects(ROCK, TREE, FENCE);
        drawRock(ROCK.x, ROCK.y, ROCK.width, ROCK.height);
        drawTree(TREE.x, TREE.y, TREE.width, TREE.height);
        drawFence(FENCE.x, FENCE.y, FENCE.width, FENCE.height);
        drawCharacter(CHARACTER);
        eventPathing(data, CHARACTER);        
    };
})();