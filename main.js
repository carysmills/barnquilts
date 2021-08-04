const width = 320;
const height = 500;

function calculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius) {
    let results = "";

    const angle = Math.PI / arms;

    for (let i = 0; i < 2 * arms; i++) {
        var r = (i & 1) == 0 ? outerRadius : innerRadius;

        var currX = centerX + Math.cos(i * angle) * r;
        var currY = centerY + Math.sin(i * angle) * r;

        if (i == 0) {
            results = currX + "," + currY;
        }
        else {
            results += ", " + currX + "," + currY;
        }
    }

    return results;
}

function getQuiltPoints(index) {
    switch (index) {
        case 0:
            return '110, 180, 50, 50, 190, 140';
        case 1:
            return '160, 110, 240, 50, 240, 160, 150, 160';
        case 2:
            return '140, 200, 140, 245, 50, 245, 90, 200';
        case 3:
            return '190, 200, 190, 240, 140, 270, 140, 200';
        case 4:
            return '190, 150, 270, 150, 230, 200, 190, 200';
        case 5:
            return '140, 150, 50, 150, 90, 200, 140, 200';
        case 6:
            return '140, 150, 190, 150, 190, 90, 140, 60';
        case 7:
            return '140, 150, 190, 150, 190, 200, 140, 200';
        default:
            return ''

    }

}

function getQuiltFill(index) {
    switch (index) {
        case 0:
            return 'rgb(206, 133, 81)';
        case 1:
            return 'rgb(248, 134, 113)';
        case 2:
            return 'rgb(248, 134, 113)';
        case 3:
            return 'rgb(199, 61, 48)';
        case 4:
            return 'rgb(199, 61, 48)';
        case 5:
            return 'rgb(226, 74, 33)';
        case 6:
            return 'rgb(226, 74, 33)';

        case 7:
            return "rgb(234, 134, 99)";

        default: return 'rgb(234, 134, 99)'
    }
}

function getRowHeight(index) {
    const firstRow = [0, 3, 6, 9];
    const secondRow = [1, 4, 7, 10];
    const thirdRow = [2, 5, 8, 11];

    if (firstRow.includes(index)) {
        return 50;
    } else if (secondRow.includes(index)) {
        return 130;
    } else {
        return 210;
    }
}

function getRowWidth(index) {
    const firstColumn = [0, 1, 2];
    const secondColumn = [3, 4, 5];
    const thirdColumn = [6, 7, 8];

    if (firstColumn.includes(index)) {
        return 50;
    } else if (secondColumn.includes(index)) {
        return 120;
    }
    else if (thirdColumn.includes(index)) {
        return 190;
    } else {
        return 260;
    }
}

function getDividedPoints(data, index) {
    const { quilts } = data;
    const numberOfQuilts = quilts.length;

    return calculateStarPoints(getRowWidth(index), getRowHeight(index), numberOfQuilts, 15, 7);
}

d3.json('./data.json').then((data) => {
    if (data == null) return;

    const svg = d3.select("svg");

    const tooltip = d3.select("tooltip");

    const mapShape = svg.append("path").attr('class', 'map');

    function map() {
        d3.selectAll('text.location').transition().attr("opacity", 0);
        polygons.transition().attr("opacity", 0);
        d3.selectAll('circle.mapPoint').transition().attr("display", "block");


        d3.json("./pec.json").then((mapData) => {

            const projection = d3.geoMercator()
                .center([-77.20941801372084, 44.012799505137885])
                .scale(20000)
                .translate([width / 2, height / 4]);


            mapShape
                .datum(topojson.feature(mapData, mapData.objects.gcd_000b11a_e))
                .attr("d", d3.geoPath().projection(projection))
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("fill", "none")
                .attr("opacity", 1);

            const mapPointData = data.map(({ quilts }) => quilts).flat().filter(({ location }) => location != null);

            const circles = svg.selectAll("circle.mapPoint")
                .data(mapPointData)
                .enter()
                .append("circle");

            circles
                .attr("cx", d => projection(d.location)[0])
                .attr("cy", d => projection(d.location)[1])
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("opacity", 0.8)
                .attr("r", 3)
                .attr("fill", "rgb(175, 78, 87)")
                .attr('class', 'mapPoint')


            const offset = window.innerWidth < 650 ? 340 : 150;


            circles
                .on('mouseenter', (event, d) => {
                    d3.select("#tooltip")
                        .style('display', 'block')
                        .style('opacity', 1)
                        .style('top', `${event.y - offset}px`)
                        .style('left', `${event.x}px`)
                        .text(d.name);
                })
                .on('mouseleave', () => {
                    
                    d3.select("#tooltip")
                        .style('opacity', 0)
                        .style('display', 'none')
                });


        });
    }




    const myColor = d3.scaleLinear().domain([0, 25])
        .range(["rgb(246, 134, 116)", "rgb(197, 62, 53)"])


    data.sort(function (x, y) {
        return d3.descending(x.quilts.length, y.quilts.length);
    })

    const quiltContainer = svg.append("rect");
    const stem = svg.append("path");

    const group = svg.selectAll('g')
        .data(data)
        .enter()
        .append("g")

    const polygons = group.append("polygon")

    d3.selectAll('g')
        .append("text")
        .text((d) => d["location"])
        .attr("fill", "gray")
        .attr("class", "location")
        .attr("dx", -500);

    const quilt = () => {
        stem
            .attr("d", "M 304 280 C 209 248 206 244 183 182")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .attr("stroke-linecap", "round")
            .attr("opacity", 1);
        ;

        quiltContainer
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", 300)
            .attr("height", 300)
            .attr("fill", "white")
            .attr("stroke-width", 10)
            .attr("stroke", "rgb(175, 78, 87)")
            .attr("opacity", 1);

        polygons
            .attr("fill", (_, i) => getQuiltFill(i))
            .transition()
            .duration(600)
            .ease(d3.easeElastic)
            .attr("opacity", 1)
            .attr("points", (_, i) => getQuiltPoints(i))

        d3.selectAll('text.location').transition().attr("opacity", 0)

    }


    const divide = () => {
        stem
            .transition()
            .duration(600).attr("opacity", 0);

        quiltContainer
            .transition()
            .duration(600).attr("opacity", 0);

        polygons
            .transition()
            .delay((_, i) => 100 * i)
            .duration(800)
            .ease(d3.easeElastic)
            .attr("points", (d, i) => getDividedPoints(d, i))
            .attr("fill", (d) => myColor(d.quilts.length))

        d3.selectAll('text.location')
            .attr("opacity", 1)
            .transition()
            .duration(600)
            .attr("text-anchor", "middle")
            .attr("dx", (_, index) => getRowWidth(index))
            .attr("dy", (_, index) => getRowHeight(index) - 25)

    }


    function getBarChartPoints(data, index) {
        const { quilts } = data;
        const numQuilts = quilts.length;

        const height = 20;
        const startingX = 150;
        const startingY = index * 27.5;
        const width = startingX + numQuilts * 3;
        const bottom = startingY + height;


        return `${startingX}, ${startingY}, ${width}, ${startingY}, ${width}, ${bottom}, ${startingX}, ${bottom}`;
    }




    const barChart = () => {

        d3.selectAll('path.map').transition().attr("opacity", 0);
        d3.selectAll('circle.mapPoint').transition().attr("display", 'none');

        polygons
            .attr("rx", 0)
            .attr("ry", 0)
            .transition()
            .delay((_, i) => 20 * i)
            .duration(600)
            .attr("opacity", 1)
            .attr("points", (d, i) => getBarChartPoints(d, i))



        d3.selectAll('text.location')
            .transition()
            .delay((_, i) => 20 * i)
            .duration(600)
            .attr("opacity", 1)
            .attr("text-anchor", "end")
            .attr("dx", 140)
            .attr("dy", (d, i) => (i * 28) + 12)

    }



    function scroll(element, offset, func1, func2) {
        return new Waypoint({
            element: document.getElementById(element),
            handler: (direction) => {
                direction == 'down' ? func1() : func2();
            },
            offset: offset
        });
    };



    new scroll('content2', '75%', divide, quilt);
    new scroll('content3', '75%', barChart, divide);
    new scroll('content4', '75%', map, barChart);


    quilt();
});

