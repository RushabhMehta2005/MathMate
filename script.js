document.addEventListener('DOMContentLoaded', function() {
    let display = document.querySelector('#display');
    let mode = 'RAD'; // Default Mode. mode belongs to {'RAD', 'DEG'}

    let AC = document.querySelector('#AC');
    AC.addEventListener('click', function() {
        display.value = "";
        display.focus();
    });

    let DEL = document.querySelector('#DEL');
    DEL.addEventListener('click', function() {
        let pos = getCursor(display);
        display.value = display.value.substring(0, pos - 1) + display.value.substring(pos);
        setCursor(display, pos - 1);
        display.focus();
    });

    let RAD = document.querySelector('#RAD');
    RAD.addEventListener('click', function() {
       if (mode === 'RAD') {
        mode = 'DEG';
       } 
       else {
        mode = 'RAD';
       }
       RAD.innerHTML = mode;
    });

    let ops = document.querySelectorAll('.op');
    for (let i = 0; i < ops.length; i++) {
        ops[i].addEventListener('click', function() {
            display.value += ops[i].innerHTML;
        });
    }

    let transcendentals = document.querySelectorAll('.transcendental');
    for (let i = 0; i < transcendentals.length; i++) {
        transcendentals[i].addEventListener('click', function() {
            display.value += transcendentals[i].innerHTML;
        });
    }

    let trigs = document.querySelectorAll('.trig');
    for (let i = 0; i < trigs.length; i++) {
        trigs[i].addEventListener('click', function() {
            let p = trigs[i].innerHTML.length;
            display.value += trigs[i].innerHTML.substring(0, p - 1);            
        });
    }


    let solver = document.querySelector('#solve');
    solver.addEventListener('click', function() {
        let expr = display.value;
        if (matchesTrig(expr)) {
            const res = evalTrig(expr, mode);
            display.value = res.toFixed(5);
            return;
        }

        expr = cleaner(expr);
        expr = convertToOnlyParentheses(expr);
        let infix_tokens = tokenizer(expr);
        if (validParen(infix_tokens)) {
            let postfix_tokens = to_postfix(infix_tokens);
            const result = postfix_eval(postfix_tokens);
            display.value = result.toFixed(5);
        }
    });

    




    function cleaner(expr) {
        expr = '(' + expr + ')'; // We add opening and closing () for easy regex matching
        const PI = '3.14159265';
        const E =  '2.71828182';
        const valid = ['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '+', '-', '*', '/', '(', ')', '{', '}', '[', ']', 'e', 'π'];
        let i = 0;
        while (i < expr.length) {
            if (!valid.includes(expr[i])) {
                alert("INVALID EXPRESSION"); // Random letters from keyboard EG: a + 3
                return; 
            }
            if (expr[i] === 'π') { // Replacing pi and e with their decimal values till 8 decimal places
                expr = expr.slice(0, i) + PI + expr.slice(i + 1);
                i += PI.length - 1; // Adjusting the index
            }
            else if (expr[i] === 'e') {
                expr = expr.slice(0, i) + E + expr.slice(i + 1);
                i += E.length - 1; 
            }
            i++;
        }
        return expr;
    }
    
    function validParen(tokens) {
        const hmap = {
            '(': ')',
            '{': '}',
            '[': ']',
        };
    
        let stack = [];
    
        for (let token of tokens) {
            if (token === '(' || token === '{' || token === '[') {
                stack.push(token);
            } else if (token === ')' || token === '}' || token === ']') {
                if (stack.length === 0 || hmap[stack.pop()] !== token) {
                    return false;
                }
            } 
        }
    
        if (stack.length === 0) {
            return true;
        } else {
            // Unmatched opening parentheses
            alert("INVALID EXPRESSION");
            return false;
        }
    }
    
    function tokenizer(expr) {
        expr = expr.replace(/\s+/g, ""); // Find and remove all whitespaces
    
        const regex = /(\d+(\.\d+)?|[\+\-\*\/\(\)\[\]\{\}]|-+)/g; // Main Regex to match the expression and convert into infix tokens
    
        const tokens = expr.match(regex);
    
        return tokens;
    }
    
    
    function convertToOnlyParentheses(inputString) {
        // This function replaces all [] {} with () for maintaining simplicity while running the Shunting Yard Algorithm
        const result = [];
        for (let i = 0; i < inputString.length; i++) {
            const char = inputString[i];
            switch (char) {
                case '[':
                case '{':
                    result.push('(');
                    break;
                case ']':
                case '}':
                    result.push(')');
                    break;
                default:
                    result.push(char);
                    break;
            }
        }
        return result.join('');
    }
    
    const precedence = { // Operator precedence
        '+' : 10,
        '-' : 10,
        '*' : 20,
        '/' : 20,
    };
    
    function to_postfix(tokens) {
        // Shunting Yard Algorithm to convert infix tokens to postfix tokens
        let postfix_tokens = [];
        let stack = [];
    
        for (let token of tokens) {
            
            if (token in precedence) {
                while(stack.length !== 0 && precedence[stack[stack.length - 1]] >= precedence[token] &&
                    stack[stack.length - 1] !== '(') {
                    postfix_tokens.push(stack[stack.length - 1]);
                    stack.pop();
                }
                stack.push(token);
            }
            else if (token === '(') {
                stack.push(token);
            }
            else if (token === ')') {
                while(stack.length !== 0 && stack[stack.length - 1] !== '(') {
                    postfix_tokens.push(stack.pop());
                    
                }
                stack.pop();
            }
            else {
                postfix_tokens.push(token);
            }
        }
    
        while (stack.length !== 0) {
            postfix_tokens.push(stack.pop());
        }
    
        return postfix_tokens;
    }
    
    function postfix_eval(postfix_tokens) {
        // Postfix tokens are evaluated and numerical output is returned
        let stack = [];
        
        for (let i = 0; i < postfix_tokens.length; i++) {
            const token = postfix_tokens[i];
            
            if (!isNaN(parseFloat(token))) { // If token is a float
                stack.push(parseFloat(token));
            } 
            else {
                const operand2 = stack.pop();
                const operand1 = stack.pop();
                switch(token) {
                    case '+':
                        stack.push(operand1 + operand2);
                        break;
                    case '-':
                        stack.push(operand1 - operand2);
                        break;
                    case '*':
                        stack.push(operand1 * operand2);
                        break;
                    case '/':
                        if (operand2 === 0) {
                            throw EvalError;
                        } 
                        else {
                            stack.push(operand1 / operand2);
                            break;
                        }
                }
            }
        }
        
        if (stack.length === 1 && typeof stack[0] === 'number') {
            return stack[0];
        } else {
            alert("INVALID EXPRESSION");
            return;
        }
    }

    
    
    function matchesTrig(expr) {
        expr = expr.replace(/\s+/g, "");

        return expr.startsWith('sin') || expr.startsWith('cos') || expr.startsWith('tan');
    }

    function evalTrig(expr, mode='RAD') {
        let func = expr.substring(0, 3); // sin cos tan

        expr = expr.substring(3); // arithmetic expression
        expr = cleaner(expr);

        expr = convertToOnlyParentheses(expr);
        let infix_tokens = tokenizer(expr);
        if (validParen(infix_tokens)) {
            let postfix_tokens = to_postfix(infix_tokens);
            const result = postfix_eval(postfix_tokens);

            if (func === 'sin') {
                if (mode === 'RAD') {
                    return Math.sin(result);
                }
                else {
                    return Math.sin(result * (Math.PI / 180));
                }
            }
            else if (func === 'cos') {
                if (mode === 'RAD') {
                    return Math.cos(result);
                }
                else {
                    return Math.cos(result * (Math.PI / 180));
                }
            }
            else if (func === 'tan') {
                if (mode === 'RAD') {
                    return Math.tan(result);
                }
                else {
                    return Math.tan(result * (Math.PI / 180));
                }
            }
        }    
    }




    function getCursor(inputField) {
        return inputField.selectionStart;
    }
    function setCursor(inputField, position) {
        if (inputField && inputField.setSelectionRange) {
            // Setting the selection range to the required position
            inputField.setSelectionRange(position, position);
        }
    }
});