import Editor from '@monaco-editor/react';
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

    private setErr = (err: string) => {
        this.setState({ err });
    }

    render() {
        return (
            <>
                <Container fluid>
                    <Row>
                        <Col lg={6} sm={12} xs={12} className={'d-flex flex-column align-items-stretch'}>
                            {this.state.err && <Alert variant={"danger"} className={'px-3 py-2'}>
                                <Alert.Heading>Error</Alert.Heading>
                                <pre>{this.state.err}</pre>
                            </Alert>}
                            <Button variant="flat" size={"lg"} onClick={this.onSimulation}>load</Button>
                            {this.state.nfa && <NFAView gnfa={this.state.nfa} setError={this.setErr} />}
                        </Col>
                        <Col lg={6} sm={12} xs={12}>
                            <Editor
                                height="100vh"
                                defaultLanguage="yaml"
                                defaultValue={initialCode}
                                onChange={(c) => this.code = c}
                                theme="vs-dark"
                                options={{
                                    minimap: {
                                        enabled: false
                                    },
                                    fontSize: 18,
                                    fontLigatures: true,
                                    fontFamily: "cascadia",
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
