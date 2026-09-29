/**
 * Community Health Report System (CHRS) - AI Administration Assistant
 * Integrates with Google Gemini via controlled server-side tools & confirmation safety gates
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Cpu,
  HelpCircle,
  History,
  Loader2,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Terminal,
  User,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { AiAssistantResponse } from '../types';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  requiresConfirmation?: boolean;
  actionDetails?: any;
  toolExecuted?: string;
  actionResult?: any;
}

const SAMPLE_PROMPTS = [
  'Show all health facilities currently pending accreditation',
  'Add Edo State to available operational locations',
  'Set outbreak detection threshold to 5km radius, 7 days, and 5 reports',
  'Create a new category: "Flood Water Contamination" with severity HIGH',
  'Deactivate facility fac-002 for routine sanitization',
  'Summarize current epidemiological outbreak clusters',
];

export const AiAdminAssistant: React.FC<{ onActionExecuted?: () => void }> = ({
  onActionExecuted,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    action: string;
    details: any;
    messageId: string;
  } | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Good day, Administrator. I am the CHRS AI Administration Assistant. You can instruct me in natural language to manage health facilities, configure outbreak cluster algorithms, add disease surveillance categories, or inspect audit logs.\n\nAll sensitive operations will be held for your explicit confirmation before execution.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendPrompt = async (textToSend?: string) => {
    const promptText = (textToSend || inputPrompt).trim();
    if (!promptText || isProcessing) return;

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsProcessing(true);

    try {
      const response: AiAssistantResponse = await api.sendAiAssistantCommand({
        prompt: promptText,
      });

      const assistantMessage: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requiresConfirmation: response.requiresConfirmation,
        actionDetails: response.actionDetails,
        toolExecuted: response.actionExecuted?.action,
        actionResult: response.actionExecuted?.result,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.requiresConfirmation && response.actionDetails) {
        setPendingConfirmation({
          action: response.actionDetails.action,
          details: response.actionDetails,
          messageId: assistantMessage.id,
        });
      }

      if (response.actionExecuted && onActionExecuted) {
        onActionExecuted();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `Error processing administrative request: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;

    setIsProcessing(true);
    const actionToExecute = pendingConfirmation.action;
    const details = pendingConfirmation.details;

    try {
      const response: AiAssistantResponse = await api.sendAiAssistantCommand({
        confirmedAction: {
          action: actionToExecute,
          ...details,
        },
      });

      setPendingConfirmation(null);

      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-res-${Date.now()}`,
          sender: 'assistant',
          text: `Action Confirmed & Executed:\n${response.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolExecuted: response.actionExecuted?.action,
          actionResult: response.actionExecuted?.result,
        },
      ]);

      if (onActionExecuted) {
        onActionExecuted();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `confirm-err-${Date.now()}`,
          sender: 'assistant',
          text: `Execution failed: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        sender: 'assistant',
        text: 'Action cancelled by administrator. No database changes were applied.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[740px]">
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">AI Administration Assistant</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                Gemini Flash
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Natural Language Surveillance Operations & Controlled Backend Tools
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Audit-Logged Environment</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Try asking:
        </span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(sample)}
            disabled={isProcessing}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 whitespace-nowrap transition cursor-pointer disabled:opacity-50 text-[11px]"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Chat Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                <Bot className="w-4 h-4 text-emerald-300" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-70">
                <span className="font-semibold">{msg.sender === 'user' ? 'Administrator' : 'CHRS AI Engine'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

              {msg.toolExecuted && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Tool Invoked: {msg.toolExecuted}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 text-xs">
              <Bot className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs text-slate-600 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing command against surveillance schema and safety bounds...</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Safety Gate Card */}
      {pendingConfirmation && (
        <div className="bg-amber-50 border-t-2 border-b-2 border-amber-400 p-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Action Requires Administrator Confirmation
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                The requested action modifies core surveillance parameters or facility status:{' '}
                <strong className="font-mono">{pendingConfirmation.action}</strong>
              </p>
              <pre className="mt-2 bg-amber-100/80 p-2 rounded text-[11px] font-mono text-amber-950 overflow-x-auto">
                {JSON.stringify(pendingConfirmation.details, null, 2)}
              </pre>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Execute</span>
                </button>
                <button
                  onClick={handleCancelAction}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Action</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isProcessing || Boolean(pendingConfirmation)}
            placeholder={
              pendingConfirmation
                ? 'Please confirm or cancel the pending action above...'
                : 'Type natural language instruction (e.g. "Approve facility fac-003" or "Add location Kaduna")...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputPrompt.trim() || Boolean(pendingConfirmation)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send Command</span>
          </button>
        </form>
      </div>
    </div>
  );
};
