export interface Node {
    id: number;
    label: string;
}

export interface Edge {
    from: number;
    to: number;
    label: string;
}

export default interface Graph {
    nodes: Node[];
    edges: Edge[];
}