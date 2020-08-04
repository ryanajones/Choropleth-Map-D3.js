/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => getData());

// get json data using async await
const getData = async () => {
  const responseEducation = await fetch(
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'
  );
  const dataEducation = await responseEducation.json();
  const responseCounty = await fetch(
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
  );
  const dataCounty = await responseCounty.json();
  drawChart(dataEducation, dataCounty);
};

const drawChart = (educationStatistics, useMap) => {
  const w = 1200;
  const h = 730;
  const padding = 60;

  const [minBachelorOrHigher, maxBachelorOrHigher] = [
    ...d3.extent(educationStatistics.map((el) => el.bachelorsOrHigher)),
  ];

  const colorQuantity = 8;

  // define color scale
  const scaleColors = d3
    .scaleThreshold()
    .domain(
      d3
        .range(colorQuantity)
        .map(
          (el) =>
            el * ((maxBachelorOrHigher - minBachelorOrHigher) / colorQuantity) +
            minBachelorOrHigher
        )
    )
    .range(d3.schemePurples[colorQuantity]);

  // map the fips with their county values
  const fipsCountiesMap = d3.map();
  educationStatistics.map((v) =>
    fipsCountiesMap.set(v.fips, {
      areaName: v.area_name,
      bachelorsOrHigher: v.bachelorsOrHigher,
      state: v.state,
    })
  );

  console.log(fipsCountiesMap);

  // draw the choropleth map
  const svg = d3
    .select('.main')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  const g = svg.append('g').attr('class', 'counties');

  const geoPath = d3.geoPath();

  g.selectAll('path')
    .data(topojson.feature(useMap, useMap.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (d) => d.id)
    .attr('d', geoPath)
    .attr('data-fips', (d) => d.id)
    .attr(
      'data-education',
      (d) => fipsCountiesMap.get(d.id).bachelorsOrHigher || 0
    )
    .attr('fill', (d) =>
      scaleColors(fipsCountiesMap.get(d.id).bachelorsOrHigher || 0)
    )
    .attr('transform', 'translate(130, 60)');
};
