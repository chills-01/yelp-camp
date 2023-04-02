const sortingForm = document.getElementById("sortingForm"); // the enclosed form
const options = document.getElementById("sortBy"); // the options

// submit form on change
sortingForm.addEventListener("change", function() {
    sortingForm.submit()   
});

window.addEventListener("load", function() {
    // gets sortBy from query string / defaults to highest rated
    // could also assign active in the ejs
    const queryParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const sortBy = queryParams.sortBy;
    options.value = sortBy || "highRate";
});