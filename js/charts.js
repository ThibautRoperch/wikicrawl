/* Format datas */

function pathsToSankeyData(paths, gather_mode) {
  /*
    gather_mode :
      0 - Pas de regroupement, un lien entre deux noeuds donne lieu à un lien dans le diagramme
      1 - Regroupement en fonction des noeuds du lien et calcul des occurences
      2 - Regroupement en fonction des noeuds du lien avec occurences à 1 maximum
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

  return data;
}

function pathsToTreeMap(paths, gather_mode) {
  // https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/treemap-with-levels
  /*

    data: [{
        name: 'Anne',
        value: 1
    }, {
        name: 'Rick',
        value: 3
    }, {
        name: 'Peter',
        value: 4
    }, {
        name: 'Anne',
        value: 4
    }, {
        name: 'Rick',
        value: 2,
        color: 'red'
    }]

  */
}



// NETWORK https://www.highcharts.com/docs/chart-and-series-types/networkgraph

/* Charts */

function sankeyDiagram(domId, title, data) {
  console.log(data)

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
