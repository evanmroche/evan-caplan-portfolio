export function SmpteBars() {
  const bars = [
    "bg-smpte-white",
    "bg-smpte-yellow",
    "bg-smpte-cyan",
    "bg-smpte-green",
    "bg-smpte-magenta",
    "bg-smpte-red",
    "bg-smpte-blue",
  ];

  return (
    <div className="flex w-full h-1.5 shrink-0" aria-hidden="true">
      {bars.map((color) => (
        <div key={color} className={`flex-1 ${color}`} />
      ))}
    </div>
  );
}
