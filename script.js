const habitatData = [
  { year: 2002, oldGrowth: 68, disturbed: 41, habitatKm2: 9880 },
  { year: 2005, oldGrowth: 64, disturbed: 45, habitatKm2: 9200 },
  { year: 2008, oldGrowth: 60, disturbed: 49, habitatKm2: 8520 },
  { year: 2011, oldGrowth: 56, disturbed: 53, habitatKm2: 7840 },
  { year: 2014, oldGrowth: 52, disturbed: 57, habitatKm2: 7160 },
  { year: 2017, oldGrowth: 48, disturbed: 60, habitatKm2: 6480 },
  { year: 2020, oldGrowth: 44, disturbed: 64, habitatKm2: 5800 }
];

const populationData = [
  { year: 2002, min: 65000, max: 78000 },
  { year: 2005, min: 63000, max: 75000 },
  { year: 2008, min: 60000, max: 72000 },
  { year: 2011, min: 58000, max: 69000 },
  { year: 2014, min: 56000, max: 67000 },
  { year: 2017, min: 53000, max: 65000 },
  { year: 2020, min: 50000, max: 63000 }
].map(d => ({
  ...d,
  avg: Math.round((d.min + d.max) / 2)
}));

const tooltip = d3.select('#tooltip');

const BIRDS_PER_ICON = 1000;
const TOTAL_BIRD_ICONS = 100;

function showTooltip(event, html) {
  tooltip
    .style('opacity', 1)
    .html(html)
    .style('left', `${event.pageX + 14}px`)
    .style('top', `${event.pageY - 18}px`);
}

function hideTooltip() {
  tooltip.style('opacity', 0);
}

function drawHabitatChart() {
  const container = document.getElementById('habitat-chart');
  container.innerHTML = '';
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 16, right: 18, bottom: 44, left: 54 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const defs = svg.append('defs');

  const glow = defs.append('filter').attr('id', 'lineGlow');
  glow.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'coloredBlur');
  const feMerge = glow.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const areaGradient = defs.append('linearGradient')
    .attr('id', 'areaGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
  areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6ea16f').attr('stop-opacity', 0.22);
  areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#6ea16f').attr('stop-opacity', 0);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(habitatData, d => d.year))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, 110])
    .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6);
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`);

  g.append("text")
    .attr("x", x(2020) - 150)
    .attr("y", y(30) - 0)
    .attr("fill", "#b8d9af")
    .attr("font-size", "12px")
    .text("Significant habitat decline");

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
    .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));

  g.append('g')
    .call(yAxis)
    .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
    .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));

  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(''))
    .call(g => g.selectAll('line').attr('stroke', 'rgba(255,255,255,0.06)'))
    .call(g => g.select('.domain').remove());

  const area = d3.area()
    .x(d => x(d.year))
    .y0(innerHeight)
    .y1(d => y(d.oldGrowth))
    .curve(d3.curveCatmullRom.alpha(0.4));

  const lineOld = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.oldGrowth))
    .curve(d3.curveCatmullRom.alpha(0.4));

  const lineDisturbed = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.disturbed))
    .curve(d3.curveCatmullRom.alpha(0.4));

  g.append('path')
    .datum(habitatData)
    .attr('fill', 'url(#areaGradient)')
    .attr('d', area);

  g.append('path')
    .datum(habitatData)
    .attr('fill', 'none')
    .attr('stroke', '#b8d9af')
    .attr('stroke-width', 3)
    .attr('filter', 'url(#lineGlow)')
    .attr('d', lineOld);

  g.append('path')
    .datum(habitatData)
    .attr('fill', 'none')
    .attr('stroke', '#e7aaa2')
    .attr('stroke-width', 3)
    .attr('d', lineDisturbed);

  g.selectAll('.old-point')
    .data(habitatData)
    .join('circle')
    .attr('class', 'old-point')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.oldGrowth))
    .attr('r', 5)
    .attr('fill', '#b8d9af');

  g.selectAll('.dist-point')
    .data(habitatData)
    .join('circle')
    .attr('class', 'dist-point')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.disturbed))
    .attr('r', 5)
    .attr('fill', '#e7aaa2');

  const hoverLine = g.append('line')
    .attr('stroke', 'rgba(255,255,255,0.18)')
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .style('opacity', 0);

  g.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mousemove', function(event) {
      const [mx] = d3.pointer(event, this);
      const year = x.invert(mx);

      const nearest = habitatData.reduce((a, b) =>
        Math.abs(b.year - year) < Math.abs(a.year - year) ? b : a
      );

      hoverLine
        .style('opacity', 1)
        .attr('x1', x(nearest.year))
        .attr('x2', x(nearest.year));

      updateTreeDisplay(nearest);

      const disturbedKm2 = Math.round(nearest.habitatKm2 * (nearest.disturbed / 100));
      const healthyKm2 = Math.round(nearest.habitatKm2 - disturbedKm2);

      showTooltip(
        event,
        `<strong>${nearest.year}</strong><br>
        Old-growth: ${nearest.oldGrowth}%<br>
        Disturbed: ${nearest.disturbed}%<br>
        Estimated remaining habitat: ${nearest.habitatKm2.toLocaleString()} km²<br>
        Healthier habitat: ${healthyKm2.toLocaleString()} km²<br>
        Disturbed habitat: ${disturbedKm2.toLocaleString()} km²`
      );
    })
    .on('mouseleave', () => {
      hoverLine.style('opacity', 0);
      hideTooltip();
    });
}

function birdSvg() {
  return `
    <img src="images/murrelet.png" alt="" class="mini-bird-img" draggable="false" />
  `;
}

function treeSvg() {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="currentColor" d="M32 4 18 20h8L14 34h8L10 48h44L42 34h8L38 20h8L32 4Z"/>
      <rect x="28" y="48" width="8" height="12" rx="1.5" fill="#5a403c"/>
    </svg>`;
}

function setupBirdIcons() {
  const container = document.getElementById('bird-icons');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_BIRD_ICONS; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'bird-icon';
    wrapper.innerHTML = birdSvg();
    container.appendChild(wrapper);
  }
}

function setupTreeIcons() {
  const container = document.getElementById('tree-icons');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-icon';
    wrapper.innerHTML = treeSvg();
    container.appendChild(wrapper);
  }
}

function updateBirdDisplay(datum) {
  const activeBirds = Math.max(1, Math.min(TOTAL_BIRD_ICONS, Math.round(datum.avg / BIRDS_PER_ICON)));
  const icons = Array.from(document.querySelectorAll('.bird-icon'));

  document.getElementById('bird-range').textContent =
  `${datum.min.toLocaleString()}–${datum.max.toLocaleString()}`;

  document.getElementById('bird-avg').textContent =
    `${datum.avg.toLocaleString()}`;

  icons.forEach((icon, index) => {
    icon.classList.remove('active', 'faded');
    if (index < activeBirds) {
      icon.classList.add('active');
    } else {
      icon.classList.add('faded');
    }
  });

  const baselineAvg = populationData[0].avg;
  const birdsLost = baselineAvg - datum.avg;

  document.getElementById('bird-readout-title').textContent =
    `${datum.year}`;

  if (datum.year === populationData[0].year) {
    document.getElementById('bird-readout-text').textContent =
      `Each icon = ${BIRDS_PER_ICON.toLocaleString()} birds.`;
  } else {
    document.getElementById('bird-readout-text').textContent =
      `About ${birdsLost.toLocaleString()} fewer birds since ${populationData[0].year}.`;
  }
}

function updateTreeDisplay(datum) {
  const totalTrees = 100;
  const oldGrowthTrees = Math.round((datum.oldGrowth / 100) * totalTrees);
  const disturbedRatio = datum.disturbed / 100;
  const disturbedTrees = Math.round(oldGrowthTrees * disturbedRatio);
  const icons = Array.from(document.querySelectorAll('.tree-icon'));

  icons.forEach((icon, index) => {
    icon.classList.remove('active', 'disturbed', 'faded');

    if (index < (oldGrowthTrees - disturbedTrees)) {
      icon.classList.add('active');
    } else if (index < oldGrowthTrees) {
      icon.classList.add('disturbed');
    } else {
      icon.classList.add('faded');
    }
  });

  const disturbedKm2 = Math.round(datum.habitatKm2 * (datum.disturbed / 100));
  const healthyKm2 = Math.round(datum.habitatKm2 - disturbedKm2);

  const title = document.getElementById('tree-readout-title');
  const text = document.getElementById('tree-readout-text');

  if (title) {
    title.textContent = `${datum.year}`;
  }

  document.getElementById('tree-healthy').textContent =
    `${healthyKm2.toLocaleString()} km²`;

  document.getElementById('tree-disturbed').textContent =
    `${disturbedKm2.toLocaleString()} km²`;

  if (text) {
    text.textContent =
      `Out of ${datum.habitatKm2.toLocaleString()} km², a large portion is disturbed, meaning fewer safe nesting areas for the birds.`;
  }
}

function drawPopulationChart() {
  const container = document.getElementById('population-chart');
  container.innerHTML = '';
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 16, right: 18, bottom: 44, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
    .attr('id', 'popGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#b8d9af');
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#e7aaa2');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(populationData, d => d.year))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(populationData, d => d.avg) * 1.08])
    .range([innerHeight, 0]);

  const colorScale = d3.scaleLinear()
    .domain([
      d3.min(populationData, d => d.avg),
      d3.max(populationData, d => d.avg)
    ])
    .range(['#e7aaa2', '#b8d9af']);

  const thicknessScale = d3.scaleLinear()
    .domain([
      d3.min(populationData, d => d.avg),
      d3.max(populationData, d => d.avg)
    ])
    .range([2, 6]);

  g.append("text")
    .attr("x", x(2020) - 150)
    .attr("y", y(56500) - 30)
    .attr("fill", "#e7aaa2")
    .attr("font-size", "12px")
    .text("~15,000 birds lost since 2002");

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
    .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
    .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(',')(d)))
    .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
    .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(''))
    .call(g => g.selectAll('line').attr('stroke', 'rgba(255,255,255,0.06)'))
    .call(g => g.select('.domain').remove());

  for (let i = 0; i < populationData.length - 1; i++) {
    const segment = [populationData[i], populationData[i + 1]];
    const segmentAvg = (segment[0].avg + segment[1].avg) / 2;

    g.append('path')
      .datum(segment)
      .attr('fill', 'none')
      .attr('stroke', colorScale(segmentAvg))
      .attr('stroke-width', thicknessScale(segmentAvg))
      .attr('stroke-linecap', 'round')
      .attr('d', d3.line()
        .x(d => x(d.year))
        .y(d => y(d.avg))
        .curve(d3.curveCatmullRom.alpha(0.45))
      );
  }

  g.selectAll('.pop-point')
    .data(populationData)
    .join('circle')
    .attr('class', 'pop-point')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.avg))
    .attr('r', 6)
    .attr('fill', d => colorScale(d.avg))
    .style('cursor', 'pointer')
    .on('mouseenter mousemove', (event, d) => {
      const baselineAvg = populationData[0].avg;
      const birdsLost = baselineAvg - d.avg;
      const visibleIcons = Math.max(1, Math.min(TOTAL_BIRD_ICONS, Math.round(d.avg / BIRDS_PER_ICON)));

      showTooltip(
        event,
        `<strong>${d.year}</strong><br>
        Population range: ${d.min.toLocaleString()}–${d.max.toLocaleString()} birds<br>
        Average estimate: ${d.avg.toLocaleString()} birds<br>
        Estimated loss from ${populationData[0].year}: ${birdsLost.toLocaleString()} birds<br>
        Visible icons: ${visibleIcons} (${BIRDS_PER_ICON.toLocaleString()} birds each)`
      );
      updateBirdDisplay(d);
    })
    .on('mouseleave', hideTooltip);

  const hoverLine = g.append('line')
    .attr('stroke', 'rgba(255,255,255,0.18)')
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .style('opacity', 0);

  g.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .on('mousemove', function(event) {
      const [mx] = d3.pointer(event, this);
      const year = x.invert(mx);
      const nearest = populationData.reduce((a, b) =>
        Math.abs(b.year - year) < Math.abs(a.year - year) ? b : a
      );

      hoverLine
        .style('opacity', 1)
        .attr('x1', x(nearest.year))
        .attr('x2', x(nearest.year));

      updateBirdDisplay(nearest);

      const baselineAvg = populationData[0].avg;
      const birdsLost = baselineAvg - nearest.avg;
      const visibleIcons = Math.max(1, Math.min(TOTAL_BIRD_ICONS, Math.round(nearest.avg / BIRDS_PER_ICON)));

      showTooltip(
        event,
        `<strong>${nearest.year}</strong><br>
        Population range: ${nearest.min.toLocaleString()}–${nearest.max.toLocaleString()} birds<br>
        Average estimate: ${nearest.avg.toLocaleString()} birds<br>
        Estimated loss from ${populationData[0].year}: ${birdsLost.toLocaleString()} birds<br>
        Visible icons: ${visibleIcons} (${BIRDS_PER_ICON.toLocaleString()} birds each)`
      );
    })
    .on('mouseleave', () => {
      hoverLine.style('opacity', 0);
      hideTooltip();
    });
}

function initNavState() {
  const links = document.querySelectorAll('.nav-links a');
  const sections = [...document.querySelectorAll('main section[id]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link =>
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)
        );
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(section => observer.observe(section));
}

function init() {
  setupBirdIcons();
  setupTreeIcons();
  updateBirdDisplay(populationData[0]);
  updateTreeDisplay(habitatData[0]);
  drawHabitatChart();
  drawPopulationChart();
  initNavState();
}

window.addEventListener('resize', () => {
  drawHabitatChart();
  drawPopulationChart();
});

init();