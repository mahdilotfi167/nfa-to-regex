import {Component} from "react";
import NFA from "../logic/nfa";

export default class NFAView extends Component<NFAViewProps, NFAViewState> {
    constructor(props: NFAViewProps) {
        super(props);
    }
    render() {
        return <div>
            <h1>NFA View</h1>
        </div>;
    }
}

interface NFAViewProps {
    nfa: NFA;
}

interface NFAViewState {

}