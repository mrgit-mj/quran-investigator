import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OllamaService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Find root words using the local Ollama API.
   * @param words List of words to find root words for
   * @returns A list of root words
   */
  async findRootWords(words: string[]): Promise<string[]> {
    const prompt = this.buildPrompt(words);

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:11434/api/generate', {
          model: 'deepseek-coder-v2', // Specify the model (adjust if needed)
          prompt: prompt,
        }),
      );

      // Assuming the response contains root words in a text format
      const rootWords = this.parseRootWords(response.data);
      return rootWords;
    } catch (error) {
      console.error('Failed to fetch root words from Ollama:', error.message);
      throw new Error(
        `Failed to fetch root words from Ollama: ${error.message}`,
      );
    }
  }

  /**
   * Build the prompt string to send to the Ollama model.
   * @param words List of words to be processed
   * @returns A formatted string for the Ollama prompt
   */
  private buildPrompt(words: string[]): string {
    return `Please provide the root word for the following Arabic words in CSV format, where each line contains the word and its root word, separated by a comma. If there is no root word, leave the word unchanged. Example format: 
    word1,root1
    word2,root2

    the words:\n${words.join('\n')}`;
  }

  /**
   * Parse the response from Ollama to extract root words.
   * @param responseText Response text from Ollama
   * @returns A list of root words
   */
  private parseRootWords(responseText: string): string[] {
    return responseText.trim().split('\n');
  }
}
