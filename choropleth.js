const mapUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
const educationUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'

function getData(mapUrl, educationUrl) {
    Promise.all([
        d3.json(mapUrl),
        d3.json(educationUrl)
    ]).then(function (files) {
        makeChoropleth(files[0], files[1])
    })
}

function makeChoropleth(mapData, educationData) {

    const [svg, svgVals] = makeSvg(1000, 630);
    const tooltip = makeTooltip();
    const path = d3.geoPath();

    function makeSvg(width, height) {
        const svgVals = {
            width: width,
            height: height
        }

        var svg = d3.select('body')
            .append('svg')
            .attr('id', 'svg')
            .attr('width', svgVals.width)
            .attr('height', svgVals.height)
            

        return [svg, svgVals]
    }

    function makeTooltip() {
        let tooltip = d3
            .select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0)

        return tooltip
    }



    function makeTitleandDescription() {
        svg
            .append('text') //Title
            .attr('id', 'title')
            .attr('x', svgVals.width / 2)
            .attr('y', 25)
            .text('College Education by County')

        svg
            .append('text')
            .attr('id', 'description')
            .attr('x', svgVals.width / 2)
            .attr('y', 45)
            .text('Percentage of Adults with a Bachelor\'s Degree or Higher')
    }

    function makeMap() {
        const colorArr = ['#BFF9B6', '#8DFC7B', '#1CB704', '#157406']//light to dark green
        const valuesArr = ['0% - 15%', '15% - 30%', '30% - 45%', '45% - 100%']
        function matchEducationData(data) {
            return educationData.find(function (element) { return element.fips == data.id })
        }

        function getFillColor(dataPercentage) {
            
            let color = colorArr[0]

            if (dataPercentage > 45) {
                color = colorArr[3]
            } else if (dataPercentage > 30) {
                color = colorArr[2]
            } else if (dataPercentage > 15) {
                color = colorArr[1]
            }

            return color
        }

        function makeLegend() {
            var legend = svg
                .append('g')
                .attr('id', 'legend')
                .attr('transform', 'translate(' + (svgVals.width / 2) + ', ' + (svgVals.height - 100) + ')')
            
            legend
                .append('rect')
                .attr('id', 'legendBackground')
                .attr('x', 10)
                .attr('y', -10)
            
            legend
                .selectAll('.legendRect')
                .data(colorArr)
                .enter()
                .append('rect')
                .attr('class', 'legendRect')
                .style('x', (_, i) => (i * 90) + 20 + 'px')
                .style('fill', d => d)
            
            legend
                .selectAll('.rectLable')
                .data(valuesArr)
                .enter()
                .append('text')
                .attr('class', 'rectLable')
                .attr('x', (_, i) => (i * 90) + 20 + 'px')
                .attr('y', '50px')
                .text(d => d)
            
        }
        function makeCounties() {
            svg.selectAll('.county') //draw county lines
                .data(topojson.feature(mapData, mapData.objects.counties).features)
                .enter()
                .append('path')
                .attr('class', 'county')
                .attr('d', path)
                .attr('data-fips', d => d.id)
                .attr('data-education', d => matchEducationData(d).bachelorsOrHigher)
                .style('fill', d => getFillColor(matchEducationData(d).bachelorsOrHigher))
                .on('mouseover', function (d) {
                    let currentEducationData = matchEducationData(d)
                    d3.select(this).style('fill', 'red')

                    tooltip
                        .transition()
                        .duration(500)
                        .style('opacity', .9)

                    tooltip
                        .style('left', d3.event.pageX + 10 + 'px')
                        .style('top', d3.event.pageY - 10 + 'px')
                        .html(currentEducationData.area_name + ',' + currentEducationData.state + '<br/><br/>'
                            + 'Adults with College Education: ' + currentEducationData.bachelorsOrHigher + '%')
                        .attr('data-education', currentEducationData.bachelorsOrHigher)


                })
                .on('mouseout', function (d) {
                    tooltip
                        .transition()
                        .duration(500)
                        .style('opacity', 0)

                    d3.select(this).style('fill', getFillColor(matchEducationData(d).bachelorsOrHigher))
                })
        }
        function makeStateLines(){
        svg.append("path") //Add state Lines //This works but I don't understand it
            .datum(topojson.mesh(mapData, mapData.objects.states, function (a, b) { return a !== b; }))
            .attr("class", "state")
            .attr("d", path);
        }
        makeCounties();
        makeStateLines();
        makeLegend();
    }

    makeTitleandDescription();
    makeMap();
}

getData(mapUrl, educationUrl)