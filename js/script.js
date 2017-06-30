
// Graph neighbor function from Sigma.js
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
    neighbors = {},
    index = this.allNeighborsIndex[nodeId] || {};

    for (k in index) {
        neighbors[k] = this.nodesIndex[k];
    }
    return neighbors;
});

// Modified Graph neighbor function from Sigma.js
sigma.classes.graph.addMethod('outEdges', function(nodeId) {
    var k,
    e,
    outgoingEdges = {},
    index = this.outNeighborsIndex[nodeId] || {};

    for (k in index) {
	for (e in this.outNeighborsIndex[nodeId][k]) {
            outgoingEdges[e] = this.edgesIndex[e];
	}
    }
    return outgoingEdges;
});

var changedGraph = new sigma.classes.graph();
var sig = new sigma();

function addInputCharacter(character) {
    $('#input-table-row').append("<td class='input-display-character'>" + character + "</td>");
}

function loadGraph(json_object){
    try {
	sig.graph.clear();
	sig.refresh();
    } catch (e) {
	console.log("Error clearing graph: " + e.message);
    }
    try {
	sig = new sigma({
	    renderer: {

		container: document.getElementById('graph-container'),
		// Allows for alpha channel and self-loops
		type: 'canvas'
		//type: 'webgl'
	    },
	    settings: {
		skipIndexation: true,
		labelThreshold: 100,
		hideEdgesOnMove: true,
		zoomMin: .00001,
		zoomMax: 2,
		edgeColor: "default",
		defaultEdgeColor: "#888",
		maxNodeSize: 1,
		minNodeSize: 0,
		minEdgeSize: 0,
		maxEdgeSize: .1,
		minArrowSize: 1
	    }
	});
	sig.graph.read(json_object);
	
	// Set sizes and save color of nodes

	sig.graph.nodes().forEach(function(n) {
	    n.size = "1";
	    n.originalColor = n.color;
	    n.ox = n.x;
	});
	sig.graph.edges().forEach(function(e) {
	    e.size = "0.05";
	});

	// Neighborhood clickability

	sig.bind('clickNode', function(e) {

	    var nodeId = e.data.node.id,
	    toKeep = sig.graph.neighbors(nodeId);
	    toKeep[nodeId] = e.data.node;

	    sig.graph.nodes().forEach(function(n) {
		if (toKeep[n.id])
		    n.hidden = false;
		else
		    n.hidden = true;
	    });

	    sig.graph.edges().forEach(function(e) {
		if (e.source == nodeId || e.target == nodeId) 
		    e.hidden = false;
		else
		    e.hidden = true;
	    });

	    sig.refresh();
	});

	sig.bind('clickStage', function(e) {
	    sig.graph.nodes().forEach(function(n) {
		n.hidden = false;
	    });

	    sig.graph.edges().forEach(function(e) {
		e.hidden = false;
	    });

	    sig.refresh();
	});
	
	CustomShapes.init(sig);
	sig.refresh();
	$('#loading-graph-modal').modal('hide');
    } catch (err) {
	$('#loading-graph-modal').modal('hide');
	alert(err.message);
    }
}



function updateGraph(updateJson) {
    // Revert the colors of all previously updated nodes and edges
    
    changedGraph.nodes().forEach(function (n) {
	sig.graph.nodes(n.id).color = n.originalColor;
    });
    changedGraph.edges().forEach(function (e) {
	sig.graph.edges(e.id).color = "#888";
    });
    changedGraph.clear();
    console.log("cleared changedGraph");
    
    var changedNodesArray = updateJson.nodes;
    var changedNodeIDs = [];
    for (var i = 0; i < changedNodesArray.length; i++)
	changedNodeIDs[i] = changedNodesArray[i].id;
    var sigmaNodes = sig.graph.nodes(changedNodeIDs);
    for (var i = 0; i < sigmaNodes.length; i++)
	changedGraph.addNode(sigmaNodes[i]);
    for (var i = 0; i < sigmaNodes.length; i++) {
	console.log("added node" + sigmaNodes[i].id);
	sigmaNodes[i].color = changedNodesArray[i].color;
	// If node is activated, light up outgoing edges
	if (sigmaNodes[i].color == "rgb(0,255,0)") {
	    var outgoingEdges = sig.graph.outEdges(sigmaNodes[i].id);
	    for (e in outgoingEdges) {
		outgoingEdges[e].color = "#0f0";
		console.log("outgoingEdge[e] id=" + outgoingEdges[e].id + ", t=" + outgoingEdges[e].target);
		changedGraph.addEdge(outgoingEdges[e]);
		console.log("added edge " + outgoingEdges[e].id);
	    }
	}
    }
    sig.refresh();
}

// Graph manipulation controls

function nodeSizeChange(val) {
    var size = .125 * Math.pow(val, 1.5);
    sig.settings('maxNodeSize', size);
    sig.refresh();
}

function arrowSizeChange(val) {
    sig.settings('minArrowSize', val);
    sig.refresh();
}

function edgeSizeChange(val) {
    var size = .00625 * Math.pow(val, 2);
    sig.settings('maxEdgeSize', size);
    sig.refresh();
}

function toggleEdges() {
    if ($('#inrender-edge-box').is(':checked'))
	sig.settings("drawEdges", true);
    else 
	sig.settings("drawEdges", false);

    $('#edge-slider').toggle('disabled');
    sig.refresh();
}

function toggleChevron() {
    $('#nav-hide-icon').toggleClass("glyphicon glyphicon-chevron-up");
    $('#nav-hide-icon').toggleClass("glyphicon glyphicon-chevron-down");
}

function graph_tab_clicked() {
    // Deselect sim tab
    $('#sim-tab').removeClass("active");
    $('#sim-tools').hide();
    // Select graph tab
    $('#graph-tab').addClass("active");
    $('#graph-settings').show();
}

function sim_tab_clicked() {
    // Deselect graph tab
    $('#graph-tab').removeClass("active");
    $('#graph-settings').hide();
    // Select sim tab
    $('#sim-tab').addClass("active");
    $('#sim-tools').show();
}

function xScaleChange(val) {
    try {
	sig.graph.nodes().forEach(function (n) {
	    n.x = n.ox * val / 10;
	});
	sig.refresh();
    } catch (e) {
	console.log(e.message);
    }
}
