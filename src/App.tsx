import Editor from '@monaco-editor/react';
import './assets/css/style.css';
import yaml from 'js-yaml';
import {Component} from "react";
import NFAView from "./components/nfa-view";
import {Alert, Button, Container, Row} from "react-bootstrap";
import { Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Automation, GNFA} from "./logic/automata";

const initialCode = `# NFA to regex converter

states:
    1:
        a:
            - 2
        b:
            - 3
    2:
        a:
            - 1
        b:
            - 2
    3:
        a:
            - 2
        b:
            - 1
start: 1
accept:
    - 2
    - 3`;

export class App extends Component<{}, {err?: string, nfa: GNFA}> {
    private code: string;

    constructor(props: any) {
        super(props);
        this.state = {
            err: null,
            nfa: null,
        };
        this.code = initialCode;
    }

    private onSimulation = () => {
        try {
            const automation: Automation = yaml.load(this.code);
            const nfa = new GNFA(automation);
            this.setState({ err: null, nfa });
        } catch (e) {
            this.setState({ err: e.message, nfa: null });
        }
    }

    render() {
        return (
            <>
                <Container fluid>
                    <Row>
                        <Col md={6} sm={12} className={'d-flex flex-column'}>
                            {this.state.err && <Alert variant={"danger"} className={'px-3 py-2'}>
                                <Alert.Heading>Error</Alert.Heading>
                                <pre>{this.state.err}</pre>
                            </Alert>}
                            <Button variant={"success"} onClick={this.onSimulation}>convert</Button>
                            {this.state.nfa && <NFAView nfa={this.state.nfa}/>}
                        </Col>
                        <Col md={6} sm={6}>
                            <Editor
                                height="90vh"
                                defaultLanguage="yaml"
                                defaultValue={initialCode}
                                onChange={(c) => this.code = c}
                                theme="vs-dark"
                                options={{
                                    minimap: {
                                        enabled: false
                                    },
                                    fontSize: 15,
                                    fontLigatures: true,
                                    fontFamily: "Cascadia Code",
                                    autoIndent: "advanced",
                                    automaticLayout: true,
                                    wordWrap: "on",
                                }}
                            />
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}
