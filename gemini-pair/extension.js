const vscode = require('vscode');
const https = require('https');

function activate(context) {
    // 1. Create the Output Channel (The bottom text panel)
    const outputBtn = vscode.window.createOutputChannel("Gemini Chat");

    // COMMAND 1: CHAT (Prints answer to bottom panel)
    context.subscriptions.push(vscode.commands.registerCommand('gemini.chat', async () => {
        const prompt = await vscode.window.showInputBox({ prompt: "Ask Gemini a question:" });
        if (!prompt) return;

        outputBtn.show(true); // Force open the panel
        outputBtn.appendLine(`\n> YOU: ${prompt}`);
        outputBtn.appendLine(`> GEMINI: Thinking...`);

        try {
            const answer = await callGemini(prompt);
            outputBtn.appendLine(`\n${answer}\n-----------------------------------`);
        } catch (err) {
            outputBtn.appendLine(`ERROR: ${err.message}`);
        }
    }));

    // COMMAND 2: WRITE CODE (Inserts code into your file)
    context.subscriptions.push(vscode.commands.registerCommand('gemini.code', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open a file first!");
            return;
        }

        const prompt = await vscode.window.showInputBox({ prompt: "Describe the code you want:" });
        if (!prompt) return;

        vscode.window.setStatusBarMessage("Gemini: Writing code...", 3000);

        try {
            const code = await callGemini(prompt, "Return ONLY code. No markdown formatting.");
            // Remove markdown ticks
            const cleanCode = code.replace(/```\w*\n?/g, '').replace(/```/g, '');
            
            editor.edit(builder => {
                builder.insert(editor.selection.active, cleanCode);
            });
        } catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    }));
}

// --- API HELPER (Native Node.js HTTPS) ---
function callGemini(text, systemPrompt = "") {
    return new Promise((resolve, reject) => {
        const config = vscode.workspace.getConfiguration('geminiPair');
        const apiKey = config.get('apiKey');
        const model = config.get('model') || 'gemini-1.5-flash';

        if (!apiKey) return reject(new Error("API Key not found. Check Settings (Ctrl+,)"));

        const payload = JSON.stringify({
            contents: [{ parts: [{ text: (systemPrompt ? systemPrompt + "\n\n" : "") + text }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) reject(new Error(json.error.message));
                    else if (json.candidates) resolve(json.candidates[0].content.parts[0].text);
                    else reject(new Error("No response."));
                } catch (e) { reject(e); }
            });
        });
        
        req.on('error', e => reject(e));
        req.write(payload);
        req.end();
    });
}

exports.activate = activate;
exports.deactivate = function() {};