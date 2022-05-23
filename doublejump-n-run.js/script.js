var isTouch;

const keys = "1234";
const hexValues = "0123456789ABCDEF";

var gameInterval;
var changeKeyTimeout;

var gameMode;
var firstKeyChange;
var lives;
var newKeyCountdown;

var topJumpKey;
var topJumpKeyOld;
var topJumpable;
var bottomJumpKey;
var bottomJumpKeyOld;
var bottomJumpable;

var topNewObsable;
var bottomNewObsable;

var topJumpInterval;
var bottomJumpInterval;

window.onload = function () {
    isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;
    $("#touchControlsTable").hide();
    $("#startButton").focus();
};

function changeMode(mode) {
    gameMode = mode;
    
    $(".modeButton").each(function() {
        $(this).removeClass("selectedMode");
    });
    $("#" + mode + "ModeButton").addClass("selectedMode");
}

function switchTouch() {
    isTouch = !isTouch;
    alert("isTouch: " + isTouch);
}

function newKeys() {
    if (gameMode != "easy" || firstKeyChange == false) {
        if (newKeyCountdown > 1) {
            newKeyCountdown -= 1;
        } else {
            newKeyCountdown = 10;
        
            topJumpKey = keys.charAt(Math.floor(Math.random() * keys.length));
            bottomJumpKey = keys.charAt(Math.floor(Math.random() * keys.length));
    
            while (bottomJumpKey == topJumpKey) {
                bottomJumpKey = keys.charAt(Math.floor(Math.random() * keys.length));
            }

            if (isTouch != true) {
                $("body").off("keydown keyup");
                
                $("body").on("keydown", function (event) {
                    var keyChar = String.fromCharCode(event.keyCode);
        
                    if(keyChar == topJumpKey) {
                        topJumpKeyOld = topJumpKey;
                        clearInterval(topJumpInterval);
                        topJump();
                        topJumpInterval = setInterval(topJump, 1000/30);
                    } else if(keyChar == bottomJumpKey) {
                        bottomJumpKeyOld = bottomJumpKey;
                        clearInterval(bottomJumpInterval);
                        bottomJump();
                        bottomJumpInterval = setInterval(bottomJump, 1000/30);
                    }
                });
                
                $("body").on("keyup", function(event) {                    
                    var keyChar = String.fromCharCode(event.keyCode);
                    
                    if(keyChar == topJumpKeyOld) {
                        clearInterval(topJumpInterval);
                    } else if(keyChar == bottomJumpKeyOld) {
                        clearInterval(bottomJumpInterval);
                    }
                });
            } else {
                $(".touchControls").each(function () {
                    $(this).off("touchstart");
                    
                    $(this).on("touchstart", function() {
                        if (topJumpKey == $(this).text()) {
                            topJump();
                        } else if (bottomJumpKey == $(this).text()) {
                            bottomJump();
                        }
                    });
                    
                    // Disabled because of bad perfomance
                    /*$(this).on("touchstart", function () {
                        if (topJumpKey == $(this).text()) {
                            topJumpKeyOld = topJumpKey;
                            clearInterval(topJumpInterval);
                            topJump();
                            topJumpInterval = setInterval(topJump, 1000/10);
                        }
                        else if (bottomJumpKey == $(this).text()) {
                            bottomJumpKeyOld = bottomJumpKey;
                            clearInterval(bottomJumpInterval);
                            bottomJump();
                            bottomJumpInterval = setInterval(bottomJump, 1000/10);
                        }
                    });
                    $(this).on("touchend", function() {
                        if ($(this).text() == topJumpKeyOld) {
                            clearInterval(topJumpInterval);
                        }
                        else if ($(this).text() == bottomJumpKeyOld) {
                            clearInterval(bottomJumpInterval);
                        }
                    });*/
                });
            }
        
            $("#controlsTextTop").text("Press " + topJumpKey + " to jump.");
            $("#controlsTextBottom").text("Press " + bottomJumpKey + " to jump.");
        
            colorChange();
        }
        
        $("#newKeyCountdownText").text("   ⌨: " + newKeyCountdown + "s");
        changeKeyTimeout = setTimeout(newKeys, 1000);
        
        firstKeyChange = true;
    }
}

function setScore(sc) {
    score = sc;
    $("#scoreText").text("   ★: " + score);

    if (gameMode != "hard") {
        if (score % 1000 === 0) {
            setLives(++lives);
        }
    }
}

function setLives(lv) {
    lives = lv;
    $("#livesText").text("   ❤: " + lives);
}

function dieABit() {
    if(lives > 1) {
        setLives(--lives);
    } else {
        gameOver();
    }
    cameraShake();
}

function cameraShake() {
    $("#field").css("transform", "translate(20px, 20px)");
    setTimeout(function(){
        $("#field").css("transform", "translate(-10px, -10px)");
    }, 100);
    setTimeout(function(){
        $("#field").css("transform", "translate(0px, 0px)");
    }, 200);
}

function colorChange() {
    var colorsList = randomColor();
    var colorDark = colorsList[0];
    var colorLight = colorsList[1];
        
    $("body").css("background-color", colorDark);
    $(".UIText, .controlsText, .touchControls").css("color", colorLight);
    $(".player, #ground").css("background-color", colorLight);
    $(".touchControls").css("border-color", colorLight);
}

function randomColor() {
    var color1 = ["#"];
    var color2 = ["#"];
    
    for (i=0; i < 6; i++) {
        var randInt = Math.floor(Math.random() * (hexValues.length - 7)) + 2;
        color1.push(hexValues.charAt(randInt));
        color2.push(hexValues.charAt(randInt+5));
    }
    
    return [color1.join(""), color2.join("")];
}

function resetVars() {
    topJumpable = bottomJumpable = topNewObsable = bottomNewObsable = topDieable = bottomDieable = true;
    setScore(0);
    setLives(5);
    newKeyCountdown = 0;
}

function topJump() {
    if (topJumpable) {
        topJumpable = false;
        
        var jumpSpeed = -2;
        var startingPos = parseInt($("#playerTop").css("top"))*100 / parseInt($(window).height());
        var pos = parseInt($("#playerTop").css("top"))*100 / parseInt($(window).height());
    
        var i = setInterval(function () {
            $("#playerTop").css("top", pos + jumpSpeed + "%");
            jumpSpeed = jumpSpeed + 0.125;
        
            pos = parseInt($("#playerTop").css("top"))*100 / parseInt($(window).height());
        
            if (pos > startingPos) {
                $("#playerTop").css("top", "50%");
                topJumpable = true;
                clearInterval(i);
            }
        }, 1000/60);
    }
}
function bottomJump() {
    if (bottomJumpable) {        
        bottomJumpable = false;
        
        var jumpSpeed = 2;
        var startingPos = parseInt($("#playerBottom").css("top"))*100 / parseInt($(window).height());
        var pos = parseInt($("#playerBottom").css("top"))*100 / parseInt($(window).height());
    
        var i = setInterval(function () {
            $("#playerBottom").css("top", pos + jumpSpeed + "%");
            jumpSpeed = jumpSpeed - 0.125;
        
            pos = parseInt($("#playerBottom").css("top"))*100 / parseInt($(window).height());
        
            if (pos < startingPos) {
                $("#playerBottom").css("top", "50%");
                bottomJumpable = true;
                clearInterval(i);
            }
        }, 1000/60);
    }
}

function createObstacles () {
    var randInt = Math.floor(Math.random() * 120);
    
    if (newKeyCountdown >= 2) {
        if (randInt == 5 && topNewObsable) {
            topNewObsable = false;
            var newObs = $("<div class='obstacle topObs'></div>");
        
            setTimeout(function () {
                topNewObsable = true;
            }, 500);
        }
        else if (randInt == 10 && bottomNewObsable) {
            bottomNewObsable = false;
            var newObs = $("<div class='obstacle bottomObs'></div>");
        
            setTimeout(function () {
                bottomNewObsable = true;
            }, 500);    
        }
    }
    $("#field").append(newObs);
}

function removeObstacles() {
    $(".obstacle").each(function () {
        var pos = parseInt($(this).css("left")) * 100 / parseInt($(window).height());
        
        if (pos < -10) {
            $(this).remove();
        }
    });
}

function collisionDetection() {
    $(".obstacle").each(function () {
        var obsLeft = parseInt($(this).css("left"));
        var obsRight = obsLeft + parseInt($(this).css("width"));        
        var playerLeft = parseInt($("#playerTop").css("left"));
        var playerRight = playerLeft + parseInt($("#playerTop").css("width"));
        

        if (topDieable && $(this).hasClass("topObs")) {                
            var playerTopBottom = parseInt($("#playerTop").css("top")) + parseInt($("#playerTop").css("height"));
            var obsTop = parseInt($(this).css("top"));

            if (obsLeft < playerRight && obsRight > playerLeft) {
                if (obsTop < playerTopBottom) {
                    topDieable = false;
                    dieABit();
                    setTimeout(function () {
                        topDieable = true;
                    }, 500);
                }
            }
        } else if (bottomDieable && $(this).hasClass("bottomObs")) {    
            var playerBottomTop = parseInt($("#playerBottom").css("top"));
            var obsBottom = parseInt($(this).css("top")) + parseInt($(this).css("height"));
        
            if (obsLeft < playerRight && obsRight > playerLeft) {
                if (obsBottom > playerBottomTop)    {                                    
                    bottomDieable = false;
                    dieABit();
                    setTimeout(function () {
                        bottomDieable = true;
                    }, 500);
                }
            }
        }
    });
}

function update() {
    createObstacles();
    removeObstacles();
    
    setScore(++score);
    collisionDetection();
}

function start() {
    $("#menu, #overlay").fadeOut(1200);
    
    if (isTouch) {
        $("#touchControlsTable").fadeIn(200);
    }
    
    if (gameMode == "easy") {
        $("#newKeyCountdownText").css("display", "none");
    } else {
        $("#newKeyCountdownText").css("display", "table-cell");
    }
    
    resetVars();
    firstKeyChange = false;
    newKeys();
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 2000/60);
}

function gameOver() {
    clearInterval(gameInterval);
    clearTimeout(changeKeyTimeout);
    $("#menu, #overlay").fadeIn(200);
    
    if (isTouch) {
        $("#touchControlsTable").fadeOut(200);
    }
    
    $("#menuHeader").text("GAME OVER");
    $("#menuScore").text("SCORE: " + score);
    $("#startButton").focus();
}