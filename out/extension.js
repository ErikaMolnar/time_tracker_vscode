"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
let typingStartTime;
let lastTypingTime;
let typingInterval;
const TYPING_PAUSE_THRESHOLD = 10000;
let timeSpentTyping = 0;
let timeSpentPausing = 0;
let timeSpentBuilding = 0;
let timeSpentDebugging = 0;
// Decoration type for displaying time information in the file
let decorationType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: "10px",
        color: "rgba(150, 150, 150, 0.7)",
        fontStyle: "italic"
    }
});
// Helper function to convert milliseconds to minutes
function convertToMinutes(milliseconds) {
    return (milliseconds / 60000).toFixed(2);
}
let statusBarItem = vscode.window.createStatusBarItem;
// Update decoration in active window
function updateDecorations2() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const decorationOptions = [];
    const position = new vscode.Position(editor.document.lineCount, 0);
    const message = `Time spent: \
		- Typing: ${convertToMinutes(timeSpentTyping)} minutes \
		- Pausing: ${convertToMinutes(timeSpentPausing)} minutes \
		- Building: ${convertToMinutes(timeSpentBuilding)} minutes \
		- Debugging: ${convertToMinutes(timeSpentDebugging)} minutes`;
    decorationOptions.push({
        range: new vscode.Range(position, position),
        renderOptions: {
            after: {
                contentText: message
            }
        }
    });
    editor.setDecorations(decorationType, decorationOptions);
}
// Update decoration in active window
function updateDecorations(editor) {
    const decorationOptions = [];
    const visibleRange = editor.visibleRanges[0];
    const topLine = visibleRange.start.line;
    const position = new vscode.Position(topLine, 0);
    const message = `Time spent: \
		- Typing: ${convertToMinutes(timeSpentTyping)} minutes \
		- Pausing: ${convertToMinutes(timeSpentPausing)} minutes \
		- Building: ${convertToMinutes(timeSpentBuilding)} minutes \
		- Debugging: ${convertToMinutes(timeSpentDebugging)} minutes`;
    decorationOptions.push({
        range: new vscode.Range(position, position),
        renderOptions: {
            after: {
                contentText: message
            }
        }
    });
    editor.setDecorations(decorationType, decorationOptions);
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }
    // Track typing
    vscode.workspace.onDidChangeTextDocument(event => {
        const now = new Date().getTime();
        if (!typingStartTime) {
            typingStartTime = now;
        }
        if (lastTypingTime && now - lastTypingTime >= TYPING_PAUSE_THRESHOLD) {
            timeSpentPausing += (now - lastTypingTime);
        }
        if (typingInterval) {
            clearTimeout(typingInterval);
        }
        typingInterval = setTimeout(() => {
            if (typingStartTime) {
                const typingEndTime = new Date().getTime();
                timeSpentTyping += (typingEndTime - typingStartTime);
                typingStartTime = undefined; // Reset typing start time
                updateDecorations(activeEditor); // Update the time decorations in the file
            }
        }, TYPING_PAUSE_THRESHOLD);
        lastTypingTime = now;
    });
    // Build start
    vscode.tasks.onDidStartTask(() => {
        let buildStartTime = new Date().getTime();
        vscode.tasks.onDidEndTask(() => {
            let buildEndTime = new Date().getTime();
            timeSpentBuilding += (buildEndTime - buildStartTime);
            updateDecorations(activeEditor);
        });
    });
    vscode.debug.onDidStartDebugSession(() => {
        let debugStartTime = new Date().getTime();
        vscode.debug.onDidTerminateDebugSession(() => {
            let debugEndTime = new Date().getTime();
            timeSpentDebugging += (debugEndTime - debugStartTime);
            updateDecorations(activeEditor);
        });
    });
    // let disposable = vscode.commands.registerCommand("codeTimeTracker.showTime", () => {
    // 	updateDecorations();
    // });
    // context.subscriptions.push(disposable);
    // vscode.window.onDidChangeActiveTextEditor(() => {
    // 	updateDecorations();
    // });
    // vscode.workspace.onDidChangeTextDocument(() => {
    // 	updateDecorations();
    // });
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    });
    vscode.window.onDidChangeTextEditorVisibleRanges(event => {
        updateDecorations(event.textEditor);
    });
    updateDecorations(activeEditor);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map