var firstR = document.getElementById("r1");
var secondR = document.getElementById("r2");
var thirdR = document.getElementById("r3");
var fourthR = document.getElementById("r4");
var otd = document.getElementById("oTableData");
otd.innerHTML = "";

function changeRingOne() {
    var d1 = document.getElementById("ring1").value;
    
    switch (d1) {
        case "1":
            firstR.setAttribute("stroke", "brown");
            break;
        case "2":
            firstR.setAttribute("stroke", "red");
            break;
        case "3":
            firstR.setAttribute("stroke", "orange");
            break;
        case "4":
            firstR.setAttribute("stroke", "yellow");
            break;
        case "5":
            firstR.setAttribute("stroke", "green");
            break;
        case "6":
            firstR.setAttribute("stroke", "blue");
            break;
        case "7":
            firstR.setAttribute("stroke", "purple");
            break;
        case "8":
            firstR.setAttribute("stroke", "gray");
            break;
        case "9":
            firstR.setAttribute("stroke", "white");
            break;
    }
}

function changeRingTwo() {
    var d2 = document.getElementById("ring2").value;
    
    switch (d2) {
        case "0":
            secondR.setAttribute("stroke", "black");
            break;
        case "1":
            secondR.setAttribute("stroke", "brown");
            break;
        case "2":
            secondR.setAttribute("stroke", "red");
            break;
        case "3":
            secondR.setAttribute("stroke", "orange");
            break;
        case "4":
            secondR.setAttribute("stroke", "yellow");
            break;
        case "5":
            secondR.setAttribute("stroke", "green");
            break;
        case "6":
            secondR.setAttribute("stroke", "blue");
            break;
        case "7":
            secondR.setAttribute("stroke", "purple");
            break;
        case "8":
            secondR.setAttribute("stroke", "gray");
            break;
        case "9":
            secondR.setAttribute("stroke", "white");
            break;
    }
}

function changeRingThree() {
    var d3 = document.getElementById("ring3").value;
    
    switch (d3) {
        case "0":
            thirdR.setAttribute("stroke", "black");
            break;
        case "1":
            thirdR.setAttribute("stroke", "brown");
            break;
        case "2":
            thirdR.setAttribute("stroke", "red");
            break;
        case "3":
            thirdR.setAttribute("stroke", "orange");
            break;
        case "4":
            thirdR.setAttribute("stroke", "yellow");
            break;
        case "5":
            thirdR.setAttribute("stroke", "green");
            break;
        case "6":
            thirdR.setAttribute("stroke", "blue");
            break;
        case "7":
            thirdR.setAttribute("stroke", "purple");
            break;
        case "8":
            thirdR.setAttribute("stroke", "gray");
            break;
        case "9":
            thirdR.setAttribute("stroke", "white");
            break;
    }
}

function changeRingFour() {
    var d4 = document.getElementById("ring4").value;
    
    if (d4 == 1) {
        fourthR.setAttribute("stroke", "gold");
    } else if (d4 == 2) {
        fourthR.setAttribute("stroke", "silver");
    } else if (d4 == 3) {
        fourthR.setAttribute("stroke", "beige");
    }
}

function showOhm() {
    var plusMinus = '\xB1';
    var omega = '\u03A9';
    
    var firstNum = document.getElementById("ring1").value;
    var secondNum = document.getElementById("ring2").value;
    var thirdNum = document.getElementById("ring3").value;

    if ( (firstNum == "10") || (secondNum == "10") || (thirdNum == "10") ) {
        otd.innerHTML = "Parametri Inseriti Non Validi!";
    } else {

        var zeros;
        switch (thirdNum) {
            case "0":
                zeros = "";
                break;
            case "1":
                zeros = "0";
                break;
            case "2":
                zeros = "00";
                break;
            case "3":
                zeros = "K";
                break;
            case "4":
                zeros = "0 K";
                break;
            case "5":
                zeros = "00 K";
                break;
            case "6":
                zeros = "M";
                break;
            case "7":
                zeros = "0 M";
                break;
            case "8":
                zeros = "00 M";
                break;
            case "9":
                zeros = "G";
                break;
            case "10":
                zeros = "";
                break;
        }

        var fourthNum = document.getElementById("ring4").value;
        var tolerance;
        if (fourthNum == 1) {
            tolerance = plusMinus + "5%";
        } else if(fourthNum == 2) {
            tolerance = plusMinus + "10%";
        } else if (fourthNum == 3) {
            tolerance = plusMinus + "20%";
        } else {
            tolerance = "La tolleranza non è stata modificata";
        }
        
        otd.innerHTML = "";
        var oText = firstNum + secondNum + zeros + omega + " " + tolerance;
        otd.appendChild(document.createTextNode(oText));
    }
}