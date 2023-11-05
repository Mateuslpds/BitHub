newKey = 0;

class Node {
    constructor(key, name, content) {
        this.key = key;
        this.name = name;
        this.content = content;
        this.date = new Date();
        this.firstChild = null;
        this.nextSibling = null;
    }
}

function createNewNode(key, name, content) {
    return new Node(key, name, content);
}

function initialize(key) {
    return createNewNode(key, "root", "root");
}

function searchForKey(key, root) {
    if (!root) return null;
    if (root.key === key) return root;
    let p = root.firstChild;
    while (p) {
        const found = searchForKey(key, p);
        if (found) return found;
        p = p.nextSibling;
    }
    return null;
}

function searchForKeyIndex(key, root) {
    if (!root) return -1;
    if (root.key === key) return root.key;
    let p = root.firstChild;
    while (p) {
        const result = searchForKeyIndex(key, p);
        if (result !== -1) return result;
        p = p.nextSibling;
    }
    return -1;
}

function upload(root, name, content, parentKey) {
    newKey++;
    const parent = searchForKey(parentKey, root);
    if (!parent) return false;
    const child = createNewNode(newKey, name, content);
    let p = parent.firstChild;
    if (!p) {
        parent.firstChild = child;
    } else {
        while (p.nextSibling) {
            p = p.nextSibling;
        }
        p.nextSibling = child;
    }
    return true;
}

function update(root, content, parentKey) {
    newKey++;
    const parent = searchForKey(parentKey, root);
    if (!parent) return false;
    const child = createNewNode(newKey, name = parent.name, content);
    let p = parent.firstChild;
    if (!p) {
        parent.firstChild = child;
    } else {
        while (p.nextSibling) {
            p = p.nextSibling;
        }
        p.nextSibling = child;
    }
    return true;
}

function displayTree(root) {
    if (!root) return "";
    let result = root.key + "(|Name: " + root.name + "|Content: " + root.content + "|";
    let p = root.firstChild;
    while (p) {
        result += displayTree(p);
        p = p.nextSibling;
    }
    result += ")";
    return result;
}

function displayLastSibling(root, key) {
    const node = searchForKey(key, root);
    if (node) {
        let lastSibling = node;
        while (lastSibling.nextSibling) {
            lastSibling = lastSibling.nextSibling;
        }
        console.log(`Last Sibling: Key = ${lastSibling.key}, Content = ${lastSibling.content}`);
    } else {
        console.log("Node not found");
    }
}

function main() {
    const initialValue = newKey;
    let r = initialize(initialValue);
    let indexRoot = initialValue;
    let choice = -1;

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function displayMenu() {
        console.log("\n1. Show tree");
        console.log("2. Select file");
        console.log("3. Upload file");
        console.log("4. Update file");
        console.log("5. Show last sibling");
        console.log("0. Exit");
        console.log(`Current key: ${indexRoot}`);
        rl.prompt();
    }

    rl.on('line', (line) => {
        choice = parseInt(line);
        if (choice === 1) {
            console.log(displayTree(r));
            displayMenu();
        } else if (choice === 2) {
            rl.question('Enter the key: ', (key) => {
                key = parseInt(key);
                const foundKey = searchForKeyIndex(key, r);
                if (foundKey !== -1) {
                    indexRoot = foundKey;
                } else {
                    console.log("Key not found");
                }
                displayMenu();
            });
        } else if (choice === 3) {
            rl.question('Enter the name of the file: ', (name) => {
                rl.question('Enter the content of the file: ', (content) => {
                    upload(r, name, content, indexRoot);
                    displayMenu();
                });
            });
        } else if (choice === 4) {
            rl.question('Enter the new content of the file: ', (content) => {
                update(r, content, indexRoot);
                displayMenu();
            });
        } else if (choice === 0) {
            rl.close();
        } else if (choice === 5) {
            rl.question('Enter the key to print last sibling: ', (key) => {
                key = parseInt(key);
                displayLastSibling(r, key);
                displayMenu();
            });
        } else {
            displayMenu();
        }
    });

    displayMenu();
}

main();
