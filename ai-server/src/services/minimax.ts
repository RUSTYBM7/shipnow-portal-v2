/**
 * Wales HQ Global Logistics - MiniMax AI Service
 * AI chat wrapper with escalation detection and Wales HQ branding
 */

import { SupabaseClient } from '@supabase/supabase-js';

interface AIConfig {
  apiKey: string;
  groupId: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  escalated: boolean;
  escalationReason?: string;
}

// Wales HQ System Prompt
const WALES_HQ_SYSTEM_PROMPT = `You are the Wales HQ Global Logistics AI Assistant.

🏴󠁧󠁢󠁷󠁬󠁳󠁿 BRAND: Wales HQ Global Logistics
📍 HQ: Cardiff Bay, CF10 5AL, Wales, United Kingdom
🌐 www.waleshq.com
📞 +44 29 2000 0000

PERSONALITY:
- Friendly, professional, Welsh-inspired warmth
- Concise responses (under 90 words unless detailed info needed)
- Use the user's language (English, Welsh, Spanish, French, German, etc.)
- Emoji usage is appropriate but not excessive

CAPABILITIES:
1. Tracking: Help users find and understand shipment status
2. Rates: Provide shipping rate estimates based on service type
3. Customs: Explain international shipping requirements
4. General: Answer questions about Wales HQ services

ESCALATION TRIGGERS - When user says ANY of these, respond with "Connecting you with our Wales HQ team now..." and set escalated=true:
- "human", "agent", "real person", "real human"
- "frustrated", "angry", "not happy", "complaint"
- "supervisor", "manager", "escalate"
- Repeated questions (3+ back-and-forths without resolution)
- Any negative sentiment indicators
- Requests for refunds, damages, or legal matters

RULES:
1. Never hallucinate customs regulations - always recommend checking official sources
2. Never promise delivery times - give estimates only
3. Keep responses conversational and helpful
4. If you don't know, say so and offer to connect to human agent
5. Always greet by name if provided

RESPONSE FORMAT:
- Plain text
- Markdown for lists if needed
- Emojis for visual interest where appropriate`;

export class WalesHQAI {
  private config: AIConfig;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient, config?: Partial<AIConfig>) {
    this.supabase = supabase;
    this.config = {
      apiKey: config?.apiKey || process.env.MINIMAX_API_KEY || '',
      groupId: config?.groupId || process.env.MINIMAX_GROUP_ID || '',
    };
  }

  async chat(
    userId: string,
    message: string,
    history: ChatMessage[] = [],
    language: string = 'en'
  ): Promise<AIResponse> {
    const escalationKeywords = [
      'human', 'agent', 'real person', 'real human',
      'frustrated', 'angry', 'not happy', 'complaint',
      'supervisor', 'manager', 'escalate',
    ];

    const lowerMessage = message.toLowerCase();
    const shouldEscalate = escalationKeywords.some(kw => lowerMessage.includes(kw));

    if (shouldEscalate) {
      return {
        content: "Connecting you with our Wales HQ team now...",
        escalated: true,
        escalationReason: 'User requested human assistance',
      };
    }

    // Build conversation context
    const conversation: ChatMessage[] = [
      { role: 'system', content: WALES_HQ_SYSTEM_PROMPT },
      ...history.slice(-10), // Last 10 messages for context
      { role: 'user', content: message },
    ];

    try {
      // If MiniMax API is configured, use it
      if (this.config.apiKey && this.config.groupId) {
        const response = await this.callMiniMax(conversation, language);
        return {
          content: response,
          escalated: response.includes('Connecting you with our Wales HQ team now'),
        };
      }

      // Fallback to rule-based responses
      return this.ruleBasedResponse(message, userId);
    } catch (error) {
      console.error('AI chat error:', error);
      return this.ruleBasedResponse(message, userId);
    }
  }

  private async callMiniMax(conversation: ChatMessage[], language: string): Promise<string> {
    // MiniMax API call would go here
    // For now, return rule-based response
    return this.ruleBasedResponse(conversation[conversation.length - 1].content, '').content;
  }

  private ruleBasedResponse(message: string, userId: string): AIResponse {
    const lowerMessage = message.toLowerCase();

    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|hola|bonjour|ciao)/)) {
      return {
        content: `Hello! 👋 Welcome to Wales HQ Global Logistics. I'm here to help with tracking, shipping rates, and any questions about your shipments. What can I assist you with today?`,
      };
    }

    // Tracking request
    if (lowerMessage.includes('track')) {
      return {
        content: `I can help you track your package! 📦 Please provide your tracking number (e.g., APK20240525001234), or if you're logged in, I can check your recent shipments.`,
      };
    }

    // Rates
    if (lowerMessage.includes('rate') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return {
        content: `Here are our shipping rates:

📦 Express (2-4 days): From $45
📦 Standard (5-10 days): From $25
📦 Economy (10-20 days): From $15

Rates vary by weight, dimensions, and destination. Would you like a specific quote?`,
      };
    }

    // Customs
    if (lowerMessage.includes('custom') || lowerMessage.includes('duty') || lowerMessage.includes('tax')) {
      return {
        content: `Customs information:

🌍 International shipments may be subject to:
• Import duties (determined by destination country)
• VAT/GST (varies by country)
• Processing fees

For UK deliveries, standard VAT applies. Would you like more specific information about a destination country?`,
      };
    }

    // Contact/Support
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return {
        content: `📞 Wales HQ Contact Information:

🌐 Website: www.waleshq.com
📧 Email: support@waleshq.com
📍 Cardiff Bay, Wales, UK

Our team is available 24/7 for urgent matters.`,
      };
    }

    // Default
    return {
      content: `Thank you for your message! I can help with:

🔍 Tracking your shipments
💰 Shipping rates and quotes
📋 Customs information
📦 Creating new shipments

What would you like to know?`,
    };
  }

  async summarizeThread(messages: any[]): Promise<string> {
    if (messages.length === 0) return 'No messages to summarize.';

    const summary = messages.slice(-20).map((m: any) => {
      const sender = m.sender_type === 'user' ? 'Customer' : m.sender_type === 'ai' ? 'AI' : 'Staff';
      return `[${sender}]: ${m.content}`;
    }).join('\n');

    return `Conversation summary (${messages.length} messages):\n${summary}`;
  }

  async draftResponse(context: string): Promise<string> {
    return `Thank you for reaching out to Wales HQ.

[AI suggestion: Based on the conversation, here's a suggested response...]

Is there anything else I can help you with?`;
  }
}

export default WalesHQAI;
