/**
 * An interface for implementing all regular expressions such as *, +, etc.
 * +: or
 * *: one or more
 * $: epsilon
 */
interface Expression {
    evaluate(): string;
}

class Star implements Expression {
    private expression: Expression;

    constructor(expression: Expression) {
        this.expression = expression;
    }

    evaluate(): string {
        const expression = this.expression.evaluate();
        if (expression === '$')
            return '$';
        return "(" + expression + ")*";
    }
}

class Or implements Expression {
    private left: Expression;
    private right: Expression;

    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }

    evaluate(): string {
        const left = this.left.evaluate();
        const right = this.right.evaluate();
        return "(" + left + "+" + right + ")";
    }
}

class Concatenation implements Expression {
    private left: Expression;
    private right: Expression;

    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }

    evaluate(): string {
        let left = this.left.evaluate();
        let right = this.right.evaluate();
        if (left === '$') left = '';
        if (right === '$') right = '';
        return left + right || '$';
    }
}

class Literal implements Expression {
    readonly value: string;

    constructor(value: string) {
        this.value = value;
        if (!value)
            this.value = '$';
    }

    evaluate(): string {
        return this.value;
    }
}