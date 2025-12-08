import { useState } from 'react';
import { TicketStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { useAppStore } from '@/store/appStore';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

interface KanbanBoardProps {
  projectId: string;
  onTicketClick: (ticketId: string) => void;
  onAddTicket: () => void;
}

const statuses: TicketStatus[] = ['todo', 'in_progress', 'validation', 'done'];

export function KanbanBoard({ projectId, onTicketClick, onAddTicket }: KanbanBoardProps) {
  const { updateTicket } = useAppStore();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const newStatus = over.id as TicketStatus;
      updateTicket(active.id as string, { status: newStatus });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 px-1">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            projectId={projectId}
            onTicketClick={onTicketClick}
            onAddTicket={onAddTicket}
          />
        ))}
      </div>
    </DndContext>
  );
}
