/* Format datas */

function gatherDatas(paths, gather_mode) {
  /*
    gather_mode :
      0 - Pas de regroupement, un lien entre deux noeuds donne lieu à un tableau de deux noeuds
      1 - Regroupement en fonction des noeuds du lien et calcul des occurences de ce lien
      2 - Regroupement en fonction des noeuds du lien avec occurences normalisées à 1
      3 - Regroupement des prédécesseurs de chaque noeud, chaque lien // TODO
  */

  let data = [];

  for (path of paths) {
    for (let i = 0; i < path.length - 1; ++i) {
      let new_data = [path[i], path[i+1], 1];
      let new_data_exists = data.find(v => v[0] === new_data[0] && v[1] === new_data[1]);

      if (gather_mode === 0) {
        data.push(new_data);
      } else if (gather_mode === 1) {
        if (new_data_exists) {
          new_data_exists[2] += 1;
        } else {
          data.push(new_data);
        }
      } else if (gather_mode === 2) {
        if (!new_data_exists) {
          data.push(new_data);
        }
      }
    }
  }

  console.log(data)
  return data;
}

function pathsToSankeyData(paths, gather_mode) {
  return gatherDatas(paths, gather_mode);
}

function pathsToTreeMapData(paths) {
  let data = gatherDatas(paths, 1).map(link => {
      return {
        name: link[1],
        value: link[2]
      }
    });

  return data
}

function pathsToPieData(paths) {
  let data = pathsToTreeMapData(paths).map(link => {
      return {
        name: link.name,
        y: link.value
      }
    });

  return data
}

function pathsToNetworkGraphData(paths) {
  let data = gatherDatas(paths, 2).map(link => {
      return [link[0], link[1]]
    });

  return data
}

/* Charts */

// https://www.highcharts.com/docs/chart-and-series-types

function sankeyDiagram(domId, title, data) {
  // https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/sankey-diagram/

  Highcharts.chart(domId, {
    title: {
      text: title
    },
    series: [{
      keys: ['from', 'to', 'weight'],
      data: data,
      type: 'sankey',
      name: 'Sankey demo series'
    }]
  });
}

function treeMap(domId, title, data) {
  // https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/treemap-with-levels

  Highcharts.chart(domId, {
    series: [{
      type: "treemap",
      layoutAlgorithm: 'squarified',
      levels: [{
        level: 1,
        layoutAlgorithm: 'sliceAndDice',
        dataLabels: {
          enabled: true,
          align: 'left',
          verticalAlign: 'top',
          style: {
              fontSize: '15px',
              fontWeight: 'bold'
          }
        }
      }],
      data: data
    }],
    title: {
      text: title
    }
  });
}

function pie(domId, title, data) {
  // https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/pie-basic/

  Highcharts.chart(domId, {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: title
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: 'Brands',
      colorByPoint: true,
      data: data
    }]
  });
}

function networkGraph(domId, title, data) {
  // https://www.highcharts.com/docs/chart-and-series-types/networkgraph
  // https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/series-networkgraph/initial-positions

  Highcharts.addEvent(
    Highcharts.seriesTypes.networkgraph,
    'afterSetOptions',
    function (e) {
      var colors = Highcharts.getOptions().colors, i = 0, nodes = {};

      e.options.data.forEach(function (link) {
        if (link[0] === 'Ensemble') {
          nodes['Ensemble'] = {
            id: 'Ensemble',
            marker: {
              radius: 20
            }
          };
          nodes[link[1]] = {
            id: link[1],
            marker: {
              radius: 10
            },
            color: colors[i++]
          };
        } else if (nodes[link[0]] && nodes[link[0]].color) {
          nodes[link[1]] = {
            id: link[1],
            color: nodes[link[0]].color
          };
        }
      });

      e.options.nodes = Object.keys(nodes).map(function (id) {
        return nodes[id];
      });
    }
  );

  Highcharts.chart(domId, {
    chart: {
      type: 'networkgraph',
      plotBorderWidth: 1
    },
    title: {
      text: title
    },
    plotOptions: {
      networkgraph: {
        keys: ['from', 'to']
      }
    },
    series: [{
      layoutAlgorithm: {
        enableSimulation: true,
        initialPositions: function () {
          var chart = this.series[0].chart, width = chart.plotWidth, height = chart.plotHeight;

          this.nodes.forEach(function (node) {
            // If initial positions were set previously, use that
            // positions. Otherwise use random position:
            node.plotX = node.plotX === undefined ? Math.random() * width : node.plotX;
            node.plotY = node.plotY === undefined ? Math.random() * height : node.plotY;
          });
        }
      },
      name: 'K8',
      data: data
    }]
});


}
