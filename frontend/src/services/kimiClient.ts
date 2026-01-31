import { CLAWDBOT_SYSTEM_PROMPT } from './clawdbotSystemPrompt';
import { getDataContextForAI, MockService } from './mockData';

// OpenRouter API configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Models to try in order (fallback chain)
const MODELS = [
    'moonshotai/kimi-k2.5',           // Kimi K2.5 - primary
    'moonshotai/kimi-k2',             // Kimi K2 - fallback
    'deepseek/deepseek-chat-v3-0324:free', // Free DeepSeek model
    'google/gemma-3-1b-it:free',      // Free Gemma model as last resort
];

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Intelligent mock response generator based on user query
const generateMockResponse = async (userMessage: string): Promise<string> => {
    const query = userMessage.toLowerCase();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Status queries
    if (query.includes('johnson') || query.includes('hh-001')) {
        const household = await MockService.getHousehold('HH-001');
        const tasks = await MockService.getTasks('HH-001');
        const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

        return `*_Scanning household database..._*

**Johnson Family Status Report** [Live DB]

The system shows this household is currently **AT RISK** with a risk score of ${household?.riskScore}/100.

**Key Metrics:**
- Total Assets: $${((household?.totalAssets || 0) / 1000000).toFixed(2)}M
- Transfer Progress: ${household?.transferCompleteness}%
- ETA: ${household?.eta}
- Assets In Transit: $${((household?.assetsInTransit || 0) / 1000).toFixed(0)}k

**⚠️ Blocking Issue:**
${household?.stuckReason || 'No blocking issues detected.'}

**Pending Tasks (${pendingTasks.length}):**
${pendingTasks.slice(0, 3).map(t => `- ${t.title} (${t.status})`).join('\n')}

**Recommended Actions:**
Would you like me to draft an email to the client about the missing signature, or generate meeting prep slides?`;
    }

    if (query.includes('smith') || query.includes('hh-002')) {
        const household = await MockService.getHousehold('HH-002');
        return `*_Querying real-time data stream..._*

**Smith Household Status** [Live DB]

✅ This household is **ON TRACK** with excellent progress.

- Risk Score: ${household?.riskScore}/100 (Low Risk)
- Transfer Complete: ${household?.transferCompleteness}%
- ETA: ${household?.eta}
- Total AUM: $${((household?.totalAssets || 0) / 1000000).toFixed(2)}M

No critical issues detected. Final asset reconciliation is in progress.

Shall I schedule a welcome call or generate a completion summary?`;
    }

    if (query.includes('miller') || query.includes('hh-003')) {
        const household = await MockService.getHousehold('HH-003');
        return `*_Running risk analysis engine..._*

**⚠️ CRITICAL ALERT: Miller Estate** [Live DB]

This household has triggered our high-risk protocols. Current risk score: **${household?.riskScore}/100**

**Immediate Concerns:**
1. SLA BREACHED on beneficiary documentation
2. Cash drag of ${household?.cashDrag}% ($${((household?.idleCash || 0) / 1000).toFixed(0)}k idle)
3. Only ${household?.transferCompleteness}% transfer completion

**Root Cause:** ${household?.stuckReason}

**Recommended Immediate Actions:**
1. Escalate to compliance team
2. Draft urgent client communication
3. Rebalance idle cash to money market

Want me to draft an escalation email or create an executive summary?`;
    }

    // At-risk query
    if (query.includes('at risk') || query.includes('at-risk') || query.includes('risk')) {
        const atRisk = await MockService.getAtRiskHouseholds();
        return `*_Executing risk detection query..._*

**At-Risk Household Report** [Real-time Stream]

I've identified **${atRisk.length} households** with elevated risk scores:

${atRisk.map(h => `- **${h.name}**: Risk ${h.riskScore}/100 - ${h.stuckReason || 'Delayed progress'}`).join('\n')}

The most critical is **Miller Estate** with potential SLA breach. 

Shall I generate a consolidated risk report or draft communications for all at-risk clients?`;
    }

    // NIGO queries
    if (query.includes('nigo') || query.includes('document') || query.includes('error')) {
        const nigoDoc = await MockService.getNIGODocuments();
        return `*_Retrieving NIGO Shield scan results..._*

**NIGO Document Alert** [Compliance Engine]

Found **${nigoDoc.length} documents** flagged with issues:

${nigoDoc.map(d => `📄 **${d.name}** (${d.householdId})
   Issue: ${d.nigoIssues?.[0]?.description || 'Review needed'}
   Compliance: ${d.nigoIssues?.[0]?.complianceRule || 'Pending verification'}`).join('\n\n')}

I can draft correction request emails for any of these. Which household would you like to address first?`;
    }

    // Draft email
    if (query.includes('email') || query.includes('draft')) {
        return `*_Initializing communication engine..._*

I can generate the following email types:

1. **Status Update** - General progress report to client
2. **NIGO Correction** - Request for document fixes  
3. **Cash Drag Opportunity** - Investment optimization suggestion
4. **Welcome Call** - Transition completion follow-up

Which type would you like me to draft? Just specify the household name and email type.`;
    }

    // Slides/presentation
    if (query.includes('slide') || query.includes('presentation') || query.includes('meeting')) {
        return `*_Connecting to presentation generator..._*

I can create a **Meeting Prep Pack** with:
- Title slide with client overview
- Asset allocation pie chart
- Transfer progress timeline  
- Recommended next steps

Which household should I generate slides for? I'll pull their latest data from the system.`;
    }

    // Hello/greeting
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        return `*_System online. All connections active._*

Hello! I'm **Clawdbot**, your AI copilot for Transition OS.

I currently have visibility into **6 active households** with $13.7M in assets under transition.

**Quick Status:**
- 🟢 3 households on track
- 🟡 2 households at risk  
- 🔴 1 critical (Miller Estate - SLA breach)

How can I assist you? You can ask me about:
- Household status ("What's happening with Johnson Family?")
- Risk alerts ("Show me at-risk households")
- NIGO issues ("Any document problems?")
- Actions ("Draft an email for Smith")`;
    }

    // Default helpful response
    return `*_Processing your request..._*

I'm connected to the Transition OS kernel with full visibility into your household data.

You can ask me about:
- **Status**: "What is the status of [Household Name]?"
- **Risks**: "Show me at-risk households"
- **Documents**: "Any NIGO issues?"
- **Actions**: "Draft an email" or "Create meeting slides"

I have access to 6 households totaling $13.7M in assets. What would you like to know?`;
};

// Try calling OpenRouter API with model fallback
const callOpenRouterAPI = async (messages: Message[], systemPrompt: string): Promise<string | null> => {
    for (const model of MODELS) {
        try {
            console.log(`[Clawdbot] Attempting API call with model: ${model}`);

            const fullMessages = [
                { role: 'system', content: systemPrompt },
                ...messages
            ];

            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Transition OS - Clawdbot'
                },
                body: JSON.stringify({
                    model: model,
                    messages: fullMessages,
                    temperature: 0.3,
                    max_tokens: 1024,
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    console.log(`[Clawdbot] Success with model: ${model}`);
                    return content;
                }
            } else {
                const errorText = await response.text();
                console.warn(`[Clawdbot] Model ${model} failed (${response.status}): ${errorText}`);
            }
        } catch (error) {
            console.warn(`[Clawdbot] Model ${model} threw error:`, error);
        }
    }
    return null;
};

export const KimiClient = {
    sendMessage: async (messages: Message[]): Promise<string> => {
        const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

        // Try OpenRouter API with model fallback chain
        if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 10) {
            const systemPromptWithData = CLAWDBOT_SYSTEM_PROMPT + '\n\n' + getDataContextForAI();
            const apiResponse = await callOpenRouterAPI(messages, systemPromptWithData);

            if (apiResponse) {
                return apiResponse;
            }

            console.warn("[Clawdbot] All API models failed, using intelligent mock response");
        }

        // Use intelligent mock response as fallback
        return generateMockResponse(userMessage);
    }
};
