$.getJSON('/finds/cloud.php', data => {
  var words = data.map(item => ({
      text: item.value,
      size: Math.log(item.count) * 10,
      cat: item.field,
  }));

  var cats = Array.from(new Set(data.map(item => item.field)));
  var colors = [
      '#5EC2C0', // teal
      '#4B96CF', // blue
      '#9F3A60', // crimson
      '#DF7F5E', // brick
      '#B69C84', // tan
      '#787878', // gray
      '#5D587B', // dark gray
      '#969E4C', // gold
  ];
  function catColor(cat) {
      return colors[cats.indexOf(cat)];
  }

  var layout = d3.layout.cloud()
      .size([$(window).width() * .9, $(window).height() - 350])
      .words(words)
      .padding(5)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font('"Open Sans Condensed", sans-serif')
      .fontSize(function(d) { return d.size; })
      .on("end", draw);

  layout.start();

  function draw(words) {
      d3.select("#cloud").append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", function(d) { return catColor(d.cat); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; })
          .on('click', function(ev, d) {
              enterSearch(d.text);
          })
          .on('mouseover', function(ev, d) {
              d3.select(this).style("font-size", d => d.size * 1.2 + "px");
          })
          .on('mouseout', function(ev, d) {
              d3.select(this).style("font-size", d => d.size + "px");
          })
  }
});
