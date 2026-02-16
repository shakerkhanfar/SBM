import { FileText, Copy } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CallDetails {
  aiSummary: string;
  outcome: string;
  resolutionType: string;
  customerSatisfaction: number;
  outcomeResult?: any;
}

interface OutcomeTabProps {
  callDetails: CallDetails;
}

// Simple outcome data renderer
const renderOutcomeData = (data: any, level = 0): JSX.Element => {
  if (Array.isArray(data)) {
    return (
      <ul className={`space-y-1 ${level > 0 ? 'ml-4' : ''}`}>
        {data.map((item, index) => (
          <li key={index} className="text-sm">
            {renderOutcomeData(item, level + 1)}
          </li>
        ))}
      </ul>
    );
  } else if (typeof data === 'object' && data !== null) {
    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-muted-foreground">
              {key.replace(/_/g, ' ')}:
            </span>{' '}
            {renderOutcomeData(value, level + 1)}
          </div>
        ))}
      </div>
    );
  } else {
    return <span className="text-sm">{String(data)}</span>;
  }
};

// Outcome data card component
const OutcomeDataCard = ({ title, data }: { title: string; data: any }) => {
  const formattedTitle = title.replace(/_/g, ' ');

  const copyData = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Outcome data copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy data');
      });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{formattedTitle}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyData}
            className="size-8 p-0"
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-relaxed">{renderOutcomeData(data)}</div>
      </CardContent>
    </Card>
  );
};

// Empty state component
const OutcomeEmptyState = () => {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">
          {'No Outcome Data'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {'No outcome data available for this call'}
        </p>
      </div>
    </div>
  );
};

// Main Outcome Tab Component
export const OutcomeTab: React.FC<OutcomeTabProps> = ({ callDetails }) => {
  const outcomeResult = useMemo(
    () => callDetails?.outcomeResult,
    [callDetails],
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Outcome Data */}
        {outcomeResult && Object.keys(outcomeResult).length > 0 ? (
          <div className="!mt-0 space-y-4">
            <h3 className="text-lg font-semibold">Outcome Details</h3>
            {Object.entries(outcomeResult).map(([key, value]) => (
              <OutcomeDataCard key={key} title={key} data={value} />
            ))}
          </div>
        ) : (
          <OutcomeEmptyState />
        )}
      </div>
    </div>
  );
};
