// 0. Helper to down json 
(function(console){

console.save = function(data, filename){

    if(!data) {
        console.error('Console.save: No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
 }
})(console)


// 1. RESTful APIs

// autoscaler page
$.getJSON("../api/autoscaler/asgNodes", function(data){
  console.log("Get asgNodes: ")
  console.log(data)
  console.save(data, "asgNodes.json")
})

$.getJSON("../api/projection/type/node/engine/update", function(data){
  console.log("Get all engine: ")
  console.log(data)
  console.save(data, "engine.json")
})

$.getJSON("../api/getdescription/" + serviceId , function(data){
  console.log("Get description for service " + serviceId)
  console.log(data)
  console.save(data, "serviceDescription.json")
})

// heatmap Page
$.getJSON("../api/heatmap/cpu", function(data){
  console.log("Get heatmap-cpu: ")
  console.log(data)
  console.save(data, "cpu.json")
})

$.getJSON("../api/heatmap/disk", function(data){
  console.log("Get heatmap-disk: ")
  console.log(data)
  console.save(data, "disk.json")
})

$.getJSON("../api/heatmap/mem", function(data){
  console.log("Get heatmap-mem: ")
  console.log(data)
  console.save(data, "mem.json")
})

// connectivity page
$.getJSON("../api/projection/type/clouds/connectivity/notupdate", function(data){
  console.log("Get connectivity: ")
  console.log(data)
  console.save(data, "connectivity.json")
})