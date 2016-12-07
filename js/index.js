// main entry of the application
var graphData = {
  nodes:[
    {id: "n1", name: "Cause"},
    {id: "n2", name: "Effect"},
    {id: "n3", name: "Robin"}
  ],
  links:[
    {source: "n1", target:"n2", id: "e1"},
    {source: "n1", target:"n3", id: "e2"},
    {source: "n2", target:"n3", id: "e3"},
  ]
}

var testData = {
  nodes:[
    {id: "n1", name: "Cause"},
    {id: "n2", name: "Effect"},
    {id: "n3", name: "Blueberry"},
    {id: "n4", name: "Apple"},
    {id: "n5", name: "Banana"},
  ],
  links:[
    {source: "n1", target:"n2", id: "e1"},
    {source: "n1", target:"n3", id: "e2"},
    {source: "n2", target:"n3", id: "e3"},
    {source: "n3", target:"n4", id: "e4"},
    {source: "n4", target:"n5", id: "e5"},
  ]
}

$(function(){
  var graph;
  function myGraph(el) {
    this.init = function (data) {
      if(data !== undefined){
        if(data.hasOwnProperty("nodes")){
          if(Array.isArray(data.nodes)){
            data.nodes.forEach(function(nodeObj){
              nodes.push(nodeObj)
            })
          }
        }
        if(data.hasOwnProperty("links")){
          if(Array.isArray(data.links)){
            data.links.forEach(function(linkObj){
              links.push({"source": findNodeById(linkObj.source), "target": findNodeById(linkObj.target), "id": linkObj.id})
            })
          }
        }
        // console.log("init")
        // console.log(nodes)
        // console.log(links)
        update()
      }
    }

    // Add and remove elements on the graph object
    this.addNode = function (nodeObj) {
      nodes.push(nodeObj)
      update()
    }

    this.removeNodeById = function (id) {
      var i = 0
      var n = findNodeById(id)
      while (i < links.length) {
        if ((links[i]['source'] == n.id) || (links[i]['target'] == n.id)) {
          links.splice(i, 1)
        }
        else i++
      }
      nodes.splice(findNodeIndex(id), 1)
      update()
    }

    this.removeLink = function (source, target) {
      for (var i = 0; i < links.length; i++) {
        if (links[i].source.id == source && links[i].target.id == target) {
          links.splice(i, 1)
          break
        }
      }
      update()
    }

    this.removeAllLinks = function () {
      links.splice(0, links.length)
      update()
    }

    this.removeAllNodes = function () {
      nodes.splice(0, nodes.length)
      update()
    }

    this.addLink = function (linkObj) {
      links.push({"source": findNodeById(linkObj.source), "target": findNodeById(linkObj.target), "id": linkObj.id})
      update()
    }

    var findNodeById = function (id) {
      for (var i in nodes) {
        if (nodes[i]["id"] === id) return nodes[i];
      } 
    }
    var findLinkById = function (id) {
      for (var i in links) {
        if (links[i]["id"] === id) return links[i];
      } 
    }

    var findNodeIndex = function (id) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id == id) {
          return i
        }
      }
    }

    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
        h = $(el).innerHeight()

    var color = d3.scale.category10()

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

    var nodes = force.nodes(),
        links = force.links()

    var update = function () {
        var link = vis.selectAll("line")
                .data(links, function (d) {
                    return d.source.id + "-" + d.target.id;
                })

        link.enter().append("line")
                .attr("id", function (d) {
                    return d.source.id + "-" + d.target.id;
                })
                .attr("stroke-width", 10)
                .attr("class", "link")

        link.append("title")
                .text(function (d) {
                    return d.id
                })
        link.exit().remove()

        var node = vis.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id;
                });

        var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .call(force.drag);

        nodeEnter.append("svg:circle")
                .attr("r", 12)
                .attr("id", function (d) {
                    return d.id;
                })
                .attr("class", "nodeStrokeClass")
                .attr("fill", function(d) { return color(20); });

        nodeEnter.append("svg:text")
                .attr("class", "textClass")
                .attr("x", 14)
                .attr("y", ".31em")
                .text(function (d) {
                    return d.id;
                });

        node.exit().transition("r", 0).remove();

        force.on("tick", function () {

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
        });

        // Restart the force layout.
        force.gravity(.01)
              .charge(-80000)
              .friction(0)
              .linkDistance( function(d) { return 100 } )
              .size([w, h])
              .start();
    }

    // Make it all go
    update()
  }

  function drawGraph(data) {
    graph = window.graph = new myGraph("#graph")
    graph.init(data)

    keepNodesOnTop()
  }

  drawGraph(graphData)

  // because of the way the network is created, nodes are created first, and links second,
  // so the lines were on top of the nodes, this just reorders the DOM to put the svg:g on top
  function keepNodesOnTop() {
    $(".nodeStrokeClass").each(function( index ) {
      var gnode = this.parentNode
      gnode.parentNode.appendChild(gnode)
    })
  }

  function addNodes() {
    d3.select("svg").remove()
    drawGraph()
  }

  var toggle = true
  // Button Event Listener
  $("#clearBtn").on("click", function(event){
    event.preventDefault()
    console.log("clear graph:")
    $("#graph").empty()
  })

  var count = graphData.nodes.length

  $("#updateBtn").on("click", function(event){
    event.preventDefault()
    count++
    var nodeId = "n" + count
    var edgeId = "e" + count
    graph.addNode({"id": nodeId, "name": nodeId})
    console.log("n" + count)
    graph.addLink({"source": "n1", "target": nodeId, "id": edgeId})
    keepNodesOnTop()
  })

  $("#refreshGraph").on("click", function(event){
    event.preventDefault()
    console.log("refresh graph")
    $("#graph").empty()

    if(toggle){
      drawGraph(graphData)
      toggle = false
    }else{
      drawGraph(testData)
      toggle = true
    }

    keepNodesOnTop()
  })
})