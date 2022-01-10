/**
 * An interface for implementing all regular expressions such as *, +, etc.
 * +: or
 * *: one or more
 * $: epsilon
 */
export default interface Expression {
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
        if (this.expression instanceof Literal)
            return expression + "*";
        return "(" + expression + ")*";
    }

    public static of(expression: Expression): Expression {
        if (expression.evaluate() === '$')
            return new Literal('$');
        if (expression instanceof Star)
            return expression;
        return new Star(expression);
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
        return left + "+" + right;
    }

    public static of(left: Expression, right: Expression): Expression {
        if (left.evaluate() === right.evaluate())
            return left;
        return new Or(left, right);
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
        if (this.left instanceof Or)
            left = "(" + left + ")";
        if (this.right instanceof Or)
            right = "(" + right + ")";
        return left + right || '$';
    }

    public static of(left: Expression, right: Expression): Expression {
        if (left.evaluate() === '$')
            return right;
        if (right.evaluate() === '$')
            return left;
        return new Concatenation(left, right);
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

export { Star, Or, Concatenation, Literal };