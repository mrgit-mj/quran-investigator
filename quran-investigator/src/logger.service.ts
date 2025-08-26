import { Injectable } from '@nestjs/common';
import * as terminalKit from 'terminal-kit';
const term = terminalKit.terminal;

@Injectable()
export class LoggerService {
  private currentStatic: number = 0;

  constructor() {
    term.eraseDisplay();
  }

  private getTimestamp(): string {
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  // Log for general messages
  log(message: string): void {
    this.currentStatic++;
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.white(`${this.getTimestamp()} ${message}\n`);
  }

  // Add logStatic method for static messages
  logStatic(message: string): void {
    this.currentStatic++;
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.cyan(`${this.getTimestamp()} ${message}\n`);
  }

  logError(error: string): void {
    this.currentStatic++;
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.red(`${this.getTimestamp()} ERROR: ${error}\n`);
  }

  logSuccess(message: string): void {
    this.currentStatic++;
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.green(`${this.getTimestamp()} SUCCESS: ${message}\n`);
  }

  logWarning(message: string): void {
    this.currentStatic++;
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.yellow(`${this.getTimestamp()} WARNING: ${message}\n`);
  }

  logChapterProgress(
    current: number,
    total: number,
    chapterName: string,
  ): void {
    term.moveTo(1, this.currentStatic + 1);
    term.eraseLineAfter();
    term.green(
      `${this.getTimestamp()} Processing chapters: ${current} of ${total} (${chapterName})\n`,
    );
  }

  logVerseProgress(current: number, total: number, chapterName: string): void {
    term.moveTo(1, this.currentStatic + 2);
    term.eraseLineAfter();
    term.yellow(
      `${this.getTimestamp()} Processing verses: ${current} of ${total} (Chapter: ${chapterName})\n`,
    );
  }

  clearScreen(): void {
    term.clear();
    this.currentStatic = 0;
  }
}
