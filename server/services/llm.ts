import axios from 'axios';

export interface LlmMessage {
  role: 'system' | 'user';
  content: string;
}

type LlmProvider = 'gemini' | 'openai' | 'openai-compatible';

const DEFAULT_OPENAI_BASE_URL: string = 'https://api.openai.com/v1';
const DEFAULT_GEMINI_BASE_URL: string =
  'https://generativelanguage.googleapis.com/v1beta/openai';
const DEFAULT_OPENAI_MODEL: string = 'gpt-5-mini';
const DEFAULT_GEMINI_MODEL: string = 'gemini-2.5-flash';

export function getLlmProvider(): LlmProvider {
  const configuredProvider: string = (
    process.env.LLM_PROVIDER || ''
  ).toLowerCase();
  if (configuredProvider === 'gemini' || configuredProvider === 'google') {
    return 'gemini';
  }
  if (configuredProvider === 'openai') {
    return 'openai';
  }
  if (configuredProvider === 'openai-compatible') {
    return 'openai-compatible';
  }

  const baseUrl: string = getConfiguredBaseUrl();
  if (baseUrl.indexOf('generativelanguage.googleapis.com') !== -1) {
    return 'gemini';
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ? 'gemini'
    : 'openai';
}

export function getLlmModel(): string {
  const provider: LlmProvider = getLlmProvider();
  return (
    process.env.LLM_MODEL ||
    process.env.GEMINI_MODEL ||
    process.env.OPENAI_MODEL ||
    (provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL)
  );
}

export function isLlmConfigured(): boolean {
  return !!getApiKey();
}

function getApiKey(): string | undefined {
  return (
    process.env.LLM_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY
  );
}

function getConfiguredBaseUrl(): string {
  return process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || '';
}

function getBaseUrl(): string {
  const configuredBaseUrl: string = getConfiguredBaseUrl();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }
  return getLlmProvider() === 'gemini'
    ? DEFAULT_GEMINI_BASE_URL
    : DEFAULT_OPENAI_BASE_URL;
}

/**
 * Call an OpenAI-compatible chat completions endpoint.
 *
 * Gemini is supported through Google's OpenAI-compatible endpoint, while
 * OpenAI remains the default. Provider-specific request fields are kept here
 * so the summarizer does not need to know which provider is configured.
 */
export async function createChatCompletion(
  messages: LlmMessage[],
  options?: { json?: boolean; maxTokens?: number }
): Promise<string> {
  const apiKey: string | undefined = getApiKey();
  if (!apiKey) {
    throw new Error(
      'No LLM API key is configured. Set GEMINI_API_KEY, LLM_API_KEY, or OPENAI_API_KEY.'
    );
  }

  const provider: LlmProvider = getLlmProvider();
  const requestBody: any = {
    model: getLlmModel(),
    messages: messages,
  };
  if (options && options.json && provider !== 'gemini') {
    requestBody.response_format = { type: 'json_object' };
  }
  if (options && options.maxTokens) {
    if (provider === 'openai') {
      requestBody.max_completion_tokens = options.maxTokens;
    } else {
      requestBody.max_tokens = options.maxTokens;
    }
  }

  try {
    const response: any = await axios.post(
      `${getBaseUrl()}/chat/completions`,
      requestBody,
      {
        timeout: 60000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content: any = response.data?.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
        .join('');
    }
    throw new Error('The language model returned an empty response.');
  } catch (error: any) {
    const status: number | undefined = error?.response?.status;
    const providerMessage: string | undefined =
      error?.response?.data?.error?.message;
    const detail: string = providerMessage || error?.message || 'Unknown error';
    throw new Error(
      `Language model request failed${status ? ` (${status})` : ''}: ${detail}`
    );
  }
}
