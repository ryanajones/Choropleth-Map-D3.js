/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const w = 1200;
const h = 730;
const padding = 60;

const svg = d3.select('.main').append('svg').attr('width', w).attr('height', h);
const g = svg.append('g').attr('class', 'counties');

const albersProjection = d3
  .geoAlbers()
  .scale(190000)
  .rotate([71.057, 0])
  .center([0, 42.313])
  .translate([w / 2, h / 2]);

const geoPath = d3.geoPath().projection(albersProjection);

const EDUCATION_FILE =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_FILE =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const files = [EDUCATION_FILE, COUNTY_FILE];
const promises = [];

files.forEach(function (url) {
  promises.push(d3.json(url));
});

Promise.all(promises).then(function (data) {
  g.selectAll('path')
    .data(topojson.feature(data[1], data[1].objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('fill', '#ccc')
    .attr('stroke', '#333')
    .attr('d', geoPath);
});
