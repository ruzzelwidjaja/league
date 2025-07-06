import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { InfoBox } from '@/components/ui/info-box';

interface PlayerRankCardProps {
  currentRank: number;
  previousRank?: number;
}

export function PlayerRankCard({ currentRank, previousRank }: PlayerRankCardProps) {
  // Calculate if rank went up or down
  const getRankChange = () => {
    if (!previousRank) return null;
    
    // Lower number = better rank (rank 1 is better than rank 2)
    if (currentRank < previousRank) return 'up';
    if (currentRank > previousRank) return 'down';
    return 'same';
  };

  const rankChange = getRankChange();
  const rankDifference = previousRank ? Math.abs(currentRank - previousRank) : 0;

  return (
    <InfoBox variant="transparent">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Current rank</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">#{currentRank}</span>
            {rankChange && rankChange !== 'same' && (
              <div className="flex items-center">
                {rankChange === 'up' ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  rankChange === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rankDifference}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          {/* Right side empty for now as requested */}
        </div>
      </div>
    </InfoBox>
  );
} 