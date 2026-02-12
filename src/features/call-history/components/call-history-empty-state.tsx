/**
 * Call History Empty State Component
 * Displays when there are no call history records
 */

import { Phone } from 'lucide-react';
import React from 'react';

export const CallHistoryEmptyState: React.FC = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4 py-6">
      {/* Empty State Icon and Text */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Phone className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {'No conversations found'}
          </h3>
          <p className="max-w-xs text-wrap text-xs text-muted-foreground">
            {'No calls yet. Start your first call to see history.'}
          </p>
        </div>
      </div>
    </div>
  );
};
