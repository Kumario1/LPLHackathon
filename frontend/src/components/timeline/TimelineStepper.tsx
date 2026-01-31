import { CheckCircle, Circle } from 'lucide-react';

interface TimelineStepperProps {
    currentStage: number; // 0-4
}

const stages = [
    { label: 'Data Collection', description: 'Gathering client information' },
    { label: 'Doc Review', description: 'Verifying documents' },
    { label: 'Submission', description: 'Submitting to custodians' },
    { label: 'Asset Transfer', description: 'Moving assets' },
    { label: 'Complete', description: 'Transition finished' },
];

export const TimelineStepper = ({ currentStage }: TimelineStepperProps) => {
    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Progress Line Background */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />

                {/* Progress Line Fill */}
                <div
                    className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
                />

                {/* Stage Circles */}
                {stages.map((stage, idx) => {
                    const isCompleted = idx < currentStage;
                    const isCurrent = idx === currentStage;
                    const isPending = idx > currentStage;

                    return (
                        <div key={stage.label} className="relative flex flex-col items-center z-10">
                            {/* Circle */}
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                                    ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                                    ${isCurrent ? 'bg-primary/20 border-2 border-primary text-primary' : ''}
                                    ${isPending ? 'bg-muted border border-white/10 text-muted-foreground' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <Circle className="h-3 w-3" fill={isCurrent ? 'currentColor' : 'none'} />
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute top-10 w-24 text-center">
                                <p className={`text-xs font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {stage.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
