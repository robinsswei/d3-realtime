var data = window.data = {
      "id":"root",
      "name": "APP_GROUP",
      "children":[
        {
          "id": "a1",
          "name": "asgGroup1",
          "children": [
              {   
                "id": "c1",
                "name": "container1"
              },
              {
                "id": "c2",
                "name": "container2"
              },
              {   
                "id": "c3",
                "name": "container3"
              },
              {
                "id": "c4",
                "name": "container4"
              }
          ]
        },
        {
          "id": "a2",
          "name": "asgGroup2",
          "children": [
              {   
                "id": "c5",
                "name": "container5"
              },
              {
                "id": "c6",
                "name": "container6"
              },
              {   
                "id": "c7",
                "name": "container7"
              },
              {
                "id": "c8",
                "name": "container8"
              },
              {   
                "id": "c9",
                "name": "container9"
              },
              {
                "id": "c10",
                "name": "container10"
              }
          ]
        },
        {
          "id": "a3",
          "name": "asgGroup3",
          "children": [
              {   
                "id": "lb1",
                "name": "loadBalancer1",
                "type": "LB"
              },
              {
                "id": "lb2",
                "name": "loadBalancer2",
                "type": "LB"
              }
          ]
        },
        {
          "id": "a4",
          "name": "asgGroup4",
          "children": [
              {   
                "id": "lb3",
                "name": "loadBalancer3",
                "type": "LB"
              },
              {
                "id": "lb4",
                "name": "loadBalancer4",
                "type": "LB"
              }
          ]
        }
      ]
    }


$(function(){
  //variables
  var graph
  var searchArray = []

  function Graph(el, graphData) {

    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
        h = $(el).innerHeight(),
        root = graphData

    var vis = d3.select(el)
            .append("div")
            .classed("svg-container", true)
            .append("svg:svg")
            // .attr("width", w)
            // .attr("height", h)
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
                  .charge(-300)
                  .gravity(0.1)
                  .size([w, h])
                  .on("tick", tick)

    var link = vis.selectAll(".link"),
        node = vis.selectAll(".node");

    // Make it all go
    update()

    function update() {
      var nodes = flatten(root),
          links = d3.layout.tree().links(nodes);

      // Restart the force layout.
      force.nodes(nodes)
           .links(links)
           .linkDistance(function(d) {
              return d.source.id === "root"? 200:80
            })
           .start()

      // Update the links…
      link = link.data(links, function(d) { return d.target.id; });

      // Exit any old links.
      link.exit().remove();

      // Enter any new links.
      link.enter().insert("line", ".node")
          .attr("class", function(d){ return d.source.id === "root" ? "dashlink" : "link" })
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      // Update the nodes…
      node = node.data(nodes, function(d) { return d.id; })

      // Enter any new nodes.
      var nodeEnter = node.enter().append("g")
                      .attr("class", "node")
                      .call(force.drag)

      nodeEnter.append("svg:circle")
          // .attr("cx", function(d) { return d.x; })
          // .attr("cy", function(d) { return d.y; })
          .attr("id", function(d) { return d.id; })
          .attr("r", function(d){ return d.id === "root" ? 50 : 20 })
          .style("fill", color)
          .on("click", click)

      nodeEnter.append("svg:text")
              .attr("class", "textClass")
              // .attr("x", 0)
              // .attr("y", ".31em")
              .text(function (d) {
                return d.name? d.name : d.id
              })

          // Exit any old nodes.
      node.exit().remove()
    }

    function tick() {
      // link.attr("x1", function(d) { return d.source.x; })
      //     .attr("y1", function(d) { return d.source.y; })
      //     .attr("x2", function(d) { return d.target.x; })
      //     .attr("y2", function(d) { return d.target.y; });

      // node.attr("cx", function(d) { return d.x; })
      //     .attr("cy", function(d) { return d.y; });
       node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            link.attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
    }

    // Color leaf nodes orange, and packages white or blue.
    function color(d) {
      return d._children ? "#3182bd" // collapsed package
          : d.children ? "#c6dbef" // expanded package
          : "#fd8d3c"; // leaf node
    }

    // Toggle children on click.
    function click(d) {
      if (!d3.event.defaultPrevented) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update();
      }
    }
  }

  function flatten(root) {
    var nodes = []

    function recurse(node) {
      if (node.children){
        node.children.forEach(recurse);
      }
      nodes.push(node)
    }

    recurse(root)
    return nodes
  }

  graph = new Graph("#graph", data)

  var temp = flattenNodeName(data)
  searchArray = temp.sort()

  function flattenNodeName(root){
    var nodeNames = []
    function recurse(node) {
      if (node.children){
        node.children.forEach(recurse);
      }
      nodeNames.push(node.name)
    }
    recurse(root)
    return nodeNames
  }
  $("#search").autocomplete({
    source: searchArray
  })
  
  $("#search").keypress(function (e) {
   var key = e.which;
   if(key == 13)  // the enter key code
    {
      $("#searchBtn").click();
      return false;  
    }
  })

  $("#searchBtn").on('click', searchNode)

  function searchNode() {
    //find the node
    var search = $("#search")
    var selectedVal = search.val()
    var svg = d3.select("#graph svg")
    var node =svg.selectAll(".node");

    if (selectedVal == "") {
      search.css('border-color', '#FF0000')
      setTimeout(function() {
        search.css('border-width', "1px")
        search.css('border-color', '#fff')
      }, 1000)

    } else if (selectedVal == "none") {
      node.style("stroke", "white").style("stroke-width", "1");
    } else {
        if(_.contains(searchArray, selectedVal)){
          var selected = node.filter(function (d, i) {
              return d.name != selectedVal;
          });
          selected.style("opacity", "0");
          var link = svg.selectAll(".link, .dashlink")
          link.style("opacity", "0");
          svg.selectAll(".node, .link, .dashlink").transition()
              .duration(3000)
              .style("opacity", 1);
        }

    }
  }
})