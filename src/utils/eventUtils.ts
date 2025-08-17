interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

/**
 * Sorts events by date and time, ensuring proper chronological order
 */
export const sortEventsByDate = (events: AgendaEvent[]): AgendaEvent[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
};

/**
 * Filters events to get only future events (after current moment)
 */
export const getFutureEvents = (events: AgendaEvent[], limit?: number): AgendaEvent[] => {
  const now = new Date().getTime();
  const futureEvents = events.filter(event => new Date(event.date).getTime() > now);
  const sortedEvents = sortEventsByDate(futureEvents);
  
  return limit ? sortedEvents.slice(0, limit) : sortedEvents;
};

/**
 * Filters events to get only past events (before current moment)
 */
export const getPastEvents = (events: AgendaEvent[]): AgendaEvent[] => {
  const now = new Date().getTime();
  const pastEvents = events.filter(event => new Date(event.date).getTime() <= now);
  // For past events, show most recent first (reverse chronological)
  return sortEventsByDate(pastEvents).reverse();
};

/**
 * Separates events into future and past, with future events first
 */
export const getEventsOrderedByProximity = (events: AgendaEvent[]): AgendaEvent[] => {
  const futureEvents = getFutureEvents(events);
  const pastEvents = getPastEvents(events);
  
  return [...futureEvents, ...pastEvents];
};

/**
 * Checks if an event date is in the past
 */
export const isEventPast = (eventDate: string): boolean => {
  return new Date(eventDate).getTime() <= new Date().getTime();
};

/**
 * Checks if an event is today
 */
export const isEventToday = (eventDate: string): boolean => {
  const eventDateObj = new Date(eventDate);
  const today = new Date();
  return eventDateObj.toDateString() === today.toDateString();
};

/**
 * Checks if an event is tomorrow
 */
export const isEventTomorrow = (eventDate: string): boolean => {
  const eventDateObj = new Date(eventDate);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return eventDateObj.toDateString() === tomorrow.toDateString();
};