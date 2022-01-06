import {FC} from "react";
import GraphVis from "react-graph-vis";
import Graph, {Node} from "../typings/graph";

interface GraphViewProps {
    graph: Graph;
    height?: string;
    onSelectNode?: (node: Node) => void;
}

const options = {
    autoResize: true,
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#700b97",
        width: 1.2,
        smooth: {
            enabled: true,
            type: "discrete",
            roundness: 0.9
        },
        font: {
            color: "#000000",
            size: 12,
            face: 'cascadia'
        }
    },
    physics: {
        enabled: false
    },
    height: "500px",
    nodes: {
        color: "#8e05c2",
        font: {
            color: "#fff",
            face: 'cascadia'
        },
    },
    interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectable: true,
        selectConnectedEdges: true,
    }
}

/**
 * Simple component for rendering a graph.
 * @param graph
 * @param onSelectNode
 * @param height
 * @constructor
 */
export const GraphView: FC<GraphViewProps> = ({graph, onSelectNode, height}) => {
    const normalizedEdgesLabeled = graph.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label + new Array(edge.label.length + 1).join(' '),
    }));
    if (height) {
        options.height = height;
    }
    const events = {
        select: (event: any) => {
            if (event.nodes.length > 0) {
                if (onSelectNode) {
                    const node = graph.nodes.find(n => n.id === event.nodes[0]);
                    onSelectNode(node);
                }
            }
        }
    };
    return (
        <GraphVis
            graph={
                {
                    nodes: graph.nodes,
                    edges: normalizedEdgesLabeled
                }
            }
            options={options}
            events={events}
        />
    );
}