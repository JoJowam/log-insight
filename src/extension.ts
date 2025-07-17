import type { ExtensionContext, TextEditor } from 'vscode';
import { commands, Position, window } from 'vscode';

/**
 * @description
 * The main entry point for the extension.
 * This function is called by the VS Code API only once when the extension is activated.
 * @param context The extension context provided by VS Code, used to register commands and manage its lifecycle.
 */
export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "log-insight" is now active!');

  const logVariableCommand = commands.registerCommand('log-insight.logVariable', logVariable);
  context.subscriptions.push(logVariableCommand);
}

/**
 * @description
 * The main function that executes the logic for the 'log-insight.logVariable' command.
 * It orchestrates getting the editor, extracting the content, and inserting the log statement.
 */
async function logVariable() {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const selection = getSelectedContent(editor);
  if (!selection) return;

  const logStatement = `console.log("${selection}:", ${selection});`;
  await insertLogInEditor(editor, logStatement);
}

/**
 * @description
 * Extracts the text selected by the user in the editor.
 * As a fallback, if there is no active selection, the function identifies and
 * returns the entire word under the cursor.
 * @param editor The active VS Code text editor instance.
 * @returns The text to be logged. Returns an empty string if no text is selected or found.
 */
function getSelectedContent(editor: TextEditor): string {
  const selection = editor.selection;
  let selectedWord = editor.document.getText(selection);

  if (!selectedWord) {
    const nextWordInActualPosition = editor.document.getWordRangeAtPosition(selection.start);
    selectedWord = nextWordInActualPosition ? editor.document.getText(nextWordInActualPosition) : '';
  }

  return selectedWord.trim();
}

/**
 * @description
 * Inserts the generated log line into the editor's document.
 * The insertion occurs on the line immediately below the user's selection,
 * preserving the original line's indentation to maintain code formatting.
 * @param editor The active VS Code text editor instance.
 * @param logStatement The complete `console.log` string to be inserted.
 */
async function insertLogInEditor(editor: TextEditor, logStatement: string): Promise<void> {
  const { selection } = editor;
  const currentLine = editor.document.lineAt(selection.start.line);

  const indentationMatch = /^(\s*)/.exec(currentLine.text);
  const indentation = indentationMatch ? indentationMatch[0] : '';

  const insertPosition = new Position(selection.end.line + 1, 0);

  await editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, `${indentation}${logStatement}\n`);
  });
}

/**
 * @description
 * A cleanup hook called by the VS Code API when the extension is deactivated.
 * Useful for releasing resources (e.g., closing connections, stopping processes).
 */
export function deactivate() {}
