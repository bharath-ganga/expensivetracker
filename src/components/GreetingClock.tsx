import { useState, useEffect } from 'react';

export const GreetingClock = ({ name }: { name: string }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      <p className="eyebrow text-primary mb-2">// FINANCIAL_CONTROL_CENTER</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.04em]">{greeting}, {name}.</h1>
      <p className="font-mono text-xs text-muted-foreground mt-2 uppercase tracking-wider">{dateString} · {timeString} · SYSTEM ONLINE</p>
    </div>
  );
};
