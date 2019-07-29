// TODO implement me!
// Add any "require" statements to import modules here, e.g.:
'use strict';
require('./lens.css');
const u = require('./Utils');
const conf = require('./Config');
const d3 = require('./d3.v3.min');
const handlebars = require('handlebars-template-loader/runtime');
const subjectTemplate = require('./template/subject-details.handlebars');
const sampleTemplate = require('./template/sample-details.handlebars');
const progressTemplate = require('./template/progress.handlebars');
const RealtimeChangeHandler = require('./RealtimeChangeHandler.js');
require('./multiline.js');

const LENS_ELEMENT = document.getElementById('lens');
const LENS_SELECTOR = d3.select('#lens');

let hierarchy = {};
let width = document.documentElement.clientWidth - conf.W_REDUCE;
let initHeight = document.documentElement.clientHeight - conf.H_REDUCE;
let searchableNodes = [];
let searchable = [];
let root;
let activeNode;
let loading;
let margin = {top: 30, right: 10, bottom: 20, left: 5},
  barHeight = 20,
  barWidth = (width - margin.left - margin.right) * 0.8;
//let duration = 400;

let tree = d3.layout.tree().size([initHeight, width])
  .sort(u.nodeSorter);

const diagonal = d3.svg.line()
 .x(function(d) { return d.y; })
 .y(function(d) { return d.x; });


let svg = d3.select("body").append("svg")
  .attr("width", width) // + margin.left + margin.right)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .append('text')
  .attr("x", (width / 2))
  .attr("y", -(margin.bottom))
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("");

handlebars.registerHelper('wrapPath', function(path) {
  return path.replace(/[.|]/g, '$&\u200B')
});

function setDetails(d) {
  const panelContents = document.getElementById('detailsPanel');

  if (d == null) {
    panelContents.innerHTML = '';
    return;
  }

  let context, template;
  if (d.samples) {
    context = conf.details.subject;
    template = subjectTemplate;
  } else {
    context = conf.details.sample;
    template = sampleTemplate;
  }

  if (d.tags && d.tags.length > 1) {
    d.tags.sort(u.nameAscending);
  } if (d.aspect && d.aspect.tags && d.aspect.tags.length > 1) {
    d.aspect.tags.sort(u.nameAscending);
  } if (d.relatedLinks && d.relatedLinks.length > 1) {
    d.relatedLinks.sort(u.nameAscending);
  }

  context.data = d;
  panelContents.innerHTML = template(context);

} // setDetails

function setDetailsPanelSizes() {
  const lensTop = 24 + document.getElementById('lens')
    .getBoundingClientRect().top;
  document.getElementById('searchInput').setAttribute('style',
    'left: ' + (width + 70) + 'px; ' +
    'top: ' + lensTop + 'px;');
  document.getElementById('searchResults').setAttribute('style',
    'left: ' + (width + 70) + 'px; ' +
    'top: ' + (lensTop + 16) + 'px; ' +
    'width: ' + (conf.W_REDUCE - 90) + 'px; ' +
    'max-height: ' + initHeight + 'px;');
  document.getElementById('detailsPanel').setAttribute('style',
    'left: ' + (width + 70) + 'px; ' +
    'top: ' + (lensTop + 16) + 'px; ' +
    'width: ' + (conf.W_REDUCE - 90) + 'px; ' +
    'height: ' + ((2 * initHeight / 3) - 36) + 'px;');
} // setDetailsPanelSizes

function toggle(d) {
  let subject = Boolean(d.samples);
  let closing = Boolean(d.children);
  let active = (d == activeNode);
  let hasParent = (d != root && d.parent != root);
  let sample = !subject;
  let opening = !closing;

  if (closing) {
    d._children = d.children;
    d.children = null;
  } else if (opening) {
    d.children = d._children;
    d._children = null;
  }

   if (subject && opening && !active)
     activeNode = d;
   if (subject && closing && active)
     activeNode = (hasParent? d.parent : null);
   if (sample)
     activeNode = (active? d.parent : d);

  setDetails(activeNode);
  if (activeNode) activeNode.class = 'bold';
} // toggle

// Clear bold, set details, toggle expand/collapse.
function nodeClick(d) {
  clearAll(root);
  toggle(d);
  redraw(d);
  d3.event.stopPropagation();
} // nodeClick

function hover(d) {
  setDetails(d);
  d3.select(this).select('rect').style('stroke-width', conf.BOLD_LINE_WIDTH);
  d3.select(this).select('text').style('font-weight', 'bold');
} // hover

function unhover(d) {
  setDetails(activeNode);
  if (activeNode != d) {
    d3.select(this).select('rect').style('stroke-width', conf.LINE_WIDTH);
    d3.select(this).select('text').style('font-weight', 'normal');
  }
} // unhover

function backgroundClick(d) {
  clearAll(root);
  activeNode = null;
  setDetails(null);
  redraw(d);
} // backgroundClick

function redraw(source) {

  const nodes = tree.nodes(root);
  const links = tree.links(nodes);
  let maxDepth = 0;

  let height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("svg").transition()
    .duration(conf.duration)
    .attr("height", height);

  d3.select(self.frameElement).transition()
    .duration(conf.duration)
    .style("height", height + "px");

  nodes.forEach((d) => {
    if (d.depth > maxDepth) {
      maxDepth = d.depth;
    }
  });
  maxDepth++;

  let index = -1;
  nodes.forEach((d) => {
    d.x = (++index) * barHeight;
    d.y = d.depth * 20;
  });

  // Update the nodes
  const node = svg.selectAll('g.node')
    .data(nodes, (d) => d.id ? d.id : d.aspectId );

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('id', (d) => d.id ? d.id : d.aspectId )
    .attr('transform', function(d) { return 'translate(' + source.y0 + ',' + source.x0 + ')'; })
    .style('opacity', 0)
    .on('click', nodeClick)
    .on('mouseenter', hover)
    .on('mouseleave', unhover);

  nodeEnter.append('rect')
    .attr('y', (-barHeight / 2 ) + margin.top)
    .attr('height', barHeight)
    .attr('width', barWidth)
    .on('click', nodeClick)
    .style('fill', (d) =>
      (d._children && d._children.length > 0) ?
        conf.color[d.status] : conf.CIRCLE_NO_FILL_COLOR);

  nodeEnter.append('text')
    .attr('dy', 3.5 + margin.top)
    .attr('dx', 5.5)
    .style('font-weight', (d) => d.class === 'bold' ? 'bold' : 'normal')
    .text((d) => d.absolutePath ? d.name : d.aspect.name);

  // Transition nodes to their new position.
  nodeEnter.transition()
    .duration(conf.duration)
    .attr('transform', function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    .style('opacity', 1);

  // Transition nodes to their new position.
  const nodeUpdate = node.transition()
    .duration(conf.duration)
    .attr('transform', function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    .style('opacity', 1)
    .select('rect')
    .style('fill', (d) => conf.color[d.status])
    .attr('x', -barHeight / 2)
    .attr('height', barHeight)
    .attr('width', barWidth)
    .select('text')
    .style('fill-opacity', 1)
    .style('font-weight', (d) => d.class === 'bold' ? 'bold' : 'normal');

  // Transition exiting nodes to the parent's new position.
  node.exit().transition().duration(conf.duration)
    .attr('transform', () => 'translate(' + source.y + ',' + source.x + ')')
    .remove();

  // Update the links
  const link = svg.selectAll('path.link')
    .data(links, (d) => d.target.id ? d.target.id : d.target.aspectId );

  // Enter any new links at the parent's previous position.
  link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', () => {
      if (source.x0 >= 0 && source.y0 >= 0) {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      }
    });

  // Transition links to their new position.
  link.transition().duration(conf.duration)
    .attr('d', diagonal)
    .style('stroke-width', (d) =>
      (d.source.class === 'bold' && d.target.class === 'bold') ?
        conf.BOLD_LINE_WIDTH : conf.LINE_WIDTH);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition().duration(conf.duration)
    .attr('d', () => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach((d) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
} // redraw

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
} // collapse

function expand(d) {
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
} // expand

/**
 * It can be useful to separate out any data manipulation you need to do
 * before rendering--you want to keep the redraw function as tight as possible!
 */
function preprocess(hier) {
  // console.log(new Date(), 'preprocessing hierarchy');
  // TODO implement me!
  // For example, you may want to manipulate the hierarchy and store it in
  // some data structure.
  hierarchy = u.clone(hier);
  root = u.childrenize(u.prepareHierarchyData(hierarchy));
  root.x0 = 0;
  root.y0 = 0;
  searchableNodes = tree.nodes(root);
  searchable = searchableNodes.map((n) => {
    return {
      key: n.id ? n.id : n.aspectId,
      value: n.absolutePath || n.name,
    };
  });
} // preprocess

function clearAll(d) {
  d.class = '';
  if (d.children) {
    d.children.forEach(clearAll);
  } else if (d._children) {
    d._children.forEach(clearAll);
  }
} // clearAll

function show(evt) {
  const usedId = evt.target.id ? evt.target.id : evt.target.aspectId;
  if (!usedId) {
    return;
  }

  const tid = usedId.substring(conf.SEARCH_RESULT_ID_PFX.length);
  const found = searchableNodes.find((n) => {
    const compareId = n.id ? n.id : n.aspectId;
    if (compareId === tid) {
      return n;
    }
  });
  if (found) {
    clearAll(root);
    found.class = 'bold';
    if (root.children) {
      root.children.forEach(collapse);
    }
    redraw(root);
    const ancestry = [];
    let par = found.parent;
    while (par) {
      par.class = 'bold';
      ancestry.push(par);
      par = par.parent;
    }

    ancestry.forEach(expand);
    toggle(found);
    redraw(found);
  }
} // show

function search() {
  const sr = document.getElementById('searchResults');
  const term = document.getElementById('searchInput').value.toLowerCase();

  while (sr.firstChild) {
    sr.removeChild(sr.firstChild);
  }

  function found(s) {
    return s.value.toLowerCase().indexOf(term) >= 0;
  }

  if (term.length >= conf.MINIMUM_SEARCH_TERM_LENGTH) {
    searchable.filter(found).forEach((s) => {
      const li = document.createElement('li');
      const displayVal = s.value.replace(root.absolutePath + '.', '');
      li.setAttribute('id', conf.SEARCH_RESULT_ID_PFX + s.key);
      li.appendChild(document.createTextNode(displayVal));
      li.addEventListener('mousedown', pauseBlur);
      li.addEventListener('click', show);
      li.addEventListener('click', resumeBlur);
      sr.appendChild(li);
    });
  }
} // search

function pauseBlur(e) {
  e.preventDefault();
}
function resumeBlur() {
  document.getElementById('searchInput').blur();
}

function initPage() {
  svg = LENS_SELECTOR.append('svg')
    .attr('id', 'svg-tree')
    .attr('width', width)
    .attr('height', initHeight)
    .on('click', backgroundClick)
    .append('g');

  // Set up the search panel
  const searchPanel = document.createElement('div');
  searchPanel.setAttribute('id', 'searchPanel');
  const searchInput = document.createElement('input');
  searchInput.setAttribute('id', 'searchInput');
  searchInput.setAttribute('type', 'text');
  searchInput.setAttribute('placeholder', 'Search...');
  searchInput.addEventListener('keyup', search);
  searchInput.addEventListener('focus', showResults);
  searchInput.addEventListener('blur', hideResults);
  LENS_ELEMENT.appendChild(searchInput);
  const searchResults = document.createElement('ol');
  searchResults.setAttribute('id', 'searchResults');
  LENS_ELEMENT.appendChild(searchResults);

  // Set up the details panel
  const detailsPanel = document.createElement('div');
  detailsPanel.setAttribute('id', 'detailsPanel');
  LENS_ELEMENT.appendChild(detailsPanel);
  setDetailsPanelSizes();
} // initPage

function showResults() {
  document.getElementById('searchResults').className = 'shown';
}
function hideResults() {
  document.getElementById('searchResults').className = 'hidden';
}

const eventTarget = {
  document: document,
  lens: LENS_ELEMENT,
  window: window,
};

/**
 * All the event handlers configured here will be registered on
 * refocus.lens.load.
 */
const eventHandler = {
  // document: {
  // },
  lens: {
    /**
     * Handle the refocus.lens.hierarchyLoad event. The hierarchy JSON is stored
     * in evt.detail. Preprocess the hierarchy if needed, then call redraw.
     */
    'refocus.lens.hierarchyLoad': (evt) => {
      // console.log(new Date(), '#lens => refocus.lens.hierarchyLoad');
      preprocess(evt.detail);
      root.children.forEach(collapse);
      loading.setAttribute('hidden', 'true');
      redraw(root);
    }, // refocus.lens.hierarchyLoad

    /**
     * Handle the refocus.lens.realtime.change event. The array of changes is
     * stored in evt.detail. Iterate over the array to perform any preprocessing
     * if needed, then call redraw only once after all the data manipulation is
     * done.
     */
     'refocus.lens.realtime.change': (evt) => {
      console.log(new Date(), 'refocus.lens.realtime.change',
        'contains ' + evt.detail.length + ' changes');
      if (Array.isArray(evt.detail) || evt.detail.length > 0) {
        evt.detail.forEach((chg) => {
          try {
            RealtimeChangeHandler.handle(chg);
          } catch (err) {
            console.error(err);
          }
        })
        // Now that we've processed all these changes, draw!
        redraw(root);
      }
     }, // refocus.lens.realtime.change
  },
  window: {
    /**
     * Handle when the browser/tab loses focus, e.g. user switches away from this
     * tab or browser is minimized or browser goes into background.
     */
    // blur: () => {
    //   console.log(new Date(), 'window => blur');
    //   TODO implement me!
    // }, // blur

    /**
     * Handle when the browser/tab regains focus, e.g. user switches back to this
     * tab or browser is restored from minimized state or browser comes back into
     * foreground.
     */
    // focus: () => {
    //   console.log(new Date(), 'window => focus');
    //   TODO implement me!
    // }, // focus

    /**
     * Handle when the fragment identifier of the URL has changed (the part of the
     * URL that follows the # symbol, including the # symbol).
     */
    // hashchange: (evt) => {
    //   console.log(new Date(), 'window => hashchange',
    //     'oldURL=' + evt.oldURL, 'newURL=' + evt.newURL);
    //   TODO implement me!
    //   For example, if the fragment identifier is a subject or sample, you
    //   may want to move focus to the DOM element representing that subject or
    //   sample, or open the corresponding modal.
    // }, // hashchange

    /**
     * Handle when the view has been resized.
     */
    resize: () => {
      console.log(new Date(), 'window => resize');
      // TODO implement me!
      // For example, you may want to show/hide/move/resize some DOM elements
      // based on the new viewport height and width.
      width = document.documentElement.clientWidth - conf.W_REDUCE;
      initHeight = document.documentElement.clientHeight - conf.H_REDUCE;
      tree = d3.layout.tree().size([initHeight, width])
        .sort(u.nodeSorter);
      d3.select('#svg-tree')
        .attr('width', width)
        .attr('height', initHeight);
      setDetailsPanelSizes();
      redraw(root);
    }, // resize
  },
}; // eventHandler

/*
 * Handle the load event. Register listeners for interesting window and lens
 * events here. This would also be a good place to render any DOM elements
 * which are not dependent on the hierarchy data (e.g. page header, page
 * footer, legend, etc.).
 */
// LENS_ELEMENT.addEventListener('refocus.lens.load', () => {
//     // console.log(new Date(), '#lens => refocus.lens.load');
//
//     // Register all the event listeners configured in eventHandler.
//     Object.keys(eventHandler).forEach((target) => {
//       Object.keys(eventHandler[target]).forEach((eventType) => {
//         eventTarget[target].addEventListener(eventType, eventHandler[target][eventType]);
//       });
//     });
//
//     // Add progress bar to display while waiting to receive the hierarchy.
//     LENS_ELEMENT.insertAdjacentHTML('beforeend', progressTemplate(conf.progress));
//     loading = document.getElementById('loading');
//
//   // TODO implement me!
//   // For example, you may want to render any DOM elements which are not
//   // dependent on hierarchy data.
//   initPage();
// }); // "load" event listener

const func = (lens = LENS_ELEMENT) => {
  lens.addEventListener('refocus.lens.load', () => {
    // console.log(new Date(), '#lens => refocus.lens.load');

    // Register all the event listeners configured in eventHandler.
    Object.keys(eventHandler).forEach((target) => {
      Object.keys(eventHandler[target]).forEach((eventType) => {
        eventTarget[target].addEventListener(eventType, eventHandler[target][eventType]);
      });
    });

    // Add progress bar to display while waiting to receive the hierarchy.
    LENS_ELEMENT.insertAdjacentHTML('beforeend', progressTemplate(conf.progress));
    loading = document.getElementById('loading');

    // TODO implement me!
    // For example, you may want to render any DOM elements which are not
    // dependent on hierarchy data.
    initPage();
    console.log(lens);
  }); // "load" event listener
}

func(LENS_ELEMENT);
