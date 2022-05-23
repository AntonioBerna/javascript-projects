function getNewColor() {
    var symbols = "0123456789ABCDEF";
    var color = "#";

    for (var i = 0; i < 6; i++) {
        color += symbols[Math.floor(Math.random() * 16)];
    }

    document.body.style.background = color;
    document.getElementById("hex").innerHTML = color;
}