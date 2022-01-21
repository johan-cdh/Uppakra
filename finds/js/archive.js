var views = ["gallery", "catalog", "cloud"];
var inits = {
    catalog: initCatalog,
    gallery: initGallery,
};
var exits = {
    gallery: exitGallery,
};

// Function for switching between the views (sub-pages) on the front page.
var activeView = "";
function switchView(name) {
    activateView(name)
    // Reflect in URL and browser history.
    window.history.pushState({}, document.title, "#finds/" + name);
}

function activateView(name) {
    if (name == activeView) return;
    var exitingView = activeView;
    activeView = name;

    // Show only the selected view, and indicate the active view link.
    views.forEach((name2) => {
        $("#" + name2).hide();
        $("#" + name2 + "Button").removeClass("selected");
    });
    $("#" + name).show();
    $("#" + name + "Button").addClass("selected");

    // Each view can have an initializer and/or exit function.
    if (inits[name]) inits[name].apply();
    if (exits[exitingView]) exits[exitingView].apply();
}

// The hash can contain a view name and subpath.
function navigateHash() {
    // The first segment of the slash-separated path is "archive", the second is the view name.
    var path = document.location.hash
        .slice(1)
        .split("/")
        .map(decodeURIComponent);
    path.shift();
    if (views.includes(path[0])) {
        switchView(path[0]);
        scrollToArchive();
        // The catalog view can have a period subpath.
        if (path[0] == "catalog" && path[1]) {
            switchPeriod(path[1]);
        }
        if (path[0] == "gallery" && path[1]) {
            enterSearch(path[1])
        }
    } else {
        // Open the gallery view by default, but without changing url.
        activateView("gallery");
    }
}

// Parse and follow the hash on first load and when going back to this page from another one.
navigateHash();
window.onpopstate = () => navigateHash();

$(document).ready(function () {
    var classCycle = [
        "imageCycle1",
        "imageCycle2",
        "imageCycle3",
        "imageCycle4",
        "imageCycle5",
        "imageCycle6",
        "imageCycle7",
        "imageCycle8",
        "imageCycle8",
        "imageCycle10",
    ];

    var randomNumber = Math.floor(Math.random() * classCycle.length);
    var classToAdd = classCycle[randomNumber];

    $("#hero").addClass(classToAdd);
});

$(window).scroll(function () {
    $("#filtertrigger").each(function () {
        var imagePos = $(this).offset().top;
        var topOfWindow = $(window).scrollTop();
        if (imagePos < topOfWindow + 600) {
            $(this).addClass("hatch");
        }
    });
});

$(window).click(function () {
    $("#filtertrigger").each(function () {
        $(this).addClass("hatch");
    });
});

$(document).ready(function () {
    $("#filter").show(!!$('#search-text').val())
    $("#filtertrigger").click(function () {
        $("#filter").slideDown();
        $("#search-text").focus();
    });
    $("#search-text").focus(() => {
        switchView("gallery");
    });
});

function scrollToFilter() {
    $("html, body").animate(
        { scrollTop: $("#filtertrigger").offset().top - 40 },
        "slow"
    );
    return false;
}
