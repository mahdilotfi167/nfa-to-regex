import {Component} from "react";
import {GNFA} from "../logic/automata";
import Editor from "@monaco-editor/react";
import Graph from "react-graph-vis";
import {GraphView} from "./graph-view";
import { Node } from "../typings/graph";
import {Alert} from "react-bootstrap";

export default class NFAView extends Component<NFAViewProps, NFAViewState> {
    constructor(props: NFAViewProps) {
        super(props);
    }

    componentDidMount() {
        // console.log(this.props.gnfa.getGraph())
    }

    private onSelectNode = (node: Node) => {
        try {
            this.props.gnfa.ripState(node.label);
            this.forceUpdate();
            this.props.setError(null);
        } catch (e) {
            if (this.props.setError) {
                this.props.setError(e.message);
            } else
                console.error(e);
        }
    }

    render() {
        return (<>
            <GraphView graph={this.props.gnfa.getGraph()} onSelectNode={this.onSelectNode} height="700px" />
            <Alert variant="info">
                <Alert.Heading>
                    Info
                </Alert.Heading>
                <ul>
                    <li>
                        for rip state, click on the node in the graph new graph will be generated
                    </li>
                    <li>
                        virtual start state is @ and virtual end state is # these states can't be riped
                    </li>
                    <li>
                        the final expression between the start and end state is the expression of the NFA
                    </li>
                </ul>
            </Alert>
        </>)
    }
}

interface NFAViewProps {
    gnfa: GNFA;
    setError?: (error: string) => void;
}

interface NFAViewState {

}