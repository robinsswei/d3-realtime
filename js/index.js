// main entry of the application
var graphData = {
  nodes:[
    {id: "n1", name: "Cause"},
    {id: "n2", name: "Effect"},
    {id: "n3", name: "Robin"}
  ],
  links:[
    {source: "n1", target:"n2"},
  ]
}

$(function(){
 var graph = Graph("graph")

})