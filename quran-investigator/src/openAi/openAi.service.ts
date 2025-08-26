import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Find root words for a list of words using GPT API
   * @param words List of words to find root words for
   * @returns A list of root words
   */
  async findRootWords(words: string[]): Promise<string[]> {
    const prompt = this.buildPrompt(words);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', //  gpt-4o - gpt-3.5-turbo
        messages: [
          {
            role: 'system',
            content:
              'You are a linguistics expert skilled in identifying root words.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      // Extract the response text and parse it into root words

      const rootWords = this.parseRootWords(
        response.choices[0].message.content,
      );

      return rootWords;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch root words from OpenAI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Build the prompt that will be sent to the GPT model
   * @param words List of words to process
   * @returns A prompt string for GPT API
   */
  private buildPrompt(words: string[]): string {
    return `Please provide the root word for the following Arabic words in CSV format, where each line contains the word and its root word, separated by a comma. If there is no root word, leave the word unchanged. Example format: 
    word1,root1
    word2,root2

    the words:\n${words.join('\n')}`;
  }

  /**
   * Parse the GPT response text to extract root words
   * @param responseText The response from GPT
   * @returns A list of root words
   */
  private parseRootWords(responseText: string): string[] {
    // Here we assume the response is returned as lines of words, adjust accordingly
    return responseText.trim().split('\n');
  }
}
