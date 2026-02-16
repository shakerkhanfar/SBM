import { User, Globe, CheckCircle, Brain, Info } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatOverviewTabProps {
  agentName: string;
  model: string;
  language: string;
}

export const ChatOverviewTab: React.FC<ChatOverviewTabProps> = ({
  agentName,
  model,
  language,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6" dir="auto">
      <div className="space-y-6">
        {/* Chat Information */}
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-muted-foreground" />
              <CardTitle className="text-lg">Chat Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Agent Name */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs text-muted-foreground">Agent</p>
                  <p className="truncate text-sm font-medium">{agentName}</p>
                </div>
              </div>

              {/* Model */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="text-sm font-medium">{model}</p>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-medium">{language}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
