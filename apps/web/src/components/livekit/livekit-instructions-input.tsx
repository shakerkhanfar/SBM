/**
 * Hook and component for sending instructions to agent via LiveKit DataChannel
 */

import { useRoomContext } from '@livekit/components-react';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface InstructionMessage {
  type: 'instruction';
  message: string;
  timestamp: number;
  sender: 'listener';
}

export const useLiveKitInstructions = () => {
  const room = useRoomContext();

  const sendInstruction = useCallback(
    (instruction: string) => {
      if (!room) {
        toast.error('Not connected to room');
        return;
      }

      if (!instruction.trim()) {
        toast.error('Instruction cannot be empty');
        return;
      }

      try {
        const message: InstructionMessage = {
          type: 'instruction',
          message: instruction.trim(),
          timestamp: Date.now(),
          sender: 'listener',
        };

        // Send via reliable data channel
        room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(message)),
          { reliable: true },
        );
        toast.success('Instruction sent to agent');
      } catch (error) {
        console.error('Failed to send instruction:', error);
        toast.error('Failed to send instruction');
      }
    },
    [room],
  );

  return { sendInstruction };
};

/**
 * UI component for sending instructions to the agent.
 * Must be rendered inside a <LiveKitRoom> context.
 */
export const LiveKitInstructionsInput: React.FC = () => {
  const { sendInstruction } = useLiveKitInstructions();
  const [instructions, setInstructions] = useState('');

  const handleSend = useCallback(() => {
    if (!instructions.trim()) return;
    sendInstruction(instructions);
    setInstructions('');
  }, [instructions, sendInstruction]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="mt-3 flex gap-2">
      <input
        type="text"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send instructions to agent..."
        className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        onClick={handleSend}
        disabled={!instructions.trim()}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
};
