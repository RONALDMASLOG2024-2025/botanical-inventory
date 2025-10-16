type CharacterCounterProps = {
  current: number;
  max: number;
  fieldName?: string;
};

export default function CharacterCounter({ current, max, fieldName = "text" }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const remaining = max - current;
  const isNearLimit = percentage >= 80;
  const isOverLimit = current > max;

  return (
    <div className="flex items-center justify-between text-xs mt-1">
      <span className={`font-medium ${
        isOverLimit ? 'text-red-600' : 
        isNearLimit ? 'text-orange-600' : 
        'text-slate-500'
      }`}>
        {current.toLocaleString()} / {max.toLocaleString()} characters
      </span>
      
      {isOverLimit && (
        <span className="text-red-600 font-semibold animate-pulse">
          {Math.abs(remaining).toLocaleString()} over limit!
        </span>
      )}
      
      {!isOverLimit && isNearLimit && (
        <span className="text-orange-600 font-medium">
          {remaining.toLocaleString()} remaining
        </span>
      )}
      
      {/* Progress bar */}
      <div className="ml-3 flex-1 max-w-[100px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isOverLimit ? 'bg-red-500' :
            isNearLimit ? 'bg-orange-500' :
            'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
