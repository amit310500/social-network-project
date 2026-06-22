import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function GroupStats({ data, type }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Sort and limit data to show only top 5 + "Others"
    let processedData = [...data].sort((a, b) => b.count - a.count); 
    
    if (processedData.length > 5) {
      const top5 = processedData.slice(0, 5);
      const othersCount = processedData.slice(5).reduce((sum, item) => sum + item.count, 0);
      processedData = [...top5, { name: "Other", count: othersCount }];
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 400, height = 200;

    if (type === 'bar') {
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Take last 5 months for the bar chart
        const filteredData = [...data]
            .slice(-5); 

        const xScale = d3.scaleBand()
            .domain(filteredData.map(d => d.month))
            .range([0, chartWidth])
            .padding(0.4);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.count) + 1])
            .range([chartHeight, 0]);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale));

        g.append("g")
            .call(d3.axisLeft(yScale).ticks(3));

       // Create bars
        g.selectAll(".bar")
            .data(filteredData) 
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.month))
            .attr("y", d => yScale(d.count))
            .attr("width", Math.min(xScale.bandwidth(), 60))
            .attr("transform", d => `translate(${(xScale.bandwidth() - Math.min(xScale.bandwidth(), 60))/2}, 0)`)
            .attr("height", d => chartHeight - yScale(d.count))
            .attr("fill", "#d4a5a5")
            .attr("fill-opacity", 0.9)
            .attr("rx", 4);
    } else if (type === 'pie') {
        const radius = Math.min(width, height) / 2 - 20;
        const pie = d3.pie().value(d => d.count);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        
        const pastelColors = ["#a8c0ff", "#ffd8a8", "#b8e986", "#ffb7b2", "#d4a5a5"];
        const color = d3.scaleOrdinal(pastelColors);
        
        const g = svg.append("g").attr("transform", `translate(${width/2}, ${height/2})`);
        
        const slices = g.selectAll(".slice")
            .data(pie(processedData))
            .enter().append("g")
            .attr("class", "slice");

        // Draw pie slices
        slices.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.name)) 
            .attr("stroke", "white") 
            .style("stroke-width", "2px");

        // Add labels to slices
        slices.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#333") 
            .text(d => d.data.name);
}

  }, [data, type]);

  return <svg ref={svgRef} width={400} height={200} style={{ border: '1px solid #eee' }}></svg>;
}

export default GroupStats;