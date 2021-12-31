export default interface NFA {
    start: string;
    accept: string[];
    states: {
        [key: string]: {
            [char: string]: string[];
        };
    };
}

/**
 * validate a raw structure of an NFA
 * @param nfa
 */
function validateNFA(nfa: NFA){
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

/**
 * gets a raw and validates and structures it by all aspects and returns it
 * @param raw
 */
export function structNFA(raw: NFA): NFA {
    validateNFA(raw);
    return raw;
}
