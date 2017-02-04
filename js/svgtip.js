var small = {
  "nodes":[
    {
      "name": "Robin",
      "group": 1
    },
    {
      "name": "Jenny",
      "group": 2
    },
    {
      "name": "Alex",
      "group": 1
    }
  ],
  "links":[
    {
      "source":1,
      "target":2,
      "value": 1
    },
    {
      "source":1,
      "target":3,
      "value": 1
    },
    {
      "source":2,
      "target":3,
      "value": 1
    }
  ]
}

$(function(){
  var graph = {}
  var simpleGraph = {}

  d3.json("data/demo.json", function(error, data){
    graph = new Graph("#graph", data)
    simpleGraph = new Graph("#tooltip", data)
  })

})

function Graph(el, graphData) {
  // set up the D3 visualisation in the specified element
  var w = $(el).innerWidth(),
      h = $(el).innerHeight(),
      graph = graphData

  //Set up the colour scale
  var color = d3.scale.category20()
  
  var svg = d3.select(el)
        .append("div")
        .classed("svg-container", true)
        .append("svg:svg")
        .attr("class", "msx-svg")
        .attr("id", "svg")
        // .attr("pointer-events", "all")
        .attr("viewBox", "0 0 " + w + " " + h)
        // .attr("perserveAspectRatio", "xMinYMid")
        .attr("preserveAspectRatio", "xMinYMin meet")
        // .attr("viewBox", "0 0 600 400")
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .append('svg:g')

  var force = d3.layout.force()
                .charge(-180)
                .linkDistance(200)
                .size([w, h])
                .on("tick", tick)

  //---Insert------
  //Set up tooltip
  // var tip = d3.tip()
  //     .attr('class', 'd3-tip')
  //     .offset([-10, 0])
  //     .html(function (d) {
  //     return  d.name + "</span>";
  // })
  // svg.call(tip);
  //---End Insert---

  //Creates the graph data structure out of the json data
  force.nodes(graph.nodes)
      .links(graph.links)
      .start();

  //Create all the line svgs but without locations yet
  var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function (d) {
          return Math.sqrt(d.value);
      });

  //Do the same with the circles for the nodes - no 
  //Changed
  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag)

  node.append("circle")
      .attr("r", 20)
      .style("fill", function (d) {
          return color(d.group);
      })

  node.on("mousemove", function(d) {
        // console.log("mouse move " + d.name)
        var xPosition = d3.event.pageX + 5;
        var yPosition = d3.event.pageY + 5;

        // var simpleGraph = new SimpleGraph("#tooltip", smallGraph)

        d3.select("#tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");
        // d3.select("#tooltip")
          // .text(d.name);
        
        // simpleGraph = new SimpleGraph("#tooltip", small)

        d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function() {
          $("#tooltip").addClass("hidden");
        })


  var text = node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });
  //End changed
  //
  function tick(d) {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
   
    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    // node.each(collide(0.5));
  }


  //---Insert------
  // Resolves collisions between d and all other circles.
  var padding = 10, // separation between circles
      radius=20;

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(graph.nodes);
    return function(d) {
      var rb = 2*radius + padding,
          nx1 = d.x - rb,
          nx2 = d.x + rb,
          ny1 = d.y - rb,
          ny2 = d.y + rb;
      
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y);
            if (l < rb) {
            l = (l - rb) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
  //---End Insert---
}

function SimpleGraph(el, graphData) {
 
  // set up the D3 visualisation in the specified element
  var w = $(el).innerWidth(),
      h = $(el).innerHeight(),
      graph = graphData

  //Set up the colour scale
  var color = d3.scale.category20()
  
  var svg = d3.select(el)
        .append("div")
        .classed("svg-container", true)
        .append("svg:svg")
        .attr("class", "msx-svg")
        .attr("id", "svg")
        // .attr("pointer-events", "all")
        .attr("viewBox", "0 0 " + w + " " + h)
        // .attr("perserveAspectRatio", "xMinYMid")
        .attr("preserveAspectRatio", "xMinYMin meet")
        // .attr("viewBox", "0 0 600 400")
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .append('svg:g')

  var force = d3.layout.force()
                .charge(-180)
                .linkDistance(200)
                .size([w, h])
                .on("tick", tick)

  //Creates the graph data structure out of the json data
  force.nodes(graph.nodes)
      .links(graph.links)
      .start();

  //Create all the line svgs but without locations yet
  var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function (d) {
          return Math.sqrt(d.value);
      });

  //Do the same with the circles for the nodes - no 
  //Changed
  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag)

  node.append("circle")
      .attr("r", 20)
      .style("fill", function (d) {
          return color(d.group);
      })


  var text = node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });
  //End changed
  //
  function tick(d) {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
   
    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    // node.each(collide(0.5));
  }
}