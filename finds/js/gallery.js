var search = {
  index: [],
  timeoutId: null,
};

// Fetch and store all keywords on first input.
$('#search-text').on('input', () => {
  if (!search.index.length) {
      $.getJSON('/finds/cloud.php', data => {
          search.index = data;
          showSuggestions();
      });
  } else {
      showSuggestions();
  }
});

function showSuggestions() {
  var term = $('#search-text').val();
  // Match the start of words.
  var suggestions = search.index.filter(item => new RegExp('\\b' + escapeRegExp(term), 'i').test(item.value));
  var suggestions = Array.from(new Set(suggestions.map(item => item.value))).sort((a, b) => a.localeCompare(b));
  // Show nothing if entered text is too short, or there are too many matching suggestions.
  if (term.length < 2 || suggestions.length > 20) {
      $('#search-suggestions').empty().hide();
      return;
  }
  $('#search-suggestions')
      .empty()
      .append(...suggestions.map(word =>
          // When clicking a word, fill the text field and trigger search.
          $('<span class="suggestion">')
              .text(word)
              .click(() => $('#search-text').val(word).change())
      ))
      .show();
}

/** Enter a search term and go! */
function enterSearch(term) {
    // First make sure the search box is showing.
    $('#filtertrigger').click();
    $('#search-text')
        // .focus()
        .val(term)
        .change();
}

/** Perform search when the input is changed, including enter is pressed. */
$('#search-text').change((ev) => {
    doSearch();
    // Reflect search term in url
    window.history.pushState({}, document.title, '#finds/gallery/' + $('#search-text').val())
})

var $grid;
$(document).ready(() => {
    /* gutter: '.grid__gutter-sizer', */
    $grid = $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        gutter: 1,
        percentPosition: true,
        // nicer reveal transition
        visibleStyle: { transform: 'translateY(0)', opacity: 1 },
        hiddenStyle: { transform: 'translateY(100px)', opacity: 0 },
    });
});

//------------------//

function initGallery(search) {
    // Trigger search.
    doSearch();
}

/** Queue a search. */
function doSearch() {
    // Avoid triggering two searches immediately after each other,
    // e.g. when levaing the search field in order to click a suggestion.
    if (search.timeoutId) {
        clearTimeout(search.timeoutId);
    }
    search.timeoutId = setTimeout(() => loadSearch($('#search-text').val()), 200);
}

/** Perform a search and load the results. */
function loadSearch(search) {
    // Destroy any earlier instance, e.g. when searching.
    resetSearch();

    $grid.infiniteScroll({
        path: function() {
            return '/finds/json.php?'
                + (search ? 'search=' + search : '')
                + '&page=' + (this.pageIndex - 1)
                + '&seed=' + window.performance.timing.requestStart;
        },
        // load response as flat text
        responseType: 'text',
        outlayer: $grid.data('masonry'),
        status: '.page-load-status',
        history: false,
    });

    // Custom load handler to turn JSON response into HTML and append each element.
    $grid.on( 'load.infiniteScroll', function( event, response ) {
        // parse response into JSON data
        var data = JSON.parse( response );
        // compile data into HTML
        var itemsHTML = data.map( getItemHTML ).join('');
        // convert HTML string into elements
        var $items = $( itemsHTML );
        // append item elements
        $items.imagesLoaded( function() {
            $grid.infiniteScroll( 'appendItems', $items )
                .masonry( 'appended', $items );
        })
    });

    // Load until the window is filled.
    $grid.infiniteScroll('loadNextPage')
    $grid.on('layoutComplete', function(event) {
        if ($(window).height() >= $(document).height()) {
            $grid.infiniteScroll('loadNextPage');
        }
    });
}

function resetSearch() {
    if ($grid.data('infinite-scroll')) {
        $grid.infiniteScroll('destroy');
        $grid.off('load.infiniteScroll');
    }
    if ($grid.data('masonry')) {
        $grid.masonry('remove', $('.grid-item', $grid)).masonry('layout');
    }
}

function exitGallery() {
    resetSearch();
}

//------------------//

var itemTemplateSrc = $('#photo-item-template').html();

function getItemHTML( photo ) {
  return microTemplate( itemTemplateSrc, photo );
}
