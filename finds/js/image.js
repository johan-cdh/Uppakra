function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    return false;
}

var image = {};
var params = parseParams(window.location.href);
$.getJSON("/finds/json.php", { id: params.id }, (data) => {
    image = data[0];

    // Replace {{vars}} in HTML.
    var $display = $(".image-display-module");
    var $newDisplay = $(microTemplate($display[0].outerHTML, image));
    // Remove missing image.
    if (!parseInt(image.foto)) {
        $(".image-container", $newDisplay).empty();
    }
    $display.replaceWith($newDisplay);

    var $metadataPrimary = $('<div class="row" id="image-metadata-primary">');
    chunk(fields.primary, 2).forEach((props) => {
        // Make a column.
        var $column = $('<div class="twelve columns">');
        // Output each field as markup.
        props.forEach((prop) => {
            $column.append(mkAttribute(image, prop));
        });
        $metadataPrimary.append($column);
    });
    $("#image-metadata").append($metadataPrimary);

    var $metadataSecondary = $(
        '<div class="row" id="image-metadata-secondary">'
    );
    fields.secondary.forEach((props, i) => {
        // Make a column.
        $column = $('<div class="four columns">');
        // Output each field as markup.
        props.forEach((prop) => {
            $column.append(mkAttribute(image, prop));
        });
        $metadataSecondary.append($column);
    });
    $("#image-metadata").append($metadataSecondary);
});

function mkAttribute(image, prop) {
    if (!image[prop]) return undefined;

    var label =
        fields.labels[prop] ||
        prop.charAt(0).toUpperCase() + prop.slice(1);
    
    var value = fields.boolean.includes(prop)
        ? image[prop]
            ? "Ja"
            : "Nej"
        : image[prop].replace(/\n/g, "<br>");
    if (fields.searchable.includes(prop)) {
        value = $(
            '<a href="/#finds/gallery/' + image[prop] + '">'
        ).html(value);
    }
    
    return $('<div class="attribute">')
        .append($('<span class="label">').text(label + ": "))
        .append(value);
}

function toggleFull() {
    $(".image-container").toggleClass("enlarged-display");
}

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

function parseParams(url) {
    var params = {};
    for (kv of url.split("?")[1].split("&")) {
        params[kv.split("=")[0]] = kv.split("=")[1];
    }
    return params;
}

function chunk(list, n = 1) {
    const size = Math.ceil(list.length / n);
    return [...Array(n)].map((_, i) => list.slice(i * size, (i + 1) * size));
}

var fields = {
    primary: ["typ", "kategori", "material", "dekor", "period"],
    secondary: [
        [
            "fyndnr",
            "undertyp",
            "del",
            "fragmentering",
            "antal",
            "fragment",
            "langd",
            "bredd",
            "hojd_tjocklek",
            "diameter",
            "vikt",
        ],
        [
            "datering",
            "datering_mplus",
            "stil",
            "nal",
            "farg",
            "polykrom",
            "form",
            "proveniens",
            "sekundar",
            "dekor_ja",
            "saknas",
            "omrade",
            "intrasis",
        ],
        ["kommentarer", "beskrivning"],
    ],
    labels: {
        fyndnr: "Fyndnummer",
        langd: "Längd (mm)",
        bredd: "Bredd (mm)",
        hojd_tjocklek: "Höjd/tjocklek (mm)",
        diameter: "Diameter (mm)",
        vikt: "Vikt (g)",
        datering_mplus: "Datering Museum+",
        farg: "Färg",
        sekundar: "Sekundär",
        typ_sekundar: "Typ sekundär",
        dekor_ja: "Dekor",
        omrade: "Område",
    },
    boolean: ["polykrom", "sekundar", "dekor_ja", "saknas"],
    /* These fields should be included in the search in json.php */
    searchable: [
        "sakord",
        "typ",
        "material",
        "del",
        "fragmentering",
        "period",
        "dekor",
        "form",
        "kategori",
        "intrasis",
    ],
};
