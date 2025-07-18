import { useLayoutEffect, useMemo } from "react";
import { scoreCalculator, scoreCosts } from "../../../lib/dm-tools/pointBuyCalculator";
import { useAppDispatch, useAppSelector } from "../../../lib/redux/hooks";
import { addOneToScore, setScoresToBase, subtractOneFromScore } from "../../../lib/redux/newCharacterSlice";
import type { AbilityScore } from "../../../lib/types/dmToolTypes";

export default function() {
    const scores = useAppSelector((state) => state.newCharacter.scores);
    const dispatch = useAppDispatch();

    useLayoutEffect(() => {
        dispatch(setScoresToBase());
    }, []);

    const scoreRemainder = useMemo(() => {
        return 27 - scoreCalculator(scores);
    }, [scores]);

    const handleScoreChange = (score: AbilityScore, isAdditive: boolean) => {
        if (isAdditive && score.amount < 15 && scoreRemainder >= (scoreCosts[score.amount + 1] - scoreCosts[score.amount])) {
            dispatch(addOneToScore(score.id));
        } else if (!isAdditive && score.amount > 8) {
            dispatch(subtractOneFromScore(score.id));
        }
    }

    return (
        <div id="point-buy-display">
            <h3>Point Buy</h3>
            <div id="point-buy">
                <div id="scores">
                    {Object.keys(scores).map((key) => {
                        return <ScoreDisplay key={`point-buy-${key}`} score={scores[key]} handleScoreChange={handleScoreChange} />
                    })}
                </div>
                <div id="points">{`Points remaining: ${scoreRemainder}`}</div>
            </div>
        </div>
    )
}

interface ScoreDisplayProps {
    score: AbilityScore;
    handleScoreChange: (score: AbilityScore, isAdditive: boolean) => void;
}

const ScoreDisplay = ({ score, handleScoreChange }: ScoreDisplayProps) => {
    return (
        <div id={`${score.id}-display`}>
            <p>{`${score.name}: ${score.bonus > 0 ? `${score.amount} +${score.bonus}` : score.amount}`}</p>
            <div>
                <button onClick={() => handleScoreChange(score, true)}>+</button>
                <button onClick={() => handleScoreChange(score, false)}>-</button>
            </div>
        </div>
    )
}