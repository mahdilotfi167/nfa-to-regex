import {Component} from "react";
import {GNFA} from "../logic/automata";
import Editor from "@monaco-editor/react";

export default class NFAView extends Component<NFAViewProps, NFAViewState> {
    constructor(props: NFAViewProps) {
        super(props);
        this.props.nfa.ripAllStates();
    }
    componentDidMount() {
        this.props.nfa.ripAllStates();
    }

    render() {
        return (<>
            <Editor
                height="10vh"
                defaultLanguage="typescript"
                defaultValue={this.props.nfa.getRegex()}
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false
                    },
                    fontSize: 18,
                    fontLigatures: true,
                    fontFamily: "Cascadia Code",
                    autoIndent: "advanced",
                    automaticLayout: true,
                    wordWrap: "off",
                    readOnly: true,
                    lineNumbers: "off",
                }}
            />
            </>)
    }
}

interface NFAViewProps {
    nfa: GNFA;
}

interface NFAViewState {

}