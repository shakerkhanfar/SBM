import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/utils/cn';

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value?: string;
  text?: string;
}

export function CopyButton({ value, text, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyText = text ?? value ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-6 w-6', className)}
      onClick={handleCopy}
      {...props}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}
