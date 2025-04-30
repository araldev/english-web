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

    let startCharacterY = 430;        
    let splitCharacterY = 350;
    let endCharacterY = 200;

    const drawLeftX = 100;
    const drawCenterX = 280;
    const drawRightX = 450;

    let level = 1;
    const maxLevel = 10;
    let regexLevel;
    let CURRENT_LEVEL;
    let path = 1;
    const maxPath = 10;
    let regexPath;
    let CURRENT_PATH;

    const position = {
        left: "left",
        center: "center",
        right: "right",
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
// Solucionar handleCorrectPath() y putCorrectPath()
    function handleCorrectPath(data, CHARACTER) {
        return (e) => {
            if(e.key !== keyDown.arrowLeft && e.key !== keyDown.arrowUp && e.key !== keyDown.arrowRight) return;
            // console.log(e.key);
            putCorrectPath(CHARACTER);
    
            let index;
            if(e.key === keyDown.arrowLeft){
                if(
                    correctPath.some((path, i) => {
                        index = i;
                        return path === 1;
                    })
                ) {
                    drawCharacter(CHARACTER);
                    correctPath.splice(indexCorrectPath, 1);
                    path++;
                    if(path > maxPath) level++, path = 1;            
                    init(data);
                } else {
                    correctPath.splice(indexCorrectPath, 1);
                    throw new Error("You miss...");
                }
            };
    
            if(e.key === keyDown.arrowUp){
                if (
                    correctPath.some((path, i) => {
                        index = i;
                        return path === 2;
                    })
                ) {
                    drawCharacter(CHARACTER);
                    correctPath.splice(indexCorrectPath, 1);
                    path++;
                    if(path > maxPath) level++, path = 1; 
                    init(data);
                } else {
                    correctPath.splice(indexCorrectPath, 1);
                    throw new Error("You miss...");
                }
            };
    
            if(e.key === keyDown.arrowRight){
                if(
                    correctPath.some((path, i) => {
                        index = i;
                        return path === 3;
                    })
                ) {
                    drawCharacter(CHARACTER);
                    correctPath.splice(indexCorrectPath, 1);
                    path++;
                    if(path > maxPath) level++, path = 1; 
                    init(data);
                } else {
                    correctPath.splice(indexCorrectPath, 1);
                    throw new Error("You miss...");
                }
            };
        };
    };
    
    function putCorrectPath(CHARACTER) {
        let activate = false;
        
        CURRENT_LEVEL.if.forEach((condition, i) => {
            if(
                (condition.hasOwnProperty(rockString) && rockPosition === position.left && !activate) ||
                (condition.hasOwnProperty(treeString) && treePosition === position.left && !activate) ||
                (condition.hasOwnProperty(fenceString) && fencePosition === position.left && !activate)
            ) {
                activate = true;
                correctPath.push(1);
                indexCorrectPath = correctPath.length - 1;
                // console.log("CorrectPath Rock Left", correctPath);
                
                if(condition.go === position.left) {
                    correctPath[i] = correctPath[i] - 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                } else if(condition.else === position.left) {
                    correctPath[i] = 1;
                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                };
                
                if(condition.go === position.center) {
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                } else if(condition.else === position.center) {
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                };

                if(condition.go === position.right) {
                    correctPath[i] = correctPath[i] + 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                } else if(condition.else === position.right) {
                    correctPath[i] = 3;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                };
            };

            if(
                (condition.hasOwnProperty(rockString) && rockPosition === position.center && !activate) ||
                (condition.hasOwnProperty(treeString) && treePosition === position.center && !activate) ||
                (condition.hasOwnProperty(fenceString) && fencePosition === position.center && !activate) 
            ) {
                
                activate = true;
                correctPath.push(2);
                indexCorrectPath = correctPath.length - 1;
                // console.log("CorrectPath Rock center", correctPath);

                if(condition.go === position.left) {                        
                    correctPath[i] = correctPath[i] - 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                } else if(condition.else === position.left) {
                    correctPath[i] = 1;
                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                };

                if(condition.go === position.center) {                        
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                } else if(
                    (condition.else === position.center && rockPosition !== position.center) 
                ) {
                    console.log("funciona");
                    
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                };

                if(condition.go === position.right) {                        
                    correctPath[i] = correctPath[i] + 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                } else if(condition.else === position.right) {
                    correctPath[i] = 3;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                };
                // console.log("CorrectPath Rock center", correctPath);
            };

            if(
                (condition.hasOwnProperty(rockString) && rockPosition === position.right && !activate) ||
                (condition.hasOwnProperty(treeString) && treePosition === position.right && !activate) ||
                (condition.hasOwnProperty(fenceString) && fencePosition ===position.right && !activate)
            ) {
                activate = true;
                correctPath.push(3);
                indexCorrectPath = correctPath.length - 1;
                console.log("CorrectPath Rock Right", correctPath);
                
                if(condition.go === position.left) {
                    correctPath[i] = correctPath[i] - 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                } else if(condition.else === position.left) {
                    correctPath[i] = 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawLeftX;
                };

                if(condition.go === position.center) {
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                }else if(condition.else === position.center) {
                    correctPath[i] = 2;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawCenterX;
                };

                if(condition.go === position.right) {
                    correctPath[i] = correctPath[i] + 1;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                } else if(condition.else === position.right) {
                    correctPath[i] = 3;

                    CHARACTER.y = splitCharacterY;
                    CHARACTER.y = endCharacterY;
                    CHARACTER.y /= perspective * 1.7;
                    CHARACTER.x = perspective * drawRightX;
                };
            };
            // console.log("putCorrectPath activate: ", activate);
        });
    };
    
    // let characterPathingActive = false;
    function characterPathing(data, CHARACTER) {
        // characterPathingActive = characterPathingActive === false ? true : false;
        // if(characterPathingActive) return;

        document.addEventListener("keydown", handleCorrectPath(data, CHARACTER));
    };
    
    let activate = false;
    function drawCharacter(CHARACTER) {
            if(!activate) {
                CHARACTER.x = (recWidth / 2) - (CHARACTER.width / 2);
                CHARACTER.y = startCharacterY;
            };

            ctx.fillStyle = "Black";
            ctx.fillRect(CHARACTER.x, CHARACTER.y, CHARACTER.width, CHARACTER.height);
            activate = activate ===  false ? true : false;
            // console.log("drawCharacter activate: ", activate);   
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
        if(CURRENT_PATH.left.includes(rockString)) x = drawLeftX, rockPosition = position.left;
        if(CURRENT_PATH.center.includes(rockString)) x = drawCenterX, rockPosition = position.center;
        if(CURRENT_PATH.right.includes(rockString)) x = drawRightX, rockPosition = position.right;        

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
        if(CURRENT_PATH.left.includes(treeString)) x = drawLeftX, treePosition = position.left;
        if(CURRENT_PATH.center.includes(treeString)) x = drawCenterX, treePosition = position.center;
        if(CURRENT_PATH.right.includes(treeString)) x = drawRightX, treePosition = position.right;

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
        if(CURRENT_PATH.left.includes(fenceString)) x = drawLeftX, fencePosition = position.left;
        if(CURRENT_PATH.center.includes(fenceString)) x = drawCenterX, fencePosition = position.center;
        if(CURRENT_PATH.right.includes(fenceString)) x = drawRightX, fencePosition = position.right;

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
        requestAnimationFrame(() => draw(data));
        window.addEventListener("resize", () => requestAnimationFrame(() => draw(data)));
    };
})()