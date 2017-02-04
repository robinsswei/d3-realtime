
var graphData = {
  "id": "root",
  "name": "APP_GROUP",
  "children": [
    {
      "parent": "root",
      "id": "18061200057585921", // asgId
      "name": "nginx",
      "serviceId": "18061200057595805", // serviceId
      "children": [
        {
          "id": "18061200057566268",
          "name": "as-or618",
          "parent": "18061200057585921",
          "type": "CONTAINER"
        },
        {
          "id": "18061200057566271",
          "name": "as-ey954",
          "parent": "18061200057585921",
          "type": "CONTAINER"
        }
      ],
      "type": "AUTOSCALER"
    },
    {
      "parent": "root",
      "id": "18061200057585791",
      "name": "wordpress",
      "serviceId": "18061200057595765",
      "heatmap": {},
      "children": [
        {
          "id": "18061200057566026",
          "name": "as-ke726",
          "parent": "18061200057585791",
          "type": "CONTAINER"
        },
        {
          "id": "18061200057566023",
          "name": "as-se318",
          "parent": "18061200057585791",
          "type": "CONTAINER"
        }
      ],
      "type": "AUTOSCALER"
    },
    {
      "parent": "root",
      "id": "18061200057585944",
      "name": "mysql",
      "serviceId": "18061200057595830",
      "heatmap": {},
      "children": [
        {
          "id": "18061200057566351",
          "name": "as-db266",
          "parent": "18061200057585944",
          "type": "CONTAINER"
        }
      ],
      "type": "AUTOSCALER"
    },
    {
      "id": "18061200057566222",
      "name": "as-db222",
      "parent": "root",
      "type": "CONTAINER"
    }
  ]
}

$(function(){
   var hat = null,
       graph

   var copy = window.copy =  $.extend({}, graphData)
   console.log("copy of graph data: ", copy)
   graph= window.graph = new Graph("#graph")

})

function Graph(el) {

  // set up the D3 visualisation in the specified element
  var w = $(el).innerWidth(),
      h = $(el).innerHeight(),
      root = graphData,
      nodes2 = [],
      parentschildren = [],
      linkedByIndex = {}

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

  function simulateClick(){
    $.fn.d3Click = function (i) {
      this.each(function (i, e) {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        e.dispatchEvent(evt);
        evt.stopPropagation()
      });
    };

    var newNodes = [];
    for(var i=nodes2.length; i>=0; i--){
      newNodes.push(nodes2[i])
    }

    for(var i=0;i<newNodes.length;i++){
      if(newNodes[i]){
        $('#'+newNodes[i]).d3Click();
      }
    }

    $("#root").d3Click();
  }

  function update(d) {
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

    // Exit any old nodes.
    node.exit().remove()

    // Enter any new nodes.
    var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .on("click", click)
                    .call(force.drag)

    nodeEnter.append("svg:circle")
        // .attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; })
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d){ 
          if(d.id==="root"){
            return 50
          }else{
            return d.type === "AUTOSCALER" ? 30 : 20
          }
        })
        // .style("fill", color)
        .style("fill", function(d){
          if(d.id==="root"){
            return "#C6DBEF"
          }else if(d.type === "AUTOSCALER"){
            return "#3182BD"
          }else {
            return "#1a9850"
          }
        })

    nodeEnter.append("svg:text")
            .attr("class", "textClass")
            .text(function (d) {
              return d.name? d.name : d.id
            })

    // node.select("circle")
    //     .style("fill", function(d){
    //       if(d.id==="root"){
    //         return "#C6DBEF"
    //       }else if(d.type === "AUTOSCALER"){
    //         return "#3182BD"
    //       }else {
    //         return "#1a9850"
    //       }
    //     })

    if(parentschildren.length<1){
      node.filter(function(d){
        return d.id === 'root'
      }).each(function(d){
        for(var i=0;i<d.children.length;i++){
          parentschildren.push(d.children[i].name);
        }
      });
    }
      
  }

  this.refresh = function() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.

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
    node = vis.selectAll(".node").data(nodes, function(d) { return d.id; });
    // Exit any old nodes.
    node.exit().remove()

    //Change color of previously newly added node to normal color

    // Enter any new nodes.
    var anyNewNode = false;
    var anyOldNode = false;
    var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .on("click", click)
                    .call(force.drag)
    nodeEnter.each(function(){
       anyNewNode = true;
    });
    if(anyNewNode){
       node.each(function(d){
          d3.select(this.firstChild).style("fill", function(d){
            if(d.id==="root"){
              return "#C6DBEF"
            }else if(d.type === "AUTOSCALER"){
              return "#3182BD"
            }else {
              return "#1a9850";
            }
          })
       })
       // node.select(function(d){
       //    //console.log($(this).find("svg:circle"));
       // //    $(this).find("svg:circle").style("fill", function(d){
       // //     if(d.id==="root"){
       // //       return "#C6DBEF"
       // //     }else if(d.type === "AUTOSCALER"){
       // //       return "#3182BD"
       // //     }else {
       // //       return "#1a9850"
       // //     }
       // //   })
       // });
    }
    //console.log("enter count");
    //console.log(node);
    nodeEnter.append("svg:circle")
        // .attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; })
        .attr("class","circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d){
          if(d.id==="root"){
            return 50
          }else{
            return d.type === "AUTOSCALER" ? 30 : 20
          }
        })
        // .style("fill", color)
        .style("fill", function(d){
          if(d.id==="root"){
            return "#C6DBEF"
          }else if(d.type === "AUTOSCALER"){
            return "#3182BD"
          }else {
             return "#25d972";
          }
        })


    nodeEnter.append("svg:text")
            .attr("class", "textClass")
            .text(function (d) {
              return d.name? d.name : d.id
            })

    if(parentschildren.length<1){
      node.filter(function(d){
        return d.id === 'root'
      }).each(function(d){
        for(var i=0;i<d.children.length;i++){
          parentschildren.push(d.children[i].name);
        }
      });
    }
    force.nodes(nodes)
    .links(links)
    .linkDistance(function(d) {
       return d.source.id === "root"? 200:80
    })
    .start()

  }

  function tick(d) {
    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
  }

  function color(d) {
    return d._children ? "#3182bd" // collapsed package
        : d.children ? "#3182bd" // expanded package
        : "#1a9850"; // leaf node
  }

  function neighboring(a, b) {
    return a.index == b.index || linkedByIndex[a.index + "," + b.index];
  }

  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return

    if (d.children) {
      // collapse the children
      console.log("collpase node")
      // create chart
      // autoscaler group

      // if( d.type === "AUTOSCALER" && hat !== null && hat !== d.serviceId){
      //   console.log("Group " + d.serviceId + " get hat")
      //   var group = asgGroups[hat];

      //   if (group !== undefined) {
      //     // rmChartsForGroup(group)
      //     hideChartsForGroup(group)
      //   }

      //   hat = d.serviceId
      //   var group = asgGroups[hat];
      //   if (group !== undefined) {
      //     if(asgGroupsChartsExisted.indexOf(group.serviceId) > -1){
      //       showChartsForGroup(group, addNewPoints);
      //     }else{
      //       asgGroupsChartsExisted.push(group.serviceId)
      //       addChartsForGroup(group).then(addNewPoints)
      //     }
      //   }
      // }     

      d._children = d.children;
      d.children = null;
    } else {
      // expand the chilren
      console.log("expand node")
      // if( d.type === "AUTOSCALER" && hat !== d.serviceId ){
      //   console.log("Group " + d.serviceId + " get hat")
        
      //   if (hat !== null) {
      //     var group = asgGroups[hat];
      //     if (group !== undefined) {
      //       // rmChartsForGroup(group);
      //       hideChartsForGroup(group)
      //     }
      //   }
      //   hat = d.serviceId
      //   var group = asgGroups[hat];
      //   if (group !== undefined) {
      //     if(asgGroupsChartsExisted.indexOf(group.serviceId) > -1){
      //       showChartsForGroup(group, addNewPoints);
      //     }else{
      //       asgGroupsChartsExisted.push(group.serviceId)
      //       addChartsForGroup(group).then(addNewPoints)
      //     }
      //   }
      // }

      d.children = d._children;
      d._children = null;
    }
    update() 

    // if(hat !==null){
    //   if(d.parent==="root"){
    //     $('#policy-form').show()
    //     updatePolicyPanel(hat)
    //   }else{
    //     $("#policy-container").show()
    //     $('#policy-form').empty()
    //   }
    // }
    
    // marks the clicked node
    if(d.id !== "root"){
      d3.selectAll(".link").transition().duration(500)
        .style("stroke", function(o) {
          return o.target === d || o.target === d ? "red" : "grey";
        });
      
      d3.selectAll(".node").transition().duration(500)
        .style("stroke-width", function(o) {
           return neighboring(d, o) ? 1 : 0;
        }).style("stroke", function(o) {
           return neighboring(d, o) ? "red" : "white";
        });
    }
  }

  function flatten(root) {
    var nodes = []

    function recurse(node) {
      if (node.children){
        nodes2.push(node.id)
        node.children.forEach(recurse);
      }
      nodes.push(node)
    }
    recurse(root)
    return nodes
  }

  // Make it all go
  update()
  simulateClick()

  var color = d3.scale.ordinal()
      .domain(["Application Group", "Autoscaler Group", "VM/Container", "VM/Container(new)"])
      .range(["#C6DBEF", "#3182BD", "#1a9850", "#25d972"]);

  var legendCircleSize = 15,
      legendSpacing = 30

  var legend = vis.append("g")
                .attr("id", "legend")
                .selectAll("#legend g")
                .data(color.domain())
                .enter()
                .append('g')
                  .attr('transform', function(d, i) {
                    var height = legendCircleSize;
                    var x = 50;
                    var y = i * 50 + height;
                    return 'translate(' + x + ',' + y + ')';
                });
  legend.append('circle')
      .attr('r', legendCircleSize)
      .style('fill', color)
      .style('stroke', color);

  legend.append('text')
      .attr('x', 2*legendCircleSize)
      .attr('y', 5)
      .text(function(d) { return d; });

}
