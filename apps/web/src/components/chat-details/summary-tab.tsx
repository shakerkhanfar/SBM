import { FileText, Copy } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalysisResult } from '@/features/call-history/hooks/use-analysis.hook';

interface ChatSummaryTabProps {
  analysis?: AnalysisResult;
  isAnalysisLoading?: boolean;
  messages: any[];
  getMessageText: (content: { type: string; text: string }[]) => string;
  dominantLanguage: string;
}

const isArabicText = (text: string): boolean => {
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Extract customer info from messages
const extractCustomerInfo = (messages: any[], getMessageText: (content: any) => string) => {
  const allText = messages.map((m) => getMessageText(m.content)).join(' ');

  // Try to extract name (very basic)
  const nameMatch = allText.match(/اسمي|إسمي|name is|I am|My name is\s+([^\s]+)/i);
  const name = nameMatch ? nameMatch[1] : null;

  // Try to extract ID number
  const idMatch = allText.match(/\b\d{10}\b/);
  const idNumber = idMatch ? idMatch[0] : null;

  // Try to extract mobile number
  const mobileMatch = allText.match(/\b(05\d{8}|\+9665\d{8})\b/);
  const mobile = mobileMatch ? mobileMatch[0] : null;

  return { name, idNumber, mobile };
};

// Extract services from messages
const extractServices = (messages: any[], getMessageText: (content: any) => string) => {
  const allText = messages.map((m) => getMessageText(m.content)).join(' ').toLowerCase();
  const services: any[] = [];

  // Money Transfer
  if (allText.includes('تحويل') || allText.includes('transfer') || allText.includes('TR-')) {
    const accountMatch = allText.match(/SA\d{22}/i);
    const amountMatch = allText.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:ريال|SAR|SR)/i);
    const trMatch = allText.match(/TR-\d+/i);

    services.push({
      type: 'money_transfer',
      account: accountMatch ? accountMatch[0] : 'N/A',
      amount: amountMatch ? amountMatch[1] : 'N/A',
      transaction: trMatch ? trMatch[0] : 'N/A',
    });
  }

  // Account Opening
  if (allText.includes('فتح حساب') || allText.includes('open account') || allText.includes('حساب جديد')) {
    const ibanMatch = allText.match(/SA\d{22}/i);
    const cardMatch = allText.match(/\d{4}\s*\d{4}\s*\d{4}\s*\d{4}/);

    services.push({
      type: 'account_opening',
      iban: ibanMatch ? ibanMatch[0] : 'N/A',
      card: cardMatch ? cardMatch[0] : 'N/A',
    });
  }

  // Personal Loan
  if (allText.includes('قرض') || allText.includes('loan') || allText.includes('تمويل')) {
    const jobMatch = allText.match(/(?:موظف|مهندس|طبيب|employee|engineer|doctor)\s+([^\s]+)/i);
    const aptMatch = allText.match(/APT-\d+/i);

    services.push({
      type: 'personal_loan',
      occupation: jobMatch ? jobMatch[0] : 'N/A',
      appointment: aptMatch ? aptMatch[0] : 'N/A',
    });
  }

  return services;
};

export const ChatSummaryTab: React.FC<ChatSummaryTabProps> = ({
  analysis,
  isAnalysisLoading,
  messages,
  getMessageText,
  dominantLanguage,
}) => {
  const customerInfo = extractCustomerInfo(messages, getMessageText);
  const services = extractServices(messages, getMessageText);
  const isArabic = dominantLanguage === 'AR';

  const generateSummary = () => {
    const separator = '━'.repeat(60);
    let summary = '';

    if (isArabic) {
      summary += `${separator}\n`;
      summary += `📊 ملخص المحادثة\n`;
      summary += `${separator}\n\n`;

      summary += `معلومات الوكيل:\n`;
      summary += `- الوكيل: فاطمة (FAT-123)\n`;
      summary += `- القناة: Web Chat\n`;
      summary += `- اللغة: العربية\n`;
      summary += `- الحالة: مكتملة\n\n`;

      summary += `معلومات العميل:\n`;
      summary += `- الاسم: ${customerInfo.name || 'لم يُذكر'}\n`;
      summary += `- الهوية: ${customerInfo.idNumber || 'لم يُذكر'}\n`;
      summary += `- الجوال: ${customerInfo.mobile || 'لم يُذكر'}\n\n`;

      if (services.length > 0) {
        summary += `الخدمات المقدمة:\n\n`;
        services.forEach((service) => {
          if (service.type === 'money_transfer') {
            summary += `✓ تحويل أموال:\n`;
            summary += `  • الحساب: ${service.account}\n`;
            summary += `  • المبلغ: ${service.amount} ريال\n`;
            summary += `  • رقم العملية: ${service.transaction}\n\n`;
          } else if (service.type === 'account_opening') {
            summary += `✓ فتح حساب:\n`;
            summary += `  • الحساب: ${service.iban}\n`;
            summary += `  • البطاقة: ${service.card}\n\n`;
          } else if (service.type === 'personal_loan') {
            summary += `✓ قرض شخصي:\n`;
            summary += `  • الوظيفة: ${service.occupation}\n`;
            summary += `  • رقم الموعد: ${service.appointment}\n\n`;
          }
        });
      }

      if (analysis) {
        summary += `الملخص:\n${analysis.summary}\n\n`;
        summary += `النتيجة: ${analysis.outcome}\n`;
      }
    } else {
      summary += `${separator}\n`;
      summary += `📊 Conversation Summary\n`;
      summary += `${separator}\n\n`;

      summary += `Agent Information:\n`;
      summary += `- Agent: Fatima (FAT-123)\n`;
      summary += `- Channel: Web Chat\n`;
      summary += `- Language: English\n`;
      summary += `- Status: Completed\n\n`;

      summary += `Customer Information:\n`;
      summary += `- Name: ${customerInfo.name || 'Not provided'}\n`;
      summary += `- ID: ${customerInfo.idNumber || 'Not provided'}\n`;
      summary += `- Mobile: ${customerInfo.mobile || 'Not provided'}\n\n`;

      if (services.length > 0) {
        summary += `Services Provided:\n\n`;
        services.forEach((service) => {
          if (service.type === 'money_transfer') {
            summary += `✓ Money Transfer:\n`;
            summary += `  • Account: ${service.account}\n`;
            summary += `  • Amount: ${service.amount} SAR\n`;
            summary += `  • Transaction: ${service.transaction}\n\n`;
          } else if (service.type === 'account_opening') {
            summary += `✓ Account Opening:\n`;
            summary += `  • Account: ${service.iban}\n`;
            summary += `  • Card: ${service.card}\n\n`;
          } else if (service.type === 'personal_loan') {
            summary += `✓ Personal Loan:\n`;
            summary += `  • Occupation: ${service.occupation}\n`;
            summary += `  • Appointment: ${service.appointment}\n\n`;
          }
        });
      }

      if (analysis) {
        summary += `Summary:\n${analysis.summary}\n\n`;
        summary += `Outcome: ${analysis.outcome}\n`;
      }
    }

    summary += `\n${separator}`;
    return summary;
  };

  const handleCopy = () => {
    const summaryText = generateSummary();
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        toast.success('Summary copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy summary');
      });
  };

  if (isAnalysisLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {isArabic ? 'ملخص المحادثة' : 'Conversation Summary'}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="size-8 p-0">
              <Copy className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre
            className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed"
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{ wordBreak: 'break-word' }}
          >
            {generateSummary()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
