import Expression, {Literal, Or, Star, Concatenation} from './expression';
import Graph from "../typings/graph";

export interface Automation {
    start: string;
    accept: string[];
    states: {
        [key: string]: {
            [char: string]: string[];
        };
    };
}

abstract class Automata {
    protected _automation: Automation;

    public getStates(): string[] {
        return Object.keys(this._automation.states);
    }

    protected constructor(automation: Automation) {
        this._automation = automation;
    }
}

export class NFA extends Automata {
    /**
     * validate a raw structure of an NFA
     * @param nfa
     */
    private static validateNFA(nfa: Automation) {
        if (nfa.start === undefined || nfa.start === null) {
            throw new Error('NFA must have a start state');
        }
        if (!nfa.accept) {
            throw new Error('NFA must have accept states');
        }
        if (!nfa.states) {
            throw new Error('NFA must have states');
        }
        if (!(nfa.start in nfa.states)) {
            throw new Error(`${nfa.start} is not a valid start state`);
        }
        for (const accept of nfa.accept) {
            if (!(accept in nfa.states)) {
                throw new Error(`${accept} is not a valid accept state`);
            }
        }
        for (const state in nfa.states) {
            for (const char in nfa.states[state]) {
                if (!nfa.states[state][char]) {
                    throw new Error(`remove unused transition from ${state} on expression ${char}`);
                }
                for (const next of nfa.states[state][char]) {
                    if (!(next in nfa.states)) {
                        throw new Error(`${next} is not a valid state`);
                    }
                }
            }
        }
    }

    constructor(automation: Automation) {
        super(automation);
        NFA.validateNFA(automation);
    }
}

export class GNFA extends NFA {
    private states: string[];
    private graphIds: {
        [key: string]: number;
    };
    private _pathMap: {
        [key: string]: {
            [key: string]: Expression;
        };
    };

    /**
     * returns a map from given keys
     * all values are undefined
     * @param keys keys to map
     * @private
     */
    private static mapFromKeys(keys: string[]) {
        const map = {};
        for (const key of keys)
            map[key] = undefined;
        return map;
    }

    private generatePathMap() {
        this._pathMap = {};
        for (const from in this._automation.states) {
            const states = this.getStates();
            this._pathMap[from] = {...GNFA.mapFromKeys(this.getStates())};
            for (const char in this._automation.states[from]) {
                this._automation.states[from][char].forEach(to => {
                    const literal = new Literal(char);
                    if (!this._pathMap[from][to])
                        this._pathMap[from][to] = literal;
                    else
                        this._pathMap[from][to] = Or.of(this._pathMap[from][to], literal);
                });
            }
        }
    }

    public getPureStates(): string[] {
        return this.getStates().filter(s => s !== '@' && s !== '#');
    }

    public getStates(): string[] {
        return this.states;
    }

    public ripState(state: string) {
        const newPathMap = {};
        if (!(state in this._pathMap))
            throw new Error(`${state} is not a valid state`);
        if (state === '@' || state === '#')
            throw new Error(`start and accept states cannot be ripped`);
        this.states = this.getStates().filter(s => s !== state);
        for (const from of this.states) {
            newPathMap[from] = {...GNFA.mapFromKeys(this.states)};
            for (const to of this.states) {
                const directPath = this._pathMap[from][to];
                const fts = this._pathMap[from][state];
                const stt = this._pathMap[state][to];
                const sts = this._pathMap[state][state];
                let otherPath: Expression;
                if (fts && stt) {
                    otherPath = fts;
                    if (sts) otherPath = Concatenation.of(otherPath, Star.of(sts));
                    otherPath = Concatenation.of(otherPath, stt);
                }
                if (otherPath && directPath)
                    newPathMap[from][to] = Or.of(otherPath, directPath);
                else
                    newPathMap[from][to] = otherPath || directPath;
            }
        }
        this._pathMap = newPathMap;
    }

    private convertAutomataToGNFA() {
        this._automation.states['@'] = {'$': [this._automation.start]};
        this._automation.states['#'] = {};
        for (const accept of this._automation.accept) {
            if (!this._automation.states[accept])
                this._automation.states[accept] = {};
            if (!this._automation.states[accept]['$'])
                this._automation.states[accept]['$'] = [];
            this._automation.states[accept]['$'].push('#');
        }
        this._automation.start = '@';
        this._automation.accept = ['#'];
    }

    constructor(automation: Automation) {
        super(automation);
        this.convertAutomataToGNFA();
        this.states = Object.keys(this._automation.states);
        this.graphIds = {};
        this.states.forEach((s, id) => this.graphIds[s] = id);
        this.generatePathMap();
    }

    public getStateId(state: string) {
        return this.graphIds[state];
    }

    public getGraph(): Graph {
        const res: Graph = {
            nodes: null,
            edges: []
        };
        const states = this.getStates();
        res.nodes = states.map((s) => ({id: this.getStateId(s), label: s}));
        for (let from of states) {
            for (let to of states) {
                if (this._pathMap[from][to]) {
                    res.edges.push({
                        from: this.getStateId(from),
                        to: this.getStateId(to),
                        label: this._pathMap[from][to].evaluate()
                    });
                }
            }
        }
        return res;
    }
}
