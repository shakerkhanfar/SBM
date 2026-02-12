import { X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CallDetailsHeaderProps {
  title: string;
  sessionId: string;
  onClose: () => void;
  isLoading?: boolean;
}

export const CallDetailsHeader: React.FC<CallDetailsHeaderProps> = ({
  title,
  sessionId,
  onClose,
  isLoading = false,
}) => {
  return (
    <div className="flex items-start justify-between border-b p-6" dir="auto">
      <div className="min-w-0 space-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </>
        ) : (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="truncate text-xl font-semibold tracking-tight">
                    {'Call Information'} - {title}
                  </h2>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {'Call Information'} - {title}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2" dir="auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="truncate text-sm text-muted-foreground">
                      {'Call ID'}: {sessionId}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {'Call ID'}: {sessionId}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <CopyButton
                text={sessionId}
                className="size-4 text-muted-foreground hover:text-primary"
                variant="ghost"
                size="icon"
              />
            </div>
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="flex items-center justify-center p-2"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};
