import Expression, {Literal, Or, Star, Concatenation} from './expression';

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
    private static validateNFA(nfa: Automation){
        if (!nfa.start) {
            throw new Error('NFA must have a start state');
        }
        if (!nfa.accept) {
            throw new Error('NFA must have accept states');
        }
        if (!nfa.states) {
            throw new Error('NFA must have states');
        }
        if (!nfa.states[nfa.start]) {
            throw new Error(`${nfa.start} is not a valid start state`);
        }
        for (const accept of nfa.accept) {
            if (!nfa.states[accept]) {
                throw new Error(`${accept} is not a valid accept state`);
            }
        }
        for (const state in nfa.states) {
            for (const char in nfa.states[state]) {
                for (const next of nfa.states[state][char]) {
                    if (!nfa.states[next]) {
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
    private ripped: boolean;
    private _pathMap: {
        [key: string]: {
            [key: string]: Expression;
        };
    };

    private static mapFromKeys(keys: string[]) {
        const map = {};
        for (const key of keys)
            map[key] = undefined;
        return map;
    }

    private generatePathMap() {
        this._pathMap = {};
        for (const from in this._automation.states) {
            this._pathMap[from] = {...GNFA.mapFromKeys(this.getStates())};
            for (const char in this._automation.states[from]) {
                this._automation.states[from][char].forEach(to => {
                    const literal = new Literal(char);
                    if (!this._pathMap[from][to])
                        this._pathMap[from][to] = literal;
                    else
                        this._pathMap[from][to] = new Or(this._pathMap[from][to], literal);
                });
            }
        }
    }

    getStates(): string[] {
        return Object.keys(this._pathMap);
    }

    public ripState(state: string) {
        const newPathMap = {};
        const newStates = this.getStates().filter(s => s !== state);
        for (const from of newStates) {
            newPathMap[from] = {...GNFA.mapFromKeys(newStates)};
            for (const to of newStates) {
                const directPath = this._pathMap[from][to];
                const fts = this._pathMap[from][state];
                const stt = this._pathMap[state][to];
                const sts = this._pathMap[state][state];
                let otherPath: Expression;
                if (fts && stt) {
                    otherPath = fts;
                    if (sts) otherPath = new Concatenation(otherPath, new Star(sts));
                    otherPath = new Concatenation(otherPath, stt);
                }
                if (otherPath && directPath)
                    newPathMap[from][to] = new Or(otherPath, directPath);
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
            this._automation.states[accept]['$'] = ['#'];
        }
        this._automation.start = '@';
        this._automation.accept = ['#'];
    }

    constructor(automation: Automation) {
        super(automation);
        this.convertAutomataToGNFA();
        this.generatePathMap();
    }

    public ripAllStates() {
        this.getStates().filter(s => s !== '@' && s !== '#').forEach(s => this.ripState(s));
        this.ripped = true;
    }

    public getRegex() {
        if (!this.ripped)
            throw new Error('Automaton has not been ripped yet');
        return this._pathMap['@']['#'].evaluate();
    }
}