import { useState, useEffect } from 'react';
import { X, Presentation, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MockService } from '@/services/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface Slide {
    title: string;
    content: string;
    type: 'title' | 'chart' | 'timeline' | 'actions';
}

interface PresentationModalProps {
    isOpen: boolean;
    onClose: () => void;
    householdId: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const PresentationModal = ({ isOpen, onClose, householdId }: PresentationModalProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (isOpen && householdId) {
            setIsLoading(true);
            setCurrentSlide(0);
            MockService.generateMeetingSlides(householdId).then(generatedSlides => {
                setSlides(generatedSlides);
                setIsLoading(false);
            });
        }
    }, [isOpen, householdId]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const handleExport = () => {
        toast.success('Presentation exported!', {
            description: 'ClientMeeting.pptx has been downloaded.',
        });
    };

    const renderSlideContent = (slide: Slide) => {
        switch (slide.type) {
            case 'title':
                return (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <Presentation className="h-16 w-16 text-primary mb-6" />
                        <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                        <div className="text-lg text-muted-foreground whitespace-pre-line">
                            {slide.content}
                        </div>
                    </div>
                );

            case 'chart':
                try {
                    const chartData = JSON.parse(slide.content);
                    const pieData = chartData.labels.map((label: string, index: number) => ({
                        name: label,
                        value: chartData.values[index]
                    }));
                    return (
                        <div className="h-full flex flex-col p-6">
                            <h3 className="text-xl font-semibold mb-4 text-center">{slide.title}</h3>
                            <div className="flex-1 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {pieData.map((_: unknown, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                } catch {
                    return <div className="p-6">Chart data unavailable</div>;
                }

            case 'timeline':
                return (
                    <div className="h-full flex flex-col p-6">
                        <h3 className="text-xl font-semibold mb-6 text-center">{slide.title}</h3>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-muted/50 rounded-xl p-6 w-full max-w-md">
                                {slide.content.split('\n').map((line, idx) => (
                                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="text-sm">{line}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'actions':
                return (
                    <div className="h-full flex flex-col p-6">
                        <h3 className="text-xl font-semibold mb-6 text-center">{slide.title}</h3>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-muted/50 rounded-xl p-6 w-full max-w-md">
                                {slide.content.split('\n').map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-3 py-3 border-b border-white/10 last:border-0">
                                        <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm">{line.replace('• ', '')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div className="p-6">{slide.content}</div>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden bg-[#18181b] border-white/15">
                <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background to-transparent">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Presentation className="h-5 w-5 text-primary" />
                            AI-Generated Meeting Pack
                        </DialogTitle>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Export to PPTX
                        </Button>
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <div className="text-center">
                            <p className="font-medium">Building Presentation...</p>
                            <p className="text-sm text-muted-foreground mt-1">AI is generating your meeting slides</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col pt-16">
                        {/* Slide Content */}
                        <div className="flex-1 flex items-center justify-center px-12">
                            <Card className="w-full h-[380px] bg-gradient-to-br from-muted/50 to-muted/30 border-white/10 overflow-hidden">
                                <CardContent className="h-full p-0">
                                    {slides[currentSlide] && renderSlideContent(slides[currentSlide])}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Navigation */}
                        <div className="p-4 flex items-center justify-between border-t border-white/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>

                            {/* Slide Indicators */}
                            <div className="flex items-center gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 rounded-full transition-all ${idx === currentSlide
                                                ? 'w-6 bg-primary'
                                                : 'w-2 bg-white/20 hover:bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextSlide}
                                disabled={currentSlide === slides.length - 1}
                                className="gap-2"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
