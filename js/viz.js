(function(){
  var VIZ ={};
  var elWidth = 260, elHeight = 160;
  Physijs.scripts.worker = 'lib/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.small.js';

  var scene = new Physijs.Scene;
  scene.setGravity(new THREE.Vector3(0, 0, -100));

  var renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  document.getElementById('viewport').appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight , 1, 2000);
  camera.position = new THREE.Vector3(0, 0, 1000);
  scene.add(camera);

  var render_stats = new Stats();
  render_stats.domElement.style.position = 'absolute';
  render_stats.domElement.style.top = '1px';
  render_stats.domElement.style.zIndex = 100;
  document.getElementById('viewport').appendChild(render_stats.domElement);

  VIZ.drawElements = function (data) {

    var margin = {top: 17, right: 0, bottom: 16, left: 20},
        width  = 225 - margin.left - margin.right,
        height = 140 - margin.top  - margin.bottom;

    var legendArr = d3.keys(data[0].recs[0])
        .filter(function (key) { return key !== 'year';});

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0, 0)
        .domain(d3.range(2004,2014).map(function (d) { return d + ""; }))

    var y = d3.scale.linear().range([height, 0]).domain([0, 135]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var color = d3.scale.ordinal()
        .range(['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)']);

    var elements = d3.selectAll('.element')
        .data(data).enter()
        .append('div')
        .attr('class', 'element')
        .style('width', elWidth + "px")
        .style('height', elHeight + "px")
        .on('click', function (d) {
          console.log(d);
          d3.select(this).style("background-color", "tomato");
        });

    elements.append('div')
      .attr('class', 'chartTitle')
      .html(function (d) { return d.name; })

    elements.append('div')
      .attr('class', 'investData')
      .html(function (d, i) { return d.awards; })

    elements.append('div')
      .attr('class', 'investLabel')
      .html("Investments (10 Yrs)")

    elements.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("class", "chartg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    elements.select(".chartg")
      .append("g").attr("class", "seriesg") 
      .selectAll("series")
      .data(function (d) { return prepData(d.recs); })
      .enter()
        .append("path")
        .attr("class", "series")
        .attr("d", function (d) { return area(d.values); })
        .style("fill", function (d) { return color(d.name); })

    elements.select(".chartg")
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(15, -15)")
      .selectAll(".legendItem")
      .data(setLegend(legendArr))
      .enter()
        .append("g")
        .attr("class", "legendItem")
        .each(function (d) {
          d3.select(this).append("rect")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y })
            .attr("width", 4)
            .attr("height",4)
            .style("fill", function (d) { return color(d.name); })

          d3.select(this).append("text")
            .attr("class", "legendText")
            .attr("x", function (d) { return d.x + 5 })
            .attr("y", function (d) { return d.y + 4 })
            .text(function (d) { return d.name; });
       });

    elements.select(".chartg").append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    elements.select(".chartg").append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Investments");

    elements.each(objectify);

    function prepData (data) {
      var stack = d3.layout.stack()
          .offset("zero")
          .values(function (d) { return d.values; })
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y(function (d) { return d.value; });

      var labelVar = 'year';
      var varNames = d3.keys(data[0])
          .filter(function (key) { return key !== labelVar;});

      var seriesArr = [], series = {};
      varNames.forEach(function (name) {
        series[name] = {name: name, values:[]};
        seriesArr.push(series[name]);
      });

      data.forEach(function (d) {
        varNames.map(function (name) {
          series[name].values.push({
            name: name, 
            label: d[labelVar], 
            value: +d[name]
          });
        });
      });
      return stack(seriesArr);
    }
  }

  function setLegend(arr) {
    return arr.map(function (n, i) {
      return {name: n, x: (i % 4) * 48, y: Math.floor(i / 4) * 8};
    });
  }

  function objectify(d) {
    var rnd = Math.random;
    var geom = new THREE.CubeGeometry(elWidth, elHeight, 4);
    var basic_mtrl = new THREE.MeshBasicMaterial({wireframe: false});
    var physi_mtrl = Physijs.createMaterial(basic_mtrl, 0.9, 0.9);
    var object = new Physijs.BoxMesh(geom, physi_mtrl, d.awards * 10);
    object.rotation.set(rnd() * 100, rnd() * 100, rnd() * 100);
    object.position.set(rnd() * 900 - 450, rnd() * 400, rnd() * 100);
    object.name = d.name;
    console.log(object);
    scene.add(THREE.CSS3DObject.call(object, this));
  }

  VIZ.render = function () {
    requestAnimationFrame(VIZ.render);
    renderer.render(scene, camera);
    render_stats.update();
    scene.simulate(undefined, 1);
  }

  VIZ.resetScene = function (data) {
    for (var i in scene._objects) {
      if (scene._objects[i] instanceof Physijs.BoxMesh) {
        d3.select(scene._objects[i].element).remove();
        scene.remove(scene._objects[i]);
      }
    }
    VIZ.drawElements(data);
  }

  VIZ.onWindowResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.VIZ = VIZ;
}())