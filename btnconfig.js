document.addEventListener("DOMContentLoaded", function() {
    const configButton = document.getElementById("Configbtn");
    const configContainer = document.getElementById("Config");
    
    configButton.addEventListener("click", function() {
        if (configContainer.style.display === "none") {
            configContainer.style.display = "flex";
        } else {
            configContainer.style.display = "none";
        }
    });
});
