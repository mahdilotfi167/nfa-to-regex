import Editor from '@monaco-editor/react';
import './assets/css/style.css';
import yaml from 'js-yaml';
import {Component, useState} from "react";
import NFAView from "./components/nfa-view";
import NFA, {structNFA} from "./logic/nfa";
import {Container, Row} from "react-bootstrap";
import { Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Alert, AlertTitle, Button} from "@mui/material";

const initialCode = `# NFA to regex converter

# define states
states:
    q0:
        a:
            - q1
            - q2
        $:
            - q1
    q1:
        b:
            - q2
    q2:
        a:
            - q2
        b:
            - q2

# define start and accept states
start: q0
accept:
    - q1
    - q2`;

export class App extends Component<{}, {err?: string, nfa: NFA}> {
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
            const rawNFA = yaml.load(this.code);
            const nfa = structNFA(rawNFA);
            this.setState({ err: null, nfa: nfa });
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
                            {this.state.err && <Alert severity={"error"} className={'p-1'}>
                                <AlertTitle>Error</AlertTitle>
                                <pre>{this.state.err}</pre>
                            </Alert>}
                            <Button sx={{my: 2}} variant={"contained"} color={"success"} onClick={this.onSimulation}>convert</Button>
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
