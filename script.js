// script.js
const habitatData = [
    { year: 1978, oldGrowth: 100, disturbed: 12 },
    { year: 1984, oldGrowth: 94, disturbed: 18 },
    { year: 1990, oldGrowth: 87, disturbed: 24 },
    { year: 1996, oldGrowth: 76, disturbed: 35 },
    { year: 2002, oldGrowth: 68, disturbed: 41 },
    { year: 2008, oldGrowth: 61, disturbed: 49 },
    { year: 2014, oldGrowth: 56, disturbed: 57 },
    { year: 2020, oldGrowth: 51, disturbed: 63 },
    { year: 2024, oldGrowth: 49, disturbed: 67 }
  ];
  
  const populationData = [
    { year: 1978, index: 1.00 },
    { year: 1984, index: 0.94 },
    { year: 1990, index: 0.86 },
    { year: 1996, index: 0.76 },
    { year: 2002, index: 0.68 },
    { year: 2008, index: 0.60 },
    { year: 2014, index: 0.49 },
    { year: 2020, index: 0.36 },
    { year: 2024, index: 0.28 }
  ];
  
  const tooltip = d3.select('#tooltip');
  
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
  
        showTooltip(
          event,
          `<strong>${nearest.year}</strong><br>Old-growth: ${nearest.oldGrowth}%<br>Disturbed: ${nearest.disturbed}%`
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
    for (let i = 0; i < 100; i++) {
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
    const totalBirds = 100;
    const activeBirds = Math.max(1, Math.round(datum.index * totalBirds));
    const icons = Array.from(document.querySelectorAll('.bird-icon'));
  
    icons.forEach((icon, index) => {
      icon.classList.remove('active', 'faded');
      if (index < activeBirds) {
        icon.classList.add('active');
      } else {
        icon.classList.add('faded');
      }
    });
  
    document.getElementById('bird-readout-title').textContent = `${datum.year} — ${activeBirds} / 100 birds`;
    document.getElementById('bird-readout-text').textContent =
      `Population index: ${datum.index.toFixed(2)} relative to the 1978 baseline. As the index decreases, fewer bird icons remain visible.`;
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
      } 
      else if (index < oldGrowthTrees) {
        icon.classList.add('disturbed');
      } 
      else {
        icon.classList.add('faded');
      }
    });
  
    const healthyTrees = oldGrowthTrees - disturbedTrees;
  
    const title = document.getElementById('tree-readout-title');
    const text = document.getElementById('tree-readout-text');
  
    if (title) {
      title.textContent = `${datum.year} — ${healthyTrees} healthy / ${disturbedTrees} disturbed / ${100 - oldGrowthTrees} lost`;
    }
  
    if (text) {
      text.textContent =
        `Old-growth remaining: ${datum.oldGrowth}%. Of that remaining forest, ${datum.disturbed}% is disturbed.`;
    }
  }
  
  function drawPopulationChart() {
    const container = document.getElementById('population-chart');
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
      .domain([0, 1.05])
      .range([innerHeight, 0]);
  
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
      .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));
  
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')))
      .call(g => g.selectAll('text').attr('fill', '#a2ad9c'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.14)'));
  
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(''))
      .call(g => g.selectAll('line').attr('stroke', 'rgba(255,255,255,0.06)'))
      .call(g => g.select('.domain').remove());
  
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.index))
      .curve(d3.curveCatmullRom.alpha(0.45));
  
    g.append('path')
      .datum(populationData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#popGradient)')
      .attr('stroke-width', 4)
      .attr('d', line);
  
    g.selectAll('.pop-point')
      .data(populationData)
      .join('circle')
      .attr('class', 'pop-point')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.index))
      .attr('r', 6)
      .attr('fill', d => d.index > 0.55 ? '#b8d9af' : '#e7aaa2')
      .style('cursor', 'pointer')
      .on('mouseenter mousemove', (event, d) => {
        const birds = Math.max(1, Math.round(d.index * 100));
        showTooltip(event, `<strong>${d.year}</strong><br>Population index: ${d.index.toFixed(2)}<br>Visible birds: ${birds} / 100`);
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
        const birds = Math.max(1, Math.round(nearest.index * 100));
        showTooltip(event, `<strong>${nearest.year}</strong><br>Population index: ${nearest.index.toFixed(2)}<br>Visible birds: ${birds} / 100`);
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