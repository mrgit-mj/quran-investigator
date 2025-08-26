import terminalKit from "terminal-kit";
const term = terminalKit.terminal;

class LoggerEngine {
  currentStatic: number = 0;

  constructor() {
    term.eraseDisplay();
    term.eraseDisplayAbove();
    term.eraseDisplayBelow();
  }

  logChapterProgress(current: number, total: number, chapterName: string) {
    term.moveTo(1, this.currentStatic + 1); // Move to the beginning of the line
    term.eraseLineAfter();
    term(`Processing chapters: ${current} of ${total} (${chapterName})\n`);
  }

  logVerseProgress(current: number, total: number, chapterName: string) {
    term.moveTo(1, this.currentStatic + 2); // Assuming verse log is on the second line
    term.eraseLineAfter();
    term(
      `Processing ${current} of ${total} verses of chapter ${chapterName}\n`
    );
  }

  logStatic(text: string) {
    term.moveTo(1, this.currentStatic + 1);
    this.currentStatic++;
    term.eraseLineAfter();
    term(text);
  }
}

export const Logger = new LoggerEngine();
