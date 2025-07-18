import { useLayoutEffect, useState } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arraySwap, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppDispatch, useAppSelector } from "../../../lib/redux/hooks";
import { setScoresToStandard, swapScores } from "../../../lib/redux/newCharacterSlice";
import type { AbilityScore } from "../../../lib/types/dmToolTypes";

export default function() {
    const scores = useAppSelector((state) => state.newCharacter.scores);
    const dispatch = useAppDispatch();

    const [items, setItems] = useState(["str", "dex", "con", "int", "wis", "cha"]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    useLayoutEffect(() => {
        dispatch(setScoresToStandard());
    }, []);

    const handleScoreSwap = (scoreIdA: string, scoreIdB: string) => {
        dispatch(swapScores({scoreIdA, scoreIdB}));
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (over != null && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id.toString());
                const newIndex = items.indexOf(over.id.toString());
                
                return arraySwap(items, oldIndex, newIndex);
            });

            handleScoreSwap(active.id.toString(), over.id.toString());
        }
    }
    
    return (
        <div id="standard-array-display">
            <h3>Standard Array</h3>
            <div id="standard-array">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items}>
                        {items.map(score => <SortableScore key={score} score={scores[score]} />)}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    )
}

interface SortableScoreProps {
    score: AbilityScore;
}

const SortableScore = ({score}: SortableScoreProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: score.id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{`${score.name}: ${score.bonus > 0 ? `${score.amount} +${score.bonus}` : score.amount}`}</div>
    )
}