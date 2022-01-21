var periods = [
  'Neolitikum',
  'Bronsålder',
  'Yngre bronsålder',
  'Järnålder',
  'Äldre Järnålder',
  'Yngre järnålder',
  'Förromersk järnålder',
  'Äldre romersk järnålder',
  'Romersk järnålder',
  'Yngre romersk järnålder',
  'Folkvandringstid',
  'Vendeltid',
  'Vikingatid',
  'Medeltid',
  'Tidigmedeltid',
  'Högmedeltid',
  'Senmedeltid',
  'Modern tid',
  'Tidigmodern tid ',
];

$.getJSON('/finds/cloud.php?fields=period', (data) => {
  data.sort((a, b) => periods.indexOf(a.value) - periods.indexOf(b.value)).forEach((item) => {
      if (!item.value) item.value = 'Odaterad';
      var itemTpl = $('#catalog-overview-item-template').html();
      $('#catalog-overview').append($(microTemplate(itemTpl, item)));
  });
});

var $catalogGrid = $('#catalog .gridPub').masonry({
  itemSelector: '.grid-item-pub',
  percentPosition: true,
  columnWidth: '.grid-sizer-pub',
  gutter: 10
});

function switchPeriod(period) {
  // Update heading.
  $('#catalog-period-title').text(period);

  // Reflect in URL and browser history.
  window.history.pushState({}, document.title, '#finds/catalog/' + period);

  // Reset infinite-scroll and masonry.
  if ($catalogGrid.data('infinite-scroll')) {
      $catalogGrid.infiniteScroll('destroy')
          .off('load.infiniteScroll')
          .masonry('remove', $catalogGrid.children('.grid-item-pub'))
          .masonry('layout');
  }
  // Initialise infinite-scroll.
  $catalogGrid.infiniteScroll({
      path: function() {
          return '/finds/json.php?period=' + (period == 'Odaterad' ? '-' : period) + '&page=' + (this.pageIndex - 1);
      },
      responseType: 'text',
      history: false,
      outlayer: $catalogGrid.data('masonry'),
  });
  // Custom load handler to turn JSON response into HTML and append each element.
  $catalogGrid.on('load.infiniteScroll', function(event, response) {
      var data = JSON.parse(response);
      itemTpl = $('#catalog-item-template').html();
      var itemsHtml = data.map(item => microTemplate(itemTpl, item)).join('');
      $items = $(itemsHtml);
      $catalogGrid.infiniteScroll('appendItems', $items)
          .masonry('appended', $items);
  });

  // Load until the window is filled.
  $catalogGrid.infiniteScroll('loadNextPage')
  $catalogGrid.on('layoutComplete', function(event) {
      if ($(window).height() >= $(document).height()) {
          $catalogGrid.infiniteScroll('loadNextPage');
      }
  });
}

function initCatalog() {
  switchPeriod(periods[0]);
}
