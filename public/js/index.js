const sortingForm = document.getElementById("sortingForm"); // the enclosed form
const options = document.getElementById("sortBy"); // the options

sortingForm.addEventListener("change", function() {
    // save choice to session storage
    sessionStorage.setItem('sortChoice', options.value);

    sortingForm.submit()
    
});

window.addEventListener("load", function() {
    const savedChoice = sessionStorage.getItem("sortChoice");
    if (savedChoice) {
        options.value = savedChoice;
    }
});