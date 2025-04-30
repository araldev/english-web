(function() {  
    fetch("./games/listening-maze.json")
        .then(res => {
            if(!res.ok) {
                throw new Error("No se ha encontrado los datos del juego")
            }
            return res.json();
        })
        .then(data => {
            init(data);
        })
        .catch(error => {
            console.error("Error al cargar los datos del juego", error)
        });

    const container = document.getElementById("game-container");
    const canvas = document.getElementById("listening-maze");    
    const ctx = canvas.getContext("2d");

    const rockString = "rock";
    let rockPosition;
    const treeString = "tree";
    let treePosition;
    const fenceString = "fence";
    let fencePosition;

    let recWidth;
    let calculateScale = 600;
    let perspective = recWidth / calculateScale;

    const characterPlace = {
        startY: 430,
        splitY: 350,
        endY: 200
    };

    // Game State
    let level = 1;
    const maxLevel = 10;
    let regexLevel;
    let CURRENT_LEVEL;
    let path = 1;
    const maxPath = 10;
    let regexPath;
    let CURRENT_PATH;

    const position = {
        left: {drawX: 100, key: "left"},
        center: {drawX: 280, key: "center"},
        right: {drawX: 450, key: "right"},
        any: "any"
    }

    const keyDown = {
        arrowLeft: "ArrowLeft",
        arrowUp: "ArrowUp",
        arrowRight: "ArrowRight"
    };

    let correctPath = [];
    let indexCorrectPath;

    function stateGame(data) {
        regexLevel = `level-${level}`;
        CURRENT_LEVEL = data[regexLevel];
        console.log("StateGame Level: ", CURRENT_LEVEL);

        regexPath = `${path}`;
        CURRENT_PATH = data.paths[regexPath];
        console.log("StateGame Path: ",path, CURRENT_PATH);
    };

    function handleCorrectPath(data, CHARACTER) {
        return (e) => {
            if(![keyDown.arrowLeft, keyDown.arrowUp, keyDown.arrowRight].includes(e.key)) return;
            
            const selectedPath = getPathFromKey(e.key);
            const isCorrect = checkIfPathIsCorrect(selectedPath);
            
            if(isCorrect) {
                moveCharacterToPath(CHARACTER, selectedPath);
                advanceToNextPathOrLevel();
                init(data);
            } else {
                handleIncorrectMove();
            }
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

    function moveCharacterToPath(CHARACTER, path) {
        const positionMap = {
            1: position.left.drawX,
            2: position.center.drawX,
            3: position.right.drawX
        };

        CHARACTER.y = characterPlace.splitY;
        CHARACTER.y = characterPlace.endY;
        CHARACTER.y /= perspective * 1.7;
        CHARACTER.x = perspective * positionMap[path];
    };

    function advanceToNextPathOrLevel() {
        path++;
        if(path > maxPath) {
            level++;
            path = 1;
        }
    };

    function handleIncorrectMove() {
        console.error("Movimiento incorrecto!");
        // Aquí puedes añadir efectos visuales/sonoros de error
    }
    
// Arreglar esta parte:
// ----------------------------------------------------------->

    function putCorrectPath() {
        correctPath = []; // Resetear caminos correctos
        
        CURRENT_LEVEL.if.forEach(rule => {
            // Manejar reglas con "all" (como en level-10)
            console.log("Esto es la rule: ", rule);
            
            if(Object.values(rule).some(value => value === position.any)) {
                // if(rule.all.every(obs => Object.values(CURRENT_PATH).includes(obs))) {
                //     correctPath.push(getPathValue(rule.go));
                // }
                // return;
            }
            
            // Manejar reglas normales
            for(const [obstacle, obstaclePosition] of Object.entries(rule)) {
                if(obstacle === "go" || obstacle === "else") continue;
                
                const obstacleIsPresent = checkObstaclePosition(obstacle, obstaclePosition);                
                
                if(obstacleIsPresent) {
                    correctPath.push(getPathValue(rule.go));
                } else if(rule.else) {
                    correctPath.push(getPathValue(rule.else));
                }
            }
        });
        
        // Si no hay caminos definidos, usar centro como default
        if(correctPath.length === 0) correctPath.push(2);
    };

    function checkObstaclePosition(obstacle, positionToCheck) {
        if(positionToCheck === "any") {
            return Object.values(CURRENT_PATH).includes(obstacle);
        }
        return CURRENT_PATH[positionToCheck] === obstacle;
    };

    function getPathValue(position) {
        return {
            left: 1,
            center: 2,
            right: 3
        }[position] || 2; // Default to center if invalid
    };

// ----------------------------------------------------------------->

    let currentKeyHandler;
    function characterPathing(data, CHARACTER) {
        if (currentKeyHandler) {
            document.removeEventListener("keydown", currentKeyHandler);
            currentKeyHandler = null;
        }
        currentKeyHandler = (e) => handleCorrectPath(data, CHARACTER);
        document.addEventListener("keydown", currentKeyHandler());
    };
    
    function drawCharacter(CHARACTER) {
        CHARACTER.x = (recWidth / 2) - (CHARACTER.width / 2);
        CHARACTER.y = characterPlace.startY;

        ctx.fillStyle = "Black";
        ctx.fillRect(CHARACTER.x, CHARACTER.y, CHARACTER.width, CHARACTER.height);
    };

    function drawPathToObjects(obstacle1, obstacle2, obstacle3) {
        if (!obstacle1 || !obstacle2 || !obstacle3) return;

        perspective = recWidth / calculateScale;
        
        // Base del camino principal
        const startX = recWidth / 2;
        const startY = 500;
        const splitY = 350;
    
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
    
        // Camino principal
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, splitY);
        ctx.stroke();
    
        // Función auxiliar para rama hacia un objeto
        function drawBranch(toX, toY) {
            toX = perspective * toX;
            toY /= perspective * 1.5;
    
            ctx.beginPath();
            ctx.moveTo(startX, splitY);
            ctx.lineTo(toX, toY + 10); // Ajustamos la altura para conectar visualmente
            ctx.stroke();
        }
    
        drawBranch(obstacle1.x, obstacle1.y);
        drawBranch(obstacle2.x, obstacle2.y);
        drawBranch(obstacle3.x, obstacle3.y);
    }
    
    function drawRock(x, y, width, height) {
        if(!Object.values(CURRENT_PATH).includes(rockString)) return;
        if(CURRENT_PATH.left.includes(rockString)) x = position.left.drawX, rockPosition = position.left.key;
        if(CURRENT_PATH.center.includes(rockString)) x = position.center.drawX, rockPosition = position.center.key;
        if(CURRENT_PATH.right.includes(rockString)) x = position.right.drawX, rockPosition = position.right.key;        

        x = perspective * x;
        y /= perspective * 1.4;
        
        width = perspective * width;
        height = perspective * height;

        // Crear forma irregular con Path2D
        const Rock = new Path2D();
        Rock.moveTo(x, y);
        Rock.lineTo(x + width * 0.3, y - height * 0.2);
        Rock.lineTo(x + width * 0.7, y - height * 0.1);
        Rock.lineTo(x + width * .8, y);
        Rock.lineTo(x + width * 0.9, y + height * 0.6);
        Rock.lineTo(x + width * .3, y + height);
        Rock.lineTo(x + width * -.3, y + height * 0.7);
        Rock.closePath();

        // Crear sombreado con gradiente radial
        const gradient = ctx.createRadialGradient(
            x + width / 2, y + height / 2, width / 10,
            x + width / 2, y + height / 2, width
        );
        gradient.addColorStop(0, "#999999");
        gradient.addColorStop(0.5, "#777777");
        gradient.addColorStop(1, "#444444");

        ctx.fillStyle = gradient;
        ctx.fill(Rock);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.stroke(Rock);
    };

    function drawTree(x, y, radius, width, height) {
        if(!Object.values(CURRENT_PATH).includes(treeString)) return;
        if(CURRENT_PATH.left.includes(treeString)) x = position.left.drawX, treePosition = position.left.key;
        if(CURRENT_PATH.center.includes(treeString)) x = position.center.drawX, treePosition = position.center.key;
        if(CURRENT_PATH.right.includes(treeString)) x = position.right.drawX, treePosition = position.right.key;

        x = perspective * x;
        y /= perspective * 1.5;
        radius = perspective * radius * .8;
        width = perspective * width * .8;
        height = perspective * height * .8;

        // Dibujar el tronco con gradiente
        const trunkGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        trunkGradient.addColorStop(0, "#8B5A2B");
        trunkGradient.addColorStop(1, "#5C4033");

        ctx.fillStyle = trunkGradient;
        ctx.fillRect(x - width / 2, y + radius, width, height);

        // Dibujar varias copas para simular un árbol frondoso
        const foliageColors = ["#2E8B57", "#3CB371", "#228B22"];

        const foliage = [
            { offsetX: 0, offsetY: 0 },
            { offsetX: -radius * 0.7, offsetY: radius * 0.2 },
            { offsetX: radius * 0.7, offsetY: radius * 0.2 },
            { offsetX: -radius * 0.4, offsetY: -radius * 0.5 },
            { offsetX: radius * 0.4, offsetY: -radius * 0.5 },
        ];

        foliage.forEach((pos, i) => {
            ctx.beginPath();
            ctx.fillStyle = foliageColors[i % foliageColors.length];
            ctx.arc(x + pos.offsetX, y + pos.offsetY, radius * 0.8, 0, 2 * Math.PI);
            ctx.fill();

            // Sombra ligera
            ctx.strokeStyle = "#1e4d2b";
            ctx.lineWidth = 1;
            ctx.stroke();
        });        
    };

    function drawFence(x, y, width, height) {
        if(!Object.values(CURRENT_PATH).includes(fenceString)) return;
        if(CURRENT_PATH.left.includes(fenceString)) x = position.left.drawX, fencePosition = position.left.key;
        if(CURRENT_PATH.center.includes(fenceString)) x = position.center.drawX, fencePosition = position.center.key;
        if(CURRENT_PATH.right.includes(fenceString)) x = position.right.drawX, fencePosition = position.right.key;

        x = perspective * x - 40;
        y /= perspective * 1.4;
        width = perspective * width * 2;
        height = perspective * height * 2;

        const postCount = 7; // Más listones
        const postWidth = width / postCount * 0.6;
        const postGap = width / postCount * 0.4;

        for (let i = 0; i < postCount; i++) {
            const postX = x + i * (postWidth + postGap);
            const postTop = y;
            const postBottom = y + height;

            // Cuerpo del listón
            const gradient = ctx.createLinearGradient(postX, postTop, postX, postBottom);
            gradient.addColorStop(0, "#deb887");
            gradient.addColorStop(1, "#a0522d");

            ctx.fillStyle = gradient;
            ctx.fillRect(postX, postTop, postWidth, height);

            // Pico triangular en la parte superior
            ctx.beginPath();
            ctx.moveTo(postX, postTop);
            ctx.lineTo(postX + postWidth / 2, postTop - postWidth / 2);
            ctx.lineTo(postX + postWidth, postTop);
            ctx.closePath();
            ctx.fill();

            // Contorno
            ctx.strokeStyle = "#5a2d0c";
            ctx.lineWidth = 2;
            ctx.strokeRect(postX, postTop, postWidth, height);
        }

        // Barrotes horizontales (más gruesos y destacados)
        ctx.fillStyle = "#cd853f";
        const railHeight = height * 0.08;
        ctx.fillRect(x, y + height * 0.3, width, railHeight);
        ctx.fillRect(x, y + height * 0.65, width, railHeight);
    };

    function draw(data) {
        canvas.width = container.offsetWidth - 5;
        recWidth = canvas.width;

        ctx.fillStyle = "#A0522D";
        ctx.fillRect(0, 0, recWidth, 500);
        
        const CHARACTER = data.character[1];
        const ROCK = data.obstacles.rock;
        const TREE = data.obstacles.tree;
        const FENCE = data.obstacles.fence;

        drawPathToObjects(ROCK, TREE, FENCE);
        drawCharacter(CHARACTER);
        characterPathing(data, CHARACTER);

        if(ROCK && ROCK.x) {
            drawRock(ROCK.x, ROCK.y, ROCK.width, ROCK.height)
        }
        if(TREE && TREE.x) {
            drawTree(TREE.x, TREE.y, TREE.radius, TREE.width, TREE.height)
        }
        if(FENCE && FENCE.x) {
            drawFence(FENCE.x, FENCE.y, FENCE.width, FENCE.height)
        }
    };

    function init(data) {
        stateGame(data);
        putCorrectPath();
        console.log("Caminos correctos:", correctPath);
        requestAnimationFrame(() => draw(data));
        window.addEventListener("resize", () => requestAnimationFrame(() => draw(data)));
    };
})()