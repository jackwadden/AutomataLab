;(function() {
    'use strict';

    sigma.utils.pkg('sigma.canvas.edges');

    /**
     * The default edge renderer. It renders the edge as a simple line.
     *
     * @param  {object}                   edge         The edge object.
     * @param  {object}                   source node  The edge source node.
     * @param  {object}                   target node  The edge target node.
     * @param  {CanvasRenderingContext2D} context      The canvas context.
     * @param  {configurable}             settings     The settings function.
     */
    sigma.canvas.edges.def = function(edge, source, target, context, settings) {
	var color = edge.color,
        prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1,
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
	nodeSize = source[prefix + 'size'];

	if (!color)
	    switch (edgeColor) {
            case 'source':
		color = source.color || defaultNodeColor;
		break;
            case 'target':
		color = target.color || defaultNodeColor;
		break;
            default:
		color = defaultEdgeColor;
		break;
	    }

	context.strokeStyle = color;
	context.lineWidth = size;
	context.beginPath();
	context.moveTo(
	    source[prefix + 'x'],
	    source[prefix + 'y']
	);
	// self-loop handling
	if (source === target) {
	    /* 
	    //Square self-loop
	    context.lineTo(
		source[prefix + 'x'] + nodeSize*2,
		source[prefix + 'y']
	    );
	    context.lineTo(
		source[prefix + 'x'] + nodeSize*2,
		source[prefix + 'y'] - nodeSize*2
	    );
	    context.lineTo(
		source[prefix + 'x'],
		source[prefix + 'y'] - nodeSize*2
	    );
	    context.lineTo(
		source[prefix + 'x'],
		source[prefix + 'y']
	    );*/
	    // Circular self-loop
	    context.arc(
		source[prefix + 'x'] + nodeSize*.8,
		source[prefix + 'y'] - nodeSize*.8,
		nodeSize*.8, 
		Math.PI,
 		Math.PI/2);
	    
	}

	else {
	    context.lineTo(
		target[prefix + 'x'],
		target[prefix + 'y']
	    );
	}
	context.stroke();
    };
})();
