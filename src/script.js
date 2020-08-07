/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => getData());

const w = 1200;
const h = 730;
const padding = 60;
const colorQuantity = 9;

const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const svg = d3
  .select('.main')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .style('background-color', 'rgb(0, 0, 0)')
  .style('border-bottom-right-radius', '10px')
  .style('border-bottom-left-radius', '10px');

// extracting json data using async await
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
  const [minBachelorOrHigher, maxBachelorOrHigher] = [
    ...d3.extent(educationStatistics.map((el) => el.bachelorsOrHigher)),
  ];

  // defining color scale
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
    .range(d3.schemeGreens[colorQuantity]);

  // mapping the fips with their county values
  const fipsCountiesMap = d3.map();
  educationStatistics.map((v) =>
    fipsCountiesMap.set(v.fips, {
      areaName: v.area_name,
      bachelorsOrHigher: v.bachelorsOrHigher,
      state: v.state,
    })
  );

  // drawing the choropleth map

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
    .attr('transform', 'translate(130, 60)')
    .on('mouseover', (d, i) => {
      const county = fipsCountiesMap.get(d.id);
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .attr('data-education', county.bachelorsOrHigher || 0)
        .html(
          `${county.areaName} (${county.state}) ` +
            `) ${county.bachelorsOrHigher}%`
        )
        .attr('data-year', d.year)
        .style('left', `${d3.event.pageX + 30}px`)
        .style('top', `${d3.event.pageY - 15}px`);
    })
    .on('mouseout', () => {
      tooltip.transition().duration(200).style('opacity', 0);
    });

  // defining the legend

  svg.append('g').attr('id', 'legend');

  const legendXScale = d3
    .scaleLinear()
    .domain([minBachelorOrHigher, maxBachelorOrHigher])
    .rangeRound([400, 860]);

  const legendXAxis = d3
    .axisBottom(legendXScale)
    .tickSize(17)
    .tickValues(scaleColors.domain())
    .tickFormat((x) => `${Math.round(x)}%`);

  const legend = d3
    .select('#legend')
    .call(legendXAxis)
    .attr('transform', 'translate(-200, 700)');

  legend.select('.domain').remove();

  legend
    .selectAll('rect')
    .data(
      scaleColors.range().map((color) => {
        const d = scaleColors.invertExtent(color);
        const [zero, one] = legendXScale.domain();
        if (d[0] == null) d[0] = zero;
        if (d[1] == null) d[1] = one;
        return d;
      })
    )
    .enter()
    .insert('rect', '.tick')
    .attr('height', 10)
    .attr('x', function (d) {
      return legendXScale(d[0]);
    })
    .attr('width', function (d) {
      return legendXScale(d[1]) - legendXScale(d[0]);
    })
    .attr('fill', function (d) {
      return scaleColors(d[0]);
    })
    .attr('transform', 'translate(0, 0)');
};
