const sortingForm = document.getElementById("sortingForm"); // the enclosed form
const options = document.getElementById("sortBy"); // the options

sortingForm.addEventListener("change", function() {
    // save choice to session storage
    sessionStorage.setItem('sortBy', options.value);

    sortingForm.submit()
    
});

window.addEventListener("load", function() {
    // gets sortBy from query string / defaults to rated
    // could also assign active in the ejs
    const queryParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const sortBy = queryParams.sortBy;
    console.log(sortBy)
    options.value = sortBy || "highRate";
});