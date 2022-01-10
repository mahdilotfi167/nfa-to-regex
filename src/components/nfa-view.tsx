import {Component} from "react";
import {GNFA} from "../logic/automata";
import Editor from "@monaco-editor/react";
import Graph from "react-graph-vis";
import {GraphView} from "./graph-view";
import { Node } from "../typings/graph";
import {Alert, ProgressBar} from "react-bootstrap";

export default class NFAView extends Component<NFAViewProps, NFAViewState> {
    private rippedStack: string[] = [];

    constructor(props: NFAViewProps) {
        super(props);
    }

    componentDidUpdate(prevProps: Readonly<NFAViewProps>, prevState: Readonly<NFAViewState>, snapshot?: any) {
        if (this.props.gnfa !== prevProps.gnfa) {
            this.rippedStack = [];
            this.forceUpdate();
        }
    }

    private onSelectNode = (node: Node) => {
        try {
            this.props.gnfa.ripState(node.label);
            this.rippedStack.push(node.label);
            this.forceUpdate();
            this.props.setError(null);
        } catch (e) {
            if (this.props.setError) {
                this.props.setError(e.message);
            } else
                console.error(e);
        }
    }

    private generateProgressData = () => {
        const res: {
            variant: string,
            label: string,
            now: number,
            key: number,
        }[] = [];
        const variants = [
            'success',
            'danger',
            'warning',
            'info',
        ]
        const unitLen = 1 / (this.props.gnfa.getPureStates().length + this.rippedStack.length) * 100;
        for (let i = 0; i < this.rippedStack.length; i++) {
            res.push({
                variant: variants[i % variants.length],
                label: this.rippedStack[i],
                now: unitLen,
                key: i,
            });
        }
        return res;
    }

    render() {
        return (<>
            <GraphView graph={this.props.gnfa.getGraph()} onSelectNode={this.onSelectNode} height="700px" />
            <ProgressBar animated className="states-progress-bar bg-dark">
                {this.generateProgressData().map(data =>
                    <ProgressBar striped animated key={data.key} variant={data.variant} now={data.now} label={data.label} />
                )}
            </ProgressBar>
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