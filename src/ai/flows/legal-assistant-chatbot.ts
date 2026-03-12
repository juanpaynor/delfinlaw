'use server';
/**
 * @fileOverview An AI legal assistant that provides preliminary answers to common legal questions
 * and guides users to relevant practice areas or contact points for Delfin Law Advocates.
 *
 * - legalAssistantChatbot - A function that handles the legal question answering process.
 * - LegalAssistantChatbotInput - The input type for the legalAssistantChatbot function.
 * - LegalAssistantChatbotOutput - The return type for the legalAssistantChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalAssistantChatbotInputSchema = z.object({
  question: z.string().describe('The user\'s legal question.'),
});
export type LegalAssistantChatbotInput = z.infer<typeof LegalAssistantChatbotInputSchema>;

const LegalAssistantChatbotOutputSchema = z.object({
  answer: z.string().describe('The preliminary answer to the legal question.'),
  relevantPracticeAreas: z
    .array(z.string())
    .describe('A list of relevant practice areas at Delfin Law Advocates.'),
  contactSuggestion: z
    .string()
    .describe('A suggestion to contact the firm for further assistance.'),
});
export type LegalAssistantChatbotOutput = z.infer<typeof LegalAssistantChatbotOutputSchema>;

export async function legalAssistantChatbot(
  input: LegalAssistantChatbotInput
): Promise<LegalAssistantChatbotOutput> {
  return legalAssistantChatbotFlow(input);
}

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  input: {schema: LegalAssistantChatbotInputSchema},
  output: {schema: LegalAssistantChatbotOutputSchema},
  prompt: `You are an AI legal assistant for Delfin Law Advocates, a law firm that specializes in the following practice areas:
- Family Law
- Corporate Law
- Real Estate Law
- Personal Injury
- Criminal Defense
- Employment Law
- Estate Planning

Your role is to provide preliminary, general information to legal questions. You must not provide specific legal advice or establish an attorney-client relationship. Always emphasize that your answers are for informational purposes only and that the user should consult with a qualified attorney for specific legal guidance.

After providing an answer, identify and list up to three practice areas from the list above that are most relevant to the user's question. Finally, include a clear suggestion for the user to contact Delfin Law Advocates for a personalized consultation.

User's Question: {{{question}}}`,
});

const legalAssistantChatbotFlow = ai.defineFlow(
  {
    name: 'legalAssistantChatbotFlow',
    inputSchema: LegalAssistantChatbotInputSchema,
    outputSchema: LegalAssistantChatbotOutputSchema,
  },
  async (input) => {
    const {output} = await legalAssistantPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the legal assistant prompt.');
    }
    return output;
  }
);
