compatibilityModeOn = false;

window.onload = function () {
    document.getElementById("button-play").addEventListener("click", function () {
        document.getElementById("homescreen").style.display = "none";
        runGame();
    });
};

function runGame() {
    document.getElementById("button-restart").addEventListener("click", function (e) {
        this.style.display = "none";
        restartGame();
        e.preventDefault();
    }, false);

    var output = document.getElementById("info");
    var camera, scene, renderer;
    var cb = document.getElementsByTagName("input")[0];

    // Cannon.js
    var world, blocks = [], bodies = [];
    var checked, scoreCount = 0;

    var toDelete = [];
    function deleteRubble(body) {
        if (alreadyAdded(body)) { return; }

        toDelete.push(body);
        function alreadyAdded(bod) {
            for (var i = 0; i < toDelete.length; i++) {
                if (bod.id == toDelete[i].id) {
                    return true;
                }
            }
            return false;
        }
    }

    function getBodyIndex(body) {
        for (var i = 0; i < bodies.length; i++) {
            if (body.id == bodies[i].id) {
                return i;
            }
        }
        return -1;
    }

    var combo;
    var tessellation = 0;
    var colorStep = 10;
    var gameStarted = false;

    var ERROR_MARGIN = 0.2;
    var BLOCK_SIZE = 5, borderBounds = 10, COMBO_START_GAIN = 2, STACK_BOUNDS_GAIN = 0.5;

    var speed = 0.17;
    var camFac = 0.013;
    var endFac = 0;
    var zoomOut = false;

    var colorVal = 228;

    var currentBlock, movingOnX = false, moveDir = 1, gameOver = false;
    var stackBounds = new THREE.Vector3(BLOCK_SIZE, 1, BLOCK_SIZE);
    var lastBlockPosition = new THREE.Vector3(), secondaryPosition = 0, blockTransition = -borderBounds;
    var geometry;

    // Create Renderer / Canvas
    if (compatibilityModeOn) {
        renderer = new THREE.CanvasRenderer({canvas: document.getElementById("canvas"), antialias: false});
        tessellation = 4;
        geometry = new THREE.BoxGeometry(1, 1, 1, tessellation, 1, tessellation);
    } else {
        renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas"), antialias: false});
        renderer.shadowMap.enabled = false;
        tesselation = 0;
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    renderer.setClearColor(0x0991C7);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create Scene
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(
        -window.innerWidth * camFac,
        window.innerWidth * camFac,
        window.innerHeight * camFac,
        -window.innerHeight * camFac,
        -10,
        2000
    );
    camera.position.x = 3;
    camera.position.y = 4;
    camera.position.z = 3;
    camera.lookAt(new THREE.Vector3());
    camera.position.y = 10;

    setUpWorld();

    function registerEvents() {
        cb.addEventListener("click", function () {
            checked = cb.checked;
        }, true);

        window.addEventListener("resize", function () {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.left = -window.innerWidth * camFac;
            camera.right = window.innerWidth * camFac;
            camera.top = window.innerHeight * camFac;
            camera.bottom = -window.innerHeight * camFac;
            camera.updateProjectionMatrix();
        }, false);

        renderer.domElement.addEventListener("mousedown", function () {
            if (gameOver) { return; }

            if (placeBlock()) {
                addNewBlock();
                scoreCount++;
                out(scoreCount);
            } else {
                endGame();
            }
        }, false);
    }

    function moveBlock() {
        var pos = currentBlock.position;

        if (movingOnX) {
            if (pos.x <= -borderBounds) {
                moveDir = 1;
            } else if (pos.x >= borderBounds) {
                moveDir = -1;
            }
            blockTransition += moveDir * speed;
            currentBlock.position.set(blockTransition, scoreCount, secondaryPosition);
        } else {
            if (pos.z <= -borderBounds) {
                moveDir = 1;
            } else if (pos.z >= borderBounds) {
                moveDir = -1;
            }
            blockTransition += moveDir * speed;
            currentBlock.position.set(secondaryPosition, scoreCount, blockTransition);
        }
    }

    function addNewBlock() {
        lastBlockPosition = currentBlock.position;
        colorVal = colorVal - colorStep <= 0 ? 360 : colorVal - colorStep;
        var material = new THREE.MeshLambertMaterial({color: "hsl(" + colorVal + ", 20%, 50%)"});

        block = new THREE.Mesh(geometry, material);
        block.scale.x = currentBlock.scale.x;
        block.scale.y = 1;
        block.scale.z = currentBlock.scale.z;
        block.position.y = scoreCount;

        if (movingOnX) {
            block.position.x = -borderBounds;
        } else {
            block.position.z = -borderBounds;
        }
        scene.add(block);

        if (!compatibilityModeOn) {
            block.castShadow = false;
            block.receiveShadow = false;
            var boxShape = new CANNON.Box(new CANNON.Vec3(currentBlock.scale.x / 2, currentBlock.scale.y / 2, currentBlock.scale.z / 2));
            var boxMaterial = new CANNON.Material();
            var boxBody = new CANNON.Body({mass: 0, shape: boxShape, material: boxMaterial});
            boxBody.position.copy(currentBlock.position);
            world.add(boxBody);
        }
        currentBlock = block;
    }

    function createRubble(pos, scale) {
        var material = new THREE.MeshLambertMaterial({color: "hsl(" + colorVal + ", 20%, 50%)"});
        var block = new THREE.Mesh(geometry, material);
        block.useQuaternions = true;
        block.scale.copy(scale);
        scene.add(block);
        blocks.push(block);

        var boxShape = new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2));
        var boxMaterial = new CANNON.Material();
        var boxBody = new CANNON.Body({mass: 0.5, shape: boxShape, material: boxMaterial});
        boxBody.position.copy(pos);
        world.add(boxBody);
        bodies.push(boxBody);
    }

    function placeBlock() {
        if (!currentBlock) { return; }

        if (movingOnX) {
            var diffX = lastBlockPosition.x - currentBlock.position.x;
            if (Math.abs(diffX) > ERROR_MARGIN) {
                combo = 0;
                stackBounds.x -= Math.abs(diffX);
                
                if (stackBounds.x <= 0) {
                    return false;
                }

                var middle = lastBlockPosition.x + currentBlock.position.x / 2;
                currentBlock.scale.set(stackBounds.x, 1, stackBounds.z);
                createRubble(
                    new THREE.Vector3((currentBlock.position.x > 0)
                        ? currentBlock.position.x + (currentBlock.scale.x / 2)
                        : currentBlock.position.x - (currentBlock.scale.x / 2)
                        , currentBlock.position.y
                        , currentBlock.position.z
                    ),
                    new THREE.Vector3(Math.abs(diffX), 1, currentBlock.scale.z)
                );
                currentBlock.position.set(middle - (lastBlockPosition.x / 2), scoreCount, lastBlockPosition.z);
            } else {
                if (combo >= COMBO_START_GAIN) {
                    stackBounds.x += STACK_BOUNDS_GAIN;
                    stackBounds.x = Math.min(stackBounds.x, BLOCK_SIZE)

                    var middle = lastBlockPosition.x + currentBlock.position.x / 2;
                    currentBlock.scale.set(stackBounds.x, 1, stackBounds.z);
                    currentBlock.position.set(middle - (lastBlockPosition.x / 2), scoreCount, lastBlockPosition.z);
                }
                combo++;
                currentBlock.position.set(lastBlockPosition.x, scoreCount, lastBlockPosition.z);
            }
        } else {
            var diffZ = lastBlockPosition.z - currentBlock.position.z;
            if (Math.abs(diffZ) > ERROR_MARGIN) {
                combo = 0;
                stackBounds.z -= Math.abs(diffZ);

                if (stackBounds.z <= 0) {
                    return false;
                }

                var middle = lastBlockPosition.z + currentBlock.position.z / 2;
                currentBlock.scale.set(stackBounds.x, 1, stackBounds.z);
                createRubble(
                    new THREE.Vector3(currentBlock.position.x
                        , currentBlock.position.y
                        , (currentBlock.position.z > 0)
                            ? currentBlock.position.z + (currentBlock.scale.z / 2)
                            : currentBlock.position.z - (currentBlock.scale.z / 2)
                    ),
                    new THREE.Vector3(currentBlock.scale.x, 1, Math.abs(diffZ))
                );
                currentBlock.position.set(lastBlockPosition.x, scoreCount, middle - (lastBlockPosition.z / 2));
            } else {
                if (combo >= COMBO_START_GAIN) {
                    stackBounds.z += STACK_BOUNDS_GAIN;
                    stackBounds.z = Math.min(stackBounds.z, BLOCK_SIZE)

                    var middle = lastBlockPosition.z + currentBlock.position.z / 2;
                    currentBlock.scale.set(stackBounds.x, 1, stackBounds.z);
                    currentBlock.position.set(lastBlockPosition.x, scoreCount, middle - (lastBlockPosition.z / 2));
                }
                combo++;
                currentBlock.position.set(lastBlockPosition.x, scoreCount, lastBlockPosition.z);
            }
        }
        blockTransition = -borderBounds;
        moveDir = 1;
        secondaryPosition = (movingOnX) ? currentBlock.position.x : currentBlock.position.z;
        movingOnX = !movingOnX;
        return true;
    }

    function endGame() {
        gameOver = true;
        blocks.push(currentBlock);

        var boxShape = new CANNON.Box(new CANNON.Vec3(currentBlock.scale.x / 2, currentBlock.scale.y / 2, currentBlock.scale.z / 2));
        var boxMaterial = new CANNON.Material();
        var boxBody = new CANNON.Body({mass: 0.5, shape: boxShape, material: boxMaterial});
        boxBody.position.copy(currentBlock.position);
        world.add(boxBody);
        boxBody.addEventListener("collide", function (e) {
            //alert("Collided with ground!");
        });
        bodies.push(boxBody);
        boxBody.angularVelocity.set(0.1, 0.2, 0);
        endFac = 0.015 + scoreCount / 700;
        zoomOut = true;
        out("Game Over!<br>Score: " + scoreCount);

        setTimeout(function () {
            document.getElementById("button-restart").style.display = "block";
        }, 1000);
    }

    function out(text) {
        output.innerHTML = text;
    }

    function lerp(value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    }

    function deleteFromList() {
        for (var i = 0; i < toDelete.length; i++) {
            var index = getBodyIndex(toDelete[i]);
            world.remove(bodies[index]);
            scene.remove(blocks[index]);
            bodies.splice(index, 1);
            blocks.splice(index, 1);
        }
        toDelete = [];
    }

    function setUpWorld() {
        world = new CANNON.World();
        world.broadphase = new CANNON.NaiveBroadphase();
        world.gravity.set(0, -15, 0);

        var planeShape = new CANNON.Plane();
        var planeMaterial = new CANNON.Material();
        var planeBody = new CANNON.Body({mass: 0, shape: planeShape, material: planeMaterial});
        planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        planeBody.position.y = -13;
        planeBody.addEventListener("collide", function (e) {
            deleteRubble(e.body);
        });
        world.add(planeBody);

        var color = new THREE.Color("hsl(" + colorVal + ", 20%, 50%)");

        var light = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(light);

        var light = new THREE.SpotLight(0xffffff, 0.5);
        light.position.set(100, 150, 200);
        light.castShadow = false;
        scene.add(light);

        var material1 = new THREE.MeshLambertMaterial({color: color});
        foundation = new THREE.Mesh(geometry, material1);
        foundation.scale.x = 5;
        foundation.scale.y = 11;
        foundation.scale.z = 5;
        foundation.position.y = -6;

        scene.add(foundation);
        currentBlock = foundation;

        addNewBlock();
    }

    function restartGame() {
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        while (world.bodies.length > 0) {
            world.removeBody(world.bodies[0]);
        }

        lastBlockPosition = new THREE.Vector3();
        blockTransition = -borderBounds;
        stackBounds = new THREE.Vector3(BLOCK_SIZE, 1, BLOCK_SIZE);
        secondaryPosition = 0;
        blocks = [];
        bodies = [];
        colorVal = 228;

        setUpWorld();

        scoreCount = 0;
        endFac = 0.012;

        out(0);
        gameOver = false;
    }

    function animate() {
        if (!gameStarted) { return; }

        requestAnimationFrame(animate);
        if (!gameOver) {
            moveBlock();
        }
        
        deleteFromList();
        world.step(1.0 / 60.0);
        for (var i = 0, j = blocks.length; i < j; i++) {
            var block = blocks[i];
            var body = bodies[i];
            block.position.copy(body.position);
            block.quaternion.copy(body.quaternion);
        }
        render();
    }

    function render() {
        camera.position.y = lerp(camera.position.y, scoreCount, 0.05) + 0.2;

        if (zoomOut) {
            camFac = lerp(camFac, endFac, 0.05);
            camera.left = -window.innerWidth * camFac;
            camera.right = window.innerWidth * camFac;
            camera.top = window.innerHeight * camFac;
            camera.bottom = -window.innerHeight * camFac;
            camera.updateProjectionMatrix();
        }
        
        var cam = checked ? camera : camera;
        renderer.render(scene, cam);
    }
    registerEvents();
    gameStarted = true;
    animate();
}