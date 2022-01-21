/** Handle single-page paths in the hash (#) part of the url. */
function navigate(path) {
    // Load content into the associated div.
    var defaultPath = 'finds';
    var id = path.split('/')[0] || defaultPath;
    var $container = $('#' + id)
    $container.load($($container).data('open'), () => {
        // On subsequent browsing, If given a path, reflect it in url and scroll to content.
        if (path) {
            window.history.pushState({}, document.title, '#' + path);
            scrollToSection();
        }
    });

    // Show only the associated div.
    $('#main').children().each(function () {
        $(this).toggle(this.id === id);
    });

}

$(document).ready(() => {
    navigate(window.location.hash.slice(1));
});

// micro templating, sort-of
function microTemplate(src, data) {
    // replace {{tags}} in source
    return src.replace(/\{\{([\w\-_\.]+)\}\}/gi, function (match, key) {
        // walk through objects to get value
        var value = data;
        key.split(".").forEach(function (part) {
            value = value[part];
        });
        return value;
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function init() {
    window.addEventListener("scroll", function (e) {
        var distanceY =
                window.pageYOffset || document.documentElement.scrollTop,
            growOn = 300;
        $("#foot").toggleClass("bigger", distanceY > growOn);
    });
}
window.onload = init();

function scrollToSection() {
    $("html, body").animate(
        { scrollTop: $(".arrow").offset().top + 90 },
        "slow"
    );
    return false;
}

function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    return false;
}

function scrollToArchive() {
    $("html, body").animate(
        { scrollTop: $("#ArchiveViewOptions").offset().top - 30 },
        "slow"
    );
}
